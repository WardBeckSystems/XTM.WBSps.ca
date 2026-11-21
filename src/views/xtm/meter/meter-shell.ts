/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Static meter dial movement shell: clipped face plate, lamp bloom, VU or PPM
 * engraving, skin logos, rotating needle group (id xtm_needle_N), chamber recess
 * shadows and molded bezel rim.
 */
import { MW, MH, PY, R } from '../layout/wbs-layout';
import { makePolar, makeArc } from '../lib/svg';
import { renderNeedleGroup } from '../lib/needle';
import { restAngle } from '../lib/scale-math';
import type { FaceCtx } from '../faces/face-types';
import { vuFaceStyle, renderVuScale } from '../faces/vu/index';
import { renderPpmFace } from '../faces/ppm/index';
import { dialPalette } from '../skins/dial-palette';
import { lampHasBloom } from '../skins/lamps/index';
import { renderWbsFaceLogo } from '../skins/wbs/face-logo';
import { renderMcCurdyVuBadge } from '../skins/mccurdy/vu-badge';
import { chamberShadows, bezelRim } from './chamber';
import { renderGlassShatter } from './shatter';

export function renderMeterShell(id: number, cx: number, cy: number, kind: 'vu' | 'ppm', isPowered: boolean,
                                 dialLamp: string, isBlackPpm: boolean, meterStyle: string, ppmStandard: string): string {
  const x0 = cx - MW / 2, y0 = cy - MH / 2;
  const px = cx, py = PY;
  const style = vuFaceStyle(meterStyle);
  const isSifam = (meterStyle === 'sifam');
  const isPpm = (kind === 'ppm' || isBlackPpm);

  const P = makePolar(px, py);
  const arc = makeArc(P);
  const { fill: fillGrad, ink } = dialPalette(isPpm, isPowered, dialLamp);
  const ctx: FaceCtx = { P, arc, ink, isSifam, x0, y0 };

  let s = `<clipPath id="xmc${id}"><rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5"/></clipPath>
    <g clip-path="url(#xmc${id})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect class="xt-face xt-lamp-${kind === 'vu' && !isBlackPpm ? dialLamp : 'ppm'}" x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5" fill="${fillGrad}"/>`;

  // Warm incandescent filament halo glow behind VU scales
  if (kind === 'vu' && isPowered && lampHasBloom(dialLamp)) {
    s += `<ellipse class="xt-bloom xt-lamp-${dialLamp}" cx="${cx}" cy="${y0 + 115}" rx="${(MW * 0.42).toFixed(1)}" ry="82" fill="url(#xincand_bloom)"/>`;
  }

  if (kind === 'vu') {
    s += style.renderScale ? style.renderScale(ctx) : renderVuScale(ctx);
    s += style.legend(ctx);
  } else {
    s += renderPpmFace(ctx, ppmStandard, isBlackPpm);
  }

  // Lower half of the face: Brand logos ALWAYS correspond to the active page theme!
  // Clicking either logo cycles the meter styles. The logo remains with its theme page and does not swap brand.
  s += `<g class="wbs-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (Ward-Beck)</title>
          ${renderWbsFaceLogo(cx, cy, ink)}
        </g>`;
  s += `<g class="mc-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (McCurdy)</title>
          ${renderMcCurdyVuBadge(cx, cy, ink)}
        </g>`;

  // Hardware-accelerated rotating needle assembly
  const needle = isPpm ? style.ppmNeedle(px, py, R) : style.vuNeedle(px, py, R);
  s += renderNeedleGroup(id, restAngle(isSifam), px, py, needle);

  s += chamberShadows(x0, y0);

  // VU Meter Shattered Glass Fracture Overlay (for VU meters 0 and 2)
  if (kind === 'vu' && !isBlackPpm) {
    s += renderGlassShatter(cx, cy, id);
  }

  s += bezelRim(x0, y0, cx);
  return s;
}
