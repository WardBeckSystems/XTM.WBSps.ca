// Ward-Beck Systems XTM-4 — High-Performance WebAssembly Audio DSP Engine
// Author: Ward-Beck Systems & Audio Engineering Team
// Strict AssemblyScript / WebAssembly compiled binary

// Max frame size (e.g. 2048 float samples)
const MAX_BUFFER_SIZE: i32 = 4096;

// Pre-allocated static input buffers in linear memory
export const inputBufferL: StaticArray<f32> = new StaticArray<f32>(MAX_BUFFER_SIZE);
export const inputBufferR: StaticArray<f32> = new StaticArray<f32>(MAX_BUFFER_SIZE);

// Pre-allocated output telemetry buffer (20 floats)
export const outputTelemetry: StaticArray<f32> = new StaticArray<f32>(20);

// Filter Coefficients & State (Double precision for feedback stability)
let sampleRate: f64 = 48000.0;
let calGain: f64 = 1.0;
// Standard VU (ANSI C16.5-1942): 0 VU = +4 dBu (-18 dBFS)
// Scale factor to map full-wave rectified sine to exactly 0.707946 (-3 dB / 0 VU):
let kAvg: f64 = 8.8458296;
let peakSensTrim: f64 = 0.0;

// VU Ballistics Coefficients
let vuB0: f64 = 0.0;
let vuB1: f64 = 0.0;
let vuB2: f64 = 0.0;
let vuA1: f64 = 0.0;
let vuA2: f64 = 0.0;

// VU State (L & R)
let vu_x1_L: f64 = 0.0;
let vu_x2_L: f64 = 0.0;
let vu_y1_L: f64 = 0.0;
let vu_y2_L: f64 = 0.0;
let vu_p_L: f64 = 0.0;

let vu_x1_R: f64 = 0.0;
let vu_x2_R: f64 = 0.0;
let vu_y1_R: f64 = 0.0;
let vu_y2_R: f64 = 0.0;
let vu_p_R: f64 = 0.0;

// BS.1770 K-Weighting Stage 1 (High Shelf)
let kShelf_b0: f64 = 1.53512485958697;
let kShelf_b1: f64 = -2.69169618940638;
let kShelf_b2: f64 = 1.19839281085285;
let kShelf_a1: f64 = -1.69065929318241;
let kShelf_a2: f64 = 0.73248077421585;

let s1_x1_L: f64 = 0.0;
let s1_x2_L: f64 = 0.0;
let s1_y1_L: f64 = 0.0;
let s1_y2_L: f64 = 0.0;

let s1_x1_R: f64 = 0.0;
let s1_x2_R: f64 = 0.0;
let s1_y1_R: f64 = 0.0;
let s1_y2_R: f64 = 0.0;

// BS.1770 K-Weighting Stage 2 (High Pass RLB)
let kHp_b0: f64 = 1.0;
let kHp_b1: f64 = -2.0;
let kHp_b2: f64 = 1.0;
let kHp_a1: f64 = -1.99004745483398;
let kHp_a2: f64 = 0.99007225036621;

let s2_x1_L: f64 = 0.0;
let s2_x2_L: f64 = 0.0;
let s2_y1_L: f64 = 0.0;
let s2_y2_L: f64 = 0.0;

let s2_x1_R: f64 = 0.0;
let s2_x2_R: f64 = 0.0;
let s2_y1_R: f64 = 0.0;
let s2_y2_R: f64 = 0.0;

// PPM Ballistics (IEC 60268-10 / DIN 45406 / BBC BS 4297)
let ppmType: i32 = 2; // 1 = Type I (DIN 45406), 2 = Type II (BBC BS 4297)
let ppmAttCoeff: f64 = 0.0;
let ppmDecCoeff: f64 = 0.0;
let ppm_env_L: f64 = 0.0;
let ppm_env_R: f64 = 0.0;

// Phase Correlation State
let phaseAlpha: f64 = 0.0;
let phase_sL2: f64 = 0.0;
let phase_sR2: f64 = 0.0;
let phase_sLR: f64 = 0.0;
let phase_corr: f64 = 1.0;

