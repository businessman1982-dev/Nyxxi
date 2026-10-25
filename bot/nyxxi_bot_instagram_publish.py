"""Record owner approval for the pending Instagram draft. Does not publish.

Refuses unless the owner deliberately opts in:

    python nyxxi_bot_instagram_publish.py --i-approve-publish

or:

    set NYXXI_CONFIRM_PUBLISH=1
    python nyxxi_bot_instagram_publish.py

That opt-in only changes the draft status from pending_approval to approved.
It does not open a browser, and it does not call Instagram or Composio.
This file has no Composio SDK wired in. Do not add tokens here.

Live publish path for Twisted Flame, after the owner says yes in chat to
Nyxxi Build (Nyxxi Build makes the calls; this script does not):

    1. INSTAGRAM_POST_IG_USER_MEDIA
    2. INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH

against ig_user_id 27944815738476357 (@nyxxi_blaze).

The Instagram Graph API cannot read a video sitting on this PC. The file has
to be a public HTTPS URL, or a Composio video_file s3key. Getting that URL
is an ops step for Nyxxi Build, not something this script uploads.
"""

import argparse
import json
import os
import sys

from nyxxi_bot_instagram_draft import load_draft, save_draft, utc_now
from nyxxi_common import instagram_draft_path

# Connected Instagram professional account. This id is not a secret.
# Nyxxi Build passes it to the Composio tools named above.
IG_USER_ID = "27944815738476357"
IG_USERNAME = "nyxxi_blaze"
COMPOSIO_CREATE_MEDIA = "INSTAGRAM_POST_IG_USER_MEDIA"
COMPOSIO_PUBLISH_MEDIA = "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Record approval of the pending Instagram draft. Does not publish."
    )
    parser.add_argument(
        "--i-approve-publish",
        action="store_true",
        help="Owner explicitly approves the pending draft. Still does not post.",
    )
    return parser.parse_args(argv)


def approval_granted(args: argparse.Namespace) -> bool:
    # Only the exact value 1 counts, same rule as NYXXI_AUTO_SHARE.
    env_yes = os.environ.get("NYXXI_CONFIRM_PUBLISH", "0") == "1"
    return bool(args.i_approve_publish or env_yes)


def print_refused(path: str, status: str) -> None:
    print("")
    print("[REFUSED] Not publishing.")
    print("")
    print(f"Draft file : {path}")
    print(f"Status     : {status}")
    print("")
    print("This script does not post to Instagram, open a browser, or call Composio.")
    print("To record your approval, either run:")
    print("  python nyxxi_bot_instagram_publish.py --i-approve-publish")
    print("or:")
    print("  set NYXXI_CONFIRM_PUBLISH=1")
    print("  python nyxxi_bot_instagram_publish.py")
    print("")
    print("Approval only marks the draft. The live post is made when you say")
    print("yes in chat to Nyxxi Build, which uses the Composio Instagram Graph API.")
    print("Close the Command Prompt window when you are done so")
    print("NYXXI_CONFIRM_PUBLISH does not stay set for a later command.")
    print("")


def print_handoff(path: str, payload: dict) -> None:
    video_url = payload.get("video_url") or "(none yet)"
    print("")
    print("=" * 48)
    print("NYXXI INSTAGRAM — APPROVED, NOT PUBLISHED")
    print("=" * 48)
    print(f"Draft file  : {path}")
    print(f"Status      : {payload.get('status')}")
    print(f"File chosen : {payload.get('video_filename')}")
    print(f"Video path  : {payload.get('video_path')}")
    print(f"Video URL   : {video_url}")
    print("Caption     :")
    print(payload.get("caption", ""))
    print("")
    print("Nothing was published. This script did not call Instagram or Composio.")
    print("")
    print("Live publish path (Nyxxi Build, after you say yes in chat):")
    print(f"  1. {COMPOSIO_CREATE_MEDIA}")
    print(f"  2. {COMPOSIO_PUBLISH_MEDIA}")
    print(f"  ig_user_id : {IG_USER_ID}")
    print(f"  account    : @{IG_USERNAME}")
    print("")
    print("Graph API needs the video as a public HTTPS URL, or as a Composio")
    print("video_file s3key. The path on this PC is not enough. That upload")
    print("is an ops step for Nyxxi Build.")
    print("=" * 48)
    print("")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    path = instagram_draft_path()
    granted = approval_granted(args)

    if not os.path.exists(path):
        print(f"[REFUSED] No draft file at {path}")
        print("Run python nyxxi_bot_instagram_draft.py first. Nothing was published.")
        return 1

    try:
        payload = load_draft(path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"[REFUSED] Could not read draft {path}: {exc}")
        print("Nothing was published.")
        return 1

    status = str(payload.get("status", ""))
    if payload.get("platform") != "instagram":
        print(f"[REFUSED] Draft platform is {payload.get('platform')!r}, expected 'instagram'.")
        print("Nothing was published and the file was not changed.")
        return 1

    if not granted:
        print_refused(os.path.abspath(path), status or "(missing)")
        return 1

    if status == "approved":
        print_handoff(os.path.abspath(path), payload)
        print("This draft was already approved. It was left unchanged.")
        return 0

    if status != "pending_approval":
        print(f"[REFUSED] Draft status is {status or '(missing)'}.")
        print("Expected pending_approval. Nothing was published and the file was not changed.")
        return 1

    missing = [
        key
        for key in ("video_filename", "video_path", "caption", "created_at")
        if not payload.get(key)
    ]
    if missing:
        print("[REFUSED] Draft is missing: " + ", ".join(missing))
        print("Nothing was published and the file was not changed.")
        return 1

    video_url = os.environ.get("NYXXI_VIDEO_URL", "").strip()
    if video_url and not payload.get("video_url"):
        payload["video_url"] = video_url

    payload["status"] = "approved"
    payload["approved_at"] = utc_now()
    payload["published"] = False
    payload["ig_user_id"] = IG_USER_ID
    payload["ig_username"] = IG_USERNAME
    try:
        save_draft(path, payload)
    except OSError as exc:
        print(f"[FATAL ERROR] Could not update draft: {exc}")
        print("Nothing was published.")
        return 1

    print_handoff(os.path.abspath(path), payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
