"""Variant: fMP4 whose edit list tells the player to skip the encoder's 1024 priming samples.
ffmpeg's HLS muxer writes media_time 0; this copies a variant and patches each init segment."""
import shutil, struct, sys
from pathlib import Path

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
shutil.rmtree(dst, ignore_errors=True)
shutil.copytree(src, dst)
for init in sorted(dst.glob('c*_init.mp4')):
    data = bytearray(init.read_bytes())
    i = data.find(b'elst')
    assert i > 0 and data[i + 4] == 0, f'{init}: expected a version-0 elst'
    # version/flags(4) entry_count(4) segment_duration(4) media_time(4)
    struct.pack_into('>i', data, i + 16, 1024)
    init.write_bytes(data)
print(f'{dst}: edit lists patched to skip 1024 priming samples')
