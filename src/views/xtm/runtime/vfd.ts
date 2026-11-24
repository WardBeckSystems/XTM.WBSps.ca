/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VFD dot-matrix display: 8-character text for the current state (flash message,
 * setup text, loss-of-signal warning, or the loudness / WardBeck / Systems cycle)
 * and its dot-matrix markup centred in the window.
 */
import type { MeterFrameTelemetry } from '../../../types/telemetry';
import type { XtmModel } from '../../../models/xtm-model';
import { DISP, VFD_PITCH } from '../layout/wbs-layout';
import { renderDotMatrix } from '../lib/dot-matrix';

export interface VfdFrame { txt: string; on: string; off: string }

const VFD_ON = '#c8f53c';
const VFD_OFF = 'rgba(150,200,60,.06)';
const WARN_ON = '#fbbf24';
const WARN_OFF = 'rgba(251,191,36,.08)';

/** Loudness reading for the configured VFD metric */
function loudnessText(model: XtmModel, levels: MeterFrameTelemetry): string {
  const metric = model.vfdMetric || 'lufs';
  let val = -60;
  let suffix = 'LU';

  if (metric === 'lus') {
    val = typeof levels.lufs?.s === 'number' ? levels.lufs.s : -60;
    suffix = 'S ';
  } else if (metric === 'lum') {
    val = typeof levels.lufs?.m === 'number' ? levels.lufs.m : -60;
    suffix = 'M ';
  } else if (metric === 'lui') {
    val = typeof levels.lufs?.i === 'number' ? levels.lufs.i : -60;
    suffix = 'I ';
  } else if (metric === 'lra') {
    val = typeof levels.lufs?.lra === 'number' ? levels.lufs.lra : 0;
    suffix = 'RA';
  } else {
    val = typeof levels.lufs?.i === 'number' ? levels.lufs.i : -60;
    suffix = 'LU';
  }

  if (metric === 'lra') {
    return (val.toFixed(1) + ' ' + suffix).padStart(8).substring(0, 8);
  } else if (Number.isFinite(val) && val > -59.5) {
    const numStr = val.toFixed(1);
    return (numStr + ' ' + suffix).length <= 8 ? (numStr + ' ' + suffix).padStart(8) : (numStr + suffix);
  }
  return '-INF ' + suffix;
}

export function vfdFrame(model: XtmModel, levels: MeterFrameTelemetry, now: number, signalLost: boolean): VfdFrame {
  const on = model.power;
  if (!on) return { txt: '        ', on: VFD_ON, off: VFD_OFF };
  if (model.flashMsg) return { txt: model.flashMsg.padEnd(8).substring(0, 8), on: VFD_ON, off: VFD_OFF };
  if (model.mode === 'SET') return { txt: model.getDisplayText(), on: VFD_ON, off: VFD_OFF };
  if (signalLost) {
    const warnPhase = Math.floor((now % 1600) / 800);
    return { txt: warnPhase === 0 ? 'LOSS OF ' : ' SIGNAL ', on: WARN_ON, off: WARN_OFF };
  }
  const phaseMs = now % 6000;
  let txt: string;
  if (phaseMs < 4000) txt = loudnessText(model, levels);
  else if (phaseMs < 5000) txt = 'WardBeck';
  else txt = 'Systems ';
  return { txt, on: VFD_ON, off: VFD_OFF };
}

/** Dot-matrix markup for the text, centred in the VFD window */
export function renderVfd(f: VfdFrame): string {
  const p = VFD_PITCH;
  const w8 = (8 * 6.2 - 1.2) * p;
  const dx = DISP.x + (DISP.w - w8) / 2;
  const dy = DISP.y + (DISP.h - 6 * p) / 2;
  return renderDotMatrix(f.txt, dx, dy, p, f.on, f.off);
}

/** Status title for the current mode (#xtm_mode_title) */
export function modeTitle(model: XtmModel, signalLost: boolean): string {
  if (signalLost) return '⚠ LOSS OF SIGNAL (NO AUDIO DETECTED)';
  if (model) {
    if (model.mode === 'D') return 'COMPUTER AUDIO OUTPUT';
    if (model.mode === 'S') return 'POD-33 TONE GENERATOR';
    if (model.mode === 'SET') return 'SETUP & CALIBRATION';
  }
  return 'SOUNDCARD INPUT';
}
