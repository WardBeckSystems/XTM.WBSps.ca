/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { TimeModeSpec, TimeStep } from './time-mode-spec';

/* Linear time scale: wall-clock time of day on the lower axis, evenly spaced ticks. */

export const TIME_MODE_LIN: TimeModeSpec = {
  label: 'LINEAR',
  warped: false,
  verticalGrid: true,
  steps: (capSec, formatTimeOfDay) => {
    const timeSteps: TimeStep[] = [];
    const step = capSec / 5;
    for (let s = capSec; s > 0.01; s -= step) {
      timeSteps.push({ sec: s, label: formatTimeOfDay(s) });
    }
    timeSteps.push({ sec: 0.0, label: formatTimeOfDay(0) });
    return timeSteps;
  }
};
