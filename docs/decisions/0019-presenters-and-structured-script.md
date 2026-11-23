# 0019 — Station-wide presenters and a structured script

- **Status:** Accepted · 2026-11-23

## Decision
- **`Presenter` is a station-wide entity:** name, persona, editorial style, and a voice for each TTS provider (for example `{kokoro_hosted: "af_heart", kokoro_local: "af_heart"}`). Shows are assigned 1–2 presenters; two hosts is the default format.
- **Personas are versioned prompts.** A change is evaluated before it reaches air. Each episode records the persona version it was produced with.
- **The script is structured data,** not free text. Each line is `{segment_id, speaker_id, text, citations[]}`, validated against a schema. This enables:
  - TTS line by line with the right voice (Kokoro has no native dialogue).
  - Checking each line on its own.
  - Regenerating part of a script.
  - Later, live turns (each line becomes a turn).
- **AI disclosure:** presenters are labeled as AI in the product, and a recurring on-air station segment says so.
- **No voice cloning.** Only the TTS model's built-in voices.

## Alternatives
- **Per-show presenters:** no recurring station talent.
- **Generated per episode:** no identity for listeners and no stable eval baseline.
