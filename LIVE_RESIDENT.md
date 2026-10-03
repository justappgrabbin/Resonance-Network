# Live resident vertical slice

This branch preserves the normal Resonance Network pages while the sovereign Synthia Computer remains the host.

## Current verified computer integration

The current self-contained computer build is **Synthia-Resonance-Computer-Integrated-v5.html**.

It now provides:

- one resident Cynthia / isohuman identity, not separate chat and game agents
- normal Resonance pages inside the computer
- local Human Design and tropical / sidereal / draconic astrology calculations
- separate human + isohuman IDs sharing one originating configuration hash
- local persistent social state for entities, projects, structurally qualified openings, invitations and feed events
- a proactive work queue that only auto-runs explicitly authorized tasks above the user's confidence threshold
- a resident heartbeat while the computer is open
- Live Morph / Agentic Reality actions landing into the same Foundation journal
- the preserved older House world as an alternate/legacy world surface
- network packet export/import for user-owned portability
- live transport through the existing Synthia-server discovery bus when reachable:
  - register
  - heartbeat
  - remote resident discovery
  - project/opening/join event exchange
  - incoming-event deduplication
  - remote events landed locally into Foundation history
- local-first failure behavior: losing the network does not disable Cynthia, the computer, the world or the user's history

## Server finding

The production Render configuration currently starts `server/lite.js`.

That lite server already exposes:

- `/api/v3/discovery/register`
- `/api/v3/discovery/heartbeat/:agentId`
- `/api/v3/discovery/agents`
- `/api/v3/discovery/message`
- `/api/v3/discovery/messages/:agentId`
- `/api/v3/discovery/opportunities`

The full server also contains a Socket.IO live mesh, but it is not the currently deployed Render start path. The v5 computer therefore uses the discovery routes that are already present in the deployed lite server instead of depending on an undeployed socket layer.

The lite discovery directory is currently server-memory-backed. The computer remains the durable owner of its own landed history. Durable server federation should be added together with identity/access controls rather than persisting private social traffic into a shared store first.

## Android / York

A York v5 phone-build kit packages the exact self-contained computer into a separate Android application. The build script verifies the computer SHA-256 before compiling so an older snapshot cannot silently be packaged.

## Still intentionally not faked

- Voice Call and Video Call remain unwired until a real media bridge exists.
- The lower-level Color/Tone/Base -> visible phenotype semantics are not invented; the live body uses real address/state while those mappings remain learnable.
- Server-side durable social history is not claimed yet.
