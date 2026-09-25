# North Star architecture

## Product loop

The application is organized around one continuous loop:

`Person → Purpose → Design Context → People/Roles → Missions → Project Nodes → Science / Enterprise → Build / Launch → Outcomes → Next Vector`

Synthia travels across the loop instead of living in an isolated chat screen.

## Front-end topology

`client/src/pages/NorthStarHome.tsx` owns the unified shell and the ten primary surfaces:

1. Command
2. Purpose
3. Design
4. People
5. Missions
6. Projects
7. Science
8. Enterprise
9. Build + Launch
10. Worlds
11. Synthia

The application intentionally uses one shared workspace state so a project created by the Builder is immediately visible to Missions, People, Science, Enterprise, and Synthia.

## State model

`NorthStarWorkspaceState` contains:

- purpose profile and living roadmap
- project nodes
- people matches
- missions and action evidence
- experiments and replication state
- enterprise offers / jobs / funding / collaborations
- builder intake runs and immutable source assets
- world definitions
- Synthia mode, focus, observations, and next actions
- activity stream
- privacy/context opt-ins

Production persistence uses `northstar_workspaces.state` as JSONB with a monotonically increasing client workspace version. Local development uses the same logical document in `data/local-state.json`.

## APIs

- `GET /api/northstar/workspace`
- `PUT /api/northstar/workspace`
- `POST /api/northstar/assets`
- existing notebook APIs
- existing resonance profile APIs
- existing organism APIs
- existing consciousness engine APIs

## Creator intake security

Archive uploads:

- require authenticated identity or local dev identity
- cap request size at 100 MB
- sanitize user and file path components
- store outside the client bundle
- calculate SHA-256 server-side
- return an immutable asset id

A future deployment adapter can unpack archives in an isolated sandbox, validate manifests, scan dependencies, produce SBOMs, and publish signed build outputs. The current endpoint stops at safe source intake and provenance rather than silently executing uploaded code on the application host.

## Human Design / resonance layer

The Design surface connects the existing resonance profile and field-coherence instrumentation to the Pathways to Purpose flow. The product treats resonance scoring as an inspectable coordination mechanism. Research claims, speculative interpretations, and observed outcomes should remain visibly distinct in Science.

## Synthia

Synthia has explicit modes:

- companion
- mission
- lab
- builder
- world

The North Star state stores her current focus and next actions. The existing local consciousness service remains callable through `/api/consciousness/query`.

## Extension contract

New modules should integrate through one of these boundaries:

- workspace state extension
- server API adapter
- creator intake/deployment adapter
- science protocol adapter
- matching/resonance scoring adapter
- Synthia mode/tool adapter
- world host adapter

Avoid replacing protected existing modules merely to add a new experience.
