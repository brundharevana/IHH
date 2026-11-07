# The virtual museum on IHH's WordPress site: import package

For IHH's web team. This folder holds a small WordPress site that puts the whole museum and all five inductees on WordPress pages, ready to import into IHH's site.

| File | What it is |
|---|---|
| `ihh-virtual-museum.xml` | The WordPress export (WXR) of the test site, made with WordPress's own **Tools > Export > All content** |
| `blueprint.json` | A WordPress Playground blueprint that imports `ihh-virtual-museum.xml` into a fresh local WordPress, to look at the site before importing it anywhere |

The site was built and tested in a local WordPress 7.1 (WordPress Playground, PHP 8.3, theme Twenty Twenty-Five), on a desktop (1440 x 900) and a phone (390 x 844), by `app/e2e/wordpress-site.mjs`. The same script imports this export into a second, fresh WordPress and checks it again. It never touched IHH's real site.

## What is in the export

| Item | Address | What it shows |
|---|---|---|
| Page **Virtual Museum** | `/virtual-museum/` | The whole museum (the landing hall with the five inductees, then the tours) filling the window. Template **Museum full page**, so no site header, title or footer |
| Page **Inductees** | `/inductees/` | A placeholder: `[IHH's existing Inductees page stays here]` |
| Pages **Albert Einstein**, **Hedy Lamarr**, **John Muir**, **Madeleine Albright**, **James Naismith** (children of Inductees) | `/inductees/inductee-albert-einstein/`, `/inductees/inductee-hedy-lamarr/`, `/inductees/inductee-john-muir/`, `/inductees/inductee-madeleine-albright/`, `/inductees/inductee-james-naismith/` (the same addresses as IHH's inductee pages today) | The placeholder `[IHH's existing profile text stays here]`, then the museum in the page opening that inductee's tour (with its **Fullscreen** button), then a link card that opens the tour in a new tab |
| Template **Museum full page** | | The Content block only: no header, no title, no footer |
| Menu **Virtual Museum menu** (block themes: the header Navigation block) | | Virtual Museum, then the five inductee pages, as links to `/virtual-museum/` and `/inductees/inductee-.../` |
| Menu **Virtual Museum menu** (classic themes: Appearance > Menus) | | The same six pages |

All items belong to one user, `museum-editor` (`museum-editor@example.test`). The importer lets you give them to one of your own users.

The export holds nothing else: no posts, comments, media, users' details beyond that one name, site settings, or theme styles (the theme's global styles were kept out on purpose, so the import cannot replace style changes you made to your theme).

## Before you import

1. **Your inductee pages already exist.** IHH's site already has pages at `/inductees/inductee-<name>/`. Importing the five inductee pages would add a second page each, and WordPress would give the new ones addresses ending in `-2`. Choose one:
   - **Recommended:** do not import the five inductee pages. Open each existing inductee page and add the two blocks shown under "Add the museum to an existing inductee page" below, under your profile text.
   - Or import everything into a staging copy of the site first, compare, then copy the blocks across.
2. **The museum's address.** The export uses the current preview, `https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app`. When IHH hosts the museum at its own address, replace that address everywhere (see "Replace the museum address").
3. **Who imports.** Import as an **Administrator** (or, on a single site, an Editor). WordPress removes `<iframe>` from pages saved by a user without the "unfiltered HTML" permission: **Authors and Contributors lose the museum frame when they save**, and on a multisite network only Super Admins keep it. The link cards still work for them. Some hosted plans (WordPress.com without plugins) remove iframes for everyone.

## Import

1. In IHH's WordPress go to **Tools > Import**. Under **WordPress**, click **Install Now** (once), then **Run Importer**.
2. Choose `ihh-virtual-museum.xml` and click **Upload file and import**.
3. **Assign authors:** pick one of your users for `museum-editor` (or let WordPress create the user). There are no attachments, so the "Download and import file attachments" box does not matter.
4. Click **Submit**. WordPress lists what it imported.

Then:

- **Virtual Museum page:** open `/virtual-museum/`. It should show the museum filling the window, with no header or footer.
  - On a **block theme** (such as Twenty Twenty-Five) the imported **Museum full page** template is used. It is saved for the theme that was active when it was made (Twenty Twenty-Five). If your theme is a different block theme, make the template once in your theme: **Appearance > Editor > Templates > Add template > Custom template**, name it `Museum full page`, skip the pattern, add only the **Content** block, save; then open the Virtual Museum page and set **Template** to **Museum full page**.
  - On a **classic theme** there is no template editor. Use the page template your theme offers for a page without header and footer ("Blank", "Canvas" or "Full width", depending on the theme), or keep the page in the theme's normal page template; the museum then sits below the site's header. See "Full-page museum" in `docs/revamp/wordpress-embed.md`.
- **Menu:** a block theme uses the imported navigation menu in the header when the header's Navigation block has no menu chosen; otherwise select **Virtual Museum menu** in that block. On a classic theme go to **Appearance > Menus**, pick **Virtual Museum menu** and tick a **Display location**, or add its six items to your existing menu. The block-theme menu links are `/virtual-museum/` and `/inductees/inductee-.../`, so they assume WordPress runs at the root of the domain.
- **Placeholders:** the paragraphs `[IHH's existing profile text stays here]` and `[IHH's existing Inductees page stays here]` mark where your existing text goes. Replace each with the page's existing text, or delete it when you copy the blocks into an existing page. Nothing else on the pages is profile text.

## Add the museum to an existing inductee page

Open the page in the block editor, click below the profile text, add a **Custom HTML** block and paste the embed, then a second **Custom HTML** block with the card. For Albert Einstein (for the others change `einstein` to `lamarr`, `muir`, `albright` or `naismith`, and the name in the card):

```html
<div class="ihh-museum">
<iframe
  src="https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app/embed.html?inductee=einstein"
  title="Immigrant Hall of Honor virtual museum"
  style="display:block;border:0;width:100%;height:640px;max-height:85vh"
  allow="fullscreen; autoplay" allowfullscreen
  loading="lazy"></iframe>
