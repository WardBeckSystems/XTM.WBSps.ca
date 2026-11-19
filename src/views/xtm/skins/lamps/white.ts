/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** White VU dial lamp (cool, no incandescent bloom). */
import type { LampVariant } from './lamp-types';

export const WHITE_LAMP: LampVariant = {
  id: 'white',
  gradientId: 'xwhite',
  bloom: false,
  gradient: `<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`
};
