# DEVIATIONS.md

Intentional deviations from the architecture defined in `_target_specs/CLAUDE.md`.
Approved by the project owner during the multi-tenant migration sprint.

| # | Spec section | Spec says | Implementation | Reason |
|---|---|---|---|---|
| 1 | §2 Tech stack — "Forbidden: any AI/ML model service, any external LLM call" | No LLM in POC pipeline | OpenAI is **kept** as the POC drafting engine | Teammate is integrating an in-house ML model later; OpenAI is the placeholder until then. POC service still enforces tenancy + caseload. |
| 2 | §10 POC | Rule-based deterministic template fill | LLM-driven generation | Same as #1 |
| 3 | §14 Sprint plan | Build separate role-scoped frontend dashboards | **Single combined dashboard** with role-based nav gating | Less throwaway work; one codebase, one entry point, role determines visible nav items + screens |
| 4 | Pre-flight | "Back up and migrate carefully — destructive resets discouraged" | In-place migration with data backfill (no DB drop) | All existing rows preserved into "Alpha Labs and Care" clinic; zero data loss |
| 5 | §6.8 Password rules | Min 12 characters, upper+lower+digit | **Min 8 characters** in development | Set via `PASSWORD_MIN_LENGTH` env var. Production deployment must restore the 12-char rule. The existing super-admin password (`asad123456`) is below 12 chars — relax-for-dev keeps it valid until the human chooses to change it. |
| 6 | §6.7 Refresh token rotation | Strict server-side nonce tracking | Refresh tokens are rotated (new one issued on every refresh) but **the old one is not invalidated server-side** | Requires a session/nonce table; deferred to a follow-up sprint |
| 7 | §6.8 Password history | Cannot match the previous 3 passwords | Not implemented | Optional per spec (footnote: "PasswordHistory table — optional for FYP, mandatory for production") |
| 8 | §13 TLS | TLS 1.2+ at reverse proxy | Plain HTTP in dev | Standard local-dev practice; production deployment uses TLS at the proxy |

## Things from the spec that ARE implemented

- ✅ Five-role model (`SUPER_ADMIN`, `ADMIN`, `CLINICIAN`, `DOCTOR`, `PATIENT`) — `VIEWER` removed
- ✅ Multi-tenant `Clinic` model; every clinical record carries `clinicId`
- ✅ Separate `Patient` table with MRN, DOB, primaryDoctorId, primaryClinicianId
- ✅ Append-only `audit_logs` (Postgres trigger blocks UPDATE/DELETE)
- ✅ JWT access (1h) + refresh (7d HttpOnly cookie); `JWT_REFRESH_SECRET` env var
- ✅ `mustChangePassword` first-login flow (forced modal in UI; backend blocks all routes except `/auth/change-password` and `/auth/me`)
- ✅ `requireRole(...)` middleware
- ✅ `assertCaseload(req, {patientId|documentId})` helper — returns 404 (not 403) on miss
- ✅ Tenant filter (`clinicId`) on every multi-tenant query (super-admin exempt)
- ✅ Route namespaces: `/super/*`, `/admin/*`, `/clinician/*`, `/doctor/*`, `/me/*`
- ✅ Helmet, CORS allow-list with credentials, express-rate-limit (auth tighter, general 100/15min)
- ✅ Winston PHI scrubber on operational logs
- ✅ Idempotent `seed-super-admin.js` script (refuses to create a second SUPER_ADMIN)
- ✅ Bcrypt cost configurable via env (`BCRYPT_COST`)
- ✅ Email-credentials flow on user/patient creation (Gmail SMTP optional)
