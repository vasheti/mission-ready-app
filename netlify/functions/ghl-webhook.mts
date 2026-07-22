import type { Config, Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceRoleKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "middleware_not_configured" }, { status: 503 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const contactId = String(payload.contactId ?? payload.contact_id ?? "") || null;
  const eventType = String(payload.type ?? payload.eventType ?? "unknown");
  const externalEventId = String(payload.id ?? payload.eventId ?? "") || null;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/webhook_events`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        source: "ghl",
        event_type: eventType,
        external_event_id: externalEventId,
        contact_id: contactId,
        payload,
        status: "received",
      }),
    });

    const rawBody = await response.text();

    if (!response.ok) {
      console.error("Failed to persist webhook event", {
        status: response.status,
        body: rawBody.slice(0, 500),
      });
      return Response.json({ error: "webhook_persist_failed" }, { status: 500 });
    }

    let rows: Array<{ id: string; status: string; received_at: string }>;
    try {
      rows = JSON.parse(rawBody);
    } catch {
      console.error("Supabase returned invalid JSON", { body: rawBody.slice(0, 500) });
      return Response.json({ error: "invalid_supabase_response" }, { status: 502 });
    }

    const event = rows[0];
    if (!event) {
      return Response.json({ error: "missing_inserted_event" }, { status: 502 });
    }

    return Response.json({ accepted: true, event }, { status: 202 });
  } catch (error) {
    console.error("Unhandled webhook persistence error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "webhook_unhandled_error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/webhooks/ghl",
};
