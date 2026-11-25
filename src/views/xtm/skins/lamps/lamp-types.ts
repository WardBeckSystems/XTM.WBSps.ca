/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** One VU dial lamp colour (model.dialLamp). */
export interface LampVariant {
  /** dialLamp value */
  readonly id: string;
  /** gradient id referenced by the powered face */
  readonly gradientId: string;
  /** <radialGradient> markup emitted once in the shell <defs> */
  readonly gradient: string;
  /** warm incandescent bloom ellipse behind the VU scale */
  readonly bloom: boolean;
  /** Bloom location: 'top' (default) or 'bottom' */
  readonly bloomPos?: 'top' | 'bottom';
}
