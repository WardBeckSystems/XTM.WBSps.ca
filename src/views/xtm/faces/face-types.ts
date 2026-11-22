/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Shared types for dial face renderers. */
import type { PolarFn, ArcFn } from '../lib/svg';
import type { NeedleParts } from '../lib/needle';

/** Everything a face engraving needs about one meter window */
export interface FaceCtx {
  /** polar point about the needle pivot */
  P: PolarFn;
  /** arc band helper */
  arc: ArcFn;
  /** engraving ink colour */
  ink: string;
  /** Fisam angle span (+-50 deg) instead of +-45 deg */
  isFisam: boolean;
  isSifam?: boolean;
  /** window top-left */
  x0: number;
  y0: number;
}

/** A VU movement style (meterStyle): legends and needle shapes */
export interface VuFaceStyle {
  readonly isFisam: boolean;
  readonly isSifam?: boolean;
  /** VU / VU legends on the VU face */
  legend(ctx: FaceCtx): string;
  /** VU pointer (px, py = pivot, R = scale radius) */
  vuNeedle(px: number, py: number, R: number): NeedleParts;
  /** PPM pointer on the same movement style */
  ppmNeedle(px: number, py: number, R: number): NeedleParts;
  /** Optional custom scale renderer for this face variant */
  renderScale?(ctx: FaceCtx): string;
  /** Optional custom face logo renderer */
  faceLogo?(cx: number, cy: number, ink: string): string;
}
