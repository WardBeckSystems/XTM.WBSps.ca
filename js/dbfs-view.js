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
 */

// Discrete Capture Length Intervals:
// 10s, 20s, 30s, 40s, 50s, 1 min, 1 min 30, 2 min, 2 min 30, 3 min .. 10 min, then 20 min .. 1h
const CAPTURE_STEPS = [
  { sec: 10, label: '10s' },
  { sec: 20, label: '20s' },
  { sec: 30, label: '30s' },
  { sec: 40, label: '40s' },
  { sec: 50, label: '50s' },
  { sec: 60, label: '1 min' },
  { sec: 90, label: '1 min 30' },
  { sec: 120, label: '2 min' },
  { sec: 150, label: '2 min 30' },
  { sec: 180, label: '3 min' },
  { sec: 240, label: '4 min' },
  { sec: 300, label: '5 min' },
  { sec: 360, label: '6 min' },
  { sec: 420, label: '7 min' },
  { sec: 480, label: '8 min' },
  { sec: 540, label: '9 min' },
  { sec: 600, label: '10 min' }
];

// Discrete Capture Speed Intervals in Steps (15, 30, 60, 120, 240 FPS)
const SPEED_STEPS = [
  { fps: 15, label: '15 FPS (Eco)', warning: null },
  { fps: 30, label: '30 FPS (Standard)', warning: null },
  { fps: 60, label: '60 FPS (Default)', warning: null },
  { fps: 120, label: '120 FPS (High)', warning: 'High Performance Mode (120 FPS): Requires a 120Hz+ high-refresh display and will increase CPU/GPU usage.' },
  { fps: 240, label: '240 FPS (Ultra)', warning: 'Ultra Performance Mode (240 FPS): High frame rate capture. Requires a 240Hz+ gaming or pro mastering display and increases GPU/CPU load significantly.' }
];

class DbfsView {
  constructor(containerEl) {
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
    this.captureSpeed = 60;   // 15 to 240 FPS (default 60 FPS)
    this.lastPushTime = 0;

    // 10-Minute Rolling Circular Ring Buffer Cache (e.g. 36,000 samples @ 60 FPS)
    // Any historical data beyond 10 minutes is continuously flushed from memory.
    this.bufferSize = Math.round(this.maxCaptureSec * this.captureSpeed);
    this.histL = new Float32Array(this.bufferSize).fill(-60);
    this.histR = new Float32Array(this.bufferSize).fill(-60);
    this.histSum = new Float32Array(this.bufferSize).fill(-60);
    this.histDiff = new Float32Array(this.bufferSize).fill(-60);
    this.histNormL = new Float32Array(this.bufferSize).fill(-60);
    this.histNormR = new Float32Array(this.bufferSize).fill(-60);
    this.histNormSum = new Float32Array(this.bufferSize).fill(-60);
    this.histNormDiff = new Float32Array(this.bufferSize).fill(-60);
    this.histLufsM = new Float32Array(this.bufferSize).fill(-60);
    this.histLufsS = new Float32Array(this.bufferSize).fill(-60);
    this.histLufsI = new Float32Array(this.bufferSize).fill(-60);
    this.histPhase = new Float32Array(this.bufferSize).fill(1.0);
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

    // Pro Options (Requirements 5, 6, 8, 14, 18)
    // Default: only the sum and the loudness are on by default
    const savedShowChA = localStorage.getItem('xtm_scope_show_cha');
    this.showChA = savedShowChA !== null ? savedShowChA === 'true' : false;

    const savedShowChB = localStorage.getItem('xtm_scope_show_chb');
    this.showChB = savedShowChB !== null ? savedShowChB === 'true' : false;

    const savedShowSum = localStorage.getItem('xtm_scope_show_sum');
    this.showSum = savedShowSum !== null ? savedShowSum === 'true' : true;

    const savedShowDiff = localStorage.getItem('xtm_scope_show_diff');
    this.showDiff = savedShowDiff !== null ? savedShowDiff === 'true' : false;

    const savedShowLufs = localStorage.getItem('xtm_scope_show_lufs');
    this.showLufs = savedShowLufs !== null ? savedShowLufs === 'true' : true;

    const savedShowLufsS = localStorage.getItem('xtm_scope_show_lufs_s');
    this.showLufsS = savedShowLufsS !== null ? savedShowLufsS === 'true' : false;

    const savedShowLufsI = localStorage.getItem('xtm_scope_show_lufs_i');
    this.showLufsI = savedShowLufsI !== null ? savedShowLufsI === 'true' : false;

    const saved0Dbfs = localStorage.getItem('xtm_scope_show_0dbfs');
    this.show0DbfsLine = saved0Dbfs !== null ? saved0Dbfs === 'true' : true; // 0 dBFS ceiling reference line default on
    this.enableFade = false;         // Waveform Fade shut-off toggle (default false: 100% Full View / see everything)
    this.hfFadeDistance = 100;       // Req 14: HF detail fade distance (default 100%: see everything / no blackout)
    this.showHoverTelemetry = true;  // Req 5: Hover Telemetry HUD
    this.showCursorTrace = true;     // Req 5: Cursor trace line
    this.plotPhase = true;           // Req 18: Phase plotted across time
    this.isDocked = localStorage.getItem('xtm_hud_docked') === 'true'; // Dock below right meter beside LED
    this.hoverX = null;
    this.hoverY = null;

    // Peak & Loudness Tracking
    this.peakMaxL = -60;
    this.peakMaxR = -60;
    this.lufsMaxM = -60;
    this.clipCountL = 0;
    this.clipCountR = 0;

    // Palette (Matching APK.audio & broadcast mastering standard)
    this.PAL = {
      bg: '#07090c',
      grid: '#1a202c',
      gridTime: '#141824',
      gridRef: '#15803d',         // -18 dBFS digital reference
      gridTargetBrd: '#10b981',    // -24 LUFS EBU R128 / ATSC A/85 broadcast target
      gridTargetStr: '#f97316',    // -14 LUFS Streaming target (Orange dotted line with orange text)
      gridWarn: '#d97706',        // -3 dBFS headroom warning
      gridClip: '#dc2626',        // 0 dBFS ceiling
      textMuted: '#64748b',
      textCyan: '#ffffff',        // Ch A (Left Peak - White)
      textGold: '#ef4444',        // Ch B (Right Peak - Red)
      textSum: '#22c55e',         // Left + Right Sum (Forest Green)
      textDiff: '#06b6d4',        // L + (-R) Difference (Cyan)
      textLufs: '#f4902c',        // Momentary Loudness (LUFS) - R244 G144 B44
      textLufsS: '#c084fc',       // Short-term Loudness (LUFS)
      textInteg: '#34d399',       // Integrated Loudness (LUFS)
      lineL: '#ffffff',           // Left Channel is White
      lineR: '#ef4444',           // Right Channel is Red
      lineSum: '#22c55e',         // Left + Right Sum is Forest Green
      lineDiff: '#06b6d4',        // L + (-R) Difference is Cyan
      lineLufs: '#f4902c',
      fillL: 'rgba(255, 255, 255, 0.08)',
      fillR: 'rgba(239, 68, 68, 0.08)',
      fillSum: 'rgba(34, 197, 94, 0.09)',
      fillDiff: 'rgba(6, 182, 212, 0.08)',
      fillLufs: 'rgba(244, 144, 44, 0.14)'
    };

    this.initCanvas();
  }

  sliderToSeconds(val) {
    const idx = Math.max(0, Math.min(CAPTURE_STEPS.length - 1, Math.round(Number(val))));
    return CAPTURE_STEPS[idx].sec;
  }

