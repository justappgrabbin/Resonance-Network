# Operations

## SLO targets

Production starting targets:

- App availability: 99.9% monthly
- Workspace write success: 99.95%
- p95 workspace API latency: < 350 ms in-region
- p95 asset intake acknowledgement: < 2 s excluding upload transfer time
- RPO: 15 minutes for PostgreSQL state
- RTO: 60 minutes for a single-region incident

## Observability

Instrument:

- HTTP request latency and status
- workspace read/write failures
- upload size, duration, and digest generation
- mission completion rate
- time-to-first-project
- time-to-first-collaboration
- project-to-launch conversion
- experiment replication events
- enterprise opportunity matches
- Synthia tool/service failures
- consciousness service health

Use OpenTelemetry traces around API requests, workspace saves, external adapters, and Synthia tool calls. Keep user-content payloads out of telemetry by default.

## Security posture

- least-privilege database role
- encrypted PostgreSQL volume / managed database encryption
- TLS at ingress
- HTTP-only secure auth cookies in production
- raw project archives stored outside public static roots
- SHA-256 source provenance
- uploaded source is never executed directly on the web server
- future build execution should occur in ephemeral sandboxes with CPU/memory/network limits
- secrets supplied through environment/secret manager only
- signed production containers and SBOM generation recommended

## Backups

For PostgreSQL production:

- continuous WAL or managed PITR
- daily logical backup
- quarterly restore test
- retain user-exportable workspace snapshots for sovereignty

For local development, `data/` is stateful and should be backed up before replacing the working tree.

## Cost model

A small production deployment can start with:

- one small web service / container
- managed PostgreSQL
- object storage for source archives
- optional CPU service for the local consciousness engine

Keep uploaded archives in object storage rather than web-service disk once traffic becomes multi-user. Add job workers only when build/deploy and experiment workloads require them.

## Incident runbook

### Workspace writes failing
1. Check database connectivity and disk/object-store health.
2. Confirm schema has `northstar_workspaces`.
3. Put the UI in local/read-only mode if necessary.
4. Restore service, then reconcile last client version with server version.

### Archive intake failures
1. Check request-size limits at proxy and Express.
2. Verify asset directory/object-store permissions.
3. Confirm disk quota.
4. Preserve successful source hashes before retrying downstream processing.

### Consciousness service unavailable
The core network stays operational. Synthia surfaces should show the service as offline while purpose, missions, projects, builder, science, and enterprise continue functioning.
