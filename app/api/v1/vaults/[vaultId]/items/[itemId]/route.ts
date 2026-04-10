import { validateAuth, validateVaultId, unauthorized, forbidden } from "@/lib/auth";
import { getClient } from "@/lib/op-client";
import { toItemUpdate, toConnectItem, validatePasskeyFields } from "@/lib/item-mapper";
import type { ConnectItem } from "@/types/connect";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ vaultId: string; itemId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId, itemId } = await params;
  if (!validateVaultId(vaultId)) return forbidden();

  const body: ConnectItem = await request.json();

  const fieldError = validatePasskeyFields(body.fields);
  if (fieldError) {
    return Response.json({ error: fieldError }, { status: 400 });
  }

  try {
    const client = await getClient();
    const existing = await client.items.get(vaultId, itemId);
    const updated = await client.items.put(toItemUpdate(body, existing));
    return Response.json(toConnectItem(updated));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("not found")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("PUT item error:", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ vaultId: string; itemId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId, itemId } = await params;
  if (!validateVaultId(vaultId)) return forbidden();

  try {
    const client = await getClient();
    await client.items.delete(vaultId, itemId);
    return new Response(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("not found")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("DELETE item error:", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