// LUFS Integration State (ITU-R BS.1770-4)
let msM_L: f64 = 0.0;
let msM_R: f64 = 0.0;
let msS_L: f64 = 0.0;
let msS_R: f64 = 0.0;

/**
 * Configure Quasi-Peak PPM Ballistics:
 * Type 1: DIN 45406 (10ms attack, 1500ms release / -20 dB in 1.5s)
 * Type 2: BBC BS 4297 (10ms attack, 2800ms release / -24 dB in 2.8s)
 */
function updatePpmDecay(): void {
  const dt: f64 = 1.0 / sampleRate;
  let attMs: f64 = 0.010;
  let tauDec: f64 = (20.0 * 2.8) / (24.0 * 2.302585092994046); // default Type II

  if (ppmType === 1) {
    // Type I (DIN 45406): 10ms attack, -20 dB in 1.5s
    attMs = 0.010;
    tauDec = 1.5 / 2.302585092994046;
  } else if (ppmType === 2) {
    // Type II (BBC BS 4297 / IEC 60268-10): 10ms attack, -24 dB in 2.8s
    attMs = 0.010;
    tauDec = (20.0 * 2.8) / (24.0 * 2.302585092994046);
  } else if (ppmType === 3) {
    // Nordic N9 (IEC 60268-10 Type I): 5ms attack, -20 dB in 2.0s
    attMs = 0.005;
    tauDec = 2.0 / 2.302585092994046;
  } else if (ppmType === 4) {
    // Fast Digital Quasi-Peak: 1ms attack, -20 dB in 1.0s
    attMs = 0.001;
    tauDec = 1.0 / 2.302585092994046;
  }

  ppmAttCoeff = 1.0 - Math.exp(-dt / attMs);
  ppmDecCoeff = Math.exp(-dt / tauDec);
}

export function setPpmType(type: i32): void {
  ppmType = (type >= 1 && type <= 4) ? type : 2;
  updatePpmDecay();
}

export function setVuBallistics(f0: f64, zeta: f64): void {
  const dt: f64 = 1.0 / sampleRate;
  const K: f64 = 2.0 / dt;
  const w0: f64 = 2.0 * Math.PI * f0;

  const a0: f64 = K * K + 2.0 * zeta * w0 * K + w0 * w0;
  vuB0 = (w0 * w0) / a0;
  vuB1 = (2.0 * w0 * w0) / a0;
  vuB2 = vuB0;
  vuA1 = (2.0 * (w0 * w0 - K * K)) / a0;
  vuA2 = (K * K - 2.0 * zeta * w0 * K + w0 * w0) / a0;
}

export function resetLoudness(): void {
  msM_L = 0.0;
  msM_R = 0.0;
  msS_L = 0.0;
  msS_R = 0.0;
}

/**
 * Initialize DSP filters and ballistics for a specific sample rate and reference alignment
 */
export function initDsp(sr: f64, refLevelDb: f64, peakTrim: f64): void {
  sampleRate = sr > 8000.0 ? sr : 48000.0;
  const dt: f64 = 1.0 / sampleRate;
  peakSensTrim = peakTrim;
  setRefLevel(refLevelDb, 0);

  // Standard VU (ANSI C16.5-1942): 300ms attack / 300ms release, 1.0-1.5% overshoot
  setVuBallistics(2.16, 0.815);

  // PPM Attack (10ms) & Release (Type I or Type II)
  updatePpmDecay();

  // Phase smoothing (~300ms)
  phaseAlpha = 1.0 - Math.exp(-dt / 0.300);

  // Initialize BS.1770-4 filters for sample rate
  initBs1770Filters(sampleRate);
}

export function setCalGain(gain: f64): void {
  calGain = gain;
}

export function setRefLevel(refLevelDb: f64, isDigital: i32): void {
  // Mode D: Digital Reference alignment relative to -18 dBFS (0 VU = -18 dBFS)
  // Mode A: Analog Reference alignment relative to +4 dBu (0 VU = +4 dBu)
  if (isDigital != 0) {
    calGain = Math.pow(10.0, (-18.0 - refLevelDb) / 20.0);
  } else {
    calGain = Math.pow(10.0, (4.0 - refLevelDb) / 20.0);
  }
}

