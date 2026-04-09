import { createClient, type Client } from "@1password/sdk";

let cached: Client | null = null;

export async function getClient(): Promise<Client> {
  if (!cached) {
    cached = await createClient({
      auth: process.env.OP_SERVICE_ACCOUNT_TOKEN!,
      integrationName: "secsvc-foss",
      integrationVersion: "1.0.0",
    });
  }
  return cached;
}
