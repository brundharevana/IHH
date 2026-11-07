// Download measurement for the budget tests (Codex gate round 3): the bytes the network delivered,
// read from the browser's own network log (Chrome DevTools Protocol): every transfer's received body
// bytes (Network.dataReceived dataLength, decoded), summed per URL over every transfer (two range
// requests for the narration are two transfers). A response the browser served from its cache is
// left out only when the browser says so (requestServedFromCache, fromDiskCache, fromPrefetchCache).
// A transfer that never finished, or has no measured size, fails the measurement: never 0.

// records: [{ id, url, bytes, finished, failed?, cached }] -> Map(url -> bytes).
export function totals(records) {
  const out = new Map();
  for (const r of records) {
    if (!r.finished && !r.failed) throw new Error(`${r.url}: the transfer did not finish; the measurement is incomplete`);
    if (!(typeof r.bytes === 'number' && Number.isFinite(r.bytes) && r.bytes >= 0)) throw new Error(`${r.url}: no measured size`);
    if (r.cached) { if (!out.has(r.url)) out.set(r.url, 0); continue; }
    out.set(r.url, (out.get(r.url) || 0) + r.bytes);
  }
  return out;
}

// records -> Map(url -> number of transfers from the network, cache hits left out).
export function transferCounts(records) {
  const out = new Map();
  for (const r of records) if (!r.cached) out.set(r.url, (out.get(r.url) || 0) + 1);
  return out;
}

// Starts recording the page's network transfers (call before page.goto). keep(url) filters them.
// -> { done(): Promise<Map(url -> bytes)>, transfers(): Map(url -> count) }.
export async function measureDownloads(page, keep = () => true) {
  const cdp = await page.context().newCDPSession(page);
  const recs = new Map();
  const rec = id => recs.get(id);
  cdp.on('Network.requestWillBeSent', e => {
    if (!keep(e.request.url)) return;
    // A redirect reuses the request id: the earlier hop is its own (bodiless) transfer.
    const prev = rec(e.requestId);
    if (prev && e.redirectResponse) recs.set(`${e.requestId}#${recs.size}`, { ...prev, finished: true });
    recs.set(e.requestId, { id: e.requestId, url: e.request.url, bytes: 0, finished: false, cached: false });
  });
  cdp.on('Network.requestServedFromCache', e => { const r = rec(e.requestId); if (r) r.cached = true; });
  cdp.on('Network.responseReceived', e => {
    const r = rec(e.requestId);
    if (r && (e.response.fromDiskCache || e.response.fromPrefetchCache)) r.cached = true;
  });
  cdp.on('Network.dataReceived', e => { const r = rec(e.requestId); if (r) r.bytes += e.dataLength; });
  cdp.on('Network.loadingFinished', e => { const r = rec(e.requestId); if (r) r.finished = true; });
  cdp.on('Network.loadingFailed', e => { const r = rec(e.requestId); if (r) r.failed = e.errorText || 'failed'; });
  await cdp.send('Network.enable');
  return {
    async done() {
      const out = totals([...recs.values()]);
      await cdp.detach().catch(() => {});
      return out;
    },
    transfers: () => transferCounts([...recs.values()]),
  };
}
