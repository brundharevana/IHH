# End of Tour (quiz, ticket, share your story) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a visitor finishes an inductee's tour, they get an optional short quiz, then a museum ticket they can save (with the owner's feedback QR image), then a way to share their own immigration story through IHH's form.

**Architecture:** Two pure modules build the quiz (`quiz.js`, from each tour's own chapter data and verified facts) and the ticket (`ticket.js`, an SVG string). One lazy-loaded overlay (`EndOfTour.jsx`) plays quiz, then ticket, then story panel. It opens when the visitor presses "Finish the tour" on the last chapter. Nothing about the visitor is stored or sent anywhere. The feedback link, the QR image and the story form link are placeholders in one file (`links.js`) until IHH supplies them.

**Tech Stack:** React 19, Vite, vitest, Playwright e2e (app/e2e), plain SVG + canvas for the PNG (no new dependencies).

**Spec:** Approved in chat 2026-11-11 and recorded in `Challenge IHH/docs/handoff/DECISIONS.md` (2026-11-11 entry). Summary:
- Flow at the end of a tour: optional quiz (4-5 questions, skippable) -> ticket (score stamped if quiz taken) -> "Share your story" panel.
- Quiz built from verified facts only. No invented wrong statements. Every answer shows the fact behind it.
- Ticket: museum-style admission stub. Inductee name, portrait where the landing has one, visit date, chapters visited, quiz score stamp, the owner's QR image in a fixed slot, and a "Give feedback" button with the same link. Saved as PNG in the browser. No data stored.
- Story: a panel with consent text and a button to IHH's own form. We store nothing. Featured stories are labelled visitor stories, not verified history (that is IHH's job on their site; our copy says so).
- Placeholders for the feedback link, the QR image and the story link; each placeholder is visibly marked.

**Branch:** `revamp/end-of-tour` off `revamp/mockups` at `ec0fddf6` (v7, live). Not off `revamp/room-skill` (unreviewed, unpushed).

## Global Constraints

- Disk: the data volume had 3.5 GiB free on 2026-11-11. Do NOT create a new worktree (the repo is 3.8 GB). Work in the main IHH-revamp checkout: stash its modified `app/mockup-shots/wordpress/*.jpg` (`git stash push -m "wp shots before end-of-tour" -- app/mockup-shots/wordpress`), then `git switch -c revamp/end-of-tour ec0fddf6`. Before switching back to `revamp/room-skill`, commit or stash; never discard the stash.
- No new npm dependencies. No changes to deploy config, `vercel.json`, Vite inputs, workers, timeouts or headers (owner-gated).
- Never weaken a gate or test. A failing check means fix the code.
- Copy: editorial voice, no emojis, no "elevate / unleash / seamless / AI-powered". Sentence case. The ticket and quiz must not state anything that is not in a verified fact or in the tour's own data.
- Only verified facts: a fact id is usable only if it is a key of `app/src/tour/data/facts.generated.json` `.facts`.
- Nothing about the visitor is stored (no localStorage, no network calls carrying visitor data). The visit date comes from the visitor's own clock and stays on the page.
- External links open through `window.IHHExternalLinks.openExternal(url)` when present (sandboxed WordPress embeds), else `target="_blank" rel="noopener noreferrer"`.
- Reduced motion: no animation when `(prefers-reduced-motion: reduce)` matches.
- Every interactive element is reachable by keyboard and has an accessible name; the overlay is a `role="dialog"` with `aria-modal="true"`, focus moves into it on open and returns on close.
- Phone width 375 px: nothing clipped, no horizontal scroll, ticket fits the width.
- Commit messages: Conventional Commits; end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Saving the ticket inside a sandboxed WordPress iframe without `allow-downloads`: the download is refused silently. Expected: if the download cannot start, the ticket image opens as a viewable image (long-press / right-click to save) and a one-line hint says so. Test in Task 4 (e2e with `sandbox="allow-scripts allow-same-origin"`).
2. Finishing a tour on a phone: the overlay must fit 375x667 at every step, ticket included. Test in Task 4 at phone viewport.
3. A tour whose chapters share a year (Einstein 1933 leaving and arriving): an "order" question must never pair two chapters of the same year. Test in Task 1.
4. The visitor presses Escape or "Back to the museum" mid-quiz: no ticket is required, the tour ends as before (`onEnd`). Test in Task 4.
5. Placeholders still in place at build time: the page shows them as clearly marked placeholders, never a broken image or a dead link. Test in Task 2 (unit) and Task 4 (e2e).

