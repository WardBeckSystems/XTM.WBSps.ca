/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { MeterFrameTelemetry, TimeScaleMode } from '../types/telemetry';
import type { XtmModel } from '../models/xtm-model';
import type { VisibleNtpDot, NtpReceipt } from '../time/ntp-types';
import { sliderToSeconds, secondsToSlider, formatDuration } from './dbfs/capture-steps';
import { allocHistories, resizeBuffer, clearHistory, pushSample } from './dbfs/history';
import { PYR_LEVELS, pyrSources, pyrReset, pyrPush, rawAt, blockAt, levelAt, pyrSample } from './dbfs/pyramid';
import { loadSavedScopeOptions } from './dbfs/saved-options';
import { createDarkPalette } from './dbfs/palette-dark';
import { PAL_MC } from './dbfs/palette-mccurdy';
import { initCanvas } from './dbfs/init-canvas';
import { setDocked, setBeta, setTimeMode, setCaptureLength, handleResize } from './dbfs/view-settings';
import { renderFrame } from './dbfs/render';
/**
 * dBFS & ITU-R BS.1770 / EBU R128 Loudness Over Time Audio Scope
 * Inspired by APK.softapp.TEST.AUDIO.DbfsMeters (LikeDotAudio) & professional broadcast mastering scopes.
 * Continuous rolling strip chart plotting Left & Right digital peak dBFS alongside
 * real-time Perceived Loudness (Momentary & Short-term LUFS) from -60 dBFS to 0 dBFS ceiling at 60 FPS.
 *
 * Supports selectable Logarithmic (default, expanded recent transients) or Linear time scale.
 * User-adjustable Capture Length up to 1 Hour (3600s) with dedicated CLEAR button.
 * Downsampled min/max peak decimation for high-performance 60 FPS rendering across large buffers.
 * Horizontal level reference grid every 4 dBFS across dynamic range.
 * Zero vertical grid lines in logarithmic time mode.
 * Floating hover-over HUD displaying all precision telemetry (eliminates canvas legend).
 *
 * This class holds the view state; the behaviour lives in ./dbfs/*:
 *   history / pyramid       ring buffers + anti-shimmer peak pyramid
 *   init-canvas & bind-*    DOM template, HUD and settings-drawer wiring
 *   view-settings           setters (dock, beta, time mode, capture length, resize)
 *   render -> graph         per-frame render; offscreen graph layer (time-mode-*, palette-*)
 */
export class DbfsView {
  container: HTMLElement | null;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  graphCanvas: HTMLCanvasElement | null = null;
  graphCtx: CanvasRenderingContext2D | null = null;
  graphDirty: boolean = true;
  renderFrameCount: number = 0;
  _lastGraphRenderTime: number = 0;

  timeMode: TimeScaleMode = 'log';
  onTimeModeChange: ((mode: TimeScaleMode) => void) | null = null;
  beta: number = 15;
  logBetaDenom: number = Math.log(1 + 15);

  maxCaptureSec: number = 600;
  captureLength: number = 60;
  captureSpeed: number = 60;
  lastPushTime: number = 0;
  pushAccumulator: number = 0;

  bufferSize: number;

  /* Anti-shimmer peak pyramid (see dbfs/pyramid.ts):
     For each drawn history array, level l stores the max of fixed 2^l-sample blocks,
     anchored to the ABSOLUTE sample index, so blocks never re-phase as the graph scrolls. */
  static readonly PYR_LEVELS = PYR_LEVELS;   // up to 16384-sample blocks
  absCount: number = 0;                      // total samples ever written (since last clear)
  pyr: Map<Float32Array, { max: Float32Array[]; sum: Float32Array[] }> = new Map();
  pyrFor: Float32Array | null = null;        // histL the pyramid was built for

  histL!: Float32Array;
  histR!: Float32Array;
  histSum!: Float32Array;
  histDiff!: Float32Array;
  histNormL!: Float32Array;
  histNormR!: Float32Array;
  histNormSum!: Float32Array;
  histNormDiff!: Float32Array;
  histLufsM!: Float32Array;
  histLufsS!: Float32Array;
  histLufsI!: Float32Array;
  histPhase!: Float32Array;

