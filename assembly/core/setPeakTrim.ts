/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { peakSensTrim } from "./state";

export function setPeakTrim(trimDb: f64): void {
  peakSensTrim = trimDb;
}
