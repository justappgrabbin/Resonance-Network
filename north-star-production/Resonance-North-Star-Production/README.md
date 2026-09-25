# Resonance Network — North Star Production

This repository is the integrated North Star build assembled from the existing Creator-Resonance chassis plus the strongest mechanisms and product intent from the Resonance Network, Pathways to Purpose, Synthia, Paper/Creator Launcher, YOU-N-I-VERSE, and research/lab materials.

It is not an MVP shell. The default authenticated experience is a multi-surface production workspace with one shared state model across:

- Pathways to Purpose
- Human Design / resonance instrumentation
- People and role matching
- Missions and real-world field projects
- Project nodes
- Resonance: Science
- Resonance: Enterprise
- ZIP / repository creator intake and launch
- YOU-N-I-VERSE worlds
- Synthia companion modes
- Existing Notebook IDE, Paper Seed organism, chat, and consciousness services

## Quick start

```bash
npm install
npm run dev
```

When `REPL_ID` is not configured, the server automatically uses a local development identity and durable file storage under `data/local-state.json`. This makes the application runnable without Replit or PostgreSQL for local development.

For a production deployment with PostgreSQL and Replit OIDC:

```bash
export DATABASE_URL='postgres://...'
export SESSION_SECRET='...'
export REPL_ID='...'
npm run db:push
npm run build
npm start
```

The North Star state is stored in `northstar_workspaces` as a versioned JSONB document per user. The flexible document boundary lets new automata and domain modules be added without repeatedly destabilizing the relational schema. Core identity, authentication, notebook, resonance profile, and organism state remain separate tables.

## Creator intake

The Build + Launch surface accepts real ZIP archives up to 100 MB. Archives are written to:

`data/northstar-assets/<user-id>/`

Each asset receives a SHA-256 digest and immutable asset id before it can be promoted into a project node. Repository URLs are also registered as source references.

## Existing protected surfaces

The original Creator-Resonance features are still available and were not deleted:

- `/legacy` — original Creator-Resonance home
- `/notebook` — notebook IDE
- `/chat` — existing chat surface
- `/organism` — Paper Seed living tree

The North Star application is additive around those capabilities.

## Architecture

See `docs/ARCHITECTURE.md`, `docs/DONOR_PROVENANCE.md`, and `docs/OPERATIONS.md`.