  secondsToSlider(sec) {
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < CAPTURE_STEPS.length; i++) {
      const diff = Math.abs(CAPTURE_STEPS[i].sec - sec);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  formatDuration(sec) {
    const step = CAPTURE_STEPS.find(s => s.sec === sec);
    if (step) return step.label;
    if (sec < 60) return sec + 's';
    const m = Math.floor(sec / 60);
    const remS = sec % 60;
    if (m >= 10) return '10 min';
    if (remS > 0) return `${m} min ${remS}`;
    return `${m} min`;
  }

  getActiveSpanSec() {
    return Math.min(this.maxCaptureSec || 600, this.captureLength);
  }

  resizeBuffer(newSize) {
    if (this.bufferSize === newSize) return;
    this.bufferSize = newSize;
    this.histL = new Float32Array(newSize).fill(-60);
    this.histR = new Float32Array(newSize).fill(-60);
    this.histSum = new Float32Array(newSize).fill(-60);
    this.histDiff = new Float32Array(newSize).fill(-60);
    this.histNormL = new Float32Array(newSize).fill(-60);
    this.histNormR = new Float32Array(newSize).fill(-60);
    this.histNormSum = new Float32Array(newSize).fill(-60);
    this.histNormDiff = new Float32Array(newSize).fill(-60);
    this.histLufsM = new Float32Array(newSize).fill(-60);
    this.histLufsS = new Float32Array(newSize).fill(-60);
    this.histLufsI = new Float32Array(newSize).fill(-60);
    this.histPhase = new Float32Array(newSize).fill(1.0);
    this.head = 0;
    this.count = 0;
    this.graphDirty = true;
  }

  clear() {
    this.head = 0;
    this.count = 0;
    this.histL.fill(-60);
    this.histR.fill(-60);
    this.histSum.fill(-60);
    this.histDiff.fill(-60);
    this.histNormL.fill(-60);
    this.histNormR.fill(-60);
    this.histNormSum.fill(-60);
    this.histNormDiff.fill(-60);
    this.histLufsM.fill(-60);
    this.histLufsS.fill(-60);
    this.histLufsI.fill(-60);
    this.envL = -60;
    this.envR = -60;
    this.envSum = -60;
    this.envDiff = -60;
    this.normL = -60;
    this.normR = -60;
    this.normSum = -60;
    this.normDiff = -60;
    this.peakMaxL = -60;
    this.peakMaxR = -60;
    this.lufsMaxM = -60;
    this.clipCountL = 0;
    this.clipCountR = 0;
    this.graphDirty = true;
  }

  initCanvas() {
    this.container.innerHTML = `
      <div class="dbfs-inner" style="position:relative;width:100%;height:100%;flex:1;display:flex;flex-direction:column;background:#07090c;overflow:hidden;user-select:none;">
        <!-- Hardware Accelerated Canvas Plot Area with Floating Hover HUD -->
        <div class="dbfs-canvas-wrapper" style="position:relative;width:100%;height:100%;flex:1;overflow:hidden;">
          <canvas id="dbfsCanvas" style="width:100%;height:100%;display:block;"></canvas>

          <!-- Floating / Dockable Hover HUD Tooltip Card -->
          <div id="dbfsHoverHud" class="dbfs-hover-hud">
            <div class="hud-header">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <span class="hud-title">dBFS &amp; LOUDNESS SCOPE</span>
                  <span class="hud-sub" id="hudTimeMode">ITU-R BS.1770-4 · LOGARITHMIC</span>
                </div>
                <button type="button" id="btnDockHud" class="hud-dock-btn" title="Dock below right meter beside LED bar">
                  <svg id="iconDockHud" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>
                </button>
              </div>
            </div>
            <div class="hud-body">
              <div class="hud-section hud-peaks">
                <div class="hud-row" id="hudRowChA">
                  <label class="hud-toggle-label" title="Toggle CH A (L) Peak Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-a" id="hudChkChA">
                    <span class="hud-label-a">CH A (L):</span>
                  </label>
                  <span class="hud-val-a" id="hudChA">-INF dBFS</span>
                </div>
                <div class="hud-row" id="hudRowChB">
                  <label class="hud-toggle-label" title="Toggle CH B (R) Peak Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-b" id="hudChkChB">
                    <span class="hud-label-b">CH B (R):</span>
                  </label>
                  <span class="hud-val-b" id="hudChB">-INF dBFS</span>
                </div>
                <div class="hud-row" id="hudRowSum">
                  <label class="hud-toggle-label" title="Toggle L + R Sum Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-sum" id="hudChkSum">
                    <span class="hud-label-sum">L + R:</span>
                  </label>
                  <span class="hud-val-sum" id="hudSum">-INF dBFS</span>
                </div>
                <div class="hud-row" id="hudRowDiff">
                  <label class="hud-toggle-label" title="Toggle L - R Diff Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-diff" id="hudChkDiff">
                    <span class="hud-label-diff">L - R (DIFF):</span>
                  </label>
                  <span class="hud-val-diff" id="hudDiff">-INF dBFS</span>
                </div>
              </div>
              <div class="hud-divider"></div>
              <div class="hud-section hud-loudness">
                <div class="hud-sec-title">PERCEIVED LOUDNESS</div>
                <div class="hud-row" id="hudRowLufsM">
                  <label class="hud-toggle-label" title="Toggle Momentary Loudness (M) Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-m" id="hudChkLufsM">
                    <span class="hud-label-m">M (400ms):</span>
                  </label>
                  <span class="hud-val-m" id="hudLufsM">-INF LUFS</span>
                </div>
                <div class="hud-row" id="hudRowLufsS">
                  <label class="hud-toggle-label" title="Toggle Short-Term Loudness (S) Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-s" id="hudChkLufsS">
                    <span class="hud-label-s">S (3.0s):</span>
                  </label>
                  <span class="hud-val-s" id="hudLufsS">-INF LUFS</span>
                </div>
                <div class="hud-row" id="hudRowLufsI">
                  <label class="hud-toggle-label" title="Toggle Integrated Loudness (I) Trace on Display">
                    <input type="checkbox" class="hud-chk hud-chk-i" id="hudChkLufsI">
                    <span class="hud-label-i">INTEG (I):</span>
                  </label>
                  <span class="hud-val-i" id="hudLufsI">-INF LUFS</span>
                </div>
                <div class="hud-row"><span class="hud-label-lra">LRA:</span> <span class="hud-val-lra" id="hudLra">0.0 LU</span></div>
                <div class="hud-row hud-max"><span class="hud-label-max">MAX:</span> <span id="hudMax">L -INF | R -INF</span></div>
                <div class="hud-row hud-clip" id="hudClipRow" style="display:none;"><span class="hud-label-clip">CLIPS:</span> <span id="hudClips">0</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    this.canvas = this.container.querySelector('#dbfsCanvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.graphCanvas = document.createElement('canvas');
    this.graphCtx = this.graphCanvas.getContext('2d', { alpha: false });
    this.graphDirty = true;
    this.renderFrameCount = 0;

    // HUD Cached Elements
    this.hudEl = this.container.querySelector('#dbfsHoverHud');
    this.hudChA = this.container.querySelector('#hudChA');
    this.hudChB = this.container.querySelector('#hudChB');
    this.hudSum = this.container.querySelector('#hudSum');
    this.hudDiff = this.container.querySelector('#hudDiff');
    this.hudLufsM = this.container.querySelector('#hudLufsM');
    this.hudLufsS = this.container.querySelector('#hudLufsS');
    this.hudLufsI = this.container.querySelector('#hudLufsI');
    this.hudLra = this.container.querySelector('#hudLra');
    this.hudMax = this.container.querySelector('#hudMax');
    this.hudClipRow = this.container.querySelector('#hudClipRow');
    this.hudClips = this.container.querySelector('#hudClips');
    this.hudTimeMode = this.container.querySelector('#hudTimeMode');
    this.wrapper = this.container.querySelector('.dbfs-canvas-wrapper');
    this.dockContainer = null;
    this.btnDock = this.container.querySelector('#btnDockHud');

    // HUD Trace Toggle Checkboxes
    this.hudChkChA = this.container.querySelector('#hudChkChA');
    this.hudChkChB = this.container.querySelector('#hudChkChB');
    this.hudChkSum = this.container.querySelector('#hudChkSum');
    this.hudChkDiff = this.container.querySelector('#hudChkDiff');
    this.hudChkLufsM = this.container.querySelector('#hudChkLufsM');
    this.hudChkLufsS = this.container.querySelector('#hudChkLufsS');
    this.hudChkLufsI = this.container.querySelector('#hudChkLufsI');

    this.hudRowChA = this.container.querySelector('#hudRowChA');
    this.hudRowChB = this.container.querySelector('#hudRowChB');
    this.hudRowSum = this.container.querySelector('#hudRowSum');
    this.hudRowDiff = this.container.querySelector('#hudRowDiff');
    this.hudRowLufsM = this.container.querySelector('#hudRowLufsM');
    this.hudRowLufsS = this.container.querySelector('#hudRowLufsS');
    this.hudRowLufsI = this.container.querySelector('#hudRowLufsI');

    const updateTraceToggles = () => {
      if (this.hudChkChA) this.hudChkChA.checked = this.showChA;
      if (this.hudChkChB) this.hudChkChB.checked = this.showChB;
      if (this.hudChkSum) this.hudChkSum.checked = this.showSum;
      if (this.hudChkDiff) this.hudChkDiff.checked = this.showDiff;
      if (this.hudChkLufsM) this.hudChkLufsM.checked = this.showLufs;
      if (this.hudChkLufsS) this.hudChkLufsS.checked = this.showLufsS;
      if (this.hudChkLufsI) this.hudChkLufsI.checked = this.showLufsI;

      if (this.hudRowChA) this.hudRowChA.classList.toggle('trace-off', !this.showChA);
      if (this.hudRowChB) this.hudRowChB.classList.toggle('trace-off', !this.showChB);
      if (this.hudRowSum) this.hudRowSum.classList.toggle('trace-off', !this.showSum);
      if (this.hudRowDiff) this.hudRowDiff.classList.toggle('trace-off', !this.showDiff);
      if (this.hudRowLufsM) this.hudRowLufsM.classList.toggle('trace-off', !this.showLufs);
      if (this.hudRowLufsS) this.hudRowLufsS.classList.toggle('trace-off', !this.showLufsS);
      if (this.hudRowLufsI) this.hudRowLufsI.classList.toggle('trace-off', !this.showLufsI);

      const chkDrawerChA = document.getElementById('chkShowChA');
      const chkDrawerChB = document.getElementById('chkShowChB');
      const chkDrawerSum = document.getElementById('chkShowSum');
      const chkDrawerDiff = document.getElementById('chkShowDiff');
      const chkDrawerLufs = document.getElementById('chkShowLufs');
      const chkDrawerLufsS = document.getElementById('chkShowLufsS');
      const chkDrawerLufsI = document.getElementById('chkShowLufsI');
      if (chkDrawerChA) chkDrawerChA.checked = this.showChA;
      if (chkDrawerChB) chkDrawerChB.checked = this.showChB;
      if (chkDrawerSum) chkDrawerSum.checked = this.showSum;
      if (chkDrawerDiff) chkDrawerDiff.checked = this.showDiff;
      if (chkDrawerLufs) chkDrawerLufs.checked = this.showLufs;
      if (chkDrawerLufsS) chkDrawerLufsS.checked = this.showLufsS;
      if (chkDrawerLufsI) chkDrawerLufsI.checked = this.showLufsI;
      this.graphDirty = true;
    };

    if (this.hudChkChA) {
      this.hudChkChA.addEventListener('change', (e) => {
        this.showChA = e.target.checked;
        localStorage.setItem('xtm_scope_show_cha', this.showChA);
        updateTraceToggles();
      });
    }
    if (this.hudChkChB) {
      this.hudChkChB.addEventListener('change', (e) => {
        this.showChB = e.target.checked;
        localStorage.setItem('xtm_scope_show_chb', this.showChB);
        updateTraceToggles();
      });
    }
    if (this.hudChkSum) {
      this.hudChkSum.addEventListener('change', (e) => {
        this.showSum = e.target.checked;
        localStorage.setItem('xtm_scope_show_sum', this.showSum);
        updateTraceToggles();
      });
    }
    if (this.hudChkDiff) {
      this.hudChkDiff.addEventListener('change', (e) => {
        this.showDiff = e.target.checked;
        localStorage.setItem('xtm_scope_show_diff', this.showDiff);
        updateTraceToggles();
      });
    }
    if (this.hudChkLufsM) {
      this.hudChkLufsM.addEventListener('change', (e) => {
        this.showLufs = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs', this.showLufs);
        updateTraceToggles();
      });
    }
    if (this.hudChkLufsS) {
      this.hudChkLufsS.addEventListener('change', (e) => {
        this.showLufsS = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs_s', this.showLufsS);
        updateTraceToggles();
      });
    }
    if (this.hudChkLufsI) {
      this.hudChkLufsI.addEventListener('change', (e) => {
        this.showLufsI = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs_i', this.showLufsI);
        updateTraceToggles();
      });
    }

    this._updateTraceToggles = updateTraceToggles;
    updateTraceToggles();

    // Drawer Event Listeners
    const btnLog = document.getElementById('btnScopeLog');
    const btnSuperLog = document.getElementById('btnScopeSuperLog');
    const btnLin = document.getElementById('btnScopeLin');
    const lengthSlider = document.getElementById('scopeLengthSlider');
    const lengthVal = document.getElementById('scopeLengthVal');
    const btnClear = document.getElementById('btnScopeClear');
    const speedSlider = document.getElementById('scopeSpeedSlider');
    const speedVal = document.getElementById('scopeSpeedVal');

    if (btnLog && btnLin) {
      btnLog.addEventListener('click', () => {
        this.setTimeMode('log');
        if (this.onTimeModeChange) this.onTimeModeChange('log');
      });
      if (btnSuperLog) {
        btnSuperLog.addEventListener('click', () => {
          this.setTimeMode('super_log');
          if (this.onTimeModeChange) this.onTimeModeChange('super_log');
        });
      }
      btnLin.addEventListener('click', () => {
        this.setTimeMode('lin');
        if (this.onTimeModeChange) this.onTimeModeChange('lin');
      });
    }

    if (lengthSlider) {
      lengthSlider.min = '0';
      lengthSlider.max = String(CAPTURE_STEPS.length - 1);
      lengthSlider.step = '1';
      lengthSlider.value = String(this.secondsToSlider(this.captureLength));
      if (lengthVal) lengthVal.textContent = this.formatDuration(this.captureLength);
      lengthSlider.addEventListener('input', (e) => {
        const sliderPos = parseFloat(e.target.value);
        this.captureLength = this.sliderToSeconds(sliderPos);
        if (lengthVal) lengthVal.textContent = this.formatDuration(this.captureLength);
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.clear();
      });
    }

    if (speedSlider) {
      speedSlider.min = '0';
      speedSlider.max = String(SPEED_STEPS.length - 1);
      speedSlider.step = '1';
      let initIdx = SPEED_STEPS.findIndex(s => s.fps === this.captureSpeed);
      if (initIdx < 0) initIdx = 2; // 60 FPS
      speedSlider.value = String(initIdx);
      if (speedVal) speedVal.textContent = SPEED_STEPS[initIdx].label;

      const warningBox = document.getElementById('scopeSpeedWarning');
      const warningText = document.getElementById('scopeSpeedWarningText');

      speedSlider.addEventListener('input', (e) => {
        const idx = Math.max(0, Math.min(SPEED_STEPS.length - 1, parseInt(e.target.value, 10)));
        const step = SPEED_STEPS[idx];
        if (this.captureSpeed !== step.fps) {
          this.captureSpeed = step.fps;
          // Re-allocate 10-minute circular ring buffer cache for new capture speed, flushing old memory
          this.resizeBuffer(Math.round(this.maxCaptureSec * this.captureSpeed));
        }
        if (speedVal) speedVal.textContent = step.label;

        if (step.warning) {
          if (warningBox && warningText) {
            warningText.textContent = '⚠️ ' + step.warning;
            warningBox.style.display = 'block';
          }
        } else if (warningBox) {
          warningBox.style.display = 'none';
        }
      });
    }

    // Pro Options Handlers
    const chkEnableFade = document.getElementById('chkEnableFade');
    const chkEnableFadeLabel = document.getElementById('chkEnableFadeLabel');
    const hfFadeSlider = document.getElementById('hfFadeSlider');
    const hfFadeVal = document.getElementById('hfFadeVal');

    const updateFadeUI = () => {
      const isFull = !this.enableFade || this.hfFadeDistance >= 100;
      if (chkEnableFade) {
        chkEnableFade.checked = this.enableFade;
      }
      if (chkEnableFadeLabel) {
        chkEnableFadeLabel.textContent = isFull ? 'Off (Full View)' : 'On (Fading)';
      }
      if (hfFadeVal) {
        hfFadeVal.textContent = isFull ? '100% (Full View)' : (this.hfFadeDistance + '%');
      }
      if (hfFadeSlider) {
        hfFadeSlider.value = this.hfFadeDistance;
      }
    };

    if (chkEnableFade) {
      chkEnableFade.addEventListener('change', (e) => {
        this.enableFade = e.target.checked;
        if (!this.enableFade) {
          this.hfFadeDistance = 100;
        } else if (this.hfFadeDistance >= 100) {
          this.hfFadeDistance = 50;
        }
        updateFadeUI();
      });
    }

    if (hfFadeSlider) {
      hfFadeSlider.addEventListener('input', (e) => {
        this.hfFadeDistance = parseFloat(e.target.value);
        if (this.hfFadeDistance >= 100) {
          this.enableFade = false;
        } else {
          this.enableFade = true;
        }
        updateFadeUI();
      });
    }
    updateFadeUI();

    const chk0DbfsLine = document.getElementById('chk0DbfsLine');
    if (chk0DbfsLine) {
      chk0DbfsLine.checked = this.show0DbfsLine;
      chk0DbfsLine.addEventListener('change', (e) => {
        this.show0DbfsLine = e.target.checked;
        localStorage.setItem('xtm_scope_show_0dbfs', this.show0DbfsLine);
        this.graphDirty = true;
      });
    }

    const chkHoverTelemetry = document.getElementById('chkHoverTelemetry');
    if (chkHoverTelemetry) {
      chkHoverTelemetry.checked = this.showHoverTelemetry;
      chkHoverTelemetry.addEventListener('change', (e) => {
        this.showHoverTelemetry = e.target.checked;
        if (this.isDocked) {
          if (this.hudEl) this.hudEl.style.display = this.showHoverTelemetry ? 'flex' : 'none';
        } else {
          if (this.hudEl) this.hudEl.style.display = this.showHoverTelemetry ? '' : 'none';
        }
      });
    }

    const chkDockHud = document.getElementById('chkDockHud');
    if (chkDockHud) {
      chkDockHud.checked = this.isDocked;
      chkDockHud.addEventListener('change', (e) => {
        this.setDocked(e.target.checked);
      });
    }

    if (this.btnDock) {
      this.btnDock.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setDocked(!this.isDocked);
      });
    }

    const chkCursorTrace = document.getElementById('chkCursorTrace');
    if (chkCursorTrace) {
      chkCursorTrace.checked = this.showCursorTrace;
      chkCursorTrace.addEventListener('change', (e) => {
        this.showCursorTrace = e.target.checked;
      });
    }

    const chkPhasePlot = document.getElementById('chkPhasePlot');
    if (chkPhasePlot) {
      chkPhasePlot.checked = this.plotPhase;
      chkPhasePlot.addEventListener('change', (e) => {
        this.plotPhase = e.target.checked;
      });
    }

    const chkShowChA = document.getElementById('chkShowChA');
    if (chkShowChA) {
      chkShowChA.checked = this.showChA;
      chkShowChA.addEventListener('change', (e) => {
        this.showChA = e.target.checked;
        localStorage.setItem('xtm_scope_show_cha', this.showChA);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowChB = document.getElementById('chkShowChB');
    if (chkShowChB) {
      chkShowChB.checked = this.showChB;
      chkShowChB.addEventListener('change', (e) => {
        this.showChB = e.target.checked;
        localStorage.setItem('xtm_scope_show_chb', this.showChB);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowSum = document.getElementById('chkShowSum');
    if (chkShowSum) {
      chkShowSum.checked = this.showSum;
      chkShowSum.addEventListener('change', (e) => {
        this.showSum = e.target.checked;
        localStorage.setItem('xtm_scope_show_sum', this.showSum);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowDiff = document.getElementById('chkShowDiff');
    if (chkShowDiff) {
      chkShowDiff.checked = this.showDiff;
      chkShowDiff.addEventListener('change', (e) => {
        this.showDiff = e.target.checked;
        localStorage.setItem('xtm_scope_show_diff', this.showDiff);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowLufs = document.getElementById('chkShowLufs');
    if (chkShowLufs) {
      chkShowLufs.checked = this.showLufs;
      chkShowLufs.addEventListener('change', (e) => {
        this.showLufs = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs', this.showLufs);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowLufsS = document.getElementById('chkShowLufsS');
    if (chkShowLufsS) {
      chkShowLufsS.checked = this.showLufsS;
      chkShowLufsS.addEventListener('change', (e) => {
        this.showLufsS = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs_s', this.showLufsS);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    const chkShowLufsI = document.getElementById('chkShowLufsI');
    if (chkShowLufsI) {
      chkShowLufsI.checked = this.showLufsI;
      chkShowLufsI.addEventListener('change', (e) => {
        this.showLufsI = e.target.checked;
        localStorage.setItem('xtm_scope_show_lufs_i', this.showLufsI);
        if (this._updateTraceToggles) this._updateTraceToggles();
      });
    }

    // Canvas Cursor, Hover Inspection & Lime Line Scroll Zoom
    const wrapper = this.container.querySelector('.dbfs-canvas-wrapper');
    if (wrapper) {
      wrapper.addEventListener('pointermove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const dpr = this.dpr || 1;
        const x = (e.clientX - rect.left) * dpr;
        const y = (e.clientY - rect.top) * dpr;
        this.hoverX = x;
        this.hoverY = y;

        if (!this.isDocked && this.hudEl && this.showHoverTelemetry) {
          this.hudEl.style.display = 'block';
        }

        // Check if cursor is over or near the lime line (-20 dBFS)
        const padT = 18 * dpr;
        const padB = 26 * dpr;
        const padL = 175 * dpr;
        const padR = 28 * dpr;
        const plotH = Math.max(10, (this.h || 300) - padT - padB);
        const plotW = Math.max(10, (this.w || 800) - padL - padR);
        const limeY = Math.round(padT + plotH * (1 - (-20 + 60) / 60));

        const overLime = Math.abs(y - limeY) <= 32 * dpr && x >= (padL - 40 * dpr) && x <= (padL + plotW + 20 * dpr);
        this.isHoveringLime = overLime;

        if (overLime) {
          wrapper.style.cursor = 'ns-resize';
        } else {
          wrapper.style.cursor = 'crosshair';
        }
      });

      wrapper.addEventListener('pointerleave', () => {
        this.hoverX = null;
        this.hoverY = null;
        this.isHoveringLime = false;
        wrapper.style.cursor = 'default';
        if (!this.isDocked && this.hudEl) {
          this.hudEl.style.display = '';
        }
      });

      // Using the scroll wheel when over the lime line zooms the time scale in and out
      wrapper.addEventListener('wheel', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const dpr = this.dpr || 1;
        const x = (e.clientX - rect.left) * dpr;
        const y = (e.clientY - rect.top) * dpr;
        const padT = 18 * dpr;
        const padB = 26 * dpr;
        const padL = 175 * dpr;
        const padR = 28 * dpr;
        const plotH = Math.max(10, (this.h || 300) - padT - padB);
        const plotW = Math.max(10, (this.w || 800) - padL - padR);
        const limeY = Math.round(padT + plotH * (1 - (-20 + 60) / 60));

        const overLime = Math.abs(y - limeY) <= 35 * dpr && x >= (padL - 40 * dpr) && x <= (padL + plotW + 20 * dpr);

        if (overLime) {
          e.preventDefault();
          e.stopPropagation();

          const curIdx = this.secondsToSlider(this.captureLength);
          let nextIdx = curIdx;

          if (e.deltaY < 0) {
            // Scroll UP: Zoom IN (shorter timeframe)
            nextIdx = Math.max(0, curIdx - 1);
          } else if (e.deltaY > 0) {
            // Scroll DOWN: Zoom OUT (longer timeframe)
            nextIdx = Math.min(CAPTURE_STEPS.length - 1, curIdx + 1);
          }

          if (nextIdx !== curIdx) {
            this.captureLength = CAPTURE_STEPS[nextIdx].sec;
            this.zoomFeedbackTime = performance.now();
            this.zoomFeedbackText = `ZOOM: ${this.formatDuration(this.captureLength)}`;

            const slider = document.getElementById('scopeLengthSlider');
            const valBadge = document.getElementById('scopeLengthVal');
            if (slider) slider.value = String(nextIdx);
            if (valBadge) valBadge.textContent = this.formatDuration(this.captureLength);
          }
        }
      }, { passive: false });
      // Allow dragging the HUD card by its header within the canvas wrapper
      const hudHeader = this.container.querySelector('.hud-header');
      if (hudHeader && this.wrapper && this.hudEl) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;

        hudHeader.addEventListener('pointerdown', (e) => {
          if (e.target.closest('button') || e.target.closest('input')) return;
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = this.hudEl.getBoundingClientRect();
          const wrapRect = this.wrapper.getBoundingClientRect();
          initialLeft = rect.left - wrapRect.left;
          initialTop = rect.top - wrapRect.top;
          try { hudHeader.setPointerCapture(e.pointerId); } catch (_) {}
          e.preventDefault();
        });

        hudHeader.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const wrapRect = this.wrapper.getBoundingClientRect();
          const hudRect = this.hudEl.getBoundingClientRect();
          const maxLeft = Math.max(0, wrapRect.width - hudRect.width);
          const maxTop = Math.max(0, wrapRect.height - hudRect.height);

          const newLeft = Math.max(0, Math.min(maxLeft, initialLeft + dx));
          const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

          this.hudEl.style.left = `${newLeft}px`;
          this.hudEl.style.top = `${newTop}px`;
          this.hudEl.style.right = 'auto';
        });

        const stopDrag = (e) => {
          if (isDragging) {
            isDragging = false;
            try { hudHeader.releasePointerCapture(e.pointerId); } catch (_) {}
          }
        };
        hudHeader.addEventListener('pointerup', stopDrag);
        hudHeader.addEventListener('pointercancel', stopDrag);
      }
    }

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(() => this.handleResize());
      this.ro.observe(this.container);
    }

    // Initialize HUD docking state
    this.setDocked(this.isDocked);
  }

  setDocked(docked) {
    this.isDocked = !!docked;
    try {
      localStorage.setItem('xtm_hud_docked', this.isDocked ? 'true' : 'false');
    } catch (_) {}

    const chkDockHud = document.getElementById('chkDockHud');
    if (chkDockHud) chkDockHud.checked = this.isDocked;

    if (this.btnDock) {
      this.btnDock.title = this.isDocked ? 'Undock to auto-hiding floating HUD' : 'Pin / Dock HUD in scope';
      this.btnDock.innerHTML = this.isDocked
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>`;
    }

    if (this.hudEl) {
      if (this.isDocked) {
        this.hudEl.classList.add('docked');
        this.hudEl.style.display = this.showHoverTelemetry ? 'flex' : 'none';
      } else {
        this.hudEl.classList.remove('docked');
        this.hudEl.style.display = this.showHoverTelemetry ? '' : 'none';
      }
    }
  }

