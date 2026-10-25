import asyncio
import os
import time

from playwright.async_api import (
    async_playwright,
    Page,
    TimeoutError as PlaywrightTimeoutError,
)

from nyxxi_common import BASE_DIR, STATIC_POSTS, get_next_static_caption, get_next_video_file

# Persistent Edge profile for this Playwright uploader. The Instagram draft
# path does not open a browser and does not use this profile.
PROFILE_DIR = os.path.abspath(
    os.environ.get("NYXXI_PROFILE_DIR", "./profile_data/edge_instagram")
)

# Set NYXXI_AUTO_SHARE=1 to let the bot click "Share" for you. Left off by
# default so you can review the post before it goes live.
AUTO_SHARE = os.environ.get("NYXXI_AUTO_SHARE", "0") == "1"


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
