/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/* Shared shape of a time-scale mode (log / super_log / lin). */

export interface TimeStep { sec: number; label: string }

export interface TimeModeSpec {
  /** HUD sub-title label, e.g. 'LOGARITHMIC'. */
  label: string;
  /** Vertical grid lines are drawn only on the linear time axis. */
  verticalGrid: boolean;
  /** Bottom-axis tick positions (seconds ago) with wall-clock labels. */
  steps(capSec: number, formatTimeOfDay: (secAgo: number) => string): TimeStep[];
}
