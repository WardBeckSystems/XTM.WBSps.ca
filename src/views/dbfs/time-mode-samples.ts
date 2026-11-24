/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { TimeModeSpec } from './time-mode-spec';

/* Samples time scale: individual audio samples; the axis is drawn by sample-scope.ts. */

export const TIME_MODE_SAMPLES: TimeModeSpec = {
  label: 'SAMPLES',
  verticalGrid: true,
  steps: () => [],
};
