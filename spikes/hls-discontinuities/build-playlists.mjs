// Joins the per-clip playlists into one VOD playlist with EXT-X-DISCONTINUITY between clips, and
// writes a manifest the live server uses to compute a sliding-window playlist.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'out';

function parseClip(dir, clip) {
  const text = readFileSync(join(dir, `c${clip}.m3u8`), 'utf8');
  const init = /#EXT-X-MAP:URI="([^"]+)"/.exec(text)?.[1] ?? null;
  const segments = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = /^#EXTINF:([\d.]+)/.exec(lines[i]);
    if (m) segments.push({ duration: Number(m[1]), uri: lines[i + 1].trim(), clip, init });
  }
  return segments;
}

for (const name of readdirSync(out).filter((d) => d.includes('-'))) {
  const dir = join(out, name);
  const clipCount = readdirSync(dir).filter((f) => /^c\d+\.m3u8$/.test(f)).length;
  const clips = Array.from({ length: clipCount }, (_, c) => parseClip(dir, c));
  const segments = clips.flat();
  const target = Math.ceil(Math.max(...segments.map((s) => s.duration)));

  const vod = [
    '#EXTM3U',
    '#EXT-X-VERSION:7',
    `#EXT-X-TARGETDURATION:${target}`,
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:VOD',
  ];
  clips.forEach((clipSegments, c) => {
    if (c > 0) vod.push('#EXT-X-DISCONTINUITY');
    if (clipSegments[0].init) vod.push(`#EXT-X-MAP:URI="${clipSegments[0].init}"`);
    for (const s of clipSegments) vod.push(`#EXTINF:${s.duration.toFixed(6)},`, s.uri);
  });
  vod.push('#EXT-X-ENDLIST', '');
  writeFileSync(join(dir, 'vod.m3u8'), vod.join('\n'));

  // Boundaries in playback time, for the analyzer.
  let t = 0;
  const boundaries = [];
  clips.forEach((clipSegments, c) => {
    if (c > 0) boundaries.push(Number(t.toFixed(3)));
    t += clipSegments.reduce((sum, s) => sum + s.duration, 0);
  });
  writeFileSync(
    join(dir, 'manifest.json'),
    JSON.stringify({ target, segments, boundaries, total: t }, null, 2),
  );
  console.log(
    `${name}: ${clipCount} clips, ${segments.length} segments, ${t.toFixed(2)}s, boundaries at ${boundaries.join(', ')}`,
  );
}
