# Current Resonance app build

Current artifact generation: **v13**

- Integrated app: `Synthia-Resonance-Computer-Integrated-v13.html`
- SHA-256: `a0666009a22eefac5854cb1d6bcfb2378ba9902116292fe0671d0625b78811d3`
- York kit: `Synthia-Resonance-Computer-York-Kit-v13.zip`
- SHA-256: `b7deb345d0cca1788764bf7734af0be24b734954b2612d5e779329a316e3742b`
- Persistent destination: ChatGPT Library `/Resonance Builds`
- Resonance PR: #2
- Optional peer signaling: `justappgrabbin/Synthia-server` PR #13 (draft; CI green; not yet claimed deployed)

## v13 is a merge, not a replacement

v13 is built from the **latest canonical v12** and keeps its state-space / communication recovery intact.

Between latest v12 and v13:
- the import map still contains **223 embedded JavaScript modules**;
- the seven `synthia/vendor/ato-klein-state/*` modules are byte-for-byte preserved;
- the latest v12 `synthia/src/foundation.mjs` is byte-for-byte preserved (SHA-256 `b9c28f76644a28024f538e1998548763bcd9e3a225c3419af25f026ef8cb11e0`);
- only `synthia/src/desktop-app.mjs` changes in the import map, to add Purpose Fulfillment / first contact.

## v12 nervous-system / communication recovery retained

The current Foundation, execution spine, Pure-Synthia mesh, ATO, Tool Factory, swarm, world, social network and existing Klein tool population remain in place.

The supplied ATO/Klein state-space remains read-only relationship/content authority for Gate/GLCTB vectors, gate content and structural association. Conversation thought records still carry the actual state-space address, five-dimensional state, Foundation 5W/process-language results, existing Klein contact stages, tool/state relations and I Ching Grammar interpretation. The resident language layer continues reading that landed record.

## v13 Purpose Fulfillment

First-time entry now opens Cynthia's Purpose conversation before the menu.

Cynthia asks about:
- name;
- origin / what shaped the person;
- current self-understanding;
- purpose (including `I don't know`);
- present life;
- desired life;
- happiness / dissatisfaction;
- blockers;
- strengths;
- recurring interests.

Those answers persist locally as `resonance:purpose` and are best-effort landed into the **same Foundation journal**. This is pathway state for the existing Cynthia, not a second chatbot.

When the intake is complete:
- if an origin/profile calculation already exists, Purpose reuses it;
- otherwise Cynthia routes to the existing Profile calculation once;
- the existing `consciousness.calculateProfile` path remains the single Human Design + astrology calculation;
- Purpose does **not** introduce a second chart engine.

The initial pathway is `Discover`, `Unblock`, or `Experiment` based on what the person actually said, then informed by the saved Human Design **Type, Strategy, Authority and Profile**. The user-facing result is ordinary language: current state, desired state, friction, design lens, next move, decision check, and what evidence to bring back from reality.

The intended loop is:

`possibility -> action -> observed outcome -> discrepancy/evidence -> next pathway`

## Preserved app surfaces

Home / Purpose / Profile / Human Design / Astrology / Cynthia / Network / Work remain available, along with Text, Peek, Voice, Video, Agentic Reality, Live Morph, preserved House, authorized work, social projects/openings/invitations, portable packets and optional P2P direct messaging.

## Verification

- **223 / 223 embedded JavaScript modules parse cleanly**.
- v13 York ZIP integrity passes.
- York wrapper passes shell syntax validation and verifies the exact v13 HTML hash before Android compilation.
- Android `INTERNET` + `RECORD_AUDIO` wrapper patches are retained.
- The native React Native source branch also contains the Purpose store, engine, screens, return-to-Purpose profile flow and Purpose-first entry/home integration.

## Still not claimed

- A v13 APK has not been compiled in this environment because the York Android compiler is not installed here; the v13 York kit packages the exact verified source on the Android/Termux York setup.
- continuous execution after Android fully suspends/kills the process;
- four finished ModelInterface model-maker outputs mounted;
- user-camera video;
- exact lower-substructure -> visible phenotype laws.
