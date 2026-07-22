import type { Config, Context } from "@netlify/functions";

const REQUIRED_ENV_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GHL_API_TOKEN",
  "GHL_LOCATION_ID",
  "OPENAI_API_KEY",
] as const;

export default async (_request: Request, _context: Context) => {
  const configured = Object.fromEntries(
    REQUIRED_ENV_VARS.map((key) => [key, Boolean(Netlify.env.get(key))]),
  );

  const ready = Object.values(configured).every(Boolean);

  return Response.json(
    {
      service: "mission-ready-middleware",
      status: ready ? "ready" : "configuration_required",
      configured,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
};

export const config: Config = {
  path: "/health",
};
