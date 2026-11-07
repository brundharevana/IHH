// The whole museum in a WordPress site, as IHH's web team would import it (WordPress Playground,
// @wp-playground/cli, run locally; no account and no external sign-in). The script builds the site
// through the blueprint and the editors, exports it with WordPress's own export (Tools > Export), and
// checks every page on a desktop (1440x900) and a phone (390x844, real taps):
//   Virtual Museum   /virtual-museum/: the museum's front page (the landing hall, index.html) as the whole
//                    page, an iframe fixed to the window (below the admin bar when signed in) in a blank custom template ("Museum full page": the
//                    Content block only)
//   Inductees        /inductees/: the parent page
//   five inductees   /inductees/inductee-<first>-<last>/ (IHH's own URL structure: each inductee's
//                    ihh_url in IHH-facts data/inductees/<slug>/inductee.json): the name as the title, a
//                    placeholder paragraph where IHH's profile text stays, the in-page embed opening that
//                    inductee's tour (embed.html?inductee=<slug>, with its Fullscreen button), then the link
//                    card as a fallback
//   menu             the header navigation (a wp_navigation menu for block themes) and a classic menu (for
//                    classic themes), both linking the Virtual Museum and the five inductee pages
// Checks per page and viewport: the frame loads with no console error or failed request; the right
// inductee's tour starts (read from the tour itself, not from the URL); Begin, then the first room is
// ready; a record opens and closes; Fullscreen enters and leaves (in-page embeds); no horizontal
// overflow; axe (WCAG 2.x A/AA + best practice) finds nothing in our markup or the frames; on the phone
// every control is pressed by a real tap. The Virtual Museum page also checks the landing inside the
// frame: the scroll-driven entrance (a real wheel / a real touch swipe), "Walk their journeys", each
// inductee's slide and portrait, and starting a tour from the hall. A negative control (a page whose
// embed has a misspelt inductee slug) must fail the "right inductee" check.
// Then the import package: docs/revamp/wordpress-site/ gets the WXR export and a blueprint that imports
// it; a second, fresh Playground is booted from that blueprint and the imported site is checked
// (pages, parent, URLs, template, menus, frames).
// Screenshots: app/mockup-shots/wordpress-site/<page>-<desktop|phone>-<state>.jpg
//
// Needs network (WordPress from wordpress.org, the museum is the deployed site), Node 22+ (tested with
// Node 24), and about 25 minutes. Not part of the default gate.
// usage: MUSEUM_URL=https://... node e2e/wordpress-site.mjs [--keep]   (npm run e2e:wordpress-site)
//   MUSEUM_URL defaults to the version 6 preview; --keep leaves the first WordPress running at the end.
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium, loadAxe } = await import('./browser.mjs')
const AxeBuilder = await loadAxe()

const MUSEUM = (process.env.MUSEUM_URL || 'https://ihh-turning-points-rmtf1m1q5-ihh4.vercel.app').replace(/\/$/, '')
const PLAYGROUND = '@wp-playground/cli@3.1.61'
const PORT = Number(process.env.WP_PORT || 9430)
const SHOTS = fileURLToPath(new URL('../mockup-shots/wordpress-site/', import.meta.url))
const PKG = fileURLToPath(new URL('../../docs/revamp/wordpress-site/', import.meta.url))
const WXR_NAME = 'ihh-virtual-museum.xml'
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
const KEEP = process.argv.includes('--keep')
const EDITOR = 'museum-editor' // the neutral account that builds the pages (and so the WXR's only author)
const EDITOR_EMAIL = 'museum-editor@example.test'
const TEMPLATE = 'wp-custom-template-museum-full-page' // the slug the Site Editor gives "Museum full page"

// the inductees in the hall's order (landing/data/inductees.json), each with IHH's page slug
// (IHH-facts data/inductees/<slug>/inductee.json ihh_url: https://immigranthallofhonor.org/inductees/<page>/)
const IHH_PAGE = { einstein: 'inductee-albert-einstein', lamarr: 'inductee-hedy-lamarr', muir: 'inductee-john-muir', albright: 'inductee-madeleine-albright', naismith: 'inductee-james-naismith' }
const HALL = JSON.parse(readFileSync(new URL('../src/landing/data/inductees.json', import.meta.url), 'utf8'))
const INDUCTEES = HALL.map((d) => ({ slug: d.slug, name: d.name, page: IHH_PAGE[d.slug], portrait: !!d.portrait }))
if (INDUCTEES.length !== 5 || INDUCTEES.some((d) => !d.page)) throw new Error(`the hall's inductees (${HALL.map((d) => d.slug)}) no longer match the IHH page slugs`)
const PLACEHOLDER = "[IHH's existing profile text stays here]"

// the snippets, read from the guide (docs/revamp/wordpress-embed.md): its 1st html block is the in-page
// iframe, its 2nd the link card, its 3rd the full-page iframe (no header or footer)
const GUIDE = readFileSync(new URL('../../docs/revamp/wordpress-embed.md', import.meta.url), 'utf8')
const [SNIPPET, CARD, FULL] = [...GUIDE.matchAll(/```html\n([\s\S]*?)\n```/g)].map((x) => x[1].replaceAll('https://YOUR-MUSEUM-URL', MUSEUM))
if (!SNIPPET?.includes(`${MUSEUM}/embed.html"`) || !CARD?.startsWith(`<a href="${MUSEUM}/"`) || !FULL?.includes(`${MUSEUM}/tour.html"`) || !FULL.includes('position:fixed'))
  throw new Error('the guide no longer has the in-page iframe, the link card and the full-page iframe as its first three html blocks')
const embedFor = (d) => SNIPPET.replace(`${MUSEUM}/embed.html"`, `${MUSEUM}/embed.html?inductee=${d.slug}"`)
// the card opens the inductee's own tour, as the embed's "Open the museum in its own page" link does
const cardFor = (d) =>
  CARD.replace(`href="${MUSEUM}/"`, `href="${MUSEUM}/tour.html?inductee=${d.slug}"`).replace(/<span>[^<]*<\/span>/, `<span>Open ${d.name}'s guided tour in its own page.</span>`)
const FULL_PAGE = FULL.replace(`${MUSEUM}/tour.html"`, `${MUSEUM}/"`) // the whole museum: its front page
const inducteeBlocks = (d) =>
  `<!-- wp:paragraph -->\n<p>${PLACEHOLDER}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:html -->\n${embedFor(d)}\n<!-- /wp:html -->\n\n<!-- wp:html -->\n${cardFor(d)}\n<!-- /wp:html -->`
const MENU = [{ label: 'Virtual Museum', path: '/virtual-museum/' }, ...INDUCTEES.map((d) => ({ label: d.name, path: `/inductees/${d.page}/` }))]

