import { validateAuth, validateVaultId, unauthorized, forbidden } from "@/lib/auth";
import { getClient } from "@/lib/op-client";
import { toItemCreateParams, toConnectItem, validatePasskeyFields } from "@/lib/item-mapper";
import type { ConnectItem } from "@/types/connect";

// OData-style filter: `title co "rpId::"`
function parseContainsFilter(filter: string): string | null {
  const match = filter.match(/^title\s+co\s+"([^"]+)"$/);
  return match ? match[1] : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vaultId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId } = await params;
  if (!validateVaultId(vaultId)) return forbidden();

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "";
  const searchStr = parseContainsFilter(filter);

  try {
    const client = await getClient();
    const overviews = await client.items.list(vaultId);

    const matching = searchStr
      ? overviews.filter((o) => o.title.includes(searchStr))
      : overviews;

    if (matching.length === 0) return Response.json([]);

    const ids = matching.map((o) => o.id);
    const result = await client.items.getAll(vaultId, ids);

    const items = result.individualResponses.flatMap((r) =>
      r.content ? [toConnectItem(r.content)] : []
    );
    return Response.json(items);
  } catch (err) {
    console.error("GET items error:", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vaultId: string }> }
): Promise<Response> {
  if (!validateAuth(request)) return unauthorized();

  const { vaultId } = await params;
  if (!validateVaultId(vaultId)) return forbidden();

  const body: ConnectItem = await request.json();

  // Ensure the vault ID is consistent with the path
  body.vault = { id: vaultId };

  const fieldError = validatePasskeyFields(body.fields);
  if (fieldError) {
    return Response.json({ error: fieldError }, { status: 400 });
  }

  try {
    const client = await getClient();
    const created = await client.items.create(toItemCreateParams(body));
    return Response.json(toConnectItem(created), { status: 201 });
  } catch (err) {
    console.error("POST item error:", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
