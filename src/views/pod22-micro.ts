/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Micro stereo POD-22: the POD-22 stood on end, drawn small like the AMS-81's bar meters
 * (AMS8-1A front panel: two bars per pair, the scale beside them, CH numbers at the foot).
 * Only the shell is new; scale, colours, ballistics, peak hold and the DOM updater are the POD-22's.
 *
 * Rack8 lays four of them side by side (stereo spacing) for an 8-channel flow.
 */

import { Pod22View } from './pod22-view';
import type { MeterFrameTelemetry } from '../types/telemetry';
import type { XtmModel } from '../models/xtm-model';

/** Geometry (SVG units = px at 1:1): segment pitch, bar width, the scale column. */
const PITCH = 5;
const SEG_H = 4;
const BAR_W = 7;
const BAR_GAP = 2;
const SCALE_W = 15;
const TOP = 3;
/** Scale marks shown beside the bars (the AMS-81 prints a handful, not every step). */
const MARKS = new Set(['PK', '+14', '+10', '+5', '0', '-5', '-10', '-15', '-20', '-28', '-36']);

export class Pod22Micro extends Pod22View {
  constructor(container: HTMLElement | null, readonly labels: [string, string]) {
    super(container);
    this.extendedLed22 = false;
    this.scaleMode = 'vu';
  }

  get W(): number { return 2 * BAR_W + BAR_GAP + SCALE_W; }
  get H(): number { return TOP + (this.maxP - this.minP + 1) * PITCH + 12; }

  /** Centre y of segment p: 0 VU high on the bar, PK at the top. */
  private segY(p: number): number { return TOP + (this.maxP - p) * PITCH + SEG_H / 2; }

  override buildShell(): string {
    const h = this.H;
    let s = `<svg class="p22m" viewBox="0 0 ${this.W} ${h}" width="${this.W}" height="${h}" role="img" aria-label="POD-22 ${this.labels.join(' / ')}" style="display:block">
      <rect class="p22-bg" width="${this.W}" height="${h}" fill="#08090b"/>`;
    for (let row = 0; row < 2; row++) {
      const x = row * (BAR_W + BAR_GAP);
      for (let p = this.minP; p <= this.maxP; p++) {
        const y = this.segY(p) - SEG_H / 2;
        s += `<rect x="${x}" y="${y}" width="${BAR_W}" height="${SEG_H}" rx="0.6" fill="#06080a"/>
          <rect id="pod_led_${row}_${p}" x="${x + 0.5}" y="${y + 0.5}" width="${BAR_W - 1}" height="${SEG_H - 1}" rx="0.5" fill="#111317" opacity="0.15"><title>${this.labels[row]} ${this.SCALE[p - this.minP] ?? ''}</title></rect>`;
      }
      s += `<text x="${x + BAR_W / 2}" y="${h - 3}" text-anchor="middle" font-size="5.5" font-weight="700" fill="#cfd5db" font-family="Helvetica, Arial, sans-serif">${this.labels[row]}</text>`;
    }
    const sx = 2 * BAR_W + BAR_GAP + SCALE_W / 2;
    this.SCALE.forEach((lb, i) => {
      if (!MARKS.has(lb)) return;
      const p = this.minP + i;
      s += `<text x="${sx}" y="${this.segY(p)}" dominant-baseline="central" text-anchor="middle" font-size="5.5" font-weight="700" fill="${this.scaleNumColor(p)}" font-family="ui-monospace, monospace">${lb}</text>`;
    });
    return s + '</svg>';
  }
}

/** Per-channel levels in dBFS (peak and RMS), as the TAP's rings report them. */
export interface ChannelLevels { peak: number[]; rms: number[] }

const POWERED = { power: true } as unknown as XtmModel;

/** One stereo pair's frame: RMS drives the bar (0 VU = -18 dBFS), peak the hold dot and PK. */
function pairFrame(lv: ChannelLevels | null, a: number, b: number): MeterFrameTelemetry {
  const r = (c: number) => (lv && Number.isFinite(lv.rms[c]) ? lv.rms[c]! : -120);
  const p = (c: number) => (lv && Number.isFinite(lv.peak[c]) ? lv.peak[c]! : -120);
  return {
    vu: [0, 0], ppm: [0, 0], vuDb: [r(a) + 18, r(b) + 18], ppmDb: [p(a) + 18, p(b) + 18],
    dbfs: [r(a), r(b), -120, -120], lufs: { m: -70, s: -70, i: -70, lra: 0 }, rmsDb: [r(a), r(b)],
    phaseCorrelation: 0, phaseLed: 0, peak: [p(a) >= -0.1, p(b) >= -0.1], hasAudio: !!lv,
  };
}

/** Four micro POD-22s side by side for CH1-CH8 (stereo spacing between pairs). */
export class Pod22Rack8 {
  private pods: Pod22Micro[] = [];

  constructor(host: HTMLElement, channels = 8) {
    host.classList.add('p22m-rack');
    host.innerHTML = '';
    for (let k = 0; k < Math.ceil(channels / 2); k++) {
      const cell = document.createElement('div');
      cell.className = 'p22m-pair';
      host.appendChild(cell);
      this.pods.push(new Pod22Micro(cell, [`CH${2 * k + 1}`, `CH${2 * k + 2}`]));
    }
  }

  render(lv: ChannelLevels | null): void {
    this.pods.forEach((pod, k) => pod.render(POWERED, pairFrame(lv, 2 * k, 2 * k + 1)));
  }
}
