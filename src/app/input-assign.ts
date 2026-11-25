/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Assignable input selector: each of the XTM-4's INPUT 1-4 buttons plays any input.
 * The list holds every input the console knows: every entry of the input device list
 * (sound cards, TAP buses, the Linux host, MXL flows, NMOS nodes), the shared browser tab,
 * POD-33 and the Bit Buddy. Hold or right-click a button to choose; the button's
 * caption shows the input's name. Assignments persist per browser.
 */

import type { AppContext } from './app-context';
import type { AudioSync } from './audio-sync';

export interface InputChoice { id: string; name: string; short: string; group: string }

const KEY = 'xtm.inputAssign';
const DEFAULTS = ['dev:', 'tab', 'bitbuddy', 'pod33']; // the tone is input 4 (the XTM-4's TEST GEN button)
const BUILTIN: InputChoice[] = [
  { id: 'tab', name: 'Browser Tab', short: 'TAB', group: 'Console' },
  { id: 'pod33', name: 'POD-33 AES1', short: 'POD-33', group: 'Console' },
  { id: 'pod33:2', name: 'POD-33 AES2', short: 'POD-33 AES2', group: 'Console' },
  { id: 'pod33:3', name: 'POD-33 AES3', short: 'POD-33 AES3', group: 'Console' },
  { id: 'pod33:4', name: 'POD-33 AES4', short: 'POD-33 AES4', group: 'Console' },
  { id: 'bitbuddy', name: 'Bit Buddy', short: 'BIT BUDDY', group: 'Console' },
  { id: 'netrx', name: 'Network Receiver (CH 8)', short: 'NETWORK', group: 'AoIP' },
  { id: 'moiprx', name: 'MoIP Receiver (CH 9)', short: 'MOIP', group: 'AoIP' },
];
/** Router input index for the built-in generators and the tab. */
const ROUTER_IDX: Record<string, number> = { tab: 1, pod33: 2, 'pod33:2': 3, 'pod33:3': 4, 'pod33:4': 5, bitbuddy: 6, netrx: 7, moiprx: 8 };
/** Web Router input rows (CH 1-9) as button assignments: CH 1 Soundcard In is the default input; CH 3-6 are POD-33 AES1-4; CH 8 / 9 the network and MoIP receivers. */
const ROUTER_ROWS = ['dev:', 'tab', 'pod33', 'pod33:2', 'pod33:3', 'pod33:4', 'bitbuddy', 'netrx', 'moiprx'];
const assignListeners = new Set<() => void>();

let assigned: string[] = load();
const names = new Map<string, string>(); // id → caption, learned from the device list

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Pink noise is gone (the Bit Spitter's sweep / noise sources replace it)
    if (Array.isArray(v) && v.length === 4) return v.map((x, i) => (String(x) === 'pink' ? DEFAULTS[i] : String(x)));
  } catch { /* private window */ }
  return [...DEFAULTS];
}
function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(assigned)); } catch { /* ignore */ }
}

