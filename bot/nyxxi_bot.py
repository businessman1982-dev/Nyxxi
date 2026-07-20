import asyncio
import os
import time

from playwright.async_api import (
    async_playwright,
    Page,
    Frame,
    TimeoutError as PlaywrightTimeoutError,
)

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
PROFILE_DIR = os.path.abspath(os.environ.get("NYXXI_PROFILE_DIR", "./profile_data/edge_login"))

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


# --- Automation Logic ---

NEUTRALIZER_JS = """
(()=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>undefined});}catch(e){}
const bad=u=>{try{const L=String(u||'').toLowerCase();return L.startsWith('intent://')||L.startsWith('tiktok://')||
L.includes('open_in_app')||L.includes('applaunch')||L.includes('gotoapp');}catch(e){return false}};
const _open=window.open; window.open=(u,n,s)=>{if(bad(u))return null; return _open.apply(window,arguments)};
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]'); if(!a)return; const h=a.getAttribute('href')||''; if(bad(h)){e.preventDefault();e.stopPropagation();}},true);
window.addEventListener('load',()=>{ try{
  window.onbeforeunload = null;
  const noClose = ()=>{};
  const _close = window.close; window.close = noClose;
} catch(e){} }, {once:true});
})();
"""

# TikTok migrated web uploads from the old Creator Center to TikTok Studio.
# Try the current URL first, then fall back to the legacy one.
UPLOAD_URLS = [
    "https://www.tiktok.com/tiktokstudio/upload",
    "https://www.tiktok.com/creator-center/upload",
]

CAPTION_SELECTORS = [
    '[data-e2e="caption-editor"] div[contenteditable=true]',
    '[data-e2e="caption-input"] textarea',
    'div.public-DraftEditor-content[contenteditable=true]',
    'div[contenteditable=true]',
    'textarea[placeholder*="Describe"]',
]

FILE_INPUT_SELECTOR = "input[type='file']"


async def find_file_input(page: Page, timeout_ms: int = 60000):
    """Locate the upload <input type=file>, searching the main page and any iframes.

    The legacy uploader nested the input inside an iframe, so a plain
    page.wait_for_selector on the main frame silently times out. This checks
    every frame until the input appears or the timeout elapses.
    """
    deadline = time.monotonic() + timeout_ms / 1000.0
    while time.monotonic() < deadline:
        frames = [page.main_frame, *page.frames]
        seen = set()
        for frame in frames:
            if frame in seen:
                continue
            seen.add(frame)
            try:
                handle = await frame.query_selector(FILE_INPUT_SELECTOR)
            except Exception:
                continue
            if handle is not None:
                return handle
        await page.wait_for_timeout(1000)
    return None


async def fill_caption(page: Page, text: str) -> bool:
    if not text:
        return False

    print("[WAIT] Waiting for Caption editor...")
    editor = None
    for selector in CAPTION_SELECTORS:
        try:
            await page.wait_for_selector(selector, state="visible", timeout=15000)
            editor = selector
            break
        except PlaywrightTimeoutError:
            continue

    if editor is None:
        print("[WARN] Caption editor not found with any known selector.")
        return False

    try:
        await page.click(editor)
        await page.keyboard.press("Control+A")
        await page.keyboard.press("Backspace")
        await page.keyboard.type(text, delay=50)
        await page.wait_for_timeout(1000)
        print("[✍️] Caption inserted.")
        return True
    except Exception as e:
        print(f"[WARN] Caption error: {e}")
        return False


async def upload_video_full_flow(video_path: str, caption_text: str):
    if not video_path or not os.path.exists(video_path):
        print("[ERROR] Video file path invalid.")
        return

    print("[SETUP] Launching browser...")
    os.makedirs(PROFILE_DIR, exist_ok=True)

    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(
            PROFILE_DIR,
            channel="msedge",
            headless=False,
            args=[
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-blink-features=AutomationControlled",
            ],
            viewport={"width": 1400, "height": 900},
        )

        # Neutralize app-redirect tricks on every page/frame before any script runs.
        await ctx.add_init_script(NEUTRALIZER_JS)

        page = await ctx.new_page()

        navigated = False
        for upload_url in UPLOAD_URLS:
            print(f"[NAVIGATE] Going to {upload_url}")
            try:
                await page.goto(upload_url, wait_until="domcontentloaded", timeout=120000)
                await page.wait_for_timeout(3000)
                navigated = True
                break
            except PlaywrightTimeoutError:
                print(f"[WARN] Navigation to {upload_url} timed out, trying next...")
                continue

        if not navigated:
            print("[ERROR] Could not reach any TikTok upload page.")
            await ctx.close()
            return

        print("\n*** LOGIN / UPLOAD CHECK ***")
        file_input = await find_file_input(page, timeout_ms=60000)

        if file_input is None:
            print("[PAUSE] Login required or upload input missing.")
            input(
                "\n👉 Log in manually in the browser window, then press ENTER here "
                "in the terminal to continue..."
            )
            file_input = await find_file_input(page, timeout_ms=120000)

        if file_input is None:
            print("[ERROR] Upload input never appeared. Aborting.")
            await ctx.close()
            return

        print("[LOGIN] Page ready.")
        print(f"[UPLOAD] Uploading: {video_path}")
        await file_input.set_input_files(video_path)
        await page.wait_for_timeout(10000)

        await fill_caption(page, caption_text)

        print("\n--- READY FOR MANUAL POST ---")
        print("Review the post in the open browser and click 'Post'.")
        await page.wait_for_timeout(3600000)


if __name__ == "__main__":
    try:
        video_name, video_path = get_next_video_file(BASE_DIR)
        print(f"\n[INFO] Selected File: {video_name}")
        caption = get_next_static_caption(STATIC_POSTS)

        print("\n--- Caption ---")
        print(caption)
        print("----------------\n")

        asyncio.run(upload_video_full_flow(video_path, caption))
    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
