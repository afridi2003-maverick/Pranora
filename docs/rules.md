# Pranora — Development Rules

These rules apply to every contributor (human or AI). A short version lives in [`/.cursorrules`](../.cursorrules).

---

## 1. Product Rules

1. **Bangla first.** Every user-facing string must exist in both `bn` and `en`. Bangla is the default locale. Never hard-code UI text in components.
2. **Emergency is always reachable** — never remove or hide the emergency button on Home and Map.
3. **Map results must also be available as a list** (accessibility + low-end devices).
4. Only **verified** providers appear on the public map and in search.
5. Never present the AI assistant or tips as a diagnosis — always show "এটি চিকিৎসকের পরামর্শের বিকল্প নয় / This is not a substitute for a vet".
6. **AI never**: diagnoses, names a medicine or dose, writes prescriptions, pretends to be human, says something is done before the system confirms it, or asks for passwords, OTPs or payment details. AI must never call adoption-decision RPCs.
7. **Humans decide adoptions** — approve/reject is always a human action. Diagnoses and prescriptions only by a qualified vet; medical records are written only by vets.
8. **Location & phone privacy** — an animal's exact location and personal phone numbers are never shown publicly. Rescue locations are visible only to the reviewer, assigned rescuer and admins; adoption shows district/upazila only; lost & found (a rescue report type) is public only through the `lost_found_board` view (~1 km area, no phone). Strip EXIF/GPS from uploaded photos.
9. **Call recording is off by default** and needs both participants' consent.
10. Source of truth for features: [prd.md](./prd.md), aligned with [PetCare_BD_Feature_List_Bangla.pdf](./PetCare_BD_Feature_List_Bangla.pdf). **MVP (P0) = only modules 1–4 of the PDF's build order**; don't pull P1/P2 work into MVP PRs without updating the tracker.

## 2. Code Style

- **TypeScript strict** everywhere. No `any` (use `unknown` + Zod parsing).
- Functional React components + hooks. No class components.
- File names: `kebab-case.tsx`; components `PascalCase`; hooks `useCamelCase`; constants `SCREAMING_SNAKE_CASE`.
- Feature-based folders: `features/<feature>/{components,hooks,api,types}`.
- Prettier + ESLint must pass. Max ~300 lines per file — split if bigger.
- Prefer named exports. Default export only for Next.js pages / Expo Router screens.
- Keep comments rare; explain *why*, not *what*.

## 3. i18n Rules

- Use `t('namespace.key')` (i18next / next-intl). Keys are English, `dot.separated`, grouped by feature: `map.openNow`, `booking.confirm`.
- Add the key to **both** `bn.json` and `en.json` in the same PR. CI fails on missing keys.
- Format money, dates, distance and numbers only through `packages/i18n` formatters (`formatCurrency`, `formatDate`, `formatDistance`, `formatNumber`).
- DB bilingual fields: read through `pickLocale(row, 'name', locale)`; never assume `name_en` exists.
- Test every new screen in both languages and at 130% font scale.

## 4. Data & Backend Rules

- **Schema changes only through Supabase migrations** (`supabase migration new <name>`). Never edit the production DB by hand.
- Update [schema.md](./schema.md) in the same PR as the migration.
- **RLS on every new table**, with policies and a pgTAP test.
- Regenerate types after migrations: `pnpm db:types`.
- Never use the service-role key in `apps/mobile` or browser code. It belongs only in Edge Functions.
- Geo data: `geography(Point, 4326)`; always `ST_MakePoint(lng, lat)` — **longitude first**.
- Store times as `timestamptz`; business hours are Asia/Dhaka.
- Money in `numeric(10,2)` BDT; never floats in JS for totals — use integer poisha or a decimal lib.
- Validate all inputs with shared Zod schemas from `packages/validation` on both client and Edge Function.
- Phone numbers normalized to `+8801XXXXXXXXX`.

## 5. Maps Rules

- Do not call Places/Geocoding APIs on every pan — only on explicit search (cost control).
- Debounce viewport queries (500 ms). Use marker clustering when > 30 markers.
- Map API keys must be restricted (Android package / iOS bundle / HTTP referrer).
- Always handle: permission denied, GPS off, no results, offline.

## 6. Security & Privacy

- No secrets in the repo. Use `.env.local` (git-ignored) and platform secret stores.
- Don't log phone numbers, OTPs, addresses or medical data.
- Medical files only in private buckets, accessed via signed URLs.
- Payment success is decided **only** by the server-side IPN/validation, never the client redirect.

## 7. Git Workflow

- Branches: `main` (production), `dev` (integration), one branch per member — `zihad`, `afridi`, `Zimia` (existing casing), `brehat`, `tain` — and feature branches `<member>/<task-id>-short-name` (e.g. `brehat/RSC-1-report-form`).
- **Ownership:** each member (and their AI agent) changes only the paths they own in [team.md](./team.md). Shared files allow only minimal additive edits, which must be flagged in the PR. To change something in another member's area, use a change request ([team.md §8](./team.md#8-change-requests)) or an issue. Agents follow [`.cursor/rules/team-ownership.mdc`](../.cursor/rules/team-ownership.mdc), which reads the git-ignored `.pranora-member` file.
- Claim a task in [tracker.md](./tracker.md) (Status 🟨 on your own row) before starting. New tasks go to the area owner, or to whoever has the fewest open tasks in that phase.
- Never push directly to `main`. Open a PR → review by the CODEOWNERS of every touched area → CI green → squash merge (Afridi merges to `main`).
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) — `feat(map): add open-now filter`, `fix(booking): prevent double slot`, `docs: update schema`.
- Keep PRs small (< 400 lines changed where possible) and link the tracker item ID (e.g. `MAP-3`).
- Update [tracker.md](./tracker.md) status when a task moves.

## 8. Testing

- New logic needs unit tests; new RPC/RLS needs pgTAP tests.
- Critical flows (OTP login, nearest vet, booking, rescue report → close, adoption apply → handover, payment) need E2E tests (Playwright web, Maestro app).
- AI changes must pass the bn/en guardrail eval set (no diagnosis/dose, emergency detection, no fake confirmations).
- Test on a low-end Android device (2–3 GB RAM) before release.

## 9. Performance Budgets

| Item | Budget |
|---|---|
| Web LCP (4G) | < 2.5 s |
| App cold start | < 3 s |
| Nearest-vet result | < 1.5 s |
| Urgent rescue report → reviewer alert | < 1 min |
| JS bundle (web, first load) | < 200 KB gzipped |
| Image size | < 150 KB (WebP) |

## 10. Definition of Done

- [ ] Works in Bangla and English
- [ ] Works on Android, iOS and web (if applicable)
- [ ] Loading, empty, error and offline states handled
- [ ] Accessible labels, contrast OK, 48 px tap targets
- [ ] Tests added and CI green
- [ ] Docs (`schema.md`, `tracker.md`, etc.) updated