---

### Task 1: Placeholder links and the quiz builder

**Files:**
- Create: `app/src/tour/end/links.js`
- Create: `app/src/tour/end/quiz.js`
- Test: `app/src/tour/end/quiz.test.js`

**Interfaces:**
- Produces:
  - `links.js`: `export const END_LINKS = { feedbackUrl: null, feedbackQrImage: null, storyUrl: null }` and `export function placeholders(links = END_LINKS): string[]` returning the names of the keys that are still `null`, in that order.
  - `quiz.js`: `export function buildQuiz(tour, index, { count = 5 } = {}): Question[]`
    where `Question = { id: string, kind: 'order' | 'year' | 'stop', prompt: string, options: string[], answer: number, factIds: string[], reveal: string }`.
    `tour` is a chapter-shape tour (`tour.slug`, `tour.chapters[]` with `id, title, year, yearFact, place.label, place.tier`); `index` is the parsed `facts.generated.json`.
  - `export function score(questions: Question[], picks: (number|null)[]): { right: number, total: number }`

Question rules (exact):
- `order`: prompt `'Which happened first?'`; options are the two chapter titles in tour order; `answer` is the index of the one with the smaller `year`; the two chapters must have different years; `factIds` = both `yearFact`s; `reveal` = the two verified claims joined with `' '`.
- `year`: prompt `` `In which year: ${chapter.title}?` ``; options = the chapter's year plus up to 2 other distinct years from the same tour's chapters, as strings, ascending; `factIds = [chapter.yearFact]`; `reveal` = that claim. Needs at least 2 distinct years in the tour.
- `stop`: a tour-memory question, no fact claimed. Prompt `` `Which stop of the tour goes with "${chapter.title}"?` ``; options = this chapter's `place.label` plus up to 2 other distinct labels from the tour, excluding `'IHH gallery'` and excluding chapters with `place.tier === 'gallery'`; `factIds = []`; `reveal` = `` `In the tour, "${chapter.title}" is shown at ${label}.` ``
- Mix: up to 2 `order`, 2 `year`, 1 `stop`, then fill from any kind to reach `count`; never reuse a chapter as the subject of two `year` or two `stop` questions. Deterministic: same tour gives the same quiz (no `Math.random`). Option order deterministic.
- Throws `Error('<slug>: quiz fact <id> is not verified')` if any `yearFact` it would use is not in `index.facts`.

- [ ] **Step 1: Write the failing tests** in `quiz.test.js`, run against every tour in `INDUCTEES` (`../data/index.js`) and the real `facts.generated.json`:
  - `test('every inductee gets 4 or 5 questions')`: `expect(q.length).toBeGreaterThanOrEqual(4)` and `toBeLessThanOrEqual(5)`.
  - `test('every fact behind an answer is verified and shown word for word')`: for each question, each `factIds` entry is in `index.facts`, and `reveal` contains each of their claims verbatim.
  - `test('an order question never pairs two chapters of the same year')`: for Einstein, the `leaving` and `arriving` chapters (both 1933) never appear together in one `order` question; for every order question the two years differ and `answer` points at the earlier.
  - `test('a year question offers only years from the same tour')`: every option is the year of some chapter of that tour; the correct one is the subject chapter's year.
  - `test('a stop question claims no fact and never offers the gallery')`: `factIds` is `[]`, no option is `'IHH gallery'`.
  - `test('the quiz is the same every time')`: `buildQuiz(t, i)` twice gives deep-equal results.
  - `test('an unverified yearFact is refused')`: a copy of a tour with one `yearFact` set to `'EIN-F-9999'` makes `buildQuiz` throw `/not verified/`.
  - `test('score counts right picks and treats a skipped one as wrong')`: `score(q, [q[0].answer, null, ...])` gives `right: 1`.
  - `test('placeholders lists the links still missing')`: `placeholders()` equals `['feedbackUrl', 'feedbackQrImage', 'storyUrl']`; `placeholders({ feedbackUrl: 'https://x', feedbackQrImage: null, storyUrl: null })` equals `['feedbackQrImage', 'storyUrl']`.
