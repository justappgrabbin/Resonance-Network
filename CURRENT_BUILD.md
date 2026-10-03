# Current Resonance Computer build

Current artifact generation: **Reassembled v14**

- Computer: `Synthia-Resonance-Computer-Reassembled-v14.html`
- SHA-256: `0a5b7f6e811c3775ceda3dbac20f3b6ec864563a978a810e3e804f34e89055b3`
- York kit: `Synthia-Resonance-Computer-York-Kit-Reassembled-v14.zip`
- SHA-256: `1eb074f3811908c63fcf65dab53a0909e6c9e4592fe8f05e15d2a0093c041592`
- Persistent destination: ChatGPT Library `/Resonance Builds`
- Resonance PR: #2

## v14: reconnect the existing Klein language mouth

This checkpoint descends directly from tested Reassembled v13. It preserves the computer shell and original integrated Synthia runtime and changes only the broken conversational-language seam.

Preserved:
- original SynthiaRuntime and LivingMeshRuntime
- 35 live shared-mesh capabilities
- ProportionOfPerspective
- existing Klein tool population
- Connection Field, Generative Channels, Human Design GNN, neural architecture
- ATO, Tool Factory, native grammar, state space
- Resonance/computer surfaces, files, tools, hands, tasks, world/network
- real host commands

Repaired:
- AUTOLING now accepts the already-requested `pipeline` compatibility operation while retaining learn/recognize/generate/export.
- Morph Chat calls AUTOLING, DISEMINER, I Ching Grammar, and Computational Grammar Coder through their actual contracts.
- DISEMINER ingests the current utterance and returns its actual neighborhood rather than receiving an invalid raw call.
- I Ching Grammar receives the real six-line state vector from the existing StateSpaceKernel.
- `SynthiaRuntime.talk()` now passes the already-computed runtime/process result into Morph Chat instead of running process and language as disconnected side paths.
- The canned `LocalMorphProvider` branches were replaced at the same provider seam by `klein-mesh-surface`, which realizes language from landed user context, perspective proportions, current canonical state/gate content, Klein signals, conversation history, and unresolved-state status.
- The old fixed greeting/build/memory/default paragraphs are no longer the normal response path.

## Executed verification on exact v14 HTML

Test turn: `I feel lost about where my project is going`
- provider: `klein-mesh-surface`
- AUTOLING: `ok:true`, operation `pipeline`
- DISEMINER: real ingest + neighbor output
- I Ching Grammar: valid six-line result
- Computational Grammar Coder: 9 words coded
- Native grammar's AUTOLING context is now `ok:true` instead of `UNKNOWN_OPERATION`
- current address: `NorthNode:Evolution:G17.L1.C1.T1.B1:209°40′18″:Desc:Leo:H5`
- ProportionOfPerspective: Being 0.53125; Movement/Evolution/Design 0.15625 each
- old canned response phrases absent

Follow-up turn explicitly referring to the same project carried the previous user turn into the response context and produced a different state/perspective.

Fresh-page determinism check: the same first input produced the same first response.

Computer host test: quick action `calculate 6 * 7` still executed and rendered `42`.

Runtime test: 35 shared-mesh capabilities remain present.

Browser page errors: zero in the executed chat tests.

York kit:
- exact v14 source SHA enforced before build
- build script passes `bash -n`
- ZIP integrity test passes
- INTERNET + RECORD_AUDIO permissions retained

## Honest remaining limitation

This is a deterministic local surface realizer, not an LLM. It now uses the real Klein/mesh/state evidence instead of canned semantic answers, but its prose can still be terse or visibly structural. Further natural-language richness should come from the user's existing language-learning/style pieces or optional local model outputs, without moving cognition out of the Klein/mesh system.