  envL: number = -60;
  envR: number = -60;
  envSum: number = -60;
  envDiff: number = -60;
  envLufsM: number = -60;
  envLufsS: number = -60;
  normL: number = -60;
  normR: number = -60;
  normSum: number = -60;
  normDiff: number = -60;
  head: number = 0;
  count: number = 0;

  isHoveringLime: boolean = false;
  _lastHoveringLime: boolean = false;
  zoomFeedbackTime: number = 0;
  zoomFeedbackText: string = '';

  showChA: boolean;
  showChB: boolean;
  showSum: boolean;
  showDiff: boolean;
  showLufs: boolean;
  showLufsS: boolean;
  showLufsI: boolean;
  show0DbfsLine: boolean;
  enableFade: boolean = false;
  hfFadeDistance: number = 100;
  showHoverTelemetry: boolean = true;
  showCursorTrace: boolean = true;
  plotPhase: boolean = true;
  isDocked: boolean;
  hoverX: number | null = null;
  hoverY: number | null = null;

  visibleNtpDots: VisibleNtpDot[] = [];
  hoveredNtpReceipt: NtpReceipt | null = null;

  peakMaxL: number = -60;
  peakMaxR: number = -60;
  lufsMaxM: number = -60;
  clipCountL: number = 0;
  clipCountR: number = 0;

  lastAudioTime: number = performance.now();
  hasSignalLost: boolean = false;

  PAL: Record<string, string>;
  PAL_DARK: Record<string, string> | null = null;
  static readonly PAL_MC: Record<string, string> = PAL_MC;

  wrapper: HTMLElement | null = null;
  hudEl: HTMLElement | null = null;
  btnDock: HTMLElement | null = null;
  dockContainer: HTMLElement | null = null;

  hudChA: HTMLElement | null = null;
  hudChB: HTMLElement | null = null;
  hudSum: HTMLElement | null = null;
  hudDiff: HTMLElement | null = null;
  hudLufsM: HTMLElement | null = null;
  hudLufsS: HTMLElement | null = null;
  hudLufsI: HTMLElement | null = null;
  hudLra: HTMLElement | null = null;
  hudMax: HTMLElement | null = null;
  hudClipRow: HTMLElement | null = null;
  hudClips: HTMLElement | null = null;
  hudTimeMode: HTMLElement | null = null;

  hudChkChA: HTMLInputElement | null = null;
  hudChkChB: HTMLInputElement | null = null;
  hudChkSum: HTMLInputElement | null = null;
  hudChkDiff: HTMLInputElement | null = null;
  hudChkLufsM: HTMLInputElement | null = null;
  hudChkLufsS: HTMLInputElement | null = null;
  hudChkLufsI: HTMLInputElement | null = null;

  hudRowChA: HTMLElement | null = null;
  hudRowChB: HTMLElement | null = null;
  hudRowSum: HTMLElement | null = null;
  hudRowDiff: HTMLElement | null = null;
  hudRowLufsM: HTMLElement | null = null;
  hudRowLufsS: HTMLElement | null = null;
  hudRowLufsI: HTMLElement | null = null;

  _updateTraceToggles?: () => void;
  public onClear: (() => void) | null = null;
  ro?: ResizeObserver;
  w: number = 0;
  h: number = 0;
  dpr: number = 1;

