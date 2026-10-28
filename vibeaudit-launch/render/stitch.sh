#!/usr/bin/env bash
# Stitch: HF-01 (0-2s) + Layer B (2-27.5s) + HF-02 with wordmark/URL alpha overlay (27.5-30s) + SFX.
# If the Higgsfield clips are not in assets/hf yet, writes a *_preview.mp4 with plain black bookends instead.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 render/make_sfx.py >/dev/null
# SFX stem at -14 LUFS (sparse SFX, so loudnorm may land ~1 LU under; true peak capped at -1 dBTP)
ffmpeg -y -loglevel error -i out/sfx_stem_raw.wav -af "loudnorm=I=-14:TP=-1:LRA=11" -ar 48000 -ac 2 out/sfx_stem.wav

for ar in 16x9 9x16; do
  if [ "$ar" = 16x9 ]; then W=1920; H=1080; else W=1080; H=1920; fi
  A1=assets/hf/hf01_open_$ar.mp4; A2=assets/hf/hf02_close_$ar.mp4
  OUT=out/vibeaudit_launch_$ar.mp4
  FIT="scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,fps=60,setsar=1,format=yuv420p"
  if [ -f "$A1" ] && [ -f "$A2" ]; then
    IN1=(-i "$A1"); IN3=(-i "$A2")
  else
    echo "[$ar] Higgsfield clips missing -> preview with black bookends"
    IN1=(-f lavfi -i "color=c=0x050507:s=${W}x${H}:r=60:d=2"); IN3=(-f lavfi -i "color=c=0x050507:s=${W}x${H}:r=60:d=2.5")
    OUT=out/vibeaudit_launch_${ar}_preview.mp4
  fi
  ffmpeg -y -loglevel error \
    "${IN1[@]}" -i out/layerB_$ar.mp4 "${IN3[@]}" -i out/overlay_$ar.mov -i out/sfx_stem.wav \
    -filter_complex "\
[0:v]trim=0:2,setpts=PTS-STARTPTS,$FIT[a];\
[1:v]trim=2:27.5,setpts=PTS-STARTPTS,fps=60,format=yuv420p[b];\
[2:v]trim=0:2.5,setpts=PTS-STARTPTS,$FIT[c0];\
[3:v]setpts=PTS-STARTPTS,fps=60,format=yuva420p[ov];\
[c0][ov]overlay=0:0:format=auto,format=yuv420p[c];\
[a][b][c]concat=n=3:v=1:a=0[v]" \
    -map "[v]" -map 4:a -c:v libx264 -preset slow -crf 16 -r 60 -pix_fmt yuv420p -c:a aac -b:a 192k -t 30 -movflags +faststart "$OUT"
  echo "wrote $OUT"
done
