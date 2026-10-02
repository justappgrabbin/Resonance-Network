# Recovered Biverse / Synthia donor status

Canonical recovered artifact:

- `Stellar-Proximology-Sovereign-v0.1.0.zip`
- SHA-256 `75b50554f0b4f026802ea0b00bd1bb630bcf22bd51c0cd0bcaa3e50494733f56`

The recovered archive contains 700+ files across `human_design/`, `runtimes/isohuman/`, tests, source-learning data, web/API code, and cognition/mesh material.

Focused donor test run during the Android integration:

```text
python -m pytest -q \
  tests/test_geonatal.py \
  tests/test_bodygraph.py \
  tests/test_relationship.py \
  tests/test_timing.py
```

Result: 7 passed, 1 failed.

The failure is isolated to `test_render_bodygraph_svg_contains_expected_labels`: the fixture expects the Chinese type label `纯生产者` in the rendered SVG, while the current renderer emits another label. This is recorded here so future recovery does not silently turn the donor archive into a presumed-perfect source.

The Android integration does not depend on that SVG-label assertion to launch or calculate charts. It uses the recovered deterministic geonatal, Human Design, relationship, and timing rules while preserving the donor mismatch as an explicit repair item.
