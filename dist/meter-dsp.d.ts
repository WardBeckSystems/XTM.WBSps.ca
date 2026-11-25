/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /** assembly/core/buffers/inputBufferL */
  export const inputBufferL: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /** assembly/core/buffers/inputBufferR */
  export const inputBufferR: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /** assembly/core/buffers/outputTelemetry */
  export const outputTelemetry: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /**
   * assembly/ppm/setPpmType/setPpmType
   * @param type `i32`
   */
  export function setPpmType(type: number): void;
  /**
   * assembly/vu/setVuBallistics/setVuBallistics
   * @param f0 `f64`
   * @param zeta `f64`
   */
  export function setVuBallistics(f0: number, zeta: number): void;
  /**
   * assembly/loudness/resetLoudness/resetLoudness
   */
  export function resetLoudness(): void;
  /**
   * assembly/core/initDsp/initDsp
   * @param sr `f64`
   * @param refLevelDb `f64`
   * @param peakTrim `f64`
   */
  export function initDsp(sr: number, refLevelDb: number, peakTrim: number): void;
  /**
   * assembly/core/setCalGain/setCalGain
   * @param gain `f64`
   */
  export function setCalGain(gain: number): void;
  /**
   * assembly/core/setRefLevel/setRefLevel
   * @param refLevelDb `f64`
   * @param isDigital `i32`
   */
  export function setRefLevel(refLevelDb: number, isDigital: number): void;
  /**
   * assembly/core/setPeakTrim/setPeakTrim
   * @param trimDb `f64`
   */
  export function setPeakTrim(trimDb: number): void;
  /**
   * assembly/core/processBlock/processBlock
   * @param len `i32`
   */
  export function processBlock(len: number): void;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
}): Promise<typeof __AdaptedExports>;
