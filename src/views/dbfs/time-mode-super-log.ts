/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { TimeModeSpec } from './time-mode-spec';

/* Super transient log time scale: steep beta warp (beta = 60) for very recent detail. */

export const TIME_MODE_SUPER_LOG: TimeModeSpec = {
  label: 'SUPER TRANSIENT LOG',
  warped: true,
  verticalGrid: false,
  steps: (capSec, formatTimeOfDay) => [
    { sec: capSec,        label: formatTimeOfDay(capSec) },
    { sec: capSec * 0.4,  label: formatTimeOfDay(capSec * 0.4) },
    { sec: capSec * 0.15, label: formatTimeOfDay(capSec * 0.15) },
    { sec: capSec * 0.04, label: formatTimeOfDay(capSec * 0.04) },
    { sec: capSec * 0.01, label: formatTimeOfDay(capSec * 0.01) },
    { sec: 0.0,           label: formatTimeOfDay(0) }
  ]
};
