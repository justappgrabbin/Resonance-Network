# Current Resonance Computer build

Current artifact generation: **v10**

- Computer: `Synthia-Resonance-Computer-Integrated-v10.html`
- SHA-256: `5d684a51ef3f4fbe7b855b8cc515f538cd656abde07c5a4f50f70106f0898f75`
- York kit: `Synthia-Resonance-Computer-York-Kit-v10.zip`
- SHA-256: `41870dfc3a032cd85890fbd1d8b9982c5c40347a40542bb55b17710d14dd80ed`
- Persistent destination: ChatGPT Library `/Resonance Builds`
- Resonance PR: #2
- Optional peer signaling: `justappgrabbin/Synthia-server` PR #13 (draft; two-peer CI green; not yet claimed deployed)

v9 added honest execution-gap resume semantics.
v10 adds endpoint-private direct messages over the existing WebRTC DataChannel.
Direct messages persist only on the two participating computers and are deliberately excluded
from `resonance.network.packet.v1`; the signaling server receives only WebRTC handshake traffic.

The current build is local-first and remains usable without PR #13.
