/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** POD-22 geometry: SVG canvas size, segment pitch and row placement. */

export const POD22_PW = 3200;
export const POD22_PH = 192;

/** Vertical bargraph slot size (32w x 54h, tight 46px pitch). */
export const SEG_W = 32;
export const SEG_H = 54;
export const SEG_PITCH = 46;

/** Centre y of each LED row: 0 = Left channel, 1 = Right channel. */
export const ROW_Y: readonly [number, number] = [38, 136];

/** Centre x of segment position p (p = 25 is 0 VU at the canvas centre). */
export function segX(p: number): number {
  return 1600 + (p - 25) * SEG_PITCH;
}
