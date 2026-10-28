#!/usr/bin/env bash
# Generates the four HyperFrames entry files from template/index.html (single source of markup).
set -euo pipefail
cd "$(dirname "$0")/../template"
mk() { # name ar mode w h dur
  sed -e "s/ar: \"16x9\", mode: \"main\"/ar: \"$2\", mode: \"$3\"/" \
      -e "s/data-ar=\"16x9\"/data-ar=\"$2\"/" \
      -e "s/width=1920, height=1080/width=$4, height=$5/" \
      -e "s/data-duration=\"30\" data-width=\"1920\" data-height=\"1080\"/data-duration=\"$6\" data-width=\"$4\" data-height=\"$5\"/" \
      index.html > "$1"
}
mk main_16x9.html    16x9 main    1920 1080 30
mk main_9x16.html    9x16 main    1080 1920 30
mk overlay_16x9.html 16x9 overlay 1920 1080 2.5
mk overlay_9x16.html 9x16 overlay 1080 1920 2.5
echo "entries built"
