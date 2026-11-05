# Pranora — Team & Ownership

Who owns which part of the codebase, so every member (and their AI agent) only changes their own part.
Related: [tracker.md](./tracker.md) · [rules.md](./rules.md) · Cursor rule [`.cursor/rules/team-ownership.mdc`](../.cursor/rules/team-ownership.mdc) · [`.github/CODEOWNERS`](../.github/CODEOWNERS)

> ⚠️ **Proposed — the team should confirm or edit.** The split below is a proposal, balanced so that everyone gets the same amount of work (সমান ভাগ). Change it through the process in §7.

---

## 1. Members

| Member | `.pranora-member` | GitHub | Branch | Role | Owned area |
|---|---|---|---|---|---|
| Zihad | `zihad` | [@zihad2003](https://github.com/zihad2003) | `zihad` | Product, design & pet health | Docs, design system, i18n, pets & health records, services catalog, AI assistant, tips |
| Afridi | `afridi` | [@afridi2003-maverick](https://github.com/afridi2003-maverick) (repo owner) | `afridi` | Platform & admin | Repo/CI, core DB + auth + RLS framework, onboarding & roles, notifications, payments, admin panel, audit log, releases and merges to `main` |
| Zimia | `zimia` | TBD | `Zimia` (existing — keep the casing) | Vet discovery | Nearest-vet map, clinic data, emergency mode, provider lists, home visit, grooming, boarding, reviews |
| Brehat | `brehat` | TBD | `brehat` | Rescue & adoption | Rescue reports & cases (incl. lost & found), adoption listings → applications → handover, pet shop |
| Tain | `tain` | TBD | `tain` | Vet booking & dashboards | Booking (slots/serials), vet & shelter dashboards, review queues, online consultation, calls |

Feature branches: `<member>/<task-id>-short-name`, e.g. `brehat/RSC-1-report-form`, `zimia/MAP-3-filters`. Open PRs into the member branch or `dev`; only Afridi merges to `main`.

Everyone gets **both frontend and backend** work: each member writes the migrations, RLS policies, pgTAP tests, RPCs, Edge Functions, app screens and web pages for **their own modules**. Afridi owns only the shared core (base schema, RLS helpers, auth, notifications, payments).

---

## 2. Proposed Ownership Split (paths)

Apps use the same feature folder names on both platforms:
- `apps/mobile/features/<feature>/**` and `apps/web/features/<feature>/**` hold the feature code.
- Expo Router screens live in `apps/mobile/app/**/<route>/**` or `<route>.tsx`, and Next.js pages in `apps/web/app/[locale]/<route>/**`.
- A route belongs to the owner of the feature it renders.

| Area (owner) | Features & routes | Packages | Supabase | Tracker IDs |
|---|---|---|---|---|
| **Zihad** — product, design & pet health | features `pets`, `health`, `services`, `ai`, `tips`, `sitting`; routes `pets`, `health`, `services`, `assistant`, `tips` | `packages/ui/**`, `packages/i18n/**` (framework, formatters, `common.json` approvals), `packages/api/src/{pets,health,services,ai,tips}/**`, `packages/validation/src/{pets,health,services,ai}.ts` | migrations `*_pets_*`, `*_health_*`, `*_services_*`, `*_ai_*`, `*_content_*`; functions `ai-chat`, `generate-health-pdf`; seeds `seed/services.sql`, `seed/vaccines.sql`; tests `tests/{pets,health,services,ai}_*` | `DOC-*`, `DES-*`, `I18N-*`, `PET-*`, `HLT-1/3/7`, `SVC-1`, `SVC-TIPS`, `SVC-SIT`, `AI-*`, `DB-3`, `DB-7`, `REL-2`, `REL-4` + `docs/**` |
| **Afridi** — platform & admin | features `auth`, `onboarding`, `roles`, `notifications`, `payments`, `admin`, `moderation`, `settings`, `training`; routes `(auth)`, `onboarding`, `notifications`, `settings`, `checkout`, `admin` | `packages/types/**` (generated), `packages/validation/src/{index,auth,payments,common}.ts`, `packages/api/src/{client,auth,notifications,payments,admin}/**` | migrations `*_core_*`, `*_auth_*`, `*_notifications_*`, `*_payments_*`, `*_moderation_*`, `*_audit_*`; functions `send-sms`, `send-reminders`, `payments-*`, `verify-provider`, `media-process`; seeds `seed/locations.sql`; tests harness + `tests/{core,auth,payments}_*`; `supabase/config.toml` | `SET-1`, `DB-1/2/6`, `AUTH-*`, `NOTIF-*`, `ADM-*`, `PAY-2/3/4`, `HLT-2/6`, `REV-2`, `SVC-TRN`, `REL-1`, `REL-3` + `.github/**` |
| **Zimia** — vet discovery | features `map`, `clinics`, `emergency`, `home-visit`, `grooming`, `boarding`, `reviews`, `livestock`; routes `map`, `vets`, `clinics`, `emergency`, `grooming`, `boarding` | `packages/api/src/{map,clinics,reviews}/**`, `packages/validation/src/{map,clinics,reviews}.ts` | migrations `*_providers_*`, `*_map_*`, `*_reviews_*`; SQL `nearby_clinics`, `is_location_open`; seeds `seed/clinics.sql`; tests `tests/{providers,map,reviews}_*` | `SET-3`, `DB-4`, `MAP-*`, `SVC-2`, `SVC-HOME`, `SVC-GRM`, `SVC-BRD`, `REV-1`, `LIV-1`, `REL-5` |
| **Brehat** — rescue & adoption | features `rescue`, `adoption`, `lost-found`, `shop`; routes `rescue`, `report`, `adoption`, `lost-found`, `shop` | `packages/api/src/{rescue,adoption,shop}/**`, `packages/validation/src/{rescue,adoption,shop}.ts` | migrations `*_rescue_*`, `*_adoption_*`, `*_shop_*`; functions `rescue-alert`, `send-followups`; tests `tests/{rescue,adoption,shop}_*` | `SET-2`, `DB-8`, `DB-9`, `RSC-*` (except `RSC-2`), `ADP-*` (except `ADP-5`), `SVC-SHOP` |
| **Tain** — vet booking & dashboards | features `booking`, `provider`, `shelter`, `consult`, `calls`, `pet-taxi`; routes `bookings`, `book`, `provider`, `shelter`, `consult`, `calls` | `packages/api/src/{booking,provider,shelter,calls}/**`, `packages/validation/src/{booking,provider,shelter,calls}.ts` | migrations `*_bookings_*`, `*_calls_*`; RPCs `available_slots`, `create_booking`, `cancel_booking`; functions `calls-create`, `send-booking-reminders`; tests `tests/{bookings,calls}_*` | `SET-4`, `DB-5`, `APT-*`, `PAY-1`, `PRV-*`, `RSC-2`, `ADP-5`, `SVC-ONL`, `CALL-*`, `SVC-TAXI` |

Cross-area features are split by "who owns the data":
- Visit notes (HLT-7): the health feature (Zihad) owns the form and the medical-record RPC, and the vet dashboard (Tain) embeds it.
- Rescue and adoption review queues (RSC-2, ADP-5): the shelter dashboard (Tain) shows them and calls Brehat's RPCs.
- Rescue alerts (RSC-6): Brehat sends them through Afridi's notification functions.

i18n strings: each owner edits only their own namespace files `packages/i18n/locales/{bn,en}/<feature>.json` (always both languages).

Migrations: name them `YYYYMMDDHHMMSS_<area>_<description>.sql`, using one of the areas above. Each owner writes the RLS policies and pgTAP tests for their own tables.

---

## 3. Shared Files

Anyone may make **minimal, additive** changes to these files, but must **flag them** in the PR description and in their agent's final summary. Never rewrite or delete other people's lines.

| File / path | Approver(s) | What others may do |
|---|---|---|
| Root configs: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig*.json`, ESLint/Prettier configs, `.gitignore`, `.env.example` | Afridi | Add a dependency or script your feature needs (lockfile changes only via `pnpm install`); add a new env var name (never a value) |
| App shells: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/_layout.tsx`, `apps/web/app/[locale]/layout.tsx`, navigation config | Afridi + Zihad | Add one nav entry / route for your own feature |
| `.cursorrules`, `.cursor/rules/**`, `docs/team.md`, `.github/CODEOWNERS` | Afridi + Zihad | Add rows to the Change Requests table in §8 only |
| `docs/tracker.md` | Zihad (summary table, layout) | Edit **Owner/Status of your own rows**; add new tasks to your own area (Zihad updates the summary counts) |
| `docs/schema.md`, `docs/trd.md`, `docs/app-flow.md` | Zihad | Add or update the section describing **your own** tables / functions / flows in the same PR as the code |
| `packages/i18n/locales/{bn,en}/common.json` | Zihad | Add new shared keys only (both languages); never rename or delete |
| `packages/i18n/locales/{bn,en}/<feature>.json` | Feature owner | Only the feature owner edits |
| `supabase/migrations/**` | Afridi (order/conflicts) | Add **new** files with your own area prefix; never edit another area's file or any already-applied migration |
| `packages/types/**` | Afridi | Regenerate with `pnpm db:types` only; no hand edits |
| `packages/ui/**` | Zihad | Request a new shared component (§8); build feature-specific components inside your own feature folder |
| `README.md` | Zihad | Add a line about your own feature |

---

## 4. Workload Balance

Counts match [tracker.md](./tracker.md) exactly. Done Phase 0 docs (DOC-1…8, Zihad) are not counted. Effort points: S = 1, M = 2, L = 3 (size column in the tracker).

| Member | Phase 0 (open) | MVP (P0) | Phase 2 (P1) | Phase 3 (P2) | Total tasks | Effort points |
|---|---|---|---|---|---|---|
| Zihad | 1 | 12 | 7 | 1 | 21 | 44 |
| Afridi | 1 | 13 | 7 | 1 | 22 | 47 |
| Zimia | 1 | 13 | 7 | 2 | 23 | 44 |
| Brehat | 1 | 13 | 7 | 1 | 22 | 43 |
| Tain | 1 | 12 | 6 | 2 | 21 | 44 |
| **Total** | **5** | **63** | **34** | **7** | **109** | **222** |

Per-phase effort points (S = 1, M = 2, L = 3):

| Member | Phase 0 | MVP | Phase 2 | Phase 3 |
|---|---|---|---|---|
| Zihad | 3 | 25 | 14 | 2 |
| Afridi | 3 | 27 | 15 | 2 |
| Zimia | 1 | 26 | 13 | 4 |
| Brehat | 2 | 25 | 13 | 3 |
| Tain | 2 | 26 | 12 | 4 |

**Balance rules**
- In each phase, nobody may have more than 2 tasks or 3 effort points above anyone else.
- A **new task** goes to the owner of the area its paths fall in. If several areas fit, or the area owner already has more open tasks than others in that phase, give it to **whoever has the fewest open tasks in that phase** (ties: fewest effort points). Then update this table and the tracker summary.
- If someone falls behind, move whole tasks (not half-tasks) through §7, and keep the counts in this table in sync.

---

## 5. Working Process

1. **Claim before you start:** set your name in the task's Owner column (if it isn't already) and Status to 🟨 in `tracker.md`, commit on your branch.
2. Work only in your owned paths (§2). Reading any file is always fine.
3. Create `.pranora-member` (git-ignored) in the repo root with your member id, so your Cursor agent knows who you are. See `.pranora-member.example`.
4. Before committing, run `git diff --name-only` (or `git status`) and make sure every changed file is in your area or is a flagged shared-file edit.
5. Commit to your own branch only (`zihad`, `afridi`, `Zimia`, `brehat`, `tain` or `<member>/<task-id>-…`). Never push to `main`.
6. PR → CODEOWNERS review by the owner of every touched area → CI green → Afridi merges.

## 6. Handoff

When a task depends on someone else's work, for example rescue alerts (Brehat) needing the notification channels (Afridi):
- The consumer writes what they need in §8 (API/RPC name, inputs, outputs).
- The owner builds it in their area and marks the request done.
- Until then the consumer may code against a typed stub **inside their own feature folder**, never inside the other area.

When handing a task to another member: set the new owner in the tracker, add a short note (branch, what's done, what's left) to the PR or the task row, and update the balance table.

## 7. Changing Ownership

1. Propose the change in §8 (what moves, from whom, to whom, why).
2. Both members and one of Afridi/Zihad agree (PR approval counts).
3. In the same PR, update §2 and §4 of this file, `.github/CODEOWNERS` and the tracker Owner column.

---

## 8. Change Requests

Use this table to ask another member for a change in their area (or open a GitHub issue and link it here). Agents may draft entries here but must not edit the other area.

| Date | From | To (owner) | Area / file | Request | Status |
|---|---|---|---|---|---|
| — | — | — | — | _e.g. `REQUEST:` add `notify(user_id, template, data)` RPC for urgent rescue alerts_ | open / done / declined |