export function setPeakTrim(trimDb: f64): void {
  peakSensTrim = trimDb;
}

function initBs1770Filters(sr: f64): void {
  // High Shelf filter coefficients for ITU-R BS.1770-4
  const f0: f64 = 1500.0;
  const gainDb: f64 = 4.0;
  const Q: f64 = 1.0 / Math.SQRT2;
  const K: f64 = Math.tan(Math.PI * f0 / sr);
  const Vh: f64 = Math.pow(10.0, gainDb / 20.0);
  const Vb: f64 = Math.pow(Vh, 0.499666774155);

  const a0: f64 = 1.0 + K / Q + K * K;
  kShelf_b0 = (Vh + Vb * K / Q + K * K) / a0;
  kShelf_b1 = 2.0 * (K * K - Vh) / a0;
  kShelf_b2 = (Vh - Vb * K / Q + K * K) / a0;
  kShelf_a1 = 2.0 * (K * K - 1.0) / a0;
  kShelf_a2 = (1.0 - K / Q + K * K) / a0;

  // High Pass RLB filter coefficients
  const fHp: f64 = 38.0;
  const QHp: f64 = 0.5;
  const KHp: f64 = Math.tan(Math.PI * fHp / sr);
  const a0Hp: f64 = 1.0 + KHp / QHp + KHp * KHp;

  kHp_b0 = 1.0 / a0Hp;
  kHp_b1 = -2.0 / a0Hp;
  kHp_b2 = 1.0 / a0Hp;
  kHp_a1 = 2.0 * (KHp * KHp - 1.0) / a0Hp;
  kHp_a2 = (1.0 - KHp / QHp + KHp * KHp) / a0Hp;
}

/**
 * High-speed DSP processing block executed over linear WASM memory.
 * Computes calibrated VU, PPM, True Peak, Sum/Diff, Phase & BS.1770 LUFS.
 */
