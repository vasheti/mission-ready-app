import type { Config, Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

type GenerateRequest = {
  webhookEventId?: string;
  webhook_event_id?: string;
  contactId?: string;
  contact_id?: string;
  outputType?: string;
  output_type?: string;
  sourceContext?: Record<string, unknown>;
  source_context?: Record<string, unknown>;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

const PROMPT_VERSION = "thank_you_note_v1";

function buildPromptV1(sourceContext: Record<string, unknown>): string {
  const firstName = String(sourceContext.firstName ?? sourceContext.first_name ?? "the donor");
  const giftAmount = Number(sourceContext.firstGiftAmount ?? sourceContext.first_gift_amount ?? 0);
  const giftDate = String(sourceContext.firstGiftDate ?? sourceContext.first_gift_date ?? "");
  const assignedJourney = String(
    sourceContext.assignedJourney ?? sourceContext.assigned_journey ?? "First-Time Donor Welcome",
  );

  const amountText = Number.isFinite(giftAmount) && giftAmount > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(giftAmount)
    : "their gift";

  return [
    "Write a warm, concise first-time donor thank-you note.",
    "The note must preserve donor dignity, avoid pressure, and contain no additional ask.",
    "Write in plain language and return only the note body, with no subject line or commentary.",
    `Donor first name: ${firstName}`,
    `Gift amount: ${amountText}`,
    giftDate ? `Gift date: ${giftDate}` : "",
    `Stewardship journey: ${assignedJourney}`,
    "Length: 90 to 140 words.",
  ].filter(Boolean).join("\n");
}

function extractOutputText(response: OpenAIResponse): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  throw new Error("openai_response_missing_text");
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceRoleKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAIKey = Netlify.env.get("OPENAI_API_KEY");
  const model = Netlify.env.get("OPENAI_MODEL") ?? "gpt-5-mini";

  if (!supabaseUrl || !serviceRoleKey || !openAIKey) {
    return Response.json({ error: "middleware_not_configured" }, { status: 503 });
  }

  let payload: GenerateRequest;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const webhookEventId = String(payload.webhookEventId ?? payload.webhook_event_id ?? "").trim();
  const contactId = String(payload.contactId ?? payload.contact_id ?? "").trim();
  const outputType = String(payload.outputType ?? payload.output_type ?? "thank_you_note").trim();
  const sourceContext = payload.sourceContext ?? payload.source_context ?? {};

  if (!webhookEventId || !contactId || !outputType || typeof sourceContext !== "object") {
    return Response.json({ error: "missing_required_fields" }, { status: 400 });
  }

  if (outputType !== "thank_you_note") {
    return Response.json({ error: "unsupported_output_type" }, { status: 400 });
  }

  const idempotencyKey = `${contactId}_${outputType}_${webhookEventId}`;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing } = await supabase
    .from("ai_generation_jobs")
    .select("id,status,generated_content,error_message,idempotency_key")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) {
    return Response.json({ reused: true, job: existing }, { status: 200 });
  }

  const { data: job, error: createError } = await supabase
    .from("ai_generation_jobs")
    .insert({
      webhook_event_id: webhookEventId,
      contact_id: contactId,
      output_type: outputType,
      prompt_version: PROMPT_VERSION,
      source_context: sourceContext,
      status: "processing",
      attempt_count: 1,
      started_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
    })
    .select("id,status,idempotency_key")
    .single();

  if (createError) {
    if (createError.code === "23505") {
      const { data: racedJob } = await supabase
        .from("ai_generation_jobs")
        .select("id,status,generated_content,error_message,idempotency_key")
        .eq("idempotency_key", idempotencyKey)
        .single();
      return Response.json({ reused: true, job: racedJob }, { status: 200 });
    }

    console.error("Failed to create AI generation job", { code: createError.code });
    return Response.json({ error: "job_create_failed" }, { status: 500 });
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildPromptV1(sourceContext),
      }),
    });

    const openAIData = await openAIResponse.json() as OpenAIResponse;
    if (!openAIResponse.ok) {
      throw new Error(openAIData.error?.message ?? `openai_http_${openAIResponse.status}`);
    }

    const generatedContent = extractOutputText(openAIData);
    const completedAt = new Date().toISOString();

    const { data: completedJob, error: updateError } = await supabase
      .from("ai_generation_jobs")
      .update({
        status: "completed",
        generated_content: generatedContent,
        error_message: null,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq("id", job.id)
      .select("id,status,generated_content,prompt_version,idempotency_key,completed_at")
      .single();

    if (updateError) {
      throw new Error(`job_update_failed:${updateError.code}`);
    }

    await supabase.from("integration_logs").insert({
      correlation_id: job.id,
      service: "ai-generation",
      level: "info",
      action: "generate_draft",
      message: "AI draft generated successfully",
      metadata: {
        contact_id: contactId,
        output_type: outputType,
        prompt_version: PROMPT_VERSION,
        model,
        idempotency_key: idempotencyKey,
      },
    });

    return Response.json({ created: true, job: completedJob }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_generation_error";
    const failedAt = new Date().toISOString();

    await supabase
      .from("ai_generation_jobs")
      .update({
        status: "failed",
        error_message: message.slice(0, 2000),
        updated_at: failedAt,
      })
      .eq("id", job.id);

    await supabase.from("integration_logs").insert({
      correlation_id: job.id,
      service: "ai-generation",
      level: "error",
      action: "generate_draft",
      message: "AI draft generation failed",
      metadata: {
        contact_id: contactId,
        output_type: outputType,
        prompt_version: PROMPT_VERSION,
        model,
        idempotency_key: idempotencyKey,
        error: message.slice(0, 500),
      },
    });

    console.error("AI generation failed", { jobId: job.id, error: message });
    return Response.json({ error: "generation_failed", jobId: job.id }, { status: 502 });
  }
};

export const config: Config = {
  path: "/ai/generate",
};
