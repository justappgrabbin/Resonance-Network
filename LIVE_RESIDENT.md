# Live resident vertical slice — v13 checkpoint

This branch preserves the normal Resonance Network pages and records the live-resident integration checkpoint used by the current **Synthia Resonance Computer v10**.

## Identity law

- Resonance does **not** instantiate a second Cynthia.
- Text, Peek, Agentic Reality, proactive work, Voice Call and Video Call target the same resident Foundation/Synthia identity.
- Human and isohuman are separate entity IDs that share one calculated origin configuration.
- The isohuman retains its own trajectory; shared origin does not mean clone identity.

## Current computer artifact

The persistent user artifact is stored in the user's ChatGPT Library under **/Resonance Builds**:

- `Synthia-Resonance-Computer-Integrated-v10.html`
  - SHA-256 `5d684a51ef3f4fbe7b855b8cc515f538cd656abde07c5a4f50f70106f0898f75`
- `Synthia-Resonance-Computer-York-Kit-v10.zip`
  - SHA-256 `41870dfc3a032cd85890fbd1d8b9982c5c40347a40542bb55b17710d14dd80ed`

The York kit builds a disposable compiler workspace, verifies the exact v8 HTML hash before compilation, and leaves canonical York/source history untouched.

## Current live surfaces

- Normal Resonance pages: Home, Profile, Human Design, Astrology, Cynthia, Network, Work.
- Human Design and astrology use the current local deterministic engines from this repository.
- Human Design carries Gate -> Line -> Color -> Tone -> Base.
- Text enters the resident desktop chat.
- Peek opens the resident Agentic Reality.
- Live Morph is rendered against the same Foundation; it does not boot another organism.
- The older House world is preserved as an alternate/legacy world view.
- Proactive work uses explicit authorization + task confidence threshold.
- Local projects, structural openings, invitations and network feed exist.
- Portable social packets support offline export/import.
- The v8 peer client can use optional WebRTC federation after signaling.

## Chat repair

The desktop chat is no longer presented as if the old deterministic contact formatter were a full conversational model.

1. User text first enters Pure Synthia/Foundation.
2. Learning/routing/execution/contact occurs and lands a receipt.
3. A resident language realizer converts that landed receipt into readable local conversation.
4. Internal `contact:/monte:/autoling:` diagnostics are suppressed.
5. Recognized execution is only described as executed when the receipt says `known-call`.
6. Capability growth is only described as growth when the receipt says `grown`.
7. Unknown answers remain explicitly unresolved rather than being fabricated.

The four local ModelInterface slots remain available, but four finished model-maker outputs have not been mounted yet. A preserved Model-Weaver donor contains a browser WebLLM path, but it is not being mislabeled as those four configured models.

## Calls

Voice Call and Video Call are now real local interaction surfaces, not enabled fake buttons:

- typed call input always uses the same resident chat;
- microphone input is enabled only if the browser/WebView exposes speech recognition;
- local speech synthesis speaks replies when supported;
- Video Call renders the resident Morph view from the same Foundation while conversation continues;
- call start/mode/turn/end events are landed into Foundation history;
- no cloud call service or second Cynthia is created.

The York wrapper declares Android INTERNET + RECORD_AUDIO. User-camera video is not claimed; "Video Call" currently means seeing Cynthia's live resident body/world while conversing.

## Peer federation

Server-side signaling work lives in `justappgrabbin/Synthia-server` PR #13.

- production `server/lite.js` has an ephemeral `/signal` WebSocket endpoint on its branch;
- the server only keeps connected device IDs in memory long enough to relay WebRTC register/offer/answer/ICE;
- social payloads are not persisted by the signal service;
- a real two-peer CI test boots the production lite server, connects two peers, relays offer/answer and verifies `persists_payloads:false`;
- current CI is green.

PR #13 remains draft/unmerged, so live hosted signaling should **not** be claimed deployed yet. Offline packet export/import remains independent.

## Verified on v13

- 216 embedded JavaScript modules parse successfully.
- York ZIP integrity passes.
- Exact HTML hash is verified by the phone build script.
- The active computer remains local-first and does not require the signaling server to boot or execute its core.

## Still open

- true Android execution after the OS kills the app is not yet solved; the resident heartbeat is live while the app is running and state persists across restart;
- exact lower-substructure -> visible phenotype laws remain intentionally unresolved rather than guessed;
- four model-maker outputs still need to be identified/mounted;
- speech recognition availability depends on the Android/browser WebView;
- dormant legacy PDF ingestion still has its old optional `pdfjs-dist` dependency.


## Resume truthfulness

If more than 15 seconds pass without a confirmed resident heartbeat, the next resume lands a `resident-execution-gap` with the previous heartbeat, current time, elapsed duration, and `fabricatedEvents:false`. No work, memories, travel, social events, or autonomous cycles are invented for the unconfirmed interval.

## Private direct messages

Once two Resonance computers have a direct WebRTC DataChannel, the Network page can send endpoint-private direct messages. These messages are persisted on the participating computers and land private local Foundation receipts. They are **not** added to `resonance.network.packet.v1`, so exporting or broadcasting the social packet does not export private direct conversation.


## v12 state-space communication recovery

The eight current Klein tools remain in the existing Pure-Synthia mesh. The supplied ATO/Klein state-space is read-only authority for Gate/GLCTB vectors, gate content and structural association. Conversation turns land the state-space thought record used by the resident language layer. No duplicate Cynthia, duplicate Klein population, or replacement nervous system is introduced.

## v13 Purpose Fulfillment

Purpose is now first contact for an unfinished/new local profile. Cynthia records the person's own identity/purpose/current-state/destination/blocker/strength/interest answers locally, then reuses the **same** existing Human Design + astrology origin calculation. It does not calculate a second chart.

The first pathway combines what the person said with their existing Human Design Type, Strategy, Authority and Profile and turns it into a small next test plus an evidence-return loop. The result is phrased in ordinary language; Human Design remains part of the internal decision structure rather than being omitted.

Current v13 artifacts are documented in `CURRENT_BUILD.md` and Library `/Resonance Builds/CURRENT.txt`.
