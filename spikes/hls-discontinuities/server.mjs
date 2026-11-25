// Spike server (no dependencies). Serves the encoded clips, the player page, and a LIVE playlist
// computed the way playout will compute it: a pure function of (timeline, now).
//   /                         player page
//   /out/<variant>/vod.m3u8   static playlist, every clip boundary marked as a discontinuity
//   /live/<variant>.m3u8      sliding window over the looping timeline
//   /crash?seconds=12         simulates a playout crash: the live playlist stops updating, then
//                             resumes at "now" (what a new leader would publish)
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const HOST = process.env.HOST ?? '127.0.0.1';
const PORT = Number(process.env.PORT ?? 8090);
const WINDOW = 5; // segments in the live playlist
const root = import.meta.dirname;
const epoch = Date.now() - 30_000; // pretend the station has been on air for 30s
let frozenUntil = 0;
const lastPlaylist = new Map();

const manifests = new Map();
function manifest(variant) {
  if (!manifests.has(variant)) {
    const m = JSON.parse(readFileSync(join(root, 'out', variant, 'manifest.json'), 'utf8'));
    m.clipStart = m.segments.map((s, i) => i === 0 || s.clip !== m.segments[i - 1].clip);
    manifests.set(variant, m);
  }
  return manifests.get(variant);
}

// Global segment j loops over the clip list forever. Returns its start time and metadata.
function segmentAt(m, j) {
  const n = m.segments.length;
  const loop = Math.floor(j / n);
  const s = m.segments[j % n];
  const start = loop * m.total + m.segments.slice(0, j % n).reduce((t, x) => t + x.duration, 0);
  // Every clip start is a boundary, including the wrap from the last clip back to the first.
  return { ...s, start, clipStart: j > 0 && m.clipStart[j % n] };
}

function livePlaylist(variant, nowMs) {
  const m = manifest(variant);
  const elapsed = (nowMs - epoch) / 1000;
  // Live edge: only segments that have fully "aired" are published.
  let last = 0;
  while (segmentAt(m, last + 1).start + segmentAt(m, last + 1).duration <= elapsed) last++;
  const first = Math.max(0, last - WINDOW + 1);
  let discontinuities = 0;
  for (let j = 1; j <= first; j++) if (segmentAt(m, j).clipStart) discontinuities++;

  const lines = [
    '#EXTM3U',
    '#EXT-X-VERSION:7',
    `#EXT-X-TARGETDURATION:${m.target}`,
    `#EXT-X-MEDIA-SEQUENCE:${first}`,
    `#EXT-X-DISCONTINUITY-SEQUENCE:${discontinuities}`,
  ];
  for (let j = first; j <= last; j++) {
    const s = segmentAt(m, j);
    if (j > first && s.clipStart) lines.push('#EXT-X-DISCONTINUITY');
    if (s.init && (j === first || s.clipStart))
      lines.push(`#EXT-X-MAP:URI="/out/${variant}/${s.init}"`);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(epoch + s.start * 1000).toISOString()}`);
    lines.push(`#EXTINF:${s.duration.toFixed(6)},`, `/out/${variant}/${s.uri}`);
  }
  return lines.join('\n') + '\n';
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.m4s': 'video/iso.segment',
  '.mp4': 'video/mp4',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const live = /^\/live\/([\w-]+)\.m3u8$/.exec(url.pathname);
  if (url.pathname === '/crash') {
    frozenUntil = Date.now() + Number(url.searchParams.get('seconds') ?? 12) * 1000;
    res.end(`playlist frozen until ${new Date(frozenUntil).toISOString()}\n`);
    return;
  }
  if (live) {
    const variant = live[1];
    if (Date.now() >= frozenUntil || !lastPlaylist.has(variant)) {
      lastPlaylist.set(variant, livePlaylist(variant, Date.now()));
    }
    res.writeHead(200, { 'content-type': TYPES['.m3u8'], 'cache-control': 'no-store' });
    res.end(lastPlaylist.get(variant));
    return;
  }
  const rel =
    url.pathname === '/'
      ? 'player.html'
      : url.pathname === '/hls.js'
        ? 'node_modules/hls.js/dist/hls.min.js'
        : url.pathname.slice(1);
  const file = normalize(join(root, rel));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  res.end(readFileSync(file));
}).listen(PORT, HOST, () => console.log(`spike server: http://${HOST}:${PORT}/`));