- [ ] **Step 2: Run** `cd app && npx vitest run src/tour/end/quiz.test.js`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `links.js` and `quiz.js` per the Interfaces block. Keep the pairing choice simple: walk chapters in tour order and take the first pairs that satisfy the rules.
- [ ] **Step 4: Run** the same command. Expected: all PASS. Then `npx vitest run` (whole app) and `npm run lint`: both clean.
- [ ] **Step 5: Commit** `feat(tour): end-of-tour quiz built from verified chapter facts`.

### Task 2: The ticket (SVG and PNG)

**Files:**
- Create: `app/src/tour/end/ticket.js`
- Test: `app/src/tour/end/ticket.test.js`

**Interfaces:**
- Consumes: `END_LINKS`, `placeholders` (Task 1); `score` result shape `{ right, total }`.
- Produces:
  - `export function ticketData(tour, { portrait = null, result = null, now = new Date() } = {}): Ticket`
    `Ticket = { name, slug, visited: string /* "11 November 2026", en-GB long date */, chapters: number, span: string /* "1879–1940" from min and max chapter year, en dash */, stamp: string | null /* "Quiz 4 of 5" */, number: string /* "IHH-EIN-20261111" (first 3 letters of slug, upper case; local date yyyymmdd) */, portrait: { src, credit } | null }`
  - `export function ticketSvg(t: Ticket, { qr = null, portraitData = null } = {}): string`: a standalone SVG (`viewBox="0 0 1200 520"`) string. `qr` and `portraitData` are data URLs; when `qr` is null the QR slot is a dashed box with the text `QR code (placeholder)`. All text is XML-escaped. If a portrait is drawn, its credit line is drawn too (small text under it).
  - `export async function ticketPng(svg: string, scale = 2): Promise<Blob>`: draws the SVG on a canvas and returns a PNG blob (browser only; not unit tested).
  - `export async function toDataUrl(src: string): Promise<string | null>`: fetches a same-origin image and returns a data URL; null on any failure.
- Copy on the ticket (exact): eyebrow `Immigrant Hall of Honor`, line 1 `Admit one · Guided tour`, the name, `Visited ${visited}`, `${chapters} chapters · ${span}`, the stamp if any, `No. ${number}`, beside the QR `Scan to tell us about your visit`.
- Portrait source: `src/landing/data/inductees.json` `portrait.src` and `portrait.credit` for the slug, or null (Naismith has none).

- [ ] **Step 1: Write the failing tests**:
  - `test('ticket data for Einstein')`: with `now = new Date(2026, 10, 11)` and `result = { right: 4, total: 5 }`: `visited === '11 November 2026'`, `number === 'IHH-EIN-20261111'`, `stamp === 'Quiz 4 of 5'`, `chapters === EINSTEIN.chapters.length`, `span` equals min and max chapter year joined by `'–'`.
  - `test('no quiz, no stamp')`: `result = null` gives `stamp === null`, and the SVG has no `Quiz`.
  - `test('the QR slot is a marked placeholder until the owner image is set')`: `ticketSvg(t)` contains `QR code (placeholder)`; with `qr: 'data:image/png;base64,AAAA'` it contains `<image` with that href and no `placeholder`.
  - `test('a drawn portrait always carries its credit')`: with a portrait and `portraitData`, the SVG contains the escaped credit text; without `portraitData` there is no `<image` for the portrait.
  - `test('text is escaped')`: a name `A & B <C>` appears as `A &amp; B &lt;C&gt;`.
  - `test('the ticket states nothing beyond tour data')`: for every inductee, every number in the SVG text (regex `\d+`) is one of: chapter years, chapter count, the visit date parts, the score numbers, the ticket number, the viewBox/geometry attributes (strip attributes before checking; test only text nodes).