</div>
```

```html
<a href="https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app/tour.html?inductee=einstein" target="_blank" rel="noopener noreferrer"
   style="display:block;max-width:520px;padding:20px 24px;border-radius:14px;background:#0a0e14;color:#f0e8dd;text-decoration:none">
  <strong style="display:block;font-size:1.25em">Immigrant Hall of Honor</strong>
  <span>Open Albert Einstein's guided tour in its own page.</span>
</a>
```

On a site that uses the Classic editor, paste both into the **Code** (Text) tab instead. Why each part of the snippet is there, and what to do when something looks wrong, is in `docs/revamp/wordpress-embed.md`.

## Replace the museum address

When the museum moves to IHH's own address, every page that shows it must change. Replace `https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app` with the new address (no slash at the end) in:

- the Virtual Museum page (one iframe, `src=".../"`);
- each inductee page (the iframe `src=".../embed.html?inductee=..."` and the card `href=".../tour.html?inductee=..."`).

Either edit each Custom HTML block, or, before importing, replace the address in `ihh-virtual-museum.xml` with a text editor (it appears only in those places). A search-and-replace plugin also works after the import.

## A site imported before November 2026

The Virtual Museum page's iframe used to be sized `width:100vw;height:100vh`. Signed in, with the admin bar showing, that page was 32 pixels taller than the window, and where a browser draws a scrollbar that takes room, `100vw` also ran the museum's right edge under the scrollbar (the record viewer's card was cut off). The page in `ihh-virtual-museum.xml` now fixes the frame to the window, below the admin bar when it shows. On a site imported earlier, open the Virtual Museum page's Custom HTML block and replace its `style="..."` with the one in `docs/revamp/wordpress-embed.md` ("No header or footer").

## Look at it before importing (optional)

With Node 22 or later:

```sh
cd docs/revamp/wordpress-site
npx @wp-playground/cli@3.1.61 server --blueprint=blueprint.json --blueprint-may-read-adjacent-files
```

It prints a local address (`http://127.0.0.1:9400`) with the imported site, signed in as Playground's own local admin. Nothing leaves your computer except the downloads of WordPress itself and the museum's pages.

## Test results

See `.superpowers/sdd/2026-10-22-turning-points-museum/wp-site-report.md` and the screenshots in `app/mockup-shots/wordpress-site/`. To run the tests again: `cd app && npm run e2e:wordpress-site` (about 25 minutes, needs network). The run rewrites `ihh-virtual-museum.xml` and `blueprint.json`.
