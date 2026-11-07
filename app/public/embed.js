/* Embed page behaviour (embed.html). A classic script on purpose: a sandboxed iframe without
   allow-same-origin has an opaque origin, and a module script would then need CORS headers.
   - Start loads tour.html in an inner iframe (the query string is passed on, so ?chapter= works).
   - In an opaque-origin frame (a host sandbox without allow-same-origin) the tour cannot run: the
     site sends no CORS headers (owner ruling 2026-10-24, embed option B), so its modules, models and
     audio would be refused. The poster then offers only the "Open the museum" link card, which keeps
     the query string so a chapter link still opens that chapter.
   - Fullscreen needs allow="fullscreen" on the host's iframe; when the page cannot go fullscreen the
     button is replaced by the "Open the museum" link.
   - A new tab needs allow-popups; the shared handler (external-links.js) shows the address as
     copyable text when window.open is refused. */
(function () {
  var $ = function (id) { return document.getElementById(id) }
  var root = document.documentElement
  var tour = $('tour')
  var opaque = window.origin === 'null'
  var museumUrl = new URL(location.search ? 'tour.html' + location.search : './', location.href).href

  window.IHHExternalLinks.install()
  ;['open-card', 'open-bar'].forEach(function (id) { $(id).href = museumUrl })

  if (opaque) {
    $('start').remove()
    $('sandboxed').hidden = false
    $('open-card').className = 'btn'
    $('embed').setAttribute('data-state', 'link-only')
    return
  }

  $('start').addEventListener('click', function () {
    tour.src = 'tour.html' + location.search
    tour.hidden = false
    $('poster').hidden = true
    $('bar').hidden = false
    $('embed').setAttribute('data-state', 'tour')
    tour.focus()
  })

  // the button keeps its name and reports its state with aria-pressed
  var fs = $('fs')
  function noFullscreen() { fs.hidden = true; $('open-bar').hidden = false }
  if (document.fullscreenEnabled && root.requestFullscreen) {
    fs.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen()
      else root.requestFullscreen().catch(noFullscreen)
    })
    document.addEventListener('fullscreenchange', function () {
      fs.setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false')
    })
  } else noFullscreen()
})()
