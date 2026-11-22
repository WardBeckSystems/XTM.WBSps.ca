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
import { lampHasBloom, lampBloomPos } from '../skins/lamps/index';
import { renderWbsFaceLogo } from '../skins/wbs/face-logo';
import { renderMcCurdyVuBadge } from '../skins/mccurdy/vu-badge';
import { chamberShadows, bezelRim } from './chamber';
import { renderGlassShatter } from './shatter';

export function renderMeterShell(id: number, cx: number, cy: number, kind: 'vu' | 'ppm', isPowered: boolean,
                                 dialLamp: string, isBlackPpm: boolean, meterStyle: string, ppmStandard: string, dialBg = 'auto'): string {
  const x0 = cx - MW / 2, y0 = cy - MH / 2;
  const px = cx, py = PY;
  const style = vuFaceStyle(meterStyle);
  const isFisam = (meterStyle === 'fisam' || meterStyle === 'sifam');
  const isPpm = (kind === 'ppm' || isBlackPpm);

  const P = makePolar(px, py);
  const arc = makeArc(P);
  const isWbsCa = typeof document !== 'undefined' && document.body?.classList.contains('theme-wbs-ca');
  const activeLamp = (isWbsCa && dialLamp === 'amber') ? 'amber_bottom' : dialLamp;
  const { fill: fillGrad, ink } = dialPalette(isPpm, isPowered, activeLamp, dialBg);
  const ctx: FaceCtx = { P, arc, ink, isFisam, isSifam: isFisam, x0, y0 };

  let s = `<g id="xtm_meter_group_${id}" class="xtm-meter-group xtm-meter-${id}">
    <clipPath id="xmc${id}"><rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5"/></clipPath>
    <!-- Strict glass-only aperture clip ensuring fractures never spill onto metal chassis or bezel -->
    <clipPath id="xshatter_clip_${id}"><rect x="${x0 + 6}" y="${y0 + 6}" width="${MW - 12}" height="${MH - 12}" rx="18"/></clipPath>
    <g clip-path="url(#xmc${id})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect class="xt-face xt-lamp-${activeLamp}" x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5" fill="${fillGrad}"/>`;

  // Warm incandescent filament halo glow behind dial scales (dual bottom lamps for Ward-Beck.ca or top filament bloom)
  if (isPowered && lampHasBloom(activeLamp)) {
    const isBottom = lampBloomPos(activeLamp) === 'bottom' || isWbsCa;
    if (isBottom) {
      // Dual bottom lamps: full-width rects with left & right radial lamp gradients (smooth & seamless)
      s += `<rect class="xt-bloom xt-lamp-left" x="${x0}" y="${y0}" width="${MW}" height="${MH}" fill="url(#xamber_lamp_left)" pointer-events="none"/>`;
      s += `<rect class="xt-bloom xt-lamp-right" x="${x0}" y="${y0}" width="${MW}" height="${MH}" fill="url(#xamber_lamp_right)" pointer-events="none"/>`;
    } else {
      const bloomCy = y0 + 115;
      const bloomRx = (MW * 0.42).toFixed(1);
      const bloomRy = 82;
      const bloomGrad = 'xincand_bloom';
      s += `<ellipse class="xt-bloom xt-lamp-${activeLamp}" cx="${cx}" cy="${bloomCy}" rx="${bloomRx}" ry="${bloomRy}" fill="url(#${bloomGrad})"/>`;
    }
  }

  if (kind === 'vu') {
    s += style.renderScale ? style.renderScale(ctx) : renderVuScale(ctx);
    s += style.legend(ctx);
  } else {
    s += renderPpmFace(ctx, ppmStandard, isBlackPpm);
  }

  // Lower half of the face: Brand logos ALWAYS correspond to the active page theme!
  // Clicking either logo cycles the meter styles. Ctrl+Alt+Click toggles Dual Meter only mode.
  s += `<g class="wbs-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (Ward-Beck) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${renderWbsFaceLogo(cx, cy, ink)}
        </g>`;
  s += `<g class="mc-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (McCurdy) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${renderMcCurdyVuBadge(cx, cy, ink, isPpm)}
        </g>`;

  // Hardware-accelerated rotating needle assembly
  const needle = isPpm ? style.ppmNeedle(px, py, R) : style.vuNeedle(px, py, R);
  s += renderNeedleGroup(id, restAngle(isFisam), px, py, needle);

  s += chamberShadows(x0, y0);

  // VU Meter Shattered Glass Fracture Overlay (for VU meters 0 and 2)
  if (kind === 'vu' && !isBlackPpm) {
    s += renderGlassShatter(cx, cy, id);
  }

  s += bezelRim(x0, y0, cx);
  s += `</g>`; // close clip-path="url(#xmc${id})"
  s += `</g>`; // close xtm_meter_group_${id}
  return s;
}
