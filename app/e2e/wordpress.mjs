// The museum inside a real WordPress (WordPress Playground, @wp-playground/cli, run locally; it logs in to
// its own local admin, no account and no external sign-in). It creates the pages an IHH editor would make,
// through the editors themselves, and checks each one on a desktop (1280x800) and a phone (390x844):
//   block      a Custom HTML block with the iframe snippet (docs/revamp/wordpress-embed.md), block editor
//   classic    the same snippet in the Classic editor (Text tab, then a round trip through Visual)
//   embed      the core Embed block with the museum URL pasted (no oEmbed endpoint: expected to fall back)
//   card       the "Open the museum" link card in a Custom HTML block
//   narrow     the block page again under a classic theme with a narrow column (Twenty Twenty-One);
//              the default theme (Twenty Twenty-Five) is the block page itself
//   author     the snippet saved by an Author (no unfiltered_html): WordPress strips the iframe
// Per iframe page: the poster shows, Start is reachable by Tab from the top of the WordPress page and loads
// the tour, audio plays only after the Begin tap, Fullscreen enters and leaves, no horizontal overflow, the
// frame fits the content column, no console error or failed request, axe (WCAG 2.x A/AA + best practice)
// finds no violation in the frame or in our markup. The block page also runs a chapter link (the end of
// Naismith's tour: "Next inductee" opens Einstein's tour in the frame) and a record link (?viewer=: the
// record shows and "View at the holder" opens a tab). The card opens the museum in a new tab.
// Screenshots: app/mockup-shots/wordpress/<method>-<theme>-<desktop|phone>-<state>.jpg
//
// Needs network (WordPress, the theme and the Classic Editor plugin come from wordpress.org; the museum is
// the deployed site), Node 22+ for the Playground CLI (tested with Node 24), and about 10 minutes. Not part of the default gate.
// usage: MUSEUM_URL=https://... node e2e/wordpress.mjs [method ...] [--keep]   (npm run e2e:wordpress)
//   MUSEUM_URL defaults to the version 3 preview; --keep leaves WordPress running at the end.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium, loadAxe } = await import('./browser.mjs')
const AxeBuilder = await loadAxe()

const MUSEUM = (process.env.MUSEUM_URL || 'https://ihh-turning-points-b8arwpweq-ihh4.vercel.app').replace(/\/$/, '')
const PLAYGROUND = '@wp-playground/cli@3.1.61'
const PORT = Number(process.env.WP_PORT || 9420)
const SHOTS = fileURLToPath(new URL('../mockup-shots/wordpress/', import.meta.url))
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const VIEWER = 'EIN-M-0013'
const SOURCE = 'https://catalog.archives.gov/id/276538325' // EIN-M-0013's source (tour/data/einstein-artifacts.js)
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } }
const args = process.argv.slice(2)
const KEEP = args.includes('--keep')
const METHODS = ['block', 'classic', 'embed', 'card', 'narrow', 'author']
const only = args.filter((a) => !a.startsWith('--'))
for (const m of only) if (!METHODS.includes(m)) { console.error(`unknown method ${m} (${METHODS.join(', ')})`); process.exit(1) }
const run = new Set(only.length ? only : METHODS)

// the copy-paste snippets, read from the guide itself (docs/revamp/wordpress-embed.md: its first html
// block is the iframe, its second the link card), with the placeholder replaced
const GUIDE = readFileSync(new URL('../../docs/revamp/wordpress-embed.md', import.meta.url), 'utf8')
const [SNIPPET, CARD] = [...GUIDE.matchAll(/```html\n([\s\S]*?)\n```/g)].map((x) => x[1].replaceAll('https://YOUR-MUSEUM-URL', MUSEUM))
if (!SNIPPET?.includes('<iframe') || !SNIPPET.includes(`${MUSEUM}/embed.html"`) || !CARD?.startsWith('<a ')) throw new Error('the guide no longer starts with the iframe snippet and the link card')
const iframe = (query = '') => SNIPPET.replace(`${MUSEUM}/embed.html"`, `${MUSEUM}/embed.html${query}"`)
const card = CARD

