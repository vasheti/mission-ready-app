import type { Config, Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });

  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      source: "ghl",
      event_type: eventType,
      external_event_id: externalEventId,
      contact_id: contactId,
      payload,
      status: "received",
    })
    .select("id,status,received_at")
    .single();

  if (error) {
    console.error("Failed to persist webhook event", { code: error.code });
    return Response.json({ error: "webhook_persist_failed" }, { status: 500 });
  }

  return Response.json({ accepted: true, event: data }, { status: 202 });
};

export const config: Config = {
  path: "/webhooks/ghl",
};
