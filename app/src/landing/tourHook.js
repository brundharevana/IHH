// INTEGRATION HOOK for the tour (owned by the tour agent: app/src/tour/**, app/tour.html).
//
// The landing calls `onStartTour({ inductee, stop })` after its full-screen transition has
// covered the page:
//   inductee  slug, e.g. "einstein"
//   chapter   the chapter id of the turning point the visitor chose (chapter-shaped tours); `stop` is in the payload too
//             (the same id, for the transition's label), but the URL then carries only `chapter`
//   stop      the verified fact id of the story point the visitor chose ("EIN-F-0051"),
//             or null when they accepted the guide's offer (start from the beginning)
// It must return (or resolve to) true when it has taken over, false to let the landing
// reverse the transition and stay put.
//
// Default below: if app/tour.html exists, navigate to tour.html?inductee=..&stop=.. .
// In dev, Vite answers a missing .html with the landing's own index.html (SPA fallback), so we
// detect that by the data-landing-root marker in index.html.

export function tourUrl({ inductee, stop, chapter }) {
  const q = new URLSearchParams({ inductee })
  // a turning-point chapter opens the tour at that chapter; an older story point opens at its stop
  if (chapter) q.set('chapter', chapter)
  else if (stop) q.set('stop', stop)
  return `tour.html?${q.toString()}`
}

export async function startTourDefault(payload) {
  try {
    const res = await fetch('tour.html', { cache: 'no-store' })
    if (!res.ok) return false
    const html = await res.text()
    if (html.includes('data-landing-root')) return false
    window.location.assign(tourUrl(payload))
    return true
  } catch {
    return false
  }
}
