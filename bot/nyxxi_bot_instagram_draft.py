"""Park the next Instagram post as a draft. Never publishes.

Run from Command Prompt, in the folder that contains these scripts:

    python nyxxi_bot_instagram_draft.py

The script uses the same inbox and caption rotation as the other Nyxxi bots:
newest stable .mp4, moved into media_out, next caption from post_index.txt.
It writes that choice to drafts/pending_instagram.json with
status pending_approval, then stops.

It does not open a browser and it does not call Instagram or Composio.
"""

import json
import os
import sys
from datetime import datetime, timezone

from nyxxi_common import (
    BASE_DIR,
    STATIC_POSTS,
    get_next_static_caption,
    get_next_video_file,
    instagram_draft_path,
)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_draft(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("Draft file is not a JSON object.")
    return payload


def save_draft(path: str, payload: dict) -> None:
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)
    temporary = path + ".tmp"
    with open(temporary, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    os.replace(temporary, path)


def build_draft_payload(video_filename: str, video_path: str, caption: str, created_at: str | None = None) -> dict:
    payload = {
        "video_filename": video_filename,
        "video_path": os.path.abspath(video_path),
        "caption": caption,
        "created_at": created_at or utc_now(),
        "platform": "instagram",
        "status": "pending_approval",
        "published": False,
    }
    video_url = os.environ.get("NYXXI_VIDEO_URL", "").strip()
    if video_url:
        payload["video_url"] = video_url
    return payload


def print_draft_summary(path: str, payload: dict) -> None:
    print("")
    print("=" * 48)
    print("NYXXI INSTAGRAM DRAFT — NOTHING PUBLISHED")
    print("=" * 48)
    print(f"File chosen : {payload['video_filename']}")
    print(f"Video path  : {payload['video_path']}")
    print("Caption     :")
    print(payload["caption"])
    print("")
    print(f"Draft file  : {path}")
    print(f"Status      : {payload['status']}")
    print(f"Platform    : {payload['platform']}")
    print("")
    print("Nothing was published. No browser was opened.")
    print("No Instagram or Composio API was called.")
    print("")
    print("When you want this to go live, say yes in chat to Nyxxi Build.")
    print("To record that approval on this PC first, run:")
    print("  python nyxxi_bot_instagram_publish.py --i-approve-publish")
    print("That command still does not post. It only marks the draft approved.")
    print("=" * 48)
    print("")


def create_pending_draft() -> int:
    path = instagram_draft_path()
    if os.path.exists(path):
        try:
            existing = load_draft(path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"[STOPPED] A draft file is already at {path} but could not be read: {exc}")
            print("Nothing new was selected and nothing was published.")
            print("Fix or delete that file, then run this script again.")
            return 1
        print("[STOPPED] A draft is already waiting. Nothing new was selected.")
        print(f"Draft file : {path}")
        print(f"Status     : {existing.get('status', '(missing)')}")
        print(f"Video      : {existing.get('video_filename', '(missing)')}")
        print("Nothing was published.")
        print("Approve that draft, or delete the file to pick a different video.")
        return 1

    try:
        video_name, video_path = get_next_video_file(BASE_DIR)
    except OSError as exc:
        print(f"\n[FATAL ERROR] {exc}")
        return 1

    caption = get_next_static_caption(STATIC_POSTS)
    payload = build_draft_payload(video_name, video_path, caption)
    try:
        save_draft(path, payload)
    except OSError as exc:
        print(f"\n[FATAL ERROR] Could not write the draft: {exc}")
        print(f"The video was already moved to: {os.path.abspath(video_path)}")
        return 1

    print_draft_summary(os.path.abspath(path), payload)
    return 0


def main() -> int:
    return create_pending_draft()


if __name__ == "__main__":
    sys.exit(main())
