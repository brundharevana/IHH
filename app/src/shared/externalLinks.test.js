// public/external-links.js is a classic script (it must run in an opaque-origin sandbox), so the test
// evaluates it in a node vm against a small fake DOM.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const SRC = readFileSync(new URL('../../public/external-links.js', import.meta.url), 'utf8')

class El {
  constructor(tag) {
    this.tag = tag
    this.children = []
    this.attrs = {}
    this.style = {}
    this.listeners = {}
    this.removed = false
    this.textContent = ''
  }
  setAttribute(k, v) { this.attrs[k] = v }
  appendChild(c) { this.children.push(c); c.parent = this }
  addEventListener(t, f) { (this.listeners[t] ||= []).push(f) }
  remove() { this.removed = true }
  focus() { this.doc.active = this }
  select() { this.selected = true }
  fire(type, e = {}) {
    const ev = { stopped: false, stopPropagation() { this.stopped = true }, ...e }
    for (const f of this.listeners[type] || []) f(ev)
    return ev
  }
}
function fakeDoc() {
  const doc = { active: null, body: new El('body'), listeners: {}, copied: null, defaultView: { navigator: {} } }
  doc.body.doc = doc
  doc.createElement = (t) => { const e = new El(t); e.doc = doc; return e }
  doc.getElementById = (id) => { const f = (n) => (n.attrs.id === id || n.id === id) && !n.removed ? n : n.children.map(f).find(Boolean); return f(doc.body) || null }
  doc.addEventListener = (t, f) => (doc.listeners[t] ||= []).push(f)
  doc.execCommand = () => true
  return doc
}
const load = () => {
  const sandbox = { globalThis: null }
  sandbox.globalThis = sandbox
  vm.runInNewContext(SRC, sandbox)
  return sandbox.IHHExternalLinks
}
const find = (n, pred) => (pred(n) ? n : n.children.map((c) => find(c, pred)).find(Boolean))

describe('openExternal', () => {
  const L = load()
  it('reports opened and cuts the opener', () => {
    const child = { opener: 'host' }
    expect(L.openExternal('https://x.test/', { open: () => child })).toBe('opened')
    expect(child.opener).toBeNull()
  })
  it('reports blocked when window.open returns null or throws', () => {
    expect(L.openExternal('u', { open: () => null })).toBe('blocked')
    expect(L.openExternal('u', { open: () => { throw new Error('sandboxed') } })).toBe('blocked')
  })
})

describe('inFrame', () => {
  const L = load()
  it('is false at top level, true in a frame or when top is unreadable', () => {
    const top = {}
    expect(L.inFrame({ self: top, top })).toBe(false)
    expect(L.inFrame({ self: {}, top })).toBe(true)
    expect(L.inFrame({ self: {}, get top() { throw new Error('x') } })).toBe(true)
  })
})

describe('showAddress', () => {
  const setup = () => {
    const L = load()
    const doc = fakeDoc()
    const link = doc.createElement('a')
    const box = L.showAddress('https://holder.test/a', doc, link)
    const input = find(box, (n) => n.tag === 'input')
    const btn = (label) => find(box, (n) => n.tag === 'button' && n.textContent === label)
    const live = find(box, (n) => n.attrs.role === 'status')
    return { doc, link, box, input, btn, live }
  }
  it('shows the address in a focused read-only field inside a labelled dialog', () => {
    const { doc, box, input } = setup()
    expect(box.attrs.role).toBe('dialog')
    expect(input.value).toBe('https://holder.test/a')
    expect(input.readOnly).toBe(true)
    expect(input.selected).toBe(true)
    expect(doc.active).toBe(input)
  })
  it('Close and Esc remove the note and return focus to the link', () => {
    for (const close of [(s) => s.btn('Close').fire('click'), (s) => s.box.fire('keydown', { key: 'Escape' })]) {
      const s = setup()
      close(s)
      expect(s.box.removed).toBe(true)
      expect(s.doc.active).toBe(s.link)
    }
  })
  it('stops every key typed in the note from reaching the page', () => {
    const { box } = setup()
    for (const type of ['keydown', 'keyup', 'keypress']) expect(box.fire(type, { key: 'm' }).stopped).toBe(true)
    expect(box.removed).toBe(false)
  })
  it('announces Copied in a polite live region', async () => {
    const { doc, btn, live } = setup()
    expect(live.attrs['aria-live']).toBe('polite')
    doc.defaultView.navigator.clipboard = { writeText: () => Promise.resolve() }
    btn('Copy address').fire('click')
    await Promise.resolve()
    await Promise.resolve()
    expect(live.textContent).toBe('Copied')
  })
  it('falls back to execCommand, and says so when that fails too', () => {
    const { doc, btn, live } = setup()
    btn('Copy address').fire('click')
    expect(live.textContent).toBe('Copied')
    doc.execCommand = () => false
    btn('Copy address').fire('click')
    expect(live.textContent).toMatch(/Ctrl or Cmd C/)
  })
  it('replaces an earlier note', () => {
    const L = load()
    const doc = fakeDoc()
    const a = L.showAddress('https://a.test/', doc, null)
    L.showAddress('https://b.test/', doc, null)
    expect(a.removed).toBe(true)
  })
})

describe('install', () => {
  const run = (framed, ev, win = {}) => {
    const L = load()
    const doc = fakeDoc()
    const anchor = { href: 'https://holder.test/x' }
    const w = { document: doc, self: {}, top: framed ? {} : null, open: () => null, ...win }
    if (!framed) w.top = w.self
    L.install(w)
    const click = { defaultPrevented: false, button: 0, target: { closest: () => anchor }, preventDefault() { this.defaultPrevented = true }, ...ev }
    for (const f of doc.listeners.click || []) f(click)
    return { click, doc, listening: !!doc.listeners.click }
  }
  it('does nothing at top level', () => expect(run(false, {}).listening).toBe(false))
  it('in a frame, a plain click with a refused window.open shows the address', () => {
    const r = run(true, {})
    expect(r.click.defaultPrevented).toBe(true)
    expect(r.doc.getElementById('ext-link-note')).not.toBeNull()
  })
  it('in a frame, a click that opens a tab shows no note', () => {
    const r = run(true, {}, { open: () => ({}) })
    expect(r.click.defaultPrevented).toBe(true)
    expect(r.doc.getElementById('ext-link-note')).toBeNull()
  })
  it('leaves ctrl, meta, shift, alt and middle clicks to the browser', () => {
    for (const ev of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      const r = run(true, ev)
      expect(r.click.defaultPrevented).toBe(false)
      expect(r.doc.getElementById('ext-link-note')).toBeNull()
    }
  })
  it('ignores clicks that are not on a target=_blank link', () => {
    const r = run(true, { target: { closest: () => null } })
    expect(r.click.defaultPrevented).toBe(false)
  })
})
