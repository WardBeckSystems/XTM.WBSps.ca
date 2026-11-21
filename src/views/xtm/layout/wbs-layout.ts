/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * XTM-4 front panel positions (WBS skin and shared meter geometry).
 * All values are SVG user units within the 3200 x 430 viewBox.
 */

/** Canvas geometry */
export const VW = 3200;
export const VH = 430;

/** Meter window dimensions (broadcast aspect ratio, window mask) */
export const MW = 580;
export const MH = 290;

/** Meter centre X coordinates, window centre Y, needle pivot Y and scale radius */
export const MX: readonly number[] = [373, 1002, 2198, 2827];
export const MYc = 210;
export const PY = 410;
export const R = 265;

/** Centre console VFD window */
export const DISP: { readonly x: number; readonly y: number; readonly w: number; readonly h: number } = {
  x: 1380,
  y: 80,
  w: 440,
  h: 98
};

/** Centre console button X positions (key order = render order) */
export const BX: Record<string, number> = {
  MODE: 1385,
  SOURCE: 1499,
  DOWN: 1613,
  UP: 1727
};

export const BW = 94;
export const BH = 135;
export const BY = 224;

/** Phase LED row (8 lamps, 0 deg .. 180 deg) */
export const PHASE_LED = { x0: 1438, pitch: 46, cy: 42, count: 8 } as const;

/** VFD dot pitch (5x7 matrix, 8 characters) */
export const VFD_PITCH = 8.2;
