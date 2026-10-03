# Resonance v13 build handoff

This folder is the GitHub-side recovery point for the current Resonance v13 integrated app.

## Canonical integrated artifact

The complete integrated v13 artifact is:

- `Synthia-Resonance-Computer-Integrated-v13.html`
- SHA-256: `a0666009a22eefac5854cb1d6bcfb2378ba9902116292fe0671d0625b78811d3`

The current GitHub connector can commit source/text files but cannot upload arbitrary binary/release assets from the ChatGPT working container, so the 4.5 MB integrated HTML and York ZIP are not duplicated into this repository by this handoff.

The canonical executable source currently remains in ChatGPT Library `/Resonance Builds`. The repository contains the native source changes, the runtime documentation, this exact hash, and the York build script.

## Source branch

`synthia-live-vertical-slice-2026-10-02`

Current Purpose/runtime source:
- `Core/PurposeStore.js`
- `Core/PurposeEngine.js`
- `PurposeScreens.js`
- `ProfileScreens.js`
- `App.js`
- `PURPOSE_FULFILLMENT.md`
- `CURRENT_BUILD.md`
- `LIVE_RESIDENT.md`

PR: #2

## What v13 preserves

v13 was merged on top of the latest v12 state-space/Klein communication recovery. The seven ATO/Klein state-space modules and latest v12 Foundation module are preserved byte-for-byte. The integrated v13 artifact contains 223 embedded JavaScript modules and all 223 parse successfully.

## Build to APK

Use `scripts/build-resonance-v13-termux.sh` with:
1. the exact integrated v13 HTML above;
2. an installed York compiler at `~/.synthia-anyfile-builder`, or `Synthia-Foolproof-Compile-Ready*.zip` in Android Downloads.

The script verifies the exact HTML hash before compilation and builds from a disposable York copy.

## Next release gate

Do not call v13 shipped until:
1. an APK is produced from the exact hash above;
2. APK installs on the target Android device;
3. first launch reaches Cynthia Purpose intake;
4. profile calculation returns to Purpose and creates a pathway;
5. existing Human Design, Astrology, Cynthia, Network, Work and Agentic Reality still open;
6. local state survives app restart.

After that, merge PR #2 and create the public v13 release.
