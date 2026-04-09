# secsvc-foss

A Vercel-hosted proxy that implements the [1Password Connect REST API](https://developer.1password.com/docs/connect/) subset needed by the [1Password Android Passkey Provider](https://github.com/digitalby/1password-android-passkeys). Uses the official [`@1password/sdk`](https://www.npmjs.com/package/@1password/sdk) to talk to 1Password cloud directly, so no Docker infrastructure is required.

## How it works

```
Android app
  Authorization: Bearer $API_ACCESS_TOKEN
        |
        v
secsvc-foss (Vercel Function)
  validates bearer token against env.API_ACCESS_TOKEN
        |
        v
@1password/sdk (env.OP_SERVICE_ACCOUNT_TOKEN)
        |
        v
1Password cloud API --> 1Password vault
```

The real 1Password service account token never leaves the server. The Android app authenticates with a separate `API_ACCESS_TOKEN` that you generate.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/vaults` | Test connection |
| `POST` | `/v1/vaults/{vaultId}/items` | Create item |
| `GET` | `/v1/vaults/{vaultId}/items?filter=...` | Query items by title |
| `PUT` | `/v1/vaults/{vaultId}/items/{itemId}` | Update item |
| `DELETE` | `/v1/vaults/{vaultId}/items/{itemId}` | Delete item |

All endpoints require `Authorization: Bearer <API_ACCESS_TOKEN>`.

## Deploy

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdigitalby%2Fsecsvc-foss)

Or from the CLI:

```bash
git clone https://github.com/digitalby/secsvc-foss.git
cd secsvc-foss
npm install
vercel --yes
```

### 2. Set environment variables

```bash
vercel env add OP_SERVICE_ACCOUNT_TOKEN production
vercel env add API_ACCESS_TOKEN production
vercel --prod
```

| Variable | Description |
|---|---|
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password service account token (`ops_...`). Create one in the [1Password developer portal](https://developer.1password.com/docs/service-accounts/) with read/write access to your vault. |
| `API_ACCESS_TOKEN` | Any strong random string. This is what the Android app sends as its "Service Account Token". |

### 3. Custom domain (optional)

```bash
vercel domains add your-subdomain.example.com
```

Then add the DNS record Vercel shows (A record pointing to `76.76.21.21`) in your DNS provider.

## Configure the Android app

In the 1Password PKs app settings:

| Field | Value |
|---|---|
| Connect URL | `https://your-deployment.vercel.app` (or your custom domain) |
| Vault ID | Your 26-character vault identifier (unchanged) |
| Service Account Token | The `API_ACCESS_TOKEN` value you set above |

Tap **Test Connection** to verify.

## Local development

```bash
cp .env.example .env.local
# Fill in OP_SERVICE_ACCOUNT_TOKEN and API_ACCESS_TOKEN
npm run dev
```

Test:

```bash
curl -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" http://localhost:3000/v1/vaults
```

## Security

- The 1Password service account token is stored only in Vercel environment variables, never sent to clients.
- The Android app authenticates with a separate bearer token (`API_ACCESS_TOKEN`).
- All requests to 1Password cloud go through the official `@1password/sdk`.
- TLS is enforced by Vercel on all production deployments.

## Status

Companion project to [1password-android-passkeys](https://github.com/digitalby/1password-android-passkeys). Serves as a Docker-free alternative to the official 1Password Connect server for the specific use case of passkey credential storage.
