#!/usr/bin/env bash
# Download the four Higgsfield bookend clips (needs d8j0ntlcm91z4.cloudfront.net allowed in the network policy).
set -euo pipefail
cd "$(dirname "$0")/../assets/hf"
B=https://d8j0ntlcm91z4.cloudfront.net/user_39H3pkH44GuQEH90b3WnauxDUy3
curl -fsS -o hf01_open_16x9.mp4  $B/hf_20261028_094625_13fc7b3e-d791-424c-bc37-f47aaff69ec3.mp4
curl -fsS -o hf01_open_9x16.mp4  $B/hf_20261028_094625_b58157e6-bed3-4cc7-ba8d-d584390da70e.mp4
curl -fsS -o hf02_close_16x9.mp4 $B/hf_20261028_094625_1f4b435a-7ba0-49cf-aea0-133285c00e6d.mp4
curl -fsS -o hf02_close_9x16.mp4  $B/hf_20261028_094625_8a09de24-2741-4aff-ab1d-f06d757c0505.mp4
ls -la *.mp4
