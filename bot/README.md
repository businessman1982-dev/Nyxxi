# Nyxxi posting bot

Semi-automated TikTok uploader. It picks the next stable `.mp4` from an inbox
folder, rotates through a list of captions/hashtags, opens TikTok Studio in a
real Edge profile, uploads the video, and fills in the caption. You review and
click **Post** manually.

## Setup

```bash
pip install -r requirements.txt
playwright install msedge   # or use an already-installed Microsoft Edge
```

## Run

```bash
python nyxxi_bot.py
```

First run: a browser window opens on the TikTok upload page. If you are not
logged in, sign in manually, then press **ENTER** in the terminal. Your login
is saved in `./profile_data/edge_login`, so later runs skip the login step.

## Configuration

Paths default to the original Windows layout but can be overridden with
environment variables:

| Variable             | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `NYXXI_MEDIA_INBOX`  | Folder scanned for new `.mp4` files       |
| `NYXXI_MEDIA_OUT`    | Where processed videos are moved          |
| `NYXXI_INDEX_FILE`   | File that tracks the caption rotation     |
| `NYXXI_PROFILE_DIR`  | Persistent Edge profile directory         |

Captions and hashtags live in the `STATIC_POSTS` list at the top of
`nyxxi_bot.py`.

## Notes

- Uploads go to TikTok Studio (`/tiktokstudio/upload`); the old Creator Center
  URL is kept as a fallback.
- The video is moved to the "out" folder once selected, so it is not picked up
  again on the next run.
- Posting is intentionally manual — the script stops after filling the caption
  and waits for you to click Post.
