/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Shared <defs> block of the XTM shell: dial lamps, bloom, PPM face, chamber, plate, glows. */
import {
  AMBER_LAMP,
  AMBER_BOTTOM_LAMP,
  WHITE_LAMP,
  WARM_WHITE_LAMP,
  PARCHMENT_LAMP,
  TUNGSTEN_LAMP,
  GOLDEN_LAMP,
  GREEN_GLOW_LAMP,
  DARK_NIGHT_LAMP,
  UNLIT_LAMP,
  INCAND_BLOOM_GRADIENT,
  DUAL_BOTTOM_LAMP_GRADIENTS,
  DIAL_BG_GRADIENTS
} from '../skins/lamps/index';
import { BLACK_PPM_GRADIENT } from '../skins/dial-palette';
import { MC_VUFACE_GRADIENT } from '../skins/mccurdy/vu-face-gradient';
import { CHAMBER_GRADIENTS } from '../meter/chamber';
import { GREEN_PANEL_GRADIENT } from '../skins/wbs/frames';
import { WBS_VINTAGE_DEFS } from '../skins/wbs/vintage-defs';

const GLOW_FILTERS = `<filter id="xglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="xledglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;

export const SHELL_DEFS = `<defs>
        ${AMBER_LAMP.gradient}
        ${AMBER_BOTTOM_LAMP.gradient}
        ${TUNGSTEN_LAMP.gradient}
        ${GOLDEN_LAMP.gradient}
        ${WHITE_LAMP.gradient}
        ${WARM_WHITE_LAMP.gradient}
        ${PARCHMENT_LAMP.gradient}
        ${GREEN_GLOW_LAMP.gradient}
        ${DARK_NIGHT_LAMP.gradient}
        ${UNLIT_LAMP.gradient}

        ${INCAND_BLOOM_GRADIENT}
        ${DUAL_BOTTOM_LAMP_GRADIENTS}
        ${DIAL_BG_GRADIENTS}

        ${BLACK_PPM_GRADIENT}
        ${MC_VUFACE_GRADIENT}
        ${CHAMBER_GRADIENTS}
        ${GREEN_PANEL_GRADIENT}
        ${WBS_VINTAGE_DEFS}
        ${GLOW_FILTERS}
      </defs>`;