// ---- WordPress Playground ----
// The blueprint removes the default post, page and comment (so the export holds only the museum's
// content), adds the museum-editor (an Administrator: templates and menus need edit_theme_options),
// signs the browser in as that local account, and adds the header menu (a wp_navigation post with
// root-relative links, so it keeps working after the import on a site at the domain root). The
// password is random per run and lives only in this throwaway site.
const PASS = randomBytes(18).toString('base64url')
const php = (s) => JSON.stringify(s).replace(/\$/g, '\\$')
const NAV = MENU.map((x) => `<!-- wp:navigation-link {"label":${JSON.stringify(x.label)},"url":"${x.path}","kind":"custom","isTopLevelLink":true} /-->`).join('\n')
const SETUP_PHP = `<?php require '/wordpress/wp-load.php';
foreach (get_posts(['post_type' => ['post', 'page'], 'post_status' => 'any', 'numberposts' => -1]) as $p) wp_delete_post($p->ID, true);
$u = wp_insert_user(['user_login' => '${EDITOR}', 'user_pass' => ${php(PASS)}, 'role' => 'administrator', 'user_email' => '${EDITOR_EMAIL}', 'display_name' => '${EDITOR}', 'nickname' => '${EDITOR}']);
if (is_wp_error($u)) throw new Exception($u->get_error_message());
wp_set_current_user($u);
update_option('blogname', 'Immigrant Hall of Honor (test site)');
update_option('blogdescription', '');
$n = wp_insert_post(['post_type' => 'wp_navigation', 'post_status' => 'publish', 'post_title' => 'Virtual Museum menu', 'post_content' => ${php(NAV)}], true);
if (is_wp_error($n)) throw new Exception($n->get_error_message());
`
// The block editor creates an empty user global-styles post for the active theme (wp_global_styles,
// '{"version": 3, "isGlobalStylesUserThemeJSON": true }'). Exported, the importer would add it to IHH's
// site as the newest styles post for Twenty Twenty-Five, which would replace any style changes IHH made
// to that theme. This must-use plugin keeps it out of the export (can_export false); nothing else changes.
const NO_STYLES_EXPORT = `<?php
// the theme's user styles are the site owner's, not part of the museum's import package
add_filter('register_post_type_args', function ($args, $type) {
  if ($type === 'wp_global_styles') $args['can_export'] = false;
  return $args;
}, 10, 2);
`
const buildBlueprint = {
  preferredVersions: { php: '8.3', wp: 'latest' },
  steps: [
    { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/museum-export-without-theme-styles.php', data: NO_STYLES_EXPORT },
    { step: 'runPHP', code: SETUP_PHP },
    { step: 'login', username: EDITOR, password: PASS },
  ],
}
// the package's blueprint: a fresh WordPress that imports the export (written next to it)
const packageBlueprint = {
  $schema: 'https://playground.wordpress.net/blueprint-schema.json',
  landingPage: '/virtual-museum/',
  preferredVersions: { php: '8.3', wp: 'latest' },
  login: true,
  steps: [
    { step: 'setSiteOptions', options: { blogname: 'Immigrant Hall of Honor (test site)', blogdescription: '' } },
    { step: 'importWxr', file: { resource: 'bundled', path: `/${WXR_NAME}` } },
  ],
}

async function bootWordPress(bp, port, extra = []) {
  // npx from the same Node install that runs this script
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH}` }
  const child = spawn('npx', ['-y', PLAYGROUND, 'server', `--port=${port}`, '--workers=2', `--blueprint=${bp}`, ...extra], { env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let log = ''
  const url = await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Playground did not start in 5 min:\n${log}`)), 300000)
    const on = (d) => {
      log += d
      const m = /WordPress is running on (http\S+)/.exec(log)
      if (m) { clearTimeout(t); resolve(m[1]) }
    }
    child.stdout.on('data', on)
    child.stderr.on('data', on)
    child.on('exit', (c) => { clearTimeout(t); reject(new Error(`Playground exited (${c}):\n${log}`)) })
  })
  return { url: url.replace(/\/$/, ''), log: () => log, stop: () => { try { process.kill(-child.pid, 'SIGTERM') } catch { /* already gone */ } } }
}

// ---- results ----
let fails = 0
const results = {} // page -> viewport -> [notes]
const note = (m, vp, s) => ((results[m] ??= {})[vp] ??= []).push(s)
const fail = (m, vp, s) => { fails++; note(m, vp, `FAIL ${s}`); console.log(`  FAIL [${m} ${vp}] ${s}`) }
const ok = (m, vp, s) => { note(m, vp, s); console.log(`  ok   [${m} ${vp}] ${s}`) }
const step = async (m, vp, tag, fn) => {
  try {
    const r = await fn()
    if (r !== false) ok(m, vp, tag)
    return r !== false
  } catch (e) {
    fail(m, vp, `${tag}: ${String(e.message || e).split('\n')[0]}`)
    return false
  }
}

// ---- the editors: build the site the way an editor does ----
async function blockEditorPage(page, WP, edits, blocks) {
  await page.goto(`${WP}/wp-admin/post-new.php?post_type=page`)
  await page.waitForFunction(() => window.wp?.data?.select('core/editor')?.getCurrentPostId?.(), null, { timeout: 120000 })
  await page.evaluate(() => {
    const p = window.wp.data.dispatch('core/preferences')
    p.set('core/edit-post', 'welcomeGuide', false)
    p.set('core', 'enableChoosePatternModal', false)
  })
  await page.keyboard.press('Escape') // a starter-pattern or welcome modal, if one opened before the preference landed
  await page.evaluate(({ edits, blocks }) => {
    const { dispatch } = window.wp.data
    dispatch('core/editor').editPost(edits)
    // block markup, as the Code editor or a paste gives it
    dispatch('core/block-editor').resetBlocks(window.wp.blocks.parse(blocks))
  }, { edits, blocks })
}
async function publish(page, expect) {
  return page.evaluate(async (expect) => {
    const { dispatch, select } = window.wp.data
    for (const e of expect) if (!select('core/editor').getEditedPostContent().includes(e)) throw new Error(`the editor content lacks ${e}`)
    dispatch('core/editor').editPost({ status: 'publish' })
    await dispatch('core/editor').savePost()
    const saved = select('core/editor').getCurrentPost()
    if (saved.status !== 'publish') throw new Error('the page did not publish')
    return { id: saved.id, link: saved.link, template: saved.template, parent: saved.parent, slug: saved.slug }
  }, expect)
}

