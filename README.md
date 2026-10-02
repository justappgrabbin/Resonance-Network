# Resonance Network

Resonance Network is the sovereign local computer for the Stellar Proximology / Cynthia system.

The Android app is deliberately local-first: the user profile, deterministic chart calculations, relationship/timing tools, Cynthia trajectory state, and capability registry live in the app. The hosted Stellar site and ChatGPT MCP plugin are optional adapters, not the source of truth.

## Canonical branch

Use `stellar-proximology` for the current integrated Android build.

Read these first:

- `ARCHITECTURE.md` — product law, runtime boundaries, donor map, recovery procedure
- `BUILD_ACCEPTANCE.md` — what counts as a real Android build
- `stellar-proximology/canonical-manifest.json` — release/adaptor hashes and canonical endpoints
- `stellar-proximology/README.md` — Stellar-facing recovery notes

## Run locally

```bash
npm install --legacy-peer-deps
npm start
```

## Build Android

GitHub Actions workflow: `.github/workflows/android-apk.yml`

The workflow builds `assembleRelease`, checks for the embedded React Native bundle, installs the APK in an emulator, walks the primary screens, verifies profile persistence after process restart, and uploads the APK plus smoke evidence.

## Current calculation stack

- `Core/AstroEngine.js` — recovered IsoHuman geonatal rules using `astronomy-engine`
- `Core/HumanDesignEngine.js` — gate/line/color/tone/base, design date, channels, centers, type, authority, definition
- `Core/ConsciousnessEngine.js` — shared local profile + field/resonance layer
- `Core/RelationshipEngine.js` — recovered relationship delta semantics + deterministic composite union
- `Core/TimingEngine.js` — recovered timing/transit delta semantics
- `Core/ProfileStore.js` — persistent local profiles + portable bundle format
- `Core/TrajectoryStore.js` — append-only local Cynthia continuity events
- `Core/CapabilityRegistry.js` — executable capabilities and optional adapters

No live calculation path should use random chart values or generated sample people.
