# Spike findings — HLS discontinuities between separately encoded clips

**Question (ADR 0005):** if workers encode each clip to AAC separately and playout joins them with
`EXT-X-DISCONTINUITY`, are the boundaries audible? If yes, fall back to B1 (live encoding).
**Date:** 2026-11-24/25. **Verdict: ADR 0005 holds, with constraints.**

## Setup
- 10 clips per set, each encoded separately: 48 kHz mono AAC-LC 64 kbps (ffmpeg 9.0.2 native `aac`).
  - `speech`: macOS `say`, converted to Kokoro's output format (24 kHz mono), 10 ms fades at the edges.
  - `tone`: a continuous 440 Hz sine, no fades: the worst case, where any gap is audible and measurable.
- Segment formats: MPEG-TS and fMP4. Playlists: VOD with a discontinuity per boundary, and a live
  sliding window computed as `f(timeline, now)` (media sequence, discontinuity sequence,
  `PROGRAM-DATE-TIME`, `EXT-X-MAP` per clip).
- Run: `./generate.sh && node server.mjs`, open http://127.0.0.1:8090/.

## Results

| Player | Tone (worst case) | Speech (realistic) |
|---|---|---|
| hls.js 1.7.4, Chrome 156 (macOS) | Measured: silence at **every** boundary, 2–40 ms, mean ≈ 25 ms. Identical for TS and fMP4 (hls.js remuxes TS to fMP4). | Engineer listened: **no audible gaps or clicks** |
| Safari 26.6 native (AVFoundation, macOS) | Engineer listened: small gaps audible at boundaries (Safari doesn't expose HLS audio to Web Audio, so not measurable in-page) | Engineer listened: **no audible gaps or clicks** |

Live playlist (hls.js, 64 s): no errors, no stalls after startup, position tracked wall-clock time.
**Simulated playout crash** (playlist frozen 12 s, then resumed at "now"): no audible effect; the
client buffer covered it. This is ADR 0005's failover budget, observed.

## Why the gaps exist
- Every separately encoded AAC stream starts with **1024 priming samples** (21.3 ms at 48 kHz) and
  pads its last frame to 1024 samples (0–21.3 ms). EXTINF durations include both.
- **hls.js ignores edit lists** (no `elst` handling in 1.7.4), so it plays priming and padding as silence.
- ffmpeg's HLS muxer writes `elst media_time 0`, so nothing signals the priming.
- AVFoundation's decoder trims priming itself, but decodes ~44 ms less audio than EXTINF claims
  (3.277 s vs 3.321 s for one clip), so the timeline still has a hole at each boundary.
- Padding clips to whole AAC frames doesn't help: it makes the same silence explicit.

## Tried and not resolved
- Hand-patching the fMP4 edit list to skip 1024 samples: AVFoundation decodes the file correctly
  outside HLS (priming skipped exactly), but **Safari's HLS player then plays nothing**. A correct
  version likely needs a proper `elst` duration or Apple's packager. Not needed for speech; revisit
  only if continuous audio across clips becomes a requirement.

## Constraints for production (go into ADR 0005)
1. **Clip boundaries only at natural pauses** (between lines and segments), with fades baked into clip edges.
2. **No continuous audio across a boundary.** Music beds under speech are mixed into the clip at
   production time; filler tracks are separate clips with their own fades. Ad-libs are inserted
   between lines, never mid-sentence.
3. Budget ~20–40 ms of silence per boundary in timeline math; it is inaudible at speech pauses.
4. TS and fMP4 behave the same here. Prefer fMP4 (CMAF, `EXT-X-MAP`): it is the format current
   HLS tooling and Low-Latency HLS build on.

## Not tested (limitations)
- **A real iPhone** (iOS Safari / AVPlayer) and **Android** (Chrome uses hls.js, measured above;
  ExoPlayer for the future React Native app is untested). The iOS simulator had no UI in this
  Xcode install, and Android Chrome's first run requires accepting Google's terms.
- Network switches on mobile, and long sessions (hours) of live playback.
- Kokoro output itself (no TTS key yet; the format was matched instead).