- [ ] **Step 2: Run** `cd app && npx vitest run src/tour/end/ticket.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `ticket.js`. Visual: dark card (`#10151d`), accent `#ff9b2d`, perforated divider before a stub on the right holding the QR slot (240x240) and its caption; fonts `Fraunces, Georgia, serif` for the name, `Poppins, Helvetica, Arial, sans-serif` for the rest (canvas export falls back to the system fonts; acceptable).
- [ ] **Step 4: Run** the tests, whole vitest, lint. Expected: all clean.
- [ ] **Step 5: Commit** `feat(tour): end-of-tour ticket as SVG with a placeholder QR slot`.

### Task 3: The end-of-tour overlay, wired into the chapter player

**Files:**
- Create: `app/src/tour/end/EndOfTour.jsx`
- Create: `app/src/tour/end/end.css`
- Modify: `app/src/tour/ChapterPlayer.jsx` (the `next()` at ~line 427 and the render near the Moments overlay ~line 625)

**Interfaces:**
- Consumes: `buildQuiz`, `score` (Task 1); `ticketData`, `ticketSvg`, `ticketPng`, `toDataUrl` (Task 2); `END_LINKS`.
- Produces: `export default function EndOfTour({ tour, nextSlug, nextName, reduced, onClose }): JSX` where `onClose()` ends the tour exactly as the old `end()` did. Root element `<div role="dialog" aria-modal="true" aria-labelledby="end-title" className="end-of-tour" data-end-step={step}>` with `step` in `'quiz' | 'ticket' | 'story'`.

Behaviour (exact):
- Opens on `quiz` with the intro `A few questions about ${tour.name}, from what you just saw. Optional.` and two buttons: `Start the quiz`, `Skip to your ticket`.
- One question per screen; options are buttons (`aria-pressed` after a pick). After a pick: `Right.` or `Not quite.` plus `reveal`, labelled `From the record:` for `order`/`year`, `From the tour:` for `stop`. Then `Next question` / `See your ticket`.
- `ticket`: the SVG inline (as `<img alt="Your ticket for the ${tour.name} tour">` from a blob URL of the SVG), buttons `Save ticket` (PNG download as `ihh-ticket-${slug}.png`), `Give feedback` (opens `END_LINKS.feedbackUrl`; when null the button is disabled with visible text `Feedback link coming soon`), `Share your story`, `Next inductee: ${nextName}` (link `tour.html?inductee=${nextSlug}`), `Back to the museum` (`onClose`).
- Save fallback: if the download cannot start (detect: inside an iframe and `allow-downloads` not granted, or the click throws), open the PNG blob URL in the page as an `<img>` with the hint `Press and hold, or right-click, to save the ticket.`
- `story`: heading `Share your immigration story`; copy (exact): `IHH collects visitors' stories through its own form. This museum does not keep anything you write. If IHH features your story, it is shown as a visitor's story, not as verified history. If you are under 13, ask a parent or guardian first.`; button `Go to the story form` (opens `END_LINKS.storyUrl`; when null, disabled with `Story form coming soon`); `Back to your ticket`.
- Escape closes the dialog via `onClose`. Focus goes to the heading on open and on each step change.
- ChapterPlayer: on the last chapter, `next()` sets `endOpen = true` instead of calling `end()`; `EndOfTour` is a `lazyChunk(() => import('./end/EndOfTour.jsx'), 'the end of the tour')` inside `ChunkSuspense` with `onClose={() => { setEndOpen(false); end() }}`. The header's `End tour` button is unchanged (ends at once, no ticket). `EndOfTour` imports the index itself (`import INDEX from '../data/facts.generated.json'`, as `room/RoomRecords.jsx` and `place/GalleryCaseStage.jsx` do; Vite shares the one module), so the `index` prop is dropped from its signature: `EndOfTour({ tour, nextSlug, nextName, reduced, onClose })`.

