# Putting the museum on a WordPress page

A guide for the person who edits IHH's WordPress site.

Every snippet below uses `https://YOUR-MUSEUM-URL`. Replace it with the museum's address, with no slash at the end. Until the museum has its own address, use the current preview (version 3): `https://ihh-turning-points-b8arwpweq-ihh4.vercel.app`.

## Which method to use

| Method | What visitors get | Use it? |
|---|---|---|
| Custom HTML block (block editor) | The museum inside the page: poster, Start, the full tour, sound, Fullscreen, records | Yes, recommended |
| Classic editor, Code (Text) tab | The same as the Custom HTML block | Yes, if your site uses the Classic editor |
| Link card | A dark card that opens the museum in a new tab | When you cannot add an iframe (see "Who can add an iframe") |
| Embed block (pasting the address) | Nothing usable: the editor says "Sorry, this content could not be embedded." | No. Use the Custom HTML block |

Tested in a local WordPress 7.1 (WordPress Playground) with the Twenty Twenty-Five and Twenty Twenty-One themes, in a desktop browser and at phone size (390 x 844).

## The snippet

```html
<div class="ihh-museum">
<iframe
  src="https://YOUR-MUSEUM-URL/embed.html"
  title="Immigrant Hall of Honor virtual museum"
  style="display:block;border:0;width:100%;height:640px;max-height:85vh"
  allow="fullscreen; autoplay" allowfullscreen
  loading="lazy"></iframe>
</div>
```

- Width: the museum fills your theme's text column. To make it wider, put the Custom HTML block inside a Group block and set the Group to "Wide width".
- Height: 640 pixels, and never more than 85% of the screen height. You can change `640px`; keep it at 480px or more so the tour's controls fit.
- Fullscreen: the museum has its own Fullscreen button above the tour.
- Paste it as given. Each part is there for a reason found in testing:
  - the `<div>` keeps the frame inside the text column (Twenty Twenty-One stretches a bare iframe to the full window width);
  - there are no `width` and `height` attributes (Twenty Twenty-One shrinks an iframe that has them to their shape: 260 pixels tall on a phone, too short to use);
  - `allow="fullscreen"` and `allowfullscreen` are both there because the Classic editor's Visual tab removes the first and keeps the second.

### Open a given inductee, chapter or record

Add the tour's parameters to the address in `src`:

- One inductee: `embed.html?inductee=einstein` (also `lamarr`, `muir`, `albright`, `naismith`)
- One chapter: `embed.html?inductee=einstein&chapter=big-work`
- One record: `embed.html?viewer=EIN-M-0013`

## Block editor: Custom HTML block

1. Open the page and click where the museum should go.
2. Click the **+** (Block Inserter), search for **Custom HTML**, and add it.
3. Paste the snippet into the block. Replace `https://YOUR-MUSEUM-URL`.
4. Click **Preview** in the block toolbar to check it, then **Save** (or **Update** / **Publish**).

## Classic editor

1. Open the page and click the **Code** tab (called **Text** in older WordPress versions; not Visual).
2. Paste the snippet where the museum should go. Replace `https://YOUR-MUSEUM-URL`.
3. Click **Update** or **Publish**.

Switching to the Visual tab afterwards is safe: WordPress rewrites the iframe and drops `allow` and `loading`, but keeps `allowfullscreen`, so the museum, its sound and Fullscreen still work (tested).

## Link card

Use it where an iframe is not allowed, or as a second way in below the frame. Add it in a Custom HTML block or in the Classic editor's Code tab.

```html
<a href="https://YOUR-MUSEUM-URL/" target="_blank" rel="noopener noreferrer"
   style="display:block;max-width:520px;padding:20px 24px;border-radius:14px;background:#0a0e14;color:#f0e8dd;text-decoration:none">
  <strong style="display:block;font-size:1.25em">Immigrant Hall of Honor</strong>
  <span>Open the museum: a guided walk through five inductees' turning points.</span>
</a>
```

