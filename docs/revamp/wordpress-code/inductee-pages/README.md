# The museum on each inductee's page (version 8)

One file per inductee. Each opens the museum straight on that inductee's tour (`embed.html?inductee=<name>`).

| Inductee page | File |
|---|---|
| Albert Einstein | `museum-einstein.html` |
| Hedy Lamarr | `museum-lamarr.html` |
| John Muir | `museum-muir.html` |
| Madeleine Albright | `museum-albright.html` |
| James Naismith | `museum-naismith.html` |

Steps, on each inductee's page (block editor):

1. Pages > open the inductee's page (under Inductees).
2. Leave IHH's text as it is. Click the last block of the page.
3. Click **+** (Block Inserter), search **Custom HTML**, add it. It goes below the selected block.
4. Click **Edit HTML**, paste that inductee's file, click **Update**.
5. Click **Save**.

The person saving must be an Editor or Administrator. Paste the code as it is.

Video: `how-to-add-the-museum-to-each-inductee-page.mp4` (4 min 40 s, no sound). Einstein's page step by step, then the other four faster.

Tested 2026-11-20 in WordPress 7.1.5 (WordPress Playground) with the Kadence theme (what IHH's site uses), on stand-in inductee pages set up like IHH's (pages under "Inductees"; IHH's real text is not used). For all five pages, 40 of 40 checks pass: the saved page keeps the code unchanged, the museum sits below the page's text, the frame opens that inductee's tour on version 8, no sideways scrolling, Start and Begin the tour work, and the first room is ready.
