/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { TimeModeSpec } from './time-mode-spec';

/* Logarithmic time scale (default): expanded recent transients, beta-warped x axis. */

export const TIME_MODE_LOG: TimeModeSpec = {
  label: 'LOGARITHMIC',
  warped: true,
  verticalGrid: false,
  steps: (capSec, formatTimeOfDay) => [
    { sec: capSec,        label: formatTimeOfDay(capSec) },
    { sec: capSec * 0.6,  label: formatTimeOfDay(capSec * 0.6) },
    { sec: capSec * 0.3,  label: formatTimeOfDay(capSec * 0.3) },
    { sec: capSec * 0.15, label: formatTimeOfDay(capSec * 0.15) },
    { sec: capSec * 0.05, label: formatTimeOfDay(capSec * 0.05) },
    { sec: 0.0,           label: formatTimeOfDay(0) }
  ]
};
