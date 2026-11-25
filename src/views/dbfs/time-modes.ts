/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { TimeScaleMode } from '../../types/telemetry';
import type { TimeModeSpec } from './time-mode-spec';
import { TIME_MODE_LOG } from './time-mode-log';
import { TIME_MODE_SUPER_LOG } from './time-mode-super-log';
import { TIME_MODE_LIN } from './time-mode-lin';
import { TIME_MODE_SAMPLES } from './time-mode-samples';

/* Time-scale mode lookup and shared time-axis helpers. */

/** Axis ticks / HUD label / grid policy for a mode; anything not log or super_log uses linear. */
export function timeModeSpec(mode: TimeScaleMode): TimeModeSpec {
  if (mode === 'super_log') return TIME_MODE_SUPER_LOG;
  if (mode === 'log') return TIME_MODE_LOG;
  if (mode === 'samples') return TIME_MODE_SAMPLES;
  return TIME_MODE_LIN;
}

/** x is beta log-warped for every mode except 'lin'. */
export function isWarpedMode(mode: TimeScaleMode): boolean {
  return mode === 'log' || mode === 'super_log';
}

/** Format Time of Day (e.g. 21:15:30) for both log and linear timelines. */
export function formatTimeOfDay(secAgo: number): string {
  const d = new Date(Date.now() - secAgo * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
