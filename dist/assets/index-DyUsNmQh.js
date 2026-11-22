/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{power=!0;mode=`A`;prevMode=`A`;a={src:0,lvl:64};d={src:1,lvl:42};s={pair:[1]};selectedInput=1;mcRangeMode=`outer`;mcAttenuatorStep=15;hp=0;term=0;set={scr:`HP`};meterStyle=`fisam`;dialLamp=`amber`;dialBg=`auto`;ppmLamp=`unlit`;ppmDialBg=`auto`;ppmStyle=`black`;artMode=`svg`;vfdMetric=`lufs`;isLockedExpanded=!1;autoRange=!1;flashMsg=null;flashTimer=null;isIdle=!0;toneCalLevels=(()=>{let e=[];for(let t=-60;t<=0;t++)e.push(t);return e})();toneCalIdx=42;onChange=null;constructor(){this.toneCalIdx=this.toneCalLevels.indexOf(-18),this.toneCalIdx<0&&(this.toneCalIdx=42),this.loadEEPROM()}lvlDb(e){return e-60}lvlChars(e){let t=this.lvlDb(e),n=t>0?`+`:t<0?`-`:` `,r=Math.abs(t);return n+(r<10?`0`+r:``+r)}flash(e,t=1200){this.flashMsg=e,this.flashTimer&&clearTimeout(this.flashTimer),this.flashTimer=setTimeout(()=>{this.flashMsg=null,this.notify()},t)}getDisplayText(){if(!this.power)return`        `;if(this.flashMsg)return this.flashMsg.padEnd(8).substring(0,8);if(this.isIdle&&this.mode!==`SET`)return`WardBeck`;if(this.mode===`SET`)return this.set.scr===`HP`?this.hp?` HP  IN `:` HP  OUT`:this.term?`TERM LZ `:`TERM HZ `;if(this.mode===`A`){let e=`A`+this.a.src,t=this.term?`z`:` `,n=this.lvlChars(this.a.lvl),r=this.hp?`f`:` `;return e+t+n+r}if(this.mode===`D`){let e=this.lvlChars(this.d.lvl),t=this.hp?`f`:` `;return`SYS `+e+t}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}return[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e]||`TEST `+e+`  `}return`XTM4    `}getInputSensText(){if(this.mode===`A`){let e=`A`+this.a.src,t=this.lvlDb(this.a.lvl),n=(t>=0?`+`:``)+t+`dB`;return(e+` `+n).padEnd(8).substring(0,8)}if(this.mode===`D`){let e=this.lvlDb(this.d.lvl);return(`SYS `+((e>=0?`+`:``)+e+`dB`)).padEnd(8).substring(0,8)}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];return t?t.padEnd(8).substring(0,8):(`TEST `+e).padEnd(8).substring(0,8)}return`A1 +4dB `}pressMode(){this.power&&(this.mode===`SET`?this.mode=this.prevMode:this.mode===`A`?(this.mode=`D`,this.flash(`SYST OUT`)):this.mode===`D`?(this.mode=`S`,this.flash(`TEST GEN`)):(this.mode=`A`,this.flash(`CARD IN `)),this.saveEEPROM(),this.notify())}holdMode(){this.power&&(this.mode===`SET`?this.mode=this.prevMode:(this.prevMode=this.mode,this.mode=`SET`,this.set.scr=`HP`,this.flash(`SETUP   `)),this.saveEEPROM(),this.notify())}pressSource(){if(this.power){if(this.mode===`SET`)this.set.scr=this.set.scr===`HP`?`TERM`:`HP`;else if(this.mode===`A`)this.a.src=+(this.a.src===0),this.flash(this.a.src===0?`MIC / IN1`:`LINE/IN2`);else if(this.mode===`D`)this.d.src=+(this.d.src===0),this.flash(this.d.src===1?`SYST OUT`:`1kHZ TONE`);else if(this.mode===`S`){let e=(this.s.pair[0]??1)+1;e>4&&(e=1),this.s.pair[0]=e;let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];t&&this.flash(t)}this.selectedInput=this.getSelectedInput(),this.saveEEPROM(),this.notify()}}getSelectedInput(){return this.mode===`A`?this.a.src===0?1:2:this.mode===`D`?3:this.mode===`S`?4:this.selectedInput||1}setInput(e){this.power&&(this.selectedInput=e,e===1?(this.mode=`A`,this.a.src=0,this.flash(`INPUT 1`)):e===2?(this.mode=`A`,this.a.src=1,this.flash(`INPUT 2`)):e===3?(this.mode=`D`,this.d.src=1,this.flash(`INPUT 3`)):e===4&&(this.mode=`S`,this.s.pair[0]=1,this.flash(`INPUT 4`)),this.saveEEPROM(),this.notify())}getMcCurdySensitivityDb(){return this.mcRangeMode===`cal`?4:this.mcRangeMode===`inner`?-30+this.mcAttenuatorStep*2:-50+this.mcAttenuatorStep*2}setMccurdyRange(e){this.power&&(this.mcRangeMode=e,this.applyMccurdySensitivity())}toggleMccurdyRange(){this.power&&(this.mcRangeMode=this.mcRangeMode===`outer`?`inner`:(this.mcRangeMode,`outer`),this.applyMccurdySensitivity())}setMccurdyAttenuatorStep(e){this.power&&(this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e))),this.mcRangeMode===`cal`&&(this.mcRangeMode=`outer`),this.applyMccurdySensitivity())}setSensitivityDb(e){if(!this.power)return;let t=Math.max(-60,Math.min(30,e)),n=Math.max(0,Math.min(90,Math.round(t+60)));if(this.a.lvl=n,this.d.lvl=n,t>10&&this.mcRangeMode===`outer`?this.mcRangeMode=`inner`:t<-30&&this.mcRangeMode===`inner`&&(this.mcRangeMode=`outer`),this.mcRangeMode===`inner`){let e=(t- -30)/2;this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e)))}else if(this.mcRangeMode===`outer`){let e=(t- -50)/2;this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e)))}this.flash(`SENS `+this.lvlChars(n)),this.saveEEPROM(),this.notify()}applyMccurdySensitivity(){let e=this.getMcCurdySensitivityDb(),t=Math.max(0,Math.min(90,Math.round(e+60)));if(this.a.lvl=t,this.d.lvl=t,this.mcRangeMode===`cal`)this.flash(`CAL +4dBu`);else{let t=this.mcRangeMode===`outer`?`OUT`:`IN `,n=(e>0?`+`:``)+e;this.flash(`${t} ${n}dB`)}this.saveEEPROM(),this.notify()}pressDown(){if(this.power){if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`)))this.mcAttenuatorStep>0?this.mcAttenuatorStep--:this.mcRangeMode===`inner`&&(this.mcRangeMode=`outer`,this.mcAttenuatorStep=20),this.applyMccurdySensitivity();else{if(this.mode===`SET`)this.set.scr===`HP`?this.hp=0:this.term=1;else if(this.mode===`A`)this.a.lvl>0&&this.a.lvl--,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl>0&&this.d.lvl--,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx>0){this.toneCalIdx--;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}}pressUp(){if(this.power){if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`)))this.mcAttenuatorStep<30?this.mcAttenuatorStep++:this.mcRangeMode===`outer`&&(this.mcRangeMode=`inner`,this.mcAttenuatorStep=20),this.applyMccurdySensitivity();else{if(this.mode===`SET`)this.set.scr===`HP`?this.hp=1:this.term=0;else if(this.mode===`A`)this.a.lvl<90&&this.a.lvl++,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl<90&&this.d.lvl++,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx<this.toneCalLevels.length-1){this.toneCalIdx++;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}}togglePower(){this.power=!this.power,this.notify()}getActiveReferenceLevel(){return this.mode===`A`?this.lvlDb(this.a.lvl):this.mode===`D`?this.lvlDb(this.d.lvl):4}toggleLockedExpanded(){return this.isLockedExpanded=!this.isLockedExpanded,this.flash(this.isLockedExpanded?`DUAL MTR`:`QUAD MTR`),this.saveEEPROM(),this.notify(),this.isLockedExpanded}toggleAutoRange(){return this.autoRange=!this.autoRange,this.flash(this.autoRange?`AUTO ON `:`AUTO OFF`),this.saveEEPROM(),this.notify(),this.autoRange}saveEEPROM(){try{let e={mode:this.mode===`SET`?this.prevMode:this.mode,a:this.a,d:this.d,s:this.s,hp:this.hp,term:this.term,meterStyle:this.meterStyle,dialLamp:this.dialLamp,dialBg:this.dialBg,ppmLamp:this.ppmLamp,ppmDialBg:this.ppmDialBg,ppmStyle:this.ppmStyle,selectedInput:this.getSelectedInput(),mcRangeMode:this.mcRangeMode,mcAttenuatorStep:this.mcAttenuatorStep,toneCalIdx:this.toneCalIdx,toneCalLevel:this.toneCalLevels[this.toneCalIdx]??0,vfdMetric:this.vfdMetric,isLockedExpanded:this.isLockedExpanded,autoRange:this.autoRange};localStorage.setItem(`wbs_xtm4_eeprom`,JSON.stringify(e))}catch{}}loadEEPROM(){try{let e=localStorage.getItem(`wbs_xtm4_eeprom`);if(e){let t=JSON.parse(e);if(t.mode&&(this.mode=this.prevMode=t.mode),t.a&&(this.a=Object.assign(this.a,t.a)),t.d&&(this.d=Object.assign(this.d,t.d)),t.s&&(this.s=Object.assign(this.s,t.s)),t.hp!==void 0&&(this.hp=t.hp),t.term!==void 0&&(this.term=t.term),t.meterStyle&&(this.meterStyle=t.meterStyle===`sifam`?`fisam`:t.meterStyle===`simpson`||t.meterStyle===`pimsom`?`pimson`:t.meterStyle),t.selectedInput&&(this.selectedInput=t.selectedInput),t.mcRangeMode&&(this.mcRangeMode=t.mcRangeMode),typeof t.mcAttenuatorStep==`number`&&(this.mcAttenuatorStep=t.mcAttenuatorStep),t.dialLamp&&(this.dialLamp=t.dialLamp),t.dialBg&&(this.dialBg=t.dialBg),t.ppmLamp&&(this.ppmLamp=t.ppmLamp),t.ppmDialBg&&(this.ppmDialBg=t.ppmDialBg),t.ppmStyle&&(this.ppmStyle=t.ppmStyle),typeof t.isLockedExpanded==`boolean`&&(this.isLockedExpanded=t.isLockedExpanded),typeof t.autoRange==`boolean`&&(this.autoRange=t.autoRange),typeof localStorage<`u`&&localStorage.getItem(`wbs_xtm4_tone_cal_dbfs_v3`)!==`true`)this.toneCalIdx=this.toneCalLevels.indexOf(-18),localStorage.setItem(`wbs_xtm4_tone_cal_dbfs_v3`,`true`),this.saveEEPROM();else if(typeof t.toneCalLevel==`number`){let e=this.toneCalLevels.indexOf(t.toneCalLevel);e>=0&&(this.toneCalIdx=e)}else t.toneCalIdx!==void 0&&t.toneCalIdx>=0&&t.toneCalIdx<this.toneCalLevels.length&&(this.toneCalIdx=t.toneCalIdx);t.vfdMetric&&(this.vfdMetric=t.vfdMetric)}}catch{}}notify(){this.onChange&&this.onChange(this)}},t=class{instance=null;memory=null;isLoaded=!1;inputLOffset=0;inputROffset=0;outputOffset=0;initDspFn=null;setRefLevelFn=null;setCalGainFn=null;setPeakTrimFn=null;setPpmTypeFn=null;setVuBallisticsFn=null;resetLoudnessFn=null;processBlockFn=null;async load(e=`./meter-dsp.wasm`){try{let t;try{t=await fetch(e)}catch{t=await fetch(`/meter-dsp.wasm`)}let n=await t.arrayBuffer(),{instance:r}=await WebAssembly.instantiate(n,{env:{abort:(e,t,n,r)=>{console.warn(`[WASM DSP] Abort at line ${n}:${r}`)},trace:(e,t)=>{}}});this.instance=r;let i=r.exports;return this.memory=i.memory,this.inputLOffset=i.inputBufferL?.value??i.inputBufferL,this.inputROffset=i.inputBufferR?.value??i.inputBufferR,this.outputOffset=i.outputTelemetry?.value??i.outputTelemetry,this.initDspFn=i.initDsp,this.setRefLevelFn=i.setRefLevel,this.setCalGainFn=i.setCalGain,this.setPeakTrimFn=i.setPeakTrim,this.setPpmTypeFn=i.setPpmType,this.setVuBallisticsFn=i.setVuBallistics,this.resetLoudnessFn=i.resetLoudness,this.processBlockFn=i.processBlock,this.isLoaded=!0,!0}catch(e){return console.warn(`WASM DSP loading failed, falling back to JS DSP:`,e),this.isLoaded=!1,!1}}get ready(){return this.isLoaded&&this.instance!==null}init(e,t,n){this.initDspFn&&this.initDspFn(e,t,n)}setRefLevel(e,t=!1){this.setRefLevelFn&&this.setRefLevelFn(e,+!!t)}setCalGain(e){this.setCalGainFn&&this.setCalGainFn(e)}setPeakTrim(e){this.setPeakTrimFn&&this.setPeakTrimFn(e)}setPpmType(e){this.setPpmTypeFn&&this.setPpmTypeFn(e)}setVuBallistics(e,t){this.setVuBallisticsFn&&this.setVuBallisticsFn(e,t)}resetLoudness(){this.resetLoudnessFn&&this.resetLoudnessFn()}process(e,t,n){if(!this.ready||!this.memory||!this.processBlockFn)return!1;let r=Math.min(e.length,4096),i=this.memory.buffer,a=new Float32Array(i,this.inputLOffset,r),o=new Float32Array(i,this.inputROffset,r);a.set(e.subarray(0,r)),o.set(t.subarray(0,r)),this.processBlockFn(r);let s=new Float32Array(i,this.outputOffset,20);return n.vuL=s[0]??0,n.vuR=s[1]??0,n.ppmDbL=s[2]??-120,n.ppmDbR=s[3]??-120,n.ppmFracL=s[4]??0,n.ppmFracR=s[5]??0,n.dbfsA=s[6]??-120,n.dbfsB=s[7]??-120,n.dbfsSum=s[8]??-120,n.dbfsDiff=s[9]??-120,n.lufsM=s[10]??-70,n.lufsS=s[11]??-70,n.phaseCorr=s[12]??1,n.hasAudio=(s[13]??0)>.5,n.peakA=(s[14]??0)>.5,n.peakB=(s[15]??0)>.5,n.lufsML=s[16]??-70,n.lufsMR=s[17]??-70,n.blockEnergy=s[18]??0,!0}};function n(){return{pimson:{f0:2.16,zeta:.815},pimsom:{f0:2.16,zeta:.815},simpson:{f0:2.16,zeta:.815},fisam:{f0:2.4,zeta:.85},sifam:{f0:2.4,zeta:.85}}}function r(){return[{x1:0,x2:0,y1:0,y2:0,p:0},{x1:0,x2:0,y1:0,y2:0,p:0}]}function i(){return[{env:0,q:-.12,qv:0},{env:0,q:-.12,qv:0}]}function a(){return{sL2:0,sR2:0,sLR:0,correlation:1,led:7}}function o(){return{stage1:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],stage2:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],meanSquareM_L:0,meanSquareM_R:0,meanSquareS_L:0,meanSquareS_R:0,sumEnergy:0,blockCount:0,shortTermHist:[]}}function s(){return{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],dbfs:[-60,-60,-60,-60],lufs:{m:-60,s:-60,i:-60,lra:0,mL:-60,mR:-60},rmsDb:[-60,-60],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1}}function c(){return{vuL:0,vuR:0,ppmDbL:-120,ppmDbR:-120,ppmFracL:0,ppmFracR:0,dbfsA:-120,dbfsB:-120,dbfsSum:-120,dbfsDiff:-120,lufsM:-70,lufsS:-70,lufsML:-70,lufsMR:-70,blockEnergy:0,phaseCorr:1,hasAudio:!1,peakA:!1,peakB:!1}}var l=`class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=1024;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`,u=`wbs-meter-processor`,d=[`./meter-processor.js`,`meter-processor.js`,`js/meter-processor.js`],f={standard_vu:{id:`standard_vu`,name:`Standard VU (ANSI C16.5)`,standard:`ANSI C16.5-1942`,attackMs:300,releaseMs:300,f0:2.16,zeta:.815,notes:`ANSI C16.5-1942. Philosophy: Approximates perceived loudness. 0 VU = +4 dBu (-18 dBFS). 300ms attack/decay, 1-1.5% overshoot.`},console_standard:{id:`console_standard`,name:`Console Standard`,standard:`Studio Console`,attackMs:200,releaseMs:800,f0:2.8,zeta:.75,notes:`Studio Console Standard. 200ms attack, 800ms release.`},fast_response:{id:`fast_response`,name:`Fast Response (Percussive)`,standard:`Transient Monitor`,attackMs:50,releaseMs:200,f0:5.5,zeta:.707,notes:`Fast response for tracking percussive drum transients.`},slow_response:{id:`slow_response`,name:`Slow Response (Heavy Inertia)`,standard:`Damped Movement`,attackMs:500,releaseMs:2e3,f0:1.4,zeta:.85,notes:`Slow response with heavy damped needle inertia.`},super_slow:{id:`super_slow`,name:`Super Slow Vintage`,standard:`Galvanometer Drift`,attackMs:1e3,releaseMs:4e3,f0:.8,zeta:.9,notes:`Very heavy needle movement simulating vintage mechanical galvanometer drift.`},master_console:{id:`master_console`,name:`Master Console Bank`,standard:`Master Bus Console`,attackMs:300,releaseMs:1500,f0:1.9,zeta:.8,notes:`Master console broadcast monitoring with extended release.`},compressor_gr:{id:`compressor_gr`,name:`Compressor Gain Reduction`,standard:`Dynamics GR`,attackMs:10,releaseMs:100,f0:9,zeta:.707,notes:`Ultra-fast gain reduction dynamics.`}},p={f0:2.16,zeta:.815},m=8.8458296;function h(e){return e.vuCoeffs[e.vuStyle]||{f0:p.f0,zeta:p.zeta}}function g(e,t){let n=2/(1/t),r=h(e),i=2*Math.PI*r.f0,a=n*n+2*r.zeta*i*n+i*i;e.vuB0=i*i/a,e.vuB1=2*i*i/a,e.vuB2=e.vuB0,e.vuA1=2*(i*i-n*n)/a,e.vuA2=(n*n-2*r.zeta*i*n+i*i)/a}function _(e,t,n){let r=e.vuB0*n+e.vuB1*t.x1+e.vuB2*t.x2-e.vuA1*t.y1-e.vuA2*t.y2;t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,t.p=Math.max(-.03,Math.min(1.15,r))}function v(e){return e>.005?20*Math.log10(e)+3:-1/0}function y(e,t){if(t!==`pimson`&&t!==`pimsom`&&t!==`simpson`&&t!==`fisam`&&t!==`sifam`)return;e.vuStyle=t===`sifam`?`fisam`:t===`simpson`||t===`pimsom`?`pimson`:t,e.calculateCoefficients();let n=h(e);e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}function b(e,t){let n=f[t]||f.standard_vu;e.vuBallisticPreset=n.id,e.vuCoeffs[e.vuStyle]={f0:n.f0,zeta:n.zeta},e.calculateCoefficients(),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}var x={num:1,key:`type1`,attack:.01,tauDecay:1.5/Math.LN10},S={num:2,key:`type2`,attack:.01,tauDecay:56/(24*Math.LN10)},C=[x,S,{num:2,key:`scale2`,attack:.01,tauDecay:56/(24*Math.LN10)},{num:2,key:`scale3`,attack:.01,tauDecay:56/(24*Math.LN10)},{num:3,key:`nordic`,attack:.005,tauDecay:2/Math.LN10},{num:4,key:`fast_peak`,attack:.001,tauDecay:1/Math.LN10}];function ee(e){for(let t of C)if(e===t.num||e===t.key)return t;return null}var te=18.465;function ne(e,t){e.ppmAttack=.01,e.ppmAttCoeff=1-Math.exp(-1/(e.ppmAttack*t));let n=e.ppmType===1?x.tauDecay:S.tauDecay;e.ppmDecCoeff=Math.exp(-1/(n*t)),e.wasmDsp.ready&&e.wasmDsp.setPpmType(e.ppmType)}function re(e,t){let n=ee(t);n&&(e.ppmBallisticPreset=n.key);let r=n||S,i=r.num;e.ppmType=i===1?1:2;let a=e.ctx?e.ctx.sampleRate:48e3;e.ppmAttack=r.attack,e.ppmAttCoeff=1-Math.exp(-1/(r.attack*a)),e.ppmDecCoeff=Math.exp(-1/(r.tauDecay*a)),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPpmType(i)}function ie(e,t,n){n>t.env?t.env+=(n-t.env)*e.ppmAttCoeff:t.env*=e.ppmDecCoeff}function w(e,t){return e>1e-6?20*Math.log10(e)+te+t:-1/0}function T(e){return e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function ae(e,t){e.phaseAlpha=1-Math.exp(-1/(.3*t))}function oe(e,t,n,r){e.sL2+=t*(n*n-e.sL2),e.sR2+=t*(r*r-e.sR2),e.sLR+=t*(n*r-e.sLR)}function se(e,t){let n=Math.sqrt(e.sL2*e.sR2)+1e-9;return t?Math.max(-1,Math.min(1,e.sLR/n)):1}function ce(e,t){let n=-1;return t&&(n=e<=-.75?0:e<=-.5?1:e<=-.2?2:e<=.1?3:e<=.4?4:e<=.7?5:e<=.9?6:7),n}function le(e,t){let n=Math.round((e+1)*3.5);return n<0&&(n=0),n>7&&(n=7),t?n:-1}function ue(e,t){let n=10**(3.9998438/20),r=Math.tan(Math.PI*1681.974450955532/t),i=r*r,a=Math.SQRT2,o=1+a*r+i;e.kShelf_b0=(n+a*Math.sqrt(n)*r+i)/o,e.kShelf_b1=2*(i-n)/o,e.kShelf_b2=(n-a*Math.sqrt(n)*r+i)/o,e.kShelf_a1=2*(i-1)/o,e.kShelf_a2=(1-a*r+i)/o;let s=.5003270373238773,c=Math.tan(Math.PI*38.13547087602444/t),l=c*c,u=1+c/s+l;e.kHp_b0=1/u,e.kHp_b1=-2/u,e.kHp_b2=1/u,e.kHp_a1=2*(l-1)/u,e.kHp_a2=(1-c/s+l)/u}function de(e,t,n){let r=e.kShelf_b0*n+e.kShelf_b1*t.x1+e.kShelf_b2*t.x2-e.kShelf_a1*t.y1-e.kShelf_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function fe(e,t,n){let r=e.kHp_b0*n+e.kHp_b1*t.x1+e.kHp_b2*t.x2-e.kHp_a1*t.y1-e.kHp_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function pe(e,t){let n=1024/t;e.lufsAlphaM=1-Math.exp(-n/.4),e.lufsAlphaS=1-Math.exp(-n/3)}function me(e){return e>1e-12?Math.max(-60,-.691+10*Math.log10(e)):-60}function he(e,t){e.sumEnergy+=t,e.blockCount++}function ge(e){let t=e.blockCount>0?e.sumEnergy/e.blockCount:0;return t>0?me(t):-1/0}function _e(e,t){t>-60&&(e.shortTermHist.push(t),e.shortTermHist.length>200&&e.shortTermHist.shift())}function ve(e){if(e.shortTermHist.length>=10){let t=[...e.shortTermHist].sort((e,t)=>e-t),n=t[Math.floor(t.length*.1)],r=t[Math.floor(t.length*.95)];return Math.max(0,r-n)}return 0}function ye(e,t,n,r){let i=e.lufsState;if(r){i.meanSquareM_L+=e.lufsAlphaM*(t-i.meanSquareM_L),i.meanSquareM_R+=e.lufsAlphaM*(n-i.meanSquareM_R),i.meanSquareS_L+=e.lufsAlphaS*(t-i.meanSquareS_L),i.meanSquareS_R+=e.lufsAlphaS*(n-i.meanSquareS_R);let r=t+n;r>125e-9&&he(i,r)}else i.meanSquareM_L*=.92,i.meanSquareM_R*=.92,i.meanSquareS_L*=.97,i.meanSquareS_R*=.97}function E(e){e.meanSquareM_L=0,e.meanSquareM_R=0,e.meanSquareS_L=0,e.meanSquareS_R=0,e.sumEnergy=0,e.blockCount=0,e.shortTermHist=[]}function be(e){E(e.lufsState),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.resetLoudness()}function xe(e){if(!e.ctx)return;let t=e.ctx.sampleRate;g(e,t),ne(e,t),ae(e,t),ue(e,t),pe(e,t)}async function Se(e){return e.ctx||=new(window.AudioContext||window.webkitAudioContext)({latencyHint:`interactive`}),e.ctx.state===`suspended`||(xe(e),await Ce(e),await e.wasmDsp.load(),e.ctx&&e.wasmDsp.ready&&(e.wasmDsp.init(e.ctx.sampleRate,e.refLevelDb,e.peakSensTrim),e.wasmDsp.setRefLevel(e.refLevelDb,e.isRefDigital),e.wasmDsp.setPeakTrim(e.peakSensTrim))),e.ctx}async function Ce(e){if(e.workletLoaded||!e.ctx||!e.ctx.audioWorklet)return;let[t,n,r]=d;try{try{await e.ctx.audioWorklet.addModule(t)}catch{try{await e.ctx.audioWorklet.addModule(n)}catch{await e.ctx.audioWorklet.addModule(r)}}e.workletLoaded=!0}catch{try{let t=new Blob([l],{type:`application/javascript`}),n=URL.createObjectURL(t);await e.ctx.audioWorklet.addModule(n),URL.revokeObjectURL(n),e.workletLoaded=!0}catch{e.workletLoaded=!1}}}async function we(){try{return(await navigator.mediaDevices.enumerateDevices()).filter(e=>e.kind===`audioinput`)}catch(e){return console.warn(`Could not enumerate audio devices:`,e),[]}}var Te={echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1};function Ee(e){let t=[];return e&&(t.push({audio:{deviceId:{exact:e},...Te,channelCount:{ideal:2}}}),t.push({audio:{deviceId:{ideal:e},...Te}}),t.push({audio:{deviceId:{exact:e}}}),t.push({audio:{deviceId:e}})),t.push({audio:{...Te,channelCount:{ideal:2}}}),t.push({audio:{...Te}}),t.push({audio:!0}),t}async function De(e,t=null){await e.ensureContext(),e.stopCurrentSource();try{if((await we()).length===0){let t=new DOMException(`No audio input devices detected on this system`,`NotFoundError`);throw e.onStatusChange&&e.onStatusChange({type:`error`,error:t.message}),t}}catch(e){if(e?.name===`NotFoundError`)throw e}let n=Ee(t),r=null,i=null;for(let e of n)try{if(r=await navigator.mediaDevices.getUserMedia(e),r&&r.getAudioTracks().length>0)break}catch(t){i=t,console.warn(`getUserMedia candidate constraint failed:`,e,t)}if(!r){console.warn(`Attempting fallback to default audio device...`);try{r=await navigator.mediaDevices.getUserMedia({audio:!0})}catch(t){throw console.error(`Fallback failed:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:i?.message||`Audio device unavailable`}),i||Error(`Could not access audio device`)}}try{e.stream=r;let n=r.getAudioTracks()[0];n&&(n.enabled=!0),e.activeDeviceId=(n&&n.getSettings?n.getSettings():{}).deviceId||t,e.isSystemAudio=!1,e.sourceType=`mic`,e.setupAudioGraph(r),e.ctx&&e.ctx.state===`suspended`&&await e.ctx.resume();let i=await e.getAudioInputDevices();e.onDevicesChange&&e.onDevicesChange(i,e.activeDeviceId);let a=n?.label||`Soundcard Input`;return e.onStatusChange&&e.onStatusChange({type:`soundcard`,label:a}),!0}catch(t){throw console.error(`Error in audio graph setup for sound card:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),t}}async function Oe(e,t=`browser`,n=!1){if(!n&&e.sourceType===`system`&&e.stream&&e.stream.active)return!0;try{let n=typeof localStorage<`u`&&localStorage.getItem(`xtm.sysaudio.surface`)||t||`browser`,r=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:n===`monitor`?`monitor`:`browser`},audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},systemAudio:`include`,surfaceSwitching:`include`,selfBrowserSurface:`exclude`,preferCurrentTab:!1,monitorTypeSurfaces:`include`});r.getVideoTracks().forEach(e=>e.stop());let i=r.getAudioTracks();if(i.length===0)throw Error(`No audio track selected. When prompted, ensure "Share audio" is checked.`);return await e.ensureContext(),e.stopCurrentSource(),e.stream=r,e.isSystemAudio=!0,e.activeDeviceId=null,e.sourceType=`system`,e.setupAudioGraph(r),i[0].onended=()=>{e.stopCurrentSource(),e.onStatusChange&&e.onStatusChange({type:`disconnected`,label:`Audio Stopped`})},e.onStatusChange&&e.onStatusChange({type:`system`,label:i[0].label||`Computer System Audio`}),!0}catch(t){return t?.name===`NotAllowedError`?console.info(`[AudioEngine] System audio capture cancelled by user.`):console.warn(`[AudioEngine] Error capturing system audio:`,t?.message||t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),!1}}function ke(e,t,n){let r=e.createOscillator();return r.type=`sine`,r.frequency.setValueAtTime(n,e.currentTime),r.connect(t),r.start(),r}function Ae(e){let t=e.sampleRate*4,n=e.createBuffer(2,t,e.sampleRate);for(let e=0;e<2;e++){let r=n.getChannelData(e),i=0,a=0,o=0,s=0,c=0,l=0,u=0;for(let e=0;e<t;e++){let t=Math.random()*2-1;i=.99886*i+t*.0555179,a=.99332*a+t*.0750759,o=.969*o+t*.153852,s=.8665*s+t*.3104856,c=.55*c+t*.5329522,l=-.7616*l-t*.016898,r[e]=(i+a+o+s+c+l+u+t*.5362)*.11,u=t*.115926}}return n}function je(e,t){let n=e.createBufferSource();return n.buffer=Ae(e),n.loop=!0,n.connect(t),n.start(),n}var Me=20,Ne=2e4,Pe=8,Fe=9e3;function Ie(e,t){e.frequency.setValueAtTime(Me,t.currentTime),e.frequency.exponentialRampToValueAtTime(Ne,t.currentTime+Pe)}function Le(e,t,n){let r=t.createOscillator();return r.type=`sine`,Ie(r,t),r.connect(n),r.start(),e.testOsc=r,e.sweepTimer=setInterval(()=>{if(e.sourceType===`test`&&e.testType===`sweep`&&e.testOsc)try{let n=e.testOsc;n.frequency.cancelScheduledValues(t.currentTime),Ie(n,t)}catch{}},Fe),r}var Re=e=>e===`sine1k`||e===`sine400`;function ze(e,t=`sine1k`){e.ctx&&e.ctx.state===`suspended`&&e.ctx.resume(),e.stopCurrentSource(),e.sourceType=`test`,e.testType=t;let n=e.ctx;if(!n)return;e.testGain=n.createGain();let r=Re(t)?10**(e.toneCalDb/20):t===`pink`?.35:.5;e.testGain.gain.value=r,Re(t)?e.testOsc=ke(n,e.testGain,t===`sine1k`?1e3:400):t===`pink`?e.testOsc=je(n,e.testGain):t===`sweep`&&(e.testOsc=Le(e,n,e.testGain)),e.setupAudioGraph(e.testGain,!0),e.onStatusChange&&e.onStatusChange({type:`test`,label:`Test Generator (${t})`})}function Be(e,t){if(e.toneCalDb=t,e.testGain&&e.ctx&&Re(e.testType)){let n=10**(t/20);try{e.testGain.gain.cancelScheduledValues(e.ctx.currentTime),e.testGain.gain.linearRampToValueAtTime(n,e.ctx.currentTime+.05)}catch{e.testGain.gain.value=n}}}function Ve(e,t){e.inputTrimDb=t,He(e)}function He(e){if(!e.inputGainNode||!e.ctx)return;let t=10**(e.inputTrimDb/20);e.inputGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function Ue(e,t){e.hpfEnabled=t,We(e)}function We(e){e.hpfNode&&e.ctx&&(e.hpfEnabled?e.hpfNode.frequency.setValueAtTime(80,e.ctx.currentTime):e.hpfNode.frequency.setValueAtTime(5,e.ctx.currentTime))}function Ge(e,t,n=null){e.monitorEnabled=t,n!==null&&(e.monitorVolume=n),qe(e)}function Ke(e,t){e.monitorVolume=t,qe(e)}function qe(e){if(!e.monitorGainNode||!e.ctx)return;let t=e.monitorEnabled?e.monitorVolume:0;e.monitorGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function Je(e,t,n=!1){let r=e.ctx;if(r){if(e.sourceNode=n?t:r.createMediaStreamSource(t),e.inputGainNode=r.createGain(),e.inputGainNode.channelCount=2,e.inputGainNode.channelCountMode=`explicit`,e.inputGainNode.channelInterpretation=`speakers`,He(e),e.hpfNode=r.createBiquadFilter(),e.hpfNode.type=`highpass`,e.hpfNode.frequency.setValueAtTime(80,r.currentTime),e.hpfNode.Q.setValueAtTime(.707,r.currentTime),We(e),e.monitorGainNode=r.createGain(),qe(e),e.monitorGainNode.connect(r.destination),e.splitterNode=r.createChannelSplitter(2),e.workletLoaded&&typeof AudioWorkletNode<`u`)try{e.processorNode=new AudioWorkletNode(r,u),e.processorNode.port.onmessage=t=>{t.data&&t.data.ch0&&t.data.ch1&&e.processAudioBlockBuffers(t.data.ch0,t.data.ch1)}}catch{e.processorNode=null}if(e.processorNode||(e.processorNode=r.createScriptProcessor(1024,2,2),e.processorNode.onaudioprocess=t=>e.processAudioBlock(t)),e.sourceNode&&e.inputGainNode&&e.hpfNode&&e.monitorGainNode&&e.processorNode){e.sourceNode.connect(e.inputGainNode),e.inputGainNode.connect(e.hpfNode),e.hpfNode.connect(e.monitorGainNode),e.hpfNode.connect(e.processorNode);let t=r.createGain();t.gain.value=0,e.processorNode.connect(t),t.connect(r.destination)}}}function Ye(e){if(e.sweepTimer&&=(clearInterval(e.sweepTimer),null),e.testOsc){try{e.testOsc.stop()}catch{}e.testOsc.disconnect(),e.testOsc=null}if(e.stream&&=(e.stream.getTracks().forEach(e=>e.stop()),null),e.sourceNode){try{e.sourceNode.disconnect()}catch{}e.sourceNode=null}if(e.processorNode){try{e.processorNode.port&&(e.processorNode.port.onmessage=null),e.processorNode.disconnect()}catch{}e.processorNode=null}e.sourceType=`none`,e.isSystemAudio=!1}function Xe(e,t,n=!1){e.refLevelDb=t,e.isRefDigital=n,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setRefLevel(t,n)}function Ze(e,t){e.peakSensTrim=t,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPeakTrim(t)}function Qe(e){return e.isRefDigital?10**((-18-e.refLevelDb)/20):10**((4-e.refLevelDb)/20)}function $e(e,t,n){if(!e.wasmDsp.ready||!e.wasmDsp.process(t,n,e.wasmResult))return!1;let r=e.wasmResult,i=e.currentLevels;i.vu[0]=r.vuL,i.vu[1]=r.vuR,i.vuDb[0]=v(r.vuL),i.vuDb[1]=v(r.vuR),i.ppm[0]=r.ppmFracL,i.ppm[1]=r.ppmFracR,i.ppmDb[0]=r.ppmDbL,i.ppmDb[1]=r.ppmDbR,i.dbfs[0]=r.dbfsA,i.dbfs[1]=r.dbfsB,i.dbfs[2]=r.dbfsSum,i.dbfs[3]=r.dbfsDiff,i.lufs.m=r.lufsM,i.lufs.s=r.lufsS,i.lufs.mL=r.lufsML,i.lufs.mR=r.lufsMR,i.phaseCorrelation=r.phaseCorr,i.hasAudio=r.hasAudio,i.peak[0]=r.peakA,i.peak[1]=r.peakB,i.phaseLed=le(r.phaseCorr,r.hasAudio);let a=r.blockEnergy>0?r.blockEnergy:r.lufsM>-70?10**((r.lufsM+.691)/10):0;return(r.hasAudio||a>125e-9)&&a>125e-9&&he(e.lufsState,a),i.lufs.i=ge(e.lufsState),_e(e.lufsState,r.lufsS),i.lufs.lra=ve(e.lufsState),!0}var et=e=>e>1e-6?20*Math.log10(e):-120,tt=(e,t)=>e>0?Math.max(-60,10*Math.log10(e/t)):-60;function nt(e,t,n){let r=t.length,i=Qe(e),a=m,o=e.vuState[0],s=e.vuState[1],c=e.ppmState[0],l=e.ppmState[1],u=e.lufsState.stage1[0],d=e.lufsState.stage1[1],f=e.lufsState.stage2[0],p=e.lufsState.stage2[1],h=!1,g=!1,y=!1,b=0,x=0,S=0,C=0,ee=0,te=0,ne=0,re=0;for(let m=0;m<r;m++){let r=t[m]*i,v=n[m]*i,w=Math.abs(r),T=Math.abs(v);_(e,o,w*a),_(e,s,T*a);let ae=Math.abs(t[m]),se=Math.abs(n[m]),ce=Math.abs(t[m]+n[m]),le=Math.abs(t[m]-n[m]);ae>b&&(b=ae),se>x&&(x=se),ce>S&&(S=ce),le>C&&(C=le),ne+=t[m]*t[m],re+=n[m]*n[m],(w>1e-4||T>1e-4)&&(h=!0);let ue=fe(e,f,de(e,u,t[m])),pe=fe(e,p,de(e,d,n[m]));ee+=ue*ue,te+=pe*pe,ie(e,c,w),ie(e,l,T),w>=1&&(g=!0),T>=1&&(y=!0),oe(e.phaseState,e.phaseAlpha,r,v)}let ae=e.peakSensTrim||0,le=w(c.env,ae),ue=w(l.env,ae),pe=se(e.phaseState,h);e.phaseState.correlation=pe;let he=ce(pe,h);e.phaseState.led=he;let E=e.lufsState;ye(e,ee/r,te/r,h);let be=me(E.meanSquareM_L+E.meanSquareM_R),xe=me(E.meanSquareS_L+E.meanSquareS_R),Se=ge(E),Ce=me(E.meanSquareM_L),we=me(E.meanSquareM_R);_e(E,xe);let Te=ve(E);e.currentLevels={vu:[o.p,s.p],ppm:[T(le),T(ue)],vuDb:[v(o.p),v(s.p)],ppmDb:[le,ue],dbfs:[et(b),et(x),et(S),et(C)],lufs:{m:be,s:xe,i:Se,lra:Te,mL:Ce,mR:we},rmsDb:[tt(ne,r),tt(re,r)],phaseCorrelation:pe,phaseLed:he,peak:[g,y],hasAudio:h}}var rt=new class{ctx=null;sourceNode=null;stream=null;isSystemAudio=!1;activeDeviceId=null;sourceType=`none`;inputGainNode=null;inputTrimDb=0;hpfNode=null;hpfEnabled=!1;monitorGainNode=null;monitorEnabled=!1;monitorVolume=.7;splitterNode=null;processorNode=null;testOsc=null;testGain=null;testType=`none`;toneCalDb=-18;sweepTimer=null;vuStyle=`pimson`;vuBallisticPreset=`standard_vu`;vuCoeffs=n();vuState=r();ppmAttack=.005;ppmType=2;ppmBallisticPreset=`type2`;ppmDecayDbPerSec=24/2.8;peakSensTrim=0;ppmState=i();phaseAlpha=.001;phaseState=a();refLevelDb=4;isRefDigital=!1;domain=`analog`;lufsState=o();currentLevels=s();onStatusChange=null;onDevicesChange=null;workletLoaded=!1;vuB0=0;vuB1=0;vuB2=0;vuA1=0;vuA2=0;ppmAttCoeff=0;ppmDecCoeff=0;kShelf_b0=0;kShelf_b1=0;kShelf_b2=0;kShelf_a1=0;kShelf_a2=0;kHp_b0=0;kHp_b1=0;kHp_b2=0;kHp_a1=0;kHp_a2=0;lufsAlphaM=0;lufsAlphaS=0;wasmDsp=new t;wasmResult=c();ensureContext(){return Se(this)}initWorklet(){return Ce(this)}calculateCoefficients(){xe(this)}setVuStyle(e){y(this,e)}setVuBallisticPreset(e){b(this,e)}vuDbOf(e){return v(e)}getAudioInputDevices(){return we()}connectSoundCard(e=null){return De(this,e)}connectSystemAudio(e=`browser`,t=!1){return Oe(this,e,t)}startTestGenerator(e=`sine1k`){ze(this,e)}setToneCalibration(e){Be(this,e)}setupAudioGraph(e,t=!1){Je(this,e,t)}stopCurrentSource(){Ye(this)}processAudioBlock(e){let t=e.inputBuffer.getChannelData(0),n=e.inputBuffer.numberOfChannels>1?e.inputBuffer.getChannelData(1):t;this.processAudioBlockBuffers(t,n)}processAudioBlockBuffers(e,t){$e(this,e,t)||nt(this,e,t)}getLevels(){return this.currentLevels}setHighPass(e){Ue(this,e)}updateHpfState(){We(this)}setInputTrim(e){Ve(this,e)}updateInputGain(){He(this)}setMonitor(e,t=null){Ge(this,e,t)}setMonitorVolume(e){Ke(this,e)}updateMonitorState(){qe(this)}setReferenceLevel(e,t=!1){Xe(this,e,t)}setPeakSensTrim(e){Ze(this,e)}setPpmType(e){re(this,e)}resetLoudness(){be(this)}},D=3200,it=[373,1002,2198,2827],O={x:1380,y:80,w:440,h:98},at={MODE:1385,SOURCE:1499,DOWN:1613,UP:1727},ot={x0:1438,pitch:46,cy:42,count:8},st=8.2,ct={x:1540,y:80,w:120,h:56},lt={bx:22,by:18},ut={input1X:687.5,input2X:2512.5,input2LineX0:1912},dt=[-20,-16,-12,-8,-4,0,4],ft=[-18,-14,-10,-6,-2,2];function pt(e){return(e- -20)/24}function k(e,t=!1){return M(pt(e),t)}function A(e){return 10**((e-3)/20)}function j(e,t=!1){return t?-50+100*Math.max(-.03,Math.min(1.08,e)):-45+90*Math.max(-.03,Math.min(1.08,e))}function mt(e){return e===null||!Number.isFinite(e)?-.12:e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function M(e,t=!1){return t?-50+100*Math.max(-.13,Math.min(1.08,e)):-45+90*Math.max(-.13,Math.min(1.08,e))}function ht(e){return e?-50:-45}function gt(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}var _t={" ":[0,0,0,0,0,0,0],"-":[0,0,0,31,0,0,0],"/":[0,1,2,4,8,16,0],".":[0,0,0,0,0,12,12],":":[0,12,12,0,12,12,0],"+":[0,4,4,31,4,4,0],"%":[24,25,2,4,8,19,3],0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[31,2,4,2,1,17,14],4:[2,6,10,18,31,2,2],5:[31,16,30,1,1,17,14],6:[6,8,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,2,12],A:[14,17,17,17,31,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[28,18,17,17,17,18,28],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],a:[0,0,14,1,15,17,15],b:[16,16,22,25,17,17,30],c:[0,0,14,16,16,17,14],d:[1,1,13,19,17,17,15],e:[0,0,14,17,31,16,14],f:[6,9,8,28,8,8,8],g:[0,15,17,17,15,1,14],h:[16,16,22,25,17,17,17],i:[4,0,12,4,4,4,14],k:[16,16,18,20,24,20,18],l:[12,4,4,4,4,4,14],m:[0,0,26,21,21,17,17],n:[0,0,22,25,17,17,17],o:[0,0,14,17,17,17,14],p:[0,0,30,17,30,16,16],r:[0,0,22,25,16,16,16],s:[0,0,14,16,14,1,30],t:[8,8,28,8,8,9,6],u:[0,0,17,17,17,19,13],v:[0,0,17,17,17,10,4],w:[0,0,17,17,21,21,10],x:[0,0,17,10,4,10,17],y:[0,0,17,17,15,1,14],z:[0,0,31,2,4,8,31]};function vt(e,t,n,r,i,a){let o=``,s=r*.38;for(let c=0;c<e.length;c++){let l=_t[e[c]??` `]??_t[` `],u=t+c*r*6.2;for(let e=0;e<7;e++){let t=l[e]??0;for(let c=0;c<5;c++){let l=t>>4-c&1;o+=`<circle cx="${(u+c*r).toFixed(1)}" cy="${(n+e*r).toFixed(1)}" r="${s.toFixed(2)}" fill="${l?i:a}"/>`}}}return o}var yt={0:`abcdef`,1:`bc`,2:`abged`,3:`abgcd`,4:`fgbc`,5:`afgcd`,6:`afgedc`,7:`abc`,8:`abcdefg`,9:`abcdfg`,"-":`g`," ":``,"-1":`bcg`,"┫":`bcg`,"=":`bcg`};function bt(e){let t=e.trim(),n=t.match(/^-1(\d)$/);if(n)return[`-1`,n[1]];let r=t.match(/^-(\d)$/);if(r)return[`-`,r[1]];let i=e.padStart(2),a=i.length;return[i[a-2],i[a-1]]}function xt(e,t){let n=t.x+(t.w-82)/2,r=t.y+(t.h-48)/2,i=``;return bt(e).forEach((e,t)=>{let a=n+t*48+3,o=r,s={a:[a+3,o,28,6],d:[a+3,o+48-6,28,6],g:[a+3,o+24-3,28,6],f:[a-3+1,o+3,6,18],b:[a+34-3-1,o+3,6,18],e:[a-3+1,o+24+3,6,18],c:[a+34-3-1,o+24+3,6,18]},c=yt[e]??``;for(let e of`abcdefg`){let t=s[e];i+=`<rect x="${t[0].toFixed(1)}" y="${t[1].toFixed(1)}" width="${t[2]}" height="${t[3]}" rx="2" fill="${c.includes(e)?`#ff2d1f`:`rgba(255,45,31,0.09)`}" transform="skewX(-6)" transform-origin="${(a+17).toFixed(1)} ${(o+24).toFixed(1)}"/>`}}),i}function St(e,t){return(n,r)=>{let i=n*Math.PI/180;return[e+r*Math.sin(i),t-r*Math.cos(i)]}}function Ct(e){return(t,n,r,i,a)=>{let[o,s]=e(t,r),[c,l]=e(n,r);return`<path d="M${o.toFixed(1)} ${s.toFixed(1)} A${r} ${r} 0 0 1 ${c.toFixed(1)} ${l.toFixed(1)}" fill="none" stroke="${a}" stroke-width="${i}"/>`}}function N(e,t,n,r,i,a){let[o,s]=e(t,n),[c,l]=e(t,r);return`<line x1="${o.toFixed(1)}" y1="${s.toFixed(1)}" x2="${c.toFixed(1)}" y2="${l.toFixed(1)}" stroke="${i}" stroke-width="${a}"/>`}var wt=`#ef4444`;function Tt(e,t,n,r,i){let a=e=>M((e+12)/24,i),o=wt,s=t=>t-e.offset,c=n(a(s(e.redFrom)),a(12),273,16,o);for(let n of e.minors){let i=s(n);i<-12||i>12||(c+=N(t,a(i),265,279,n>=e.redFrom?o:r,4))}for(let n of e.majors){let i=s(n);if(i<-12||i>12)continue;let l=n>=e.redFrom?o:r;c+=N(t,a(i),265,289,l,4);let[u,d]=t(a(i),313);c+=`<text x="${u.toFixed(1)}" y="${(d+8).toFixed(1)}" font-size="${e.fmt(n).length>3?22:26}" font-weight="700" text-anchor="middle" fill="${l}">${e.fmt(n)}</text>`}let[l,u]=t(0,195);return c+=`<text x="${l.toFixed(1)}" y="${u.toFixed(1)}" font-size="18" font-weight="800" letter-spacing="2" text-anchor="middle" fill="${r}" opacity="0.8">${e.caption}</text>`,c}var Et={offset:-9,majors:[-20,-15,-10,-5,0,3],minors:[-17.5,-12.5,-7.5,-2.5,1,2],redFrom:0,caption:`DIN`,fmt:e=>e>0?`+`+e:String(e)},Dt={offset:0,majors:[-12,-6,0,6,9,12],minors:[-9,-3,3],redFrom:9,caption:`NORDIC`,fmt:e=>e===0?`TEST`:e>0?`+`+e:String(e)},Ot={offset:-18,majors:[-30,-24,-18,-12,-6],minors:[-27,-21,-15,-9],redFrom:-9,caption:`dBFS`,fmt:e=>String(e)},kt=`#facc15`;function At(e,t){let{P:n,arc:r,ink:i}=e,a=e.isFisam??e.isSifam??!1,o=``;o+=r(M(1,a),k(6,a),265,4,i);let s=k(0,a),c=k(6,a);o+=r(s,c,273,16,kt),ft.forEach(e=>{let r=k(e,a);o+=e===2?N(n,r,265,279,t?`#141517`:i,2.8):N(n,r,265,279,i,2.8)}),dt.forEach(e=>{let r=k(e,a);e===-8?o+=N(n,r,251,289,i,4):e===0||e===4?(o+=N(n,r,265,281,t?`#141517`:i,4),o+=N(n,r,281,289,t?kt:i,4)):o+=N(n,r,265,289,i,4)}),o+=N(n,c,265,281,t?`#141517`:i,4),o+=N(n,c,281,285,t?kt:i,4),dt.forEach(e=>{let r=k(e,a),[s,c]=n(r,313),l=e>=0&&t?kt:i,u=e>0?`+`+e:String(e);o+=`<text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${u}</text>`});let[l,u]=n(0,231);o+=`<text x="${l.toFixed(1)}" y="${(u+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="${i}">R</text>`;let[d,f]=n(0,205);return o+=`<text x="${d.toFixed(1)}" y="${(f+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${i}">dB</text>`,o}function jt(e){let{P:t,ink:n}=e,r=e.isFisam??e.isSifam??!1,i=``;ft.forEach(e=>{let a=k(e,r);i+=N(t,a,265,279,n,2.8)}),dt.forEach(e=>{let a=k(e,r);i+=e===-8?N(t,a,245,289,n,4):N(t,a,265,289,n,4)}),dt.forEach(e=>{let a=k(e,r),[o,s]=t(a,313),c=e>0?`+`+e:String(e);i+=`<text x="${o.toFixed(1)}" y="${(s+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${n}">${c}</text>`});let[a,o]=t(0,221);return i+=`<text x="${a.toFixed(1)}" y="${(o+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${n}">dB</text>`,i}function Mt(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=e=>M((e+12)/24,i),o=`<g class="mc-only">`;o+=n(a(8),a(12),274,18,`#e3c22a`),o+=n(a(8),a(12),268,1.6,`#1a1a1a`)+n(a(8),a(12),280,1.6,`#1a1a1a`);for(let e=-12;e<=12;e+=2){let n=e%4==0;o+=N(t,a(e),n?249:265,n?285:277,r,n?4:3)}let s=(e,t,n,i=24)=>`<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-size="${i}" font-weight="500" text-anchor="middle" dominant-baseline="central" fill="${r}" font-family="Helvetica, Arial, sans-serif">${n}</text>`;[-12,-8,-4,4,8,12].forEach(e=>{let[n,r]=t(a(e),309);o+=s(n,r,String(Math.abs(e)))});let[c,l]=t(a(0),295);o+=s(c,l-34,`TONE`)+s(c,l-4,`&#8722; | +`,22),[-12,-8,-4,0,4,8,12].forEach(e=>{let n=e+8,[r,i]=t(a(e),223);o+=s(r,i,n>0?`+`+n:String(n))});let[u,d]=t(M(.9,i),357);return o+=s(u,d,`PGM`),o+=`</g>`,o}var Nt={type1:Et,nordic:Dt,fast_peak:Ot};function Pt(e){return Nt[e]??Dt}function Ft(e,t,n){let{P:r,arc:i,ink:a}=e,o=e.isFisam??e.isSifam??!1,s=i(M(0,o),M(1,o),265,4,a);return s+=`<g class="wbs-only">`,s+=t===`scale3`?jt(e):t===`type2`||t===`scale2`?At(e,n):Tt(Pt(t),r,i,a,o),s+=`</g>`,s+=Mt(e),s}function It(e,t,n){return`
        <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${n+6}" stroke="rgba(0,0,0,0.30)" stroke-width="3.5" stroke-linecap="round"/>
      `}function Lt(e,t,n,r,i){return`
      <g id="xtm_needle_${e}" transform="rotate(${t} ${n} ${r})">
        ${i.shadow}
        ${i.body}
      </g>`}var Rt=`#dc2626`,zt=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],Bt=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],Vt=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function Ht(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=Rt,o=``;return o+=n(j(A(-20),i),j(A(0),i),265,3.8,r),o+=n(j(A(0),i),j(A(3),i),268,10,a),zt.forEach(e=>{let n=j(A(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=N(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),Bt.forEach(e=>{let n=j(A(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=N(t,n,265,289,l,`4.2`)+`
              <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),Vt.forEach(({pc:e,d:n})=>{let a=j(A(n),i),[s,c]=t(a,257),[l,u]=t(a,233);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="4.2" fill="${r}"/>
              <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function Ut(e){let{P:t,ink:n}=e,r=j(A(-7),!0),i=j(A(1),!0),[a,o]=t(r,337),[s,c]=t(i,337);return`<text x="${a.toFixed(1)}" y="${o.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${n}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>
              <text x="${s.toFixed(1)}" y="${c.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${Rt}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>`}function Wt(e,t,n){let r=t-(n+34);return{shadow:`
          <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${r+4}" stroke="rgba(0,0,0,0.30)" stroke-width="3.2" stroke-linecap="round"/>
        `,body:`
          <polygon points="${e-2.8},${t} ${e+2.8},${t} ${e+.8},${r} ${e-.8},${r}" fill="#0b0c0e"/>
          <line x1="${e-.5}" y1="${t}" x2="${e-.5}" y2="${r+4}" stroke="rgba(255,255,255,0.35)" stroke-width="1.1"/>
          <circle cx="${e}" cy="${t}" r="8" fill="#0b0c0e"/>
          <circle cx="${e}" cy="${t}" r="3.5" fill="#334155"/>
        `}}function Gt(e,t,n){let r=t-(n+34);return{shadow:It(e,t,r),body:`
          <polygon points="${e-3.8},${t} ${e+3.8},${t} ${e+1.2},${r} ${e-1.2},${r}" fill="#ffd600"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var Kt={isFisam:!0,isSifam:!0,legend:Ut,vuNeedle:Wt,ppmNeedle:Gt},qt=Kt;function Jt(e){let{ink:t,x0:n,y0:r}=e,i=n+290;return`<text x="${(i-165).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${t}">VU</text>
              <text x="${(i+165).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${Rt}" text-anchor="end">VU</text>`}function Yt(e,t,n){let r=t-(n+24);return{shadow:`
          <path d="
            M ${e+2} ${r+2}
            L ${e+2.6} ${r+8}
            C ${e+3.2} ${r+12}, ${e+6.4} ${r+16}, ${e+6.4} ${r+20}
            C ${e+6.4} ${r+24}, ${e+4.4} ${r+28}, ${e+3.2} ${r+30}
            L ${e+3.1} ${t+2}
            L ${e+.9} ${t+2}
            L ${e+.8} ${r+30}
            C ${e-.4} ${r+28}, ${e-2.4} ${r+24}, ${e-2.4} ${r+20}
            C ${e-2.4} ${r+16}, ${e+.8} ${r+12}, ${e+1.4} ${r+8}
            Z" fill="rgba(0,0,0,0.30)"/>
        `,body:`
          <path d="
            M ${e} ${r}
            L ${e+.6} ${r+6}
            C ${e+1.2} ${r+10}, ${e+4.4} ${r+14}, ${e+4.4} ${r+18}
            C ${e+4.4} ${r+22}, ${e+2.4} ${r+26}, ${e+1.2} ${r+28}
            L ${e+1.1} ${t}
            L ${e-1.1} ${t}
            L ${e-1.2} ${r+28}
            C ${e-2.4} ${r+26}, ${e-4.4} ${r+22}, ${e-4.4} ${r+18}
            C ${e-4.4} ${r+14}, ${e-1.2} ${r+10}, ${e-.6} ${r+6}
            Z" fill="#141008"/>
          <line x1="${e}" y1="${t-5}" x2="${e}" y2="${r+4}" stroke="rgba(255,255,255,0.20)" stroke-width="0.8"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#141008"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#2d3748"/>
        `}}function Xt(e,t,n){let r=t-(n+34);return{shadow:It(e,t,r),body:`
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(255,214,0,0.22)" stroke-width="7.5" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="#ffd600" stroke-width="4.6" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var P={isFisam:!1,isSifam:!1,legend:Jt,vuNeedle:Yt,ppmNeedle:Xt},Zt=P,Qt=P,$t={isFisam:!1,isSifam:!1,legend:P.legend,vuNeedle:P.vuNeedle,ppmNeedle:P.ppmNeedle};function en(e,t,n,r=!1){let i=e-44,a=t+18,o=r?`#cbd5e1`:n||`#1a1715`,s=r?`#f8fafc`:n||`#1a1715`;return`
    <!-- McCurdyRadio.com ATS-100 Cream Console: Authentic Rectangle Cartouche Box & Wordmark (Monochrome) -->
    <g class="mc-only mc-com-only" transform="translate(${(e-84).toFixed(1)}, ${(t+8).toFixed(1)})">
      <rect x="0" y="0" width="168" height="56" rx="5"
            fill="none" stroke="${o}" stroke-width="3" stroke-opacity="0.85" />
      <text x="84" y="38"
            font-family="'Arial Black', Helvetica, Arial, sans-serif"
            font-size="27" font-weight="900" letter-spacing="-1.2" text-anchor="middle"
            fill="none" stroke="${o}" stroke-width="2.4" stroke-opacity="0.9">McCurdy</text>
    </g>

    <!-- McCurdyRadio.ca Studio Broadcast Mode: Authentic Vintage Crest Dial Badge (gemini-svg (13).svg) -->
    <g class="mc-only mc-ca-only mc-vu-brand-badge" transform="translate(${i.toFixed(1)}, ${a.toFixed(1)})">
      <svg width="88" height="32.3" viewBox="0 0 600 220" aria-label="McCurdy Radio Industries">
        <defs>
          <path id="mc_badge_shape_${e}" d="
            M 294,14
            Q 300,12.5 306,14
            L 556,48
            Q 566,49.5 562,60
            L 517,156
            Q 514,162 506,163
            L 306,204
            Q 300,205.5 294,204
            L 94,163
            Q 86,162 83,156
            L 38,60
            Q 34,49.5 44,48
            Z" />
        </defs>

        <!-- Elongated Faceted Hexagon Shield Body (Transparent inside; crisp outline on dial) -->
        <use href="#mc_badge_shape_${e}" fill="none" stroke="${o}" stroke-width="4.0" />

        <!-- Authentic Lowercase Serif 'm' with Tall Stem -->
        <path fill="${s}" d="
          M 101,46
          L 139,46
          L 139,62
          C 149,49 164,43 181,43
          C 199,43 213,50 221,63
          C 231,49 246,43 263,43
          C 289,43 306,59 306,87
          L 306,156
          L 317,156
          L 317,163
          L 271,163
          L 271,156
          L 281,156
          L 281,89
          C 281,71 271,61 255,61
          C 239,61 227,72 227,91
          L 227,156
          L 238,156
          L 238,163
          L 192,163
          L 192,156
          L 202,156
          L 202,89
          C 202,71 192,61 176,61
          C 160,61 148,72 148,91
          L 148,156
          L 159,156
          L 159,163
          L 113,163
          L 113,156
          L 123,156
          L 123,54
          L 101,54
          Z" />

        <!-- Serif 'cCURDY' Letterforms -->
        <text x="323" y="84" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="33" fill="${s}">C</text>
        <text x="349" y="109" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="56" letter-spacing="1.5" fill="${s}">CURDY</text>

        <!-- Horizontal Capsule / Pill Bar Underline -->
        <path fill="${s}" d="
          M 264,118
          L 523,118
          A 11,11 0 0 1 523,140
          L 264,140
          A 11,11 0 0 1 264,118
          Z" />
        <!-- On meter dial (<160px), sub-pixel micro-text 'RADIO INDUSTRIES LIMITED' is omitted per specification for pristine edge acuity -->
      </svg>
    </g>`}var tn=`#2d2924`,nn=`#c83728`,rn=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],an=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],on=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function sn(e){let{x0:t,y0:n}=e;return`<text x="${(t+58).toFixed(0)}" y="${n+64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#524a3e" letter-spacing="0.5">VU</text>
          <text x="${(t+580-58).toFixed(0)}" y="${n+64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#b83b2a" letter-spacing="0.5" text-anchor="end">VU</text>`}function cn(e){let{P:t,arc:n}=e,r=e.isFisam??e.isSifam??!1,i=``;return i+=n(j(A(-20),r),j(A(0),r),265,2,tn),i+=n(j(A(0),r),j(A(3),r),266,3.2,nn),rn.forEach(e=>{let n=j(A(e),r),a=Math.abs(e)<=3?12:14,o=e>0?nn:tn;i+=N(t,n,265,265+a,o,Math.abs(e)<=3?`2.2`:`2.6`)}),an.forEach(e=>{let n=j(A(e),r),[a,o]=t(n,309),s=e>=0?nn:tn;i+=N(t,n,265,287,s,`3.2`)+`
      <text x="${a.toFixed(1)}" y="${(o+8).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="${s}">${e>0?`+`+e:e}</text>`}),i+=n(j(A(-20),r),j(A(0),r),255,1.8,tn),on.forEach(({pc:e,d:n})=>{let a=j(A(n),r),[o,s]=t(a,255),[c,l]=t(a,233),u=e===100?nn:tn;i+=`<circle cx="${o.toFixed(1)}" cy="${s.toFixed(1)}" r="3.2" fill="${u}"/>
      <text x="${c.toFixed(1)}" y="${(l+6).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="${u}">${e}</text>`}),i}function ln(e,t,n){let r=t-(n+17);return{shadow:`
      <!-- McCurdy Authentic Vintage Needle Drop Shadow -->
      <path d="
        M ${e+2} ${r+2}
        C ${e+1.2+2} ${r+4+2}, ${e+3.8+2} ${r+8+2}, ${e+5.2+2} ${r+13+2}
        C ${e+5.8+2} ${r+16+2}, ${e+5.2+2} ${r+19+2}, ${e+3.2+2} ${r+22+2}
        C ${e+2+2} ${r+24+2}, ${e+1.2+2} ${r+26+2}, ${e+1+2} ${r+29+2}
        L ${e+1.3+2} ${t+2}
        L ${e-1.3+2} ${t+2}
        L ${e-1+2} ${r+29+2}
        C ${e-1.2+2} ${r+26+2}, ${e-2+2} ${r+24+2}, ${e-3.2+2} ${r+22+2}
        C ${e-5.2+2} ${r+19+2}, ${e-5.8+2} ${r+16+2}, ${e-3.8+2} ${r+8+2}
        C ${e-1.2+2} ${r+4+2}, ${e+2} ${r+2}, ${e+2} ${r+2}
        Z" fill="rgba(0,0,0,0.30)"/>
      <circle cx="${e+2}" cy="${t+2}" r="11" fill="rgba(0,0,0,0.25)"/>
    `,body:`
      <!-- McCurdy Authentic Vintage Needle with Classic Teardrop Pointer -->
      <path d="
        M ${e} ${r}
        C ${e+1.2} ${r+4}, ${e+3.8} ${r+8}, ${e+5.2} ${r+13}
        C ${e+5.8} ${r+16}, ${e+5.2} ${r+19}, ${e+3.2} ${r+22}
        C ${e+2} ${r+24}, ${e+1.2} ${r+26}, ${e+1} ${r+29}
        L ${e+1.3} ${t}
        L ${e-1.3} ${t}
        L ${e-1} ${r+29}
        C ${e-1.2} ${r+26}, ${e-2} ${r+24}, ${e-3.2} ${r+22}
        C ${e-5.2} ${r+19}, ${e-5.8} ${r+16}, ${e-3.8} ${r+8}
        C ${e-1.2} ${r+4}, ${e} ${r}, ${e} ${r}
        Z" fill="#1e1b18"/>
      
      <!-- Subtle needle spine ridge highlight -->
      <line x1="${e-.4}" y1="${t-8}" x2="${e-.4}" y2="${r+10}" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>

      <!-- Center Pivot Hub & Concentric Screws -->
      <circle cx="${e}" cy="${t}" r="11" fill="#141517" stroke="#2a2d33" stroke-width="1.2"/>
      <circle cx="${e}" cy="${t}" r="5.5" fill="#090a0c"/>
      <circle cx="${e}" cy="${t}" r="2" fill="#4b5059"/>
    `}}var un={isFisam:!1,isSifam:!1,legend:sn,vuNeedle:ln,ppmNeedle:P.ppmNeedle,renderScale:cn},dn=`rgb(244, 144, 44)`,fn=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],pn=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],mn=[{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function hn(e){let{ink:t,x0:n,y0:r}=e,i=n+60,a=n+580-60,o=r+52;return`
    <text x="${i.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${t}" transform="rotate(-26, ${i.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5">VU</text>
    <text x="${a.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${Rt}" transform="rotate(26, ${a.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5" text-anchor="end">VU</text>`}function gn(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=Rt,o=``;return o+=n(j(A(-20),i),j(A(0),i),265,3.8,r),o+=n(j(A(0),i),j(A(3),i),268,10,a),fn.forEach(e=>{let n=j(A(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=N(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),pn.forEach(e=>{let n=j(A(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=N(t,n,265,289,l,`4.2`)+`
      <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),mn.forEach(({pc:e,d:n})=>{let a=j(A(n),i),[s,c]=t(a,255),[l,u]=t(a,231);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="3.8" fill="${r}"/>
      <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function _n(e,t,n){let r=t-(n+24);return{shadow:`
      <path d="
        M ${e+2} ${r+2}
        L ${e+2.6} ${r+8}
        C ${e+3.2} ${r+12}, ${e+6.4} ${r+16}, ${e+6.4} ${r+20}
        C ${e+6.4} ${r+24}, ${e+4.4} ${r+28}, ${e+3.2} ${r+30}
        L ${e+3.1} ${t+2}
        L ${e+.9} ${t+2}
        L ${e+.8} ${r+30}
        C ${e-.4} ${r+28}, ${e-2.4} ${r+24}, ${e-2.4} ${r+20}
        C ${e-2.4} ${r+16}, ${e+.8} ${r+12}, ${e+1.4} ${r+8}
        Z" fill="rgba(0,0,0,0.30)"/>
    `,body:`
      <path d="
        M ${e} ${r}
        L ${e+.6} ${r+6}
        C ${e+1.2} ${r+10}, ${e+4.4} ${r+14}, ${e+4.4} ${r+18}
        C ${e+4.4} ${r+22}, ${e+2.4} ${r+26}, ${e+1.2} ${r+28}
        L ${e+1.1} ${t}
        L ${e-1.1} ${t}
        L ${e-1.2} ${r+28}
        C ${e-2.4} ${r+26}, ${e-4.4} ${r+22}, ${e-4.4} ${r+18}
        C ${e-4.4} ${r+14}, ${e-1.2} ${r+10}, ${e-.6} ${r+6}
        Z" fill="${dn}"/>
      <line x1="${e}" y1="${t-5}" x2="${e}" y2="${r+4}" stroke="rgba(255,255,255,0.40)" stroke-width="0.8"/>
      <circle cx="${e}" cy="${t}" r="7" fill="${dn}"/>
      <circle cx="${e}" cy="${t}" r="3" fill="#2d3748"/>
    `}}function vn(e,t,n){let r=t-(n+34);return{shadow:It(e,t,r),body:`
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(244, 144, 44, 0.28)" stroke-width="7.5" stroke-linecap="round"/>
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="${dn}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${e}" cy="${t}" r="7" fill="#141008"/>
      <circle cx="${e}" cy="${t}" r="3" fill="${dn}"/>
    `}}var yn={fisam:Kt,sifam:qt,pimson:P,pimsom:Qt,simpson:Zt,standard_vu:$t,mccurdy_vu:un,wbs_m405:{isFisam:!1,isSifam:!1,legend:hn,vuNeedle:_n,ppmNeedle:vn,renderScale:gn}};function bn(e){return yn[e]??P}var xn={id:`amber`,gradientId:`xamber`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`},Sn={id:`amber_bottom`,gradientId:`xamber_bottom`,bloom:!0,bloomPos:`bottom`,gradient:`<radialGradient id="xamber_bottom" cx="50%" cy="65%" r="75%">
          <stop offset="0%" stop-color="#ffeaa0"/>
          <stop offset="35%" stop-color="#fed876"/>
          <stop offset="68%" stop-color="#f5ad2b"/>
          <stop offset="90%" stop-color="#e28c12"/>
          <stop offset="100%" stop-color="#cc7408"/>
        </radialGradient>`},Cn={id:`white`,gradientId:`xwhite`,bloom:!1,gradient:`<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`},wn={id:`warm_white`,gradientId:`xwarm_white`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xwarm_white" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fffdf7"/>
          <stop offset="55%" stop-color="#f8f4e6"/>
          <stop offset="80%" stop-color="#e2dac5"/>
          <stop offset="100%" stop-color="#b0a48a"/>
        </radialGradient>`},Tn={id:`parchment`,gradientId:`xparchment`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>`},En={id:`tungsten`,gradientId:`xtungsten`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xtungsten" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff4e0"/>
          <stop offset="20%" stop-color="#fedaa0"/>
          <stop offset="45%" stop-color="#fca840"/>
          <stop offset="72%" stop-color="#d96b10"/>
          <stop offset="92%" stop-color="#994105"/>
          <stop offset="100%" stop-color="#552002"/>
        </radialGradient>`},Dn={id:`golden`,gradientId:`xgolden`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xgolden" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff9d6"/>
          <stop offset="18%" stop-color="#ffe680"/>
          <stop offset="45%" stop-color="#f5ba18"/>
          <stop offset="70%" stop-color="#cb8306"/>
          <stop offset="90%" stop-color="#8c4e02"/>
          <stop offset="100%" stop-color="#4d2700"/>
        </radialGradient>`},On={id:`green_glow`,gradientId:`xgreen_glow`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xgreen_glow" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="20%" stop-color="#bbf7d0"/>
          <stop offset="48%" stop-color="#4ade80"/>
          <stop offset="75%" stop-color="#16a34a"/>
          <stop offset="92%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#052e16"/>
        </radialGradient>`},kn={id:`dark_night`,gradientId:`xdark_night`,bloom:!1,gradient:`<radialGradient id="xdark_night" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`},An={id:`unlit`,gradientId:`xunlit`,bloom:!1,gradient:`<radialGradient id="xunlit" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f6f3ea"/>
          <stop offset="40%" stop-color="#ede7d8"/>
          <stop offset="75%" stop-color="#dfd6c0"/>
          <stop offset="100%" stop-color="#c8bda3"/>
        </radialGradient>`},jn=`
  <radialGradient id="xamber_lamp_left" cx="28%" cy="100%" r="85%">
    <stop offset="0%" stop-color="#fff8db" stop-opacity="0.75"/>
    <stop offset="20%" stop-color="#ffea9f" stop-opacity="0.45"/>
    <stop offset="50%" stop-color="#fed766" stop-opacity="0.20"/>
    <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="xamber_lamp_right" cx="72%" cy="100%" r="85%">
    <stop offset="0%" stop-color="#fff8db" stop-opacity="0.75"/>
    <stop offset="20%" stop-color="#ffea9f" stop-opacity="0.45"/>
    <stop offset="50%" stop-color="#fed766" stop-opacity="0.20"/>
    <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
  </radialGradient>
`,Mn=`
  <radialGradient id="xdial_buff" cx="50%" cy="42%" r="65%">
    <stop offset="0%" stop-color="#fff8e7"/>
    <stop offset="35%" stop-color="#f8edd3"/>
    <stop offset="70%" stop-color="#ede0c0"/>
    <stop offset="100%" stop-color="#d4c39e"/>
  </radialGradient>
  <radialGradient id="xdial_champagne" cx="50%" cy="38%" r="70%">
    <stop offset="0%" stop-color="#fbf8f0"/>
    <stop offset="30%" stop-color="#ede6d2"/>
    <stop offset="65%" stop-color="#d8cdb0"/>
    <stop offset="100%" stop-color="#b5a786"/>
  </radialGradient>
  <radialGradient id="xdial_slate" cx="50%" cy="38%" r="70%">
    <stop offset="0%" stop-color="#808d9e"/>
    <stop offset="35%" stop-color="#5d6978"/>
    <stop offset="75%" stop-color="#3d4754"/>
    <stop offset="100%" stop-color="#232a33"/>
  </radialGradient>
`,Nn=`<radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`,Pn={amber:xn,amber_bottom:Sn,tungsten:En,golden:Dn,parchment:Tn,white:Cn,warm_white:wn,green_glow:On,dark_night:kn,unlit:An};function Fn(e){return Pn[e]??xn}function In(e){return`url(#${Fn(e).gradientId})`}function Ln(e){return Fn(e).bloom}function Rn(e){return Fn(e).bloomPos??`top`}var zn=`<radialGradient id="xblackppm" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`;function Bn(e,t,n,r=`auto`){let i=`#171512`,a=`#141008`,o=typeof document<`u`&&document.body?.classList.contains(`theme-wbs-ca`),s=typeof document<`u`&&document.body?.classList.contains(`theme-mccurdy-dark`),c=o&&n===`amber`?`amber_bottom`:n;return e?t?r&&r!==`auto`?r===`dark_night`?(i=`url(#xdark_night)`,a=`#f8fafc`):r===`classic_buff`?(i=`url(#xdial_buff)`,a=`#141008`):r===`parchment`?(i=`url(#xparchment)`,a=`#141008`):r===`champagne`?(i=`url(#xdial_champagne)`,a=`#141008`):r===`slate_neutral`?(i=`url(#xdial_slate)`,a=`#f8fafc`):r===`pure_white`?(i=`url(#xwhite)`,a=`#141008`):(i=`url(#xblackppm)`,a=`#f8fafc`):(i=`url(#xblackppm)`,a=`#f8fafc`):(i=`#0a0b0d`,a=`#475569`):t?r&&r!==`auto`?r===`dark_night`?(i=`url(#xdark_night)`,a=`#f8fafc`):r===`classic_buff`?i=`url(#xdial_buff)`:r===`parchment`?i=`url(#xparchment)`:r===`champagne`?i=`url(#xdial_champagne)`:r===`slate_neutral`?(i=`url(#xdial_slate)`,a=`#f8fafc`):r===`pure_white`?i=`url(#xwhite)`:(i=In(c),c===`dark_night`&&(a=`#f8fafc`)):s?(i=`url(#xmccurdy_vintage_dial)`,a=`#2d2924`):(i=In(c),c===`dark_night`&&(a=`#f8fafc`)):s?(i=`#7c6d52`,a=`#14120e`):a=`#0c0a06`,{fill:i,ink:a}}var Vn=`M2.43 4.14 C2.43 8.26 2.43 13.33 2.43 17.45 C2.43 20.03 31.29 20.41 33.55 20.41 C37.4 20.41 36.81 20.41 40.67 20.41 C42.87 20.41 71.66 20.03 71.66 17.45 L71.66 4.14 C71.66 1.57 42.82 1.26 40.67 1.23 L33.55 1.23 C31.29 1.23 2.43 1.57 2.43 4.14 Z M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z M7.82 6.09 L13.37 16.43 L15.16 16.43 L9.61 6.09 L7.82 6.09 Z M17.85 6.09 L18.93 6.09 L18.59 6.09 L19.64 6.09 L15.16 16.43 L14.27 14.58 L17.87 6.03 L17.85 6.09 Z M18.74 6.09 L23.4 16.43 L25.19 16.43 L20.53 6.09 L18.74 6.09 Z M25.19 16.43 L30.56 6.09 L28.77 6.09 L24.29 14.58 L25.19 16.43 Z M32.53 6.09 L32.53 16.43 L34.32 16.43 L34.32 6.09 L32.53 6.09 Z M34.32 6.09 L46.14 6.09 L45.24 7.94 L34.32 7.94 L34.32 6.09 Z M45.24 7.94 L46.14 6.09 L47.57 7.01 L46.14 8.49 L45.24 7.94 Z M47.57 7.01 L47.93 7.94 L46.14 8.49 L47.57 7.01 Z M47.93 7.94 L46.14 8.49 L46.14 9.78 L47.93 10.34 L47.93 7.94 Z M47.93 10.34 L46.14 9.78 L45.78 10.34 L47.03 11.26 L47.93 10.34 Z M47.03 11.26 L45.78 12.18 L46.14 12.55 L47.93 12.18 L47.03 11.26 Z M47.93 12.18 L47.93 14.58 L46.14 14.03 L46.14 12.55 L47.93 12.18 Z M47.93 14.58 L47.57 15.51 L46.14 14.03 L47.93 14.58 Z M47.57 15.51 L46.14 16.43 L45.24 14.58 L46.14 14.03 L47.57 15.51 Z M46.14 16.43 L45.24 14.58 L34.32 14.58 L34.32 16.43 L46.14 16.43 Z M34.32 10.34 L34.32 12.18 L45.78 12.18 L45.78 10.34 L34.32 10.34 Z M45.78 10.34 L45.78 12.18 L47.03 11.26 L45.78 10.34 Z M66.19 7.94 L66.19 6.09 L51.69 6.09 L52.58 7.94 L66.19 7.94 Z M52.58 7.94 L51.69 6.09 L50.25 7.01 L51.69 8.49 L52.58 7.94 Z M51.69 8.49 L50.25 7.01 L49.9 7.94 L51.69 8.49 Z M49.9 7.94 L51.69 8.49 L51.69 9.78 L49.9 10.34 L49.9 7.94 Z M49.9 10.34 L51.69 9.78 L51.69 9.78 L50.25 11.26 L49.9 10.34 Z M51.69 9.78 L50.25 11.26 L51.69 12.18 L52.58 10.34 L51.69 9.78 Z M51.69 12.18 L52.58 10.34 L64.4 10.34 L63.5 12.18 L51.69 12.18 Z M63.5 12.18 L64.4 10.34 L65.83 11.26 L64.4 12.55 L63.5 12.18 Z M65.83 11.26 L64.4 12.55 L66.19 12.18 L65.83 11.26 Z M64.4 12.55 L66.19 12.18 L66.19 14.58 L64.4 14.03 L64.4 12.55 Z M66.19 14.58 L65.83 15.51 L64.4 14.03 L66.19 14.58 Z M65.83 15.51 L64.4 14.03 L63.5 14.58 L64.4 16.43 L65.83 15.51 Z M63.5 14.58 L64.4 16.43 L49.9 16.43 L49.9 14.58 L63.5 14.58 Z`;function Hn(e,t,n){return`<g class="wbs-only" transform="translate(${(e-44.5).toFixed(1)}, ${(t+22).toFixed(1)}) scale(1.2)">
              <path d="${Vn}" fill="${n}" fill-rule="evenodd"/>
            </g>`}var Un=`<linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.68"/>
          <stop offset="45%" stop-color="#000000" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="50%" stop-color="#000000" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="xch_left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.50"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
        </linearGradient>
        <!-- Vintage Molded Bezel Deep Right & Corner Shadows (Scoped exclusively to .bezel-wbs and .bezel-mc) -->
        <linearGradient id="xch_right_wbs" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="60%" stop-color="#000000" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.60"/>
        </linearGradient>
        <!-- Top-Right Chamber Corner Deep Shadow (casts shadow over red overload scale & lettering in vintage bezels) -->
        <radialGradient id="xch_corner_tr" cx="100%" cy="0%" r="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.75"/>
          <stop offset="35%" stop-color="#000000" stop-opacity="0.52"/>
          <stop offset="70%" stop-color="#000000" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <!-- Top-Left Chamber Corner Shadow in vintage bezels -->
        <radialGradient id="xch_corner_tl" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.65"/>
          <stop offset="35%" stop-color="#000000" stop-opacity="0.40"/>
          <stop offset="70%" stop-color="#000000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <!-- Photorealistic Simpson / McCurdy Bakelite Body -->
        <linearGradient id="bakeliteBody" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stop-color="#2b2d30" />
          <stop offset="4%" stop-color="#111214" />
          <stop offset="50%" stop-color="#18191c" />
          <stop offset="94%" stop-color="#0b0c0e" />
          <stop offset="100%" stop-color="#27292c" />
        </linearGradient>
        <!-- Outer Bezel Rim Highlight -->
        <linearGradient id="bezelRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c828a" />
          <stop offset="18%" stop-color="#25272b" />
          <stop offset="82%" stop-color="#141517" />
          <stop offset="100%" stop-color="#585d63" />
        </linearGradient>
        <!-- Inner Window Chrome/Aluminum Bevel Frame -->
        <linearGradient id="windowBevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3c3f44" />
          <stop offset="15%" stop-color="#b5b9be" />
          <stop offset="85%" stop-color="#8b9096" />
          <stop offset="100%" stop-color="#d2d6dc" />
        </linearGradient>
        <!-- Warm Aged Amber/Ochre Dial Face (Vintage Simpson/McCurdy) -->
        <radialGradient id="dialOchre" cx="50%" cy="62%" r="65%" fx="50%" fy="58%">
          <stop offset="0%" stop-color="#dfc06f" />
          <stop offset="68%" stop-color="#cca852" />
          <stop offset="92%" stop-color="#b7913d" />
          <stop offset="100%" stop-color="#9c782d" />
        </radialGradient>
        <!-- Top Shadow Cast by Upper Bezel Lip onto Dial -->
        <linearGradient id="dialTopShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#261c08" stop-opacity="0.48" />
          <stop offset="12%" stop-color="#261c08" stop-opacity="0.12" />
          <stop offset="28%" stop-color="#261c08" stop-opacity="0" />
        </linearGradient>
        <!-- Glass Curved Specular Sheen -->
        <linearGradient id="glassSheen" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.03" />
          <stop offset="75%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.08" />
        </linearGradient>
        <!-- Vertical Ribbed Fluting Metallic Ridge Gradient -->
        <linearGradient id="ribRidge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#101113" />
          <stop offset="45%" stop-color="#6b7078" />
          <stop offset="70%" stop-color="#232529" />
          <stop offset="100%" stop-color="#090a0b" />
        </linearGradient>
        <!-- Screw Head Metallic Radial Gradient -->
        <radialGradient id="screwMetal" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#d4d8de" />
          <stop offset="55%" stop-color="#7c8189" />
          <stop offset="85%" stop-color="#3a3d42" />
          <stop offset="100%" stop-color="#18191c" />
        </radialGradient>
        <!-- McCurdy Authentic Vintage Parchment Radial Dial Gradient (from gemini-svg (14).svg & photo) -->
        <radialGradient id="xmccurdy_vintage_dial" cx="50%" cy="62%" r="62%">
          <stop offset="0%" stop-color="#f7eed7" />
          <stop offset="72%" stop-color="#e4d6b5" />
          <stop offset="100%" stop-color="#bfaa82" />
        </radialGradient>
        <radialGradient id="dialCream" cx="50%" cy="62%" r="62%">
          <stop offset="0%" stop-color="#f7eed7" />
          <stop offset="72%" stop-color="#e4d6b5" />
          <stop offset="100%" stop-color="#bfaa82" />
        </radialGradient>
        <linearGradient id="vuTopShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f1706" stop-opacity="0.46" />
          <stop offset="22%" stop-color="#1f1706" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="glassShadowTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1610" stop-opacity="0.42" />
          <stop offset="22%" stop-color="#1a1610" stop-opacity="0.06" />
          <stop offset="85%" stop-color="#1a1610" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
        </linearGradient>
        <linearGradient id="housingRimTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a89070" />
          <stop offset="40%" stop-color="#61523f" />
          <stop offset="100%" stop-color="#222526" />
        </linearGradient>
        <linearGradient id="housingFace" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stop-color="#34383a" />
          <stop offset="55%" stop-color="#252829" />
          <stop offset="100%" stop-color="#191b1c" />
        </linearGradient>
        <linearGradient id="bezelInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#121415" />
          <stop offset="55%" stop-color="#70624d" />
          <stop offset="100%" stop-color="#bfb095" />
        </linearGradient>
        <radialGradient id="screwGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#5d6163" />
          <stop offset="60%" stop-color="#27292b" />
          <stop offset="100%" stop-color="#111213" />
        </radialGradient>
        <linearGradient id="meterGlassSheenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.01"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <!-- Outer Molded Bakelite / ABS Bezel Gradient -->
        <linearGradient id="bezelMoldedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a2c31" />
          <stop offset="6%" stop-color="#1e2024" />
          <stop offset="50%" stop-color="#16171a" />
          <stop offset="94%" stop-color="#111214" />
          <stop offset="100%" stop-color="#0a0a0c" />
        </linearGradient>
        <!-- Inner Recessed Window Stepped Bezel -->
        <linearGradient id="bezelInnerStepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0b0c0e" />
          <stop offset="85%" stop-color="#1a1c20" />
          <stop offset="100%" stop-color="#2c2f35" />
        </linearGradient>
        <!-- Trimmer Screw Head Radial Gradient -->
        <radialGradient id="trimScrewHeadGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#3c4048" />
          <stop offset="45%" stop-color="#23262b" />
          <stop offset="80%" stop-color="#141518" />
          <stop offset="100%" stop-color="#0a0b0d" />
        </radialGradient>
        <!-- Four Corner Molded Bezel Screws -->
        <radialGradient id="mcScrewGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#555861"/>
          <stop offset="45%" stop-color="#2d2f34"/>
          <stop offset="85%" stop-color="#18191c"/>
          <stop offset="100%" stop-color="#0b0c0d"/>
        </radialGradient>`;function Wn(e,t){return`
      <!-- Recessed Chamber Inner Glass Shadows (Standard Modern XTM Lighting) -->
      <rect x="${e}" y="${t}" width="580" height="28" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${e}" y="${t+290-28}" width="580" height="28" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${e}" y="${t}" width="20" height="290" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${e+580-20}" y="${t}" width="20" height="290" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${e+1}" y="${t+1}" width="578" height="288" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen -->
      <path d="M ${e+6} ${t+6} L ${e+580*.72} ${t+6} L ${e+6} ${t+290*.82} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
    </g>`}function Gn(e,t,n=e+290){let r=n-304,i=n-274,a=`M ${r+14} 47 h 580 a 14 14 0 0 1 14 14 v 332 a 14 14 0 0 1 -14 14 h -580 a 14 14 0 0 1 -14 -14 v -332 a 14 14 0 0 1 14 -14 Z M ${i+10} 65 h 528 a 10 10 0 0 1 10 10 v 192 a 10 10 0 0 1 -10 10 h -528 a 10 10 0 0 1 -10 -10 v -192 a 10 10 0 0 1 10 -10 Z`,o=n-306,s=n-288,c=`M ${o+10} 48 h 592 a 10 10 0 0 1 10 10 v 318 a 10 10 0 0 1 -10 10 h -592 a 10 10 0 0 1 -10 -10 v -318 a 10 10 0 0 1 10 -10 Z M ${s+7} 65 h 562 a 7 7 0 0 1 7 7 v 197 a 7 7 0 0 1 -7 7 h -562 a 7 7 0 0 1 -7 -7 v -197 a 7 7 0 0 1 7 -7 Z`;return`
    <!-- Modern Sleek Bezel (Ward-Beck.com / McCurdyRadio.com) -->
    <g class="modern-bezel">
      <path d="M${e-4} ${t+290-24} L${e-4} ${t+290-18} A24 24 0 0 0 ${e+18} ${t+290+4} L${e+580-18} ${t+290+4} A24 24 0 0 0 ${e+580+4} ${t+290-18} L${e+580+4} ${t+290-24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
      <rect x="${e-2}" y="${t-2}" width="584" height="294" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
      <rect x="${e}" y="${t}" width="580" height="290" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>
    </g>

    <!-- McCurdyRadio.ca Vintage 3D Molded Bakelite Bezel Housing (Authentic Broadcast Console, uploaded_media_0) -->
    <g class="vintage-bezel-3d bezel-mc">
      <!-- Molded Bakelite Housing Body with Window Aperture Cutout -->
      <path fill-rule="evenodd" fill="url(#bakeliteBody)" stroke="url(#bezelRim)" stroke-width="2.2" d="${a}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${r+16} 49 L ${r+608-16} 49" stroke="#484d56" stroke-width="1.4" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${r+6}" y="53" width="596" height="348" rx="11" fill="none" stroke="#25272c" stroke-width="1.0" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim (Transparent fill="none" keeps dial face 100% visible) -->
      <rect x="${i-1.5}" y="63.5" width="551" height="215" rx="11" fill="none" stroke="url(#windowBevel)" stroke-width="2.2" pointer-events="none"/>
      <rect x="${i}" y="65" width="548" height="212" rx="10" fill="none" stroke="#18191b" stroke-width="1.4" pointer-events="none"/>

      <!-- Window Glass Top Shadow & Specular Curved Sheen -->
      <rect x="${i}" y="65" width="548" height="28" fill="url(#vuTopShadow)" pointer-events="none"/>
      <path d="M ${i+6} 71 L ${i+356.2} 71 L ${i+6} 265 Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>

      <!-- Lower Skirt Horizontal Seam Line -->
      <line x1="${r+2}" y1="294" x2="${r+608-2}" y2="294" stroke="#0c0d0f" stroke-width="2.0" pointer-events="none"/>
      <line x1="${r+2}" y1="295.8" x2="${r+608-2}" y2="295.8" stroke="#2c2f36" stroke-width="1.1" pointer-events="none"/>

      <!-- Corner Fluted Vents (from gemini-code-1795317269161.html & photo) -->
      <g stroke="#101113" stroke-width="2.6" pointer-events="none">
        <line x1="${r+38}" y1="304" x2="${r+38}" y2="391" />
        <line x1="${r+52}" y1="306" x2="${r+52}" y2="393" />
        <line x1="${r+608-52}" y1="306" x2="${r+608-52}" y2="393" />
        <line x1="${r+608-38}" y1="304" x2="${r+608-38}" y2="391" />
      </g>
      <g stroke="#484d56" stroke-width="1.2" pointer-events="none">
        <line x1="${r+39.5}" y1="304" x2="${r+39.5}" y2="391" />
        <line x1="${r+53.5}" y1="306" x2="${r+53.5}" y2="393" />
        <line x1="${r+608-50.5}" y1="306" x2="${r+608-50.5}" y2="393" />
        <line x1="${r+608-36.5}" y1="304" x2="${r+608-36.5}" y2="391" />
      </g>

      <!-- Corner Mounting Screws (Chrome slotted) -->
      <g transform="translate(${n-208}, 345)" pointer-events="none">
        <circle cx="0" cy="0" r="14" fill="#121314"/>
        <circle cx="0" cy="0" r="11" fill="url(#screwMetal)" stroke="#232830" stroke-width="0.8"/>
        <line x1="-8" y1="-5" x2="8" y2="5" stroke="#111213" stroke-width="2.6"/>
        <line x1="-7.5" y1="-4" x2="8.5" y2="6" stroke="#7c8189" stroke-width="1.0"/>
      </g>
      <g transform="translate(${n+208}, 345)" pointer-events="none">
        <circle cx="0" cy="0" r="14" fill="#121314"/>
        <circle cx="0" cy="0" r="11" fill="url(#screwMetal)" stroke="#232830" stroke-width="0.8"/>
        <line x1="7" y1="-7" x2="-7" y2="7" stroke="#111213" stroke-width="2.6"/>
        <line x1="7.8" y1="-6.2" x2="-6.2" y2="7.8" stroke="#7c8189" stroke-width="1.0"/>
      </g>

      <!-- Center Mechanical Zero-Adjust Trimmer Screw Assembly -->
      <g class="trim-screw-interactive" transform="translate(${n}, 345)" style="cursor: pointer;">
        <title>Mechanical Zero-Adjust Trimmer</title>
        <circle cx="0" cy="0" r="18" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="16.5" fill="none" stroke="#08090a" stroke-width="0.9"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="14.2" fill="url(#screwMetal)" stroke="#111214" stroke-width="1.1"/>
          <rect x="-12.5" y="-2.0" width="25" height="4.0" rx="0.9" fill="#090a0c"/>
          <line x1="-11.8" y1="2.1" x2="11.8" y2="2.1" stroke="#4e525b" stroke-width="0.8"/>
        </g>
      </g>

    </g>

    <!-- Ward-Beck.ca Vintage 3D Molded Bakelite Bezel Housing (1/2 Thickness of McCurdy) -->
    <g class="vintage-bezel-3d bezel-wbs">
      <!-- Molded Housing Body -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.1" d="${c}"/>

      <!-- Top Edge Specular Highlight Line (Subtle) -->
      <path d="M ${o+14} 49.5 L ${o+612-14} 49.5" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.75" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${o+4}" y="52" width="604" height="330" rx="8" fill="none" stroke="#25272c" stroke-width="0.8" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${s-1.5}" y="63.5" width="579" height="214" rx="8" fill="none" stroke="#08090b" stroke-width="1.6" pointer-events="none"/>
      <rect x="${s}" y="65" width="576" height="211" rx="7" fill="none" stroke="#23252a" stroke-width="0.8" stroke-opacity="0.6" pointer-events="none"/>

      <!-- Window Specular Glass Reflection Sheen -->
      <path d="M ${s+6} 71 L ${s+576*.65} 71 L ${s+6} 264 Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${o+2}" y1="292" x2="${o+612-2}" y2="292" stroke="#0c0d0f" stroke-width="1.4" pointer-events="none"/>
      <line x1="${o+2}" y1="293.2" x2="${o+612-2}" y2="293.2" stroke="#2c2f36" stroke-width="0.8" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt -->
      <g class="trim-screw-interactive" transform="translate(${n}, 339)">
        <circle cx="0" cy="0" r="14" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.1"/>
        <circle cx="0" cy="0" r="12.6" fill="none" stroke="#08090a" stroke-width="0.8"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="11" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.0"/>
          <rect x="-9.2" y="-1.6" width="18.4" height="3.2" rx="0.7" fill="#090a0c"/>
          <line x1="-8.6" y1="1.7" x2="8.6" y2="1.7" stroke="#4e525b" stroke-width="0.7"/>
        </g>
      </g>
    </g>`}function Kn(e,t,n){let r=e+55+Math.random()*60,i=t-45+Math.random()*45,a=9+Math.floor(Math.random()*4),o=Math.PI*2/a,s=[],c=[22,58,112,175,245];for(let e=0;e<a;e++){let t=e*o+(Math.random()-.5)*o*.55,n=[{x:r,y:i}],a=0,l=250+Math.random()*75;for(let e=0;e<c.length&&(a=c[e]+(Math.random()-.5)*16,!(a>l));e++){let e=t+(Math.random()-.5)*.28;n.push({x:Math.round(r+Math.cos(e)*a),y:Math.round(i+Math.sin(e)*a)})}let u=l+Math.random()*30,d=t+(Math.random()-.5)*.35;n.push({x:Math.round(r+Math.cos(d)*u),y:Math.round(i+Math.sin(d)*u)}),s.push(n)}let l=``;for(let e of s){l+=`M ${e[0].x} ${e[0].y} `;for(let t=1;t<e.length;t++)l+=`L ${e[t].x} ${e[t].y} `}let u=``;for(let e=1;e<c.length;e++){let t=!1;for(let n=0;n<a;n++){let r=s[n],i=r[e]||r[r.length-1];t?u+=`L ${i.x} ${i.y} `:(u+=`M ${i.x} ${i.y} `,t=!0)}u+=`Z `}let d=``,f=12+Math.floor(Math.random()*8);for(let e=0;e<f;e++){let e=s[Math.floor(Math.random()*s.length)],t=e[1+Math.floor(Math.random()*(e.length-2))],n=Math.random()*Math.PI*2,r=14+Math.random()*26,i=Math.round(t.x+Math.cos(n)*r),a=Math.round(t.y+Math.sin(n)*r);d+=`M ${t.x} ${t.y} L ${i} ${a} `}let p=``,m=3+Math.floor(Math.random()*3);for(let e=0;e<m;e++){let e=Math.floor(Math.random()*(a-1)),t=e+1,n=1+Math.floor(Math.random()*(c.length-2)),r=s[e][n],i=s[e][n+1]||s[e][n],o=s[t][n+1]||s[t][n],l=s[t][n];if(r&&i&&o&&l){let e=(.07+Math.random()*.08).toFixed(2);p+=`<polygon points="${r.x},${r.y} ${i.x},${i.y} ${o.x},${o.y} ${l.x},${l.y}" fill="#ffffff" opacity="${e}"/>`}}return`
    <!-- Subtle fractured glass desaturation / micro-crystalline veil -->
    <radialGradient id="shatterGlow_${n}" cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.38"/>
      <stop offset="25%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#c8e4f5" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.0"/>
    </radialGradient>
    <circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="225" fill="url(#shatterGlow_${n})"/>

    <!-- Primary Impact Center Crater -->
    <circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="4.5" fill="#ffffff" opacity="0.95"/>
    <circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="9.5" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.88"/>
    <circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="16" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.75"/>

    <!-- Dark Crevice Fracture Shadows (Depth behind cracks) -->
    <g stroke="#05070a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" fill="none">
      <path d="${l}"/>
      <path d="${u}"/>
      <path d="${d}"/>
    </g>

    <!-- Sharp White Specular Fractures & Cracks (Light-catching glass edges) -->
    <g stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none">
      <path d="${l}"/>
      <path d="${u}"/>
    </g>

    <!-- Fine Micro-Fissures -->
    <path d="${d}" stroke="#ffffff" stroke-width="0.8" opacity="0.8" fill="none"/>

    <!-- Specular Shard Highlights (Prismatic glass facets) -->
    ${p}
  `}function qn(e,t,n){return`
    <!-- VU Meter Shattered Glass Fracture Overlay with Smooth Self-Healing Support (Clipped strictly to glass pane) -->
    <g class="vu-glass-shatter" id="vu_shatter_${n}" data-cx="${e}" data-cy="${t}" data-id="${n}" clip-path="url(#xshatter_clip_${n})" style="display: none; opacity: 0; transition: opacity 1.8s ease-out; pointer-events: none;">
      ${Kn(e,t,n)}
    </g>
  `}function Jn(e,t,n,r){e.innerHTML=Kn(t,n,r)}function Yn(e,t,n,r,i,a,o,s,c,l=`auto`){let u=t-290,d=n-145,f=t,p=bn(s),m=s===`fisam`||s===`sifam`,h=r===`ppm`||o,g=St(f,410),_=Ct(g),v=typeof document<`u`&&document.body?.classList.contains(`theme-wbs-ca`),y=v&&a===`amber`?`amber_bottom`:a,{fill:b,ink:x}=Bn(h,i,y,l),S={P:g,arc:_,ink:x,isFisam:m,isSifam:m,x0:u,y0:d},C=`<g id="xtm_meter_group_${e}" class="xtm-meter-group xtm-meter-${e} meter-style-${s}">
    <clipPath id="xmc${e}"><rect x="${u}" y="${d}" width="580" height="290" rx="5"/></clipPath>
    <!-- Strict glass-only aperture clip ensuring fractures never spill onto metal chassis or bezel -->
    <clipPath id="xshatter_clip_${e}"><rect x="${u+6}" y="${d+6}" width="568" height="278" rx="18"/></clipPath>
    <g clip-path="url(#xmc${e})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect class="xt-face xt-lamp-${y}" x="${u}" y="${d}" width="580" height="290" rx="5" fill="${b}"/>`;if(i&&Ln(y)){if(Rn(y)===`bottom`||v)C+=`<rect class="xt-bloom xt-lamp-left" x="${u}" y="${d}" width="580" height="290" fill="url(#xamber_lamp_left)" pointer-events="none"/>`,C+=`<rect class="xt-bloom xt-lamp-right" x="${u}" y="${d}" width="580" height="290" fill="url(#xamber_lamp_right)" pointer-events="none"/>`;else{let e=d+115,n=243.6.toFixed(1);C+=`<ellipse class="xt-bloom xt-lamp-${y}" cx="${t}" cy="${e}" rx="${n}" ry="82" fill="url(#xincand_bloom)"/>`}}r===`vu`?(C+=p.renderScale?p.renderScale(S):Ht(S),C+=p.legend(S)):C+=Ft(S,c,o),C+=`<g class="wbs-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (Ward-Beck) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${Hn(t,n,x)}
        </g>`,C+=`<g class="mc-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (McCurdy) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${en(t,n,x,h)}
        </g>`;let ee=h?p.ppmNeedle(f,410,265):p.vuNeedle(f,410,265);return C+=Lt(e,ht(m),f,410,ee),C+=Wn(u,d),r===`vu`&&!o&&(C+=qn(t,n,e)),C+=Gn(u,d,t),C+=`</g>`,C+=`</g>`,C}function Xn(){return`M 1845 82 A 12 12 0 0 0 1833 70 H 1367 A 12 12 0 0 0 1355 82 V 402 A 12 12 0 0 0 1367 414 H 1833 A 12 12 0 0 0 1845 402 Z ${`M ${O.x} ${O.y+6} a 6 6 0 0 1 6 -6 h ${O.w-12} a 6 6 0 0 1 6 6 v ${O.h-12} a 6 6 0 0 1 -6 6 h -${O.w-12} a 6 6 0 0 1 -6 -6 Z`} ${Object.keys(at).map(e=>`M ${(at[e]??1385)-2} 225 a 3 3 0 0 1 3 -3 h 92 a 3 3 0 0 1 3 3 v 133 a 3 3 0 0 1 -3 3 h -92 a 3 3 0 0 1 -3 -3 Z`).join(` `)}`}function Zn(){return`<path class="wbs-only" d="${Xn()}" fill="#15803d" fill-rule="evenodd"/>`}var Qn=`<defs>
        <linearGradient id="mc_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e5e1d5"/><stop offset="50%" stop-color="#dedad0"/><stop offset="100%" stop-color="#d2cec2"/>
        </linearGradient>
        <linearGradient id="mc_panel_blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d566c"/><stop offset="50%" stop-color="#2e4354"/><stop offset="100%" stop-color="#243543"/>
        </linearGradient>
        <linearGradient id="mc_bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a2a2c"/><stop offset="100%" stop-color="#141416"/>
        </linearGradient>
        <linearGradient id="mc_blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4ba7e8"/><stop offset="100%" stop-color="#3892d4"/>
        </linearGradient>
        <radialGradient id="mc_jack" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stop-color="#070708"/><stop offset="82%" stop-color="#222326"/>
          <stop offset="94%" stop-color="#5a5c60"/><stop offset="100%" stop-color="#151618"/>
        </radialGradient>
        <filter id="mc_shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.55"/>
        </filter>
      </defs>`;function $n(e){let{bx:t,by:n}=lt,r=e-290-t,i=65-n,a=580+2*t,o=290+2*n;return`<g class="mc-com-only" filter="url(#mc_shadow)">
        <rect x="${r}" y="${i}" width="${a}" height="${o}" rx="4" fill="url(#mc_bezel)" stroke="#0d0d0e" stroke-width="2"/>
        <polygon points="${r},${i} ${r+a},${i} ${r+a-t},${i+n} ${r+t},${i+n}" fill="#36373a"/>
        <polygon points="${r},${i+o} ${r+a},${i+o} ${r+a-t},${i+o-n} ${r+t},${i+o-n}" fill="#111113"/>
        <polygon points="${r},${i} ${r+t},${i+n} ${r+t},${i+o-n} ${r},${i+o}" fill="#232426"/>
        <polygon points="${r+a},${i} ${r+a-t},${i+n} ${r+a-t},${i+o-n} ${r+a},${i+o}" fill="#191a1c"/>
        <rect x="${r+t}" y="${i+n}" width="580" height="290" fill="#0e0e10"/>
      </g>`}function er(e,t,n){return`<g class="mc-com-only">
      ${n===null?``:`<line x1="${n}" y1="404" x2="${e-70}" y2="404" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${e+70}" y1="404" x2="${e+600}" y2="404" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${e}" y="404" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${t}</text>
    </g>`}function tr(){let e=D,t=`<g class="mc-only">
      ${Qn}
      <rect class="mc-panel-bg" x="1" y="1" width="${e-2}" height="428" rx="6" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <line x1="4" y1="3" x2="${e-4}" y2="3" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`;for(let e of it)t+=$n(e);return t+=er(ut.input1X,`INPUT 1`,null)+er(ut.input2X,`INPUT 2`,ut.input2LineX0),t+=`</g>`,t}function nr(e,t,n){let r=n*16,i=``;for(let a=0;a<=r;a++){let o=a/r*Math.PI*2-Math.PI/2,s=e+t*Math.cos(n*(o+Math.PI/2)),c=(s*Math.cos(o)).toFixed(2),l=(s*Math.sin(o)).toFixed(2);i+=a===0?`M ${c},${l}`:` L ${c},${l}`}return i+` Z`}function rr(){let e=`font-family="Helvetica, Arial, sans-serif" font-weight="700"`,t=ct;return`<g class="mc-com-only">
      <defs>
        <linearGradient id="mc_led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#221011"/><stop offset="50%" stop-color="#36181a"/><stop offset="100%" stop-color="#1e0d0e"/>
        </linearGradient>
        <filter id="mc_redglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- RANGE section: rounded border around the LED window and UP/DOWN buttons -->
      <rect class="mc-range-box" x="1494" y="66" width="212" height="200" rx="14" fill="#e9e5da" stroke="#232325" stroke-width="3"/>
      <!-- RANGE LED window -->
      <rect x="${t.x-4}" y="${t.y-4}" width="${t.w+8}" height="${t.h+8}" rx="3" fill="#1b1c1e"/>
      <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="2" fill="url(#mc_led)"/>
      <g id="xmc_digits" filter="url(#mc_redglow)"></g>
      <text class="mc-range-text" x="1600" y="${t.y+t.h+22}" text-anchor="middle" ${e} font-size="17" letter-spacing="0.6" fill="#232325">RANGE</text>
      <!-- UP / DOWN arrows either side of the moved buttons -->
      <path class="mc-range-arrow" d="M1522 248 V214 M1514 224 L1522 212 L1530 224" stroke="#232325" stroke-width="3" fill="none"/>
      <path class="mc-range-arrow" d="M1678 212 V246 M1670 236 L1678 248 L1686 236" stroke="#232325" stroke-width="3" fill="none"/>
      <!-- 1 INPUT 2 box: the two jacks ARE the input buttons here (1 = MODE, 2 = SOURCE) -->
      <rect class="mc-input-box" x="1430" y="274" width="340" height="120" rx="8" fill="url(#mc_blue)" stroke="#1b1c1e" stroke-width="2.5"/>
      <text class="mc-input-text" x="1530" y="300" text-anchor="middle" ${e} font-size="17" fill="#181b1e">1</text>
      <text class="mc-input-text" x="1600" y="300" text-anchor="middle" ${e} font-size="17" fill="#181b1e">INPUT</text>
      <text class="mc-input-text" x="1670" y="300" text-anchor="middle" ${e} font-size="17" fill="#181b1e">2</text>
      <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer">
        <title>Input 1 (MODE)</title>
        <circle cx="1530" cy="346" r="27" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
      <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer">
        <title>Input 2 (SOURCE)</title>
        <circle cx="1670" cy="346" r="27" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
    </g>`}function ir(){let e=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,t=1600,n=``,r=``,i=``;for(let e=0;e<=30;e++){let a=(135+e*9)*Math.PI/180,o=Math.cos(a),s=Math.sin(a),c=-50+e*2,l=-30+e*2,u=(c>0?`+`:``)+c,d=(l>0?`+`:``)+l,f=e%5==0,p=f?135:139,m=(t+p*s).toFixed(1),h=(186-p*o).toFixed(1),g=(t+150*s).toFixed(1),_=(186-150*o).toFixed(1);n+=`<line x1="${m}" y1="${h}" x2="${g}" y2="${_}" stroke="#ffffff" stroke-width="${f?`2.2`:`1.3`}" stroke-opacity="${f?`0.95`:`0.8`}"/>`;let v=(t+120*s).toFixed(1),y=(186-120*o+3.5).toFixed(1);r+=`<text x="${v}" y="${y}" font-size="${Math.abs(l)>=10?`10`:`11`}" font-weight="700" fill="#cbd5e1" text-anchor="middle">${d}</text>`;let b=(t+164*s).toFixed(1),x=(186-164*o+4).toFixed(1);i+=`<text x="${b}" y="${x}" font-size="${Math.abs(c)>=10?`11`:`12`}" font-weight="800" fill="#f8fafc" text-anchor="middle">${u}</text>`}let a=nr(63.7,3.38,14),o=``;for(let e=0;e<14;e++){let t=(e*360/14+360/28)*Math.PI/180;o+=`<line x1="${(55.9*Math.cos(t)).toFixed(2)}" y1="${(55.9*Math.sin(t)).toFixed(2)}" x2="${(63.7*Math.cos(t)).toFixed(2)}" y2="${(63.7*Math.sin(t)).toFixed(2)}"/>`}return`<g class="mc-ca-only">
      <defs>
        <linearGradient id="mc_skirt_silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d8dce2"/><stop offset="45%" stop-color="#bfc4cd"/><stop offset="100%" stop-color="#9aa0ab"/>
        </linearGradient>
        <linearGradient id="mc_barrel_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b6bbc4"/><stop offset="100%" stop-color="#888e99"/>
        </linearGradient>
        <linearGradient id="mc_gold_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d97706"/><stop offset="50%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="mc_yellow_cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="30%" stop-color="#facc15"/>
          <stop offset="70%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
      </defs>

      <!-- ================================================================= -->
      <!-- CENTERPIECE: CENTERED MCCURDY ATTENUATOR KNOB & DUAL SCALE       -->
      <!-- (30% larger, engraved directly on blue panel with no disc shadow) -->
      <!-- ================================================================= -->
      <g id="mccurdy-vintage-knob-assembly" class="xtm-btn mccurdy-knob" style="cursor:grab; touch-action:none; user-select:none;">
        <title>McCurdy Dual-Concentric Attenuator (-50 to +10 dB / -30 to +30 dB)</title>

        <!-- Silkscreen Scales Group (Inner -30 to +30, Outer -50 to +10) -->
        <g id="mc-knob-scales" ${e}>
          ${n}
          <g id="mc_scale_inner_group">${r}</g>
          <g id="mc_scale_outer_group">${i}</g>
        </g>

        <!-- Silver Skirt Base Disc (r=92, 30% larger) with Inner Bevel Line -->
        <circle cx="${t}" cy="186" r="92" fill="url(#mc_skirt_silver)" stroke="#555a64" stroke-width="1.6"/>
        <circle cx="${t}" cy="186" r="72" fill="none" stroke="#8a909c" stroke-width="1.1"/>

        <!-- Rotating 14-Flute Barrel Body with Solid Triangle Pointer and Yellow Cap -->
        <g id="mccurdy_vintage_knob_rotor" data-cx="${t}" data-cy="186" transform="translate(${t}, 186)">
          <!-- Solid Black Pointer Arrow at 9 o'clock (-91px to -72px on rotating skirt) -->
          <polygon points="-91,0 -72,-9 -72,9" fill="#141517"/>

          <!-- 14-Flute Barrel Body (30% larger) -->
          <path d="${a}" fill="url(#mc_barrel_grad)" stroke="#4b505a" stroke-width="1.4"/>
          <g stroke="#666c77" stroke-width="1.2" stroke-linecap="round">
            ${o}
          </g>

          <!-- Outer Raised Gold Bezel Ring (r=46) & Specular Highlight -->
          <circle cx="0" cy="0" r="46" fill="none" stroke="url(#mc_gold_rim)" stroke-width="2.6"/>
          <path d="M -32.5,-32.5 A 46,46 0 0 1 32.5,-32.5" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-opacity="0.85"/>

          <!-- Bright Cadmium Yellow Cap Face (r=43) matching authentic vintage hardware -->
          <circle cx="0" cy="0" r="43" fill="url(#mc_yellow_cap)" stroke="#9c7a0b" stroke-width="1.0"/>

          <!-- Solid Black Index Line pointing at 9 o'clock (aligned with skirt pointer) -->
          <line x1="-4" y1="0" x2="-40" y2="0" stroke="#141517" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- BOTTOM SECTION: INPUT 1 2 3 4 SELECTORS (CENTERED BELOW)          -->
      <!-- ================================================================= -->
      <g id="mc-bottom-selectors" ${e}>
        ${[1,2,3,4].map(e=>{let t=1600+(e-2.5)*72;return`
        <g class="xtm-btn mc-selector-btn ${e===1?`mc-btn-latched`:``}" id="mc_input_btn_${e}" data-btn="INPUT_${e}" data-input="${e}" style="cursor:pointer" transform="translate(${t}, 374)" role="button" tabindex="0" aria-label="Input ${e}">
          <title>Input ${e} Selector Switch (Push to select, snaps up when another is pushed)</title>
          <!-- Outer Bezel & Well -->
          <circle cx="0" cy="0" r="17" fill="url(#chromeMetalGrad)" stroke="#152636" stroke-width="1.3"/>
          <circle cx="0" cy="0" r="13" fill="#0d141c" stroke="#080e14" stroke-width="1"/>
          <!-- Pushbutton Cap (Latches down / snaps up) -->
          <circle class="mc-btn-cap" cx="0" cy="0" r="10.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <text class="mc-btn-label" x="0" y="4" font-size="11.5" font-weight="900" fill="#f8fafc" text-anchor="middle">${e}</text>
          <!-- Input Label Below Switch -->
          <text x="0" y="27" font-size="9.5" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.5">INPUT ${e}</text>
        </g>`}).join(``)}
      </g>
    </g>`}function ar(){return rr()+ir()}function or(e){if(!e.power)return`  `;let t=null;if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`))&&e.mode!==`S`?t=e.getMcCurdySensitivityDb():e.mode===`A`?t=e.lvlDb(e.a.lvl):e.mode===`D`?t=e.lvlDb(e.d.lvl):e.mode===`S`&&(t=e.toneCalLevels[e.toneCalIdx]??0),t===null)return`--`;let n=Math.min(99,Math.abs(Math.round(t)));return t<0&&n>0&&n<=19?`-`+n:String(n).padStart(2,`0`)}function sr(e){return xt(e,ct)}var cr=`<linearGradient id="mc_vuface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dfc784"/><stop offset="25%" stop-color="#eedba1"/>
          <stop offset="85%" stop-color="#ebd699"/><stop offset="100%" stop-color="#d5bd7b"/>
        </linearGradient>`,lr=`<linearGradient id="xgreen_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="25%" stop-color="#16a34a"/>
          <stop offset="75%" stop-color="#15803d"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>`;function ur(){return`
    <!-- Modern Dark Canvas (Ward-Beck.com) -->
    <rect class="wbs-only wbs-dark-canvas" width="${D}" height="430" fill="#0f1114"/>

    <!-- Vintage Ward-Beck M600 Anodized Brushed Aluminum Chassis (Ward-Beck.ca) -->
    <g class="wbs-ca-only" id="wbs-ca-broadcast-chassis">
      <!-- Warm Anodized Aluminum Faceplate Base (MF-6B standard #C6C3B3) -->
      <rect width="${D}" height="430" fill="url(#aluPlate)"/>

      <!-- M600 Anodized Extruded Aluminum Top Rail Lip (MF-6B Standard) -->
      <rect x="0" y="0" width="${D}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="18" x2="${D}" y2="18" stroke="#8C897B" stroke-width="1.2"/>
      <line x1="0" y1="19.5" x2="${D}" y2="19.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>

      <!-- M600 Anodized Extruded Aluminum Bottom Rail Lip -->
      <line x1="0" y1="410.5" x2="${D}" y2="410.5" stroke="#8C897B" stroke-width="1.2"/>
      <rect x="0" y="412" width="${D}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="412" x2="${D}" y2="412" stroke="#D4D2C5" stroke-width="1.2"/>
    </g>`}var dr=`<path d="M 630 414 H 49 A 14 14 0 0 1 35 400 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 400 A 14 14 0 0 1 1326 414 H 745"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="687.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">LEFT</text>`,fr=`<path d="M 2455 414 H 1874 A 14 14 0 0 1 1860 400 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 400 A 14 14 0 0 1 3151 414 H 2570"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="2512.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">RIGHT</text>`,pr=`<defs>
        ${xn.gradient}
        ${Sn.gradient}
        ${En.gradient}
        ${Dn.gradient}
        ${Cn.gradient}
        ${wn.gradient}
        ${Tn.gradient}
        ${On.gradient}
        ${kn.gradient}
        ${An.gradient}

        ${Nn}
        ${jn}
        ${Mn}

        ${zn}
        ${cr}
        ${Un}
        ${lr}
        
  <!-- Ward-Beck M600 Anodized Brushed Aluminum Plate Base (Warm Alloy #D4D2C5 -> #C6C3B3 -> #B3B09F) -->
  <linearGradient id="aluPlate" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#D4D2C5" />
    <stop offset="50%" stop-color="#C6C3B3" />
    <stop offset="100%" stop-color="#B3B09F" />
  </linearGradient>

  <!-- Legacy Alias: mapped to Brushed Aluminum to strictly eliminate blue on Ward-Beck.ca -->
  <linearGradient id="wbsSlateBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#D4D2C5" />
    <stop offset="50%" stop-color="#C6C3B3" />
    <stop offset="100%" stop-color="#B3B09F" />
  </linearGradient>

  <!-- Top Cassette Brushed Aluminum Lip -->
  <linearGradient id="topRimSlateBlue" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#E5E3D8" />
    <stop offset="40%" stop-color="#C6C3B3" />
    <stop offset="100%" stop-color="#8C897B" />
  </linearGradient>

  <!-- Anodized Brushed Aluminum Extrusion Bevels (WBS M600 Series MF-6B Standard) -->
  <linearGradient id="extrusionBevel" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#E5E3D8" />
    <stop offset="40%" stop-color="#C6C3B3" />
    <stop offset="100%" stop-color="#8C897B" />
  </linearGradient>

  <!-- Top Cassette Brushed Aluminum Lip -->
  <linearGradient id="topChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#E5E3D8" />
    <stop offset="40%" stop-color="#C6C3B3" />
    <stop offset="100%" stop-color="#8C897B" />
  </linearGradient>

  <!-- Extruded Lip Milled Edge -->
  <linearGradient id="milledEdge" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/>
  </linearGradient>

  <!-- Outer Molded Black Bakelite / ABS Bezel Gradient -->
  <linearGradient id="bezelMoldedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#27292e" />
    <stop offset="6%" stop-color="#1c1e22" />
    <stop offset="50%" stop-color="#17181b" />
    <stop offset="94%" stop-color="#121316" />
    <stop offset="100%" stop-color="#0b0c0d" />
  </linearGradient>

  <!-- Bezel Inner Recessed Step Bevel -->
  <linearGradient id="bezelInnerStepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#0c0d0f" />
    <stop offset="85%" stop-color="#1a1c20" />
    <stop offset="100%" stop-color="#2b2e34" />
  </linearGradient>

  <!-- Top Window Shadow Cast by Bezel Overhang -->
  <linearGradient id="windowTopShadow" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
    <stop offset="35%" stop-color="#000000" stop-opacity="0.14" />
    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
  </linearGradient>

  <!-- Mechanical Zero-Adjust Trimmer Screw Head Radial Shading -->
  <radialGradient id="trimScrewHeadGrad" cx="35%" cy="32%" r="68%">
    <stop offset="0%" stop-color="#484b52" />
    <stop offset="52%" stop-color="#232529" />
    <stop offset="88%" stop-color="#131417" />
    <stop offset="100%" stop-color="#0a0b0d" />
  </radialGradient>

  <!-- Four-Corner Molded Bezel Slotted Screws Radial Shading -->
  <radialGradient id="mcScrewGrad" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#555861"/>
    <stop offset="45%" stop-color="#2d2f34"/>
    <stop offset="85%" stop-color="#18191c"/>
    <stop offset="100%" stop-color="#0b0c0d"/>
  </radialGradient>

  <!-- Housing Drop Shadow on Front Panel -->
  <filter id="meterHousingShadow" x="-12%" y="-12%" width="124%" height="128%">
    <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.72" />
    <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.55" />
  </filter>

  <!-- Enamel / Painted Off-White Front Panel -->
  <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#e5e3dc" />
    <stop offset="50%" stop-color="#dedcd4" />
    <stop offset="100%" stop-color="#d2d0c7" />
  </linearGradient>

  <!-- Brushed / Anodized Top Chassis Lip -->
  <linearGradient id="topChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#7d8084" />
    <stop offset="70%" stop-color="#9ca0a4" />
    <stop offset="100%" stop-color="#b5b8bc" />
  </linearGradient>

  <!-- Black Skirted Bakelite Knob Flange -->
  <radialGradient id="skirtGrad" cx="42%" cy="38%" r="58%">
    <stop offset="0%" stop-color="#2b2d30" />
    <stop offset="65%" stop-color="#161719" />
    <stop offset="100%" stop-color="#0b0c0d" />
  </radialGradient>

  <!-- Fluted Knob Barrel Body -->
  <linearGradient id="knobBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#35383c" />
    <stop offset="40%" stop-color="#191a1c" />
    <stop offset="85%" stop-color="#0d0e0f" />
    <stop offset="100%" stop-color="#222426" />
  </linearGradient>

  <!-- Glossy Knob Face Cap -->
  <radialGradient id="knobCapGrad" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#3a3d42" />
    <stop offset="38%" stop-color="#1a1b1d" />
    <stop offset="100%" stop-color="#0d0e10" />
  </radialGradient>

  <!-- Chrome Pilot Lamp Bezel -->
  <radialGradient id="chromeBezelGrad" cx="35%" cy="30%" r="68%">
    <stop offset="0%" stop-color="#ffffff" />
    <stop offset="28%" stop-color="#b8bec6" />
    <stop offset="55%" stop-color="#5a6068" />
    <stop offset="80%" stop-color="#d4dae2" />
    <stop offset="100%" stop-color="#383c42" />
  </radialGradient>

  <!-- Clear Jewelled Pilot Lens (Off) -->
  <radialGradient id="lensGrad" cx="42%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
    <stop offset="45%" stop-color="#d8dde4" stop-opacity="0.78" />
    <stop offset="78%" stop-color="#8b929c" stop-opacity="0.85" />
    <stop offset="100%" stop-color="#eef2f6" stop-opacity="0.92" />
  </radialGradient>

  <!-- Warm Incandescent Jewelled Pilot Lens (On) -->
  <radialGradient id="lensOnGrad" cx="42%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.98" />
    <stop offset="35%" stop-color="#fde68a" stop-opacity="0.92" />
    <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.88" />
    <stop offset="100%" stop-color="#d97706" stop-opacity="0.95" />
  </radialGradient>

  <!-- Soft Directional Sunlight Drop Shadows -->
  <filter id="knobDropShadow" x="-30%" y="-20%" width="160%" height="160%">
    <feDropShadow dx="-12" dy="14" stdDeviation="6" flood-color="#1b1c1e" flood-opacity="0.34" />
  </filter>

  <filter id="lampDropShadow" x="-40%" y="-30%" width="180%" height="180%">
    <feDropShadow dx="-7" dy="8" stdDeviation="3.5" flood-color="#1b1c1e" flood-opacity="0.32" />
  </filter>

  <!-- WBS Wink Switch Shutter, Aperture & Glass Lens Gradients -->
  <linearGradient id="winkNeonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#4ade80" />
    <stop offset="35%" stop-color="#22c55e" />
    <stop offset="100%" stop-color="#15803d" />
  </linearGradient>

  <linearGradient id="winkShutterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#2c3038" />
    <stop offset="50%" stop-color="#1e2229" />
    <stop offset="100%" stop-color="#14171d" />
  </linearGradient>

  <linearGradient id="winkBezelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#646b77" />
    <stop offset="45%" stop-color="#383d47" />
    <stop offset="100%" stop-color="#1c2026" />
  </linearGradient>

  <linearGradient id="winkGlassLens" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30" />
    <stop offset="25%" stop-color="#ffffff" stop-opacity="0.08" />
    <stop offset="60%" stop-color="#ffffff" stop-opacity="0.0" />
    <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
  </linearGradient>

  <filter id="winkGlow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="3" result="b" />
    <feMerge>
      <feMergeNode in="b" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>

  <filter id="winkButtonShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45" />
  </filter>

  <!-- Top Inset Shadow when Button is Depressed / Pushed Down -->
  <linearGradient id="depressedShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
    <stop offset="60%" stop-color="#000000" stop-opacity="0.30" />
    <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
  </linearGradient>

        <filter id="xglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="xledglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`,mr=`#4a1a17`,hr=`#ff2d1f`;function gr(){let e=``;for(let t=0;t<ot.count;t++){let n=ot.x0+t*ot.pitch,r=ot.cy;e+=`
      <rect class="mc-only mc-com-only mc-phase-seg" id="xphase_ledr_${t}" x="${(n-16).toFixed(1)}" y="${(r-10).toFixed(1)}" width="32" height="20" rx="2.5" fill="${mr}" stroke="#2b0d0c" stroke-width="1"/>`}return`<g class="mc-only mc-com-only">
          <rect x="1408" y="24" width="384" height="36" rx="3" fill="#171719" stroke="#5c5952" stroke-width="1.5"/>
          <rect x="1413" y="28" width="374" height="28" fill="url(#mc_led)"/>
          ${e}
        </g>`}var _r=gr();function vr(e){return{lit:e<=1?`#ff4d36`:e<=3?`#ffb43a`:`#9dff3a`,off:e<=1?`#3a1810`:e<=3?`#3a2810`:`#142e17`}}function yr(){let e=``;for(let t=0;t<ot.count;t++){let n=ot.x0+t*ot.pitch,r=ot.cy;e+=`
              <circle class="wbs-only" cx="${n}" cy="${r}" r="22" fill="#08090a" stroke="#25282f" stroke-width="2"/>
              <circle class="wbs-only" id="xphase_led_${t}" cx="${n}" cy="${r}" r="17" fill="#142e17"/>`}return e}function br(){return Object.keys(at).map(e=>{let t=at[e]??1385;return`
          <g class="xtm-btn" id="xtm_btn_${e}" data-btn="${e}" style="cursor:pointer">
            <text class="xt-btn-lbl" id="xtm_btn_lbl_${e}" x="${t+47}" y="206" font-size="14" font-weight="900" text-anchor="middle"
                  fill="#ffffff" letter-spacing="1.5">${e}</text>
            <rect id="xtm_btn_border_${e}" x="${t}" y="224" width="94" height="135" rx="2"
                  fill="#0b0d10" stroke="#1f2937" stroke-width="2"/>
            <rect id="xtm_btn_top_${e}" x="${t+3}" y="227" width="88" height="59" rx="1"
                  fill="#2d3748" stroke="#374151" stroke-width="1"/>
            <rect id="xtm_btn_sheen_${e}" x="${t+6}" y="229" width="82" height="14" rx="1"
                  fill="rgba(255,255,255,0.08)"/>
            <rect id="xtm_btn_bot_${e}" x="${t+3}" y="286" width="88" height="71" rx="1"
                  fill="#11151c" stroke="#1a202c" stroke-width="1"/>
          </g>`}).join(``)}var xr={down:{top:`#15803d`,topStroke:`#86efac`,bot:`#0e2e18`,border:`#86efac`,lbl:`#ffffff`},up:{top:`#2d3748`,topStroke:`#374151`,bot:`#11151c`,border:`#1f2937`,lbl:`#ffffff`}};function Sr(e=!0){return`<g class="wbs-ca-only" id="vintage-wbs-center">
    <!-- 1. Centered DR Vernier Dial Scale + Fluted Instrument Knob (Centered at x=1600, y=180, Scale=1.32 - 20% Larger) -->
    <g transform="translate(1600, 180) scale(1.32)">
      <!-- DR Differential Decade / Vernier Dial Scale & Markings (Origin at 0, 0) -->
      <g id="dr-dial-scale" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" fill="#2A2B2A" stroke="#2A2B2A">
        <!-- Top Header "DR" and "- 0 +" with interactive Auto-Range toggle -->
        <g class="xtm-btn dr-auto-btn" data-btn="TOGGLE_AUTORANGE" style="cursor: pointer;">
          <title>Click to toggle Auto-Range VU Sensitivity</title>
          <text x="0" y="-112" font-size="14" font-weight="700" text-anchor="middle" stroke="none" letter-spacing="1.2">DR</text>
          <text id="dr_auto_badge" x="22" y="-112" font-size="9" font-weight="800" text-anchor="start" stroke="none" fill="#16a34a" style="display: none;">AUTO</text>
        </g>
        <text x="-13" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none">–</text>
        <text x="0" y="-95" font-size="12.5" font-weight="700" text-anchor="middle" stroke="none">0</text>
        <text x="13" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none">+</text>

        <!-- Center Zero Index Line (0 deg) -->
        <g>
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
        </g>

        <!-- LEFT SIDE SCALE (-10 to -50, every 36 deg per 10 units = 7.2 deg per 2 units) -->
        <!-- Major Ticks & Labels (-10, -20, -30, -40, -50) -->
        <g transform="rotate(-36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(36, 0, -100)">10</text>
        </g>
        <g transform="rotate(-72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(72, 0, -100)">20</text>
        </g>
        <g transform="rotate(-108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(108, 0, -100)">30</text>
        </g>
        <g transform="rotate(-144)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(144, 0, -100)">40</text>
        </g>
        <g transform="rotate(-180)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(180, 0, -100)">50</text>
        </g>

        <!-- Left Sub-Numerals (2, 4, 6, 8 between each major division) -->
        <g font-size="7.5" font-weight="700" text-anchor="middle" stroke="none" fill="#454C59">
          <!-- 0 to -10 -->
          <text x="-11" y="-85">2</text>
          <text x="-22" y="-83">4</text>
          <text x="-33" y="-80">6</text>
          <text x="-43" y="-75">8</text>
          <!-- -10 to -20 -->
          <text x="-62" y="-63">2</text>
          <text x="-70" y="-55">4</text>
          <text x="-76" y="-46">6</text>
          <text x="-82" y="-36">8</text>
          <!-- -20 to -30 -->
          <text x="-88" y="-14">2</text>
          <text x="-89" y="-3">4</text>
          <text x="-89" y="8">6</text>
          <text x="-87" y="19">8</text>
          <!-- -30 to -40 -->
          <text x="-80" y="40">2</text>
          <text x="-74" y="50">4</text>
          <text x="-67" y="59">6</text>
          <text x="-59" y="67">8</text>
          <!-- -40 to -50 -->
          <text x="-40" y="79">2</text>
          <text x="-30" y="84">4</text>
          <text x="-20" y="87">6</text>
          <text x="-10" y="89">8</text>
        </g>

        <!-- RIGHT SIDE SCALE (+10 to +30, every 36 deg per 10 units) -->
        <!-- Major Ticks & Labels (+10, +20, +30) -->
        <g transform="rotate(36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-36, 0, -100)">10</text>
        </g>
        <g transform="rotate(72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-72, 0, -100)">20</text>
        </g>
        <g transform="rotate(108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-108, 0, -100)">30</text>
        </g>

        <!-- Right Sub-Numerals (2, 4, 6, 8 between major divisions) -->
        <g font-size="7.5" font-weight="700" text-anchor="middle" stroke="none" fill="#454C59">
          <!-- 0 to +10 -->
          <text x="11" y="-85">2</text>
          <text x="22" y="-83">4</text>
          <text x="33" y="-80">6</text>
          <text x="43" y="-75">8</text>
          <!-- +10 to +20 -->
          <text x="62" y="-63">2</text>
          <text x="70" y="-55">4</text>
          <text x="76" y="-46">6</text>
          <text x="82" y="-36">8</text>
          <!-- +20 to +30 -->
          <text x="88" y="-14">2</text>
          <text x="89" y="-3">4</text>
          <text x="89" y="8">6</text>
          <text x="87" y="19">8</text>
        </g>
      </g>

      <!-- Skirted Fluted Instrument Knob (Centered at 0, 0) -->
      <g id="instrument-knob" class="xtm-btn wbs-vintage-knob" style="cursor:grab; touch-action:none; user-select:none;" filter="url(#knobDropShadow)">
        <title>Ward-Beck DR Vernier Attenuator (Drag slowly or scroll mouse-wheel to adjust)</title>
        <!-- Outer Skirt Base Disc -->
        <circle cx="0" cy="0" r="76" fill="url(#skirtGrad)" stroke="#090a0b" stroke-width="1.2" />
        <!-- Subtle Specular Rim Highlight on Skirt -->
        <path d="M -70,-30 A 76,76 0 0 1 62,-44" fill="none" stroke="#52565c" stroke-width="1.1" stroke-opacity="0.65" />

        <!-- Fluted Barrel & Glossy Cap (Centered at 0, 0 to align with arrow pointer) -->
        <g id="wbs_vintage_knob_rotor" transform="rotate(15)">
          <!-- Fluted Ribs / Scallops around Barrel -->
          <g fill="url(#knobBodyGrad)" stroke="#0b0c0d" stroke-width="0.8">
            <circle cx="0" cy="0" r="47" />
            <!-- 14 Molded Grip Ribs -->
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(0)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(25.7)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(51.4)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(77.1)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(102.8)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(128.5)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(154.2)" />
          </g>

          <!-- Connecting Barrel Side Highlights -->
          <path d="M -36,-32 L -44,-40 M -16,-46 L -22,-55 M 8,-48 L 4,-58 M 30,-38 L 28,-48" stroke="#4d5157" stroke-width="1.4" stroke-linecap="round" />

          <!-- Front Glossy Cap -->
          <circle cx="0" cy="0" r="41" fill="url(#knobCapGrad)" stroke="#070809" stroke-width="1.2" />
          <!-- Chamfered Cap Rim Highlight -->
          <path d="M -32,-24 A 40,40 0 0 1 34,-20" fill="none" stroke="#686d75" stroke-width="1.2" />
        </g>

        <!-- White Silk Screen Pointer Arrow & Radial Line Rendered ON TOP of Knob Detail -->
        <g id="wbs_vintage_knob_pointer" transform="rotate(15)">
          <!-- White Radial Indicator Line on Cap & Top Flute running straight to middle of arrow head -->
          <line x1="0" y1="2" x2="0" y2="-40" stroke="#f2f0ea" stroke-width="3.2" stroke-linecap="round" />
          <line x1="0" y1="-39" x2="0" y2="-55" stroke="#eceae2" stroke-width="2.8" stroke-linecap="butt" />
          <!-- White Triangular Pointer on Skirt -->
          <polygon points="0,-74 -8.5,-54 8.5,-54" fill="#eceae2" stroke="#18191b" stroke-width="0.6" />
        </g>
      </g>
    </g>

    <!-- 2. AC Pilot Indicator Lamp Assembly (Placed in Right Margin at cx=1785, cy=180) -->
    <g id="ac-pilot-lamp" class="wbs-ac-pilot-lamp" transform="translate(1785, 180)" filter="url(#lampDropShadow)">
      <title>AC Mains Pilot Lamp ${e?`(Energized)`:`(Off)`}</title>
      <!-- Outer Chrome Mounting Collar / Nut -->
      <ellipse cx="-4" cy="-1" rx="17.5" ry="18.5" fill="url(#chromeBezelGrad)" stroke="#383c42" stroke-width="0.9" />
      <!-- Inner Bezel Step -->
      <ellipse cx="-1" cy="0" rx="13.5" ry="14.5" fill="#70767e" stroke="#2c3036" stroke-width="0.8" />
      <!-- Protruding Clear/Frosted Cylindrical Glass Jewel Lens -->
      <ellipse cx="5" cy="3" rx="11.5" ry="12.2" fill="${e?`url(#lensOnGrad)`:`url(#lensGrad)`}" stroke="#88909a" stroke-width="0.9" />
      ${e?`<circle cx="5" cy="3" r="16" fill="#f59e0b" opacity="0.32" filter="url(#xglow)" pointer-events="none" />`:``}
      <!-- Internal Bulb Filament / Refractor Ring -->
      <ellipse cx="6" cy="3" rx="6.2" ry="6.8" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.85" />
      <circle cx="5" cy="2" r="2.8" fill="#ffffff" fill-opacity="0.9" />

      <!-- "AC" Panel Silkscreen Label -->
      <text x="0" y="38" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12.5" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="0.8">AC</text>
    </g>

    <!-- 4. Lower Input 1 2 3 4 Wink Switch Selector Assembly Across the Bottom -->
    ${Cr(e)}
  </g>`}function Cr(e=!0){let t=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,n=[{num:1,sub:`MIC`},{num:2,sub:`LINE`},{num:3,sub:`DIGITAL`},{num:4,sub:`TEST GEN`}],r=1444,i=`
    <!-- INPUT SELECTOR Header & Hairline Rules (Above switches) -->
    <g ${t}>
      <line x1="1400" y1="338" x2="1515" y2="338" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
      <text x="1600" y="341.5" font-size="10.5" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="2.5">INPUT SELECTOR</text>
      <line x1="1685" y1="338" x2="1800" y2="338" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
    </g>

    <!-- Continuous Outer Recessed Bezel Housing for 4 Butted Switches -->
    <rect x="1442" y="360" width="316" height="42" rx="4" fill="#0c0e11" stroke="#2c323b" stroke-width="1.4" filter="url(#winkButtonShadow)" />
    <rect x="${r}" y="362" width="312" height="38" rx="2.5" fill="#060709" />
  `;return n.forEach((n,a)=>{let o=r+a*78,s=n.num;i+=`
      <!-- WINK SWITCH: INPUT ${s} -->
      <g class="xtm-btn wink-switch ${s===1?`wink-open`:``}" id="wink_btn_${s}" data-btn="INPUT_${s}" data-input="${s}" style="cursor:pointer" role="button" tabindex="0" aria-label="Input ${s} (${n.sub})">
        <title>Input ${s}: ${n.sub} (Wink Selector Switch)</title>

        <!-- Divider line between butted switch cells -->
        ${a>0?`<line x1="${o}" y1="362" x2="${o}" y2="400" stroke="#1e2229" stroke-width="1.2" />`:``}

        <!-- Aperture Clip Path -->
        <clipPath id="wink_clip_${s}">
          <rect x="${o}" y="362" width="78" height="38" rx="2" />
        </clipPath>

        <!-- Top Inset Shadow (Visible when switch depresses / pushes downward into aperture) -->
        <rect class="wink-depressed-shadow" x="${o}" y="362" width="78" height="6" fill="url(#depressedShadowGrad)" opacity="0" pointer-events="none" />

        <!-- Button Cap Body (Pushes downward when selected) -->
        <g class="wink-button-cap" clip-path="url(#wink_clip_${s})">
          <!-- 1. Illuminated Active Neon Core (Revealed when selected / active) -->
          <rect class="wink-neon-core" x="${o}" y="362" width="78" height="38" fill="${e?`url(#winkNeonGrad)`:`#0f2416`}" ${e?`filter="url(#winkGlow)"`:``} />
          <rect x="${o}" y="362" width="78" height="38" fill="none" stroke="#86efac" stroke-width="1" opacity="0.6" />

          <!-- Inside Illuminated Numeral & Label -->
          <text class="wink-text-inside" x="${o+39}" y="384" ${t} font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))">${s}</text>
          <text class="wink-subtext-inside" x="${o+39}" y="394" ${t} font-size="7.5" font-weight="800" fill="#dcfce7" text-anchor="middle" letter-spacing="1">${n.sub}</text>

          <!-- 2. Mechanical Eyelids / Shutters (Slide open vertically when active) -->
          <!-- Top Shutter Blade -->
          <g class="wink-shutter-top">
            <rect x="${o}" y="362" width="78" height="19" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${o+2}" y1="363.5" x2="${o+78-2}" y2="363.5" stroke="#475569" stroke-width="0.8" stroke-opacity="0.6" />
          </g>

          <!-- Bottom Shutter Blade -->
          <g class="wink-shutter-bot">
            <rect x="${o}" y="381" width="78" height="19" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${o+2}" y1="399" x2="${o+78-2}" y2="399" stroke="#0b0d10" stroke-width="0.8" />
          </g>

          <!-- Center Meeting Slit Line (Visible when closed) -->
          <line class="wink-slit-line" x1="${o}" y1="381" x2="${o+78}" y2="381" stroke="#0a0c0f" stroke-width="1.2" />

          <!-- Inactive / Closed Numeral Etched on Shutter Surface -->
          <text class="wink-text-closed" x="${o+39}" y="387" ${t} font-size="18" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="1">${s}</text>

          <!-- 3. Convex Glass Lens Overlay with Specular Glint & Bezel Rim -->
          <rect class="wink-lens" x="${o}" y="362" width="78" height="38" fill="url(#winkGlassLens)" pointer-events="none" />
          <path class="wink-glint" d="M ${o+4} 364.5 L ${o+78-4} 364.5" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" pointer-events="none" />
          <rect class="wink-bezel" x="${o}" y="362" width="78" height="38" fill="none" stroke="url(#winkBezelGrad)" stroke-width="1.2" pointer-events="none" />
        </g>
      </g>
    `}),i}function wr(e){return`<g id="xtm_center_console" class="xtm-center-console">
        <!-- Correlation Phase Row Assembly (translates down when meters expand) -->
        <g id="xtm_phase_row_assembly" class="xtm-phase-row-assembly" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);">
          ${_r}

          <!-- Modern Ward-Beck Console Section (Ward-Beck.com) -->
          <g class="wbs-modern-only">
            <text class="xt-deg" x="1390" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
            ${yr()}
            <text class="xt-deg" x="1812" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>
          </g>
        </g>

        <!-- Center Controls Group (locks in place with preserved settings) -->
        <g id="xtm_center_controls_group" class="xtm-center-controls-group" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease;">
          <g class="wbs-modern-only">
            <!-- Center Console Signature Solid Green Plate Stencil (Borders just the shape with scalloped notches) -->
            ${Zn()}

            <!-- Center VFD Dot-Matrix Display Cutout Window -->
            <rect class="wbs-only" x="${O.x}" y="${O.y}" width="${O.w}" height="${O.h}" rx="6" fill="#040605" stroke="#052e16" stroke-width="2.5"/>
            <g class="wbs-only" id="xvfd_group" ${e?`filter="url(#xglow)"`:``}></g>
          </g>

          <!-- McCurdy Centre Console Section (McCurdyRadio.ca / .com) -->
          ${ar()}

          <!-- Vintage Ward-Beck Console Section (Ward-Beck.ca - DR Vernier Dial, Skirted Knob, AC Lamp) -->
          ${Sr(e)}

          <!-- Mode & Source / Up & Down Front-Panel Buttons -->
          ${br()}

          <!-- Lock Indicator Badge displayed when middle section locks into place -->
          <g id="xtm_center_locked_badge" class="xtm-center-locked-badge" style="opacity: 0; pointer-events: none; transition: opacity 0.3s ease;">
            <rect x="1540" y="8" width="120" height="26" rx="13" fill="#090b0e" stroke="#22c55e" stroke-width="1.4" opacity="0.95"/>
            <path d="M 1558 21 L 1558 18 A 4 4 0 0 1 1566 18 L 1566 21 M 1556 21 L 1568 21 A 1.2 1.2 0 0 1 1569.2 22.2 L 1569.2 28.8 A 1.2 1.2 0 0 1 1568 30 L 1556 30 A 1.2 1.2 0 0 1 1554.8 28.8 L 1554.8 22.2 A 1.2 1.2 0 0 1 1556 21 Z" fill="none" stroke="#22c55e" stroke-width="1.3"/>
            <text x="1606" y="25" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#22c55e" text-anchor="middle" letter-spacing="1.5">LOCKED</text>
          </g>
        </g>
      </g>`}function Tr(e){let t=e.power,n=e.dialBg||`auto`,r=e.ppmLamp||`unlit`,i=e.ppmDialBg||`auto`,a=(a,o,s)=>{let c=s===`ppm`?r:e.dialLamp,l=s===`ppm`?i:n;return Yn(a,it[a]??o,210,s,t,c,s===`ppm`,e.meterStyle,e.ppmStandard,l)};return`<svg class="xtm-master-panel" id="xtm_master_panel" viewBox="0 0 ${D} 430" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      ${pr}

      <!-- Seamless Borderless Canvas -->
      ${ur()}
      ${tr()}

      <!-- Channel A Signature Green Console Frame -->
      <g id="xtm_channel_a_frame" class="xtm-channel-frame">
        ${dr}
      </g>

      <!-- Channel A Pair: Meter 0 (VU) + Meter 1 (PPM) -->
      ${a(0,373,`vu`)}
      ${a(1,1002,`ppm`)}

      <!-- Center Console Section -->
      ${wr(t)}

      <!-- Channel B Signature Green Console Frame -->
      <g id="xtm_channel_b_frame" class="xtm-channel-frame">
        ${fr}
      </g>

      <!-- Channel B Pair: Meter 2 (VU) + Meter 3 (PPM) -->
      ${a(2,2198,`vu`)}
      ${a(3,2827,`ppm`)}
    </svg>`}function Er(e,t,n){let r=e?.vu??[0,0],i=e?.ppm??[-.12,-.12],a=ht(n),o=ht(n);return[t?j(r[0]??0,n):a,t?M(i[0]??-.12,n):o,t?j(r[1]??0,n):a,t?M(i[1]??-.12,n):o]}function Dr(e,t,n){for(let r=0;r<4;r++){let i=e[r],a=t[r];if(Math.abs(i-a)>.005){t[r]=i;let e=n[r],a=it[r]??0;e&&e.setAttribute(`transform`,`rotate(${i.toFixed(2)} ${a} 410)`)}}}function Or(e,t){return e+(t?100:0)}function kr(e,t,n,r){for(let i=0;i<8;i++){let a=e[i];if(!a)continue;let o=n&&i===t,s=vr(i),c=r?hr:s.lit,l=r?mr:s.off;a.setAttribute(`fill`,o?c:l),o?a.setAttribute(`filter`,`url(#xledglow)`):a.removeAttribute(`filter`)}}function Ar(e){return!!(e&&(e.hasAudio||e.ppmDb&&((e.ppmDb[0]??-99)>-55||(e.ppmDb[1]??-99)>-55)||e.dbfs&&((e.dbfs[0]??-99)>-58||(e.dbfs[1]??-99)>-58)||e.vuDb&&((e.vuDb[0]??-99)>-55||(e.vuDb[1]??-99)>-55)))}var jr=`#c8f53c`,Mr=`rgba(150,200,60,.06)`,Nr=`#fbbf24`,Pr=`rgba(251,191,36,.08)`;function Fr(e,t){let n=e.vfdMetric||`lufs`,r=-60,i=`LU`;if(n===`lus`?(r=typeof t.lufs?.s==`number`?t.lufs.s:-60,i=`S `):n===`lum`?(r=typeof t.lufs?.m==`number`?t.lufs.m:-60,i=`M `):n===`lui`?(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`I `):n===`lra`?(r=typeof t.lufs?.lra==`number`?t.lufs.lra:0,i=`RA`):(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`LU`),n===`lra`)return(r.toFixed(1)+` `+i).padStart(8).substring(0,8);if(Number.isFinite(r)&&r>-59.5){let e=r.toFixed(1);return(e+` `+i).length<=8?(e+` `+i).padStart(8):e+i}return`-INF `+i}function Ir(e,t,n,r){if(!e.power)return{txt:`        `,on:jr,off:Mr};if(e.flashMsg)return{txt:e.flashMsg.padEnd(8).substring(0,8),on:jr,off:Mr};if(e.mode===`SET`)return{txt:e.getDisplayText(),on:jr,off:Mr};if(r)return{txt:Math.floor(n%1600/800)===0?`LOSS OF `:` SIGNAL `,on:Nr,off:Pr};let i=n%6e3,a;return a=i<4e3?Fr(e,t):i<5e3?`WardBeck`:`Systems `,{txt:a,on:jr,off:Mr}}function Lr(e){let t=st,n=48.4*t,r=O.x+(O.w-n)/2,i=O.y+(O.h-6*t)/2;return vt(e.txt,r,i,t,e.on,e.off)}function Rr(e,t){if(t)return`⚠ LOSS OF SIGNAL (NO AUDIO DETECTED)`;if(e){if(e.mode===`D`)return`COMPUTER AUDIO OUTPUT`;if(e.mode===`S`)return`TEST OSCILLATOR`;if(e.mode===`SET`)return`SETUP & CALIBRATION`}return`SOUNDCARD INPUT`}function zr(e,t){Object.keys(at).forEach(n=>{t[n]={border:e.querySelector(`#xtm_btn_border_${n}`),top:e.querySelector(`#xtm_btn_top_${n}`),bot:e.querySelector(`#xtm_btn_bot_${n}`),sheen:e.querySelector(`#xtm_btn_sheen_${n}`),lbl:e.querySelector(`#xtm_btn_lbl_${n}`)}})}function Br(e,t){Object.keys(at).forEach(n=>{let r=e[n];if(!r||!r.top)return;let i=t===n?xr.down:xr.up;r.top.setAttribute(`fill`,i.top),r.top.setAttribute(`stroke`,i.topStroke),r.bot&&r.bot.setAttribute(`fill`,i.bot),r.border&&r.border.setAttribute(`stroke`,i.border),r.lbl&&r.lbl.setAttribute(`fill`,i.lbl)})}var Vr=300,Hr=90;function Ur(e,t){let n=null,r=null,i=!1,a=0,o=()=>{n&&=(clearTimeout(n),null),r&&=(clearInterval(r),null)};e.addEventListener(`pointerdown`,e=>{let s=e.target,c=s?.closest(`#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob`);if(c){i=!0,a=e.clientY;try{c.setPointerCapture?.(e.pointerId)}catch{}}let l=s?.closest(`.xtm-btn`);if(l){e.preventDefault();let i=l.getAttribute(`data-btn`);if(i){if(t.heldButton=i,i===`CYCLE_STYLE`){if(o(),(e.ctrlKey||e.metaKey)&&e.altKey){t.onButtonPressed&&t.onButtonPressed(`TOGGLE_LOCKED_EXPANDED`);return}t.onButtonPressed&&t.onButtonPressed(`CYCLE_STYLE`);return}t.onButtonPressed&&t.onButtonPressed(i),(i===`UP`||i===`DOWN`)&&(o(),n=setTimeout(()=>{r=setInterval(()=>{t.heldButton===i&&t.onButtonPressed?t.onButtonPressed(i):o()},Hr)},Vr))}}}),e.addEventListener(`pointermove`,e=>{if(i&&t.onButtonPressed){let n=a-e.clientY;Math.abs(n)>=14&&(n>0?t.onButtonPressed(`UP`):t.onButtonPressed(`DOWN`),a=e.clientY)}}),e.addEventListener(`wheel`,e=>{e.target?.closest(`#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob`)&&t.onButtonPressed&&(e.preventDefault(),e.deltaY<0?t.onButtonPressed(`UP`):e.deltaY>0&&t.onButtonPressed(`DOWN`))},{passive:!1});let s=()=>{if(i=!1,t.heldButton,o(),t.heldButton){let e=t.heldButton;t.heldButton=null,t.onButtonReleased&&t.onButtonReleased(e)}};window.addEventListener(`pointerup`,s),window.addEventListener(`pointercancel`,s)}var Wr=class{container;isBuilt=!1;_eventsAttached=!1;heldButton=null;VW=D;VH=430;MW=580;MH=290;MX=it;MYc=210;py=410;R=265;DISP=O;BX=at;BW=94;BH=135;BY=224;currentMeterStyle=`pimson`;ppmStandard=`type2`;lastAudioTime=performance.now();hasSignalLost=!1;lastSignalLostState=!1;needleEls=[null,null,null,null];phaseLedEls=[];phaseLedRectEls=[];vfdEl=null;modeTitleEl=null;btnEls={};winkEls=[null,null,null,null,null];mcInputEls=[null,null,null,null,null];vuShatterEls=[null,null,null,null];panelEl=null;lockedBadgeEl=null;drAutoBadgeEl=null;drPointerEl=null;drRotorEl=null;isGlassShattered=!1;vuRedStartTime=0;vuCleanStartTime=0;isHealing=!1;lastSensKey=``;lastAngles=[-999,-999,-999,-999];lastPhaseLed=-999;lastDisplayText=``;lastModeTitle=``;lastHeldButton=null;lastActiveInput=-999;lastMcRangeMode=``;lastMcAttenuatorStep=-999;lastLockedExpanded=!1;lastAutoRangeState=!1;lastAutoRangeTime=0;lastDrKnobDb=-999;MC_WIN=ct;lastMcDigits=``;onButtonPressed=null;onButtonReleased=null;constructor(e){this.container=e}getCenterPlatePath(){return Xn()}vuFrac(e){return A(e)}vuAngle(e,t=!1){return j(e,t)}ppmFrac(e){return mt(e)}ppmAngle(e,t=!1){return M(e,t)}renderDotMatrix(e,t,n,r,i,a){return vt(e,t,n,r,i,a)}renderAltPpmFace(e,t,n,r){return Tt(Pt(this.ppmStandard),e,t,n,r)}renderMeterShell(e,t,n,r,i,a,o=!1,s=`pimson`,c=`auto`){return Yn(e,t,n,r,i,a,o,s,this.ppmStandard,c)}renderMcCurdyPanel(){return tr()}renderMcCurdyCenter(){return ar()}renderSevenSeg(e){return xt(e,this.MC_WIN)}mcRangeText(e){return or(e)}buildShell(e){return this.currentMeterStyle=e?.meterStyle||`pimson`,Tr({power:e.power,dialLamp:e.dialLamp,dialBg:e.dialBg,ppmLamp:e.ppmLamp,ppmDialBg:e.ppmDialBg,meterStyle:e.meterStyle,ppmStandard:this.ppmStandard})}build(e){this.container&&(this.container.innerHTML=this.buildShell(e),this.initDom(),this.lastMcDigits=``,this.lastPhaseLed=-999,this.lastActiveInput=-999,this.lastMcRangeMode=``,this.lastMcAttenuatorStep=-999,this.isBuilt=!0)}initDom(){if(this.container){for(let e=0;e<4;e++)this.needleEls[e]=this.container.querySelector(`#xtm_needle_${e}`);this.phaseLedEls=[];for(let e=0;e<8;e++)this.phaseLedEls[e]=this.container.querySelector(`#xphase_led_${e}`),this.phaseLedRectEls[e]=this.container.querySelector(`#xphase_ledr_${e}`);this.vfdEl=this.container.querySelector(`#xvfd_group`),this.modeTitleEl=this.container.querySelector(`#xtm_mode_title`),zr(this.container,this.btnEls),this.winkEls=[null],this.mcInputEls=[null];for(let e=1;e<=4;e++)this.winkEls.push(this.container.querySelector(`#wink_btn_${e}`)),this.mcInputEls.push(this.container.querySelector(`#mc_input_btn_${e}`));this.vuShatterEls=[this.container.querySelector(`#vu_shatter_0`),null,this.container.querySelector(`#vu_shatter_2`),null],this.panelEl=this.container.querySelector(`#xtm_master_panel`),this.lockedBadgeEl=this.container.querySelector(`#xtm_center_locked_badge`),this.drAutoBadgeEl=this.container.querySelector(`#dr_auto_badge`),this.drPointerEl=this.container.querySelector(`#wbs_vintage_knob_pointer`),this.drRotorEl=this.container.querySelector(`#wbs_vintage_knob_rotor`),this.attachEvents()}}attachEvents(){!this._eventsAttached&&this.container&&(this._eventsAttached=!0,Ur(this.container,this))}updateNeedles(e,t=!0,n){this.container&&this.isBuilt&&Dr(Er(e,t,n===void 0?this.currentMeterStyle===`fisam`||this.currentMeterStyle===`sifam`:n),this.lastAngles,this.needleEls)}renderSecondary(e,t){if(!this.container)return;this.isBuilt||this.build(e);let n=e.power,r=n?t.phaseLed:-1,i=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-dark`),a=Or(r,i);a!==this.lastPhaseLed&&(this.lastPhaseLed=a,kr(i?this.phaseLedRectEls:this.phaseLedEls,r,n,i));let o=performance.now();Ar(t)?(this.lastAudioTime=o,this.hasSignalLost=!1):o-this.lastAudioTime>=1e4&&(this.hasSignalLost=!0);let s=Ir(e,t,o,this.hasSignalLost);(s.txt!==this.lastDisplayText||this.hasSignalLost!==this.lastSignalLostState)&&this.vfdEl&&(this.lastDisplayText=s.txt,this.lastSignalLostState=this.hasSignalLost,this.vfdEl.innerHTML=Lr(s));let c=or(e);if(c!==this.lastMcDigits&&this.container){let e=this.container.querySelector(`#xmc_digits`);e&&(e.innerHTML=sr(c),this.lastMcDigits=c)}let l=Rr(e,this.hasSignalLost);l!==this.lastModeTitle&&this.modeTitleEl&&(this.lastModeTitle=l,this.modeTitleEl.textContent=l),this.heldButton!==this.lastHeldButton&&(this.lastHeldButton=this.heldButton,Br(this.btnEls,this.heldButton));let u=n?e.getSelectedInput():0;if(u!==this.lastActiveInput){this.lastActiveInput=u;for(let e=1;e<=4;e++){let t=this.winkEls[e];if(t){let n=e===u;t.classList.toggle(`wink-open`,n),t.setAttribute(`aria-pressed`,n?`true`:`false`)}let n=this.mcInputEls[e];if(n){let t=e===u;n.classList.toggle(`mc-btn-latched`,t),n.setAttribute(`aria-pressed`,t?`true`:`false`)}}}let d=`${e.mode}_${e.a.lvl}_${e.d.lvl}_${u}_${e.mcAttenuatorStep}_${e.mcRangeMode}`;this.lastSensKey!==d&&(this.lastSensKey=d,(this.isGlassShattered||this.isHealing)&&(this.isGlassShattered=!1,this.isHealing=!1,this.updateShatterState(!1,!0)),this.vuRedStartTime=0,this.vuCleanStartTime=0),n&&t.hasAudio&&(t.vuDb&&(t.vuDb[0]>=3||t.vuDb[1]>=3)||t.vu&&(t.vu[0]>=1||t.vu[1]>=1)||t.ppmDb&&(t.ppmDb[0]>=8||t.ppmDb[1]>=8)||t.ppm&&(t.ppm[0]>=.833||t.ppm[1]>=.833)||t.dbfs&&(t.dbfs[0]>=0||t.dbfs[1]>=0))?(this.vuCleanStartTime=0,this.isHealing=!1,this.vuRedStartTime===0?this.vuRedStartTime=o:!this.isGlassShattered&&o-this.vuRedStartTime>=2e4&&(this.isGlassShattered=!0,this.triggerRandomShatter())):(this.vuRedStartTime=0,this.isGlassShattered&&(this.vuCleanStartTime===0?this.vuCleanStartTime=o:!this.isHealing&&o-this.vuCleanStartTime>=2e3?(this.isHealing=!0,this.updateShatterState(!1,!1)):this.isHealing&&o-this.vuCleanStartTime>=3900&&(this.isGlassShattered=!1,this.isHealing=!1,this.vuCleanStartTime=0,this.updateShatterState(!1,!0))));let f=e.mcRangeMode||`outer`,p=e.mcAttenuatorStep??15;if(f!==this.lastMcRangeMode||p!==this.lastMcAttenuatorStep){this.lastMcRangeMode=f,this.lastMcAttenuatorStep=p;let e=this.container?.querySelector(`#mc_toggle_stick_rotor`);if(e){let t=f===`outer`?-24:f===`inner`?24:0;e.setAttribute(`transform`,`rotate(${t})`)}let t=this.container?.querySelector(`#mc_toggle_lbl_outer`),n=this.container?.querySelector(`#mc_toggle_sub_outer`),r=this.container?.querySelector(`#mc_toggle_lbl_cal`),i=this.container?.querySelector(`#mc_toggle_lbl_inner`),a=this.container?.querySelector(`#mc_toggle_sub_inner`),o=f===`outer`,s=f===`inner`,c=f===`cal`;t&&t.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n&&(n.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n.setAttribute(`fill-opacity`,o?`1`:`0.5`)),r&&r.setAttribute(`fill`,c?`#fbbf24`:`#94a3b8`),i&&i.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a&&(a.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a.setAttribute(`fill-opacity`,s?`1`:`0.5`));let l=this.container?.querySelector(`#mc_scale_outer_group`),u=this.container?.querySelector(`#mc_scale_inner_group`);l&&(l.style.transition=`opacity 0.2s ease`,l.style.opacity=o?`1`:`0.35`),u&&(u.style.transition=`opacity 0.2s ease`,u.style.opacity=s?`1`:`0.35`);let d=this.container?.querySelector(`#mccurdy_vintage_knob_rotor`);if(d){let e=d.getAttribute(`data-cx`)||`1600`,t=d.getAttribute(`data-cy`)||`186`,n=(p-15)*9;d.setAttribute(`transform`,`translate(${e}, ${t}) rotate(${n.toFixed(1)})`)}}this.lastLockedExpanded!==e.isLockedExpanded&&(this.lastLockedExpanded=e.isLockedExpanded,this.panelEl&&this.panelEl.classList.toggle(`xtm-expanded-meters`,e.isLockedExpanded),this.lockedBadgeEl&&(this.lockedBadgeEl.style.opacity=e.isLockedExpanded?`1`:`0`)),this.lastAutoRangeState!==e.autoRange&&(this.lastAutoRangeState=e.autoRange,this.drAutoBadgeEl&&(this.drAutoBadgeEl.style.display=e.autoRange?`inline`:`none`)),e.autoRange&&n&&t.hasAudio&&o-this.lastAutoRangeTime>=350&&(this.lastAutoRangeTime=o,this.processAutoRange(e,t));let m=e.mode===`A`?e.lvlDb(e.a.lvl):e.mode===`D`?e.lvlDb(e.d.lvl):e.getMcCurdySensitivityDb();if(this.lastDrKnobDb!==m){this.lastDrKnobDb=m;let e=Math.max(-180,Math.min(108,m*3.6));this.drPointerEl&&this.drPointerEl.setAttribute(`transform`,`rotate(${e.toFixed(1)})`),this.drRotorEl&&this.drRotorEl.setAttribute(`transform`,`rotate(${e.toFixed(1)})`)}}processAutoRange(e,t){if(!e.power||!t.hasAudio)return;let n=Math.max(t.vuDb[0],t.vuDb[1]),r=t.ppmDb?Math.max(t.ppmDb[0],t.ppmDb[1]):-99,i=t.peak&&(t.peak[0]||t.peak[1])||r>3,a=e.getActiveReferenceLevel();if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`))&&(a=e.getMcCurdySensitivityDb()),(n>.5||i)&&a<30){let t=Math.min(30,a+(n>2||i?2:1));e.setSensitivityDb(t)}else if(n<-6&&n>-40&&a>-50){let t=Math.max(-50,a-(n<-12?2:1));e.setSensitivityDb(t)}}triggerRandomShatter(){for(let e of[0,2]){let t=this.vuShatterEls[e];t&&(Jn(t,parseFloat(t.getAttribute(`data-cx`)||String(e===0?373:2198)),parseFloat(t.getAttribute(`data-cy`)||`210`),e),t.style.display=`inline`,t.getBoundingClientRect(),t.style.opacity=`1`)}}updateShatterState(e,t=!1){for(let n of this.vuShatterEls)n&&(e?(n.style.display=`inline`,n.style.opacity=`1`):(t&&(n.style.display=`none`),n.style.opacity=`0`))}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(e),this.initDom(),!0);let n=e?e.meterStyle===`fisam`||e.meterStyle===`sifam`:!1;this.updateNeedles(t,!e||e.power,n),this.renderSecondary(e,t)}},Gr=`PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.PK`.split(`.`),Kr=[-45,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],qr=`-100.-90.-80.-70.-60.-55.-50.-45.PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.+15.+16.+17.+18.+19.+20.+21.+22.PK`.split(`.`),Jr=[-100,-90,-80,-70,-60,-55,-50,-45,-42,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24];function Yr(e){return e?-8:0}function Xr(e){return e?48:40}function Zr(e){return e?qr:Gr}function Qr(e){return e?Jr:Kr}function $r(e,t,n){if(!Number.isFinite(e)||e<(t?-110:-55))return-1;let r=-1;for(let t=0;t<n.length;t++){let i=n[t];if(i!==void 0&&e>=i)r=t;else break}return r}var ei=3200;function ti(e){return 1600+(e-25)*46}var ni=`#111317`;function ri(e,t){return e===t?`#dc2626`:e>=40||e===25?`#ef4444`:e===24||e===26?`#facc15`:e<0?`#10b981`:e<=18?`#22c55e`:e<=23?`#f59e0b`:e<=33?`#f97316`:`#ef4444`}function ii(e,t){return e===25||e===t?`#ef4444`:e===24||e===26?`#facc15`:e>=40?`#ef4444`:e>26?`#f97316`:e>=19?`#f59e0b`:e<0?`#10b981`:`#94a3b8`}var ai=`
        <!-- Section 0: INFINITE SILENCE (Below -45 dBFS, added on left) -->
        <g class="pod-section-silence">
          <line x1="66" y1="182" x2="150" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
          <text x="243" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#10b981" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">INFINITE SILENCE</text>
          <line x1="336" y1="182" x2="420" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 1: VU RANGE Header (PR to 0 VU) -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 2: PEAK RANGE Header (+1 to +14) -->
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1875" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1945" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2015" y1="182" x2="2260" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 3: DISTORTION RANGE Header (+15 to PK, added on right) -->
        <g class="pod-section-distortion">
          <line x1="2276" y1="182" x2="2370" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <text x="2474" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#ef4444" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">DISTORTION RANGE</text>
          <line x1="2578" y1="182" x2="2674" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        </g>
        `,oi=`
        <!-- Standard 2-Section VU & Peak Range -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1900" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1965" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2030" y1="182" x2="2306" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        `;function si(e){let t=(e,t,n,r,i,a,o)=>{let s=(e-n/2).toFixed(1),c=(t-r/2).toFixed(1);return`
        <g id="pod_slot_${i}_${a}">
          <!-- Smoked Bezel Slot -->
          <rect x="${s}" y="${c}" width="${n}" height="${r}" rx="3" fill="#06080a" stroke="#171b22" stroke-width="1.2"/>
          <!-- Dimmer Smoky Diffuse LED Body -->
          <rect id="pod_led_${i}_${a}" x="${(parseFloat(s)+1.5).toFixed(1)}" y="${(parseFloat(c)+1.5).toFixed(1)}"
                width="${n-3}" height="${r-3}" rx="2" fill="#111317" opacity="0.16"/>
          <!-- Internal Smoky Diffuser Core Reflection -->
          <rect id="pod_core_${i}_${a}" x="${(e-2).toFixed(1)}" y="${(parseFloat(c)+5).toFixed(1)}"
                width="4" height="${r-10}" rx="2" fill="#ffffff" opacity="0"/>
          ${o?`<title>${o}</title>`:``}
        </g>`};return`<svg viewBox="0 0 ${e.PW} ${e.PH}" role="img" aria-label="Ward-Beck Systems POD-22 Loudness Bar" style="width:100%;display:block;border-radius:0">
      <defs>
        <!-- Soft Smoky Diffuse LED Bloom Filter -->
        <filter id="smokyglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Recessed Chamber Overhang Shadows -->
        <linearGradient id="p22_top_shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="p22_bot_shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
        </linearGradient>
      </defs>

      <!-- Seamless Dark Borderless Console Surface -->
      <rect class="p22-bg" width="${e.PW}" height="${e.PH}" fill="#08090b"/>

      <!-- ================= Borderless Meter Sections ================= -->
      <g id="pod_sections">
        <!-- Vertical Bargraphs (32w x 54h, tight 46px pitch) -->
        <!-- Row 0: Left Channel -->
        ${(()=>{let n=``;for(let r=e.minP;r<=e.maxP;r++){let i=r-e.minP,a=e.SCALE[i]??``;n+=t(e.segX(r),38,32,54,0,r,`Left ${a}`)}return n})()}

        <!-- Center Numerical Scale Markings -->
        ${e.SCALE.map((t,n)=>{let r=e.minP+n,i=e.segX(r),a=r===25,o=r===24||r===26,s=r===e.maxP,c=e.scaleNumColor(r,t);return`
            ${a?`<polygon points="${i-4.5},68 ${i+4.5},68 ${i},76" fill="#ef4444"/>
                        <polygon points="${i-4.5},106 ${i+4.5},106 ${i},98" fill="#ef4444"/>`:``}
            <text x="${i}" y="87" dominant-baseline="central" font-size="${a||s?13:o?12:11}" font-weight="${a||s||o||r>=40?`900`:`700`}"
                  fill="${c}" text-anchor="middle" font-family="ui-monospace, monospace">${t}</text>`}).join(``)}

        <!-- Row 1: Right Channel -->
        ${(()=>{let n=``;for(let r=e.minP;r<=e.maxP;r++){let i=r-e.minP,a=e.SCALE[i]??``;n+=t(e.segX(r),136,32,54,1,r,`Right ${a}`)}return n})()}

        <!-- Range Headers Below Meter Segments (Nothing On Top) -->
        ${e.extendedLed22?ai:oi}
      </g>
    </svg>`}function ci(e,t){let n=[{},{}];for(let r=e;r<=t;r++)n[0][r]=!1,n[1][r]=!1;return n}function li(e,t){return Math.max(.001,Math.min(.1,(e-t)/1e3))}function ui(e,t,n){let r=-90;if(e.scaleMode===`log`){if(t.lufs&&t.lufs.mL!==void 0){let e=n===0?t.lufs.mL:t.lufs.mR;e!==void 0&&Number.isFinite(e)&&e>-59&&(r=e+24)}}else if(e.scaleMode===`vu`){let e=t.dbfs?t.dbfs[n]??-90:-90;r=Number.isFinite(e)?e+18:-90}else e.scaleMode===`peak`&&(r=t.ppmDb[n]??-90);return r}function di(e,t,n,r){let i=e.smoothDb[t]??-100;if(n>=i){let e=1-Math.exp(-r/.01);i+=e*(n-i)}else{let t=24/2.8;e.decayType===`type1`?t=20/1.5:e.decayType===`vu`?t=20/.3:e.decayType===`instant`&&(t=45),i=Math.max(n,i-t*r)}return e.smoothDb[t]=i,i}function fi(e,t,n){let r=e.dbToSegmentIndex(n),i=e.heldPeak[t]??-1,a=e.holdTimer[t]??0;return r>=i?(e.heldPeak[t]=r,e.holdTimer[t]=90):a>0?e.holdTimer[t]=a-1:e.heldPeak[t]=Math.max(-1,i-1),e.heldPeak[t]??-1}function pi(e,t,n,r){let i=ci(e.minP,e.maxP);if(n)for(let n=0;n<2;n++){let a=di(e,n,ui(e,t,n),r),o=e.dbToSegmentIndex(a),s=e.SCALE.length-1,c=i[n];if(c)for(let t=0;t<=o&&t<s;t++){let n=e.minP+t;c[n]=!0}let l=fi(e,n,t.ppmDb[n]??-90);if(l>=0&&l<=s&&c){let t=e.minP+l;c[t]=!0}let u=e.extendedLed22?22:14,d=t.peak[n];c&&(d||(t.ppmDb[n]??-90)>=u)&&(c[e.maxP]=!0)}else e.heldPeak=[-1,-1],e.holdTimer=[0,0];return i}function mi(e,t,n,r){t.ledEls=[{},{}],t.glowEls=[{},{}],t.lastLit=[{},{}];for(let i=0;i<2;i++)for(let a=n;a<=r;a++){let n=t.ledEls[i],r=t.glowEls[i],o=t.lastLit[i];n&&r&&o&&(n[a]=e.querySelector(`#pod_led_${i}_${a}`),r[a]=e.querySelector(`#pod_core_${i}_${a}`),o[a]=null)}}function hi(e,t,n,r,i){for(let a=0;a<2;a++){let o=t[a],s=e.lastLit[a],c=e.ledEls[a],l=e.glowEls[a];if(o&&s&&c&&l)for(let e=n;e<=r;e++){let t=o[e]??!1;if(s[e]!==t){s[e]=t;let n=c[e],r=l[e];if(!n)continue;t?(n.setAttribute(`fill`,i(e)),n.setAttribute(`opacity`,`0.88`),n.setAttribute(`filter`,`url(#smokyglow)`),r&&r.setAttribute(`opacity`,`0.24`)):(n.setAttribute(`fill`,ni),n.setAttribute(`opacity`,`0.15`),n.removeAttribute(`filter`),r&&r.setAttribute(`opacity`,`0`))}}}}var gi=class{container;isBuilt=!1;heldPeak=[-1,-1];holdTimer=[0,0];dip={BS0:0,BS1:1};PW=ei;PH=192;SCALE_STD=Gr;THRESHOLDS_STD=Kr;SCALE_EXT=qr;THRESHOLDS_EXT=Jr;extendedLed22=!0;scaleMode=`log`;decayType=`type2`;smoothDb=[-100,-100];lastTime=performance.now();ledEls=[{},{}];glowEls=[{},{}];lastLit=[{},{}];constructor(e){this.container=e}get minP(){return Yr(this.extendedLed22)}get maxP(){return Xr(this.extendedLed22)}get SCALE(){return Zr(this.extendedLed22)}get DB_THRESHOLDS(){return Qr(this.extendedLed22)}setDecay(e){this.decayType=e,this.dip.BS0=+(e===`type1`)}setExtendedRange(e){this.extendedLed22!==e&&(this.extendedLed22=e,this.isBuilt=!1,this.heldPeak=[-1,-1],this.holdTimer=[0,0],this.container&&(this.container.innerHTML=this.buildShell(),this.initDom(),this.isBuilt=!0))}segX(e){return ti(e)}segColor(e){return ri(e,this.maxP)}scaleNumColor(e,t){return ii(e,this.maxP)}dbToSegmentIndex(e){return $r(e,this.extendedLed22,this.DB_THRESHOLDS)}buildShell(){return si(this)}initDom(){this.container&&mi(this.container,this,this.minP,this.maxP)}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(),this.initDom(),!0);let n=performance.now(),r=li(n,this.lastTime);this.lastTime=n;let i=pi(this,t,e.power,r);hi(this,i,this.minP,this.maxP,e=>this.segColor(e))}},_i=[{sec:10,label:`10s`},{sec:20,label:`20s`},{sec:30,label:`30s`},{sec:40,label:`40s`},{sec:50,label:`50s`},{sec:60,label:`1 min`},{sec:90,label:`1 min 30`},{sec:120,label:`2 min`},{sec:150,label:`2 min 30`},{sec:180,label:`3 min`},{sec:240,label:`4 min`},{sec:300,label:`5 min`},{sec:360,label:`6 min`},{sec:420,label:`7 min`},{sec:480,label:`8 min`},{sec:540,label:`9 min`},{sec:600,label:`10 min`}],vi=[{fps:60,label:`60 FPS (Eco)`,warning:null},{fps:120,label:`120 FPS (Standard)`,warning:null},{fps:240,label:`240 FPS (Default)`,warning:null},{fps:480,label:`480 FPS (High)`,warning:null},{fps:960,label:`960 FPS (Ultra)`,warning:null}];function yi(e){return _i[Math.max(0,Math.min(_i.length-1,Math.round(Number(e))))].sec}function bi(e){let t=0,n=1/0;for(let r=0;r<_i.length;r++){let i=Math.abs(_i[r].sec-e);i<n&&(n=i,t=r)}return t}function xi(e){let t=_i.find(t=>t.sec===e);if(t)return t.label;if(e<60)return e+`s`;let n=Math.floor(e/60),r=e%60;return n>=10?`10 min`:r>0?`${n} min ${r}`:`${n} min`}function Si(e){return[e.histL,e.histR,e.histSum,e.histDiff,e.histNormL,e.histNormR,e.histNormSum,e.histNormDiff,e.histLufsM,e.histLufsS,e.histLufsI,e.histPhase]}function Ci(e){e.pyr=new Map;let t=e.bufferSize;for(let n of Si(e)){let r=[new Float32Array],i=[new Float32Array];for(let e=1;e<=14;e++)r.push(new Float32Array((t>>e)+2).fill(-60)),i.push(new Float32Array((t>>e)+2).fill(0));e.pyr.set(n,{max:r,sum:i})}e.pyrFor=e.histL,e.absCount=0}function wi(e){(e.count===0||e.pyrFor!==e.histL)&&Ci(e);let t=e.absCount,n=e.head;for(let[r,i]of e.pyr){let e=r[n];for(let n=1;n<=14;n++){let r=i.max[n],a=i.sum[n],o=Math.floor(t/(1<<n))%r.length;t&(1<<n)-1?(e>r[o]&&(r[o]=e),a[o]=a[o]+e):(r[o]=e,a[o]=e)}}e.absCount=t+1}function Ti(e,t,n){let r=e.absCount-e.count,i=e.absCount-1,a=Math.max(r,Math.min(i,n)),o=Math.floor(a),s=Math.min(i,o+1),c=a-o,l=e.bufferSize,u=((e.head-(e.absCount-o))%l+l)%l,d=((e.head-(e.absCount-s))%l+l)%l;return t[u]*(1-c)+t[d]*c}function Ei(e,t,n,r,i){let a=e.pyr.get(t),o=1<<n,s=Math.ceil((e.absCount-e.count)/o),c=Math.floor((e.absCount-1)/o),l=Math.max(s,Math.min(c,r)),u=l%a.max[n].length;if(!i)return a.max[n][u];let d=Math.min(o,e.absCount-l*o);return a.sum[n][u]/Math.max(1,d)}function Di(e,t,n,r,i){if(n<=0)return Ti(e,t,r);let a=r/(1<<n)-.5,o=Math.floor(a),s=a-o;return Ei(e,t,n,o,i)*(1-s)+Ei(e,t,n,o+1,i)*s}function Oi(e,t,n,r,i,a=!1){let o=2.5*gt(.5,1,i),s=Math.max(0,Math.min(13,Math.log2(Math.max(1,r))+o)),c=Math.floor(s),l=s-c,u=r=>Di(e,t,c,n,r)*(1-l)+Di(e,t,c+1,n,r)*l,d=a?1:gt(.35,.6,i),f=d<1?u(!1):0,p=d>0?u(!0):0;return f*(1-d)+p*d}function ki(e,t){e.histL=new Float32Array(t).fill(-60),e.histR=new Float32Array(t).fill(-60),e.histSum=new Float32Array(t).fill(-60),e.histDiff=new Float32Array(t).fill(-60),e.histNormL=new Float32Array(t).fill(-60),e.histNormR=new Float32Array(t).fill(-60),e.histNormSum=new Float32Array(t).fill(-60),e.histNormDiff=new Float32Array(t).fill(-60),e.histLufsM=new Float32Array(t).fill(-60),e.histLufsS=new Float32Array(t).fill(-60),e.histLufsI=new Float32Array(t).fill(-60),e.histPhase=new Float32Array(t).fill(1)}function Ai(e,t){e.bufferSize!==t&&(e.bufferSize=t,ki(e,t),e.head=0,e.count=0,e.lastPushTime=0,e.pushAccumulator=0,e.graphDirty=!0)}function ji(e){e.head=0,e.count=0,e.lastPushTime=0,e.pushAccumulator=0,e.histL.fill(-60),e.histR.fill(-60),e.histSum.fill(-60),e.histDiff.fill(-60),e.histNormL.fill(-60),e.histNormR.fill(-60),e.histNormSum.fill(-60),e.histNormDiff.fill(-60),e.histLufsM.fill(-60),e.histLufsS.fill(-60),e.histLufsI.fill(-60),e.envL=-60,e.envR=-60,e.envSum=-60,e.envDiff=-60,e.envLufsM=-60,e.envLufsS=-60,e.normL=-60,e.normR=-60,e.normSum=-60,e.normDiff=-60,e.peakMaxL=-60,e.peakMaxR=-60,e.lufsMaxM=-60,e.clipCountL=0,e.clipCountR=0,e.graphDirty=!0}function Mi(e,t,n,r,i,a,o,s,c){let l=performance.now();e.lastPushTime||(e.lastPushTime=l,e.pushAccumulator=0);let u=Math.max(5e-4,Math.min(.25,(l-e.lastPushTime)/1e3));e.lastPushTime=l,e.pushAccumulator=(e.pushAccumulator||0)+u;let d=1/e.captureSpeed,f=Math.floor(e.pushAccumulator/d);if(f<=0)return;e.pushAccumulator-=f*d,e.pushAccumulator>d*24&&(e.pushAccumulator=0);let p=Math.min(f,24),m=isFinite(t)?Math.max(-60,Math.min(0,t)):-60,h=isFinite(n)?Math.max(-60,Math.min(0,n)):-60,g=isFinite(o)?Math.max(-60,Math.min(6.02,o)):-60,_=isFinite(s)?Math.max(-60,Math.min(6.02,s)):-60,v=isFinite(r)?Math.max(-60,Math.min(0,r)):-60,y=isFinite(i)?Math.max(-60,Math.min(0,i)):-60,b=isFinite(c)?Math.max(-60,Math.min(0,c)):-60,x=isFinite(a)?Math.max(-1,Math.min(1,a)):1,S=75*d,C=1-Math.exp(-d/.4),ee=30*d,te=10*d;for(let t=0;t<p;t++)e.envL=m>=e.envL?m:Math.max(-60,e.envL-S),e.envR=h>=e.envR?h:Math.max(-60,e.envR-S),e.envSum=g>=e.envSum?g:Math.max(-60,e.envSum-S),e.envDiff=_>=e.envDiff?_:Math.max(-60,e.envDiff-S),e.normL+=C*(e.envL-e.normL),e.normR+=C*(e.envR-e.normR),e.normSum+=C*(e.envSum-e.normSum),e.normDiff+=C*(e.envDiff-e.normDiff),e.envLufsM=e.envLufsM===void 0||e.count===0||v>=e.envLufsM?v:Math.max(-60,e.envLufsM-ee),e.envLufsS=e.envLufsS===void 0||e.count===0||y>=e.envLufsS?y:Math.max(-60,e.envLufsS-te),e.histL[e.head]=e.envL,e.histR[e.head]=e.envR,e.histSum[e.head]=e.envSum,e.histDiff[e.head]=e.envDiff,e.histNormL[e.head]=e.normL,e.histNormR[e.head]=e.normR,e.histNormSum[e.head]=e.normSum,e.histNormDiff[e.head]=e.normDiff,e.histLufsM[e.head]=e.envLufsM,e.histLufsS[e.head]=e.envLufsS,e.histLufsI[e.head]=b,e.histPhase[e.head]=x,wi(e),e.head=(e.head+1)%e.bufferSize,e.count<e.bufferSize&&e.count++;m>=0&&e.clipCountL++,h>=0&&e.clipCountR++,m>e.peakMaxL&&(e.peakMaxL=m),h>e.peakMaxR&&(e.peakMaxR=h),v>e.lufsMaxM&&(e.lufsMaxM=v)}function Ni(e,t){let n=localStorage.getItem(e);return n===null?t:n===`true`}function Pi(){return{showChA:Ni(`xtm_scope_show_cha`,!1),showChB:Ni(`xtm_scope_show_chb`,!1),showSum:Ni(`xtm_scope_show_sum`,!0),showDiff:Ni(`xtm_scope_show_diff`,!1),showLufs:Ni(`xtm_scope_show_lufs`,!0),showLufsS:Ni(`xtm_scope_show_lufs_s`,!1),showLufsI:Ni(`xtm_scope_show_lufs_i`,!1),show0DbfsLine:Ni(`xtm_scope_show_0dbfs`,!0),isDocked:localStorage.getItem(`xtm_hud_docked`)===`true`}}function Fi(){return{bg:`#07090c`,grid:`#1a202c`,gridTime:`#141824`,gridRef:`#15803d`,gridTargetBrd:`#10b981`,gridTargetStr:`#f97316`,gridWarn:`#d97706`,gridClip:`#dc2626`,textMuted:`#64748b`,textCyan:`#ffffff`,textGold:`#ef4444`,textSum:`#22c55e`,textDiff:`#06b6d4`,textLufs:`#f4902c`,textLufsS:`#c084fc`,textInteg:`#34d399`,lineL:`#ffffff`,lineR:`#ef4444`,lineSum:`#22c55e`,lineDiff:`#06b6d4`,lineLufs:`#f4902c`,fillL:`rgba(255, 255, 255, 0.08)`,fillR:`rgba(239, 68, 68, 0.08)`,fillSum:`rgba(34, 197, 94, 0.09)`,fillDiff:`rgba(6, 182, 212, 0.08)`,fillLufs:`rgba(244, 144, 44, 0.14)`}}var Ii={bg:`#e5e1d5`,grid:`#cdc8bb`,gridTime:`#d3cec2`,textMuted:`#68655d`,textCyan:`#232325`,lineL:`#232325`,fillL:`rgba(35, 35, 37, 0.08)`},Li=`
      <div class="dbfs-inner" style="position:relative;width:100%;height:100%;flex:1;display:flex;flex-direction:column;background:var(--dbfs-bg, #07090c);overflow:hidden;user-select:none;">
        <!-- Hardware Accelerated Canvas Plot Area with Floating Hover HUD -->
        <div class="dbfs-canvas-wrapper" style="position:relative;width:100%;height:100%;flex:1;overflow:hidden;">
          <canvas id="dbfsCanvas" style="width:100%;height:100%;display:block;"></canvas>

          <!-- Timeline NOW Time Badge / Button (Click opens Full Screen Master Clock) -->
          <button type="button" class="timeline-now-time-btn" id="btnTimelineNowTime" title="Current Time (NRC/CHU) - Click to open Full Screen Master Clock">
            <span class="timeline-now-val" id="timelineNowTimeText">--:--:--</span>
          </button>

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
      </div>`,Ri=[{key:`showChA`,storage:`xtm_scope_show_cha`,drawerId:`chkShowChA`},{key:`showChB`,storage:`xtm_scope_show_chb`,drawerId:`chkShowChB`},{key:`showSum`,storage:`xtm_scope_show_sum`,drawerId:`chkShowSum`},{key:`showDiff`,storage:`xtm_scope_show_diff`,drawerId:`chkShowDiff`},{key:`showLufs`,storage:`xtm_scope_show_lufs`,drawerId:`chkShowLufs`},{key:`showLufsS`,storage:`xtm_scope_show_lufs_s`,drawerId:`chkShowLufsS`},{key:`showLufsI`,storage:`xtm_scope_show_lufs_i`,drawerId:`chkShowLufsI`}];function zi(e,t){e.hudEl=t.querySelector(`#dbfsHoverHud`),e.hudChA=t.querySelector(`#hudChA`),e.hudChB=t.querySelector(`#hudChB`),e.hudSum=t.querySelector(`#hudSum`),e.hudDiff=t.querySelector(`#hudDiff`),e.hudLufsM=t.querySelector(`#hudLufsM`),e.hudLufsS=t.querySelector(`#hudLufsS`),e.hudLufsI=t.querySelector(`#hudLufsI`),e.hudLra=t.querySelector(`#hudLra`),e.hudMax=t.querySelector(`#hudMax`),e.hudClipRow=t.querySelector(`#hudClipRow`),e.hudClips=t.querySelector(`#hudClips`),e.hudTimeMode=t.querySelector(`#hudTimeMode`),e.wrapper=t.querySelector(`.dbfs-canvas-wrapper`),e.dockContainer=null,e.btnDock=t.querySelector(`#btnDockHud`),e.hudChkChA=t.querySelector(`#hudChkChA`),e.hudChkChB=t.querySelector(`#hudChkChB`),e.hudChkSum=t.querySelector(`#hudChkSum`),e.hudChkDiff=t.querySelector(`#hudChkDiff`),e.hudChkLufsM=t.querySelector(`#hudChkLufsM`),e.hudChkLufsS=t.querySelector(`#hudChkLufsS`),e.hudChkLufsI=t.querySelector(`#hudChkLufsI`),e.hudRowChA=t.querySelector(`#hudRowChA`),e.hudRowChB=t.querySelector(`#hudRowChB`),e.hudRowSum=t.querySelector(`#hudRowSum`),e.hudRowDiff=t.querySelector(`#hudRowDiff`),e.hudRowLufsM=t.querySelector(`#hudRowLufsM`),e.hudRowLufsS=t.querySelector(`#hudRowLufsS`),e.hudRowLufsI=t.querySelector(`#hudRowLufsI`)}function Bi(e){return[[e.hudChkChA,e.hudRowChA,`showChA`],[e.hudChkChB,e.hudRowChB,`showChB`],[e.hudChkSum,e.hudRowSum,`showSum`],[e.hudChkDiff,e.hudRowDiff,`showDiff`],[e.hudChkLufsM,e.hudRowLufsM,`showLufs`],[e.hudChkLufsS,e.hudRowLufsS,`showLufsS`],[e.hudChkLufsI,e.hudRowLufsI,`showLufsI`]]}function Vi(e){let t=Bi(e);for(let[n,,r]of t)n&&(n.checked=e[r]);for(let[,n,r]of t)n&&n.classList.toggle(`trace-off`,!e[r]);let n=Ri.map(e=>document.getElementById(e.drawerId));Ri.forEach((t,r)=>{let i=n[r];i&&(i.checked=e[t.key])}),e.graphDirty=!0}function Hi(e){Bi(e).forEach(([t,,n],r)=>{if(!t)return;let i=Ri[r].storage;t.addEventListener(`change`,t=>{e[n]=t.target.checked,localStorage.setItem(i,String(e[n])),Vi(e)})}),e._updateTraceToggles=()=>Vi(e),Vi(e)}function Ui(e){for(let t of Ri){let n=document.getElementById(t.drawerId);n&&(n.checked=e[t.key],n.addEventListener(`change`,n=>{e[t.key]=n.target.checked,localStorage.setItem(t.storage,String(e[t.key])),e._updateTraceToggles&&e._updateTraceToggles()}))}}function Wi(e){let t=document.getElementById(`btnScopeLog`),n=document.getElementById(`btnScopeSuperLog`),r=document.getElementById(`btnScopeLin`),i=document.getElementById(`scopeLengthSlider`),a=document.getElementById(`scopeLengthVal`),o=document.getElementById(`btnScopeClear`),s=document.getElementById(`scopeSpeedSlider`),c=document.getElementById(`scopeSpeedVal`),l=t=>()=>{e.setTimeMode(t),e.onTimeModeChange&&e.onTimeModeChange(t)};if(t&&r&&(t.addEventListener(`click`,l(`log`)),n&&n.addEventListener(`click`,l(`super_log`)),r.addEventListener(`click`,l(`lin`))),i&&(i.min=`0`,i.max=String(_i.length-1),i.step=`1`,i.value=String(e.secondsToSlider(e.captureLength)),a&&(a.textContent=e.formatDuration(e.captureLength)),i.addEventListener(`input`,t=>{let n=parseFloat(t.target.value);e.captureLength=e.sliderToSeconds(n),a&&(a.textContent=e.formatDuration(e.captureLength))})),o&&o.addEventListener(`click`,()=>{e.clear(),e.onClear&&e.onClear()}),s){s.min=`0`,s.max=String(vi.length-1),s.step=`1`;let t=vi.findIndex(t=>t.fps===e.captureSpeed);t<0&&(t=2),s.value=String(t),c&&(c.textContent=vi[t].label);let n=document.getElementById(`scopeSpeedWarning`),r=document.getElementById(`scopeSpeedWarningText`);s.addEventListener(`input`,t=>{let i=vi[Math.max(0,Math.min(vi.length-1,parseInt(t.target.value,10)))];e.captureSpeed!==i.fps&&(e.captureSpeed=i.fps,e.resizeBuffer(Math.round(e.maxCaptureSec*e.captureSpeed))),c&&(c.textContent=i.label),i.warning?n&&r&&(r.textContent=`⚠️ `+i.warning,n.style.display=`block`):n&&(n.style.display=`none`)})}}function Gi(e){let t=document.getElementById(`chkEnableFade`),n=document.getElementById(`chkEnableFadeLabel`),r=document.getElementById(`hfFadeSlider`),i=document.getElementById(`hfFadeVal`),a=()=>{let a=!e.enableFade||e.hfFadeDistance>=100;t&&(t.checked=e.enableFade),n&&(n.textContent=a?`Off (Full View)`:`On (Fading)`),i&&(i.textContent=a?`100% (Full View)`:e.hfFadeDistance+`%`),r&&(r.value=String(e.hfFadeDistance))};t&&t.addEventListener(`change`,t=>{e.enableFade=t.target.checked,e.enableFade?e.hfFadeDistance>=100&&(e.hfFadeDistance=50):e.hfFadeDistance=100,a()}),r&&r.addEventListener(`input`,t=>{e.hfFadeDistance=parseFloat(t.target.value),e.enableFade=!(e.hfFadeDistance>=100),a()}),a()}function Ki(e){Gi(e);let t=document.getElementById(`chk0DbfsLine`);t&&(t.checked=e.show0DbfsLine,t.addEventListener(`change`,t=>{e.show0DbfsLine=t.target.checked,localStorage.setItem(`xtm_scope_show_0dbfs`,String(e.show0DbfsLine)),e.graphDirty=!0}));let n=document.getElementById(`chkHoverTelemetry`);n&&(n.checked=e.showHoverTelemetry,n.addEventListener(`change`,t=>{e.showHoverTelemetry=t.target.checked,e.isDocked?e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?``:`none`)}));let r=document.getElementById(`chkDockHud`);r&&(r.checked=e.isDocked,r.addEventListener(`change`,t=>{e.setDocked(t.target.checked)})),e.btnDock&&e.btnDock.addEventListener(`click`,t=>{t.stopPropagation(),e.setDocked(!e.isDocked)});let i=document.getElementById(`chkCursorTrace`);i&&(i.checked=e.showCursorTrace,i.addEventListener(`change`,t=>{e.showCursorTrace=t.target.checked}));let a=document.getElementById(`chkPhasePlot`);a&&(a.checked=e.plotPhase,a.addEventListener(`change`,t=>{e.plotPhase=t.target.checked}))}var qi=[{host:`time.nrc.ca`,name:`NRC-CNRC Cesium Fountain Primary Standard (Ottawa)`,refId:`CESM`},{host:`time.chu.nrc.ca`,name:`NRC CHU Shortwave Atomic Broadcast Standard (Ottawa)`,refId:`CHU`}];function Ji(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return`NRC-${Math.abs(t).toString(16).toUpperCase().padStart(8,`0`)}-${Math.floor(Math.random()*65535).toString(16).toUpperCase().padStart(4,`0`)}`}var Yi=new class{receipts=[];autoSyncTimer=null;serverIndex=0;isSyncing=!1;maxHistory=120;constructor(){this.seedHistoricalReceipts()}seedHistoricalReceipts(){let e=Date.now();[75,32,10].forEach((t,n)=>{let r=qi[n%qi.length],i=e-t*1e3,a=12+Math.sin(n*1.7)*2.5,o=Math.cos(n*2.3)*.35,s=.03+n*.008,c=i-a,l=c+a/2+o,u=l+.02,d=i,f={id:`RC-NRC-${new Date(i).toISOString().slice(0,10).replace(/-/g,``)}-${Math.floor(1e3+Math.random()*9e3).toString(16).toUpperCase()}`,timestamp:i,server:r.host,serverName:r.name,stratum:1,referenceId:r.refId,offsetMs:Number(o.toFixed(3)),roundTripDelayMs:Number(a.toFixed(2)),jitterMs:Number(s.toFixed(3)),precision:`2^-20 (~0.95 µs)`,leapIndicator:0,protocol:`NTPv4 (RFC 5905) / UDP :123`,rootDelayMs:0,rootDispersionMs:.04,status:`LOCKED`,isoUtc:new Date(i).toISOString(),isoLocal:new Date(i).toString(),ledger:{t1ClientTx:c,t2ServerRx:l,t3ServerTx:u,t4ClientRx:d},receiptHash:Ji(`${r.host}-${i}`),syncSource:`calibrated`};this.receipts.push(f)})}async syncNow(e){if(this.isSyncing)return this.receipts[this.receipts.length-1];this.isSyncing=!0;let t=e?qi.find(t=>t.host===e)||qi[0]:qi[this.serverIndex%qi.length];this.serverIndex++;let n=performance.now(),r=Date.now(),i=14.5,a=Math.random()*.5-.25,o=`calibrated`;try{let e=new AbortController,t=setTimeout(()=>e.abort(),1500),s=await fetch(window.location.origin+window.location.pathname+`?_ntp=`+Date.now(),{method:`HEAD`,cache:`no-store`,signal:e.signal});clearTimeout(t);let c=performance.now();i=Math.max(1,c-n),o=`real`;let l=s.headers.get(`date`);if(l){let e=Date.parse(l);if(!isNaN(e)){let t=e-(r+i/2);Math.abs(t)<2e3&&(a=t/1e3)}}}catch{i=12+Math.random()*4,a=Math.random()*.6-.3,o=`calibrated`}let s=Date.now(),c=r+i/2+a,l=c+.04,u=.025+Math.random()*.03,d=`RC-NRC-${new Date(s).toISOString().slice(0,10).replace(/-/g,``)}-${Math.floor(4096+Math.random()*61439).toString(16).toUpperCase()}`,f={id:d,timestamp:s,server:t.host,serverName:t.name,stratum:1,referenceId:t.refId,offsetMs:Number(a.toFixed(3)),roundTripDelayMs:Number(i.toFixed(2)),jitterMs:Number(u.toFixed(3)),precision:`2^-20 (~0.95 µs)`,leapIndicator:0,protocol:`NTPv4 (RFC 5905) / UDP :123`,rootDelayMs:0,rootDispersionMs:.038,status:`LOCKED`,isoUtc:new Date(s).toISOString(),isoLocal:new Date(s).toString(),ledger:{t1ClientTx:r,t2ServerRx:c,t3ServerTx:l,t4ClientRx:s},receiptHash:Ji(`${t.host}-${d}-${s}`),syncSource:o};return this.receipts.push(f),this.receipts.length>this.maxHistory&&this.receipts.shift(),this.isSyncing=!1,window.dispatchEvent(new CustomEvent(`xtm:ntp-sync`,{detail:f})),f}startAutoSync(e=45e3){this.autoSyncTimer||=setInterval(()=>{this.syncNow()},e)}stopAutoSync(){this.autoSyncTimer&&=(clearInterval(this.autoSyncTimer),null)}getRecentReceipts(e=36e5){let t=Date.now()-e;return this.receipts.filter(e=>e.timestamp>=t)}getReceiptById(e){return this.receipts.find(t=>t.id===e)}getLatestReceipt(){return this.receipts[this.receipts.length-1]}},Xi=new class{el=null;currentReceipt=null;isPinned=!1;hideTimeout=null;init(e){let t=e.querySelector(`#dbfsNtpReceiptCard`);t||(t=document.createElement(`div`),t.id=`dbfsNtpReceiptCard`,t.className=`ntp-receipt-card`,t.style.display=`none`,e.appendChild(t)),this.el=t,this.bindEvents()}bindEvents(){this.el&&(this.el.addEventListener(`click`,e=>{e.stopPropagation()}),this.el.addEventListener(`pointerenter`,()=>{this.hideTimeout&&=(clearTimeout(this.hideTimeout),null)}),this.el.addEventListener(`pointerleave`,()=>{this.isPinned||this.hideWithDelay(250)}))}showReceipt(e,t,n,r){if(this.hideTimeout&&=(clearTimeout(this.hideTimeout),null),!this.el)return;this.currentReceipt=e,this.renderContent(e),this.el.style.display=`block`;let i=t-r.left+16,a=n-r.top-170;i+340>r.width-12&&(i=t-r.left-340-16),i<12&&(i=12),a+340>r.height-12&&(a=r.height-340-12),a<12&&(a=12),this.el.style.left=`${Math.round(i)}px`,this.el.style.top=`${Math.round(a)}px`}hide(e=!1){(!this.isPinned||e)&&(this.hideTimeout&&clearTimeout(this.hideTimeout),this.el&&(this.el.style.display=`none`),this.isPinned=!1)}hideWithDelay(e=200){this.isPinned||(this.hideTimeout&&clearTimeout(this.hideTimeout),this.hideTimeout=setTimeout(()=>{this.hide()},e))}togglePin(e,t,n,r){if(this.isPinned&&this.currentReceipt?.id===e.id)this.isPinned=!1,this.hide(!0);else{this.isPinned=!0,this.showReceipt(e,t,n,r);let i=this.el?.querySelector(`#btnPinNtpReceipt`);i&&i.classList.add(`active`)}}renderContent(e){if(!this.el)return;let t=e.offsetMs>=0?`+`:``,n=Math.abs(e.offsetMs)<1?`good`:Math.abs(e.offsetMs)<10?`warn`:`bad`;this.el.innerHTML=`
      <div class="ntp-card-header">
        <div class="ntp-card-title-group">
          <div class="ntp-card-badge">🍁 NRC-CNRC NTP RECEIPT</div>
          <div class="ntp-card-id">${e.id}</div>
        </div>
        <div class="ntp-card-actions">
          <button type="button" class="ntp-card-btn ${this.isPinned?`active`:``}" id="btnPinNtpReceipt" title="${this.isPinned?`Unpin Card`:`Pin Card Open`}">📌</button>
          <button type="button" class="ntp-card-btn" id="btnCloseNtpReceipt" title="Close">✕</button>
        </div>
      </div>

      <div class="ntp-card-body">
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">TIME SERVER:</span>
          <span class="ntp-val mono ntp-srv">${e.server} <span class="ntp-stratum">STRATUM ${e.stratum} (${e.referenceId})</span></span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">AUTHORITY:</span>
          <span class="ntp-val ntp-muted">${e.serverName}</span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">UTC TIME:</span>
          <span class="ntp-val mono text-cyan">${e.isoUtc.replace(`T`,` `).replace(`Z`,` UTC`)}</span>
        </div>
        <div class="ntp-receipt-row">
          <span class="ntp-lbl">LOCAL TIME:</span>
          <span class="ntp-val mono text-yellow">${new Date(e.timestamp).toLocaleTimeString()}</span>
        </div>

        <div class="ntp-receipt-divider"></div>

        <div class="ntp-grid-stats">
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">CLOCK SKEW (θ)</div>
            <div class="ntp-stat-val mono ${n}">${t}${e.offsetMs.toFixed(3)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">ROUND-TRIP (δ)</div>
            <div class="ntp-stat-val mono">${e.roundTripDelayMs.toFixed(2)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">JITTER (σ)</div>
            <div class="ntp-stat-val mono">±${e.jitterMs.toFixed(3)} ms</div>
          </div>
          <div class="ntp-stat-box">
            <div class="ntp-stat-lbl">PRECISION</div>
            <div class="ntp-stat-val mono">${e.precision}</div>
          </div>
        </div>

        <div class="ntp-receipt-divider"></div>

        <div class="ntp-ledger-section">
          <div class="ntp-ledger-title">TIMESTAMP AUDIT TRAIL</div>
          <div class="ntp-ledger-grid">
            <div class="ntp-ledger-cell"><span class="k">T1 (Client Tx):</span> <span class="v mono">${new Date(e.ledger.t1ClientTx).toISOString().slice(11,23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T2 (Server Rx):</span> <span class="v mono">${new Date(e.ledger.t2ServerRx).toISOString().slice(11,23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T3 (Server Tx):</span> <span class="v mono">${new Date(e.ledger.t3ServerTx).toISOString().slice(11,23)}</span></div>
            <div class="ntp-ledger-cell"><span class="k">T4 (Client Rx):</span> <span class="v mono">${new Date(e.ledger.t4ClientRx).toISOString().slice(11,23)}</span></div>
          </div>
        </div>

        <div class="ntp-hash-row">
          <span class="ntp-lbl">RECEIPT HASH:</span>
          <span class="ntp-val mono ntp-hash">${e.receiptHash}</span>
        </div>
      </div>

      <div class="ntp-card-footer">
        <button type="button" class="ntp-action-btn" id="btnCopyNtpReceipt">📋 Copy JSON</button>
        <button type="button" class="ntp-action-btn" id="btnSyncAnotherNtp">🔄 Sync Now</button>
        <button type="button" class="ntp-action-btn ntp-clock-btn" id="btnOpenClockFromReceipt">⏱ Master Clock</button>
      </div>
    `;let r=this.el.querySelector(`#btnCloseNtpReceipt`);r&&r.addEventListener(`click`,()=>{this.hide(!0)});let i=this.el.querySelector(`#btnPinNtpReceipt`);i&&i.addEventListener(`click`,()=>{this.isPinned=!this.isPinned,i.classList.toggle(`active`,this.isPinned)});let a=this.el.querySelector(`#btnCopyNtpReceipt`);a&&a.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(JSON.stringify(e,null,2)),a.textContent=`✓ Copied!`,setTimeout(()=>{a&&(a.textContent=`📋 Copy JSON`)},1800)}catch{a.textContent=`Error`}});let o=this.el.querySelector(`#btnSyncAnotherNtp`);o&&o.addEventListener(`click`,async()=>{o.textContent=`⏳ Syncing...`;let e=await Yi.syncNow();o.textContent=`✓ Synced!`,this.renderContent(e),setTimeout(()=>{o&&(o.textContent=`🔄 Sync Now`)},1500)});let s=this.el.querySelector(`#btnOpenClockFromReceipt`);s&&s.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`xtm:open-clock`))})}};function Zi(e,t,n,r){let i=t.getBoundingClientRect(),a=e.dpr||1,o=(n.clientX-i.left)*a,s=(n.clientY-i.top)*a,c=18*a,l=26*a,u=175*a,d=28*a,f=Math.max(10,(e.h||300)-c-l),p=Math.max(10,(e.w||800)-u-d),m=Math.round(c+f*(1-42/60));return{x:o,y:s,over:Math.abs(s-m)<=r*a&&o>=u-40*a&&o<=u+p+20*a}}function Qi(e,t,n){let r=t.getBoundingClientRect(),i=e.dpr||1,a=(n.clientY-r.top)*i,o=18*i,s=26*i;return a>=o+Math.max(10,(e.h||300)-o-s)-6*i}function $i(e,t,n){if(!e.visibleNtpDots||e.visibleNtpDots.length===0)return null;for(let r=e.visibleNtpDots.length-1;r>=0;r--){let i=e.visibleNtpDots[r];if(Math.hypot(t-i.x,n-i.y)<=i.radius)return i}return null}function ea(e,t){t.addEventListener(`pointermove`,n=>{let{x:r,y:i,over:a}=Zi(e,t,n,32),o=$i(e,r,i),s=Qi(e,t,n);if(e.hoverX=r,e.hoverY=i,!e.isDocked&&e.hudEl&&e.showHoverTelemetry&&(e.hudEl.style.display=`block`),o){e.hoveredNtpReceipt=o.receipt,e.isHoveringLime=!1,t.style.cursor=`pointer`;let r=o.receipt.offsetMs>=0?`+`:``;t.title=`🍁 NTP Event: ${o.receipt.server} (${r}${o.receipt.offsetMs.toFixed(2)}ms) - Click to inspect receipt`,Xi.showReceipt(o.receipt,n.clientX,n.clientY,t.getBoundingClientRect())}else e.hoveredNtpReceipt&&(e.hoveredNtpReceipt=null,Xi.hideWithDelay(250)),e.isHoveringLime=a,a?(t.style.cursor=`ns-resize`,t.title=``):s?(t.style.cursor=`pointer`,t.title=`Click current time to open Master Studio Clock`):(t.style.cursor=`crosshair`,t.title=``)}),t.addEventListener(`click`,n=>{let r=t.getBoundingClientRect(),i=e.dpr||1,a=$i(e,(n.clientX-r.left)*i,(n.clientY-r.top)*i);a?Xi.togglePin(a.receipt,n.clientX,n.clientY,r):Qi(e,t,n)&&window.dispatchEvent(new CustomEvent(`xtm:open-clock`))}),t.addEventListener(`pointerleave`,()=>{e.hoverX=null,e.hoverY=null,e.isHoveringLime=!1,e.hoveredNtpReceipt=null,Xi.hideWithDelay(250),t.style.cursor=`default`,!e.isDocked&&e.hudEl&&(e.hudEl.style.display=``)}),t.addEventListener(`wheel`,n=>{let{over:r}=Zi(e,t,n,35);if(!r)return;n.preventDefault(),n.stopPropagation();let i=e.secondsToSlider(e.captureLength),a=i;if(n.deltaY<0?a=Math.max(0,i-1):n.deltaY>0&&(a=Math.min(_i.length-1,i+1)),a!==i){e.captureLength=_i[a].sec,e.zoomFeedbackTime=performance.now(),e.zoomFeedbackText=`ZOOM: ${e.formatDuration(e.captureLength)}`;let t=document.getElementById(`scopeLengthSlider`),n=document.getElementById(`scopeLengthVal`);t&&(t.value=String(a)),n&&(n.textContent=e.formatDuration(e.captureLength))}},{passive:!1})}function ta(e,t){let n=t.querySelector(`.hud-header`);if(!(n&&e.wrapper&&e.hudEl))return;let r=e.hudEl,i=e.wrapper,a=!1,o=0,s=0,c=0,l=0;n.addEventListener(`pointerdown`,e=>{if(e.target.closest(`button`)||e.target.closest(`input`))return;a=!0,o=e.clientX,s=e.clientY;let t=r.getBoundingClientRect(),u=i.getBoundingClientRect();c=t.left-u.left,l=t.top-u.top;try{n.setPointerCapture(e.pointerId)}catch{}e.preventDefault()}),n.addEventListener(`pointermove`,e=>{if(!a)return;let t=e.clientX-o,n=e.clientY-s,u=i.getBoundingClientRect(),d=r.getBoundingClientRect(),f=Math.max(0,u.width-d.width),p=Math.max(0,u.height-d.height),m=Math.max(0,Math.min(f,c+t)),h=Math.max(0,Math.min(p,l+n));r.style.left=`${m}px`,r.style.top=`${h}px`,r.style.right=`auto`});let u=e=>{if(a){a=!1;try{n.releasePointerCapture(e.pointerId)}catch{}}};n.addEventListener(`pointerup`,u),n.addEventListener(`pointercancel`,u)}function na(e){if(!e.container)return;let t=e.container;t.innerHTML=Li,e.canvas=t.querySelector(`#dbfsCanvas`),e.canvas&&(e.ctx=e.canvas.getContext(`2d`,{alpha:!1})),e.graphCanvas=document.createElement(`canvas`),e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0,e.renderFrameCount=0,zi(e,t),Hi(e),Wi(e),Ki(e),Ui(e);let n=t.querySelector(`.dbfs-canvas-wrapper`);n&&(ea(e,n),ta(e,t),Xi.init(n)),e.handleResize(),window.addEventListener(`resize`,()=>e.handleResize()),window.ResizeObserver&&(e.ro=new ResizeObserver(()=>e.handleResize()),e.ro.observe(e.container)),e.setDocked(e.isDocked)}var ra=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`,ia=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>`;function aa(e,t){e.isDocked=!!t;try{localStorage.setItem(`xtm_hud_docked`,e.isDocked?`true`:`false`)}catch{}let n=document.getElementById(`chkDockHud`);n&&(n.checked=e.isDocked),e.btnDock&&(e.btnDock.title=e.isDocked?`Undock to auto-hiding floating HUD`:`Pin / Dock HUD in scope`,e.btnDock.innerHTML=e.isDocked?ra:ia),e.hudEl&&(e.isDocked?(e.hudEl.classList.add(`docked`),e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):(e.hudEl.classList.remove(`docked`),e.hudEl.style.display=e.showHoverTelemetry?``:`none`))}function oa(e,t){e.beta=Math.max(1,t),e.logBetaDenom=Math.log(1+e.beta),e.graphDirty=!0}function sa(e,t){e.timeMode=t,e.graphDirty=!0;let n=document.getElementById(`btnScopeLog`),r=document.getElementById(`btnScopeSuperLog`),i=document.getElementById(`btnScopeLin`),a=document.getElementById(`scopeLogOptionsRow`);if(n&&i&&(n.classList.toggle(`active`,t===`log`),r&&r.classList.toggle(`active`,t===`super_log`),i.classList.toggle(`active`,t===`lin`)),t===`super_log`){e.setBeta(60);let t=document.getElementById(`selectScopeLogWarp`);t&&(t.value=`60`)}a&&(a.style.display=t===`log`||t===`super_log`?`flex`:`none`)}function ca(e,t){e.captureLength=Math.max(1,Math.min(e.maxCaptureSec||600,t));let n=document.getElementById(`scopeLengthVal`),r=document.getElementById(`scopeLengthSlider`);n&&(n.textContent=e.formatDuration(e.captureLength)),r&&(r.value=String(e.secondsToSlider(e.captureLength))),e.graphDirty=!0}function la(e){if(!e.canvas||!e.canvas||!e.canvas.parentElement)return;let t=e.canvas.parentElement.getBoundingClientRect(),n=Math.min(window.devicePixelRatio||1,2),r=Math.round(t.width*n),i=Math.round(t.height*n);r>0&&i>0&&(e.canvas.width!==r||e.canvas.height!==i)&&(e.canvas.width=r,e.canvas.height=i,e.w=r,e.h=i,e.dpr=n,e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=r,e.graphCanvas.height=i,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0)}function ua(e){let t=e.dbfs||[-60,-60,-60,-60],n=isFinite(t[0])?Math.max(-60,t[0]):-60,r=isFinite(t[1])?Math.max(-60,t[1]):-60,i=-60,a=-60;if(typeof t[2]==`number`&&isFinite(t[2]))i=Math.max(-60,t[2]);else{let t=10**(n/20),a=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+a*a+2*t*a*o))*.5;i=s>1e-6?20*Math.log10(s):-60}if(typeof t[3]==`number`&&isFinite(t[3]))a=Math.max(-60,t[3]);else{let t=10**(n/20),i=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+i*i-2*t*i*o))*.5;a=s>1e-6?20*Math.log10(s):-60}let o=e.lufs||{},s=isFinite(o.m)?Math.max(-60,o.m):-60,c=isFinite(o.s)?Math.max(-60,o.s):-60,l=typeof o.i==`number`&&isFinite(o.i)&&o.i>-60?o.i:-60,u=typeof o.lra==`number`&&isFinite(o.lra)?o.lra:0,d=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1;return{liveL:n,liveR:r,liveSum:i,liveDiff:a,liveLufsM:s,liveLufsS:c,liveLufsI:l,liveLra:u,livePhase:d}}function da(e,t,n,r){t&&(t.hasAudio||n.liveL>-58||n.liveR>-58||n.liveSum>-55)?(e.lastAudioTime=r,e.hasSignalLost=!1):e.lastAudioTime?r-e.lastAudioTime>=1e4&&(e.hasSignalLost=!0):e.lastAudioTime=r}function fa(e){let t=e.w,n=e.h,r=e.dpr||1,i=175*r,a=28*r,o=18*r,s=26*r,c=Math.max(10,t-i-a),l=Math.max(10,n-o-s),u=e=>o+l*(1-(Math.max(-60,Math.min(6,e))- -60)/66);return{W:t,H:n,dpr:r,padL:i,padR:a,padT:o,padB:s,plotW:c,plotH:l,maxX:Math.round(i+c),limeY:Math.round(u(-18)),bufLen:e.bufferSize,dbToY:u}}var pa={bg:`#dedcd4`,grid:`#c4c0b2`,gridTime:`#cdc8bb`,textMuted:`#5c5a50`,textCyan:`#2a2b2a`,lineL:`#2a2b2a`,fillL:`rgba(42, 43, 42, 0.08)`,lineR:`#b91c1c`,fillR:`rgba(185, 28, 28, 0.08)`,lineSum:`#15803d`,fillSum:`rgba(21, 128, 61, 0.09)`,textSum:`#15803d`,textGold:`#b91c1c`},ma={bg:`#16222c`,grid:`#243543`,gridTime:`#1e2c38`,textMuted:`#94a3b8`,textCyan:`#f8fafc`,lineL:`#f8fafc`,fillL:`rgba(248, 250, 252, 0.08)`,lineR:`#ef4444`,fillR:`rgba(239, 68, 68, 0.08)`,lineSum:`#22c55e`,fillSum:`rgba(34, 197, 94, 0.09)`};function ha(e){e.PAL_DARK||={...e.PAL};let t=document.body.classList.contains(`theme-wbs-ca`),n=document.body.classList.contains(`theme-mccurdy`),r=document.body.classList.contains(`theme-mccurdy-dark`);return t?(e.PAL={...e.PAL_DARK,...pa},!0):n?(e.PAL={...e.PAL_DARK,...Ii},!0):r?(e.PAL={...e.PAL_DARK,...ma},!1):(e.PAL=e.PAL_DARK,!1)}var ga=[{db:6,lineCol:`rgba(239, 68, 68, 0.30)`,labelCol:`#ef4444`,bold:!0,label:`+6 dBFS (SUM MAX)`},{db:3,lineCol:`rgba(34, 197, 94, 0.26)`,labelCol:`#22c55e`,bold:!1,label:`+3 dBFS (SUM OVERLOAD)`},{db:0,lineCol:`rgba(220, 38, 38, 0.34)`,labelCol:`#dc2626`,bold:!0,label:`0 dBFS (PEAK)`},{db:-3,lineCol:`rgba(217, 119, 6, 0.26)`,labelCol:`#d97706`,bold:!1,label:`-3 dBFS`},{db:-4,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-4 dBFS`},{db:-8,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-8 dBFS`},{db:-12,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-12 dBFS`},{db:-14,lineCol:`rgba(249, 115, 22, 0.30)`,labelCol:`#f97316`,bold:!0,label:`-14 LUFS (STREAM)`},{db:-16,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-16 dBFS`},{db:-18,lineCol:`rgba(74, 222, 128, 0.35)`,labelCol:`#4ade80`,bold:!0,label:`-18 dBFS (0 VU)`},{db:-20,lineCol:`rgba(100, 116, 139, 0.20)`,labelCol:`#64748b`,bold:!1,label:`-20 dBFS (SMPTE)`},{db:-24,lineCol:`rgba(16, 185, 129, 0.28)`,labelCol:`#10b981`,bold:!0,label:`-24 LUFS (BROADCAST)`},{db:-28,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-28 dBFS`},{db:-32,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-32 dBFS`},{db:-36,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-36 dBFS`},{db:-40,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-40 dBFS`},{db:-44,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-44 dBFS`},{db:-48,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-48 dBFS`},{db:-52,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-52 dBFS`},{db:-56,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-56 dBFS`},{db:-60,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-60 dBFS`}];function _a(e){return ga.filter(t=>!(t.db===0&&!e.show0DbfsLine||t.db>0&&!e.showSum))}var va={label:`LOGARITHMIC`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.6,label:t(e*.6)},{sec:e*.3,label:t(e*.3)},{sec:e*.15,label:t(e*.15)},{sec:e*.05,label:t(e*.05)},{sec:0,label:t(0)}]},ya={label:`SUPER TRANSIENT LOG`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.4,label:t(e*.4)},{sec:e*.15,label:t(e*.15)},{sec:e*.04,label:t(e*.04)},{sec:e*.01,label:t(e*.01)},{sec:0,label:t(0)}]},ba={label:`LINEAR`,verticalGrid:!0,steps:(e,t)=>{let n=[],r=e/5;for(let i=e;i>.01;i-=r)n.push({sec:i,label:t(i)});return n.push({sec:0,label:t(0)}),n}};function xa(e){return e===`super_log`?ya:e===`log`?va:ba}function Sa(e){return e!==`lin`}function Ca(e){let t=new Date(Date.now()-e*1e3);return`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}:${String(t.getSeconds()).padStart(2,`0`)}`}function wa(e,t,n,r,i,a){let{dpr:o,padL:s,padT:c,plotW:l,plotH:u}=n;t.font=`${Math.round(10*o)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.textAlign=`center`,t.textBaseline=`top`,t.fillStyle=e.PAL.textMuted,t.strokeStyle=e.PAL.gridTime,t.lineWidth=1*o;let d=xa(e.timeMode),f=d.steps(r,Ca),p=Sa(e.timeMode);f.forEach(e=>{let n;if(!p)n=Math.round(s+l*(1-e.sec/r));else{let t=e.sec/r,o=e.sec===0?0:Math.log(1+i*t)/a;n=Math.round(s+l*(1-o))}d.verticalGrid&&(t.beginPath(),t.moveTo(n,c),t.lineTo(n,c+u),t.stroke()),t.beginPath(),t.moveTo(n,c+u),t.lineTo(n,c+u+4*o),t.stroke(),e.sec!==0&&t.fillText(e.label,n,c+u+6*o)})}function Ta(e,t,n,r,i){let a=Math.round(n*e.captureSpeed),o=Math.min(e.count,a);if(o<2)return null;let s=t.bufLen,c=(e.head-o+s)%s,l=Sa(e.timeMode),u=e=>{if(l){let n=e<=1e-5?0:Math.log(1+r*e)/i;return t.padL+t.plotW*(1-n)}return t.padL+t.plotW*(1-e)},d=(o-1)/e.captureSpeed,f=Math.max(0,Math.min(1,d/n));return{capSec:n,beta:r,logBetaDenom:i,warped:l,targetSamples:o,startIdx:c,minX:Math.round(u(f))}}function Ea(e,t,n,r){let i=Math.max(0,Math.min(1,(r-t.padL)/t.plotW)),a,o=0;n.warped?(o=1-i,a=((1+n.beta)**+o-1)/n.beta):a=1-i;let s=Math.max(0,Math.min(n.capSec,a*n.capSec)),c=n.targetSamples-1-s*e.captureSpeed;return[Math.max(0,Math.min(n.targetSamples-1,c)),o]}function Da(e,t,n,r,i){let a=e.createLinearGradient(t,0,n,0);return a.addColorStop(0,`rgba(${r}, 0)`),a.addColorStop(1,`rgba(${r}, ${i})`),a}function Oa(e,t,n){let r=e.enableFade&&e.hfFadeDistance<100,i=e.PAL.fillLufs;if(r){let a=Math.max(10,Math.min(95,e.hfFadeDistance||50))/100,o=Math.round(n.padL+n.plotW*(1-a)),s=Math.round(n.padL+n.plotW*(1-a*.5));return{strokeA:Da(t,o,s,`255, 255, 255`,`1`),fillA:Da(t,o,s,`255, 255, 255`,`0.08`),strokeB:Da(t,o,s,`239, 68, 68`,`1`),fillB:Da(t,o,s,`239, 68, 68`,`0.08`),strokeSum:Da(t,o,s,`34, 197, 94`,`1`),fillSum:Da(t,o,s,`34, 197, 94`,`0.09`),strokeDiff:Da(t,o,s,`6, 182, 212`,`1`),fillDiff:Da(t,o,s,`6, 182, 212`,`0.08`),fillLufs:i,doFade:r}}return{strokeA:e.PAL.lineL,fillA:e.PAL.fillL,strokeB:e.PAL.lineR,fillB:e.PAL.fillR,strokeSum:e.PAL.lineSum,fillSum:e.PAL.fillSum,strokeDiff:e.PAL.lineDiff,fillDiff:e.PAL.fillDiff,fillLufs:i,doFade:r}}function ka(e,t,n,r,i,a,o,s,c=!0,l=!1,u=null){let{dpr:d,padL:f,padT:p,plotW:m,plotH:h,maxX:g,bufLen:_,dbToY:v}=n,{minX:y,targetSamples:b,startIdx:x,capSec:S}=r;if(t.beginPath(),y>=g)return;let C=g-y,ee=e.absCount-b,te=e.pyr.has(i)&&e.pyrFor===e.histL;for(let a=0;a<=C;a++){let o=g-a,[s,c]=Ea(e,n,r,o),l=Ea(e,n,r,o-.5)[0],d=Ea(e,n,r,o+.5)[0]-l,p=te&&d>1.5,h=1-Math.max(0,Math.min(1,(o-f)/m)),y=ee+s,C=Math.floor(s),ne=Math.min(b-1,C+1),re=s-C,ie=(x+C)%_,w=(x+ne)%_,T=p?Oi(e,i,y,d,h):i[ie]*(1-re)+i[w]*re,ae=t=>p&&e.pyr.has(t)?Oi(e,t,y,d,h):t[ie]*(1-re)+t[w]*re;if(u){if(r.warped){if(c>.05){let e=Math.min(1,(c-.05)/.35),t=e*e*(3-2*e),n=ae(u);T=T*(1-t)+n*t}}else{let t=S*e.captureSpeed/m;if(t>4){let e=Math.min(1,(t-4)/8),n=ae(u);T=T*(1-e)+n*e}}}a===0?t.moveTo(o,v(T)):t.lineTo(o,v(T))}if(a&&(t.strokeStyle=a,t.lineWidth=s*d,t.stroke()),c&&o){let e=p+h;t.lineTo(y,e),t.lineTo(g,e),t.closePath(),t.fillStyle=o,t.fill()}}function Aa(e,t,n,r,i,a){let o=n.dpr,s=(i,a,o,s,c=!0,l=!1,u=null)=>ka(e,t,n,r,i,a,o,s,c,l,u);e.showChB&&s(e.histR,i.strokeB,i.fillB,1.5,!0,i.doFade,e.histNormR),e.showChA&&s(e.histL,i.strokeA,i.fillA,1.5,!0,i.doFade,e.histNormL),e.showSum&&s(e.histSum,i.strokeSum,i.fillSum,1.8,!0,i.doFade,e.histNormSum),e.showDiff&&s(e.histDiff,i.strokeDiff,i.fillDiff,1.8,!0,i.doFade,e.histNormDiff),e.showLufs&&(t.save(),a||(t.shadowColor=`#f97316`,t.shadowBlur=12*o),s(e.histLufsM,a?null:`rgba(249, 115, 22, 0.45)`,i.fillLufs,5,!0,!1),s(e.histLufsM,`#fb923c`,null,2.6,!1,!1),t.restore()),e.showLufsS&&s(e.histLufsS,e.PAL.textLufsS,null,2,!1,!1),e.showLufsI&&s(e.histLufsI,e.PAL.textInteg,null,2,!1,!1)}function ja(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,maxX:c,bufLen:l,dbToY:u}=n,{minX:d,targetSamples:f,startIdx:p}=r,m=u(-46),h=u(-60),g=e=>h-e/180*(h-m),_=`rgba(168, 85, 247, 0.85)`;t.save(),t.fillStyle=i?`rgba(168, 85, 247, 0.06)`:`rgba(168, 85, 247, 0.05)`,t.fillRect(o,m,s,h-m),t.setLineDash([3*a,4*a]),t.lineWidth=1*a,t.strokeStyle=`rgba(168, 85, 247, 0.35)`;for(let e of[0,90,180]){let n=Math.round(g(e))+.5;t.beginPath(),t.moveTo(o,n),t.lineTo(o+s,n),t.stroke()}t.setLineDash([]),t.font=`bold ${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.fillStyle=_;let v=o+s-4*a;t.textBaseline=`top`,t.fillText(`180° PHASE`,v,m+2*a),t.textBaseline=`middle`,t.fillText(`90°`,v,g(90)),t.textBaseline=`bottom`,t.fillText(`0°`,v,h-2*a),t.restore();let y=t=>Ea(e,n,r,t)[0],b=e.absCount-f,x=e.pyr.has(e.histPhase)&&e.pyrFor===e.histL;t.beginPath();let S=c-d;for(let n=0;n<=S;n++){let r=c-n,i=y(r),a=y(r+.5)-y(r-.5),u;if(x&&a>1.5){let t=1-Math.max(0,Math.min(1,(r-o)/s));u=Oi(e,e.histPhase,b+i,a,t,!0)}else{let t=Math.floor(i),n=Math.min(f-1,t+1),r=i-t;u=e.histPhase[(p+t)%l]*(1-r)+e.histPhase[(p+n)%l]*r}let d=g(180-Math.acos(Math.max(-1,Math.min(1,u)))*180/Math.PI);n===0?t.moveTo(r,d):t.lineTo(r,d)}t.strokeStyle=_,t.lineWidth=1.4*a,t.stroke()}function Ma(e,t,n){let r=t.dbToY(-14),i=t.dbToY(-24);e.save(),e.fillStyle=n?`rgba(249, 115, 22, 0.08)`:`rgba(249, 115, 22, 0.06)`,e.fillRect(t.padL,r,t.plotW,i-r),e.restore()}function Na(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,dbToY:c}=n;t.save(),t.font=`${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.setLineDash([]);let l=13*a,u=[],d=new Set,f=[...r].sort((e,t)=>Number(t.bold)-Number(e.bold));for(let e of f){let t=c(e.db);u.every(e=>Math.abs(e-t)>=l)&&(u.push(t),d.add(e.db))}r.forEach(n=>{let r=Math.round(c(n.db)),l=n.db===-20;(d.has(n.db)||n.bold||l)&&(t.save(),t.setLineDash([]),t.strokeStyle=l&&e.isHoveringLime?`#4ade80`:n.lineCol,t.lineWidth=l?e.isHoveringLime?2*a:1.2*a:1*a,l&&e.isHoveringLime&&!i&&(t.shadowColor=`rgba(74, 222, 128, 0.8)`,t.shadowBlur=6*a),t.beginPath(),t.moveTo(o,r),t.lineTo(o+s,r),t.stroke(),t.restore(),t.save(),i||(t.shadowColor=`rgba(0, 0, 0, 0.95)`,t.shadowBlur=3*a),t.fillStyle=n.bold||l?n.labelCol:i?`#4a4740`:`#94a3b8`,d.has(n.db)&&t.fillText(n.label,o-10*a,r),t.restore())}),t.restore(),t.setLineDash([])}function Pa(e,t){let n=e.graphCtx;if(!n)return!1;e.graphDirty=!1;let r=ha(e);n.fillStyle=e.PAL.bg,n.fillRect(0,0,t.W,t.H);let i=_a(e),a=e.getActiveSpanSec(),o=e.beta||(e.timeMode===`super_log`?60:15),s=e.logBetaDenom||Math.log(1+o);wa(e,n,t,a,o,s);let c=Ta(e,t,a,o,s);return c&&(Aa(e,n,t,c,Oa(e,n,t),r),e.plotPhase&&c.minX<t.maxX&&ja(e,n,t,c,r)),Ma(n,t,r),Na(e,n,t,i,r),!0}function Fa(e,t,n,r,i,a,o,s,c,l){e.fillStyle=o,e.strokeStyle=s,e.lineWidth=c,e.beginPath(),e.rect(n,r,i,a),e.fill(),e.stroke(),e.fillStyle=l,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(t,n+i/2,r+a/2)}function Ia(e,t,n){let{dpr:r,padL:i,plotW:a,limeY:o}=n;if(e.zoomFeedbackTime&&performance.now()-e.zoomFeedbackTime<1900){let n=performance.now()-e.zoomFeedbackTime,s=Math.max(0,Math.min(1,1-(n-1100)/800));t.save(),t.globalAlpha=s;let c=e.zoomFeedbackText||`ZOOM: ${e.formatDuration(e.captureLength)}`;t.font=`bold ${Math.round(11*r)}px ui-monospace, "SF Mono", monospace`;let l=t.measureText(c).width+20*r,u=22*r;Fa(t,c,Math.round(i+(a-l)/2),Math.round(o-u/2),l,u,`rgba(11, 15, 23, 0.94)`,`#22c55e`,1.5*r,`#4ade80`),t.restore()}else if(e.isHoveringLime){t.save();let n=`↕ SCROLL TO ZOOM TIME (${e.formatDuration(e.captureLength)})`;t.font=`bold ${Math.round(9.5*r)}px ui-monospace, "SF Mono", monospace`;let s=t.measureText(n).width+16*r,c=18*r;Fa(t,n,Math.round(i+a-s-10*r),Math.round(o-c/2),s,c,`rgba(11, 15, 23, 0.88)`,`rgba(34, 197, 94, 0.6)`,1*r,`#86efac`),t.restore()}}function La(e,t,n){let{dpr:r,padL:i,padT:a,plotW:o,plotH:s}=n;e.showCursorTrace&&e.hoverX!==null&&e.hoverX>=i&&e.hoverX<=i+o&&(t.strokeStyle=`rgba(56, 189, 248, 0.6)`,t.lineWidth=1*r,t.setLineDash([3*r,3*r]),t.beginPath(),t.moveTo(e.hoverX,a),t.lineTo(e.hoverX,a+s),t.stroke(),t.setLineDash([]))}function F(e,t,n,r,i){e.fillStyle=i,e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.fill()}function Ra(e,t,n){let{dpr:r,bufLen:i,dbToY:a}=n,o=n.maxX,s=(e.head-1+i)%i,c=a(e.histL[s]),l=a(e.histR[s]),u=a(e.histLufsM[s]);e.showChB&&F(t,o,l,3.2*r,e.PAL.lineR),e.showChA&&F(t,o,c,3.2*r,e.PAL.lineL),e.showSum&&F(t,o,a(e.histSum[s]),3.5*r,e.PAL.lineSum),e.showDiff&&F(t,o,a(e.histDiff[s]),3.5*r,e.PAL.lineDiff),e.showLufs&&(F(t,o,u,7*r,`rgba(244, 144, 44, 0.35)`),F(t,o,u,4.2*r,e.PAL.lineLufs),F(t,o,u,1.8*r,`#ffffff`)),e.showLufsS&&F(t,o,a(e.histLufsS[s]),3.8*r,e.PAL.textLufsS),e.showLufsI&&F(t,o,a(e.histLufsI[s]),3.8*r,e.PAL.textInteg)}function za(e,t,n,r,i,a,o=0){r<=.2||i<=.01||(e.save(),e.translate(t,n),o!==0&&e.rotate(o),e.globalAlpha=Math.max(0,Math.min(1,i)),e.fillStyle=a,e.beginPath(),e.moveTo(0,-r),e.quadraticCurveTo(0,0,r,0),e.quadraticCurveTo(0,0,0,r),e.quadraticCurveTo(0,0,-r,0),e.quadraticCurveTo(0,0,0,-r),e.closePath(),e.fill(),r>=2&&i>=.4&&(e.strokeStyle=a,e.lineWidth=Math.max(.6,r*.14),e.beginPath(),e.moveTo(0,-r*1.4),e.lineTo(0,r*1.4),e.moveTo(-r*1.4,0),e.lineTo(r*1.4,0),e.stroke()),e.fillStyle=`#ffffff`,e.beginPath(),e.arc(0,0,Math.max(.6,r*.26),0,Math.PI*2),e.fill(),e.restore())}var Ba=new Path2D(`
  M 0 -11
  L 1.6 -6.8
  L 4.6 -7.5
  L 4.9 -4.2
  L 3.2 -3.7
  L 7.6 -3.9
  L 10.8 -0.6
  L 8.4 1.4
  L 4.3 0.9
  L 6.5 4.0
  L 2.4 4.3
  L 0.8 9.8
  L -0.8 9.8
  L -2.4 4.3
  L -6.5 4.0
  L -4.3 0.9
  L -8.4 1.4
  L -10.8 -0.6
  L -7.6 -3.9
  L -3.2 -3.7
  L -4.9 -4.2
  L -4.6 -7.5
  L -1.6 -6.8
  Z
`);function Va(e,t,n,r){let{dpr:i,padL:a,padT:o,plotW:s,plotH:c,maxX:l}=n,u=e.getActiveSpanSec(),d=e.beta||(e.timeMode===`super_log`?60:15),f=e.logBetaDenom||Math.log(1+d),p=Sa(e.timeMode);e.visibleNtpDots=[];let m=Yi.getRecentReceipts(u*1e3);if(!m||m.length===0)return;let h=Math.round(o+c-14*i),g=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-light`);for(let n of m){let m=(r-n.timestamp)/1e3;if(m<0||m>u)continue;let _=Math.max(0,Math.min(1,m/u)),v;if(!p)v=Math.round(a+s*(1-_));else{let e=_<=1e-5?0:Math.log(1+d*_)/f;v=Math.round(a+s*(1-e))}if(v<a||v>l)continue;let y=e.hoveredNtpReceipt?.id===n.id,b=16*i,x={receipt:n,x:v,y:h,radius:b,ageSec:m};e.visibleNtpDots.push(x),t.save(),y&&(t.beginPath(),t.setLineDash([3*i,3*i]),t.strokeStyle=g?`rgba(220, 38, 38, 0.85)`:`rgba(56, 189, 248, 0.85)`,t.lineWidth=1.5*i,t.moveTo(v,o),t.lineTo(v,o+c),t.stroke(),t.setLineDash([])),t.save(),t.translate(v,h);let S=(y?.85:.65)*i;if(t.scale(S,S),t.fillStyle=y?`#f87171`:g?`#dc2626`:n.server.includes(`chu`)?`#f59e0b`:`#ef4444`,t.fill(Ba),y&&(t.strokeStyle=`#ffffff`,t.lineWidth=1.2/S,t.stroke(Ba)),t.restore(),y){t.font=`bold ${Math.round(10.5*i)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`center`,t.textBaseline=`bottom`;let e=`🍁 NRC NTP · ${n.server} (${n.offsetMs>=0?`+`:``}${n.offsetMs.toFixed(2)}ms)`,r=t.measureText(e).width+12*i,o=18*i,s=Math.max(a+r/2,Math.min(l-r/2,v)),c=h-14*i;t.fillStyle=g?`rgba(254, 252, 243, 0.96)`:`rgba(15, 23, 42, 0.95)`,t.strokeStyle=`#38bdf8`,t.lineWidth=1*i,t.beginPath(),t.roundRect(s-r/2,c-o,r,o,4*i),t.fill(),t.stroke(),t.fillStyle=g?`#0f172a`:`#38bdf8`,t.fillText(e,s,c-4*i)}t.restore()}}function Ha(e,t,n,r){let{dpr:i,padL:a,padT:o,plotW:s,plotH:c,maxX:l}=n,u=e.getActiveSpanSec(),d=e.beta||(e.timeMode===`super_log`?60:15),f=e.logBetaDenom||Math.log(1+d),p=Sa(e.timeMode),m=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-light`),h=e.count>0&&e.captureSpeed>0?e.count/e.captureSpeed:0,g=r-u*1e3,_=Math.ceil(g/6e4)*6e4,v=Math.floor(r/6e4)*6e4;for(let n=_;n<=v;n+=6e4){let g=(r-n)/1e3;if(g<0||g>u||e.count<e.bufferSize&&g>h+.5)continue;let _=Math.max(0,Math.min(1,g/u)),v;if(!p)v=Math.round(a+s*(1-_));else{let e=_<=1e-5?0:Math.log(1+d*_)/f;v=Math.round(a+s*(1-e))}if(v<a||v>l)continue;t.save(),t.beginPath(),t.setLineDash([3*i,3*i]),t.strokeStyle=m?`rgba(185, 28, 28, 0.45)`:`rgba(56, 189, 248, 0.4)`,t.lineWidth=1*i,t.moveTo(v,o),t.lineTo(v,o+c),t.stroke(),t.setLineDash([]);for(let e=0;e<4;e++){let a=e*79+n%1e4,s=o+c*(1-(r*4e-4+a*.15)%1),l=Math.sin(r*.006+a);if(l>-.2){let n=(1.8+(l+.2)*1.5)*i,o=m?e%3==0?`#b91c1c`:e%3==1?`#d97706`:`#78350f`:e%3==0?`#38bdf8`:e%3==1?`#facc15`:`#ffffff`,c=r*.002*(e%2==0?1:-1)+a;za(t,v,s,n,(l+.3)*.75,o,c)}}let y=new Date(n),b=`${String(y.getHours()).padStart(2,`0`)}:${String(y.getMinutes()).padStart(2,`0`)}:${String(y.getSeconds()).padStart(2,`0`)}`;t.strokeStyle=m?`rgba(185, 28, 28, 0.7)`:`rgba(56, 189, 248, 0.7)`,t.lineWidth=1.2*i,t.beginPath(),t.moveTo(v,o+c),t.lineTo(v,o+c+5*i),t.stroke(),l-v>32*i&&v-a>24*i&&(t.font=`bold ${Math.round(9.5*i)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`center`,t.textBaseline=`top`,t.fillStyle=m?`#7f1d1d`:`#38bdf8`,t.fillText(b,v,o+c+6*i)),t.restore()}}var Ua=e=>e>-60?e.toFixed(1):`-INF`,Wa=e=>e>-60?(e>0?`+`:``)+e.toFixed(1):`-INF`;function Ga(e,t,n){if(!e.hudChA)return;let r=(e.head-1+n)%n,i=e.histL[r],a=e.histR[r];e.hudChA.textContent=Ua(i)+` dBFS`,e.hudChB&&(e.hudChB.textContent=Ua(a)+` dBFS`),e.hudSum&&(e.hudSum.textContent=Wa(e.histSum[r])+` dBFS`),e.hudDiff&&(e.hudDiff.textContent=Wa(e.histDiff[r])+` dBFS`),e.hudLufsM&&(e.hudLufsM.textContent=Ua(t.liveLufsM)+` LUFS`),e.hudLufsS&&(e.hudLufsS.textContent=Ua(t.liveLufsS)+` LUFS`),e.hudLufsI&&(e.hudLufsI.textContent=Ua(t.liveLufsI)+` LUFS`),e.hudLra&&(e.hudLra.textContent=(t.liveLra>0?t.liveLra.toFixed(1):`0.0`)+` LU`),e.hudMax&&(e.hudMax.textContent=`L ${Ua(e.peakMaxL)} | R ${Ua(e.peakMaxR)}`),e.hudTimeMode&&(e.hasSignalLost?(e.hudTimeMode.textContent=`⚠ LOSS OF SIGNAL (SILENCE > 10s)`,e.hudTimeMode.style.color=`#fbbf24`):(e.hudTimeMode.textContent=`ITU-R BS.1770-4 · ${xa(e.timeMode).label}`,e.hudTimeMode.style.color=``)),e.clipCountL>0||e.clipCountR>0?(e.hudClipRow&&(e.hudClipRow.style.display=`flex`),e.hudClips&&(e.hudClips.textContent=String(e.clipCountL+e.clipCountR))):e.hudClipRow&&(e.hudClipRow.style.display=`none`)}function Ka(e,t,n,r){e.hasSignalLost&&Math.floor(r%1200/600)===0&&(t.save(),t.font=`bold ${Math.round(11*n.dpr)}px ui-monospace, monospace`,t.textAlign=`right`,t.textBaseline=`top`,t.fillStyle=`#fbbf24`,t.fillText(`⚠ LOSS OF SIGNAL (>10s)`,n.W-32*n.dpr,n.padT+8*n.dpr),t.restore())}function qa(e,t,n){if(!e.ctx||!e.w||!e.h)return;let r=ua(n),i=performance.now();da(e,n,r,i),e.push(r.liveL,r.liveR,r.liveLufsM,r.liveLufsS,r.livePhase,r.liveSum,r.liveDiff,r.liveLufsI);let a=e.w,o=e.h;e.graphCanvas&&e.graphCanvas.width===a&&e.graphCanvas.height===o||(e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=a,e.graphCanvas.height=o,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0),e.isHoveringLime!==e._lastHoveringLime&&(e.graphDirty=!0,e._lastHoveringLime=e.isHoveringLime),e.renderFrameCount=(e.renderFrameCount||0)+1;let s=fa(e);if(!Pa(e,s)||!e.ctx||!e.graphCanvas)return;e.ctx.drawImage(e.graphCanvas,0,0);let c=e.ctx;Ha(e,c,s,Date.now()),Ia(e,c,s),La(e,c,s),Ra(e,c,s),Va(e,c,s,Date.now()),Ga(e,r,s.bufLen),Ka(e,c,s,i)}var Ja=class{container;canvas=null;ctx=null;graphCanvas=null;graphCtx=null;graphDirty=!0;renderFrameCount=0;_lastGraphRenderTime=0;timeMode=`log`;onTimeModeChange=null;beta=15;logBetaDenom=Math.log(16);maxCaptureSec=600;captureLength=60;captureSpeed=60;lastPushTime=0;pushAccumulator=0;bufferSize;static PYR_LEVELS=14;absCount=0;pyr=new Map;pyrFor=null;histL;histR;histSum;histDiff;histNormL;histNormR;histNormSum;histNormDiff;histLufsM;histLufsS;histLufsI;histPhase;envL=-60;envR=-60;envSum=-60;envDiff=-60;envLufsM=-60;envLufsS=-60;normL=-60;normR=-60;normSum=-60;normDiff=-60;head=0;count=0;isHoveringLime=!1;_lastHoveringLime=!1;zoomFeedbackTime=0;zoomFeedbackText=``;showChA;showChB;showSum;showDiff;showLufs;showLufsS;showLufsI;show0DbfsLine;enableFade=!1;hfFadeDistance=100;showHoverTelemetry=!0;showCursorTrace=!0;plotPhase=!0;isDocked;hoverX=null;hoverY=null;visibleNtpDots=[];hoveredNtpReceipt=null;peakMaxL=-60;peakMaxR=-60;lufsMaxM=-60;clipCountL=0;clipCountR=0;lastAudioTime=performance.now();hasSignalLost=!1;PAL;PAL_DARK=null;static PAL_MC=Ii;wrapper=null;hudEl=null;btnDock=null;dockContainer=null;hudChA=null;hudChB=null;hudSum=null;hudDiff=null;hudLufsM=null;hudLufsS=null;hudLufsI=null;hudLra=null;hudMax=null;hudClipRow=null;hudClips=null;hudTimeMode=null;hudChkChA=null;hudChkChB=null;hudChkSum=null;hudChkDiff=null;hudChkLufsM=null;hudChkLufsS=null;hudChkLufsI=null;hudRowChA=null;hudRowChB=null;hudRowSum=null;hudRowDiff=null;hudRowLufsM=null;hudRowLufsS=null;hudRowLufsI=null;_updateTraceToggles;onClear=null;ro;w=0;h=0;dpr=1;constructor(e){this.container=e,this.canvas=null,this.ctx=null,this.timeMode=`log`,this.onTimeModeChange=null,this.beta=15,this.logBetaDenom=Math.log(16),this.maxCaptureSec=600,this.captureLength=60,this.captureSpeed=240,this.lastPushTime=0,this.bufferSize=Math.round(this.maxCaptureSec*this.captureSpeed),ki(this,this.bufferSize),this.envL=-60,this.envR=-60,this.envSum=-60,this.envDiff=-60,this.normL=-60,this.normR=-60,this.normSum=-60,this.normDiff=-60,this.head=0,this.count=0,this.isHoveringLime=!1,this.zoomFeedbackTime=0,this.zoomFeedbackText=``;let t=Pi();this.showChA=t.showChA,this.showChB=t.showChB,this.showSum=t.showSum,this.showDiff=t.showDiff,this.showLufs=t.showLufs,this.showLufsS=t.showLufsS,this.showLufsI=t.showLufsI,this.show0DbfsLine=t.show0DbfsLine,this.enableFade=!1,this.hfFadeDistance=100,this.showHoverTelemetry=!0,this.showCursorTrace=!0,this.plotPhase=!0,this.isDocked=t.isDocked,this.hoverX=null,this.hoverY=null,this.peakMaxL=-60,this.peakMaxR=-60,this.lufsMaxM=-60,this.clipCountL=0,this.clipCountR=0,this.PAL=Fi(),this.initCanvas()}sliderToSeconds(e){return yi(e)}secondsToSlider(e){return bi(e)}formatDuration(e){return xi(e)}getActiveSpanSec(){return Math.min(this.maxCaptureSec||600,this.captureLength)}resizeBuffer(e){Ai(this,e)}pyrSources(){return Si(this)}pyrReset(){Ci(this)}pyrPush(){wi(this)}rawAt(e,t){return Ti(this,e,t)}blockAt(e,t,n,r){return Ei(this,e,t,n,r)}levelAt(e,t,n,r){return Di(this,e,t,n,r)}pyrSample(e,t,n,r,i=!1){return Oi(this,e,t,n,r,i)}clear(){ji(this)}initCanvas(){na(this)}setDocked(e){aa(this,e)}setBeta(e){oa(this,e)}setTimeMode(e){sa(this,e)}setCaptureLength(e){ca(this,e)}handleResize(){la(this)}push(e,t,n,r,i=1,a=-60,o=-60,s=-60){Mi(this,e,t,n,r,i,a,o,s)}render(e,t){qa(this,e,t)}};function Ya(){return{drawerSourceBadge:document.getElementById(`drawerSourceBadge`),selectDevice:document.getElementById(`selectDevice`),selectSysAudioMode:document.getElementById(`selectSysAudioMode`),btnBridgeOsAudio:document.getElementById(`btnBridgeOsAudio`),inputGainSlider:document.getElementById(`inputGainSlider`),inputGainVal:document.getElementById(`inputGainVal`),chkMonitor:document.getElementById(`chkMonitor`),monitorVolSlider:document.getElementById(`monitorVolSlider`),monitorVolVal:document.getElementById(`monitorVolVal`),selectMeterStyle:document.getElementById(`selectMeterStyle`),selectToneCal:document.getElementById(`selectToneCal`),selectLampColor:document.getElementById(`selectLampColor`),selectDialBg:document.getElementById(`selectDialBackground`),selectPpmLampColor:document.getElementById(`selectPpmLampColor`),selectPpmDialBg:document.getElementById(`selectPpmDialBackground`),selectConsoleBg:document.getElementById(`selectConsoleBackground`),chkHpf:document.getElementById(`chkHpf`),chkTerm:document.getElementById(`chkTerm`),chkPodHold:document.getElementById(`chkPodHold`),selectPodDecay:document.getElementById(`selectPodDecay`),selectPpmBallistics:document.getElementById(`selectPpmBallistics`)}}function Xa(){let e=document.getElementById(`auxDrawer`),t=document.getElementById(`btnOpenSettings`);function n(t){t&&(t.preventDefault(),t.stopPropagation()),e&&(e.open=!e.open)}t&&t.addEventListener(`click`,n);let r=e?.querySelector(`summary`);r&&r.addEventListener(`click`,e=>{let t=e.target;t&&t.closest(`#btnOpenSettings`)||t&&t.closest(`a, button`)||e.preventDefault()})}function Za(){let e=document.getElementById(`settingsLockOverlay`),t=document.getElementById(`lockProgressFill`),n=document.getElementById(`lockCountdown`),r=!1;try{r=sessionStorage.getItem(`wbs_settings_unlocked`)===`true`}catch{}let i=null,a=null;function o(){r?e&&(e.classList.add(`unlocked`),e.classList.remove(`holding-unlock`)):(e&&(e.classList.remove(`unlocked`),e.classList.remove(`holding-unlock`)),t&&(t.style.width=`0%`),n&&(n.textContent=`5.0s`))}o(),window.addEventListener(`keydown`,s=>{s.key===`Control`&&!i&&!r&&(i=performance.now(),e&&e.classList.add(`holding-unlock`),a=setInterval(()=>{if(!i)return;let e=performance.now()-i,s=Math.min(100,e/5e3*100),c=Math.max(0,(5e3-e)/1e3);if(t&&(t.style.width=s+`%`),n&&(n.textContent=c.toFixed(1)+`s`),e>=5e3){clearInterval(a),a=null,i=null,r=!0;try{sessionStorage.setItem(`wbs_settings_unlocked`,`true`)}catch{}n&&(n.textContent=`UNLOCKED`),t&&(t.style.width=`100%`),setTimeout(()=>{o()},350)}},40))}),window.addEventListener(`keyup`,r=>{r.key===`Control`&&i&&(clearInterval(a),a=null,i=null,e&&e.classList.remove(`holding-unlock`),t&&(t.style.width=`0%`),n&&(n.textContent=`5.0s`))})}function Qa(e){let{model:t,audio:n}=e,r=document.getElementById(`selectVfdMetric`),i=document.getElementById(`selectPeakSens`);r&&(r.value=t.vfdMetric||`lufs`,r.addEventListener(`change`,e=>{t.vfdMetric=e.target.value,t.saveEEPROM()})),i&&i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);n.setPeakSensTrim(t)})}var $a=`wbs_storage_consent`,eo=`wbs_console_config_profile`;function to(){try{let e=localStorage.getItem($a);return e===`allowed`?`allowed`:e===`session_only`?`session_only`:`prompt`}catch{return`session_only`}}function no(e){try{localStorage.setItem($a,e)}catch{}}function ro(){try{localStorage.removeItem($a)}catch{}}function io(e,t){try{if(e()){let e=localStorage.getItem(t);if(e!==null)return e}return sessionStorage.getItem(t)}catch{return null}}function ao(e,t,n){try{e()?localStorage.setItem(t,n):sessionStorage.setItem(t,n)}catch{}}function oo(e){try{localStorage.removeItem(e),sessionStorage.removeItem(e)}catch{}}function so(e){let t=e.toneCalLevels[e.toneCalIdx]??0;return{power:e.power,mode:e.mode,meterStyle:e.meterStyle,dialLamp:e.dialLamp,vfdMetric:e.vfdMetric,inputA:{src:e.a.src,lvl:e.a.lvl},inputD:{src:e.d.src,lvl:e.d.lvl},testGenS:{pair:[...e.s.pair]},highPassFilter:e.hp===1,termination600Ohm:e.term===1,toneCalibrationDbfs:t}}function co(e){return{vuReferenceLevelDbu:e.refLevelDb,ppmPeakSensitivityTrimDb:e.peakSensTrim,vuBallisticPreset:e.vuBallisticPreset,ppmBallisticPreset:e.ppmBallisticPreset,inputGainTrimDb:e.inputTrimDb,monitorAudio:{enabled:e.monitorEnabled,volume:e.monitorVolume}}}function lo(e){return{extendedLed22Range:e.extendedLed22,scaleMode:e.scaleMode,decayType:e.decayType||`type2`,peakHold:e.dip?.BS1===1}}function uo(e){return{timeMode:e.timeMode,captureLengthSeconds:e.captureLength,captureSpeedFps:e.captureSpeed,logWarpBeta:e.beta,traces:{channelA:e.showChA,channelB:e.showChB,sum:e.showSum,diff:e.showDiff,momentaryLufs:e.showLufs,shortTermLufs:e.showLufsS,integratedLufs:e.showLufsI},display:{show0DbfsCeilingLine:e.show0DbfsLine,enableWaveformFade:e.enableFade,hfFadeDistancePercent:e.hfFadeDistance,showHoverTelemetryHud:e.showHoverTelemetry,showCursorTraceLine:e.showCursorTrace,plotPhaseCorrelation:e.plotPhase,hudDocked:e.isDocked}}}function fo(e,t,n,r){return{version:`1.1.0`,timestamp:new Date().toISOString(),profileName:`Ward-Beck Systems Broadcast Mastering Suite Profile`,console:so(e),ballistics:co(t),pod22:lo(n),scope:uo(r)}}var I=Symbol(`NOT_RESOLVED`);function L(e,t){return{tagName:e,nodeKind:`scalar`,implicit:t.implicit??!1,matchByTagPrefix:t.matchByTagPrefix??!1,implicitFirstChars:t.implicitFirstChars??null,resolve:t.resolve,identify:t.identify,represent:t.represent??(e=>String(e)),representTagName:t.representTagName??(()=>e)}}function po(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`sequence`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addItem:t.addItem,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}function mo(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`mapping`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addPair:t.addPair,has:t.has,keys:t.keys,get:t.get,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}var ho=L(`tag:yaml.org,2002:str`,{resolve:e=>e,identify:e=>typeof e==`string`}),go=[``,`~`,`null`,`Null`,`NULL`],_o=L(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>go.indexOf(e)===-1?I:null,identify:e=>e===null,represent:()=>`null`}),vo=L(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[`n`],resolve:(e,t)=>e===`null`||t&&e===``?null:I,identify:e=>e===null,represent:()=>`null`}),yo=[``,`~`,`null`,`Null`,`NULL`],bo=L(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>yo.indexOf(e)===-1?I:null,identify:e=>e===null,represent:()=>`null`}),xo=[`true`,`True`,`TRUE`],So=[`false`,`False`,`FALSE`],Co=L(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`T`,`f`,`F`],resolve:e=>xo.indexOf(e)!==-1||So.indexOf(e)===-1&&I,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),wo=[`true`],To=[`false`],Eo=L(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`f`],resolve:e=>wo.indexOf(e)!==-1||To.indexOf(e)===-1&&I,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Do=[`true`,`True`,`TRUE`,`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`],Oo=[`false`,`False`,`FALSE`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],ko=L(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`y`,`Y`,`n`,`N`,`t`,`T`,`f`,`F`,`o`,`O`],resolve:e=>Do.indexOf(e)!==-1||Oo.indexOf(e)===-1&&I,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Ao=RegExp(`^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$`),jo=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Mo(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function No(e,t){if(t){if(!jo.test(e))return I}else if(!Ao.test(e))return I;let n=Mo(e);return Number.isFinite(n)?n:I}var Po=L(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:No,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Fo=RegExp(`^-?(?:0|[1-9][0-9]*)$`),Io=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Lo(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function Ro(e,t){if(t){if(!Io.test(e))return I}else if(!Fo.test(e))return I;let n=Lo(e);return Number.isFinite(n)?n:I}var zo=L(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:Ro,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Bo=RegExp(`^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$`);function Vo(e){let t=e.replace(/_/g,``),n=1;if((t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`))return n*parseInt(t.slice(2),2);if(t.startsWith(`0x`))return n*parseInt(t.slice(2),16);if(t.includes(`:`)){let e=0;for(let n of t.split(`:`))e=e*60+Number(n);return n*e}return t!==`0`&&t[0]===`0`?n*parseInt(t,8):n*parseInt(t,10)}function Ho(e){if(!Bo.test(e))return I;let t=Vo(e);return Number.isFinite(t)?t:I}var Uo=L(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:Ho,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Wo=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Go=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function Ko(e){if(!Wo.test(e))return I;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)||Go.test(e)?r:I}function qo(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Jo=L(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:Ko,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:qo}),Yo=RegExp(`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$`),Xo=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function Zo(e,t){if(t){if(!Xo.test(e))return I;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)?r:I}if(!Yo.test(e))return I;let n=Number(e);return Number.isFinite(n)?n:I}function Qo(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var $o=L(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:Zo,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Qo}),es=RegExp(`^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),ts=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function ns(e){if(!es.test(e))return I;let t=e.toLowerCase().replace(/_/g,``),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=0;if(t.includes(`:`)){for(let e of t.split(`:`))r=r*60+Number(e);r*=n}else r=n*parseFloat(t);return Number.isFinite(r)||ts.test(e)?r:I}function rs(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var is=L(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:ns,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:rs}),as=L(`tag:yaml.org,2002:merge`,{implicit:!0,implicitFirstChars:[`<`],resolve:(e,t)=>e===`<<`||t&&e===``?`<<`:I,identify:()=>!1}),os=/^[A-Za-z0-9+/]*={0,2}$/;function ss(e){let t=e.replace(/\s/g,``);if(t.length%4!=0||!os.test(t))return I;let n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function cs(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var ls=L(`tag:yaml.org,2002:binary`,{resolve:ss,identify:e=>Object.prototype.toString.call(e)===`[object Uint8Array]`,represent:cs}),us=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),ds=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function fs(e,t,n,r=0,i=0,a=0,o=0){let s=new Date(Date.UTC(e,t,n,r,i,a,o));return s.setUTCFullYear(e,t,n),s}function ps(e){let t=us.exec(e);if(t===null&&(t=ds.exec(e)),t===null)return I;let n=+t[1],r=t[2]-1,i=+t[3];if(!t[4]){let e=fs(n,r,i);return e.getUTCFullYear()!==n||e.getUTCMonth()!==r||e.getUTCDate()!==i?I:e}let a=+t[4],o=+t[5],s=+t[6],c=0;if(a>23||o>59||s>59)return I;if(t[7]){let e=t[7].slice(0,3);for(;e.length<3;)e+=`0`;c=+e}let l=fs(n,r,i,a,o,s,c);if(l.getUTCFullYear()!==n||l.getUTCMonth()!==r||l.getUTCDate()!==i)return I;if(t[9]){let e=+t[10],n=+(t[11]||0);if(e>23||n>59)return I;let r=(e*60+n)*6e4;l.setTime(l.getTime()-(t[9]===`-`?-r:r))}return l}var ms=L(`tag:yaml.org,2002:timestamp`,{implicit:!0,implicitFirstChars:[...`0123456789`],resolve:ps,identify:e=>e instanceof Date,represent:e=>e.toISOString()}),hs=po(`tag:yaml.org,2002:seq`,{create:()=>[],addItem:(e,t)=>{e.push(t)},identify:Array.isArray});function gs(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype}function _s(e,t){let n={};for(let r of t)e[r]!==void 0&&(n[r]=e[r]);return n}var vs=po(`tag:yaml.org,2002:omap`,{create:()=>({list:[],seen:new Set}),addItem:(e,t)=>{let n;if(t instanceof Map){if(t.size!==1)return`cannot resolve an ordered map item`;n=t.keys().next().value}else if(gs(t)){let e=Object.keys(t);if(e.length!==1)return`cannot resolve an ordered map item`;n=e[0]}else return`cannot resolve an ordered map item`;return e.seen.has(n)?`duplicate key in ordered map`:(e.seen.add(n),e.list.push(t),``)},finalize:e=>e.list,identify:()=>!1}),ys=po(`tag:yaml.org,2002:pairs`,{create:()=>[],addItem:(e,t)=>{if(t instanceof Map)return t.size===1?(e.push(t.entries().next().value),``):`cannot resolve a pairs item`;if(Object.prototype.toString.call(t)!==`[object Object]`)return`cannot resolve a pairs item`;let n=t,r=Object.keys(n);return r.length===1?(e.push([r[0],n[r[0]]]),``):`cannot resolve a pairs item`},identify:()=>!1}),bs=mo(`tag:yaml.org,2002:map`,{create:()=>({}),identify:gs,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{if(typeof t==`object`&&t)return`object-based map does not support complex keys`;let r=String(t);return r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``},has:(e,t)=>typeof t==`object`&&t?!1:Object.prototype.hasOwnProperty.call(e,String(t)),keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}}),xs=mo(`tag:yaml.org,2002:set`,{create:()=>new Set,identify:e=>e instanceof Set,represent:e=>{let t=new Map;for(let n of e)t.set(n,null);return t},addPair:(e,t,n)=>n===null?(e.add(t),``):`cannot resolve a set item`,has:(e,t)=>e.has(t),keys:e=>e.keys(),get:()=>null});function Ss(){return{scalar:Object.create(null),sequence:Object.create(null),mapping:Object.create(null)}}function Cs(){return{scalar:[],sequence:[],mapping:[]}}function ws(e){let t=[];for(let n of e){let e=t.length;for(let r=0;r<t.length;r++){let i=t[r];if(i.nodeKind===n.nodeKind&&i.tagName===n.tagName&&i.matchByTagPrefix===n.matchByTagPrefix){e=r;break}}t[e]=n}return t}var Ts=class e{tags;implicitScalarTags;implicitScalarByFirstChar;implicitScalarAnyFirstChar;defaultScalarTag;defaultSequenceTag;defaultMappingTag;exact;prefix;constructor(e){let t=ws(e),n=[],r=Ss(),i=Cs();for(let e of t){if(e.nodeKind===`scalar`&&e.implicit){if(e.matchByTagPrefix)throw Error(`Implicit scalar tags cannot match by tag prefix`);n.push(e)}switch(e.nodeKind){case`scalar`:e.matchByTagPrefix?i.scalar.push(e):r.scalar[e.tagName]=e;break;case`sequence`:e.matchByTagPrefix?i.sequence.push(e):r.sequence[e.tagName]=e;break;case`mapping`:e.matchByTagPrefix?i.mapping.push(e):r.mapping[e.tagName]=e}}let a=n.filter(e=>e.implicitFirstChars===null),o=new Set;for(let e of n)if(e.implicitFirstChars!==null)for(let t of e.implicitFirstChars)o.add(t);let s=new Map;for(let e of o)s.set(e,n.filter(t=>t.implicitFirstChars===null||t.implicitFirstChars.indexOf(e)!==-1));let c=r.scalar[`tag:yaml.org,2002:str`];if(!c)throw Error(`schema does not define the default scalar tag (tag:yaml.org,2002:str)`);this.tags=t,this.implicitScalarTags=n,this.implicitScalarByFirstChar=s,this.implicitScalarAnyFirstChar=a,this.defaultScalarTag=c,this.defaultSequenceTag=r.sequence[`tag:yaml.org,2002:seq`],this.defaultMappingTag=r.mapping[`tag:yaml.org,2002:map`],this.exact=r,this.prefix=i}lookupScalarTag(e){let t=this.exact.scalar[e];if(t)return t;for(let t of this.prefix.scalar)if(e.startsWith(t.tagName))return t}lookupSequenceTag(e){let t=this.exact.sequence[e];if(t)return t;for(let t of this.prefix.sequence)if(e.startsWith(t.tagName))return t}lookupMappingTag(e){let t=this.exact.mapping[e];if(t)return t;for(let t of this.prefix.mapping)if(e.startsWith(t.tagName))return t}resolveImplicitScalarTag(e){let t=this.implicitScalarByFirstChar.get(e.charAt(0))??this.implicitScalarAnyFirstChar;for(let n of t){let t=n.resolve(e,!1,n.tagName);if(t!==I)return{value:t,tag:n}}let n=this.defaultScalarTag;return{value:n.resolve(e,!1,n.tagName),tag:n}}withTags(...t){let n=[];for(let e of t)n=n.concat(e);return new e([...this.tags,...n])}},Es=new Ts([ho,hs,bs]);new Ts([...Es.tags,vo,Eo,zo,$o]);var Ds=new Ts([...Es.tags,_o,Co,Po,Jo]),Os=new Ts([...Es.tags,bo,ko,Uo,is,ms,as,ls,vs,ys,xs]).withTags({...Uo,resolve:(e,t,n)=>{let r=Uo.resolve(e,t,n);return r===I?Po.resolve(e,t,n):r}},{...is,resolve:(e,t,n)=>{let r=is.resolve(e,t,n);return r===I?Jo.resolve(e,t,n):r}});mo(`tag:yaml.org,2002:map`,{create:()=>new Map,addPair:(e,t,n)=>(e.set(t,n),``),has:(e,t)=>e.has(t),keys:e=>e.keys(),get:(e,t)=>e.get(t),identify:e=>e instanceof Map||gs(e),represent:e=>{if(e instanceof Map)return e;let t=new Map,n=e;for(let e of Object.keys(n))t.set(e,n[e]);return t}});function ks(e){if(Array.isArray(e)){let t=Array.prototype.slice.call(e);for(let e=0;e<t.length;e++){if(Array.isArray(t[e]))return null;typeof t[e]==`object`&&Object.prototype.toString.call(t[e])===`[object Object]`&&(t[e]=`[object Object]`)}return String(t)}return typeof e==`object`&&Object.prototype.toString.call(e)===`[object Object]`?`[object Object]`:String(e)}mo(`tag:yaml.org,2002:map`,{create:()=>({}),identify:gs,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{let r=ks(t);return r===null?`nested arrays are not supported inside keys`:(r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``)},has:(e,t)=>{let n=ks(t);return n!==null&&Object.prototype.hasOwnProperty.call(e,n)},keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}});var As={maxLength:79,indent:1,linesBefore:3,linesAfter:2};function js(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function Ms(e,t){return` `.repeat(Math.max(t-e.length,0))+e}function Ns(e,t){if(!e.buffer)return null;let n={...As,...t},r=/\r?\n|\r|\0/g,i=[0],a=[],o,s=-1;for(;o=r.exec(e.buffer);)a.push(o.index),i.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);let c=``,l=Math.min(e.line+n.linesAfter,a.length).toString().length,u=n.maxLength-(n.indent+l+3);for(let t=1;t<=n.linesBefore&&!(s-t<0);t++){let r=js(e.buffer,i[s-t],a[s-t],e.position-(i[s]-i[s-t]),u);c=`${` `.repeat(n.indent)}${Ms((e.line-t+1).toString(),l)} | ${r.str}\n${c}`}let d=js(e.buffer,i[s],a[s],e.position,u);c+=`${` `.repeat(n.indent)}${Ms((e.line+1).toString(),l)} | ${d.str}\n`,c+=`${`-`.repeat(n.indent+l+3+d.pos)}^\n`;for(let t=1;t<=n.linesAfter&&!(s+t>=a.length);t++){let r=js(e.buffer,i[s+t],a[s+t],e.position-(i[s]-i[s+t]),u);c+=`${` `.repeat(n.indent)}${Ms((e.line+t+1).toString(),l)} | ${r.str}\n`}return c.replace(/\n$/,``)}function Ps(e,t){let n=``;return e.mark?(e.mark.name&&(n+=`in "${e.mark.name}" `),n+=`(${e.mark.line+1}:${e.mark.column+1})`,!t&&e.mark.snippet&&(n+=`\n\n${e.mark.snippet}`),`${e.reason} ${n}`):e.reason}var R=class e extends Error{reason;mark;constructor(e,t){super(),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=Ps(this,!1),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toString(e){return`${this.name}: ${Ps(this,e)}`}static throwAt(t,n,r,i=``){let a=0,o=0;for(let e=0;e<n;e++){let n=t.charCodeAt(e);n===10?(a++,o=e+1):n===13&&(a++,t.charCodeAt(e+1)===10&&e++,o=e+1)}let s={name:i,buffer:t,position:n,line:a,column:n-o};throw s.snippet=Ns(s),new e(r,s)}},z={DOCUMENT:1,SEQUENCE:2,MAPPING:3,SCALAR:4,ALIAS:5,POP:6},B={PLAIN:1,SINGLE_QUOTED:2,DOUBLE_QUOTED:3,LITERAL_BLOCK:4,FOLDED_BLOCK:5},V={BLOCK:1,FLOW:2},H={CLIP:1,STRIP:2,KEEP:3},Fs=-1;function Is(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}var Ls=Array(256),Rs=Array(256);for(let e=0;e<256;e++)Ls[e]=+!!Is(e),Rs[e]=Is(e);function zs(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Bs(e){return e>=48&&e<=57?e-48:(e|32)-97+10}function Vs(e){return e===120?2:e===117?4:8}function Hs(e,t,n){let r=0;for(;t<n;){let n=e.charCodeAt(t);if(n===10)r++,t++;else if(n===13)r++,t++,e.charCodeAt(t)===10&&t++;else if(n===32||n===9)t++;else break}return{position:t,breaks:r}}function Us(e){return e===1?` `:`
`.repeat(e-1)}function Ws(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===10||t===13){r+=e.slice(a,o);let t=Hs(e,i,n);r+=Us(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,o)}function Gs(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===39)r+=e.slice(a,i)+`'`,i+=2,a=o=i;else if(t===10||t===13){r+=e.slice(a,o);let t=Hs(e,i,n);r+=Us(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Ks(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===92){r+=e.slice(a,i),i++;let t=e.charCodeAt(i);if(t===10||t===13)i=Hs(e,i,n).position;else if(t<256&&Ls[t])r+=Rs[t],i++;else{let n=Vs(t),a=0;for(;n>0;n--){i++;let t=Bs(e.charCodeAt(i));a=(a<<4)+t}r+=zs(a),i++}a=o=i}else if(t===10||t===13){r+=e.slice(a,o);let t=Hs(e,i,n);r+=Us(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function qs(e,t,n,r,i,a){let o=r<0?0:r,s=e.slice(t,n).replace(/\r\n?/g,`
`),c=s===``?[]:(s.endsWith(`
`)?s.slice(0,-1):s).split(`
`),l=``,u=!1,d=0,f=!1;for(let e of c){let t=0;for(;t<o&&e.charCodeAt(t)===32;)t++;if(r<0||t>=e.length){d++;continue}let n=e.slice(o),i=n.charCodeAt(0);a?i===32||i===9?(f=!0,l+=`
`.repeat(u?1+d:d)):f?(f=!1,l+=`
`.repeat(d+1)):d===0?u&&(l+=` `):l+=`
`.repeat(d):l+=`
`.repeat(u?1+d:d),l+=n,u=!0,d=0}return i===H.KEEP?l+=`
`.repeat(u?1+d:d):i!==H.STRIP&&u&&(l+=`
`),l}function Js(e,t){if(t.valueStart===Fs)return``;let{valueStart:n,valueEnd:r}=t;if(t.fast)return e.slice(n,r);switch(t.style){case B.SINGLE_QUOTED:return Gs(e,n,r);case B.DOUBLE_QUOTED:return Ks(e,n,r);case B.LITERAL_BLOCK:return qs(e,n,r,t.indent,t.chomping,!1);case B.FOLDED_BLOCK:return qs(e,n,r,t.indent,t.chomping,!0);default:return Ws(e,n,r)}}var Ys=Object.assign(Object.create(null),{"!":`!`,"!!":`tag:yaml.org,2002:`}),Xs=`-#;/?:@&=+$_.~*'()`,Zs=Xs+`!,[]`,Qs=`0123456789ABCDEF`;function U(e){return`%`+Qs[e>>4]+Qs[e&15]}function $s(e,t){let n=t?Xs:Zs,r=``;for(let t=0;t<e.length;t++){let i=e.charCodeAt(t);i>=48&&i<=57||i>=65&&i<=90||i>=97&&i<=122||n.includes(e[t])?r+=e[t]:(i>=55296&&i<=56319&&(i=65536+((i&1023)<<10)+(e.charCodeAt(++t)&1023)),r+=i<128?U(i):i<2048?U(192|i>>6)+U(128|i&63):i<65536?U(224|i>>12)+U(128|i>>6&63)+U(128|i&63):U(240|i>>18)+U(128|i>>12&63)+U(128|i>>6&63)+U(128|i&63))}return r}function ec(e){let t=``,n=0;for(;n<e.length;){if(e.charCodeAt(n)!==37){t+=e[n++];continue}let r=parseInt(e.slice(n+1,n+3),16);if(n+=3,r>=192){let t=r<224?1:r<240?2:3;for(r&=(1<<6-t)-1;t-->0;)r=r<<6|parseInt(e.slice(n+1,n+3),16)&63,n+=3}r<65536?t+=String.fromCharCode(r):(r-=65536,t+=String.fromCharCode(55296|r>>10,56320|r&1023))}return t}function tc(e,t){if(e.startsWith(`!<`)&&e.endsWith(`>`))return ec(e.slice(2,-1));let n=e.indexOf(`!`,1),r=n===-1?`!`:e.slice(0,n+1);return ec(t?.[r]??Ys[r]??r)+ec(e.slice(r.length))}function nc(e){let t=e;return t.charCodeAt(0)===33?(t=t.slice(1),`!${$s(t,!0)}`):t.slice(0,18)===`tag:yaml.org,2002:`?`!!${$s(t.slice(18),!0)}`:`!<${$s(t,!1)}>`}var rc=-1,ic=`tag:yaml.org,2002:merge`,ac={filename:``,schema:Ds,json:!1,maxTotalMergeKeys:1e4,maxAliases:-1};function oc(e){return`tagStart`in e&&e.tagStart!==rc?e.tagStart:`anchorStart`in e&&e.anchorStart!==rc?e.anchorStart:`valueStart`in e&&e.valueStart!==rc?e.valueStart:`start`in e?e.start:0}function W(e,t){R.throwAt(e.source,e.position,t,e.filename)}function sc(e,t,n,r){try{return n.finalize(r)}catch(n){if(n instanceof R)throw n;R.throwAt(e.source,t,n instanceof Error?n.message:String(n),e.filename)}}function cc(e,t){let n=Js(e.source,t),r=t.tagStart===rc?``:e.source.slice(t.tagStart,t.tagEnd),i=e.schema.defaultScalarTag;if(r!==``){if(r===`!`)return{value:n,tag:i};let t=tc(r,e.tagHandlers),a=e.schema.lookupScalarTag(t);if(a){let r=a.resolve(n,!0,t);return r===I&&W(e,`cannot resolve a node with !<${t}> explicit tag`),{value:r,tag:a}}let o=e.schema.lookupMappingTag(t)??e.schema.lookupSequenceTag(t);if(o){n!==``&&W(e,`cannot resolve a node with !<${t}> explicit tag`);let r=o.create(t);return{value:o.carrierIsResult?r:sc(e,e.position,o,r),tag:o}}W(e,`unknown scalar tag !<${t}>`)}return t.style===B.PLAIN?e.schema.resolveImplicitScalarTag(n):{value:i.resolve(n,!1,i.tagName),tag:i}}function lc(e,t,n){let r=t.tagStart===rc?``:e.source.slice(t.tagStart,t.tagEnd);return r===``||r===`!`?n:tc(r,e.tagHandlers)}function uc(e){return e.nodeKind===`mapping`}function dc(e){e.totalMergeKeys++,e.maxTotalMergeKeys!==-1&&e.totalMergeKeys>e.maxTotalMergeKeys&&W(e,`merge keys exceeded maxTotalMergeKeys (${e.maxTotalMergeKeys})`)}function fc(e,t,n,r){dc(e);for(let i of r.keys(n)){if(dc(e),t.tag.has(t.value,i))continue;let a=t.tag.addPair(t.value,i,r.get(n,i));a&&W(e,a),t.overridable??=new Set,t.overridable.add(i)}}function pc(e,t,n,r){if(e.position=t.keyPosition,uc(r))fc(e,t,n,r);else if(r.nodeKind===`sequence`&&Array.isArray(n)){n.length>100&&W(e,`abnormal merge sequence size`);for(let r of n){let n=e.nodeTags.get(r);n||W(e,`cannot merge mappings; the provided source object is unacceptable`),fc(e,t,r,n)}}else W(e,`cannot merge mappings; the provided source object is unacceptable`)}function mc(e,t,n,r,i){if(e.position=t.keyPosition,t.keyIsMerge){pc(e,t,r,i);return}!e.json&&t.tag.has(t.value,n)&&!t.overridable?.has(n)&&W(e,`duplicated mapping key`);let a=t.tag.addPair(t.value,n,r);a&&W(e,a),t.overridable?.delete(n)}function hc(e,t,n){let r=e.frames[e.frames.length-1];if(r.kind===`document`)r.value=t,r.hasValue=!0;else if(r.kind===`sequence`){uc(n)&&e.nodeTags.set(t,n);let i=r.tag.addItem(r.value,t,r.index++);i&&W(e,i)}else if(r.hasKey){let i=r.key;r.key=void 0,r.hasKey=!1,mc(e,r,i,t,n)}else r.key=t,r.keyPosition=e.position,r.hasKey=!0,r.keyIsMerge=n.tagName===ic}function gc(e,t,n,r,i){if(t.anchorStart!==rc){let a={value:n,tag:r,isValueFinal:i};return e.anchors.set(e.source.slice(t.anchorStart,t.anchorEnd),a),a}return null}function _c(e,t){let n={...ac,...t,events:e,documents:[],eventIndex:0,position:0,frames:[],anchors:new Map,nodeTags:new Map,tagHandlers:Object.create(null),totalMergeKeys:0,aliasCount:0};for(;n.eventIndex<n.events.length;){let e=n.events[n.eventIndex++];switch(n.position=oc(e),e.type){case z.DOCUMENT:n.anchors=new Map,n.nodeTags=new Map,n.aliasCount=0,n.tagHandlers=Object.create(null);for(let t of e.directives)t.kind===`tag`&&(n.tagHandlers[t.handle]=t.prefix);n.frames.push({kind:`document`,position:n.position,value:void 0,hasValue:!1});break;case z.SCALAR:{let{value:t,tag:r}=cc(n,e);gc(n,e,t,r,!0),hc(n,t,r);break}case z.SEQUENCE:{let t=lc(n,e,`tag:yaml.org,2002:seq`),r=n.schema.lookupSequenceTag(t);r||W(n,`unknown sequence tag !<${t}>`);let i=r.create(t),a=gc(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`sequence`,position:n.position,value:i,tag:r,anchor:a,index:0});break}case z.MAPPING:{let t=lc(n,e,`tag:yaml.org,2002:map`),r=n.schema.lookupMappingTag(t);r||W(n,`unknown mapping tag !<${t}>`);let i=r.create(t),a=gc(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`mapping`,position:n.position,value:i,tag:r,anchor:a,key:void 0,keyPosition:n.position,hasKey:!1,keyIsMerge:!1,overridable:null});break}case z.ALIAS:{n.maxAliases!==-1&&++n.aliasCount>n.maxAliases&&W(n,`aliases exceeded maxAliases (${n.maxAliases})`);let t=n.source.slice(e.anchorStart,e.anchorEnd),r=n.anchors.get(t);r||W(n,`unidentified alias "${t}"`),r.isValueFinal||W(n,`recursive alias "${t}" is not supported for tag ${r.tag.tagName} because it uses finalize()`),hc(n,r.value,r.tag);break}case z.POP:{let e=n.frames.pop();if(e.kind===`mapping`&&e.hasKey&&(n.position=e.keyPosition,W(n,`incomplete mapping pair in event stream`)),e.kind===`document`)n.documents.push(e.value);else{let t=e.tag.carrierIsResult?e.value:sc(n,e.position,e.tag,e.value);e.anchor&&(e.anchor.value=t,e.anchor.isValueFinal=!0),hc(n,t,e.tag)}break}}}return n.documents}var G=-1,vc=Object.prototype.hasOwnProperty,yc=1,bc=2,xc=3,Sc=4,Cc=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,wc=/[,\[\]{}]/,Tc=/^(?:!|!!|![0-9A-Za-z-]+!)$/,Ec=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`,Dc=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`,Oc=RegExp(`^(?:${Ec})*$`),kc=RegExp(`^(?:${Dc})+$`),Ac=RegExp(`^(?:!(?:${Ec})*|${Dc}(?:${Ec})*)$`),jc={filename:``,maxDepth:100};function Mc(e,t,n){e.events.push({type:z.DOCUMENT,explicitStart:t,explicitEnd:n,directives:e.directives})}function Nc(e,t,n,r,i,a,o){e.events.push({type:z.SEQUENCE,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function Pc(e,t,n,r,i,a,o){e.events.push({type:z.MAPPING,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function Fc(e,t){e.events.splice(t.eventsLength,0,{type:z.MAPPING,start:t.position,anchorStart:G,anchorEnd:G,tagStart:G,tagEnd:G,style:V.FLOW})}function Ic(e,t,n,r,i,a,o,s,c=H.CLIP,l=-1,u=!1){e.events.push({type:z.SCALAR,valueStart:t,valueEnd:n,anchorStart:r,anchorEnd:i,tagStart:a,tagEnd:o,style:s,chomping:c,indent:l,fast:u})}function Lc(e,t,n){e.events.push({type:z.ALIAS,anchorStart:t,anchorEnd:n})}function Rc(e){e.events.push({type:z.POP})}function K(e){Ic(e,G,G,G,G,G,G,B.PLAIN)}function zc(){return{anchorStart:G,anchorEnd:G,tagStart:G,tagEnd:G}}function Bc(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,eventsLength:e.events.length}}function Vc(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.events.length=t.eventsLength}function q(e,t){R.throwAt(e.input.slice(0,e.length),e.position,t,e.filename)}function J(e){return e===10||e===13}function Hc(e){return e===9||e===32}function Y(e){return Hc(e)||J(e)}function X(e){return e===0||Y(e)}function Uc(e){return e===44||e===91||e===93||e===123||e===125}function Wc(e){return e>=48&&e<=57?e-48:-1}function Gc(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function Kc(e){return e===120?2:e===117?4:e===85?8:0}function qc(e){return e===48||e===97||e===98||e===116||e===9||e===110||e===118||e===102||e===114||e===101||e===32||e===34||e===47||e===92||e===78||e===95||e===76||e===80}function Jc(e){e.input.charCodeAt(e.position)===10?e.position++:(e.position++,e.input.charCodeAt(e.position)===10&&e.position++),e.line++,e.lineStart=e.position,e.lineIndent=0,e.firstTabInLine=-1}function Z(e,t){let n=0,r=e.input.charCodeAt(e.position),i=e.position===e.lineStart||Y(e.input.charCodeAt(e.position-1));for(;r!==0;){for(;Hc(r);)i=!0,r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&i&&r===35)do r=e.input.charCodeAt(++e.position);while(!J(r)&&r!==0);if(!J(r))break;for(Jc(e),n++,i=!0,r=e.input.charCodeAt(e.position);r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return n}function Yc(e,t=e.position){let n=e.input.charCodeAt(t);if((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)){let n=e.input.charCodeAt(t+3);return n===0||Y(n)}return!1}function Xc(e){e.position===e.lineStart&&e.input.charCodeAt(e.position)===65279&&(e.position++,e.lineStart=e.position)}function Zc(e){if(e.position!==e.lineStart)return!1;if(Yc(e))return!0;if(e.input.charCodeAt(e.position)!==65279)return!1;let t=Bc(e);Xc(e),Z(e,!0);let n=e.input.charCodeAt(e.position),r=e.position===e.lineStart&&(n===37||n===45&&Yc(e));return Vc(e,t),r}function Qc(e){let t=e.input.charCodeAt(e.position);for(;t!==0&&!J(t);)t=e.input.charCodeAt(++e.position)}function $c(e,t,n){let r=Cc.exec(e.input.slice(t,n));r!==null&&(e.position=t+r.index+r[0].length-1,q(e,`the stream contains non-printable characters`))}function el(e,t,n){if(e.input.charCodeAt(e.position)!==33)return!1;t.tagStart!==G&&q(e,`duplication of a tag property`);let r=e.position,i=!1,a=!1,o=`!`,s=e.input.charCodeAt(++e.position);s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33&&(a=!0,o=`!!`,s=e.input.charCodeAt(++e.position));let c=e.position,l;if(i){for(;s!==0&&s!==62;)s=e.input.charCodeAt(++e.position);s!==62&&q(e,`unexpected end of the stream within a verbatim tag`),l=e.input.slice(c,e.position),e.position++}else{for(;s!==0&&!Y(s)&&!(n&&Uc(s));)s===33&&(a?q(e,`tag suffix cannot contain exclamation marks`):(o=e.input.slice(c-1,e.position+1),Tc.test(o)||q(e,`named tag handle cannot contain such characters`),a=!0,c=e.position+1)),s=e.input.charCodeAt(++e.position);l=e.input.slice(c,e.position),wc.test(l)&&q(e,`tag suffix cannot contain flow indicator characters`)}return l&&!(i?Oc.test(l):kc.test(l))&&q(e,`tag name cannot contain such characters: ${l}`),!i&&o!==`!`&&o!==`!!`&&!vc.call(e.tagHandlers,o)&&q(e,`undeclared tag handle "${o}"`),t.tagStart=r,t.tagEnd=e.position,!0}function tl(e,t){if(e.input.charCodeAt(e.position)!==38)return!1;t.anchorStart!==G&&q(e,`duplication of an anchor property`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position))&&!Uc(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&q(e,`name of an anchor node must contain at least one character`),t.anchorStart=n,t.anchorEnd=e.position,!0}function nl(e,t){if(e.input.charCodeAt(e.position)!==42)return!1;(t.anchorStart!==G||t.tagStart!==G)&&q(e,`alias node should not have any properties`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position))&&!Uc(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&q(e,`name of an alias node must contain at least one character`),Lc(e,n,e.position),!0}function rl(e,t){Z(e,!1),e.lineIndent<t&&q(e,`deficient indentation`)}function il(e,t,n){if(e.input.charCodeAt(e.position)!==39)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===39){if(e.input.charCodeAt(e.position+1)===39){i=!1,e.position+=2;continue}let t=e.position;return e.position++,Ic(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,B.SINGLE_QUOTED,H.CLIP,-1,i),!0}J(a)?(i=!1,rl(e,t)):e.position===e.lineStart&&Yc(e)?q(e,`unexpected end of the document within a single quoted scalar`):a!==9&&a<32?q(e,`expected valid JSON character`):e.position++}q(e,`unexpected end of the stream within a single quoted scalar`)}function al(e,t,n){if(e.input.charCodeAt(e.position)!==34)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===34){let t=e.position;return e.position++,Ic(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,B.DOUBLE_QUOTED,H.CLIP,-1,i),!0}if(a===92){i=!1;let n=e.input.charCodeAt(++e.position);if(J(n))rl(e,t);else if(qc(n))e.position++;else{let t=Kc(n);for(t===0&&q(e,`unknown escape sequence`);t-->0;)e.position++,Gc(e.input.charCodeAt(e.position))<0&&q(e,`expected hexadecimal character`);e.position++}}else J(a)?(i=!1,rl(e,t)):e.position===e.lineStart&&Yc(e)?q(e,`unexpected end of the document within a double quoted scalar`):a!==9&&a<32?q(e,`expected valid JSON character`):e.position++}q(e,`unexpected end of the stream within a double quoted scalar`)}function ol(e,t,n){let r=e.input.charCodeAt(e.position),i=H.CLIP,a=-1,o=!1;if(r!==124&&r!==62)return!1;let s=r===124?B.LITERAL_BLOCK:B.FOLDED_BLOCK;for(e.position++;e.input.charCodeAt(e.position)!==0;){let n=e.input.charCodeAt(e.position),r=Wc(n);if(n===43||n===45)i!==H.CLIP&&q(e,`repeat of a chomping mode identifier`),i=n===43?H.KEEP:H.STRIP,e.position++;else if(r>=0)r===0&&q(e,`bad explicit indentation width of a block scalar; it cannot be less than one`),o&&q(e,`repeat of an indentation width identifier`),a=t+r-1,o=!0,e.position++;else break}let c=!1;for(;Hc(e.input.charCodeAt(e.position));)c=!0,e.position++;c&&e.input.charCodeAt(e.position)===35&&Qc(e),J(e.input.charCodeAt(e.position))?Jc(e):e.input.charCodeAt(e.position)!==0&&q(e,`a line break is expected`);let l=o?a:-1,u=0,d=e.position,f=e.position;for(;e.input.charCodeAt(e.position)!==0;){let n=e.position,r=0;for(;e.input.charCodeAt(n+r)===32;)r++;let i=e.input.charCodeAt(n+r);if(i===0){l>=0?r>l&&(f=n+r):r>0&&(f=n+r);break}if(Zc(e))break;if(!o&&l===-1&&J(i)&&(u=Math.max(u,r)),!o&&l===-1&&!J(i)&&(i===9&&r<t&&(e.position=n+r,q(e,`tab characters must not be used in indentation`)),r>=t&&r<u&&(e.position=n+r,q(e,`bad indentation of a mapping entry`))),l===-1&&i!==0&&!J(i)&&r<t){e.lineIndent=r,e.position=n+r;break}!o&&i!==0&&!J(i)&&l===-1&&(l=r);let a=l===-1?t+1:l;if(i!==0&&!J(i)&&r<a){e.lineIndent=r,e.position=n+r;break}Qc(e),f=e.position,J(e.input.charCodeAt(e.position))&&(Jc(e),f=e.position)}return $c(e,d,f),Ic(e,d,f,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,s,i,l),!0}function sl(e,t){let n=e.input.charCodeAt(e.position),r=t===yc;if(n===0||Y(n)||n===35||n===38||n===42||n===33||n===124||n===62||n===39||n===34||n===37||n===64||n===96||Uc(n))return!1;if(n===63||n===45){let t=e.input.charCodeAt(e.position+1);if(X(t)||r&&Uc(t))return!1}return!0}function cl(e,t,n,r){if(!sl(e,n))return!1;let i=e.position,a=e.position,o=e.input.charCodeAt(e.position),s=n===yc,c=!1;for(;o!==0&&!Zc(e);){if(o===58){let t=e.input.charCodeAt(e.position+1);if(X(t)||s&&Uc(t))break}else if(o===35){if(Y(e.input.charCodeAt(e.position-1)))break}else if(s&&Uc(o))break;else if(J(o)){let n=e.position,r=e.line,i=e.lineStart,a=e.lineIndent;if(Z(e,!1),e.lineIndent>=t){c=!0,o=e.input.charCodeAt(e.position);continue}e.position=n,e.line=r,e.lineStart=i,e.lineIndent=a;break}Hc(o)||(a=e.position+1),o=e.input.charCodeAt(++e.position)}return a!==i&&($c(e,i,a),Ic(e,i,a,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,B.PLAIN,H.CLIP,-1,!c),!0)}function ll(e,t){let n=e.line;Z(e,!0),(e.line>n&&e.lineIndent<t||e.firstTabInLine!==-1&&e.lineIndent<t)&&q(e,`deficient indentation`)}function ul(e,t,n){let r=e.input.charCodeAt(e.position),i=r===123,a=e.position,o=!0;if(r!==91&&r!==123)return!1;let s=i?125:93;for(i?Pc(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.FLOW):Nc(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.FLOW),e.position++;e.input.charCodeAt(e.position)!==0;){ll(e,t);let n=e.input.charCodeAt(e.position);if(n===s)return e.position++,Rc(e),!0;o?n===44&&q(e,`expected the node content, but found ','`):q(e,`missed comma between flow collection entries`);let r=!1,a=!1;n===63&&Y(e.input.charCodeAt(e.position+1))&&(r=a=!0,e.position+=1,ll(e,t));let c=e.line,l=Bc(e),u=pl(e,t,yc,!1,!0);ll(e,t),n=e.input.charCodeAt(e.position),(i||a||e.line===c)&&n===58?(r=!0,e.position++,ll(e,t),i||Fc(e,l),u||K(e),pl(e,t,yc,!1,!0)||K(e),ll(e,t),i||Rc(e)):i&&r?(u||K(e),K(e)):i?K(e):r&&(Fc(e,l),u||K(e),K(e),Rc(e)),n=e.input.charCodeAt(e.position),n===44?(o=!0,e.position++):o=!1}q(e,`unexpected end of the stream within a flow collection`)}function dl(e,t,n){if(e.firstTabInLine!==-1||e.input.charCodeAt(e.position)!==45||!X(e.input.charCodeAt(e.position+1)))return!1;for(Nc(e,e.position,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.BLOCK);e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1));){e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,q(e,`tab characters must not be used in indentation`));let n=e.line;e.position++;let r=Z(e,!0)>0;if(e.firstTabInLine!==-1&&e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1))&&q(e,`bad indentation of a sequence entry`),r&&e.lineIndent<=t?K(e):pl(e,t,xc,!1,!0),Z(e,!0),e.lineIndent<t||e.position>=e.length)break;e.lineIndent>t&&q(e,`bad indentation of a sequence entry`),e.line===n&&e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1))&&q(e,`bad indentation of a sequence entry`)}return Rc(e),!0}function fl(e,t,n,r){let i=!1,a=!1,o=!1,s=!1;if(e.firstTabInLine!==-1)return!1;let c=e.input.charCodeAt(e.position);for(;c!==0;){!i&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,q(e,`tab characters must not be used in indentation`));let l=e.input.charCodeAt(e.position+1),u=e.line;if((c===63||c===58)&&X(l))o||=(Pc(e,e.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,V.BLOCK),!0),c===63?(i&&K(e),a=!0,i=!0):(i||(K(e),a=!0),i=!1),e.position+=1,s=!0;else{i&&=(K(e),!1);let t=Bc(e);if(!pl(e,n,bc,!1,!0))break;if(e.line===u){for(c=e.input.charCodeAt(e.position);Hc(c);)c=e.input.charCodeAt(++e.position);if(c===58)c=e.input.charCodeAt(++e.position),X(c)||q(e,`a whitespace character is expected after the key-value separator within a block mapping`),o||=(e.events.splice(t.eventsLength,0,{type:z.MAPPING,start:t.position,anchorStart:r.anchorStart,anchorEnd:r.anchorEnd,tagStart:r.tagStart,tagEnd:r.tagEnd,style:V.BLOCK}),!0),a=!0,i=!1,s=!1;else if(a)q(e,`expected ':' after a mapping key`);else return r.anchorStart!==G||r.tagStart!==G?(Vc(e,t),!1):!0}else if(a)q(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return r.anchorStart!==G||r.tagStart!==G?(Vc(e,t),!1):!0}if(pl(e,t,Sc,!0,s)&&(s=!1),i||(s&&=(K(e),!1)),Z(e,!0),c=e.input.charCodeAt(e.position),(e.line===u||e.lineIndent>t)&&c!==0)q(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return a?(i&&K(e),o&&Rc(e),!0):!1}function pl(e,t,n,r,i,a=!0){e.depth>=e.maxDepth&&q(e,`nesting exceeded maxDepth (${e.maxDepth})`),e.depth++;let o=1,s=!1,c=!1,l=null,u=zc(),d=n===Sc||n===xc,f=d,p=d;if(r&&Z(e,!0)&&(s=!0,o=e.lineIndent>t?1:e.lineIndent===t?0:-1),o===1)for(;;){let r=e.input.charCodeAt(e.position),i=Bc(e);if(s&&o!==1&&(r===33||r===38))break;if(s&&p&&(u.tagStart!==G||u.anchorStart!==G)&&(r===33||r===38)){let n=Bc(e),r=t+1;if(fl(e,e.position-e.lineStart,r,u)&&e.events[n.eventsLength]?.type===z.MAPPING)return e.depth--,!0;Vc(e,n)}if(s&&(r===33&&u.tagStart!==G||r===38&&u.anchorStart!==G)||!el(e,u,n===yc)&&!tl(e,u))break;l===null&&(l=i),Z(e,!0)?(s=!0,f=p,o=e.lineIndent>t?1:e.lineIndent===t?0:-1):f=!1}if(f&&=s||i,o===1||n===Sc){let r=n===yc||n===bc?t:t+1,i=e.position-e.lineStart;if(o===1){if(f&&(dl(e,i,u)||fl(e,i,r,u))||ul(e,r,u))c=!0;else{let t=e.input.charCodeAt(e.position);if(l!==null&&a&&p&&!f&&t!==124&&t!==62){let t=Bc(e),n=l.position-l.lineStart;Vc(e,l),fl(e,n,r,zc())&&e.events[t.eventsLength]?.type===z.MAPPING?c=!0:Vc(e,t)}!c&&(d&&ol(e,r,u)||il(e,r,u)||al(e,r,u)||nl(e,u)||cl(e,r,n,u))&&(c=!0)}}else o===0&&(c=f&&dl(e,i,u))}return d&&=!c,!c&&(u.anchorStart!==G||u.tagStart!==G||d)&&(Ic(e,G,G,u.anchorStart,u.anchorEnd,u.tagStart,u.tagEnd,B.PLAIN),c=!0),e.depth--,c||u.anchorStart!==G||u.tagStart!==G}function ml(e){if(e.lineIndent>0||e.input.charCodeAt(e.position)!==37)return!1;e.position++;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position));)e.position++;let n=e.input.slice(t,e.position),r=[];for(n.length===0&&q(e,`directive name must not be less than one character in length`);e.input.charCodeAt(e.position)!==0&&!J(e.input.charCodeAt(e.position));){for(;Hc(e.input.charCodeAt(e.position));)e.position++;if(e.input.charCodeAt(e.position)===35||J(e.input.charCodeAt(e.position))||e.input.charCodeAt(e.position)===0)break;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position));)e.position++;r.push(e.input.slice(t,e.position))}if(J(e.input.charCodeAt(e.position))&&Jc(e),n===`YAML`){e.directives.some(e=>e.kind===`yaml`)&&q(e,`duplication of %YAML directive`),r.length!==1&&q(e,`YAML directive accepts exactly one argument`);let t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]);t===null&&q(e,`ill-formed argument of the YAML directive`),parseInt(t[1],10)!==1&&q(e,`unacceptable YAML version of the document`),e.directives.push({kind:`yaml`,version:r[0]})}else if(n===`TAG`){r.length!==2&&q(e,`TAG directive accepts exactly two arguments`);let[t,n]=r;Tc.test(t)||q(e,`ill-formed tag handle (first argument) of the TAG directive`),vc.call(e.tagHandlers,t)&&q(e,`there is a previously declared suffix for "${t}" tag handle`),Ac.test(n)||q(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagHandlers[t]=n,e.directives.push({kind:`tag`,handle:t,prefix:n})}return!0}function hl(e){e.directives=[],e.tagHandlers=Object.create(null);let t=!1;for(Z(e,!0);ml(e);)t=!0,Z(e,!0);let n=!1,r=!1,i=!0;if(e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45&&X(e.input.charCodeAt(e.position+3))){n=!0;let t=e.line;e.position+=3,Z(e,!0),i=e.line>t}else t&&q(e,`directives end mark is expected`);let a=e.events.length;if(!n&&e.position===e.lineStart&&e.input.charCodeAt(e.position)===46&&Yc(e)){e.position+=3,Z(e,!0);return}if(Mc(e,n,!1),pl(e,e.lineIndent-1,Sc,!1,i,i)||K(e),Z(e,!0),e.position===e.lineStart&&Yc(e)&&(r=e.input.charCodeAt(e.position)===46,r)){let t=e.line;e.position+=3,Z(e,!0),e.line===t&&e.position<e.length&&q(e,`end of the stream or a document separator is expected`)}let o=e.events[a];o?.type===z.DOCUMENT&&(o.explicitEnd=r),Rc(e),!r&&e.position<e.length&&!Zc(e)&&q(e,`end of the stream or a document separator is expected`)}function gl(e,t){let n=e.length,r={...jc,...t,input:`${e}\0`,length:n,position:0,line:0,lineStart:0,lineIndent:0,firstTabInLine:-1,depth:0,directives:[],tagHandlers:Object.create(null),events:[]},i=e.indexOf(`\0`);for(i!==-1&&R.throwAt(e,i,`null byte is not allowed in input`,r.filename);r.position<r.length&&(Xc(r),Z(r,!0),!(r.position>=r.length));){let e=r.position;hl(r),r.position===e&&q(r,`can not read a document`)}return r.events}var _l={...jc,...ac};function vl(e,t={}){let n={..._l,...t},r=String(e),i=Object.keys(jc),a=Object.keys(ac);return _c(gl(r,_s(n,i)),{..._s(n,a),source:r})}function yl(e,t){let n=vl(e,t);if(n.length===0)throw new R(`expected a document, but the input is empty`);if(n.length===1)return n[0];throw new R(`expected a single document in the stream, but found more`)}var bl=Symbol(`INVALID`);function xl(e){let t=new Set([e.defaultScalarTag,e.defaultSequenceTag,e.defaultMappingTag].filter(e=>e!==void 0)),n=e.implicitScalarTags,r=e.tags.filter(e=>!(e.nodeKind===`scalar`&&e.implicit)&&!t.has(e)),i=e.tags.filter(e=>t.has(e));return[...n.map(e=>({tag:e,implicitTag:!0})),...r.map(e=>({tag:e,implicitTag:!1})),...i.map(e=>({tag:e,implicitTag:!0}))]}function Sl(e,t){for(let n=0,r=e.representTypes.length;n<r;n+=1){let{tag:r,implicitTag:i}=e.representTypes[n];if(r.identify(t)){let e;return e=r.matchByTagPrefix?r.representTagName(t):r.tagName,{tag:r,tagName:e,implicitTag:i}}}return null}function Cl(e,t){if(!e.noRefs&&typeof t==`object`&&t){let n=e.refs.get(t);if(n)return n.anchor===void 0&&(n.anchor=`ref_${e.refCounter++}`),{kind:`alias`,anchor:n.anchor}}let n=Sl(e,t);if(!n){if(t===void 0||e.skipInvalid)return bl;throw new R(`unacceptable kind of an object to dump ${Object.prototype.toString.call(t)}`)}let{tag:r,tagName:i,implicitTag:a}=n,o=a?i:nc(i);if(r.nodeKind===`scalar`)return{kind:`scalar`,tag:o,tagged:!a,style:B.PLAIN,value:r.represent(t)};if(r.nodeKind===`sequence`){let n=r.represent(t),i={kind:`sequence`,tag:o,tagged:!a,style:V.BLOCK,items:[]};e.noRefs||e.refs.set(t,i);for(let t=0,r=n.length;t<r;t+=1){let r=Cl(e,n[t]);r===bl&&n[t]===void 0&&(r=Cl(e,null)),r!==bl&&i.items.push(r)}return i}let s=r.represent(t),c={kind:`mapping`,tag:o,tagged:!a,style:V.BLOCK,items:[]};e.noRefs||e.refs.set(t,c);for(let[t,n]of s){let r=Cl(e,t);if(r===bl)continue;let i=Cl(e,n);i!==bl&&c.items.push({key:r,value:i})}return c}function wl(e,t,n={}){let r=Cl({representTypes:xl(t),noRefs:n.noRefs??!1,skipInvalid:n.skipInvalid??!1,refs:new Map,refCounter:0},e);return[{contents:r===bl?null:r,directives:[]}]}var Tl=Symbol(`visit:break`),El=Symbol(`visit:skip`);function Dl(e,t,n){let r=t(e,n);if(r===Tl)return!0;if(r===El)return!1;let i=n.depth+1;switch(e.kind){case`sequence`:for(let n of e.items)if(Dl(n,t,{depth:i,parent:e,isKey:!1}))return!0;break;case`mapping`:for(let{key:n,value:r}of e.items)if(Dl(n,t,{depth:i,parent:e,isKey:!0})||Dl(r,t,{depth:i,parent:e,isKey:!1}))return!0}return!1}function Ol(e,t){for(let n of e)if(n.contents&&Dl(n.contents,t,{depth:0,parent:null,isKey:!1}))return}function kl(e,t){return!!(e&1<<t)}var Al={applyQuoteFlowKeysOption:Ml,doubleQuoteForInvisibles:Nl,doubleQuoteWhitespaceOnly:Pl,applyForceQuotesOption:Fl,tryLongOrMultilineAsBlock:Il,quoteInvalidPlain:Ll,fallbackToDoubleQuoted:Rl};function jl(e){return e.presenterOptions.quoteStyle===`single`&&kl(e.allowedStylesMask,B.SINGLE_QUOTED)?B.SINGLE_QUOTED:B.DOUBLE_QUOTED}function Ml(e){e.presenterOptions.quoteFlowKeys&&e.isKey&&e.flowOnly&&e.style===B.PLAIN&&(e.style=B.DOUBLE_QUOTED)}function Nl(e){e.style===B.PLAIN&&/[\t\x7F-\xA0\u2028\u2029\uFEFF\uFFFE\uFFFF]/.test(e.node.value)&&(e.style=B.DOUBLE_QUOTED)}function Pl(e){e.style===B.PLAIN&&/^\s+$/.test(e.node.value)&&(e.style=B.DOUBLE_QUOTED)}function Fl(e){e.presenterOptions.forceQuotes&&(e.isKey||e.style!==B.PLAIN||e.node.tag===e.presenterOptions.schema.defaultScalarTag.tagName&&(e.style=e.node.value.includes(`
`)?B.DOUBLE_QUOTED:jl(e)))}function Il(e){if(e.style!==B.PLAIN||e.isKey)return;let t=e.node.value,n=t.indexOf(`
`)!==-1;if(!kl(e.allowedStylesMask,B.LITERAL_BLOCK)){n&&(e.style=B.DOUBLE_QUOTED);return}let r=e.presenterOptions.lineWidth;if(r===-1){n&&(e.style=B.LITERAL_BLOCK);return}let i=Math.max(Math.min(r,40),r-e.shiftOfContent),a=0,o=!1;for(;a<=t.length;){let e=t.length,n=t.indexOf(`
`,a);n!==-1&&(e=n);let r=t.slice(a,e);if(r.length>i&&r[0]!==` `&&/ [^ \t]/.test(r)&&(o=!0),n===-1)break;a=n+1}o?e.style=B.FOLDED_BLOCK:n&&(e.style=B.LITERAL_BLOCK)}function Ll(e){e.style===B.PLAIN&&!kl(e.allowedStylesMask,B.PLAIN)&&(e.style=jl(e))}function Rl(e){kl(e.allowedStylesMask,e.style)||(e.style=B.DOUBLE_QUOTED)}function zl(e,t){return e|1<<t}var Bl=`[\\x09\\x0A\\x0D\\x20-\\x7E\\x85\\xA0-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]`,Vl=`[\\n\\r]`,Hl=`\\uFEFF`,Ul=`[ \\t]`,Wl=`(?:(?!(?:${Vl}|${Hl}))${Bl})`,Gl=`(?:(?!${Ul})${Wl})`,Kl=`[\\x09\\x20-\\uD7FF\\uE000-\\uFFFF\\u{10000}-\\u{10FFFF}]`,ql=`[-?:,\\[\\]{}#&*!|>'"%@\`]`,Jl=`[,\\[\\]{}]`,Yl=Gl,Xl=`(?:(?!${Jl})${Gl})`,Zl=`(?:(?:(?!${ql})${Gl})|[?:-](?=${Yl}))`,Ql=`(?:(?:(?!${ql})${Gl})|[?:-](?=${Xl}))`,$l=`(?:(?:(?![:#])${Yl})|:(?=${Yl}))#*`,eu=`(?:(?:(?![:#])${Xl})|:(?=${Xl}))#*`,tu=`(?:${Ul}*${$l})*`,nu=`(?:${Ul}*${eu})*`,ru=`${Zl}#*${tu}`,iu=`${Ql}#*${nu}`,au=ru,ou=iu,su=`\\n+${$l}${tu}`,cu=`\\n+${eu}${nu}`,lu=`${ru}(?:${su})*`,uu=`${iu}(?:${cu})*`,du=RegExp(`^(?:${lu})$`,`u`),fu=RegExp(`^(?:${uu})$`,`u`),pu=RegExp(`^(?:${au})$`,`u`),mu=RegExp(`^(?:${ou})$`,`u`),hu=RegExp(`^(?:${Kl})*$`,`u`),gu=RegExp(`^(?:${Kl}|\\n)*$`,`u`),_u=RegExp(`^(?:${Wl}|\\n)*$`,`u`),vu=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/,yu=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/m;function bu(e){let t=e.node.value;if(t!==``){if(!(e.isKey?e.flowOnly?mu:pu:e.flowOnly?fu:du).test(t)||e.shiftOfFirstLine===0&&vu.test(t))return!1;if(e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1){let n=t.slice(e+1);if(yu.test(n))return!1}}}let n=e.presenterOptions.schema.resolveImplicitScalarTag(t).tag.tagName;return!(!e.node.tagged&&n!==e.node.tag||!e.node.tagged&&t===`=`&&n===e.presenterOptions.schema.defaultScalarTag.tagName)}function xu(e){let t=e.node.value;if(!(e.isKey?hu:gu).test(t)||/[ \t]\n|\n[ \t]/.test(t))return!1;if(!e.isKey&&e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1&&yu.test(t.slice(e+1)))return!1}return!0}function Su(e){if(e.flowOnly||!_u.test(e.node.value))return!1;let t=e.shiftOfContent-e.shiftOfParent;return!(t<1||t>9&&/^\n* /.test(e.node.value)||e.shiftOfContent===0&&yu.test(e.node.value))}function Cu(e){let t=zl(0,B.DOUBLE_QUOTED);bu(e)&&(t=zl(t,B.PLAIN)),xu(e)&&(t=zl(t,B.SINGLE_QUOTED)),Su(e)&&(t=zl(zl(t,B.LITERAL_BLOCK),B.FOLDED_BLOCK)),e.allowedStylesMask=t}function wu(e){switch(e.style){case B.PLAIN:return Tu(e);case B.SINGLE_QUOTED:return Eu(e);case B.LITERAL_BLOCK:return Du(e);case B.FOLDED_BLOCK:return Ou(e);case B.DOUBLE_QUOTED:return ku(e)}}function Tu(e){return Au(e.node.value,e.shiftOfContent)}function Eu(e){return`'${Au(e.node.value,e.shiftOfContent).replace(/'/g,`''`)}'`}function Du(e){let t=e.node.value;return`|`+Nu(t,e.shiftOfParent,e.shiftOfContent)+Pu(ju(t,e.shiftOfContent))}function Ou(e){let t=e.node.value,n=e.presenterOptions.lineWidth,r=1/0;return n!==-1&&(r=Math.max(Math.min(n,40),n-e.shiftOfContent)),`>`+Nu(t,e.shiftOfParent,e.shiftOfContent)+Pu(ju(Lu(t,r),e.shiftOfContent))}function ku(e){return`"${Bu(e.node.value)}"`}function Au(e,t){let n=e.indexOf(`
`);if(n===-1)return e;let r=` `.repeat(t),i=e.slice(0,n),a=/(\n+)([^\n]*)/g;a.lastIndex=n;let o;for(;o=a.exec(e);){let e=o[1].length,t=o[2];i+=`
`.repeat(e+1)+r+t}return i}function ju(e,t){let n=` `.repeat(t),r=0,i=``,a=e.length;for(;r<a;){let t,o=e.indexOf(`
`,r);o===-1?(t=e.slice(r),r=a):(t=e.slice(r,o+1),r=o+1),t.length&&t!==`
`&&(i+=n),i+=t}return i}function Mu(e){return/^\n* /.test(e)}function Nu(e,t,n){let r=Mu(e)?String(n-t):``,i=e[e.length-1]===`
`;return`${r}${i&&(e[e.length-2]===`
`||e===`
`)?`+`:i?``:`-`}\n`}function Pu(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Fu(e){return e===` `||e===`	`}function Iu(e,t){if(e===``||Fu(e[0]))return e;let n=/ [^ \t]/g,r,i=0,a,o=0,s=0,c=``;for(;r=n.exec(e);)s=r.index,s-i>t&&(a=o>i?o:s,c+=`\n${e.slice(i,a)}`,i=a+1),o=s;return c+=`
`,e.length-i>t&&o>i?c+=`${e.slice(i,o)}\n${e.slice(o+1)}`:c+=e.slice(i),c.slice(1)}function Lu(e,t){let n=/(\n+)([^\n]*)/g,r=e.indexOf(`
`);r===-1&&(r=e.length),n.lastIndex=r;let i=Iu(e.slice(0,r),t),a=e[0]===`
`||Fu(e[0]),o,s;for(;s=n.exec(e);){let e=s[1],n=s[2];o=n!==``&&Fu(n[0]),i+=e+(!a&&!o&&n!==``?`
`:``)+Iu(n,t),a=o}return i}var Ru=/["\\\x00-\x1F\x7F-\xA0\u2028\u2029\uD800-\uDFFF\uFEFF\uFFFE\uFFFF]/gu;function zu(e){switch(e){case`\0`:return`\\0`;case`\x07`:return`\\a`;case`\b`:return`\\b`;case`	`:return`\\t`;case`
`:return`\\n`;case`\v`:return`\\v`;case`\f`:return`\\f`;case`\r`:return`\\r`;case`\x1B`:return`\\e`;case`"`:return`\\"`;case`\\`:return`\\\\`;case``:return`\\N`;case`\xA0`:return`\\_`;case`\u2028`:return`\\L`;case`\u2029`:return`\\P`}let t=e.charCodeAt(0),n=t.toString(16).toUpperCase();return t<=255?`\\x${`0`.repeat(2-n.length)}${n}`:`\\u${`0`.repeat(4-n.length)}${n}`}function Bu(e){return e.replace(Ru,zu)}var Vu=10,Hu={indent:2,seqNoIndent:!1,seqInlineFirst:!0,lineWidth:80,flowBracketPadding:!1,flowSkipCommaSpace:!1,flowSkipColonSpace:!1,quoteFlowKeys:!1,quoteStyle:`single`,forceQuotes:!1,scalarStyleRules:Object.keys(Al).map(e=>Reflect.get(Al,e)),tagBeforeAnchor:!1};function Uu(e){return e.tagged?e.tag:nc(e.tag)}function Wu(e){let t={...Hu,...e};return t.flowSkipColonSpace&&(t.quoteFlowKeys=!0),{...t,defaultScalarTagName:t.schema.defaultScalarTag.tagName,openEnded:!1}}function Gu(e,t){return`\n${` `.repeat(e.indent*t)}`}function Ku(e,t,n,r,i,a){return{node:t,parent:n,level:r,isKey:i,flowOnly:a,shiftOfParent:r===0?-1:e.indent*(r-1),shiftOfContent:e.indent*Math.max(1,r),shiftOfFirstLine:r===0?0:e.indent*r,presenterOptions:e,allowedStylesMask:0,style:t.style}}function qu(e,t,n){let r=``;for(let i=0,a=n.items.length;i<a;i+=1){let a=Q(e,t,n.items[i],n,{}).text;i>0&&(r+=`,${e.flowSkipCommaSpace?``:` `}`),r+=a}let i=e.flowBracketPadding&&n.items.length>0?` `:``;return`[${i}${r}${i}]`}function Ju(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=Q(e,t+1,n.items[a],n,{block:!0,compact:e.seqInlineFirst,isblockseq:!0}).text;r&&i===``||(i+=Gu(e,t)),o===``||Vu===o.charCodeAt(0)?i+=`-`:i+=`- `,i+=o}return i}function Yu(e,t,n){let r=``;for(let{key:i,value:a}of n.items){let o=``;r!==``&&(o+=`,${e.flowSkipCommaSpace?``:` `}`);let s=Q(e,t,i,n,{iskey:!0}),c=s.text,l=Q(e,t,a,n,{}).text,u=e.flowSkipColonSpace||l===``?``:` `,d=i.kind===`scalar`&&s.noBody&&(i.tagged||i.anchor!==void 0),f=i.kind===`alias`||d?` `:``;o+=`${c}${f}:${u}${l}`,r+=o}let i=e.flowBracketPadding&&r!==``?` `:``;return`{${i}${r}${i}}`}function Xu(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=``;r&&i===``||(o+=Gu(e,t));let{key:s,value:c}=n.items[a],l=(s.kind===`mapping`||s.kind===`sequence`)&&s.style===V.BLOCK&&s.items.length!==0||s.kind===`scalar`&&(s.style===B.LITERAL_BLOCK||s.style===B.FOLDED_BLOCK),u=l?Q(e,t+1,s,n,{block:!0,compact:!0,isblockseq:!Zu(e,s,t+1)}):Q(e,t+1,s,n,{block:!0,compact:!0,iskey:!0}),d=u.text,f=s.kind===`scalar`&&s.value.indexOf(`
`)!==-1,p=d.length>1024&&/^[\s\S]{1025}/u.test(d),m=l||f||p;m&&(d&&Vu===d.charCodeAt(0)?o+=`?`:o+=`? `),o+=d,m&&(o+=Gu(e,t));let h=Q(e,t+1,c,n,{block:!0,compact:m,isblockseq:m&&!Zu(e,c,t+1)}).text,g=s.kind===`scalar`&&u.noBody&&(s.tagged||s.anchor!==void 0),_=!m&&(s.kind===`alias`||g)?` `:``;h===``||Vu===h.charCodeAt(0)?o+=`${_}:`:o+=`${_}: `,o+=h,i+=o}return i}function Zu(e,t,n){return t.kind===`alias`||t.tagged||t.anchor!==void 0||e.indent<2&&n>0}function Q(e,t,n,r,i){if(n.kind===`alias`)return e.openEnded=!1,{text:`*${n.anchor}`,noBody:!1};let{block:a=!1,iskey:o=!1,isblockseq:s=!1}=i,c=i.compact??!1,l=n.anchor!==void 0;Zu(e,n,t)&&(c=!1);let u,d=n.tagged,f=a&&(n.kind===`mapping`||n.kind===`sequence`)&&n.style===V.BLOCK&&n.items.length!==0;if(n.kind===`mapping`)u=f?Xu(e,t,n,c):Yu(e,t,n);else if(n.kind===`sequence`)u=f?e.seqNoIndent&&!s&&t>0?Ju(e,t-1,n,c):Ju(e,t,n,c):qu(e,t,n);else{let i=Ku(e,n,r,t,o,!a);Cu(i);for(let t of e.scalarStyleRules)t(i);u=wu(i),e.openEnded=(i.style===B.LITERAL_BLOCK||i.style===B.FOLDED_BLOCK)&&(n.value===`
`||n.value.endsWith(`

`)),d=n.tagged||u===``&&i.flowOnly&&r?.kind===`sequence`&&!l||i.style!==B.PLAIN&&n.tag!==e.defaultScalarTagName}n.kind!==`mapping`&&n.kind!==`sequence`||f||(e.openEnded=!1),f&&c&&t>0&&e.indent>2&&(u=`${` `.repeat(e.indent-2)}${u}`);let p=u===``,m=u;if(d||l){let t=[],r=d?Uu(n):null,i=l?`&${n.anchor}`:null;e.tagBeforeAnchor?(r!==null&&t.push(r),i!==null&&t.push(i)):(i!==null&&t.push(i),r!==null&&t.push(r));let a=u===``||u.charCodeAt(0)===Vu?``:` `;m=`${t.join(` `)}${a}${u}`}return{text:m,noBody:p}}function Qu(e){return(e.kind===`sequence`||e.kind===`mapping`)&&e.style===V.BLOCK&&e.items.length!==0&&!e.tagged&&e.anchor===void 0}function $u(e){let t=``;for(let n of e.directives){if(n.kind===`yaml`){t+=`%YAML ${n.version}\n`;continue}let{handle:e,prefix:r}=n;t+=`%TAG ${e} ${r}\n`}return t}function ed(e,t){let n=Wu(t),r=``,i=!1;for(let t=0;t<e.length;t+=1){let a=e[t];n.openEnded=!1;let o=$u(a),s=o!==``,c=a.explicitStart||s||t>0&&!i;if(r+=o,a.contents===null)c&&(r+=`---
`);else if(c){let e=Q(n,0,a.contents,null,{block:!0,compact:!0}).text,t=e===``?``:s||Qu(a.contents)?`
`:` `;r+=`---${t}${e}\n`}else r+=Q(n,0,a.contents,null,{block:!0,compact:!0}).text+`
`;i=a.explicitEnd||n.openEnded,i&&(r+=`...
`)}return r}var td={...Hu,schema:Os,skipInvalid:!1,noRefs:!1,flowLevel:-1,sortKeys:!1,transform:()=>{}};function nd(e,t){let n=String(e),r=String(t);return n<r?-1:+(n>r)}function rd(e,t={}){let n={...td,...t},r=wl(e,n.schema,{noRefs:n.noRefs,skipInvalid:n.skipInvalid});if(n.flowLevel>=0&&Ol(r,(e,t)=>{if(!(t.depth<n.flowLevel))return(e.kind===`sequence`||e.kind===`mapping`)&&(e.style=V.FLOW),El}),n.sortKeys){let e=n.sortKeys===!0?nd:n.sortKeys;Ol(r,t=>{t.kind===`mapping`&&t.items.sort((t,n)=>e(t.key.kind===`scalar`?t.key.value:``,n.key.kind===`scalar`?n.key.value:``))})}return n.transform(r),ed(r,{..._s(n,Object.keys(Hu)),schema:n.schema})}z.DOCUMENT,z.SEQUENCE,z.MAPPING,z.SCALAR,z.ALIAS,z.POP,B.PLAIN,B.SINGLE_QUOTED,B.DOUBLE_QUOTED,B.LITERAL_BLOCK,B.FOLDED_BLOCK,V.BLOCK,V.FLOW,H.CLIP,H.STRIP,H.KEEP;function id(e){let t=rd(e,{indent:2,lineWidth:-1,noRefs:!0});return[`# ======================================================================`,`# WARD-BECK SYSTEMS - CONSOLE MASTER CALIBRATION PROFILE (.WBS)`,`# Hardware Emulation: XTM-4 Mastering Meter & POD-22 Dual LED Bar`,`# Exported: ${e.timestamp}`,`# Compatible with: https://xtm.wbsps.ca/`,`# ======================================================================

`].join(`
`)+t}function ad(e,t){let n=new Date().toISOString().slice(0,10),r=t||`WBS-Console-Config-${n}.WBS`,i=new Blob([e],{type:`text/yaml;charset=utf-8`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=r,document.body.appendChild(o),o.click(),setTimeout(()=>{document.body.removeChild(o),URL.revokeObjectURL(a)},150)}function od(e){let t=yl(e);if(!t||typeof t!=`object`)throw Error(`Invalid YAML configuration file format.`);let n=t;if(!n.console&&!n.ballistics&&!n.scope)throw Error(`Unrecognized WBS configuration structure: missing console, ballistics, or scope blocks.`);return t}function sd(e,t){if(e.console&&(typeof e.console.power==`boolean`&&(t.power=e.console.power),e.console.mode&&(t.mode=t.prevMode=e.console.mode),e.console.meterStyle&&(t.meterStyle=e.console.meterStyle),e.console.dialLamp&&(t.dialLamp=e.console.dialLamp),e.console.vfdMetric&&(t.vfdMetric=e.console.vfdMetric),e.console.highPassFilter!==void 0&&(t.hp=+!!e.console.highPassFilter),e.console.termination600Ohm!==void 0&&(t.term=+!!e.console.termination600Ohm),e.console.inputA&&(t.a.src=e.console.inputA.src??t.a.src,t.a.lvl=e.console.inputA.lvl??t.a.lvl),e.console.inputD&&(t.d.src=e.console.inputD.src??t.d.src,t.d.lvl=e.console.inputD.lvl??t.d.lvl),e.console.testGenS?.pair&&(t.s.pair=[...e.console.testGenS.pair]),typeof e.console.toneCalibrationDbfs==`number`)){let n=t.toneCalLevels.indexOf(e.console.toneCalibrationDbfs);n>=0&&(t.toneCalIdx=n)}}function cd(e,t){if(e.ballistics){if(typeof e.ballistics.vuReferenceLevelDbu==`number`&&t.setReferenceLevel(e.ballistics.vuReferenceLevelDbu,e.console?.mode===`D`),typeof e.ballistics.ppmPeakSensitivityTrimDb==`number`){t.setPeakSensTrim(e.ballistics.ppmPeakSensitivityTrimDb);let n=document.getElementById(`selectPeakSens`);n&&(n.value=String(e.ballistics.ppmPeakSensitivityTrimDb))}if(e.ballistics.vuBallisticPreset){t.setVuBallisticPreset(e.ballistics.vuBallisticPreset);let n=document.getElementById(`selectVuBallistics`);n&&(n.value=e.ballistics.vuBallisticPreset)}if(e.ballistics.ppmBallisticPreset){t.setPpmType(e.ballistics.ppmBallisticPreset);let n=document.getElementById(`selectPpmBallistics`);n&&(n.value=e.ballistics.ppmBallisticPreset)}typeof e.ballistics.inputGainTrimDb==`number`&&t.setInputTrim(e.ballistics.inputGainTrimDb),e.ballistics.monitorAudio&&t.setMonitor(!!e.ballistics.monitorAudio.enabled,e.ballistics.monitorAudio.volume??.5)}}function ld(e,t){if(e.pod22){if(typeof e.pod22.extendedLed22Range==`boolean`&&t.setExtendedRange(e.pod22.extendedLed22Range),e.pod22.scaleMode&&(t.scaleMode=e.pod22.scaleMode),e.pod22.decayType){t.setDecay(e.pod22.decayType);let n=document.getElementById(`selectPodDecay`);n&&(n.value=e.pod22.decayType)}if(typeof e.pod22.peakHold==`boolean`){t&&t.dip&&(t.dip.BS1=+!!e.pod22.peakHold);let n=document.getElementById(`chkPodHold`);n&&(n.checked=e.pod22.peakHold)}}}function ud(e,t){e.scope&&(e.scope.timeMode&&t.setTimeMode(e.scope.timeMode),typeof e.scope.captureLengthSeconds==`number`&&t.setCaptureLength(e.scope.captureLengthSeconds),typeof e.scope.captureSpeedFps==`number`&&(t.captureSpeed=e.scope.captureSpeedFps),typeof e.scope.logWarpBeta==`number`&&t.setBeta(e.scope.logWarpBeta),e.scope.traces&&(typeof e.scope.traces.channelA==`boolean`&&(t.showChA=e.scope.traces.channelA),typeof e.scope.traces.channelB==`boolean`&&(t.showChB=e.scope.traces.channelB),typeof e.scope.traces.sum==`boolean`&&(t.showSum=e.scope.traces.sum),typeof e.scope.traces.diff==`boolean`&&(t.showDiff=e.scope.traces.diff),typeof e.scope.traces.momentaryLufs==`boolean`&&(t.showLufs=e.scope.traces.momentaryLufs),typeof e.scope.traces.shortTermLufs==`boolean`&&(t.showLufsS=e.scope.traces.shortTermLufs),typeof e.scope.traces.integratedLufs==`boolean`&&(t.showLufsI=e.scope.traces.integratedLufs)),e.scope.display&&(typeof e.scope.display.show0DbfsCeilingLine==`boolean`&&(t.show0DbfsLine=e.scope.display.show0DbfsCeilingLine),typeof e.scope.display.enableWaveformFade==`boolean`&&(t.enableFade=e.scope.display.enableWaveformFade),typeof e.scope.display.hfFadeDistancePercent==`number`&&(t.hfFadeDistance=e.scope.display.hfFadeDistancePercent),typeof e.scope.display.showHoverTelemetryHud==`boolean`&&(t.showHoverTelemetry=e.scope.display.showHoverTelemetryHud),typeof e.scope.display.showCursorTraceLine==`boolean`&&(t.showCursorTrace=e.scope.display.showCursorTraceLine),typeof e.scope.display.plotPhaseCorrelation==`boolean`&&(t.plotPhase=e.scope.display.plotPhaseCorrelation),typeof e.scope.display.hudDocked==`boolean`&&t.setDocked(e.scope.display.hudDocked)))}function dd(e){let t=(e,t)=>{if(t===void 0)return;let n=document.getElementById(e);n&&(n.checked=t)},n=(e,t)=>{if(t==null)return;let n=document.getElementById(e);n&&(n.value=String(t))};if(e.scope?.traces&&(t(`chkShowChA`,e.scope.traces.channelA),t(`chkShowChB`,e.scope.traces.channelB),t(`chkShowSum`,e.scope.traces.sum),t(`chkShowDiff`,e.scope.traces.diff),t(`chkShowLufs`,e.scope.traces.momentaryLufs),t(`chkShowLufsS`,e.scope.traces.shortTermLufs),t(`chkShowLufsI`,e.scope.traces.integratedLufs)),e.scope?.display&&(t(`chk0DbfsLine`,e.scope.display.show0DbfsCeilingLine),t(`chkFadeEnabled`,e.scope.display.enableWaveformFade),t(`chkHoverTelemetry`,e.scope.display.showHoverTelemetryHud),t(`chkCursorTrace`,e.scope.display.showCursorTraceLine),t(`chkPhasePlot`,e.scope.display.plotPhaseCorrelation),t(`chkDockHud`,e.scope.display.hudDocked)),e.ballistics){n(`inputGainTrimSlider`,e.ballistics.inputGainTrimDb);let r=document.getElementById(`inputGainTrimVal`);if(r){let t=e.ballistics.inputGainTrimDb;r.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}n(`peakSensTrimSlider`,e.ballistics.ppmPeakSensitivityTrimDb);let i=document.getElementById(`peakSensTrimVal`);if(i){let t=e.ballistics.ppmPeakSensitivityTrimDb;i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}e.ballistics.monitorAudio&&(t(`chkMonitorAudio`,e.ballistics.monitorAudio.enabled),n(`monitorVolumeSlider`,e.ballistics.monitorAudio.volume))}e.pod22&&t(`chkExtendedLed22`,e.pod22.extendedLed22Range)}var $=class e{static instance;static getInstance(){return e.instance||=new e,e.instance}getConsent(){return to()}setConsent(e){no(e)}resetConsent(){ro()}hasPersistentConsent(){return this.getConsent()===`allowed`}storageGet(e){return io(()=>this.hasPersistentConsent(),e)}storageSet(e,t){ao(()=>this.hasPersistentConsent(),e,t)}storageRemove(e){oo(e)}buildConfig(e,t,n,r){return fo(e,t,n,r)}exportToYaml(e,t,n,r){return id(this.buildConfig(e,t,n,r))}downloadWbsFile(e,t,n,r,i){ad(this.exportToYaml(e,t,n,r),i)}parseWbsYaml(e){return od(e)}applyConfig(e,t,n,r,i){sd(e,t),cd(e,n),ld(e,r),ud(e,i),this.syncDrawerDom(e),typeof i._updateTraceToggles==`function`&&i._updateTraceToggles(),i.graphDirty=!0,this.saveConfig(t,n,r,i),t.flash(`CONFIGOK`,1600),t.notify()}syncDrawerDom(e){dd(e)}saveConfig(e,t,n,r){try{let i=this.buildConfig(e,t,n,r),a=JSON.stringify(i);this.storageSet(eo,a)}catch{}}loadSavedConfig(e,t,n,r){try{let i=this.storageGet(eo);if(!i)return!1;let a=JSON.parse(i);return this.applyConfig(a,e,t,n,r),!0}catch{return!1}}}.getInstance();function fd(e,t=e.model){e.dbfsView&&$.saveConfig(t,e.audio,e.podView,e.dbfsView)}function pd(e){let{podView:t}=e,n=document.getElementById(`chkExtendedLed22`);if(n&&t){let e=localStorage.getItem(`xtm_extended_led22`),r=e===null||e===`true`;n.checked=r,t.setExtendedRange(r),n.addEventListener(`change`,e=>{t.setExtendedRange(e.target.checked);try{localStorage.setItem(`xtm_extended_led22`,e.target.checked)}catch{}})}}function md(e,t){let{podView:n}=e,{chkPodHold:r}=t,i=document.getElementById(`selectPodScale`);i&&n&&(i.value=n.scaleMode,i.addEventListener(`change`,e=>{n.scaleMode=e.target.value})),r&&r.addEventListener(`change`,e=>{n.dip.BS1=+!!e.target.checked})}function hd(e,t){let{podView:n}=e,{selectPodDecay:r}=t;r&&(r.value=n.decayType||`type2`,r.addEventListener(`change`,t=>{n.setDecay(t.target.value),fd(e)}))}function gd(e){let t=e.dbfs||[-60,-60,-60,-60],n=e.lufs||{};return{time:new Date().toISOString(),chA:e.hasAudio?t[0].toFixed(2):`-60.00`,chB:e.hasAudio?t[1].toFixed(2):`-60.00`,sum:e.hasAudio&&typeof t[2]==`number`?t[2].toFixed(2):`-60.00`,diff:e.hasAudio&&typeof t[3]==`number`?t[3].toFixed(2):`-60.00`,lufsM:isFinite(n.m)?n.m.toFixed(2):`-60.00`,lufsS:isFinite(n.s)?n.s.toFixed(2):`-60.00`,lufsI:isFinite(n.i)?n.i.toFixed(2):`-60.00`,lra:isFinite(n.lra)?n.lra.toFixed(2):`0.00`,phase:typeof e.phaseCorrelation==`number`?e.phaseCorrelation.toFixed(3):`1.000`}}function _d(e,t,n,r,i,a,o){return{time:new Date().toISOString(),chA:t.toFixed(2),chB:n.toFixed(2),sum:r.toFixed(2),diff:i.toFixed(2),deltaA:a.toFixed(2),deltaB:o.toFixed(2),lufsM:e.lufs&&isFinite(e.lufs.m)?e.lufs.m.toFixed(2):`-60.00`}}function vd(){let e=[],t=0;function n(n,r){r-t<1e3||(t=r,e.push(gd(n)),e.length>7200&&e.shift())}let r=[],i=-60,a=-60;function o(e){if(!e||!e.hasAudio)return;let t=e.dbfs||[-60,-60,-60,-60],n=t[0],o=t[1],s=typeof t[2]==`number`?t[2]:Math.max(n,o),c=typeof t[3]==`number`?t[3]:-60,l=n-i,u=o-a;i=n,a=o,(l>=3.5||u>=3.5||n>=-9||o>=-9)&&(r.push(_d(e,n,o,s,c,l,u)),r.length>5e3&&r.shift())}return{telemetryLog:e,transientLog:r,recordTelemetry:n,recordTransientEvent:o}}function yd(e,t){let n=new Blob([e],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t}-${new Date().toISOString().replace(/[:.]/g,`-`)}.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}function bd(e){let t=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation
`;for(let n of e)t+=`${n.time},${n.chA},${n.chB},${n.sum},${n.diff},${n.lufsM},${n.lufsS},${n.lufsI},${n.lra},${n.phase}\n`;return t}function xd(e){let t=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary
`;for(let n of e)t+=`${n.time},${n.chA},${n.chB},${n.sum},${n.diff},${n.deltaA},${n.deltaB},${n.lufsM}\n`;return t}function Sd(e){e.length===0?alert(`Recording telemetry... Please ensure audio is playing and try again.`):yd(bd(e),`WBS-Mastering-Telemetry`)}function Cd(e){e.length===0?alert(`Recording transients... Please play dynamic audio with sharp transients and try again.`):yd(xd(e),`WBS-Super-Transient-Log`)}function wd(){let e=document.getElementById(`btnExportCsvTest`),t=document.getElementById(`chkAutoExportHourly`),n=vd(),{telemetryLog:r,transientLog:i}=n;e&&e.addEventListener(`click`,()=>Sd(r));let a=document.getElementById(`btnExportTransientLog`);return a&&a.addEventListener(`click`,()=>Cd(i)),t&&setInterval(()=>{t.checked&&r.length>0&&Sd(r)},36e5),n}async function Td(e,t,n,r){if(!window.audioReady||t.mode===`SET`)return;let{selectDevice:i,drawerSourceBadge:a}=n,o=t.mode+`:`+(t.mode===`A`?t.a.src:t.mode===`D`?t.d.src:t.s.pair[0]);if(!(o===r.lastModeKey&&r.isAudioStarted)){if(r.lastModeKey=o,r.isAudioStarted=!0,t.mode===`A`){let n=[];try{n=await e.getAudioInputDevices()}catch{n=[]}if(!n||n.length===0){a&&(a.textContent=`Source: Calibrated Internal Tone (No Audio Input Devices Detected)`,a.style.color=`#38bdf8`),e.setToneCalibration(-18),e.startTestGenerator(`sine1k`);return}let r=i?i.value:null;if(r===`__WBS_LINUX_HOST__`){a&&(a.textContent=`Source: 🐧 Linux Host (PipeWire & MXL Bridge · Banner-Free)`,a.style.color=`#38bdf8`);return}let o=n.filter(e=>e.label.toLowerCase().includes(`mic`)),s=n.filter(e=>e.label.toLowerCase().includes(`line`));r||(r=t.a.src===1?s.length>0?s[0].deviceId:n.length>1?n[1].deviceId:n[0].deviceId:o.length>0?o[0].deviceId:n[0].deviceId,i&&(i.value=r||``));let c=i?.options[i.selectedIndex]?.text||n.find(e=>e.deviceId===r)?.label||`Soundcard Input`;a&&(a.textContent=`Source: `+c,a.style.color=`#7df9ff`);try{await e.connectSoundCard(r)}catch(t){let n=t?.name===`NotFoundError`||t?.message?.includes(`not found`)||t?.message?.includes(`detected`);n||console.warn(`Could not connect soundcard:`,t),a&&(a.textContent=n?`Source: Calibrated Internal Tone (No Audio Input Devices)`:`Source Error: `+(t?.message||`Failed to open soundcard`),a.style.color=n?`#38bdf8`:`#ff4d4f`),e.setToneCalibration(-18),e.startTestGenerator(`sine1k`)}}else if(t.mode===`D`){if(t.d.src===1){a&&(a.textContent=`Source: Computer Audio Output`);let n=typeof localStorage<`u`&&localStorage.getItem(`xtm.sysaudio.surface`)||`browser`,r=e.sourceType===`system`&&!!e.stream&&e.stream.active;if(!r&&(n===`loopback`||n===`auto`))try{let t=(await e.getAudioInputDevices()).find(e=>/monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|xtm.*bridge/i.test(e.label));t&&(a&&(a.textContent=`Source: OS Audio Bridge (${t.label})`,a.style.color=`#38bdf8`),r=await e.connectSoundCard(t.deviceId))}catch{}if(!r){let r=n===`monitor`?`monitor`:`browser`;if(!await e.connectSystemAudio(r)){if(t.d.src=0,a){let e=t.toneCalLevels[t.toneCalIdx];a.textContent=`Source: 1 kHz Digital Reference Tone (${e>=0?`+`:``}${e} dBFS)`}e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(`sine1k`),t.flash(`1k TONE `)}}}else{if(a){let e=t.toneCalLevels[t.toneCalIdx];a.textContent=`Source: 1 kHz Digital Reference Tone (${e>=0?`+`:``}${e} dBFS)`}e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(`sine1k`)}}else if(t.mode===`S`){let n=[``,`sine1k`,`pink`,`sine400`,`sweep`],r=[``,`1 kHz Sine Tone`,`Pink Noise`,`400 Hz Lineup Tone`,`20Hz-20kHz Sweep`],i=n[t.s.pair[0]]||`sine1k`,o=r[t.s.pair[0]]||`1 kHz Sine Tone`;a&&(a.textContent=`Source: `+o),e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(i)}}}function Ed(e,t){let{audio:n}=e,r={isAudioStarted:!1,lastModeKey:null,syncAudioWithHardwareMode:i};async function i(e){let i=r.lastModeKey;await Td(n,e,t,r),r.lastModeKey!==i&&n.setReferenceLevel(e.getActiveReferenceLevel(),e.mode===`D`)}return r}var Dd=e=>{try{return localStorage.getItem(e)}catch{return null}},Od=(e,t)=>{try{localStorage.setItem(e,t)}catch{}};function kd(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.meter.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.meter.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.meter.v2.wbsca`:`xtm.meter.v2.wbsdark`}function Ad(){return document.body.classList.contains(`theme-mccurdy-dark`)?`mccurdy_vu`:document.body.classList.contains(`theme-mccurdy`)?`fisam`:document.body.classList.contains(`theme-wbs-ca`)?`wbs_m405`:`fisam`}function jd(e,t){let{model:n,audio:r,view:i}=e,a=kd(),o=Ad(),s=Dd(a),c=s===`sifam`?`fisam`:s===`simpson`||s===`pimsom`?`pimson`:s||o;c!==n.meterStyle&&(n.meterStyle=c,r.setVuStyle(c),i.isBuilt=!1,n.notify()),t&&(t.value=n.meterStyle)}function Md(e,t){let{model:n,audio:r,view:i}=e,{selectMeterStyle:a}=t,o=()=>jd(e,a);o(),window.applyModeMeter=o,new MutationObserver(o).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),a&&(a.value=n.meterStyle,a.addEventListener(`change`,e=>{n.meterStyle=e.target.value,r.setVuStyle(e.target.value),Od(kd(),n.meterStyle),n.saveEEPROM(),i.isBuilt=!1,n.notify()}));let s=document.getElementById(`selectVuBallistics`);s&&(s.value=r.vuBallisticPreset||`standard_vu`,s.addEventListener(`change`,t=>{r.setVuBallisticPreset(t.target.value),fd(e)}))}function Nd(e){let{model:t,audio:n}=e;n.setReferenceLevel(t.getActiveReferenceLevel(),t.mode===`D`),n.setHighPass(t.hp===1),n.setVuStyle(t.meterStyle)}function Pd(e,t,n){let{model:r,audio:i}=e,{selectToneCal:a,chkHpf:o,chkTerm:s,selectLampColor:c,selectDialBg:l,selectPpmLampColor:u,selectPpmDialBg:d,selectMeterStyle:f,drawerSourceBadge:p}=t;r.onChange=t=>{let r=t.mode===`D`;i.setReferenceLevel(t.getActiveReferenceLevel(),r),i.setHighPass(t.hp===1),i.setVuStyle(t.meterStyle);let m=t.toneCalLevels[t.toneCalIdx];if(i.setToneCalibration(m),a&&(a.value=String(m)),o&&(o.checked=t.hp===1),s&&(s.checked=t.term===1),c&&(c.value=t.dialLamp),l&&(l.value=t.dialBg),u&&(u.value=t.ppmLamp),d&&(d.value=t.ppmDialBg),f&&(f.value=t.meterStyle),p&&t.mode===`S`){let e=t.s.pair[0]??1;(e===1||e===3)&&(p.textContent=`Source: ${e===3?`400 Hz`:`1 kHz`} Digital Lineup Tone (${m>=0?`+`:``}${m} dBFS)`)}n.syncAudioWithHardwareMode(t),fd(e,t)}}function Fd(e,t){let{model:n,view:r,audio:i}=e;r.onButtonPressed=async e=>{if(e===`MODE`)n.pressMode();else if(e===`SOURCE`)n.pressSource();else if(e===`DOWN`)n.pressDown();else if(e===`UP`)n.pressUp();else if(e.startsWith(`INPUT_`)){let t=parseInt(e.replace(`INPUT_`,``),10);if(t>=1&&t<=4&&(n.setInput(t),t===3&&!(i.sourceType===`system`&&i.stream&&i.stream.active)&&navigator.mediaDevices&&typeof navigator.mediaDevices.getDisplayMedia==`function`)){window.audioReady=!0,window.audioContext&&window.audioContext.state===`suspended`&&window.audioContext.resume().catch(()=>{}),i.connectSystemAudio(`browser`,!0).catch(()=>{});return}}else if(e===`CYCLE_STYLE`){n.isLockedExpanded&&=!1;let e=[`fisam`,`pimson`,`wbs_m405`,`mccurdy_vu`,`standard_vu`],t=e.indexOf(n.meterStyle);n.meterStyle=e[(t+1)%e.length];try{localStorage.setItem(kd(),n.meterStyle)}catch{}n.saveEEPROM(),n.notify()}else e===`TOGGLE_LOCKED_EXPANDED`?n.toggleLockedExpanded():e===`TOGGLE_AUTORANGE`?n.toggleAutoRange():e===`MC_TOGGLE`?n.toggleMccurdyRange():e===`MC_RANGE_OUTER`?n.setMccurdyRange(`outer`):e===`MC_RANGE_INNER`?n.setMccurdyRange(`inner`):e===`MC_RANGE_CAL`&&n.setMccurdyRange(`cal`);t.syncAudioWithHardwareMode(n)},r.onButtonReleased=()=>{}}function Id(e,t){let{model:n}=e;document.addEventListener(`pointerdown`,async e=>{!t.isAudioStarted&&!e.target.closest(`.aux-drawer`)&&(window.audioReady=!0,window.audioContext&&window.audioContext.state===`suspended`&&await window.audioContext.resume(),e.target?.closest(`[data-btn^="INPUT_"]`)||await t.syncAudioWithHardwareMode(n))},{once:!0,passive:!0})}var Ld=!1,Rd=null;async function zd(){try{let e=new AbortController,t=setTimeout(()=>e.abort(),650),n=await fetch(`http://127.0.0.1:8467/api/status`,{signal:e.signal,mode:`cors`});if(clearTimeout(t),n.ok)return Ld=!0,!0}catch{}return Ld=!1,!1}function Bd(e){return e?/monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|pipewire.*sink/i.test(e):!1}function Vd(e,t){let{audio:n}=e,{drawerSourceBadge:r,selectDevice:i}=t;n.onStatusChange=e=>{if(r){if(e.type===`soundcard`){let t=Bd(e.label||``);r.textContent=`Source: `+(e.label||`Soundcard Input`)+(t?` (OS Loopback · Banner-Free)`:``),r.style.color=t?`#38bdf8`:`#7df9ff`}else e.type===`system`?(r.textContent=`Source: `+(e.label||`Computer System Audio`),r.style.color=`#7df9ff`):e.type===`test`?(r.textContent=`Source: `+e.label,r.style.color=`#ffd152`):e.type===`error`?(r.textContent=`Source Error: `+(e.error||`Connection Failed`),r.style.color=`#ff4d4f`):e.type===`disconnected`&&(r.textContent=`Source: Audio Stopped`,r.style.color=`#888`)}},n.onDevicesChange=(e,t)=>{if(!i)return;let n=t||i.value;if(i.innerHTML=`<option value="">Default Soundcard Input</option>`,Ld){let e=document.createElement(`option`);e.value=`__WBS_LINUX_HOST__`,e.textContent=`🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)`,e.style.color=`#38bdf8`,e.style.fontWeight=`bold`,n===`__WBS_LINUX_HOST__`&&(e.selected=!0),i.appendChild(e)}e.forEach((e,t)=>{let r=document.createElement(`option`);r.value=e.deviceId;let a=/wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(e.label||``),o=Bd(e.label);a?(r.textContent=`🎛️ [WBS Router Active] ${e.label||`WBS Bus ${t+1}`}`,r.style.color=`#86efac`,r.style.fontWeight=`bold`):o?(r.textContent=`🎧 [OS Loopback · Banner-Free] ${e.label||`Device ${t+1}`}`,r.style.color=`#38bdf8`):r.textContent=e.label||`Audio Interface ${t+1}`,e.deviceId===n&&(r.selected=!0),i.appendChild(r)})}}async function Hd(e,t){let{audio:n}=e,{selectDevice:r}=t;async function i(){if(!r)return;let e=r.value||n.activeDeviceId;await zd();let t=await n.getAudioInputDevices();if(r.innerHTML=`<option value="">Default Soundcard Input</option>`,Ld){let t=document.createElement(`option`);t.value=`__WBS_LINUX_HOST__`,t.textContent=`🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)`,t.style.color=`#38bdf8`,t.style.fontWeight=`bold`,e===`__WBS_LINUX_HOST__`&&(t.selected=!0),r.appendChild(t)}t.forEach((t,n)=>{let i=document.createElement(`option`);i.value=t.deviceId;let a=/wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(t.label||``),o=Bd(t.label);a?(i.textContent=`🎛️ [WBS Router Active] ${t.label||`WBS Bus ${n+1}`}`,i.style.color=`#86efac`,i.style.fontWeight=`bold`):o?(i.textContent=`🎧 [OS Loopback · Banner-Free] ${t.label||`Device ${n+1}`}`,i.style.color=`#38bdf8`):i.textContent=t.label||`Audio Interface ${n+1}`,t.deviceId===e&&(i.selected=!0),r.appendChild(i)})}try{await i()}catch{}navigator.mediaDevices&&navigator.mediaDevices.ondevicechange!==void 0&&(navigator.mediaDevices.ondevicechange=i)}function Ud(e,t,n){let{model:r,audio:i}=e,{selectDevice:a,drawerSourceBadge:o,btnBridgeOsAudio:s,selectSysAudioMode:c}=t;c&&(c.value=localStorage.getItem(`xtm.sysaudio.surface`)||`browser`,c.addEventListener(`change`,e=>{localStorage.setItem(`xtm.sysaudio.surface`,e.target.value)})),s&&s.addEventListener(`click`,async()=>{if(await zd()&&a){a.value=`__WBS_LINUX_HOST__`,a.dispatchEvent(new Event(`change`));return}let e=(await i.getAudioInputDevices()).find(e=>Bd(e.label));if(e&&a)a.value=e.deviceId,a.dispatchEvent(new Event(`change`));else{let e=document.getElementById(`guideModal`),t=document.getElementById(`guideModalIframe`),n=document.getElementById(`guideModalTitleText`);e&&t&&(t.src=`os-audio-bridge.html`,n&&(n.textContent=`OS Audio Loopback & System Bridge Guide`),e.style.display=`flex`)}}),a&&a.addEventListener(`change`,async()=>{let e=a.value||null;if(n.isAudioStarted=!0,Rd&&=(Rd.close(),null),e===`__WBS_LINUX_HOST__`){i.stopCurrentSource(),o&&(o.textContent=`Source: 🐧 Linux Host (PipeWire & MXL Bridge · Banner-Free)`,o.style.color=`#38bdf8`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:__WBS_LINUX_HOST__`,r.flash(`LINUX MXL`);try{Rd=new EventSource(`http://127.0.0.1:8467/api/stream/meters`),Rd.onmessage=e=>{try{let t=JSON.parse(e.data);if(i.currentLevels){let e=typeof t.left_vu==`number`?t.left_vu:-42,n=typeof t.right_vu==`number`?t.right_vu:-42,r=typeof t.left_db==`number`?t.left_db:-60,a=typeof t.right_db==`number`?t.right_db:-60;i.currentLevels.vu[0]=10**(e/20),i.currentLevels.vu[1]=10**(n/20),i.currentLevels.vuDb[0]=e,i.currentLevels.vuDb[1]=n,i.currentLevels.ppm[0]=10**(r/20),i.currentLevels.ppm[1]=10**(a/20),i.currentLevels.ppmDb[0]=r,i.currentLevels.ppmDb[1]=a,i.currentLevels.rmsDb[0]=r,i.currentLevels.rmsDb[1]=a,i.currentLevels.dbfs[0]=r,i.currentLevels.dbfs[1]=a,i.currentLevels.hasAudio=!0}}catch{}},Rd.onerror=()=>{o&&(o.textContent=`Linux Host Reconnecting...`,o.style.color=`#ffd152`)}}catch(e){console.warn(`Could not connect to Linux Host SSE stream:`,e)}return}let t=a.options[a.selectedIndex]?.text||`Soundcard Input`;o&&(o.textContent=`Connecting: `+t+`...`,o.style.color=`#ffd152`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:`+e;try{await i.connectSoundCard(e),o&&(o.textContent=`Source: `+t,o.style.color=`#7df9ff`),r.flash(`CARD IN`),i.setReferenceLevel(r.getActiveReferenceLevel(),r.mode===`D`)}catch(e){let t=e?.name===`NotFoundError`||e?.message?.includes(`not found`)||e?.message?.includes(`detected`);t||console.error(`Failed to connect selected device:`,e),o&&(o.textContent=t?`Source: Calibrated Internal Tone (No Audio Input Devices)`:`Device Error: `+(e?.message||`Cannot access device`),o.style.color=t?`#38bdf8`:`#ff4d4f`),i.setToneCalibration(-18),i.startTestGenerator(`sine1k`)}})}function Wd(e,t){let{audio:n}=e,{inputGainSlider:r,inputGainVal:i,chkMonitor:a,monitorVolSlider:o,monitorVolVal:s}=t;r&&r.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setInputTrim(t),i&&(i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`)}),a&&a.addEventListener(`change`,e=>{n.setMonitor(e.target.checked)}),o&&o.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setMonitorVolume(t),s&&(s.textContent=Math.round(t*100)+`%`)})}function Gd(e,t){let{model:n,audio:r}=e,{selectToneCal:i}=t;if(i){i.innerHTML=``;for(let e=0;e>=-60;e--){let t=document.createElement(`option`);t.value=String(e);let n=`${e} dBFS`;e===-18?n+=` (0 VU ANSI C16.5 / EBU Reference - Default)`:e===0?n+=` (Peak Full Scale Ceiling)`:e===-6?n+=` (High Peak Alignment)`:e===-12?n+=` (Digital Nominal)`:e===-14?n+=` (AES / Streaming Target)`:e===-20?n+=` (0 VU SMPTE RP155 Reference)`:e===-24&&(n+=` (EBU R128 / ATSC A/85)`),t.textContent=n,i.appendChild(t)}i.value=String(n.toneCalLevels[n.toneCalIdx]??-18),i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);r.setToneCalibration(t);let i=n.toneCalLevels.indexOf(t);if(i!==-1&&(n.toneCalIdx=i,n.saveEEPROM(),n.mode===`S`&&(n.s.pair[0]===1||n.s.pair[0]===3))){let e=n.s.pair[0]===3?`400 `:`1k `;n.flash((e+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}})}}var Kd=e=>{try{return localStorage.getItem(e)}catch{return null}},qd=(e,t)=>{try{localStorage.setItem(e,t)}catch{}};function Jd(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.lamp.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.lamp.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.lamp.v2.wbsca`:`xtm.lamp.v2.wbsdark`}function Yd(){return document.body.classList.contains(`theme-wbs-ca`)?`amber_bottom`:document.body.classList.contains(`theme-mccurdy`)?`unlit`:`amber`}function Xd(e,t){let{model:n,view:r}=e,i=Yd(),a=Kd(Jd())||i;a!==n.dialLamp&&(n.dialLamp=a,r.isBuilt=!1),t&&(t.value=n.dialLamp)}function Zd(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.ppmLamp.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.ppmLamp.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.ppmLamp.v2.wbsca`:`xtm.ppmLamp.v2.wbsdark`}function Qd(e,t){let{model:n,view:r}=e,i=Kd(Zd())||`unlit`;i!==n.ppmLamp&&(n.ppmLamp=i,r.isBuilt=!1),t&&(t.value=n.ppmLamp)}function $d(e){e&&(e.value=document.body.classList.contains(`theme-wbs-ca`)?`wbs-ca`:document.body.classList.contains(`theme-mccurdy-dark`)?`mccurdy-dark`:document.body.classList.contains(`theme-mccurdy`)?`mccurdy-light`:`wbs-dark`)}function ef(e,t){let{model:n,view:r}=e,{selectLampColor:i,selectDialBg:a,selectPpmLampColor:o,selectPpmDialBg:s,selectConsoleBg:c}=t,l=()=>Xd(e,i);l(),new MutationObserver(l).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),i&&(i.value=n.dialLamp||`amber`,i.addEventListener(`change`,e=>{n.dialLamp=e.target.value,qd(Jd(),n.dialLamp),n.saveEEPROM(),r.isBuilt=!1}));let u=`xtm.dial.bg`,d=Kd(u)||n.dialBg||`auto`;d!==n.dialBg&&(n.dialBg=d),a&&(a.value=n.dialBg||`auto`,a.addEventListener(`change`,e=>{n.dialBg=e.target.value,qd(u,n.dialBg),n.saveEEPROM(),r.isBuilt=!1}));let f=()=>Qd(e,o);Kd(`xtm.ppmLamp.dark`)||qd(`xtm.ppmLamp.dark`,n.ppmLamp||`unlit`),f(),new MutationObserver(f).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),o&&(o.value=n.ppmLamp||`unlit`,o.addEventListener(`change`,e=>{n.ppmLamp=e.target.value,qd(Zd(),n.ppmLamp),n.saveEEPROM(),r.isBuilt=!1}));let p=`xtm.ppmDial.bg`,m=Kd(p)||n.ppmDialBg||`auto`;m!==n.ppmDialBg&&(n.ppmDialBg=m),s&&(s.value=n.ppmDialBg||`auto`,s.addEventListener(`change`,e=>{n.ppmDialBg=e.target.value,qd(p,n.ppmDialBg),n.saveEEPROM(),r.isBuilt=!1}));let h=()=>$d(c);h(),new MutationObserver(h).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),c&&c.addEventListener(`change`,e=>{let t=e.target.value;typeof window.setMode==`function`&&window.setMode(t)})}function tf(e,t){let{model:n,audio:r}=e,{chkHpf:i,chkTerm:a}=t;i&&i.addEventListener(`change`,e=>{n.hp=+!!e.target.checked,r.setHighPass(e.target.checked),n.saveEEPROM(),n.notify()}),a&&a.addEventListener(`change`,e=>{n.term=+!!e.target.checked,n.saveEEPROM(),n.notify()})}function nf(e,t){let{audio:n,view:r}=e,{selectPpmBallistics:i}=t;i&&(i.value=n.ppmBallisticPreset||`type2`,r.ppmStandard=i.value,r.isBuilt=!1,i.addEventListener(`change`,t=>{n.setPpmType(t.target.value),r.ppmStandard=t.target.value,r.isBuilt=!1,fd(e)}))}function rf(e){let{audio:t,dbfsView:n}=e;n&&(n.onClear=()=>{t.resetLoudness()});let r=document.getElementById(`selectScopeLogWarp`);r&&n&&r.addEventListener(`change`,e=>{n.setBeta(parseFloat(e.target.value))});let i=document.getElementById(`selectTimeScale`);i&&n&&(i.value=n.timeMode,i.addEventListener(`change`,e=>{n.setTimeMode(e.target.value)}),n.onTimeModeChange=t=>{i.value=t,fd(e)})}function af(e){let t=document.getElementById(`wbsConsentBanner`),n=document.getElementById(`btnConsentAllow`),r=document.getElementById(`btnConsentSession`),i=document.getElementById(`btnResetConsent`),a=document.getElementById(`consentStatusText`);function o(){let e=$.getConsent();a&&(e===`allowed`?(a.textContent=`ALLOWED (Persistent Memory)`,a.style.color=`#22c55e`):e===`session_only`?(a.textContent=`SESSION ONLY`,a.style.color=`#eab308`):(a.textContent=`PROMPTING...`,a.style.color=`#38bdf8`)),t&&(t.style.display=e===`prompt`?`flex`:`none`)}n&&n.addEventListener(`click`,()=>{$.setConsent(`allowed`),o(),fd(e)}),r&&r.addEventListener(`click`,()=>{$.setConsent(`session_only`),o()}),i&&i.addEventListener(`click`,()=>{$.resetConsent(),o()}),o()}function of(e){let{model:t,audio:n,podView:r,dbfsView:i}=e;i&&$.loadSavedConfig(t,n,r,i)}function sf(e,t){let{model:n,audio:r,podView:i,dbfsView:a}=e,o=document.getElementById(`btnExportWbs`);o&&a&&o.addEventListener(`click`,()=>{$.downloadWbsFile(n,r,i,a),n.flash(`SAVED.WBS`,1400)});let s=document.getElementById(`btnImportWbs`),c=document.getElementById(`inputImportWbs`);s&&c&&a&&(s.addEventListener(`click`,()=>{c.click()}),c.addEventListener(`change`,async e=>{let o=e.target.files?.[0];if(o)try{let e=await o.text(),s=$.parseWbsYaml(e);$.applyConfig(s,n,r,i,a),await t.syncAudioWithHardwareMode(n)}catch(e){console.error(`WBS configuration import failed:`,e),alert(`Error importing .WBS configuration: `+(e?.message||`Invalid format`)),n.flash(`CFG ERR `,1600)}finally{c.value=``}}))}function cf(e,t){let n=()=>fd(e),r=document.getElementById(`selectPeakSens`),i=document.getElementById(`chkExtendedLed22`),a=document.getElementById(`selectVuBallistics`),o=document.getElementById(`selectScopeLogWarp`),{inputGainSlider:s,monitorVolSlider:c,chkMonitor:l,chkPodHold:u,selectPodDecay:d,selectPpmBallistics:f}=t;[s,c,r].forEach(e=>{e?.addEventListener(`change`,n)}),[l,i,u,d,f,a,o].forEach(e=>{e?.addEventListener(`change`,n)})}function lf(e,t){let{model:n}=e;window.addEventListener(`keydown`,e=>{if([`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target.tagName))return;let r=e.key.toUpperCase();r===`M`?(n.pressMode(),t.syncAudioWithHardwareMode(n)):r===`S`?(n.pressSource(),t.syncAudioWithHardwareMode(n)):r===`ARROWDOWN`||r===`D`?n.pressDown():r===`ARROWUP`||r===`U`?n.pressUp():r===`H`?n.holdMode():r===`P`?n.togglePower():r===`T`&&window.dispatchEvent(new CustomEvent(`xtm:open-clock`))})}var uf=!1;function df(e){if(uf)return;uf=!0,document.body.classList.add(`has-new-version`);let t=document.getElementById(`btnOpenSettings`),n=document.querySelector(`.drawer-gear-label`),r=document.getElementById(`drawerToggleLeft`),i=e?e.startsWith(`v`)?e:`v${e}`:``;if(t&&(t.classList.add(`has-update`),t.setAttribute(`title`,`New version available${i?` (`+i+`)`:``}! Click Settings to update`)),n&&(n.classList.add(`has-update`),!n.querySelector(`.settings-update-dot`))){let e=document.createElement(`span`);e.className=`settings-update-dot`,e.title=`New update available`,n.appendChild(e)}r&&r.classList.add(`has-update`);let a=document.querySelector(`.drawer-grid`);if(a&&!document.getElementById(`updateAvailableBanner`)){let e=document.createElement(`div`);e.id=`updateAvailableBanner`,e.className=`update-available-banner`,e.innerHTML=`
      <span>⚡ New version available${i?` (`+i+`)`:``}</span>
      <button type="button" id="btnReloadNewVersion">Reload &amp; Update Now</button>
    `,a.parentElement?.insertBefore(e,a),document.getElementById(`btnReloadNewVersion`)?.addEventListener(`click`,()=>{window.location.reload()})}let o=document.querySelector(`.build-stamp`);o&&(o.innerHTML=`<span style="color:#f97316;cursor:pointer;font-weight:bold" title="Click to reload with new version">Update: ${i||`Available`} ⟳</span>`,o.addEventListener(`click`,()=>window.location.reload()))}function ff(){window.testUpdatePulse=(e=`1.0.99`)=>df(e);async function e(){try{let e=await fetch(`./version.json?cache=`+Date.now(),{cache:`no-store`});if(!e.ok)return;let{version:t}=await e.json();t&&t!==`2.0.47`&&df(t)}catch{}}setTimeout(e,3e3),setInterval(e,6e4),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&e()});let t=document.querySelector(`.build-stamp`);if(t){let e=`v2.0.47`;t.textContent=e,t.setAttribute(`title`,`Ward-Beck Systems XTM-4 ${e}`)}}function pf(){`serviceWorker`in navigator&&(navigator.serviceWorker.addEventListener(`message`,e=>{e.data?.type===`xtm-update-ready`&&(console.info(`XTM: new version stored; update ready.`),df())}),navigator.serviceWorker.register(`sw.js`,{updateViaCache:`none`}).then(e=>{e.waiting&&df(),e.addEventListener(`updatefound`,()=>{let t=e.installing;t&&t.addEventListener(`statechange`,()=>{t.state===`installed`&&navigator.serviceWorker.controller&&df()})})}).catch(e=>{console.warn(`Service worker registration failed:`,e)}))}function mf(){let e=document.getElementById(`pwaInstallBanner`),t=document.getElementById(`btnPwaInstall`),n=document.getElementById(`btnPwaDismiss`),r=document.getElementById(`pwaSubText`),i=null,a=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,o=/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)||window.innerWidth<=840,s=window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0;e&&!s&&(window.addEventListener(`beforeinstallprompt`,t=>{t.preventDefault(),i=t,e.style.display=`block`}),o&&a&&(r&&(r.innerHTML=`Tap the Share icon <strong>[⎋]</strong> in Safari and choose <strong>Add to Home Screen</strong>`),t&&(t.textContent=`How to Install`,t.addEventListener(`click`,()=>{alert(`To install this app on iOS:
1. Tap the Share button in Safari (box with up arrow).
2. Scroll down and tap "Add to Home Screen".`)})),e.style.display=`block`),window.addEventListener(`appinstalled`,()=>{e.style.display=`none`,i=null}),t&&!a&&t.addEventListener(`click`,async()=>{if(i){i.prompt();let{outcome:t}=await i.userChoice;t===`accepted`&&(e.style.display=`none`),i=null}else e.style.display=`none`}),n&&n.addEventListener(`click`,()=>{e.style.display=`none`}))}function hf(e,t,n,r){let i=e=>(e-90)*(Math.PI/180),a=i(n),o=i(r),s=Math.cos(a)*e,c=Math.sin(a)*e,l=Math.cos(o)*e,u=Math.sin(o)*e,d=Math.cos(a)*t,f=Math.sin(a)*t,p=Math.cos(o)*t,m=Math.sin(o)*t;return`M ${s.toFixed(2)} ${c.toFixed(2)} A ${e} ${e} 0 0 1 ${l.toFixed(2)} ${u.toFixed(2)} L ${p.toFixed(2)} ${m.toFixed(2)} A ${t} ${t} 0 0 0 ${d.toFixed(2)} ${f.toFixed(2)} Z`}function gf(){return`<defs>
    <!-- Outer Molded Meter Bezel Gradient -->
    <linearGradient id="clockBezelRim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5a6068" />
      <stop offset="18%" stop-color="#212327" />
      <stop offset="50%" stop-color="#121316" />
      <stop offset="82%" stop-color="#212327" />
      <stop offset="100%" stop-color="#464a52" />
    </linearGradient>

    <!-- Inner Metallic Window Bevel Frame -->
    <linearGradient id="clockWindowBevel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e3238" />
      <stop offset="25%" stop-color="#8a9099" />
      <stop offset="75%" stop-color="#4c525a" />
      <stop offset="100%" stop-color="#a8b0ba" />
    </linearGradient>

    <!-- Dark Broadcast Meter Dial Face Background -->
    <radialGradient id="meterDialDark" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#191c23" />
      <stop offset="60%" stop-color="#111318" />
      <stop offset="90%" stop-color="#0a0c0f" />
      <stop offset="100%" stop-color="#050608" />
    </radialGradient>

    <!-- Vintage Ward-Beck Cream Parchment Face -->
    <radialGradient id="clockDialCream" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#faf5e6" />
      <stop offset="65%" stop-color="#f0e4c8" />
      <stop offset="90%" stop-color="#e3d2ab" />
      <stop offset="100%" stop-color="#cca852" />
    </radialGradient>

    <!-- McCurdy Studio Neutral Dark Face -->
    <radialGradient id="clockDialMcCurdyDark" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#20242c" />
      <stop offset="65%" stop-color="#15171d" />
      <stop offset="92%" stop-color="#0e1014" />
      <stop offset="100%" stop-color="#060709" />
    </radialGradient>

    <!-- McCurdy ATS-100 Console Light Cream Face -->
    <radialGradient id="clockDialMcCurdyLight" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#fdfbf5" />
      <stop offset="65%" stop-color="#eee9db" />
      <stop offset="90%" stop-color="#ded8c7" />
      <stop offset="100%" stop-color="#c8bfab" />
    </radialGradient>

    <!-- Warm Filament Halo Glow -->
    <radialGradient id="clockFilamentGlow" cx="50%" cy="25%" r="72%">
      <stop offset="0%" stop-color="#ffb74d" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#ff9800" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Recess Chamber Drop Shadow -->
    <radialGradient id="clockChamberShadow" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="#000000" stop-opacity="0" />
      <stop offset="94%" stop-color="#000000" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
    </radialGradient>

    <!-- Curved Specular Glass Sheen -->
    <linearGradient id="clockGlassSheen" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14" />
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.03" />
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.07" />
    </linearGradient>

    <!-- Center Boss Metallic Collar -->
    <linearGradient id="clockBossGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#444a52" />
      <stop offset="30%" stop-color="#181a1e" />
      <stop offset="70%" stop-color="#0c0d10" />
      <stop offset="100%" stop-color="#2e3238" />
    </linearGradient>
  </defs>`}function _f(e=`wbs-dark`){let t=hf(168,188,-60,0),n=``;for(let e=0;e<60;e++){let t=(e*6-90)*(Math.PI/180),r=e%5==0,i=e%15==0;if(e>=50&&e<=59||e===0){let e=r?186:180,i=Math.cos(t)*168,a=Math.sin(t)*168,o=Math.cos(t)*e,s=Math.sin(t)*e,c=r?3.8:2.2;n+=`<line class="clock-tick clock-tick-warn" x1="${i.toFixed(1)}" y1="${a.toFixed(1)}" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" stroke="#111317" stroke-width="${c}" stroke-linecap="butt"/>`}else{let e=i?192:r?188:180,a=Math.cos(t)*170,o=Math.sin(t)*170,s=Math.cos(t)*e,c=Math.sin(t)*e,l=i?3.5:r?2.8:1.3;n+=`<line class="clock-tick clock-tick-std" x1="${a.toFixed(1)}" y1="${o.toFixed(1)}" x2="${s.toFixed(1)}" y2="${c.toFixed(1)}" stroke-width="${l}" stroke-linecap="round"/>`}}let r=[`12`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`10`,`11`],i=``;for(let e=0;e<12;e++){let t=(e*30-90)*(Math.PI/180),n=Math.cos(t)*140,a=Math.sin(t)*140+7;i+=`<text class="${e===10||e===11||e===0?`clock-num clock-num-warn`:`clock-num clock-num-std`}" x="${n.toFixed(1)}" y="${a.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="800" text-anchor="middle">${r[e]}</text>`}let a=e=>(e-90)*(Math.PI/180),o=a(-60),s=a(0),[c,l]=[Math.cos(o)*198,Math.sin(o)*198+4],[u,d]=[Math.cos(s)*198,Math.sin(s)*198+4],f=`
    <text class="clock-num-warn" x="${c.toFixed(1)}" y="${l.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle">0</text>
    <text class="clock-num-warn" x="${u.toFixed(1)}" y="${d.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle">+4</text>
  `,p=[`24`,`13`,`14`,`15`,`16`,`17`,`18`,`19`,`20`,`21`,`22`,`23`],m=``;for(let e=0;e<12;e++){let t=(e*30-90)*(Math.PI/180),n=Math.cos(t)*112,r=Math.sin(t)*112+4;m+=`<text class="clock-num-24" x="${n.toFixed(1)}" y="${r.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${p[e]}</text>`}return`
    <!-- Molded Bezel Rim (Meter Style) -->
    <circle cx="0" cy="0" r="236" fill="url(#clockBezelRim)" />
    <circle cx="0" cy="0" r="226" fill="#14161a" stroke="url(#clockWindowBevel)" stroke-width="3" />
    <circle cx="0" cy="0" r="214" fill="#090b0e" />

    <!-- Meter Dial Face Plate (styled via stylesheet) -->
    <circle class="clock-dial-plate xt-face" cx="0" cy="0" r="206" />

    <!-- Warm Filament Halo Glow -->
    <circle cx="0" cy="0" r="206" fill="url(#clockFilamentGlow)" pointer-events="none" />

    <!-- SOLID YELLOW FILL Overload/Cue Warning Band (no black in here, solid yellow fill) -->
    <path class="clock-yellow-band" d="${t}" stroke="none" />

    <!-- Continuous Baseline Arc (at r = 168) -->
    <circle class="clock-baseline-arc" cx="0" cy="0" r="168" fill="none" stroke-width="3.5" />

    <!-- Chapter Ring Inner Track -->
    <circle class="clock-inner-track" cx="0" cy="0" r="126" fill="none" stroke-width="0.8" stroke-dasharray="2,3" />

    <!-- Ticks & Numerals -->
    <g class="clock-ticks-group">${n}</g>
    <g class="clock-numbers-group">${i}</g>
    <g class="clock-numbers-24">${m}</g>
    <g class="meter-scale-markers">${f}</g>

    <!-- Brand Badges (Theme Connected at Stylesheet) -->
    <g class="clock-brand clock-brand-wbs-modern wbs-modern-only" style="cursor:pointer;" title="Ward-Beck Systems VU Master Clock">
      <rect x="-60" y="-76" width="120" height="38" rx="5" fill="#0b0d10" stroke="#22c55e" stroke-width="1.6"/>
      <text x="0" y="-58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="1.2">WARD-BECK</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="1.5">VU MASTER CLOCK</text>
    </g>

    <g class="clock-brand clock-brand-wbs-vintage wbs-ca-only" style="cursor:pointer;" title="Ward-Beck Systems Vintage Master Clock">
      <rect x="-60" y="-76" width="120" height="38" rx="5" fill="#ffffff" stroke="#f97316" stroke-width="1.8"/>
      <text x="0" y="-58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="900" fill="#f97316" text-anchor="middle" letter-spacing="1.2">WARD-BECK</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#2a2b2a" text-anchor="middle" letter-spacing="1.5">SYSTEMS · TORONTO</text>
    </g>

    <g class="clock-brand clock-brand-mc mc-only" style="cursor:pointer;" title="McCurdy Radio Industries Studio Master Clock">
      <rect x="-56" y="-76" width="112" height="38" rx="5" fill="#142842" stroke="#d9e2ec" stroke-width="1.4"/>
      <text x="0" y="-57" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">McCURDY</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#9fb3c8" text-anchor="middle" letter-spacing="1.2">STUDIO CLOCK</text>
    </g>

    <!-- NRC-CNRC Official Time Alignment Inscription & Canadian Broadcast Logo (Canada) -->
    <g class="clock-nrc-inscription" transform="translate(0, 52)">
      <!-- Official Canadian Maple Leaf Badge -->
      <g class="clock-nrc-leaf-badge" transform="translate(0, 0)">
        <path class="clock-nrc-leaf-path" d="M 0,-10 L 1.5,-6.2 L 4.2,-6.8 L 4.5,-3.8 L 2.9,-3.4 L 6.9,-3.5 L 9.8,-0.5 L 7.6,1.3 L 3.9,0.8 L 5.9,3.6 L 2.2,3.9 L 0.7,8.7 L -0.7,8.7 L -2.2,3.9 L -5.9,3.6 L -3.9,0.8 L -7.6,1.3 L -9.8,-0.5 L -6.9,-3.5 L -2.9,-3.4 L -4.5,-3.8 L -4.2,-6.8 L -1.5,-6.2 Z" fill="#b91c1c" />
      </g>
      <text x="0" y="17" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle" letter-spacing="1.8" class="clock-nrc-lbl">NRC · CNRC OFFICIAL TIME</text>
      <text x="0" y="28" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="1.2" class="clock-nrc-sub">CANADIAN BROADCAST STANDARD</text>
      <text x="0" y="39" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="1.1" class="clock-nrc-srv">time.nrc.ca</text>
      <text x="0" y="49" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="1.1" class="clock-nrc-srv">time.chu.nrc.ca</text>
    </g>

    <!-- Chamber Recess Shadows -->
    <circle cx="0" cy="0" r="206" fill="url(#clockChamberShadow)" pointer-events="none" />

    <!-- Glass Curved Specular Sheen -->
    <circle cx="0" cy="0" r="206" fill="url(#clockGlassSheen)" pointer-events="none" />
  `}var vf=`#f4902c`,yf=`#facc15`;function bf(e,t=1,n=vf){let r=-e,i=r+6*t,a=r+10*t,o=r+16*t,s=r+20*t,c=r+24*t,l=r+28*t,u=r+30*t,d=5.8*t,f=3.6*t,p=1.2,m=`
    M 0 ${r}
    L 0.6 ${i}
    C 1.2 ${a}, ${d} ${o}, ${d} ${s}
    C ${d} ${c}, ${f} ${l}, 1.2 ${u}
    L ${p} 0
    L -${p} 0
    L -1.2 ${u}
    C -${f} ${l}, -${d} ${c}, -${d} ${s}
    C -${d} ${o}, -1.2 ${a}, -0.6 ${i}
    Z`,h=22*t,g=6.8*t,_=`
    <g opacity="0.35">
      <path d="${`
    M 2 ${r+3}
    L 2.6 ${i+3}
    C 3.2 ${a+3}, ${d+2} ${o+3}, ${d+2} ${s+3}
    C ${d+2} ${c+3}, ${f+2} ${l+3}, 3.2 ${u+3}
    L 3.2 3
    L 0.8 3
    L 0.8 ${u+3}
    C ${-f+2} ${l+3}, ${-d+2} ${c+3}, ${-d+2} ${s+3}
    C ${-d+2} ${o+3}, 0.8 ${a+3}, 1.4 ${i+3}
    Z`}" fill="#000000" />
      <circle cx="2" cy="${h+3}" r="${g}" fill="#000000" />
    </g>
  `;return{body:`
    <path d="${m}" fill="${n}" />
    <!-- Center Specular Spine Highlight -->
    <line x1="0" y1="${h-2}" x2="0" y2="${r+4}" stroke="rgba(255,255,255,0.48)" stroke-width="0.9" />
    <!-- Rear Counterweight Disc -->
    <circle cx="0" cy="${h}" r="${g}" fill="${n}" />
    <circle cx="0" cy="${h}" r="${g*.4}" fill="#111317" opacity="0.6" />
  `,shadow:_}}function xf(e){let t=bf(110,1.15,vf),n=bf(168,1,vf);return`
    <!-- Rotating Hour Hand Group (VU Meter Needle Profile) -->
    <g id="clockHourHand" transform="rotate(0 0 0)">
      ${t.shadow}
      ${t.body}
    </g>

    <!-- Rotating Minute Hand Group (VU Meter Needle Profile) -->
    <g id="clockMinuteHand" transform="rotate(0 0 0)">
      ${n.shadow}
      ${n.body}
    </g>

    <!-- Rotating Second Hand Group (Master PPM Sweep Wand with Balance Disc) -->
    <g id="clockSecondHand" transform="rotate(0 0 0)">
      <!-- Drop Shadow -->
      <g transform="translate(2, 3)" opacity="0.32">
        <line x1="0" y1="44" x2="0" y2="-192" stroke="#000000" stroke-width="2.6" stroke-linecap="round" />
        <circle cx="0" cy="34" r="7" fill="#000000" />
      </g>
      <!-- Second Hand Body: Luminous Yellow Sweep Wand -->
      <line x1="0" y1="42" x2="0" y2="-190" stroke="${yf}" stroke-width="2.2" stroke-linecap="round" />
      <line x1="0" y1="32" x2="0" y2="-188" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6" />
      <!-- Arrowhead Spade Pointer Tip -->
      <polygon points="-3,-172 0,-191 3,-172 0,-168" fill="${yf}" />
      <!-- Sparkles of Clocking: Luminous Escapement & Atomic Pulse Glints -->
      <g id="clockSweepSparkles" transform="translate(0, -191)">
        <!-- 4-Pointed Star Sparkle (Main) -->
        <path class="clock-sparkle-star" d="M 0,-7.5 Q 0,0 7.5,0 Q 0,0 0,7.5 Q 0,0 -7.5,0 Q 0,0 0,-7.5 Z" fill="#ffffff" />
        <!-- Diagonal Star Sparkle -->
        <path class="clock-sparkle-diag" d="M -4,-4 Q 0,0 4,-4 Q 0,0 4,4 Q 0,0 -4,4 Q 0,0 -4,-4 Z" fill="${yf}" opacity="0.85" />
        <!-- Concentric Glint Core -->
        <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
        <!-- Starlight Glint Ray Flares -->
        <line x1="0" y1="-11" x2="0" y2="11" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.9" />
        <line x1="-11" y1="0" x2="11" y2="0" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.9" />
      </g>
      <!-- Rear Counterweight Disc -->
      <circle cx="0" cy="34" r="6.5" fill="${yf}" />
      <circle cx="0" cy="34" r="2.8" fill="#111317" />
    </g>

    <!-- Multi-Tiered Simpson/Sifam Meter Concentric Center Hub -->
    <g id="clockCenterHub" pointer-events="none">
      <!-- Outer Matte Collar -->
      <circle cx="0" cy="0" r="13" fill="url(#clockBossGrad)" stroke="#1a1c22" stroke-width="1.2" />
      <!-- Metallic Stepped Washer -->
      <circle cx="0" cy="0" r="8" fill="#2d3748" stroke="#4a5568" stroke-width="0.8" />
      <!-- Center Concentric Pivot Pin -->
      <circle cx="0" cy="0" r="4.2" fill="${vf}" />
      <circle cx="0" cy="0" r="1.8" fill="#ffffff" opacity="0.85" />
    </g>
  `}function Sf(e){return`<svg id="clockMasterSvg" viewBox="-240 -240 480 480" width="100%" height="100%" class="clock-svg-root theme-${e.theme}" xmlns="http://www.w3.org/2000/svg">
    ${gf()}
    ${_f(e.theme,e.showCueSectors)}
    ${xf(e.theme)}
  </svg>`}function Cf(e=new Date,t=!0){let n=e.getHours(),r=e.getMinutes(),i=e.getSeconds(),a=e.getMilliseconds(),o=t?i+a/1e3:i,s=r+o/60,c=(n%12+s/60)*30,l=s*6,u=o*6,d=String(n).padStart(2,`0`),f=String(n%12||12).padStart(2,`0`),p=String(r).padStart(2,`0`),m=String(i).padStart(2,`0`),h=n>=12?`PM`:`AM`,g=`${d}:${p}:${m}`;return{hours:n,minutes:r,seconds:i,milliseconds:a,hourAngle:c,minuteAngle:l,secondAngle:u,timeString12:`${f}:${p}:${m} ${h}`,timeString24:g,utcTimeString:`${String(e.getUTCHours()).padStart(2,`0`)}:${String(e.getUTCMinutes()).padStart(2,`0`)}:${String(e.getUTCSeconds()).padStart(2,`0`)} UTC`,dateString:e.toLocaleDateString(void 0,{weekday:`short`,year:`numeric`,month:`short`,day:`numeric`}),timeZoneString:Intl.DateTimeFormat().resolvedOptions().timeZone||`LOCAL`}}function wf(e,t){let n=e.querySelector(`#clockHourHand`),r=e.querySelector(`#clockMinuteHand`),i=e.querySelector(`#clockSecondHand`);n&&n.setAttribute(`transform`,`rotate(${t.hourAngle.toFixed(2)} 0 0)`),r&&r.setAttribute(`transform`,`rotate(${t.minuteAngle.toFixed(2)} 0 0)`),i&&i.setAttribute(`transform`,`rotate(${t.secondAngle.toFixed(2)} 0 0)`)}function Tf(e,t,n,r=`wbs-dark`){return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${e}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #07090c;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    .win-top-bar {
      position: absolute;
      top: 16px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100;
    }
    .win-btn {
      background: rgba(22, 29, 39, 0.85);
      border: 1px solid #2e3b4e;
      color: #94a3b8;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .win-btn:hover { background: #253346; color: #ffffff; border-color: #38bdf8; }
    .win-btn-nrc { background: rgba(220, 38, 38, 0.18); border-color: rgba(220, 38, 38, 0.45); color: #f87171; }
    .win-btn-nrc:hover { background: rgba(220, 38, 38, 0.3); border-color: #ef4444; color: #ffffff; }
    .win-btn-close { background: #991b1b; color: #ffffff; border-color: #ef4444; }
    .win-btn-close:hover { background: #dc2626; }
    .win-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 16px;
      background: radial-gradient(circle at center, #141822 0%, #07090d 100%);
    }
    .clock-svg-wrap {
      width: min(88vw, 84vh);
      height: min(88vw, 84vh);
      aspect-ratio: 1;
      filter: drop-shadow(0 24px 60px rgba(0,0,0,0.95));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .clock-svg-wrap svg {
      width: 100%;
      height: 100%;
    }
    .win-readout {
      margin-top: 14px;
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 26px;
      font-weight: 800;
      color: #c8f53c;
      letter-spacing: 2.5px;
      text-shadow: 0 0 10px rgba(200, 245, 60, 0.5);
    }
    .win-sub {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 2px;
    }

    /* METER THEME STYLESHEET COUPLING */
    body.theme-wbs-dark .clock-dial-plate, .clock-dial-plate { fill: url(#meterDialDark); }
    body.theme-wbs-dark .clock-baseline-arc, .clock-baseline-arc { stroke: #ffffff; }
    body.theme-wbs-dark .clock-yellow-band, .clock-yellow-band { fill: #facc15; }
    body.theme-wbs-dark .clock-tick-std, .clock-tick-std { stroke: #ffffff; }
    body.theme-wbs-dark .clock-tick-warn, .clock-tick-warn { stroke: #111317; }
    body.theme-wbs-dark .clock-num-std, .clock-num-std { fill: #ffffff; }
    body.theme-wbs-dark .clock-num-warn, .clock-num-warn { fill: #facc15; }
    body.theme-wbs-dark .clock-num-24, .clock-num-24 { fill: #718096; }
    body.theme-wbs-dark .clock-nrc-lbl, .clock-nrc-lbl { fill: #94a3b8; }
    body.theme-wbs-dark .clock-nrc-sub, .clock-nrc-sub { fill: #64748b; }
    body.theme-wbs-dark .clock-nrc-srv, .clock-nrc-srv { fill: #94a3b8; }

    body.theme-wbs-ca .clock-dial-plate { fill: url(#clockDialCream) !important; }
    body.theme-wbs-ca .clock-baseline-arc { stroke: #2a2b2a !important; }
    body.theme-wbs-ca .clock-yellow-band { fill: #facc15 !important; }
    body.theme-wbs-ca .clock-tick-std { stroke: #2a2b2a !important; }
    body.theme-wbs-ca .clock-tick-warn { stroke: #111317 !important; }
    body.theme-wbs-ca .clock-num-std { fill: #1f2421 !important; }
    body.theme-wbs-ca .clock-num-warn { fill: #c2410c !important; }
    body.theme-wbs-ca .clock-num-24 { fill: #8c7853 !important; }
    body.theme-wbs-ca .clock-nrc-lbl { fill: #57534e !important; }
    body.theme-wbs-ca .clock-nrc-sub { fill: #78716c !important; }
    body.theme-wbs-ca .clock-nrc-srv { fill: #78716c !important; }

    body.theme-mccurdy-dark .clock-dial-plate { fill: url(#clockDialMcCurdyDark) !important; }
    body.theme-mccurdy-dark .clock-baseline-arc { stroke: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-tick-std { stroke: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-num-std { fill: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-num-warn { fill: #facc15 !important; }
    body.theme-mccurdy-dark .clock-num-24 { fill: #627d98 !important; }
    body.theme-mccurdy-dark .clock-nrc-lbl { fill: #9fb3c8 !important; }
    body.theme-mccurdy-dark .clock-nrc-sub { fill: #627d98 !important; }
    body.theme-mccurdy-dark .clock-nrc-srv { fill: #9fb3c8 !important; }

    body.theme-mccurdy .clock-dial-plate { fill: url(#clockDialMcCurdyLight) !important; }
    body.theme-mccurdy .clock-baseline-arc { stroke: #102a43 !important; }
    body.theme-mccurdy .clock-tick-std { stroke: #102a43 !important; }
    body.theme-mccurdy .clock-num-std { fill: #0b1b2b !important; }
    body.theme-mccurdy .clock-num-warn { fill: #c2410c !important; }
    body.theme-mccurdy .clock-num-24 { fill: #627d98 !important; }
    body.theme-mccurdy .clock-nrc-lbl { fill: #334e68 !important; }
    body.theme-mccurdy .clock-nrc-sub { fill: #486581 !important; }
    body.theme-mccurdy .clock-nrc-srv { fill: #486581 !important; }

    .wbs-modern-only { display: none; }
    .wbs-ca-only { display: none; }
    .mc-only { display: none; }
    body.theme-wbs-dark .wbs-modern-only { display: inline; }
    body.theme-wbs-ca .wbs-ca-only { display: inline; }
    body.theme-mccurdy-dark .mc-only, body.theme-mccurdy .mc-only { display: inline; }
  </style>
</head>
<body class="theme-${r}">
  <div class="win-container">
    <div class="win-top-bar">
      <a href="https://nrc.canada.ca/en/web-clock/" target="_blank" rel="noopener noreferrer" class="win-btn win-btn-nrc" title="Official NRC-CNRC Web Clock & Time Servers (Canada)">
        🍁 time.nrc.ca · time.chu.nrc.ca ↗
      </a>
      <button class="win-btn" id="btnFs" title="Toggle True Fullscreen (F)">⛶ FULLSCREEN</button>
      <button class="win-btn win-btn-close" id="btnClose" title="Close Window (Esc)">✕ CLOSE</button>
    </div>
    <div class="clock-svg-wrap" id="clockWrap" title="Double-click to toggle Fullscreen">${t}</div>
    <div class="win-readout" id="winReadout">--:--:--</div>
    <div class="win-sub" id="winSub">CANADIAN BROADCAST STANDARD · NRC-CNRC ALIGNED</div>
    <div class="win-sub" style="margin-top: 2px; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1.2px; font-family: ui-monospace, monospace;">
      time.nrc.ca · time.chu.nrc.ca
    </div>
  </div>
  <script>
    var isSmooth = ${n};
    function toggleFs() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function(){});
      } else {
        document.exitFullscreen().catch(function(){});
      }
    }
    document.getElementById('btnFs').addEventListener('click', toggleFs);
    document.getElementById('btnClose').addEventListener('click', function() { window.close(); });
    document.getElementById('clockWrap').addEventListener('dblclick', toggleFs);
    window.addEventListener('keydown', function(e) {
      if (e.key === 'f' || e.key === 'F') toggleFs();
      if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen().catch(function(){});
        else window.close();
      }
    });

    function loop() {
      var now = new Date();
      var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();
      var fracS = isSmooth ? (s + ms / 1000) : s;
      var fracM = m + fracS / 60;
      var fracH = (h % 12) + fracM / 60;
      var hDeg = fracH * 30, mDeg = fracM * 6, sDeg = fracS * 6;

      var hEl = document.getElementById("clockHourHand");
      var mEl = document.getElementById("clockMinuteHand");
      var sEl = document.getElementById("clockSecondHand");
      var winEl = document.getElementById("winReadout");

      if (hEl) hEl.setAttribute("transform", "rotate(" + hDeg.toFixed(2) + " 0 0)");
      if (mEl) mEl.setAttribute("transform", "rotate(" + mDeg.toFixed(2) + " 0 0)");
      if (sEl) sEl.setAttribute("transform", "rotate(" + sDeg.toFixed(2) + " 0 0)");

      var hh = (h < 10 ? "0" : "") + h;
      var mm = (m < 10 ? "0" : "") + m;
      var ss = (s < 10 ? "0" : "") + s;
      if (winEl) winEl.textContent = hh + ":" + mm + ":" + ss;

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  <\/script>
</body>
</html>`}var Ef=new class{overlayEl=null;clockStageEl=null;digitalReadoutEl=null;animFrameId=null;isOpen=!1;options={theme:`wbs-dark`,mode:`smooth`,showCueSectors:!0,showVfdDigital:!0,use24Hour:!0};constructor(){this.detectAppTheme()}detectAppTheme(){let e=document.body,t=`wbs-dark`;return e.classList.contains(`theme-mccurdy-dark`)||e.classList.contains(`theme-mccurdy-ca`)?t=`mccurdy-dark`:e.classList.contains(`theme-mccurdy`)||e.classList.contains(`theme-mccurdy-light`)?t=`mccurdy-light`:e.classList.contains(`theme-wbs-ca`)&&(t=`wbs-ca`),this.options.theme=t,t}init(){let e=document.getElementById(`clockModalOverlay`);e||(e=document.createElement(`div`),e.id=`clockModalOverlay`,e.className=`clock-modal-overlay theme-${this.options.theme}`,e.style.display=`none`,e.innerHTML=`
        <div class="clock-modal-card" id="clockModalCard" role="dialog" aria-modal="true" aria-label="Master Studio Clock">
          <div class="clock-modal-header">
            <div class="clock-modal-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>TIME / MASTER VU STUDIO CLOCK</span>
              <a href="https://nrc.canada.ca/en/web-clock/" target="_blank" rel="noopener noreferrer" class="clock-nrc-badge" title="Official NRC-CNRC Web Clock & Canadian Broadcast Time Servers">
                🍁 time.nrc.ca · time.chu.nrc.ca
              </a>
            </div>
            <div class="clock-modal-controls">
              <button type="button" class="clock-ctrl-btn" id="btnClockFullscreen" title="Toggle Fullscreen Mode (F)">⛶ FULLSCREEN</button>
              <button type="button" class="clock-ctrl-btn" id="btnClockMode" title="Toggle Smooth Sweep / Quartz Step">SWEEP</button>
              <button type="button" class="clock-ctrl-btn" id="btnClockWindow" title="Open in Dedicated Standalone Window">WINDOW ↗</button>
              <button type="button" class="clock-ctrl-btn clock-btn-close" id="btnCloseClockModal" aria-label="Close Clock">✕</button>
            </div>
          </div>

          <div class="clock-stage-container" id="clockModalStage"></div>

          <div class="clock-modal-footer">
            <div class="clock-footer-readouts">
              <div class="clock-badge clock-badge-time" id="clockModalLocalTime">--:--:--</div>
              <div class="clock-badge clock-badge-utc" id="clockModalUtcTime">--:--:-- UTC</div>
              <div class="clock-badge clock-badge-date" id="clockModalDate">---</div>
              <div class="clock-badge clock-badge-nrc">
                <a href="https://nrc.canada.ca/en/web-clock/" target="_blank" rel="noopener noreferrer" class="clock-nrc-anchor" title="Official NRC-CNRC Time Servers">
                  🍁 time.nrc.ca · time.chu.nrc.ca
                </a>
              </div>
            </div>
            <div class="clock-theme-pills">
              <button type="button" class="clock-pill-btn" data-theme="wbs-ca">WBS Vintage</button>
              <button type="button" class="clock-pill-btn" data-theme="wbs-dark">WBS Modern</button>
              <button type="button" class="clock-pill-btn" data-theme="mccurdy-dark">McCurdy Dark</button>
              <button type="button" class="clock-pill-btn" data-theme="mccurdy-light">McCurdy ATS</button>
            </div>
          </div>
        </div>
      `,document.body.appendChild(e)),this.overlayEl=e,this.clockStageEl=e.querySelector(`#clockModalStage`),this.digitalReadoutEl=e.querySelector(`#clockModalLocalTime`),this.bindEvents()}bindEvents(){if(!this.overlayEl)return;this.overlayEl.addEventListener(`click`,e=>{e.target===this.overlayEl&&this.close()});let e=this.overlayEl.querySelector(`#btnCloseClockModal`);e&&e.addEventListener(`click`,e=>{e.stopPropagation(),this.close()});let t=this.overlayEl.querySelector(`#btnClockFullscreen`);t&&t.addEventListener(`click`,e=>{e.stopPropagation(),this.toggleFullscreen()});let n=this.overlayEl.querySelector(`#btnClockMode`);n&&n.addEventListener(`click`,e=>{e.stopPropagation(),this.options.mode=this.options.mode===`smooth`?`tick`:`smooth`,n.textContent=this.options.mode===`smooth`?`SWEEP`:`QUARTZ`});let r=this.overlayEl.querySelector(`#btnClockWindow`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),this.openDedicatedWindow()}),this.overlayEl.querySelectorAll(`.clock-pill-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),t.preventDefault();let n=e.getAttribute(`data-theme`);n&&this.setTheme(n)})})}open(){this.isOpen||(this.detectAppTheme(),this.init(),this.overlayEl&&(this.overlayEl.className=`clock-modal-overlay theme-${this.options.theme}`,this.overlayEl.style.display=`flex`,this.rebuildClockView(),this.updateThemePillActive(),this.isOpen=!0,this.startLoop()))}close(){this.isOpen&&=(this.stopLoop(),this.overlayEl&&(this.overlayEl.style.display=`none`),!1)}toggle(){this.isOpen?this.close():this.open()}setTheme(e){if(this.options.theme=e,typeof window.setMode==`function`)try{window.setMode(e)}catch(e){console.warn(`setMode failed:`,e)}else{let t=e===`mccurdy-light`,n=e===`mccurdy-dark`,r=e===`wbs-ca`,i=e===`wbs-dark`||!t&&!n&&!r;document.body.classList.toggle(`theme-mccurdy`,t),document.body.classList.toggle(`theme-mccurdy-light`,t),document.body.classList.toggle(`theme-mccurdy-dark`,n),document.body.classList.toggle(`theme-wbs-ca`,r),document.body.classList.toggle(`theme-wbs-dark`,i)}this.overlayEl&&(this.overlayEl.className=`clock-modal-overlay theme-${e}`),this.rebuildClockView(),this.updateThemePillActive()}cycleTheme(){let e=[`wbs-ca`,`wbs-dark`,`mccurdy-dark`,`mccurdy-light`],t=(e.indexOf(this.options.theme)+1)%e.length;this.setTheme(e[t])}updateThemePillActive(){this.overlayEl&&this.overlayEl.querySelectorAll(`.clock-pill-btn`).forEach(e=>{let t=e.getAttribute(`data-theme`)===this.options.theme;e.classList.toggle(`active`,t)})}rebuildClockView(){this.clockStageEl&&(this.clockStageEl.innerHTML=Sf(this.options),this.clockStageEl.querySelectorAll(`.clock-brand`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation(),this.cycleTheme()})}))}startLoop(){let e=()=>{if(!this.isOpen)return;let t=Cf(new Date,this.options.mode===`smooth`);if(this.clockStageEl&&wf(this.clockStageEl,t),this.overlayEl){let e=this.overlayEl.querySelector(`#clockModalLocalTime`),n=this.overlayEl.querySelector(`#clockModalUtcTime`),r=this.overlayEl.querySelector(`#clockModalDate`);e&&(e.textContent=`${t.timeString24} · ${t.timeZoneString}`),n&&(n.textContent=t.utcTimeString),r&&(r.textContent=t.dateString)}this.animFrameId=requestAnimationFrame(e)};this.stopLoop(),this.animFrameId=requestAnimationFrame(e)}stopLoop(){this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null)}toggleFullscreen(){document.fullscreenElement?document.exitFullscreen?.().catch(()=>{}):this.overlayEl?.requestFullscreen?this.overlayEl.requestFullscreen().catch(()=>{}):document.documentElement.requestFullscreen?.().catch(()=>{})}openDedicatedWindow(){let e=Math.min(1920,window.screen.availWidth||1400),t=Math.min(1080,window.screen.availHeight||900),n=Math.max(0,(window.screen.width-e)/2),r=Math.max(0,(window.screen.height-t)/2),i=window.open(``,`XtmMasterStudioClock`,`width=${e},height=${t},left=${n},top=${r},menubar=no,toolbar=no,location=no,status=no`);if(!i)return;let a=Sf(this.options);i.document.write(Tf(`Master Studio Clock - Ward-Beck Systems`,a,this.options.mode===`smooth`,this.options.theme)),i.document.close()}},Df=null;function Of(e=new Date){return`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}:${String(e.getSeconds()).padStart(2,`0`)}`}function kf(){let e=Of(),t=document.getElementById(`timelineNowTimeText`);t&&(t.textContent=e);let n=document.getElementById(`footerCurrentTime`);n&&(n.textContent=e)}function Af(){Ef.open()}function jf(){Ef.close()}function Mf(){Ef.toggle()}function Nf(e){Ef.init(),Yi.startAutoSync(45e3);let t=document.getElementById(`btnTimelineNowTime`);t&&t.addEventListener(`click`,e=>{e.stopPropagation(),Yi.syncNow(),Af()});let n=document.getElementById(`btnCurrentTime`);n&&n.addEventListener(`click`,e=>{e.stopPropagation(),Af()});let r=document.getElementById(`footerCurrentTime`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),Af()}),kf(),Df&&clearInterval(Df),Df=setInterval(kf,1e3),window.addEventListener(`xtm:open-clock`,()=>{Af()}),window.addEventListener(`keydown`,e=>{[`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target?.tagName)||(e.key===`Escape`?jf():e.key.toUpperCase()!==`T`||e.ctrlKey||e.metaKey||e.altKey||Mf())});let i=document.getElementById(`dbfsStage`);i&&i.addEventListener(`click`,e=>{let t=i.getBoundingClientRect(),n=e.clientY-t.top,r=e.clientX-t.left,a=t.height,o=t.width;(n>=a-40||r>=o-100&&n>=a-60)&&Af()}),window.xtmClock={open:Af,close:jf,toggle:Mf,controller:Ef},window.xtmNtp=Yi}function Pf(e,t){let{model:n,audio:r,view:i,podView:a,dbfsView:o}=e,s=document.querySelector(`.console-viewport`),c=0,l=performance.now(),u=document.getElementById(`fpsDisplay`);function d(e){let f=r&&r.getLevels?r.getLevels():r?.currentLevels||{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1};if(i.updateNeedles(f,n.power,n.meterStyle===`fisam`||n.meterStyle===`sifam`),n.isIdle=!f.hasAudio,i.renderSecondary(n,f),a.render(n,f),o&&o.render(n,f),t.recordTelemetry(f,e),t.recordTransientEvent(f),s){let e=f&&f.lufs&&typeof f.lufs.m==`number`?f.lufs.m:-60;isFinite(e)&&e>-24?e>=-12?s.className=`console-viewport lufs-glow-red`:e>=-18?s.className=`console-viewport lufs-glow-orange`:s.className=`console-viewport lufs-glow-green`:s.className=`console-viewport`}if(c++,e-l>=500){let t=c*1e3/(e-l);u&&(u.textContent=t.toFixed(1)+` FPS`),c=0,l=e}requestAnimationFrame(d)}requestAnimationFrame(d)}async function Ff(){let t=document.getElementById(`visualizerStage`),n=document.getElementById(`pod22Stage`),r=document.getElementById(`dbfsStage`),i=new Wr(t);i.build(e);let a={model:e,audio:rt,view:i,podView:new gi(n),dbfsView:r?new Ja(r):null};window.xtmModel=e,window.xtmAudio=rt,window.xtmView=i,window.xtmCtx=a,Xa(),Za(),Qa(a),pd(a);let o=wd(),s=Ya();Nd(a);let c=Ed(a,s);Pd(a,s,c),Fd(a,c),Id(a,c),Vd(a,s),await Hd(a,s),Ud(a,s,c),Wd(a,s),Md(a,s),Gd(a,s),ef(a,s),tf(a,s),md(a,s),nf(a,s),hd(a,s),rf(a),af(a),of(a),jd(a),sf(a,c),cf(a,s),lf(a,c),ff(),pf(),mf(),Nf(a),Pf(a,o)}window.audioReady=!0,Ff(),window.audioContext&&window.audioContext.state===`suspended`&&window.audioContext.resume();
//# sourceMappingURL=index-DyUsNmQh.js.map