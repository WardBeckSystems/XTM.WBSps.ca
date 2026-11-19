/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Button element lookup and per-frame pressed / released paint. */
import { BX } from '../layout/wbs-layout';
import { BUTTON_PAINT } from '../skins/wbs/buttons';

export interface ButtonElementBundle {
  border: SVGElement | null;
  top: SVGElement | null;
  bot: SVGElement | null;
  sheen: SVGElement | null;
  lbl: SVGElement | null;
}

export function queryButtonEls(container: HTMLElement, btnEls: Record<string, ButtonElementBundle>): void {
  Object.keys(BX).forEach(b => {
    btnEls[b] = {
      border: container.querySelector<SVGElement>(`#xtm_btn_border_${b}`),
      top: container.querySelector<SVGElement>(`#xtm_btn_top_${b}`),
      bot: container.querySelector<SVGElement>(`#xtm_btn_bot_${b}`),
      sheen: container.querySelector<SVGElement>(`#xtm_btn_sheen_${b}`),
      lbl: container.querySelector<SVGElement>(`#xtm_btn_lbl_${b}`)
    };
  });
}

export function paintButtons(btnEls: Record<string, ButtonElementBundle>, held: string | null): void {
  Object.keys(BX).forEach(b => {
    const els = btnEls[b];
    if (!els || !els.top) return;
    const c = held === b ? BUTTON_PAINT.down : BUTTON_PAINT.up;
    els.top.setAttribute('fill', c.top);
    els.top.setAttribute('stroke', c.topStroke);
    if (els.bot) els.bot.setAttribute('fill', c.bot);
    if (els.border) els.border.setAttribute('stroke', c.border);
    if (els.lbl) els.lbl.setAttribute('fill', c.lbl);
  });
}
