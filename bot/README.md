# Nyxxi posting bot

Semi-automated posting for Nyxxi (Twisted Flame Records).

The supported Instagram path does not log in with a browser. It picks the next
video and a rotating caption, writes a draft, and stops. Nothing is published
until you explicitly approve. The live post is made by **Nyxxi Build** through
the Composio Instagram Graph API, after you say yes in chat.

Playwright scripts for TikTok and Instagram are still here. Instagram
Playwright stays available, and it is blocked by Instagram login detection.
Use the draft path below instead.

The draft and approve scripts use only the Python standard library. Playwright
is only needed for the older browser scripts.

## Instagram draft (use this)

From the `bot` folder in this repo, or from
`C:\Users\reneg\OneDrive\Desktop\nyxxi_bot.ok` after the scripts are copied
there (keep `nyxxi_common.py` in the same folder):

```bat
python nyxxi_bot_instagram_draft.py
```

What it does:

1. Takes the newest `.mp4` in the inbox, waits until the file size stops
   changing, and **moves** it to `media_out`.
2. Rotates to the next of the 6 captions in `post_index.txt`.
3. Writes `drafts\pending_instagram.json` next to `media_out`.

The draft file includes the video filename, the absolute path after the move,
the full caption, a created timestamp, `platform` = `instagram`, and
`status` = `pending_approval`.

The Command Prompt summary names the file, the caption, and the draft path,
and states that nothing was published. No browser opens. No API is called.

If a draft is already waiting, the script stops and does not take another
video. Delete `pending_instagram.json` first if you want a different clip.

## Approve, then Nyxxi Build publishes

This command does **not** post the video. It only records that you approved
the pending draft. Without one of these, it refuses and leaves the draft
pending:

```bat
python nyxxi_bot_instagram_publish.py --i-approve-publish
```

or:

```bat
set NYXXI_CONFIRM_PUBLISH=1
python nyxxi_bot_instagram_publish.py
```

`NYXXI_CONFIRM_PUBLISH` stays set in that Command Prompt window. Close the
window, or run `set NYXXI_CONFIRM_PUBLISH=`, when you are finished.

After approval the draft status is `approved` and `published` is false. The
script prints the handoff and still does not call Composio. Composio is not
wired inside these scripts.

The live publish path for Twisted Flame is: you say yes in chat to **Nyxxi
Build**. Nyxxi Build then uses Composio, in order:

1. `INSTAGRAM_POST_IG_USER_MEDIA`
2. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`

for ig user id `27944815738476357` (@nyxxi_blaze).

Instagram's Graph API cannot read a file on your PC. The video has to be a
public HTTPS URL, or a Composio `video_file` s3key. Getting that URL is an
ops step for Nyxxi Build. If you already have a public URL, you can set
`NYXXI_VIDEO_URL` before the draft script (or before approve) and it is
stored on the draft. The local script still does not upload the file.

## Playwright Instagram (not the supported publish path)

```bat
python nyxxi_bot_instagram.py
```

This still opens Edge and tries to upload through the website. It is blocked
by Instagram login detection. Leave it for manual experiments. Posting goes
out through the draft plus Nyxxi Build, not through this script.

`NYXXI_AUTO_SHARE=1` would let that Playwright script click Share. Leave it
unset.

## TikTok

```bat
pip install -r requirements.txt
playwright install msedge
python nyxxi_bot.py
```

First run: a browser window opens on the TikTok upload page. If you are not
logged in, sign in manually, then press **ENTER** in the terminal. Your login
is saved in `./profile_data/edge_login`, so later runs skip the login step.

TikTok often rejects that login. The script is unchanged aside from sharing
the inbox and caption helpers.

## Configuration

Paths default to the original Windows layout but can be overridden with
environment variables:

| Variable                  | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `NYXXI_MEDIA_INBOX`       | Folder scanned for new `.mp4` files                  |
| `NYXXI_MEDIA_OUT`         | Where the chosen video is moved                     |
| `NYXXI_INDEX_FILE`        | File that tracks the caption rotation                |
| `NYXXI_DRAFT_FILE`        | Pending Instagram draft JSON                         |
| `NYXXI_VIDEO_URL`         | Optional public HTTPS URL stored on the draft       |
| `NYXXI_CONFIRM_PUBLISH`   | Set to `1` to record approval (does not post)        |
| `NYXXI_PROFILE_DIR`       | Persistent Edge profile for the Playwright scripts   |
| `NYXXI_AUTO_SHARE`        | Set to `1` only for Playwright Instagram auto-share  |

Captions and hashtags live in `STATIC_POSTS` inside `nyxxi_common.py`. All
scripts share one `post_index.txt`.

## Notes

- The video is moved to the "out" folder once selected, so it is not picked
  again on the next run.
- Draft creation and approval never publish.
- TikTok uploads still target TikTok Studio (`/tiktokstudio/upload`), with the
  old Creator Center URL as a fallback. You click Post yourself.
