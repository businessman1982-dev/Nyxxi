#!/usr/bin/env bash
# Layer B via HyperFrames: full 30s timelines (bookend ranges black) + alpha overlays for HF-02.
set -euo pipefail
cd "$(dirname "$0")/.."
export HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_TELEMETRY=0
./render/build_entries.sh
HF="npx -y hyperframes@0.8.210"
for ar in 16x9 9x16; do
  $HF render template -c main_$ar.html    -f 60 --crf 14 -o out/layerB_$ar.mp4 --quiet
  $HF render template -c overlay_$ar.html -f 60 --format mov -o out/overlay_$ar.mov --quiet
done
echo DONE
