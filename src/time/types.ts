/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * TIME Module Types: Themes, display options, and runtime state
 * for the precision broadcast master studio clock.
 */

export type ClockTheme = 'wbs-ca' | 'wbs-dark' | 'mccurdy-dark' | 'mccurdy-light';

export type SweepMode = 'smooth' | 'tick';

export interface ClockOptions {
  theme: ClockTheme;
  mode: SweepMode;
  showCueSectors: boolean;
  showVfdDigital: boolean;
  use24Hour: boolean;
}

export interface ClockTimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
  timeString12: string;
  timeString24: string;
  utcTimeString: string;
  dateString: string;
  timeZoneString: string;
}
