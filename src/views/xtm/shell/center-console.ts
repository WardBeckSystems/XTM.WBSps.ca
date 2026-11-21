/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Centre console: phase LED row, green plate / McCurdy centre, VFD window and buttons. */
import { DISP } from '../layout/wbs-layout';
import { MC_PHASE_WINDOW } from '../skins/mccurdy/phase-window';
import { renderMcCurdyCenter } from '../skins/mccurdy/center';
import { renderPhaseLedRow } from '../skins/wbs/phase-leds';
import { renderCenterPlate } from '../skins/wbs/center-plate';
import { renderButtons } from '../skins/wbs/buttons';
import { renderVintageWbsCenter } from '../skins/wbs/vintage-center';

export function renderCenterConsole(on: boolean): string {
  return `<g id="xtm_center_console" class="xtm-center-console">
        <!-- Correlation Phase Row Assembly (translates down when meters expand) -->
        <g id="xtm_phase_row_assembly" class="xtm-phase-row-assembly" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);">
          ${MC_PHASE_WINDOW}

          <!-- Modern Ward-Beck Console Section (Ward-Beck.com) -->
          <g class="wbs-modern-only">
            <text class="xt-deg" x="1390" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
            ${renderPhaseLedRow()}
            <text class="xt-deg" x="1812" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>
          </g>
        </g>

        <!-- Center Controls Group (locks in place with preserved settings) -->
        <g id="xtm_center_controls_group" class="xtm-center-controls-group" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease;">
          <g class="wbs-modern-only">
            <!-- Center Console Signature Solid Green Plate Stencil (Borders just the shape with scalloped notches) -->
            ${renderCenterPlate()}

            <!-- Center VFD Dot-Matrix Display Cutout Window -->
            <rect class="wbs-only" x="${DISP.x}" y="${DISP.y}" width="${DISP.w}" height="${DISP.h}" rx="6" fill="#040605" stroke="#052e16" stroke-width="2.5"/>
            <g class="wbs-only" id="xvfd_group" ${on ? 'filter="url(#xglow)"' : ''}></g>
          </g>

          <!-- McCurdy Centre Console Section (McCurdyRadio.ca / .com) -->
          ${renderMcCurdyCenter()}

          <!-- Vintage Ward-Beck Console Section (Ward-Beck.ca - DR Vernier Dial, Skirted Knob, AC Lamp) -->
          ${renderVintageWbsCenter(on)}

          <!-- Mode & Source / Up & Down Front-Panel Buttons -->
          ${renderButtons()}

          <!-- Lock Indicator Badge displayed when middle section locks into place -->
          <g id="xtm_center_locked_badge" class="xtm-center-locked-badge" style="opacity: 0; pointer-events: none; transition: opacity 0.3s ease;">
            <rect x="1540" y="8" width="120" height="26" rx="13" fill="#090b0e" stroke="#22c55e" stroke-width="1.4" opacity="0.95"/>
            <path d="M 1558 21 L 1558 18 A 4 4 0 0 1 1566 18 L 1566 21 M 1556 21 L 1568 21 A 1.2 1.2 0 0 1 1569.2 22.2 L 1569.2 28.8 A 1.2 1.2 0 0 1 1568 30 L 1556 30 A 1.2 1.2 0 0 1 1554.8 28.8 L 1554.8 22.2 A 1.2 1.2 0 0 1 1556 21 Z" fill="none" stroke="#22c55e" stroke-width="1.3"/>
            <text x="1606" y="25" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#22c55e" text-anchor="middle" letter-spacing="1.5">LOCKED</text>
          </g>
        </g>
      </g>`;
}
