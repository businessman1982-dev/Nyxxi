import asyncio
import os
import time

from playwright.async_api import (
    async_playwright,
    Page,
    TimeoutError as PlaywrightTimeoutError,
)

from nyxxi_common import BASE_DIR, STATIC_POSTS, get_next_static_caption, get_next_video_file

# Persistent Edge profile for TikTok. Override with NYXXI_PROFILE_DIR.
PROFILE_DIR = os.path.abspath(os.environ.get("NYXXI_PROFILE_DIR", "./profile_data/edge_login"))


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
