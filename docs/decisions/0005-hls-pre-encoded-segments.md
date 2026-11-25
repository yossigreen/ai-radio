# 0005 — HLS with pre-encoded segments; playlist as a pure function

- **Status:** Accepted · 2026-11-23. **Validated by the M0 spike, with constraints** · 2026-11-25

## Context
One shared stream, joinable at any time. Hard show start times. A Q&A segment that's ready only about a minute before air. Listener latency of 10–30s is acceptable. Must scale cheaply and play on web, iOS and Android, including network switches on mobile.

## Decision
**HLS** delivered through object storage and a CDN.
- **Workers pre-encode** audio into HLS segments at production time: the episode body by T−6h, the Q&A at minute 24, live ad-libs seconds ahead (M4).
- **Playout only publishes the live playlist**, recomputed every ~6s as a **pure function of (timeline, now)**. Consequences of that:
  - Crash recovery is "recompute for now". The media sequence continues, with `EXT-X-DISCONTINUITY` where needed.
  - Two concurrent playout instances write identical playlists, so split brain is harmless. **Correctness comes from idempotency; the lock only prevents waste.**
- **Publish the data before the pointer:** a segment must exist in storage before any playlist references it.
- **Cache policy:** segments are immutable (long TTL); the playlist gets ~1–2s.
- `EXT-X-PROGRAM-DATE-TIME` lets clients sync "now playing" with what they actually hear.
- **Failover budget:** playout must resume publishing within the client buffer (~18s).

## Alternatives
- **B1 — live encoding in playout** (PCM → long-running ffmpeg → segments): seamless joins and crossfades, but encoding sits in the real-time path. **This is the fallback if the spike fails.**
- **Icecast + Liquidsoap:** not CDN-friendly, and the playout logic (the learning objective) would be delegated to Liquidsoap.
- **WebRTC (LiveKit):** sub-second latency is unnecessary for one-to-many broadcast and expensive at scale. Reserved for live participants (Part 6 of the brief).

## Consequences
- **Risk (tested):** separately encoded AAC clips leave ~20–40 ms of silence at each boundary (encoder priming and frame padding; neither hls.js nor AVFoundation removes it). See the spike result below.
- No crossfades across clips. Fades are baked into clip edges. This is accepted as a quality trade-off.
- Adaptive bitrate (64/32 kbps renditions) is added in M7.

## Spike result (M0, 2026-11-25)
Ten separately encoded clips joined with `EXT-X-DISCONTINUITY`, as VOD and as a live window computed
from (timeline, now). Evidence and method: branch `spike/hls-discontinuities`,
`spikes/hls-discontinuities/FINDINGS.md`.
- **Speech with faded edges: no audible gaps or clicks** on hls.js (Chrome) or Safari's native player.
- A continuous tone across boundaries: gaps measured at 2–40 ms on hls.js and audible on Safari.
- Live window, discontinuity sequence and a 12 s playout freeze: played through without stalls.

**Constraints that follow:**
1. Clip boundaries only at natural pauses (between lines and segments), with fades baked into edges.
2. No continuous audio across a boundary: music beds are mixed into the clip at production time,
   and ad-libs (M4) go between lines, never mid-sentence.
3. fMP4 segments (CMAF, `EXT-X-MAP`) rather than MPEG-TS; both behaved the same.

**Not yet verified:** a real iPhone, Android's ExoPlayer (React Native, later), mobile network
switches, and multi-hour live sessions. These are checked at M2 (first deploy), before listeners.
