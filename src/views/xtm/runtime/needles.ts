/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Per-frame needle rotation: direct transform writes, skipped when the angle has not moved. */
import type { MeterFrameTelemetry } from '../../../types/telemetry';
import { MX, PY } from '../layout/wbs-layout';
import { vuAngle, ppmAngle, restAngle } from '../lib/scale-math';

/** Target angles for meters 0..3 (VU A, PPM A, VU B, PPM B) */
export function needleAngles(levels: MeterFrameTelemetry, on: boolean, fisam: boolean): [number, number, number, number] {
  const vu = levels?.vu ?? [0, 0];
  const ppm = levels?.ppm ?? [-0.12, -0.12];
  const restVu = restAngle(fisam);
  const restPpm = restAngle(fisam);
  return [
    on ? vuAngle(vu[0] ?? 0, fisam) : restVu,
    on ? ppmAngle(ppm[0] ?? -0.12, fisam) : restPpm,
    on ? vuAngle(vu[1] ?? 0, fisam) : restVu,
    on ? ppmAngle(ppm[1] ?? -0.12, fisam) : restPpm
  ];
}

/** Write changed angles to the needle groups; updates lastAngles in place */
export function applyNeedleAngles(angles: readonly number[], lastAngles: number[], needleEls: (SVGElement | null)[]): void {
  for (let i = 0; i < 4; i++) {
    const ang = angles[i]!;
    const lastAng = lastAngles[i]!;
    if (Math.abs(ang - lastAng) > 0.005) {
      lastAngles[i] = ang;
      const el = needleEls[i];
      const mx = MX[i] ?? 0;
      if (el) {
        el.setAttribute('transform', `rotate(${ang.toFixed(2)} ${mx} ${PY})`);
      }
    }
  }
}
