/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Shared <defs> block of the XTM shell: dial lamps, bloom, PPM face, chamber, plate, glows. */
import { AMBER_LAMP, WHITE_LAMP, PARCHMENT_LAMP, INCAND_BLOOM_GRADIENT } from '../skins/lamps/index';
import { BLACK_PPM_GRADIENT } from '../skins/dial-palette';
import { MC_VUFACE_GRADIENT } from '../skins/mccurdy/vu-face-gradient';
import { CHAMBER_GRADIENTS } from '../meter/chamber';
import { GREEN_PANEL_GRADIENT } from '../skins/wbs/frames';

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

        ${INCAND_BLOOM_GRADIENT}

        ${BLACK_PPM_GRADIENT}

        ${WHITE_LAMP.gradient}

        ${MC_VUFACE_GRADIENT}
        ${PARCHMENT_LAMP.gradient}

        ${CHAMBER_GRADIENTS}

        ${GREEN_PANEL_GRADIENT}

        ${GLOW_FILTERS}
      </defs>`;
