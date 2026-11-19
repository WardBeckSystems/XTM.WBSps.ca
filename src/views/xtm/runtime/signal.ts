/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Signal presence test for the 10-second loss of signal warning. */
import type { MeterFrameTelemetry } from '../../../types/telemetry';

/** Hold-off before the LOSS OF SIGNAL warning */
export const SIGNAL_LOSS_MS = 10000;

export function hasSignal(levels: MeterFrameTelemetry): boolean {
  return !!(levels && (
    levels.hasAudio ||
    (levels.ppmDb && ((levels.ppmDb[0] ?? -99) > -55 || (levels.ppmDb[1] ?? -99) > -55)) ||
    (levels.dbfs && ((levels.dbfs[0] ?? -99) > -58 || (levels.dbfs[1] ?? -99) > -58)) ||
    (levels.vuDb && ((levels.vuDb[0] ?? -99) > -55 || (levels.vuDb[1] ?? -99) > -55))
  ));
}
