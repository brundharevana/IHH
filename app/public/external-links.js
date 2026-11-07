/* Source links in an embedded page, shared by embed.html and tour.html. A classic script on purpose:
   a sandboxed iframe without allow-same-origin has an opaque origin, and a module would need CORS.
   A host can sandbox the iframe without allow-popups (a hardened embed uses sandbox="allow-scripts");
   target="_blank" links are then dead. In a frame, a plain click on such a link tries window.open;
   when the browser refuses, the address is shown as selectable text with a Copy button, so the visitor
   can still reach the page. Outside a frame, and for ctrl/cmd/shift/middle clicks, nothing changes.
   API: window.IHHExternalLinks = { openExternal, inFrame, showAddress, install }. */
(function (global) {
  /** Try to open `url` in a new tab: 'opened' or 'blocked' (popups refused by a sandbox or blocker). */
  function openExternal(url, win) {
    win = win || window
    var w = null
    try { w = win.open(url, '_blank') } catch { w = null }
    if (!w) return 'blocked'
    try { w.opener = null } catch { /* already cross-origin: the opener link is cut */ }
    return 'opened'
  }

  function inFrame(win) {
    win = win || window
    try { return win.self !== win.top } catch { return true }
  }

  var BTN = 'font:inherit;font-weight:600;min-height:40px;padding:6px 18px;border-radius:30px;border:1px solid #ff9b2d;background:#ff9b2d;color:#1a1209;cursor:pointer;'

  /** Show `url` as copyable text. Closing (button or Esc) returns focus to `from`. */
  function showAddress(url, doc, from) {
    var old = doc.getElementById('ext-link-note')
    if (old) old.remove()
    var box = doc.createElement('div')
    box.id = 'ext-link-note'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-label', 'Open this link in your browser')
    box.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;width:min(32rem,calc(100% - 24px));' +
      'padding:12px 14px;border-radius:14px;background:#10151d;border:1px solid rgba(240,232,221,.32);color:#f0e8dd;font:14px/1.5 system-ui,sans-serif;'
    var p = doc.createElement('p')
    p.style.margin = '0 0 8px'
    p.textContent = 'This page cannot open a new tab from here. Copy the address and open it in your browser.'
    var input = doc.createElement('input')
    input.type = 'text'
    input.readOnly = true
    input.value = url
    input.setAttribute('aria-label', 'Address')
    input.style.cssText = 'width:100%;box-sizing:border-box;font:inherit;padding:8px;border-radius:8px;border:1px solid rgba(240,232,221,.32);background:#000;color:#f0e8dd;'
    var row = doc.createElement('div')
    row.style.cssText = 'display:flex;gap:8px;margin-top:8px;'
    var copy = doc.createElement('button')
    copy.type = 'button'
    copy.textContent = 'Copy address'
    copy.style.cssText = BTN
    var close = doc.createElement('button')
    close.type = 'button'
    close.textContent = 'Close'
    close.style.cssText = BTN
    var live = doc.createElement('p')
    live.setAttribute('role', 'status')
    live.setAttribute('aria-live', 'polite')
    live.style.cssText = 'margin:8px 0 0;min-height:1.5em;'
    function shut() {
      box.remove()
      if (from && from.focus) from.focus()
    }
    function announce(msg) { live.textContent = msg }
    copy.addEventListener('click', function () {
      input.select()
      var fallback = function () {
        var ok = false
        try { ok = !!(doc.execCommand && doc.execCommand('copy')) } catch { ok = false }
        announce(ok ? 'Copied' : 'Press Ctrl or Cmd C to copy')
      }
      var nav = (doc.defaultView || global).navigator
      if (nav && nav.clipboard && nav.clipboard.writeText) nav.clipboard.writeText(url).then(function () { announce('Copied') }, fallback)
      else fallback()
    })
    close.addEventListener('click', shut)
    // keys typed in the note never reach the page's own handlers (M mutes, digits pick stops, arrows walk)
    ;['keydown', 'keyup', 'keypress'].forEach(function (type) {
      box.addEventListener(type, function (e) {
        e.stopPropagation()
        if (type === 'keydown' && e.key === 'Escape') shut()
      })
    })
    row.appendChild(copy)
    row.appendChild(close)
    box.appendChild(p)
    box.appendChild(input)
    box.appendChild(row)
    box.appendChild(live)
    doc.body.appendChild(box)
    input.focus()
    input.select()
    return box
  }

  /** Install once per page. Acts only inside a frame, on a plain primary click. */
  function install(win) {
    win = win || window
    if (!inFrame(win)) return
    var doc = win.document
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      var a = e.target && e.target.closest && e.target.closest('a[target="_blank"][href]')
      if (!a) return
      e.preventDefault()
      if (openExternal(a.href, win) === 'blocked') showAddress(a.href, doc, a)
    }, true)
  }

  global.IHHExternalLinks = { openExternal: openExternal, inFrame: inFrame, showAddress: showAddress, install: install }
})(typeof window !== 'undefined' ? window : globalThis)
