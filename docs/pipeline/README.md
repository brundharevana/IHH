# Verified inductee pipeline: guide for the IHH team

This guide is for the people at the Immigrant Hall of Honor who review and publish inductee content.
No programming is needed for the review and publishing steps. The technical contract is
`docs/pipeline/SPEC.md`; the maintainer's guide is `.claude/skills/ihh-verified-facts/SKILL.md`.

## What the pipeline does

You give it an inductee's name. It searches archives and official institutions (the Library of
Congress, the National Archives, the Smithsonian, universities, prize bodies, government sites and
others), saves a copy of every page it reads, and pulls out short factual statements, each with the
exact sentence from the source that supports it. A second, independent AI checker then tries to prove
each statement wrong. Only statements that both agree on, and that are backed by the original record
or by two independent institutions, count as verified.

From the verified statements it writes a draft profile: a summary, sections, a timeline, image
captions, and short lines for the museum guide and the inductee's illustrated avatar. Every sentence
in the draft lists the facts it rests on, and a checker confirms it adds nothing to them.

The result is a review package. Nothing is published until a person at IHH approves it.

It is being run for all five inductees in this project (Albert Einstein, Hedy Lamarr, John Muir,
Madeleine Albright, James Naismith), and the same steps work for any future inductee.

## From a name to your website

1. **Run.** A maintainer runs the pipeline for one inductee. It takes a while (many searches and
   checks) and ends with a review package in `data/inductees/<name>/export/`.
2. **Review.** You open `REVIEW.md` and check the items it lists (below).
3. **Decide.** For each item: approve, edit, reject, or leave a note.
4. **Apply.** The maintainer records your decisions. Edited statements are checked again
   automatically before they can be used.
5. **Export.** The maintainer produces the final package. It contains only verified statements you
   approved, and the sentences built from them.
6. **Publish.** You paste the WordPress file into the inductee's page (steps below).

## What you receive

| File | What it is for |
|---|---|
| `wordpress.html` | The page content, ready to paste into the WordPress block editor |
| `REVIEW.md` | Your checklist: what needs a decision and why |
| `facts.csv` | Every statement, its status, its sources (opens in Excel or Google Sheets) |
| `sources.csv` | Every source: title, institution, link, date accessed |
| `media.csv` | Every image or recording found, with its rights statement, licence and credit line |
| `searches.csv` | Every search the pipeline ran, including the ones that found nothing |
| `provenance.jsonld` | The same records in a machine-readable form for IHH's chatbot |

## What each status means

| Status | In plain words | Can it be published? |
|---|---|---|
| verified | Supported by the original record, or by two independent institutions, and the independent checker agreed | Yes, once you approve it |
| single-source | The source supports it, but only one institution says so | No. It needs a second independent source first |
| disputed | The independent checker disagreed or could not confirm it | No. A person decides what to do with it |
| pending | Not checked yet, or a check failed, or the wording changed after it was verified | No. It is checked again on the next run |
| rejected | Withdrawn by the pipeline or rejected by a reviewer | Never. It stays in the log so the history is complete |
| conflicting | Sources disagree with each other; both versions are recorded | No. A person decides which source to trust |

Approving does not override the checks. A statement is published only when it is verified **and**
approved. For a disputed, single-source, or conflicting item your options are to reject it, edit the
wording (it is then checked again), or note a better source for the team to add.

## How to read REVIEW.md

`REVIEW.md` is a checklist. The preview package marks every block "DRAFT — NOT REVIEWED"; do not
publish anything from a preview.

For each item it shows:

- the statement and its id (for example `MUI-F-0012`),
- its status,
- the exact quote from the source and a link to that source,
- for disputed items, the independent checker's reason (for example "the source gives the year but
  not the month"),
- notes, such as a suspected error on the current IHH page or two sources giving different dates.

What to do with each item:

1. Open the source link and find the quote. You are checking that the source really says it.
2. Read the statement. It should say no more than the quote does.
3. Mark your decision next to the item: approve, edit (write the new wording), reject, or note.
4. Send the marked-up file to the maintainer.

The list of draft sentences works the same way: each sentence shows the facts it cites. If a sentence
reads wrongly, edit or reject it; it will be checked again. A sentence reaches the final package only
after an independent checker has confirmed that its current wording says nothing its facts do not.

The end of the file lists **gaps**: parts of the life story with no verified source yet. These are
not errors. They show where more research would help.

## Pasting the WordPress export

Only paste the final `wordpress.html`, never a preview (a preview has "DRAFT — NOT REVIEWED" on every
block).

1. Open the inductee's page in the WordPress editor. WordPress keeps revisions, so the previous version
   can be restored; you can also make a draft copy of the page first.
2. Open the options menu (the three dots at the top right) and choose **Code editor**.
3. Paste the contents of `wordpress.html` where the new content should go.
4. Choose **Exit code editor**. The content appears as normal blocks: headings, paragraphs, lists,
   images with credit lines, small numbered source links after sentences, a Sources list, and a
   "How to cite this page" paragraph.
5. Preview the page. Check that images show and that the source links open.
6. Save or update the page.

**Images.** The export links each image from the archive that holds it, with the credit line the archive
asks for. Only images the archive marks as public domain or under an open licence (CC0, CC BY, CC BY-SA)
are shown; everything else appears as a link. If you prefer to host an image on the IHH site, download
it from the archive's page, upload it to the Media Library, replace the image address, and keep the
credit line exactly as it is.

**Source links.** Every sentence links to the original record or to the institution that published the
fact. Please keep these links; they are what makes the page trustworthy.

## What the pipeline will never do

- Publish anything, or change the IHH website.
- Use Wikipedia or quote websites as a source. They are only used to find real sources.
- Show an image whose rights are restricted or unknown.
- Put words in an inductee's mouth without a label. Quotes are exact and sourced; any other line in
  the inductee's voice is marked "AI recreation".
- Keep a statement that goes beyond what its source says.

## Adding a new inductee

Send the maintainer the person's full name and, if there is one, the link to their current IHH page.
The pipeline handles the rest and returns a new review package.

## Questions

Ask the project maintainer. For anything about how a specific statement was found, `searches.csv` and
`sources.csv` show every search and every page used, with dates.
