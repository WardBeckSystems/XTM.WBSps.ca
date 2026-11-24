/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy RANGE readout: 2-character text for the model and its 7-segment markup. */
import type { XtmModel } from '../../../../models/xtm-model';
import { MC_WIN } from '../../layout/mccurdy-layout';
import { renderSevenSeg } from '../../lib/seven-seg';

export function mcRangeText(model: XtmModel): string {
  if (!model.power) return '  ';
  let v: number | null = null;
  const isMc = typeof document !== 'undefined' && (document.body?.classList.contains('theme-mccurdy') || document.body?.classList.contains('theme-mccurdy-dark'));
  if (isMc && model.mode !== 'S') {
    v = model.getMcCurdySensitivityDb();
  } else if (model.mode === 'A') {
    v = model.lvlDb(model.a.lvl);
  } else if (model.mode === 'D') {
    v = model.lvlDb(model.d.lvl);
  } else if (model.mode === 'S') {
    v = model.pod33?.read()?.levelDb ?? null;
  }
  if (v === null) return '--';
  const a = Math.min(99, Math.abs(Math.round(v)));
  if (v < 0 && a > 0 && a <= 19) return '-' + a;
  return String(a).padStart(2, '0');
}

/** RANGE window digits (2-digit red 7-segment) */
export function renderMcRangeDigits(text: string): string {
  return renderSevenSeg(text, MC_WIN);
}
