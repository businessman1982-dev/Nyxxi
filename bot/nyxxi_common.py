"""Shared media inbox and caption rotation for the Nyxxi posting scripts.

TikTok, Playwright Instagram, and the Instagram draft script all use this
module so a video is chosen and a caption is rotated the same way everywhere.

Behavior that must stay stable:
- get_next_video_file(base_dir) picks the newest .mp4, waits until the size
  stops changing, moves it into media_out, and returns (filename, path).
- get_next_static_caption(posts) rotates the six hardcoded captions and
  remembers the place in post_index.txt (NYXXI_INDEX_FILE).

Nothing in this module opens a browser or publishes a post.
"""

import os
import time

# --- Static Post Configuration ---

STATIC_POSTS = [
    {
        "media": "current_post_none.mp4",
        "caption": "Crown on, volume up. If you felt that bass, say less. 👑🔥",
        "hashtags": ["#Nyxxi", "#TwistedFlameRecords", "#AlienEnergy", "#ClubMode", "#FYP"],
    },
    {
        "media": "current_post_none.mp4",
        "caption": "Pressure makes diamonds—I stay under heat. 💎⚡️",
        "hashtags": ["#NyxxiBlaze", "#TwistedFlame", "#BossTalk", "#GlowUp", "#ForYou"],
    },
    {
        "media": "current_post_none.mp4",
        "caption": "Soft eyes, sharp smile—careful, I bite. 💋",
        "hashtags": ["#FlirtMode", "#Nyxxi", "#TwistedFlameRecords", "#Vibes", "#FYP"],
    },
    {
        "media": "current_post_none.mp4",
        "caption": "Not from here. That explains the frequency. 🛸",
        "hashtags": ["#AlienEnergy", "#SignalBoost", "#Nyxxi", "#ClubSignal", "#ForYou"],
    },
    {
        "media": "current_post_none.mp4",
        "caption": "Cue the lights—let the night do the talking. 🎉",
        "hashtags": ["#PartyStart", "#TwistedFlame", "#Nyxxi", "#NightMode", "#FYP"],
    },
    {
        "media": "current_post_none.mp4",
        "caption": "Power isn’t loud. It’s undeniable. ⚡️",
        "hashtags": ["#PowerMove", "#Nyxxi", "#TwistedFlameRecords", "#Unbothered", "#ForYou"],
    },
]

# --- Directories ---
# Override any of these with environment variables so the bot is portable and
# testable outside the original Windows machine.

BASE_DIR = os.environ.get(
    "NYXXI_MEDIA_INBOX",
    r"C:\Users\reneg\OneDrive\Desktop\nyxxi_bot.ok\media_inbox",
)
MEDIA_OUT_DIR = os.environ.get(
    "NYXXI_MEDIA_OUT",
    os.path.join(os.path.dirname(BASE_DIR), "media_out"),
)
INDEX_FILE = os.environ.get("NYXXI_INDEX_FILE", "post_index.txt")

# --- Persistence Functions ---


def get_current_index():
    if not os.path.exists(INDEX_FILE):
        return 0
    try:
        with open(INDEX_FILE, "r") as f:
            return int(f.read().strip())
    except Exception:
        return 0


def set_current_index(index: int):
    try:
        with open(INDEX_FILE, "w") as f:
            f.write(str(index))
    except Exception as e:
        print(f"[ERROR] Could not write index: {e}")


def get_next_static_caption(posts: list) -> str:
    if not posts:
        return ""
    current_index = get_current_index()
    num_posts = len(posts)
    # Guard against the index file drifting out of range (e.g. posts list shrank).
    current_index %= num_posts
    next_index = (current_index + 1) % num_posts

    post_data = posts[current_index]
    set_current_index(next_index)

    caption = post_data["caption"]
    hashtags = " ".join(post_data["hashtags"])

    print(f"[PERSISTENCE] Selected Post Index: {current_index} / {num_posts - 1}")
    return f"{caption}\n{hashtags}"


# --- File Management ---


def ensure_media_out_dir_exists():
    if not os.path.exists(MEDIA_OUT_DIR):
        os.makedirs(MEDIA_OUT_DIR)


def move_video_to_media_out(filename: str, source_path: str):
    try:
        ensure_media_out_dir_exists()
        destination_path = os.path.join(MEDIA_OUT_DIR, filename)
        os.replace(source_path, destination_path)
        print(f"[MOVE] Moved to media_out: {destination_path}")
        return destination_path
    except Exception as e:
        print(f"[ERROR] Move failed: {e}")
        return source_path


def get_next_video_file(base_dir: str):
    print(f"[SCAN] Scanning directory: {base_dir}")
    all_files = [
        os.path.join(base_dir, f)
        for f in os.listdir(base_dir)
        if f.lower().endswith(".mp4") and os.path.isfile(os.path.join(base_dir, f))
    ]
    all_files.sort(key=os.path.getmtime, reverse=True)

    if not all_files:
        raise FileNotFoundError(f"No .mp4 files found in: {base_dir}")

    for full_path in all_files:
        filename = os.path.basename(full_path)
        time.sleep(2)

        # Wait until the file size stops changing so we do not grab a
        # video that is still being written/copied into the inbox.
        initial_size = -1
        for i in range(10):
            try:
                current_size = os.path.getsize(full_path)
                if i > 0 and current_size == initial_size and current_size > 0:
                    moved_path = move_video_to_media_out(filename, full_path)
                    return filename, moved_path
                initial_size = current_size
                time.sleep(1)
            except FileNotFoundError:
                break
            except Exception:
                time.sleep(1)
                continue

    raise FileNotFoundError(f"No stable .mp4 video found in: {base_dir}")


def instagram_draft_path() -> str:
    """Path of the single pending Instagram draft JSON.

    Default is drafts/pending_instagram.json next to media_out. On the
    standard Windows layout that folder sits beside media_inbox. Override
    with NYXXI_DRAFT_FILE.
    """
    override = os.environ.get("NYXXI_DRAFT_FILE")
    if override:
        return os.path.abspath(override)
    parent = os.path.dirname(os.path.abspath(MEDIA_OUT_DIR))
    return os.path.join(parent, "drafts", "pending_instagram.json")
