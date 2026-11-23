# 0005 — HLS with pre-encoded segments; playlist as a pure function

- **Status:** Accepted, **pending the M0 discontinuity spike** · 2026-11-23

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
- **Risk:** frequent discontinuities between separately encoded AAC clips may produce audible gaps on some players. The M0 spike strings ~10 clips with discontinuities and tests them on hls.js, iOS and Android.
- No crossfades across clips. Fades are baked into clip edges. This is accepted as a quality trade-off.
- Adaptive bitrate (64/32 kbps renditions) is added in M7.