## Embed block: why it does not work

When you paste the museum's address into an Embed block, or on its own line, WordPress looks for an oEmbed description of the page. The museum has none, so the editor shows "Sorry, this content could not be embedded." with **Try again** and **Convert to link**. If the block is published as it is, visitors see the address as plain text, not a link and not the museum. Remove the block and use the Custom HTML block. **Convert to link** gives a working link to the museum's embed page, but the link card is clearer.

## Who can add an iframe

WordPress removes `<iframe>` when the person who saves the page lacks the "unfiltered HTML" permission:

- Administrators and Editors have it on a single site. On a multisite network only Super Admins have it.
- Authors and Contributors do not: the iframe disappears when they save (tested: the post is saved without it).
- Some hosted plans (WordPress.com plans without plugins) remove iframes for everyone.

Where the iframe is removed, ask an Editor or Administrator to add it, or use the link card.

## What works inside the frame

Tested in WordPress on a desktop and a phone, with the snippet above:

- The poster shows **Start the museum** and **Open the museum in its own page**.
- **Start** loads the tour inside the page. Keyboard users reach Start with Tab and press Enter.
- Sound starts only after the visitor taps **Begin the tour**. The sound button (or the M key) mutes it.
- **Fullscreen** fills the screen; the same button, or Esc, leaves it.
- At the end of an inductee's tour, **Next inductee** opens the next tour in the same frame.
- In a record, **View at the holder** opens the holder's page in a new tab.
- No sideways scrolling on a phone, no console errors, and no accessibility (axe) violations in the frame.

## Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| Nothing where the museum should be | The iframe was removed when the page was saved | See "Who can add an iframe" |
| "Sorry, this content could not be embedded." | The Embed block was used | Use the Custom HTML block |
| The address shows as plain text | An Embed block was published as it was | Delete that block and use the Custom HTML block |
| The frame is very short on a phone, or as wide as the window | The snippet was changed (`width`/`height` added, or the `<div>` removed) | Paste the snippet again, as given |
| No Fullscreen button; an "Open the museum" button instead | The iframe has neither `allow="fullscreen"` nor `allowfullscreen` | Paste the snippet again |
| The frame shows only "This frame cannot run the museum's 3D tour" and a link | A plugin or the host added a `sandbox` to the iframe | Visitors can still open the museum with the link. Tell the museum's maintainers: it needs a change on the museum's side |
| "This page cannot open a new tab from here" with an address to copy | A sandbox blocks new tabs | Visitors can copy the address. Same report as above |
| The frame stays dark or blank | The address in `src` is wrong, or the museum is down | Open `https://YOUR-MUSEUM-URL/embed.html` in a browser tab to check |

## Full-page museum (option 1)

A WordPress page that is only the museum: no page title, no white margins, and either no site header at all or the site's header above the museum. Visitors see the museum as part of the site.

Tested 2026-11-02 in a local WordPress 7.1.4 (WordPress Playground) with Twenty Twenty-Five and Twenty Twenty-One, at 1440 x 900 and at phone size (390 x 844), against the version 3 preview.

| Layout | What visitors get | Use it? |
|---|---|---|
| No header or footer (recommended) | The museum fills the whole window. The WordPress page does not scroll. | Yes |
| Site header and footer (Twenty Twenty-Five) | The site's header, then the museum to the bottom of the window; the footer is below it. | Yes, if the site's menu must stay on the page |
| Twenty Twenty-One (classic theme) | The site title and a large "Museum" page title above the museum. You cannot remove them in the editor. | No. Use a block theme, or the snippet near the top of this guide |

Which address to use in `src`:

