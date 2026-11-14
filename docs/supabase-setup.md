# Supabase Setup, Cloud Infrastructure & Local Development (SET-2)

**Owner:** Brehat (@brihothdey-ctrl) · **Sprint:** S1 · **Task:** SET-2

This document details the configuration, cloud infrastructure, Docker-based local development, storage buckets, and security policies for Supabase across the Pranora platform (Web, Mobile, and Edge Functions).

---

## 1. Cloud Infrastructure & Regions

Pranora uses Supabase as its primary backend: PostgreSQL 15, PostGIS (geography data), Auth, Storage, Realtime, and Edge Functions (Deno).

### Region Selection: Singapore (`ap-southeast-1`)
All cloud instances must be provisioned in the **Singapore** AWS region (`ap-southeast-1`):
- Closest major cloud hub to Bangladesh.
- Lowest network latency for mobile users and web traffic across Dhaka, Chittagong, Sylhet, and other divisions.
- Standardized cross-region latency to Vercel Asia-Southeast Edge networks.

### Projects
| Environment | Supabase Project ID | Purpose | URL / Access |
|---|---|---|---|
| **Local** | `pranora` (local Docker) | Feature development, migrations, pgTAP unit tests | `http://127.0.0.1:54321` |
| **Staging** | `pranora-staging` | Integration testing on `dev`, automated CI resets, QA | Singapore (`ap-southeast-1`) |
| **Production** | `pranora-prod` | Live production app & web | Singapore (`ap-southeast-1`) |

---

## 2. Local Development with Docker

Local development runs via the Supabase CLI, which orchestrates local Docker containers matching production versions.

### 2.1 Prerequisites
- **Docker Desktop** running (WSL2 engine on Windows, or Docker on macOS/Linux).
- **Supabase CLI** (installed via npm, brew, scoop, or direct binary).
- Node.js & pnpm installed.

### 2.2 CLI Commands

```bash
# Start local Supabase containers (Postgres, Auth, Storage, Realtime, Studio, Inbucket)
supabase start

# Check status and running endpoints
supabase status

# Stop local Supabase containers
supabase stop

# Apply pending local migrations
supabase migration up

# Reset local database (re-applies all migrations + seeds)
supabase db reset

# Run pgTAP database tests locally
supabase test db

# Generate TypeScript database types
pnpm db:types
```

### 2.3 Local Services & Ports
When `supabase start` runs, the following endpoints are available:

| Service | Port | Local URL / Endpoint |
|---|---|---|
| **API Gateway (Kong)** | `54321` | `http://127.0.0.1:54321` |
| **PostgreSQL Database** | `54322` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| **Database Shadow Port** | `54320` | `127.0.0.1:54320` (used for migration diffing) |
| **Realtime** | `54323` | `http://127.0.0.1:54323` |
| **Supabase Studio (UI)** | `54324` | `http://127.0.0.1:54324` |
| **Inbucket (Email testing)**| `54325` | `http://127.0.0.1:54325` (Web UI for viewing auth emails) |
| **Edge Functions Runtime** | `54328` | `http://127.0.0.1:54328` |

---

## 3. Storage Buckets & Policies

In accordance with [docs/schema.md §7](schema.md#7-storage-buckets), seven storage buckets are defined for Pranora. Local definitions live in `supabase/config.toml`.

| Bucket Name | Public Access | Max File Size | Allowed MIME Types | Purpose & Security Rules |
|---|---|---|---|---|
| `avatars` | **Public** | 5 MB | `image/png`, `image/jpeg`, `image/webp` | Profile photos and pet avatars. |
| `provider-media`| **Public** | 10 MB | `image/png`, `image/jpeg`, `image/webp` | Clinic logos, clinic photos, facility pictures. |
| `medical` | **Private** | 25 MB | `image/*`, `application/pdf` | Medical history, vet test reports, prescription scans. Accessible only by pet owner and attending vets via signed URLs. |
| `documents` | **Private** | 25 MB | `image/*`, `application/pdf` | Provider BVC licenses, trade licenses, NIDs, shelter registration. Visible only to uploader and admins. |
| `adoption-media`| **Public** | 10 MB | `image/png`, `image/jpeg`, `image/webp` | Photos of pets listed for adoption. **EXIF & GPS metadata must be stripped prior to upload.** |
| `rescue-media` | **Private** | 15 MB | `image/png`, `image/jpeg`, `image/webp` | Animal rescue reports and incident photos. Location-sensitive; accessible only via signed URLs by assigned rescuer, shelter, and reviewer. |
| `call-recordings`| **Private** | 50 MB | `audio/webm`, `audio/mp4`, `audio/ogg`, `audio/mpeg` | Consultation audio recordings (Phase 2). Only accessible if both participants explicitly consented. |

---

## 4. Environment Variables & Secret Configuration

Configure `.env.local` based on `.env.example`. Secrets must never be committed to Git.

### 4.1 Client vs Server Keys
- **Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)**:
  - Safe for browser and mobile distribution.
  - All operations are strictly constrained by PostgreSQL **Row Level Security (RLS)**.
- **Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)**:
  - **CRITICAL:** Restricted strictly to Supabase Edge Functions and backend workers.
  - **NEVER** include the service role key in `apps/web` client bundles or `apps/mobile` Expo bundles.
  - Bypasses RLS policies; used only for administrative triggers, payment webhook verification, and system tasks.

### 4.2 Auth Redirect URLs
Configure in `supabase/config.toml` and Supabase Dashboard Auth settings:
- Local Web: `http://localhost:3000`, `http://127.0.0.1:3000`
- Mobile Deep Linking: `pranora://*`, `exp://*`
- Staging Previews: `https://*.vercel.app`
- Production Web: `https://pranora.com.bd`

---

## 5. Auth & SMS Gateway Setup (Phone OTP)

1. **Bangla Phone Numbers**:
   - Normalized format: `+8801XXXXXXXXX` (13 digits starting with `+8801[3-9]`).
   - Validated via shared Zod schema in `packages/validation`.
2. **SMS Gateway Hook**:
   - Supabase Auth supports a Custom SMS Hook via an Edge Function (`send-sms`).
   - In production and staging, `send-sms` communicates with local Bangladeshi SMS gateways (e.g., SSL Wireless, BulkSMS BD) to deliver OTP messages reliably in Bangla/English.
   - In local development, SMS confirmation can be verified directly via Supabase Studio or Docker logs without consuming gateway credits.

---

## 6. Database Migrations & Type Safety Workflow

1. **Creating Migrations**:
   ```bash
   supabase migration new <area>_<description>
   ```
   Name files `YYYYMMDDHHMMSS_<area>_<description>.sql` matching ownership areas from [team.md](team.md).
2. **Local Application & Testing**:
   - Run `supabase db reset` locally to test clean migrations and seed files.
   - Run `supabase test db` to execute pgTAP tests.
3. **Type Generation**:
   - After updating SQL schema, run:
     ```bash
     pnpm db:types
     ```
   - This writes updated TypeScript definitions directly to `packages/types/src/database.types.ts`.
4. **CI Integration**:
   - GitHub Actions CI (`.github/workflows/ci.yml`) runs `supabase db reset` and `supabase test db` to ensure migrations apply cleanly without errors or policy violations before PR merge.
