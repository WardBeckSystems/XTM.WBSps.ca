/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** WBS skin: trademark logo on the lower half of every dial face (class wbs-only). */
import { WBS_LOGO_PATH } from '../../lib/wbs-logo';

export function renderWbsFaceLogo(cx: number, cy: number, ink: string): string {
  return `<g class="wbs-only" transform="translate(${(cx - 44.5).toFixed(1)}, ${(cy + 22).toFixed(1)}) scale(1.2)">
              <path d="${WBS_LOGO_PATH}" fill="${ink}" fill-rule="evenodd"/>
            </g>`;
}
