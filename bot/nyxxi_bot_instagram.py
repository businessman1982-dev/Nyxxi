import asyncio
import os
import time

from playwright.async_api import (
    async_playwright,
    Page,
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
# Override any of these with environment variables so the bot is portable.

BASE_DIR = os.environ.get(
    "NYXXI_MEDIA_INBOX",
    r"C:\Users\reneg\OneDrive\Desktop\nyxxi_bot.ok\media_inbox",
)
MEDIA_OUT_DIR = os.environ.get(
    "NYXXI_MEDIA_OUT",
    os.path.join(os.path.dirname(BASE_DIR), "media_out"),
)
INDEX_FILE = os.environ.get("NYXXI_INDEX_FILE", "post_index.txt")
PROFILE_DIR = os.path.abspath(
    os.environ.get("NYXXI_PROFILE_DIR", "./profile_data/edge_instagram")
)

# Set NYXXI_AUTO_SHARE=1 to let the bot click "Share" for you. Left off by
# default so you can review the post before it goes live.
AUTO_SHARE = os.environ.get("NYXXI_AUTO_SHARE", "0") == "1"

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
(()=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>undefined});}catch(e){}})();
"""

INSTAGRAM_URL = "https://www.instagram.com/"

# Instagram obfuscates its class names, so we lean on aria-labels, roles, and
# visible text, and try several options for each control.


async def is_logged_in(page: Page) -> bool:
    """Best-effort check that we are past the login screen."""
    for selector in (
        'svg[aria-label="New post"]',
        'svg[aria-label="Home"]',
        'a[href="/"] svg',
        '[aria-label="Create"]',
    ):
        try:
            if await page.locator(selector).count() > 0:
                return True
        except Exception:
            continue
    return False


async def click_first(page: Page, labels, timeout_ms: int = 8000) -> bool:
    """Try clicking the first control matching any of the given texts/labels.

    `labels` is a list of visible strings (e.g. "Next", "Post"). We try a few
    common Instagram control shapes for each. Returns True on the first click.
    """
    deadline = time.monotonic() + timeout_ms / 1000.0
    while time.monotonic() < deadline:
        for label in labels:
            candidates = [
                page.get_by_role("button", name=label, exact=True),
                page.get_by_role("menuitem", name=label, exact=True),
                page.locator(f'div[role="button"]:has-text("{label}")'),
                page.locator(f'button:has-text("{label}")'),
                page.locator(f'a:has-text("{label}")'),
            ]
            for locator in candidates:
                try:
                    if await locator.count() == 0:
                        continue
                    element = locator.first
                    if await element.is_visible():
                        await element.click()
                        print(f"[CLICK] '{label}'")
                        return True
                except Exception:
                    continue
        await page.wait_for_timeout(500)
    return False


async def find_caption_box(page: Page):
    for selector in (
        'textarea[aria-label*="caption" i]',
        'div[aria-label*="caption" i][contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]',
    ):
        try:
            locator = page.locator(selector)
            if await locator.count() > 0 and await locator.first.is_visible():
                return locator.first
        except Exception:
            continue
    return None


async def dismiss_reels_dialog(page: Page):
    """Instagram shows 'Video posts are now shared as reels' — click OK if present."""
    await click_first(page, ["OK", "Ok"], timeout_ms=2500)


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
        await ctx.add_init_script(NEUTRALIZER_JS)

        page = await ctx.new_page()
        print(f"[NAVIGATE] Going to {INSTAGRAM_URL}")
        try:
            await page.goto(INSTAGRAM_URL, wait_until="domcontentloaded", timeout=120000)
            await page.wait_for_timeout(4000)
        except PlaywrightTimeoutError:
            print("[ERROR] Navigation timed out.")
            await ctx.close()
            return

        print("\n*** LOGIN CHECK ***")
        if not await is_logged_in(page):
            print("[PAUSE] Please log in to Instagram in the browser window.")
            input(
                "\n👉 Log in manually (dismiss any 'Save info' / notification popups), "
                "then press ENTER here in the terminal to continue..."
            )
            await page.wait_for_timeout(2000)

        # Dismiss common 'Save your login info?' / 'Turn on notifications' popups.
        await click_first(page, ["Not now", "Not Now"], timeout_ms=3000)
        await click_first(page, ["Not now", "Not Now"], timeout_ms=3000)

        print("[CREATE] Opening the new-post dialog...")
        if not await click_first(page, ["Create", "New post"], timeout_ms=15000):
            print("[WARN] Could not find the 'Create' button automatically.")
            input(
                "\n👉 Click the '+ Create' button (and choose 'Post') yourself, "
                "then press ENTER here to continue..."
            )
        else:
            # A small menu (Post / Reel / Story) may appear.
            await click_first(page, ["Post"], timeout_ms=3000)

        await dismiss_reels_dialog(page)

        # Set the video on the hidden file input inside the dialog.
        print(f"[UPLOAD] Selecting video: {video_path}")
        file_input = None
        for _ in range(20):
            locator = page.locator("input[type='file']")
            if await locator.count() > 0:
                file_input = locator.last
                break
            await page.wait_for_timeout(1000)

        if file_input is None:
            print("[ERROR] Could not find the file input. Aborting.")
            print("        (Select the video manually if the dialog is open.)")
            await page.wait_for_timeout(3600000)
            return

        await file_input.set_input_files(video_path)
        await page.wait_for_timeout(6000)
        await dismiss_reels_dialog(page)

        # Advance through the crop / edit screens until the caption box shows up.
        print("[FLOW] Advancing through the editor to the caption screen...")
        caption_box = None
        for _ in range(5):
            caption_box = await find_caption_box(page)
            if caption_box is not None:
                break
            await click_first(page, ["Next"], timeout_ms=6000)
            await page.wait_for_timeout(2500)
            await dismiss_reels_dialog(page)

        if caption_box is None:
            print("[WARN] Caption box not found. Finish the caption manually.")
            await page.wait_for_timeout(3600000)
            return

        print("[CAPTION] Writing caption...")
        try:
            await caption_box.click()
            await page.keyboard.type(caption_text, delay=30)
            await page.wait_for_timeout(1500)
            print("[✍️] Caption inserted.")
        except Exception as e:
            print(f"[WARN] Caption error: {e}")

        if AUTO_SHARE:
            print("[SHARE] Auto-share is ON — clicking Share...")
            if await click_first(page, ["Share"], timeout_ms=10000):
                print("[DONE] Share clicked. Waiting for upload to finish...")
                await page.wait_for_timeout(20000)
            else:
                print("[WARN] Could not find the Share button; share manually.")
        else:
            print("\n--- READY FOR MANUAL POST ---")
            print("Review the post in the browser and click 'Share' yourself.")

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
