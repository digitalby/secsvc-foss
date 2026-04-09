import { validateAuth, unauthorized } from "@/lib/auth";
import { getClient } from "@/lib/op-client";
import { toItemUpdate, toConnectItem } from "@/lib/item-mapper";
import type { ConnectItem } from "@/types/connect";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ vaultId: string; itemId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId, itemId } = await params;
  const body: ConnectItem = await request.json();

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
    console.error("PUT item error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ vaultId: string; itemId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId, itemId } = await params;

  try {
    const client = await getClient();
    await client.items.delete(vaultId, itemId);
    return new Response(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("not found")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("DELETE item error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
