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
  return `<g>
        ${MC_PHASE_WINDOW}

        <!-- Modern Ward-Beck Console Section (Ward-Beck.com) -->
        <g class="wbs-modern-only">
          <text class="xt-deg" x="1390" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
          ${renderPhaseLedRow()}
          <text class="xt-deg" x="1812" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>

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
      </g>`;
}