- `https://YOUR-MUSEUM-URL/` (the museum's front page): the whole museum. Visitors see the entrance, **Walk their journeys**, the five inductees and the guide's offer, then the tour. Use this for the no-header layout only: the front page scrolls inside the frame, so with a site header and footer the visitor would have two scroll areas. On a phone it has a known problem (see "Test results").
- `https://YOUR-MUSEUM-URL/tour.html`: straight into a guided tour (Einstein's, or another with `?inductee=`). The frame never scrolls, so it works in both layouts. Recommended for the layout with the site header.
- `embed.html` is not recommended on a full page. It adds a poster with a **Start** button and a dark strip with a **Fullscreen** button above the tour. On a full page, both are an extra step and look like a frame from another site.

### No header or footer (recommended)

1. Make a blank template once. Go to **Appearance > Editor > Templates** and click **Add template**, then **Custom template**. Name it `Museum full page` and click **Create**. In **Choose a pattern**, click **Skip**.
2. In the empty template, click **+** (Block Inserter), search for **Content**, and add the Content block. Add nothing else: no Header, no Title, no Footer. Click **Save**.
3. Open the museum page (**Pages**, then the page, or **Add New Page**). In the **Page** sidebar, click the name next to **Template**, choose **Change template**, and pick **Museum full page**.
4. Add a **Custom HTML** block and paste this snippet. Replace `https://YOUR-MUSEUM-URL`. Click **Save** (or **Publish**).

```html
<iframe
  src="https://YOUR-MUSEUM-URL/tour.html"
  title="Immigrant Hall of Honor virtual museum"
  style="position:fixed;top:var(--wp-admin--admin-bar--height,0px);left:0;display:block;border:0;width:100%;height:calc(100% - var(--wp-admin--admin-bar--height,0px))"
  allow="fullscreen; autoplay" allowfullscreen></iframe>
```

For the whole museum (entrance, **Walk their journeys**, all five inductees), use `src="https://YOUR-MUSEUM-URL/"` instead (tested on a desktop and a phone with version 6: see "Whole site, all five inductees").

The editor still shows the page title above the block; visitors do not see it. Do not add `loading="lazy"`: the museum is the whole page, so it should start loading at once.

The frame is fixed to the window, below WordPress's admin bar when one shows (`--wp-admin--admin-bar--height`, which WordPress sets while you are signed in). An earlier version of this snippet used `width:100vw;height:100vh`. With the admin bar showing, that made the page 32 pixels taller than the window, so the museum's foot was below the fold and the page scrolled; and where the browser draws a scrollbar that takes room (Windows, or macOS set to always show scrollbars), `100vw` counts the scrollbar too, so the museum's right edge ran under it. If your page has the earlier snippet, replace it with this one.

### Site header and footer (Twenty Twenty-Five)

1. Open the museum page. In the **Page** sidebar, set **Template** to **Page No Title** (a template that comes with Twenty Twenty-Five).
2. Add a **Group** block. In its toolbar set **Align** to **Full width**. In the Group's settings, under **Layout**, turn off **Inner blocks use content width**.
3. Inside the Group, add a **Custom HTML** block and paste this snippet. Replace `https://YOUR-MUSEUM-URL`. Save.

```html
<iframe
  src="https://YOUR-MUSEUM-URL/tour.html"
  title="Immigrant Hall of Honor virtual museum"
  style="display:block;border:0;width:100%;max-width:none;height:calc(100svh - 71px)"
  allow="fullscreen; autoplay" allowfullscreen></iframe>
<style>.wp-site-blocks > footer { margin-block-start: 0 }</style>
```

- `71px` is the height of Twenty Twenty-Five's header on a desktop. If your header is taller or shorter, change the number so the museum ends at the bottom of the window. At phone size the header is 66px, so about 5 pixels of the footer show at the bottom of the screen.
- The `<style>` line removes the white gap that Twenty Twenty-Five puts between the content and the footer. It affects only this page.
- Keep the iframe first in the block. A `<style>` above it adds a 19px white gap under the header.

Instead of steps 2 and 3 you can open **Options (⋮) > Code editor** and paste the blocks as markup (the same markup the tests use):

```
<!-- wp:group {"align":"full","layout":{"type":"default"}} -->
<div class="wp-block-group alignfull"><!-- wp:html -->
PASTE THE SNIPPET HERE
<!-- /wp:html --></div>
<!-- /wp:group -->
```

### Test results

Every check passed on both layouts in Twenty Twenty-Five, on a desktop and at phone size: no sideways scroll, no double scrollbar, no white gap around the museum, the first screen loads (the front page with **Walk their journeys**, or the tour's **Begin the tour** card), the tour starts and its sound plays only after **Begin the tour**, the guide is on screen, a stop opens its record and the record closes, **Next inductee** opens the next tour inside the frame (the WordPress page stays), no console errors, and no axe violations in the museum frame. Fullscreen: `tour.html` and the front page have no Fullscreen button of their own. The frame allows fullscreen (`allow="fullscreen"`). With no header, the museum already fills the window.

Fixed since: on a phone (390 x 844) the invisible "About this place" panel on the front page used to cover **Walk their journeys**, so a tap did not reach it (found by this test against version 3). The museum now hides a faded panel from taps; a real tap on **Walk their journeys** works inside the WordPress frame (version 6, see below).

Screenshots: `app/mockup-shots/wordpress-fullpage/` (`B-*` no header, `A-*` site header, `C-*` Twenty Twenty-One; `-landing` and `-room` for each device).

## Whole site, all five inductees

A complete WordPress site, ready for IHH's web team to import: `docs/revamp/wordpress-site/` (its `README.md` says how).

- **Virtual Museum** (`/virtual-museum/`): the museum's front page as the whole page, with the full-page snippet above (`src="https://YOUR-MUSEUM-URL/"`) and the **Museum full page** template.
- **Inductees** and five child pages at IHH's own addresses (`/inductees/inductee-albert-einstein/` and so on): the inductee's name, a placeholder where IHH's profile text stays, the snippet at the top of this guide opening that inductee's tour (`embed.html?inductee=<slug>`), then the link card opening the same tour.
- A menu with the six pages, for block themes (header Navigation) and for classic themes (Appearance > Menus).
- `ihh-virtual-museum.xml` is WordPress's own export of that site; `blueprint.json` imports it into a local WordPress Playground.

Tested 2026-11-04 against version 6 (`https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app`) in WordPress 7.1 (Twenty Twenty-Five) at 1440 x 900 and 390 x 844 with real taps, by `app/e2e/wordpress-site.mjs` (`cd app && npm run e2e:wordpress-site`, about 25 minutes). Inside the full-page frame the scroll-driven entrance, **Walk their journeys**, each inductee's slide and portrait, and starting a tour from the guide's offer all work; each inductee page starts that inductee's tour, opens its first room and a record, and its **Fullscreen** works. The export was imported into a second, fresh WordPress and checked again. Screenshots: `app/mockup-shots/wordpress-site/`.

## For maintainers

- `app/e2e/wordpress.mjs` runs all of the above in a local WordPress (WordPress Playground, no account). It needs network and Node 22 or later (tested with Node 24), takes about 10 minutes, and is not part of the default gate: `cd app && MUSEUM_URL=https://YOUR-MUSEUM-URL npm run e2e:wordpress` (without `MUSEUM_URL` it uses the version 3 preview; `-- block card` runs some methods only; `-- --keep` leaves WordPress running). Screenshots go to `app/mockup-shots/wordpress/`.
- `app/e2e/embed.mjs` (`npm run e2e:embed`) covers sandboxed frames against a local build. Embed option B (owner ruling 2026-10-24): `app/vercel.json` sets no CORS header, so a frame sandboxed without `allow-same-origin` shows the poster with the link card only; `embed.js` detects this. Changing that is a deploy-config change that needs the owner's approval.
