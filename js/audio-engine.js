/**
 * WBS XTM Precision Audio & Ballistics Engine
 * Handles sound card inputs, system output capture, test generator,
 * high-pass filtering, electromechanical VU ballistics, PPM peak dynamics,
 * and stereo phase cross-correlation.
 */

class XtmAudioEngine {
  constructor() {
    this.ctx = null;
    this.sourceNode = null;
    this.stream = null;
    this.isSystemAudio = false;
    this.activeDeviceId = null;
    this.sourceType = 'none'; // 'mic', 'system', 'test'

    // Gain & Filtering
    this.inputGainNode = null;
    this.inputTrimDb = 0; // -24 to +24 dB
    this.hpfNode = null;
    this.hpfEnabled = false;

    // Monitor / Listen Through
    this.monitorGainNode = null;
    this.monitorEnabled = false;
    this.monitorVolume = 0.7;

    // Splitter & Analyser / Processor
    this.splitterNode = null;
    this.processorNode = null;

    // Test Generator
    this.testOsc = null;
    this.testGain = null;
    this.testType = 'none'; // 'sine1k', 'sine400', 'pink', 'sweep'
    this.toneCalDb = 0;     // Default: 0 dBFS (Peak Full Scale Ceiling)
    this.sweepTimer = null;

    // Physics parameters for VU (ANSI C16.5 electromechanical 2nd-order ODE)
    this.vuStyle = 'simpson'; // 'simpson' or 'sifam'
    this.vuCoeffs = {
      simpson: { f0: 2.1, zeta: 0.65 },
      sifam: { f0: 3.2, zeta: 0.85 }
    };
    this.vuState = [
      { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }, // Ch A (Left)
      { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }  // Ch B (Right)
    ];

    // Physics parameters for PPM (IEC 60268-10 Type IIb Nordic / BBC)
    this.ppmAttack = 0.005; // 5ms attack
    this.ppmDecayDbPerSec = 24 / 2.8; // 24 dB in 2.8s
    this.peakSensTrim = -3.0; // Requirement 10: Peak sensitivity trim (-3 dB standard nominal)
    this.ppmState = [
      { env: 0, q: -0.12, qv: 0 },
      { env: 0, q: -0.12, qv: 0 }
    ];

    // Phase Correlation state (Pearson normalized, 300ms integration)
    this.phaseAlpha = 0.001;
    this.phaseState = { sL2: 0, sR2: 0, sLR: 0, correlation: 1.0, led: 7 };

    // Reference Calibration Level
    this.refLevelDb = 4; // +4 dBu default
    this.domain = 'analog'; // 'analog' (+4 dBu = 0 VU) or 'digital' (-20 dBFS = 0 VU)

    // ITU-R BS.1770 / EBU R128 Loudness State
    this.lufsState = {
      stage1: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
      stage2: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
      meanSquareM_L: 0,
      meanSquareM_R: 0,
      meanSquareS_L: 0,
      meanSquareS_R: 0,
      sumEnergy: 0,
      blockCount: 0,
      shortTermHist: []
    };

    // Current Metering Output (queried by visualizer on animation frame)
    this.currentLevels = {
      vu: [0, 0],       // Deflection fraction: 0.708 = 0 VU, 1.0 = +3 VU
      ppm: [-0.12, -0.12], // Normalized scale: 0 = -12 dB, 1.0 = +12 dB
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      dbfs: [-60, -60],
      lufs: {
        m: -60,
        s: -60,
        i: -60,
        lra: 0,
        mL: -60,
        mR: -60
      },
      rmsDb: [-60, -60],
      phaseCorrelation: 1.0,
      phaseLed: -1,     // 0..7
      peak: [false, false],
      hasAudio: false
    };

    // Listeners for device changes & status
    this.onStatusChange = null;
    this.onDevicesChange = null;
  }

