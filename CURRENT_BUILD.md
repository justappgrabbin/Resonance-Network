# Current Resonance Computer build

Current artifact generation: **v9**

- Computer: `Synthia-Resonance-Computer-Integrated-v9.html`
- SHA-256: `c34af4ce2140a7855f0fa3be17e2794b270549e621f68f32717599626216b014`
- York kit: `Synthia-Resonance-Computer-York-Kit-v9.zip`
- SHA-256: `d1bdbc3e768cd8f79d3d8a3e66a282182c8cef24e2022d202a9059b9300b55a3`
- Persistent destination: ChatGPT Library `/Resonance Builds`
- Resonance PR: #2
- Optional peer signaling: `justappgrabbin/Synthia-server` PR #13 (draft; two-peer CI green; not yet claimed deployed)

v9 adds honest resume semantics: a missed resident heartbeat window becomes a landed
`resident-execution-gap` with `fabricatedEvents:false`; the system does not manufacture
work, travel, memories, or social events for time when no execution was confirmed.

The current build is local-first and remains usable without PR #13.
