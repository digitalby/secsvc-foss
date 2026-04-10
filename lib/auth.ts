export function validateAuth(request: Request): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.API_ACCESS_TOKEN;
}

export function validateVaultId(vaultId: string): boolean {
  const allowed = process.env.ALLOWED_VAULT_ID;
  return !allowed || vaultId === allowed;
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(): Response {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
