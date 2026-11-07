// The Moments chapters that show the kind icon instead of a thumbnail, each with the reason it has no image
// (round 9 fix round 7, Codex review 6). This list is written by hand and is not generated: regenerating
// records.lock.json or chapters.generated.json does not change it. Any other chapter whose thumbMediaId is null
// fails records.test.js, throws in Moments.jsx in dev, and fails e2e/moments.mjs.
// A thumbnail is the first media record among the chapter's stops that is verified, embeddable, not link-only and
// not a basis photo (scripts/export_chapters.mjs). To add a chapter here, say why no record qualifies.
export const NO_THUMB = Object.freeze({
  'naismith/education':
    "The chapter's only record, NAI-M-0059 (Old Hall, McGill), is a basis photo of the place. The two McGill calendars that were its thumbnail are held back until their identification is settled (commit 5729ac0c).",
  'albright/birth': "The chapter's only record, ALB-M-0081 (the Prague stereograph), is a basis photo: the photograph the photo room is built from, a place and not her own record.",
})
