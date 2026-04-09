import { validateAuth, unauthorized } from "@/lib/auth";

export async function GET(request: Request): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();
  return Response.json([{ id: "ok", name: "secsvc-foss" }]);
}
