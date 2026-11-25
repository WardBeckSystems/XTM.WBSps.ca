/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Vintage PIMSON 29T movement (meterStyle 'pimson'): +-45 deg span,
 * corner VU / VU legends, teardrop pointer; straight yellow PPM wand.
 */
import type { FaceCtx, VuFaceStyle } from '../face-types';
import type { NeedleParts } from '../../lib/needle';
import { ppmNeedleShadow } from '../../lib/needle';
import { MW } from '../../layout/wbs-layout';
import { VU_RED } from './vu-scale';

function legend(ctx: FaceCtx): string {
  const { ink, x0, y0 } = ctx;
  const cx = x0 + MW / 2;
  return `<text x="${(cx - 165).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${ink}">VU</text>
              <text x="${(cx + 165).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${VU_RED}" text-anchor="end">VU</text>`;
}

/** Slender shaft swelling into a teardrop bulb, tapering to a knife-edge tip */
function vuNeedle(px: number, py: number, R: number): NeedleParts {
  const tipY = py - (R + 24);
  return {
    shadow: `
          <path d="
            M ${px + 2} ${tipY + 2}
            L ${px + 2.6} ${tipY + 8}
            C ${px + 3.2} ${tipY + 12}, ${px + 6.4} ${tipY + 16}, ${px + 6.4} ${tipY + 20}
            C ${px + 6.4} ${tipY + 24}, ${px + 4.4} ${tipY + 28}, ${px + 3.2} ${tipY + 30}
            L ${px + 3.1} ${py + 2}
            L ${px + 0.9} ${py + 2}
            L ${px + 0.8} ${tipY + 30}
            C ${px - 0.4} ${tipY + 28}, ${px - 2.4} ${tipY + 24}, ${px - 2.4} ${tipY + 20}
            C ${px - 2.4} ${tipY + 16}, ${px + 0.8} ${tipY + 12}, ${px + 1.4} ${tipY + 8}
            Z" fill="rgba(0,0,0,0.30)"/>
        `,
    body: `
          <path d="
            M ${px} ${tipY}
            L ${px + 0.6} ${tipY + 6}
            C ${px + 1.2} ${tipY + 10}, ${px + 4.4} ${tipY + 14}, ${px + 4.4} ${tipY + 18}
            C ${px + 4.4} ${tipY + 22}, ${px + 2.4} ${tipY + 26}, ${px + 1.2} ${tipY + 28}
            L ${px + 1.1} ${py}
            L ${px - 1.1} ${py}
            L ${px - 1.2} ${tipY + 28}
            C ${px - 2.4} ${tipY + 26}, ${px - 4.4} ${tipY + 22}, ${px - 4.4} ${tipY + 18}
            C ${px - 4.4} ${tipY + 14}, ${px - 1.2} ${tipY + 10}, ${px - 0.6} ${tipY + 6}
            Z" fill="#141008"/>
          <line x1="${px}" y1="${py - 5}" x2="${px}" y2="${tipY + 4}" stroke="rgba(255,255,255,0.20)" stroke-width="0.8"/>
          <circle cx="${px}" cy="${py}" r="7" fill="#141008"/>
          <circle cx="${px}" cy="${py}" r="3" fill="#2d3748"/>
        `
  };
}

/** Straight luminous yellow PPM wand with glow and round hub */
function ppmNeedle(px: number, py: number, R: number): NeedleParts {
  const topY = py - (R + 34);
  return {
    shadow: ppmNeedleShadow(px, py, topY),
    body: `
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="rgba(255,214,0,0.22)" stroke-width="7.5" stroke-linecap="round"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="#ffd600" stroke-width="4.6" stroke-linecap="round"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY + 2}" stroke="#fffbe6" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="${px}" cy="${py}" r="7" fill="#14181f"/>
          <circle cx="${px}" cy="${py}" r="3" fill="#ffd600"/>
        `
  };
}

export const PIMSON_STYLE: VuFaceStyle = { isFisam: false, isSifam: false, legend, vuNeedle, ppmNeedle };
export const SIMPSON_STYLE = PIMSON_STYLE;
export const PIMSOM_STYLE = PIMSON_STYLE;