async function buildSite(ctx, WP) {
  const page = await ctx.newPage()
  const out = { pages: {} }
  await page.goto(`${WP}/wp-admin/`)
  await page.waitForSelector('#wpadminbar', { timeout: 120000 })
  out.user = await page.locator('#wp-admin-bar-my-account .display-name').first().innerText()
  if (out.user.trim() !== EDITOR) throw new Error(`signed in as "${out.user}", not ${EDITOR}`)

  // the template: Appearance > Editor > Templates > Add template > Custom template "Museum full page",
  // then the Content block and nothing else. The Site Editor's own data store saves it (as its
  // "Add template" does); the Content block is the one the inserter adds, with its default attributes.
  await page.goto(`${WP}/wp-admin/site-editor.php?p=%2Ftemplate`)
  await page.waitForFunction(() => window.wp?.data?.select('core')?.getEntityRecords && window.wp.blocks?.getBlockType?.('core/post-content'), null, { timeout: 120000 })
  out.template = await page.evaluate(async ({ slug }) => {
    const content = window.wp.blocks.serialize([window.wp.blocks.createBlock('core/post-content')])
    const r = await window.wp.data.dispatch('core').saveEntityRecord('postType', 'wp_template', { slug, title: 'Museum full page', description: 'The Content block only: no header, no title, no footer.', content, status: 'publish' }, { throwOnError: true })
    return { id: r.id, slug: r.slug, content }
  }, { slug: TEMPLATE })

  // the pages: Inductees, its five children, the Virtual Museum
  out.pages.inductees = await (async () => {
    await blockEditorPage(page, WP, { title: 'Inductees', slug: 'inductees' }, `<!-- wp:paragraph -->\n<p>[IHH's existing Inductees page stays here]</p>\n<!-- /wp:paragraph -->`)
    return publish(page, [])
  })()
  for (const d of INDUCTEES) {
    await blockEditorPage(page, WP, { title: d.name, slug: d.page, parent: out.pages.inductees.id }, inducteeBlocks(d))
    out.pages[d.slug] = await publish(page, [PLACEHOLDER, `embed.html?inductee=${d.slug}"`, `tour.html?inductee=${d.slug}"`])
  }
  await blockEditorPage(page, WP, { title: 'Virtual Museum', slug: 'virtual-museum', template: TEMPLATE }, `<!-- wp:html -->\n${FULL_PAGE}\n<!-- /wp:html -->`)
  out.pages.museum = await publish(page, [`src="${MUSEUM}/"`])

  // the classic menu (Appearance > Menus on a classic theme), through WordPress's REST API from the editor
  out.classicMenu = await page.evaluate(async ({ items }) => {
    const menu = await window.wp.apiFetch({ path: '/wp/v2/menus', method: 'POST', data: { name: 'Virtual Museum menu' } })
    for (const [i, it] of items.entries())
      await window.wp.apiFetch({ path: '/wp/v2/menu-items', method: 'POST', data: { title: it.label, type: 'post_type', object: 'page', object_id: it.id, menus: menu.id, status: 'publish', menu_order: i + 1 } })
    return { id: menu.id, items: items.length }
  }, { items: [{ label: 'Virtual Museum', id: out.pages.museum.id }, ...INDUCTEES.map((d) => ({ label: d.name, id: out.pages[d.slug].id }))] })
  await page.close()
  return out
}

// Tools > Export > All content > Download Export File, as WordPress itself writes it
async function exportSite(ctx, WP) {
  const page = await ctx.newPage()
  try {
    await page.goto(`${WP}/wp-admin/export.php`)
    await page.locator('input[name=content][value=all]').check()
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.locator('#submit').click()])
    mkdirSync(PKG, { recursive: true })
    await dl.saveAs(join(PKG, WXR_NAME))
    return readFileSync(join(PKG, WXR_NAME), 'utf8')
  } finally {
    await page.close()
  }
}

// what the export holds: the seven pages, the template, the two menus, and one neutral author
function checkWxr(xml) {
  const m = 'export'
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((x) => x[1])
  const field = (it, f) => (it.match(new RegExp(`<wp:${f}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</wp:${f}>`)) || [])[1]
  const types = {}
  for (const it of items) (types[field(it, 'post_type')] ??= []).push(field(it, 'post_name'))
  note(m, '-', `items: ${Object.entries(types).map(([t, n]) => `${t} ${n.length}`).join(', ')}`)
  const want = ['virtual-museum', 'inductees', ...INDUCTEES.map((d) => d.page)].sort()
  if ((types.page || []).sort().join() !== want.join()) fail(m, '-', `pages ${types.page} (expected ${want})`)
  else ok(m, '-', 'the seven pages (Virtual Museum, Inductees, five inductees)')
  if (!(types.wp_template || []).includes(TEMPLATE)) fail(m, '-', `no ${TEMPLATE} template`)
  else ok(m, '-', 'the Museum full page template')
  if ((types.wp_navigation || []).length !== 1) fail(m, '-', `${(types.wp_navigation || []).length} wp_navigation menus (expected 1)`)
  else ok(m, '-', 'the header menu (wp_navigation)')
  if (types.wp_global_styles) fail(m, '-', `the export holds the theme's global styles (${types.wp_global_styles}): importing it would replace IHH's theme styles`)
  else ok(m, '-', "no theme global styles in the export")
  if ((types.nav_menu_item || []).length !== MENU.length) fail(m, '-', `${(types.nav_menu_item || []).length} classic menu items (expected ${MENU.length})`)
  else ok(m, '-', `the classic menu (${MENU.length} items)`)
  const logins = [...new Set([...xml.matchAll(/<wp:author_login><!\[CDATA\[(.*?)\]\]>/g)].map((x) => x[1]))]
  const emails = [...new Set([...xml.matchAll(/<wp:author_email><!\[CDATA\[(.*?)\]\]>/g)].map((x) => x[1]))]
  const creators = [...new Set([...xml.matchAll(/<dc:creator><!\[CDATA\[(.*?)\]\]>/g)].map((x) => x[1]))]
  if (logins.join() !== EDITOR || emails.join() !== EDITOR_EMAIL || creators.join() !== EDITOR) fail(m, '-', `authors ${logins} / ${emails} / creators ${creators} (expected only ${EDITOR})`)
  else ok(m, '-', `one author, ${EDITOR} (${EDITOR_EMAIL})`)
  if (xml.includes(PASS)) fail(m, '-', 'the export holds the throwaway password')
  for (const d of INDUCTEES) {
    const it = items.find((x) => field(x, 'post_name') === d.page)
    if (!it?.includes(`embed.html?inductee=${d.slug}"`) || !it.includes(PLACEHOLDER)) fail(m, '-', `${d.page}: the embed or the placeholder is missing`)
  }
  const museum = items.find((x) => field(x, 'post_name') === 'virtual-museum')
  if (!museum?.includes(TEMPLATE) || !museum.includes(`src="${MUSEUM}/"`)) fail(m, '-', 'virtual-museum: the template or the full-page iframe is missing')
}

// ---- the checks ----
const frameWhere = (page, fn) => page.frames().find((f) => { try { return fn(new URL(f.url())) } catch { return false } })
async function waitFrame(page, fn, what, ms = 60000) {
  for (let i = 0; i < ms / 100; i++) {
    const f = frameWhere(page, fn)
    if (f) return f
    await page.waitForTimeout(100)
  }
  throw new Error(`no ${what} frame`)
}
const isMuseum = (u) => u.origin === new URL(MUSEUM).origin
const shot = async (page, name) => page.screenshot({ path: join(SHOTS, `${name}.jpg`), quality: 78 })
const press = (loc, phone, opts = {}) => (phone ? loc.tap({ timeout: 15000, ...opts }) : loc.click({ timeout: 15000, ...opts }))

