# Live resident vertical slice

This branch preserves the normal Resonance Network pages and adds a contact doorway to the local Synthia residence.

## Current behavior

- Resonance does **not** instantiate a second Cynthia.
- The Cynthia screen probes the local resident at `127.0.0.1:6969`.
- **Text** opens the resident's real conversation surface.
- **Peek** opens the resident's real living-world / Morph Game surface.
- If the residence is not running, Resonance reports that honestly instead of substituting canned replies.
- Voice and video controls are shown as not-yet-wired media bridges; they are intentionally not fake-active.

## Resident paired with this branch

Use the tested R21.22 Synthia Autopoietic Assembly. Its verification currently passes the Morph Game wiring smoke, public-shell smoke, WebView boot graph (178 statically reachable modules with zero Node-only imports), and Resonance/Pathways smoke.

## Next integration

Embed the resident surface in the computer shell rather than handing off to the browser, then add real audio/video media channels. The resident identity and live state remain singular across the normal pages and embodied world.
