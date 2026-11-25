#!/usr/bin/env bash
# Spike (ADR 0005): build ~10 separately encoded clips and join them with EXT-X-DISCONTINUITY.
# Two clip sets:
#   speech - realistic: macOS `say`, converted to Kokoro's output format (24 kHz mono) with
#            10 ms fades baked into the edges, as production would do.
#   tone   - worst case: a continuous 440 Hz sine in every clip, no fades, durations that are
#            not multiples of the AAC frame (1024 samples). Any boundary gap or click is audible
#            and measurable.
# Each set is encoded per clip (as workers would) into two segment formats: mpegts and fmp4.
set -euo pipefail
cd "$(dirname "$0")"
OUT=out
rm -rf "$OUT" && mkdir -p "$OUT/src"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

LINES=(
  "Good morning, and welcome to A.I. Radio."
  "Today we are talking about rhythm, and why some songs feel off balance."
  "Most pop music counts in four. Count with me: one, two, three, four."
  "But some of the most memorable songs count in five, or even seven."
  "Here is a question from a listener in Lisbon."
  "Why do odd time signatures feel like they are stumbling forward?"
  "Because your brain keeps predicting a beat that never arrives."
  "That small surprise is exactly what keeps you listening."
  "After the break, we look at the mathematics behind it."
  "Stay with us. This is A.I. Radio, always interesting."
)
VOICES=(Samantha Daniel)
TONE_SECONDS=(3.3 4.7 5.1 2.9 6.4 3.8 4.2 5.6 3.1 4.9)

for i in "${!LINES[@]}"; do
  say -v "${VOICES[$((i % 2))]}" -o "$OUT/src/speech$i.aiff" "${LINES[$i]}"
  ff -i "$OUT/src/speech$i.aiff" -ar 24000 -ac 1 \
    -af "afade=t=in:d=0.01,areverse,afade=t=in:d=0.01,areverse" "$OUT/src/speech$i.wav"
  ff -f lavfi -i "sine=frequency=440:sample_rate=24000:duration=${TONE_SECONDS[$i]}" \
    -af "volume=0.5" -ac 1 "$OUT/src/tone$i.wav"
  # Mitigation: pad to a whole number of AAC frames (1024 samples at 48 kHz = 512 at 24 kHz), so
  # the encoder adds no end padding. Only the 1024-sample priming at the start remains.
  samples=$(ffprobe -v error -show_entries stream=duration_ts -of csv=p=0 "$OUT/src/tone$i.wav")
  ff -i "$OUT/src/tone$i.wav" -af "apad=whole_len=$(( (samples + 511) / 512 * 512 ))" "$OUT/src/tonealigned$i.wav"
done

for set in speech tone tonealigned; do
  for type in mpegts fmp4; do
    dir="$OUT/$set-$type"
    mkdir -p "$dir"
    ext=ts
    extra=()
    if [ "$type" = fmp4 ]; then ext=m4s; fi
    for i in "${!LINES[@]}"; do
      if [ "$type" = fmp4 ]; then extra=(-hls_fmp4_init_filename "c${i}_init.mp4"); fi
      # 48 kHz mono AAC-LC 64 kbps: the production target format.
      ff -i "$OUT/src/$set$i.wav" -ar 48000 -ac 1 -c:a aac -b:a 64k \
        -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_type "$type" ${extra[@]+"${extra[@]}"} \
        -hls_segment_filename "$dir/c${i}_%02d.$ext" "$dir/c$i.m3u8"
    done
  done
done

node build-playlists.mjs "$OUT"
echo "done: $OUT"