// console errors and failed requests on the WordPress page and inside the museum frames
function watch(page) {
  const errs = []
  page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0, 160)} (${m.location()?.url || ''})`) })
  page.on('pageerror', (e) => errs.push(`page error: ${String(e.message || e).split('\n')[0]}`))
  page.on('requestfailed', (r) => {
    if (r.failure()?.errorText === 'net::ERR_ABORTED') return // a navigation or teardown cancelled it
    errs.push(`request failed: ${r.url()} (${r.failure()?.errorText})`)
  })
  page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  return errs
}
const noErrors = (errs) => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) }
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)

// axe on the whole WordPress page (frames included); violations in a museum frame or in our markup fail,
// the theme's own are listed
async function axe(page, m, vp, tag) {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  const ours = []
  const theirs = []
  for (const v of r.violations) {
    for (const n of v.nodes) {
      const inFrame = n.target.length > 1
      const ourMarkup = /embed\.html|Immigrant Hall of Honor|IHH's existing/.test(n.html)
      ;(inFrame || ourMarkup ? ours : theirs).push(`${v.id}: ${n.target.join(' >> ')}`)
    }
  }
  if (ours.length) throw new Error(ours.slice(0, 4).join(' | '))
  if (theirs.length) note(m, vp, `theme axe findings (not ours) at ${tag}: ${[...new Set(theirs.map((t) => t.split(':')[0]))].join(', ')}`)
}

// the tour that actually started, read from the tour itself (its document title is the inductee's name)
async function rightInductee(tour, d) {
  const t = await tour.evaluate(() => document.title)
  if (!t.startsWith(`${d.name} —`)) throw new Error(`the tour that started is "${t}", not ${d.name}'s`)
  const q = new URL(tour.url()).searchParams.get('inductee')
  if (q !== d.slug) throw new Error(`the tour address asks for "${q}", not ${d.slug}`)
}

// Begin, the first room, a record (shared by the Virtual Museum and the inductee pages)
async function tourChecks(m, vp, page, tour, d, centre) {
  const phone = vp === 'phone'
  const started = await step(m, vp, `the right inductee's tour starts (${d.name})`, async () => {
    await tour.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
    await rightInductee(tour, d)
  })
  if (!started) return false
  await step(m, vp, 'Begin, then the first room is ready (sound only after Begin)', async () => {
    if ((await tour.evaluate(() => window.__plays)) !== 0) throw new Error('audio played before Begin')
    await centre()
    await press(tour.getByRole('button', { name: /Begin the tour/ }), phone)
    await tour.waitForFunction(() => window.__plays > 0, null, { timeout: 30000 })
    await tour.locator('main[data-chapter]').waitFor({ timeout: 60000 })
    if ((await tour.locator('main').getAttribute('data-phase')) === 'map') {
      await page.waitForTimeout(1500)
      await press(tour.locator('[data-hud=next]'), phone)
    }
    await tour.locator('main[data-phase="room"][data-ready="true"]').waitFor({ timeout: 120000 })
    if (await tour.locator('[data-room-error]').isVisible()) throw new Error(await tour.locator('[data-room-error]').innerText())
  })
  await page.waitForTimeout(1500)
  await shot(page, `${m}-${vp}-room`)
  await step(m, vp, 'a record opens and closes', async () => {
    const stop = tour.locator('[data-stop]').first()
    const id = await stop.getAttribute('data-stop', { timeout: 15000 })
    await press(stop, phone)
    await tour.locator('.artifact-viewer[role=dialog]').waitFor({ timeout: 30000 })
    await tour.locator('.artifact-viewer [data-viewer-ready="true"]').waitFor({ timeout: 45000 })
    await page.waitForTimeout(1000)
    await shot(page, `${m}-${vp}-record`)
    note(m, vp, `record from stop "${id}"`)
    await press(tour.locator('.artifact-viewer .letter-close').first(), phone)
    await tour.locator('.artifact-viewer[role=dialog]').waitFor({ state: 'detached', timeout: 15000 })
  })
  return true
}

const visitorPage = async (ctx) => {
  const page = await ctx.newPage()
  return { page, errs: watch(page) }
}
const loggedOut = async (page) => { if (await page.locator('#wpadminbar').count()) throw new Error('the visitor is signed in (admin bar shows)') }