- [ ] **Step 1:** Implement `EndOfTour.jsx` and `end.css` (glass panel styles from `design/tokens.css`; max-width 720px; at <=720px the ticket image is 100% width).
- [ ] **Step 2:** Wire ChapterPlayer as above.
- [ ] **Step 3: Verify in the browser:** `preview_start` the dev server (`.claude/launch.json` "revamp-mockups"), open `tour.html?inductee=einstein&chapter=<last chapter id>&autostart=1`, press the next button, walk quiz -> ticket -> story at desktop and at 375x812; screenshot each step; console has no errors.
- [ ] **Step 4:** `npx vitest run`, `npm run lint`, `npm run build` (prebuild and postbuild gates, including `check_budgets.mjs`). All pass. If a budget fails, shrink the chunk; do not raise the budget.
- [ ] **Step 5: Commit** `feat(tour): end-of-tour quiz, ticket and story panel after the last chapter`.

### Task 4: End-to-end coverage and gate

**Files:**
- Create: `app/e2e/end-of-tour.mjs` (same harness style as `app/e2e/chapters.mjs`)
- Modify: the gate step list used for v7 (copy `IHH-revamp/.superpowers/sdd/2026-10-22-turning-points-museum/negative-controls/fix7b/gate-final-ff8f6edc/run.sh` to a new `.../end-of-tour/gate/run.sh` and add the new e2e as a step; do not remove steps)

Checks (one scenario each, all 5 inductees at desktop 1280x800 and phone 375x667 unless noted):
- [ ] Finish the last chapter -> dialog opens on `quiz`; `Skip to your ticket` -> `ticket` with no stamp.
- [ ] Take the quiz picking option 0 every time -> ticket stamp text equals `Quiz ${right} of ${total}` computed from `buildQuiz` in Node.
- [ ] `Save ticket` produces a download named `ihh-ticket-<slug>.png`, a valid PNG (magic bytes), width 2400.
- [ ] Sandboxed embed (`embed.html` inside an iframe with `sandbox="allow-scripts allow-same-origin"`, Einstein only): `Save ticket` shows the fallback image and hint, no uncaught error (Review Focus 1).
- [ ] Placeholders: the QR slot shows `QR code (placeholder)`; `Give feedback` and `Go to the story form` are disabled with their "coming soon" text (Review Focus 5).
- [ ] Escape mid-quiz and `Back to the museum` both end the tour (page goes to `/`) (Review Focus 4).
- [ ] Phone: dialog and ticket inside the viewport at every step, `document.documentElement.scrollWidth <= 375` (Review Focus 2).
- [ ] axe (`@axe-core/playwright`) on each step: no serious or critical violations.
- [ ] Reduced motion (`reducedMotion: 'reduce'`): no CSS animation running in the dialog.
- [ ] Run the new e2e, then the full gate script. Expected: every step green, including the existing 27.
- [ ] **Commit** `test(e2e): end-of-tour quiz, ticket and story across all inductees`.

### Task 5: Review, docs, handoff

- [ ] Codex cross-model review of `ec0fddf6..HEAD` (same prompt style as Codex 12). HIGH findings block; fix and re-review.
- [ ] Add a short section to `docs/revamp/wordpress-embed.md`: the ticket download needs `allow-downloads` on a sandboxed iframe, else the fallback image shows; where to set `END_LINKS` and drop the QR image (`app/public/ticket/feedback-qr.png`, then set `feedbackQrImage: '/ticket/feedback-qr.png'`).
- [ ] Handoff (Challenge IHH/docs/handoff): STATE, HISTORY (commit SHAs), DECISIONS (any ruling made while building).
- [ ] Stop. No deploy, no push, no merge into `revamp/mockups` without the owner's explicit approval.
