/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Needle renderer: the rotating group (id xtm_needle_N) that runtime updates
 * transform, plus the drop shadow shared by every PPM wand.
 */

/** Needle shapes for one pointer: shadow first, body on top */
export interface NeedleParts {
  shadow: string;
  body: string;
}

/** Shared PPM wand drop shadow (luminous yellow wand, all VU styles) */
export function ppmNeedleShadow(px: number, py: number, topY: number): string {
  return `
        <line x1="${px + 2}" y1="${py + 2}" x2="${px + 2}" y2="${topY + 6}" stroke="rgba(0,0,0,0.30)" stroke-width="3.5" stroke-linecap="round"/>
      `;
}

/** Rotating needle group at the rest angle */
export function renderNeedleGroup(id: number, restAng: number, px: number, py: number, n: NeedleParts): string {
  return `
      <g id="xtm_needle_${id}" transform="rotate(${restAng} ${px} ${py})">
        ${n.shadow}
        ${n.body}
      </g>`;
}
