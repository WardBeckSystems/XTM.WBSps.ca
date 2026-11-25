/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
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
  ppmLamp?: string;
  ppmDialBg?: string;
  meterStyle: string;
  ppmStandard: string;
}

export function buildShellSvg(o: ShellOptions): string {
  const on = o.power;
  const dialBg = o.dialBg || 'auto';
  const ppmLamp = o.ppmLamp || 'unlit';
  const ppmDialBg = o.ppmDialBg || 'auto';
  const meter = (id: number, fallbackX: number, kind: 'vu' | 'ppm') => {
    const lamp = kind === 'ppm' ? ppmLamp : o.dialLamp;
    const bg = kind === 'ppm' ? ppmDialBg : dialBg;
    return renderMeterShell(id, MX[id] ?? fallbackX, MYc, kind, on, lamp, kind === 'ppm', o.meterStyle, o.ppmStandard, bg);
  };

  return `<svg class="xtm-master-panel" id="xtm_master_panel" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      ${SHELL_DEFS}

      <!-- Seamless Borderless Canvas -->
      ${renderWbsCanvas()}
      ${renderMcCurdyPanel()}

      <!-- Channel A Signature Green Console Frame -->
      <g id="xtm_channel_a_frame" class="xtm-channel-frame">
        ${CHANNEL_A_FRAME}
      </g>

      <!-- Channel A Pair: Meter 0 (VU) + Meter 1 (PPM) -->
      ${meter(0, 373, 'vu')}
      ${meter(1, 1002, 'ppm')}

      <!-- Center Console Section -->
      ${renderCenterConsole(on)}

      <!-- Channel B Signature Green Console Frame -->
      <g id="xtm_channel_b_frame" class="xtm-channel-frame">
        ${CHANNEL_B_FRAME}
      </g>

      <!-- Channel B Pair: Meter 2 (VU) + Meter 3 (PPM) -->
      ${meter(2, 2198, 'vu')}
      ${meter(3, 2827, 'ppm')}
    </svg>`;
}
