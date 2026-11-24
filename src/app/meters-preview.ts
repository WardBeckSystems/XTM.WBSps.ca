/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * "Display for Meters" drawer card: three sub-tabs (Analog VU · PPM · Bargraph)
 * with a live preview of the matching meters above them.
 *
 * The preview is a pair of SVG <use> references to the real meters, so it is
 * the actual display, kept in sync by the browser: needles, lamps, dial faces
 * and scales update as settings change, at no extra rendering cost.
 */

type Tab = 'vu' | 'ppm' | 'bar';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TAB_KEY = 'xtm.meters_tab';

/** Left meter of a pair sits at the group-0 slot; the right one is shifted next to it. */
const PAIRS: Record<'vu' | 'ppm', [string, string]> = {
  vu: ['xtm_meter_group_0', 'xtm_meter_group_2'],
  ppm: ['xtm_meter_group_1', 'xtm_meter_group_3'],
};

function bbox(id: string): DOMRect | null {
  const el = document.getElementById(id) as unknown as SVGGraphicsElement | null;
  try { return el ? el.getBBox() : null; } catch { return null; }
}

function svg(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function meterPair(tab: 'vu' | 'ppm'): SVGSVGElement | null {
  const [l, r] = PAIRS[tab];
  const bl = bbox(l), br = bbox(r);
  if (!bl || !br) return null;
  const gap = 24;
  const shift = bl.x + bl.width + gap - br.x; // slide R next to L
  const pad = 8;
  const w = bl.width * 2 + gap + pad * 2;
  const h = Math.max(bl.height, br.height) + pad * 2;
  const out = svg('svg', { viewBox: `${bl.x - pad} ${bl.y - pad} ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' }) as SVGSVGElement;
  out.append(svg('use', { href: `#${l}` }), svg('use', { href: `#${r}`, transform: `translate(${shift} 0)` }));
  return out;
}

function bargraph(): SVGSVGElement | null {
  const pod = document.querySelector('#pod22Stage svg') as SVGSVGElement | null;
  if (!pod) return null;
  if (!pod.id) pod.id = 'pod22_svg';
  const vb = pod.viewBox.baseVal;
  const W = vb && vb.width ? vb.width : 3200, H = vb && vb.height ? vb.height : 192;
  // The whole bar in one strip, stretched vertically so the LEDs stay readable at drawer width.
  const out = svg('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' }) as SVGSVGElement;
  out.append(svg('use', { href: `#${pod.id}`, width: String(W), height: String(H) }));
  return out;
}

export function initMetersPreview(): void {
  const card = document.querySelector('.meters-card');
  const box = document.getElementById('metersPreview');
  if (!card || !box) return;
  const tabs = Array.from(card.querySelectorAll<HTMLButtonElement>('[data-mtab]'));
  const panes = Array.from(card.querySelectorAll<HTMLElement>('[data-mpane]'));
  let current: Tab = 'vu';

  const draw = () => {
    const el = current === 'bar' ? bargraph() : meterPair(current);
    box.replaceChildren(el ?? document.createTextNode('Meters not built yet'));
    box.dataset.tab = current;
  };

  const select = (tab: Tab, persist = true) => {
    current = tab;
    for (const t of tabs) {
      const on = t.dataset.mtab === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    }
    for (const p of panes) p.hidden = p.dataset.mpane !== tab;
    draw();
    if (persist) try { localStorage.setItem(TAB_KEY, tab); } catch {}
  };

  for (const t of tabs) {
    t.addEventListener('click', (e) => { e.stopPropagation(); select(t.dataset.mtab as Tab); });
    t.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(t);
      const next = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(i + tabs.length - 1) % tabs.length] : null;
      if (next) { e.preventDefault(); next.focus(); select(next.dataset.mtab as Tab); }
    });
  }

  // Meter geometry can change with style / skin / window size: re-frame the preview.
  card.addEventListener('change', () => requestAnimationFrame(draw));
  window.addEventListener('resize', () => requestAnimationFrame(draw));

  let saved: Tab = 'vu';
  try { const v = localStorage.getItem(TAB_KEY); if (v === 'vu' || v === 'ppm' || v === 'bar') saved = v; } catch {}
  // Wait a frame so the meter SVGs exist and have layout.
  requestAnimationFrame(() => select(saved, false));
}
