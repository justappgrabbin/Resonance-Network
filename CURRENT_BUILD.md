# Current Resonance Computer build

Current artifact generation: **v11**

- Computer: `Synthia-Resonance-Computer-Integrated-v11.html`
- SHA-256: `26d9bb15529f47a249667355a6e74ba450dddf1c09fd11fc11340d5f59409a5a`
- York kit: `Synthia-Resonance-Computer-York-Kit-v11.zip`
- SHA-256: `50f3061cfbcb35b29d6ff5103f9a35266e89514848423f1815e4a81b237219ea`
- Persistent destination: ChatGPT Library `/Resonance Builds`
- Resonance PR: #2
- Optional peer signaling: `justappgrabbin/Synthia-server` PR #13 (draft; two-peer CI green; not yet claimed deployed)

v9 added honest execution-gap resume semantics.
v10 added endpoint-private direct peer messages, excluded from the portable social packet.
v11 adds a normal-page **Cynthia Presence** card backed by the same resident state used by
Agentic Reality: heartbeat/cycles, current world view, current/next work, pending invitations,
direct peers, and the last unconfirmed execution gap.

The current build is local-first and remains usable without PR #13.
