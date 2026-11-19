/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
// Ward-Beck Systems XTM-4 — High-Performance WebAssembly Audio DSP Engine
// Strict AssemblyScript / WebAssembly compiled binary
//
// Entry point: re-exports the public WASM interface. Order is significant —
// it fixes the export order of the generated module and bindings.
//
//   core/      buffers, engine state, calibration, initDsp, processBlock
//   vu/        VU ballistics (ANSI C16.5 biquad needle model)
//   ppm/       quasi-peak PPM ballistics; ppm/standards/ = one file per PPM type
//   loudness/  BS.1770 K-weighting (kweighting/) and LUFS integration
//   phase/     stereo phase correlation

export { inputBufferL, inputBufferR, outputTelemetry } from "./core/buffers";
export { setPpmType } from "./ppm/setPpmType";
export { setVuBallistics } from "./vu/setVuBallistics";
export { resetLoudness } from "./loudness/resetLoudness";
export { initDsp } from "./core/initDsp";
export { setCalGain } from "./core/setCalGain";
export { setRefLevel } from "./core/setRefLevel";
export { setPeakTrim } from "./core/setPeakTrim";
export { processBlock } from "./core/processBlock";
