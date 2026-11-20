// Links the end-of-tour ticket points at. null until IHH supplies the real one; placeholders() names what is still missing.
export const END_LINKS = { feedbackUrl: null, feedbackQrImage: null, storyUrl: null }

export function placeholders(links = END_LINKS) {
  return Object.keys(END_LINKS).filter((key) => links[key] == null)
}
