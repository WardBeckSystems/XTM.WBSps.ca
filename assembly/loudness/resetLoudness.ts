/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { msM_L, msM_R, msS_L, msS_R } from "./state";

export function resetLoudness(): void {
  msM_L = 0.0;
  msM_R = 0.0;
  msS_L = 0.0;
  msS_R = 0.0;
}