// ---- the Virtual Museum page: the whole museum, framed full page ----
async function museumPage(ctx, vp, WP, created, m = 'virtual-museum') {
  const phone = vp === 'phone'
  const { page, errs } = await visitorPage(ctx)
  const url = `${WP}/virtual-museum/`
  try {
    await page.goto(url, { waitUntil: 'load' })
    await step(m, vp, 'URL /virtual-museum/', async () => { if (created && created.pages.museum.link !== url) throw new Error(`the page is at ${created.pages.museum.link}`)
      await loggedOut(page) })
    await step(m, vp, 'blank template: no header, title or footer; the frame fills the window; the page does not scroll', async () => {
      const l = await page.evaluate(() => {
        const f = document.querySelector('iframe')
        const r = f?.getBoundingClientRect()
        return {
          frames: document.querySelectorAll('iframe').length,
          src: f?.getAttribute('src'),
          allow: f?.getAttribute('allow'),
          r: r && { l: r.left, t: r.top, w: r.width, h: r.height },
          vw: innerWidth, vh: innerHeight,
          sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth,
          chrome: [...document.querySelectorAll('.wp-site-blocks > header, .wp-site-blocks > footer, header.wp-block-template-part, footer.wp-block-template-part, .wp-block-post-title')].length,
          template: [...document.body.classList].find((c) => c.startsWith('page-template')) || '',
        }
      })
      note(m, vp, `frame ${Math.round(l.r?.w)}x${Math.round(l.r?.h)} at ${Math.round(l.r?.l)},${Math.round(l.r?.t)} in a ${l.vw}x${l.vh} window; document ${l.sw}x${l.sh}; ${l.template}`)
      if (l.frames !== 1 || l.src !== `${MUSEUM}/`) throw new Error(`frames ${l.frames}, src ${l.src}`)
      if (!/fullscreen/.test(l.allow || '')) throw new Error(`allow="${l.allow}"`)
      if (l.chrome) throw new Error(`${l.chrome} header/footer/title element(s) on the page`)
      if (Math.abs(l.r.l) > 0.5 || Math.abs(l.r.t) > 0.5 || Math.abs(l.r.w - l.vw) > 1 || Math.abs(l.r.h - l.vh) > 1) throw new Error(`the frame is not the window: ${JSON.stringify(l.r)}`)
      if (l.sh > l.vh + 1) throw new Error(`the WordPress page scrolls (${l.sh}px for a ${l.vh}px window)`)
      if (l.sw > l.vw + 1) throw new Error(`the WordPress page scrolls sideways by ${l.sw - l.vw}px`)
    })
    const hall = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/', 'museum front page')
    const walkBtn = hall.getByRole('button', { name: 'Walk their journeys' })
    await step(m, vp, 'the landing loads in the frame', async () => {
      await walkBtn.waitFor({ state: 'visible', timeout: 60000 })
      await page.waitForTimeout(3000)
    })
    await shot(page, `${m}-${vp}-entrance`)
    await step(m, vp, 'axe, entrance', () => axe(page, m, vp, 'entrance'))
    const e = () => hall.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.entrance')).getPropertyValue('--e')) || 0)
    // a real gesture over the frame: the mouse wheel on a desktop, a touch swipe on a phone
    const cdp = phone ? await ctx.newCDPSession(page) : null
    const scroll = async (dy) => {
      if (phone) await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 600, yDistance: -dy, gestureSourceType: 'touch', speed: 1600, repeatCount: 0 })
      else { await page.mouse.move(720, 450); for (let i = 0; i < Math.ceil(dy / 300); i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(60) } }
    }
    await step(m, vp, `scroll-driven entrance (${phone ? 'touch swipe' : 'mouse wheel'} in the frame)`, async () => {
      const e0 = await e()
      await scroll(500)
      await page.waitForTimeout(1800)
      const e1 = await e()
      await scroll(500)
      await page.waitForTimeout(1800)
      const e2 = await e()
      note(m, vp, `entrance progress ${e0.toFixed(2)} -> ${e1.toFixed(2)} -> ${e2.toFixed(2)}`)
      if (!(e1 > e0 + 0.05 && e2 > e1)) throw new Error(`the entrance did not follow the scroll (${e0}, ${e1}, ${e2})`)
      await shot(page, `${m}-${vp}-entrance-scrolled`)
      await hall.evaluate(() => window.scrollTo(0, 0))
      await hall.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.entrance')).getPropertyValue('--e')) < 0.02, null, { timeout: 15000 })
      await walkBtn.waitFor({ state: 'visible', timeout: 10000 })
      await page.waitForTimeout(800)
    })
    await step(m, vp, `"Walk their journeys" (${phone ? 'tap' : 'click'})`, async () => {
      await press(walkBtn, phone)
      await hall.locator('.slide.is-active').waitFor({ timeout: 30000 })
      await page.waitForTimeout(3000)
      const r = await hall.evaluate(() => ({ y: scrollY, focus: document.activeElement?.id }))
      if (!(r.y > 0) || r.focus !== 'inductees') throw new Error(`the walk did not start (${JSON.stringify(r)})`)
      if (!page.url().startsWith(url)) throw new Error(`the WordPress page navigated to ${page.url()}`)
    })
    // each inductee's slide, by the dots on a desktop and by touch swipes on a phone (the dots are hidden there)
    let last = null
    for (const [i, d] of INDUCTEES.entries()) {
      const ok2 = await step(m, vp, `slide ${i + 1}: ${d.name}, ${d.portrait ? 'portrait shows' : 'portrait pending panel'}`, async () => {
        const active = () => hall.evaluate(() => document.querySelector('.slide.is-active')?.getAttribute('aria-label') || '')
        if (i > 0) {
          if (phone) {
            for (let k = 0; k < 6 && !(await active()).endsWith(d.name); k++) { await scroll(VIEWPORTS.phone.height); await page.waitForTimeout(1500) }
          } else await press(hall.getByRole('button', { name: `Go to ${d.name}` }), phone)
        }
        await hall.waitForFunction((n) => document.querySelector('.slide.is-active')?.getAttribute('aria-label')?.endsWith(n), d.name, { timeout: 30000 })
        await page.waitForTimeout(4500) // the reveal plays once the camera has settled
        const s = await hall.evaluate(() => {
          const slide = document.querySelector('.slide.is-active')
          const img = slide?.querySelector('figure.portrait img')
          return { img: !!img, loaded: !!(img && img.complete && img.naturalWidth > 0), pending: slide?.querySelectorAll('.portrait-pending').length || 0, credit: slide?.querySelector('.portrait-credit')?.textContent.trim().length || 0 }
        })
        if (d.portrait && !(s.loaded && s.credit)) throw new Error(`portrait ${JSON.stringify(s)}`)
        if (!d.portrait && (s.img || s.pending !== 1)) throw new Error(`pending panel ${JSON.stringify(s)}`)
        await shot(page, `${m}-${vp}-slide-${d.slug}`)
      })
      if (ok2) last = d
      else break
    }
    // start a tour from the hall: the guide's offer on the slide shown ("Yes"); the frame goes to that tour
    if (last) {
      await step(m, vp, `axe, slides`, () => axe(page, m, vp, 'slides'))
      let tour = null
      await step(m, vp, `start a tour from the hall (the guide's "Yes" on ${last.name}'s slide)`, async () => {
        const yes = hall.locator('.guide.is-visible .guide-actions .btn-primary')
        await yes.waitFor({ state: 'visible', timeout: 20000 })
        await page.waitForTimeout(1500) // the panel's own fade-in delay
        await press(yes, phone)
        tour = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/tour.html', 'tour', 30000)
        if (!page.url().startsWith(url)) throw new Error(`the WordPress page navigated to ${page.url()}`)
      })
      if (tour) await tourChecks(m, vp, page, tour, last, async () => {})
      await step(m, vp, 'fullscreen is allowed in the frame (the museum fills the window already)', async () => {
        const f = frameWhere(page, (u) => isMuseum(u))
        if (!(await f.evaluate(() => document.fullscreenEnabled))) throw new Error('document.fullscreenEnabled is false in the frame')
      })
    }
    await step(m, vp, 'no horizontal overflow', async () => { const o = await overflow(page); if (o > 1) throw new Error(`the page scrolls sideways by ${o}px`) })
    await step(m, vp, 'no console error or failed request', async () => noErrors(errs))
  } catch (e) {
    fail(m, vp, `stopped: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

// ---- an inductee page: the in-page embed, then the link card ----
async function inducteePage(ctx, vp, WP, d, { m = `inductee-${d.slug}`, path = `/inductees/${d.page}/`, negative = false } = {}) {
  const phone = vp === 'phone'
  const { page, errs } = await visitorPage(ctx)
  const url = `${WP}${path}`
  let started = false
  try {
    await page.goto(url, { waitUntil: 'load' })
    if (!negative) {
      await step(m, vp, `URL ${path} (IHH's structure), title "${d.name}", placeholder, embed, card in that order`, async () => {
        await loggedOut(page)
        if (page.url() !== url) throw new Error(`landed on ${page.url()}`)
        const s = await page.evaluate(() => {
          const c = document.querySelector('.wp-block-post-content, .entry-content')
          return {
            title: document.querySelector('.wp-block-post-title, .entry-title')?.textContent.trim(),
            order: [...(c?.children || [])].map((el) => (el.tagName === 'P' ? `p:${el.textContent.trim().replace(/\u2019/g, "'")}` : el.querySelector('iframe') ? `frame:${el.querySelector('iframe').getAttribute('src')}` : el.tagName === 'A' ? `card:${el.getAttribute('href')}` : el.tagName)),
          }
        })
        const want = [`p:${PLACEHOLDER}`, `frame:${MUSEUM}/embed.html?inductee=${d.slug}`, `card:${MUSEUM}/tour.html?inductee=${d.slug}`]
        if (s.title !== d.name) throw new Error(`title "${s.title}"`)
        if (s.order.join('|') !== want.join('|')) throw new Error(`content ${JSON.stringify(s.order)}`)
      })
    }
    const frameSel = 'iframe[src*="embed.html"]'
    const centre = () => page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), frameSel)
    await step(m, vp, 'layout: the frame keeps its attributes and fits the column; no horizontal overflow', async () => {
      const l = await page.evaluate((s) => {
        const f = document.querySelector(s)
        const col = document.querySelector('.wp-block-post-title, .entry-title')
        const r = f?.getBoundingClientRect()
        const c = col?.getBoundingClientRect()
        return { r: r && { w: r.width, h: r.height, l: r.left, r: r.right }, c: c && { l: c.left, r: c.right, w: c.width }, allow: f?.getAttribute('allow'), afs: f?.hasAttribute('allowfullscreen'), sandbox: f?.getAttribute('sandbox'), o: document.documentElement.scrollWidth - innerWidth }
      }, frameSel)
      if (!l.r) throw new Error('no museum iframe on the page (stripped?)')
      note(m, vp, `frame ${Math.round(l.r.w)}x${Math.round(l.r.h)} in a ${Math.round(l.c?.w)}px column`)
      if (!/fullscreen/.test(l.allow || '') || !l.afs) throw new Error(`allow="${l.allow}" allowfullscreen=${l.afs}`)
      if (l.sandbox !== null) throw new Error(`a sandbox was added: ${l.sandbox}`)
      if (l.o > 1) throw new Error(`the page scrolls sideways by ${l.o}px`)
      if (l.c && (l.r.l < l.c.l - 1 || l.r.r > l.c.r + 1)) throw new Error(`the frame spills out of its column (${JSON.stringify(l.r)} / ${JSON.stringify(l.c)})`)
      if (l.r.h < 320) throw new Error(`frame only ${l.r.h}px tall`)
    })
    await centre()
    const emb = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/embed.html', 'embed')
    await step(m, vp, 'the frame loads: the poster with Start', async () => {
      await emb.getByRole('button', { name: 'Start the museum' }).waitFor({ timeout: 30000 })
      if (new URL(emb.url()).searchParams.get('inductee') !== (negative ? negative : d.slug)) throw new Error(`frame ${emb.url()}`)
    })
    if (!negative) {
      await page.waitForTimeout(800)
      await shot(page, `${m}-${vp}-page`)
      await step(m, vp, 'axe, page and poster', () => axe(page, m, vp, 'poster'))
    }
    let tour = null
    await step(m, vp, `Start (${phone ? 'tap' : 'click'}) loads the tour in the frame`, async () => {
      await press(emb.getByRole('button', { name: 'Start the museum' }), phone)
      tour = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/tour.html', 'tour', 30000)
    })
    if (!tour) return false
    if (negative) {
      // the negative control: the same check, on a frame whose slug is misspelt, must fail
      await tour.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
      try {
        await rightInductee(tour, d)
        return true // the check passed: wrong
      } catch (e) {
        note(m, vp, `the check reports: ${e.message}`)
        return false
      }
    }
    started = await tourChecks(m, vp, page, tour, d, centre)
    await step(m, vp, `Fullscreen (${phone ? 'tap' : 'click'}) enters and leaves`, async () => {
      const fs = emb.getByRole('button', { name: 'Fullscreen' })
      await centre()
      await press(fs, phone)
      await page.waitForTimeout(800)
      if (!(await emb.evaluate(() => !!document.fullscreenElement))) throw new Error('did not enter fullscreen')
      if ((await fs.getAttribute('aria-pressed')) !== 'true') throw new Error('aria-pressed did not turn true')
      await shot(page, `${m}-${vp}-fullscreen`)
      await press(fs, phone)
      await page.waitForTimeout(800)
      if (await emb.evaluate(() => !!document.fullscreenElement)) throw new Error('did not leave fullscreen')
    })
    if (started) await step(m, vp, 'axe, tour', () => axe(page, m, vp, 'tour'))
    await step(m, vp, `the link card (${phone ? 'tap' : 'click'}) opens ${d.name}'s tour in a new tab`, async () => {
      const a = page.locator(`a[href="${MUSEUM}/tour.html?inductee=${d.slug}"]`)
      await a.scrollIntoViewIfNeeded()
      const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 15000 }), press(a, phone)])
      await popup.waitForLoadState('domcontentloaded')
      if (popup.url() !== `${MUSEUM}/tour.html?inductee=${d.slug}`) throw new Error(`tab opened ${popup.url()}`)
      await popup.close()
      if (!page.url().startsWith(url)) throw new Error(`the WordPress page navigated to ${page.url()}`)
    })
    await step(m, vp, 'no horizontal overflow after the tour', async () => { const o = await overflow(page); if (o > 1) throw new Error(`the page scrolls sideways by ${o}px`) })
    await step(m, vp, 'no console error or failed request', async () => noErrors(errs))
  } catch (e) {
    fail(m, vp, `stopped: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

// ---- the Inductees page and the header menu ----
async function menuChecks(ctx, vp, WP, m = 'menu') {
  const phone = vp === 'phone'
  const { page, errs } = await visitorPage(ctx)
  try {
    await page.goto(`${WP}/inductees/`)
    await step(m, vp, 'the Inductees page', async () => {
      await loggedOut(page)
      const t = await page.locator('.wp-block-post-title').first().innerText()
      if (t.trim() !== 'Inductees') throw new Error(`title "${t}"`)
      const o = await overflow(page)
      if (o > 1) throw new Error(`the page scrolls sideways by ${o}px`)
    })
    await step(m, vp, 'axe, Inductees page', () => axe(page, m, vp, 'inductees'))
    const nav = page.locator('header .wp-block-navigation').first()
    await step(m, vp, 'the header menu lists the Virtual Museum and the five inductee pages', async () => {
      const links = await nav.locator('a.wp-block-navigation-item__content').evaluateAll((as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]))
      const want = MENU.map((x) => [x.label, x.path])
      if (JSON.stringify(links) !== JSON.stringify(want)) throw new Error(`menu ${JSON.stringify(links)}`)
    })
    await shot(page, `inductees-${vp}`)
    const target = INDUCTEES[2]
    await step(m, vp, `a menu link (${phone ? 'tap the menu button, then the link' : 'click'}) opens ${target.name}'s page`, async () => {
      if (phone) {
        await press(nav.locator('.wp-block-navigation__responsive-container-open'), phone)
        await nav.locator('.wp-block-navigation__responsive-container.is-menu-open').waitFor({ timeout: 10000 })
        await page.waitForTimeout(600)
        await shot(page, `menu-${vp}-open`)
      }
      await Promise.all([page.waitForURL(`${WP}/inductees/${target.page}/`, { timeout: 30000 }), press(nav.getByRole('link', { name: target.name }), phone)])
    })
    await step(m, vp, 'a menu link opens the Virtual Museum', async () => {
      const nav2 = page.locator('header .wp-block-navigation').first()
      if (phone) {
        await press(nav2.locator('.wp-block-navigation__responsive-container-open'), phone)
        await nav2.locator('.wp-block-navigation__responsive-container.is-menu-open').waitFor({ timeout: 10000 })
        await page.waitForTimeout(600)
      }
      await Promise.all([page.waitForURL(`${WP}/virtual-museum/`, { timeout: 30000 }), press(nav2.getByRole('link', { name: 'Virtual Museum' }), phone)])
    })
    await step(m, vp, 'no console error or failed request', async () => noErrors(errs))
  } catch (e) {
    fail(m, vp, `stopped: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

// ---- the imported site (the package's blueprint on a fresh WordPress) ----
async function importedChecks(browser, WP2) {
  const m = 'imported'
  const vp = 'desktop'
  // its admin (the blueprint signs in as the default admin) reads the pages, the template and the menus
  const admin = await browser.newContext({ viewport: VIEWPORTS.desktop })
  try {
    const page = await admin.newPage()
    await page.goto(`${WP2}/wp-admin/post-new.php?post_type=page`)
    await page.waitForFunction(() => window.wp?.apiFetch, null, { timeout: 120000 })
    const s = await page.evaluate(async () => {
      const f = (path) => window.wp.apiFetch({ path })
      const pages = await f('/wp/v2/pages?per_page=100&status=publish&context=edit&_fields=id,slug,parent,link,template,content')
      const templates = await f('/wp/v2/templates?_fields=slug,title,content')
      const navs = await f('/wp/v2/navigation?_fields=id,title,content&context=edit')
      const menus = await f('/wp/v2/menus')
      const items = menus.length ? await f(`/wp/v2/menu-items?menus=${menus[0].id}&per_page=100`) : []
      return {
        pages: pages.map((p) => ({ id: p.id, slug: p.slug, parent: p.parent, link: p.link, template: p.template, raw: p.content.raw })),
        templates: templates.map((t) => ({ slug: t.slug, content: t.content?.raw || '' })),
        navs: navs.map((n) => n.content.raw),
        menus: menus.map((x) => x.name),
        items: items.map((i) => ({ title: i.title.rendered, object_id: i.object_id, order: i.menu_order })),
      }
    })
    const bySlug = Object.fromEntries(s.pages.map((p) => [p.slug, p]))
    await step(m, vp, 'the seven pages, the Inductees parent and IHH\'s URLs', async () => {
      const par = bySlug.inductees
      if (!par || !bySlug['virtual-museum']) throw new Error(`pages ${Object.keys(bySlug)}`)
      for (const d of INDUCTEES) {
        const p = bySlug[d.page]
        if (!p) throw new Error(`no ${d.page}`)
        if (p.parent !== par.id) throw new Error(`${d.page} parent ${p.parent}, not ${par.id}`)
        if (p.link !== `${WP2}/inductees/${d.page}/`) throw new Error(`${d.page} at ${p.link}`)
        if (!p.raw.includes(`embed.html?inductee=${d.slug}"`) || !p.raw.includes('<iframe') || !p.raw.includes(PLACEHOLDER)) throw new Error(`${d.page}: the embed, the iframe or the placeholder did not survive the import`)
      }
    })
    await step(m, vp, 'the template, assigned to the Virtual Museum page', async () => {
      const t = s.templates.find((x) => x.slug === TEMPLATE)
      if (!t) throw new Error(`templates ${s.templates.map((x) => x.slug)}`)
      if (!/wp:post-content/.test(t.content) || /wp:template-part|wp:post-title/.test(t.content)) throw new Error(`template content ${t.content}`)
      if (bySlug['virtual-museum'].template !== TEMPLATE) throw new Error(`the page's template is "${bySlug['virtual-museum'].template}"`)
    })
    await step(m, vp, 'the header menu and the classic menu', async () => {
      const nav = s.navs.find((c) => MENU.every((x) => c.includes(`"url":"${x.path}"`)))
      if (!nav) throw new Error(`${s.navs.length} wp_navigation menus, none with the six links`)
      const ids = [bySlug['virtual-museum'].id, ...INDUCTEES.map((d) => bySlug[d.page].id)]
      const got = s.items.sort((a, b) => a.order - b.order).map((i) => i.object_id)
      if (s.menus[0] !== 'Virtual Museum menu' || got.join() !== ids.join()) throw new Error(`classic menu ${s.menus} items ${got} (pages ${ids})`)
    })
    await page.close()
  } catch (e) {
    fail(m, vp, `admin read: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await admin.close()
  }
  const ctx = await visitorContext(browser, 'desktop', WP2)
  try {
    await museumPageLite(ctx, WP2)
    await inducteeLite(ctx, WP2, INDUCTEES[0])
    await menuChecks(ctx, 'desktop', WP2, 'imported-menu')
  } finally {
    await ctx.close()
  }
}
// on the imported site: the full-page frame and the landing load; the inductee embed starts the right tour
async function museumPageLite(ctx, WP) {
  const m = 'imported'
  const vp = 'desktop'
  const { page, errs } = await visitorPage(ctx)
  try {
    await page.goto(`${WP}/virtual-museum/`)
    await step(m, vp, 'Virtual Museum: no header or footer, the frame fills the window, the landing loads', async () => {
      const l = await page.evaluate(() => ({ chrome: document.querySelectorAll('header.wp-block-template-part, footer.wp-block-template-part, .wp-block-post-title').length, r: document.querySelector('iframe')?.getBoundingClientRect().toJSON(), vw: innerWidth, vh: innerHeight, sh: document.documentElement.scrollHeight }))
      if (l.chrome || !l.r || Math.abs(l.r.width - l.vw) > 1 || Math.abs(l.r.height - l.vh) > 1 || l.sh > l.vh + 1) throw new Error(JSON.stringify(l))
      const hall = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/', 'museum front page')
      await hall.getByRole('button', { name: 'Walk their journeys' }).waitFor({ state: 'visible', timeout: 60000 })
      await page.waitForTimeout(2500)
      await shot(page, 'imported-virtual-museum-desktop')
    })
    await step(m, vp, 'Virtual Museum: no console error or failed request', async () => noErrors(errs))
  } finally {
    await page.close()
  }
}
async function inducteeLite(ctx, WP, d) {
  const m = 'imported'
  const vp = 'desktop'
  const { page, errs } = await visitorPage(ctx)
  try {
    await page.goto(`${WP}/inductees/${d.page}/`)
    await step(m, vp, `${d.name}: the embed starts ${d.name}'s tour`, async () => {
      await page.evaluate(() => document.querySelector('iframe[src*="embed.html"]').scrollIntoView({ block: 'center' }))
      const emb = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/embed.html', 'embed')
      await emb.getByRole('button', { name: 'Start the museum' }).click({ timeout: 30000 })
      const tour = await waitFrame(page, (u) => isMuseum(u) && u.pathname === '/tour.html', 'tour', 30000)
      await tour.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
      await rightInductee(tour, d)
      await shot(page, `imported-inductee-${d.slug}-desktop`)
    })
    await step(m, vp, `${d.name}: no console error or failed request`, async () => noErrors(errs))
  } finally {
    await page.close()
  }
}

