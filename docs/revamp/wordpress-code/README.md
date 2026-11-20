# Museum code for WordPress (version 8)

| File | Where to paste it |
|---|---|
| `museum-custom-html-block.html` | Block editor: add a **Custom HTML** block, click **Edit HTML**, paste into the HTML tab, click **Update**, then **Publish**. |
| `museum-classic-editor.html` | Classic editor: click the **Code** tab (not Visual; **Text** in older WordPress), paste, click **Publish**. |

The code in the two files is the same; only the place you paste it differs.

- Paste it as it is. Change only the address (`https://ihh-turning-points-duayridvf-ihh4.vercel.app`) when the museum gets its own.
- The person who saves the page must be an Editor or Administrator. For Authors and Contributors, WordPress removes the museum.
- Do not use the Embed block: it cannot show the museum.
- In the block editor's Edit HTML dialog, the small preview says the frame cannot run the 3D tour. That is only the editor's preview; the published page runs the full tour.

Video: `how-to-add-the-museum-to-wordpress.mp4` (2.5 minutes, no sound).

Tested 2026-11-20 in WordPress 7.1.5 (WordPress Playground, Twenty Twenty-Five), both files, at 1280 x 800:
the saved page keeps the code unchanged, the iframe points at version 8, Fullscreen is allowed, no sideways scrolling,
the poster shows, Start loads the tour, Begin the tour starts it and the first room is ready (16 of 16 checks pass).
The full WordPress e2e (`app/e2e/wordpress.mjs block classic`, same code) also passed: 61 checks, 0 failures,
desktop and phone, including Tab to Start, sound only after Begin, Fullscreen, axe and console errors.