/** "📡 [XMXL 8467] ⚡ Master Bus (Float32 Stereo)" → "Master Bus"; mDNS escapes (\\032) decoded. */
function cleanLabel(text: string): string {
  const t = text
    .replace(/\\(\d{3})/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  const head = t.split(' (')[0].trim();
  return head || t || text.trim();
}
function shortOf(name: string): string {
  const s = name.toUpperCase().replace(/^MONITOR OF\s+/, '').replace(/^WARD-BECK\s+(TAP\s+\d:\s*)?/, '').replace(/[^A-Z0-9 \-/.]/g, '').trim();
  return s.length > 11 ? s.slice(0, 10).trim() + '…' : s || 'INPUT';
}
function groupOf(value: string): string {
  if (value === '' ) return 'Sound cards';
  if (value.startsWith('__NMOS_')) return 'AoIP';
  if (value.startsWith('__XMXL_') || value === '__WBS_LINUX_HOST__') return 'MXL';
  return 'Sound cards';
}

/** Every input that can go on a button, in list order. */
export function inputChoices(): InputChoice[] {
  const sel = document.getElementById('selectDevice') as HTMLSelectElement | null;
  const devs: InputChoice[] = [];
  const seen = new Set<string>();
  for (const o of Array.from(sel?.options ?? [])) {
    const name = o.value === '' ? 'Default input' : cleanLabel(o.text);
    const c = { id: 'dev:' + o.value, name, short: o.value === '' ? 'SOUNDCARD' : shortOf(name), group: groupOf(o.value) };
    names.set(c.id, c.short);
    const key = c.group + '|' + name.toLowerCase();
    if (seen.has(key)) continue; // the same flow found twice (e.g. NMOS and SAP)
    seen.add(key);
    devs.push(c);
  }
  const order = ['Sound cards', 'Console', 'MXL', 'AoIP'];
  return [...devs, ...BUILTIN].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

/** The input id on button n (1-4). */
export function inputAssignment(n: number): string {
  return assigned[n - 1] || DEFAULTS[n - 1];
}

/** The TAP's MXL ring that carries input `id`, or null (browser tab, a sound card). */
export function inputFlowId(id: string): string | null {
  if (id.startsWith('pod33')) return 'wbs-flow-ref-tone';
  if (id === 'bitbuddy') return 'wbs-flow-bit-spitter';
  if (id === 'netrx') return 'wbs-network-ams81'; // the AMS-81 stereo fold-down
  if (id === 'moiprx') return 'wbs-moip-ams81';
  if (id === 'dev:' || id === 'dev:__WBS_LINUX_HOST__') return 'wbs-flow-master-stereo';
  const m = /^dev:__XMXL_\d+_(.+)__$/.exec(id);
  return m ? m[1] : null;
}

/** Caption for button n (1-4). */
export function inputCaption(n: number): string {
  const id = assigned[n - 1];
  if (id === 'none') return '—';
  const b = BUILTIN.find((c) => c.id === id);
  if (b) return b.short;
  if (id === 'dev:') return 'SOUNDCARD';
  if (!names.has(id)) inputChoices();
  return names.get(id) || 'INPUT ' + n;
}

/** Play the input assigned to button n. Call straight from the click: the tab picker needs the gesture. */
export function selectAssignedInput(ctx: AppContext, sync: AudioSync, n: number): void {
  const { model, audio, webRouter } = ctx;
  const id = assigned[n - 1] || DEFAULTS[n - 1];
  if (!model.power) return;
  if (id === 'none') { model.flash('NO INPUT'); return; } // emptied from the router

  // Mode follows the kind of source (reference level / meter law), and the hardware-mode sync
  // is told it is already in place so it does not connect something else over it.
  if (id === 'tab') { model.mode = 'D'; model.d.src = 1; }
  else if (id.startsWith('dev:') || id === 'netrx' || id === 'moiprx') { model.mode = 'A'; model.a.src = 0; }
  else { model.mode = 'S'; }
  sync.isAudioStarted = true;
  model.selectedInput = n;
  model.inputAssigned = true;
  model.flash(inputCaption(n).slice(0, 9));
  model.saveEEPROM();

  // One input at a time: the TAP's tone or Bit Buddy would otherwise keep playing under this input.
  if (webRouter && !id.startsWith('pod33') && webRouter.pod33Engaged) webRouter.setPod33(false);
  if (webRouter && id !== 'bitbuddy' && webRouter.bitBuddyEngaged) webRouter.setBitBuddy(false);

  if (id.startsWith('dev:')) {
    const sel = document.getElementById('selectDevice') as HTMLSelectElement | null;
    const value = id.slice(4);
    if (sel && Array.from(sel.options).some((o) => o.value === value)) {
      sel.value = value;
      sel.dispatchEvent(new Event('change'));
    } else {
      model.flash('NO INPUT');
    }
  } else if (webRouter && ROUTER_IDX[id] !== undefined) {
    webRouter.selectInput(ROUTER_IDX[id]); // also lights the router's input strip
  } else if (id === 'tab') {
    audio.connectSystemAudio('browser');
  }
  // The routing above may have re-set mode/lastModeKey: mark this mode as already connected
  // and keep this button lit.
  sync.lastModeKey = model.mode + ':' + (model.mode === 'A' ? model.a.src : model.mode === 'D' ? model.d.src : model.s.pair[0]);
  model.selectedInput = n;
  model.inputAssigned = true;
  model.notify();
}

export function assignInput(n: number, id: string): void {
  assigned[n - 1] = id;
  save();
  assignListeners.forEach((fn) => fn());
}

/** Router input row on each button 1-4, or null when the button plays an input the router has no row for. */
export function routerRowsOfButtons(): (number | null)[] {
  return assigned.map((id) => { const i = ROUTER_ROWS.indexOf(id); return i < 0 ? null : i; });
}

/**
 * The Web Router's Meter Input 1-4 columns are these buttons: a crosspoint assigns router
 * input `row` to button n and plays it; assigning a button (hold / right-click) moves the crosspoint.
 */
export function routerMeterInput(ctx: AppContext, sync: AudioSync, n: number, row: number): void {
  if (n < 1 || n > 4) return;
  // The lit crosspoint was clicked: this input button holds nothing now
  if (row < 0) { assignInput(n, 'none'); ctx.view.isBuilt = false; return; }
  const id = ROUTER_ROWS[row];
  if (!id) return;
  assignInput(n, id);
  ctx.view.isBuilt = false; // captions are drawn into the panel art
  selectAssignedInput(ctx, sync, n);
}

export function bindRouterMeterInputs(ctx: AppContext): void {
  const r = ctx.webRouter;
  if (!r) return;
  const mirror = () => r.setMeterInputs(routerRowsOfButtons());
  assignListeners.add(mirror);
  mirror();
}

/** Small list of every input, opened by holding or right-clicking button n. */
/** How a generator input is running and set, from the router; '' for other inputs. */
function liveDetail(id: string): string {
  const r = (window as any).xtmWebRouter;
  if (!r) return '';
  const lvl = (db: number | null | undefined) => (db === null || db === undefined || db <= -100 ? 'off' : `${db} dBFS`);
  const hz = (f: number) => (f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`);
  if (id.startsWith('pod33')) {
    const n = id === 'pod33' ? 0 : Number(id.split(':')[1]) - 1;
    const o = r.pod33Outputs?.[n] ?? r.pod33Config;
    if (!o) return '';
    const f = !o.freq ? 'silence' : o.freqR && o.freqR !== o.freq ? `${hz(o.freq)} / ${hz(o.freqR)}` : hz(o.freq);
    const beep = o.beep ? ` · beep 1/${o.beep} s${o.beepLeft ? ' L' : ''}` : '';
    const on = r.pod33Engaged && r.pod33Out === n ? ' · on' : '';
    return `${f} · ${lvl(o.levelDb)} · ${o.channelMode}${beep}${on}`;
  }
  if (id === 'bitbuddy') {
    const b = r.bitBuddyConfig;
    if (!b) return '';
    const src = b.pattern === 'tone' ? hz(b.tone) : b.pattern === 'file' ? (b.fileName || 'file') : b.pattern;
    const fault = b.fault && b.fault !== 'clean' ? ` · ${b.fault}` : '';
    return `${src} · ${lvl(b.level)} · ${b.ext ? 'EXT' : `${b.sampleRate / 1000} kHz`}${fault}${r.bitBuddyEngaged ? ' · on' : ''}`;
  }
  return '';
}

export function openInputPicker(n: number, x: number, y: number, onPick: (id: string) => void): void {
  document.getElementById('xtmInputPicker')?.remove();
  const menu = document.createElement('div');
  menu.id = 'xtmInputPicker';
  menu.className = 'xtm-input-picker';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', `Input ${n}`);
  const cur = assigned[n - 1];
  let group = '';
  for (const c of inputChoices()) {
    if (c.group !== group) {
      group = c.group;
      const h = document.createElement('div');
      h.className = 'xtm-input-pick-group';
      h.textContent = group;
      menu.appendChild(h);
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitemradio');
    b.setAttribute('aria-checked', c.id === cur ? 'true' : 'false');
    b.className = 'xtm-input-pick' + (c.id === cur ? ' active' : '');
    // Generators say how they are set and whether they run: "POD-33 AES1 (1 kHz · -18 dBFS · stereo · on)"
    const how = liveDetail(c.id);
    b.textContent = how ? `${c.name} (${how})` : c.name;
    b.title = b.textContent;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.remove();
      onPick(c.id);
    });
    menu.appendChild(b);
  }
  document.body.appendChild(menu);
  const r = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(x, innerWidth - r.width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, innerHeight - r.height - 8))}px`;
  const close = (e: Event) => {
    if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
    if (e.type === 'pointerdown' && menu.contains(e.target as Node)) return;
    menu.remove();
    document.removeEventListener('pointerdown', close, true);
    document.removeEventListener('keydown', close, true);
  };
  setTimeout(() => {
    document.addEventListener('pointerdown', close, true);
    document.addEventListener('keydown', close, true);
  });
}
