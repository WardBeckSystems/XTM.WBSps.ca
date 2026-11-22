/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { ScopeLayout } from './layout';
import { timeModeSpec, isWarpedMode, formatTimeOfDay } from './time-modes';

/* Bottom time axis: ticks + wall-clock labels, with vertical grid lines in linear mode only. */

export function drawTimeAxis(v: DbfsView, ctx: CanvasRenderingContext2D, L: ScopeLayout, capSec: number, beta: number, logBetaDenom: number): void {
  const { dpr, padL, padT, plotW, plotH } = L;
  ctx.font = `${Math.round(10 * dpr)}px ui-monospace, "SF Mono", monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = v.PAL.textMuted;
  ctx.strokeStyle = v.PAL.gridTime;
  ctx.lineWidth = 1 * dpr;

  // Requirement 56: the log time also shows time of day, not "- minutes"
  const spec = timeModeSpec(v.timeMode);
  const timeSteps = spec.steps(capSec, formatTimeOfDay);
  const warped = isWarpedMode(v.timeMode);

  timeSteps.forEach(ts => {
    let x;
    if (!warped) {
      x = Math.round(padL + plotW * (1 - ts.sec / capSec));
    } else {
      const tau = ts.sec / capSec;
      const u = ts.sec === 0 ? 0 : Math.log(1 + beta * tau) / logBetaDenom;
      x = Math.round(padL + plotW * (1 - u));
    }

    // Vertical grid lines: ONLY drawn in linear mode. NO vertical grid lines in log or super_log mode!
    if (spec.verticalGrid) {
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
    }

    // Bottom axis tick mark & time label
    ctx.beginPath();
    ctx.moveTo(x, padT + plotH);
    ctx.lineTo(x, padT + plotH + 4 * dpr);
    ctx.stroke();

    // At ts.sec === 0 (the NOW time on the timeline), the interactive
    // #btnTimelineNowTime badge is rendered directly above/beside this tick.
    if (ts.sec === 0) {
      return;
    }

    ctx.fillText(ts.label, x, padT + plotH + 6 * dpr);
  });
}