  setBeta(b) {
    this.beta = Math.max(1, b);
    this.logBetaDenom = Math.log(1 + this.beta);
    this.graphDirty = true;
  }

  setTimeMode(mode) {
    this.timeMode = mode;
    this.graphDirty = true;
    const btnLog = document.getElementById('btnScopeLog');
    const btnSuperLog = document.getElementById('btnScopeSuperLog');
    const btnLin = document.getElementById('btnScopeLin');
    const logOptRow = document.getElementById('scopeLogOptionsRow');
    if (btnLog && btnLin) {
      btnLog.classList.toggle('active', mode === 'log');
      if (btnSuperLog) btnSuperLog.classList.toggle('active', mode === 'super_log');
      btnLin.classList.toggle('active', mode === 'lin');
    }
    if (mode === 'super_log') {
      this.setBeta(60);
      const warpSel = document.getElementById('selectScopeLogWarp');
      if (warpSel) warpSel.value = '60';
    }
    if (logOptRow) {
      logOptRow.style.display = (mode === 'log' || mode === 'super_log') ? 'flex' : 'none';
    }
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.w = w;
      this.h = h;
      this.dpr = dpr;
      if (!this.graphCanvas) {
        this.graphCanvas = document.createElement('canvas');
      }
      this.graphCanvas.width = w;
      this.graphCanvas.height = h;
      this.graphCtx = this.graphCanvas.getContext('2d', { alpha: false });
      this.graphDirty = true;
    }
  }

  push(dbL, dbR, lufsM, lufsS, phase = 1.0, dbSum = -60, dbDiff = -60, lufsI = -60) {
    // Throttle capture speed according to slider (15 to 240 FPS)
    const now = performance.now();
    const minInterval = (1000 / this.captureSpeed) - 1.5;
    if (this.lastPushTime && (now - this.lastPushTime < minInterval)) return;
    const dt = this.lastPushTime ? Math.max(0.001, Math.min(0.1, (now - this.lastPushTime) / 1000)) : (1 / this.captureSpeed);
    this.lastPushTime = now;

    const vL = isFinite(dbL) ? Math.max(-60, Math.min(0, dbL)) : -60;
    const vR = isFinite(dbR) ? Math.max(-60, Math.min(0, dbR)) : -60;
    const vSum = isFinite(dbSum) ? Math.max(-60, Math.min(6.02, dbSum)) : -60;
    const vDiff = isFinite(dbDiff) ? Math.max(-60, Math.min(6.02, dbDiff)) : -60;
    const vM = isFinite(lufsM) ? Math.max(-60, Math.min(0, lufsM)) : -60;
    const vS = isFinite(lufsS) ? Math.max(-60, Math.min(0, lufsS)) : -60;
    const vI = isFinite(lufsI) ? Math.max(-60, Math.min(0, lufsI)) : -60;
    const vP = isFinite(phase) ? Math.max(-1, Math.min(1, phase)) : 1.0;

    // Peak Envelope Follower with Instant Attack & Musical Release (~75 dB/sec):
    // Instantaneous attack (0 ms) captures 100% true transient peaks on the right uncompressed area.
    const decay = 75 * dt;
    this.envL = (vL >= this.envL) ? vL : Math.max(-60, this.envL - decay);
    this.envR = (vR >= this.envR) ? vR : Math.max(-60, this.envR - decay);
    this.envSum = (vSum >= this.envSum) ? vSum : Math.max(-60, this.envSum - decay);
    this.envDiff = (vDiff >= this.envDiff) ? vDiff : Math.max(-60, this.envDiff - decay);

    // Time-Normalized Streams (Matching the 400ms ITU-R BS.1770 M Loudness window):
    // Symmetrical 400ms time constant on both attack and release eliminates aliasing, jiggle and jumping
    // in the compressed log tight zone, exactly matching the stability and smoothness of the orange line.
    const alphaNorm = 1.0 - Math.exp(-dt / 0.400);

    this.normL += alphaNorm * (this.envL - this.normL);
    this.normR += alphaNorm * (this.envR - this.normR);
    this.normSum += alphaNorm * (this.envSum - this.normSum);
    this.normDiff += alphaNorm * (this.envDiff - this.normDiff);

    this.histL[this.head] = this.envL;
    this.histR[this.head] = this.envR;
    this.histSum[this.head] = this.envSum;
    this.histDiff[this.head] = this.envDiff;
    this.histNormL[this.head] = this.normL;
    this.histNormR[this.head] = this.normR;
    this.histNormSum[this.head] = this.normSum;
    this.histNormDiff[this.head] = this.normDiff;
    this.histLufsM[this.head] = vM;
    this.histLufsS[this.head] = vS;
    this.histLufsI[this.head] = vI;
    this.histPhase[this.head] = vP;

    this.head = (this.head + 1) % this.bufferSize;
    if (this.count < this.bufferSize) this.count++;

    if (vL >= 0) this.clipCountL++;
    if (vR >= 0) this.clipCountR++;

    if (vL > this.peakMaxL) this.peakMaxL = vL;
    if (vR > this.peakMaxR) this.peakMaxR = vR;
    if (vM > this.lufsMaxM) this.lufsMaxM = vM;
  }

  render(model, levels) {
    if (!this.ctx || !this.w || !this.h) return;

    // Extract live levels
    const dbfs = levels.dbfs || [-60, -60, -60, -60];
    const liveL = levels.hasAudio ? dbfs[0] : -60;
    const liveR = levels.hasAudio ? dbfs[1] : -60;
    let liveSum = -60;
    let liveDiff = -60;
    if (levels.hasAudio) {
      if (typeof dbfs[2] === 'number') {
        liveSum = dbfs[2];
      } else {
        const pL = Math.pow(10, liveL / 20);
        const pR = Math.pow(10, liveR / 20);
        const corr = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;
        const pSum = Math.sqrt(Math.max(0, pL * pL + pR * pR + 2 * pL * pR * corr)) * 0.5;
        liveSum = pSum > 1e-6 ? 20 * Math.log10(pSum) : -60;
      }

      if (typeof dbfs[3] === 'number') {
        liveDiff = dbfs[3];
      } else if (typeof levels.dbfsDiff === 'number') {
        liveDiff = levels.dbfsDiff;
      } else {
        const pL = Math.pow(10, liveL / 20);
        const pR = Math.pow(10, liveR / 20);
        const corr = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;
        const pDiff = Math.sqrt(Math.max(0, pL * pL + pR * pR - 2 * pL * pR * corr)) * 0.5;
        liveDiff = pDiff > 1e-6 ? 20 * Math.log10(pDiff) : -60;
      }
    }

    const lufsObj = levels.lufs || {};
    const liveLufsM = levels.hasAudio && isFinite(lufsObj.m) ? lufsObj.m : -60;
    const liveLufsS = levels.hasAudio && isFinite(lufsObj.s) ? lufsObj.s : -60;
    const liveLufsI = levels.hasAudio && isFinite(lufsObj.i) ? lufsObj.i : -60;
    const liveLra = levels.hasAudio && isFinite(lufsObj.lra) ? lufsObj.lra : 0;
    const livePhase = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;

    // Track signal presence for 10-second loss of signal warning
    const now = performance.now();
    const hasSignal = levels && (
      levels.hasAudio ||
      liveL > -58 || liveR > -58 || liveSum > -55
    );
    if (hasSignal) {
      this.lastAudioTime = now;
      this.hasSignalLost = false;
    } else if (!this.lastAudioTime) {
      this.lastAudioTime = now;
    } else if (now - this.lastAudioTime >= 10000) {
      this.hasSignalLost = true;
    }

    this.push(liveL, liveR, liveLufsM, liveLufsS, livePhase, liveSum, liveDiff, liveLufsI);

    const W = this.w;
    const H = this.h;
    const dpr = this.dpr || 1;

    if (!this.graphCanvas || this.graphCanvas.width !== W || this.graphCanvas.height !== H) {
      if (!this.graphCanvas) this.graphCanvas = document.createElement('canvas');
      this.graphCanvas.width = W;
      this.graphCanvas.height = H;
      this.graphCtx = this.graphCanvas.getContext('2d', { alpha: false });
      this.graphDirty = true;
    }

    if (this.isHoveringLime !== this._lastHoveringLime) {
      this.graphDirty = true;
      this._lastHoveringLime = this.isHoveringLime;
    }

    // Graph is drawn at 1/2 frame rate (~30 FPS) since it displays historical audio.
    // The leading dots on the right edge update at full 100% frame rate (60/120 FPS).
    this.renderFrameCount = (this.renderFrameCount || 0) + 1;
    const shouldUpdateGraph = this.graphDirty || (this.renderFrameCount % 2 === 0);

    // Generous Left Margin (175px) so labels never clip, and Full-Width Right Margin (28px)
    const padL = 175 * dpr;
    const padR = 28 * dpr;
    const padT = 18 * dpr;
    const padB = 26 * dpr;
    const plotW = Math.max(10, W - padL - padR);
    const plotH = Math.max(10, H - padT - padB);

    // dB to Y mapping (-60 dBFS at bottom, up to +6.02 dBFS at top for true summed signals)
    const minScaleDb = -60.0;
    const maxScaleDb = 6.0;
    const rangeScaleDb = maxScaleDb - minScaleDb; // 66 dB
    const dbToY = (db) => padT + plotH * (1 - (Math.max(minScaleDb, Math.min(maxScaleDb, db)) - minScaleDb) / rangeScaleDb);
    const maxX = Math.round(padL + plotW);
    const limeY = Math.round(dbToY(-20));
    const bufLen = this.bufferSize;

    if (shouldUpdateGraph) {
      const ctx = this.graphCtx;
      this.graphDirty = false;

      // Background
      ctx.fillStyle = this.PAL.bg;
      ctx.fillRect(0, 0, W, H);

    // ── Horizontal Reference Grid Lines: Solid, Refined & Less Intense ──
    const gridDbs = [
      { db: 6,   lineCol: 'rgba(239, 68, 68, 0.30)',   labelCol: '#ef4444', bold: true,  label: '+6 dBFS (SUM MAX)' },
      { db: 3,   lineCol: 'rgba(34, 197, 94, 0.26)',   labelCol: '#22c55e', bold: false, label: '+3 dBFS (SUM OVERLOAD)' },
      { db: 0,   lineCol: 'rgba(220, 38, 38, 0.34)',   labelCol: '#dc2626', bold: true,  label: '0 dBFS (PEAK)' },
      { db: -3,  lineCol: 'rgba(217, 119, 6, 0.26)',   labelCol: '#d97706', bold: false, label: '-3 dBFS' },
      { db: -4,  lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-4 dBFS' },
      { db: -8,  lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-8 dBFS' },
      { db: -12, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-12 dBFS' },
      { db: -14, lineCol: 'rgba(249, 115, 22, 0.30)',  labelCol: '#f97316', bold: true,  label: '-14 LUFS (STREAM)' },
      { db: -16, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-16 dBFS' },
      { db: -18, lineCol: 'rgba(21, 128, 61, 0.28)',   labelCol: '#16a34a', bold: true,  label: '-18 dBFS (REF)' },
      { db: -20, lineCol: 'rgba(74, 222, 128, 0.35)',  labelCol: '#4ade80', bold: true,  label: '-20 dBFS (0 VU)' },
      { db: -24, lineCol: 'rgba(16, 185, 129, 0.28)',  labelCol: '#10b981', bold: true,  label: '-24 LUFS (BROADCAST)' },
      { db: -28, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-28 dBFS' },
      { db: -32, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-32 dBFS' },
      { db: -36, lineCol: 'rgba(100, 116, 139, 0.18)', labelCol: '#64748b', bold: false, label: '-36 dBFS' },
      { db: -40, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-40 dBFS' },
      { db: -44, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-44 dBFS' },
      { db: -48, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-48 dBFS' },
      { db: -52, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-52 dBFS' },
      { db: -56, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-56 dBFS' },
      { db: -60, lineCol: 'rgba(71, 85, 105, 0.15)',   labelCol: '#475569', bold: false, label: '-60 dBFS' }
    ];

    ctx.font = `${Math.round(10 * dpr)}px ui-monospace, "SF Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Requirement 8: 0 dBFS line is default off unless show0DbfsLine is true; show +3/+6 headroom when Sum is enabled
    const activeGridDbs = gridDbs.filter(g => {
      if (g.db === 0 && !this.show0DbfsLine) return false;
      if (g.db > 0 && !this.showSum) return false;
      return true;
    });

    // ── Time Axis Scale Formatting Helper ──
    const formatSec = (s) => {
      if (s <= 0.01) return 'NOW';
      if (s < 60) return `-${s < 10 && s % 1 !== 0 ? s.toFixed(1) : Math.round(s)}s`;
      const m = s / 60;
      if (m < 60) {
        if (m % 1 === 0) return `-${m}m`;
        const minPart = Math.floor(m);
        const secPart = Math.round((m - minPart) * 60);
        return secPart > 0 ? `-${minPart}m ${secPart}s` : `-${minPart}m`;
      }
      if (m === 60) return '-1.0h';
      return `-${(m / 60).toFixed(1)}h`;
    };

    // Format Time of Day (e.g. 21:15:30) for both log and linear timelines
    const formatTimeOfDay = (secAgo) => {
      const d = new Date(Date.now() - secAgo * 1000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    };

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.PAL.textMuted;
    ctx.strokeStyle = this.PAL.gridTime;
    ctx.lineWidth = 1 * dpr;

    // Active time scale reflects the actual elapsed time to nearest 10m (10m, 20m, 30m, 40m, 50m, 60m)
    // Requirement 56: The log time should also have the times in time of day not the - minutes
    const capSec = this.getActiveSpanSec();
    let timeSteps = [];
    if (this.timeMode === 'super_log') {
      timeSteps = [
        { sec: capSec,        label: formatTimeOfDay(capSec) },
        { sec: capSec * 0.4,  label: formatTimeOfDay(capSec * 0.4) },
        { sec: capSec * 0.15, label: formatTimeOfDay(capSec * 0.15) },
        { sec: capSec * 0.04, label: formatTimeOfDay(capSec * 0.04) },
        { sec: capSec * 0.01, label: formatTimeOfDay(capSec * 0.01) },
        { sec: 0.0,           label: formatTimeOfDay(0) }
      ];
    } else if (this.timeMode === 'log') {
      timeSteps = [
        { sec: capSec,        label: formatTimeOfDay(capSec) },
        { sec: capSec * 0.6,  label: formatTimeOfDay(capSec * 0.6) },
        { sec: capSec * 0.3,  label: formatTimeOfDay(capSec * 0.3) },
        { sec: capSec * 0.15, label: formatTimeOfDay(capSec * 0.15) },
        { sec: capSec * 0.05, label: formatTimeOfDay(capSec * 0.05) },
        { sec: 0.0,           label: formatTimeOfDay(0) }
      ];
    } else {
      // Linear mode: Wall-clock Time of Day on lower axis
      const step = capSec / 5;
      for (let s = capSec; s > 0.01; s -= step) {
        timeSteps.push({ sec: s, label: formatTimeOfDay(s) });
      }
      timeSteps.push({ sec: 0.0, label: formatTimeOfDay(0) });
    }

    const beta = this.beta || (this.timeMode === 'super_log' ? 60 : 15);
    const logBetaDenom = this.logBetaDenom || Math.log(1 + beta);

    timeSteps.forEach(ts => {
      let x;
      if (this.timeMode === 'lin') {
        x = Math.round(padL + plotW * (1 - ts.sec / capSec));
      } else {
        const tau = ts.sec / capSec;
        const u = ts.sec === 0 ? 0 : Math.log(1 + beta * tau) / logBetaDenom;
        x = Math.round(padL + plotW * (1 - u));
      }

      // Vertical grid lines: ONLY drawn in linear mode. NO vertical grid lines in log or super_log mode!
      if (this.timeMode !== 'log' && this.timeMode !== 'super_log') {
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();
      }

      // Bottom axis tick mark & time label
      ctx.beginPath();
      ctx.moveTo(x, padT + plotH);
      ctx.lineTo(x, padT + plotH + 4 * dpr);
      ctx.stroke();

      ctx.fillText(ts.label, x, padT + plotH + 6 * dpr);
    });

    // ── Calculate Visible Rolling Sample Range ──
    const maxSpanSamples = Math.round(capSec * this.captureSpeed);
    const targetSamples = Math.min(this.count, maxSpanSamples);

    if (targetSamples >= 2) {
      const startIdx = (this.head - targetSamples + bufLen) % bufLen;

      const ageToX = (tau) => {
        if (this.timeMode === 'lin') {
          return padL + plotW * (1 - tau);
        } else {
          const u = tau <= 0.00001 ? 0 : Math.log(1 + beta * tau) / logBetaDenom;
          return padL + plotW * (1 - u);
        }
      };

      // Oldest visible sample position on screen
      const oldestAgeSec = (targetSamples - 1) / this.captureSpeed;
      const oldestTau = Math.max(0, Math.min(1, oldestAgeSec / capSec));
      const minX = Math.round(ageToX(oldestTau));

    // ── Plot Rolling Waves with Fast Peak Downsampling for Long Durations ──
    const maxPoints = Math.round(plotW * 2);

    // Dynamic Fade Distance (Requirement 14):
    // If fade is shut off or slider is 100%, show everything without any fading
    const doFade = this.enableFade && (this.hfFadeDistance < 100);

    let strokeA, fillA, strokeB, fillB, strokeSum, fillSum, strokeDiff, fillDiff;
    let strokeLufs = this.PAL.lineLufs;
    let fillLufs = this.PAL.fillLufs;
    let xFade0 = minX;
    let xFade1 = minX;

    if (doFade) {
      const fadeDistancePct = Math.max(10, Math.min(95, this.hfFadeDistance || 50));
      const fadeFrac = fadeDistancePct / 100;
      xFade0 = Math.round(padL + plotW * (1 - fadeFrac));
      xFade1 = Math.round(padL + plotW * (1 - fadeFrac * 0.5));

      const gradStrokeA = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradStrokeA.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradStrokeA.addColorStop(1, 'rgba(255, 255, 255, 1)');
      strokeA = gradStrokeA;

      const gradFillA = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradFillA.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradFillA.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      fillA = gradFillA;

      const gradStrokeB = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradStrokeB.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradStrokeB.addColorStop(1, 'rgba(239, 68, 68, 1)');
      strokeB = gradStrokeB;

      const gradFillB = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradFillB.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradFillB.addColorStop(1, 'rgba(239, 68, 68, 0.08)');
      fillB = gradFillB;

      const gradStrokeSum = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradStrokeSum.addColorStop(0, 'rgba(34, 197, 94, 0)');
      gradStrokeSum.addColorStop(1, 'rgba(34, 197, 94, 1)');
      strokeSum = gradStrokeSum;

      const gradFillSum = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradFillSum.addColorStop(0, 'rgba(34, 197, 94, 0)');
      gradFillSum.addColorStop(1, 'rgba(34, 197, 94, 0.09)');
      fillSum = gradFillSum;

      const gradStrokeDiff = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradStrokeDiff.addColorStop(0, 'rgba(6, 182, 212, 0)');
      gradStrokeDiff.addColorStop(1, 'rgba(6, 182, 212, 1)');
      strokeDiff = gradStrokeDiff;

      const gradFillDiff = ctx.createLinearGradient(xFade0, 0, xFade1, 0);
      gradFillDiff.addColorStop(0, 'rgba(6, 182, 212, 0)');
      gradFillDiff.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
      fillDiff = gradFillDiff;
    } else {
      // 100% Full View / Fade Shut-off - Solid colors across entire display
      strokeA = this.PAL.lineL;
      fillA = this.PAL.fillL;
      strokeB = this.PAL.lineR;
      fillB = this.PAL.fillR;
      strokeSum = this.PAL.lineSum;
      fillSum = this.PAL.fillSum;
      strokeDiff = this.PAL.lineDiff;
      fillDiff = this.PAL.fillDiff;
    }

    const drawCurve = (hist, strokeCol, fillCol, lineW, doFill = true, fadeChannels = false, histNorm = null) => {
      ctx.beginPath();
      if (minX >= maxX) return;

      const numCols = maxX - minX;

      // Fixed pixel-column rendering with continuous sub-sample linear interpolation.
      // Guarantees zero horizontal vertex drift, zero decimation aliasing, and 100% rock-solid stability.
      for (let c = 0; c <= numCols; c++) {
        const px = maxX - c;
        const normX = Math.max(0, Math.min(1, (px - padL) / plotW));
        let tau;
        let u = 0;
        if (this.timeMode === 'lin') {
          tau = 1 - normX;
        } else {
          u = 1 - normX;
          tau = (Math.pow(1 + beta, u) - 1) / beta;
        }

        const age = Math.max(0, Math.min(capSec, tau * capSec));
        const kFloat = (targetSamples - 1) - age * this.captureSpeed;
        const kClamped = Math.max(0, Math.min(targetSamples - 1, kFloat));
        const k0 = Math.floor(kClamped);
        const k1 = Math.min(targetSamples - 1, k0 + 1);
        const frac = kClamped - k0;
        const idx0 = (startIdx + k0) % bufLen;
        const idx1 = (startIdx + k1) % bufLen;

        let val = hist[idx0] * (1 - frac) + hist[idx1] * frac;

        if (histNorm) {
          if (this.timeMode !== 'lin') {
            // Log & Super-Log Mode:
            // Uncompressed right zone (u <= 0.05, recent audio): 100% instantaneous transient peaks.
            // As signal compresses to the left (u > 0.05): Smoothstep blend into the 400ms time-normalized stream.
            if (u > 0.05) {
              const b = Math.min(1.0, (u - 0.05) / 0.35);
              const smoothB = b * b * (3 - 2 * b);
              const normVal = histNorm[idx0] * (1 - frac) + histNorm[idx1] * frac;
              val = val * (1 - smoothB) + normVal * smoothB;
            }
          } else {
            // Linear Mode:
            // For long durations (10m - 60m), blend into normalized stream if samples exceed screen pixels.
            const samplesPerPx = (capSec * this.captureSpeed) / plotW;
            if (samplesPerPx > 4) {
              const b = Math.min(1.0, (samplesPerPx - 4) / 8);
              const normVal = histNorm[idx0] * (1 - frac) + histNorm[idx1] * frac;
              val = val * (1 - b) + normVal * b;
            }
          }
        }

        if (c === 0) {
          ctx.moveTo(px, dbToY(val));
        } else {
          ctx.lineTo(px, dbToY(val));
        }
      }

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = lineW * dpr;
      ctx.stroke();

      if (doFill && fillCol) {
        const bottomY = padT + plotH;
        ctx.lineTo(minX, bottomY);
        ctx.lineTo(maxX, bottomY);
        ctx.closePath();
        ctx.fillStyle = fillCol;
        ctx.fill();
      }
    };

    // 1. Channel B (Right Peak - Red)
    if (this.showChB) {
      drawCurve(this.histR, strokeB, fillB, 1.5, true, doFade, this.histNormR);
    }

    // 2. Channel A (Left Peak - White)
    if (this.showChA) {
      drawCurve(this.histL, strokeA, fillA, 1.5, true, doFade, this.histNormL);
    }

    // 3. Left + Right Mono Sum (Forest Green)
    if (this.showSum) {
      drawCurve(this.histSum, strokeSum, fillSum, 1.8, true, doFade, this.histNormSum);
    }

    // 4. L + (-R) Difference / Side (Cyan)
    if (this.showDiff) {
      drawCurve(this.histDiff, strokeDiff, fillDiff, 1.8, true, doFade, this.histNormDiff);
    }

    // 5. Perceived Loudness (Momentary LUFS - Orange Glow, NEVER FADES, EXACT)
    if (this.showLufs) {
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12 * dpr;
      // Ambient neon glow stroke
      drawCurve(this.histLufsM, 'rgba(249, 115, 22, 0.45)', fillLufs, 5.0, true, false);
      // Sharp luminous core (100% solid edge-to-edge)
      drawCurve(this.histLufsM, '#fb923c', null, 2.6, false, false);
      ctx.restore();
    }

    // 6. Short-Term Loudness S (3.0s - Purple #c084fc)
    if (this.showLufsS) {
      drawCurve(this.histLufsS, this.PAL.textLufsS, null, 2.0, false, false);
    }

    // 7. Integrated Loudness I (Mint Green #34d399)
    if (this.showLufsI) {
      drawCurve(this.histLufsI, this.PAL.textInteg, null, 2.0, false, false);
    }

    // 4. Phase Correlation Trace Plotted Across Time (Requirement 18)
    if (this.plotPhase && minX < maxX) {
      ctx.beginPath();
      const phaseBaseY = padT + plotH - 4 * dpr;
      const phaseHeight = 20 * dpr;
      const numCols = maxX - minX;
      for (let c = 0; c <= numCols; c++) {
        const px = maxX - c;
        const normX = Math.max(0, Math.min(1, (px - padL) / plotW));
        let tau;
        if (this.timeMode === 'lin') {
          tau = 1 - normX;
        } else {
          const u = 1 - normX;
          tau = (Math.pow(1 + beta, u) - 1) / beta;
        }
        const age = Math.max(0, Math.min(capSec, tau * capSec));
        const kFloat = (targetSamples - 1) - age * this.captureSpeed;
        const kClamped = Math.max(0, Math.min(targetSamples - 1, kFloat));
        const k0 = Math.floor(kClamped);
        const k1 = Math.min(targetSamples - 1, k0 + 1);
        const frac = kClamped - k0;
        const idx0 = (startIdx + k0) % bufLen;
        const idx1 = (startIdx + k1) % bufLen;
        const pVal = this.histPhase[idx0] * (1 - frac) + this.histPhase[idx1] * frac;
        const y = phaseBaseY - (pVal + 1) * 0.5 * phaseHeight;
        if (c === 0) {
          ctx.moveTo(px, y);
        } else {
          ctx.lineTo(px, y);
        }
      }
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'; // Soft purple phase correlation trace
      ctx.lineWidth = 1.3 * dpr;
      ctx.stroke();
    } // End of if (this.plotPhase)
    } // End of if (targetSamples >= 2)

    // ── Solid Reference Lines OVER the Graph: Subtle, Elegant & Less Intense ──
    ctx.save();
    ctx.font = `${Math.round(10 * dpr)}px ui-monospace, "SF Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([]); // 100% Solid Lines

    activeGridDbs.forEach(g => {
      const y = Math.round(dbToY(g.db));
      const isLimeLine = (g.db === -20);

      ctx.save();
      ctx.setLineDash([]); // Solid lines
      ctx.strokeStyle = isLimeLine && this.isHoveringLime ? '#4ade80' : g.lineCol;
      ctx.lineWidth = isLimeLine ? (this.isHoveringLime ? 2.0 * dpr : 1.2 * dpr) : 1.0 * dpr;

      if (isLimeLine && this.isHoveringLime) {
        ctx.shadowColor = 'rgba(74, 222, 128, 0.8)';
        ctx.shadowBlur = 6 * dpr;
      }

      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.restore();

      // Left margin label with crisp shadow for high legibility
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 3 * dpr;
      ctx.fillStyle = (g.bold || isLimeLine) ? g.labelCol : '#94a3b8';
      ctx.fillText(g.label, padL - 10 * dpr, y);
      ctx.restore();
    });
    ctx.restore();
    ctx.setLineDash([]);
    } // End of if (shouldUpdateGraph)

    // Blit pre-rendered graph from offscreen canvas at 1/2 frame rate
    this.ctx.drawImage(this.graphCanvas, 0, 0);

    const ctx = this.ctx;

    // ── Lime Line Interactive Scroll Zoom Badge / Hint (Floats OVER Graph) ──
    if (this.zoomFeedbackTime && (performance.now() - this.zoomFeedbackTime < 1900)) {
      const elapsed = performance.now() - this.zoomFeedbackTime;
      const alpha = Math.max(0, Math.min(1, 1 - (elapsed - 1100) / 800));
      ctx.save();
      ctx.globalAlpha = alpha;
      const bText = this.zoomFeedbackText || `ZOOM: ${this.formatDuration(this.captureLength)}`;
      ctx.font = `bold ${Math.round(11 * dpr)}px ui-monospace, "SF Mono", monospace`;
      const txtW = ctx.measureText(bText).width;
      const bW = txtW + 20 * dpr;
      const bH = 22 * dpr;
      const bX = Math.round(padL + (plotW - bW) / 2);
      const bY = Math.round(limeY - bH / 2);
      ctx.fillStyle = 'rgba(11, 15, 23, 0.94)';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.rect(bX, bY, bW, bH);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bText, bX + bW / 2, bY + bH / 2);
      ctx.restore();
    } else if (this.isHoveringLime) {
      ctx.save();
      const hintText = `↕ SCROLL TO ZOOM TIME (${this.formatDuration(this.captureLength)})`;
      ctx.font = `bold ${Math.round(9.5 * dpr)}px ui-monospace, "SF Mono", monospace`;
      const txtW = ctx.measureText(hintText).width;
      const bW = txtW + 16 * dpr;
      const bH = 18 * dpr;
      const bX = Math.round(padL + plotW - bW - 10 * dpr);
      const bY = Math.round(limeY - bH / 2);
      ctx.fillStyle = 'rgba(11, 15, 23, 0.88)';
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.rect(bX, bY, bW, bH);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#86efac';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hintText, bX + bW / 2, bY + bH / 2);
      ctx.restore();
    }

    // 5. Cursor Trace Hairline (Requirement 5)
    if (this.showCursorTrace && this.hoverX !== null && this.hoverX >= padL && this.hoverX <= padL + plotW) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(this.hoverX, padT);
      ctx.lineTo(this.hoverX, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Leading Edge Instantaneous Indicators ──
    const curX = maxX;
    const lastHeadIdx = (this.head - 1 + bufLen) % bufLen;
    const curYL = dbToY(this.histL[lastHeadIdx]);
    const curYR = dbToY(this.histR[lastHeadIdx]);
    const curYM = dbToY(this.histLufsM[lastHeadIdx]);

    // Ch B Peak Dot
    if (this.showChB) {
      ctx.fillStyle = this.PAL.lineR;
      ctx.beginPath();
      ctx.arc(curX, curYR, 3.2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ch A Peak Dot (White)
    if (this.showChA) {
      ctx.fillStyle = this.PAL.lineL;
      ctx.beginPath();
      ctx.arc(curX, curYL, 3.2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left + Right Sum Dot (Forest Green)
    if (this.showSum) {
      const curYSum = dbToY(this.histSum[lastHeadIdx]);
      ctx.fillStyle = this.PAL.lineSum;
      ctx.beginPath();
      ctx.arc(curX, curYSum, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // L + (-R) Difference Dot (Cyan)
    if (this.showDiff) {
      const curYDiff = dbToY(this.histDiff[lastHeadIdx]);
      ctx.fillStyle = this.PAL.lineDiff;
      ctx.beginPath();
      ctx.arc(curX, curYDiff, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Loudness Leading Halo & Dot
    if (this.showLufs) {
      ctx.fillStyle = 'rgba(244, 144, 44, 0.35)';
      ctx.beginPath();
      ctx.arc(curX, curYM, 7 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PAL.lineLufs;
      ctx.beginPath();
      ctx.arc(curX, curYM, 4.2 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curYM, 1.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // S (3.0s) Loudness Leading Dot (Purple)
    if (this.showLufsS) {
      const curYS = dbToY(this.histLufsS[lastHeadIdx]);
      ctx.fillStyle = this.PAL.textLufsS;
      ctx.beginPath();
      ctx.arc(curX, curYS, 3.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // INTEG (I) Loudness Leading Dot (Mint Green)
    if (this.showLufsI) {
      const curYI = dbToY(this.histLufsI[lastHeadIdx]);
      ctx.fillStyle = this.PAL.textInteg;
      ctx.beginPath();
      ctx.arc(curX, curYI, 3.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Note: Canvas color key legend removed per user request (colors are on the hover HUD)

    // ── Update Floating Hover HUD Telemetry ──
    if (this.hudChA) {
      const latestL = this.histL[(this.head - 1 + bufLen) % bufLen];
      const latestR = this.histR[(this.head - 1 + bufLen) % bufLen];

      this.hudChA.textContent = (latestL > -60 ? latestL.toFixed(1) : '-INF') + ' dBFS';
      this.hudChB.textContent = (latestR > -60 ? latestR.toFixed(1) : '-INF') + ' dBFS';
      if (this.hudSum) {
        const latestSum = this.histSum[(this.head - 1 + bufLen) % bufLen];
        const sPre = latestSum > 0 ? '+' : '';
        this.hudSum.textContent = (latestSum > -60 ? sPre + latestSum.toFixed(1) : '-INF') + ' dBFS';
      }
      if (this.hudDiff) {
        const latestDiff = this.histDiff[(this.head - 1 + bufLen) % bufLen];
        const dPre = latestDiff > 0 ? '+' : '';
        this.hudDiff.textContent = (latestDiff > -60 ? dPre + latestDiff.toFixed(1) : '-INF') + ' dBFS';
      }
      this.hudLufsM.textContent = (liveLufsM > -60 ? liveLufsM.toFixed(1) : '-INF') + ' LUFS';
      this.hudLufsS.textContent = (liveLufsS > -60 ? liveLufsS.toFixed(1) : '-INF') + ' LUFS';
      this.hudLufsI.textContent = (liveLufsI > -60 ? liveLufsI.toFixed(1) : '-INF') + ' LUFS';
      this.hudLra.textContent = (liveLra > 0 ? liveLra.toFixed(1) : '0.0') + ' LU';
      this.hudMax.textContent = `L ${this.peakMaxL > -60 ? this.peakMaxL.toFixed(1) : '-INF'} | R ${this.peakMaxR > -60 ? this.peakMaxR.toFixed(1) : '-INF'}`;

      if (this.hudTimeMode) {
        if (this.hasSignalLost) {
          this.hudTimeMode.textContent = `⚠ LOSS OF SIGNAL (SILENCE > 10s)`;
          this.hudTimeMode.style.color = '#fbbf24';
        } else {
          const modeLabel = this.timeMode === 'super_log' ? 'SUPER TRANSIENT LOG' : (this.timeMode === 'log' ? 'LOGARITHMIC' : 'LINEAR');
          this.hudTimeMode.textContent = `ITU-R BS.1770-4 · ${modeLabel}`;
          this.hudTimeMode.style.color = '';
        }
      }

      if (this.clipCountL > 0 || this.clipCountR > 0) {
        if (this.hudClipRow) this.hudClipRow.style.display = 'flex';
        if (this.hudClips) this.hudClips.textContent = (this.clipCountL + this.clipCountR);
      } else if (this.hudClipRow) {
        this.hudClipRow.style.display = 'none';
      }
    }

    // ── 10s Loss of Signal Warning on Scope Screen ──
    if (this.hasSignalLost) {
      const flashOn = Math.floor((now % 1200) / 600) === 0;
      if (flashOn) {
        ctx.save();
        ctx.font = `bold ${Math.round(11 * dpr)}px ui-monospace, monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('⚠ LOSS OF SIGNAL (>10s)', W - 32 * dpr, padT + 8 * dpr);
        ctx.restore();
      }
    }
  }
}

window.DbfsView = DbfsView;
