# HIPAA Home Contabo Deployment

This folder is the tracked deployment package for the university VPS release.
It is intentionally separate from `contabo-vps-access/`, which is local access
material and must not be committed.

## Domains

- Frontend: `https://hippa-home.duckdns.org`
- API: `https://hippa-home-api.duckdns.org`

## Required GitHub Secrets

- `VPS_HOST`
- `VPS_SSH_PORT`
- `VPS_SSH_USER`
- `VPS_SSH_KEY`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `OWNER_EMAIL`
- `OWNER_TEMP_PASSWORD`
- `OWNER_FIRST_NAME`
- `OWNER_LAST_NAME`

Optional:

- `CADDY_ACME_EMAIL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`

The workflow writes optional AI keys into project-scoped runtime variables
(`HIPPA_HOME_OPENAI_API_KEY`, `HIPPA_HOME_GEMINI_API_KEY`,
`HIPPA_HOME_ANTHROPIC_API_KEY`) before Compose maps them to the backend. This
prevents generic local shell variables from leaking into Compose validation
output.

## VPS Isolation

The stack deploys to `/home/deploy/hippa-home` on the current shared Contabo VPS
because the `deploy` user does not have passwordless sudo. If this project moves
to a fresh VPS with root/sudo setup, `/opt/hippa-home` is still the preferred
system path.

It uses its own compose project, Docker
network, Postgres database container, and named volumes. It does not reuse Ash
Systems app paths, databases, database users, or runtime secrets.

On the shared Contabo VPS, the existing edge Caddy already owns ports `80` and
`443`. In that topology, keep this stack's `standalone-caddy` profile disabled
and connect the edge Caddy container to `hippa_home_private` only for these two
host routes. On a fresh VPS with no edge proxy, run with
`COMPOSE_PROFILES=standalone-caddy` to use this folder's Caddy service directly.

Current shared VPS edge Caddy routes:

- `hippa-home.duckdns.org` -> `hippa-home-frontend:8080`
- `hippa-home-api.duckdns.org` -> `hippa-home-backend:3000`

## Runtime Access

Public registration is disabled in production. The workflow runs Prisma
migrations and then bootstraps exactly one `SUPER_ADMIN` from owner secrets. The
owner must change the temporary password after first login.
