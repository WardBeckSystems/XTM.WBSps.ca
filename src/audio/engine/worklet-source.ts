/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Inline AudioWorklet processor used when meter-processor.js cannot be loaded.
 * Posts each 128-sample render quantum to the main thread (lowest meter latency).
 */

export const INLINE_WORKLET_CODE = `class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=128;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`;

export const WORKLET_PROCESSOR_NAME = 'wbs-meter-processor';

/** Candidate module URLs tried in order before falling back to the inline blob. */
export const WORKLET_MODULE_URLS = ['./meter-processor.js', 'meter-processor.js', 'js/meter-processor.js'];
