/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Shared application context passed to every feature module. */

import { xtmModel } from '../models/xtm-model';
import { audio as audioEngine } from '../audio/audio-engine';
import type { XtmView } from '../views/xtm-view';
import type { Pod22View } from '../views/pod22-view';
import type { DbfsView } from '../views/dbfs-view';
import type { DataStreamView } from '../views/data-stream-view';
import type { WebRouter } from '../../WebRouter/src';
import { configManager } from '../config/config-manager';

export type AppModel = typeof xtmModel;
export type AppAudio = typeof audioEngine;

export interface AppContext {
  model: AppModel;
  audio: AppAudio;
  view: XtmView;
  podView: Pod22View;
  dbfsView: DbfsView | null;
  dataView?: DataStreamView | null;
  webRouter?: WebRouter | null;
}

/** Persist the current configuration (only when the scope view exists). */
export function saveAppConfig(ctx: AppContext, model: AppModel = ctx.model): void {
  if (ctx.dbfsView) configManager.saveConfig(model, ctx.audio, ctx.podView, ctx.dbfsView);
}
