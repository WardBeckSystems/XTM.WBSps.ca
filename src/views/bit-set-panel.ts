/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * ABS-1 Audio Bit Spitter + ABB-1 Audio Bit Buddy, drawn on their real
 * front-panel artwork and behaving like the firmware.
 *
 * ABS-1 (generator, abs1v103.asm): eight lighted push-buttons.
 *   AUDIO LEVEL steps OFF → -20 → -12 → 0 dBFS; SAMPLE RATE steps 48K → 44.1K → 32K → EXT;
 *   TONE 1KHz / 400Hz; CHB CYCLE / INVERT / OFF; INVALID sets the validity bit.
 *   CYCLE and INVERT clear B OFF; B OFF clears CYCLE and INVERT.
 *   EXT locks to an AES reference (here: POD-33 when it is running at 48 kHz).
 *
 * ABB-1 (analyser, abb1v103.asm on a CS8414): ANALOG / OFF / DIGITAL and
 *   STATUS / ERROR toggles, eight status LEDs with two legends, two 12-LED bars.
 *   STATUS mode lights the rate / CONSUMER / PRE-EMPH / AUDIO / RCV ERROR rows;
 *   ERROR mode lights one row from TABLE1 — which is one row off its legend
 *   from error code 3 on (a firmware quirk, kept on purpose).
 *
 * Artwork: public/images/generators/ (from the WBS Device Simulator plugins
 * abs1.js / abb1.js — ABS-1 manual line art, ABB-1 ABBFSLK2.cdr silkscreen).
 */

import type { WebRouter } from '../../WebRouter/src';

const IMG = './images/generators/';

/* ---------------- ABB-1 firmware tables (v1.03, CS8414) ---------------- */
const TABLE1 = [0x40, 0x80, 0x10, 0x20, 0x02, 0x08, 0x01, 0x04];
const TABLE2 = [0x20, 0x20, 0x20, 0x20, 0x20, 0x40, 0x80, 0x10];
const ROWS = ['48', '44', '32', 'OUT', 'CON', 'PRE', 'AUDIO', 'ERR'] as const;
type Row = (typeof ROWS)[number];
const ROW_BIT: Record<Row, number> = { '48': 6, '44': 7, '32': 4, OUT: 5, CON: 1, PRE: 3, AUDIO: 0, ERR: 2 };
const LEGEND_L: Record<Row, string> = { '48': '48.0kHz', '44': '44.1kHz', '32': '32.0kHz', OUT: 'LOCK', CON: 'CONSUMER', PRE: 'PRE-EMPH', AUDIO: 'AUDIO', ERR: 'RCV ERROR' };
const LEGEND_R: Record<Row, string> = { '48': 'NO ERROR', '44': 'VALIDITY BIT', '32': 'CONFIDENCE FLAG', OUT: 'CRC ERROR', CON: 'PARITY ERROR', PRE: 'BIPHASE ERROR', AUDIO: 'NO LOCK', ERR: '(no legend)' };
const ECODE = ['no error', 'validity bit high', 'confidence flag', 'slipped sample', 'CRC error', 'parity error', 'bi-phase coding error', 'no lock'];
const METER_DB = [12, 9, 6, 3, 0, -3, -6, -9, -12, -15, -21, -27];

type Fault = 'none' | 'confidence' | 'slip' | 'crc' | 'parity' | 'biphase' | 'unplug';
const FAULTS: [Fault, string, number][] = [
  ['none', 'Clean', 0], ['confidence', 'Eye closing', 2], ['slip', 'Slip', 3], ['crc', 'CRC', 4],
  ['parity', 'Parity', 5], ['biphase', 'Bi-phase', 6], ['unplug', 'Unplugged', 7],
];

