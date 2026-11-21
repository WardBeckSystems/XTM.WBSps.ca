/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Complete base SVG shell for the XTM-4 front panel (both skins, all four meters). */
import { VW, VH, MX, MYc } from '../layout/wbs-layout';
import { SHELL_DEFS } from './defs';
import { renderCenterConsole } from './center-console';
import { renderMeterShell } from '../meter/meter-shell';
import { renderMcCurdyPanel } from '../skins/mccurdy/panel';
import { renderWbsCanvas, CHANNEL_A_FRAME, CHANNEL_B_FRAME } from '../skins/wbs/frames';

export interface ShellOptions {
  power: boolean;
  dialLamp: string;
  dialBg?: string;
  meterStyle: string;
  ppmStandard: string;
}

export function buildShellSvg(o: ShellOptions): string {
  const on = o.power;
  const dialBg = o.dialBg || 'auto';
  const meter = (id: number, fallbackX: number, kind: 'vu' | 'ppm') =>
    renderMeterShell(id, MX[id] ?? fallbackX, MYc, kind, on, o.dialLamp, kind === 'ppm', o.meterStyle, o.ppmStandard, dialBg);

  return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      ${SHELL_DEFS}

      <!-- Seamless Borderless Canvas -->
      ${renderWbsCanvas()}
      ${renderMcCurdyPanel()}

      <!-- Channel A Signature Green Console Frame -->
      ${CHANNEL_A_FRAME}

      <!-- Channel A Pair: Meter 0 (VU) + Meter 1 (PPM) -->
      ${meter(0, 373, 'vu')}
      ${meter(1, 1002, 'ppm')}

      <!-- Center Console Section -->
      ${renderCenterConsole(on)}

      <!-- Channel B Signature Green Console Frame -->
      ${CHANNEL_B_FRAME}

      <!-- Channel B Pair: Meter 2 (VU) + Meter 3 (PPM) -->
      ${meter(2, 2198, 'vu')}
      ${meter(3, 2827, 'ppm')}
    </svg>`;
}