  constructor(containerEl: HTMLElement | null) {
    this.container = containerEl;
    this.canvas = null;
    this.ctx = null;

    // Time scale mode: 'log' (default) or 'lin'
    this.timeMode = 'log';
    this.onTimeModeChange = null;
    this.beta = 15;
    this.logBetaDenom = Math.log(1 + 15);

    // Adjustable Capture Controls (Max 10 minutes / 600 seconds ring buffer, default: 60s)
    this.maxCaptureSec = 600; // 10 minutes maximum capture time
    this.captureLength = 60;  // seconds (default: 60s timeline into the past)
    this.captureSpeed = 240;  // 60 to 960 FPS (default 240 FPS)
    this.lastPushTime = 0;

    // 10-Minute Rolling Circular Ring Buffer Cache; anything older is continuously flushed.
    this.bufferSize = Math.round(this.maxCaptureSec * this.captureSpeed);
    allocHistories(this, this.bufferSize);
    this.envL = -60;
    this.envR = -60;
    this.envSum = -60;
    this.envDiff = -60;
    this.normL = -60;
    this.normR = -60;
    this.normSum = -60;
    this.normDiff = -60;
    this.head = 0;
    this.count = 0;

    // Lime line hover & zoom state
    this.isHoveringLime = false;
    this.zoomFeedbackTime = 0;
    this.zoomFeedbackText = '';

    // Pro Options (Requirements 5, 6, 8, 14, 18) — persisted trace / display flags
    const saved = loadSavedScopeOptions();
    this.showChA = saved.showChA;
    this.showChB = saved.showChB;
    this.showSum = saved.showSum;
    this.showDiff = saved.showDiff;
    this.showLufs = saved.showLufs;
    this.showLufsS = saved.showLufsS;
    this.showLufsI = saved.showLufsI;
    this.show0DbfsLine = saved.show0DbfsLine;
    this.enableFade = false;         // Waveform Fade shut-off toggle (default false: 100% Full View / see everything)
    this.hfFadeDistance = 100;       // Req 14: HF detail fade distance (default 100%: see everything / no blackout)
    this.showHoverTelemetry = true;  // Req 5: Hover Telemetry HUD
    this.showCursorTrace = true;     // Req 5: Cursor trace line
    this.plotPhase = true;           // Req 18: Phase plotted across time
    this.isDocked = saved.isDocked;
    this.hoverX = null;
    this.hoverY = null;

    // Peak & Loudness Tracking
    this.peakMaxL = -60;
    this.peakMaxR = -60;
    this.lufsMaxM = -60;
    this.clipCountL = 0;
    this.clipCountR = 0;

    // Palette (Matching APK.audio & broadcast mastering standard)
    this.PAL = createDarkPalette();

    this.initCanvas();
  }

  sliderToSeconds(val: number | string): number { return sliderToSeconds(val); }
  secondsToSlider(sec: number): number { return secondsToSlider(sec); }
  formatDuration(sec: number): string { return formatDuration(sec); }

  getActiveSpanSec(): number {
    return Math.min(this.maxCaptureSec || 600, this.captureLength);
  }

  resizeBuffer(newSize: number): void { resizeBuffer(this, newSize); }

  /* Anti-shimmer pyramid (mip-mapped history) — see dbfs/pyramid.ts. */
  private pyrSources(): Float32Array[] { return pyrSources(this); }
  private pyrReset(): void { pyrReset(this); }
  private pyrPush(): void { pyrPush(this); }
  private rawAt(hist: Float32Array, a: number): number { return rawAt(this, hist, a); }
  private blockAt(hist: Float32Array, l: number, b: number, useMean: boolean): number { return blockAt(this, hist, l, b, useMean); }
  private levelAt(hist: Float32Array, l: number, a: number, useMean: boolean): number { return levelAt(this, hist, l, a, useMean); }
  private pyrSample(hist: Float32Array, a: number, samplesPerPx: number, pos: number, meanOnly = false): number {
    return pyrSample(this, hist, a, samplesPerPx, pos, meanOnly);
  }

  clear(): void { clearHistory(this); }

  initCanvas(): void { initCanvas(this); }

  setDocked(docked: boolean): void { setDocked(this, docked); }
  setBeta(b: number): void { setBeta(this, b); }
  setTimeMode(mode: TimeScaleMode): void { setTimeMode(this, mode); }
  setCaptureLength(seconds: number): void { setCaptureLength(this, seconds); }
  handleResize(): void { handleResize(this); }

  push(dbL: number, dbR: number, lufsM: number, lufsS: number, phase: number = 1.0, dbSum: number = -60, dbDiff: number = -60, lufsI: number = -60): void {
    pushSample(this, dbL, dbR, lufsM, lufsS, phase, dbSum, dbDiff, lufsI);
  }

  render(model: XtmModel, levels: MeterFrameTelemetry): void { renderFrame(this, model, levels); }
}
