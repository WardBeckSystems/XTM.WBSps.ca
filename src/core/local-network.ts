/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Calls to the Ward-Beck Audio Tap on this machine (localhost / 127.0.0.1).
 *
 * - Chrome's Local Network Access: a public page (WBSps.ca, ward-beck.ca) needs the user's
 *   permission to reach localhost, and each request says it is meant for this machine
 *   (`targetAddressSpace: 'loopback'`; other browsers ignore the option).
 * - A port that fails (TAP not running, or Chrome blocking it) cools down: further calls fail
 *   at once, without touching the network, for 1 s, doubling to 30 s, until one gets through.
 *   Ten polls a second against a blocked port would otherwise be ten blocked requests a second.
 * - If Chrome reports the permission as denied, the page says how to allow it (once a session).
 */

const LOOPBACK = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/i;
const COOL_MIN_MS = 1000;
const COOL_MAX_MS = 30000;

const cool = new Map<string, { until: number; ms: number }>();
let promptShown = false;

export function installLocalNetworkFetch(): void {
  if (typeof window === 'undefined' || (window as any).__wbsLnaFetch) return;
  (window as any).__wbsLnaFetch = true;
  const publicPage = !LOOPBACK.test(location.hostname);
  const native = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url: URL | null = null;
    try {
      url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href);
    } catch { /* not a URL we can read */ }
    if (!url || !LOOPBACK.test(url.hostname)) return native(input, init);
    const key = url.host;
    const c = cool.get(key);
    if (c && Date.now() < c.until) throw new TypeError(`Failed to fetch (${key} cooling down)`);
    try {
      const res = await native(input, publicPage && !(init as any)?.targetAddressSpace
        ? ({ ...(init || {}), targetAddressSpace: 'loopback' } as RequestInit)
        : init);
      cool.delete(key);
      return res;
    } catch (err) {
      if ((err as any)?.name === 'AbortError') throw err; // our own timeout, not the port
      const ms = Math.min(COOL_MAX_MS, c ? c.ms * 2 : COOL_MIN_MS);
      cool.set(key, { until: Date.now() + ms, ms });
      if (publicPage && key.endsWith(':8467')) void checkPermission();
      throw err;
    }
  };
}

/** Chrome names the permission 'local-network-access' (later split into loopback / local). */
async function checkPermission(): Promise<void> {
  if (promptShown || !navigator.permissions?.query) return;
  for (const name of ['loopback-network', 'local-network-access']) {
    try {
      const st = await navigator.permissions.query({ name } as any);
      if (st.state === 'denied') return showPrompt();
      if (st.state === 'granted') return; // allowed: the TAP is just not running
    } catch { /* this browser does not know the name */ }
  }
}

function showPrompt(): void {
  if (promptShown) return;
  promptShown = true;
  const el = document.createElement('div');
  el.className = 'pg-fix-backdrop';
  el.innerHTML = `
    <div class="pg-fix" role="dialog" aria-modal="true" aria-labelledby="lnaTitle">
      <div class="pg-fix-kicker">Ward-Beck Audio Tap</div>
      <h3 id="lnaTitle">Let this page reach the Audio Tap</h3>
      <p class="pg-fix-why">The meters, router and timing views talk to the Ward-Beck Audio Tap running on this
        computer (localhost:8467). Chrome is blocking this site from local network access.</p>
      <div class="pg-fix-opt">
        <div class="pg-fix-opt-head"><b>Allow it</b><span>once, for this site</span></div>
        <p class="pg-fix-how">Click the site icon left of the address, open <b>Site settings</b>, set
          <b>Local network access</b> to <b>Allow</b>, then reload the page.</p>
      </div>
      <div class="pg-fix-actions"><button type="button" data-lna-reload>Reload</button><button type="button" data-lna-dismiss>Not now</button></div>
    </div>`;
  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-lna-reload]')) location.reload();
    if (t.closest('[data-lna-dismiss]') || t === el) el.remove();
  });
  document.body.appendChild(el);
}
