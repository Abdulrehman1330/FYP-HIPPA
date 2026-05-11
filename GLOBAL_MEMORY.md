# FYP Global Memory

Short, reusable lessons for this HIPAA Home Health university project. Keep this file project-specific and avoid Ash Systems operational details.

## Deployment

- Keep the FYP Contabo deployment isolated from Ash Systems infrastructure: use its own app path, Compose project, Docker network, Postgres volume/database, and project-only secrets. On the shared VPS it currently runs at `/home/deploy/hippa-home` because `deploy` has no passwordless sudo; use `/opt/hippa-home` only when sudo/root setup is available.
- The shared VPS already has an Ash edge Caddy bound to ports `80/443`; do not start a second public Caddy there. Connect the edge Caddy to `hippa_home_private` and route only `hippa-home.duckdns.org` and `hippa-home-api.duckdns.org` to the FYP containers.
- Do not commit or build from `contabo-vps-access/`; it contains local VPS access material and must remain ignored.
- Use project-scoped Compose variable names for optional provider keys, such as `HIPPA_HOME_OPENAI_API_KEY`, so generic local shell secrets do not leak into `docker compose config` output.
- For Vite production builds, set `VITE_API_BASE_URL=https://hippa-home-api.duckdns.org/api/v1`; the dev proxy in `vite.config.js` does not exist after `vite build`.
- GitHub auto deploy secrets are configured for `Abdulrehman1330/FYP-HIPPA`; do not add separate GHCR secrets unless the workflow stops using the built-in `GITHUB_TOKEN`.

## Backend And Database

- The production backend is Node/Express/Prisma under `backend/src`, not the older FastAPI scaffold under `backend/api`.
- Prisma Docker builds must copy `prisma/` before `npm ci` because `postinstall` runs `prisma generate`.
- Run `prisma migrate deploy` before starting the production backend against a fresh database.
- Production public registration should stay disabled; create the owner with `npm run seed:owner` from `OWNER_*` secrets and force password change on first login.
- Demo data for the live VPS must be synthetic only. Store any generated demo passwords under ignored `contabo-vps-access/`, never in committed seed files or progress notes.
- The backend auth middleware file is `backend/src/middleware/auth.middleware.js`, not `auth.js`.

## ML And OCR

- The current readmission ML service is a demo baseline trained from synthetic data during Docker build; do not present it as clinically validated.
- Pin Python ML dependencies. Unpinned `scikit-learn` broke `CalibratedClassifierCV(cv="prefit")`, so the image now saves the trained XGBoost model directly.
- OCR needs Tesseract inside the container; keep OCR service private on the Docker network and call it through `OCR_SERVICE_URL=http://ocr-service:5000`.

## Environment Lessons

- On this Windows workspace, prefer PowerShell-native commands and `rg`; avoid Bash heredocs.
- When printing GitHub Actions logs locally on Windows, set `PYTHONIOENCODING=utf-8` or encode output safely because CI logs can contain Unicode symbols from tools like Prisma.
- For SSH commands that contain SQL, `count(*)`, or nested quotes, pipe a here-string into `ssh ... 'bash -s'` instead of putting the whole remote command inside one PowerShell string.
- For nested remote scripts through PowerShell SSH, prefer `scp` of a temporary script into `/tmp` and run it with `docker compose exec -T ... < script`; nested heredoc markers can leak into Node stdin.
- In PowerShell, use single-quoted here-strings for JavaScript snippets that contain Prisma methods like `prisma.$disconnect()`; double-quoted strings expand `$disconnect`.
- If Prisma install/generate fails on Windows, stop any running backend first because Prisma engine DLLs can be locked by the Node process.
- Windows OpenSSH ignores private keys with broad ACLs. For local deploy keys, remove inherited/group access and keep read permission only for the current user, Administrators, and SYSTEM.
- Shared VPS disk can be tight; `docker builder prune -af` is a safe first cleanup step for build cache before heavy ML/OCR image builds because it does not remove running containers or volumes.
- If provider keys were pasted into chat or surfaced during local validation, rotate them before production use.
