/**
 * Ward-Beck Systems XTM-4 — WebAssembly DSP Interface
 * High-speed WASM audio processing bridge with zero GC allocation.
 */

export interface WasmDspResult {
  vuL: number;
  vuR: number;
  ppmDbL: number;
  ppmDbR: number;
  ppmFracL: number;
  ppmFracR: number;
  dbfsA: number;
  dbfsB: number;
  dbfsSum: number;
  dbfsDiff: number;
  lufsM: number;
  lufsS: number;
  lufsML: number;
  lufsMR: number;
  blockEnergy: number;
  phaseCorr: number;
  hasAudio: boolean;
  peakA: boolean;
  peakB: boolean;
}

export class WasmDspEngine {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;
  private isLoaded: boolean = false;

  private inputLOffset: number = 0;
  private inputROffset: number = 0;
  private outputOffset: number = 0;

  private initDspFn: ((sr: number, refLevelDb: number, peakTrim: number) => void) | null = null;
  private setRefLevelFn: ((refLevelDb: number, isDigital: number) => void) | null = null;
  private setCalGainFn: ((gain: number) => void) | null = null;
  private setPeakTrimFn: ((trimDb: number) => void) | null = null;
  private setPpmTypeFn: ((type: number) => void) | null = null;
  private setVuBallisticsFn: ((f0: number, zeta: number) => void) | null = null;
  private resetLoudnessFn: (() => void) | null = null;
  private processBlockFn: ((len: number) => void) | null = null;

  public async load(wasmUrl: string = './meter-dsp.wasm'): Promise<boolean> {
    try {
      let response: Response;
      try {
        response = await fetch(wasmUrl);
      } catch {
        response = await fetch('/meter-dsp.wasm');
      }

      const wasmBytes = await response.arrayBuffer();
      const importObject = {
        env: {
          abort: (_msg: number, _file: number, line: number, col: number) => {
            console.warn(`[WASM DSP] Abort at line ${line}:${col}`);
          },
          trace: (_msg: number, _n: number) => {}
        }
      };
      const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);

      this.instance = instance;
      const exports = instance.exports as Record<string, any>;

      this.memory = exports.memory as WebAssembly.Memory;
      this.inputLOffset = (exports.inputBufferL?.value ?? exports.inputBufferL) as number;
      this.inputROffset = (exports.inputBufferR?.value ?? exports.inputBufferR) as number;
      this.outputOffset = (exports.outputTelemetry?.value ?? exports.outputTelemetry) as number;

      this.initDspFn = exports.initDsp as (sr: number, refLevelDb: number, peakTrim: number) => void;
      this.setRefLevelFn = exports.setRefLevel as (refLevelDb: number, isDigital: number) => void;
      this.setCalGainFn = exports.setCalGain as (gain: number) => void;
      this.setPeakTrimFn = exports.setPeakTrim as (trimDb: number) => void;
      this.setPpmTypeFn = exports.setPpmType as (type: number) => void;
      this.setVuBallisticsFn = exports.setVuBallistics as (f0: number, zeta: number) => void;
      this.resetLoudnessFn = exports.resetLoudness as () => void;
      this.processBlockFn = exports.processBlock as (len: number) => void;

      this.isLoaded = true;
      return true;
    } catch (err) {
      console.warn('WASM DSP loading failed, falling back to JS DSP:', err);
      this.isLoaded = false;
      return false;
    }
  }

  public get ready(): boolean {
    return this.isLoaded && this.instance !== null;
  }

  public init(sampleRate: number, refLevelDb: number, peakTrim: number): void {
    if (this.initDspFn) {
      this.initDspFn(sampleRate, refLevelDb, peakTrim);
    }
  }

  public setRefLevel(refLevelDb: number, isDigital: boolean = false): void {
    if (this.setRefLevelFn) {
      this.setRefLevelFn(refLevelDb, isDigital ? 1 : 0);
    }
  }

  public setCalGain(gain: number): void {
    if (this.setCalGainFn) {
      this.setCalGainFn(gain);
    }
  }

  public setPeakTrim(trimDb: number): void {
    if (this.setPeakTrimFn) {
      this.setPeakTrimFn(trimDb);
    }
  }

  public setPpmType(type: number): void {
    if (this.setPpmTypeFn) {
      this.setPpmTypeFn(type);
    }
  }

  public setVuBallistics(f0: number, zeta: number): void {
    if (this.setVuBallisticsFn) {
      this.setVuBallisticsFn(f0, zeta);
    }
  }

  public resetLoudness(): void {
    if (this.resetLoudnessFn) {
      this.resetLoudnessFn();
    }
  }

  public process(inputL: Float32Array, inputR: Float32Array, result: WasmDspResult): boolean {
    if (!this.ready || !this.memory || !this.processBlockFn) return false;

    const len = Math.min(inputL.length, 4096);
    const memBuffer = this.memory.buffer;

    // Direct memory copy into WASM linear memory
    const wasmInL = new Float32Array(memBuffer, this.inputLOffset, len);
    const wasmInR = new Float32Array(memBuffer, this.inputROffset, len);

    wasmInL.set(inputL.subarray(0, len));
    wasmInR.set(inputR.subarray(0, len));

    // Execute compiled machine code loop
    this.processBlockFn(len);

    // Read back 20 output floats
    const wasmOut = new Float32Array(memBuffer, this.outputOffset, 20);

    result.vuL = wasmOut[0] ?? 0;
    result.vuR = wasmOut[1] ?? 0;
    result.ppmDbL = wasmOut[2] ?? -120;
    result.ppmDbR = wasmOut[3] ?? -120;
    result.ppmFracL = wasmOut[4] ?? 0;
    result.ppmFracR = wasmOut[5] ?? 0;
    result.dbfsA = wasmOut[6] ?? -120;
    result.dbfsB = wasmOut[7] ?? -120;
    result.dbfsSum = wasmOut[8] ?? -120;
    result.dbfsDiff = wasmOut[9] ?? -120;
    result.lufsM = wasmOut[10] ?? -70;
    result.lufsS = wasmOut[11] ?? -70;
    result.phaseCorr = wasmOut[12] ?? 1.0;
    result.hasAudio = (wasmOut[13] ?? 0) > 0.5;
    result.peakA = (wasmOut[14] ?? 0) > 0.5;
    result.peakB = (wasmOut[15] ?? 0) > 0.5;
    result.lufsML = wasmOut[16] ?? -70;
    result.lufsMR = wasmOut[17] ?? -70;
    result.blockEnergy = wasmOut[18] ?? 0;

    return true;
  }
}
