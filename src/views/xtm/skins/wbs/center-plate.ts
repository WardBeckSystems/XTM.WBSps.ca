/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** WBS skin: stencil path for the signature solid green centre plate (scalloped cut-outs). */
import { DISP, BX, BY, BW, BH } from '../../layout/wbs-layout';

export function getCenterPlatePath(): string {
  const outer = [
    'M 1845 82',
    'A 12 12 0 0 0 1833 70',
    'H 1367',
    'A 12 12 0 0 0 1355 82',
    'V 402',
    'A 12 12 0 0 0 1367 414',
    'H 1833',
    'A 12 12 0 0 0 1845 402',
    'Z'
  ].join(' ');

  const vfd = `M ${DISP.x} ${DISP.y + 6} a 6 6 0 0 1 6 -6 h ${DISP.w - 12} a 6 6 0 0 1 6 6 v ${DISP.h - 12} a 6 6 0 0 1 -6 6 h -${DISP.w - 12} a 6 6 0 0 1 -6 -6 Z`;

  const btns = Object.keys(BX).map(b => {
    const x = (BX[b] ?? 1385) - 2;
    const y = BY - 2;
    const w = BW + 4;
    const h = BH + 4;
    return `M ${x} ${y + 3} a 3 3 0 0 1 3 -3 h ${w - 6} a 3 3 0 0 1 3 3 v ${h - 6} a 3 3 0 0 1 -3 3 h -${w - 6} a 3 3 0 0 1 -3 -3 Z`;
  }).join(' ');

  return `${outer} ${vfd} ${btns}`;
}

/** The plate itself */
export function renderCenterPlate(): string {
  return `<path class="wbs-only" d="${getCenterPlatePath()}" fill="#15803d" fill-rule="evenodd"/>`;
}
