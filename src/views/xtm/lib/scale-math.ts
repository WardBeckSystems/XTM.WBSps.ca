/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Central meter calibration and scale math repository:
 * - Analog VU & quasi-peak PPM logarithmic/linear scale mappings.
 * - Reference calibration alignment constants (EBU, ANSI, SMPTE).
 * - Ward-Beck Systems M433/M434 Peak Program Meter scale calibration logic
 *   (DA91001/SCALE2-3, p. 3-2).
 */

/* ============================================================================
 * 1. Broadcast Reference & Alignment Calibration Constants
 * ============================================================================ */

/** Standard North American analog studio reference: 0 VU = +4 dBu */
export const REF_0VU_DBU = 4.0;

/** EBU / ANSI broadcast digital alignment: 0 VU = -18 dBFS */
export const REF_0VU_DBFS = -18.0;

/** SMPTE RP155 digital alignment: 0 VU = -20 dBFS */
export const REF_SMPTE_DBFS = -20.0;

/** Reference alignment offset: 0 dB PPM = -18 dBFS */
export const PPM_REF_OFFSET_DB = 18.465;

/* ============================================================================
 * 2. Ward-Beck Systems M433 / M434 Calibration Specifications
 * ============================================================================ */

/** Center alignment reference on dial: -8 dB is Reference 'R' (0 deg vertical) */
export const WBS_M433_REF_DB = -8.0;

/** Minimum calibrated scale mark (-20 dB) */
export const WBS_M433_MIN_DB = -20.0;

/** Maximum primary scale mark (+4 dB) */
export const WBS_M433_MAX_SCALE_DB = 4.0;

/** Overload warning yellow marker start (0 dB) */
export const WBS_M433_WARN_START_DB = 0.0;

/** Overload warning yellow marker end (+6 dB) */
export const WBS_M433_WARN_END_DB = 6.0;

/** Calibrated linear active span between -20 dB and +4 dB */
export const WBS_M433_DB_SPAN = 24.0;

/** Major division tick marks on the M433/M434 dial (-20 to +4 dB in 4 dB steps) */
export const WBS_M433_MAJOR_TICKS: readonly number[] = [-20, -16, -12, -8, -4, 0, 4];

/** Intermediate minor tick marks on the M433/M434 dial (2 dB steps) */
export const WBS_M433_MINOR_TICKS: readonly number[] = [-18, -14, -10, -6, -2, 2];

/**
 * Convert a Ward-Beck M433/M434 dial dB reading (-20 to +6 dB)
 * into a normalized scale fraction q (0 at -20 dB, 0.5 at -8 dB Ref, 1.0 at +4 dB, 1.0833 at +6 dB).
 */
export function wbsPpmDialDbToFrac(dialDb: number): number {
  return (dialDb - WBS_M433_MIN_DB) / WBS_M433_DB_SPAN;
}

/**
 * Convert a normalized scale fraction q into the corresponding Ward-Beck M433/M434 dial dB reading.
 */
export function wbsPpmFracToDialDb(q: number): number {
  return WBS_M433_MIN_DB + q * WBS_M433_DB_SPAN;
}

/**
 * Convert an audio engine relative dB level (where 0 dB_rel = Reference tone)
 * to the corresponding Ward-Beck M433/M434 dial dB reading.
 * Example: 0 dB relative reference = -8 dB dial reading.
 */
export function wbsPpmRelativeDbToDialDb(relDb: number): number {
  return relDb + WBS_M433_REF_DB;
}

/**
 * Convert a Ward-Beck M433/M434 dial dB reading to the audio engine relative dB level.
 * Example: -8 dB dial reading = 0 dB relative reference.
 */
export function wbsPpmDialDbToRelativeDb(dialDb: number): number {
  return dialDb - WBS_M433_REF_DB;
}

/**
 * Calculate the pointer needle deflection angle (degrees from vertical)
 * directly for a given Ward-Beck M433/M434 dial dB reading.
 */
export function wbsPpmDialAngle(dialDb: number, isFisam = false): number {
  return ppmAngle(wbsPpmDialDbToFrac(dialDb), isFisam);
}

/* ============================================================================
 * 3. General Analog VU Meter Scale Math
 * ============================================================================ */

/**
 * Convert VU dB level to power fraction p.
 * Standard ANSI C16.5: 0 VU corresponds to 10^(-3/20) ~ 0.707 of full movement scale.
 */
export function vuFrac(db: number): number {
  return Math.pow(10, (db - 3) / 20);
}

/**
 * Convert power fraction p to needle angle (degrees from vertical).
 * Standard span: -45 deg to +45 deg (or -50 deg to +50 deg for Sifam/Fisam Director 14).
 */
export function vuAngle(p: number, isFisam = false): number {
  if (isFisam) {
    return -50 + 100 * Math.max(-0.03, Math.min(1.08, p));
  }
  return -45 + 90 * Math.max(-0.03, Math.min(1.08, p));
}

/* ============================================================================
 * 4. General Quasi-Peak PPM Scale Math
 * ============================================================================ */

/**
 * Convert relative PPM dB to normalized scale fraction q.
 * Active linear span: -12 dB to +12 dB maps to q in [0, 1].
 * Values below -12 dB taper smoothly into the left rest stop.
 */
export function ppmFrac(db: number | null): number {
  if (db === null || !Number.isFinite(db)) return -0.12;
  return db >= -12 ? (db + 12) / 24 : -0.12 * (1 - Math.pow(10, (db + 12) / 20));
}

/**
 * Convert normalized PPM fraction q to needle angle (degrees from vertical).
 * q = 0.5 (center) corresponds to 0 degrees vertical.
 */
export function ppmAngle(q: number, isFisam = false): number {
  if (isFisam) {
    return -50 + 100 * Math.max(-0.13, Math.min(1.08, q));
  }
  return -45 + 90 * Math.max(-0.13, Math.min(1.08, q));
}

/**
 * Needle rest angle (fully left) for the face movement style.
 */
export function restAngle(isFisam: boolean): number {
  return isFisam ? -50 : -45;
}

/**
 * Standard cubic Hermite smoothstep interpolation between e0 and e1.
 */
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