/* ---------------- ABB-1 panel geometry (ABBFRNT.DXF inches → 1140 × 569) ---------------- */
const PX = (x: number) => (x - 3.784) * 300;
const PY = (y: number) => (4.2 - y) * 300;
const ABB = {
  outline: '60.6,0 1079.4,0 1140,267.9 1079.4,568.5 60.6,568.5 0,267.9',
  mLx: PX(4.2238), mRx: PX(4.6238), mY: (k: number) => PY(4.0804 - 0.12 * k),
  sX: PX(5.4738), sY: (k: number) => PY(3.8404 - 0.12 * k),
  lb: [PX(6.274), PY(3.84)], jack: [PX(7.0238), PY(3.8344)], pot: [PX(7.0238), PY(2.7474)],
  sw1: [PX(5.4878), PY(2.57)], sw2: [PX(6.2878), PY(2.57)],
  screws: [[PX(3.8838), PY(3.3074)], [PX(7.4838), PY(3.3074)], [PX(5.8738), PY(2.7804)]],
};

/* ---------------- ABS-1 panel geometry (manual line art, 1230 × 658) ---------------- */
type Key = 'lvl' | 'srate' | 'cycle' | 'invert' | 'boff' | 'k1' | 'f400' | 'invalid';
const ABS = {
  outline: '40,3 1181,3 1223,174 1223,459 1183,656 39,656 3,459 3,174',
  btn: { lvl: [170, 155], srate: [170, 375], cycle: [714, 155], invert: [876, 155], boff: [1036, 155], k1: [714, 375], f400: [876, 375], invalid: [1036, 375] } as Record<Key, number[]>,
  lvlLed: [[277, 157, 'OFF'], [357, 157, '-20'], [437, 157, '-12'], [520, 157, '0']] as [number, number, string][],
  rateLed: [[277, 378, '48'], [357, 378, '44'], [437, 378, '32'], [520, 378, 'EXT']] as [number, number, string][],
  lowbat: [710, 505], power: [1045, 527],
};
const KEYNAME: Record<Key, string> = { lvl: 'AUDIO LEVEL', srate: 'SAMPLE RATE', cycle: 'CHB CYCLE', invert: 'CHB INVERT', boff: 'CHB OFF', k1: 'TONE 1KHz', f400: 'TONE 400Hz', invalid: 'INVALID' };

const LED_RED = '#ff3b30', LED_GRN = '#7dff6a', LAMP = '#ffb43a';

export class BitSetPanel {
  /** ABB-1 switch positions and the fault on the AES cable between the two units. */
  private es: 'STATUS' | 'ERROR' = 'STATUS';
  private pos: 'ANALOG' | 'OFF' | 'DIGITAL' = 'DIGITAL';
  private fault: Fault = 'none';
  private timer = 0;
  private boundTo?: HTMLElement;

  constructor(private router: WebRouter) {}

  html(): string {
    return `
      <div class="rc-abb-panel wbs-bitset">
        <div class="rc-panel-title">
          <div class="rc-panel-title-left"><strong>AUDIO BIT SPITTER &amp; AUDIO BIT BUDDY</strong></div>
        </div>
        <div class="bitset-rack">
          <figure class="bitset-unit" id="bsAbsUnit">${this.absSvg()}</figure>
          <div class="bitset-cable" aria-label="AES/EBU cable between the units">
            <div class="bitset-cable-title">AES/EBU CABLE</div>
            <div class="bitset-cable-line"><span id="bsCableDot"></span></div>
            <select class="bitset-fault" id="bsFault" aria-label="Fault on the line">
              ${FAULTS.map(([f, l, c]) => `<option value="${f}" title="CS8414 error code ${c}: ${ECODE[c]}">${l}</option>`).join('')}
            </select>
          </div>
          <figure class="bitset-unit" id="bsAbbUnit">${this.abbSvg()}</figure>
        </div>
        <div class="bitset-extras">
          <span class="bitset-extras-title">XTM EXTRAS (not on the real unit)</span>
          ${([['tone', 'Tone'], ['walk1s', 'Walking 1s'], ['prbs', 'PRBS-15'], ['minmax', 'Min/Max']] as const)
            .map(([v, l]) => `<button type="button" class="bitset-chip" data-abb-pat="${v}">${l}</button>`).join('')}
          <span class="bitset-sep"></span>
          <button type="button" class="bitset-chip" data-abb-pro="pro">Professional</button>
          <button type="button" class="bitset-chip" data-abb-pro="cons">Consumer</button>
          <span class="bitset-sep"></span>
          <button type="button" class="bitset-chip" data-abb-data="audio">Audio</button>
          <button type="button" class="bitset-chip" data-abb-data="data">Non-audio</button>
        </div>
      </div>`;
  }

