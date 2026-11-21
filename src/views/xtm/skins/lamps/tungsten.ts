/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Warm incandescent tungsten & vintage golden honey VU dial lamps. */
import type { LampVariant } from './lamp-types';

export const TUNGSTEN_LAMP: LampVariant = {
  id: 'tungsten',
  gradientId: 'xtungsten',
  bloom: true,
  bloomPos: 'top',
  gradient: `<radialGradient id="xtungsten" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff4e0"/>
          <stop offset="20%" stop-color="#fedaa0"/>
          <stop offset="45%" stop-color="#fca840"/>
          <stop offset="72%" stop-color="#d96b10"/>
          <stop offset="92%" stop-color="#994105"/>
          <stop offset="100%" stop-color="#552002"/>
        </radialGradient>`
};

export const GOLDEN_LAMP: LampVariant = {
  id: 'golden',
  gradientId: 'xgolden',
  bloom: true,
  bloomPos: 'top',
  gradient: `<radialGradient id="xgolden" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff9d6"/>
          <stop offset="18%" stop-color="#ffe680"/>
          <stop offset="45%" stop-color="#f5ba18"/>
          <stop offset="70%" stop-color="#cb8306"/>
          <stop offset="90%" stop-color="#8c4e02"/>
          <stop offset="100%" stop-color="#4d2700"/>
        </radialGradient>`
};
