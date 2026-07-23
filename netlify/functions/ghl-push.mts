import type { Config, Context } from "@netlify/functions";

type PushRequest = {
  jobId?: string;
  job_id?: string;
};

type GenerationJob = {
  id: string;
  contact_id: string;
  generated_content: string | null;
  output_type: string;
  prompt_version: string;
  status: string;
  ghl_ai_output_record_id: string | null;
};

type ContactResponse = {
  contact?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
};

type GhlRecordResponse = {
  record?: { id?: string };
  data?: { id?: string };
  id?: string;
};

type GhlRelationResponse = {
  id?: string;
  relation?: { id?: string };
};

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const AI_OUTPUT_ASSOCIATION_ID = "6a611df7a5fcf167a6f8bb21";

function supabaseHeaders(serviceRoleKey: string, prefer?: string): HeadersInit {
  return {
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function ghlHeaders(apiToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

async function parseJson<T>(response: Response, service: string): Promise<T> {
  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`${service}_http_${response.status}:${rawBody.slice(0, 500)}`);
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new Error(`${service}_invalid_json`);
  }
}

async function writeIntegrationLog(
  supabaseUrl: string,
  serviceRoleKey: string,
  row: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`${supabaseUrl}/rest/v1/integration_logs`, {
    method: "POST",
    headers: supabaseHeaders(serviceRoleKey),
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Failed to write integration log", {
      status: response.status,
      body: body.slice(0, 500),
    });
  }
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceRoleKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ghlApiToken = Netlify.env.get("GHL_API_TOKEN");
  const ghlLocationId = Netlify.env.get("GHL_LOCATION_ID");

  if (!supabaseUrl || !serviceRoleKey || !ghlApiToken || !ghlLocationId) {
    return Response.json({ error: "middleware_not_configured" }, { status: 503 });
  }

  let payload: PushRequest;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const jobId = String(payload.jobId ?? payload.job_id ?? "").trim();
  if (!jobId) {
    return Response.json({ error: "missing_job_id" }, { status: 400 });
  }

  let contactId = "";
  let outputType = "";
  let promptVersion = "";
  let ghlRecordId: string | null = null;

  try {
    const jobResponse = await fetch(
      `${supabaseUrl}/rest/v1/ai_generation_jobs?id=eq.${encodeURIComponent(jobId)}&select=id,contact_id,generated_content,output_type,prompt_version,status,ghl_ai_output_record_id`,
      { headers: supabaseHeaders(serviceRoleKey) },
    );
    const jobs = await parseJson<GenerationJob[]>(jobResponse, "job_fetch");
    const job = jobs[0];

    if (!job) {
      return Response.json({ error: "job_not_found" }, { status: 404 });
    }

    contactId = job.contact_id;
    outputType = job.output_type;
    promptVersion = job.prompt_version;
    ghlRecordId = job.ghl_ai_output_record_id;

    if (job.status !== "completed" || !job.generated_content?.trim()) {
      return Response.json({ error: "job_not_completed" }, { status: 409 });
    }

    if (ghlRecordId) {
      return Response.json({
        pushed: true,
        reused: true,
        ghlRecordId,
        relationId: "unknown",
      });
    }

    const contactResponse = await fetch(
      `${GHL_BASE_URL}/contacts/${encodeURIComponent(contactId)}`,
      { headers: ghlHeaders(ghlApiToken) },
    );
    const contactData = await parseJson<ContactResponse>(contactResponse, "ghl_contact_fetch");
    const firstName = contactData.contact?.firstName?.trim() ?? "";
    const lastName = contactData.contact?.lastName?.trim() ?? "";
    const donorName = [firstName, lastName].filter(Boolean).join(" ") || "Donor";

    const recordResponse = await fetch(
      `${GHL_BASE_URL}/objects/custom_objects.ai_output_record/records`,
      {
        method: "POST",
        headers: ghlHeaders(ghlApiToken),
        body: JSON.stringify({
          locationId: ghlLocationId,
          properties: {
            "custom_objects.ai_output_record.output_name": `Thank You Note — ${donorName}`,
            "custom_objects.ai_output_record.output_type": outputType,
            "custom_objects.ai_output_record.output_status": "draft",
            "custom_objects.ai_output_record.generated_content": job.generated_content,
            "custom_objects.ai_output_record.generated_date": new Date().toISOString().slice(0, 10),
            "custom_objects.ai_output_record.prompt_version": promptVersion,
          },
        }),
      },
    );
    const recordData = await parseJson<GhlRecordResponse>(recordResponse, "ghl_record_create");
    ghlRecordId = recordData.record?.id ?? recordData.data?.id ?? recordData.id ?? null;

    if (!ghlRecordId) {
      throw new Error("ghl_record_create_missing_id");
    }

    const relationResponse = await fetch(`${GHL_BASE_URL}/associations/relations`, {
      method: "POST",
      headers: ghlHeaders(ghlApiToken),
      body: JSON.stringify({
        associationId: AI_OUTPUT_ASSOCIATION_ID,
        firstRecordId: contactId,
        secondRecordId: ghlRecordId,
      }),
    });
    const relationData = await parseJson<GhlRelationResponse>(
      relationResponse,
      "ghl_relation_create",
    );
    const relationId = relationData.id ?? relationData.relation?.id ?? "unknown";

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/ai_generation_jobs?id=eq.${encodeURIComponent(jobId)}`,
      {
        method: "PATCH",
        headers: supabaseHeaders(serviceRoleKey),
        body: JSON.stringify({ ghl_ai_output_record_id: ghlRecordId }),
      },
    );

    if (!updateResponse.ok) {
      const body = await updateResponse.text();
      throw new Error(`job_update_http_${updateResponse.status}:${body.slice(0, 500)}`);
    }

    await writeIntegrationLog(supabaseUrl, serviceRoleKey, {
      correlation_id: jobId,
      service: "ghl_push",
      level: "info",
      action: "ai_output_record_created",
      message: `AI Output Record created for contact ${contactId}`,
      metadata: {
        contact_id: contactId,
        output_type: outputType,
        prompt_version: promptVersion,
        ghl_record_id: ghlRecordId,
      },
    });

    return Response.json({ pushed: true, ghlRecordId, relationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_ghl_push_error";

    await writeIntegrationLog(supabaseUrl, serviceRoleKey, {
      correlation_id: jobId,
      service: "ghl_push",
      level: "error",
      action: "ghl_push_failed",
      message: message.slice(0, 2000),
      metadata: {
        contact_id: contactId || null,
        output_type: outputType || null,
        prompt_version: promptVersion || null,
        ghl_record_id: ghlRecordId,
      },
    });

    console.error("GHL push failed", { jobId, error: message });
    return Response.json(
      { error: "ghl_push_failed", detail: message },
      { status: 502 },
    );
  }
};

export const config: Config = {
  path: "/ghl/push",
};