  /* ---------------- SVG builders (static; paint() lights them) ---------------- */

  private static led(id: string, x: number, y: number, r: number, title: string): string {
    return `<g class="bs-led" data-led="${id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 3}" fill="#050606"/>` +
      `<circle class="bs-lens" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>` +
      `<circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.28).toFixed(1)}" fill="#fff" opacity=".18"/>` +
      `<title>${title}</title></g>`;
  }

  private static toggle(id: string, cx: number, cy: number, title: string): string {
    return `<g class="bs-toggle" id="${id}" style="cursor:pointer">
      <rect x="${cx - 56}" y="${cy - 20}" width="112" height="40" rx="20" fill="#050606" stroke="#2c2f31" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="15" fill="#8d8f8c"/>
      <line class="bs-lever" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#d8dad6" stroke-width="13" stroke-linecap="round"/>
      <circle class="bs-tip" cx="${cx}" cy="${cy}" r="15" fill="#f1f2ef" stroke="#9a9c98" stroke-width="2"/>
      <rect x="${cx - 90}" y="${cy - 50}" width="180" height="100" fill="transparent"><title>${title}</title></rect></g>`;
  }

  private static screw(x: number, y: number): string {
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="#9a9a94" stroke="#55554f" stroke-width="2"/>` +
      `<path d="M${(x - 11).toFixed(1)} ${y.toFixed(1)}h22M${x.toFixed(1)} ${(y - 11).toFixed(1)}v22" stroke="#4a4a45" stroke-width="5"/>`;
  }

  private abbSvg(): string {
    let s = `<svg class="bitset-svg" viewBox="0 0 1140 569" role="img" aria-label="ABB-1 Audio Bit Buddy front panel">
      <defs><clipPath id="bsAbbTitle"><rect x="80" y="500" width="370" height="64"/></clipPath>
      <filter id="bsGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <polygon points="${ABB.outline}" fill="#17191b" stroke="#000" stroke-width="3"/>
      <image href="${IMG}abb1-front.svg" width="1140" height="569"/>
      <image href="${IMG}abb1-front-green.png" width="1140" height="569" clip-path="url(#bsAbbTitle)"/>`;
    METER_DB.forEach((db, k) => {
      s += BitSetPanel.led(`mL${k}`, ABB.mLx, ABB.mY(k), 12.5, `LEFT bar ${db > 0 ? '+' : ''}${db} dB`);
      s += BitSetPanel.led(`mR${k}`, ABB.mRx, ABB.mY(k), 12.5, `RIGHT bar ${db > 0 ? '+' : ''}${db} dB`);
    });
    ROWS.forEach((n, k) => {
      s += BitSetPanel.led(`s${n}`, ABB.sX, ABB.sY(k), 12.5, `STATUS: ${LEGEND_L[n]} · ERROR: ${LEGEND_R[n]} (STATERR bit ${ROW_BIT[n]})`);
    });
    s += BitSetPanel.led('lb', ABB.lb[0], ABB.lb[1], 12.5, 'LOW BATT. (hardware comparator, not the PIC)');
    const [jx, jy] = ABB.jack;
    s += `<circle cx="${jx}" cy="${jy}" r="80" fill="#0b0c0c" stroke="#262829" stroke-width="10" stroke-dasharray="6 5"/><circle cx="${jx}" cy="${jy}" r="40" fill="#020202"/>`;
    const [kx, ky] = ABB.pot;
    s += `<circle cx="${kx}" cy="${ky}" r="72" fill="#0d0e0f" stroke="#2c2f31" stroke-width="3"/><circle cx="${kx}" cy="${ky}" r="44" fill="#3c9d5d" stroke="#1f5a33" stroke-width="4"/>` +
      `<line x1="${kx}" y1="${ky}" x2="${kx + 40}" y2="${ky - 50}" stroke="#f4f4f0" stroke-width="7" stroke-linecap="round"/>`;
    s += BitSetPanel.toggle('bsSw1', ABB.sw1[0], ABB.sw1[1], 'STATUS / ERROR (SW1 → RB0) — click to flip');
    s += BitSetPanel.toggle('bsSw2', ABB.sw2[0], ABB.sw2[1], 'ANALOG · OFF · DIGITAL (SW2 → RB1) — click left, centre or right');
    ABB.screws.forEach(([x, y]) => (s += BitSetPanel.screw(x, y)));
    return s + '</svg>';
  }

  private absSvg(): string {
    let s = `<svg class="bitset-svg" viewBox="0 0 1230 658" role="img" aria-label="ABS-1 Audio Bit Spitter front panel">
      <polygon points="${ABS.outline}" fill="#d8d6ce"/>`;
    for (const k of Object.keys(ABS.btn) as Key[]) {
      const [x, y] = ABS.btn[k];
      s += `<rect class="bs-cap" data-cap="${k}" x="${x - 54}" y="${y - 54}" width="108" height="108" rx="4" fill="#e6e4dc"/>`;
    }
    s += `<image href="${IMG}abs1-front-black.png" width="1230" height="658"/>`;
    for (const k of Object.keys(ABS.btn) as Key[]) {
      const [x, y] = ABS.btn[k];
      s += `<rect class="bs-lamp" data-lamp="${k}" x="${x - 21}" y="${y - 10}" width="42" height="20" rx="2"/>`;
    }
    ABS.lvlLed.forEach(([x, y, n]) => (s += `<circle class="bs-round" data-round="L${n}" cx="${x}" cy="${y}" r="17"><title>AUDIO LEVEL ${n}</title></circle>`));
    ABS.rateLed.forEach(([x, y, n]) => (s += `<circle class="bs-round" data-round="R${n}" cx="${x}" cy="${y}" r="17"><title>SAMPLE RATE ${n}</title></circle>`));
    s += `<circle class="bs-round" data-round="lowbat" cx="${ABS.lowbat[0]}" cy="${ABS.lowbat[1]}" r="17"><title>LOW BAT</title></circle>`;
    const [px, py] = ABS.power;
    s += `<g id="bsPower" style="cursor:pointer"><rect x="${px - 48}" y="${py - 24}" width="96" height="48" fill="transparent"/><circle id="bsPowerKnob" cx="${px - 14}" cy="${py}" r="15" fill="#3b3a36"/><title>POWER — engages the Bit Spitter on Web Router CH 4</title></g>`;
    for (const k of Object.keys(ABS.btn) as Key[]) {
      const [x, y] = ABS.btn[k];
      s += `<rect class="bs-key" data-bs-key="${k}" x="${x - 56}" y="${y - 56}" width="112" height="112" fill="transparent" style="cursor:pointer"><title>${KEYNAME[k]}</title></rect>`;
    }
    return s + '</svg>';
  }

  /* ---------------- behaviour ---------------- */

  /** ABS-1 PROCESS: one button press. */
  press(k: Key): void {
    const r = this.router, b = r.bitBuddyConfig;
    if (!r.bitBuddyEngaged) return; // unit is off: buttons do nothing
    switch (k) {
      case 'lvl': {
        const order = [null, -20, -12, 0] as const;
        const i = order.indexOf(b.level as any);
        return r.setBitBuddyConfig({ level: order[(i + 1) % order.length] });
      }
      case 'srate': {
        if (b.ext) return r.setBitBuddyConfig({ ext: false, sampleRate: 48000 });
        const order = [48000, 44100, 32000] as const;
        const i = order.indexOf(b.sampleRate as any);
        return i === order.length - 1 || i < 0 ? r.setBitBuddyConfig({ ext: true }) : r.setBitBuddyConfig({ sampleRate: order[i + 1] });
      }
      case 'k1': return r.setBitBuddyConfig({ tone: 1000 });
      case 'f400': return r.setBitBuddyConfig({ tone: 400 });
      case 'cycle': return r.setBitBuddyConfig(b.cycle ? { cycle: false, bOff: false } : { cycle: true, bOff: false });
      case 'invert': return r.setBitBuddyConfig({ invert: !b.invert, bOff: false });
      case 'boff': return r.setBitBuddyConfig(b.bOff ? { bOff: false } : { bOff: true, cycle: false, invert: false });
      case 'invalid': return r.setBitBuddyConfig({ invalid: !b.invalid });
    }
  }

  bind(root: HTMLElement): void {
    if (this.boundTo !== root) this.listen(root);
    this.boundTo = root;
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      if (!root.isConnected) return window.clearInterval(this.timer);
      if (root.offsetParent !== null) this.paint(root);
    }, 120);
  }

  private listen(root: HTMLElement): void {
    root.addEventListener('change', (e) => {
      const sel = (e.target as Element).closest('#bsFault') as HTMLSelectElement | null;
      if (sel) { this.fault = sel.value as Fault; this.paint(root); }
    });
    root.addEventListener('click', (e) => {
      const el = e.target as Element;
      const key = el.closest('[data-bs-key]') as HTMLElement | SVGElement | null;
      if (key) return this.press(key.getAttribute('data-bs-key') as Key);
      if (el.closest('#bsPower')) return this.router.setBitBuddy(!this.router.bitBuddyEngaged);
      const sw1 = el.closest('#bsSw1');
      if (sw1) { this.es = this.es === 'STATUS' ? 'ERROR' : 'STATUS'; return this.paint(root); }
      const sw2 = el.closest('#bsSw2');
      if (sw2) {
        const rc = sw2.getBoundingClientRect(), x = ((e as MouseEvent).clientX - rc.left) / rc.width;
        this.pos = x < 0.38 ? 'ANALOG' : x > 0.62 ? 'DIGITAL' : 'OFF';
        return this.paint(root);
      }
    });
  }

  /** What the CS8414 in the ABB-1 sees on the cable. */
  private receiver() {
    const r = this.router, b = r.bitBuddyConfig;
    const running = r.bitBuddyEngaged && (!b.ext || r.extRefLocked);
    const fs = b.ext ? 48000 : b.sampleRate;
    const lock = running && this.fault !== 'unplug' && fs >= 30000 && fs <= 50000;
    let E = 7;
    if (lock) {
      E = FAULTS.find(([f]) => f === this.fault)![2];
      if (E === 4 && !b.proMode) E = 0;          // CRC only checked on professional streams
      if (b.invalid && E < 1) E = 1;              // ABS-1 INVALID → validity bit high
    }
    const F = !lock ? 0 : fs === 48000 ? 5 : fs === 44100 ? 6 : fs === 32000 ? 7 : 0;
    return { lock, E, F, fs, running };
  }

  /** abb1v103.asm: STATERR for the current switch, as a set of lit rows. */
  private statusLeds(): { lit: Set<Row>; why: string } {
    const b = this.router.bitBuddyConfig, rx = this.receiver();
    const ERR = TABLE1[rx.E];
    let st: number;
    if (this.es === 'ERROR') st = ERR;
    else {
      let FREQ = TABLE2[rx.F];
      if (b.audioData === 'audio') FREQ |= 0x01;              // AUDIO
      if (!b.proMode) FREQ |= 0x02;                           // CONSUMER
      if (b.proMode && this.fault === 'crc') FREQ |= 0x04;    // RCV ERROR (CS CRC)
      if (FREQ & 0x02) FREQ &= ~0x04;
      st = FREQ;
      if (ERR & 0x04) st = 0;                                 // no lock: blank…
      if (!(ERR & 0x40)) st |= 0x04;                          // …any error: RCV ERROR
    }
    const lit = new Set<Row>(ROWS.filter((n) => (st >> ROW_BIT[n]) & 1));
    let why: string;
    if (this.es === 'ERROR') {
      const row = ROWS.find((n) => (ERR >> ROW_BIT[n]) & 1)!;
      why = `ERROR: code ${rx.E} (${ECODE[rx.E]}) → lamp “${LEGEND_R[row]}”` +
        (rx.E >= 3 ? ` — TABLE1 puts codes 3–7 one row below their legend` : '');
    } else {
      why = lit.size ? `STATUS: ${[...lit].map((n) => LEGEND_L[n]).join(' · ')}` : 'STATUS: dark';
      if (!rx.lock) why = 'STATUS: no lock → blank, RCV ERROR only';
    }
    return { lit, why };
  }

  /** Meter level in dB re 0 VU (digital: -20 dBFS reads 0; analog: +4 dBu reads 0). */
  private meters(): [number, number] {
    const r = this.router, b = r.bitBuddyConfig, rx = this.receiver();
    if (this.pos === 'OFF' || !rx.running) return [-99, -99];
    if (this.pos === 'DIGITAL' && !rx.lock) return [-99, -99];
    if (this.pos === 'DIGITAL' && b.audioData === 'data') return [14, 14];
    const t = Date.now();
    let dbfs = b.pattern === 'tone' ? (b.level === null ? -99 : b.level) : b.pattern === 'minmax' ? -1 : -14 + Math.sin(t / 90) * 1.5;
    const offset = this.pos === 'DIGITAL' ? 20 : 0;
    const bMuted = b.bOff || (b.cycle && Math.floor(t / 520) % 2 === 1);
    return [dbfs + offset, bMuted ? -99 : dbfs + offset];
  }

  paint(root: HTMLElement): void {
    const r = this.router, b = r.bitBuddyConfig, on = r.bitBuddyEngaged;
    const q = (sel: string) => root.querySelectorAll<SVGElement>(sel);
    const lens = (id: string, v: boolean, col: string, off: string) => {
      root.querySelectorAll<SVGElement>(`[data-led="${id}"] .bs-lens`).forEach((c) => {
        c.setAttribute('fill', v ? col : off);
        if (v) c.setAttribute('filter', 'url(#bsGlow)'); else c.removeAttribute('filter');
      });
    };

    /* ---- ABS-1 ---- */
    const extLock = b.ext && r.extRefLocked;
    const lamps: Record<Key, boolean> = {
      lvl: false, // dis0 bit 4 is never set by the firmware
      srate: on && extLock, // LOCK lamp lives in the SAMPLE RATE button
      cycle: on && b.cycle, invert: on && b.invert, boff: on && b.bOff,
      k1: on && b.tone === 1000, f400: on && b.tone === 400, invalid: on && b.invalid,
    };
    q('.bs-lamp').forEach((el) => {
      const v = lamps[el.getAttribute('data-lamp') as Key];
      el.setAttribute('fill', v ? LAMP : '#9a9890');
      if (v) el.setAttribute('filter', 'url(#bsGlow)'); else el.removeAttribute('filter');
    });
    const lvlName = b.level === null ? 'OFF' : String(b.level);
    const rateName = b.ext ? (extLock ? '48' : '') : b.sampleRate === 44100 ? '44' : b.sampleRate === 32000 ? '32' : '48';
    q('.bs-round').forEach((el) => {
      const id = el.getAttribute('data-round')!;
      const v = on && (id === `L${lvlName}` || id === `R${rateName}` || (id === 'REXT' && b.ext));
      el.setAttribute('fill', v ? '#ff4a3a' : '#6d6b64');
      el.setAttribute('opacity', v ? '1' : '1');
      if (v) el.setAttribute('filter', 'url(#bsGlow)'); else el.removeAttribute('filter');
    });
    root.querySelector('#bsPowerKnob')?.setAttribute('cx', String(ABS.power[0] + (on ? 14 : -14)));

    const absRead = root.querySelector('#bsAbsUnit'); // state lives in the tooltip; the panel LEDs show it
    if (absRead) {
      const chB = b.bOff ? 'B off' : [b.invert && 'B inverted', b.cycle && 'B cycling'].filter(Boolean).join(', ') || 'B on';
      (absRead as HTMLElement).title = !on ? 'Power off.'
        : b.ext && !extLock ? 'EXT: no AES reference — clock stopped, output muted. (Start POD-33 at 48 kHz to lock.)'
        : `AES OUT ${(b.ext ? 48 : b.sampleRate / 1000)} kHz${extLock ? ' (locked to POD-33)' : ''} · ` +
          (b.pattern !== 'tone' ? b.pattern.toUpperCase() : `${b.tone === 1000 ? '1 kHz' : '400 Hz'} @ ${b.level === null ? 'OFF' : `${b.level} dBFS / ${b.level + 4 > 0 ? '+' : ''}${b.level + 4} dBu`}`) +
          ` · ${chB}${b.invalid ? ' · V = 1' : ''}`;
    }

    /* ---- cable ---- */
    const rx = this.receiver();
    root.querySelector('#bsCableDot')?.setAttribute('class', !rx.running || this.fault === 'unplug' ? '' : this.fault === 'none' && !b.invalid ? 'ok' : 'bad');
    const fsel = root.querySelector('#bsFault') as HTMLSelectElement | null;
    if (fsel && fsel.value !== this.fault) fsel.value = this.fault;

    /* ---- ABB-1 ---- */
    const digital = this.pos === 'DIGITAL';
    const { lit, why } = this.statusLeds();
    ROWS.forEach((n) => lens(`s${n}`, digital && lit.has(n), LED_RED, '#3a1212'));
    lens('lb', false, LED_RED, '#3a1212');
    const [mL, mR] = this.meters();
    METER_DB.forEach((db, k) => {
      lens(`mL${k}`, mL >= db, k === 0 ? '#ff4a3a' : LED_GRN, k === 0 ? '#3a1414' : '#10261a');
      lens(`mR${k}`, mR >= db, k === 0 ? '#ff4a3a' : LED_GRN, k === 0 ? '#3a1414' : '#10261a');
    });
    const setToggle = (id: string, cx: number, cy: number, p: number) => {
      const g = root.querySelector(`#${id}`); if (!g) return;
      const tip = cx + p * 50, ty = cy + (p === 0 ? -6 : 0);
      g.querySelector('.bs-lever')?.setAttribute('x2', String(tip));
      g.querySelector('.bs-lever')?.setAttribute('y2', String(ty));
      g.querySelector('.bs-tip')?.setAttribute('cx', String(tip));
      g.querySelector('.bs-tip')?.setAttribute('cy', String(ty));
    };
    setToggle('bsSw1', ABB.sw1[0], ABB.sw1[1], this.es === 'ERROR' ? 1 : -1);
    setToggle('bsSw2', ABB.sw2[0], ABB.sw2[1], this.pos === 'ANALOG' ? -1 : this.pos === 'DIGITAL' ? 1 : 0);
    const abbRead = root.querySelector('#bsAbbUnit');
    if (abbRead) {
      (abbRead as HTMLElement).title = this.pos === 'OFF' ? 'Power off.'
        : this.pos === 'ANALOG' ? 'ANALOG: status LEDs off, bars read the analog jacks (+4 dBu = 0).'
        : why;
    }

    /* ---- header + extras ---- */
    root.querySelectorAll('[data-abb-pat]').forEach((el) => el.classList.toggle('active', el.getAttribute('data-abb-pat') === b.pattern));
    root.querySelectorAll('[data-abb-pro]').forEach((el) => el.classList.toggle('active', (el.getAttribute('data-abb-pro') === 'pro') === b.proMode));
    root.querySelectorAll('[data-abb-data]').forEach((el) => el.classList.toggle('active', el.getAttribute('data-abb-data') === b.audioData));
  }
}