// ---- WordPress Playground ----
// A must-use plugin lets one request render under another installed theme (?wptheme=twentytwentyone), so
// the same page is checked in two themes without switching the site's theme.
const MU = `<?php
// e2e only: render this request under the theme named in ?wptheme= (an installed theme folder)
if (!empty($_GET['wptheme'])) {
  $t = preg_replace('/[^a-z0-9-]/', '', $_GET['wptheme']);
  add_filter('stylesheet', function () use ($t) { return $t; });
  add_filter('template', function () use ($t) { return $t; });
}
`
// An Author has no unfiltered_html: the same Custom HTML block saved by an Author loses its iframe
// (kses). The account is local to this throwaway Playground site and never signs in.
const AUTHOR_PHP = `<?php require '/wordpress/wp-load.php';
update_option('classic-editor-replace', 'block');
update_option('classic-editor-allow-users', 'allow');
$u = wp_insert_user(['user_login' => 'e2e-author', 'user_pass' => wp_generate_password(24), 'role' => 'author', 'user_email' => 'e2e-author@example.test']);
wp_set_current_user($u);
kses_init();
wp_insert_post(['post_type' => 'post', 'post_status' => 'publish', 'post_title' => 'Museum (saved by an Author)', 'post_name' => 'museum-author',
  'post_content' => ${JSON.stringify(`<!-- wp:html -->\n${iframe()}\n<!-- /wp:html -->`).replace(/\$/g, '\\$')}]);
`
const blueprint = {
  preferredVersions: { php: '8.3', wp: 'latest' },
  login: true,
  steps: [
    { step: 'installTheme', themeData: { resource: 'wordpress.org/themes', slug: 'twentytwentyone' }, options: { activate: false } },
    { step: 'installPlugin', pluginData: { resource: 'wordpress.org/plugins', slug: 'classic-editor' }, options: { activate: true } },
    { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/e2e-theme-switch.php', data: MU },
    { step: 'runPHP', code: AUTHOR_PHP },
  ],
}

async function bootWordPress() {
  const dir = mkdtempSync(join(tmpdir(), 'ihh-wp-'))
  const bp = join(dir, 'blueprint.json')
  writeFileSync(bp, JSON.stringify(blueprint, null, 2))
  // npx from the same Node install that runs this script
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH}` }
  const child = spawn('npx', ['-y', PLAYGROUND, 'server', `--port=${PORT}`, '--workers=2', `--blueprint=${bp}`], { env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
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
  return { url, stop: () => { try { process.kill(-child.pid, 'SIGTERM') } catch { /* already gone */ } } }
}

// ---- results ----
let fails = 0
const results = {} // method -> viewport -> [notes]
const note = (m, vp, s) => ((results[m] ??= {})[vp] ??= []).push(s)
const fail = (m, vp, s) => { fails++; note(m, vp, `FAIL ${s}`); console.log(`  FAIL [${m} ${vp}] ${s}`) }
const ok = (m, vp, s) => { note(m, vp, s); console.log(`  ok   [${m} ${vp}] ${s}`) }
const step = async (m, vp, tag, fn) => {
  try {
    const r = await fn()
    if (r !== false) ok(m, vp, tag)
  } catch (e) {
    fail(m, vp, `${tag}: ${String(e.message || e).split('\n')[0]}`)
  }
}

// ---- the editors: create the pages the way an editor does ----
async function blockEditorPage(page, WP, title, blocks) {
  await page.goto(`${WP}/wp-admin/post-new.php?post_type=page`)
  await page.waitForFunction(() => window.wp?.data?.select('core/editor')?.getCurrentPostId?.(), null, { timeout: 120000 })
  await page.evaluate(() => {
    const p = window.wp.data.dispatch('core/preferences')
    p.set('core/edit-post', 'welcomeGuide', false)
    p.set('core', 'enableChoosePatternModal', false)
  })
  await page.keyboard.press('Escape') // a starter-pattern or welcome modal, if one opened before the preference landed
  await page.evaluate(({ title, blocks }) => {
    const { dispatch } = window.wp.data
    dispatch('core/editor').editPost({ title })
    // a string is block markup, as the Code editor or a paste gives it; [name, attrs] is a new block
    const list = typeof blocks === 'string' ? window.wp.blocks.parse(blocks) : blocks.map(([name, attrs]) => window.wp.blocks.createBlock(name, attrs))
    dispatch('core/block-editor').insertBlocks(list)
  }, { title, blocks })
}
async function publish(page, expect) {
  await page.evaluate(async (expect) => {
    const { dispatch, select } = window.wp.data
    if (expect && !select('core/editor').getEditedPostContent().includes(expect)) throw new Error(`the editor content lacks ${expect}`)
    dispatch('core/editor').editPost({ status: 'publish' })
    await dispatch('core/editor').savePost()
    const saved = select('core/editor').getCurrentPost()
    if (saved.status !== 'publish') throw new Error('the page did not publish')
  }, expect)
  return page.evaluate(() => window.wp.data.select('core/editor').getCurrentPost().link)
}

async function createPages(ctx, WP) {
  const page = await ctx.newPage()
  const out = {}
  // auto-login happens on the first request
  await page.goto(`${WP}/wp-admin/`)
  await page.waitForSelector('#wpadminbar', { timeout: 120000 })

  // (a) Custom HTML block, plus a chapter link and a record link on their own pages
  for (const [key, title, html] of [['block', 'Museum (Custom HTML block)', iframe()], ['next', 'Museum (chapter link)', iframe('?inductee=naismith&chapter=honoured')], ['viewer', 'Museum (record link)', iframe(`?viewer=${VIEWER}`)], ['card', 'Museum (link card)', card]]) {
    await blockEditorPage(page, WP, title, `<!-- wp:html -->\n${html}\n<!-- /wp:html -->`)
    out[key] = await publish(page, html.slice(0, 30))
  }

  // (b) the core Embed block with the museum URL: WordPress asks its oEmbed proxy, which finds no endpoint
  await blockEditorPage(page, WP, 'Museum (Embed block)', [['core/embed', { url: `${MUSEUM}/embed.html` }]])
  const canvas = () => page.frame({ name: 'editor-canvas' }) || page.mainFrame()
  const sorry = canvas().getByText(/could not be embedded|Sorry/i).first()
  await sorry.waitFor({ timeout: 60000 }).catch(() => {})
  out.embedEditorMessage = (await sorry.isVisible().catch(() => false)) ? (await sorry.innerText()).trim() : '(no message)'
  out.embedEditorButtons = await canvas().locator('.wp-block-embed button').allInnerTexts().catch(() => [])
  mkdirSync(SHOTS, { recursive: true })
  await page.screenshot({ path: join(SHOTS, 'embed-block-editor.jpg'), quality: 80 })
  out.embed = await publish(page)
  // the same, then the editor's own "Convert to link"
  await blockEditorPage(page, WP, 'Museum (Embed block, converted to a link)', [['core/embed', { url: `${MUSEUM}/embed.html` }]])
  await canvas().getByRole('button', { name: 'Convert to link' }).click({ timeout: 60000 })
  out.embedLink = await publish(page, `href="${MUSEUM}/embed.html"`)

  // (c) Classic editor: the snippet in the Text tab, then Visual and back (TinyMCE re-serialises it)
  await page.goto(`${WP}/wp-admin/post-new.php?post_type=page&classic-editor&classic-editor__forget`)
  await page.fill('#title', 'Museum (Classic editor)')
  await page.click('#content-html')
  await page.fill('#content', `<p>The museum:</p>\n${iframe()}\n<p>Below the museum.</p>`)
  await page.click('#content-tmce')
  await page.waitForTimeout(1500)
  await page.click('#content-html')
  out.classicText = await page.inputValue('#content')
  await page.screenshot({ path: join(SHOTS, 'classic-editor.jpg'), quality: 80 })
  await page.click('#publish')
  await page.waitForURL(/post\.php\?post=\d+/, { timeout: 60000 })
  out.classic = await page.locator('#sample-permalink a, #message a').first().getAttribute('href')

  // the Author's post (created by the blueprint)
  out.author = `${WP}/?name=museum-author`
  await page.close()
  return out
}

// ---- the checks ----
const frameBy = (page, part) => page.frames().find((f) => f.url().includes(part))
async function waitFrame(page, part, ms = 60000) {
  for (let i = 0; i < ms / 100; i++) {
    const f = frameBy(page, part)
    if (f) return f
    await page.waitForTimeout(100)
  }
  throw new Error(`no ${part} frame`)
}
const shot = async (page, name) => page.screenshot({ path: join(SHOTS, `${name}.jpg`), quality: 78 })

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

async function layout(page) {
  return page.evaluate(() => {
    const f = document.querySelector('iframe[src*="embed.html"]')
    // the text column: the page title sits in it in both themes
    const col = document.querySelector('.wp-block-post-title, .entry-title')
    const r = f?.getBoundingClientRect()
    const c = col?.getBoundingClientRect()
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      frame: r && { w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right) },
      column: c && { w: Math.round(c.width), l: Math.round(c.left), r: Math.round(c.right) },
      attrs: f && { allow: f.getAttribute('allow'), allowfullscreen: f.hasAttribute('allowfullscreen'), title: f.getAttribute('title'), sandbox: f.getAttribute('sandbox') },
    }
  })
}

// axe on the whole WordPress page (frames included); violations in the museum frame or in our snippet
// fail, the theme's own are listed
async function axe(page, m, vp, tag) {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  const ours = []
  const theirs = []
  for (const v of r.violations) {
    for (const n of v.nodes) {
      const inFrame = n.target.length > 1
      const ourMarkup = /embed\.html|Immigrant Hall of Honor/.test(n.html)
      ;(inFrame || ourMarkup ? ours : theirs).push(`${v.id}: ${n.target.join(' >> ')}`)
    }
  }
  for (const o of ours) fail(m, vp, `axe ${tag}: ${o}`)
  if (theirs.length) note(m, vp, `theme axe findings (not ours): ${[...new Set(theirs.map((t) => t.split(':')[0]))].join(', ')}`)
  return ours.length === 0
}

// Tab from the top of the WordPress page until focus is on the museum's Start button
async function tabToStart(page) {
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
  for (let i = 1; i <= 80; i++) {
    await page.keyboard.press('Tab')
    const emb = frameBy(page, 'embed.html')
    if (emb && (await emb.evaluate(() => document.activeElement?.id === 'start' && document.hasFocus()).catch(() => false))) return i
  }
  throw new Error('Start is not reachable with Tab within 80 presses')
}

async function iframePage(ctx, m, vp, url, theme) {
  const page = await ctx.newPage()
  const errs = watch(page)
  const name = `${m}-${theme}-${vp}`
  try {
    await page.goto(url + (url.includes('?') ? '&' : '?') + `wptheme=${theme}`, { waitUntil: 'load' })
    await step(m, vp, 'iframe kept with its attributes', async () => {
      const l = await layout(page)
      if (!l.frame) throw new Error('no museum iframe on the page (stripped?)')
      note(m, vp, `iframe attributes after saving: allow=${JSON.stringify(l.attrs.allow)} allowfullscreen=${l.attrs.allowfullscreen}`)
      if (!/fullscreen/.test(l.attrs.allow || '') && !l.attrs.allowfullscreen) throw new Error('neither allow="fullscreen" nor allowfullscreen survived')
      if (l.attrs.sandbox !== null) throw new Error(`a sandbox was added: ${l.attrs.sandbox}`)
    })
    if (!(await page.locator('iframe[src*="embed.html"]').count())) return
    await page.locator('iframe[src*="embed.html"]').scrollIntoViewIfNeeded()
    const emb = await waitFrame(page, 'embed.html')
    await step(m, vp, 'poster shows', async () => {
      await emb.getByRole('heading', { name: 'Immigrant Hall of Honor' }).waitFor({ state: 'attached', timeout: 30000 })
      await emb.getByRole('button', { name: 'Start the museum' }).waitFor({ timeout: 30000 })
    })
    await step(m, vp, 'layout', async () => {
      const l = await layout(page)
      note(m, vp, `frame ${l.frame.w}x${l.frame.h} in a ${l.column?.w}px column, overflow ${l.overflow}px`)
      if (l.overflow > 1) throw new Error(`the page scrolls sideways by ${l.overflow}px`)
      if (l.column && (l.frame.l < l.column.l - 1 || l.frame.r > l.column.r + 1)) throw new Error(`frame ${JSON.stringify(l.frame)} spills out of its column ${JSON.stringify(l.column)}`)
      if (l.frame.h < 320) throw new Error(`frame only ${l.frame.h}px tall`)
    })
    await shot(page, `${name}-poster`)
    await step(m, vp, 'axe, poster', () => axe(page, m, vp, 'poster'))
    let presses = 0
    await step(m, vp, 'Tab reaches Start', async () => { presses = await tabToStart(page); note(m, vp, `Start reached after ${presses} Tab presses`) })
    await step(m, vp, 'Start (Enter) loads the tour', async () => {
      if (presses) await page.keyboard.press('Enter')
      else await emb.getByRole('button', { name: 'Start the museum' }).click()
      const tour = await waitFrame(page, 'tour.html')
      await tour.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
      if (!(await tour.evaluate(() => document.hasFocus()))) note(m, vp, 'focus did not move into the tour frame')
    })
    const tour = frameBy(page, 'tour.html')
    await step(m, vp, 'audio only after the Begin tap', async () => {
      if ((await tour.evaluate(() => window.__plays)) !== 0) throw new Error('audio played before any tap')
      // Chrome does not let a cross-origin frame scroll the WordPress page, so Playwright cannot bring a
      // control inside the tour into view; a visitor scrolls the page. Centre the frame first.
      await page.evaluate(() => document.querySelector('iframe[src*="embed.html"]').scrollIntoView({ block: 'center' }))
      await tour.getByRole('button', { name: /Begin the tour/ }).click()
      await tour.waitForFunction(() => window.__plays > 0, null, { timeout: 30000 })
      await tour.getByRole('button', { name: 'Mute guide' }).waitFor({ timeout: 5000 })
    })
    await step(m, vp, 'first room ready', async () => {
      await tour.locator('main[data-chapter]').waitFor({ timeout: 60000 })
      if ((await tour.locator('main').getAttribute('data-phase')) === 'map') await tour.locator('[data-hud=next]').click({ timeout: 15000 })
      await tour.locator('main[data-phase="room"][data-ready="true"]').waitFor({ timeout: 120000 })
      if (await tour.locator('[data-room-error]').isVisible()) throw new Error(await tour.locator('[data-room-error]').innerText())
    })
    await page.waitForTimeout(1500)
    await shot(page, `${name}-tour`)
    await step(m, vp, 'axe, tour', () => axe(page, m, vp, 'tour'))
    await step(m, vp, 'fullscreen enters and leaves', async () => {
      const fs = emb.getByRole('button', { name: 'Fullscreen' })
      await fs.click()
      await page.waitForTimeout(800)
      if (!(await emb.evaluate(() => !!document.fullscreenElement))) throw new Error('did not enter fullscreen')
      await shot(page, `${name}-fullscreen`)
      await fs.click()
      await page.waitForTimeout(800)
      if (await emb.evaluate(() => !!document.fullscreenElement)) throw new Error('did not leave fullscreen')
    })
    await step(m, vp, 'no horizontal overflow after the tour started', async () => {
      const l = await layout(page)
      if (l.overflow > 1) throw new Error(`the page scrolls sideways by ${l.overflow}px`)
    })
    await step(m, vp, 'no console error or failed request', async () => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) })
  } finally {
    await page.close()
  }
}

// the end of Naismith's tour offers "Next inductee": it opens Einstein's tour inside the same frame
async function nextInductee(ctx, vp, url) {
  const m = 'block'
  const page = await ctx.newPage()
  const errs = watch(page)
  try {
    await page.goto(url)
    await page.locator('iframe[src*="embed.html"]').scrollIntoViewIfNeeded()
    const emb = await waitFrame(page, 'embed.html')
    await emb.getByRole('button', { name: 'Start the museum' }).click({ timeout: 30000 })
    const tour = await waitFrame(page, 'tour.html')
    await page.evaluate(() => document.querySelector('iframe[src*="embed.html"]').scrollIntoView({ block: 'center' }))
    await tour.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 90000 })
    await tour.locator('main[data-chapter="honoured"]').waitFor({ timeout: 60000 })
    if ((await tour.locator('main').getAttribute('data-phase')) === 'map') await tour.locator('[data-hud=next]').click({ timeout: 15000 })
    await tour.locator('main[data-chapter="honoured"][data-phase="room"][data-ready="true"]').waitFor({ timeout: 120000 })
    await step(m, vp, 'Next inductee opens the next tour in the frame', async () => {
      const next = tour.locator('[data-hud=next-inductee]')
      await next.waitFor({ timeout: 30000 })
      await shot(page, `block-twentytwentyfive-${vp}-last-chapter`)
      await next.click()
      for (let i = 0; i < 300 && !frameBy(page, 'inductee=einstein'); i++) await page.waitForTimeout(100)
      const t2 = frameBy(page, 'inductee=einstein')
      if (!t2) throw new Error('the frame did not move to Einstein')
      await t2.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
      if (!page.url().startsWith(url.split('?')[0])) throw new Error(`the WordPress page itself navigated to ${page.url()}`)
    })
    await step(m, vp, 'no console error or failed request (chapter link)', async () => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) })
  } catch (e) {
    fail(m, vp, `chapter link: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

// ?viewer=: the record viewer shows the record and its source link opens a tab
async function recordLink(ctx, vp, url) {
  const m = 'block'
  const page = await ctx.newPage()
  const errs = watch(page)
  try {
    await page.goto(url)
    await page.locator('iframe[src*="embed.html"]').scrollIntoViewIfNeeded()
    const emb = await waitFrame(page, 'embed.html')
    await emb.getByRole('button', { name: 'Start the museum' }).click({ timeout: 30000 })
    const tour = await waitFrame(page, 'tour.html')
    await page.evaluate(() => document.querySelector('iframe[src*="embed.html"]').scrollIntoView({ block: 'center' }))
    await step(m, vp, 'record viewer shows the record', async () => {
      await tour.locator('[data-viewer-ready="true"]').waitFor({ timeout: 90000 })
      await page.waitForTimeout(1000)
      await shot(page, `block-twentytwentyfive-${vp}-record`)
    })
    await step(m, vp, '"View at the holder" opens a tab', async () => {
      const link = tour.getByRole('link', { name: /View at the holder/ })
      if ((await link.getAttribute('href')) !== SOURCE) throw new Error(`href ${await link.getAttribute('href')}`)
      const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 10000 }), link.click()])
      await popup.waitForLoadState('domcontentloaded').catch(() => {})
      if (!popup.url().startsWith(SOURCE)) throw new Error(`tab opened ${popup.url()}`)
      await popup.close()
      if (await tour.locator('#ext-link-note').isVisible()) throw new Error('the address note showed although the tab opened')
    })
    await step(m, vp, 'axe, record viewer', () => axe(page, m, vp, 'record'))
    await step(m, vp, 'no console error or failed request (record link)', async () => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) })
  } catch (e) {
    fail(m, vp, `record link: ${String(e.message || e).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

async function cardPage(ctx, vp, url) {
  const m = 'card'
  const page = await ctx.newPage()
  const errs = watch(page)
  try {
    await page.goto(url)
    const a = page.getByRole('link', { name: /Immigrant Hall of Honor/ }).filter({ hasText: 'Open the museum' })
    await step(m, vp, 'card shows', async () => {
      await a.waitFor({ timeout: 15000 })
      const l = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      if (l > 1) throw new Error(`the page scrolls sideways by ${l}px`)
      await a.scrollIntoViewIfNeeded()
      await shot(page, `card-twentytwentyfive-${vp}`)
    })
    await step(m, vp, 'card opens the museum in a new tab', async () => {
      const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 10000 }), a.click()])
      await popup.waitForLoadState('domcontentloaded')
      if (!popup.url().startsWith(`${MUSEUM}/`)) throw new Error(`tab opened ${popup.url()}`)
      await popup.close()
    })
    await step(m, vp, 'Tab reaches the card', async () => {
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab')
        if (await page.evaluate((u) => document.activeElement?.href === u, `${MUSEUM}/`)) return
      }
      throw new Error('not reachable within 60 Tab presses')
    })
    await step(m, vp, 'axe, card', () => axe(page, m, vp, 'card'))
    await step(m, vp, 'no console error or failed request', async () => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) })
  } finally {
    await page.close()
  }
}

// the Embed block: what the visitor sees after the editor's "could not be embedded"
async function embedPage(ctx, vp, url, created) {
  const m = 'embed'
  const page = await ctx.newPage()
  const errs = watch(page)
  try {
    if (vp === 'desktop') note(m, vp, `editor says: "${created.embedEditorMessage}"; buttons: ${created.embedEditorButtons.join(' / ') || '(none)'}`)
    await page.goto(url)
    await page.waitForTimeout(1500)
    const st = await page.evaluate((u) => ({
      iframes: [...document.querySelectorAll('iframe')].map((f) => f.src),
      links: [...document.querySelectorAll('.wp-block-embed a, .entry-content a, .wp-block-post-content a')].map((a) => a.href).filter((h) => h.startsWith(u)),
      text: (document.querySelector('.wp-block-embed') || {}).innerText || '',
      overflow: document.documentElement.scrollWidth - innerWidth,
    }), MUSEUM)
    note(m, vp, `front end: ${st.iframes.length} iframe(s); museum links ${JSON.stringify(st.links)}; block text "${st.text.trim().slice(0, 80)}"`)
    await page.locator('.wp-block-embed').first().scrollIntoViewIfNeeded().catch(() => {})
    await shot(page, `embed-twentytwentyfive-${vp}`)
    // WordPress's own behaviour, recorded rather than fixed: an Embed block saved after "could not be
    // embedded" shows the address as plain text, not a frame and not a link
    await step(m, vp, 'left as is: no frame, the address as plain text (WordPress behaviour; the guide says not to publish it)', async () => {
      if (st.iframes.some((s) => s.includes(MUSEUM))) throw new Error('an iframe of the museum appeared (unexpected: no oEmbed endpoint)')
      if (!st.text.includes(`${MUSEUM}/embed.html`)) throw new Error(`the block shows "${st.text}"`)
      if (st.overflow > 1) throw new Error(`the page scrolls sideways by ${st.overflow}px`)
    })
    await step(m, vp, 'no console error or failed request', async () => { if (errs.length) throw new Error(errs.slice(0, 5).join(' | ')) })
    // after "Convert to link": a link that opens the museum's embed page, where Start runs the tour
    await page.goto(created.embedLink)
    const a = page.locator(`a[href="${MUSEUM}/embed.html"]`).first()
    await step(m, vp, '"Convert to link" gives a working link', async () => {
      await a.waitFor({ timeout: 15000 })
      await a.scrollIntoViewIfNeeded()
      await shot(page, `embed-converted-${vp}`)
      await Promise.all([page.waitForURL(`${MUSEUM}/embed.html`, { timeout: 30000 }), a.click()])
      await page.getByRole('button', { name: 'Start the museum' }).click({ timeout: 30000 })
      await (await waitFrame(page, 'tour.html')).getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 90000 })
    })
  } finally {
    await page.close()
  }
}

async function authorPage(ctx, vp, url) {
  const m = 'author'
  const page = await ctx.newPage()
  try {
    await page.goto(url)
    await page.waitForTimeout(1000)
    const n = await page.locator('iframe[src*="embed.html"]').count()
    const text = await page.locator('.wp-block-post-content, .entry-content').first().innerText().catch(() => '')
    await shot(page, `author-twentytwentyfive-${vp}`)
    note(m, vp, `iframes kept: ${n}; content text: "${text.trim().slice(0, 60)}"`)
    if (n !== 0) fail(m, vp, 'an Author saved an iframe: kses did not strip it (unexpected)')
    else ok(m, vp, 'iframe stripped for an Author, as documented (use the link card or ask an Editor)')
  } finally {
    await page.close()
  }
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
const wp = await bootWordPress()
console.log(`WordPress ${wp.url}`)
const browser = await chromium.launch({
  ...(SHELL ? { executablePath: SHELL } : {}),
  args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=user-gesture-required'],
})
try {
  const admin = await browser.newContext({ viewport: VIEWPORTS.desktop })
  const created = await createPages(admin, wp.url)
  await admin.close()
  console.log(JSON.stringify({ ...created, classicText: undefined }, null, 1))
  // TinyMCE (the Visual tab) drops attributes it does not know, such as allow= and loading=; it keeps
  // allowfullscreen, which is why the snippet carries both
  const kept = created.classicText.replace(/\s+/g, ' ')
  note('classic', 'desktop', `after Visual and back to Text: ${kept.match(/<iframe[^>]*>/)?.[0] || '(no iframe)'}`)
  if (!/<iframe[^>]+allowfullscreen/.test(kept)) fail('classic', 'desktop', 'the Visual/Text round trip lost the iframe or its allowfullscreen')
  else ok('classic', 'desktop', 'iframe and allowfullscreen survive the Visual/Text round trip in the Classic editor')

  for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
    // visitors: a fresh context with no WordPress login
    const ctx = await browser.newContext({ viewport, ...(vp === 'phone' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) })
    // a logged-out visitor: Playground logs every new browser in as admin unless this cookie is set
    await ctx.addCookies([{ name: 'playground_auto_login_already_happened', value: '1', url: wp.url }])
    await ctx.route('https://catalog.archives.gov/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>holder</title>' }))
    await ctx.addInitScript(() => {
      window.__plays = 0
      const play = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function (...a) { return play.apply(this, a).then((r) => { window.__plays++; return r }) }
    })
    console.log(`viewport ${vp}`)
    if (run.has('block')) {
      await iframePage(ctx, 'block', vp, created.block, 'twentytwentyfive')
      await nextInductee(ctx, vp, created.next)
      await recordLink(ctx, vp, created.viewer)
    }
    if (run.has('narrow')) await iframePage(ctx, 'narrow', vp, created.block, 'twentytwentyone')
    if (run.has('classic')) await iframePage(ctx, 'classic', vp, created.classic, 'twentytwentyfive')
    if (run.has('embed')) await embedPage(ctx, vp, created.embed, created)
    if (run.has('card')) await cardPage(ctx, vp, created.card)
    if (run.has('author')) await authorPage(ctx, vp, created.author)
    await ctx.close()
  }
} catch (e) {
  fail('setup', '-', String(e.stack || e))
} finally {
  await browser.close()
  if (KEEP) console.log(`WordPress left running at ${wp.url}`)
  else wp.stop()
}

console.log('\nresults')
for (const [m, vps] of Object.entries(results)) for (const [vp, notes] of Object.entries(vps)) console.log(`${m} ${vp}\n  ${notes.join('\n  ')}`)
console.log(fails ? `\n${fails} FAIL` : '\nwordpress: all methods pass')
process.exit(fails ? 1 : 0)