// a logged-out visitor with a fresh browser context
async function visitorContext(browser, vp, WP) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], ...(vp === 'phone' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) })
  // Playground signs every new browser in unless this cookie is set
  await ctx.addCookies([{ name: 'playground_auto_login_already_happened', value: '1', url: WP }])
  await ctx.addInitScript(() => {
    window.__plays = 0
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...a) { return play.apply(this, a).then((r) => { window.__plays++; return r }) }
  })
  return ctx
}

// ---- main ----
const SHELL = (() => {
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (!existsSync(cache)) return null
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))) {
    for (const sub of readdirSync(join(cache, b))) {
      const exe = join(cache, b, sub, 'chrome-headless-shell')
      if (existsSync(exe)) return exe
    }
  }
  return null
})()

console.log(`museum ${MUSEUM}`)
mkdirSync(SHOTS, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'ihh-wp-site-'))
writeFileSync(join(tmp, 'build.json'), JSON.stringify(buildBlueprint, null, 2))
const wp = await bootWordPress(join(tmp, 'build.json'), PORT)
console.log(`WordPress ${wp.url}`)
const browser = await chromium.launch({
  ...(SHELL ? { executablePath: SHELL } : {}),
  args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=user-gesture-required'],
})
let wp2 = null
try {
  const admin = await browser.newContext({ viewport: VIEWPORTS.desktop, acceptDownloads: true })
  const created = await buildSite(admin, wp.url)
  console.log(JSON.stringify({ template: created.template, pages: created.pages, classicMenu: created.classicMenu }, null, 1))
  for (const d of INDUCTEES) {
    const p = created.pages[d.slug]
    if (p.link !== `${wp.url}/inductees/${d.page}/` || p.parent !== created.pages.inductees.id) fail('build', '-', `${d.page}: at ${p.link}, parent ${p.parent}`)
  }
  if (created.pages.museum.template !== TEMPLATE) fail('build', '-', `the Virtual Museum page's template is "${created.pages.museum.template}"`)
  else ok('build', '-', `built by ${EDITOR}: the template, seven pages, two menus`)
  // fix round 12 (owner report: in a 1000 x 570 window, signed in, the record viewer's card ran off the right edge and
  // the page scrolled): signed in, the admin bar shows; the museum's frame must fill the window below it, never past the
  // window's visible width or height (clientWidth / clientHeight: without a scrollbar's room), and the page not scroll
  for (const size of [{ width: 1000, height: 570 }, { width: 1280, height: 600 }]) {
    const page = await admin.newPage()
    await page.setViewportSize(size)
    await page.goto(`${wp.url}/virtual-museum/`, { waitUntil: 'load' })
    const l = await page.evaluate(() => {
      const r = document.querySelector('iframe').getBoundingClientRect()
      const bar = document.querySelector('#wpadminbar')?.getBoundingClientRect()
      const d = document.documentElement
      return { r: { l: r.left, t: r.top, r: r.right, b: r.bottom }, bar: bar ? bar.bottom : null, cw: d.clientWidth, ch: d.clientHeight, sw: d.scrollWidth, sh: d.scrollHeight }
    })
    const tag = `signed in, ${size.width}x${size.height}`
    const bad = []
    if (l.bar == null) bad.push('no admin bar (not signed in?)')
    else if (Math.abs(l.r.t - l.bar) > 0.5) bad.push(`the frame starts at ${l.r.t}, the admin bar ends at ${l.bar}`)
    if (Math.abs(l.r.l) > 0.5 || Math.abs(l.r.r - l.cw) > 1 || Math.abs(l.r.b - l.ch) > 1) bad.push(`the frame ${JSON.stringify(l.r)} is not the window's visible ${l.cw}x${l.ch}`)
    if (l.sh > l.ch + 1 || l.sw > l.cw + 1) bad.push(`the page scrolls (${l.sw}x${l.sh} for ${l.cw}x${l.ch})`)
    if (bad.length) fail('virtual-museum', tag, bad.join('; '))
    else ok('virtual-museum', tag, `the frame fills the window below the admin bar (${Math.round(l.r.r - l.r.l)}x${Math.round(l.r.b - l.r.t)} at 0,${Math.round(l.r.t)}); the page does not scroll`)
    await page.close()
  }
  // the import package: WordPress's own export, and the blueprint that imports it
  const xml = await exportSite(admin, wp.url)
  checkWxr(xml)
  writeFileSync(join(PKG, 'blueprint.json'), `${JSON.stringify(packageBlueprint, null, 2)}\n`)
  // the negative control, added after the export so it never ships: an embed with a misspelt slug
  const neg = { slug: 'albright', name: 'Madeleine Albright', page: 'negative-control' }
  {
    const page = await admin.newPage()
    await blockEditorPage(page, wp.url, { title: 'Negative control', slug: neg.page }, `<!-- wp:html -->\n${SNIPPET.replace(`${MUSEUM}/embed.html"`, `${MUSEUM}/embed.html?inductee=albrigt"`)}\n<!-- /wp:html -->`)
    await publish(page, ['inductee=albrigt'])
    await page.close()
  }
  await admin.close()

  for (const vp of Object.keys(VIEWPORTS)) {
    console.log(`viewport ${vp}`)
    const ctx = await visitorContext(browser, vp, wp.url)
    await museumPage(ctx, vp, wp.url, created)
    for (const d of INDUCTEES) await inducteePage(ctx, vp, wp.url, d)
    await menuChecks(ctx, vp, wp.url)
    if (vp === 'desktop') {
      const passed = await inducteePage(ctx, vp, wp.url, neg, { m: 'negative-control', path: `/${neg.page}/`, negative: 'albrigt' })
      if (passed !== false) fail('negative-control', vp, 'the "right inductee" check passed on a frame whose slug is misspelt (albrigt): it is not checking the tour that started')
      else ok('negative-control', vp, 'a misspelt slug (albrigt) fails the "right inductee" check, as it must')
    }
    await ctx.close()
  }
  if (!KEEP) wp.stop()

  // a fresh WordPress from the package's blueprint: does the import reproduce the site?
  console.log('import: a fresh WordPress from docs/revamp/wordpress-site/blueprint.json')
  // the package's blueprint reads the export next to it (a "bundled" resource), which the CLI allows only with this option
  wp2 = await bootWordPress(join(PKG, 'blueprint.json'), PORT + 1, ['--blueprint-may-read-adjacent-files'])
  console.log(`WordPress (imported) ${wp2.url}`)
  await importedChecks(browser, wp2.url)
} catch (e) {
  fail('setup', '-', String(e.stack || e))
} finally {
  await browser.close()
  if (KEEP) console.log(`WordPress left running at ${wp.url}`)
  else wp.stop()
  wp2?.stop()
}

console.log('\nresults')
for (const [m, vps] of Object.entries(results)) for (const [vp, notes] of Object.entries(vps)) console.log(`${m} ${vp}\n  ${notes.join('\n  ')}`)
console.log(fails ? `\n${fails} FAIL` : '\nwordpress-site: every page passes')
process.exit(fails ? 1 : 0)
