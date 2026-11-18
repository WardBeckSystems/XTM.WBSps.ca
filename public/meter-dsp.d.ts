declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /** assembly/index/inputBufferL */
  export const inputBufferL: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /** assembly/index/inputBufferR */
  export const inputBufferR: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /** assembly/index/outputTelemetry */
  export const outputTelemetry: {
    /** @type `~lib/staticarray/StaticArray<f32>` */
    get value(): ArrayLike<number>
  };
  /**
   * assembly/index/setPpmType
   * @param type `i32`
   */
  export function setPpmType(type: number): void;
  /**
   * assembly/index/setVuBallistics
   * @param f0 `f64`
   * @param zeta `f64`
   */
  export function setVuBallistics(f0: number, zeta: number): void;
  /**
   * assembly/index/resetLoudness
   */
  export function resetLoudness(): void;
  /**
   * assembly/index/initDsp
   * @param sr `f64`
   * @param refLevelDb `f64`
   * @param peakTrim `f64`
   */
  export function initDsp(sr: number, refLevelDb: number, peakTrim: number): void;
  /**
   * assembly/index/setCalGain
   * @param gain `f64`
   */
  export function setCalGain(gain: number): void;
  /**
   * assembly/index/setRefLevel
   * @param refLevelDb `f64`
   * @param isDigital `i32`
   */
  export function setRefLevel(refLevelDb: number, isDigital: number): void;
  /**
   * assembly/index/setPeakTrim
   * @param trimDb `f64`
   */
  export function setPeakTrim(trimDb: number): void;
  /**
   * assembly/index/processBlock
   * @param len `i32`
   */
  export function processBlock(len: number): void;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
}): Promise<typeof __AdaptedExports>;
