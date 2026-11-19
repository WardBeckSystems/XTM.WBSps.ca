/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS skin: MODE / SOURCE / DOWN / UP rectangular pushbutton switches with white
 * labels above, and their pressed / released paint.
 */
import { BX, BY, BW, BH } from '../../layout/wbs-layout';

export function renderButtons(): string {
  return Object.keys(BX).map(b => {
    const x = BX[b] ?? 1385;
    const y = BY;
    const bh = BH;
    const topH = Math.round(bh * 0.44);
    const botH = bh - topH - 5;
    return `
          <g class="xtm-btn" id="xtm_btn_${b}" data-btn="${b}" style="cursor:pointer">
            <text class="xt-btn-lbl" id="xtm_btn_lbl_${b}" x="${x + BW / 2}" y="206" font-size="14" font-weight="900" text-anchor="middle"
                  fill="#ffffff" letter-spacing="1.5">${b}</text>
            <rect id="xtm_btn_border_${b}" x="${x}" y="${y}" width="${BW}" height="${bh}" rx="2"
                  fill="#0b0d10" stroke="#1f2937" stroke-width="2"/>
            <rect id="xtm_btn_top_${b}" x="${x + 3}" y="${y + 3}" width="${BW - 6}" height="${topH}" rx="1"
                  fill="#2d3748" stroke="#374151" stroke-width="1"/>
            <rect id="xtm_btn_sheen_${b}" x="${x + 6}" y="${y + 5}" width="${BW - 12}" height="14" rx="1"
                  fill="rgba(255,255,255,0.08)"/>
            <rect id="xtm_btn_bot_${b}" x="${x + 3}" y="${y + topH + 3}" width="${BW - 6}" height="${botH}" rx="1"
                  fill="#11151c" stroke="#1a202c" stroke-width="1"/>
          </g>`;
  }).join('');
}

/** Fill / stroke for a button in the held or released state */
export const BUTTON_PAINT = {
  down: { top: '#15803d', topStroke: '#86efac', bot: '#0e2e18', border: '#86efac', lbl: '#ffffff' },
  up:   { top: '#2d3748', topStroke: '#374151', bot: '#11151c', border: '#1f2937', lbl: '#ffffff' }
} as const;