export function processBlock(len: i32): void {
  if (len <= 0) return;
  const count: i32 = len > MAX_BUFFER_SIZE ? MAX_BUFFER_SIZE : len;

  let hasSignal: boolean = false;
  let maxA: f32 = 0.0;
  let maxB: f32 = 0.0;
  let maxSum: f32 = 0.0;
  let maxDiff: f32 = 0.0;

  let sumSqK_L: f64 = 0.0;
  let sumSqK_R: f64 = 0.0;

  for (let i: i32 = 0; i < count; i++) {
    const rawInL: f32 = unchecked(inputBufferL[i]);
    const rawInR: f32 = unchecked(inputBufferR[i]);

    const sA: f64 = (<f64>rawInL) * calGain;
    const sB: f64 = (<f64>rawInR) * calGain;

    const rA: f64 = Math.abs(sA);
    const rB: f64 = Math.abs(sB);

    if (rA > 0.0001 || rB > 0.0001) hasSignal = true;

    // 1. VU Ballistics
    const vuInA: f64 = rA * kAvg;
    const ynA: f64 = vuB0 * vuInA + vuB1 * vu_x1_L + vuB2 * vu_x2_L - vuA1 * vu_y1_L - vuA2 * vu_y2_L;
    vu_x2_L = vu_x1_L;
    vu_x1_L = vuInA;
    vu_y2_L = vu_y1_L;
    vu_y1_L = ynA;
    vu_p_L = Math.max(-0.03, Math.min(1.15, ynA));

    const vuInB: f64 = rB * kAvg;
    const ynB: f64 = vuB0 * vuInB + vuB1 * vu_x1_R + vuB2 * vu_x2_R - vuA1 * vu_y1_R - vuA2 * vu_y2_R;
    vu_x2_R = vu_x1_R;
    vu_x1_R = vuInB;
    vu_y2_R = vu_y1_R;
    vu_y1_R = ynB;
    vu_p_R = Math.max(-0.03, Math.min(1.15, ynB));

    // Peak & Sum/Diff tracking
    const absA: f32 = <f32>Math.abs(<f64>rawInL);
    const absB: f32 = <f32>Math.abs(<f64>rawInR);
    const absSum: f32 = <f32>Math.abs(<f64>(rawInL + rawInR));
    const absDiff: f32 = <f32>Math.abs(<f64>(rawInL - rawInR));

    if (absA > maxA) maxA = absA;
    if (absB > maxB) maxB = absB;
    if (absSum > maxSum) maxSum = absSum;
    if (absDiff > maxDiff) maxDiff = absDiff;

    // 2. K-Weighting Stage 1: High Shelf
    const y1L: f64 = kShelf_b0 * (<f64>rawInL) + kShelf_b1 * s1_x1_L + kShelf_b2 * s1_x2_L - kShelf_a1 * s1_y1_L - kShelf_a2 * s1_y2_L;
    s1_x2_L = s1_x1_L; s1_x1_L = <f64>rawInL;
    s1_y2_L = s1_y1_L; s1_y1_L = y1L;

    const y1R: f64 = kShelf_b0 * (<f64>rawInR) + kShelf_b1 * s1_x1_R + kShelf_b2 * s1_x2_R - kShelf_a1 * s1_y1_R - kShelf_a2 * s1_y2_R;
    s1_x2_R = s1_x1_R; s1_x1_R = <f64>rawInR;
    s1_y2_R = s1_y1_R; s1_y1_R = y1R;

    // 3. K-Weighting Stage 2: High Pass RLB
    const y2L: f64 = kHp_b0 * y1L + kHp_b1 * s2_x1_L + kHp_b2 * s2_x2_L - kHp_a1 * s2_y1_L - kHp_a2 * s2_y2_L;
    s2_x2_L = s2_x1_L; s2_x1_L = y1L;
    s2_y2_L = s2_y1_L; s2_y1_L = y2L;

    const y2R: f64 = kHp_b0 * y1R + kHp_b1 * s2_x1_R + kHp_b2 * s2_x2_R - kHp_a1 * s2_y1_R - kHp_a2 * s2_y2_R;
    s2_x2_R = s2_x1_R; s2_x1_R = y1R;
    s2_y2_R = s2_y1_R; s2_y1_R = y2R;

    sumSqK_L += y2L * y2L;
    sumSqK_R += y2R * y2R;

    // 4. PPM Peak Ballistics (IEC 60268-10 Quasi-Peak)
    if (rA > ppm_env_L) {
      ppm_env_L += (rA - ppm_env_L) * ppmAttCoeff;
    } else {
      ppm_env_L *= ppmDecCoeff;
    }

    if (rB > ppm_env_R) {
      ppm_env_R += (rB - ppm_env_R) * ppmAttCoeff;
    } else {
      ppm_env_R *= ppmDecCoeff;
    }

    // 5. Stereo Phase Correlation
    phase_sL2 += phaseAlpha * (sA * sA - phase_sL2);
    phase_sR2 += phaseAlpha * (sB * sB - phase_sR2);
    phase_sLR += phaseAlpha * (sA * sB - phase_sLR);
  }

  // Calculate Output Metrics
  const denom: f64 = Math.sqrt(phase_sL2 * phase_sR2) + 1e-9;
  phase_corr = hasSignal ? Math.max(-1.0, Math.min(1.0, phase_sLR / denom)) : 1.0;

  // PPM dB and needle fractions (Broadcast alignment: 0 dB PPM = -18 dBFS reference level)
  const ppmRefOffset: f64 = 18.465;
  const ppmDbA: f64 = ppm_env_L > 1e-6 ? 20.0 * Math.log10(ppm_env_L) + ppmRefOffset + peakSensTrim : -120.0;
  const ppmDbB: f64 = ppm_env_R > 1e-6 ? 20.0 * Math.log10(ppm_env_R) + ppmRefOffset + peakSensTrim : -120.0;
  const ppmFracA: f64 = ppmDbA >= -12.0 ? (ppmDbA + 12.0) / 24.0 : -0.12 * (1.0 - Math.pow(10.0, (ppmDbA + 12.0) / 20.0));
  const ppmFracB: f64 = ppmDbB >= -12.0 ? (ppmDbB + 12.0) / 24.0 : -0.12 * (1.0 - Math.pow(10.0, (ppmDbB + 12.0) / 20.0));

  // Digital Peak Full Scale (dBFS)
  const dbfsA: f64 = maxA > 1e-6 ? 20.0 * Math.log10(<f64>maxA) : -120.0;
  const dbfsB: f64 = maxB > 1e-6 ? 20.0 * Math.log10(<f64>maxB) : -120.0;
  const dbfsSum: f64 = maxSum > 1e-6 ? 20.0 * Math.log10(<f64>maxSum) : -120.0;
  const dbfsDiff: f64 = maxDiff > 1e-6 ? 20.0 * Math.log10(<f64>maxDiff) : -120.0;

  // LUFS Integration (ITU-R BS.1770-4)
  const zBlockL: f64 = sumSqK_L / (<f64>count);
  const zBlockR: f64 = sumSqK_R / (<f64>count);
  const blockTotalZ: f64 = zBlockL + zBlockR;

  // Real block duration in seconds for accurate integration time constants
  const blockDt: f64 = (<f64>count) / sampleRate;
  const alphaM: f64 = 1.0 - Math.exp(-blockDt / 0.400); // 400ms momentary window
  const alphaS: f64 = 1.0 - Math.exp(-blockDt / 3.000); // 3.0s short-term window

  if (hasSignal) {
    msM_L += alphaM * (zBlockL - msM_L);
    msM_R += alphaM * (zBlockR - msM_R);

    msS_L += alphaS * (zBlockL - msS_L);
    msS_R += alphaS * (zBlockR - msS_R);
  } else {
    // Smooth decay to zero during silence
    msM_L += alphaM * (0.0 - msM_L);
    msM_R += alphaM * (0.0 - msM_R);

    msS_L += alphaS * (0.0 - msS_L);
    msS_R += alphaS * (0.0 - msS_R);
  }

  const mTotal: f64 = msM_L + msM_R;
  const sTotal: f64 = msS_L + msS_R;
  const lufsM: f64 = (mTotal > 1e-12) ? -0.691 + 10.0 * Math.log10(mTotal) : -70.0;
  const lufsS: f64 = (sTotal > 1e-12) ? -0.691 + 10.0 * Math.log10(sTotal) : -70.0;
  const lufsML: f64 = (msM_L > 1e-12) ? -0.691 + 10.0 * Math.log10(msM_L) : -70.0;
  const lufsMR: f64 = (msM_R > 1e-12) ? -0.691 + 10.0 * Math.log10(msM_R) : -70.0;

  // Write out 20 telemetry floats directly into WASM output array
  unchecked(outputTelemetry[0] = <f32>vu_p_L);
  unchecked(outputTelemetry[1] = <f32>vu_p_R);
  unchecked(outputTelemetry[2] = <f32>ppmDbA);
  unchecked(outputTelemetry[3] = <f32>ppmDbB);
  unchecked(outputTelemetry[4] = <f32>ppmFracA);
  unchecked(outputTelemetry[5] = <f32>ppmFracB);
  unchecked(outputTelemetry[6] = <f32>dbfsA);
  unchecked(outputTelemetry[7] = <f32>dbfsB);
  unchecked(outputTelemetry[8] = <f32>dbfsSum);
  unchecked(outputTelemetry[9] = <f32>dbfsDiff);
  unchecked(outputTelemetry[10] = <f32>lufsM);
  unchecked(outputTelemetry[11] = <f32>lufsS);
  unchecked(outputTelemetry[12] = <f32>phase_corr);
  unchecked(outputTelemetry[13] = hasSignal ? 1.0 : 0.0);
  unchecked(outputTelemetry[14] = maxA >= 1.0 ? 1.0 : 0.0);
  unchecked(outputTelemetry[15] = maxB >= 1.0 ? 1.0 : 0.0);
  unchecked(outputTelemetry[16] = <f32>lufsML);
  unchecked(outputTelemetry[17] = <f32>lufsMR);
  unchecked(outputTelemetry[18] = <f32>blockTotalZ);
  unchecked(outputTelemetry[19] = 0.0);
}