  /**
   * Initializes or resumes the AudioContext
   */
  async ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.calculateCoefficients();
    await this.initWorklet();
    return this.ctx;
  }

  /**
   * Loads the AudioWorklet module for modern, low-latency audio-thread metering
   */
  async initWorklet() {
    if (this.workletLoaded || !this.ctx || !this.ctx.audioWorklet) return;
    try {
      await this.ctx.audioWorklet.addModule('js/meter-processor.js');
      this.workletLoaded = true;
    } catch (_) {
      try {
        const workletCode = `class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=1024;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        await this.ctx.audioWorklet.addModule(blobUrl);
        URL.revokeObjectURL(blobUrl);
        this.workletLoaded = true;
      } catch (err) {
        this.workletLoaded = false;
      }
    }
  }

  /**
   * Calculates ballistic biquad coefficients for the VU movement
   */
  calculateCoefficients() {
    if (!this.ctx) return;
    const fs = this.ctx.sampleRate;
    const cfg = this.vuCoeffs[this.vuStyle] || this.vuCoeffs.simpson;
    const omega0 = 2.0 * Math.PI * cfg.f0 / fs;
    const alpha = omega0 * omega0;
    const beta = 2.0 * cfg.zeta * omega0;
    const a0 = 1.0 + beta + alpha;

    this.vuB0 = alpha / a0;
    this.vuB1 = 2.0 * alpha / a0;
    this.vuB2 = alpha / a0;
    this.vuA1 = 2.0 * (alpha - 1.0) / a0;
    this.vuA2 = (1.0 - beta + alpha) / a0;

    // PPM coefficients
    this.ppmAttCoeff = 1.0 - Math.exp(-1.0 / (this.ppmAttack * fs));
    const tauDecay = (2.8 / (24 / 20 * Math.LN10));
    this.ppmDecCoeff = Math.exp(-1.0 / (tauDecay * fs));

    // Phase integration alpha (300 ms time constant)
    this.phaseAlpha = 1.0 - Math.exp(-1.0 / (0.300 * fs));

    // ITU-R BS.1770 K-Weighting Filter Coefficients
    const dbK = 3.9998438;
    const f0_shelf = 1681.9744509555319;
    const G = Math.pow(10, dbK / 20);
    const K_shelf = Math.tan(Math.PI * f0_shelf / fs);
    const K2_shelf = K_shelf * K_shelf;
    const sqrt2 = Math.SQRT2;
    const a0_s = 1 + sqrt2 * K_shelf + K2_shelf;
    this.kShelf_b0 = (G + sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
    this.kShelf_b1 = 2 * (K2_shelf - G) / a0_s;
    this.kShelf_b2 = (G - sqrt2 * Math.sqrt(G) * K_shelf + K2_shelf) / a0_s;
    this.kShelf_a1 = 2 * (K2_shelf - 1) / a0_s;
    this.kShelf_a2 = (1 - sqrt2 * K_shelf + K2_shelf) / a0_s;

    const f0_hp = 38.13547087602444;
    const Q_hp = 0.5003270373238773;
    const K_hp = Math.tan(Math.PI * f0_hp / fs);
    const K2_hp = K_hp * K_hp;
    const a0_hp = 1 + (K_hp / Q_hp) + K2_hp;
    this.kHp_b0 = 1.0 / a0_hp;
    this.kHp_b1 = -2.0 / a0_hp;
    this.kHp_b2 = 1.0 / a0_hp;
    this.kHp_a1 = 2 * (K2_hp - 1) / a0_hp;
    this.kHp_a2 = (1 - (K_hp / Q_hp) + K2_hp) / a0_hp;

    // Loudness Time Constants: M (400ms), S (3000ms) for bufferSize=1024
    const blockTimeSec = 1024 / fs;
    this.lufsAlphaM = 1.0 - Math.exp(-blockTimeSec / 0.400);
    this.lufsAlphaS = 1.0 - Math.exp(-blockTimeSec / 3.000);
  }

  /**
   * Set VU Movement Style: 'simpson' (classic amber 300ms) or 'sifam' (crisp 200ms)
   */
  setVuStyle(style) {
    if (style !== 'simpson' && style !== 'sifam') return;
    this.vuStyle = style;
    this.calculateCoefficients();
  }

  /**
   * Query available audio input hardware devices
   */
  async getAudioInputDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'audioinput');
    } catch (e) {
      console.warn('Could not enumerate audio devices:', e);
      return [];
    }
  }

  /**
   * Connect to a Sound Card Input / Microphone / Loopback Interface
   */
  async connectSoundCard(deviceId = null) {
    await this.ensureContext();
    this.stopCurrentSource();

    // Linux loopbacks (PulseAudio Loopback / Monitor of Sink, PipeWire, ALSA snd-aloop)
    // often fail if exact constraints or channelCount: 2 are required.
    // Progressively fall back from strict high-fidelity stereo to relaxed constraints.
    const constraintList = [];

    if (deviceId) {
      // 1. Exact device with ideal stereo and raw un-processed audio
      constraintList.push({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: { ideal: 2 }
        }
      });
      // 2. Ideal deviceId with raw audio
      constraintList.push({
        audio: {
          deviceId: { ideal: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      // 3. Exact deviceId basic
      constraintList.push({
        audio: {
          deviceId: { exact: deviceId }
        }
      });
      // 4. Plain deviceId
      constraintList.push({
        audio: {
          deviceId: deviceId
        }
      });
    }

    // Generic device fallbacks
    constraintList.push({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 2 }
      }
    });
    constraintList.push({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    constraintList.push({ audio: true });

    let stream = null;
    let lastErr = null;

    for (const c of constraintList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        if (stream && stream.getAudioTracks().length > 0) {
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn('getUserMedia candidate constraint failed:', c, err);
      }
    }

    if (!stream) {
      console.error('All getUserMedia attempts failed:', lastErr);
      if (this.onStatusChange) this.onStatusChange({ type: 'error', error: lastErr?.message || 'Audio device unavailable' });
      throw lastErr || new Error('Could not access audio device');
    }

    try {
      this.stream = stream;
      const track = stream.getAudioTracks()[0];
      if (track) track.enabled = true;
      const settings = (track && track.getSettings) ? track.getSettings() : {};
      this.activeDeviceId = settings.deviceId || deviceId;
      this.isSystemAudio = false;
      this.sourceType = 'mic';
      this.setupAudioGraph(stream);

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Notify device changes with updated permission labels
      const devices = await this.getAudioInputDevices();
      if (this.onDevicesChange) this.onDevicesChange(devices, this.activeDeviceId);
      const label = track?.label || 'Soundcard Input';
      if (this.onStatusChange) this.onStatusChange({ type: 'soundcard', label });
      return true;
    } catch (err) {
      console.error('Error in audio graph setup for sound card:', err);
      if (this.onStatusChange) this.onStatusChange({ type: 'error', error: err.message });
      throw err;
    }
  }

  /**
   * Connect to System Audio Output ("Listen to whatever is playing")
   * Uses getDisplayMedia to capture computer audio
   */
  async connectSystemAudio() {
    await this.ensureContext();
    this.stopCurrentSource();

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Stop unused video track immediately
      stream.getVideoTracks().forEach(track => track.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track selected. When prompted, ensure "Share audio" is checked.');
      }

      this.stream = stream;
      this.isSystemAudio = true;
      this.activeDeviceId = null;
      this.sourceType = 'system';
      this.setupAudioGraph(stream);

      // Track ends when user stops sharing in browser toolbar
      audioTracks[0].onended = () => {
        this.stopCurrentSource();
        if (this.onStatusChange) this.onStatusChange({ type: 'disconnected', label: 'Audio Stopped' });
      };

      if (this.onStatusChange) this.onStatusChange({ type: 'system', label: audioTracks[0].label || 'Computer System Audio' });
      return true;
    } catch (err) {
      console.error('Error capturing system audio:', err);
      if (this.onStatusChange) this.onStatusChange({ type: 'error', error: err.message });
      throw err;
    }
  }

  /**
   * Built-in Signal Generator for testing and calibration
   */
  startTestGenerator(type = 'sine1k') {
    this.ensureContext();
    this.stopCurrentSource();
    this.sourceType = 'test';
    this.testType = type;

    const ctx = this.ctx;
    this.testGain = ctx.createGain();
    const gainVal = (type === 'sine1k' || type === 'sine400') ? Math.pow(10, this.toneCalDb / 20) : (type === 'pink' ? 0.35 : 0.5);
    this.testGain.gain.value = gainVal;

    if (type === 'sine1k' || type === 'sine400') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'sine1k' ? 1000 : 400, ctx.currentTime);
      osc.connect(this.testGain);
      osc.start();
      this.testOsc = osc;
    } else if (type === 'pink') {
      // 5-second buffer of Paul Kellet pink noise
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      noiseNode.connect(this.testGain);
      noiseNode.start();
      this.testOsc = noiseNode;
    } else if (type === 'sweep') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(20, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 8);
      osc.connect(this.testGain);
      osc.start();
      this.testOsc = osc;

      // Repeat sweep every 9s
      this.sweepTimer = setInterval(() => {
        if (this.sourceType === 'test' && this.testType === 'sweep' && this.testOsc) {
          try {
            this.testOsc.frequency.cancelScheduledValues(ctx.currentTime);
            this.testOsc.frequency.setValueAtTime(20, ctx.currentTime);
            this.testOsc.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 8);
          } catch (_) {}
        }
      }, 9000);
    }

    this.setupAudioGraph(this.testGain, true);
    if (this.onStatusChange) this.onStatusChange({ type: 'test', label: `Test Generator (${type})` });
  }

  /**
   * Set 1 kHz Test Tone Calibration Level (-24, -20, -18, -14, -12, -6, 0 dBFS)
   */
  setToneCalibration(calDb) {
    this.toneCalDb = calDb;
    if (this.testGain && this.ctx && (this.testType === 'sine1k' || this.testType === 'sine400')) {
      const lin = Math.pow(10, calDb / 20);
      try {
        this.testGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.testGain.gain.linearRampToValueAtTime(lin, this.ctx.currentTime + 0.05);
      } catch (_) {
        this.testGain.gain.value = lin;
      }
    }
  }

  /**
   * Wires the Web Audio processing graph
   */
  setupAudioGraph(sourceObj, isDirectNode = false) {
    const ctx = this.ctx;

    if (isDirectNode) {
      this.sourceNode = sourceObj;
    } else {
      this.sourceNode = ctx.createMediaStreamSource(sourceObj);
    }

    // Input Trim Gain
    this.inputGainNode = ctx.createGain();
    this.inputGainNode.channelCount = 2;
    this.inputGainNode.channelCountMode = 'explicit';
    this.inputGainNode.channelInterpretation = 'speakers';
    this.updateInputGain();

    // High Pass Filter (Sub-Audible Rumble Rejection at 18 Hz or 80 Hz)
    this.hpfNode = ctx.createBiquadFilter();
    this.hpfNode.type = 'highpass';
    this.hpfNode.frequency.setValueAtTime(80, ctx.currentTime);
    this.hpfNode.Q.setValueAtTime(0.707, ctx.currentTime);
    this.updateHpfState();

    // Listen-Through / Monitor Output
    this.monitorGainNode = ctx.createGain();
    this.updateMonitorState();
    this.monitorGainNode.connect(ctx.destination);

    // Channel Splitter (Left = Ch A, Right = Ch B)
    this.splitterNode = ctx.createChannelSplitter(2);

    // Analysis Node: Modern AudioWorkletNode (audio-thread) with ScriptProcessor fallback
    if (this.workletLoaded && typeof AudioWorkletNode !== 'undefined') {
      try {
        this.processorNode = new AudioWorkletNode(ctx, 'wbs-meter-processor');
        this.processorNode.port.onmessage = (e) => {
          if (e.data && e.data.ch0 && e.data.ch1) {
            this.processAudioBlockBuffers(e.data.ch0, e.data.ch1);
          }
        };
      } catch (_) {
        this.processorNode = null;
      }
    }

    if (!this.processorNode) {
      // Graceful fallback for environments where AudioWorklet is blocked/unsupported
      const bufferSize = 1024;
      this.processorNode = ctx.createScriptProcessor(bufferSize, 2, 2);
      this.processorNode.onaudioprocess = (e) => this.processAudioBlock(e);
    }

    // Connect chain:
    // sourceNode -> inputGainNode -> (hpfNode if on) -> splitter / monitor / processor
    this.sourceNode.connect(this.inputGainNode);
    this.inputGainNode.connect(this.hpfNode);

    this.hpfNode.connect(this.monitorGainNode);
    this.hpfNode.connect(this.processorNode);
    // Connect processor to destination (silent dummy connection required for processor to run)
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0.0;
    this.processorNode.connect(silentGain);
    silentGain.connect(ctx.destination);
  }

  /**
   * Stop current audio stream or test generator
   */
  stopCurrentSource() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    if (this.testOsc) {
      try { this.testOsc.stop(); } catch (_) {}
      this.testOsc.disconnect();
      this.testOsc = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (_) {}
      this.sourceNode = null;
    }
    if (this.processorNode) {
      try {
        if (this.processorNode.port) {
          this.processorNode.port.onmessage = null;
        }
        this.processorNode.disconnect();
      } catch (_) {}
      this.processorNode = null;
    }
    this.sourceType = 'none';
    this.isSystemAudio = false;

    // Reset levels
    this.lufsState.meanSquareM_L = 0;
    this.lufsState.meanSquareM_R = 0;
    this.lufsState.meanSquareS_L = 0;
    this.lufsState.meanSquareS_R = 0;
    this.lufsState.sumEnergy = 0;
    this.lufsState.blockCount = 0;
    this.lufsState.shortTermHist = [];

    this.currentLevels = {
      vu: [0, 0],
      ppm: [-0.12, -0.12],
      vuDb: [-Infinity, -Infinity],
      ppmDb: [-Infinity, -Infinity],
      dbfs: [-60, -60],
      lufs: {
        m: -60,
        s: -60,
        i: -60,
        lra: 0,
        mL: -60,
        mR: -60
      },
      rmsDb: [-60, -60],
      phaseCorrelation: 1.0,
      phaseLed: -1,
      peak: [false, false],
      hasAudio: false
    };
  }

  /**
   * Process a live block of audio samples from ScriptProcessor
   */
  processAudioBlock(e) {
    const inputL = e.inputBuffer.getChannelData(0);
    const inputR = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : inputL;
    this.processAudioBlockBuffers(inputL, inputR);
  }

  /**
   * Real-time audio integration & ITU-R BS.1770 / IEC 60268 ballistics engine
   */
  processAudioBlockBuffers(inputL, inputR) {
    const len = inputL.length;

    // Reference Scaling:
    // Standard broadcast alignment: 0 dBFS sine = +24 dBu.
    // Nominally 0 VU = +4 dBu (-20 dBFS).
    // Calibration scales with refLevelDb.
    const calGain = Math.pow(10, (4 - this.refLevelDb) / 20);
    const kAvg = Math.pow(10, -3 / 20) / (2 * Math.SQRT2 / Math.PI); // VU scale factor

    let hasSignal = false;
    let peakA = false, peakB = false;
    let maxA = 0, maxB = 0, maxSum = 0, maxDiff = 0;
    let sumSqK_L = 0, sumSqK_R = 0;
    let sumSqRaw_L = 0, sumSqRaw_R = 0;

    // Ballistics integration loops: VU COMPUTED FIRST FOR IMMEDIATE RESPONSE
    for (let i = 0; i < len; i++) {
      const sA = inputL[i] * calGain;
      const sB = inputR[i] * calGain;

      const rA = Math.abs(sA);
      const rB = Math.abs(sB);

      // =====================================================================
      // 1. VU BALLISTICS (CALCULATED FIRST BEFORE ALL OTHER MATH)
      // =====================================================================
      const vuInA = rA * kAvg;
      const ynA = this.vuB0 * vuInA + this.vuB1 * this.vuState[0].x1 + this.vuB2 * this.vuState[0].x2
                  - this.vuA1 * this.vuState[0].y1 - this.vuA2 * this.vuState[0].y2;
      this.vuState[0].x2 = this.vuState[0].x1;
      this.vuState[0].x1 = vuInA;
      this.vuState[0].y2 = this.vuState[0].y1;
      this.vuState[0].y1 = ynA;
      this.vuState[0].p = Math.max(-0.03, Math.min(1.15, ynA));

      const vuInB = rB * kAvg;
      const ynB = this.vuB0 * vuInB + this.vuB1 * this.vuState[1].x1 + this.vuB2 * this.vuState[1].x2
                  - this.vuA1 * this.vuState[1].y1 - this.vuA2 * this.vuState[1].y2;
      this.vuState[1].x2 = this.vuState[1].x1;
      this.vuState[1].x1 = vuInB;
      this.vuState[1].y2 = this.vuState[1].y1;
      this.vuState[1].y1 = ynB;
      this.vuState[1].p = Math.max(-0.03, Math.min(1.15, ynB));

      // Peak detection & signal presence (True L+R mathematical sum, can peak up to +6.02 dBFS)
      const rawA = Math.abs(inputL[i]);
      const rawB = Math.abs(inputR[i]);
      const rawSum = Math.abs(inputL[i] + inputR[i]); // True L + R Sum (reaches +6.02 dBFS for 0 dBFS in-phase mono)
      const rawDiff = Math.abs(inputL[i] - inputR[i]); // True L + (-R) difference / side
      if (rawA > maxA) maxA = rawA;
      if (rawB > maxB) maxB = rawB;
      if (rawSum > maxSum) maxSum = rawSum;
      if (rawDiff > maxDiff) maxDiff = rawDiff;

      sumSqRaw_L += inputL[i] * inputL[i];
      sumSqRaw_R += inputR[i] * inputR[i];

      if (rA > 0.0001 || rB > 0.0001) hasSignal = true;

      // K-weighting Stage 1: High shelf
      const s1L = this.lufsState.stage1[0];
      const y1L = this.kShelf_b0 * inputL[i] + this.kShelf_b1 * s1L.x1 + this.kShelf_b2 * s1L.x2 - this.kShelf_a1 * s1L.y1 - this.kShelf_a2 * s1L.y2;
      s1L.x2 = s1L.x1; s1L.x1 = inputL[i];
      s1L.y2 = s1L.y1; s1L.y1 = y1L;

      const s1R = this.lufsState.stage1[1];
      const y1R = this.kShelf_b0 * inputR[i] + this.kShelf_b1 * s1R.x1 + this.kShelf_b2 * s1R.x2 - this.kShelf_a1 * s1R.y1 - this.kShelf_a2 * s1R.y2;
      s1R.x2 = s1R.x1; s1R.x1 = inputR[i];
      s1R.y2 = s1R.y1; s1R.y1 = y1R;

      // K-weighting Stage 2: High pass (RLB)
      const s2L = this.lufsState.stage2[0];
      const y2L = this.kHp_b0 * y1L + this.kHp_b1 * s2L.x1 + this.kHp_b2 * s2L.x2 - this.kHp_a1 * s2L.y1 - this.kHp_a2 * s2L.y2;
      s2L.x2 = s2L.x1; s2L.x1 = y1L;
      s2L.y2 = s2L.y1; s2L.y1 = y2L;

      const s2R = this.lufsState.stage2[1];
      const y2R = this.kHp_b0 * y1R + this.kHp_b1 * s2R.x1 + this.kHp_b2 * s2R.x2 - this.kHp_a1 * s2R.y1 - this.kHp_a2 * s2R.y2;
      s2R.x2 = s2R.x1; s2R.x1 = y1R;
      s2R.y2 = s2R.y1; s2R.y1 = y2R;

      sumSqK_L += y2L * y2L;
      sumSqK_R += y2R * y2R;

      // 2. PPM Peak Ballistics (IEC envelope)
      // Left
      const rRMS_A = rA / Math.SQRT2;
      if (rRMS_A > this.ppmState[0].env) {
        this.ppmState[0].env += (rRMS_A - this.ppmState[0].env) * this.ppmAttCoeff;
      } else {
        this.ppmState[0].env *= this.ppmDecCoeff;
      }
      // Right
      const rRMS_B = rB / Math.SQRT2;
      if (rRMS_B > this.ppmState[1].env) {
        this.ppmState[1].env += (rRMS_B - this.ppmState[1].env) * this.ppmAttCoeff;
      } else {
        this.ppmState[1].env *= this.ppmDecCoeff;
      }

      // Check Peak Overload (+10 dB above reference)
      if (rA >= 1.0) peakA = true;
      if (rB >= 1.0) peakB = true;

      // 3. Stereo Phase Correlation (Pearson product-moment)
      this.phaseState.sL2 += this.phaseAlpha * (sA * sA - this.phaseState.sL2);
      this.phaseState.sR2 += this.phaseAlpha * (sB * sB - this.phaseState.sR2);
      this.phaseState.sLR += this.phaseAlpha * (sA * sB - this.phaseState.sLR);
    }

    // Convert PPM envelopes to dB and fraction (-12 to +12 scale) with Peak Sensitivity Trim (Req 10)
    const trim = this.peakSensTrim || 0;
    const ppmDbA = this.ppmState[0].env > 1e-6 ? 20 * Math.log10(this.ppmState[0].env) + trim : -Infinity;
    const ppmDbB = this.ppmState[1].env > 1e-6 ? 20 * Math.log10(this.ppmState[1].env) + trim : -Infinity;

    const ppmFracA = ppmDbA >= -12 ? (ppmDbA + 12) / 24 : -0.12 * (1 - Math.pow(10, (ppmDbA + 12) / 20));
    const ppmFracB = ppmDbB >= -12 ? (ppmDbB + 12) / 24 : -0.12 * (1 - Math.pow(10, (ppmDbB + 12) / 20));

    // Calculate phase correlation index (-1.0 to +1.0)
    const denom = Math.sqrt(this.phaseState.sL2 * this.phaseState.sR2) + 1e-9;
    const corr = hasSignal ? Math.max(-1.0, Math.min(1.0, this.phaseState.sLR / denom)) : 1.0;
    this.phaseState.correlation = corr;

    // Map correlation to 8 discrete LEDs (0 = -1.0 anti-phase, 7 = +1.0 mono in-phase)
    let pLed = -1;
    if (hasSignal) {
      if (corr <= -0.75) pLed = 0;
      else if (corr <= -0.50) pLed = 1;
      else if (corr <= -0.20) pLed = 2;
      else if (corr <= 0.10)  pLed = 3;
      else if (corr <= 0.40)  pLed = 4;
      else if (corr <= 0.70)  pLed = 5;
      else if (corr <= 0.90)  pLed = 6;
      else pLed = 7;
    }
    this.phaseState.led = pLed;

    // Digital Peak Full Scale (dBFS)
    const dbfsA = maxA > 1e-6 ? 20 * Math.log10(maxA) : -120;
    const dbfsB = maxB > 1e-6 ? 20 * Math.log10(maxB) : -120;
    const dbfsSum = maxSum > 1e-6 ? 20 * Math.log10(maxSum) : -120;
    const dbfsDiff = maxDiff > 1e-6 ? 20 * Math.log10(maxDiff) : -120;

    // ITU-R BS.1770 / EBU R128 Loudness Integration
    const zBlockL = sumSqK_L / len;
    const zBlockR = sumSqK_R / len;

    if (hasSignal) {
      this.lufsState.meanSquareM_L += this.lufsAlphaM * (zBlockL - this.lufsState.meanSquareM_L);
      this.lufsState.meanSquareM_R += this.lufsAlphaM * (zBlockR - this.lufsState.meanSquareM_R);

      this.lufsState.meanSquareS_L += this.lufsAlphaS * (zBlockL - this.lufsState.meanSquareS_L);
      this.lufsState.meanSquareS_R += this.lufsAlphaS * (zBlockR - this.lufsState.meanSquareS_R);

      const blockTotalZ = zBlockL + zBlockR;
      if (blockTotalZ > 1.25e-7) { // > -70 LUFS threshold gate
        this.lufsState.sumEnergy += blockTotalZ;
        this.lufsState.blockCount++;
      }
    } else {
      this.lufsState.meanSquareM_L *= 0.92;
      this.lufsState.meanSquareM_R *= 0.92;
      this.lufsState.meanSquareS_L *= 0.97;
      this.lufsState.meanSquareS_R *= 0.97;
    }

    const zM = this.lufsState.meanSquareM_L + this.lufsState.meanSquareM_R;
    const zS = this.lufsState.meanSquareS_L + this.lufsState.meanSquareS_R;
    const zI = this.lufsState.blockCount > 0 ? (this.lufsState.sumEnergy / this.lufsState.blockCount) : 0;

    const toLufs = (z) => z > 1e-12 ? Math.max(-60, -0.691 + 10 * Math.log10(z)) : -60;

    const lufsM = toLufs(zM);
    const lufsS = toLufs(zS);
    const lufsI = toLufs(zI);
    const lufsML = toLufs(this.lufsState.meanSquareM_L);
    const lufsMR = toLufs(this.lufsState.meanSquareM_R);

    // Track LRA (Loudness Range)
    if (lufsS > -60) {
      this.lufsState.shortTermHist.push(lufsS);
      if (this.lufsState.shortTermHist.length > 200) this.lufsState.shortTermHist.shift();
    }
    let lra = 0;
    if (this.lufsState.shortTermHist.length >= 20) {
      const sorted = [...this.lufsState.shortTermHist].sort((a, b) => a - b);
      const p10 = sorted[Math.floor(sorted.length * 0.10)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      lra = Math.max(0, p95 - p10);
    }

    const rmsL = sumSqRaw_L > 0 ? Math.max(-60, 10 * Math.log10(sumSqRaw_L / len)) : -60;
    const rmsR = sumSqRaw_R > 0 ? Math.max(-60, 10 * Math.log10(sumSqRaw_R / len)) : -60;

    // Update published levels
    this.currentLevels = {
      vu: [this.vuState[0].p, this.vuState[1].p],
      ppm: [ppmFracA, ppmFracB],
      vuDb: [this.vuDbOf(this.vuState[0].p), this.vuDbOf(this.vuState[1].p)],
      ppmDb: [ppmDbA, ppmDbB],
      dbfs: [dbfsA, dbfsB, dbfsSum, dbfsDiff],
      dbfsDiff: dbfsDiff,
      lufs: {
        m: lufsM,
        s: lufsS,
        i: lufsI,
        lra: lra,
        mL: lufsML,
        mR: lufsMR
      },
      rmsDb: [rmsL, rmsR],
      phaseCorrelation: corr,
      phaseLed: pLed,
      peak: [peakA, peakB],
      hasAudio: hasSignal
    };
  }

  getLevels() {
    return this.currentLevels;
  }

  vuDbOf(p) {
    return p > 0.005 ? 20 * Math.log10(p) + 3 : -Infinity;
  }

  /**
   * Set High-Pass sub-audible filter (HPO = out, HPI = in)
   */
  setHighPass(enabled) {
    this.hpfEnabled = enabled;
    this.updateHpfState();
  }

  updateHpfState() {
    if (!this.hpfNode || !this.ctx) return;
    if (this.hpfEnabled) {
      this.hpfNode.frequency.setValueAtTime(80, this.ctx.currentTime);
    } else {
      this.hpfNode.frequency.setValueAtTime(5, this.ctx.currentTime);
    }
  }

  /**
   * Set calibration reference level in dBu (+4 dBu default, -60 to +30)
   */
  setReferenceLevel(dBu) {
    this.refLevelDb = dBu;
  }

  setPeakSensTrim(db) {
    this.peakSensTrim = db;
  }

  /**
   * Input Gain Trim (-24 to +24 dB)
   */
  setInputTrim(db) {
    this.inputTrimDb = db;
    this.updateInputGain();
  }

  updateInputGain() {
    if (!this.inputGainNode || !this.ctx) return;
    const gainVal = Math.pow(10, this.inputTrimDb / 20);
    this.inputGainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);
  }

  /**
   * Monitor / Listen Through toggle & volume
   */
  setMonitor(enabled, volume = null) {
    this.monitorEnabled = enabled;
    if (volume !== null) this.monitorVolume = volume;
    this.updateMonitorState();
  }

  updateMonitorState() {
    if (!this.monitorGainNode || !this.ctx) return;
    const vol = this.monitorEnabled ? this.monitorVolume : 0.0;
    this.monitorGainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
  }
}

// Global singleton instance
window.xtmAudio = new XtmAudioEngine();
