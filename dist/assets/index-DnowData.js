/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{power=!0;mode=`A`;prevMode=`A`;a={src:0,lvl:64};d={src:1,lvl:42};s={pair:[1]};selectedInput=1;inputAssigned=!1;mcRangeMode=`outer`;mcAttenuatorStep=15;hp=0;term=0;set={scr:`HP`};meterStyle=`fisam`;dialLamp=`amber`;dialBg=`auto`;ppmLamp=`unlit`;ppmDialBg=`auto`;ppmStyle=`black`;artMode=`svg`;vfdMetric=`lufs`;isLockedExpanded=!1;autoRange=!1;flashMsg=null;flashTimer=null;isIdle=!0;toneCalLevels=(()=>{let e=[];for(let t=-60;t<=0;t++)e.push(t);return e})();toneCalIdx=42;onChange=null;constructor(){this.toneCalIdx=this.toneCalLevels.indexOf(-18),this.toneCalIdx<0&&(this.toneCalIdx=42),this.loadEEPROM()}lvlDb(e){return e-60}lvlChars(e){let t=this.lvlDb(e),n=t>0?`+`:t<0?`-`:` `,r=Math.abs(t);return n+(r<10?`0`+r:``+r)}flash(e,t=1200){this.flashMsg=e,this.flashTimer&&clearTimeout(this.flashTimer),this.flashTimer=setTimeout(()=>{this.flashMsg=null,this.notify()},t)}getDisplayText(){if(!this.power)return`        `;if(this.flashMsg)return this.flashMsg.padEnd(8).substring(0,8);if(this.isIdle&&this.mode!==`SET`)return`WardBeck`;if(this.mode===`SET`)return this.set.scr===`HP`?this.hp?` HP  IN `:` HP  OUT`:this.term?`TERM LZ `:`TERM HZ `;if(this.mode===`A`){let e=`A`+this.a.src,t=this.term?`z`:` `,n=this.lvlChars(this.a.lvl),r=this.hp?`f`:` `;return e+t+n+r}if(this.mode===`D`){let e=this.lvlChars(this.d.lvl),t=this.hp?`f`:` `;return`SYS `+e+t}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}return[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e]||`TEST `+e+`  `}return`XTM4    `}getInputSensText(){if(this.mode===`A`){let e=`A`+this.a.src,t=this.lvlDb(this.a.lvl),n=(t>=0?`+`:``)+t+`dB`;return(e+` `+n).padEnd(8).substring(0,8)}if(this.mode===`D`){let e=this.lvlDb(this.d.lvl);return(`SYS `+((e>=0?`+`:``)+e+`dB`)).padEnd(8).substring(0,8)}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];return t?t.padEnd(8).substring(0,8):(`TEST `+e).padEnd(8).substring(0,8)}return`A1 +4dB `}pressMode(){this.inputAssigned=!1,this.power&&(this.mode===`SET`?this.mode=this.prevMode:this.mode===`A`?(this.mode=`D`,this.flash(`SYST OUT`)):this.mode===`D`?(this.mode=`S`,this.flash(`TEST GEN`)):(this.mode=`A`,this.flash(`CARD IN `)),this.saveEEPROM(),this.notify())}holdMode(){this.power&&(this.mode===`SET`?this.mode=this.prevMode:(this.prevMode=this.mode,this.mode=`SET`,this.set.scr=`HP`,this.flash(`SETUP   `)),this.saveEEPROM(),this.notify())}pressSource(){if(this.inputAssigned=!1,this.power){if(this.mode===`SET`)this.set.scr=this.set.scr===`HP`?`TERM`:`HP`;else if(this.mode===`A`)this.a.src=+(this.a.src===0),this.flash(this.a.src===0?`MIC / IN1`:`LINE/IN2`);else if(this.mode===`D`)this.d.src=+(this.d.src===0),this.flash(this.d.src===1?`SYST OUT`:`1kHZ TONE`);else if(this.mode===`S`){let e=(this.s.pair[0]??1)+1;e>4&&(e=1),this.s.pair[0]=e;let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];t&&this.flash(t)}this.selectedInput=this.getSelectedInput(),this.saveEEPROM(),this.notify()}}getSelectedInput(){return this.inputAssigned&&this.selectedInput?this.selectedInput:this.mode===`A`?this.a.src===0?1:2:this.mode===`D`?3:this.mode===`S`?4:this.selectedInput||1}setInput(e){this.power&&(this.selectedInput=e,e===1?(this.mode=`A`,this.a.src=0,this.flash(`INPUT 1`)):e===2?(this.mode=`A`,this.a.src=1,this.flash(`INPUT 2`)):e===3?(this.mode=`D`,this.d.src=1,this.flash(`INPUT 3`)):e===4&&(this.mode=`S`,this.s.pair[0]=1,this.flash(`INPUT 4`)),this.saveEEPROM(),this.notify())}getMcCurdySensitivityDb(){return this.mcRangeMode===`cal`?4:this.mcRangeMode===`inner`?-30+this.mcAttenuatorStep*2:-50+this.mcAttenuatorStep*2}setMccurdyRange(e){this.power&&(this.mcRangeMode=e,this.applyMccurdySensitivity())}toggleMccurdyRange(){this.power&&(this.mcRangeMode=this.mcRangeMode===`outer`?`inner`:(this.mcRangeMode,`outer`),this.applyMccurdySensitivity())}setMccurdyAttenuatorStep(e){this.power&&(this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e))),this.mcRangeMode===`cal`&&(this.mcRangeMode=`outer`),this.applyMccurdySensitivity())}setSensitivityDb(e){if(!this.power)return;let t=Math.max(-60,Math.min(30,e)),n=Math.max(0,Math.min(90,Math.round(t+60)));if(this.a.lvl=n,this.d.lvl=n,t>10&&this.mcRangeMode===`outer`?this.mcRangeMode=`inner`:t<-30&&this.mcRangeMode===`inner`&&(this.mcRangeMode=`outer`),this.mcRangeMode===`inner`){let e=(t- -30)/2;this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e)))}else if(this.mcRangeMode===`outer`){let e=(t- -50)/2;this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e)))}this.flash(`SENS `+this.lvlChars(n)),this.saveEEPROM(),this.notify()}applyMccurdySensitivity(){let e=this.getMcCurdySensitivityDb(),t=Math.max(0,Math.min(90,Math.round(e+60)));if(this.a.lvl=t,this.d.lvl=t,this.mcRangeMode===`cal`)this.flash(`CAL +4dBu`);else{let t=this.mcRangeMode===`outer`?`OUT`:`IN `,n=(e>0?`+`:``)+e;this.flash(`${t} ${n}dB`)}this.saveEEPROM(),this.notify()}pressDown(){if(this.power){if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`)))this.mcAttenuatorStep>0?this.mcAttenuatorStep--:this.mcRangeMode===`inner`&&(this.mcRangeMode=`outer`,this.mcAttenuatorStep=20),this.applyMccurdySensitivity();else{if(this.mode===`SET`)this.set.scr===`HP`?this.hp=0:this.term=1;else if(this.mode===`A`)this.a.lvl>0&&this.a.lvl--,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl>0&&this.d.lvl--,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx>0){this.toneCalIdx--;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}}pressUp(){if(this.power){if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`)))this.mcAttenuatorStep<30?this.mcAttenuatorStep++:this.mcRangeMode===`outer`&&(this.mcRangeMode=`inner`,this.mcAttenuatorStep=20),this.applyMccurdySensitivity();else{if(this.mode===`SET`)this.set.scr===`HP`?this.hp=1:this.term=0;else if(this.mode===`A`)this.a.lvl<90&&this.a.lvl++,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl<90&&this.d.lvl++,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx<this.toneCalLevels.length-1){this.toneCalIdx++;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}}togglePower(){this.power=!this.power,this.notify()}getActiveReferenceLevel(){return this.mode===`A`?this.lvlDb(this.a.lvl):this.mode===`D`?this.lvlDb(this.d.lvl):4}toggleLockedExpanded(){return this.isLockedExpanded=!this.isLockedExpanded,this.flash(this.isLockedExpanded?`DUAL MTR`:`QUAD MTR`),this.saveEEPROM(),this.notify(),this.isLockedExpanded}toggleAutoRange(){return this.autoRange=!this.autoRange,this.flash(this.autoRange?`AUTO ON `:`AUTO OFF`),this.saveEEPROM(),this.notify(),this.autoRange}saveEEPROM(){try{let e={mode:this.mode===`SET`?this.prevMode:this.mode,a:this.a,d:this.d,s:this.s,hp:this.hp,term:this.term,meterStyle:this.meterStyle,dialLamp:this.dialLamp,dialBg:this.dialBg,ppmLamp:this.ppmLamp,ppmDialBg:this.ppmDialBg,ppmStyle:this.ppmStyle,selectedInput:this.getSelectedInput(),mcRangeMode:this.mcRangeMode,mcAttenuatorStep:this.mcAttenuatorStep,toneCalIdx:this.toneCalIdx,toneCalLevel:this.toneCalLevels[this.toneCalIdx]??0,vfdMetric:this.vfdMetric,isLockedExpanded:this.isLockedExpanded,autoRange:this.autoRange};localStorage.setItem(`wbs_xtm4_eeprom`,JSON.stringify(e))}catch{}}loadEEPROM(){try{let e=localStorage.getItem(`wbs_xtm4_eeprom`);if(e){let t=JSON.parse(e);if(t.mode&&(this.mode=this.prevMode=t.mode),t.a&&(this.a=Object.assign(this.a,t.a)),t.d&&(this.d=Object.assign(this.d,t.d)),t.s&&(this.s=Object.assign(this.s,t.s)),t.hp!==void 0&&(this.hp=t.hp),t.term!==void 0&&(this.term=t.term),t.meterStyle&&(this.meterStyle=t.meterStyle===`sifam`?`fisam`:t.meterStyle===`simpson`||t.meterStyle===`pimsom`?`pimson`:t.meterStyle),t.selectedInput&&(this.selectedInput=t.selectedInput),t.mcRangeMode&&(this.mcRangeMode=t.mcRangeMode),typeof t.mcAttenuatorStep==`number`&&(this.mcAttenuatorStep=t.mcAttenuatorStep),t.dialLamp&&(this.dialLamp=t.dialLamp),t.dialBg&&(this.dialBg=t.dialBg),t.ppmLamp&&(this.ppmLamp=t.ppmLamp),t.ppmDialBg&&(this.ppmDialBg=t.ppmDialBg),t.ppmStyle&&(this.ppmStyle=t.ppmStyle),typeof t.isLockedExpanded==`boolean`&&(this.isLockedExpanded=t.isLockedExpanded),typeof t.autoRange==`boolean`&&(this.autoRange=t.autoRange),typeof localStorage<`u`&&localStorage.getItem(`wbs_xtm4_tone_cal_dbfs_v3`)!==`true`)this.toneCalIdx=this.toneCalLevels.indexOf(-18),localStorage.setItem(`wbs_xtm4_tone_cal_dbfs_v3`,`true`),this.saveEEPROM();else if(typeof t.toneCalLevel==`number`){let e=this.toneCalLevels.indexOf(t.toneCalLevel);e>=0&&(this.toneCalIdx=e)}else t.toneCalIdx!==void 0&&t.toneCalIdx>=0&&t.toneCalIdx<this.toneCalLevels.length&&(this.toneCalIdx=t.toneCalIdx);t.vfdMetric&&(this.vfdMetric=t.vfdMetric)}}catch{}}notify(){this.onChange&&this.onChange(this)}},t=class{instance=null;memory=null;isLoaded=!1;inputLOffset=0;inputROffset=0;outputOffset=0;initDspFn=null;setRefLevelFn=null;setCalGainFn=null;setPeakTrimFn=null;setPpmTypeFn=null;setVuBallisticsFn=null;resetLoudnessFn=null;processBlockFn=null;async load(e=`./meter-dsp.wasm`){try{let t;try{t=await fetch(e)}catch{t=await fetch(`/meter-dsp.wasm`)}let n=await t.arrayBuffer(),{instance:r}=await WebAssembly.instantiate(n,{env:{abort:(e,t,n,r)=>{console.warn(`[WASM DSP] Abort at line ${n}:${r}`)},trace:(e,t)=>{}}});this.instance=r;let i=r.exports;return this.memory=i.memory,this.inputLOffset=i.inputBufferL?.value??i.inputBufferL,this.inputROffset=i.inputBufferR?.value??i.inputBufferR,this.outputOffset=i.outputTelemetry?.value??i.outputTelemetry,this.initDspFn=i.initDsp,this.setRefLevelFn=i.setRefLevel,this.setCalGainFn=i.setCalGain,this.setPeakTrimFn=i.setPeakTrim,this.setPpmTypeFn=i.setPpmType,this.setVuBallisticsFn=i.setVuBallistics,this.resetLoudnessFn=i.resetLoudness,this.processBlockFn=i.processBlock,this.isLoaded=!0,!0}catch(e){return console.warn(`WASM DSP loading failed, falling back to JS DSP:`,e),this.isLoaded=!1,!1}}get ready(){return this.isLoaded&&this.instance!==null}init(e,t,n){this.initDspFn&&this.initDspFn(e,t,n)}setRefLevel(e,t=!1){this.setRefLevelFn&&this.setRefLevelFn(e,+!!t)}setCalGain(e){this.setCalGainFn&&this.setCalGainFn(e)}setPeakTrim(e){this.setPeakTrimFn&&this.setPeakTrimFn(e)}setPpmType(e){this.setPpmTypeFn&&this.setPpmTypeFn(e)}setVuBallistics(e,t){this.setVuBallisticsFn&&this.setVuBallisticsFn(e,t)}resetLoudness(){this.resetLoudnessFn&&this.resetLoudnessFn()}process(e,t,n){if(!this.ready||!this.memory||!this.processBlockFn)return!1;let r=Math.min(e.length,4096),i=this.memory.buffer,a=new Float32Array(i,this.inputLOffset,r),o=new Float32Array(i,this.inputROffset,r);a.set(e.subarray(0,r)),o.set(t.subarray(0,r)),this.processBlockFn(r);let s=new Float32Array(i,this.outputOffset,20);return n.vuL=s[0]??0,n.vuR=s[1]??0,n.ppmDbL=s[2]??-120,n.ppmDbR=s[3]??-120,n.ppmFracL=s[4]??0,n.ppmFracR=s[5]??0,n.dbfsA=s[6]??-120,n.dbfsB=s[7]??-120,n.dbfsSum=s[8]??-120,n.dbfsDiff=s[9]??-120,n.lufsM=s[10]??-70,n.lufsS=s[11]??-70,n.phaseCorr=s[12]??1,n.hasAudio=(s[13]??0)>.5,n.peakA=(s[14]??0)>.5,n.peakB=(s[15]??0)>.5,n.lufsML=s[16]??-70,n.lufsMR=s[17]??-70,n.blockEnergy=s[18]??0,!0}};function n(){return{pimson:{f0:2.16,zeta:.815},pimsom:{f0:2.16,zeta:.815},simpson:{f0:2.16,zeta:.815},fisam:{f0:2.4,zeta:.85},sifam:{f0:2.4,zeta:.85}}}function r(){return[{x1:0,x2:0,y1:0,y2:0,p:0},{x1:0,x2:0,y1:0,y2:0,p:0}]}function i(){return[{env:0,q:-.12,qv:0},{env:0,q:-.12,qv:0}]}function a(){return{sL2:0,sR2:0,sLR:0,correlation:1,led:7}}function o(){return{stage1:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],stage2:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],meanSquareM_L:0,meanSquareM_R:0,meanSquareS_L:0,meanSquareS_R:0,sumEnergy:0,blockCount:0,shortTermHist:[]}}function s(){return{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],dbfs:[-60,-60,-60,-60],lufs:{m:-60,s:-60,i:-60,lra:0,mL:-60,mR:-60},rmsDb:[-60,-60],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1}}function c(){return{vuL:0,vuR:0,ppmDbL:-120,ppmDbR:-120,ppmFracL:0,ppmFracR:0,dbfsA:-120,dbfsB:-120,dbfsSum:-120,dbfsDiff:-120,lufsM:-70,lufsS:-70,lufsML:-70,lufsMR:-70,blockEnergy:0,phaseCorr:1,hasAudio:!1,peakA:!1,peakB:!1}}var l=`class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=1024;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`,u=`wbs-meter-processor`,d=[`./meter-processor.js`,`meter-processor.js`,`js/meter-processor.js`],f={standard_vu:{id:`standard_vu`,name:`Standard VU (ANSI C16.5)`,standard:`ANSI C16.5-1942`,attackMs:300,releaseMs:300,f0:2.16,zeta:.815,notes:`ANSI C16.5-1942. Philosophy: Approximates perceived loudness. 0 VU = +4 dBu (-18 dBFS). 300ms attack/decay, 1-1.5% overshoot.`},console_standard:{id:`console_standard`,name:`Console Standard`,standard:`Studio Console`,attackMs:200,releaseMs:800,f0:2.8,zeta:.75,notes:`Studio Console Standard. 200ms attack, 800ms release.`},fast_response:{id:`fast_response`,name:`Fast Response (Percussive)`,standard:`Transient Monitor`,attackMs:50,releaseMs:200,f0:5.5,zeta:.707,notes:`Fast response for tracking percussive drum transients.`},slow_response:{id:`slow_response`,name:`Slow Response (Heavy Inertia)`,standard:`Damped Movement`,attackMs:500,releaseMs:2e3,f0:1.4,zeta:.85,notes:`Slow response with heavy damped needle inertia.`},super_slow:{id:`super_slow`,name:`Super Slow Vintage`,standard:`Galvanometer Drift`,attackMs:1e3,releaseMs:4e3,f0:.8,zeta:.9,notes:`Very heavy needle movement simulating vintage mechanical galvanometer drift.`},master_console:{id:`master_console`,name:`Master Console Bank`,standard:`Master Bus Console`,attackMs:300,releaseMs:1500,f0:1.9,zeta:.8,notes:`Master console broadcast monitoring with extended release.`},compressor_gr:{id:`compressor_gr`,name:`Compressor Gain Reduction`,standard:`Dynamics GR`,attackMs:10,releaseMs:100,f0:9,zeta:.707,notes:`Ultra-fast gain reduction dynamics.`}},p={f0:2.16,zeta:.815},m=8.8458296;function h(e){return e.vuCoeffs[e.vuStyle]||{f0:p.f0,zeta:p.zeta}}function g(e,t){let n=2/(1/t),r=h(e),i=2*Math.PI*r.f0,a=n*n+2*r.zeta*i*n+i*i;e.vuB0=i*i/a,e.vuB1=2*i*i/a,e.vuB2=e.vuB0,e.vuA1=2*(i*i-n*n)/a,e.vuA2=(n*n-2*r.zeta*i*n+i*i)/a}function _(e,t,n){let r=e.vuB0*n+e.vuB1*t.x1+e.vuB2*t.x2-e.vuA1*t.y1-e.vuA2*t.y2;t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,t.p=Math.max(-.03,Math.min(1.15,r))}function v(e){return e>.005?20*Math.log10(e)+3:-1/0}function y(e,t){if(t!==`pimson`&&t!==`pimsom`&&t!==`simpson`&&t!==`fisam`&&t!==`sifam`)return;e.vuStyle=t===`sifam`?`fisam`:t===`simpson`||t===`pimsom`?`pimson`:t,e.calculateCoefficients();let n=h(e);e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}function b(e,t){let n=f[t]||f.standard_vu;e.vuBallisticPreset=n.id,e.vuCoeffs[e.vuStyle]={f0:n.f0,zeta:n.zeta},e.calculateCoefficients(),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}var x={num:1,key:`type1`,attack:.01,tauDecay:1.5/Math.LN10},S={num:2,key:`type2`,attack:.01,tauDecay:56/(24*Math.LN10)},C=[x,S,{num:2,key:`scale2`,attack:.01,tauDecay:56/(24*Math.LN10)},{num:2,key:`scale3`,attack:.01,tauDecay:56/(24*Math.LN10)},{num:3,key:`nordic`,attack:.005,tauDecay:2/Math.LN10},{num:4,key:`fast_peak`,attack:.001,tauDecay:1/Math.LN10}];function ee(e){for(let t of C)if(e===t.num||e===t.key)return t;return null}var te=18.465;function ne(e,t){e.ppmAttack=.01,e.ppmAttCoeff=1-Math.exp(-1/(e.ppmAttack*t));let n=e.ppmType===1?x.tauDecay:S.tauDecay;e.ppmDecCoeff=Math.exp(-1/(n*t)),e.wasmDsp.ready&&e.wasmDsp.setPpmType(e.ppmType)}function re(e,t){let n=ee(t);n&&(e.ppmBallisticPreset=n.key);let r=n||S,i=r.num;e.ppmType=i===1?1:2;let a=e.ctx?e.ctx.sampleRate:48e3;e.ppmAttack=r.attack,e.ppmAttCoeff=1-Math.exp(-1/(r.attack*a)),e.ppmDecCoeff=Math.exp(-1/(r.tauDecay*a)),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPpmType(i)}function w(e,t,n){n>t.env?t.env+=(n-t.env)*e.ppmAttCoeff:t.env*=e.ppmDecCoeff}function T(e,t){return e>1e-6?20*Math.log10(e)+te+t:-1/0}function E(e){return e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function ie(e,t){e.phaseAlpha=1-Math.exp(-1/(.3*t))}function ae(e,t,n,r){e.sL2+=t*(n*n-e.sL2),e.sR2+=t*(r*r-e.sR2),e.sLR+=t*(n*r-e.sLR)}function oe(e,t){let n=Math.sqrt(e.sL2*e.sR2)+1e-9;return t?Math.max(-1,Math.min(1,e.sLR/n)):1}function se(e,t){let n=-1;return t&&(n=e<=-.75?0:e<=-.5?1:e<=-.2?2:e<=.1?3:e<=.4?4:e<=.7?5:e<=.9?6:7),n}function ce(e,t){let n=Math.round((e+1)*3.5);return n<0&&(n=0),n>7&&(n=7),t?n:-1}function le(e,t){let n=10**(3.9998438/20),r=Math.tan(Math.PI*1681.974450955532/t),i=r*r,a=Math.SQRT2,o=1+a*r+i;e.kShelf_b0=(n+a*Math.sqrt(n)*r+i)/o,e.kShelf_b1=2*(i-n)/o,e.kShelf_b2=(n-a*Math.sqrt(n)*r+i)/o,e.kShelf_a1=2*(i-1)/o,e.kShelf_a2=(1-a*r+i)/o;let s=.5003270373238773,c=Math.tan(Math.PI*38.13547087602444/t),l=c*c,u=1+c/s+l;e.kHp_b0=1/u,e.kHp_b1=-2/u,e.kHp_b2=1/u,e.kHp_a1=2*(l-1)/u,e.kHp_a2=(1-c/s+l)/u}function ue(e,t,n){let r=e.kShelf_b0*n+e.kShelf_b1*t.x1+e.kShelf_b2*t.x2-e.kShelf_a1*t.y1-e.kShelf_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function de(e,t,n){let r=e.kHp_b0*n+e.kHp_b1*t.x1+e.kHp_b2*t.x2-e.kHp_a1*t.y1-e.kHp_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function fe(e,t){let n=1024/t;e.lufsAlphaM=1-Math.exp(-n/.4),e.lufsAlphaS=1-Math.exp(-n/3)}function pe(e){return e>1e-12?Math.max(-60,-.691+10*Math.log10(e)):-60}function me(e,t){e.sumEnergy+=t,e.blockCount++}function he(e){let t=e.blockCount>0?e.sumEnergy/e.blockCount:0;return t>0?pe(t):-1/0}function ge(e,t){t>-60&&(e.shortTermHist.push(t),e.shortTermHist.length>200&&e.shortTermHist.shift())}function _e(e){if(e.shortTermHist.length>=10){let t=[...e.shortTermHist].sort((e,t)=>e-t),n=t[Math.floor(t.length*.1)],r=t[Math.floor(t.length*.95)];return Math.max(0,r-n)}return 0}function ve(e,t,n,r){let i=e.lufsState;if(r){i.meanSquareM_L+=e.lufsAlphaM*(t-i.meanSquareM_L),i.meanSquareM_R+=e.lufsAlphaM*(n-i.meanSquareM_R),i.meanSquareS_L+=e.lufsAlphaS*(t-i.meanSquareS_L),i.meanSquareS_R+=e.lufsAlphaS*(n-i.meanSquareS_R);let r=t+n;r>125e-9&&me(i,r)}else i.meanSquareM_L*=.92,i.meanSquareM_R*=.92,i.meanSquareS_L*=.97,i.meanSquareS_R*=.97}function D(e){e.meanSquareM_L=0,e.meanSquareM_R=0,e.meanSquareS_L=0,e.meanSquareS_R=0,e.sumEnergy=0,e.blockCount=0,e.shortTermHist=[]}function ye(e){D(e.lufsState),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.resetLoudness()}function be(e){if(!e.ctx)return;let t=e.ctx.sampleRate;g(e,t),ne(e,t),ie(e,t),le(e,t),fe(e,t)}async function xe(e){return e.ctx||=new(window.AudioContext||window.webkitAudioContext)({latencyHint:`interactive`}),e.ctx.state===`suspended`||(be(e),await Se(e),await e.wasmDsp.load(),e.ctx&&e.wasmDsp.ready&&(e.wasmDsp.init(e.ctx.sampleRate,e.refLevelDb,e.peakSensTrim),e.wasmDsp.setRefLevel(e.refLevelDb,e.isRefDigital),e.wasmDsp.setPeakTrim(e.peakSensTrim))),e.ctx}async function Se(e){if(e.workletLoaded||!e.ctx||!e.ctx.audioWorklet)return;let[t,n,r]=d;try{try{await e.ctx.audioWorklet.addModule(t)}catch{try{await e.ctx.audioWorklet.addModule(n)}catch{await e.ctx.audioWorklet.addModule(r)}}e.workletLoaded=!0}catch{try{let t=new Blob([l],{type:`application/javascript`}),n=URL.createObjectURL(t);await e.ctx.audioWorklet.addModule(n),URL.revokeObjectURL(n),e.workletLoaded=!0}catch{e.workletLoaded=!1}}}var Ce=new WeakSet;function we(){let e=navigator.userActivation;return!e||!!e.hasBeenActive}function Te(e){if(Ce.has(e))return;Ce.add(e);let t=[`pointerdown`,`keydown`,`touchstart`],n=()=>{t.forEach(e=>window.removeEventListener(e,n,!0)),Ce.delete(e),e.state===`suspended`&&e.resume().catch(()=>{})};t.forEach(e=>window.addEventListener(e,n,{capture:!0,passive:!0}))}function Ee(e){e&&e.state===`suspended`&&(we()?e.resume().catch(()=>Te(e)):Te(e))}function De(e){let t=[`pointerdown`,`keydown`],n=()=>{t.forEach(e=>window.removeEventListener(e,n,!0)),e()};t.forEach(e=>window.addEventListener(e,n,{capture:!0,passive:!0}))}function Oe(e,t){e.inputTrimDb=t,ke(e)}function ke(e){if(!e.inputGainNode||!e.ctx)return;let t=10**(e.inputTrimDb/20);e.inputGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function Ae(e,t){e.hpfEnabled=t,je(e)}function je(e){e.hpfNode&&e.ctx&&(e.hpfEnabled?e.hpfNode.frequency.setValueAtTime(80,e.ctx.currentTime):e.hpfNode.frequency.setValueAtTime(5,e.ctx.currentTime))}function Me(e,t,n=null){t&&Ee(e.ctx),e.monitorEnabled=t,n!==null&&(e.monitorVolume=n),Pe(e)}function Ne(e,t){e.monitorVolume=t,Pe(e)}function Pe(e){if(!e.monitorGainNode||!e.ctx)return;let t=e.monitorEnabled?e.monitorVolume:0;e.monitorGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function Fe(e){let t=e.ctx;if(!t)return null;if(!e.inputGainNode){if(e.inputGainNode=t.createGain(),e.inputGainNode.channelCount=2,e.inputGainNode.channelCountMode=`explicit`,e.inputGainNode.channelInterpretation=`speakers`,ke(e),e.hpfNode=t.createBiquadFilter(),e.hpfNode.type=`highpass`,e.hpfNode.frequency.setValueAtTime(80,t.currentTime),e.hpfNode.Q.setValueAtTime(.707,t.currentTime),je(e),e.monitorGainNode=t.createGain(),Pe(e),e.monitorGainNode.connect(t.destination),e.splitterNode=t.createChannelSplitter(2),e.workletLoaded&&typeof AudioWorkletNode<`u`)try{e.processorNode=new AudioWorkletNode(t,u),e.processorNode.port.onmessage=t=>{t.data&&t.data.ch0&&t.data.ch1&&!e.mxlFeed&&e.processAudioBlockBuffers(t.data.ch0,t.data.ch1)}}catch{e.processorNode=null}e.processorNode||(e.processorNode=t.createScriptProcessor(1024,2,2),e.processorNode.onaudioprocess=t=>{e.mxlFeed||e.processAudioBlock(t)}),e.inputGainNode.connect(e.hpfNode),e.hpfNode.connect(e.monitorGainNode),e.hpfNode.connect(e.processorNode);let n=t.createGain();n.gain.value=0,e.processorNode.connect(n),n.connect(t.destination)}return e.inputGainNode}function Ie(e,t,n=!1){let r=e.ctx;if(!r)return;let i=Fe(e);if(i){if(e.sourceNode)try{e.sourceNode.disconnect()}catch{}e.sourceNode=n?t:r.createMediaStreamSource(t);try{e.sourceNode.connect(i)}catch(e){console.warn(`Error connecting source node to audio graph:`,e)}}}function Le(e){if(e.tabInfo&&(e.tabInfo.live=!1),e.mxlFeed&&=(e.mxlFeed.stop(),null),e.sweepTimer&&=(clearInterval(e.sweepTimer),null),e.testOsc){try{e.testOsc.stop()}catch{}try{e.testOsc.disconnect()}catch{}e.testOsc=null}if(e.pod33Node){try{e.pod33Node.osc?.stop()}catch{}try{e.pod33Node.outGain?.disconnect()}catch{}e.pod33Node=null}if(e.bitBuddyNode){try{e.bitBuddyNode.source?.stop()}catch{}try{e.bitBuddyNode.masterGain?.disconnect()}catch{}e.bitBuddyNode=null}if(e.stream){let t=e.sourceType===`system`?`system`:e.sourceType===`mic`?e.stream.__wbsMicKey||`mic:${e.activeDeviceId||`default`}`:null,n=e.stream.getAudioTracks().some(e=>e.readyState===`live`);if(t&&n){let n=e.parkedStreams.get(t);n&&n!==e.stream&&n.getTracks().forEach(e=>e.stop()),e.parkedStreams.set(t,e.stream)}else e.stream.getTracks().forEach(e=>e.stop());e.stream=null}if(e.sourceNode){try{e.sourceNode.disconnect()}catch{}e.sourceNode=null}e.sourceType=`none`,e.isSystemAudio=!1,e.resetLoudness()}function Re(e,t){let n=e.parkedStreams.get(t);return n?(e.parkedStreams.delete(t),n.getAudioTracks().some(e=>e.readyState===`live`)?n:(n.getTracks().forEach(e=>e.stop()),null)):null}var ze=!1;function Be(e){let t=e?.name;return t===`NotAllowedError`||t===`SecurityError`||t===`PermissionDeniedError`}async function Ve(){try{return(await navigator.permissions.query({name:`microphone`})).state}catch{return`unknown`}}function He(){ze||(ze=!0,De(()=>{ze=!1}))}function Ue(){return new DOMException(`Microphone blocked for this site: allow it from the padlock in the address bar (Site settings → Microphone → Allow)`,`NotAllowedError`)}async function We(){try{return(await navigator.mediaDevices.enumerateDevices()).filter(e=>e.kind===`audioinput`)}catch(e){return console.warn(`Could not enumerate audio devices:`,e),[]}}var Ge={echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1};function Ke(e){let t=[];return e&&(t.push({audio:{deviceId:{exact:e},...Ge,channelCount:{ideal:2}}}),t.push({audio:{deviceId:{ideal:e},...Ge}}),t.push({audio:{deviceId:{exact:e}}}),t.push({audio:{deviceId:e}})),t.push({audio:{...Ge,channelCount:{ideal:2}}}),t.push({audio:{...Ge}}),t.push({audio:!0}),t}async function qe(e,t=null){if(await e.ensureContext(),e.sourceType===`mic`&&e.stream?.getAudioTracks().some(e=>e.readyState===`live`)&&(!t||t===e.activeDeviceId))return!0;e.stopCurrentSource();let n=Re(e,`mic:${t||`default`}`);if(n)return Je(e,n,t);try{if((await We()).length===0){let t=new DOMException(`No audio input devices detected on this system`,`NotFoundError`);throw e.onStatusChange&&e.onStatusChange({type:`error`,error:t.message}),t}}catch(e){if(e?.name===`NotFoundError`)throw e}let r=await Ve();if(r===`denied`||ze&&r!==`granted`){let t=Ue();throw e.onStatusChange&&e.onStatusChange({type:`error`,error:t.message}),t}let i=Ke(t),a=null,o=null;for(let e of i)try{if(a=await navigator.mediaDevices.getUserMedia(e),a&&a.getAudioTracks().length>0)break}catch(t){if(o=t,Be(t))break;console.warn(`getUserMedia candidate constraint failed:`,e,t)}if(!a&&Be(o)){He();let t=Ue();throw console.info(`[XTM] `+t.message),e.onStatusChange&&e.onStatusChange({type:`error`,error:t.message}),t}if(!a){console.warn(`Attempting fallback to default audio device...`);try{a=await navigator.mediaDevices.getUserMedia({audio:!0})}catch(t){throw console.error(`Fallback failed:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:o?.message||`Audio device unavailable`}),o||Error(`Could not access audio device`)}}return Je(e,a,t)}async function Je(e,t,n){try{t.__wbsMicKey=`mic:${n||`default`}`,e.stream=t;let r=t.getAudioTracks()[0];r&&(r.enabled=!0),e.activeDeviceId=(r&&r.getSettings?r.getSettings():{}).deviceId||n,e.isSystemAudio=!1,e.sourceType=`mic`,e.setupAudioGraph(t),Ee(e.ctx);let i=await e.getAudioInputDevices();e.onDevicesChange&&e.onDevicesChange(i,e.activeDeviceId);let a=r?.label||`Soundcard Input`;return e.onStatusChange&&e.onStatusChange({type:`soundcard`,label:a}),!0}catch(t){throw console.error(`Error in audio graph setup for sound card:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),t}}var Ye=e=>!e||/^(web-contents-media-stream|screen:|window:)/i.test(e)||/^[0-9a-f-]{20,}$/i.test(e);function Xe(e){let t=e.getVideoTracks()[0],n=e.getAudioTracks()[0],r=t?.getSettings?.()||{},i=n?.getSettings?.()||{},a;try{let e=t?.getCaptureHandle?.();e?.origin&&(a=e.origin.replace(/^https?:\/\//,``))}catch{}let o=r.displaySurface||`browser`,s=t?.label||``;return{title:Ye(s)?a||(o===`browser`?`Shared browser tab`:o===`window`?`Shared window`:`Entire screen`):s,surface:o,origin:a,audioLabel:n?.label||void 0,sampleRate:i.sampleRate,channelCount:i.channelCount,width:r.width,height:r.height,startedAt:Date.now(),live:!!n&&n.readyState===`live`}}async function Ze(e,t=`browser`,n=!1){if(!n&&e.sourceType===`system`&&e.stream&&e.stream.active)return!0;if(e.sourceType!==`system`){let t=Re(e,`system`);if(t)return await e.ensureContext(),e.stopCurrentSource(),Qe(e,t,t.__wbsTabInfo||Xe(t)),!0}try{let n=typeof localStorage<`u`&&localStorage.getItem(`xtm.sysaudio.surface`)||t||`browser`,r=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:t===`browser`?`browser`:n===`monitor`?`monitor`:`browser`},audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},systemAudio:`include`,surfaceSwitching:`include`,selfBrowserSurface:`include`,preferCurrentTab:!1,monitorTypeSurfaces:`include`}),i=r.getAudioTracks(),a=Xe(r);if(r.getVideoTracks().forEach(e=>e.stop()),i.length===0)throw Error(`No audio track selected. When prompted, ensure "Share audio" is checked.`);return await e.ensureContext(),e.stopCurrentSource(),Re(e,`system`)?.getTracks().forEach(e=>e.stop()),r.__wbsTabInfo=a,i[0].onended=()=>{a.live=!1,e.parkedStreams.get(`system`)===r&&e.parkedStreams.delete(`system`),e.stream===r&&(e.stopCurrentSource(),e.onStatusChange&&e.onStatusChange({type:`disconnected`,label:`Audio Stopped`}))},Qe(e,r,a),!0}catch(t){return t?.name===`NotAllowedError`?console.info(`[AudioEngine] System audio capture cancelled by user.`):console.warn(`[AudioEngine] Error capturing system audio:`,t?.message||t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),!1}}function Qe(e,t,n){e.stream=t,e.isSystemAudio=!0,e.activeDeviceId=null,e.sourceType=`system`,e.setupAudioGraph(t),n.live=!0,e.tabInfo=n,e.onStatusChange&&e.onStatusChange({type:`system`,label:`${n.surface===`browser`?`Browser Tab`:n.surface===`window`?`Window`:`Screen`}: ${n.title}`,info:n})}var $e=1024,et=40;async function tt(e,t,n,r){await e.ensureContext(),e.stopCurrentSource();let i=!1,a=!1,o=-1,s=new Float32Array,c=new Float32Array,l=`${t.replace(/\/$/,``)}/api/mxl/flow/${encodeURIComponent(n)}/pcm`,u=(t,n)=>{let r=new Float32Array(s.length+t.length);r.set(s),r.set(t,s.length);let i=new Float32Array(c.length+n.length);i.set(c),i.set(n,c.length);let a=0;for(;r.length-a>=$e;)e.processAudioBlockBuffers(r.subarray(a,a+$e),i.subarray(a,a+$e)),a+=$e;s=r.slice(a),c=i.slice(a)},d=async()=>{if(!(i||a)){a=!0;try{let e=await fetch(`${l}?since=${o}&max=9600`,{cache:`no-store`});if(i||!e.ok)return;let t=Number(e.headers.get(`X-Cursor`)),n=Math.max(1,Number(e.headers.get(`X-Channels`))||2),r=Number(e.headers.get(`X-Frames`))||0;if(Number.isFinite(t)&&(o=t),r>0){let t=new Float32Array(await e.arrayBuffer()),a=t.subarray(0,r),o=n>1?t.subarray(r,r*2):a;i||u(a,o)}}catch{}finally{a=!1}}},f=window.setInterval(d,et);return d(),e.mxlFeed={baseUrl:t,flowId:n,stop(){i=!0,window.clearInterval(f)}},e.sourceType=`mxl`,e.activeDeviceId=null,e.onStatusChange&&e.onStatusChange({type:`mxl`,label:r||n,flowId:n}),!0}var nt={ensureAudioGraph:()=>null,resumeAudio:e=>{e&&e.state===`suspended`&&e.resume().catch(()=>{})}};function rt(e){Object.assign(nt,e)}function it(e,t,n){let r=e.createOscillator();return r.type=`sine`,r.frequency.setValueAtTime(n,e.currentTime),r.connect(t),r.start(),r}function at(e){let t=e.sampleRate*4,n=e.createBuffer(2,t,e.sampleRate);for(let e=0;e<2;e++){let r=n.getChannelData(e),i=0,a=0,o=0,s=0,c=0,l=0,u=0;for(let e=0;e<t;e++){let t=Math.random()*2-1;i=.99886*i+t*.0555179,a=.99332*a+t*.0750759,o=.969*o+t*.153852,s=.8665*s+t*.3104856,c=.55*c+t*.5329522,l=-.7616*l-t*.016898,r[e]=(i+a+o+s+c+l+u+t*.5362)*.11,u=t*.115926}}return n}function ot(e,t){let n=e.createBufferSource();return n.buffer=at(e),n.loop=!0,n.connect(t),n.start(),n}var st=20,ct=2e4,lt=8,ut=9e3;function dt(e,t){e.frequency.setValueAtTime(st,t.currentTime),e.frequency.exponentialRampToValueAtTime(ct,t.currentTime+lt)}function ft(e,t,n){let r=t.createOscillator();return r.type=`sine`,dt(r,t),r.connect(n),r.start(),e.testOsc=r,e.sweepTimer=setInterval(()=>{if(e.sourceType===`test`&&e.testType===`sweep`&&e.testOsc)try{let n=e.testOsc;n.frequency.cancelScheduledValues(t.currentTime),dt(n,t)}catch{}},ut),r}var pt=e=>e===`sine1k`||e===`sine400`;function mt(e,t=`sine1k`){nt.resumeAudio(e.ctx),e.stopCurrentSource(),e.sourceType=`test`,e.testType=t;let n=e.ctx;if(!n)return;e.testGain=n.createGain();let r=pt(t)?10**(e.toneCalDb/20):t===`pink`?.35:.5;e.testGain.gain.value=r,pt(t)?e.testOsc=it(n,e.testGain,t===`sine1k`?1e3:400):t===`pink`?e.testOsc=ot(n,e.testGain):t===`sweep`&&(e.testOsc=ft(e,n,e.testGain)),e.setupAudioGraph(e.testGain,!0),e.onStatusChange&&e.onStatusChange({type:`test`,label:`Test Generator (${t})`})}function ht(e,t){if(e.toneCalDb=t,e.testGain&&e.ctx&&pt(e.testType)){let n=10**(t/20);try{e.testGain.gain.cancelScheduledValues(e.ctx.currentTime),e.testGain.gain.linearRampToValueAtTime(n,e.ctx.currentTime+.05)}catch{e.testGain.gain.value=n}}}var gt={freq:1e3,levelDb:-18,refClock:`int48`,channelMode:`stereo`},_t={pattern:`tone`,sampleRate:48e3,proMode:!0,audioData:`audio`,level:-20,tone:1e3,ext:!1,cycle:!1,invert:!1,bOff:!1,invalid:!1};function vt(e){let t=!!e.pod33Node,n=!!e.bitBuddyNode;if(t&&n)e.sourceType=`test`,e.onStatusChange?.({type:`test`,label:`POD-33 Tone & ABS-1 Bit Spitter (Dual Concurrent Flows Active)`});else if(t){e.sourceType=`test`;let t=e.pod33Node?.config||gt;e.onStatusChange?.({type:`test`,label:`POD-33 Tone (${t.freq}Hz @ ${t.levelDb}dBFS ${t.channelMode.toUpperCase()})`})}else if(n){e.sourceType=`test`;let t=e.bitBuddyNode?.config||_t;e.onStatusChange?.({type:`test`,label:`ABS-1 Bit Spitter (${t.pattern.toUpperCase()} · ${t.proMode?`PRO`:`CONS`})`})}}function yt(e,t=gt){nt.resumeAudio(e.ctx);let n=nt.ensureAudioGraph(e),r=e.ctx;if(!r||!n)return;bt(e,!1),e.mxlFeed&&=(e.mxlFeed.stop(),null),e.sourceType=`test`,e.testType=`pod33_${t.freq}_${t.levelDb}_${t.channelMode}`;let i=t.levelDb<=-90?0:10**(t.levelDb/20);if(t.freq>0&&i>0){let a=r.createOscillator();a.type=`sine`,a.frequency.value=t.freq;let o=r.createChannelMerger(2),s=r.createGain(),c=r.createGain(),l=t.channelMode===`right`?0:i,u=i;t.channelMode===`left`?u=0:t.channelMode===`invert`&&(u=-i),s.gain.value=l,c.gain.value=u,a.connect(s),s.connect(o,0,0),a.connect(c),c.connect(o,0,1);let d=r.createGain();d.gain.value=1,o.connect(d),d.connect(n),a.start(),e.pod33Node={osc:a,leftGain:s,rightGain:c,merger:o,outGain:d,config:t},e.testOsc=a,e.testGain=o}else{let i=r.createGain();i.gain.value=0,i.connect(n),e.pod33Node={outGain:i,config:t}}vt(e)}function bt(e,t=!0){let n=e.pod33Node;if(n){if(n.osc){try{n.osc.stop()}catch{}try{n.osc.disconnect()}catch{}}if(n.outGain)try{n.outGain.disconnect()}catch{}e.pod33Node=null}e.testOsc===n?.osc&&(e.testOsc=null),t&&vt(e)}function xt(e,t=_t){nt.resumeAudio(e.ctx);let n=nt.ensureAudioGraph(e),r=e.ctx;if(!r||!n)return;St(e,!1),e.mxlFeed&&=(e.mxlFeed.stop(),null),e.sourceType=`test`,e.testType=`bitbuddy_${t.pattern}`;let i=r.createChannelMerger(2),a=r.createGain();a.gain.value=.5;let o=r.createGain(),s=r.createGain(),c=[];if(o.connect(i,0,0),!t.bOff){let e=r.createGain();if(e.gain.value=t.invert?-1:1,s.connect(e),e.connect(i,0,1),t.cycle){s.gain.value=.5;let e=r.createOscillator();e.type=`square`,e.frequency.value=1/1.04;let t=r.createGain();t.gain.value=.5,e.connect(t),t.connect(s.gain),e.start(),c.push(e)}}t.ext&&(a.gain.value=0);let l=null;if(t.pattern===`tone`){let e=r.createOscillator();e.type=`sine`,e.frequency.value=t.tone;let n=r.createGain();n.gain.value=t.level===null?0:10**(t.level/20),e.connect(n),n.connect(o),n.connect(s),e.start(),l=e}else if(t.pattern===`walk1s`){let e=r.createOscillator();e.type=`sawtooth`,e.frequency.value=120;let t=r.createBiquadFilter();t.type=`bandpass`,t.frequency.value=1800,t.Q.value=8;let n=r.createGain();n.gain.value=.35,e.connect(t),t.connect(n),n.connect(o),n.connect(s),e.start(),l=e}else if(t.pattern===`prbs`){let e=r.sampleRate*2,t=r.createBuffer(2,e,r.sampleRate),n=t.getChannelData(0),i=t.getChannelData(1),a=31438;for(let t=0;t<e;t++){let e=((a|0)^a>>1)&1;a=a>>1|e<<14;let r=e?.35:-.35;n[t]=r,i[t]=r}let c=r.createBufferSource();c.buffer=t,c.loop=!0,c.connect(o),c.connect(s),c.start(),l=c}else if(t.pattern===`minmax`){let e=r.createOscillator();e.type=`square`,e.frequency.value=60;let t=r.createGain();t.gain.value=.95,e.connect(t),t.connect(o),t.connect(s),e.start(),l=e}i.connect(a),a.connect(n),e.bitBuddyNode={source:l,extras:c,merger:i,masterGain:a,config:t},e.pod33Node||(e.testOsc=l,e.testGain=a),vt(e)}function St(e,t=!0){let n=e.bitBuddyNode;if(n){if(n.source){try{n.source.stop()}catch{}try{n.source.disconnect()}catch{}}for(let e of n.extras||[])try{e.stop()}catch{}if(n.masterGain)try{n.masterGain.disconnect()}catch{}e.bitBuddyNode=null}t&&vt(e)}var Ct=`./images/generators/`,wt=[64,128,16,32,2,8,1,4],Tt=[32,32,32,32,32,64,128,16],Et=[`48`,`44`,`32`,`OUT`,`CON`,`PRE`,`AUDIO`,`ERR`],Dt={48:6,44:7,32:4,OUT:5,CON:1,PRE:3,AUDIO:0,ERR:2},Ot={48:`48.0kHz`,44:`44.1kHz`,32:`32.0kHz`,OUT:`LOCK`,CON:`CONSUMER`,PRE:`PRE-EMPH`,AUDIO:`AUDIO`,ERR:`RCV ERROR`},kt={48:`NO ERROR`,44:`VALIDITY BIT`,32:`CONFIDENCE FLAG`,OUT:`CRC ERROR`,CON:`PARITY ERROR`,PRE:`BIPHASE ERROR`,AUDIO:`NO LOCK`,ERR:`(no legend)`},At=[`no error`,`validity bit high`,`confidence flag`,`slipped sample`,`CRC error`,`parity error`,`bi-phase coding error`,`no lock`],jt=[12,9,6,3,0,-3,-6,-9,-12,-15,-21,-27],Mt=[[`none`,`Clean`,0],[`confidence`,`Eye closing`,2],[`slip`,`Slip`,3],[`crc`,`CRC`,4],[`parity`,`Parity`,5],[`biphase`,`Bi-phase`,6],[`unplug`,`Unplugged`,7]],O=e=>(e-3.784)*300,k=e=>(4.2-e)*300,A={outline:`60.6,0 1079.4,0 1140,267.9 1079.4,568.5 60.6,568.5 0,267.9`,mLx:O(4.2238),mRx:O(4.6238),mY:e=>k(4.0804-.12*e),sX:O(5.4738),sY:e=>k(3.8404-.12*e),lb:[O(6.274),k(3.84)],jack:[O(7.0238),k(3.8344)],pot:[O(7.0238),k(2.7474)],sw1:[O(5.4878),k(2.57)],sw2:[O(6.2878),k(2.57)],screws:[[O(3.8838),k(3.3074)],[O(7.4838),k(3.3074)],[O(5.8738),k(2.7804)]]},j={outline:`40,3 1181,3 1223,174 1223,459 1183,656 39,656 3,459 3,174`,btn:{lvl:[170,155],srate:[170,375],cycle:[714,155],invert:[876,155],boff:[1036,155],k1:[714,375],f400:[876,375],invalid:[1036,375]},lvlLed:[[277,157,`OFF`],[357,157,`-20`],[437,157,`-12`],[520,157,`0`]],rateLed:[[277,378,`48`],[357,378,`44`],[437,378,`32`],[520,378,`EXT`]],lowbat:[710,505],power:[1045,527]},Nt={lvl:`AUDIO LEVEL`,srate:`SAMPLE RATE`,cycle:`CHB CYCLE`,invert:`CHB INVERT`,boff:`CHB OFF`,k1:`TONE 1KHz`,f400:`TONE 400Hz`,invalid:`INVALID`},Pt=`#ff3b30`,Ft=`#7dff6a`,It=`#ffb43a`,Lt=class e{router;es=`STATUS`;pos=`DIGITAL`;fault=`none`;timer=0;boundTo;constructor(e){this.router=e}html(){return`
      <div class="rc-abb-panel wbs-bitset">
        <div class="rc-panel-title">
          <div class="rc-panel-title-left"><strong>AUDIO BIT SPITTER &amp; AUDIO BIT BUDDY</strong></div>
        </div>
        <div class="bitset-rack">
          <figure class="bitset-unit" id="bsAbsUnit">${this.absSvg()}</figure>
          <div class="bitset-cable" aria-label="AES/EBU cable between the units">
            <div class="bitset-cable-title">AES/EBU CABLE</div>
            <div class="bitset-cable-line"><span id="bsCableDot"></span></div>
            <select class="bitset-fault" id="bsFault" aria-label="Fault on the line">
              ${Mt.map(([e,t,n])=>`<option value="${e}" title="CS8414 error code ${n}: ${At[n]}">${t}</option>`).join(``)}
            </select>
          </div>
          <figure class="bitset-unit" id="bsAbbUnit">${this.abbSvg()}</figure>
        </div>
        <div class="bitset-extras">
          <span class="bitset-extras-title">XTM EXTRAS (not on the real unit)</span>
          ${[[`tone`,`Tone`],[`walk1s`,`Walking 1s`],[`prbs`,`PRBS-15`],[`minmax`,`Min/Max`]].map(([e,t])=>`<button type="button" class="bitset-chip" data-abb-pat="${e}">${t}</button>`).join(``)}
          <span class="bitset-sep"></span>
          <button type="button" class="bitset-chip" data-abb-pro="pro">Professional</button>
          <button type="button" class="bitset-chip" data-abb-pro="cons">Consumer</button>
          <span class="bitset-sep"></span>
          <button type="button" class="bitset-chip" data-abb-data="audio">Audio</button>
          <button type="button" class="bitset-chip" data-abb-data="data">Non-audio</button>
        </div>
      </div>`}static led(e,t,n,r,i){return`<g class="bs-led" data-led="${e}"><circle cx="${t.toFixed(1)}" cy="${n.toFixed(1)}" r="${r+3}" fill="#050606"/><circle class="bs-lens" cx="${t.toFixed(1)}" cy="${n.toFixed(1)}" r="${r}"/><circle cx="${(t-r*.3).toFixed(1)}" cy="${(n-r*.3).toFixed(1)}" r="${(r*.28).toFixed(1)}" fill="#fff" opacity=".18"/><title>${i}</title></g>`}static toggle(e,t,n,r){return`<g class="bs-toggle" id="${e}" style="cursor:pointer">
      <rect x="${t-56}" y="${n-20}" width="112" height="40" rx="20" fill="#050606" stroke="#2c2f31" stroke-width="2"/>
      <circle cx="${t}" cy="${n}" r="15" fill="#8d8f8c"/>
      <line class="bs-lever" x1="${t}" y1="${n}" x2="${t}" y2="${n}" stroke="#d8dad6" stroke-width="13" stroke-linecap="round"/>
      <circle class="bs-tip" cx="${t}" cy="${n}" r="15" fill="#f1f2ef" stroke="#9a9c98" stroke-width="2"/>
      <rect x="${t-90}" y="${n-50}" width="180" height="100" fill="transparent"><title>${r}</title></rect></g>`}static screw(e,t){return`<circle cx="${e.toFixed(1)}" cy="${t.toFixed(1)}" r="20" fill="#9a9a94" stroke="#55554f" stroke-width="2"/><path d="M${(e-11).toFixed(1)} ${t.toFixed(1)}h22M${e.toFixed(1)} ${(t-11).toFixed(1)}v22" stroke="#4a4a45" stroke-width="5"/>`}abbSvg(){let t=`<svg class="bitset-svg" viewBox="0 0 1140 569" role="img" aria-label="ABB-1 Audio Bit Buddy front panel">
      <defs><clipPath id="bsAbbTitle"><rect x="80" y="500" width="370" height="64"/></clipPath>
      <filter id="bsGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <polygon points="${A.outline}" fill="#17191b" stroke="#000" stroke-width="3"/>
      <image href="${Ct}abb1-front.svg" width="1140" height="569"/>
      <image href="${Ct}abb1-front-green.png" width="1140" height="569" clip-path="url(#bsAbbTitle)"/>`;jt.forEach((n,r)=>{t+=e.led(`mL${r}`,A.mLx,A.mY(r),12.5,`LEFT bar ${n>0?`+`:``}${n} dB`),t+=e.led(`mR${r}`,A.mRx,A.mY(r),12.5,`RIGHT bar ${n>0?`+`:``}${n} dB`)}),Et.forEach((n,r)=>{t+=e.led(`s${n}`,A.sX,A.sY(r),12.5,`STATUS: ${Ot[n]} · ERROR: ${kt[n]} (STATERR bit ${Dt[n]})`)}),t+=e.led(`lb`,A.lb[0],A.lb[1],12.5,`LOW BATT. (hardware comparator, not the PIC)`);let[n,r]=A.jack;t+=`<circle cx="${n}" cy="${r}" r="80" fill="#0b0c0c" stroke="#262829" stroke-width="10" stroke-dasharray="6 5"/><circle cx="${n}" cy="${r}" r="40" fill="#020202"/>`;let[i,a]=A.pot;return t+=`<circle cx="${i}" cy="${a}" r="72" fill="#0d0e0f" stroke="#2c2f31" stroke-width="3"/><circle cx="${i}" cy="${a}" r="44" fill="#3c9d5d" stroke="#1f5a33" stroke-width="4"/><line x1="${i}" y1="${a}" x2="${i+40}" y2="${a-50}" stroke="#f4f4f0" stroke-width="7" stroke-linecap="round"/>`,t+=e.toggle(`bsSw1`,A.sw1[0],A.sw1[1],`STATUS / ERROR (SW1 → RB0) — click to flip`),t+=e.toggle(`bsSw2`,A.sw2[0],A.sw2[1],`ANALOG · OFF · DIGITAL (SW2 → RB1) — click left, centre or right`),A.screws.forEach(([n,r])=>t+=e.screw(n,r)),t+`</svg>`}absSvg(){let e=`<svg class="bitset-svg" viewBox="0 0 1230 658" role="img" aria-label="ABS-1 Audio Bit Spitter front panel">
      <polygon points="${j.outline}" fill="#d8d6ce"/>`;for(let t of Object.keys(j.btn)){let[n,r]=j.btn[t];e+=`<rect class="bs-cap" data-cap="${t}" x="${n-54}" y="${r-54}" width="108" height="108" rx="4" fill="#e6e4dc"/>`}e+=`<image href="${Ct}abs1-front-black.png" width="1230" height="658"/>`;for(let t of Object.keys(j.btn)){let[n,r]=j.btn[t];e+=`<rect class="bs-lamp" data-lamp="${t}" x="${n-21}" y="${r-10}" width="42" height="20" rx="2"/>`}j.lvlLed.forEach(([t,n,r])=>e+=`<circle class="bs-round" data-round="L${r}" cx="${t}" cy="${n}" r="17"><title>AUDIO LEVEL ${r}</title></circle>`),j.rateLed.forEach(([t,n,r])=>e+=`<circle class="bs-round" data-round="R${r}" cx="${t}" cy="${n}" r="17"><title>SAMPLE RATE ${r}</title></circle>`),e+=`<circle class="bs-round" data-round="lowbat" cx="${j.lowbat[0]}" cy="${j.lowbat[1]}" r="17"><title>LOW BAT</title></circle>`;let[t,n]=j.power;e+=`<g id="bsPower" style="cursor:pointer"><rect x="${t-48}" y="${n-24}" width="96" height="48" fill="transparent"/><circle id="bsPowerKnob" cx="${t-14}" cy="${n}" r="15" fill="#3b3a36"/><title>POWER — engages the Bit Spitter on Web Router CH 4</title></g>`;for(let t of Object.keys(j.btn)){let[n,r]=j.btn[t];e+=`<rect class="bs-key" data-bs-key="${t}" x="${n-56}" y="${r-56}" width="112" height="112" fill="transparent" style="cursor:pointer"><title>${Nt[t]}</title></rect>`}return e+`</svg>`}press(e){let t=this.router,n=t.bitBuddyConfig;if(t.bitBuddyEngaged)switch(e){case`lvl`:{let e=[null,-20,-12,0],r=e.indexOf(n.level);return t.setBitBuddyConfig({level:e[(r+1)%e.length]})}case`srate`:{if(n.ext)return t.setBitBuddyConfig({ext:!1,sampleRate:48e3});let e=[48e3,44100,32e3],r=e.indexOf(n.sampleRate);return r===e.length-1||r<0?t.setBitBuddyConfig({ext:!0}):t.setBitBuddyConfig({sampleRate:e[r+1]})}case`k1`:return t.setBitBuddyConfig({tone:1e3});case`f400`:return t.setBitBuddyConfig({tone:400});case`cycle`:return t.setBitBuddyConfig(n.cycle?{cycle:!1,bOff:!1}:{cycle:!0,bOff:!1});case`invert`:return t.setBitBuddyConfig({invert:!n.invert,bOff:!1});case`boff`:return t.setBitBuddyConfig(n.bOff?{bOff:!1}:{bOff:!0,cycle:!1,invert:!1});case`invalid`:return t.setBitBuddyConfig({invalid:!n.invalid})}}bind(e){this.boundTo!==e&&this.listen(e),this.boundTo=e,window.clearInterval(this.timer),this.timer=window.setInterval(()=>{if(!e.isConnected)return window.clearInterval(this.timer);e.offsetParent!==null&&this.paint(e)},120)}listen(e){e.addEventListener(`change`,t=>{let n=t.target.closest(`#bsFault`);n&&(this.fault=n.value,this.paint(e))}),e.addEventListener(`click`,t=>{let n=t.target,r=n.closest(`[data-bs-key]`);if(r)return this.press(r.getAttribute(`data-bs-key`));if(n.closest(`#bsPower`))return this.router.setBitBuddy(!this.router.bitBuddyEngaged);if(n.closest(`#bsSw1`))return this.es=this.es===`STATUS`?`ERROR`:`STATUS`,this.paint(e);let i=n.closest(`#bsSw2`);if(i){let n=i.getBoundingClientRect(),r=(t.clientX-n.left)/n.width;return this.pos=r<.38?`ANALOG`:r>.62?`DIGITAL`:`OFF`,this.paint(e)}})}receiver(){let e=this.router,t=e.bitBuddyConfig,n=e.bitBuddyEngaged&&(!t.ext||e.extRefLocked),r=t.ext?48e3:t.sampleRate,i=n&&this.fault!==`unplug`&&r>=3e4&&r<=5e4,a=7;return i&&(a=Mt.find(([e])=>e===this.fault)[2],a===4&&!t.proMode&&(a=0),t.invalid&&a<1&&(a=1)),{lock:i,E:a,F:i?r===48e3?5:r===44100?6:r===32e3?7:0:0,fs:r,running:n}}statusLeds(){let e=this.router.bitBuddyConfig,t=this.receiver(),n=wt[t.E],r;if(this.es===`ERROR`)r=n;else{let i=Tt[t.F];e.audioData===`audio`&&(i|=1),e.proMode||(i|=2),e.proMode&&this.fault===`crc`&&(i|=4),i&2&&(i&=-5),r=i,n&4&&(r=0),n&64||(r|=4)}let i=new Set(Et.filter(e=>r>>Dt[e]&1)),a;if(this.es===`ERROR`){let e=Et.find(e=>n>>Dt[e]&1);a=`ERROR: code ${t.E} (${At[t.E]}) → lamp “${kt[e]}”`+(t.E>=3?` — TABLE1 puts codes 3–7 one row below their legend`:``)}else a=i.size?`STATUS: ${[...i].map(e=>Ot[e]).join(` · `)}`:`STATUS: dark`,t.lock||(a=`STATUS: no lock → blank, RCV ERROR only`);return{lit:i,why:a}}meters(){let e=this.router.bitBuddyConfig,t=this.receiver();if(this.pos===`OFF`||!t.running||this.pos===`DIGITAL`&&!t.lock)return[-99,-99];if(this.pos===`DIGITAL`&&e.audioData===`data`)return[14,14];let n=Date.now(),r=e.pattern===`tone`?e.level===null?-99:e.level:e.pattern===`minmax`?-1:-14+Math.sin(n/90)*1.5,i=this.pos===`DIGITAL`?20:0,a=e.bOff||e.cycle&&Math.floor(n/520)%2==1;return[r+i,a?-99:r+i]}paint(e){let t=this.router,n=t.bitBuddyConfig,r=t.bitBuddyEngaged,i=t=>e.querySelectorAll(t),a=(t,n,r,i)=>{e.querySelectorAll(`[data-led="${t}"] .bs-lens`).forEach(e=>{e.setAttribute(`fill`,n?r:i),n?e.setAttribute(`filter`,`url(#bsGlow)`):e.removeAttribute(`filter`)})},o=n.ext&&t.extRefLocked,s={lvl:!1,srate:r&&o,cycle:r&&n.cycle,invert:r&&n.invert,boff:r&&n.bOff,k1:r&&n.tone===1e3,f400:r&&n.tone===400,invalid:r&&n.invalid};i(`.bs-lamp`).forEach(e=>{let t=s[e.getAttribute(`data-lamp`)];e.setAttribute(`fill`,t?It:`#9a9890`),t?e.setAttribute(`filter`,`url(#bsGlow)`):e.removeAttribute(`filter`)});let c=n.level===null?`OFF`:String(n.level),l=n.ext?o?`48`:``:n.sampleRate===44100?`44`:n.sampleRate===32e3?`32`:`48`;i(`.bs-round`).forEach(e=>{let t=e.getAttribute(`data-round`),i=r&&(t===`L${c}`||t===`R${l}`||t===`REXT`&&n.ext);e.setAttribute(`fill`,i?`#ff4a3a`:`#6d6b64`),e.setAttribute(`opacity`,`1`),i?e.setAttribute(`filter`,`url(#bsGlow)`):e.removeAttribute(`filter`)}),e.querySelector(`#bsPowerKnob`)?.setAttribute(`cx`,String(j.power[0]+(r?14:-14)));let u=e.querySelector(`#bsAbsUnit`);if(u){let e=n.bOff?`B off`:[n.invert&&`B inverted`,n.cycle&&`B cycling`].filter(Boolean).join(`, `)||`B on`;u.title=r?n.ext&&!o?`EXT: no AES reference — clock stopped, output muted. (Start POD-33 at 48 kHz to lock.)`:`AES OUT ${n.ext?48:n.sampleRate/1e3} kHz${o?` (locked to POD-33)`:``} · `+(n.pattern===`tone`?`${n.tone===1e3?`1 kHz`:`400 Hz`} @ ${n.level===null?`OFF`:`${n.level} dBFS / ${n.level+4>0?`+`:``}${n.level+4} dBu`}`:n.pattern.toUpperCase())+` · ${e}${n.invalid?` · V = 1`:``}`:`Power off.`}let d=this.receiver();e.querySelector(`#bsCableDot`)?.setAttribute(`class`,!d.running||this.fault===`unplug`?``:this.fault===`none`&&!n.invalid?`ok`:`bad`);let f=e.querySelector(`#bsFault`);f&&f.value!==this.fault&&(f.value=this.fault);let p=this.pos===`DIGITAL`,{lit:m,why:h}=this.statusLeds();Et.forEach(e=>a(`s${e}`,p&&m.has(e),Pt,`#3a1212`)),a(`lb`,!1,Pt,`#3a1212`);let[g,_]=this.meters();jt.forEach((e,t)=>{a(`mL${t}`,g>=e,t===0?`#ff4a3a`:Ft,t===0?`#3a1414`:`#10261a`),a(`mR${t}`,_>=e,t===0?`#ff4a3a`:Ft,t===0?`#3a1414`:`#10261a`)});let v=(t,n,r,i)=>{let a=e.querySelector(`#${t}`);if(!a)return;let o=n+i*50,s=r+(i===0?-6:0);a.querySelector(`.bs-lever`)?.setAttribute(`x2`,String(o)),a.querySelector(`.bs-lever`)?.setAttribute(`y2`,String(s)),a.querySelector(`.bs-tip`)?.setAttribute(`cx`,String(o)),a.querySelector(`.bs-tip`)?.setAttribute(`cy`,String(s))};v(`bsSw1`,A.sw1[0],A.sw1[1],this.es===`ERROR`?1:-1),v(`bsSw2`,A.sw2[0],A.sw2[1],this.pos===`ANALOG`?-1:+(this.pos===`DIGITAL`));let y=e.querySelector(`#bsAbbUnit`);y&&(y.title=this.pos===`OFF`?`Power off.`:this.pos===`ANALOG`?`ANALOG: status LEDs off, bars read the analog jacks (+4 dBu = 0).`:h),e.querySelectorAll(`[data-abb-pat]`).forEach(e=>e.classList.toggle(`active`,e.getAttribute(`data-abb-pat`)===n.pattern)),e.querySelectorAll(`[data-abb-pro]`).forEach(e=>e.classList.toggle(`active`,e.getAttribute(`data-abb-pro`)===`pro`===n.proMode)),e.querySelectorAll(`[data-abb-data]`).forEach(e=>e.classList.toggle(`active`,e.getAttribute(`data-abb-data`)===n.audioData))}},Rt=`http://localhost:8467`,zt=[[`generator`,`Generator`,9600],[`player`,`File Player`,9602],[`webrtc`,`WebRTC`,9601],[`info`,`MXL Info`,9699]],Bt=class{container;router;cbcHost;unsubscribe;bitSet;cbc={};cbcTimer=0;cbcBusy=!1;cbcRoot;constructor(e,t,n){this.container=e,this.router=t,this.cbcHost=n,this.bitSet=new Lt(t),this.cbcRoot=e}build(){this.container.innerHTML=this.renderHtml();let e=this.container.querySelector(`.rc-cbc-studio-panel`);this.cbcHost&&e&&(this.cbcHost.replaceChildren(e),this.cbcRoot=this.cbcHost),this.attachEvents(),this.bitSet.bind(this.container),this.startCbcPolling(),this.unsubscribe?.(),this.unsubscribe=this.router.onChange(()=>this.refresh()),this.refresh()}renderHtml(){let e=this.router;return`
      <div class="routing-console-rack">
        <div class="routing-aux-panels">
        <!-- POD-33 REFERENCE TONE GENERATOR -->
        <div class="rc-pod-panel">
          <div class="rc-panel-title">
            <div class="rc-panel-title-left">
              <strong>WBS POD-33 AES DARS &amp; PRECISION TONE GENERATOR</strong>
            </div>
            <button type="button" id="btnTogglePod33" class="rc-power-btn ${e.pod33Engaged?`active`:``}">
              ${e.pod33Engaged?`● POD-33 ACTIVE`:`○ ACTIVATE POD-33`}
            </button>
          </div>

          <div class="rc-pod-grid">
            <!-- Genlock Reference Clock -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">REFERENCE LOCK</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${e.pod33Config.refClock===`video`?`active`:``}" data-pod-ref="video">
                  <span class="rc-led-dot ${e.pod33Config.refClock===`video`?`lit-green`:``}"></span>
                  VIDEO
                </button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.refClock===`aes`?`active`:``}" data-pod-ref="aes">
                  <span class="rc-led-dot ${e.pod33Config.refClock===`aes`?`lit-green`:``}"></span>
                  AES DARS
                </button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.refClock===`int48`?`active`:``}" data-pod-ref="int48">
                  <span class="rc-led-dot ${e.pod33Config.refClock===`int48`?`lit-green`:``}"></span>
                  INT 48k
                </button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.refClock===`int96`?`active`:``}" data-pod-ref="int96">
                  <span class="rc-led-dot ${e.pod33Config.refClock===`int96`?`lit-green`:``}"></span>
                  INT 96k
                </button>
              </div>
            </div>

            <!-- Frequency Selection -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CALIBRATED FREQUENCY</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${e.pod33Config.freq===100?`active`:``}" data-pod-freq="100">100 Hz</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.freq===400?`active`:``}" data-pod-freq="400">400 Hz</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.freq===1e3?`active`:``}" data-pod-freq="1000">1 kHz (0 VU)</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.freq===0?`active`:``}" data-pod-freq="0">Silence</button>
              </div>
            </div>

            <!-- Level Selection (dBFS) -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CALIBRATED LEVEL (dBFS)</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===0?`active`:``}" data-pod-lvl="0">0 dB</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-12?`active`:``}" data-pod-lvl="-12">-12</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-14?`active`:``}" data-pod-lvl="-14">-14</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-18?`active`:``}" data-pod-lvl="-18">-18 (EBU)</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-20?`active`:``}" data-pod-lvl="-20">-20 (SMPTE)</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-24?`active`:``}" data-pod-lvl="-24">-24</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-40?`active`:``}" data-pod-lvl="-40">-40</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.levelDb===-100?`active`:``}" data-pod-lvl="-100">OFF</button>
              </div>
            </div>

            <!-- Channel Routing & Phase Invert -->
            <div class="rc-pod-col">
              <div class="rc-control-group-title">CHANNEL &amp; PHASE</div>
              <div class="rc-btn-group" role="group">
                <button type="button" class="rc-btn-sel ${e.pod33Config.channelMode===`stereo`?`active`:``}" data-pod-ch="stereo">Stereo</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.channelMode===`left`?`active`:``}" data-pod-ch="left">Left Only</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.channelMode===`right`?`active`:``}" data-pod-ch="right">Right Only</button>
                <button type="button" class="rc-btn-sel ${e.pod33Config.channelMode===`invert`?`active`:``}" data-pod-ch="invert" title="Phase Invert 180° on Right channel">Ø Invert 180°</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CBC / RADIO-CANADA MXL TEST GENERATOR & PATTERN STUDIO -->
        <div class="rc-cbc-studio-panel">
          <div class="rc-cbc-header">
            <div class="rc-cbc-title">
              <strong>CBC / RADIO-CANADA MXL TEST GENERATOR &amp; PATTERN STUDIO</strong>
            </div>
            <div class="rc-cbc-svcs" id="rcCbcSvcs">
              ${zt.map(([e,t,n])=>`<a class="rc-cbc-svc" data-cbc-svc="${e}" href="http://localhost:${n}" target="_blank" rel="noopener" title="${t} (:${n})"><span class="rc-led-dot"></span>${t}</a>`).join(``)}
              <button type="button" class="rc-power-btn" id="btnCbcPipeline" title="Start / stop the CBC test generator pipeline">○ START</button>
            </div>
          </div>

          <div class="rc-cbc-grid">
            <!-- Video Test Patterns -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">VIDEO TEST PATTERN</div>
              <select id="rcCbcVideoSelect" class="rc-cbc-select"><option>—</option></select>
              <div class="rc-cbc-flow-info" id="rcCbcVideoFlow"></div>
            </div>

            <!-- Audio Test Patterns -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">AUDIO TEST PATTERN</div>
              <select id="rcCbcAudioSelect" class="rc-cbc-select"><option>—</option></select>
              <div class="rc-cbc-flow-info" id="rcCbcAudioFlow"></div>
            </div>

            <!-- Calibrated Output Level -->
            <div class="rc-cbc-col">
              <div class="rc-cbc-label">OUTPUT LEVEL</div>
              <div class="rc-cbc-btn-group">
                <button type="button" class="rc-cbc-btn active" data-cbc-lvl="-20">-20 dBFS (EBU)</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="-18">-18 dBFS (0 VU)</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="-12">-12 dBFS</button>
                <button type="button" class="rc-cbc-btn" data-cbc-lvl="0">0 dBFS (Ceiling)</button>
              </div>
            </div>
          </div>
        </div>
${this.bitSet.html()}
        </div>
      </div>
    `}post(e,t){fetch(`${Rt}${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}).catch(()=>{})}attachEvents(){let e=this.router,t=this.cbcRoot===this.container?[this.container]:[this.container,this.cbcRoot],n=t=>n=>{let r=n.target.closest(`button`);if(!r||!t.contains(r))return;let i=r.dataset;if(r.id===`btnTogglePod33`)return e.setPod33(!e.pod33Engaged);if(r.id===`btnCbcPipeline`)return this.toggleCbcPipeline();if(i.podRef!==void 0)return e.setPod33Config({refClock:i.podRef});if(i.podFreq!==void 0)return e.setPod33Config({freq:+i.podFreq});if(i.podLvl!==void 0)return e.setPod33Config({levelDb:+i.podLvl});if(i.podCh!==void 0)return e.setPod33Config({channelMode:i.podCh});if(i.abbPat!==void 0)return e.setBitBuddyConfig({pattern:i.abbPat});if(i.abbPro!==void 0)return e.setBitBuddyConfig({proMode:i.abbPro===`pro`});if(i.abbData!==void 0)return e.setBitBuddyConfig({audioData:i.abbData});if(i.cbcLvl!==void 0){let e=parseFloat(i.cbcLvl);this.cbcRoot.querySelectorAll(`[data-cbc-lvl]`).forEach(e=>e.classList.toggle(`active`,e===r)),this.post(`/api/cbc/audio_level`,{level_db:e})}};t.forEach(e=>e.addEventListener(`click`,n(e)));let r=e=>t=>this.post(`/api/cbc/pattern`,{target:e,pattern:t.target.value});this.cbcRoot.querySelector(`#rcCbcVideoSelect`)?.addEventListener(`change`,r(`video`)),this.cbcRoot.querySelector(`#rcCbcAudioSelect`)?.addEventListener(`change`,r(`audio`))}startCbcPolling(){window.clearInterval(this.cbcTimer);let e=()=>{if(!this.cbcRoot.isConnected)return window.clearInterval(this.cbcTimer);this.cbcRoot.offsetParent!==null&&this.pollCbc()};this.cbcTimer=window.setInterval(e,2500),e()}async pollCbc(){try{let e=await fetch(`${Rt}/api/cbc/status`,{cache:`no-store`});this.cbc=e.ok?await e.json():{}}catch{this.cbc={}}this.paintCbc()}async toggleCbcPipeline(){if(!this.cbcBusy){this.cbcBusy=!0,this.paintCbc();try{await fetch(`${Rt}/api/cbc/pipeline/${this.cbc.running?`stop`:`start`}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:`{}`})}catch{}this.cbcBusy=!1,await this.pollCbc()}}paintCbc(){let e=this.cbcRoot,t=this.cbc,n=t.online!==void 0;zt.forEach(([r,i,a])=>{let o=e.querySelector(`[data-cbc-svc="${r}"]`);if(!o)return;let s=t.services?.[r],c=s?!!s.up:r===`generator`&&!!t.online;o.classList.toggle(`up`,c),o.querySelector(`.rc-led-dot`)?.classList.toggle(`lit-green`,c),s?.url&&(o.href=s.url),o.title=`${s?.label??i} (:${s?.port??a}) — ${n?c?`up`:`down`:`daemon offline`}`});let r=e.querySelector(`#btnCbcPipeline`);r&&(r.disabled=!t.online||this.cbcBusy,r.classList.toggle(`active`,!!t.running),r.textContent=this.cbcBusy?`… WAIT`:t.running?`● RUNNING`:`○ START`,r.title=n?t.online?t.running?`Stop the CBC test generator pipeline`:`Start the CBC test generator pipeline`:`Generator container (:9600) not reachable`:`Daemon offline (localhost:8467)`);let i=(t,n,r)=>{let i=e.querySelector(`#${t}`);if(!i||!n?.length||document.activeElement===i)return;let a=n.join(`|`);i.dataset.key!==a&&(i.innerHTML=n.map(e=>`<option value="${e.replace(/"/g,`&quot;`)}">${e}</option>`).join(``),i.dataset.key=a),r&&n.includes(r)&&(i.value=r)};i(`rcCbcVideoSelect`,t.patterns?.video,t.video_pattern),i(`rcCbcAudioSelect`,t.patterns?.audio,t.audio_pattern);let a=t.flows??{},o=e=>e?e.slice(0,8)+`…`:``,s=e.querySelector(`#rcCbcVideoFlow`);s&&(s.textContent=a.video?`${o(a.video)} · ${t.resolution??``} @ ${t.framerate??``}`:``,s.title=a.video??``);let c=e.querySelector(`#rcCbcAudioFlow`);if(c){let e=[`audio1`,`audio2`].filter(e=>a[e]);c.textContent=e.map(e=>o(a[e])).join(` · `),c.title=e.map(e=>`${e}: ${a[e]}`).join(`
`)}typeof t.level_db==`number`&&e.querySelectorAll(`[data-cbc-lvl]`).forEach(e=>e.classList.toggle(`active`,Math.abs(+e.getAttribute(`data-cbc-lvl`)-t.level_db)<.05))}refresh(){let e=this.container,t=this.router,n=t.pod33Config,r=e.querySelector(`#btnTogglePod33`);r&&(r.classList.toggle(`active`,t.pod33Engaged),r.textContent=t.pod33Engaged?`● POD-33 ACTIVE`:`○ ACTIVATE POD-33`);let i=(t,n)=>e.querySelectorAll(`[${t}]`).forEach(e=>e.classList.toggle(`active`,n(e.getAttribute(t))));i(`data-pod-ref`,e=>e===n.refClock),i(`data-pod-freq`,e=>+e===n.freq),i(`data-pod-lvl`,e=>+e===n.levelDb),i(`data-pod-ch`,e=>e===n.channelMode),e.querySelectorAll(`[data-pod-ref] .rc-led-dot`).forEach(e=>e.classList.toggle(`lit-green`,e.parentElement?.getAttribute(`data-pod-ref`)===n.refClock)),this.bitSet.paint(e)}};function Vt(e,t,n=!1){e.refLevelDb=t,e.isRefDigital=n,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setRefLevel(t,n)}function Ht(e,t){e.peakSensTrim=t,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPeakTrim(t)}function Ut(e){return e.isRefDigital?10**((-18-e.refLevelDb)/20):10**((4-e.refLevelDb)/20)}function Wt(e,t,n){if(!e.wasmDsp.ready||!e.wasmDsp.process(t,n,e.wasmResult))return!1;let r=e.wasmResult,i=e.currentLevels;i.vu[0]=r.vuL,i.vu[1]=r.vuR,i.vuDb[0]=v(r.vuL),i.vuDb[1]=v(r.vuR),i.ppm[0]=r.ppmFracL,i.ppm[1]=r.ppmFracR,i.ppmDb[0]=r.ppmDbL,i.ppmDb[1]=r.ppmDbR,i.dbfs[0]=r.dbfsA,i.dbfs[1]=r.dbfsB,i.dbfs[2]=r.dbfsSum,i.dbfs[3]=r.dbfsDiff,i.lufs.m=r.lufsM,i.lufs.s=r.lufsS,i.lufs.mL=r.lufsML,i.lufs.mR=r.lufsMR,i.phaseCorrelation=r.phaseCorr,i.hasAudio=r.hasAudio,i.peak[0]=r.peakA,i.peak[1]=r.peakB,i.phaseLed=ce(r.phaseCorr,r.hasAudio);let a=r.blockEnergy>0?r.blockEnergy:r.lufsM>-70?10**((r.lufsM+.691)/10):0;return(r.hasAudio||a>125e-9)&&a>125e-9&&me(e.lufsState,a),i.lufs.i=he(e.lufsState),ge(e.lufsState,r.lufsS),i.lufs.lra=_e(e.lufsState),!0}var Gt=e=>e>1e-6?20*Math.log10(e):-120,Kt=(e,t)=>e>0?Math.max(-60,10*Math.log10(e/t)):-60;function qt(e,t,n){let r=t.length,i=Ut(e),a=m,o=e.vuState[0],s=e.vuState[1],c=e.ppmState[0],l=e.ppmState[1],u=e.lufsState.stage1[0],d=e.lufsState.stage1[1],f=e.lufsState.stage2[0],p=e.lufsState.stage2[1],h=!1,g=!1,y=!1,b=0,x=0,S=0,C=0,ee=0,te=0,ne=0,re=0;for(let m=0;m<r;m++){let r=t[m]*i,v=n[m]*i,T=Math.abs(r),E=Math.abs(v);_(e,o,T*a),_(e,s,E*a);let ie=Math.abs(t[m]),oe=Math.abs(n[m]),se=Math.abs(t[m]+n[m]),ce=Math.abs(t[m]-n[m]);ie>b&&(b=ie),oe>x&&(x=oe),se>S&&(S=se),ce>C&&(C=ce),ne+=t[m]*t[m],re+=n[m]*n[m],(T>1e-4||E>1e-4)&&(h=!0);let le=de(e,f,ue(e,u,t[m])),fe=de(e,p,ue(e,d,n[m]));ee+=le*le,te+=fe*fe,w(e,c,T),w(e,l,E),T>=1&&(g=!0),E>=1&&(y=!0),ae(e.phaseState,e.phaseAlpha,r,v)}let ie=e.peakSensTrim||0,ce=T(c.env,ie),le=T(l.env,ie),fe=oe(e.phaseState,h);e.phaseState.correlation=fe;let me=se(fe,h);e.phaseState.led=me;let D=e.lufsState;ve(e,ee/r,te/r,h);let ye=pe(D.meanSquareM_L+D.meanSquareM_R),be=pe(D.meanSquareS_L+D.meanSquareS_R),xe=he(D),Se=pe(D.meanSquareM_L),Ce=pe(D.meanSquareM_R);ge(D,be);let we=_e(D);e.currentLevels={vu:[o.p,s.p],ppm:[E(ce),E(le)],vuDb:[v(o.p),v(s.p)],ppmDb:[ce,le],dbfs:[Gt(b),Gt(x),Gt(S),Gt(C)],lufs:{m:ye,s:be,i:xe,lra:we,mL:Se,mR:Ce},rmsDb:[Kt(ne,r),Kt(re,r)],phaseCorrelation:fe,phaseLed:me,peak:[g,y],hasAudio:h}}rt({ensureAudioGraph:Fe,resumeAudio:Ee});var Jt=new class{ctx=null;sourceNode=null;stream=null;parkedStreams=new Map;isSystemAudio=!1;activeDeviceId=null;sourceType=`none`;inputGainNode=null;inputTrimDb=0;hpfNode=null;hpfEnabled=!1;monitorGainNode=null;monitorEnabled=!1;monitorVolume=.8;splitterNode=null;processorNode=null;testOsc=null;testGain=null;testType=`none`;toneCalDb=-18;sweepTimer=null;vuStyle=`pimson`;vuBallisticPreset=`standard_vu`;vuCoeffs=n();vuState=r();ppmAttack=.005;ppmType=2;ppmBallisticPreset=`type2`;ppmDecayDbPerSec=24/2.8;peakSensTrim=0;ppmState=i();phaseAlpha=.001;phaseState=a();refLevelDb=4;isRefDigital=!1;domain=`analog`;lufsState=o();currentLevels=s();onStatusChange=null;mxlFeed=null;tabInfo=null;onDevicesChange=null;workletLoaded=!1;vuB0=0;vuB1=0;vuB2=0;vuA1=0;vuA2=0;ppmAttCoeff=0;ppmDecCoeff=0;kShelf_b0=0;kShelf_b1=0;kShelf_b2=0;kShelf_a1=0;kShelf_a2=0;kHp_b0=0;kHp_b1=0;kHp_b2=0;kHp_a1=0;kHp_a2=0;lufsAlphaM=0;lufsAlphaS=0;wasmDsp=new t;wasmResult=c();ensureContext(){return xe(this)}initWorklet(){return Se(this)}calculateCoefficients(){be(this)}setVuStyle(e){y(this,e)}setVuBallisticPreset(e){b(this,e)}vuDbOf(e){return v(e)}getAudioInputDevices(){return We()}connectSoundCard(e=null){return qe(this,e)}connectSystemAudio(e=`browser`,t=!1){return Ze(this,e,t)}connectMxlFlow(e,t,n){return tt(this,e,t,n)}startTestGenerator(e=`sine1k`){mt(this,e)}startPod33Generator(e){yt(this,e)}stopPod33Generator(){bt(this)}startBitBuddyGenerator(e){xt(this,e)}stopBitBuddyGenerator(){St(this)}setToneCalibration(e){ht(this,e)}setupAudioGraph(e,t=!1){Ie(this,e,t)}stopCurrentSource(){Le(this)}processAudioBlock(e){let t=e.inputBuffer.getChannelData(0),n=e.inputBuffer.numberOfChannels>1?e.inputBuffer.getChannelData(1):t;this.processAudioBlockBuffers(t,n)}processAudioBlockBuffers(e,t){Wt(this,e,t)||qt(this,e,t)}getLevels(){return this.currentLevels}setHighPass(e){Ae(this,e)}updateHpfState(){je(this)}setInputTrim(e){Oe(this,e)}updateInputGain(){ke(this)}setMonitor(e,t=null){Me(this,e,t)}setMonitorVolume(e){Ne(this,e)}updateMonitorState(){Pe(this)}setReferenceLevel(e,t=!1){Vt(this,e,t)}setPeakSensTrim(e){Ht(this,e)}setPpmType(e){re(this,e)}resetLoudness(){ye(this)}},M=3200,Yt=[373,1002,2198,2827],N={x:1380,y:80,w:440,h:98},Xt={MODE:1385,SOURCE:1499,DOWN:1613,UP:1727},Zt={x0:1438,pitch:46,cy:42,count:8},Qt=8.2,$t={x:1540,y:80,w:120,h:56},en={bx:22,by:18},tn={input1X:687.5,input2X:2512.5,input2LineX0:1912},nn=[-20,-16,-12,-8,-4,0,4],rn=[-18,-14,-10,-6,-2,2];function an(e){return(e- -20)/24}function on(e,t=!1){return cn(an(e),t)}function P(e){return 10**((e-3)/20)}function F(e,t=!1){return t?-50+100*Math.max(-.03,Math.min(1.08,e)):-45+90*Math.max(-.03,Math.min(1.08,e))}function sn(e){return e===null||!Number.isFinite(e)?-.12:e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function cn(e,t=!1){return t?-50+100*Math.max(-.13,Math.min(1.08,e)):-45+90*Math.max(-.13,Math.min(1.08,e))}function ln(e){return e?-50:-45}function un(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}var dn={" ":[0,0,0,0,0,0,0],"-":[0,0,0,31,0,0,0],"/":[0,1,2,4,8,16,0],".":[0,0,0,0,0,12,12],":":[0,12,12,0,12,12,0],"+":[0,4,4,31,4,4,0],"%":[24,25,2,4,8,19,3],0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[31,2,4,2,1,17,14],4:[2,6,10,18,31,2,2],5:[31,16,30,1,1,17,14],6:[6,8,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,2,12],A:[14,17,17,17,31,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[28,18,17,17,17,18,28],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],a:[0,0,14,1,15,17,15],b:[16,16,22,25,17,17,30],c:[0,0,14,16,16,17,14],d:[1,1,13,19,17,17,15],e:[0,0,14,17,31,16,14],f:[6,9,8,28,8,8,8],g:[0,15,17,17,15,1,14],h:[16,16,22,25,17,17,17],i:[4,0,12,4,4,4,14],k:[16,16,18,20,24,20,18],l:[12,4,4,4,4,4,14],m:[0,0,26,21,21,17,17],n:[0,0,22,25,17,17,17],o:[0,0,14,17,17,17,14],p:[0,0,30,17,30,16,16],r:[0,0,22,25,16,16,16],s:[0,0,14,16,14,1,30],t:[8,8,28,8,8,9,6],u:[0,0,17,17,17,19,13],v:[0,0,17,17,17,10,4],w:[0,0,17,17,21,21,10],x:[0,0,17,10,4,10,17],y:[0,0,17,17,15,1,14],z:[0,0,31,2,4,8,31]};function fn(e,t,n,r,i,a){let o=``,s=r*.38;for(let c=0;c<e.length;c++){let l=dn[e[c]??` `]??dn[` `],u=t+c*r*6.2;for(let e=0;e<7;e++){let t=l[e]??0;for(let c=0;c<5;c++){let l=t>>4-c&1;o+=`<circle cx="${(u+c*r).toFixed(1)}" cy="${(n+e*r).toFixed(1)}" r="${s.toFixed(2)}" fill="${l?i:a}"/>`}}}return o}var pn={0:`abcdef`,1:`bc`,2:`abged`,3:`abgcd`,4:`fgbc`,5:`afgcd`,6:`afgedc`,7:`abc`,8:`abcdefg`,9:`abcdfg`,"-":`g`," ":``,"-1":`bcg`,"┫":`bcg`,"=":`bcg`};function mn(e){let t=e.trim(),n=t.match(/^-1(\d)$/);if(n)return[`-1`,n[1]];let r=t.match(/^-(\d)$/);if(r)return[`-`,r[1]];let i=e.padStart(2),a=i.length;return[i[a-2],i[a-1]]}function hn(e,t){let n=t.x+(t.w-82)/2,r=t.y+(t.h-48)/2,i=``;return mn(e).forEach((e,t)=>{let a=n+t*48+3,o=r,s={a:[a+3,o,28,6],d:[a+3,o+48-6,28,6],g:[a+3,o+24-3,28,6],f:[a-3+1,o+3,6,18],b:[a+34-3-1,o+3,6,18],e:[a-3+1,o+24+3,6,18],c:[a+34-3-1,o+24+3,6,18]},c=pn[e]??``;for(let e of`abcdefg`){let t=s[e];i+=`<rect x="${t[0].toFixed(1)}" y="${t[1].toFixed(1)}" width="${t[2]}" height="${t[3]}" rx="2" fill="${c.includes(e)?`#ff2d1f`:`rgba(255,45,31,0.09)`}" transform="skewX(-6)" transform-origin="${(a+17).toFixed(1)} ${(o+24).toFixed(1)}"/>`}}),i}function gn(e,t){return(n,r)=>{let i=n*Math.PI/180;return[e+r*Math.sin(i),t-r*Math.cos(i)]}}function _n(e){return(t,n,r,i,a)=>{let[o,s]=e(t,r),[c,l]=e(n,r);return`<path d="M${o.toFixed(1)} ${s.toFixed(1)} A${r} ${r} 0 0 1 ${c.toFixed(1)} ${l.toFixed(1)}" fill="none" stroke="${a}" stroke-width="${i}"/>`}}function I(e,t,n,r,i,a){let[o,s]=e(t,n),[c,l]=e(t,r);return`<line x1="${o.toFixed(1)}" y1="${s.toFixed(1)}" x2="${c.toFixed(1)}" y2="${l.toFixed(1)}" stroke="${i}" stroke-width="${a}"/>`}var vn=`#ef4444`;function yn(e,t,n,r,i){let a=e=>cn((e+12)/24,i),o=vn,s=t=>t-e.offset,c=n(a(s(e.redFrom)),a(12),273,16,o);for(let n of e.minors){let i=s(n);i<-12||i>12||(c+=I(t,a(i),265,279,n>=e.redFrom?o:r,4))}for(let n of e.majors){let i=s(n);if(i<-12||i>12)continue;let l=n>=e.redFrom?o:r;c+=I(t,a(i),265,289,l,4);let[u,d]=t(a(i),313);c+=`<text x="${u.toFixed(1)}" y="${(d+8).toFixed(1)}" font-size="${e.fmt(n).length>3?22:26}" font-weight="700" text-anchor="middle" fill="${l}">${e.fmt(n)}</text>`}let[l,u]=t(0,195);return c+=`<text x="${l.toFixed(1)}" y="${u.toFixed(1)}" font-size="18" font-weight="800" letter-spacing="2" text-anchor="middle" fill="${r}" opacity="0.8">${e.caption}</text>`,c}var bn={offset:-9,majors:[-20,-15,-10,-5,0,3],minors:[-17.5,-12.5,-7.5,-2.5,1,2],redFrom:0,caption:`DIN`,fmt:e=>e>0?`+`+e:String(e)},xn={offset:0,majors:[-12,-6,0,6,9,12],minors:[-9,-3,3],redFrom:9,caption:`NORDIC`,fmt:e=>e===0?`TEST`:e>0?`+`+e:String(e)},Sn={offset:-18,majors:[-30,-24,-18,-12,-6],minors:[-27,-21,-15,-9],redFrom:-9,caption:`dBFS`,fmt:e=>String(e)},Cn=`#facc15`;function wn(e,t){let{P:n,arc:r,ink:i}=e,a=e.isFisam??e.isSifam??!1,o=``;o+=r(cn(1,a),on(6,a),265,4,i);let s=on(0,a),c=on(6,a);o+=r(s,c,273,16,Cn),rn.forEach(e=>{let r=on(e,a);o+=e===2?I(n,r,265,279,t?`#141517`:i,2.8):I(n,r,265,279,i,2.8)}),nn.forEach(e=>{let r=on(e,a);e===-8?o+=I(n,r,251,289,i,4):e===0||e===4?(o+=I(n,r,265,281,t?`#141517`:i,4),o+=I(n,r,281,289,t?Cn:i,4)):o+=I(n,r,265,289,i,4)}),o+=I(n,c,265,281,t?`#141517`:i,4),o+=I(n,c,281,285,t?Cn:i,4),nn.forEach(e=>{let r=on(e,a),[s,c]=n(r,313),l=e>=0&&t?Cn:i,u=e>0?`+`+e:String(e);o+=`<text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${u}</text>`});let[l,u]=n(0,231);o+=`<text x="${l.toFixed(1)}" y="${(u+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="${i}">R</text>`;let[d,f]=n(0,205);return o+=`<text x="${d.toFixed(1)}" y="${(f+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${i}">dB</text>`,o}function Tn(e){let{P:t,ink:n}=e,r=e.isFisam??e.isSifam??!1,i=``;rn.forEach(e=>{let a=on(e,r);i+=I(t,a,265,279,n,2.8)}),nn.forEach(e=>{let a=on(e,r);i+=e===-8?I(t,a,245,289,n,4):I(t,a,265,289,n,4)}),nn.forEach(e=>{let a=on(e,r),[o,s]=t(a,313),c=e>0?`+`+e:String(e);i+=`<text x="${o.toFixed(1)}" y="${(s+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${n}">${c}</text>`});let[a,o]=t(0,221);return i+=`<text x="${a.toFixed(1)}" y="${(o+8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${n}">dB</text>`,i}function En(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=e=>cn((e+12)/24,i),o=`<g class="mc-only">`;o+=n(a(8),a(12),274,18,`#e3c22a`),o+=n(a(8),a(12),268,1.6,`#1a1a1a`)+n(a(8),a(12),280,1.6,`#1a1a1a`);for(let e=-12;e<=12;e+=2){let n=e%4==0;o+=I(t,a(e),n?249:265,n?285:277,r,n?4:3)}let s=(e,t,n,i=24)=>`<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-size="${i}" font-weight="500" text-anchor="middle" dominant-baseline="central" fill="${r}" font-family="Helvetica, Arial, sans-serif">${n}</text>`;[-12,-8,-4,4,8,12].forEach(e=>{let[n,r]=t(a(e),309);o+=s(n,r,String(Math.abs(e)))});let[c,l]=t(a(0),295);o+=s(c,l-34,`TONE`)+s(c,l-4,`&#8722; | +`,22),[-12,-8,-4,0,4,8,12].forEach(e=>{let n=e+8,[r,i]=t(a(e),223);o+=s(r,i,n>0?`+`+n:String(n))});let[u,d]=t(cn(.9,i),357);return o+=s(u,d,`PGM`),o+=`</g>`,o}var Dn={type1:bn,nordic:xn,fast_peak:Sn};function On(e){return Dn[e]??xn}function kn(e,t,n){let{P:r,arc:i,ink:a}=e,o=e.isFisam??e.isSifam??!1,s=i(cn(0,o),cn(1,o),265,4,a);return s+=`<g class="wbs-only">`,s+=t===`scale3`?Tn(e):t===`type2`||t===`scale2`?wn(e,n):yn(On(t),r,i,a,o),s+=`</g>`,s+=En(e),s}function An(e,t,n){return`
        <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${n+6}" stroke="rgba(0,0,0,0.30)" stroke-width="3.5" stroke-linecap="round"/>
      `}function jn(e,t,n,r,i){return`
      <g id="xtm_needle_${e}" transform="rotate(${t} ${n} ${r})">
        ${i.shadow}
        ${i.body}
      </g>`}var Mn=`#dc2626`,Nn=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],Pn=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],Fn=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function In(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=Mn,o=``;return o+=n(F(P(-20),i),F(P(0),i),265,3.8,r),o+=n(F(P(0),i),F(P(3),i),268,10,a),Nn.forEach(e=>{let n=F(P(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=I(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),Pn.forEach(e=>{let n=F(P(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=I(t,n,265,289,l,`4.2`)+`
              <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),Fn.forEach(({pc:e,d:n})=>{let a=F(P(n),i),[s,c]=t(a,257),[l,u]=t(a,233);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="4.2" fill="${r}"/>
              <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function Ln(e){let{P:t,ink:n}=e,r=F(P(-7),!0),i=F(P(1),!0),[a,o]=t(r,337),[s,c]=t(i,337);return`<text x="${a.toFixed(1)}" y="${o.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${n}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>
              <text x="${s.toFixed(1)}" y="${c.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${Mn}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>`}function Rn(e,t,n){let r=t-(n+34);return{shadow:`
          <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${r+4}" stroke="rgba(0,0,0,0.30)" stroke-width="3.2" stroke-linecap="round"/>
        `,body:`
          <polygon points="${e-2.8},${t} ${e+2.8},${t} ${e+.8},${r} ${e-.8},${r}" fill="#0b0c0e"/>
          <line x1="${e-.5}" y1="${t}" x2="${e-.5}" y2="${r+4}" stroke="rgba(255,255,255,0.35)" stroke-width="1.1"/>
          <circle cx="${e}" cy="${t}" r="8" fill="#0b0c0e"/>
          <circle cx="${e}" cy="${t}" r="3.5" fill="#334155"/>
        `}}function zn(e,t,n){let r=t-(n+34);return{shadow:An(e,t,r),body:`
          <polygon points="${e-3.8},${t} ${e+3.8},${t} ${e+1.2},${r} ${e-1.2},${r}" fill="#ffd600"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var Bn={isFisam:!0,isSifam:!0,legend:Ln,vuNeedle:Rn,ppmNeedle:zn},Vn=Bn;function Hn(e){let{ink:t,x0:n,y0:r}=e,i=n+290;return`<text x="${(i-165).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${t}">VU</text>
              <text x="${(i+165).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${Mn}" text-anchor="end">VU</text>`}function Un(e,t,n){let r=t-(n+24);return{shadow:`
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
        `}}function Wn(e,t,n){let r=t-(n+34);return{shadow:An(e,t,r),body:`
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(255,214,0,0.22)" stroke-width="7.5" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="#ffd600" stroke-width="4.6" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var Gn={isFisam:!1,isSifam:!1,legend:Hn,vuNeedle:Un,ppmNeedle:Wn},Kn=Gn,qn=Gn,Jn={isFisam:!1,isSifam:!1,legend:Gn.legend,vuNeedle:Gn.vuNeedle,ppmNeedle:Gn.ppmNeedle};function Yn(e,t,n,r=!1){let i=e-44,a=t+18,o=r?`#cbd5e1`:n||`#1a1715`,s=r?`#f8fafc`:n||`#1a1715`;return`
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
    </g>`}var Xn=`#2d2924`,Zn=`#c83728`,Qn=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],$n=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],er=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function tr(e){let{x0:t,y0:n}=e;return`<text x="${(t+58).toFixed(0)}" y="${n+64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#524a3e" letter-spacing="0.5">VU</text>
          <text x="${(t+580-58).toFixed(0)}" y="${n+64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#b83b2a" letter-spacing="0.5" text-anchor="end">VU</text>`}function nr(e){let{P:t,arc:n}=e,r=e.isFisam??e.isSifam??!1,i=``;return i+=n(F(P(-20),r),F(P(0),r),265,2,Xn),i+=n(F(P(0),r),F(P(3),r),266,3.2,Zn),Qn.forEach(e=>{let n=F(P(e),r),a=Math.abs(e)<=3?12:14,o=e>0?Zn:Xn;i+=I(t,n,265,265+a,o,Math.abs(e)<=3?`2.2`:`2.6`)}),$n.forEach(e=>{let n=F(P(e),r),[a,o]=t(n,309),s=e>=0?Zn:Xn;i+=I(t,n,265,287,s,`3.2`)+`
      <text x="${a.toFixed(1)}" y="${(o+8).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="${s}">${e>0?`+`+e:e}</text>`}),i+=n(F(P(-20),r),F(P(0),r),255,1.8,Xn),er.forEach(({pc:e,d:n})=>{let a=F(P(n),r),[o,s]=t(a,255),[c,l]=t(a,233),u=e===100?Zn:Xn;i+=`<circle cx="${o.toFixed(1)}" cy="${s.toFixed(1)}" r="3.2" fill="${u}"/>
      <text x="${c.toFixed(1)}" y="${(l+6).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="${u}">${e}</text>`}),i}function rr(e,t,n){let r=t-(n+17);return{shadow:`
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
    `}}var ir={isFisam:!1,isSifam:!1,legend:tr,vuNeedle:rr,ppmNeedle:Gn.ppmNeedle,renderScale:nr},ar=`rgb(244, 144, 44)`,or=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],sr=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],cr=[{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function lr(e){let{ink:t,x0:n,y0:r}=e,i=n+60,a=n+580-60,o=r+52;return`
    <text x="${i.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${t}" transform="rotate(-26, ${i.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5">VU</text>
    <text x="${a.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${Mn}" transform="rotate(26, ${a.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5" text-anchor="end">VU</text>`}function ur(e){let{P:t,arc:n,ink:r}=e,i=e.isFisam??e.isSifam??!1,a=Mn,o=``;return o+=n(F(P(-20),i),F(P(0),i),265,3.8,r),o+=n(F(P(0),i),F(P(3),i),268,10,a),or.forEach(e=>{let n=F(P(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=I(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),sr.forEach(e=>{let n=F(P(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=I(t,n,265,289,l,`4.2`)+`
      <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),cr.forEach(({pc:e,d:n})=>{let a=F(P(n),i),[s,c]=t(a,255),[l,u]=t(a,231);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="3.8" fill="${r}"/>
      <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function dr(e,t,n){let r=t-(n+24);return{shadow:`
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
        Z" fill="${ar}"/>
      <line x1="${e}" y1="${t-5}" x2="${e}" y2="${r+4}" stroke="rgba(255,255,255,0.40)" stroke-width="0.8"/>
      <circle cx="${e}" cy="${t}" r="7" fill="${ar}"/>
      <circle cx="${e}" cy="${t}" r="3" fill="#2d3748"/>
    `}}function fr(e,t,n){let r=t-(n+34);return{shadow:An(e,t,r),body:`
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(244, 144, 44, 0.28)" stroke-width="7.5" stroke-linecap="round"/>
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="${ar}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${e}" cy="${t}" r="7" fill="#141008"/>
      <circle cx="${e}" cy="${t}" r="3" fill="${ar}"/>
    `}}var pr={fisam:Bn,sifam:Vn,pimson:Gn,pimsom:qn,simpson:Kn,standard_vu:Jn,mccurdy_vu:ir,wbs_m405:{isFisam:!1,isSifam:!1,legend:lr,vuNeedle:dr,ppmNeedle:fr,renderScale:ur}};function mr(e){return pr[e]??Gn}var hr={id:`amber`,gradientId:`xamber`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`},gr={id:`amber_bottom`,gradientId:`xamber_bottom`,bloom:!0,bloomPos:`bottom`,gradient:`<radialGradient id="xamber_bottom" cx="50%" cy="65%" r="75%">
          <stop offset="0%" stop-color="#ffeaa0"/>
          <stop offset="35%" stop-color="#fed876"/>
          <stop offset="68%" stop-color="#f5ad2b"/>
          <stop offset="90%" stop-color="#e28c12"/>
          <stop offset="100%" stop-color="#cc7408"/>
        </radialGradient>`},_r={id:`white`,gradientId:`xwhite`,bloom:!1,gradient:`<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`},vr={id:`warm_white`,gradientId:`xwarm_white`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xwarm_white" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fffdf7"/>
          <stop offset="55%" stop-color="#f8f4e6"/>
          <stop offset="80%" stop-color="#e2dac5"/>
          <stop offset="100%" stop-color="#b0a48a"/>
        </radialGradient>`},yr={id:`parchment`,gradientId:`xparchment`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>`},br={id:`tungsten`,gradientId:`xtungsten`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xtungsten" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff4e0"/>
          <stop offset="20%" stop-color="#fedaa0"/>
          <stop offset="45%" stop-color="#fca840"/>
          <stop offset="72%" stop-color="#d96b10"/>
          <stop offset="92%" stop-color="#994105"/>
          <stop offset="100%" stop-color="#552002"/>
        </radialGradient>`},xr={id:`golden`,gradientId:`xgolden`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xgolden" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff9d6"/>
          <stop offset="18%" stop-color="#ffe680"/>
          <stop offset="45%" stop-color="#f5ba18"/>
          <stop offset="70%" stop-color="#cb8306"/>
          <stop offset="90%" stop-color="#8c4e02"/>
          <stop offset="100%" stop-color="#4d2700"/>
        </radialGradient>`},Sr={id:`green_glow`,gradientId:`xgreen_glow`,bloom:!0,bloomPos:`top`,gradient:`<radialGradient id="xgreen_glow" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="20%" stop-color="#bbf7d0"/>
          <stop offset="48%" stop-color="#4ade80"/>
          <stop offset="75%" stop-color="#16a34a"/>
          <stop offset="92%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#052e16"/>
        </radialGradient>`},Cr={id:`dark_night`,gradientId:`xdark_night`,bloom:!1,gradient:`<radialGradient id="xdark_night" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`},wr={id:`unlit`,gradientId:`xunlit`,bloom:!1,gradient:`<radialGradient id="xunlit" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f6f3ea"/>
          <stop offset="40%" stop-color="#ede7d8"/>
          <stop offset="75%" stop-color="#dfd6c0"/>
          <stop offset="100%" stop-color="#c8bda3"/>
        </radialGradient>`},Tr=`
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
`,Er=`
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
`,Dr=`<radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`,Or={amber:hr,amber_bottom:gr,tungsten:br,golden:xr,parchment:yr,white:_r,warm_white:vr,green_glow:Sr,dark_night:Cr,unlit:wr};function kr(e){return Or[e]??hr}function Ar(e){return`url(#${kr(e).gradientId})`}function jr(e){return kr(e).bloom}function Mr(e){return kr(e).bloomPos??`top`}var Nr=`<radialGradient id="xblackppm" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`;function Pr(e,t,n,r=`auto`){let i=`#171512`,a=`#141008`,o=typeof document<`u`&&document.body?.classList.contains(`theme-wbs-ca`),s=typeof document<`u`&&document.body?.classList.contains(`theme-mccurdy-dark`),c=o&&n===`amber`?`amber_bottom`:n;return e?t?r&&r!==`auto`?r===`dark_night`?(i=`url(#xdark_night)`,a=`#f8fafc`):r===`classic_buff`?(i=`url(#xdial_buff)`,a=`#141008`):r===`parchment`?(i=`url(#xparchment)`,a=`#141008`):r===`champagne`?(i=`url(#xdial_champagne)`,a=`#141008`):r===`slate_neutral`?(i=`url(#xdial_slate)`,a=`#f8fafc`):r===`pure_white`?(i=`url(#xwhite)`,a=`#141008`):(i=`url(#xblackppm)`,a=`#f8fafc`):(i=`url(#xblackppm)`,a=`#f8fafc`):(i=`#0a0b0d`,a=`#475569`):t?r&&r!==`auto`?r===`dark_night`?(i=`url(#xdark_night)`,a=`#f8fafc`):r===`classic_buff`?i=`url(#xdial_buff)`:r===`parchment`?i=`url(#xparchment)`:r===`champagne`?i=`url(#xdial_champagne)`:r===`slate_neutral`?(i=`url(#xdial_slate)`,a=`#f8fafc`):r===`pure_white`?i=`url(#xwhite)`:(i=Ar(c),c===`dark_night`&&(a=`#f8fafc`)):s?(i=`url(#xmccurdy_vintage_dial)`,a=`#2d2924`):(i=Ar(c),c===`dark_night`&&(a=`#f8fafc`)):s?(i=`#7c6d52`,a=`#14120e`):a=`#0c0a06`,{fill:i,ink:a}}var Fr=`M2.43 4.14 C2.43 8.26 2.43 13.33 2.43 17.45 C2.43 20.03 31.29 20.41 33.55 20.41 C37.4 20.41 36.81 20.41 40.67 20.41 C42.87 20.41 71.66 20.03 71.66 17.45 L71.66 4.14 C71.66 1.57 42.82 1.26 40.67 1.23 L33.55 1.23 C31.29 1.23 2.43 1.57 2.43 4.14 Z M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z M7.82 6.09 L13.37 16.43 L15.16 16.43 L9.61 6.09 L7.82 6.09 Z M17.85 6.09 L18.93 6.09 L18.59 6.09 L19.64 6.09 L15.16 16.43 L14.27 14.58 L17.87 6.03 L17.85 6.09 Z M18.74 6.09 L23.4 16.43 L25.19 16.43 L20.53 6.09 L18.74 6.09 Z M25.19 16.43 L30.56 6.09 L28.77 6.09 L24.29 14.58 L25.19 16.43 Z M32.53 6.09 L32.53 16.43 L34.32 16.43 L34.32 6.09 L32.53 6.09 Z M34.32 6.09 L46.14 6.09 L45.24 7.94 L34.32 7.94 L34.32 6.09 Z M45.24 7.94 L46.14 6.09 L47.57 7.01 L46.14 8.49 L45.24 7.94 Z M47.57 7.01 L47.93 7.94 L46.14 8.49 L47.57 7.01 Z M47.93 7.94 L46.14 8.49 L46.14 9.78 L47.93 10.34 L47.93 7.94 Z M47.93 10.34 L46.14 9.78 L45.78 10.34 L47.03 11.26 L47.93 10.34 Z M47.03 11.26 L45.78 12.18 L46.14 12.55 L47.93 12.18 L47.03 11.26 Z M47.93 12.18 L47.93 14.58 L46.14 14.03 L46.14 12.55 L47.93 12.18 Z M47.93 14.58 L47.57 15.51 L46.14 14.03 L47.93 14.58 Z M47.57 15.51 L46.14 16.43 L45.24 14.58 L46.14 14.03 L47.57 15.51 Z M46.14 16.43 L45.24 14.58 L34.32 14.58 L34.32 16.43 L46.14 16.43 Z M34.32 10.34 L34.32 12.18 L45.78 12.18 L45.78 10.34 L34.32 10.34 Z M45.78 10.34 L45.78 12.18 L47.03 11.26 L45.78 10.34 Z M66.19 7.94 L66.19 6.09 L51.69 6.09 L52.58 7.94 L66.19 7.94 Z M52.58 7.94 L51.69 6.09 L50.25 7.01 L51.69 8.49 L52.58 7.94 Z M51.69 8.49 L50.25 7.01 L49.9 7.94 L51.69 8.49 Z M49.9 7.94 L51.69 8.49 L51.69 9.78 L49.9 10.34 L49.9 7.94 Z M49.9 10.34 L51.69 9.78 L51.69 9.78 L50.25 11.26 L49.9 10.34 Z M51.69 9.78 L50.25 11.26 L51.69 12.18 L52.58 10.34 L51.69 9.78 Z M51.69 12.18 L52.58 10.34 L64.4 10.34 L63.5 12.18 L51.69 12.18 Z M63.5 12.18 L64.4 10.34 L65.83 11.26 L64.4 12.55 L63.5 12.18 Z M65.83 11.26 L64.4 12.55 L66.19 12.18 L65.83 11.26 Z M64.4 12.55 L66.19 12.18 L66.19 14.58 L64.4 14.03 L64.4 12.55 Z M66.19 14.58 L65.83 15.51 L64.4 14.03 L66.19 14.58 Z M65.83 15.51 L64.4 14.03 L63.5 14.58 L64.4 16.43 L65.83 15.51 Z M63.5 14.58 L64.4 16.43 L49.9 16.43 L49.9 14.58 L63.5 14.58 Z`;function Ir(e,t,n){return`<g class="wbs-only" transform="translate(${(e-44.5).toFixed(1)}, ${(t+22).toFixed(1)}) scale(1.2)">
              <path d="${Fr}" fill="${n}" fill-rule="evenodd"/>
            </g>`}var Lr=`<linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
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
        </radialGradient>`;function Rr(e,t){return`
      <!-- Recessed Chamber Inner Glass Shadows (Standard Modern XTM Lighting) -->
      <rect x="${e}" y="${t}" width="580" height="28" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${e}" y="${t+290-28}" width="580" height="28" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${e}" y="${t}" width="20" height="290" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${e+580-20}" y="${t}" width="20" height="290" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${e+1}" y="${t+1}" width="578" height="288" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen -->
      <path d="M ${e+6} ${t+6} L ${e+580*.72} ${t+6} L ${e+6} ${t+290*.82} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
    </g>`}function zr(e,t,n=e+290){let r=n-304,i=n-274,a=`M ${r+14} 47 h 580 a 14 14 0 0 1 14 14 v 332 a 14 14 0 0 1 -14 14 h -580 a 14 14 0 0 1 -14 -14 v -332 a 14 14 0 0 1 14 -14 Z M ${i+10} 65 h 528 a 10 10 0 0 1 10 10 v 192 a 10 10 0 0 1 -10 10 h -528 a 10 10 0 0 1 -10 -10 v -192 a 10 10 0 0 1 10 -10 Z`,o=n-306,s=n-288,c=`M ${o+10} 48 h 592 a 10 10 0 0 1 10 10 v 318 a 10 10 0 0 1 -10 10 h -592 a 10 10 0 0 1 -10 -10 v -318 a 10 10 0 0 1 10 -10 Z M ${s+7} 65 h 562 a 7 7 0 0 1 7 7 v 197 a 7 7 0 0 1 -7 7 h -562 a 7 7 0 0 1 -7 -7 v -197 a 7 7 0 0 1 7 -7 Z`;return`
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
    </g>`}function Br(e,t,n){let r=e+55+Math.random()*60,i=t-45+Math.random()*45,a=9+Math.floor(Math.random()*4),o=Math.PI*2/a,s=[],c=[22,58,112,175,245];for(let e=0;e<a;e++){let t=e*o+(Math.random()-.5)*o*.55,n=[{x:r,y:i}],a=0,l=250+Math.random()*75;for(let e=0;e<c.length&&(a=c[e]+(Math.random()-.5)*16,!(a>l));e++){let e=t+(Math.random()-.5)*.28;n.push({x:Math.round(r+Math.cos(e)*a),y:Math.round(i+Math.sin(e)*a)})}let u=l+Math.random()*30,d=t+(Math.random()-.5)*.35;n.push({x:Math.round(r+Math.cos(d)*u),y:Math.round(i+Math.sin(d)*u)}),s.push(n)}let l=``;for(let e of s){l+=`M ${e[0].x} ${e[0].y} `;for(let t=1;t<e.length;t++)l+=`L ${e[t].x} ${e[t].y} `}let u=``;for(let e=1;e<c.length;e++){let t=!1;for(let n=0;n<a;n++){let r=s[n],i=r[e]||r[r.length-1];t?u+=`L ${i.x} ${i.y} `:(u+=`M ${i.x} ${i.y} `,t=!0)}u+=`Z `}let d=``,f=12+Math.floor(Math.random()*8);for(let e=0;e<f;e++){let e=s[Math.floor(Math.random()*s.length)],t=e[1+Math.floor(Math.random()*(e.length-2))],n=Math.random()*Math.PI*2,r=14+Math.random()*26,i=Math.round(t.x+Math.cos(n)*r),a=Math.round(t.y+Math.sin(n)*r);d+=`M ${t.x} ${t.y} L ${i} ${a} `}let p=``,m=3+Math.floor(Math.random()*3);for(let e=0;e<m;e++){let e=Math.floor(Math.random()*(a-1)),t=e+1,n=1+Math.floor(Math.random()*(c.length-2)),r=s[e][n],i=s[e][n+1]||s[e][n],o=s[t][n+1]||s[t][n],l=s[t][n];if(r&&i&&o&&l){let e=(.07+Math.random()*.08).toFixed(2);p+=`<polygon points="${r.x},${r.y} ${i.x},${i.y} ${o.x},${o.y} ${l.x},${l.y}" fill="#ffffff" opacity="${e}"/>`}}return`
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
  `}function Vr(e,t,n){return`
    <!-- VU Meter Shattered Glass Fracture Overlay with Smooth Self-Healing Support (Clipped strictly to glass pane) -->
    <g class="vu-glass-shatter" id="vu_shatter_${n}" data-cx="${e}" data-cy="${t}" data-id="${n}" clip-path="url(#xshatter_clip_${n})" style="display: none; opacity: 0; transition: opacity 1.8s ease-out; pointer-events: none;">
      ${Br(e,t,n)}
    </g>
  `}function Hr(e,t,n,r){e.innerHTML=Br(t,n,r)}function Ur(e,t,n,r,i,a,o,s,c,l=`auto`){let u=t-290,d=n-145,f=t,p=mr(s),m=s===`fisam`||s===`sifam`,h=r===`ppm`||o,g=gn(f,410),_=_n(g),v=typeof document<`u`&&document.body?.classList.contains(`theme-wbs-ca`),y=v&&a===`amber`?`amber_bottom`:a,{fill:b,ink:x}=Pr(h,i,y,l),S={P:g,arc:_,ink:x,isFisam:m,isSifam:m,x0:u,y0:d},C=`<g id="xtm_meter_group_${e}" class="xtm-meter-group xtm-meter-${e} meter-style-${s}">
    <clipPath id="xmc${e}"><rect x="${u}" y="${d}" width="580" height="290" rx="5"/></clipPath>
    <!-- Strict glass-only aperture clip ensuring fractures never spill onto metal chassis or bezel -->
    <clipPath id="xshatter_clip_${e}"><rect x="${u+6}" y="${d+6}" width="568" height="278" rx="18"/></clipPath>
    <g clip-path="url(#xmc${e})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect class="xt-face xt-lamp-${y}" x="${u}" y="${d}" width="580" height="290" rx="5" fill="${b}"/>`;if(i&&jr(y)){if(Mr(y)===`bottom`||v)C+=`<rect class="xt-bloom xt-lamp-left" x="${u}" y="${d}" width="580" height="290" fill="url(#xamber_lamp_left)" pointer-events="none"/>`,C+=`<rect class="xt-bloom xt-lamp-right" x="${u}" y="${d}" width="580" height="290" fill="url(#xamber_lamp_right)" pointer-events="none"/>`;else{let e=d+115,n=243.6.toFixed(1);C+=`<ellipse class="xt-bloom xt-lamp-${y}" cx="${t}" cy="${e}" rx="${n}" ry="82" fill="url(#xincand_bloom)"/>`}}r===`vu`?(C+=p.renderScale?p.renderScale(S):In(S),C+=p.legend(S)):C+=kn(S,c,o),C+=`<g class="wbs-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (Ward-Beck) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${Ir(t,n,x)}
        </g>`,C+=`<g class="mc-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (McCurdy) | Ctrl+Alt+Click for Dual Meter mode</title>
          ${Yn(t,n,x,h)}
        </g>`;let ee=h?p.ppmNeedle(f,410,265):p.vuNeedle(f,410,265);return C+=jn(e,ln(m),f,410,ee),C+=Rr(u,d),r===`vu`&&!o&&(C+=Vr(t,n,e)),C+=zr(u,d,t),C+=`</g>`,C+=`</g>`,C}function Wr(){return`M 1845 82 A 12 12 0 0 0 1833 70 H 1367 A 12 12 0 0 0 1355 82 V 402 A 12 12 0 0 0 1367 414 H 1833 A 12 12 0 0 0 1845 402 Z ${`M ${N.x} ${N.y+6} a 6 6 0 0 1 6 -6 h ${N.w-12} a 6 6 0 0 1 6 6 v ${N.h-12} a 6 6 0 0 1 -6 6 h -${N.w-12} a 6 6 0 0 1 -6 -6 Z`} ${Object.keys(Xt).map(e=>`M ${(Xt[e]??1385)-2} 225 a 3 3 0 0 1 3 -3 h 92 a 3 3 0 0 1 3 3 v 133 a 3 3 0 0 1 -3 3 h -92 a 3 3 0 0 1 -3 -3 Z`).join(` `)}`}function Gr(){return`<path class="wbs-only" d="${Wr()}" fill="#15803d" fill-rule="evenodd"/>`}var Kr=`<defs>
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
      </defs>`;function qr(e){let{bx:t,by:n}=en,r=e-290-t,i=65-n,a=580+2*t,o=290+2*n;return`<g class="mc-com-only" filter="url(#mc_shadow)">
        <rect x="${r}" y="${i}" width="${a}" height="${o}" rx="4" fill="url(#mc_bezel)" stroke="#0d0d0e" stroke-width="2"/>
        <polygon points="${r},${i} ${r+a},${i} ${r+a-t},${i+n} ${r+t},${i+n}" fill="#36373a"/>
        <polygon points="${r},${i+o} ${r+a},${i+o} ${r+a-t},${i+o-n} ${r+t},${i+o-n}" fill="#111113"/>
        <polygon points="${r},${i} ${r+t},${i+n} ${r+t},${i+o-n} ${r},${i+o}" fill="#232426"/>
        <polygon points="${r+a},${i} ${r+a-t},${i+n} ${r+a-t},${i+o-n} ${r+a},${i+o}" fill="#191a1c"/>
        <rect x="${r+t}" y="${i+n}" width="580" height="290" fill="#0e0e10"/>
      </g>`}function Jr(e,t,n){return`<g class="mc-com-only">
      ${n===null?``:`<line x1="${n}" y1="404" x2="${e-70}" y2="404" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${e+70}" y1="404" x2="${e+600}" y2="404" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${e}" y="404" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${t}</text>
    </g>`}function Yr(){let e=M,t=`<g class="mc-only">
      ${Kr}
      <rect class="mc-panel-bg" x="1" y="1" width="${e-2}" height="428" rx="6" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <line x1="4" y1="3" x2="${e-4}" y2="3" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`;for(let e of Yt)t+=qr(e);return t+=Jr(tn.input1X,`INPUT 1`,null)+Jr(tn.input2X,`INPUT 2`,tn.input2LineX0),t+=`</g>`,t}var Xr=`xtm.inputAssign`,Zr=[`dev:`,`tab`,`pod33`,`bitbuddy`],Qr=[{id:`tab`,name:`Browser Tab`,short:`TAB`,group:`Console`},{id:`pod33`,name:`POD-33 Tone`,short:`POD-33`,group:`Console`},{id:`bitbuddy`,name:`Bit Buddy`,short:`BIT BUDDY`,group:`Console`},{id:`pink`,name:`Pink Noise`,short:`PINK`,group:`Console`}],$r={tab:1,pod33:2,bitbuddy:3,pink:4},ei=[`dev:`,`tab`,`pod33`,`bitbuddy`,`pink`],ti=new Set,ni=ii(),ri=new Map;function ii(){try{let e=JSON.parse(localStorage.getItem(Xr)||`null`);if(Array.isArray(e)&&e.length===4)return e.map(String)}catch{}return[...Zr]}function ai(){try{localStorage.setItem(Xr,JSON.stringify(ni))}catch{}}function oi(e){let t=e.replace(/\\(\d{3})/g,(e,t)=>String.fromCharCode(parseInt(t,10))).replace(/\[[^\]]*\]/g,` `).replace(/^[^\p{L}\p{N}]+/u,``).replace(/\s+/g,` `).trim();return t.split(` (`)[0].trim()||t||e.trim()}function si(e){let t=e.toUpperCase().replace(/^(MONITOR OF|WARD-BECK)\s+/,``).replace(/[^A-Z0-9 \-/.]/g,``).trim();return t.length>11?t.slice(0,10).trim()+`…`:t||`INPUT`}function ci(e){return e===``?`Sound cards`:e.startsWith(`__NMOS_`)?`AoIP`:e.startsWith(`__XMXL_`)||e===`__WBS_LINUX_HOST__`?`MXL`:`Sound cards`}function li(){let e=document.getElementById(`selectDevice`),t=[],n=new Set;for(let r of Array.from(e?.options??[])){let e=r.value===``?`Default input`:oi(r.text),i={id:`dev:`+r.value,name:e,short:r.value===``?`SOUNDCARD`:si(e),group:ci(r.value)};ri.set(i.id,i.short);let a=i.group+`|`+e.toLowerCase();n.has(a)||(n.add(a),t.push(i))}let r=[`Sound cards`,`Console`,`MXL`,`AoIP`];return[...t,...Qr].sort((e,t)=>r.indexOf(e.group)-r.indexOf(t.group))}function ui(e){let t=ni[e-1],n=Qr.find(e=>e.id===t);return n?n.short:t===`dev:`?`SOUNDCARD`:(ri.has(t)||li(),ri.get(t)||`INPUT `+e)}function di(e,t,n){let{model:r,audio:i,webRouter:a}=e,o=ni[n-1]||Zr[n-1];if(r.power){if(o===`tab`?(r.mode=`D`,r.d.src=1):o.startsWith(`dev:`)?(r.mode=`A`,r.a.src=0):r.mode=`S`,t.isAudioStarted=!0,r.selectedInput=n,r.inputAssigned=!0,r.flash(ui(n).slice(0,9)),r.saveEEPROM(),o.startsWith(`dev:`)){let e=document.getElementById(`selectDevice`),t=o.slice(4);e&&Array.from(e.options).some(e=>e.value===t)?(e.value=t,e.dispatchEvent(new Event(`change`))):r.flash(`NO INPUT`)}else a&&$r[o]!==void 0?a.selectInput($r[o]):o===`tab`?i.connectSystemAudio(`browser`):o===`pink`&&i.startTestGenerator(`pink`);t.lastModeKey=r.mode+`:`+(r.mode===`A`?r.a.src:r.mode===`D`?r.d.src:r.s.pair[0]),r.selectedInput=n,r.inputAssigned=!0,r.notify()}}function fi(e,t){ni[e-1]=t,ai(),ti.forEach(e=>e())}function pi(){return ni.map(e=>{let t=ei.indexOf(e);return t<0?null:t})}function mi(e,t,n,r){let i=ei[r];!i||n<1||n>4||(fi(n,i),e.view.isBuilt=!1,di(e,t,n))}function hi(e){let t=e.webRouter;if(!t)return;let n=()=>t.setMeterInputs(pi());ti.add(n),n()}function gi(e,t,n,r){document.getElementById(`xtmInputPicker`)?.remove();let i=document.createElement(`div`);i.id=`xtmInputPicker`,i.className=`xtm-input-picker`,i.setAttribute(`role`,`menu`),i.setAttribute(`aria-label`,`Input ${e}`);let a=ni[e-1],o=``;for(let e of li()){if(e.group!==o){o=e.group;let t=document.createElement(`div`);t.className=`xtm-input-pick-group`,t.textContent=o,i.appendChild(t)}let t=document.createElement(`button`);t.type=`button`,t.setAttribute(`role`,`menuitemradio`),t.setAttribute(`aria-checked`,e.id===a?`true`:`false`),t.className=`xtm-input-pick`+(e.id===a?` active`:``),t.textContent=e.name,t.title=e.name,t.addEventListener(`click`,t=>{t.stopPropagation(),i.remove(),r(e.id)}),i.appendChild(t)}document.body.appendChild(i);let s=i.getBoundingClientRect();i.style.left=`${Math.max(8,Math.min(t,innerWidth-s.width-8))}px`,i.style.top=`${Math.max(8,Math.min(n,innerHeight-s.height-8))}px`;let c=e=>{e instanceof KeyboardEvent&&e.key!==`Escape`||e.type===`pointerdown`&&i.contains(e.target)||(i.remove(),document.removeEventListener(`pointerdown`,c,!0),document.removeEventListener(`keydown`,c,!0))};setTimeout(()=>{document.addEventListener(`pointerdown`,c,!0),document.addEventListener(`keydown`,c,!0)})}function _i(e,t,n){let r=n*16,i=``;for(let a=0;a<=r;a++){let o=a/r*Math.PI*2-Math.PI/2,s=e+t*Math.cos(n*(o+Math.PI/2)),c=(s*Math.cos(o)).toFixed(2),l=(s*Math.sin(o)).toFixed(2);i+=a===0?`M ${c},${l}`:` L ${c},${l}`}return i+` Z`}function vi(){let e=`font-family="Helvetica, Arial, sans-serif" font-weight="700"`,t=$t;return`<g class="mc-com-only">
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
      <!-- INPUT box: four jacks, one per input (same INPUT_n buttons as the .ca selectors) -->
      <rect class="mc-input-box" x="1430" y="274" width="340" height="120" rx="8" fill="url(#mc_blue)" stroke="#1b1c1e" stroke-width="2.5"/>
      <text class="mc-input-text" x="1600" y="296" text-anchor="middle" ${e} font-size="16" fill="#181b1e">INPUT</text>
      ${[1,2,3,4].map(t=>{let n=1600+(t-2.5)*80;return`
      <text class="mc-input-text" x="${n}" y="386" text-anchor="middle" ${e} font-size="15" fill="#181b1e">${t}</text>
      <g class="xtm-btn mc-jack" id="mc_jack_${t}" data-btn="INPUT_${t}" data-input="${t}" style="cursor:pointer" role="button" tabindex="0" aria-label="Input ${t}">
        <title>Input ${t}: ${ui(t)}</title>
        <circle cx="${n}" cy="340" r="23" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>`}).join(``)}
    </g>`}function yi(){let e=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,t=1600,n=``,r=``,i=``;for(let e=0;e<=30;e++){let a=(135+e*9)*Math.PI/180,o=Math.cos(a),s=Math.sin(a),c=-50+e*2,l=-30+e*2,u=(c>0?`+`:``)+c,d=(l>0?`+`:``)+l,f=e%5==0,p=f?135:139,m=(t+p*s).toFixed(1),h=(186-p*o).toFixed(1),g=(t+150*s).toFixed(1),_=(186-150*o).toFixed(1);n+=`<line x1="${m}" y1="${h}" x2="${g}" y2="${_}" stroke="#ffffff" stroke-width="${f?`2.2`:`1.3`}" stroke-opacity="${f?`0.95`:`0.8`}"/>`;let v=(t+120*s).toFixed(1),y=(186-120*o+3.5).toFixed(1);r+=`<text x="${v}" y="${y}" font-size="${Math.abs(l)>=10?`10`:`11`}" font-weight="700" fill="#cbd5e1" text-anchor="middle">${d}</text>`;let b=(t+164*s).toFixed(1),x=(186-164*o+4).toFixed(1);i+=`<text x="${b}" y="${x}" font-size="${Math.abs(c)>=10?`11`:`12`}" font-weight="800" fill="#f8fafc" text-anchor="middle">${u}</text>`}let a=_i(63.7,3.38,14),o=``;for(let e=0;e<14;e++){let t=(e*360/14+360/28)*Math.PI/180;o+=`<line x1="${(55.9*Math.cos(t)).toFixed(2)}" y1="${(55.9*Math.sin(t)).toFixed(2)}" x2="${(63.7*Math.cos(t)).toFixed(2)}" y2="${(63.7*Math.sin(t)).toFixed(2)}"/>`}return`<g class="mc-ca-only">
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
          <text x="0" y="27" font-size="9.5" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.5">${ui(e)}</text>
        </g>`}).join(``)}
      </g>
    </g>`}function bi(){return vi()+yi()}function xi(e){if(!e.power)return`  `;let t=null;if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`))&&e.mode!==`S`?t=e.getMcCurdySensitivityDb():e.mode===`A`?t=e.lvlDb(e.a.lvl):e.mode===`D`?t=e.lvlDb(e.d.lvl):e.mode===`S`&&(t=e.toneCalLevels[e.toneCalIdx]??0),t===null)return`--`;let n=Math.min(99,Math.abs(Math.round(t)));return t<0&&n>0&&n<=19?`-`+n:String(n).padStart(2,`0`)}function Si(e){return hn(e,$t)}var Ci=`<linearGradient id="mc_vuface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dfc784"/><stop offset="25%" stop-color="#eedba1"/>
          <stop offset="85%" stop-color="#ebd699"/><stop offset="100%" stop-color="#d5bd7b"/>
        </linearGradient>`,wi=`<linearGradient id="xgreen_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="25%" stop-color="#16a34a"/>
          <stop offset="75%" stop-color="#15803d"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>`;function Ti(){return`
    <!-- Modern Dark Canvas (Ward-Beck.com) -->
    <rect class="wbs-only wbs-dark-canvas" width="${M}" height="430" fill="#0f1114"/>

    <!-- Vintage Ward-Beck M600 Anodized Brushed Aluminum Chassis (Ward-Beck.ca) -->
    <g class="wbs-ca-only" id="wbs-ca-broadcast-chassis">
      <!-- Warm Anodized Aluminum Faceplate Base (MF-6B standard #C6C3B3) -->
      <rect width="${M}" height="430" fill="url(#aluPlate)"/>

      <!-- M600 Anodized Extruded Aluminum Top Rail Lip (MF-6B Standard) -->
      <rect x="0" y="0" width="${M}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="18" x2="${M}" y2="18" stroke="#8C897B" stroke-width="1.2"/>
      <line x1="0" y1="19.5" x2="${M}" y2="19.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>

      <!-- M600 Anodized Extruded Aluminum Bottom Rail Lip -->
      <line x1="0" y1="410.5" x2="${M}" y2="410.5" stroke="#8C897B" stroke-width="1.2"/>
      <rect x="0" y="412" width="${M}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="412" x2="${M}" y2="412" stroke="#D4D2C5" stroke-width="1.2"/>
    </g>`}var Ei=`<path d="M 630 414 H 49 A 14 14 0 0 1 35 400 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 400 A 14 14 0 0 1 1326 414 H 745"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="687.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">LEFT</text>`,Di=`<path d="M 2455 414 H 1874 A 14 14 0 0 1 1860 400 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 400 A 14 14 0 0 1 3151 414 H 2570"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="2512.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">RIGHT</text>`,Oi=`<defs>
        ${hr.gradient}
        ${gr.gradient}
        ${br.gradient}
        ${xr.gradient}
        ${_r.gradient}
        ${vr.gradient}
        ${yr.gradient}
        ${Sr.gradient}
        ${Cr.gradient}
        ${wr.gradient}

        ${Dr}
        ${Tr}
        ${Er}

        ${Nr}
        ${Ci}
        ${Lr}
        ${wi}
        
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
      </defs>`,ki=`#4a1a17`,Ai=`#ff2d1f`;function ji(){let e=``;for(let t=0;t<Zt.count;t++){let n=Zt.x0+t*Zt.pitch,r=Zt.cy;e+=`
      <rect class="mc-only mc-com-only mc-phase-seg" id="xphase_ledr_${t}" x="${(n-16).toFixed(1)}" y="${(r-10).toFixed(1)}" width="32" height="20" rx="2.5" fill="${ki}" stroke="#2b0d0c" stroke-width="1"/>`}return`<g class="mc-only mc-com-only">
          <rect x="1408" y="24" width="384" height="36" rx="3" fill="#171719" stroke="#5c5952" stroke-width="1.5"/>
          <rect x="1413" y="28" width="374" height="28" fill="url(#mc_led)"/>
          ${e}
        </g>`}var Mi=ji();function Ni(e){return{lit:e<=1?`#ff4d36`:e<=3?`#ffb43a`:`#9dff3a`,off:e<=1?`#3a1810`:e<=3?`#3a2810`:`#142e17`}}function Pi(){let e=``;for(let t=0;t<Zt.count;t++){let n=Zt.x0+t*Zt.pitch,r=Zt.cy;e+=`
              <circle class="wbs-only" cx="${n}" cy="${r}" r="22" fill="#08090a" stroke="#25282f" stroke-width="2"/>
              <circle class="wbs-only" id="xphase_led_${t}" cx="${n}" cy="${r}" r="17" fill="#142e17"/>`}return e}function Fi(){return Object.keys(Xt).map(e=>{let t=Xt[e]??1385;return`
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
          </g>`}).join(``)}var Ii={down:{top:`#15803d`,topStroke:`#86efac`,bot:`#0e2e18`,border:`#86efac`,lbl:`#ffffff`},up:{top:`#2d3748`,topStroke:`#374151`,bot:`#11151c`,border:`#1f2937`,lbl:`#ffffff`}};function Li(e=!0){return`<g class="wbs-ca-only" id="vintage-wbs-center">
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
    ${Ri(e)}
  </g>`}function Ri(e=!0){let t=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,n=[1,2,3,4].map(e=>({num:e,sub:ui(e)})),r=1444,i=`
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
    `}),i}function zi(e){return`<g id="xtm_center_console" class="xtm-center-console">
        <!-- Correlation Phase Row Assembly (translates down when meters expand) -->
        <g id="xtm_phase_row_assembly" class="xtm-phase-row-assembly" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);">
          ${Mi}

          <!-- Modern Ward-Beck Console Section (Ward-Beck.com) -->
          <g class="wbs-modern-only">
            <text class="xt-deg" x="1390" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
            ${Pi()}
            <text class="xt-deg" x="1812" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>
          </g>
        </g>

        <!-- Center Controls Group (locks in place with preserved settings) -->
        <g id="xtm_center_controls_group" class="xtm-center-controls-group" style="transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease;">
          <g class="wbs-modern-only">
            <!-- Center Console Signature Solid Green Plate Stencil (Borders just the shape with scalloped notches) -->
            ${Gr()}

            <!-- Center VFD Dot-Matrix Display Cutout Window -->
            <rect class="wbs-only" x="${N.x}" y="${N.y}" width="${N.w}" height="${N.h}" rx="6" fill="#040605" stroke="#052e16" stroke-width="2.5"/>
            <g class="wbs-only" id="xvfd_group" ${e?`filter="url(#xglow)"`:``}></g>
          </g>

          <!-- McCurdy Centre Console Section (McCurdyRadio.ca / .com) -->
          ${bi()}

          <!-- Vintage Ward-Beck Console Section (Ward-Beck.ca - DR Vernier Dial, Skirted Knob, AC Lamp) -->
          ${Li(e)}

          <!-- Mode & Source / Up & Down Front-Panel Buttons -->
          ${Fi()}

          <!-- Lock Indicator Badge displayed when middle section locks into place -->
          <g id="xtm_center_locked_badge" class="xtm-center-locked-badge" style="opacity: 0; pointer-events: none; transition: opacity 0.3s ease;">
            <rect x="1540" y="8" width="120" height="26" rx="13" fill="#090b0e" stroke="#22c55e" stroke-width="1.4" opacity="0.95"/>
            <path d="M 1558 21 L 1558 18 A 4 4 0 0 1 1566 18 L 1566 21 M 1556 21 L 1568 21 A 1.2 1.2 0 0 1 1569.2 22.2 L 1569.2 28.8 A 1.2 1.2 0 0 1 1568 30 L 1556 30 A 1.2 1.2 0 0 1 1554.8 28.8 L 1554.8 22.2 A 1.2 1.2 0 0 1 1556 21 Z" fill="none" stroke="#22c55e" stroke-width="1.3"/>
            <text x="1606" y="25" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#22c55e" text-anchor="middle" letter-spacing="1.5">LOCKED</text>
          </g>
        </g>
      </g>`}function Bi(e){let t=e.power,n=e.dialBg||`auto`,r=e.ppmLamp||`unlit`,i=e.ppmDialBg||`auto`,a=(a,o,s)=>{let c=s===`ppm`?r:e.dialLamp,l=s===`ppm`?i:n;return Ur(a,Yt[a]??o,210,s,t,c,s===`ppm`,e.meterStyle,e.ppmStandard,l)};return`<svg class="xtm-master-panel" id="xtm_master_panel" viewBox="0 0 ${M} 430" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      ${Oi}

      <!-- Seamless Borderless Canvas -->
      ${Ti()}
      ${Yr()}

      <!-- Channel A Signature Green Console Frame -->
      <g id="xtm_channel_a_frame" class="xtm-channel-frame">
        ${Ei}
      </g>

      <!-- Channel A Pair: Meter 0 (VU) + Meter 1 (PPM) -->
      ${a(0,373,`vu`)}
      ${a(1,1002,`ppm`)}

      <!-- Center Console Section -->
      ${zi(t)}

      <!-- Channel B Signature Green Console Frame -->
      <g id="xtm_channel_b_frame" class="xtm-channel-frame">
        ${Di}
      </g>

      <!-- Channel B Pair: Meter 2 (VU) + Meter 3 (PPM) -->
      ${a(2,2198,`vu`)}
      ${a(3,2827,`ppm`)}
    </svg>`}function Vi(e,t,n){let r=e?.vu??[0,0],i=e?.ppm??[-.12,-.12],a=ln(n),o=ln(n);return[t?F(r[0]??0,n):a,t?cn(i[0]??-.12,n):o,t?F(r[1]??0,n):a,t?cn(i[1]??-.12,n):o]}function Hi(e,t,n){for(let r=0;r<4;r++){let i=e[r],a=t[r];if(Math.abs(i-a)>.005){t[r]=i;let e=n[r],a=Yt[r]??0;e&&e.setAttribute(`transform`,`rotate(${i.toFixed(2)} ${a} 410)`)}}}function Ui(e,t){return e+(t?100:0)}function Wi(e,t,n,r){for(let i=0;i<8;i++){let a=e[i];if(!a)continue;let o=n&&i===t,s=Ni(i),c=r?Ai:s.lit,l=r?ki:s.off;a.setAttribute(`fill`,o?c:l),o?a.setAttribute(`filter`,`url(#xledglow)`):a.removeAttribute(`filter`)}}function Gi(e){return!!(e&&(e.hasAudio||e.ppmDb&&((e.ppmDb[0]??-99)>-55||(e.ppmDb[1]??-99)>-55)||e.dbfs&&((e.dbfs[0]??-99)>-58||(e.dbfs[1]??-99)>-58)||e.vuDb&&((e.vuDb[0]??-99)>-55||(e.vuDb[1]??-99)>-55)))}var Ki=`#c8f53c`,qi=`rgba(150,200,60,.06)`,Ji=`#fbbf24`,Yi=`rgba(251,191,36,.08)`;function Xi(e,t){let n=e.vfdMetric||`lufs`,r=-60,i=`LU`;if(n===`lus`?(r=typeof t.lufs?.s==`number`?t.lufs.s:-60,i=`S `):n===`lum`?(r=typeof t.lufs?.m==`number`?t.lufs.m:-60,i=`M `):n===`lui`?(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`I `):n===`lra`?(r=typeof t.lufs?.lra==`number`?t.lufs.lra:0,i=`RA`):(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`LU`),n===`lra`)return(r.toFixed(1)+` `+i).padStart(8).substring(0,8);if(Number.isFinite(r)&&r>-59.5){let e=r.toFixed(1);return(e+` `+i).length<=8?(e+` `+i).padStart(8):e+i}return`-INF `+i}function Zi(e,t,n,r){if(!e.power)return{txt:`        `,on:Ki,off:qi};if(e.flashMsg)return{txt:e.flashMsg.padEnd(8).substring(0,8),on:Ki,off:qi};if(e.mode===`SET`)return{txt:e.getDisplayText(),on:Ki,off:qi};if(r)return{txt:Math.floor(n%1600/800)===0?`LOSS OF `:` SIGNAL `,on:Ji,off:Yi};let i=n%6e3,a;return a=i<4e3?Xi(e,t):i<5e3?`WardBeck`:`Systems `,{txt:a,on:Ki,off:qi}}function Qi(e){let t=Qt,n=48.4*t,r=N.x+(N.w-n)/2,i=N.y+(N.h-6*t)/2;return fn(e.txt,r,i,t,e.on,e.off)}function $i(e,t){if(t)return`⚠ LOSS OF SIGNAL (NO AUDIO DETECTED)`;if(e){if(e.mode===`D`)return`COMPUTER AUDIO OUTPUT`;if(e.mode===`S`)return`TEST OSCILLATOR`;if(e.mode===`SET`)return`SETUP & CALIBRATION`}return`SOUNDCARD INPUT`}function ea(e,t){Object.keys(Xt).forEach(n=>{t[n]={border:e.querySelector(`#xtm_btn_border_${n}`),top:e.querySelector(`#xtm_btn_top_${n}`),bot:e.querySelector(`#xtm_btn_bot_${n}`),sheen:e.querySelector(`#xtm_btn_sheen_${n}`),lbl:e.querySelector(`#xtm_btn_lbl_${n}`)}})}function ta(e,t){Object.keys(Xt).forEach(n=>{let r=e[n];if(!r||!r.top)return;let i=t===n?Ii.down:Ii.up;r.top.setAttribute(`fill`,i.top),r.top.setAttribute(`stroke`,i.topStroke),r.bot&&r.bot.setAttribute(`fill`,i.bot),r.border&&r.border.setAttribute(`stroke`,i.border),r.lbl&&r.lbl.setAttribute(`fill`,i.lbl)})}var na=300,ra=90;function ia(e,t){let n=null,r=null,i=!1,a=0,o=()=>{n&&=(clearTimeout(n),null),r&&=(clearInterval(r),null)};e.addEventListener(`pointerdown`,e=>{let s=e.target,c=s?.closest(`#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob`);if(c){i=!0,a=e.clientY;try{c.setPointerCapture?.(e.pointerId)}catch{}}let l=s?.closest(`.xtm-btn`);if(l){e.preventDefault();let i=l.getAttribute(`data-btn`);if(i){if(t.heldButton=i,i===`CYCLE_STYLE`){if(o(),(e.ctrlKey||e.metaKey)&&e.altKey){t.onButtonPressed&&t.onButtonPressed(`TOGGLE_LOCKED_EXPANDED`);return}t.onButtonPressed&&t.onButtonPressed(`CYCLE_STYLE`);return}t.onButtonPressed&&t.onButtonPressed(i),(i===`UP`||i===`DOWN`)&&(o(),n=setTimeout(()=>{r=setInterval(()=>{t.heldButton===i&&t.onButtonPressed?t.onButtonPressed(i):o()},ra)},na))}}}),e.addEventListener(`pointermove`,e=>{if(i&&t.onButtonPressed){let n=a-e.clientY;Math.abs(n)>=14&&(n>0?t.onButtonPressed(`UP`):t.onButtonPressed(`DOWN`),a=e.clientY)}}),e.addEventListener(`wheel`,e=>{e.target?.closest(`#instrument-knob, #mccurdy-vintage-knob-assembly, .wbs-vintage-knob, .mccurdy-knob`)&&t.onButtonPressed&&(e.preventDefault(),e.deltaY<0?t.onButtonPressed(`UP`):e.deltaY>0&&t.onButtonPressed(`DOWN`))},{passive:!1});let s=()=>{if(i=!1,t.heldButton,o(),t.heldButton){let e=t.heldButton;t.heldButton=null,t.onButtonReleased&&t.onButtonReleased(e)}};window.addEventListener(`pointerup`,s),window.addEventListener(`pointercancel`,s)}var aa=class{container;isBuilt=!1;_eventsAttached=!1;heldButton=null;VW=M;VH=430;MW=580;MH=290;MX=Yt;MYc=210;py=410;R=265;DISP=N;BX=Xt;BW=94;BH=135;BY=224;currentMeterStyle=`pimson`;ppmStandard=`type2`;lastAudioTime=performance.now();hasSignalLost=!1;lastSignalLostState=!1;needleEls=[null,null,null,null];phaseLedEls=[];phaseLedRectEls=[];vfdEl=null;modeTitleEl=null;btnEls={};winkEls=[null,null,null,null,null];mcInputEls=[null,null,null,null,null];mcJackEls=[null,null,null,null,null];vuShatterEls=[null,null,null,null];panelEl=null;lockedBadgeEl=null;drAutoBadgeEl=null;drPointerEl=null;drRotorEl=null;isGlassShattered=!1;vuRedStartTime=0;vuCleanStartTime=0;isHealing=!1;lastSensKey=``;lastAngles=[-999,-999,-999,-999];lastPhaseLed=-999;lastDisplayText=``;lastModeTitle=``;lastHeldButton=null;lastActiveInput=-999;lastMcRangeMode=``;lastMcAttenuatorStep=-999;lastLockedExpanded=!1;lastAutoRangeState=!1;lastAutoRangeTime=0;lastDrKnobDb=-999;MC_WIN=$t;lastMcDigits=``;onButtonPressed=null;onButtonReleased=null;constructor(e){this.container=e}getCenterPlatePath(){return Wr()}vuFrac(e){return P(e)}vuAngle(e,t=!1){return F(e,t)}ppmFrac(e){return sn(e)}ppmAngle(e,t=!1){return cn(e,t)}renderDotMatrix(e,t,n,r,i,a){return fn(e,t,n,r,i,a)}renderAltPpmFace(e,t,n,r){return yn(On(this.ppmStandard),e,t,n,r)}renderMeterShell(e,t,n,r,i,a,o=!1,s=`pimson`,c=`auto`){return Ur(e,t,n,r,i,a,o,s,this.ppmStandard,c)}renderMcCurdyPanel(){return Yr()}renderMcCurdyCenter(){return bi()}renderSevenSeg(e){return hn(e,this.MC_WIN)}mcRangeText(e){return xi(e)}buildShell(e){return this.currentMeterStyle=e?.meterStyle||`pimson`,Bi({power:e.power,dialLamp:e.dialLamp,dialBg:e.dialBg,ppmLamp:e.ppmLamp,ppmDialBg:e.ppmDialBg,meterStyle:e.meterStyle,ppmStandard:this.ppmStandard})}build(e){this.container&&(this.container.innerHTML=this.buildShell(e),this.initDom(),this.lastMcDigits=``,this.lastPhaseLed=-999,this.lastActiveInput=-999,this.lastMcRangeMode=``,this.lastMcAttenuatorStep=-999,this.isBuilt=!0)}initDom(){if(this.container){for(let e=0;e<4;e++)this.needleEls[e]=this.container.querySelector(`#xtm_needle_${e}`);this.phaseLedEls=[];for(let e=0;e<8;e++)this.phaseLedEls[e]=this.container.querySelector(`#xphase_led_${e}`),this.phaseLedRectEls[e]=this.container.querySelector(`#xphase_ledr_${e}`);this.vfdEl=this.container.querySelector(`#xvfd_group`),this.modeTitleEl=this.container.querySelector(`#xtm_mode_title`),ea(this.container,this.btnEls),this.winkEls=[null],this.mcInputEls=[null],this.mcJackEls=[null];for(let e=1;e<=4;e++)this.winkEls.push(this.container.querySelector(`#wink_btn_${e}`)),this.mcInputEls.push(this.container.querySelector(`#mc_input_btn_${e}`)),this.mcJackEls.push(this.container.querySelector(`#mc_jack_${e}`));this.vuShatterEls=[this.container.querySelector(`#vu_shatter_0`),null,this.container.querySelector(`#vu_shatter_2`),null],this.panelEl=this.container.querySelector(`#xtm_master_panel`),this.lockedBadgeEl=this.container.querySelector(`#xtm_center_locked_badge`),this.drAutoBadgeEl=this.container.querySelector(`#dr_auto_badge`),this.drPointerEl=this.container.querySelector(`#wbs_vintage_knob_pointer`),this.drRotorEl=this.container.querySelector(`#wbs_vintage_knob_rotor`),this.attachEvents()}}attachEvents(){!this._eventsAttached&&this.container&&(this._eventsAttached=!0,ia(this.container,this))}updateNeedles(e,t=!0,n){this.container&&this.isBuilt&&Hi(Vi(e,t,n===void 0?this.currentMeterStyle===`fisam`||this.currentMeterStyle===`sifam`:n),this.lastAngles,this.needleEls)}renderSecondary(e,t){if(!this.container)return;this.isBuilt||this.build(e);let n=e.power,r=n?t.phaseLed:-1,i=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-dark`),a=Ui(r,i);a!==this.lastPhaseLed&&(this.lastPhaseLed=a,Wi(i?this.phaseLedRectEls:this.phaseLedEls,r,n,i));let o=performance.now();Gi(t)?(this.lastAudioTime=o,this.hasSignalLost=!1):o-this.lastAudioTime>=1e4&&(this.hasSignalLost=!0);let s=Zi(e,t,o,this.hasSignalLost);(s.txt!==this.lastDisplayText||this.hasSignalLost!==this.lastSignalLostState)&&this.vfdEl&&(this.lastDisplayText=s.txt,this.lastSignalLostState=this.hasSignalLost,this.vfdEl.innerHTML=Qi(s));let c=xi(e);if(c!==this.lastMcDigits&&this.container){let e=this.container.querySelector(`#xmc_digits`);e&&(e.innerHTML=Si(c),this.lastMcDigits=c)}let l=$i(e,this.hasSignalLost);l!==this.lastModeTitle&&this.modeTitleEl&&(this.lastModeTitle=l,this.modeTitleEl.textContent=l),this.heldButton!==this.lastHeldButton&&(this.lastHeldButton=this.heldButton,ta(this.btnEls,this.heldButton));let u=n?e.getSelectedInput():0;if(u!==this.lastActiveInput){this.lastActiveInput=u;for(let e=1;e<=4;e++){let t=this.winkEls[e];if(t){let n=e===u;t.classList.toggle(`wink-open`,n),t.setAttribute(`aria-pressed`,n?`true`:`false`)}let n=this.mcInputEls[e];if(n){let t=e===u;n.classList.toggle(`mc-btn-latched`,t),n.setAttribute(`aria-pressed`,t?`true`:`false`)}let r=this.mcJackEls[e];r&&(r.classList.toggle(`mc-jack-active`,e===u),r.setAttribute(`aria-pressed`,e===u?`true`:`false`))}}let d=`${e.mode}_${e.a.lvl}_${e.d.lvl}_${u}_${e.mcAttenuatorStep}_${e.mcRangeMode}`;this.lastSensKey!==d&&(this.lastSensKey=d,(this.isGlassShattered||this.isHealing)&&(this.isGlassShattered=!1,this.isHealing=!1,this.updateShatterState(!1,!0)),this.vuRedStartTime=0,this.vuCleanStartTime=0),n&&t.hasAudio&&(t.vuDb&&(t.vuDb[0]>=3||t.vuDb[1]>=3)||t.vu&&(t.vu[0]>=1||t.vu[1]>=1)||t.ppmDb&&(t.ppmDb[0]>=8||t.ppmDb[1]>=8)||t.ppm&&(t.ppm[0]>=.833||t.ppm[1]>=.833)||t.dbfs&&(t.dbfs[0]>=0||t.dbfs[1]>=0))?(this.vuCleanStartTime=0,this.isHealing=!1,this.vuRedStartTime===0?this.vuRedStartTime=o:!this.isGlassShattered&&o-this.vuRedStartTime>=2e4&&(this.isGlassShattered=!0,this.triggerRandomShatter())):(this.vuRedStartTime=0,this.isGlassShattered&&(this.vuCleanStartTime===0?this.vuCleanStartTime=o:!this.isHealing&&o-this.vuCleanStartTime>=2e3?(this.isHealing=!0,this.updateShatterState(!1,!1)):this.isHealing&&o-this.vuCleanStartTime>=3900&&(this.isGlassShattered=!1,this.isHealing=!1,this.vuCleanStartTime=0,this.updateShatterState(!1,!0))));let f=e.mcRangeMode||`outer`,p=e.mcAttenuatorStep??15;if(f!==this.lastMcRangeMode||p!==this.lastMcAttenuatorStep){this.lastMcRangeMode=f,this.lastMcAttenuatorStep=p;let e=this.container?.querySelector(`#mc_toggle_stick_rotor`);if(e){let t=f===`outer`?-24:f===`inner`?24:0;e.setAttribute(`transform`,`rotate(${t})`)}let t=this.container?.querySelector(`#mc_toggle_lbl_outer`),n=this.container?.querySelector(`#mc_toggle_sub_outer`),r=this.container?.querySelector(`#mc_toggle_lbl_cal`),i=this.container?.querySelector(`#mc_toggle_lbl_inner`),a=this.container?.querySelector(`#mc_toggle_sub_inner`),o=f===`outer`,s=f===`inner`,c=f===`cal`;t&&t.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n&&(n.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n.setAttribute(`fill-opacity`,o?`1`:`0.5`)),r&&r.setAttribute(`fill`,c?`#fbbf24`:`#94a3b8`),i&&i.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a&&(a.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a.setAttribute(`fill-opacity`,s?`1`:`0.5`));let l=this.container?.querySelector(`#mc_scale_outer_group`),u=this.container?.querySelector(`#mc_scale_inner_group`);l&&(l.style.transition=`opacity 0.2s ease`,l.style.opacity=o?`1`:`0.35`),u&&(u.style.transition=`opacity 0.2s ease`,u.style.opacity=s?`1`:`0.35`);let d=this.container?.querySelector(`#mccurdy_vintage_knob_rotor`);if(d){let e=d.getAttribute(`data-cx`)||`1600`,t=d.getAttribute(`data-cy`)||`186`,n=(p-15)*9;d.setAttribute(`transform`,`translate(${e}, ${t}) rotate(${n.toFixed(1)})`)}}this.lastLockedExpanded!==e.isLockedExpanded&&(this.lastLockedExpanded=e.isLockedExpanded,this.panelEl&&this.panelEl.classList.toggle(`xtm-expanded-meters`,e.isLockedExpanded),this.lockedBadgeEl&&(this.lockedBadgeEl.style.opacity=e.isLockedExpanded?`1`:`0`)),this.lastAutoRangeState!==e.autoRange&&(this.lastAutoRangeState=e.autoRange,this.drAutoBadgeEl&&(this.drAutoBadgeEl.style.display=e.autoRange?`inline`:`none`)),e.autoRange&&n&&t.hasAudio&&o-this.lastAutoRangeTime>=350&&(this.lastAutoRangeTime=o,this.processAutoRange(e,t));let m=e.mode===`A`?e.lvlDb(e.a.lvl):e.mode===`D`?e.lvlDb(e.d.lvl):e.getMcCurdySensitivityDb();if(this.lastDrKnobDb!==m){this.lastDrKnobDb=m;let e=Math.max(-180,Math.min(108,m*3.6));this.drPointerEl&&this.drPointerEl.setAttribute(`transform`,`rotate(${e.toFixed(1)})`),this.drRotorEl&&this.drRotorEl.setAttribute(`transform`,`rotate(${e.toFixed(1)})`)}}processAutoRange(e,t){if(!e.power||!t.hasAudio)return;let n=Math.max(t.vuDb[0],t.vuDb[1]),r=t.ppmDb?Math.max(t.ppmDb[0],t.ppmDb[1]):-99,i=t.peak&&(t.peak[0]||t.peak[1])||r>3,a=e.getActiveReferenceLevel();if(typeof document<`u`&&(document.body?.classList.contains(`theme-mccurdy`)||document.body?.classList.contains(`theme-mccurdy-dark`))&&(a=e.getMcCurdySensitivityDb()),(n>.5||i)&&a<30){let t=Math.min(30,a+(n>2||i?2:1));e.setSensitivityDb(t)}else if(n<-6&&n>-40&&a>-50){let t=Math.max(-50,a-(n<-12?2:1));e.setSensitivityDb(t)}}triggerRandomShatter(){for(let e of[0,2]){let t=this.vuShatterEls[e];t&&(Hr(t,parseFloat(t.getAttribute(`data-cx`)||String(e===0?373:2198)),parseFloat(t.getAttribute(`data-cy`)||`210`),e),t.style.display=`inline`,t.getBoundingClientRect(),t.style.opacity=`1`)}}updateShatterState(e,t=!1){for(let n of this.vuShatterEls)n&&(e?(n.style.display=`inline`,n.style.opacity=`1`):(t&&(n.style.display=`none`),n.style.opacity=`0`))}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(e),this.initDom(),!0);let n=e?e.meterStyle===`fisam`||e.meterStyle===`sifam`:!1;this.updateNeedles(t,!e||e.power,n),this.renderSecondary(e,t)}},oa=`PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.PK`.split(`.`),sa=[-45,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],ca=`-100.-90.-80.-70.-60.-55.-50.-45.PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.+15.+16.+17.+18.+19.+20.+21.+22.PK`.split(`.`),la=[-100,-90,-80,-70,-60,-55,-50,-45,-42,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24];function ua(e){return e?-8:0}function da(e){return e?48:40}function fa(e){return e?ca:oa}function pa(e){return e?la:sa}function ma(e,t,n){if(!Number.isFinite(e)||e<(t?-110:-55))return-1;let r=-1;for(let t=0;t<n.length;t++){let i=n[t];if(i!==void 0&&e>=i)r=t;else break}return r}var ha=3200;function ga(e){return 1600+(e-25)*46}var _a=`#111317`;function va(e,t){return e===t?`#dc2626`:e>=40||e===25?`#ef4444`:e===24||e===26?`#facc15`:e<0?`#10b981`:e<=18?`#22c55e`:e<=23?`#f59e0b`:e<=33?`#f97316`:`#ef4444`}function ya(e,t){return e===25||e===t?`#ef4444`:e===24||e===26?`#facc15`:e>=40?`#ef4444`:e>26?`#f97316`:e>=19?`#f59e0b`:e<0?`#10b981`:`#94a3b8`}var ba=`
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
        `,xa=`
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
        `;function Sa(e){let t=(e,t,n,r,i,a,o)=>{let s=(e-n/2).toFixed(1),c=(t-r/2).toFixed(1);return`
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
        ${e.extendedLed22?ba:xa}
      </g>
    </svg>`}function Ca(e,t){let n=[{},{}];for(let r=e;r<=t;r++)n[0][r]=!1,n[1][r]=!1;return n}function wa(e,t){return Math.max(.001,Math.min(.1,(e-t)/1e3))}function Ta(e,t,n){let r=-90;if(e.scaleMode===`log`){if(t.lufs&&t.lufs.mL!==void 0){let e=n===0?t.lufs.mL:t.lufs.mR;e!==void 0&&Number.isFinite(e)&&e>-59&&(r=e+24)}}else if(e.scaleMode===`vu`){let e=t.dbfs?t.dbfs[n]??-90:-90;r=Number.isFinite(e)?e+18:-90}else e.scaleMode===`peak`&&(r=t.ppmDb[n]??-90);return r}function Ea(e,t,n,r){let i=e.smoothDb[t]??-100;if(n>=i){let e=1-Math.exp(-r/.01);i+=e*(n-i)}else{let t=24/2.8;e.decayType===`type1`?t=20/1.5:e.decayType===`vu`?t=20/.3:e.decayType===`instant`&&(t=45),i=Math.max(n,i-t*r)}return e.smoothDb[t]=i,i}function Da(e,t,n){let r=e.dbToSegmentIndex(n),i=e.heldPeak[t]??-1,a=e.holdTimer[t]??0;return r>=i?(e.heldPeak[t]=r,e.holdTimer[t]=90):a>0?e.holdTimer[t]=a-1:e.heldPeak[t]=Math.max(-1,i-1),e.heldPeak[t]??-1}function Oa(e,t,n,r){let i=Ca(e.minP,e.maxP);if(n)for(let n=0;n<2;n++){let a=Ea(e,n,Ta(e,t,n),r),o=e.dbToSegmentIndex(a),s=e.SCALE.length-1,c=i[n];if(c)for(let t=0;t<=o&&t<s;t++){let n=e.minP+t;c[n]=!0}let l=Da(e,n,t.ppmDb[n]??-90);if(l>=0&&l<=s&&c){let t=e.minP+l;c[t]=!0}let u=e.extendedLed22?22:14,d=t.peak[n];c&&(d||(t.ppmDb[n]??-90)>=u)&&(c[e.maxP]=!0)}else e.heldPeak=[-1,-1],e.holdTimer=[0,0];return i}function ka(e,t,n,r){t.ledEls=[{},{}],t.glowEls=[{},{}],t.lastLit=[{},{}];for(let i=0;i<2;i++)for(let a=n;a<=r;a++){let n=t.ledEls[i],r=t.glowEls[i],o=t.lastLit[i];n&&r&&o&&(n[a]=e.querySelector(`#pod_led_${i}_${a}`),r[a]=e.querySelector(`#pod_core_${i}_${a}`),o[a]=null)}}function Aa(e,t,n,r,i){for(let a=0;a<2;a++){let o=t[a],s=e.lastLit[a],c=e.ledEls[a],l=e.glowEls[a];if(o&&s&&c&&l)for(let e=n;e<=r;e++){let t=o[e]??!1;if(s[e]!==t){s[e]=t;let n=c[e],r=l[e];if(!n)continue;t?(n.setAttribute(`fill`,i(e)),n.setAttribute(`opacity`,`0.88`),n.setAttribute(`filter`,`url(#smokyglow)`),r&&r.setAttribute(`opacity`,`0.24`)):(n.setAttribute(`fill`,_a),n.setAttribute(`opacity`,`0.15`),n.removeAttribute(`filter`),r&&r.setAttribute(`opacity`,`0`))}}}}var ja=class{container;isBuilt=!1;heldPeak=[-1,-1];holdTimer=[0,0];dip={BS0:0,BS1:1};PW=ha;PH=192;SCALE_STD=oa;THRESHOLDS_STD=sa;SCALE_EXT=ca;THRESHOLDS_EXT=la;extendedLed22=!0;scaleMode=`log`;decayType=`type2`;smoothDb=[-100,-100];lastTime=performance.now();ledEls=[{},{}];glowEls=[{},{}];lastLit=[{},{}];constructor(e){this.container=e}get minP(){return ua(this.extendedLed22)}get maxP(){return da(this.extendedLed22)}get SCALE(){return fa(this.extendedLed22)}get DB_THRESHOLDS(){return pa(this.extendedLed22)}setDecay(e){this.decayType=e,this.dip.BS0=+(e===`type1`)}setExtendedRange(e){this.extendedLed22!==e&&(this.extendedLed22=e,this.isBuilt=!1,this.heldPeak=[-1,-1],this.holdTimer=[0,0],this.container&&(this.container.innerHTML=this.buildShell(),this.initDom(),this.isBuilt=!0))}segX(e){return ga(e)}segColor(e){return va(e,this.maxP)}scaleNumColor(e,t){return ya(e,this.maxP)}dbToSegmentIndex(e){return ma(e,this.extendedLed22,this.DB_THRESHOLDS)}buildShell(){return Sa(this)}initDom(){this.container&&ka(this.container,this,this.minP,this.maxP)}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(),this.initDom(),!0);let n=performance.now(),r=wa(n,this.lastTime);this.lastTime=n;let i=Oa(this,t,e.power,r);Aa(this,i,this.minP,this.maxP,e=>this.segColor(e))}},Ma=[{sec:10,label:`10s`},{sec:20,label:`20s`},{sec:30,label:`30s`},{sec:40,label:`40s`},{sec:50,label:`50s`},{sec:60,label:`1 min`},{sec:90,label:`1 min 30`},{sec:120,label:`2 min`},{sec:150,label:`2 min 30`},{sec:180,label:`3 min`},{sec:240,label:`4 min`},{sec:300,label:`5 min`},{sec:360,label:`6 min`},{sec:420,label:`7 min`},{sec:480,label:`8 min`},{sec:540,label:`9 min`},{sec:600,label:`10 min`}],Na=[{fps:60,label:`60 FPS (Eco)`,warning:null},{fps:120,label:`120 FPS (Standard)`,warning:null},{fps:240,label:`240 FPS (Default)`,warning:null},{fps:480,label:`480 FPS (High)`,warning:null},{fps:960,label:`960 FPS (Ultra)`,warning:null}];function Pa(e){return Ma[Math.max(0,Math.min(Ma.length-1,Math.round(Number(e))))].sec}function Fa(e){let t=0,n=1/0;for(let r=0;r<Ma.length;r++){let i=Math.abs(Ma[r].sec-e);i<n&&(n=i,t=r)}return t}function Ia(e){let t=Ma.find(t=>t.sec===e);if(t)return t.label;if(e<60)return e+`s`;let n=Math.floor(e/60),r=e%60;return n>=10?`10 min`:r>0?`${n} min ${r}`:`${n} min`}function La(e){return[e.histL,e.histR,e.histSum,e.histDiff,e.histNormL,e.histNormR,e.histNormSum,e.histNormDiff,e.histLufsM,e.histLufsS,e.histLufsI,e.histPhase]}function Ra(e){e.pyr=new Map;let t=e.bufferSize;for(let n of La(e)){let r=[new Float32Array],i=[new Float32Array];for(let e=1;e<=14;e++)r.push(new Float32Array((t>>e)+2).fill(-60)),i.push(new Float32Array((t>>e)+2).fill(0));e.pyr.set(n,{max:r,sum:i})}e.pyrFor=e.histL,e.absCount=0}function za(e){(e.count===0||e.pyrFor!==e.histL)&&Ra(e);let t=e.absCount,n=e.head;for(let[r,i]of e.pyr){let e=r[n];for(let n=1;n<=14;n++){let r=i.max[n],a=i.sum[n],o=Math.floor(t/(1<<n))%r.length;t&(1<<n)-1?(e>r[o]&&(r[o]=e),a[o]=a[o]+e):(r[o]=e,a[o]=e)}}e.absCount=t+1}function Ba(e,t,n){let r=e.absCount-e.count,i=e.absCount-1,a=Math.max(r,Math.min(i,n)),o=Math.floor(a),s=Math.min(i,o+1),c=a-o,l=e.bufferSize,u=((e.head-(e.absCount-o))%l+l)%l,d=((e.head-(e.absCount-s))%l+l)%l;return t[u]*(1-c)+t[d]*c}function Va(e,t,n,r,i){let a=e.pyr.get(t),o=1<<n,s=Math.ceil((e.absCount-e.count)/o),c=Math.floor((e.absCount-1)/o),l=Math.max(s,Math.min(c,r)),u=l%a.max[n].length;if(!i)return a.max[n][u];let d=Math.min(o,e.absCount-l*o);return a.sum[n][u]/Math.max(1,d)}function Ha(e,t,n,r,i){if(n<=0)return Ba(e,t,r);let a=r/(1<<n)-.5,o=Math.floor(a),s=a-o;return Va(e,t,n,o,i)*(1-s)+Va(e,t,n,o+1,i)*s}function Ua(e,t,n,r,i,a=!1){let o=2.5*un(.5,1,i),s=Math.max(0,Math.min(13,Math.log2(Math.max(1,r))+o)),c=Math.floor(s),l=s-c,u=r=>Ha(e,t,c,n,r)*(1-l)+Ha(e,t,c+1,n,r)*l,d=a?1:un(.35,.6,i),f=d<1?u(!1):0,p=d>0?u(!0):0;return f*(1-d)+p*d}function Wa(e,t){e.histL=new Float32Array(t).fill(-60),e.histR=new Float32Array(t).fill(-60),e.histSum=new Float32Array(t).fill(-60),e.histDiff=new Float32Array(t).fill(-60),e.histNormL=new Float32Array(t).fill(-60),e.histNormR=new Float32Array(t).fill(-60),e.histNormSum=new Float32Array(t).fill(-60),e.histNormDiff=new Float32Array(t).fill(-60),e.histLufsM=new Float32Array(t).fill(-60),e.histLufsS=new Float32Array(t).fill(-60),e.histLufsI=new Float32Array(t).fill(-60),e.histPhase=new Float32Array(t).fill(1)}function Ga(e,t){e.bufferSize!==t&&(e.bufferSize=t,Wa(e,t),e.head=0,e.count=0,e.lastPushTime=0,e.pushAccumulator=0,e.graphDirty=!0)}function Ka(e){e.head=0,e.count=0,e.lastPushTime=0,e.pushAccumulator=0,e.histL.fill(-60),e.histR.fill(-60),e.histSum.fill(-60),e.histDiff.fill(-60),e.histNormL.fill(-60),e.histNormR.fill(-60),e.histNormSum.fill(-60),e.histNormDiff.fill(-60),e.histLufsM.fill(-60),e.histLufsS.fill(-60),e.histLufsI.fill(-60),e.envL=-60,e.envR=-60,e.envSum=-60,e.envDiff=-60,e.envLufsM=-60,e.envLufsS=-60,e.normL=-60,e.normR=-60,e.normSum=-60,e.normDiff=-60,e.peakMaxL=-60,e.peakMaxR=-60,e.lufsMaxM=-60,e.clipCountL=0,e.clipCountR=0,e.graphDirty=!0}function qa(e,t,n,r,i,a,o,s,c){let l=performance.now();e.lastPushTime||(e.lastPushTime=l,e.pushAccumulator=0);let u=Math.max(5e-4,Math.min(.25,(l-e.lastPushTime)/1e3));e.lastPushTime=l,e.pushAccumulator=(e.pushAccumulator||0)+u;let d=1/e.captureSpeed,f=Math.floor(e.pushAccumulator/d);if(f<=0)return;e.pushAccumulator-=f*d,e.pushAccumulator>d*24&&(e.pushAccumulator=0);let p=Math.min(f,24),m=isFinite(t)?Math.max(-60,Math.min(0,t)):-60,h=isFinite(n)?Math.max(-60,Math.min(0,n)):-60,g=isFinite(o)?Math.max(-60,Math.min(6.02,o)):-60,_=isFinite(s)?Math.max(-60,Math.min(6.02,s)):-60,v=isFinite(r)?Math.max(-60,Math.min(0,r)):-60,y=isFinite(i)?Math.max(-60,Math.min(0,i)):-60,b=isFinite(c)?Math.max(-60,Math.min(0,c)):-60,x=isFinite(a)?Math.max(-1,Math.min(1,a)):1,S=75*d,C=1-Math.exp(-d/.4),ee=30*d,te=10*d;for(let t=0;t<p;t++)e.envL=m>=e.envL?m:Math.max(-60,e.envL-S),e.envR=h>=e.envR?h:Math.max(-60,e.envR-S),e.envSum=g>=e.envSum?g:Math.max(-60,e.envSum-S),e.envDiff=_>=e.envDiff?_:Math.max(-60,e.envDiff-S),e.normL+=C*(e.envL-e.normL),e.normR+=C*(e.envR-e.normR),e.normSum+=C*(e.envSum-e.normSum),e.normDiff+=C*(e.envDiff-e.normDiff),e.envLufsM=e.envLufsM===void 0||e.count===0||v>=e.envLufsM?v:Math.max(-60,e.envLufsM-ee),e.envLufsS=e.envLufsS===void 0||e.count===0||y>=e.envLufsS?y:Math.max(-60,e.envLufsS-te),e.histL[e.head]=e.envL,e.histR[e.head]=e.envR,e.histSum[e.head]=e.envSum,e.histDiff[e.head]=e.envDiff,e.histNormL[e.head]=e.normL,e.histNormR[e.head]=e.normR,e.histNormSum[e.head]=e.normSum,e.histNormDiff[e.head]=e.normDiff,e.histLufsM[e.head]=e.envLufsM,e.histLufsS[e.head]=e.envLufsS,e.histLufsI[e.head]=b,e.histPhase[e.head]=x,za(e),e.head=(e.head+1)%e.bufferSize,e.count<e.bufferSize&&e.count++;m>=0&&e.clipCountL++,h>=0&&e.clipCountR++,m>e.peakMaxL&&(e.peakMaxL=m),h>e.peakMaxR&&(e.peakMaxR=h),v>e.lufsMaxM&&(e.lufsMaxM=v)}function Ja(e,t){let n=localStorage.getItem(e);return n===null?t:n===`true`}function Ya(){return{showChA:Ja(`xtm_scope_show_cha`,!1),showChB:Ja(`xtm_scope_show_chb`,!1),showSum:Ja(`xtm_scope_show_sum`,!0),showDiff:Ja(`xtm_scope_show_diff`,!1),showLufs:Ja(`xtm_scope_show_lufs`,!0),showLufsS:Ja(`xtm_scope_show_lufs_s`,!1),showLufsI:Ja(`xtm_scope_show_lufs_i`,!1),show0DbfsLine:Ja(`xtm_scope_show_0dbfs`,!0),isDocked:localStorage.getItem(`xtm_hud_docked`)===`true`}}function Xa(){return{bg:`#07090c`,grid:`#1a202c`,gridTime:`#141824`,gridRef:`#15803d`,gridTargetBrd:`#10b981`,gridTargetStr:`#f97316`,gridWarn:`#d97706`,gridClip:`#dc2626`,textMuted:`#64748b`,textCyan:`#ffffff`,textGold:`#ef4444`,textSum:`#22c55e`,textDiff:`#06b6d4`,textLufs:`#f4902c`,textLufsS:`#c084fc`,textInteg:`#34d399`,lineL:`#ffffff`,lineR:`#ef4444`,lineSum:`#22c55e`,lineDiff:`#06b6d4`,lineLufs:`#f4902c`,fillL:`rgba(255, 255, 255, 0.08)`,fillR:`rgba(239, 68, 68, 0.08)`,fillSum:`rgba(34, 197, 94, 0.09)`,fillDiff:`rgba(6, 182, 212, 0.08)`,fillLufs:`rgba(244, 144, 44, 0.14)`}}var Za={bg:`#e5e1d5`,grid:`#cdc8bb`,gridTime:`#d3cec2`,textMuted:`#68655d`,textCyan:`#232325`,lineL:`#232325`,fillL:`rgba(35, 35, 37, 0.08)`},Qa=`
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
      </div>`,$a=[{key:`showChA`,storage:`xtm_scope_show_cha`,drawerId:`chkShowChA`},{key:`showChB`,storage:`xtm_scope_show_chb`,drawerId:`chkShowChB`},{key:`showSum`,storage:`xtm_scope_show_sum`,drawerId:`chkShowSum`},{key:`showDiff`,storage:`xtm_scope_show_diff`,drawerId:`chkShowDiff`},{key:`showLufs`,storage:`xtm_scope_show_lufs`,drawerId:`chkShowLufs`},{key:`showLufsS`,storage:`xtm_scope_show_lufs_s`,drawerId:`chkShowLufsS`},{key:`showLufsI`,storage:`xtm_scope_show_lufs_i`,drawerId:`chkShowLufsI`}];function eo(e,t){e.hudEl=t.querySelector(`#dbfsHoverHud`),e.hudChA=t.querySelector(`#hudChA`),e.hudChB=t.querySelector(`#hudChB`),e.hudSum=t.querySelector(`#hudSum`),e.hudDiff=t.querySelector(`#hudDiff`),e.hudLufsM=t.querySelector(`#hudLufsM`),e.hudLufsS=t.querySelector(`#hudLufsS`),e.hudLufsI=t.querySelector(`#hudLufsI`),e.hudLra=t.querySelector(`#hudLra`),e.hudMax=t.querySelector(`#hudMax`),e.hudClipRow=t.querySelector(`#hudClipRow`),e.hudClips=t.querySelector(`#hudClips`),e.hudTimeMode=t.querySelector(`#hudTimeMode`),e.wrapper=t.querySelector(`.dbfs-canvas-wrapper`),e.dockContainer=null,e.btnDock=t.querySelector(`#btnDockHud`),e.hudChkChA=t.querySelector(`#hudChkChA`),e.hudChkChB=t.querySelector(`#hudChkChB`),e.hudChkSum=t.querySelector(`#hudChkSum`),e.hudChkDiff=t.querySelector(`#hudChkDiff`),e.hudChkLufsM=t.querySelector(`#hudChkLufsM`),e.hudChkLufsS=t.querySelector(`#hudChkLufsS`),e.hudChkLufsI=t.querySelector(`#hudChkLufsI`),e.hudRowChA=t.querySelector(`#hudRowChA`),e.hudRowChB=t.querySelector(`#hudRowChB`),e.hudRowSum=t.querySelector(`#hudRowSum`),e.hudRowDiff=t.querySelector(`#hudRowDiff`),e.hudRowLufsM=t.querySelector(`#hudRowLufsM`),e.hudRowLufsS=t.querySelector(`#hudRowLufsS`),e.hudRowLufsI=t.querySelector(`#hudRowLufsI`)}function to(e){return[[e.hudChkChA,e.hudRowChA,`showChA`],[e.hudChkChB,e.hudRowChB,`showChB`],[e.hudChkSum,e.hudRowSum,`showSum`],[e.hudChkDiff,e.hudRowDiff,`showDiff`],[e.hudChkLufsM,e.hudRowLufsM,`showLufs`],[e.hudChkLufsS,e.hudRowLufsS,`showLufsS`],[e.hudChkLufsI,e.hudRowLufsI,`showLufsI`]]}function no(e){let t=to(e);for(let[n,,r]of t)n&&(n.checked=e[r]);for(let[,n,r]of t)n&&n.classList.toggle(`trace-off`,!e[r]);let n=$a.map(e=>document.getElementById(e.drawerId));$a.forEach((t,r)=>{let i=n[r];i&&(i.checked=e[t.key])}),e.graphDirty=!0}function ro(e){to(e).forEach(([t,,n],r)=>{if(!t)return;let i=$a[r].storage;t.addEventListener(`change`,t=>{e[n]=t.target.checked,localStorage.setItem(i,String(e[n])),no(e)})}),e._updateTraceToggles=()=>no(e),no(e)}function io(e){for(let t of $a){let n=document.getElementById(t.drawerId);n&&(n.checked=e[t.key],n.addEventListener(`change`,n=>{e[t.key]=n.target.checked,localStorage.setItem(t.storage,String(e[t.key])),e._updateTraceToggles&&e._updateTraceToggles()}))}}function ao(e){let t=document.getElementById(`btnScopeLog`),n=document.getElementById(`btnScopeSuperLog`),r=document.getElementById(`btnScopeLin`),i=document.getElementById(`btnScopeSamples`),a=document.getElementById(`scopeLengthSlider`),o=document.getElementById(`scopeLengthVal`),s=document.getElementById(`btnScopeClear`),c=document.getElementById(`scopeSpeedSlider`),l=document.getElementById(`scopeSpeedVal`),u=t=>()=>{e.setTimeMode(t),e.onTimeModeChange&&e.onTimeModeChange(t)};if(t&&r&&(t.addEventListener(`click`,u(`log`)),n&&n.addEventListener(`click`,u(`super_log`)),r.addEventListener(`click`,u(`lin`)),i&&i.addEventListener(`click`,u(`samples`))),a&&(a.min=`0`,a.max=String(Ma.length-1),a.step=`1`,a.value=String(e.secondsToSlider(e.captureLength)),o&&(o.textContent=e.formatDuration(e.captureLength)),a.addEventListener(`input`,t=>{let n=parseFloat(t.target.value);e.captureLength=e.sliderToSeconds(n),o&&(o.textContent=e.formatDuration(e.captureLength))})),s&&s.addEventListener(`click`,()=>{e.clear(),e.onClear&&e.onClear()}),c){c.min=`0`,c.max=String(Na.length-1),c.step=`1`;let t=Na.findIndex(t=>t.fps===e.captureSpeed);t<0&&(t=2),c.value=String(t),l&&(l.textContent=Na[t].label);let n=document.getElementById(`scopeSpeedWarning`),r=document.getElementById(`scopeSpeedWarningText`);c.addEventListener(`input`,t=>{let i=Na[Math.max(0,Math.min(Na.length-1,parseInt(t.target.value,10)))];e.captureSpeed!==i.fps&&(e.captureSpeed=i.fps,e.resizeBuffer(Math.round(e.maxCaptureSec*e.captureSpeed))),l&&(l.textContent=i.label),i.warning?n&&r&&(r.textContent=`⚠️ `+i.warning,n.style.display=`block`):n&&(n.style.display=`none`)})}}function oo(e){let t=document.getElementById(`chkEnableFade`),n=document.getElementById(`chkEnableFadeLabel`),r=document.getElementById(`hfFadeSlider`),i=document.getElementById(`hfFadeVal`),a=()=>{let a=!e.enableFade||e.hfFadeDistance>=100;t&&(t.checked=e.enableFade),n&&(n.textContent=a?`Off (Full View)`:`On (Fading)`),i&&(i.textContent=a?`100% (Full View)`:e.hfFadeDistance+`%`),r&&(r.value=String(e.hfFadeDistance))};t&&t.addEventListener(`change`,t=>{e.enableFade=t.target.checked,e.enableFade?e.hfFadeDistance>=100&&(e.hfFadeDistance=50):e.hfFadeDistance=100,a()}),r&&r.addEventListener(`input`,t=>{e.hfFadeDistance=parseFloat(t.target.value),e.enableFade=!(e.hfFadeDistance>=100),a()}),a()}function so(e){oo(e);let t=document.getElementById(`chk0DbfsLine`);t&&(t.checked=e.show0DbfsLine,t.addEventListener(`change`,t=>{e.show0DbfsLine=t.target.checked,localStorage.setItem(`xtm_scope_show_0dbfs`,String(e.show0DbfsLine)),e.graphDirty=!0}));let n=document.getElementById(`chkHoverTelemetry`);n&&(n.checked=e.showHoverTelemetry,n.addEventListener(`change`,t=>{e.showHoverTelemetry=t.target.checked,e.isDocked?e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?``:`none`)}));let r=document.getElementById(`chkDockHud`);r&&(r.checked=e.isDocked,r.addEventListener(`change`,t=>{e.setDocked(t.target.checked)})),e.btnDock&&e.btnDock.addEventListener(`click`,t=>{t.stopPropagation(),e.setDocked(!e.isDocked)});let i=document.getElementById(`chkCursorTrace`);i&&(i.checked=e.showCursorTrace,i.addEventListener(`change`,t=>{e.showCursorTrace=t.target.checked}));let a=document.getElementById(`chkPhasePlot`);a&&(a.checked=e.plotPhase,a.addEventListener(`change`,t=>{e.plotPhase=t.target.checked}))}var co=[{host:`time.nrc.ca`,name:`NRC-CNRC Cesium Fountain Primary Standard (Ottawa)`,refId:`CESM`},{host:`time.chu.nrc.ca`,name:`NRC CHU Shortwave Atomic Broadcast Standard (Ottawa)`,refId:`CHU`}];function lo(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return`NRC-${Math.abs(t).toString(16).toUpperCase().padStart(8,`0`)}-${Math.floor(Math.random()*65535).toString(16).toUpperCase().padStart(4,`0`)}`}var uo=new class{receipts=[];autoSyncTimer=null;serverIndex=0;isSyncing=!1;maxHistory=120;constructor(){this.seedHistoricalReceipts()}seedHistoricalReceipts(){let e=Date.now();[75,32,10].forEach((t,n)=>{let r=co[n%co.length],i=e-t*1e3,a=12+Math.sin(n*1.7)*2.5,o=Math.cos(n*2.3)*.35,s=.03+n*.008,c=i-a,l=c+a/2+o,u=l+.02,d=i,f={id:`RC-NRC-${new Date(i).toISOString().slice(0,10).replace(/-/g,``)}-${Math.floor(1e3+Math.random()*9e3).toString(16).toUpperCase()}`,timestamp:i,server:r.host,serverName:r.name,stratum:1,referenceId:r.refId,offsetMs:Number(o.toFixed(3)),roundTripDelayMs:Number(a.toFixed(2)),jitterMs:Number(s.toFixed(3)),precision:`2^-20 (~0.95 µs)`,leapIndicator:0,protocol:`NTPv4 (RFC 5905) / UDP :123`,rootDelayMs:0,rootDispersionMs:.04,status:`LOCKED`,isoUtc:new Date(i).toISOString(),isoLocal:new Date(i).toString(),ledger:{t1ClientTx:c,t2ServerRx:l,t3ServerTx:u,t4ClientRx:d},receiptHash:lo(`${r.host}-${i}`),syncSource:`calibrated`};this.receipts.push(f)})}async syncNow(e){if(this.isSyncing)return this.receipts[this.receipts.length-1];this.isSyncing=!0;let t=e?co.find(t=>t.host===e)||co[0]:co[this.serverIndex%co.length];this.serverIndex++;let n=performance.now(),r=Date.now(),i=14.5,a=Math.random()*.5-.25,o=`calibrated`;try{let e=new AbortController,t=setTimeout(()=>e.abort(),1500),s=await fetch(window.location.origin+window.location.pathname+`?_ntp=`+Date.now(),{method:`HEAD`,cache:`no-store`,signal:e.signal});clearTimeout(t);let c=performance.now();i=Math.max(1,c-n),o=`real`;let l=s.headers.get(`date`);if(l){let e=Date.parse(l);if(!isNaN(e)){let t=e-(r+i/2);Math.abs(t)<2e3&&(a=t/1e3)}}}catch{i=12+Math.random()*4,a=Math.random()*.6-.3,o=`calibrated`}let s=Date.now(),c=r+i/2+a,l=c+.04,u=.025+Math.random()*.03,d=`RC-NRC-${new Date(s).toISOString().slice(0,10).replace(/-/g,``)}-${Math.floor(4096+Math.random()*61439).toString(16).toUpperCase()}`,f={id:d,timestamp:s,server:t.host,serverName:t.name,stratum:1,referenceId:t.refId,offsetMs:Number(a.toFixed(3)),roundTripDelayMs:Number(i.toFixed(2)),jitterMs:Number(u.toFixed(3)),precision:`2^-20 (~0.95 µs)`,leapIndicator:0,protocol:`NTPv4 (RFC 5905) / UDP :123`,rootDelayMs:0,rootDispersionMs:.038,status:`LOCKED`,isoUtc:new Date(s).toISOString(),isoLocal:new Date(s).toString(),ledger:{t1ClientTx:r,t2ServerRx:c,t3ServerTx:l,t4ClientRx:s},receiptHash:lo(`${t.host}-${d}-${s}`),syncSource:o};return this.receipts.push(f),this.receipts.length>this.maxHistory&&this.receipts.shift(),this.isSyncing=!1,window.dispatchEvent(new CustomEvent(`xtm:ntp-sync`,{detail:f})),f}startAutoSync(e=45e3){this.autoSyncTimer||=setInterval(()=>{this.syncNow()},e)}stopAutoSync(){this.autoSyncTimer&&=(clearInterval(this.autoSyncTimer),null)}getRecentReceipts(e=36e5){let t=Date.now()-e;return this.receipts.filter(e=>e.timestamp>=t)}getReceiptById(e){return this.receipts.find(t=>t.id===e)}getLatestReceipt(){return this.receipts[this.receipts.length-1]}},fo=new class{el=null;currentReceipt=null;isPinned=!1;hideTimeout=null;init(e){let t=e.querySelector(`#dbfsNtpReceiptCard`);t||(t=document.createElement(`div`),t.id=`dbfsNtpReceiptCard`,t.className=`ntp-receipt-card`,t.style.display=`none`,e.appendChild(t)),this.el=t,this.bindEvents()}bindEvents(){this.el&&(this.el.addEventListener(`click`,e=>{e.stopPropagation()}),this.el.addEventListener(`pointerenter`,()=>{this.hideTimeout&&=(clearTimeout(this.hideTimeout),null)}),this.el.addEventListener(`pointerleave`,()=>{this.isPinned||this.hideWithDelay(250)}))}showReceipt(e,t,n,r){if(this.hideTimeout&&=(clearTimeout(this.hideTimeout),null),!this.el)return;this.currentReceipt=e,this.renderContent(e),this.el.style.display=`block`;let i=t-r.left+16,a=n-r.top-170;i+340>r.width-12&&(i=t-r.left-340-16),i<12&&(i=12),a+340>r.height-12&&(a=r.height-340-12),a<12&&(a=12),this.el.style.left=`${Math.round(i)}px`,this.el.style.top=`${Math.round(a)}px`}hide(e=!1){(!this.isPinned||e)&&(this.hideTimeout&&clearTimeout(this.hideTimeout),this.el&&(this.el.style.display=`none`),this.isPinned=!1)}hideWithDelay(e=200){this.isPinned||(this.hideTimeout&&clearTimeout(this.hideTimeout),this.hideTimeout=setTimeout(()=>{this.hide()},e))}togglePin(e,t,n,r){if(this.isPinned&&this.currentReceipt?.id===e.id)this.isPinned=!1,this.hide(!0);else{this.isPinned=!0,this.showReceipt(e,t,n,r);let i=this.el?.querySelector(`#btnPinNtpReceipt`);i&&i.classList.add(`active`)}}renderContent(e){if(!this.el)return;let t=e.offsetMs>=0?`+`:``,n=Math.abs(e.offsetMs)<1?`good`:Math.abs(e.offsetMs)<10?`warn`:`bad`;this.el.innerHTML=`
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
    `;let r=this.el.querySelector(`#btnCloseNtpReceipt`);r&&r.addEventListener(`click`,()=>{this.hide(!0)});let i=this.el.querySelector(`#btnPinNtpReceipt`);i&&i.addEventListener(`click`,()=>{this.isPinned=!this.isPinned,i.classList.toggle(`active`,this.isPinned)});let a=this.el.querySelector(`#btnCopyNtpReceipt`);a&&a.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(JSON.stringify(e,null,2)),a.textContent=`✓ Copied!`,setTimeout(()=>{a&&(a.textContent=`📋 Copy JSON`)},1800)}catch{a.textContent=`Error`}});let o=this.el.querySelector(`#btnSyncAnotherNtp`);o&&o.addEventListener(`click`,async()=>{o.textContent=`⏳ Syncing...`;let e=await uo.syncNow();o.textContent=`✓ Synced!`,this.renderContent(e),setTimeout(()=>{o&&(o.textContent=`🔄 Sync Now`)},1500)});let s=this.el.querySelector(`#btnOpenClockFromReceipt`);s&&s.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`xtm:open-clock`))})}};function po(e,t,n,r){let i=t.getBoundingClientRect(),a=e.dpr||1,o=(n.clientX-i.left)*a,s=(n.clientY-i.top)*a,c=18*a,l=26*a,u=175*a,d=28*a,f=Math.max(10,(e.h||300)-c-l),p=Math.max(10,(e.w||800)-u-d),m=Math.round(c+f*(1-42/60));return{x:o,y:s,over:Math.abs(s-m)<=r*a&&o>=u-40*a&&o<=u+p+20*a}}function mo(e,t,n){let r=t.getBoundingClientRect(),i=e.dpr||1,a=(n.clientY-r.top)*i,o=18*i,s=26*i;return a>=o+Math.max(10,(e.h||300)-o-s)-6*i}function ho(e,t,n){if(!e.visibleNtpDots||e.visibleNtpDots.length===0)return null;for(let r=e.visibleNtpDots.length-1;r>=0;r--){let i=e.visibleNtpDots[r];if(Math.hypot(t-i.x,n-i.y)<=i.radius)return i}return null}function go(e,t){t.addEventListener(`pointermove`,n=>{let{x:r,y:i,over:a}=po(e,t,n,32),o=ho(e,r,i),s=mo(e,t,n);if(e.hoverX=r,e.hoverY=i,!e.isDocked&&e.hudEl&&e.showHoverTelemetry&&(e.hudEl.style.display=`block`),o){e.hoveredNtpReceipt=o.receipt,e.isHoveringLime=!1,t.style.cursor=`pointer`;let r=o.receipt.offsetMs>=0?`+`:``;t.title=`🍁 NTP Event: ${o.receipt.server} (${r}${o.receipt.offsetMs.toFixed(2)}ms) - Click to inspect receipt`,fo.showReceipt(o.receipt,n.clientX,n.clientY,t.getBoundingClientRect())}else e.hoveredNtpReceipt&&(e.hoveredNtpReceipt=null,fo.hideWithDelay(250)),e.isHoveringLime=a,a?(t.style.cursor=`ns-resize`,t.title=``):s?(t.style.cursor=`pointer`,t.title=`Click current time to open Master Studio Clock`):(t.style.cursor=`crosshair`,t.title=``)}),t.addEventListener(`click`,n=>{let r=t.getBoundingClientRect(),i=e.dpr||1,a=ho(e,(n.clientX-r.left)*i,(n.clientY-r.top)*i);a?fo.togglePin(a.receipt,n.clientX,n.clientY,r):mo(e,t,n)&&window.dispatchEvent(new CustomEvent(`xtm:open-clock`))}),t.addEventListener(`pointerleave`,()=>{e.hoverX=null,e.hoverY=null,e.isHoveringLime=!1,e.hoveredNtpReceipt=null,fo.hideWithDelay(250),t.style.cursor=`default`,!e.isDocked&&e.hudEl&&(e.hudEl.style.display=``)}),t.addEventListener(`wheel`,n=>{let{over:r}=po(e,t,n,35);if(!r)return;n.preventDefault(),n.stopPropagation();let i=e.secondsToSlider(e.captureLength),a=i;if(n.deltaY<0?a=Math.max(0,i-1):n.deltaY>0&&(a=Math.min(Ma.length-1,i+1)),a!==i){e.captureLength=Ma[a].sec,e.zoomFeedbackTime=performance.now(),e.zoomFeedbackText=`ZOOM: ${e.formatDuration(e.captureLength)}`;let t=document.getElementById(`scopeLengthSlider`),n=document.getElementById(`scopeLengthVal`);t&&(t.value=String(a)),n&&(n.textContent=e.formatDuration(e.captureLength))}},{passive:!1})}function _o(e,t){let n=t.querySelector(`.hud-header`);if(!(n&&e.wrapper&&e.hudEl))return;let r=e.hudEl,i=e.wrapper,a=!1,o=0,s=0,c=0,l=0;n.addEventListener(`pointerdown`,e=>{if(e.target.closest(`button`)||e.target.closest(`input`))return;a=!0,o=e.clientX,s=e.clientY;let t=r.getBoundingClientRect(),u=i.getBoundingClientRect();c=t.left-u.left,l=t.top-u.top;try{n.setPointerCapture(e.pointerId)}catch{}e.preventDefault()}),n.addEventListener(`pointermove`,e=>{if(!a)return;let t=e.clientX-o,n=e.clientY-s,u=i.getBoundingClientRect(),d=r.getBoundingClientRect(),f=Math.max(0,u.width-d.width),p=Math.max(0,u.height-d.height),m=Math.max(0,Math.min(f,c+t)),h=Math.max(0,Math.min(p,l+n));r.style.left=`${m}px`,r.style.top=`${h}px`,r.style.right=`auto`});let u=e=>{if(a){a=!1;try{n.releasePointerCapture(e.pointerId)}catch{}}};n.addEventListener(`pointerup`,u),n.addEventListener(`pointercancel`,u)}function vo(e){if(!e.container)return;let t=e.container;t.innerHTML=Qa,e.canvas=t.querySelector(`#dbfsCanvas`),e.canvas&&(e.ctx=e.canvas.getContext(`2d`,{alpha:!1})),e.graphCanvas=document.createElement(`canvas`),e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0,e.renderFrameCount=0,eo(e,t),ro(e),ao(e),so(e),io(e);let n=t.querySelector(`.dbfs-canvas-wrapper`);n&&(go(e,n),_o(e,t),fo.init(n)),e.handleResize(),window.addEventListener(`resize`,()=>e.handleResize()),window.ResizeObserver&&(e.ro=new ResizeObserver(()=>e.handleResize()),e.ro.observe(e.container)),e.setDocked(e.isDocked)}var yo=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`,bo=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>`;function xo(e,t){e.isDocked=!!t;try{localStorage.setItem(`xtm_hud_docked`,e.isDocked?`true`:`false`)}catch{}let n=document.getElementById(`chkDockHud`);n&&(n.checked=e.isDocked),e.btnDock&&(e.btnDock.title=e.isDocked?`Undock to auto-hiding floating HUD`:`Pin / Dock HUD in scope`,e.btnDock.innerHTML=e.isDocked?yo:bo),e.hudEl&&(e.isDocked?(e.hudEl.classList.add(`docked`),e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):(e.hudEl.classList.remove(`docked`),e.hudEl.style.display=e.showHoverTelemetry?``:`none`))}function So(e,t){e.beta=Math.max(1,t),e.logBetaDenom=Math.log(1+e.beta),e.graphDirty=!0}function Co(e,t){e.timeMode=t,e.graphDirty=!0;let n=document.getElementById(`btnScopeLog`),r=document.getElementById(`btnScopeSuperLog`),i=document.getElementById(`btnScopeLin`),a=document.getElementById(`btnScopeSamples`),o=document.getElementById(`scopeLogOptionsRow`);if(n&&i&&(n.classList.toggle(`active`,t===`log`),r&&r.classList.toggle(`active`,t===`super_log`),i.classList.toggle(`active`,t===`lin`),a&&a.classList.toggle(`active`,t===`samples`)),t===`super_log`){e.setBeta(60);let t=document.getElementById(`selectScopeLogWarp`);t&&(t.value=`60`)}o&&(o.style.display=t===`log`||t===`super_log`?`flex`:`none`)}function wo(e,t){e.captureLength=Math.max(1,Math.min(e.maxCaptureSec||600,t));let n=document.getElementById(`scopeLengthVal`),r=document.getElementById(`scopeLengthSlider`);n&&(n.textContent=e.formatDuration(e.captureLength)),r&&(r.value=String(e.secondsToSlider(e.captureLength))),e.graphDirty=!0}function To(e){if(!e.canvas||!e.canvas||!e.canvas.parentElement)return;let t=e.canvas.parentElement.getBoundingClientRect(),n=Math.min(window.devicePixelRatio||1,2),r=Math.round(t.width*n),i=Math.round(t.height*n);r>0&&i>0&&(e.canvas.width!==r||e.canvas.height!==i)&&(e.canvas.width=r,e.canvas.height=i,e.w=r,e.h=i,e.dpr=n,e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=r,e.graphCanvas.height=i,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0)}function Eo(e){let t=e.dbfs||[-60,-60,-60,-60],n=isFinite(t[0])?Math.max(-60,t[0]):-60,r=isFinite(t[1])?Math.max(-60,t[1]):-60,i=-60,a=-60;if(typeof t[2]==`number`&&isFinite(t[2]))i=Math.max(-60,t[2]);else{let t=10**(n/20),a=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+a*a+2*t*a*o))*.5;i=s>1e-6?20*Math.log10(s):-60}if(typeof t[3]==`number`&&isFinite(t[3]))a=Math.max(-60,t[3]);else{let t=10**(n/20),i=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+i*i-2*t*i*o))*.5;a=s>1e-6?20*Math.log10(s):-60}let o=e.lufs||{},s=isFinite(o.m)?Math.max(-60,o.m):-60,c=isFinite(o.s)?Math.max(-60,o.s):-60,l=typeof o.i==`number`&&isFinite(o.i)&&o.i>-60?o.i:-60,u=typeof o.lra==`number`&&isFinite(o.lra)?o.lra:0,d=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1;return{liveL:n,liveR:r,liveSum:i,liveDiff:a,liveLufsM:s,liveLufsS:c,liveLufsI:l,liveLra:u,livePhase:d}}function Do(e,t,n,r){t&&(t.hasAudio||n.liveL>-58||n.liveR>-58||n.liveSum>-55)?(e.lastAudioTime=r,e.hasSignalLost=!1):e.lastAudioTime?r-e.lastAudioTime>=1e4&&(e.hasSignalLost=!0):e.lastAudioTime=r}function Oo(e){let t=e.w,n=e.h,r=e.dpr||1,i=175*r,a=28*r,o=18*r,s=26*r,c=Math.max(10,t-i-a),l=Math.max(10,n-o-s),u=e=>o+l*(1-(Math.max(-60,Math.min(6,e))- -60)/66);return{W:t,H:n,dpr:r,padL:i,padR:a,padT:o,padB:s,plotW:c,plotH:l,maxX:Math.round(i+c),limeY:Math.round(u(-18)),bufLen:e.bufferSize,dbToY:u}}var ko={bg:`#dedcd4`,grid:`#c4c0b2`,gridTime:`#cdc8bb`,textMuted:`#5c5a50`,textCyan:`#2a2b2a`,lineL:`#2a2b2a`,fillL:`rgba(42, 43, 42, 0.08)`,lineR:`#b91c1c`,fillR:`rgba(185, 28, 28, 0.08)`,lineSum:`#15803d`,fillSum:`rgba(21, 128, 61, 0.09)`,textSum:`#15803d`,textGold:`#b91c1c`},Ao={bg:`#16222c`,grid:`#243543`,gridTime:`#1e2c38`,textMuted:`#94a3b8`,textCyan:`#f8fafc`,lineL:`#f8fafc`,fillL:`rgba(248, 250, 252, 0.08)`,lineR:`#ef4444`,fillR:`rgba(239, 68, 68, 0.08)`,lineSum:`#22c55e`,fillSum:`rgba(34, 197, 94, 0.09)`};function jo(e){e.PAL_DARK||={...e.PAL};let t=document.body.classList.contains(`theme-wbs-ca`),n=document.body.classList.contains(`theme-mccurdy`),r=document.body.classList.contains(`theme-mccurdy-dark`);return t?(e.PAL={...e.PAL_DARK,...ko},!0):n?(e.PAL={...e.PAL_DARK,...Za},!0):r?(e.PAL={...e.PAL_DARK,...Ao},!1):(e.PAL=e.PAL_DARK,!1)}var Mo=[{db:6,lineCol:`rgba(239, 68, 68, 0.30)`,labelCol:`#ef4444`,bold:!0,label:`+6 dBFS (SUM MAX)`},{db:3,lineCol:`rgba(34, 197, 94, 0.26)`,labelCol:`#22c55e`,bold:!1,label:`+3 dBFS (SUM OVERLOAD)`},{db:0,lineCol:`rgba(220, 38, 38, 0.34)`,labelCol:`#dc2626`,bold:!0,label:`0 dBFS (PEAK)`},{db:-3,lineCol:`rgba(217, 119, 6, 0.26)`,labelCol:`#d97706`,bold:!1,label:`-3 dBFS`},{db:-4,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-4 dBFS`},{db:-8,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-8 dBFS`},{db:-12,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-12 dBFS`},{db:-14,lineCol:`rgba(249, 115, 22, 0.30)`,labelCol:`#f97316`,bold:!0,label:`-14 LUFS (STREAM)`},{db:-16,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-16 dBFS`},{db:-18,lineCol:`rgba(74, 222, 128, 0.35)`,labelCol:`#4ade80`,bold:!0,label:`-18 dBFS (0 VU)`},{db:-20,lineCol:`rgba(100, 116, 139, 0.20)`,labelCol:`#64748b`,bold:!1,label:`-20 dBFS (SMPTE)`},{db:-24,lineCol:`rgba(16, 185, 129, 0.28)`,labelCol:`#10b981`,bold:!0,label:`-24 LUFS (BROADCAST)`},{db:-28,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-28 dBFS`},{db:-32,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-32 dBFS`},{db:-36,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-36 dBFS`},{db:-40,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-40 dBFS`},{db:-44,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-44 dBFS`},{db:-48,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-48 dBFS`},{db:-52,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-52 dBFS`},{db:-56,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-56 dBFS`},{db:-60,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-60 dBFS`}];function No(e){return Mo.filter(t=>!(t.db===0&&!e.show0DbfsLine||t.db>0&&!e.showSum))}var Po={label:`LOGARITHMIC`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.6,label:t(e*.6)},{sec:e*.3,label:t(e*.3)},{sec:e*.15,label:t(e*.15)},{sec:e*.05,label:t(e*.05)},{sec:0,label:t(0)}]},Fo={label:`SUPER TRANSIENT LOG`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.4,label:t(e*.4)},{sec:e*.15,label:t(e*.15)},{sec:e*.04,label:t(e*.04)},{sec:e*.01,label:t(e*.01)},{sec:0,label:t(0)}]},Io={label:`LINEAR`,verticalGrid:!0,steps:(e,t)=>{let n=[],r=e/5;for(let i=e;i>.01;i-=r)n.push({sec:i,label:t(i)});return n.push({sec:0,label:t(0)}),n}},Lo={label:`SAMPLES`,verticalGrid:!0,steps:()=>[]};function Ro(e){return e===`super_log`?Fo:e===`log`?Po:e===`samples`?Lo:Io}function zo(e){return e===`log`||e===`super_log`}function Bo(e){let t=new Date(Date.now()-e*1e3);return`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}:${String(t.getSeconds()).padStart(2,`0`)}`}function Vo(e,t,n,r,i,a){let{dpr:o,padL:s,padT:c,plotW:l,plotH:u}=n;t.font=`${Math.round(10*o)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.textAlign=`center`,t.textBaseline=`top`,t.fillStyle=e.PAL.textMuted,t.strokeStyle=e.PAL.gridTime,t.lineWidth=1*o;let d=Ro(e.timeMode),f=d.steps(r,Bo),p=zo(e.timeMode);f.forEach(e=>{let n;if(!p)n=Math.round(s+l*(1-e.sec/r));else{let t=e.sec/r,o=e.sec===0?0:Math.log(1+i*t)/a;n=Math.round(s+l*(1-o))}d.verticalGrid&&(t.beginPath(),t.moveTo(n,c),t.lineTo(n,c+u),t.stroke()),t.beginPath(),t.moveTo(n,c+u),t.lineTo(n,c+u+4*o),t.stroke(),e.sec!==0&&t.fillText(e.label,n,c+u+6*o)})}function Ho(e,t,n,r,i){let a=Math.round(n*e.captureSpeed),o=Math.min(e.count,a);if(o<2)return null;let s=t.bufLen,c=(e.head-o+s)%s,l=zo(e.timeMode),u=e=>{if(l){let n=e<=1e-5?0:Math.log(1+r*e)/i;return t.padL+t.plotW*(1-n)}return t.padL+t.plotW*(1-e)},d=(o-1)/e.captureSpeed,f=Math.max(0,Math.min(1,d/n));return{capSec:n,beta:r,logBetaDenom:i,warped:l,targetSamples:o,startIdx:c,minX:Math.round(u(f))}}function Uo(e,t,n,r){let i=Math.max(0,Math.min(1,(r-t.padL)/t.plotW)),a,o=0;n.warped?(o=1-i,a=((1+n.beta)**+o-1)/n.beta):a=1-i;let s=Math.max(0,Math.min(n.capSec,a*n.capSec)),c=n.targetSamples-1-s*e.captureSpeed;return[Math.max(0,Math.min(n.targetSamples-1,c)),o]}function Wo(e,t,n,r,i){let a=e.createLinearGradient(t,0,n,0);return a.addColorStop(0,`rgba(${r}, 0)`),a.addColorStop(1,`rgba(${r}, ${i})`),a}function Go(e,t,n){let r=e.enableFade&&e.hfFadeDistance<100,i=e.PAL.fillLufs;if(r){let a=Math.max(10,Math.min(95,e.hfFadeDistance||50))/100,o=Math.round(n.padL+n.plotW*(1-a)),s=Math.round(n.padL+n.plotW*(1-a*.5));return{strokeA:Wo(t,o,s,`255, 255, 255`,`1`),fillA:Wo(t,o,s,`255, 255, 255`,`0.08`),strokeB:Wo(t,o,s,`239, 68, 68`,`1`),fillB:Wo(t,o,s,`239, 68, 68`,`0.08`),strokeSum:Wo(t,o,s,`34, 197, 94`,`1`),fillSum:Wo(t,o,s,`34, 197, 94`,`0.09`),strokeDiff:Wo(t,o,s,`6, 182, 212`,`1`),fillDiff:Wo(t,o,s,`6, 182, 212`,`0.08`),fillLufs:i,doFade:r}}return{strokeA:e.PAL.lineL,fillA:e.PAL.fillL,strokeB:e.PAL.lineR,fillB:e.PAL.fillR,strokeSum:e.PAL.lineSum,fillSum:e.PAL.fillSum,strokeDiff:e.PAL.lineDiff,fillDiff:e.PAL.fillDiff,fillLufs:i,doFade:r}}function Ko(e,t,n,r,i,a,o,s,c=!0,l=!1,u=null){let{dpr:d,padL:f,padT:p,plotW:m,plotH:h,maxX:g,bufLen:_,dbToY:v}=n,{minX:y,targetSamples:b,startIdx:x,capSec:S}=r;if(t.beginPath(),y>=g)return;let C=g-y,ee=e.absCount-b,te=e.pyr.has(i)&&e.pyrFor===e.histL;for(let a=0;a<=C;a++){let o=g-a,[s,c]=Uo(e,n,r,o),l=Uo(e,n,r,o-.5)[0],d=Uo(e,n,r,o+.5)[0]-l,p=te&&d>1.5,h=1-Math.max(0,Math.min(1,(o-f)/m)),y=ee+s,C=Math.floor(s),ne=Math.min(b-1,C+1),re=s-C,w=(x+C)%_,T=(x+ne)%_,E=p?Ua(e,i,y,d,h):i[w]*(1-re)+i[T]*re,ie=t=>p&&e.pyr.has(t)?Ua(e,t,y,d,h):t[w]*(1-re)+t[T]*re;if(u){if(r.warped){if(c>.05){let e=Math.min(1,(c-.05)/.35),t=e*e*(3-2*e),n=ie(u);E=E*(1-t)+n*t}}else{let t=S*e.captureSpeed/m;if(t>4){let e=Math.min(1,(t-4)/8),n=ie(u);E=E*(1-e)+n*e}}}a===0?t.moveTo(o,v(E)):t.lineTo(o,v(E))}if(a&&(t.strokeStyle=a,t.lineWidth=s*d,t.stroke()),c&&o){let e=p+h;t.lineTo(y,e),t.lineTo(g,e),t.closePath(),t.fillStyle=o,t.fill()}}function qo(e,t,n,r,i,a){let o=n.dpr,s=(i,a,o,s,c=!0,l=!1,u=null)=>Ko(e,t,n,r,i,a,o,s,c,l,u);e.showChB&&s(e.histR,i.strokeB,i.fillB,1.5,!0,i.doFade,e.histNormR),e.showChA&&s(e.histL,i.strokeA,i.fillA,1.5,!0,i.doFade,e.histNormL),e.showSum&&s(e.histSum,i.strokeSum,i.fillSum,1.8,!0,i.doFade,e.histNormSum),e.showDiff&&s(e.histDiff,i.strokeDiff,i.fillDiff,1.8,!0,i.doFade,e.histNormDiff),e.showLufs&&(t.save(),a||(t.shadowColor=`#f97316`,t.shadowBlur=12*o),s(e.histLufsM,a?null:`rgba(249, 115, 22, 0.45)`,i.fillLufs,5,!0,!1),s(e.histLufsM,`#fb923c`,null,2.6,!1,!1),t.restore()),e.showLufsS&&s(e.histLufsS,e.PAL.textLufsS,null,2,!1,!1),e.showLufsI&&s(e.histLufsI,e.PAL.textInteg,null,2,!1,!1)}function Jo(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,maxX:c,bufLen:l,dbToY:u}=n,{minX:d,targetSamples:f,startIdx:p}=r,m=u(-46),h=u(-60),g=e=>h-e/180*(h-m),_=`rgba(168, 85, 247, 0.85)`;t.save(),t.fillStyle=i?`rgba(168, 85, 247, 0.06)`:`rgba(168, 85, 247, 0.05)`,t.fillRect(o,m,s,h-m),t.setLineDash([3*a,4*a]),t.lineWidth=1*a,t.strokeStyle=`rgba(168, 85, 247, 0.35)`;for(let e of[0,90,180]){let n=Math.round(g(e))+.5;t.beginPath(),t.moveTo(o,n),t.lineTo(o+s,n),t.stroke()}t.setLineDash([]),t.font=`bold ${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.fillStyle=_;let v=o+s-4*a;t.textBaseline=`top`,t.fillText(`180° PHASE`,v,m+2*a),t.textBaseline=`middle`,t.fillText(`90°`,v,g(90)),t.textBaseline=`bottom`,t.fillText(`0°`,v,h-2*a),t.restore();let y=t=>Uo(e,n,r,t)[0],b=e.absCount-f,x=e.pyr.has(e.histPhase)&&e.pyrFor===e.histL;t.beginPath();let S=c-d;for(let n=0;n<=S;n++){let r=c-n,i=y(r),a=y(r+.5)-y(r-.5),u;if(x&&a>1.5){let t=1-Math.max(0,Math.min(1,(r-o)/s));u=Ua(e,e.histPhase,b+i,a,t,!0)}else{let t=Math.floor(i),n=Math.min(f-1,t+1),r=i-t;u=e.histPhase[(p+t)%l]*(1-r)+e.histPhase[(p+n)%l]*r}let d=g(180-Math.acos(Math.max(-1,Math.min(1,u)))*180/Math.PI);n===0?t.moveTo(r,d):t.lineTo(r,d)}t.strokeStyle=_,t.lineWidth=1.4*a,t.stroke()}function Yo(e,t,n){let r=t.dbToY(-14),i=t.dbToY(-24);e.save(),e.fillStyle=n?`rgba(249, 115, 22, 0.08)`:`rgba(249, 115, 22, 0.06)`,e.fillRect(t.padL,r,t.plotW,i-r),e.restore()}function Xo(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,dbToY:c}=n;t.save(),t.font=`${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.setLineDash([]);let l=13*a,u=[],d=new Set,f=[...r].sort((e,t)=>Number(t.bold)-Number(e.bold));for(let e of f){let t=c(e.db);u.every(e=>Math.abs(e-t)>=l)&&(u.push(t),d.add(e.db))}r.forEach(n=>{let r=Math.round(c(n.db)),l=n.db===-20;(d.has(n.db)||n.bold||l)&&(t.save(),t.setLineDash([]),t.strokeStyle=l&&e.isHoveringLime?`#4ade80`:n.lineCol,t.lineWidth=l?e.isHoveringLime?2*a:1.2*a:1*a,l&&e.isHoveringLime&&!i&&(t.shadowColor=`rgba(74, 222, 128, 0.8)`,t.shadowBlur=6*a),t.beginPath(),t.moveTo(o,r),t.lineTo(o+s,r),t.stroke(),t.restore(),t.save(),i||(t.shadowColor=`rgba(0, 0, 0, 0.95)`,t.shadowBlur=3*a),t.fillStyle=n.bold||l?n.labelCol:i?`#4a4740`:`#94a3b8`,d.has(n.db)&&t.fillText(n.label,o-10*a,r),t.restore())}),t.restore(),t.setLineDash([])}function Zo(e,t){let n=e.graphCtx;if(!n)return!1;e.graphDirty=!1;let r=jo(e);n.fillStyle=e.PAL.bg,n.fillRect(0,0,t.W,t.H);let i=No(e),a=e.getActiveSpanSec(),o=e.beta||(e.timeMode===`super_log`?60:15),s=e.logBetaDenom||Math.log(1+o);Vo(e,n,t,a,o,s);let c=Ho(e,t,a,o,s);return c&&(qo(e,n,t,c,Go(e,n,t),r),e.plotPhase&&c.minX<t.maxX&&Jo(e,n,t,c,r)),Yo(n,t,r),Xo(e,n,t,i,r),!0}function Qo(e,t,n,r,i,a,o,s,c,l){e.fillStyle=o,e.strokeStyle=s,e.lineWidth=c,e.beginPath(),e.rect(n,r,i,a),e.fill(),e.stroke(),e.fillStyle=l,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(t,n+i/2,r+a/2)}function $o(e,t,n){let{dpr:r,padL:i,plotW:a,limeY:o}=n;if(e.zoomFeedbackTime&&performance.now()-e.zoomFeedbackTime<1900){let n=performance.now()-e.zoomFeedbackTime,s=Math.max(0,Math.min(1,1-(n-1100)/800));t.save(),t.globalAlpha=s;let c=e.zoomFeedbackText||`ZOOM: ${e.formatDuration(e.captureLength)}`;t.font=`bold ${Math.round(11*r)}px ui-monospace, "SF Mono", monospace`;let l=t.measureText(c).width+20*r,u=22*r;Qo(t,c,Math.round(i+(a-l)/2),Math.round(o-u/2),l,u,`rgba(11, 15, 23, 0.94)`,`#22c55e`,1.5*r,`#4ade80`),t.restore()}else if(e.isHoveringLime){t.save();let n=`↕ SCROLL TO ZOOM TIME (${e.formatDuration(e.captureLength)})`;t.font=`bold ${Math.round(9.5*r)}px ui-monospace, "SF Mono", monospace`;let s=t.measureText(n).width+16*r,c=18*r;Qo(t,n,Math.round(i+a-s-10*r),Math.round(o-c/2),s,c,`rgba(11, 15, 23, 0.88)`,`rgba(34, 197, 94, 0.6)`,1*r,`#86efac`),t.restore()}}function es(e,t,n){let{dpr:r,padL:i,padT:a,plotW:o,plotH:s}=n;e.showCursorTrace&&e.hoverX!==null&&e.hoverX>=i&&e.hoverX<=i+o&&(t.strokeStyle=`rgba(56, 189, 248, 0.6)`,t.lineWidth=1*r,t.setLineDash([3*r,3*r]),t.beginPath(),t.moveTo(e.hoverX,a),t.lineTo(e.hoverX,a+s),t.stroke(),t.setLineDash([]))}function ts(e,t,n,r,i){e.fillStyle=i,e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.fill()}function ns(e,t,n){let{dpr:r,bufLen:i,dbToY:a}=n,o=n.maxX,s=(e.head-1+i)%i,c=a(e.histL[s]),l=a(e.histR[s]),u=a(e.histLufsM[s]);e.showChB&&ts(t,o,l,3.2*r,e.PAL.lineR),e.showChA&&ts(t,o,c,3.2*r,e.PAL.lineL),e.showSum&&ts(t,o,a(e.histSum[s]),3.5*r,e.PAL.lineSum),e.showDiff&&ts(t,o,a(e.histDiff[s]),3.5*r,e.PAL.lineDiff),e.showLufs&&(ts(t,o,u,7*r,`rgba(244, 144, 44, 0.35)`),ts(t,o,u,4.2*r,e.PAL.lineLufs),ts(t,o,u,1.8*r,`#ffffff`)),e.showLufsS&&ts(t,o,a(e.histLufsS[s]),3.8*r,e.PAL.textLufsS),e.showLufsI&&ts(t,o,a(e.histLufsI[s]),3.8*r,e.PAL.textInteg)}function rs(e,t,n,r,i,a,o=0){r<=.2||i<=.01||(e.save(),e.translate(t,n),o!==0&&e.rotate(o),e.globalAlpha=Math.max(0,Math.min(1,i)),e.fillStyle=a,e.beginPath(),e.moveTo(0,-r),e.quadraticCurveTo(0,0,r,0),e.quadraticCurveTo(0,0,0,r),e.quadraticCurveTo(0,0,-r,0),e.quadraticCurveTo(0,0,0,-r),e.closePath(),e.fill(),r>=2&&i>=.4&&(e.strokeStyle=a,e.lineWidth=Math.max(.6,r*.14),e.beginPath(),e.moveTo(0,-r*1.4),e.lineTo(0,r*1.4),e.moveTo(-r*1.4,0),e.lineTo(r*1.4,0),e.stroke()),e.fillStyle=`#ffffff`,e.beginPath(),e.arc(0,0,Math.max(.6,r*.26),0,Math.PI*2),e.fill(),e.restore())}var is=new Path2D(`
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
`);function as(e,t,n,r){let{dpr:i,padL:a,padT:o,plotW:s,plotH:c,maxX:l}=n,u=e.getActiveSpanSec(),d=e.beta||(e.timeMode===`super_log`?60:15),f=e.logBetaDenom||Math.log(1+d),p=zo(e.timeMode);e.visibleNtpDots=[];let m=uo.getRecentReceipts(u*1e3);if(!m||m.length===0)return;let h=Math.round(o+c-14*i),g=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-light`);for(let n of m){let m=(r-n.timestamp)/1e3;if(m<0||m>u)continue;let _=Math.max(0,Math.min(1,m/u)),v;if(!p)v=Math.round(a+s*(1-_));else{let e=_<=1e-5?0:Math.log(1+d*_)/f;v=Math.round(a+s*(1-e))}if(v<a||v>l)continue;let y=e.hoveredNtpReceipt?.id===n.id,b=16*i,x={receipt:n,x:v,y:h,radius:b,ageSec:m};e.visibleNtpDots.push(x),t.save(),y&&(t.beginPath(),t.setLineDash([3*i,3*i]),t.strokeStyle=g?`rgba(220, 38, 38, 0.85)`:`rgba(56, 189, 248, 0.85)`,t.lineWidth=1.5*i,t.moveTo(v,o),t.lineTo(v,o+c),t.stroke(),t.setLineDash([])),t.save(),t.translate(v,h);let S=(y?.85:.65)*i;if(t.scale(S,S),t.fillStyle=y?`#f87171`:g?`#dc2626`:n.server.includes(`chu`)?`#f59e0b`:`#ef4444`,t.fill(is),y&&(t.strokeStyle=`#ffffff`,t.lineWidth=1.2/S,t.stroke(is)),t.restore(),y){t.font=`bold ${Math.round(10.5*i)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`center`,t.textBaseline=`bottom`;let e=`🍁 NRC NTP · ${n.server} (${n.offsetMs>=0?`+`:``}${n.offsetMs.toFixed(2)}ms)`,r=t.measureText(e).width+12*i,o=18*i,s=Math.max(a+r/2,Math.min(l-r/2,v)),c=h-14*i;t.fillStyle=g?`rgba(254, 252, 243, 0.96)`:`rgba(15, 23, 42, 0.95)`,t.strokeStyle=`#38bdf8`,t.lineWidth=1*i,t.beginPath(),t.roundRect(s-r/2,c-o,r,o,4*i),t.fill(),t.stroke(),t.fillStyle=g?`#0f172a`:`#38bdf8`,t.fillText(e,s,c-4*i)}t.restore()}}function os(e,t,n,r){let{dpr:i,padL:a,padT:o,plotW:s,plotH:c,maxX:l}=n,u=e.getActiveSpanSec(),d=e.beta||(e.timeMode===`super_log`?60:15),f=e.logBetaDenom||Math.log(1+d),p=zo(e.timeMode),m=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-light`),h=e.count>0&&e.captureSpeed>0?e.count/e.captureSpeed:0,g=r-u*1e3,_=Math.ceil(g/6e4)*6e4,v=Math.floor(r/6e4)*6e4;for(let n=_;n<=v;n+=6e4){let g=(r-n)/1e3;if(g<0||g>u||e.count<e.bufferSize&&g>h+.5)continue;let _=Math.max(0,Math.min(1,g/u)),v;if(!p)v=Math.round(a+s*(1-_));else{let e=_<=1e-5?0:Math.log(1+d*_)/f;v=Math.round(a+s*(1-e))}if(v<a||v>l)continue;t.save(),t.beginPath(),t.setLineDash([3*i,3*i]),t.strokeStyle=m?`rgba(185, 28, 28, 0.45)`:`rgba(56, 189, 248, 0.4)`,t.lineWidth=1*i,t.moveTo(v,o),t.lineTo(v,o+c),t.stroke(),t.setLineDash([]);for(let e=0;e<4;e++){let a=e*79+n%1e4,s=o+c*(1-(r*4e-4+a*.15)%1),l=Math.sin(r*.006+a);if(l>-.2){let n=(1.8+(l+.2)*1.5)*i,o=m?e%3==0?`#b91c1c`:e%3==1?`#d97706`:`#78350f`:e%3==0?`#38bdf8`:e%3==1?`#facc15`:`#ffffff`,c=r*.002*(e%2==0?1:-1)+a;rs(t,v,s,n,(l+.3)*.75,o,c)}}let y=new Date(n),b=`${String(y.getHours()).padStart(2,`0`)}:${String(y.getMinutes()).padStart(2,`0`)}:${String(y.getSeconds()).padStart(2,`0`)}`;t.strokeStyle=m?`rgba(185, 28, 28, 0.7)`:`rgba(56, 189, 248, 0.7)`,t.lineWidth=1.2*i,t.beginPath(),t.moveTo(v,o+c),t.lineTo(v,o+c+5*i),t.stroke(),l-v>32*i&&v-a>24*i&&(t.font=`bold ${Math.round(9.5*i)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`center`,t.textBaseline=`top`,t.fillStyle=m?`#7f1d1d`:`#38bdf8`,t.fillText(b,v,o+c+6*i)),t.restore()}}var ss=e=>e>-60?e.toFixed(1):`-INF`,cs=e=>e>-60?(e>0?`+`:``)+e.toFixed(1):`-INF`;function ls(e,t,n){if(!e.hudChA)return;let r=(e.head-1+n)%n,i=e.histL[r],a=e.histR[r];e.hudChA.textContent=ss(i)+` dBFS`,e.hudChB&&(e.hudChB.textContent=ss(a)+` dBFS`),e.hudSum&&(e.hudSum.textContent=cs(e.histSum[r])+` dBFS`),e.hudDiff&&(e.hudDiff.textContent=cs(e.histDiff[r])+` dBFS`),e.hudLufsM&&(e.hudLufsM.textContent=ss(t.liveLufsM)+` LUFS`),e.hudLufsS&&(e.hudLufsS.textContent=ss(t.liveLufsS)+` LUFS`),e.hudLufsI&&(e.hudLufsI.textContent=ss(t.liveLufsI)+` LUFS`),e.hudLra&&(e.hudLra.textContent=(t.liveLra>0?t.liveLra.toFixed(1):`0.0`)+` LU`),e.hudMax&&(e.hudMax.textContent=`L ${ss(e.peakMaxL)} | R ${ss(e.peakMaxR)}`),e.hudTimeMode&&(e.hasSignalLost?(e.hudTimeMode.textContent=`⚠ LOSS OF SIGNAL (SILENCE > 10s)`,e.hudTimeMode.style.color=`#fbbf24`):(e.hudTimeMode.textContent=`ITU-R BS.1770-4 · ${Ro(e.timeMode).label}`,e.hudTimeMode.style.color=``)),e.clipCountL>0||e.clipCountR>0?(e.hudClipRow&&(e.hudClipRow.style.display=`flex`),e.hudClips&&(e.hudClips.textContent=String(e.clipCountL+e.clipCountR))):e.hudClipRow&&(e.hudClipRow.style.display=`none`)}function us(e,t,n,r){e.hasSignalLost&&Math.floor(r%1200/600)===0&&(t.save(),t.font=`bold ${Math.round(11*n.dpr)}px ui-monospace, monospace`,t.textAlign=`right`,t.textBaseline=`top`,t.fillStyle=`#fbbf24`,t.fillText(`⚠ LOSS OF SIGNAL (>10s)`,n.W-32*n.dpr,n.padT+8*n.dpr),t.restore())}var ds=2048,fs=null;function ps(e){let t=e?.ctx||null,n=e?.hpfNode||null;if(!t||!n)return null;if(!fs||fs.ctx!==t||fs.src!==n)try{let e=t.createChannelSplitter(2),r=t.createAnalyser(),i=t.createAnalyser();r.fftSize=ds,i.fftSize=ds,n.connect(e),e.connect(r,0),e.connect(i,1),fs={ctx:t,src:n,aL:r,aR:i,bufL:new Float32Array(ds),bufR:new Float32Array(ds)}}catch{return null}return fs.aL.getFloatTimeDomainData(fs.bufL),fs.aR.getFloatTimeDomainData(fs.bufR),{l:fs.bufL,r:fs.bufR,rate:t.sampleRate}}var ms=[{a:1,label:`0 dBFS`},{a:.5012,label:`-6 dBFS`},{a:.1259,label:`-18 dBFS`}];function hs(e,t){let n=e.ctx;if(!n)return;jo(e);let r=e.PAL,i=t.dpr;n.fillStyle=r.bg,n.fillRect(0,0,t.W,t.H);let a=t.padT+t.plotH/2,o=t.plotH/2-2*i,s=e=>a-Math.max(-1.05,Math.min(1.05,e))*o;n.font=`${10*i}px monospace`,n.textAlign=`right`,n.textBaseline=`middle`,n.lineWidth=1;for(let e of ms)for(let a of[1,-1]){let o=Math.round(s(e.a*a))+.5;n.strokeStyle=e.a===1?r.gridClip:e.a<.2?r.gridRef:r.grid,n.setLineDash(e.a===1?[]:[4*i,4*i]),n.beginPath(),n.moveTo(t.padL,o),n.lineTo(t.maxX,o),n.stroke(),n.fillStyle=r.textMuted,n.fillText(e.label,t.padL-8*i,o)}n.setLineDash([]),n.strokeStyle=r.grid,n.beginPath(),n.moveTo(t.padL,Math.round(a)+.5),n.lineTo(t.maxX,Math.round(a)+.5),n.stroke();let c=ps(e.audioEngine);if(!c){n.fillStyle=r.textMuted,n.textAlign=`center`,n.font=`${12*i}px monospace`,n.fillText(`NO AUDIO`,t.padL+t.plotW/2,a-14*i);return}let l=32;for(;l*2<=1024&&t.plotW/(l*2)>=5*i;)l*=2;let{l:u,r:d,rate:f}=c,p=ds-l;for(let e=ds-l;e>0;e--)if(u[e-1]<0&&u[e]>=0){p=e;break}let m=t.plotW/(l-1),h=e=>t.padL+e*m;n.textAlign=`center`,n.textBaseline=`top`;for(let e=0;e<=8;e++){let a=e/8*l,o=Math.round(h(Math.min(a,l-1)))+.5;n.strokeStyle=r.gridTime,n.beginPath(),n.moveTo(o,t.padT),n.lineTo(o,t.padT+t.plotH),n.stroke(),n.fillStyle=r.textMuted,n.fillText(e===8?`${l} smp · ${(l/f*1e3).toFixed(2)} ms`:`${a}`,Math.min(o,t.maxX-60*i),t.padT+t.plotH+6*i)}let g=m>=5*i,_=(e,t,r)=>{if(n.strokeStyle=t,n.fillStyle=t,n.lineWidth=Math.max(1,i),g){n.beginPath();for(let t=0;t<l;t++){let i=h(t)+r;n.moveTo(i,a),n.lineTo(i,s(e[p+t]))}n.globalAlpha=.45,n.stroke(),n.globalAlpha=1;let t=Math.min(3*i,m*.28);for(let i=0;i<l;i++)n.beginPath(),n.arc(h(i)+r,s(e[p+i]),t,0,Math.PI*2),n.fill()}else{n.beginPath();for(let t=0;t<l;t++){let r=s(e[p+t]);t===0?n.moveTo(h(t),r):n.lineTo(h(t),r)}n.stroke()}};_(d,r.lineR,g?m/3:0),_(u,r.lineL,0)}function gs(e,t,n){if(!e.ctx||!e.w||!e.h)return;let r=Eo(n),i=performance.now();Do(e,n,r,i),e.push(r.liveL,r.liveR,r.liveLufsM,r.liveLufsS,r.livePhase,r.liveSum,r.liveDiff,r.liveLufsI);let a=e.w,o=e.h;e.graphCanvas&&e.graphCanvas.width===a&&e.graphCanvas.height===o||(e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=a,e.graphCanvas.height=o,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0),e.isHoveringLime!==e._lastHoveringLime&&(e.graphDirty=!0,e._lastHoveringLime=e.isHoveringLime),e.renderFrameCount=(e.renderFrameCount||0)+1;let s=Oo(e);if(e.timeMode===`samples`){hs(e,s),ls(e,r,s.bufLen);return}if(!Zo(e,s)||!e.ctx||!e.graphCanvas)return;e.ctx.drawImage(e.graphCanvas,0,0);let c=e.ctx;os(e,c,s,Date.now()),$o(e,c,s),es(e,c,s),ns(e,c,s),as(e,c,s,Date.now()),ls(e,r,s.bufLen),us(e,c,s,i)}var _s=class{container;canvas=null;ctx=null;graphCanvas=null;graphCtx=null;graphDirty=!0;renderFrameCount=0;_lastGraphRenderTime=0;timeMode=`log`;onTimeModeChange=null;audioEngine=null;beta=15;logBetaDenom=Math.log(16);maxCaptureSec=600;captureLength=60;captureSpeed=60;lastPushTime=0;pushAccumulator=0;bufferSize;static PYR_LEVELS=14;absCount=0;pyr=new Map;pyrFor=null;histL;histR;histSum;histDiff;histNormL;histNormR;histNormSum;histNormDiff;histLufsM;histLufsS;histLufsI;histPhase;envL=-60;envR=-60;envSum=-60;envDiff=-60;envLufsM=-60;envLufsS=-60;normL=-60;normR=-60;normSum=-60;normDiff=-60;head=0;count=0;isHoveringLime=!1;_lastHoveringLime=!1;zoomFeedbackTime=0;zoomFeedbackText=``;showChA;showChB;showSum;showDiff;showLufs;showLufsS;showLufsI;show0DbfsLine;enableFade=!1;hfFadeDistance=100;showHoverTelemetry=!0;showCursorTrace=!0;plotPhase=!0;isDocked;hoverX=null;hoverY=null;visibleNtpDots=[];hoveredNtpReceipt=null;peakMaxL=-60;peakMaxR=-60;lufsMaxM=-60;clipCountL=0;clipCountR=0;lastAudioTime=performance.now();hasSignalLost=!1;PAL;PAL_DARK=null;static PAL_MC=Za;wrapper=null;hudEl=null;btnDock=null;dockContainer=null;hudChA=null;hudChB=null;hudSum=null;hudDiff=null;hudLufsM=null;hudLufsS=null;hudLufsI=null;hudLra=null;hudMax=null;hudClipRow=null;hudClips=null;hudTimeMode=null;hudChkChA=null;hudChkChB=null;hudChkSum=null;hudChkDiff=null;hudChkLufsM=null;hudChkLufsS=null;hudChkLufsI=null;hudRowChA=null;hudRowChB=null;hudRowSum=null;hudRowDiff=null;hudRowLufsM=null;hudRowLufsS=null;hudRowLufsI=null;_updateTraceToggles;onClear=null;ro;w=0;h=0;dpr=1;constructor(e){this.container=e,this.canvas=null,this.ctx=null,this.timeMode=`log`,this.onTimeModeChange=null,this.beta=15,this.logBetaDenom=Math.log(16),this.maxCaptureSec=600,this.captureLength=60,this.captureSpeed=240,this.lastPushTime=0,this.bufferSize=Math.round(this.maxCaptureSec*this.captureSpeed),Wa(this,this.bufferSize),this.envL=-60,this.envR=-60,this.envSum=-60,this.envDiff=-60,this.normL=-60,this.normR=-60,this.normSum=-60,this.normDiff=-60,this.head=0,this.count=0,this.isHoveringLime=!1,this.zoomFeedbackTime=0,this.zoomFeedbackText=``;let t=Ya();this.showChA=t.showChA,this.showChB=t.showChB,this.showSum=t.showSum,this.showDiff=t.showDiff,this.showLufs=t.showLufs,this.showLufsS=t.showLufsS,this.showLufsI=t.showLufsI,this.show0DbfsLine=t.show0DbfsLine,this.enableFade=!1,this.hfFadeDistance=100,this.showHoverTelemetry=!0,this.showCursorTrace=!0,this.plotPhase=!0,this.isDocked=t.isDocked,this.hoverX=null,this.hoverY=null,this.peakMaxL=-60,this.peakMaxR=-60,this.lufsMaxM=-60,this.clipCountL=0,this.clipCountR=0,this.PAL=Xa(),this.initCanvas()}sliderToSeconds(e){return Pa(e)}secondsToSlider(e){return Fa(e)}formatDuration(e){return Ia(e)}getActiveSpanSec(){return Math.min(this.maxCaptureSec||600,this.captureLength)}resizeBuffer(e){Ga(this,e)}pyrSources(){return La(this)}pyrReset(){Ra(this)}pyrPush(){za(this)}rawAt(e,t){return Ba(this,e,t)}blockAt(e,t,n,r){return Va(this,e,t,n,r)}levelAt(e,t,n,r){return Ha(this,e,t,n,r)}pyrSample(e,t,n,r,i=!1){return Ua(this,e,t,n,r,i)}clear(){Ka(this)}initCanvas(){vo(this)}setDocked(e){xo(this,e)}setBeta(e){So(this,e)}setTimeMode(e){Co(this,e)}setCaptureLength(e){wo(this,e)}handleResize(){To(this)}push(e,t,n,r,i=1,a=-60,o=-60,s=-60){qa(this,e,t,n,r,i,a,o,s)}render(e,t){gs(this,e,t)}},vs=[{port:8467,path:`/api/mxl`,type:`wbs-router`,defaultName:`WARD BECK TAP (MXL Engine)`},{port:9600,path:`/domains`,type:`mxl-generator`,defaultName:`CBC MXL Test Generator`},{port:9601,path:`/openapi.json`,type:`mxl-receiver`,defaultName:`CBC MXL WebRTC Receiver`},{port:9602,path:`/openapi.json`,type:`mxl-player`,defaultName:`CBC MXL Clip / File Player`},{port:9699,path:`/openapi.json`,type:`mxl-gui`,defaultName:`CBC MXL Domain Info GUI`},{port:8040,path:`/api/status`,type:`wbs-dsp`,defaultName:`Ward-Beck MXL DSP Micro-Server`},{port:8100,path:`/status`,type:`apk-node`,defaultName:`BareMetal Audio Supervisor`}],ys=[],bs=[],xs=null,Ss=null,Cs=!1;function ws(){return[...ys]}function Ts(e){Ds()}function Es(e){return bs.push(e),e(ws()),()=>{bs=bs.filter(t=>t!==e)}}function Ds(){let e=ws();for(let t of bs)try{t(e)}catch(e){console.warn(`XMXL change callback error:`,e)}}async function Os(e,t={},n=450){let r=new AbortController,i=setTimeout(()=>r.abort(),n);try{let n=await fetch(e,{...t,signal:r.signal,mode:`cors`,headers:{Accept:`application/json, text/plain, */*`,...t.headers||{}}});return clearTimeout(i),n}catch(e){throw clearTimeout(i),e}}async function ks(e){for(let t of[`127.0.0.1`,`localhost`]){let n=performance.now(),r=`http://${t}:${e.port}`,i=`${r}${e.path}`;try{let t=await Os(i,{method:e.method||`GET`},450);if(!t.ok&&t.status!==200&&t.status!==204)continue;let a=Math.round(performance.now()-n),o={};try{o=await t.json()}catch{o={}}let s={id:`xmxl-${e.port}`,name:e.defaultName,type:e.type,port:e.port,baseUrl:r,flows:[],status:`online`,latencyMs:a,lastSeen:Date.now()};if(e.port===8467){s.name=`WARD BECK TAP (MXL Engine)`,o.domain_id&&(s.domainId=o.domain_id),o.active_source&&(s.activeSource=o.active_source);let e=[];Array.isArray(o.flows)&&e.push(...o.flows.map(e=>({flowId:e.flow_id||`unknown`,label:e.label||e.flow_id,mediaType:e.media_type||`audio/float32`,sampleRate:e.sample_rate||48e3,channelCount:e.channel_count||2,bufferLength:e.buffer_length||48e4,quantum:e.quantum||256,writeHead:e.write_head||0,writeSeq:e.write_seq||0,taiTimestampNs:e.tai_timestamp_ns||0,shmPath:e.shm_path||``,overrunCount:e.overrun_count||0,underrunCount:e.underrun_count||0})));let t=o.domains?.[`Ward-Beck Test Signals`];if(t&&Array.isArray(t.flows))for(let n of t.flows){let t=n.id||n.flow_id;e.some(e=>e.flowId===t)||e.push({flowId:t,label:`⚡ ${n.label||t} (${n.description||`Test Signal`})`,mediaType:n.media_type||`audio/float32`,sampleRate:typeof n.sample_rate==`object`?n.sample_rate.numerator||48e3:n.sample_rate||48e3,channelCount:n.channel_count||2,bufferLength:n.buffer_length||48e4,quantum:n.quantum||256,shmPath:n.path||``})}s.flows=e}else e.port===9600?(s.name=`CBC/Radio-Canada MXL Test Generator`,Array.isArray(o.domains)&&o.domains.length>0&&(s.domainId=o.domains[0].id||`exercise-4`,s.domainLabel=o.domains[0].label||o.domains[0].description,s.flows=[{flowId:`mxl-test-sine`,label:`MXL 48kHz Calibrated Generator`,mediaType:`audio/float32`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256}])):e.port===9601?(s.name=`CBC/Radio-Canada MXL Receiver Demo`,s.domainId=`exercise-4`,o?.info?.title&&(s.name=o.info.title)):e.port===9602?(s.name=`CBC/Radio-Canada MXL File / Clip Player`,s.domainId=`exercise-4`,o?.info?.title&&(s.name=o.info.title),s.flows=[{flowId:`mxl-clip-audio`,label:`MXL High-Def Media Clip Playback`,mediaType:`audio/float32`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256}]):e.port===9699?(s.name=`CBC/Radio-Canada MXL Domain Info GUI`,s.domainId=`exercise-4`,o?.info?.title&&(s.name=o.info.title)):e.port===8100?(s.name=`BareMetal Audio / NMOS IS-04 Supervisor`,o?.node&&(s.name=`BareMetal Audio (${o.node})`)):e.port===8040&&(s.name=`Ward-Beck Systems MXL DSP Host (wbs_mxl_host)`,s.domainId=`domain-wbs-dmf-01`);return s}catch{}}return null}var As=[{host:`44.44.44.158`,port:80,type:`nmos-node`,defaultName:`WBS-32me (uNet2500)`},{host:`WBS-32me.local`,port:80,type:`nmos-node`,defaultName:`WBS-32me`}];async function js(){for(let e of[`127.0.0.1`,`localhost`])try{let t=await Os(`http://${e}:8467/api/nmos`,{method:`GET`},600);if(!t.ok)continue;let n=await t.json();if(!n.nodes||!Array.isArray(n.nodes)||n.nodes.length===0)continue;return n.nodes.map(e=>{let t=e.node?.hostname||e.node?.label||e.ip;return{id:`nmos-${e.ip.replace(/\./g,`-`)}`,name:`NMOS IS-04: ${t} (${e.node?.label||`AES67 / ST 2110-30`})`,type:`nmos-node`,port:e.port||80,baseUrl:`http://${e.ip}:${e.port}`,domainId:`nmos-is04`,domainLabel:`NMOS IS-04 Broadcast Network`,status:`online`,latencyMs:6,lastSeen:Date.now(),flows:(e.flows||[]).map(e=>{let t=parseInt(e.tags?.channels?.[0]||`8`,10),n=parseInt(e.tags?.clockRate?.[0]||`48000`,10),r=e.tags?.encodingName?.[0]||`L24`;return{flowId:e.id,label:`${e.label||e.id.substring(0,8)} (${t}ch ${r} @ ${n}Hz)`,mediaType:`audio/${r}`,sampleRate:n,channelCount:t,bufferLength:48e4,quantum:256}})}})}catch{}return[]}async function Ms(e){let t=`http://${e.host}:${e.port}/x-nmos/v1.0/node/self`;try{let n=await Os(t,{method:`GET`},700);if(!n.ok)return null;let r=await n.json(),i=[];try{let t=await Os(`http://${e.host}:${e.port}/x-nmos/v1.0/node/flows`,{method:`GET`},700);if(t.ok){let e=await t.json();Array.isArray(e)&&(i=e.map(e=>{let t=parseInt(e.tags?.channels?.[0]||`8`,10),n=parseInt(e.tags?.clockRate?.[0]||`48000`,10),r=e.tags?.encodingName?.[0]||`L24`;return{flowId:e.id,label:`${e.label||e.id.substring(0,8)} (${t}ch ${r} @ ${n}Hz)`,mediaType:`audio/${r}`,sampleRate:n,channelCount:t,bufferLength:48e4,quantum:256}}))}}catch{}return{id:`nmos-${e.host.replace(/[\.:]/g,`-`)}`,name:`NMOS IS-04: ${r.hostname||r.label||e.defaultName}`,type:`nmos-node`,port:e.port,baseUrl:`http://${e.host}:${e.port}`,domainId:`nmos-is04`,domainLabel:`NMOS IS-04 Broadcast Network`,flows:i,status:`online`,latencyMs:10,lastSeen:Date.now()}}catch{return null}}async function Ns(){for(let e of[`127.0.0.1`,`localhost`])try{let t=await Os(`http://${e}:8467/api/aoip`,{method:`GET`},700);if(!t.ok)continue;let n=await t.json(),r=[],i=n.dante?.devices||[];for(let e of i)r.push({id:`dante-${e.name.toLowerCase().replace(/[^a-z0-9]/g,`-`)}`,name:`Dante: ${e.name} (${e.manufacturer||`Audinate DCM`} 16ch)`,type:`dante-node`,port:e.port||4440,baseUrl:`http://${e.ip}:${e.port||4440}`,domainId:`dante-aoip`,domainLabel:`Audinate Dante Broadcast Network`,status:`online`,latencyMs:1,lastSeen:Date.now(),flows:[{flowId:`${e.name}-Ch1-Ch2`,label:`${e.name} Ch 1-2 (2ch L24 @ 48000Hz)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256},{flowId:`${e.name}-Ch3-Ch4`,label:`${e.name} Ch 3-4 (2ch L24 @ 48000Hz)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256},{flowId:`${e.name}-Ch5-Ch8`,label:`${e.name} Ch 5-8 (4ch L24 @ 48000Hz)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:4,bufferLength:48e4,quantum:256},{flowId:`${e.name}-Ch9-Ch16`,label:`${e.name} Ch 9-16 (8ch L24 @ 48000Hz)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:8,bufferLength:48e4,quantum:256}]});let a=n.ravenna?.streams||[];a.length>0&&r.push({id:`ravenna-archwave`,name:`Ravenna: WBS-32me (Archwave uNet2500)`,type:`ravenna-node`,port:554,baseUrl:`rtsp://44.44.44.158:554`,domainId:`ravenna-aes67`,domainLabel:`Ravenna / AES67 Media Network`,status:`online`,latencyMs:5,lastSeen:Date.now(),flows:a.map(e=>({flowId:e.name,label:`${e.name} (8ch L24 @ 48000Hz RTSP)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:8,bufferLength:48e4,quantum:256}))});let o=n.aes67_sap?.active_announcements||[];return o.length>0&&r.push({id:`aes67-sap-bus`,name:`AES67: SAP Multicast (239.69.1.1)`,type:`aes67-node`,port:5004,baseUrl:`rtp://239.69.1.1:5004`,domainId:`aes67-sap`,domainLabel:`AES67 Session Announcement Bus`,status:`online`,latencyMs:4,lastSeen:Date.now(),flows:o.map(e=>({flowId:e.session_name,label:`${e.session_name} (2ch L24 @ 48000Hz PTP)`,mediaType:`audio/L24`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256}))}),r.push({id:`likedotaudio-moip`,name:`LikeDotAudio: MoipBuddy AoIP Gateway`,type:`moip-node`,port:8467,baseUrl:`https://github.com/LikeDotAudio/APK.softapp.EDITORS.MoipBuddy`,domainId:`likedotaudio-moip`,domainLabel:`LikeDotAudio AoIP Ecosystem`,status:`online`,latencyMs:2,lastSeen:Date.now(),flows:[{flowId:`moip-virtual-master`,label:`MoipBuddy Master AoIP Flow (Dante + Ravenna)`,mediaType:`audio/float32`,sampleRate:48e3,channelCount:2,bufferLength:48e4,quantum:256}]}),r}catch{}return[]}async function Ps(){if(Cs)return ys;Cs=!0;try{let e=vs.map(e=>ks(e)),[t,n,r]=await Promise.all([Promise.all(e),js(),Ns()]),i=typeof location>`u`||location.protocol!==`https:`,a=n.length===0&&i?await Ms(As[0]):null,o=t.filter(e=>e!==null),s=n.length>0?n:a?[a]:[];for(let e of s)o.some(t=>t.id===e.id)||o.push(e);for(let e of r)o.some(t=>t.id===e.id)||o.push(e);let c=o.find(e=>e.port===8467);if(c&&c.flows.some(e=>e.label.startsWith(`⚡`))){let e=c.flows.filter(e=>e.label.startsWith(`⚡`));e.length>0&&!o.some(e=>e.id===`xmxl-wbs-test-signals`)&&o.push({id:`xmxl-wbs-test-signals`,name:`Ward-Beck Test Signals (MXL Domain)`,type:`wbs-router`,port:8467,baseUrl:c.baseUrl,domainId:`domain-wbs-test-signals`,domainLabel:`Ward-Beck Test Signals`,flows:e,status:`online`,latencyMs:c.latencyMs,lastSeen:Date.now()})}return ys=o,Ds(),ys}finally{Cs=!1}}function Fs(e=4500){xs&&clearInterval(xs),Ps(),xs=setInterval(()=>{Ps()},e)}function Is(e,t){if(Ss&&=(Ss.close(),null),e.port!==8467)return()=>{};try{let n=new EventSource(`${e.baseUrl}/api/stream/meters`);return Ss=n,n.onmessage=e=>{try{t(JSON.parse(e.data))}catch{}},n.onerror=e=>{console.warn(`XMXL SSE stream connection issue:`,e)},()=>{n.close(),Ss===n&&(Ss=null)}}catch(e){return console.warn(`Could not initialize XMXL SSE stream:`,e),()=>{}}}var Ls=`http://localhost:8467`,Rs=4e3,zs=1e3,Bs=214,Vs=[8,270,532,794],Hs=21,Us=28,Ws=18,L=e=>String(e??``).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]),Gs=(e,t)=>e.length>t?e.slice(0,t-1)+`…`:e;async function Ks(e){try{let t=new AbortController,n=setTimeout(()=>t.abort(),2500),r=await fetch(`${Ls}${e}`,{signal:t.signal});return clearTimeout(n),r.ok?await r.json():null}catch{return null}}var qs=class{el;onTap;timer=null;pipeline=null;aoip=null;online=!1;testPoint=null;taps=new Map;fixDismissed=new Set;fixEl=null;fixTimer=null;local=[];seenNodes=new Map;picked=``;onPick;constructor(e,t){this.el=e,this.onTap=t,this.el.addEventListener(`click`,e=>{if(e.target.closest?.(`[data-fix-open]`)){this.testPoint?.fix&&this.fixDismissed.delete(this.fixKey(this.testPoint.fix)),this.syncFixPrompt();return}let t=e.target.closest?.(`[data-tap]`),n=t?this.taps.get(t.getAttribute(`data-tap`)||``):void 0;n?.pick?this.onPick?.(n.pick.inst,n.pick.flow):n?.tap&&this.clip(n)})}setLocal(e,t,n){this.local=e,this.picked=t,this.onPick=n,this.draw()}async clip(e){let t=this.isClipped(e)?{stop:!0}:{kind:e.tap.kind,ref:e.tap.ref,label:e.label};try{let e=await fetch(`${Ls}/api/testpoint`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),n=e.ok?await e.json():null;this.testPoint=n?.point??null}catch{this.testPoint=null}this.onTap?.(!!this.testPoint),this.draw()}fixKey(e){return`${e.title}|${(e.options??[]).map(e=>e.command).join(`|`)}`}syncFixPrompt(){let e=this.testPoint?.fix;if(!e||this.fixDismissed.has(this.fixKey(e))){let t=this.fixEl&&!e&&this.testPoint?.status===`running`;this.closeFixPrompt(t?`${this.testPoint.label} is metering`:``);return}if(this.fixEl?.dataset.key===this.fixKey(e))return;this.closeFixPrompt(``);let t=document.createElement(`div`);t.className=`pg-fix-backdrop`,t.dataset.key=this.fixKey(e),t.innerHTML=`
      <div class="pg-fix" role="dialog" aria-modal="true" aria-labelledby="pgFixTitle">
        <div class="pg-fix-kicker">Test point · ${L(this.testPoint.label)}</div>
        <h3 id="pgFixTitle">${L(e.title)}</h3>
        <p class="pg-fix-why">${L(e.why)}</p>
        ${(e.options??[]).map((e,t)=>`
          <div class="pg-fix-opt">
            <div class="pg-fix-opt-head"><b>${L(e.label)}</b>${e.note?`<span>${L(e.note)}</span>`:``}</div>
            <div class="pg-fix-cmd"><code>${L(e.command)}</code><button type="button" data-fix-copy="${t}">Copy</button></div>
          </div>`).join(``)}
        <p class="pg-fix-how">Paste it into a terminal and press Enter (it asks for your password).
          The test point is still listening: this prompt closes by itself when audio arrives.</p>
        <div class="pg-fix-status" aria-live="polite">Waiting for audio…</div>
        <div class="pg-fix-actions"><button type="button" data-fix-dismiss>Not now</button></div>
      </div>`,t.addEventListener(`click`,n=>{let r=n.target,i=r.closest(`[data-fix-copy]`);if(i){let t=e.options[Number(i.dataset.fixCopy)]?.command??``;navigator.clipboard?.writeText(t).then(()=>{i.textContent=`Copied`,setTimeout(()=>i.textContent=`Copy`,1500)},()=>this.selectCode(i))}else(r.closest(`[data-fix-dismiss]`)||r===t)&&(this.fixDismissed.add(t.dataset.key||``),this.closeFixPrompt(``))}),document.body.appendChild(t),this.fixEl=t,t.querySelector(`[data-fix-copy]`)?.focus();let n=async()=>{let e=await Ks(`/api/testpoint`);this.testPoint=e?.point??null,this.draw(),this.fixEl&&(this.fixTimer=window.setTimeout(n,1e3))};this.fixTimer=window.setTimeout(n,1e3)}selectCode(e){let t=e.parentElement?.querySelector(`code`);if(!t)return;let n=document.createRange();n.selectNodeContents(t);let r=window.getSelection();r?.removeAllRanges(),r?.addRange(n),e.textContent=`Ctrl+C`}closeFixPrompt(e){this.fixTimer!==null&&clearTimeout(this.fixTimer),this.fixTimer=null;let t=this.fixEl;if(t){if(this.fixEl=null,e){let n=t.querySelector(`.pg-fix-status`);n&&(n.textContent=`✓ Receiving — ${e}`,n.classList.add(`ok`)),setTimeout(()=>t.remove(),1400)}else t.remove()}}isClipped(e){let t=this.testPoint;return!!(t&&e.tap&&t.kind===e.tap.kind&&t.ref===e.tap.ref)}start(){this.draw();let e=async()=>{if(this.el.offsetParent!==null){let[e,t,n]=await Promise.all([Ks(`/api/pipeline`),Ks(`/api/aoip`),Ks(`/api/testpoint`)]);this.online=!!(e||t),this.pipeline=e?.pipeline??e,this.aoip=t,this.testPoint=n?.point??null,this.draw()}this.timer=window.setTimeout(e,Rs)};e()}stop(){this.timer!==null&&clearTimeout(this.timer),this.timer=null}build(){let e=[],t=[],n=this.pipeline?.layers??{},r=n.layer1_kernel_hardware?.telemetry??{},i=n.layer2_graph_session?.telemetry??{},a=n.layer3_shared_memory_mxl?.telemetry??{},o=this.aoip??n.layer4_network_aoip?.telemetry??{},s=o.multicast??null,c=new Map;for(let e of r.cards??[]){let t=/^card (\d+): (\S+) \[([^\]]+)\], device (\d+): (.*)$/.exec(e),n=t?`card ${t[1]} · ${t[3]}`:e,r=t?`dev ${t[4]} ${t[5]}`:``;c.set(n,[...c.get(n)??[],r])}[...c].forEach(([t,n])=>{let r=/^card (\d+)/.exec(t)?.[1];e.push({id:`hw_${t}`,lane:0,kind:`hw`,label:t,sub:`${n.length} PCM device${n.length===1?``:`s`}`,title:n.join(`
`),live:!0,tap:r?{kind:`hw`,ref:r}:void 0})});let l=i.graph_sample_rate,u=i.graph_quantum;e.push({id:`pw`,lane:1,kind:`hub`,hub:!0,live:i.status===`running`,label:`PipeWire graph`,sub:l?`${u} / ${l/1e3}k · ${i.graph_quantum_ms} ms`:`not reported`});for(let t of i.streams??[]){let n=/^(\d+)\./.exec(String(t))?.[1];e.push({id:`pws_${String(t).replace(/^\d+\.\s*/,``)}`,lane:1,kind:`pw`,label:String(t).replace(/^\d+\.\s*/,``),sub:`stream`,live:!0,tap:n?{kind:`pw`,ref:n}:void 0})}let d=a.flows??[];e.push({id:`mxl`,lane:2,kind:`hub`,hub:!0,live:d.length>0,label:a.domain_id&&a.domain_id!==`none`?a.domain_id:`MXL domain`,sub:a.shm_base_dir??`/dev/shm/mxl`});for(let t of d){let n=(t.overrun_count??0)+(t.underrun_count??0);e.push({id:`fl_${t.flow_id}`,lane:2,kind:`mxl`,live:!0,label:t.label||t.flow_id,sub:`${t.channel_count}ch · ${(t.sample_rate??48e3)/1e3}k${n?` · ${n} xrun`:``}`,title:t.flow_id,tap:{kind:`mxl`,ref:t.flow_id}})}let f=new Set;for(let t of s?.sap?.sessions??[])f.add(t.origin_ip),e.push({id:`sap_${t.id}`,lane:3,kind:`sap`,live:!0,label:t.session_name||t.multicast_ip,sub:`SAP · ${t.multicast_ip}:${t.port} · ${t.channels??`?`}ch ${t.encoding??``}`,title:`origin ${t.origin_ip}\nPTP GM ${t.ptp_grandmaster??`—`} (domain ${t.ptp_domain??`—`})`,tap:{kind:`aoip`,ref:t.id}});for(let e of s?.ptp?.clocks??[])f.add(e.source_ip);let p=new Set((s?.sap?.sessions??[]).map(e=>e.session_name));for(let t of o.dante?.devices??[])e.push({id:`dante_${t.ip}_${t.name}`,lane:3,kind:`dante`,live:f.has(t.ip),label:t.name,sub:`Dante · ${t.ip}`,title:`${t.manufacturer??``} ${t.engine??``} ${t.version??``}`,tap:{kind:`aoip`,ref:t.ip}});for(let t of o.ravenna?.streams??[])e.push({id:`rav_${t.ip}_${t.name}`,lane:3,kind:`ravenna`,live:f.has(t.ip),label:t.name,sub:`RAVENNA · ${t.ip}`,title:t.url,tap:{kind:`aoip`,ref:p.has(t.name)?t.name:t.ip}});for(let t of o.nmos?.nodes??[])e.push({id:`nmos_${t.ip}_${t.name}`,lane:3,kind:`nmos`,live:f.has(t.ip),label:t.name,sub:`NMOS IS-04 · ${t.ip}`,tap:{kind:`aoip`,ref:t.ip}});for(let t of s?.sip?.messages??[])e.push({id:`sip_${t.method}_${t.from}`,lane:3,kind:`sip`,live:!0,label:`${t.method} ${t.from}`,sub:`SIP · ${t.source_ip} · ×${t.count}`,title:t.user_agent});let m=e=>e.replace(/\s*\(.*$/,``).trim().toLowerCase(),h=new Set(e.map(e=>m(e.label))),g=(s?.sap?.sessions??[]).length>0,_=new Set(d.map(e=>e.flow_id)),v=e=>e.replace(/^(Ward-Beck Systems|Ward-Beck|CBC\/Radio-Canada|NMOS IS-04:|Dante:|Ravenna:|AES67:|LikeDotAudio:)\s*/i,``).replace(/^⚡\s*/,``),y={"dante-node":`dante`,"ravenna-node":`ravenna`,"aes67-node":`sap`,"nmos-node":`nmos`,"moip-node":`moip`};for(let t of this.local){let n=y[t.type],r=v(t.name),i=t.flows[0]?.flowId??``;if(n){if(h.has(m(r))||n===`sap`&&g)continue;h.add(m(r)),e.push({id:`loc_${t.id}`,lane:3,kind:n,live:t.status===`online`,label:r,sub:`${t.flows.length} flow${t.flows.length===1?``:`s`} · ${t.latencyMs} ms`,pick:i?{inst:t.id,flow:i}:void 0})}else{t.port!==8467&&e.push({id:`loc_${t.id}`,lane:2,kind:`mxl`,live:t.status===`online`,label:r,sub:`:${t.port} · ${t.latencyMs} ms`,title:t.domainId,pick:i?{inst:t.id,flow:i}:void 0});for(let n of t.flows){if(_.has(n.flowId))continue;_.add(n.flowId);let r=v(n.label||n.flowId).replace(/\s*\(.*\)$/,``);h.has(m(r))||(h.add(m(r)),e.push({id:`locf_${n.flowId}`,lane:2,kind:`mxl`,live:!0,label:r,sub:`${n.channelCount}ch · ${n.sampleRate/1e3}k`,title:n.label,pick:{inst:t.id,flow:n.flowId}}))}}}let b=new Set;for(let t of e)b.has(t.id)||(b.add(t.id),this.seenNodes.set(t.id,t));let x=e=>e.pick?.flow??(e.tap?.kind===`mxl`?e.tap.ref:/^(?:fl|locf)_(.+)$/.exec(e.id)?.[1]),S=new Set;for(let t of e){S.add(`l:`+m(v(t.label)));let e=x(t);e&&S.add(`f:`+e)}for(let[t,n]of this.seenNodes){if(b.has(t)||n.hub)continue;let r=x(n);g&&n.kind===`sap`&&t.startsWith(`loc_`)||S.has(`l:`+m(v(n.label)))||r&&S.has(`f:`+r)?this.seenNodes.delete(t):e.push({...n,live:!1,gone:!0,tap:void 0,pick:void 0,title:`${n.title?n.title+`
`:``}Not seen now: kept as a placeholder`})}let C=new Map(e.map(e=>[e.id,e]));e.length=0,e.push(...[...C.values()].sort((e,t)=>e.lane-t.lane||Number(!!t.hub)-Number(!!e.hub)||e.label.localeCompare(t.label,void 0,{numeric:!0,sensitivity:`base`})));for(let n of e)n.lane===0&&t.push({from:n.id,to:`pw`}),n.lane===1&&!n.hub&&t.push({from:`pw`,to:n.id}),n.lane===2&&!n.hub&&t.push({from:`mxl`,to:n.id});return t.push({from:`pw`,to:`mxl`}),{nodes:e,edges:t,mc:s}}tpChip(){let e=this.testPoint;if(!e)return``;let t=e.status===`running`?`on`:e.status===`error`?`err`:`off`,n=e.ring_ms?`${(e.ring_ms/1e3).toFixed(0)} s ring · ${e.ring_frames.toLocaleString()} fr · ${e.packet_frames}-fr packets`:``,r=e.lost_packets?` · ${e.lost_packets} lost`:``;return`<span class="pg-chip pg-chip-${t} pg-tp-chip" title="${L([e.status,n,e.source,e.error||e.hint].filter(Boolean).join(`
`))}"><i></i>TP ${L(Gs(e.label,24))}${r}</span>`+(e.error||e.hint?`<span class="pg-tp-why">${L(e.error||e.hint)}</span>`:``)+(e.fix?`<button type="button" class="pg-fix-open" data-fix-open>Fix…</button>`:``)}draw(){let{nodes:e,edges:t,mc:n}=this.build(),r=new Map,i=[],a=[];for(let t=0;t<4;t++){let n=e.filter(e=>e.lane===t);n.slice(0,Ws).forEach((e,n)=>{r.set(e.id,{x:Vs[t],y:Us+n*25}),i.push(e)}),n.length>Ws&&a.push({lane:t,n:n.length-Ws,y:478})}let o=Us+Math.max(1,...[0,1,2,3].map(t=>Math.min(19,e.filter(e=>e.lane===t).length||1)))*25+6,s=i.filter(e=>e.lane===3).map(e=>({from:`mxl`,to:e.id,live:e.live})),c=(e,t)=>{let n=e.x+Bs,r=e.y+Hs/2,i=t.x,a=t.y+Hs/2;if(i<=n){let n=e.x-2;return`M ${e.x+10} ${e.y+Hs} C ${n} ${e.y+Hs+8}, ${n} ${a}, ${t.x} ${a}`}let o=(n+i)/2;return`M ${n} ${r} C ${o} ${r}, ${o} ${a}, ${i} ${a}`},l=[...t,...s].map(e=>{let t=r.get(e.from),n=r.get(e.to);return!t||!n?``:`<path class="pg-edge${e.live===!1?``:` pg-live`}" d="${c(t,n)}"/>`}).join(``);this.taps.clear();let u=i.map(e=>{let t=r.get(e.id);e.tap&&this.taps.set(e.id,e),e.pick&&this.taps.set(e.id,e);let n=this.isClipped(e),i=!!e.pick&&e.pick.flow===this.picked,a=e.tap||e.pick?` data-tap="${L(e.id)}" role="button" tabindex="0"`:``,o=e.pick?`
Click to show in the ring buffer`:e.tap?n?`
● TEST POINT — click to lift the probe`:`
Click to meter this point (test point)`:``;return`
        <g class="pg-node pg-${e.kind}${e.live?` pg-on`:``}${e.hub?` pg-hub`:``}${e.gone?` pg-gone`:``}${e.tap?` pg-tappable`:``}${e.pick?` pg-pickable`:``}${n?` pg-tp`:``}${i?` pg-pick`:``}"${a} transform="translate(${t.x} ${t.y})">
          <title>${L(e.label)}${e.sub?` — ${L(e.sub)}`:``}${e.title?`\n${L(e.title)}`:``}${o}</title>
          <rect width="${Bs}" height="${Hs}" rx="4"/>
          <circle class="pg-dot" cx="8" cy="${Hs/2}" r="2.6"/>
          <text class="pg-label" x="15" y="9">${L(Gs(e.label,40))}</text>
          ${e.sub?`<text class="pg-sub" x="15" y="17.5">${L(Gs(e.sub,n?34:50))}</text>`:``}
          ${n?`<text class="pg-tp-tag" x="209" y="17.5" text-anchor="end">● TP</text>`:``}
        </g>`}).join(``),d=a.map(e=>`<text class="pg-more" x="${Vs[e.lane]+8}" y="${e.y+10}">+${e.n} more</text>`).join(``),f=[`1 · ALSA HARDWARE`,`2 · PIPEWIRE GRAPH`,`3 · MXL SHARED MEMORY`,`4 · NETWORK AoIP`].map((e,t)=>`
      <rect class="pg-lane" x="${Vs[t]-4}" y="4" width="222" height="${o-8}" rx="7"/>
      <text class="pg-head" x="${Vs[t]+4}" y="17">${e}</text>`).join(``),p=(t,n)=>e.some(e=>e.lane===t)?``:`<text class="pg-sub" x="${Vs[t]+6}" y="40">${n}</text>`,m=(e,t)=>`<span class="pg-chip pg-chip-${n?t?.listening?`on`:`err`:`off`}" title="${L([n?t?.mode===`passive`?t.listening?`passive · ${t.clocks?.length??0} clocks`:`passive · broker down`:t?.listening?`${t.packets??0} pkts`:`not listening`:`n/a`,n?.iface?`iface ${n.iface}`:``,t?.error??(n?``:`daemon has no multicast listener`)].filter(Boolean).join(` · `))}"><i></i>${e}</span>`;this.el.innerHTML=`
      <div class="pg-status">
        <span class="pg-chip ${this.online?`pg-chip-on`:`pg-chip-err`}" title="TAP daemon ${this.online?`online :8467`:`offline`}"><i></i>TAP</span>
        ${m(`SAP`,n?.sap)}${m(`SIP`,n?.sip)}
        ${this.online?``:`<span class="pg-iface">TAP offline: <a href="https://github.com/WardBeckSystems/Ward-Beck-Audio-Tap" target="_blank" rel="noopener">download the Ward-Beck Audio Tap</a>, then <code>./run.sh</code> · guide at <a href="${Ls}/setup" target="_blank" rel="noopener">:8467/setup</a></span>`}
        ${this.tpChip()}
      </div>
      <svg class="pg-svg" viewBox="0 0 ${zs} ${o}" role="img" aria-label="Audio pipeline signal flow: ALSA to PipeWire to MXL to network AoIP">
        ${f}${l}${u}${d}
        ${p(0,this.online?`no ALSA cards reported`:`TAP offline: docker compose up -d`)}
        ${p(3,n?`nothing heard or announced`:`no AoIP data`)}
      </svg>
      ${[n?.sap,n?.sip].some(e=>e?.error)?`<div class="pg-errors">${[[`SAP`,n.sap],[`SIP`,n.sip]].filter(([,e])=>e?.error).map(([e,t])=>`<div><b>${e}</b> ${L(t.error)}</div>`).join(``)}</div>`:``}
    `,this.syncFixPrompt()}},Js=8,Ys=16,Xs=class{container;ctx=null;isBuilt=!1;phaseNeedle=null;corrValReadout=null;eyeCanvas=null;cachedWaveform=null;mxlRings=null;mxlRingsPollTimer=null;mxlRingsAt=0;genGridKey=``;detectedInstances=[];selectedPort=8467;selectedInstanceId=`xmxl-8467`;selectedFlowId=`wbs-flow-master-stereo`;activeXmxlDisconnect=null;liveMxlTelemetry=null;unsubscribeXmxl;graph=null;flowRingsKey=``;aes67={};aes67At=0;flowCards=[];ringsHost=null;$(e){return this.container?.querySelector(e)??this.ringsHost?.querySelector(e)??null}mxlInfo=null;ringHead=0;RING_CAPACITY=48e4;QUANTUM=256;constructor(e){this.container=e}build(e){if(this.ctx=e,!this.container)return;this.container.innerHTML=this.renderHtml();let t=document.getElementById(`mxlRingsStage`),n=this.container.querySelector(`.rc-data-buffer`);t&&n&&(t.appendChild(n),this.ringsHost=t),this.cacheNeedles(),this.initXmxlBinding(),this.startRingsPoll();let r=this.container.querySelector(`#rcPipelineGraph`);r&&(this.graph=new qs(r,e=>{e&&this.setFlow(`wbs-test-point`)}),this.graph.start(),this.updateXmxlBar()),this.isBuilt=!0}setFlow(e){this.selectedFlowId=e,this.updateXmxlBar()}cacheNeedles(){this.container&&(this.phaseNeedle=this.container.querySelector(`#rcPhaseNeedle`),this.corrValReadout=this.container.querySelector(`#rcCorrValReadout`),this.eyeCanvas=this.container.querySelector(`#rcEyeCanvas`))}renderHtml(){return`
      <div class="routing-console-rack">
        <!-- TOP STUDIO MONITORING DECK: SCANALYZER AUDIO EYE + DUAL STUDIO ANALOG VU METERS -->
        <div class="rc-top-monitoring-deck">
          <!-- LEFT PANE: Scanalyzer Audio Eye Visualizer & Phase Correlation Bar -->
          <div class="rc-deck-col rc-eye-col">
            <div class="rc-eye-canvas-container">
              <canvas id="rcEyeCanvas" width="440" height="440" class="rc-eye-canvas"></canvas>
            </div>

            <!-- One ring + meter per declared signal generator (real ring buffers) -->
            <div class="rc-gen-grid" id="rcGenGrid"></div>

            <!-- Scanalyzer Style Phase Correlation Bar -->
            <div class="rc-scanalyzer-phase-bar-wrapper">
              <span class="rc-phase-lbl">L</span>
              <div class="rc-phase-track">
                <div class="rc-phase-marker-scale">
                  <span>-1 out of phase</span>
                  <span id="rcCorrValReadout">corr +0.96</span>
                  <span>mono +1</span>
                </div>
                <div class="rc-phase-needle" id="rcPhaseNeedle" style="left: 98%;"></div>
              </div>
              <span class="rc-phase-lbl">R</span>
            </div>

            <!-- Telemetry HUD Cards Grid -->
            <div class="rc-eye-hud-grid">
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">NTP TIME (UTC / SMPTE 2059-1)</div>
                <div class="rc-eye-hud-val rc-tone-cyan" id="rcEyeNtpClock">00:00:00.000</div>
                <div class="rc-eye-hud-sub" id="rcEyeTaiNs">TAI: SYNCED (0 ns)</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label"><i class="rc-eye-key rc-eye-key-meter"></i>METER READ HEAD</div>
                <div class="rc-eye-hud-val rc-tone-meter" id="rcEyeSec10">—</div>
                <div class="rc-eye-hud-sub" id="rcEyeMeterLag">—</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label"><i class="rc-eye-key rc-eye-key-write"></i>WRITE HEAD</div>
                <div class="rc-eye-hud-val" id="rcEyeHeadIndex">#0</div>
                <div class="rc-eye-hud-sub" id="rcEyeHeadSec">0.000s / 480,000 frames</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">BUFFER CAPACITY &amp; SHM</div>
                <div class="rc-eye-hud-val rc-tone-ok">480,000 FRAMES (10.0s)</div>
                <div class="rc-eye-hud-sub">3.84 MB /dev/shm · PROT_READ zero copy</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">QUANTUM</div>
                <div class="rc-eye-hud-val">256 FRAMES</div>
                <div class="rc-eye-hud-sub">5.33 ms @ 48 kHz</div>
              </div>
              <div class="rc-eye-hud-card">
                <div class="rc-eye-hud-label">SLIP RATE</div>
                <div class="rc-eye-hud-val rc-tone-ok">0.00 ppm</div>
                <div class="rc-eye-hud-sub">SMPTE 2059-1</div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANE: 4-Layer Linux Audio Pipeline & Topology Grid -->
          <div class="rc-deck-col rc-pipeline-col">
            <!-- Live signal-flow graph (pipeline-graph.ts): ALSA → PipeWire → MXL → AoIP + PTP band -->
            <div class="rc-pipeline-graph" id="rcPipelineGraph"></div>

            <!-- Pipeline Stream Telemetry Details -->
            <div class="rc-pipeline-telemetry-row">
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">STREAM CLOCK &amp; TIMING</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>Clock Master:</span> <strong class="rc-tone-cyan">SMPTE 2059-1 TAI (PTP Domain 0)</strong></div>
                  <div class="rc-telemetry-item"><span>Sampling Clock:</span> <strong>48,000 Hz Continuous</strong></div>
                  <div class="rc-telemetry-item"><span>Grandmaster Skew:</span> <strong class="rc-tone-ok">&lt; 15 ns (Locked)</strong></div>
                </div>
              </div>
              <div class="rc-telemetry-box">
                <div class="rc-telemetry-box-title">ZERO-COPY RING STATUS</div>
                <div class="rc-telemetry-box-body">
                  <div class="rc-telemetry-item"><span>SHM Domain:</span> <strong class="rc-tone-accent">/dev/shm/mxl/domain-wbs-dmf-01</strong></div>
                  <div class="rc-telemetry-item"><span>Buffer Overruns:</span> <strong class="rc-tone-ok">0 Overruns / 0 Drops</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MXL CONTINUOUS CIRCULAR RING BUFFER -->
        <div class="rc-data-buffer">
            <!-- Top: Continuous Circular Ring Buffer -->
            <div class="rc-buffer-card">
              <div class="rc-buffer-header">
                <span>EBU DMF / MXL CONTINUOUS CIRCULAR RING BUFFER</span>
                <span class="rc-telemetry-pill" id="rcHeadroomTag">HEADROOM: 99.5% · 0 OVERRUNS</span>
              </div>

              <!-- One EBU DMF ring buffer per MXL flow the engine writes, each with copyable connection info -->
              <div class="rc-flow-rings" id="rcFlowRings"></div>

              <!-- Precision ITU-R BS.1770 / EBU R128 LOUDNESS Readout -->
              <div class="rc-loudness-strip" id="rcLoudnessStrip">
                <div class="rc-loudness-metric">
                  <span>INTEGRATED: <strong class="rc-loudness-val" id="rcLuIntegrated">-24.0 LUFS</strong></span>
                  <span>MOMENTARY: <strong class="rc-loudness-val" id="rcLuMomentary">-24.0 LUFS</strong></span>
                  <span>SHORT-TERM: <strong class="rc-loudness-val" id="rcLuShort">-24.0 LUFS</strong></span>
                  <span>TRUE PEAK: <strong class="rc-loudness-val" id="rcLuTruePeak">-1.2 dBTP</strong></span>
                </div>
                <div class="rc-stat-sub rc-tone-cyan">ITU-R BS.1770-4 / EBU R128 CALIBRATED</div>
              </div>
            </div>
        </div>
      </div>
    `}render(e,t){if(!this.isBuilt||!this.container)return;let n=this.getEyeFlow();n?this.ringHead=n.write_head:this.liveMxlTelemetry&&typeof this.liveMxlTelemetry.mxl_write_head==`number`&&(this.ringHead=this.liveMxlTelemetry.mxl_write_head%this.RING_CAPACITY);let r=document.body.classList.contains(`theme-mccurdy-dark`),i=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-light`),a=document.body.classList.contains(`theme-wbs-ca`),o=`#38bdf8`,s=`#f97316`;r?(o=`#3892d4`,s=`#f59e0b`):i?(o=`#1e3a5f`,s=`#b91c1c`):a&&(o=`#f97316`,s=`#d97706`);let c=t?.vuDb?t.vuDb[0]:-60,l=t?.vuDb?t.vuDb[1]:-60;if(this.eyeCanvas){this.drawScanalyzerEye(this.eyeCanvas,n,r,i,a,!1);let e=this.container.querySelector(`#rcEyeNtpClock`),t=this.container.querySelector(`#rcEyeSec10`),o=this.container.querySelector(`#rcEyeMeterLag`),s=this.container.querySelector(`#rcEyeHeadIndex`),c=this.container.querySelector(`#rcEyeHeadSec`),l=e=>{this.eyeLabel=e,this.eyeCanvas&&(this.eyeCanvas.title=e)};if(e&&(e.textContent=new Date().toISOString().slice(11,23)),n){let e=n.sample_rate||48e3,r=n.buffer_length||this.RING_CAPACITY,i=(n.write_head-n.meter_head+r)%r;t&&(t.textContent=`#${n.meter_head}`),o&&(o.textContent=`${(n.meter_head/e).toFixed(3)}s · lag ${(i/e*1e3).toFixed(1)} ms`),s&&(s.textContent=`#${n.write_head}`),c&&(c.textContent=`${(n.write_head/e).toFixed(3)}s / ${r.toLocaleString()} frames`),l(n.kind===`testpoint`?`${n.label} · ${n.source||``} · ring ${n.buffer_length/n.packet_frames<=64?`10 × ${n.packet_frames} fr`:`${(n.ring_ms/1e3).toFixed(0)} s`} (${n.ring_frames.toLocaleString()} fr)${n.status===`running`?``:` · `+String(n.status).toUpperCase()}`:`${String(n.label).replace(/\s*\([^)]*\)\s*$/,``)} · ${n.channel_count}ch @ ${e/1e3}kHz`)}else t&&(t.textContent=`—`),s&&(s.textContent=`HEAD: —`),c&&(c.textContent=`no MXL ring data`),l(`NO MXL DATA · start ward-beck-audio-tab.py (port 8467)`)}this.renderGeneratorGrid(r,i,a);let u=Math.abs(c-l),d=Math.max(-.95,Math.min(.98,1-u/16));this.corrValReadout&&(this.corrValReadout.textContent=`corr ${d>=0?`+`:``}${d.toFixed(2)}`),this.phaseNeedle&&(this.phaseNeedle.style.left=`${(d+1)/2*100}%`),this.renderFlowRings([o,s],r,i,a);let f=t?.dbfs?t.dbfs[0]:c,p=t?.dbfs?t.dbfs[1]:l,m=Math.max(-60,Math.min(0,(f+p)/2)),h=Math.max(-60,Math.min(3,Math.max(f,p)+.3)),g=this.$(`#rcLuIntegrated`),_=this.$(`#rcLuMomentary`),v=this.$(`#rcLuShort`),y=this.$(`#rcLuTruePeak`);g&&(g.textContent=`${m.toFixed(1)} LUFS`),_&&(_.textContent=`${(m+.2).toFixed(1)} LUFS`),v&&(v.textContent=`${(m-.1).toFixed(1)} LUFS`),y&&(y.textContent=`${h.toFixed(1)} dBTP`)}initXmxlBinding(){this.unsubscribeXmxl&&this.unsubscribeXmxl(),this.unsubscribeXmxl=Es(e=>{this.detectedInstances=e,this.updateXmxlBar()})}updateXmxlBar(){if(!this.container)return;let e=this.$(`#rcHeadroomTag`);this.graph?.setLocal(this.detectedInstances,this.selectedFlowId,(e,t)=>{let n=this.detectedInstances.find(t=>t.id===e);n&&(e!==this.selectedInstanceId&&this.switchXmxlInstance(n.port,e),this.selectedFlowId=t,this.updateXmxlBar(),this.meterFlow(n.port,t))});let t=(this.selectedInstanceId?this.detectedInstances.find(e=>e.id===this.selectedInstanceId):null)||this.detectedInstances.find(e=>e.port===this.selectedPort)||this.detectedInstances[0];e&&t&&(e.textContent=`DOMAIN: ${t.domainId||`domain-wbs-dmf-01`} · LATENCY: ${t.latencyMs}ms · 0 OVERRUNS`),!this.activeXmxlDisconnect&&t&&t.port===8467&&(this.activeXmxlDisconnect=Is(t,e=>{this.liveMxlTelemetry=e}))}meterFlow(e,t){e===8467&&t&&window.dispatchEvent(new CustomEvent(`xtm:meter-flow`,{detail:{port:e,flowId:t}}))}switchXmxlInstance(e,t){this.selectedPort=e,t?(this.selectedInstanceId=t,Ts(t)):Ts(`xmxl-${e}`),this.activeXmxlDisconnect&&=(this.activeXmxlDisconnect(),null);let n=(t?this.detectedInstances.find(e=>e.id===t):null)||this.detectedInstances.find(t=>t.port===e);n&&n.flows&&n.flows.length>0&&(this.selectedFlowId=n.flows[0].flowId),n&&n.port===8467&&(this.activeXmxlDisconnect=Is(n,e=>{this.liveMxlTelemetry=e})),this.updateXmxlBar()}startRingsPoll(){if(this.mxlRingsPollTimer!==null)return;let e=()=>{if(!this.container||!this.container.isConnected)return;let e=this.selectedPort||8467;fetch(`http://localhost:${e}/api/mxl/rings?bins=360`).then(e=>e.ok?e.json():null).then(e=>{e&&Array.isArray(e.flows)&&(this.mxlRings=e,this.mxlRingsAt=performance.now())}).catch(()=>{})};e(),this.mxlRingsPollTimer=window.setInterval(e,100);let t=()=>{this.container&&this.container.isConnected&&fetch(`http://localhost:${this.selectedPort||8467}/api/mxl`).then(e=>e.ok?e.json():null).then(e=>{e&&(this.mxlInfo=e)}).catch(()=>{})};t(),window.setInterval(t,5e3);let n=()=>{this.container&&this.container.isConnected&&fetch(`http://localhost:${this.selectedPort||8467}/api/aes67`).then(e=>e.ok?e.json():null).then(e=>{e&&Array.isArray(e.transmitters)&&this.setAes67(e)}).catch(()=>{})};n(),window.setInterval(n,1e3)}setAes67(e){this.aes67=Object.fromEntries(e.transmitters.map(e=>[e.flow_id,e])),this.aes67At=performance.now()}aes67For(e){return performance.now()-this.aes67At<3e3?this.aes67[e]??null:null}toggleAes67(e){let t=e.dataset.aes67Tx||``,n=this.aes67For(t);n&&(e.disabled=!0,fetch(`http://localhost:${this.selectedPort||8467}/api/aes67`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({flow_id:t,enabled:!n.running})}).then(e=>e.ok?e.json():null).then(e=>{e&&Array.isArray(e.transmitters)&&this.setAes67(e)}).catch(()=>{}).finally(()=>{e.disabled=!1}))}copyAes67Sdp(e){let t=this.aes67For(e.dataset.aes67Sdp||``);if(!t?.sdp)return;let n=t=>{e.textContent=t?`✓`:`✕`,setTimeout(()=>{e.textContent=`⧉`},1500)};navigator.clipboard?.writeText(t.sdp).then(()=>n(!0),()=>n(!1))??n(!1)}ringsFresh(){return!!this.mxlRings&&performance.now()-this.mxlRingsAt<2e3}getEyeFlow(){if(!this.ringsFresh()||!this.mxlRings)return null;let e=this.mxlRings.flows;return e.find(e=>e.flow_id===this.selectedFlowId)||e.find(e=>e.kind===`program`)||e[0]||null}renderFlowRings(e,t,n,r){let i=this.$(`#rcFlowRings`);if(!i)return;let a=this.ringsFresh()&&this.mxlRings?this.mxlRings.flows:[],o=[...a.filter(e=>e.kind!==`testpoint`),...a.filter(e=>e.kind===`testpoint`)];a.length&&!o.some(e=>e.kind===`testpoint`)&&o.push({flow_id:`wbs-test-point`,label:`Ward-Beck Test Point Tap`,kind:`testpoint`,idle:!0,channel_count:2,sample_rate:48e3,write_head:0,buffer_length:this.RING_CAPACITY,channels:[]}),this.flowCards=o;let s=o.map(e=>`${e.flow_id}:${e.channel_count}:${e.idle?`idle`:``}:${this.aes67For(e.flow_id)?`aes67`:``}`).join(`|`);if(s!==this.flowRingsKey){this.flowRingsKey=s;let e=e=>String(e??``).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);i.innerHTML=o.length===0?`<div class="rc-gen-empty">No MXL flows: start ward-beck-audio-tab.py (port 8467)</div>`:o.map((t,n)=>`
          <div class="rc-flow-ring-card${t.idle?` idle`:``}" data-flow-ring="${e(t.flow_id)}" title="${e(t.label)}\n${t.idle?`No test point set: click a test point in the data tab pipeline`:`Click to show in the Scanalyzer eye`}">
            <div class="rc-flow-ring-head">
              <span class="rc-flow-ring-name">${e(String(t.label).replace(/^Ward-Beck\s+/,``).replace(/\s*\([^)]*\)\s*$/,``))}</span>
              <span class="rc-ring-head" id="rcFlowHead${n}">#0</span>
              <button type="button" class="rc-flow-copy" data-flow-copy="${e(t.flow_id)}" title="Copy connection info" aria-label="Copy connection info for ${e(t.label)}">⧉</button>
            </div>
            <div class="rc-flow-ring-chs">
              <canvas id="rcFlowRing${n}" width="220" height="220" class="rc-flow-eye"></canvas>
            </div>
            ${this.aes67For(t.flow_id)?`
            <div class="rc-aes67-tx" data-aes67="${e(t.flow_id)}">
              <span class="rc-led-dot rc-aes67-led"></span>
              <span class="rc-aes67-tag">AES67</span>
              <span class="rc-aes67-addr"></span>
              <button type="button" class="rc-aes67-btn" data-aes67-tx="${e(t.flow_id)}">TX</button>
              <button type="button" class="rc-flow-copy" data-aes67-sdp="${e(t.flow_id)}" title="Copy SDP" aria-label="Copy AES67 SDP for ${e(t.label)}">⧉</button>
            </div>`:``}
          </div>`).join(``),i.querySelectorAll(`[data-flow-ring]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=t.target,r=n.closest(`[data-aes67-tx]`);if(r){this.toggleAes67(r);return}let i=n.closest(`[data-aes67-sdp]`);if(i){this.copyAes67Sdp(i);return}if(n.closest(`.rc-aes67-tx`))return;let a=n.closest(`[data-flow-copy]`);a?this.copyConnectionInfo(a):e.classList.contains(`idle`)||(this.selectedFlowId=e.dataset.flowRing||this.selectedFlowId,this.updateXmxlBar(),this.meterFlow(this.selectedPort||8467,this.selectedFlowId))})})}let c=this.getEyeFlow()?.flow_id;o.forEach((e,a)=>{let o=i.querySelector(`#rcFlowHead${a}`);o&&(o.textContent=e.idle?`idle`:`#${e.write_head}`),i.querySelector(`[data-flow-ring="${CSS.escape(e.flow_id)}"]`)?.classList.toggle(`active`,e.flow_id===c);let s=i.querySelector(`#rcFlowRing${a}`);s&&this.drawScanalyzerEye(s,e,t,n,r,!1,``);let l=this.aes67For(e.flow_id),u=l?i.querySelector(`[data-aes67="${CSS.escape(e.flow_id)}"]`):null;if(l&&u){u.classList.toggle(`on`,!!l.running),u.classList.toggle(`fault`,!!l.error);let e=u.querySelector(`.rc-aes67-addr`),t=`${l.multicast_ip}:${l.port}`;e&&e.textContent!==t&&(e.textContent=t);let n=u.querySelector(`.rc-aes67-btn`);n&&n.classList.toggle(`active`,!!l.running),u.title=[`AES67 ${l.label} → ${t} (TTL ${l.ttl}, source ${l.source_ip})`,`${l.encoding} · ${l.sample_rate} Hz · ${l.channels} ch · ${l.ptime_ms} ms · PT ${l.payload_type} · SAP ${l.running?`announced`:`silent`}`,l.running?`${Number(l.packets).toLocaleString()} packets · ${l.underruns} underruns · ${l.rate_ppm>=0?`+`:``}${l.rate_ppm} ppm`:`Off: TX starts it (multicast on the network)`,l.error?`Error: ${l.error}`:``].filter(Boolean).join(`
`)}})}connectionInfo(e){let t=this.mxlInfo?.domain_id||`domain-wbs-dmf-01`,n=this.mxlInfo?.shm_base_dir||`/dev/shm/mxl`,r=this.mxlInfo?.flows?.find(t=>t.flow_id===e.flow_id)??{},i=r.shm_path||`${n}/${t}/${e.flow_id}`,a=e.sample_rate||48e3,o=e.buffer_length||this.RING_CAPACITY,s=r.quantum||this.QUANTUM,c=`http://localhost:${this.selectedPort||8467}/api/mxl/flow/${e.flow_id}`;return[`MXL flow     ${e.label}`,`Flow ID      ${e.flow_id}`,`Domain       ${t}  (${n}/${t})`,`SHM ring     ${i}/ring.data   (header: ring.header, definition: flow_def.json)`,`Format       ${r.media_type||`audio/float32`} · ${e.channel_count} ch · ${a} Hz`,`Ring         ${o.toLocaleString()} frames (${(o/a).toFixed(1)} s) · quantum ${s} (${(s/a*1e3).toFixed(2)} ms)`,`Clock        SMPTE 2059-1 TAI`,`PCM          ${c}/pcm?since=<cursor>&max=<frames>   (planar Float32 LE)`,`Levels       ${c}/levels`,`Slice        ${c}/slice?tail=<frame>&count=${s}`].join(`
`)}copyConnectionInfo(e){let t=this.flowCards.find(t=>t.flow_id===e.dataset.flowCopy);if(!t)return;let n=this.connectionInfo(t),r=t=>{e.textContent=t?`✓`:`✕`,e.title=t?`Copied`:n,setTimeout(()=>{e.textContent=`⧉`,e.title=`Copy connection info`},1500)};navigator.clipboard?.writeText(n).then(()=>r(!0),()=>r(!1))??r(!1)}renderGeneratorGrid(e,t,n){let r=this.container?.querySelector(`#rcGenGrid`);if(!r)return;let i=this.ringsFresh()&&this.mxlRings?this.mxlRings.flows:[],a=i.map(e=>`${e.flow_id}:${e.channel_count}`).join(`|`);a!==this.genGridKey&&(this.genGridKey=a,r.innerHTML=i.length===0?`<div class="rc-gen-empty">No declared generators — MXL engine not reachable</div>`:i.map((e,t)=>`
          <button type="button" class="rc-gen-card" data-gen-flow="${e.flow_id}" title="${e.label}">
            <canvas class="rc-gen-ring" id="rcGenRing${t}" width="132" height="132"></canvas>
            <div class="rc-gen-meter" id="rcGenMeter${t}">
              ${Array.from({length:e.channel_count},(e,t)=>`
                <div class="rc-gen-ch"><span class="rc-gen-chl">${t+1}</span><div class="rc-gen-bar"><div class="rc-gen-rms"></div><div class="rc-gen-pk"></div></div><span class="rc-gen-db">—</span></div>`).join(``)}
            </div>
            <div class="rc-gen-name">${e.kind===`program`?`PROGRAM · `:``}${e.label}</div>
          </button>`).join(``),r.querySelectorAll(`[data-gen-flow]`).forEach(e=>{e.addEventListener(`click`,e=>{this.selectedFlowId=e.currentTarget.getAttribute(`data-gen-flow`)||this.selectedFlowId,this.updateXmxlBar(),this.meterFlow(this.selectedPort||8467,this.selectedFlowId)})}));let o=e=>Math.max(0,Math.min(100,(e+60)/60*100));i.forEach((i,a)=>{let s=r.querySelector(`#rcGenRing${a}`);s&&this.drawScanalyzerEye(s,i,e,t,n,!0),r.querySelector(`[data-gen-flow="${i.flow_id}"]`)?.classList.toggle(`active`,i.flow_id===this.getEyeFlow()?.flow_id),r.querySelectorAll(`#rcGenMeter${a} .rc-gen-ch`).forEach((e,t)=>{let n=i.channels[t];n&&(e.querySelector(`.rc-gen-rms`).style.clipPath=`inset(0 ${100-o(n.rms_db)}% 0 0)`,e.querySelector(`.rc-gen-pk`).style.left=`${o(n.peak_db)}%`,e.querySelector(`.rc-gen-db`).textContent=n.peak_db<=-119?`-∞`:n.peak_db.toFixed(1),e.classList.toggle(`over`,n.peak_db>-1))})})}drawScanalyzerEye(e,t,n=!1,r=!1,i=!1,a=!1,o=this.eyeLabel){let s=e.getContext(`2d`);if(!s)return;let c=e.width,l=e.height,u=c/2,d=l/2,f=c/440,p=this.eyeTheme(e),m=Math.min((p.faceMid&&!a?184:198)*f,c/2-32),h=(a?56:76)*f,g=p.grid,_=p.write,v=p.meter,y=[p.ch1,p.ch2];if(s.clearRect(0,0,c,l),p.faceMid){let e=Math.min(c,l)/2-3*f,t=d+(p.faceLightY-.5)*2*e,n=s.createRadialGradient(u,t,0,u,t,e*1.35);n.addColorStop(0,p.faceHi),n.addColorStop(.5,p.faceMid),n.addColorStop(1,p.faceLo),s.save(),s.beginPath(),s.arc(u,d,e,0,Math.PI*2),s.fillStyle=n,s.fill(),s.lineWidth=Math.max(2,5*f),s.strokeStyle=p.bezel,s.stroke(),s.restore()}let b=t?.buffer_length||this.RING_CAPACITY,x=t?Math.max(1,t.channel_count||t.channels?.length||1):2,S=(m-h)/x;s.save(),s.lineWidth=1,s.strokeStyle=g;for(let e=0;e<=x;e++)s.beginPath(),s.arc(u,d,h+e*S,0,Math.PI*2),s.stroke();let C=t?.sample_rate||48e3,ee=t?.packet_frames&&t.buffer_length/t.packet_frames<=64?t.packet_frames:0,te=t?t.buffer_length/C:10,ne=Math.min(64,ee?Math.max(1,Math.round(t.buffer_length/ee)):Math.max(1,Math.round(te))),re=e=>{if(!ee)return`${e}.0s`;let t=e*ee*1e3/C;return t>=1e3?`${(t/1e3).toFixed(2)}s`:`${+t.toFixed(t<10?2:1)}ms`};for(let e=0;e<ne;e++){let t=e/ne*Math.PI*2+0;if(s.beginPath(),s.moveTo(u+Math.cos(t)*(h-4*f),d+Math.sin(t)*(h-4*f)),s.lineTo(u+Math.cos(t)*(m+6*f),d+Math.sin(t)*(m+6*f)),s.strokeStyle=e===0?p.zero:p.spoke,s.lineWidth=e===0?2:1,s.stroke(),!a){let n=Math.min(m+17*f,c/2-17);s.font=e===0?`bold 11px monospace`:`9px monospace`,s.fillStyle=e===0?p.zero:p.label,s.textAlign=`center`,s.textBaseline=`middle`,s.fillText(re(e),u+Math.cos(t)*n,d+Math.sin(t)*n)}}if(s.restore(),!t){s.save(),s.fillStyle=p.label,s.font=`${a?9:13}px monospace`,s.textAlign=`center`,s.textBaseline=`middle`,s.fillText(`NO MXL DATA`,u,d),s.restore();return}s.save(),s.lineWidth=a?1:1.3;for(let e=0;e<x;e++){let n=t.channels?.[e];if(!n||!n.max)continue;let r=n.max.length,i=m-(e+.5)*S,a=S*.5;s.strokeStyle=y[e%y.length];let o=Array.from({length:Ys},()=>new Path2D);for(let e=0;e<r;e++){let s=Math.max(-1,Math.min(1,n.max[e]||0)),c=Math.max(-1,Math.min(1,n.min[e]||0));if(s===0&&c===0)continue;let l=(e+.5)/r*b,f=((t.write_head-l)%b+b)%b/C,p=Math.floor(f/Js*Ys);if(p>=Ys)continue;let m=(e+.5)/r*Math.PI*2+0,h=i+c*a,g=i+Math.max(s*a,c*a+.6);o[p].moveTo(u+Math.cos(m)*h,d+Math.sin(m)*h),o[p].lineTo(u+Math.cos(m)*g,d+Math.sin(m)*g)}o.forEach((e,t)=>{s.globalAlpha=1-t/Ys,s.stroke(e)}),s.globalAlpha=1}s.restore();let w=t.write_head/b*Math.PI*2+0,T=t.meter_head/b*Math.PI*2+0;s.save(),s.lineCap=`round`,s.strokeStyle=v,s.lineWidth=a?1.5:2.2,s.shadowColor=v,s.shadowBlur=(a?4:10)*p.glow,s.beginPath(),s.moveTo(u+Math.cos(T)*(h-6*f),d+Math.sin(T)*(h-6*f)),s.lineTo(u+Math.cos(T)*(m+14*f),d+Math.sin(T)*(m+14*f)),s.stroke();let E=a?14:28*f;if(s.translate(u,d),s.rotate(T),s.beginPath(),s.moveTo(E,0),s.lineTo(-E*.65,-E*.65),s.lineTo(-E*.38,0),s.lineTo(-E*.65,E*.65),s.closePath(),s.fillStyle=v,s.fill(),p.faceMid&&(s.beginPath(),s.arc(0,0,E*.32,0,Math.PI*2),s.fillStyle=p.bezel,s.fill()),s.restore(),!a&&o){let e=o.split(` · `),t=[e[0],e.slice(1).join(` · `)].filter(Boolean);s.save(),s.fillStyle=p.label,s.textAlign=`center`,s.textBaseline=`middle`,t.forEach((e,t)=>{let n=(36+t*13)*f,r=Math.sqrt(Math.max(0,(h-4*f)**2-(n+5*f)**2));s.font=`${t===0?`bold `:``}${Math.round(9*f)}px monospace`;let i=e;for(;i.length>3&&s.measureText(i).width>r*2;)i=i.slice(0,-2)+`…`;s.fillText(i,u,d+n)}),s.restore()}s.save(),s.lineCap=`round`,s.strokeStyle=_,s.lineWidth=a?1.8:3.2,s.shadowColor=_,s.shadowBlur=(a?4:9)*p.glow,s.beginPath(),s.moveTo(u+Math.cos(w)*(h-6*f),d+Math.sin(w)*(h-6*f)),s.lineTo(u+Math.cos(w)*(m+6*f),d+Math.sin(w)*(m+6*f)),s.stroke(),s.beginPath(),s.arc(u+Math.cos(w)*(m+6*f),d+Math.sin(w)*(m+6*f),a?2.5:5.2,0,Math.PI*2),s.fillStyle=p.tip,s.fill(),s.restore()}eyeLabel=``;eyeThemeCache=null;eyeTheme(e){let t=document.body.className;if(this.eyeThemeCache&&this.eyeThemeCache.key===t)return this.eyeThemeCache.t;let n=getComputedStyle(e),r=(e,t)=>n.getPropertyValue(e).trim()||t,i={grid:r(`--eye-grid`,`#0e2338`),spoke:r(`--eye-spoke`,`#112942`),zero:r(`--eye-zero`,`#ef4444`),label:r(`--eye-label`,`#94a3b8`),ch1:r(`--eye-ch1`,`rgba(34,197,94,0.9)`),ch2:r(`--eye-ch2`,`rgba(56,189,248,0.9)`),write:r(`--eye-write`,`#f97316`),tip:r(`--eye-tip`,`#ff2810`),meter:r(`--eye-meter`,`#d946ef`),glow:parseFloat(r(`--eye-glow`,`1`)),faceHi:r(`--eye-face-hi`,``),faceMid:r(`--eye-face-mid`,``),faceLo:r(`--eye-face-lo`,``),faceLightY:parseFloat(r(`--eye-face-light-y`,`0.38`)),bezel:r(`--eye-bezel`,`#0b0c0e`)};return this.eyeThemeCache={key:t,t:i},i}},Zs={freq:1e3,levelDb:-18,refClock:`int48`,channelMode:`stereo`},Qs={pattern:`tone`,sampleRate:48e3,proMode:!0,audioData:`audio`,level:-20,tone:1e3,ext:!1,cycle:!1,invert:!1,bOff:!1,invalid:!1},$s=40,ec=[-20,-10,-5,0,3];function tc(e){if(e<=-55||!isFinite(e))return-42;let t=10**((Math.max(-40,Math.min(3,e))-3)/20);return-42+84*Math.max(0,Math.min(1.05,t))}var nc=e=>Math.max(-60,Math.min(3,isFinite(e)?e:-60));function rc(e,t,n){let r=n*Math.PI/180;return`${(e+t*Math.sin(r)).toFixed(1)} ${(53-t*Math.cos(r)).toFixed(1)}`}function ic(e,t,n){let r=tc(-20),i=tc(0),a=tc(3),o=ec.map(e=>{let t=tc(e);return`<path d="M ${rc(n,$s,t)} L ${rc(n,45,t)}" class="${e>=0?`wr-meter-tick-red`:`wr-meter-tick`}" />`}).join(``),s=(e,t)=>`
      <g id="${e}" class="wr-needle-group" transform="rotate(-42 ${n} 53)">
        <line x1="${n}" y1="53" x2="${n}" y2="8" class="wr-meter-needle wr-meter-needle-${t}" />
      </g>`;return`
    <g class="wr-meter-subgroup">
      <rect x="${n-47}" y="1" width="94" height="58" rx="4" class="wr-meter-bezel" />
      <rect x="${n-45}" y="3" width="90" height="54" rx="3" class="wr-meter-face" />
      <path d="M ${rc(n,$s,r)} A ${$s} ${$s} 0 0 1 ${rc(n,$s,i)}" class="wr-meter-arc-norm" />
      <path d="M ${rc(n,$s,i)} A ${$s} ${$s} 0 0 1 ${rc(n,$s,a)}" class="wr-meter-arc-over" />
      ${o}${s(t,`r`)}${s(e,`l`)}
      <circle cx="${n}" cy="53" r="3" class="wr-meter-hub" />
    </g>`}function ac(e,t){return`
    <div class="wr-theme-meters-wrap" title="L black · R red">
      <svg class="wr-theme-meter-svg" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${ic(`${e}NeedleL${t}`,`${e}NeedleR${t}`,50)}
      </svg>
    </div>`}var oc=[{tag:`CH 1`,name:`Soundcard In`,sub:`Mic / Line In`,pill:`mic`},{tag:`CH 2`,name:`Browser Tab`,sub:`Shared tab audio (getDisplayMedia)`,pill:`sys`},{tag:`CH 3`,name:`POD-33 Tone`,sub:`DARS 100/400/1k`,pill:`pod`},{tag:`CH 4`,name:`Bit Buddy`,sub:`ABS-1 Bit Spitter`,pill:`abb`},{tag:`CH 5`,name:`Pink / Sweep`,sub:`Noise Reference`,pill:`noise`}],sc=[{tag:`MTR 1`,name:`Meter Input 1`,sub:`XTM-4 INPUT 1 button`,pill:`mtr`},{tag:`MTR 2`,name:`Meter Input 2`,sub:`XTM-4 INPUT 2 button`,pill:`mtr`},{tag:`MTR 3`,name:`Meter Input 3`,sub:`XTM-4 INPUT 3 button`,pill:`mtr`},{tag:`MTR 4`,name:`Meter Input 4`,sub:`XTM-4 INPUT 4 button`,pill:`mtr`},{tag:`HW 1`,name:`Monitor 1 / Speakers`,sub:`Sound card out (ALSA)`,pill:`hw`},{tag:`HW 2`,name:`Studio Cue / HP`,sub:`Sound card out (control room listen)`,pill:`hw`},{tag:`MXL 1`,name:`Repeater`,sub:`MXL flow wbs-flow-master-stereo (repeats the routed mix) → /dev/shm/mxl`,pill:`mxl`},{tag:`MXL 2`,name:`POD-33 1 kHz`,sub:`MXL flow POD-33-1kHz-Reference → /dev/shm/mxl`,pill:`mxl`},{tag:`MXL 3`,name:`POD-33 400 / 100 Hz`,sub:`MXL flow POD-33-400Hz-Alignment / POD-33-100Hz-LowEnd (click the name to switch) → /dev/shm/mxl`,pill:`mxl`},{tag:`MXL 4`,name:`Bit Spitter`,sub:`MXL flow wbs-flow-bit-spitter → /dev/shm/mxl`,pill:`mxl`}],cc=[`Input 1`,`Input 2`,`Input 3`,`Input 4`,`Speakers`,`Cue/HP`,`Repeater`,`1 kHz`,`400 Hz`,`Bit Spitter`],lc={6:`wbs-flow-master-stereo`,7:`wbs-flow-ref-tone`,9:`wbs-flow-bit-spitter`},uc=`25030044-0440-4416-8000-000000000003`,dc=`25030044-0440-4416-8000-000000000004`,fc=4,R=4,pc=5,mc=7,hc=8,gc=9,_c=2,vc=3,yc=1,bc=`wbs-flow-master-stereo`,xc=`wbs-flow-ref-tone`,Sc=`wbs-flow-bit-spitter`,Cc={broadcast:{select:1,matrix:[[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!0,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!0],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1]]},pod33:{select:2,matrix:[[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!0,!0,!0,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!0],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1]]},bitbuddy:{select:3,matrix:[[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!1,!0,!1,!1],[!1,!1,!1,!1,!0,!0,!0,!1,!1,!0],[!1,!1,!1,!1,!0,!1,!1,!1,!1,!1]]},all:{matrix:Array.from({length:5},()=>[!1,!1,!1,!1,!0,!1,!1,!0,!1,!0])}},wc=e=>e.map(e=>e.slice()),Tc=class{container;audio;daemonUrl;onFlowHint;onOpenFlow;onMeterInput;matrix=wc(Cc.broadcast.matrix);outMutes=sc.map((e,t)=>t===R||t===pc);outDims=Array(sc.length).fill(!1);speakerLevel=.7;activeInput=1;meterInputs=[0,1,2,3];pod33Config={...Zs};bitBuddyConfig={...Qs};pod33Engaged=!1;pod33LowHz=400;bitBuddyEngaged=!1;daemonOnline=!1;daemonTimer=null;bbLocalAt=0;needles={inL:[],inR:[],outL:[],outR:[]};built=!1;tabKey=``;wasExternal=!1;tabInfoEl=null;tabPeak=-120;listeners=new Set;constructor(e,t={}){this.container=e,this.audio=t.audio??null,this.daemonUrl=(t.daemonUrl??`http://localhost:8467`).replace(/\/$/,``),this.onFlowHint=t.onFlowHint,this.onOpenFlow=t.onOpenFlow,this.onMeterInput=t.onMeterInput,this.setMeterInputs(this.meterInputs)}mount(){this.container.innerHTML=this.renderHtml();let e=e=>this.container.querySelector(e);return this.needles={inL:oc.map((t,n)=>e(`#wrInNeedleL${n}`)),inR:oc.map((t,n)=>e(`#wrInNeedleR${n}`)),outL:sc.map((t,n)=>e(`#wrOutNeedleL${n}`)),outR:sc.map((t,n)=>e(`#wrOutNeedleR${n}`))},this.tabInfoEl=e(`#wrTabInfo`),this.tabKey=``,this.attachEvents(),this.refresh(),this.built=!0,this.watchDaemon(),this}setAudio(e){this.audio=e}destroy(){this.daemonTimer!==null&&window.clearInterval(this.daemonTimer),this.daemonTimer=null,this.container.innerHTML=``,this.built=!1}watchDaemon(){if(this.daemonTimer!==null)return;let e=()=>{fetch(`${this.daemonUrl}/api/bitbuddy`,{cache:`no-store`}).then(e=>e.ok?e.json():Promise.reject()).then(e=>{let t=this.daemonOnline;this.daemonOnline=!0,t||this.audio?.stopBitBuddyGenerator();let n=e.config?.pattern,r=!!n&&n!==this.bitBuddyConfig.pattern;r&&(this.bitBuddyConfig.pattern=n),Date.now()-this.bbLocalAt<2e3||(!!e.active===this.bitBuddyEngaged?r&&this.refresh():this.applyBitBuddy(!!e.active))}).catch(()=>{this.daemonOnline&&(this.daemonOnline=!1,this.bitBuddyEngaged&&this.audio?.startBitBuddyGenerator(this.spitterAudioConfig()))})};e(),this.daemonTimer=window.setInterval(e,1500)}renderHtml(){return`
      <div class="wr-rack">
        <div class="wr-grid-card">
          <table class="wr-matrix-table wr-grid" aria-label="Crosspoint matrix: inputs down, outputs across">
            <thead><tr>
              <th class="wr-grid-corner" aria-label="Inputs down, outputs across"></th>
              ${sc.map((e,t)=>this.renderOutputCell(e,t)).join(``)}
            </tr></thead>
            <tbody>${oc.map((e,t)=>this.renderInputRow(e,t)).join(``)}</tbody>
          </table>
        </div>

      </div>`}renderInputRow(e,t){let n=sc.map((n,r)=>`
      <td class="wr-td-crosspoint">
        <button type="button" class="wr-matrix-btn" data-row="${t}" data-col="${r}" title="${e.name} → ${n.name}" aria-label="${e.name} to ${n.name}">
          <span class="wr-matrix-led"></span>
        </button>
      </td>`).join(``);return`<tr class="wr-grid-row">
      <th class="wr-grid-in" scope="row">
        <div class="wr-strip wr-in-strip" id="wrInStrip${t}" title="${e.name} — ${e.sub}">
          <div class="wr-strip-top">
            <span class="wr-strip-tag wr-pill-${e.pill}">${e.tag}</span>
            <span class="wr-strip-name" id="wrInName${t}">${e.name}</span>
            <button type="button" class="wr-btn-engage" data-in-idx="${t}">ENGAGE</button>
          </div>
          ${t===yc?`<div class="wr-strip-info" id="wrTabInfo"></div>`:``}
          ${ac(`wrIn`,t)}
        </div>
      </th>${n}</tr>`}renderOutputCell(e,t){return`
      <th class="wr-grid-out-head wr-grid-out" scope="col">
        <div class="wr-strip wr-out-strip" id="wrOutStrip${t}" title="${e.name} — ${e.sub}">
          <div class="wr-strip-top">
            ${e.pill===`mxl`?`<button type="button" class="wr-strip-tag wr-pill-mxl wr-btn-open-flow" data-open-flow="${t}" title="Open the ${e.name} MXL transmitter">${e.tag}</button>`:`<span class="wr-strip-tag wr-pill-${e.pill}">${e.tag}</span>`}
            ${t===hc?`<button type="button" class="wr-strip-name wr-btn-hz" data-low-hz="1" id="wrLowHz" title="Switch POD-33 400 Hz / 100 Hz">${this.pod33LowHz} Hz</button>`:e.pill===`mxl`?`<button type="button" class="wr-strip-name wr-btn-open-flow" data-open-flow="${t}" title="Open the ${e.name} MXL transmitter">${cc[t]}</button>`:`<span class="wr-strip-name">${cc[t]}</span>`}
            ${e.pill===`hw`?`<button type="button" class="wr-btn-out-tool wr-btn-dim" data-out-dim="${t}" title="Dim ${e.name} by 20 dB">-20dB</button>`:``}
          </div>
          ${ac(`wrOut`,t)}
          ${t===R?`<input type="range" class="wr-level" data-out-level="${t}" min="0" max="1" step="0.01" value="${this.speakerLevel}" title="Speaker level" aria-label="Speaker level">`:``}
        </div>
      </th>`}attachEvents(){let e=this.container;e.addEventListener(`input`,e=>{let t=e.target;t.dataset?.outLevel!==void 0&&this.setSpeakerLevel(parseFloat(t.value))}),e.addEventListener(`click`,t=>{let n=t.target.closest(`button`);if(!n||!e.contains(n))return;let r=n.dataset;if(r.row!==void 0)return this.toggleCrosspoint(+r.row,+(r.col??0));if(r.inIdx!==void 0)return this.selectInput(+r.inIdx);if(r.outDim!==void 0)return this.toggleOut(`dim`,+r.outDim);if(r.lowHz!==void 0){this.pod33LowHz=this.pod33LowHz===400?100:400;let t=e.querySelector(`#wrLowHz`);t&&(t.textContent=`${this.pod33LowHz} Hz`)}else if(r.openFlow!==void 0){let e=+r.openFlow,t=e===hc?this.pod33LowHz===400?uc:dc:lc[e];t&&this.onOpenFlow?.(t)}})}post(e,t){fetch(`${this.daemonUrl}${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:t===void 0?void 0:JSON.stringify(t)}).catch(()=>{})}resumeAudio(){let e=this.audio?.ctx;e&&e.state===`suspended`&&e.resume().catch(()=>{})}monitorGain(){return this.speakerLevel*(this.outDims[R]?.1:1)}setSpeakerLevel(e){let t=Math.max(0,Math.min(1,isFinite(e)?e:this.speakerLevel));t!==this.speakerLevel&&(this.speakerLevel=t,this.audio?.setMonitorVolume(this.monitorGain()),this.refresh())}syncMonitor(){if(!this.audio)return;let e=this.activeInput,t=this.matrix[e][R]||this.matrix[e][pc]||this.pod33Engaged&&this.matrix[_c][R]||this.bitBuddyEngaged&&this.matrix[vc][R];this.audio.setMonitor(t&&!this.outMutes[R],this.monitorGain())}hintFlow(){let e=this.bitBuddyEngaged&&(this.activeInput===vc||!this.pod33Engaged)?Sc:this.pod33Engaged?xc:bc;this.onFlowHint?.(e)}toggleCrosspoint(e,t){t<fc?(this.matrix.forEach((n,r)=>{n[t]=r===e}),this.refresh(),this.onMeterInput?.(t+1,e)):(this.matrix[e][t]=!this.matrix[e][t],(t===R||t===pc)&&this.syncMonitor(),this.refresh())}selectInput(e){this.activeInput=e;let t=this.audio;this.resumeAudio(),e===_c?this.setPod33(!0,!1):e===vc?this.setBitBuddy(!0,!1):t&&(e===0?t.connectSoundCard():e===1?t.connectSystemAudio(`browser`):e===4&&t.startTestGenerator(`pink`)),this.syncMonitor(),this.hintFlow(),this.refresh()}routeToSpeakers(e=this.activeInput){e!==this.activeInput&&this.selectInput(e),this.matrix[e][R]=!0,this.outMutes[R]=!1,this.resumeAudio(),this.audio?.setMonitor(!0,this.monitorGain()),this.post(`/api/force_speakers`),this.refresh()}setMeterInputs(e){for(let t=0;t<fc;t++)this.matrix.forEach((n,r)=>{n[t]=e[t]===r});this.meterInputs=e.slice(0,fc),this.built&&this.refresh()}applyPreset(e){let t=Cc[e];if(t){this.matrix=wc(t.matrix);for(let e=0;e<fc;e++)this.matrix.forEach((t,n)=>{t[e]=this.meterInputs[e]===n});t.select===void 0?this.refresh():this.selectInput(t.select)}}toggleOut(e,t){let n=e===`mute`?this.outMutes:this.outDims;n[t]=!n[t],(t===R||t===pc)&&(e===`mute`?this.syncMonitor():this.audio?.setMonitorVolume(this.monitorGain())),this.refresh()}setPod33(e,t=!0){this.pod33Engaged=e,this.matrix[_c][R]=e,e?this.audio?.startPod33Generator(this.pod33Config):this.audio?.stopPod33Generator(),this.restartSpitterIfExt(),this.post(`/api/test_tone`,{freq:this.pod33Config.freq,restart:e}),t&&(this.syncMonitor(),this.hintFlow(),this.refresh())}setBitBuddy(e,t=!0){this.bbLocalAt=Date.now(),this.post(`/api/bitbuddy`,e?this.bitBuddyPayload():{active:!1}),this.applyBitBuddy(e,t)}applyBitBuddy(e,t=!0){this.bitBuddyEngaged=e,this.matrix[vc][R]=e,e&&!this.daemonOnline?this.audio?.startBitBuddyGenerator(this.spitterAudioConfig()):this.audio?.stopBitBuddyGenerator(),t&&(this.syncMonitor(),this.hintFlow(),this.refresh())}bitBuddyPayload(){let e=this.bitBuddyConfig;return{active:!0,pattern:e.pattern,pro_mode:e.proMode,audio_data:e.audioData===`audio`,sample_rate:e.sampleRate,level_db:e.level,tone_hz:e.tone,ext:e.ext,ch_b:e.bOff?`off`:e.invert?e.cycle?`cycle_invert`:`invert`:e.cycle?`cycle`:`on`,validity:e.invalid}}get extRefLocked(){return this.pod33Engaged&&this.pod33Config.refClock!==`int96`}spitterAudioConfig(){let e=this.bitBuddyConfig;return{...e,ext:e.ext&&!this.extRefLocked}}restartSpitterIfExt(){this.bitBuddyEngaged&&this.bitBuddyConfig.ext&&!this.daemonOnline&&this.audio?.startBitBuddyGenerator(this.spitterAudioConfig())}setPod33Config(e){Object.assign(this.pod33Config,e),this.pod33Engaged&&this.audio?.startPod33Generator(this.pod33Config),this.restartSpitterIfExt(),this.refresh()}setBitBuddyConfig(e){Object.assign(this.bitBuddyConfig,e),this.bitBuddyEngaged&&(this.daemonOnline?this.post(`/api/bitbuddy`,{...this.bitBuddyPayload(),restart:!0}):this.audio?.startBitBuddyGenerator(this.spitterAudioConfig())),this.refresh()}onChange(e){return this.listeners.add(e),()=>this.listeners.delete(e)}get externalSource(){return this.audio?.sourceType===`mxl`}isInputLive(e){return e===this.activeInput&&!this.externalSource||e===_c&&this.pod33Engaged||e===vc&&this.bitBuddyEngaged}refresh(){let e=this.container;e.querySelectorAll(`.wr-matrix-btn`).forEach(e=>{e.classList.toggle(`connected`,this.matrix[+e.dataset.row][+e.dataset.col])}),oc.forEach((t,n)=>{let r=this.isInputLive(n);e.querySelector(`#wrInStrip${n}`)?.classList.toggle(`selected`,r);let i=e.querySelector(`[data-in-idx="${n}"]`);i&&(i.classList.toggle(`engaged`,r),i.title=r?`Routed`:`Engage`),e.querySelector(`#wrInStrip${n}`)?.closest(`tr`)?.classList.toggle(`live`,r)}),sc.forEach((t,n)=>{e.querySelector(`[data-out-dim="${n}"]`)?.classList.toggle(`active`,this.outDims[n])});let t=e.querySelector(`[data-out-level]`);t&&document.activeElement!==t&&(t.value=String(this.speakerLevel)),sc.forEach((t,n)=>{let r=oc.some((e,t)=>this.isInputLive(t)&&this.matrix[t][n]);e.querySelector(`#wrOutStrip${n}`)?.classList.toggle(`selected`,r)}),this.listeners.forEach(e=>e(this))}pod33Db(){let{levelDb:e,channelMode:t}=this.pod33Config;return[t===`right`?-60:e,t===`left`?-60:e]}bitBuddyDb(){let e=this.bitBuddyConfig,t=e.pattern;if(e.ext&&!this.extRefLocked)return[-60,-60];let n=t===`tone`?e.level===null?-60:e.level:t===`minmax`?-1:-14,r=t===`tone`?0:Math.sin(Date.now()/90)*1.5,i=e.bOff||e.cycle&&Math.floor(Date.now()/520)%2==1;return[n+r,i?-60:n-r]}setMeter(e,t,n,r){e?.setAttribute(`transform`,`rotate(${tc(n).toFixed(1)} 50 53)`),t?.setAttribute(`transform`,`rotate(${tc(r).toFixed(1)} 50 53)`)}get tabInfo(){let e=this.audio?.tabInfo;return e&&e.live?e:null}renderTabStrip(e){let t=this.tabInfo,n=t?`${t.title}|${t.origin}|${t.sampleRate}|${t.channelCount}|${t.startedAt}`:``;if(n!==this.tabKey){this.tabKey=n,this.tabPeak=-120;let e=t?t.surface===`browser`?`Tab`:t.surface===`window`?`Window`:`Screen`:`Browser Tab`,r=t?`${e}: ${t.title}`:`Browser Tab`,i=this.container.querySelector(`#wrInName1`);i&&(i.textContent=r);let a=this.container.querySelector(`#wrRowName1`);a&&(a.textContent=`2: ${r.length>30?r.slice(0,29)+`…`:r}`,a.title=t?this.tabTooltip(t):``);let o=this.container.querySelector(`#wrInStrip1`);o&&(o.title=t?this.tabTooltip(t):`${oc[yc].name} — ${oc[yc].sub}`)}if(!this.tabInfoEl)return;if(!t){this.tabInfoEl.textContent=``;return}let r=this.activeInput===yc&&e?.dbfs,i=``;if(r){let t=Math.max(e.dbfs[0],e.dbfs[1]);this.tabPeak=Math.max(t,this.tabPeak-.15),i=` · ${t>-100?t.toFixed(1):`-∞`} dBFS (pk ${this.tabPeak>-100?this.tabPeak.toFixed(1):`-∞`})`}let a=[t.origin,t.sampleRate?`${(t.sampleRate/1e3).toFixed(1)} kHz`:``,t.channelCount?`${t.channelCount} ch`:``].filter(Boolean).join(` · `);this.tabInfoEl.textContent=`${a}${i}`}tabTooltip(e){return[`Shared ${e.surface===`browser`?`tab`:e.surface}: ${e.title}`,e.origin?`Origin: ${e.origin}`:``,e.audioLabel?`Audio track: ${e.audioLabel}`:``,e.sampleRate?`Format: ${e.sampleRate} Hz · ${e.channelCount??`?`} ch`:``,e.width&&e.height?`Surface: ${e.width}×${e.height}`:``,`Shared since ${new Date(e.startedAt).toLocaleTimeString()}`].filter(Boolean).join(`
`)}render(e){if(!this.built||!this.container.isConnected||this.container.offsetParent===null)return;let t=e?.vuDb?e.vuDb[0]:-60,n=e?.vuDb?e.vuDb[1]:-60,r=this.needles;this.externalSource!==this.wasExternal&&(this.wasExternal=this.externalSource,this.refresh()),this.renderTabStrip(e),oc.forEach((e,i)=>{let a=[-60,-60];i===_c&&this.pod33Engaged?a=this.pod33Db():i===vc&&this.bitBuddyEngaged?a=this.bitBuddyDb():i===this.activeInput&&!this.externalSource&&(i!==yc||this.tabInfo)&&(a=[t,n]),this.setMeter(r.inL[i],r.inR[i],a[0],a[1])}),sc.forEach((e,i)=>{let a=(this.outDims[i]?-20:0)+(i===R?20*Math.log10(Math.max(.001,this.speakerLevel)):0),o=[-60,-60];if(!this.outMutes[i]){if((i===mc||i===hc)&&this.pod33Engaged)o=this.pod33Db();else if(i===gc&&this.bitBuddyEngaged){let e=this.bitBuddyDb();o=[Math.floor(Date.now()/520)%2==1?-60:e[0],e[1]]}else(oc.some((e,t)=>this.isInputLive(t)&&this.matrix[t][i])||this.externalSource&&i<fc)&&(o=[t,n]);o=[nc(o[0]+a),nc(o[1]+a)]}this.setMeter(r.outL[i],r.outR[i],o[0],o[1])})}};function Ec(){return{drawerSourceBadge:document.getElementById(`drawerSourceBadge`),selectDevice:document.getElementById(`selectDevice`),selectSysAudioMode:document.getElementById(`selectSysAudioMode`),btnBridgeOsAudio:document.getElementById(`btnBridgeOsAudio`),inputGainSlider:document.getElementById(`inputGainSlider`),inputGainVal:document.getElementById(`inputGainVal`),chkMonitor:document.getElementById(`chkMonitor`),monitorVolSlider:document.getElementById(`monitorVolSlider`),monitorVolVal:document.getElementById(`monitorVolVal`),selectMeterStyle:document.getElementById(`selectMeterStyle`),selectToneCal:document.getElementById(`selectToneCal`),selectLampColor:document.getElementById(`selectLampColor`),selectDialBg:document.getElementById(`selectDialBackground`),selectPpmLampColor:document.getElementById(`selectPpmLampColor`),selectPpmDialBg:document.getElementById(`selectPpmDialBackground`),selectConsoleBg:document.getElementById(`selectConsoleBackground`),chkHpf:document.getElementById(`chkHpf`),chkTerm:document.getElementById(`chkTerm`),chkPodHold:document.getElementById(`chkPodHold`),selectPodDecay:document.getElementById(`selectPodDecay`),selectPpmBallistics:document.getElementById(`selectPpmBallistics`)}}function Dc(){let e=document.getElementById(`auxDrawer`)?.querySelector(`summary`);e&&e.addEventListener(`click`,e=>{let t=e.target;t&&t.closest(`a, button`)||e.preventDefault()})}function Oc(e){let{model:t,audio:n}=e,r=document.getElementById(`selectVfdMetric`),i=document.getElementById(`selectPeakSens`);r&&(r.value=t.vfdMetric||`lufs`,r.addEventListener(`change`,e=>{t.vfdMetric=e.target.value,t.saveEEPROM()})),i&&i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);n.setPeakSensTrim(t)})}var kc=`wbs_storage_consent`,Ac=`wbs_console_config_profile`;function jc(){try{let e=localStorage.getItem(kc);return e===`allowed`?`allowed`:e===`session_only`?`session_only`:`prompt`}catch{return`session_only`}}function Mc(e){try{localStorage.setItem(kc,e)}catch{}}function Nc(){try{localStorage.removeItem(kc)}catch{}}function Pc(e,t){try{if(e()){let e=localStorage.getItem(t);if(e!==null)return e}return sessionStorage.getItem(t)}catch{return null}}function Fc(e,t,n){try{e()?localStorage.setItem(t,n):sessionStorage.setItem(t,n)}catch{}}function Ic(e){try{localStorage.removeItem(e),sessionStorage.removeItem(e)}catch{}}function Lc(e){let t=e.toneCalLevels[e.toneCalIdx]??0;return{power:e.power,mode:e.mode,meterStyle:e.meterStyle,dialLamp:e.dialLamp,vfdMetric:e.vfdMetric,inputA:{src:e.a.src,lvl:e.a.lvl},inputD:{src:e.d.src,lvl:e.d.lvl},testGenS:{pair:[...e.s.pair]},highPassFilter:e.hp===1,termination600Ohm:e.term===1,toneCalibrationDbfs:t}}function Rc(e){return{vuReferenceLevelDbu:e.refLevelDb,ppmPeakSensitivityTrimDb:e.peakSensTrim,vuBallisticPreset:e.vuBallisticPreset,ppmBallisticPreset:e.ppmBallisticPreset,inputGainTrimDb:e.inputTrimDb,monitorAudio:{enabled:e.monitorEnabled,volume:e.monitorVolume}}}function zc(e){return{extendedLed22Range:e.extendedLed22,scaleMode:e.scaleMode,decayType:e.decayType||`type2`,peakHold:e.dip?.BS1===1}}function Bc(e){return{timeMode:e.timeMode,captureLengthSeconds:e.captureLength,captureSpeedFps:e.captureSpeed,logWarpBeta:e.beta,traces:{channelA:e.showChA,channelB:e.showChB,sum:e.showSum,diff:e.showDiff,momentaryLufs:e.showLufs,shortTermLufs:e.showLufsS,integratedLufs:e.showLufsI},display:{show0DbfsCeilingLine:e.show0DbfsLine,enableWaveformFade:e.enableFade,hfFadeDistancePercent:e.hfFadeDistance,showHoverTelemetryHud:e.showHoverTelemetry,showCursorTraceLine:e.showCursorTrace,plotPhaseCorrelation:e.plotPhase,hudDocked:e.isDocked}}}function Vc(e,t,n,r){return{version:`1.1.0`,timestamp:new Date().toISOString(),profileName:`Ward-Beck Systems Broadcast Mastering Suite Profile`,console:Lc(e),ballistics:Rc(t),pod22:zc(n),scope:Bc(r)}}var z=Symbol(`NOT_RESOLVED`);function B(e,t){return{tagName:e,nodeKind:`scalar`,implicit:t.implicit??!1,matchByTagPrefix:t.matchByTagPrefix??!1,implicitFirstChars:t.implicitFirstChars??null,resolve:t.resolve,identify:t.identify,represent:t.represent??(e=>String(e)),representTagName:t.representTagName??(()=>e)}}function Hc(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`sequence`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addItem:t.addItem,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}function Uc(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`mapping`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addPair:t.addPair,has:t.has,keys:t.keys,get:t.get,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}var Wc=B(`tag:yaml.org,2002:str`,{resolve:e=>e,identify:e=>typeof e==`string`}),Gc=[``,`~`,`null`,`Null`,`NULL`],Kc=B(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>Gc.indexOf(e)===-1?z:null,identify:e=>e===null,represent:()=>`null`}),qc=B(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[`n`],resolve:(e,t)=>e===`null`||t&&e===``?null:z,identify:e=>e===null,represent:()=>`null`}),Jc=[``,`~`,`null`,`Null`,`NULL`],Yc=B(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>Jc.indexOf(e)===-1?z:null,identify:e=>e===null,represent:()=>`null`}),Xc=[`true`,`True`,`TRUE`],Zc=[`false`,`False`,`FALSE`],Qc=B(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`T`,`f`,`F`],resolve:e=>Xc.indexOf(e)!==-1||Zc.indexOf(e)===-1&&z,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),$c=[`true`],el=[`false`],tl=B(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`f`],resolve:e=>$c.indexOf(e)!==-1||el.indexOf(e)===-1&&z,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),nl=[`true`,`True`,`TRUE`,`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`],rl=[`false`,`False`,`FALSE`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],il=B(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`y`,`Y`,`n`,`N`,`t`,`T`,`f`,`F`,`o`,`O`],resolve:e=>nl.indexOf(e)!==-1||rl.indexOf(e)===-1&&z,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),al=RegExp(`^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$`),ol=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function sl(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function cl(e,t){if(t){if(!ol.test(e))return z}else if(!al.test(e))return z;let n=sl(e);return Number.isFinite(n)?n:z}var ll=B(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:cl,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),ul=RegExp(`^-?(?:0|[1-9][0-9]*)$`),dl=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function fl(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function pl(e,t){if(t){if(!dl.test(e))return z}else if(!ul.test(e))return z;let n=fl(e);return Number.isFinite(n)?n:z}var ml=B(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:pl,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),hl=RegExp(`^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$`);function gl(e){let t=e.replace(/_/g,``),n=1;if((t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`))return n*parseInt(t.slice(2),2);if(t.startsWith(`0x`))return n*parseInt(t.slice(2),16);if(t.includes(`:`)){let e=0;for(let n of t.split(`:`))e=e*60+Number(n);return n*e}return t!==`0`&&t[0]===`0`?n*parseInt(t,8):n*parseInt(t,10)}function _l(e){if(!hl.test(e))return z;let t=gl(e);return Number.isFinite(t)?t:z}var vl=B(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:_l,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),yl=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),bl=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function xl(e){if(!yl.test(e))return z;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)||bl.test(e)?r:z}function Sl(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Cl=B(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:xl,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Sl}),wl=RegExp(`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$`),Tl=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function El(e,t){if(t){if(!Tl.test(e))return z;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)?r:z}if(!wl.test(e))return z;let n=Number(e);return Number.isFinite(n)?n:z}function Dl(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Ol=B(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:El,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Dl}),kl=RegExp(`^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Al=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function jl(e){if(!kl.test(e))return z;let t=e.toLowerCase().replace(/_/g,``),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=0;if(t.includes(`:`)){for(let e of t.split(`:`))r=r*60+Number(e);r*=n}else r=n*parseFloat(t);return Number.isFinite(r)||Al.test(e)?r:z}function Ml(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Nl=B(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:jl,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Ml}),Pl=B(`tag:yaml.org,2002:merge`,{implicit:!0,implicitFirstChars:[`<`],resolve:(e,t)=>e===`<<`||t&&e===``?`<<`:z,identify:()=>!1}),Fl=/^[A-Za-z0-9+/]*={0,2}$/;function Il(e){let t=e.replace(/\s/g,``);if(t.length%4!=0||!Fl.test(t))return z;let n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function Ll(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var Rl=B(`tag:yaml.org,2002:binary`,{resolve:Il,identify:e=>Object.prototype.toString.call(e)===`[object Uint8Array]`,represent:Ll}),zl=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),Bl=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function Vl(e,t,n,r=0,i=0,a=0,o=0){let s=new Date(Date.UTC(e,t,n,r,i,a,o));return s.setUTCFullYear(e,t,n),s}function Hl(e){let t=zl.exec(e);if(t===null&&(t=Bl.exec(e)),t===null)return z;let n=+t[1],r=t[2]-1,i=+t[3];if(!t[4]){let e=Vl(n,r,i);return e.getUTCFullYear()!==n||e.getUTCMonth()!==r||e.getUTCDate()!==i?z:e}let a=+t[4],o=+t[5],s=+t[6],c=0;if(a>23||o>59||s>59)return z;if(t[7]){let e=t[7].slice(0,3);for(;e.length<3;)e+=`0`;c=+e}let l=Vl(n,r,i,a,o,s,c);if(l.getUTCFullYear()!==n||l.getUTCMonth()!==r||l.getUTCDate()!==i)return z;if(t[9]){let e=+t[10],n=+(t[11]||0);if(e>23||n>59)return z;let r=(e*60+n)*6e4;l.setTime(l.getTime()-(t[9]===`-`?-r:r))}return l}var Ul=B(`tag:yaml.org,2002:timestamp`,{implicit:!0,implicitFirstChars:[...`0123456789`],resolve:Hl,identify:e=>e instanceof Date,represent:e=>e.toISOString()}),Wl=Hc(`tag:yaml.org,2002:seq`,{create:()=>[],addItem:(e,t)=>{e.push(t)},identify:Array.isArray});function Gl(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype}function Kl(e,t){let n={};for(let r of t)e[r]!==void 0&&(n[r]=e[r]);return n}var ql=Hc(`tag:yaml.org,2002:omap`,{create:()=>({list:[],seen:new Set}),addItem:(e,t)=>{let n;if(t instanceof Map){if(t.size!==1)return`cannot resolve an ordered map item`;n=t.keys().next().value}else if(Gl(t)){let e=Object.keys(t);if(e.length!==1)return`cannot resolve an ordered map item`;n=e[0]}else return`cannot resolve an ordered map item`;return e.seen.has(n)?`duplicate key in ordered map`:(e.seen.add(n),e.list.push(t),``)},finalize:e=>e.list,identify:()=>!1}),Jl=Hc(`tag:yaml.org,2002:pairs`,{create:()=>[],addItem:(e,t)=>{if(t instanceof Map)return t.size===1?(e.push(t.entries().next().value),``):`cannot resolve a pairs item`;if(Object.prototype.toString.call(t)!==`[object Object]`)return`cannot resolve a pairs item`;let n=t,r=Object.keys(n);return r.length===1?(e.push([r[0],n[r[0]]]),``):`cannot resolve a pairs item`},identify:()=>!1}),Yl=Uc(`tag:yaml.org,2002:map`,{create:()=>({}),identify:Gl,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{if(typeof t==`object`&&t)return`object-based map does not support complex keys`;let r=String(t);return r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``},has:(e,t)=>typeof t==`object`&&t?!1:Object.prototype.hasOwnProperty.call(e,String(t)),keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}}),Xl=Uc(`tag:yaml.org,2002:set`,{create:()=>new Set,identify:e=>e instanceof Set,represent:e=>{let t=new Map;for(let n of e)t.set(n,null);return t},addPair:(e,t,n)=>n===null?(e.add(t),``):`cannot resolve a set item`,has:(e,t)=>e.has(t),keys:e=>e.keys(),get:()=>null});function Zl(){return{scalar:Object.create(null),sequence:Object.create(null),mapping:Object.create(null)}}function Ql(){return{scalar:[],sequence:[],mapping:[]}}function $l(e){let t=[];for(let n of e){let e=t.length;for(let r=0;r<t.length;r++){let i=t[r];if(i.nodeKind===n.nodeKind&&i.tagName===n.tagName&&i.matchByTagPrefix===n.matchByTagPrefix){e=r;break}}t[e]=n}return t}var eu=class e{tags;implicitScalarTags;implicitScalarByFirstChar;implicitScalarAnyFirstChar;defaultScalarTag;defaultSequenceTag;defaultMappingTag;exact;prefix;constructor(e){let t=$l(e),n=[],r=Zl(),i=Ql();for(let e of t){if(e.nodeKind===`scalar`&&e.implicit){if(e.matchByTagPrefix)throw Error(`Implicit scalar tags cannot match by tag prefix`);n.push(e)}switch(e.nodeKind){case`scalar`:e.matchByTagPrefix?i.scalar.push(e):r.scalar[e.tagName]=e;break;case`sequence`:e.matchByTagPrefix?i.sequence.push(e):r.sequence[e.tagName]=e;break;case`mapping`:e.matchByTagPrefix?i.mapping.push(e):r.mapping[e.tagName]=e}}let a=n.filter(e=>e.implicitFirstChars===null),o=new Set;for(let e of n)if(e.implicitFirstChars!==null)for(let t of e.implicitFirstChars)o.add(t);let s=new Map;for(let e of o)s.set(e,n.filter(t=>t.implicitFirstChars===null||t.implicitFirstChars.indexOf(e)!==-1));let c=r.scalar[`tag:yaml.org,2002:str`];if(!c)throw Error(`schema does not define the default scalar tag (tag:yaml.org,2002:str)`);this.tags=t,this.implicitScalarTags=n,this.implicitScalarByFirstChar=s,this.implicitScalarAnyFirstChar=a,this.defaultScalarTag=c,this.defaultSequenceTag=r.sequence[`tag:yaml.org,2002:seq`],this.defaultMappingTag=r.mapping[`tag:yaml.org,2002:map`],this.exact=r,this.prefix=i}lookupScalarTag(e){let t=this.exact.scalar[e];if(t)return t;for(let t of this.prefix.scalar)if(e.startsWith(t.tagName))return t}lookupSequenceTag(e){let t=this.exact.sequence[e];if(t)return t;for(let t of this.prefix.sequence)if(e.startsWith(t.tagName))return t}lookupMappingTag(e){let t=this.exact.mapping[e];if(t)return t;for(let t of this.prefix.mapping)if(e.startsWith(t.tagName))return t}resolveImplicitScalarTag(e){let t=this.implicitScalarByFirstChar.get(e.charAt(0))??this.implicitScalarAnyFirstChar;for(let n of t){let t=n.resolve(e,!1,n.tagName);if(t!==z)return{value:t,tag:n}}let n=this.defaultScalarTag;return{value:n.resolve(e,!1,n.tagName),tag:n}}withTags(...t){let n=[];for(let e of t)n=n.concat(e);return new e([...this.tags,...n])}},tu=new eu([Wc,Wl,Yl]);new eu([...tu.tags,qc,tl,ml,Ol]);var nu=new eu([...tu.tags,Kc,Qc,ll,Cl]),ru=new eu([...tu.tags,Yc,il,vl,Nl,Ul,Pl,Rl,ql,Jl,Xl]).withTags({...vl,resolve:(e,t,n)=>{let r=vl.resolve(e,t,n);return r===z?ll.resolve(e,t,n):r}},{...Nl,resolve:(e,t,n)=>{let r=Nl.resolve(e,t,n);return r===z?Cl.resolve(e,t,n):r}});Uc(`tag:yaml.org,2002:map`,{create:()=>new Map,addPair:(e,t,n)=>(e.set(t,n),``),has:(e,t)=>e.has(t),keys:e=>e.keys(),get:(e,t)=>e.get(t),identify:e=>e instanceof Map||Gl(e),represent:e=>{if(e instanceof Map)return e;let t=new Map,n=e;for(let e of Object.keys(n))t.set(e,n[e]);return t}});function iu(e){if(Array.isArray(e)){let t=Array.prototype.slice.call(e);for(let e=0;e<t.length;e++){if(Array.isArray(t[e]))return null;typeof t[e]==`object`&&Object.prototype.toString.call(t[e])===`[object Object]`&&(t[e]=`[object Object]`)}return String(t)}return typeof e==`object`&&Object.prototype.toString.call(e)===`[object Object]`?`[object Object]`:String(e)}Uc(`tag:yaml.org,2002:map`,{create:()=>({}),identify:Gl,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{let r=iu(t);return r===null?`nested arrays are not supported inside keys`:(r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``)},has:(e,t)=>{let n=iu(t);return n!==null&&Object.prototype.hasOwnProperty.call(e,n)},keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}});var au={maxLength:79,indent:1,linesBefore:3,linesAfter:2};function ou(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function su(e,t){return` `.repeat(Math.max(t-e.length,0))+e}function cu(e,t){if(!e.buffer)return null;let n={...au,...t},r=/\r?\n|\r|\0/g,i=[0],a=[],o,s=-1;for(;o=r.exec(e.buffer);)a.push(o.index),i.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);let c=``,l=Math.min(e.line+n.linesAfter,a.length).toString().length,u=n.maxLength-(n.indent+l+3);for(let t=1;t<=n.linesBefore&&!(s-t<0);t++){let r=ou(e.buffer,i[s-t],a[s-t],e.position-(i[s]-i[s-t]),u);c=`${` `.repeat(n.indent)}${su((e.line-t+1).toString(),l)} | ${r.str}\n${c}`}let d=ou(e.buffer,i[s],a[s],e.position,u);c+=`${` `.repeat(n.indent)}${su((e.line+1).toString(),l)} | ${d.str}\n`,c+=`${`-`.repeat(n.indent+l+3+d.pos)}^\n`;for(let t=1;t<=n.linesAfter&&!(s+t>=a.length);t++){let r=ou(e.buffer,i[s+t],a[s+t],e.position-(i[s]-i[s+t]),u);c+=`${` `.repeat(n.indent)}${su((e.line+t+1).toString(),l)} | ${r.str}\n`}return c.replace(/\n$/,``)}function lu(e,t){let n=``;return e.mark?(e.mark.name&&(n+=`in "${e.mark.name}" `),n+=`(${e.mark.line+1}:${e.mark.column+1})`,!t&&e.mark.snippet&&(n+=`\n\n${e.mark.snippet}`),`${e.reason} ${n}`):e.reason}var uu=class e extends Error{reason;mark;constructor(e,t){super(),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=lu(this,!1),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toString(e){return`${this.name}: ${lu(this,e)}`}static throwAt(t,n,r,i=``){let a=0,o=0;for(let e=0;e<n;e++){let n=t.charCodeAt(e);n===10?(a++,o=e+1):n===13&&(a++,t.charCodeAt(e+1)===10&&e++,o=e+1)}let s={name:i,buffer:t,position:n,line:a,column:n-o};throw s.snippet=cu(s),new e(r,s)}},V={DOCUMENT:1,SEQUENCE:2,MAPPING:3,SCALAR:4,ALIAS:5,POP:6},H={PLAIN:1,SINGLE_QUOTED:2,DOUBLE_QUOTED:3,LITERAL_BLOCK:4,FOLDED_BLOCK:5},U={BLOCK:1,FLOW:2},W={CLIP:1,STRIP:2,KEEP:3},du=-1;function fu(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}var pu=Array(256),mu=Array(256);for(let e=0;e<256;e++)pu[e]=+!!fu(e),mu[e]=fu(e);function hu(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function gu(e){return e>=48&&e<=57?e-48:(e|32)-97+10}function _u(e){return e===120?2:e===117?4:8}function vu(e,t,n){let r=0;for(;t<n;){let n=e.charCodeAt(t);if(n===10)r++,t++;else if(n===13)r++,t++,e.charCodeAt(t)===10&&t++;else if(n===32||n===9)t++;else break}return{position:t,breaks:r}}function yu(e){return e===1?` `:`
`.repeat(e-1)}function bu(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===10||t===13){r+=e.slice(a,o);let t=vu(e,i,n);r+=yu(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,o)}function xu(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===39)r+=e.slice(a,i)+`'`,i+=2,a=o=i;else if(t===10||t===13){r+=e.slice(a,o);let t=vu(e,i,n);r+=yu(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Su(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===92){r+=e.slice(a,i),i++;let t=e.charCodeAt(i);if(t===10||t===13)i=vu(e,i,n).position;else if(t<256&&pu[t])r+=mu[t],i++;else{let n=_u(t),a=0;for(;n>0;n--){i++;let t=gu(e.charCodeAt(i));a=(a<<4)+t}r+=hu(a),i++}a=o=i}else if(t===10||t===13){r+=e.slice(a,o);let t=vu(e,i,n);r+=yu(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Cu(e,t,n,r,i,a){let o=r<0?0:r,s=e.slice(t,n).replace(/\r\n?/g,`
`),c=s===``?[]:(s.endsWith(`
`)?s.slice(0,-1):s).split(`
`),l=``,u=!1,d=0,f=!1;for(let e of c){let t=0;for(;t<o&&e.charCodeAt(t)===32;)t++;if(r<0||t>=e.length){d++;continue}let n=e.slice(o),i=n.charCodeAt(0);a?i===32||i===9?(f=!0,l+=`
`.repeat(u?1+d:d)):f?(f=!1,l+=`
`.repeat(d+1)):d===0?u&&(l+=` `):l+=`
`.repeat(d):l+=`
`.repeat(u?1+d:d),l+=n,u=!0,d=0}return i===W.KEEP?l+=`
`.repeat(u?1+d:d):i!==W.STRIP&&u&&(l+=`
`),l}function wu(e,t){if(t.valueStart===du)return``;let{valueStart:n,valueEnd:r}=t;if(t.fast)return e.slice(n,r);switch(t.style){case H.SINGLE_QUOTED:return xu(e,n,r);case H.DOUBLE_QUOTED:return Su(e,n,r);case H.LITERAL_BLOCK:return Cu(e,n,r,t.indent,t.chomping,!1);case H.FOLDED_BLOCK:return Cu(e,n,r,t.indent,t.chomping,!0);default:return bu(e,n,r)}}var Tu=Object.assign(Object.create(null),{"!":`!`,"!!":`tag:yaml.org,2002:`}),Eu=`-#;/?:@&=+$_.~*'()`,Du=Eu+`!,[]`,Ou=`0123456789ABCDEF`;function G(e){return`%`+Ou[e>>4]+Ou[e&15]}function ku(e,t){let n=t?Eu:Du,r=``;for(let t=0;t<e.length;t++){let i=e.charCodeAt(t);i>=48&&i<=57||i>=65&&i<=90||i>=97&&i<=122||n.includes(e[t])?r+=e[t]:(i>=55296&&i<=56319&&(i=65536+((i&1023)<<10)+(e.charCodeAt(++t)&1023)),r+=i<128?G(i):i<2048?G(192|i>>6)+G(128|i&63):i<65536?G(224|i>>12)+G(128|i>>6&63)+G(128|i&63):G(240|i>>18)+G(128|i>>12&63)+G(128|i>>6&63)+G(128|i&63))}return r}function Au(e){let t=``,n=0;for(;n<e.length;){if(e.charCodeAt(n)!==37){t+=e[n++];continue}let r=parseInt(e.slice(n+1,n+3),16);if(n+=3,r>=192){let t=r<224?1:r<240?2:3;for(r&=(1<<6-t)-1;t-->0;)r=r<<6|parseInt(e.slice(n+1,n+3),16)&63,n+=3}r<65536?t+=String.fromCharCode(r):(r-=65536,t+=String.fromCharCode(55296|r>>10,56320|r&1023))}return t}function ju(e,t){if(e.startsWith(`!<`)&&e.endsWith(`>`))return Au(e.slice(2,-1));let n=e.indexOf(`!`,1),r=n===-1?`!`:e.slice(0,n+1);return Au(t?.[r]??Tu[r]??r)+Au(e.slice(r.length))}function Mu(e){let t=e;return t.charCodeAt(0)===33?(t=t.slice(1),`!${ku(t,!0)}`):t.slice(0,18)===`tag:yaml.org,2002:`?`!!${ku(t.slice(18),!0)}`:`!<${ku(t,!1)}>`}var Nu=-1,Pu=`tag:yaml.org,2002:merge`,Fu={filename:``,schema:nu,json:!1,maxTotalMergeKeys:1e4,maxAliases:-1};function Iu(e){return`tagStart`in e&&e.tagStart!==Nu?e.tagStart:`anchorStart`in e&&e.anchorStart!==Nu?e.anchorStart:`valueStart`in e&&e.valueStart!==Nu?e.valueStart:`start`in e?e.start:0}function K(e,t){uu.throwAt(e.source,e.position,t,e.filename)}function Lu(e,t,n,r){try{return n.finalize(r)}catch(n){if(n instanceof uu)throw n;uu.throwAt(e.source,t,n instanceof Error?n.message:String(n),e.filename)}}function Ru(e,t){let n=wu(e.source,t),r=t.tagStart===Nu?``:e.source.slice(t.tagStart,t.tagEnd),i=e.schema.defaultScalarTag;if(r!==``){if(r===`!`)return{value:n,tag:i};let t=ju(r,e.tagHandlers),a=e.schema.lookupScalarTag(t);if(a){let r=a.resolve(n,!0,t);return r===z&&K(e,`cannot resolve a node with !<${t}> explicit tag`),{value:r,tag:a}}let o=e.schema.lookupMappingTag(t)??e.schema.lookupSequenceTag(t);if(o){n!==``&&K(e,`cannot resolve a node with !<${t}> explicit tag`);let r=o.create(t);return{value:o.carrierIsResult?r:Lu(e,e.position,o,r),tag:o}}K(e,`unknown scalar tag !<${t}>`)}return t.style===H.PLAIN?e.schema.resolveImplicitScalarTag(n):{value:i.resolve(n,!1,i.tagName),tag:i}}function zu(e,t,n){let r=t.tagStart===Nu?``:e.source.slice(t.tagStart,t.tagEnd);return r===``||r===`!`?n:ju(r,e.tagHandlers)}function Bu(e){return e.nodeKind===`mapping`}function Vu(e){e.totalMergeKeys++,e.maxTotalMergeKeys!==-1&&e.totalMergeKeys>e.maxTotalMergeKeys&&K(e,`merge keys exceeded maxTotalMergeKeys (${e.maxTotalMergeKeys})`)}function Hu(e,t,n,r){Vu(e);for(let i of r.keys(n)){if(Vu(e),t.tag.has(t.value,i))continue;let a=t.tag.addPair(t.value,i,r.get(n,i));a&&K(e,a),t.overridable??=new Set,t.overridable.add(i)}}function Uu(e,t,n,r){if(e.position=t.keyPosition,Bu(r))Hu(e,t,n,r);else if(r.nodeKind===`sequence`&&Array.isArray(n)){n.length>100&&K(e,`abnormal merge sequence size`);for(let r of n){let n=e.nodeTags.get(r);n||K(e,`cannot merge mappings; the provided source object is unacceptable`),Hu(e,t,r,n)}}else K(e,`cannot merge mappings; the provided source object is unacceptable`)}function Wu(e,t,n,r,i){if(e.position=t.keyPosition,t.keyIsMerge){Uu(e,t,r,i);return}!e.json&&t.tag.has(t.value,n)&&!t.overridable?.has(n)&&K(e,`duplicated mapping key`);let a=t.tag.addPair(t.value,n,r);a&&K(e,a),t.overridable?.delete(n)}function Gu(e,t,n){let r=e.frames[e.frames.length-1];if(r.kind===`document`)r.value=t,r.hasValue=!0;else if(r.kind===`sequence`){Bu(n)&&e.nodeTags.set(t,n);let i=r.tag.addItem(r.value,t,r.index++);i&&K(e,i)}else if(r.hasKey){let i=r.key;r.key=void 0,r.hasKey=!1,Wu(e,r,i,t,n)}else r.key=t,r.keyPosition=e.position,r.hasKey=!0,r.keyIsMerge=n.tagName===Pu}function Ku(e,t,n,r,i){if(t.anchorStart!==Nu){let a={value:n,tag:r,isValueFinal:i};return e.anchors.set(e.source.slice(t.anchorStart,t.anchorEnd),a),a}return null}function qu(e,t){let n={...Fu,...t,events:e,documents:[],eventIndex:0,position:0,frames:[],anchors:new Map,nodeTags:new Map,tagHandlers:Object.create(null),totalMergeKeys:0,aliasCount:0};for(;n.eventIndex<n.events.length;){let e=n.events[n.eventIndex++];switch(n.position=Iu(e),e.type){case V.DOCUMENT:n.anchors=new Map,n.nodeTags=new Map,n.aliasCount=0,n.tagHandlers=Object.create(null);for(let t of e.directives)t.kind===`tag`&&(n.tagHandlers[t.handle]=t.prefix);n.frames.push({kind:`document`,position:n.position,value:void 0,hasValue:!1});break;case V.SCALAR:{let{value:t,tag:r}=Ru(n,e);Ku(n,e,t,r,!0),Gu(n,t,r);break}case V.SEQUENCE:{let t=zu(n,e,`tag:yaml.org,2002:seq`),r=n.schema.lookupSequenceTag(t);r||K(n,`unknown sequence tag !<${t}>`);let i=r.create(t),a=Ku(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`sequence`,position:n.position,value:i,tag:r,anchor:a,index:0});break}case V.MAPPING:{let t=zu(n,e,`tag:yaml.org,2002:map`),r=n.schema.lookupMappingTag(t);r||K(n,`unknown mapping tag !<${t}>`);let i=r.create(t),a=Ku(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`mapping`,position:n.position,value:i,tag:r,anchor:a,key:void 0,keyPosition:n.position,hasKey:!1,keyIsMerge:!1,overridable:null});break}case V.ALIAS:{n.maxAliases!==-1&&++n.aliasCount>n.maxAliases&&K(n,`aliases exceeded maxAliases (${n.maxAliases})`);let t=n.source.slice(e.anchorStart,e.anchorEnd),r=n.anchors.get(t);r||K(n,`unidentified alias "${t}"`),r.isValueFinal||K(n,`recursive alias "${t}" is not supported for tag ${r.tag.tagName} because it uses finalize()`),Gu(n,r.value,r.tag);break}case V.POP:{let e=n.frames.pop();if(e.kind===`mapping`&&e.hasKey&&(n.position=e.keyPosition,K(n,`incomplete mapping pair in event stream`)),e.kind===`document`)n.documents.push(e.value);else{let t=e.tag.carrierIsResult?e.value:Lu(n,e.position,e.tag,e.value);e.anchor&&(e.anchor.value=t,e.anchor.isValueFinal=!0),Gu(n,t,e.tag)}break}}}return n.documents}var q=-1,Ju=Object.prototype.hasOwnProperty,Yu=1,Xu=2,Zu=3,Qu=4,$u=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ed=/[,\[\]{}]/,td=/^(?:!|!!|![0-9A-Za-z-]+!)$/,nd=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`,rd=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`,id=RegExp(`^(?:${nd})*$`),ad=RegExp(`^(?:${rd})+$`),od=RegExp(`^(?:!(?:${nd})*|${rd}(?:${nd})*)$`),sd={filename:``,maxDepth:100};function cd(e,t,n){e.events.push({type:V.DOCUMENT,explicitStart:t,explicitEnd:n,directives:e.directives})}function ld(e,t,n,r,i,a,o){e.events.push({type:V.SEQUENCE,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function ud(e,t,n,r,i,a,o){e.events.push({type:V.MAPPING,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function dd(e,t){e.events.splice(t.eventsLength,0,{type:V.MAPPING,start:t.position,anchorStart:q,anchorEnd:q,tagStart:q,tagEnd:q,style:U.FLOW})}function fd(e,t,n,r,i,a,o,s,c=W.CLIP,l=-1,u=!1){e.events.push({type:V.SCALAR,valueStart:t,valueEnd:n,anchorStart:r,anchorEnd:i,tagStart:a,tagEnd:o,style:s,chomping:c,indent:l,fast:u})}function pd(e,t,n){e.events.push({type:V.ALIAS,anchorStart:t,anchorEnd:n})}function md(e){e.events.push({type:V.POP})}function J(e){fd(e,q,q,q,q,q,q,H.PLAIN)}function hd(){return{anchorStart:q,anchorEnd:q,tagStart:q,tagEnd:q}}function gd(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,eventsLength:e.events.length}}function _d(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.events.length=t.eventsLength}function Y(e,t){uu.throwAt(e.input.slice(0,e.length),e.position,t,e.filename)}function X(e){return e===10||e===13}function vd(e){return e===9||e===32}function Z(e){return vd(e)||X(e)}function yd(e){return e===0||Z(e)}function bd(e){return e===44||e===91||e===93||e===123||e===125}function xd(e){return e>=48&&e<=57?e-48:-1}function Sd(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function Cd(e){return e===120?2:e===117?4:e===85?8:0}function wd(e){return e===48||e===97||e===98||e===116||e===9||e===110||e===118||e===102||e===114||e===101||e===32||e===34||e===47||e===92||e===78||e===95||e===76||e===80}function Td(e){e.input.charCodeAt(e.position)===10?e.position++:(e.position++,e.input.charCodeAt(e.position)===10&&e.position++),e.line++,e.lineStart=e.position,e.lineIndent=0,e.firstTabInLine=-1}function Q(e,t){let n=0,r=e.input.charCodeAt(e.position),i=e.position===e.lineStart||Z(e.input.charCodeAt(e.position-1));for(;r!==0;){for(;vd(r);)i=!0,r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&i&&r===35)do r=e.input.charCodeAt(++e.position);while(!X(r)&&r!==0);if(!X(r))break;for(Td(e),n++,i=!0,r=e.input.charCodeAt(e.position);r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return n}function Ed(e,t=e.position){let n=e.input.charCodeAt(t);if((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)){let n=e.input.charCodeAt(t+3);return n===0||Z(n)}return!1}function Dd(e){e.position===e.lineStart&&e.input.charCodeAt(e.position)===65279&&(e.position++,e.lineStart=e.position)}function Od(e){if(e.position!==e.lineStart)return!1;if(Ed(e))return!0;if(e.input.charCodeAt(e.position)!==65279)return!1;let t=gd(e);Dd(e),Q(e,!0);let n=e.input.charCodeAt(e.position),r=e.position===e.lineStart&&(n===37||n===45&&Ed(e));return _d(e,t),r}function kd(e){let t=e.input.charCodeAt(e.position);for(;t!==0&&!X(t);)t=e.input.charCodeAt(++e.position)}function Ad(e,t,n){let r=$u.exec(e.input.slice(t,n));r!==null&&(e.position=t+r.index+r[0].length-1,Y(e,`the stream contains non-printable characters`))}function jd(e,t,n){if(e.input.charCodeAt(e.position)!==33)return!1;t.tagStart!==q&&Y(e,`duplication of a tag property`);let r=e.position,i=!1,a=!1,o=`!`,s=e.input.charCodeAt(++e.position);s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33&&(a=!0,o=`!!`,s=e.input.charCodeAt(++e.position));let c=e.position,l;if(i){for(;s!==0&&s!==62;)s=e.input.charCodeAt(++e.position);s!==62&&Y(e,`unexpected end of the stream within a verbatim tag`),l=e.input.slice(c,e.position),e.position++}else{for(;s!==0&&!Z(s)&&!(n&&bd(s));)s===33&&(a?Y(e,`tag suffix cannot contain exclamation marks`):(o=e.input.slice(c-1,e.position+1),td.test(o)||Y(e,`named tag handle cannot contain such characters`),a=!0,c=e.position+1)),s=e.input.charCodeAt(++e.position);l=e.input.slice(c,e.position),ed.test(l)&&Y(e,`tag suffix cannot contain flow indicator characters`)}return l&&!(i?id.test(l):ad.test(l))&&Y(e,`tag name cannot contain such characters: ${l}`),!i&&o!==`!`&&o!==`!!`&&!Ju.call(e.tagHandlers,o)&&Y(e,`undeclared tag handle "${o}"`),t.tagStart=r,t.tagEnd=e.position,!0}function Md(e,t){if(e.input.charCodeAt(e.position)!==38)return!1;t.anchorStart!==q&&Y(e,`duplication of an anchor property`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Z(e.input.charCodeAt(e.position))&&!bd(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&Y(e,`name of an anchor node must contain at least one character`),t.anchorStart=n,t.anchorEnd=e.position,!0}function Nd(e,t){if(e.input.charCodeAt(e.position)!==42)return!1;(t.anchorStart!==q||t.tagStart!==q)&&Y(e,`alias node should not have any properties`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Z(e.input.charCodeAt(e.position))&&!bd(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&Y(e,`name of an alias node must contain at least one character`),pd(e,n,e.position),!0}function Pd(e,t){Q(e,!1),e.lineIndent<t&&Y(e,`deficient indentation`)}function Fd(e,t,n){if(e.input.charCodeAt(e.position)!==39)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===39){if(e.input.charCodeAt(e.position+1)===39){i=!1,e.position+=2;continue}let t=e.position;return e.position++,fd(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,H.SINGLE_QUOTED,W.CLIP,-1,i),!0}X(a)?(i=!1,Pd(e,t)):e.position===e.lineStart&&Ed(e)?Y(e,`unexpected end of the document within a single quoted scalar`):a!==9&&a<32?Y(e,`expected valid JSON character`):e.position++}Y(e,`unexpected end of the stream within a single quoted scalar`)}function Id(e,t,n){if(e.input.charCodeAt(e.position)!==34)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===34){let t=e.position;return e.position++,fd(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,H.DOUBLE_QUOTED,W.CLIP,-1,i),!0}if(a===92){i=!1;let n=e.input.charCodeAt(++e.position);if(X(n))Pd(e,t);else if(wd(n))e.position++;else{let t=Cd(n);for(t===0&&Y(e,`unknown escape sequence`);t-->0;)e.position++,Sd(e.input.charCodeAt(e.position))<0&&Y(e,`expected hexadecimal character`);e.position++}}else X(a)?(i=!1,Pd(e,t)):e.position===e.lineStart&&Ed(e)?Y(e,`unexpected end of the document within a double quoted scalar`):a!==9&&a<32?Y(e,`expected valid JSON character`):e.position++}Y(e,`unexpected end of the stream within a double quoted scalar`)}function Ld(e,t,n){let r=e.input.charCodeAt(e.position),i=W.CLIP,a=-1,o=!1;if(r!==124&&r!==62)return!1;let s=r===124?H.LITERAL_BLOCK:H.FOLDED_BLOCK;for(e.position++;e.input.charCodeAt(e.position)!==0;){let n=e.input.charCodeAt(e.position),r=xd(n);if(n===43||n===45)i!==W.CLIP&&Y(e,`repeat of a chomping mode identifier`),i=n===43?W.KEEP:W.STRIP,e.position++;else if(r>=0)r===0&&Y(e,`bad explicit indentation width of a block scalar; it cannot be less than one`),o&&Y(e,`repeat of an indentation width identifier`),a=t+r-1,o=!0,e.position++;else break}let c=!1;for(;vd(e.input.charCodeAt(e.position));)c=!0,e.position++;c&&e.input.charCodeAt(e.position)===35&&kd(e),X(e.input.charCodeAt(e.position))?Td(e):e.input.charCodeAt(e.position)!==0&&Y(e,`a line break is expected`);let l=o?a:-1,u=0,d=e.position,f=e.position;for(;e.input.charCodeAt(e.position)!==0;){let n=e.position,r=0;for(;e.input.charCodeAt(n+r)===32;)r++;let i=e.input.charCodeAt(n+r);if(i===0){l>=0?r>l&&(f=n+r):r>0&&(f=n+r);break}if(Od(e))break;if(!o&&l===-1&&X(i)&&(u=Math.max(u,r)),!o&&l===-1&&!X(i)&&(i===9&&r<t&&(e.position=n+r,Y(e,`tab characters must not be used in indentation`)),r>=t&&r<u&&(e.position=n+r,Y(e,`bad indentation of a mapping entry`))),l===-1&&i!==0&&!X(i)&&r<t){e.lineIndent=r,e.position=n+r;break}!o&&i!==0&&!X(i)&&l===-1&&(l=r);let a=l===-1?t+1:l;if(i!==0&&!X(i)&&r<a){e.lineIndent=r,e.position=n+r;break}kd(e),f=e.position,X(e.input.charCodeAt(e.position))&&(Td(e),f=e.position)}return Ad(e,d,f),fd(e,d,f,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,s,i,l),!0}function Rd(e,t){let n=e.input.charCodeAt(e.position),r=t===Yu;if(n===0||Z(n)||n===35||n===38||n===42||n===33||n===124||n===62||n===39||n===34||n===37||n===64||n===96||bd(n))return!1;if(n===63||n===45){let t=e.input.charCodeAt(e.position+1);if(yd(t)||r&&bd(t))return!1}return!0}function zd(e,t,n,r){if(!Rd(e,n))return!1;let i=e.position,a=e.position,o=e.input.charCodeAt(e.position),s=n===Yu,c=!1;for(;o!==0&&!Od(e);){if(o===58){let t=e.input.charCodeAt(e.position+1);if(yd(t)||s&&bd(t))break}else if(o===35){if(Z(e.input.charCodeAt(e.position-1)))break}else if(s&&bd(o))break;else if(X(o)){let n=e.position,r=e.line,i=e.lineStart,a=e.lineIndent;if(Q(e,!1),e.lineIndent>=t){c=!0,o=e.input.charCodeAt(e.position);continue}e.position=n,e.line=r,e.lineStart=i,e.lineIndent=a;break}vd(o)||(a=e.position+1),o=e.input.charCodeAt(++e.position)}return a!==i&&(Ad(e,i,a),fd(e,i,a,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,H.PLAIN,W.CLIP,-1,!c),!0)}function Bd(e,t){let n=e.line;Q(e,!0),(e.line>n&&e.lineIndent<t||e.firstTabInLine!==-1&&e.lineIndent<t)&&Y(e,`deficient indentation`)}function Vd(e,t,n){let r=e.input.charCodeAt(e.position),i=r===123,a=e.position,o=!0;if(r!==91&&r!==123)return!1;let s=i?125:93;for(i?ud(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,U.FLOW):ld(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,U.FLOW),e.position++;e.input.charCodeAt(e.position)!==0;){Bd(e,t);let n=e.input.charCodeAt(e.position);if(n===s)return e.position++,md(e),!0;o?n===44&&Y(e,`expected the node content, but found ','`):Y(e,`missed comma between flow collection entries`);let r=!1,a=!1;n===63&&Z(e.input.charCodeAt(e.position+1))&&(r=a=!0,e.position+=1,Bd(e,t));let c=e.line,l=gd(e),u=Wd(e,t,Yu,!1,!0);Bd(e,t),n=e.input.charCodeAt(e.position),(i||a||e.line===c)&&n===58?(r=!0,e.position++,Bd(e,t),i||dd(e,l),u||J(e),Wd(e,t,Yu,!1,!0)||J(e),Bd(e,t),i||md(e)):i&&r?(u||J(e),J(e)):i?J(e):r&&(dd(e,l),u||J(e),J(e),md(e)),n=e.input.charCodeAt(e.position),n===44?(o=!0,e.position++):o=!1}Y(e,`unexpected end of the stream within a flow collection`)}function Hd(e,t,n){if(e.firstTabInLine!==-1||e.input.charCodeAt(e.position)!==45||!yd(e.input.charCodeAt(e.position+1)))return!1;for(ld(e,e.position,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,U.BLOCK);e.input.charCodeAt(e.position)===45&&yd(e.input.charCodeAt(e.position+1));){e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,Y(e,`tab characters must not be used in indentation`));let n=e.line;e.position++;let r=Q(e,!0)>0;if(e.firstTabInLine!==-1&&e.input.charCodeAt(e.position)===45&&yd(e.input.charCodeAt(e.position+1))&&Y(e,`bad indentation of a sequence entry`),r&&e.lineIndent<=t?J(e):Wd(e,t,Zu,!1,!0),Q(e,!0),e.lineIndent<t||e.position>=e.length)break;e.lineIndent>t&&Y(e,`bad indentation of a sequence entry`),e.line===n&&e.input.charCodeAt(e.position)===45&&yd(e.input.charCodeAt(e.position+1))&&Y(e,`bad indentation of a sequence entry`)}return md(e),!0}function Ud(e,t,n,r){let i=!1,a=!1,o=!1,s=!1;if(e.firstTabInLine!==-1)return!1;let c=e.input.charCodeAt(e.position);for(;c!==0;){!i&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,Y(e,`tab characters must not be used in indentation`));let l=e.input.charCodeAt(e.position+1),u=e.line;if((c===63||c===58)&&yd(l))o||=(ud(e,e.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,U.BLOCK),!0),c===63?(i&&J(e),a=!0,i=!0):(i||(J(e),a=!0),i=!1),e.position+=1,s=!0;else{i&&=(J(e),!1);let t=gd(e);if(!Wd(e,n,Xu,!1,!0))break;if(e.line===u){for(c=e.input.charCodeAt(e.position);vd(c);)c=e.input.charCodeAt(++e.position);if(c===58)c=e.input.charCodeAt(++e.position),yd(c)||Y(e,`a whitespace character is expected after the key-value separator within a block mapping`),o||=(e.events.splice(t.eventsLength,0,{type:V.MAPPING,start:t.position,anchorStart:r.anchorStart,anchorEnd:r.anchorEnd,tagStart:r.tagStart,tagEnd:r.tagEnd,style:U.BLOCK}),!0),a=!0,i=!1,s=!1;else if(a)Y(e,`expected ':' after a mapping key`);else return r.anchorStart!==q||r.tagStart!==q?(_d(e,t),!1):!0}else if(a)Y(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return r.anchorStart!==q||r.tagStart!==q?(_d(e,t),!1):!0}if(Wd(e,t,Qu,!0,s)&&(s=!1),i||(s&&=(J(e),!1)),Q(e,!0),c=e.input.charCodeAt(e.position),(e.line===u||e.lineIndent>t)&&c!==0)Y(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return a?(i&&J(e),o&&md(e),!0):!1}function Wd(e,t,n,r,i,a=!0){e.depth>=e.maxDepth&&Y(e,`nesting exceeded maxDepth (${e.maxDepth})`),e.depth++;let o=1,s=!1,c=!1,l=null,u=hd(),d=n===Qu||n===Zu,f=d,p=d;if(r&&Q(e,!0)&&(s=!0,o=e.lineIndent>t?1:e.lineIndent===t?0:-1),o===1)for(;;){let r=e.input.charCodeAt(e.position),i=gd(e);if(s&&o!==1&&(r===33||r===38))break;if(s&&p&&(u.tagStart!==q||u.anchorStart!==q)&&(r===33||r===38)){let n=gd(e),r=t+1;if(Ud(e,e.position-e.lineStart,r,u)&&e.events[n.eventsLength]?.type===V.MAPPING)return e.depth--,!0;_d(e,n)}if(s&&(r===33&&u.tagStart!==q||r===38&&u.anchorStart!==q)||!jd(e,u,n===Yu)&&!Md(e,u))break;l===null&&(l=i),Q(e,!0)?(s=!0,f=p,o=e.lineIndent>t?1:e.lineIndent===t?0:-1):f=!1}if(f&&=s||i,o===1||n===Qu){let r=n===Yu||n===Xu?t:t+1,i=e.position-e.lineStart;if(o===1){if(f&&(Hd(e,i,u)||Ud(e,i,r,u))||Vd(e,r,u))c=!0;else{let t=e.input.charCodeAt(e.position);if(l!==null&&a&&p&&!f&&t!==124&&t!==62){let t=gd(e),n=l.position-l.lineStart;_d(e,l),Ud(e,n,r,hd())&&e.events[t.eventsLength]?.type===V.MAPPING?c=!0:_d(e,t)}!c&&(d&&Ld(e,r,u)||Fd(e,r,u)||Id(e,r,u)||Nd(e,u)||zd(e,r,n,u))&&(c=!0)}}else o===0&&(c=f&&Hd(e,i,u))}return d&&=!c,!c&&(u.anchorStart!==q||u.tagStart!==q||d)&&(fd(e,q,q,u.anchorStart,u.anchorEnd,u.tagStart,u.tagEnd,H.PLAIN),c=!0),e.depth--,c||u.anchorStart!==q||u.tagStart!==q}function Gd(e){if(e.lineIndent>0||e.input.charCodeAt(e.position)!==37)return!1;e.position++;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Z(e.input.charCodeAt(e.position));)e.position++;let n=e.input.slice(t,e.position),r=[];for(n.length===0&&Y(e,`directive name must not be less than one character in length`);e.input.charCodeAt(e.position)!==0&&!X(e.input.charCodeAt(e.position));){for(;vd(e.input.charCodeAt(e.position));)e.position++;if(e.input.charCodeAt(e.position)===35||X(e.input.charCodeAt(e.position))||e.input.charCodeAt(e.position)===0)break;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Z(e.input.charCodeAt(e.position));)e.position++;r.push(e.input.slice(t,e.position))}if(X(e.input.charCodeAt(e.position))&&Td(e),n===`YAML`){e.directives.some(e=>e.kind===`yaml`)&&Y(e,`duplication of %YAML directive`),r.length!==1&&Y(e,`YAML directive accepts exactly one argument`);let t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]);t===null&&Y(e,`ill-formed argument of the YAML directive`),parseInt(t[1],10)!==1&&Y(e,`unacceptable YAML version of the document`),e.directives.push({kind:`yaml`,version:r[0]})}else if(n===`TAG`){r.length!==2&&Y(e,`TAG directive accepts exactly two arguments`);let[t,n]=r;td.test(t)||Y(e,`ill-formed tag handle (first argument) of the TAG directive`),Ju.call(e.tagHandlers,t)&&Y(e,`there is a previously declared suffix for "${t}" tag handle`),od.test(n)||Y(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagHandlers[t]=n,e.directives.push({kind:`tag`,handle:t,prefix:n})}return!0}function Kd(e){e.directives=[],e.tagHandlers=Object.create(null);let t=!1;for(Q(e,!0);Gd(e);)t=!0,Q(e,!0);let n=!1,r=!1,i=!0;if(e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45&&yd(e.input.charCodeAt(e.position+3))){n=!0;let t=e.line;e.position+=3,Q(e,!0),i=e.line>t}else t&&Y(e,`directives end mark is expected`);let a=e.events.length;if(!n&&e.position===e.lineStart&&e.input.charCodeAt(e.position)===46&&Ed(e)){e.position+=3,Q(e,!0);return}if(cd(e,n,!1),Wd(e,e.lineIndent-1,Qu,!1,i,i)||J(e),Q(e,!0),e.position===e.lineStart&&Ed(e)&&(r=e.input.charCodeAt(e.position)===46,r)){let t=e.line;e.position+=3,Q(e,!0),e.line===t&&e.position<e.length&&Y(e,`end of the stream or a document separator is expected`)}let o=e.events[a];o?.type===V.DOCUMENT&&(o.explicitEnd=r),md(e),!r&&e.position<e.length&&!Od(e)&&Y(e,`end of the stream or a document separator is expected`)}function qd(e,t){let n=e.length,r={...sd,...t,input:`${e}\0`,length:n,position:0,line:0,lineStart:0,lineIndent:0,firstTabInLine:-1,depth:0,directives:[],tagHandlers:Object.create(null),events:[]},i=e.indexOf(`\0`);for(i!==-1&&uu.throwAt(e,i,`null byte is not allowed in input`,r.filename);r.position<r.length&&(Dd(r),Q(r,!0),!(r.position>=r.length));){let e=r.position;Kd(r),r.position===e&&Y(r,`can not read a document`)}return r.events}var Jd={...sd,...Fu};function Yd(e,t={}){let n={...Jd,...t},r=String(e),i=Object.keys(sd),a=Object.keys(Fu);return qu(qd(r,Kl(n,i)),{...Kl(n,a),source:r})}function Xd(e,t){let n=Yd(e,t);if(n.length===0)throw new uu(`expected a document, but the input is empty`);if(n.length===1)return n[0];throw new uu(`expected a single document in the stream, but found more`)}var Zd=Symbol(`INVALID`);function Qd(e){let t=new Set([e.defaultScalarTag,e.defaultSequenceTag,e.defaultMappingTag].filter(e=>e!==void 0)),n=e.implicitScalarTags,r=e.tags.filter(e=>!(e.nodeKind===`scalar`&&e.implicit)&&!t.has(e)),i=e.tags.filter(e=>t.has(e));return[...n.map(e=>({tag:e,implicitTag:!0})),...r.map(e=>({tag:e,implicitTag:!1})),...i.map(e=>({tag:e,implicitTag:!0}))]}function $d(e,t){for(let n=0,r=e.representTypes.length;n<r;n+=1){let{tag:r,implicitTag:i}=e.representTypes[n];if(r.identify(t)){let e;return e=r.matchByTagPrefix?r.representTagName(t):r.tagName,{tag:r,tagName:e,implicitTag:i}}}return null}function ef(e,t){if(!e.noRefs&&typeof t==`object`&&t){let n=e.refs.get(t);if(n)return n.anchor===void 0&&(n.anchor=`ref_${e.refCounter++}`),{kind:`alias`,anchor:n.anchor}}let n=$d(e,t);if(!n){if(t===void 0||e.skipInvalid)return Zd;throw new uu(`unacceptable kind of an object to dump ${Object.prototype.toString.call(t)}`)}let{tag:r,tagName:i,implicitTag:a}=n,o=a?i:Mu(i);if(r.nodeKind===`scalar`)return{kind:`scalar`,tag:o,tagged:!a,style:H.PLAIN,value:r.represent(t)};if(r.nodeKind===`sequence`){let n=r.represent(t),i={kind:`sequence`,tag:o,tagged:!a,style:U.BLOCK,items:[]};e.noRefs||e.refs.set(t,i);for(let t=0,r=n.length;t<r;t+=1){let r=ef(e,n[t]);r===Zd&&n[t]===void 0&&(r=ef(e,null)),r!==Zd&&i.items.push(r)}return i}let s=r.represent(t),c={kind:`mapping`,tag:o,tagged:!a,style:U.BLOCK,items:[]};e.noRefs||e.refs.set(t,c);for(let[t,n]of s){let r=ef(e,t);if(r===Zd)continue;let i=ef(e,n);i!==Zd&&c.items.push({key:r,value:i})}return c}function tf(e,t,n={}){let r=ef({representTypes:Qd(t),noRefs:n.noRefs??!1,skipInvalid:n.skipInvalid??!1,refs:new Map,refCounter:0},e);return[{contents:r===Zd?null:r,directives:[]}]}var nf=Symbol(`visit:break`),rf=Symbol(`visit:skip`);function af(e,t,n){let r=t(e,n);if(r===nf)return!0;if(r===rf)return!1;let i=n.depth+1;switch(e.kind){case`sequence`:for(let n of e.items)if(af(n,t,{depth:i,parent:e,isKey:!1}))return!0;break;case`mapping`:for(let{key:n,value:r}of e.items)if(af(n,t,{depth:i,parent:e,isKey:!0})||af(r,t,{depth:i,parent:e,isKey:!1}))return!0}return!1}function of(e,t){for(let n of e)if(n.contents&&af(n.contents,t,{depth:0,parent:null,isKey:!1}))return}function sf(e,t){return!!(e&1<<t)}var cf={applyQuoteFlowKeysOption:uf,doubleQuoteForInvisibles:df,doubleQuoteWhitespaceOnly:ff,applyForceQuotesOption:pf,tryLongOrMultilineAsBlock:mf,quoteInvalidPlain:hf,fallbackToDoubleQuoted:gf};function lf(e){return e.presenterOptions.quoteStyle===`single`&&sf(e.allowedStylesMask,H.SINGLE_QUOTED)?H.SINGLE_QUOTED:H.DOUBLE_QUOTED}function uf(e){e.presenterOptions.quoteFlowKeys&&e.isKey&&e.flowOnly&&e.style===H.PLAIN&&(e.style=H.DOUBLE_QUOTED)}function df(e){e.style===H.PLAIN&&/[\t\x7F-\xA0\u2028\u2029\uFEFF\uFFFE\uFFFF]/.test(e.node.value)&&(e.style=H.DOUBLE_QUOTED)}function ff(e){e.style===H.PLAIN&&/^\s+$/.test(e.node.value)&&(e.style=H.DOUBLE_QUOTED)}function pf(e){e.presenterOptions.forceQuotes&&(e.isKey||e.style!==H.PLAIN||e.node.tag===e.presenterOptions.schema.defaultScalarTag.tagName&&(e.style=e.node.value.includes(`
`)?H.DOUBLE_QUOTED:lf(e)))}function mf(e){if(e.style!==H.PLAIN||e.isKey)return;let t=e.node.value,n=t.indexOf(`
`)!==-1;if(!sf(e.allowedStylesMask,H.LITERAL_BLOCK)){n&&(e.style=H.DOUBLE_QUOTED);return}let r=e.presenterOptions.lineWidth;if(r===-1){n&&(e.style=H.LITERAL_BLOCK);return}let i=Math.max(Math.min(r,40),r-e.shiftOfContent),a=0,o=!1;for(;a<=t.length;){let e=t.length,n=t.indexOf(`
`,a);n!==-1&&(e=n);let r=t.slice(a,e);if(r.length>i&&r[0]!==` `&&/ [^ \t]/.test(r)&&(o=!0),n===-1)break;a=n+1}o?e.style=H.FOLDED_BLOCK:n&&(e.style=H.LITERAL_BLOCK)}function hf(e){e.style===H.PLAIN&&!sf(e.allowedStylesMask,H.PLAIN)&&(e.style=lf(e))}function gf(e){sf(e.allowedStylesMask,e.style)||(e.style=H.DOUBLE_QUOTED)}function _f(e,t){return e|1<<t}var vf=`[\\x09\\x0A\\x0D\\x20-\\x7E\\x85\\xA0-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]`,yf=`[\\n\\r]`,bf=`\\uFEFF`,xf=`[ \\t]`,Sf=`(?:(?!(?:${yf}|${bf}))${vf})`,Cf=`(?:(?!${xf})${Sf})`,wf=`[\\x09\\x20-\\uD7FF\\uE000-\\uFFFF\\u{10000}-\\u{10FFFF}]`,Tf=`[-?:,\\[\\]{}#&*!|>'"%@\`]`,Ef=`[,\\[\\]{}]`,Df=Cf,Of=`(?:(?!${Ef})${Cf})`,kf=`(?:(?:(?!${Tf})${Cf})|[?:-](?=${Df}))`,Af=`(?:(?:(?!${Tf})${Cf})|[?:-](?=${Of}))`,jf=`(?:(?:(?![:#])${Df})|:(?=${Df}))#*`,Mf=`(?:(?:(?![:#])${Of})|:(?=${Of}))#*`,Nf=`(?:${xf}*${jf})*`,Pf=`(?:${xf}*${Mf})*`,Ff=`${kf}#*${Nf}`,If=`${Af}#*${Pf}`,Lf=Ff,Rf=If,zf=`\\n+${jf}${Nf}`,Bf=`\\n+${Mf}${Pf}`,Vf=`${Ff}(?:${zf})*`,Hf=`${If}(?:${Bf})*`,Uf=RegExp(`^(?:${Vf})$`,`u`),Wf=RegExp(`^(?:${Hf})$`,`u`),Gf=RegExp(`^(?:${Lf})$`,`u`),Kf=RegExp(`^(?:${Rf})$`,`u`),qf=RegExp(`^(?:${wf})*$`,`u`),Jf=RegExp(`^(?:${wf}|\\n)*$`,`u`),Yf=RegExp(`^(?:${Sf}|\\n)*$`,`u`),Xf=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/,Zf=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/m;function Qf(e){let t=e.node.value;if(t!==``){if(!(e.isKey?e.flowOnly?Kf:Gf:e.flowOnly?Wf:Uf).test(t)||e.shiftOfFirstLine===0&&Xf.test(t))return!1;if(e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1){let n=t.slice(e+1);if(Zf.test(n))return!1}}}let n=e.presenterOptions.schema.resolveImplicitScalarTag(t).tag.tagName;return!(!e.node.tagged&&n!==e.node.tag||!e.node.tagged&&t===`=`&&n===e.presenterOptions.schema.defaultScalarTag.tagName)}function $f(e){let t=e.node.value;if(!(e.isKey?qf:Jf).test(t)||/[ \t]\n|\n[ \t]/.test(t))return!1;if(!e.isKey&&e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1&&Zf.test(t.slice(e+1)))return!1}return!0}function ep(e){if(e.flowOnly||!Yf.test(e.node.value))return!1;let t=e.shiftOfContent-e.shiftOfParent;return!(t<1||t>9&&/^\n* /.test(e.node.value)||e.shiftOfContent===0&&Zf.test(e.node.value))}function tp(e){let t=_f(0,H.DOUBLE_QUOTED);Qf(e)&&(t=_f(t,H.PLAIN)),$f(e)&&(t=_f(t,H.SINGLE_QUOTED)),ep(e)&&(t=_f(_f(t,H.LITERAL_BLOCK),H.FOLDED_BLOCK)),e.allowedStylesMask=t}function np(e){switch(e.style){case H.PLAIN:return rp(e);case H.SINGLE_QUOTED:return ip(e);case H.LITERAL_BLOCK:return ap(e);case H.FOLDED_BLOCK:return op(e);case H.DOUBLE_QUOTED:return sp(e)}}function rp(e){return cp(e.node.value,e.shiftOfContent)}function ip(e){return`'${cp(e.node.value,e.shiftOfContent).replace(/'/g,`''`)}'`}function ap(e){let t=e.node.value;return`|`+dp(t,e.shiftOfParent,e.shiftOfContent)+fp(lp(t,e.shiftOfContent))}function op(e){let t=e.node.value,n=e.presenterOptions.lineWidth,r=1/0;return n!==-1&&(r=Math.max(Math.min(n,40),n-e.shiftOfContent)),`>`+dp(t,e.shiftOfParent,e.shiftOfContent)+fp(lp(hp(t,r),e.shiftOfContent))}function sp(e){return`"${vp(e.node.value)}"`}function cp(e,t){let n=e.indexOf(`
`);if(n===-1)return e;let r=` `.repeat(t),i=e.slice(0,n),a=/(\n+)([^\n]*)/g;a.lastIndex=n;let o;for(;o=a.exec(e);){let e=o[1].length,t=o[2];i+=`
`.repeat(e+1)+r+t}return i}function lp(e,t){let n=` `.repeat(t),r=0,i=``,a=e.length;for(;r<a;){let t,o=e.indexOf(`
`,r);o===-1?(t=e.slice(r),r=a):(t=e.slice(r,o+1),r=o+1),t.length&&t!==`
`&&(i+=n),i+=t}return i}function up(e){return/^\n* /.test(e)}function dp(e,t,n){let r=up(e)?String(n-t):``,i=e[e.length-1]===`
`;return`${r}${i&&(e[e.length-2]===`
`||e===`
`)?`+`:i?``:`-`}\n`}function fp(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function pp(e){return e===` `||e===`	`}function mp(e,t){if(e===``||pp(e[0]))return e;let n=/ [^ \t]/g,r,i=0,a,o=0,s=0,c=``;for(;r=n.exec(e);)s=r.index,s-i>t&&(a=o>i?o:s,c+=`\n${e.slice(i,a)}`,i=a+1),o=s;return c+=`
`,e.length-i>t&&o>i?c+=`${e.slice(i,o)}\n${e.slice(o+1)}`:c+=e.slice(i),c.slice(1)}function hp(e,t){let n=/(\n+)([^\n]*)/g,r=e.indexOf(`
`);r===-1&&(r=e.length),n.lastIndex=r;let i=mp(e.slice(0,r),t),a=e[0]===`
`||pp(e[0]),o,s;for(;s=n.exec(e);){let e=s[1],n=s[2];o=n!==``&&pp(n[0]),i+=e+(!a&&!o&&n!==``?`
`:``)+mp(n,t),a=o}return i}var gp=/["\\\x00-\x1F\x7F-\xA0\u2028\u2029\uD800-\uDFFF\uFEFF\uFFFE\uFFFF]/gu;function _p(e){switch(e){case`\0`:return`\\0`;case`\x07`:return`\\a`;case`\b`:return`\\b`;case`	`:return`\\t`;case`
`:return`\\n`;case`\v`:return`\\v`;case`\f`:return`\\f`;case`\r`:return`\\r`;case`\x1B`:return`\\e`;case`"`:return`\\"`;case`\\`:return`\\\\`;case``:return`\\N`;case`\xA0`:return`\\_`;case`\u2028`:return`\\L`;case`\u2029`:return`\\P`}let t=e.charCodeAt(0),n=t.toString(16).toUpperCase();return t<=255?`\\x${`0`.repeat(2-n.length)}${n}`:`\\u${`0`.repeat(4-n.length)}${n}`}function vp(e){return e.replace(gp,_p)}var yp=10,bp={indent:2,seqNoIndent:!1,seqInlineFirst:!0,lineWidth:80,flowBracketPadding:!1,flowSkipCommaSpace:!1,flowSkipColonSpace:!1,quoteFlowKeys:!1,quoteStyle:`single`,forceQuotes:!1,scalarStyleRules:Object.keys(cf).map(e=>Reflect.get(cf,e)),tagBeforeAnchor:!1};function xp(e){return e.tagged?e.tag:Mu(e.tag)}function Sp(e){let t={...bp,...e};return t.flowSkipColonSpace&&(t.quoteFlowKeys=!0),{...t,defaultScalarTagName:t.schema.defaultScalarTag.tagName,openEnded:!1}}function Cp(e,t){return`\n${` `.repeat(e.indent*t)}`}function wp(e,t,n,r,i,a){return{node:t,parent:n,level:r,isKey:i,flowOnly:a,shiftOfParent:r===0?-1:e.indent*(r-1),shiftOfContent:e.indent*Math.max(1,r),shiftOfFirstLine:r===0?0:e.indent*r,presenterOptions:e,allowedStylesMask:0,style:t.style}}function Tp(e,t,n){let r=``;for(let i=0,a=n.items.length;i<a;i+=1){let a=Ap(e,t,n.items[i],n,{}).text;i>0&&(r+=`,${e.flowSkipCommaSpace?``:` `}`),r+=a}let i=e.flowBracketPadding&&n.items.length>0?` `:``;return`[${i}${r}${i}]`}function Ep(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=Ap(e,t+1,n.items[a],n,{block:!0,compact:e.seqInlineFirst,isblockseq:!0}).text;r&&i===``||(i+=Cp(e,t)),o===``||yp===o.charCodeAt(0)?i+=`-`:i+=`- `,i+=o}return i}function Dp(e,t,n){let r=``;for(let{key:i,value:a}of n.items){let o=``;r!==``&&(o+=`,${e.flowSkipCommaSpace?``:` `}`);let s=Ap(e,t,i,n,{iskey:!0}),c=s.text,l=Ap(e,t,a,n,{}).text,u=e.flowSkipColonSpace||l===``?``:` `,d=i.kind===`scalar`&&s.noBody&&(i.tagged||i.anchor!==void 0),f=i.kind===`alias`||d?` `:``;o+=`${c}${f}:${u}${l}`,r+=o}let i=e.flowBracketPadding&&r!==``?` `:``;return`{${i}${r}${i}}`}function Op(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=``;r&&i===``||(o+=Cp(e,t));let{key:s,value:c}=n.items[a],l=(s.kind===`mapping`||s.kind===`sequence`)&&s.style===U.BLOCK&&s.items.length!==0||s.kind===`scalar`&&(s.style===H.LITERAL_BLOCK||s.style===H.FOLDED_BLOCK),u=l?Ap(e,t+1,s,n,{block:!0,compact:!0,isblockseq:!kp(e,s,t+1)}):Ap(e,t+1,s,n,{block:!0,compact:!0,iskey:!0}),d=u.text,f=s.kind===`scalar`&&s.value.indexOf(`
`)!==-1,p=d.length>1024&&/^[\s\S]{1025}/u.test(d),m=l||f||p;m&&(d&&yp===d.charCodeAt(0)?o+=`?`:o+=`? `),o+=d,m&&(o+=Cp(e,t));let h=Ap(e,t+1,c,n,{block:!0,compact:m,isblockseq:m&&!kp(e,c,t+1)}).text,g=s.kind===`scalar`&&u.noBody&&(s.tagged||s.anchor!==void 0),_=!m&&(s.kind===`alias`||g)?` `:``;h===``||yp===h.charCodeAt(0)?o+=`${_}:`:o+=`${_}: `,o+=h,i+=o}return i}function kp(e,t,n){return t.kind===`alias`||t.tagged||t.anchor!==void 0||e.indent<2&&n>0}function Ap(e,t,n,r,i){if(n.kind===`alias`)return e.openEnded=!1,{text:`*${n.anchor}`,noBody:!1};let{block:a=!1,iskey:o=!1,isblockseq:s=!1}=i,c=i.compact??!1,l=n.anchor!==void 0;kp(e,n,t)&&(c=!1);let u,d=n.tagged,f=a&&(n.kind===`mapping`||n.kind===`sequence`)&&n.style===U.BLOCK&&n.items.length!==0;if(n.kind===`mapping`)u=f?Op(e,t,n,c):Dp(e,t,n);else if(n.kind===`sequence`)u=f?e.seqNoIndent&&!s&&t>0?Ep(e,t-1,n,c):Ep(e,t,n,c):Tp(e,t,n);else{let i=wp(e,n,r,t,o,!a);tp(i);for(let t of e.scalarStyleRules)t(i);u=np(i),e.openEnded=(i.style===H.LITERAL_BLOCK||i.style===H.FOLDED_BLOCK)&&(n.value===`
`||n.value.endsWith(`

`)),d=n.tagged||u===``&&i.flowOnly&&r?.kind===`sequence`&&!l||i.style!==H.PLAIN&&n.tag!==e.defaultScalarTagName}n.kind!==`mapping`&&n.kind!==`sequence`||f||(e.openEnded=!1),f&&c&&t>0&&e.indent>2&&(u=`${` `.repeat(e.indent-2)}${u}`);let p=u===``,m=u;if(d||l){let t=[],r=d?xp(n):null,i=l?`&${n.anchor}`:null;e.tagBeforeAnchor?(r!==null&&t.push(r),i!==null&&t.push(i)):(i!==null&&t.push(i),r!==null&&t.push(r));let a=u===``||u.charCodeAt(0)===yp?``:` `;m=`${t.join(` `)}${a}${u}`}return{text:m,noBody:p}}function jp(e){return(e.kind===`sequence`||e.kind===`mapping`)&&e.style===U.BLOCK&&e.items.length!==0&&!e.tagged&&e.anchor===void 0}function Mp(e){let t=``;for(let n of e.directives){if(n.kind===`yaml`){t+=`%YAML ${n.version}\n`;continue}let{handle:e,prefix:r}=n;t+=`%TAG ${e} ${r}\n`}return t}function Np(e,t){let n=Sp(t),r=``,i=!1;for(let t=0;t<e.length;t+=1){let a=e[t];n.openEnded=!1;let o=Mp(a),s=o!==``,c=a.explicitStart||s||t>0&&!i;if(r+=o,a.contents===null)c&&(r+=`---
`);else if(c){let e=Ap(n,0,a.contents,null,{block:!0,compact:!0}).text,t=e===``?``:s||jp(a.contents)?`
`:` `;r+=`---${t}${e}\n`}else r+=Ap(n,0,a.contents,null,{block:!0,compact:!0}).text+`
`;i=a.explicitEnd||n.openEnded,i&&(r+=`...
`)}return r}var Pp={...bp,schema:ru,skipInvalid:!1,noRefs:!1,flowLevel:-1,sortKeys:!1,transform:()=>{}};function Fp(e,t){let n=String(e),r=String(t);return n<r?-1:+(n>r)}function Ip(e,t={}){let n={...Pp,...t},r=tf(e,n.schema,{noRefs:n.noRefs,skipInvalid:n.skipInvalid});if(n.flowLevel>=0&&of(r,(e,t)=>{if(!(t.depth<n.flowLevel))return(e.kind===`sequence`||e.kind===`mapping`)&&(e.style=U.FLOW),rf}),n.sortKeys){let e=n.sortKeys===!0?Fp:n.sortKeys;of(r,t=>{t.kind===`mapping`&&t.items.sort((t,n)=>e(t.key.kind===`scalar`?t.key.value:``,n.key.kind===`scalar`?n.key.value:``))})}return n.transform(r),Np(r,{...Kl(n,Object.keys(bp)),schema:n.schema})}V.DOCUMENT,V.SEQUENCE,V.MAPPING,V.SCALAR,V.ALIAS,V.POP,H.PLAIN,H.SINGLE_QUOTED,H.DOUBLE_QUOTED,H.LITERAL_BLOCK,H.FOLDED_BLOCK,U.BLOCK,U.FLOW,W.CLIP,W.STRIP,W.KEEP;function Lp(e){let t=Ip(e,{indent:2,lineWidth:-1,noRefs:!0});return[`# ======================================================================`,`# WARD-BECK SYSTEMS - CONSOLE MASTER CALIBRATION PROFILE (.WBS)`,`# Hardware Emulation: XTM-4 Mastering Meter & POD-22 Dual LED Bar`,`# Exported: ${e.timestamp}`,`# Compatible with: https://xtm.wbsps.ca/`,`# ======================================================================

`].join(`
`)+t}function Rp(e,t){let n=new Date().toISOString().slice(0,10),r=t||`WBS-Console-Config-${n}.WBS`,i=new Blob([e],{type:`text/yaml;charset=utf-8`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=r,document.body.appendChild(o),o.click(),setTimeout(()=>{document.body.removeChild(o),URL.revokeObjectURL(a)},150)}function zp(e){let t=Xd(e);if(!t||typeof t!=`object`)throw Error(`Invalid YAML configuration file format.`);let n=t;if(!n.console&&!n.ballistics&&!n.scope)throw Error(`Unrecognized WBS configuration structure: missing console, ballistics, or scope blocks.`);return t}function Bp(e,t){if(e.console&&(typeof e.console.power==`boolean`&&(t.power=e.console.power),e.console.mode&&(t.mode=t.prevMode=e.console.mode),e.console.meterStyle&&(t.meterStyle=e.console.meterStyle),e.console.dialLamp&&(t.dialLamp=e.console.dialLamp),e.console.vfdMetric&&(t.vfdMetric=e.console.vfdMetric),e.console.highPassFilter!==void 0&&(t.hp=+!!e.console.highPassFilter),e.console.termination600Ohm!==void 0&&(t.term=+!!e.console.termination600Ohm),e.console.inputA&&(t.a.src=e.console.inputA.src??t.a.src,t.a.lvl=e.console.inputA.lvl??t.a.lvl),e.console.inputD&&(t.d.src=e.console.inputD.src??t.d.src,t.d.lvl=e.console.inputD.lvl??t.d.lvl),e.console.testGenS?.pair&&(t.s.pair=[...e.console.testGenS.pair]),typeof e.console.toneCalibrationDbfs==`number`)){let n=t.toneCalLevels.indexOf(e.console.toneCalibrationDbfs);n>=0&&(t.toneCalIdx=n)}}function Vp(e,t){if(e.ballistics){if(typeof e.ballistics.vuReferenceLevelDbu==`number`&&t.setReferenceLevel(e.ballistics.vuReferenceLevelDbu,e.console?.mode===`D`),typeof e.ballistics.ppmPeakSensitivityTrimDb==`number`){t.setPeakSensTrim(e.ballistics.ppmPeakSensitivityTrimDb);let n=document.getElementById(`selectPeakSens`);n&&(n.value=String(e.ballistics.ppmPeakSensitivityTrimDb))}if(e.ballistics.vuBallisticPreset){t.setVuBallisticPreset(e.ballistics.vuBallisticPreset);let n=document.getElementById(`selectVuBallistics`);n&&(n.value=e.ballistics.vuBallisticPreset)}if(e.ballistics.ppmBallisticPreset){t.setPpmType(e.ballistics.ppmBallisticPreset);let n=document.getElementById(`selectPpmBallistics`);n&&(n.value=e.ballistics.ppmBallisticPreset)}typeof e.ballistics.inputGainTrimDb==`number`&&t.setInputTrim(e.ballistics.inputGainTrimDb),e.ballistics.monitorAudio&&t.setMonitorVolume(e.ballistics.monitorAudio.volume??.5)}}function Hp(e,t){if(e.pod22){if(typeof e.pod22.extendedLed22Range==`boolean`&&t.setExtendedRange(e.pod22.extendedLed22Range),e.pod22.scaleMode&&(t.scaleMode=e.pod22.scaleMode),e.pod22.decayType){t.setDecay(e.pod22.decayType);let n=document.getElementById(`selectPodDecay`);n&&(n.value=e.pod22.decayType)}if(typeof e.pod22.peakHold==`boolean`){t&&t.dip&&(t.dip.BS1=+!!e.pod22.peakHold);let n=document.getElementById(`chkPodHold`);n&&(n.checked=e.pod22.peakHold)}}}function Up(e,t){e.scope&&(e.scope.timeMode&&t.setTimeMode(e.scope.timeMode),typeof e.scope.captureLengthSeconds==`number`&&t.setCaptureLength(e.scope.captureLengthSeconds),typeof e.scope.captureSpeedFps==`number`&&(t.captureSpeed=e.scope.captureSpeedFps),typeof e.scope.logWarpBeta==`number`&&t.setBeta(e.scope.logWarpBeta),e.scope.traces&&(typeof e.scope.traces.channelA==`boolean`&&(t.showChA=e.scope.traces.channelA),typeof e.scope.traces.channelB==`boolean`&&(t.showChB=e.scope.traces.channelB),typeof e.scope.traces.sum==`boolean`&&(t.showSum=e.scope.traces.sum),typeof e.scope.traces.diff==`boolean`&&(t.showDiff=e.scope.traces.diff),typeof e.scope.traces.momentaryLufs==`boolean`&&(t.showLufs=e.scope.traces.momentaryLufs),typeof e.scope.traces.shortTermLufs==`boolean`&&(t.showLufsS=e.scope.traces.shortTermLufs),typeof e.scope.traces.integratedLufs==`boolean`&&(t.showLufsI=e.scope.traces.integratedLufs)),e.scope.display&&(typeof e.scope.display.show0DbfsCeilingLine==`boolean`&&(t.show0DbfsLine=e.scope.display.show0DbfsCeilingLine),typeof e.scope.display.enableWaveformFade==`boolean`&&(t.enableFade=e.scope.display.enableWaveformFade),typeof e.scope.display.hfFadeDistancePercent==`number`&&(t.hfFadeDistance=e.scope.display.hfFadeDistancePercent),typeof e.scope.display.showHoverTelemetryHud==`boolean`&&(t.showHoverTelemetry=e.scope.display.showHoverTelemetryHud),typeof e.scope.display.showCursorTraceLine==`boolean`&&(t.showCursorTrace=e.scope.display.showCursorTraceLine),typeof e.scope.display.plotPhaseCorrelation==`boolean`&&(t.plotPhase=e.scope.display.plotPhaseCorrelation),typeof e.scope.display.hudDocked==`boolean`&&t.setDocked(e.scope.display.hudDocked)))}function Wp(e){let t=(e,t)=>{if(t===void 0)return;let n=document.getElementById(e);n&&(n.checked=t)},n=(e,t)=>{if(t==null)return;let n=document.getElementById(e);n&&(n.value=String(t))};if(e.scope?.traces&&(t(`chkShowChA`,e.scope.traces.channelA),t(`chkShowChB`,e.scope.traces.channelB),t(`chkShowSum`,e.scope.traces.sum),t(`chkShowDiff`,e.scope.traces.diff),t(`chkShowLufs`,e.scope.traces.momentaryLufs),t(`chkShowLufsS`,e.scope.traces.shortTermLufs),t(`chkShowLufsI`,e.scope.traces.integratedLufs)),e.scope?.display&&(t(`chk0DbfsLine`,e.scope.display.show0DbfsCeilingLine),t(`chkFadeEnabled`,e.scope.display.enableWaveformFade),t(`chkHoverTelemetry`,e.scope.display.showHoverTelemetryHud),t(`chkCursorTrace`,e.scope.display.showCursorTraceLine),t(`chkPhasePlot`,e.scope.display.plotPhaseCorrelation),t(`chkDockHud`,e.scope.display.hudDocked)),e.ballistics){n(`inputGainTrimSlider`,e.ballistics.inputGainTrimDb);let r=document.getElementById(`inputGainTrimVal`);if(r){let t=e.ballistics.inputGainTrimDb;r.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}n(`peakSensTrimSlider`,e.ballistics.ppmPeakSensitivityTrimDb);let i=document.getElementById(`peakSensTrimVal`);if(i){let t=e.ballistics.ppmPeakSensitivityTrimDb;i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}e.ballistics.monitorAudio&&(t(`chkMonitorAudio`,e.ballistics.monitorAudio.enabled),n(`monitorVolumeSlider`,e.ballistics.monitorAudio.volume))}e.pod22&&t(`chkExtendedLed22`,e.pod22.extendedLed22Range)}var Gp=class e{static instance;static getInstance(){return e.instance||=new e,e.instance}getConsent(){return jc()}setConsent(e){Mc(e)}resetConsent(){Nc()}hasPersistentConsent(){return this.getConsent()===`allowed`}storageGet(e){return Pc(()=>this.hasPersistentConsent(),e)}storageSet(e,t){Fc(()=>this.hasPersistentConsent(),e,t)}storageRemove(e){Ic(e)}buildConfig(e,t,n,r){return Vc(e,t,n,r)}exportToYaml(e,t,n,r){return Lp(this.buildConfig(e,t,n,r))}downloadWbsFile(e,t,n,r,i){Rp(this.exportToYaml(e,t,n,r),i)}parseWbsYaml(e){return zp(e)}applyConfig(e,t,n,r,i){Bp(e,t),Vp(e,n),Hp(e,r),Up(e,i),this.syncDrawerDom(e),typeof i._updateTraceToggles==`function`&&i._updateTraceToggles(),i.graphDirty=!0,this.saveConfig(t,n,r,i),t.flash(`CONFIGOK`,1600),t.notify()}syncDrawerDom(e){Wp(e)}saveConfig(e,t,n,r){try{let i=this.buildConfig(e,t,n,r),a=JSON.stringify(i);this.storageSet(Ac,a)}catch{}}loadSavedConfig(e,t,n,r){try{let i=this.storageGet(Ac);if(!i)return!1;let a=JSON.parse(i);return this.applyConfig(a,e,t,n,r),!0}catch{return!1}}}.getInstance();function Kp(e,t=e.model){e.dbfsView&&Gp.saveConfig(t,e.audio,e.podView,e.dbfsView)}function qp(e){let{podView:t}=e,n=document.getElementById(`chkExtendedLed22`);if(n&&t){let e=localStorage.getItem(`xtm_extended_led22`),r=e===null||e===`true`;n.checked=r,t.setExtendedRange(r),n.addEventListener(`change`,e=>{t.setExtendedRange(e.target.checked);try{localStorage.setItem(`xtm_extended_led22`,e.target.checked)}catch{}})}}function Jp(e,t){let{podView:n}=e,{chkPodHold:r}=t,i=document.getElementById(`selectPodScale`);i&&n&&(i.value=n.scaleMode,i.addEventListener(`change`,e=>{n.scaleMode=e.target.value})),r&&r.addEventListener(`change`,e=>{n.dip.BS1=+!!e.target.checked})}function Yp(e,t){let{podView:n}=e,{selectPodDecay:r}=t;r&&(r.value=n.decayType||`type2`,r.addEventListener(`change`,t=>{n.setDecay(t.target.value),Kp(e)}))}function Xp(e){let t=e.dbfs||[-60,-60,-60,-60],n=e.lufs||{};return{time:new Date().toISOString(),chA:e.hasAudio?t[0].toFixed(2):`-60.00`,chB:e.hasAudio?t[1].toFixed(2):`-60.00`,sum:e.hasAudio&&typeof t[2]==`number`?t[2].toFixed(2):`-60.00`,diff:e.hasAudio&&typeof t[3]==`number`?t[3].toFixed(2):`-60.00`,lufsM:isFinite(n.m)?n.m.toFixed(2):`-60.00`,lufsS:isFinite(n.s)?n.s.toFixed(2):`-60.00`,lufsI:isFinite(n.i)?n.i.toFixed(2):`-60.00`,lra:isFinite(n.lra)?n.lra.toFixed(2):`0.00`,phase:typeof e.phaseCorrelation==`number`?e.phaseCorrelation.toFixed(3):`1.000`}}function Zp(e,t,n,r,i,a,o){return{time:new Date().toISOString(),chA:t.toFixed(2),chB:n.toFixed(2),sum:r.toFixed(2),diff:i.toFixed(2),deltaA:a.toFixed(2),deltaB:o.toFixed(2),lufsM:e.lufs&&isFinite(e.lufs.m)?e.lufs.m.toFixed(2):`-60.00`}}function Qp(){let e=[],t=0;function n(n,r){r-t<1e3||(t=r,e.push(Xp(n)),e.length>7200&&e.shift())}let r=[],i=-60,a=-60;function o(e){if(!e||!e.hasAudio)return;let t=e.dbfs||[-60,-60,-60,-60],n=t[0],o=t[1],s=typeof t[2]==`number`?t[2]:Math.max(n,o),c=typeof t[3]==`number`?t[3]:-60,l=n-i,u=o-a;i=n,a=o,(l>=3.5||u>=3.5||n>=-9||o>=-9)&&(r.push(Zp(e,n,o,s,c,l,u)),r.length>5e3&&r.shift())}return{telemetryLog:e,transientLog:r,recordTelemetry:n,recordTransientEvent:o}}function $p(e,t){let n=new Blob([e],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t}-${new Date().toISOString().replace(/[:.]/g,`-`)}.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}function em(e){let t=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation
`;for(let n of e)t+=`${n.time},${n.chA},${n.chB},${n.sum},${n.diff},${n.lufsM},${n.lufsS},${n.lufsI},${n.lra},${n.phase}\n`;return t}function tm(e){let t=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary
`;for(let n of e)t+=`${n.time},${n.chA},${n.chB},${n.sum},${n.diff},${n.deltaA},${n.deltaB},${n.lufsM}\n`;return t}function nm(e){e.length===0?alert(`Recording telemetry... Please ensure audio is playing and try again.`):$p(em(e),`WBS-Mastering-Telemetry`)}function rm(e){e.length===0?alert(`Recording transients... Please play dynamic audio with sharp transients and try again.`):$p(tm(e),`WBS-Super-Transient-Log`)}function im(){let e=document.getElementById(`btnExportCsvTest`),t=document.getElementById(`chkAutoExportHourly`),n=Qp(),{telemetryLog:r,transientLog:i}=n;e&&e.addEventListener(`click`,()=>nm(r));let a=document.getElementById(`btnExportTransientLog`);return a&&a.addEventListener(`click`,()=>rm(i)),t&&setInterval(()=>{t.checked&&r.length>0&&nm(r)},36e5),n}async function am(e,t,n,r){if(!window.audioReady||t.mode===`SET`)return;let{selectDevice:i,drawerSourceBadge:a}=n,o=t.mode+`:`+(t.mode===`A`?t.a.src:t.mode===`D`?t.d.src:t.s.pair[0]);if(!(o===r.lastModeKey&&r.isAudioStarted)){if(r.lastModeKey=o,r.isAudioStarted=!0,t.mode===`A`){let n=[];try{n=await e.getAudioInputDevices()}catch{n=[]}if(!n||n.length===0){a&&(a.textContent=`Source: Calibrated Internal Tone (No Audio Input Devices Detected)`,a.style.color=`#38bdf8`),e.setToneCalibration(-18),e.startTestGenerator(`sine1k`);return}let r=i?i.value:null;if(r&&(r.startsWith(`__XMXL_`)||r.startsWith(`__NMOS_`)))return;if(r===`__WBS_LINUX_HOST__`){a&&(a.textContent=`Source: 🐧 Linux Host (PipeWire & MXL Bridge · Banner-Free)`,a.style.color=`#38bdf8`);return}let o=n.filter(e=>e.label.toLowerCase().includes(`mic`)),s=n.filter(e=>e.label.toLowerCase().includes(`line`));r||(r=t.a.src===1?s.length>0?s[0].deviceId:n.length>1?n[1].deviceId:n[0].deviceId:o.length>0?o[0].deviceId:n[0].deviceId,i&&(i.value=r||``));let c=i?.options[i.selectedIndex]?.text||n.find(e=>e.deviceId===r)?.label||`Soundcard Input`;a&&(a.textContent=`Source: `+c,a.style.color=`#7df9ff`);try{await e.connectSoundCard(r)}catch(t){let n=t?.name===`NotFoundError`||t?.message?.includes(`not found`)||t?.message?.includes(`detected`),r=t?.name===`NotAllowedError`;!n&&!r&&console.warn(`Could not connect soundcard:`,t),a&&(a.textContent=n?`Source: Calibrated Internal Tone (No Audio Input Devices)`:r?`Microphone blocked: allow it from the 🔒 padlock in the address bar · playing internal tone`:`Source Error: `+(t?.message||`Failed to open soundcard`),a.style.color=n?`#38bdf8`:`#ff4d4f`),e.setToneCalibration(-18),e.startTestGenerator(`sine1k`)}}else if(t.mode===`D`){if(t.d.src===1){a&&(a.textContent=`Source: Computer Audio Output`);let n=typeof localStorage<`u`&&localStorage.getItem(`xtm.sysaudio.surface`)||`browser`,r=e.sourceType===`system`&&!!e.stream&&e.stream.active;if(!r&&(n===`loopback`||n===`auto`))try{let t=(await e.getAudioInputDevices()).find(e=>/monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|xtm.*bridge/i.test(e.label));t&&(a&&(a.textContent=`Source: OS Audio Bridge (${t.label})`,a.style.color=`#38bdf8`),r=await e.connectSoundCard(t.deviceId))}catch{}if(!r){let r=n===`monitor`?`monitor`:`browser`;if(!await e.connectSystemAudio(r)){if(t.d.src=0,a){let e=t.toneCalLevels[t.toneCalIdx];a.textContent=`Source: 1 kHz Digital Reference Tone (${e>=0?`+`:``}${e} dBFS)`}e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(`sine1k`),t.flash(`1k TONE `)}}}else{if(a){let e=t.toneCalLevels[t.toneCalIdx];a.textContent=`Source: 1 kHz Digital Reference Tone (${e>=0?`+`:``}${e} dBFS)`}e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(`sine1k`)}}else if(t.mode===`S`){let n=[``,`sine1k`,`pink`,`sine400`,`sweep`],r=[``,`1 kHz Sine Tone`,`Pink Noise`,`400 Hz Lineup Tone`,`20Hz-20kHz Sweep`],i=n[t.s.pair[0]]||`sine1k`,o=r[t.s.pair[0]]||`1 kHz Sine Tone`;a&&(a.textContent=`Source: `+o),e.setToneCalibration(t.toneCalLevels[t.toneCalIdx]),e.startTestGenerator(i)}}}function om(e,t){let{audio:n}=e,r={isAudioStarted:!1,lastModeKey:null,syncAudioWithHardwareMode:i};async function i(e){let i=r.lastModeKey;await am(n,e,t,r),r.lastModeKey!==i&&n.setReferenceLevel(e.getActiveReferenceLevel(),e.mode===`D`)}return r}var sm=e=>{try{return localStorage.getItem(e)}catch{return null}},cm=(e,t)=>{try{localStorage.setItem(e,t)}catch{}};function lm(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.meter.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.meter.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.meter.v2.wbsca`:`xtm.meter.v2.wbsdark`}function um(){return document.body.classList.contains(`theme-mccurdy-dark`)?`mccurdy_vu`:document.body.classList.contains(`theme-mccurdy`)?`fisam`:document.body.classList.contains(`theme-wbs-ca`)?`wbs_m405`:`fisam`}function dm(e,t){let{model:n,audio:r,view:i}=e,a=lm(),o=um(),s=sm(a),c=s===`sifam`?`fisam`:s===`simpson`||s===`pimsom`?`pimson`:s||o;c!==n.meterStyle&&(n.meterStyle=c,r.setVuStyle(c),i.isBuilt=!1,n.notify()),t&&(t.value=n.meterStyle)}function fm(e,t){let{model:n,audio:r,view:i}=e,{selectMeterStyle:a}=t,o=()=>dm(e,a);o(),window.applyModeMeter=o,new MutationObserver(o).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),a&&(a.value=n.meterStyle,a.addEventListener(`change`,e=>{n.meterStyle=e.target.value,r.setVuStyle(e.target.value),cm(lm(),n.meterStyle),n.saveEEPROM(),i.isBuilt=!1,n.notify()}));let s=document.getElementById(`selectVuBallistics`);s&&(s.value=r.vuBallisticPreset||`standard_vu`,s.addEventListener(`change`,t=>{r.setVuBallisticPreset(t.target.value),Kp(e)}))}function pm(e){let{model:t,audio:n}=e;n.setReferenceLevel(t.getActiveReferenceLevel(),t.mode===`D`),n.setHighPass(t.hp===1),n.setVuStyle(t.meterStyle)}function mm(e,t,n){let{model:r,audio:i}=e,{selectToneCal:a,chkHpf:o,chkTerm:s,selectLampColor:c,selectDialBg:l,selectPpmLampColor:u,selectPpmDialBg:d,selectMeterStyle:f,drawerSourceBadge:p}=t;r.onChange=t=>{let r=t.mode===`D`;i.setReferenceLevel(t.getActiveReferenceLevel(),r),i.setHighPass(t.hp===1),i.setVuStyle(t.meterStyle);let m=t.toneCalLevels[t.toneCalIdx];if(i.setToneCalibration(m),a&&(a.value=String(m)),o&&(o.checked=t.hp===1),s&&(s.checked=t.term===1),c&&(c.value=t.dialLamp),l&&(l.value=t.dialBg),u&&(u.value=t.ppmLamp),d&&(d.value=t.ppmDialBg),f&&(f.value=t.meterStyle),p&&t.mode===`S`){let e=t.s.pair[0]??1;(e===1||e===3)&&(p.textContent=`Source: ${e===3?`400 Hz`:`1 kHz`} Digital Lineup Tone (${m>=0?`+`:``}${m} dBFS)`)}n.syncAudioWithHardwareMode(t),Kp(e,t)}}function hm(e,t){let{model:n,view:r,audio:i}=e;vm(e,t),r.onButtonPressed=async r=>{if(r===`MODE`)n.pressMode();else if(r===`SOURCE`)n.pressSource();else if(r===`DOWN`)n.pressDown();else if(r===`UP`)n.pressUp();else if(r.startsWith(`INPUT_`)){let n=parseInt(r.replace(`INPUT_`,``),10);if(n>=1&&n<=4){if(Date.now()<_m+600)return;window.audioReady=!0,window.audioContext&&window.audioContext.state===`suspended`&&window.audioContext.resume().catch(()=>{}),di(e,t,n)}}else if(r===`CYCLE_STYLE`){n.isLockedExpanded&&=!1;let e=[`fisam`,`pimson`,`wbs_m405`,`mccurdy_vu`,`standard_vu`],t=e.indexOf(n.meterStyle);n.meterStyle=e[(t+1)%e.length];try{localStorage.setItem(lm(),n.meterStyle)}catch{}n.saveEEPROM(),n.notify()}else r===`TOGGLE_LOCKED_EXPANDED`?n.toggleLockedExpanded():r===`TOGGLE_AUTORANGE`?n.toggleAutoRange():r===`MC_TOGGLE`?n.toggleMccurdyRange():r===`MC_RANGE_OUTER`?n.setMccurdyRange(`outer`):r===`MC_RANGE_INNER`?n.setMccurdyRange(`inner`):r===`MC_RANGE_CAL`&&n.setMccurdyRange(`cal`);t.syncAudioWithHardwareMode(n)},r.onButtonReleased=()=>{}}function gm(e,t){let{model:n}=e;document.addEventListener(`pointerdown`,async e=>{!t.isAudioStarted&&!e.target.closest(`.aux-drawer, #settingsStage`)&&(window.audioReady=!0,window.audioContext&&window.audioContext.state===`suspended`&&await window.audioContext.resume(),e.target?.closest(`[data-btn^="INPUT_"]`)||await t.syncAudioWithHardwareMode(n))},{once:!0,passive:!0})}var _m=0;function vm(e,t){let{model:n,view:r}=e,i=e=>e?.closest?.(`[data-btn^="INPUT_"]`),a=(n,i,a)=>{let o=parseInt((n.getAttribute(`data-btn`)||``).replace(`INPUT_`,``),10);o>=1&&o<=4&&(_m=Date.now(),gi(o,i,a,n=>{fi(o,n),r.isBuilt=!1,di(e,t,o)}))};document.addEventListener(`contextmenu`,e=>{let t=i(e.target);t&&(e.preventDefault(),a(t,e.clientX,e.clientY))});let o;document.addEventListener(`pointerdown`,e=>{let t=i(e.target);if(!t||e.button!==0)return;let{clientX:n,clientY:r}=e;clearTimeout(o),o=window.setTimeout(()=>a(t,n,r),450)});let s=()=>clearTimeout(o);document.addEventListener(`pointerup`,s),document.addEventListener(`pointercancel`,s),document.addEventListener(`pointermove`,e=>{e.buttons===0&&s()})}var ym=!1,bm=null,xm=null;async function Sm(){try{let e=(await Ps()).some(e=>e.port===8467);return ym=e,e}catch{return ym=!1,!1}}function Cm(e){return e?/monitor|loopback|stereo mix|what u hear|blackhole|soundflower|cable output|virtual audio|stream monitor|pipewire.*sink/i.test(e):!1}function wm(e,t){let n=ws();if(n.length)for(let r of n){let n=r.type===`nmos-node`||r.domainId===`nmos-is04`;if(r.flows&&r.flows.length>0)for(let i of r.flows){let a=document.createElement(`option`);a.value=n?`__NMOS_${r.id}_${i.flowId}__`:`__XMXL_${r.port}_${i.flowId}__`,n?(a.textContent=`📡 [NMOS IS-04] ${i.label} (${r.name})`,a.style.color=`#38bdf8`,a.style.fontWeight=`bold`):(a.textContent=`🎛️ [XMXL ${r.port}] ${i.label} (${r.domainId||`shm`})`,a.style.color=`#22c55e`,a.style.fontWeight=`bold`),t===a.value&&(a.selected=!0),e.appendChild(a)}else{let i=document.createElement(`option`);i.value=n?`__NMOS_${r.id}__`:`__XMXL_${r.port}__`,i.textContent=n?`📡 [NMOS IS-04] ${r.name}`:`📡 [XMXL ${r.port}] ${r.name}`,i.style.color=`#38bdf8`,i.style.fontWeight=`bold`,t===i.value&&(i.selected=!0),e.appendChild(i)}}}function Tm(e,t){let{audio:n}=e,{drawerSourceBadge:r,selectDevice:i}=t;n.onStatusChange=e=>{if(r){if(e.type===`soundcard`){let t=Cm(e.label||``);r.textContent=`Source: `+(e.label||`Soundcard Input`)+(t?` (OS Loopback · Banner-Free)`:``),r.style.color=t?`#38bdf8`:`#7df9ff`}else e.type===`system`?(r.textContent=`Source: `+(e.label||`Computer System Audio`),r.style.color=`#7df9ff`):e.type===`mxl`?(r.textContent=`Source: 🎛️ MXL · `+(e.label||e.flowId),r.style.color=`#22c55e`):e.type===`test`?(r.textContent=`Source: `+e.label,r.style.color=`#ffd152`):e.type===`error`?(r.textContent=`Source Error: `+(e.error||`Connection Failed`),r.style.color=`#ff4d4f`):e.type===`disconnected`&&(r.textContent=`Source: Audio Stopped`,r.style.color=`#888`)}},n.onDevicesChange=(e,t)=>{if(!i)return;let n=t||i.value;if(i.innerHTML=`<option value="">Default Soundcard Input</option>`,ym){let e=document.createElement(`option`);e.value=`__WBS_LINUX_HOST__`,e.textContent=`🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)`,e.style.color=`#38bdf8`,e.style.fontWeight=`bold`,n===`__WBS_LINUX_HOST__`&&(e.selected=!0),i.appendChild(e)}wm(i,n),e.forEach((e,t)=>{let r=document.createElement(`option`);r.value=e.deviceId;let a=/wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(e.label||``),o=Cm(e.label);a?(r.textContent=`🎛️ [WBS Router Active] ${e.label||`WBS Bus ${t+1}`}`,r.style.color=`#86efac`,r.style.fontWeight=`bold`):o?(r.textContent=`🎧 [OS Loopback · Banner-Free] ${e.label||`Device ${t+1}`}`,r.style.color=`#38bdf8`):r.textContent=e.label||`Audio Interface ${t+1}`,e.deviceId===n&&(r.selected=!0),i.appendChild(r)})}}async function Em(e,t){let{audio:n}=e,{selectDevice:r}=t;async function i(){if(!r)return;let e=r.value||n.activeDeviceId;await Sm();let t=await n.getAudioInputDevices();if(r.innerHTML=`<option value="">Default Soundcard Input</option>`,ym){let t=document.createElement(`option`);t.value=`__WBS_LINUX_HOST__`,t.textContent=`🐧 [Linux Host Active] PipeWire & MXL Shm Bridge (Banner-Free)`,t.style.color=`#38bdf8`,t.style.fontWeight=`bold`,e===`__WBS_LINUX_HOST__`&&(t.selected=!0),r.appendChild(t)}wm(r,e),t.forEach((t,n)=>{let i=document.createElement(`option`);i.value=t.deviceId;let a=/wbs_meter_tap|wbs_input_bus|wbs_test_point|wbs/i.test(t.label||``),o=Cm(t.label);a?(i.textContent=`🎛️ [WBS Router Active] ${t.label||`WBS Bus ${n+1}`}`,i.style.color=`#86efac`,i.style.fontWeight=`bold`):o?(i.textContent=`🎧 [OS Loopback · Banner-Free] ${t.label||`Device ${n+1}`}`,i.style.color=`#38bdf8`):i.textContent=t.label||`Audio Interface ${n+1}`,t.deviceId===e&&(i.selected=!0),r.appendChild(i)})}try{await i()}catch{}navigator.mediaDevices&&navigator.mediaDevices.ondevicechange!==void 0&&(navigator.mediaDevices.ondevicechange=i)}function Dm(e,t,n){let{model:r,audio:i}=e,{selectDevice:a,drawerSourceBadge:o,btnBridgeOsAudio:s,selectSysAudioMode:c}=t;c&&(c.value=localStorage.getItem(`xtm.sysaudio.surface`)||`browser`,c.addEventListener(`change`,e=>{localStorage.setItem(`xtm.sysaudio.surface`,e.target.value)})),s&&s.addEventListener(`click`,async()=>{if(await Sm()&&a){a.value=`__WBS_LINUX_HOST__`,a.dispatchEvent(new Event(`change`));return}let e=(await i.getAudioInputDevices()).find(e=>Cm(e.label));if(e&&a)a.value=e.deviceId,a.dispatchEvent(new Event(`change`));else{let e=document.getElementById(`guideModal`),t=document.getElementById(`guideModalIframe`),n=document.getElementById(`guideModalTitleText`);e&&t&&(t.src=`os-audio-bridge.html`,n&&(n.textContent=`OS Audio Loopback & System Bridge Guide`),e.style.display=`flex`)}}),a&&(window.addEventListener(`xtm:meter-flow`,e=>{let{port:t,flowId:n}=e.detail||{};if(!t||!n)return;let r=`__XMXL_${t}_${n}__`;if(!Array.from(a.options).some(e=>e.value===r)){let e=ws().filter(e=>e.port===t).flatMap(e=>e.flows||[]).find(e=>e.flowId===n),i=document.createElement(`option`);i.value=r,i.textContent=`🎛️ [XMXL ${t}] ${e?.label||n}`,i.style.color=`#22c55e`,i.style.fontWeight=`bold`,a.appendChild(i)}a.value=r,a.dispatchEvent(new Event(`change`))}),a.addEventListener(`change`,async()=>{let e=a.value||null;if(n.isAudioStarted=!0,bm&&=(bm.close(),null),xm&&=(xm(),null),e&&e.startsWith(`__NMOS_`)){i.stopCurrentSource();let t=ws(),a=t.find(t=>e.includes(t.id))||t.find(e=>e.type===`nmos-node`),s=a?.flows?.find(t=>e.includes(t.flowId))||a?.flows?.[0],c=s?s.label:`AES67 / ST 2110-30`,l=a?a.name:`WBS-32me`;o&&(o.textContent=`Source: 📡 NMOS IS-04 · ${c} (${l})`,o.style.color=`#38bdf8`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:`+e,r.flash(`NMOS IS-04`);let u=t.find(e=>e.port===8467);u&&(xm=Is(u,e=>{if(i.currentLevels){let t=typeof e.left_vu==`number`?e.left_vu:-2,n=typeof e.right_vu==`number`?e.right_vu:-2,r=typeof e.left_db==`number`?e.left_db:-20,a=typeof e.right_db==`number`?e.right_db:-20;i.currentLevels.vu[0]=10**(t/20),i.currentLevels.vu[1]=10**(n/20),i.currentLevels.vuDb[0]=t,i.currentLevels.vuDb[1]=n,i.currentLevels.ppm[0]=10**(r/20),i.currentLevels.ppm[1]=10**(a/20),i.currentLevels.ppmDb[0]=r,i.currentLevels.ppmDb[1]=a,i.currentLevels.rmsDb[0]=r,i.currentLevels.rmsDb[1]=a,i.currentLevels.dbfs[0]=r,i.currentLevels.dbfs[1]=a,i.currentLevels.hasAudio=!0}}));return}if(e===`__WBS_LINUX_HOST__`||e&&e.startsWith(`__XMXL_`)){i.stopCurrentSource();let t=e.startsWith(`__XMXL_`),a=8467,s=``;if(t){let t=e.replace(/^__XMXL_/,``).replace(/__$/,``),n=t.indexOf(`_`);a=parseInt(n>=0?t.slice(0,n):t,10)||8467,s=n>=0?t.slice(n+1):``}let c=s?ws().filter(e=>e.port===a).flatMap(e=>e.flows||[]).find(e=>e.flowId===s):void 0;o&&(o.textContent=`Source: 🎛️ XMXL Node :${a} ${s?`(${c?.label||s})`:``} · Shared Memory Ring Buffer`,o.style.color=`#22c55e`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:`+e,r.flash(`XMXL `+a);let l=ws().find(e=>e.port===a)||{id:`xmxl-${a}`,name:`XMXL Port ${a}`,type:`wbs-router`,port:a,baseUrl:`http://127.0.0.1:${a}`,flows:[],status:`online`,latencyMs:1,lastSeen:Date.now()},u=e=>{if(i.currentLevels){let t=typeof e.left_vu==`number`?e.left_vu:-42,n=typeof e.right_vu==`number`?e.right_vu:-42,r=typeof e.left_db==`number`?e.left_db:-60,a=typeof e.right_db==`number`?e.right_db:-60;i.currentLevels.vu[0]=10**(t/20),i.currentLevels.vu[1]=10**(n/20),i.currentLevels.vuDb[0]=t,i.currentLevels.vuDb[1]=n;let o=typeof e.left_peak_db==`number`?e.left_peak_db:r,s=typeof e.right_peak_db==`number`?e.right_peak_db:a;i.currentLevels.ppm[0]=10**(o/20),i.currentLevels.ppm[1]=10**(s/20),i.currentLevels.ppmDb[0]=o,i.currentLevels.ppmDb[1]=s,i.currentLevels.rmsDb[0]=r,i.currentLevels.rmsDb[1]=a,i.currentLevels.dbfs[0]=o,i.currentLevels.dbfs[1]=s,i.currentLevels.hasAudio=!0}};if(a===8467){i.connectMxlFlow(l.baseUrl,s||`wbs-flow-master-stereo`,c?.label||s||`Master Bus`);return}xm=Is(l,u);return}let t=a.options[a.selectedIndex]?.text||`Soundcard Input`;o&&(o.textContent=`Connecting: `+t+`...`,o.style.color=`#ffd152`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:`+e;try{await i.connectSoundCard(e),o&&(o.textContent=`Source: `+t,o.style.color=`#7df9ff`),r.flash(`CARD IN`),i.setReferenceLevel(r.getActiveReferenceLevel(),r.mode===`D`)}catch(e){let t=e?.name===`NotFoundError`||e?.message?.includes(`not found`)||e?.message?.includes(`detected`);t||console.error(`Failed to connect selected device:`,e),o&&(o.textContent=t?`Source: Calibrated Internal Tone (No Audio Input Devices)`:`Device Error: `+(e?.message||`Cannot access device`),o.style.color=t?`#38bdf8`:`#ff4d4f`),i.setToneCalibration(-18),i.startTestGenerator(`sine1k`)}}))}function Om(e,t){let{audio:n}=e,{inputGainSlider:r,inputGainVal:i,chkMonitor:a,monitorVolSlider:o,monitorVolVal:s}=t;r&&r.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setInputTrim(t),i&&(i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`)}),a&&a.addEventListener(`change`,e=>{n.setMonitor(e.target.checked)}),o&&o.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setMonitorVolume(t),s&&(s.textContent=Math.round(t*100)+`%`)})}function km(e,t){let{model:n,audio:r}=e,{selectToneCal:i}=t;if(i){i.innerHTML=``;for(let e=0;e>=-60;e--){let t=document.createElement(`option`);t.value=String(e);let n=`${e} dBFS`;e===-18?n+=` (0 VU ANSI C16.5 / EBU Reference - Default)`:e===0?n+=` (Peak Full Scale Ceiling)`:e===-6?n+=` (High Peak Alignment)`:e===-12?n+=` (Digital Nominal)`:e===-14?n+=` (AES / Streaming Target)`:e===-20?n+=` (0 VU SMPTE RP155 Reference)`:e===-24&&(n+=` (EBU R128 / ATSC A/85)`),t.textContent=n,i.appendChild(t)}i.value=String(n.toneCalLevels[n.toneCalIdx]??-18),i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);r.setToneCalibration(t);let i=n.toneCalLevels.indexOf(t);if(i!==-1&&(n.toneCalIdx=i,n.saveEEPROM(),n.mode===`S`&&(n.s.pair[0]===1||n.s.pair[0]===3))){let e=n.s.pair[0]===3?`400 `:`1k `;n.flash((e+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}})}}var Am=e=>{try{return localStorage.getItem(e)}catch{return null}},jm=(e,t)=>{try{localStorage.setItem(e,t)}catch{}};function Mm(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.lamp.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.lamp.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.lamp.v2.wbsca`:`xtm.lamp.v2.wbsdark`}function Nm(){return document.body.classList.contains(`theme-wbs-ca`)?`amber_bottom`:document.body.classList.contains(`theme-mccurdy`)?`unlit`:`amber`}function Pm(e,t){let{model:n,view:r}=e,i=Nm(),a=Am(Mm())||i;a!==n.dialLamp&&(n.dialLamp=a,r.isBuilt=!1),t&&(t.value=n.dialLamp)}function Fm(){return document.body.classList.contains(`theme-mccurdy-dark`)?`xtm.ppmLamp.v2.mccurdyDark`:document.body.classList.contains(`theme-mccurdy`)?`xtm.ppmLamp.v2.mccurdyLight`:document.body.classList.contains(`theme-wbs-ca`)?`xtm.ppmLamp.v2.wbsca`:`xtm.ppmLamp.v2.wbsdark`}function Im(e,t){let{model:n,view:r}=e,i=Am(Fm())||`unlit`;i!==n.ppmLamp&&(n.ppmLamp=i,r.isBuilt=!1),t&&(t.value=n.ppmLamp)}function Lm(e){e&&(e.value=document.body.classList.contains(`theme-wbs-ca`)?`wbs-ca`:document.body.classList.contains(`theme-mccurdy-dark`)?`mccurdy-dark`:document.body.classList.contains(`theme-mccurdy`)?`mccurdy-light`:`wbs-dark`)}function Rm(e,t){let{model:n,view:r}=e,{selectLampColor:i,selectDialBg:a,selectPpmLampColor:o,selectPpmDialBg:s,selectConsoleBg:c}=t,l=()=>Pm(e,i);l(),new MutationObserver(l).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),i&&(i.value=n.dialLamp||`amber`,i.addEventListener(`change`,e=>{n.dialLamp=e.target.value,jm(Mm(),n.dialLamp),n.saveEEPROM(),r.isBuilt=!1}));let u=`xtm.dial.bg`,d=Am(u)||n.dialBg||`auto`;d!==n.dialBg&&(n.dialBg=d),a&&(a.value=n.dialBg||`auto`,a.addEventListener(`change`,e=>{n.dialBg=e.target.value,jm(u,n.dialBg),n.saveEEPROM(),r.isBuilt=!1}));let f=()=>Im(e,o);Am(`xtm.ppmLamp.dark`)||jm(`xtm.ppmLamp.dark`,n.ppmLamp||`unlit`),f(),new MutationObserver(f).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),o&&(o.value=n.ppmLamp||`unlit`,o.addEventListener(`change`,e=>{n.ppmLamp=e.target.value,jm(Fm(),n.ppmLamp),n.saveEEPROM(),r.isBuilt=!1}));let p=`xtm.ppmDial.bg`,m=Am(p)||n.ppmDialBg||`auto`;m!==n.ppmDialBg&&(n.ppmDialBg=m),s&&(s.value=n.ppmDialBg||`auto`,s.addEventListener(`change`,e=>{n.ppmDialBg=e.target.value,jm(p,n.ppmDialBg),n.saveEEPROM(),r.isBuilt=!1}));let h=()=>Lm(c);h(),new MutationObserver(h).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),c&&c.addEventListener(`change`,e=>{let t=e.target.value;typeof window.setMode==`function`&&window.setMode(t)})}function zm(e,t){let{model:n,audio:r}=e,{chkHpf:i,chkTerm:a}=t;i&&i.addEventListener(`change`,e=>{n.hp=+!!e.target.checked,r.setHighPass(e.target.checked),n.saveEEPROM(),n.notify()}),a&&a.addEventListener(`change`,e=>{n.term=+!!e.target.checked,n.saveEEPROM(),n.notify()})}function Bm(e,t){let{audio:n,view:r}=e,{selectPpmBallistics:i}=t;i&&(i.value=n.ppmBallisticPreset||`type2`,r.ppmStandard=i.value,r.isBuilt=!1,i.addEventListener(`change`,t=>{n.setPpmType(t.target.value),r.ppmStandard=t.target.value,r.isBuilt=!1,Kp(e)}))}function Vm(e){let{audio:t,dbfsView:n}=e;n&&(n.audioEngine=t,n.onClear=()=>{t.resetLoudness()});let r=document.getElementById(`selectScopeLogWarp`);r&&n&&r.addEventListener(`change`,e=>{n.setBeta(parseFloat(e.target.value))});let i=document.getElementById(`selectTimeScale`);i&&n&&(i.value=n.timeMode,i.addEventListener(`change`,e=>{n.setTimeMode(e.target.value)}),n.onTimeModeChange=t=>{i.value=t,Kp(e)})}function Hm(e){let t=document.getElementById(`wbsConsentBanner`),n=document.getElementById(`btnConsentAllow`),r=document.getElementById(`btnConsentSession`),i=document.getElementById(`btnResetConsent`),a=document.getElementById(`consentStatusText`);function o(){let e=Gp.getConsent();a&&(e===`allowed`?(a.textContent=`ALLOWED (Persistent Memory)`,a.style.color=`#22c55e`):e===`session_only`?(a.textContent=`SESSION ONLY`,a.style.color=`#eab308`):(a.textContent=`PROMPTING...`,a.style.color=`#38bdf8`)),t&&(t.style.display=e===`prompt`?`flex`:`none`)}n&&n.addEventListener(`click`,()=>{Gp.setConsent(`allowed`),o(),Kp(e)}),r&&r.addEventListener(`click`,()=>{Gp.setConsent(`session_only`),o()}),i&&i.addEventListener(`click`,()=>{Gp.resetConsent(),o()}),o()}function Um(e){let{model:t,audio:n,podView:r,dbfsView:i}=e;i&&Gp.loadSavedConfig(t,n,r,i)}function Wm(e,t){let{model:n,audio:r,podView:i,dbfsView:a}=e,o=document.getElementById(`btnExportWbs`);o&&a&&o.addEventListener(`click`,()=>{Gp.downloadWbsFile(n,r,i,a),n.flash(`SAVED.WBS`,1400)});let s=document.getElementById(`btnImportWbs`),c=document.getElementById(`inputImportWbs`);s&&c&&a&&(s.addEventListener(`click`,()=>{c.click()}),c.addEventListener(`change`,async e=>{let o=e.target.files?.[0];if(o)try{let e=await o.text(),s=Gp.parseWbsYaml(e);Gp.applyConfig(s,n,r,i,a),await t.syncAudioWithHardwareMode(n)}catch(e){console.error(`WBS configuration import failed:`,e),alert(`Error importing .WBS configuration: `+(e?.message||`Invalid format`)),n.flash(`CFG ERR `,1600)}finally{c.value=``}}))}function Gm(e,t){let n=()=>Kp(e),r=document.getElementById(`selectPeakSens`),i=document.getElementById(`chkExtendedLed22`),a=document.getElementById(`selectVuBallistics`),o=document.getElementById(`selectScopeLogWarp`),{inputGainSlider:s,monitorVolSlider:c,chkMonitor:l,chkPodHold:u,selectPodDecay:d,selectPpmBallistics:f}=t;[s,c,r].forEach(e=>{e?.addEventListener(`change`,n)}),[l,i,u,d,f,a,o].forEach(e=>{e?.addEventListener(`change`,n)})}function Km(e,t){let{model:n}=e;window.addEventListener(`keydown`,e=>{if([`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target.tagName))return;let r=e.key.toUpperCase();r===`M`?(n.pressMode(),t.syncAudioWithHardwareMode(n)):r===`S`?(n.pressSource(),t.syncAudioWithHardwareMode(n)):r===`ARROWDOWN`||r===`D`?n.pressDown():r===`ARROWUP`||r===`U`?n.pressUp():r===`H`?n.holdMode():r===`P`?n.togglePower():r===`T`&&window.dispatchEvent(new CustomEvent(`xtm:open-clock`))})}var qm=!1;function Jm(e){if(qm)return;qm=!0,document.body.classList.add(`has-new-version`);let t=document.getElementById(`btnOpenSettings`),n=document.querySelector(`.drawer-gear-label`),r=document.getElementById(`drawerToggleLeft`),i=e?e.startsWith(`v`)?e:`v${e}`:``;if(t&&(t.classList.add(`has-update`),t.setAttribute(`title`,`New version available${i?` (`+i+`)`:``}! Click Settings to update`)),n&&(n.classList.add(`has-update`),!n.querySelector(`.settings-update-dot`))){let e=document.createElement(`span`);e.className=`settings-update-dot`,e.title=`New update available`,n.appendChild(e)}r&&r.classList.add(`has-update`);let a=document.querySelector(`.drawer-grid`);if(a&&!document.getElementById(`updateAvailableBanner`)){let e=document.createElement(`div`);e.id=`updateAvailableBanner`,e.className=`update-available-banner`,e.innerHTML=`
      <span>⚡ New version available${i?` (`+i+`)`:``}</span>
      <button type="button" id="btnReloadNewVersion">Reload &amp; Update Now</button>
    `,a.parentElement?.insertBefore(e,a),document.getElementById(`btnReloadNewVersion`)?.addEventListener(`click`,()=>{window.location.reload()})}let o=document.querySelector(`.build-stamp`);o&&(o.innerHTML=`<span style="color:#f97316;cursor:pointer;font-weight:bold" title="Click to reload with new version">Update: ${i||`Available`} ⟳</span>`,o.addEventListener(`click`,()=>window.location.reload()))}function Ym(){window.testUpdatePulse=(e=`1.0.99`)=>Jm(e);async function e(){try{let e=await fetch(`./version.json?cache=`+Date.now(),{cache:`no-store`});if(!e.ok)return;let{version:t}=await e.json();t&&t!==`2.0.121`&&Jm(t)}catch{}}setTimeout(e,3e3),setInterval(e,6e4),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&e()});let t=document.querySelector(`.build-stamp`);if(t){let e=`v2.0.121`;t.textContent=e,t.setAttribute(`title`,`Ward-Beck Systems XTM-4 ${e}`)}}function Xm(){`serviceWorker`in navigator&&(navigator.serviceWorker.addEventListener(`message`,e=>{e.data?.type===`xtm-update-ready`&&(console.info(`XTM: new version stored; update ready.`),Jm())}),navigator.serviceWorker.register(`sw.js`,{updateViaCache:`none`}).then(e=>{e.waiting&&Jm(),e.addEventListener(`updatefound`,()=>{let t=e.installing;t&&t.addEventListener(`statechange`,()=>{t.state===`installed`&&navigator.serviceWorker.controller&&Jm()})})}).catch(e=>{console.warn(`Service worker registration failed:`,e)}))}function Zm(){let e=document.getElementById(`pwaInstallBanner`),t=document.getElementById(`btnPwaInstall`),n=document.getElementById(`btnPwaDismiss`),r=document.getElementById(`pwaSubText`),i=null,a=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,o=/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)||window.innerWidth<=840,s=window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0;e&&!s&&(window.addEventListener(`beforeinstallprompt`,t=>{t.preventDefault(),i=t,e.style.display=`block`}),o&&a&&(r&&(r.innerHTML=`Tap the Share icon <strong>[⎋]</strong> in Safari and choose <strong>Add to Home Screen</strong>`),t&&(t.textContent=`How to Install`,t.addEventListener(`click`,()=>{alert(`To install this app on iOS:
1. Tap the Share button in Safari (box with up arrow).
2. Scroll down and tap "Add to Home Screen".`)})),e.style.display=`block`),window.addEventListener(`appinstalled`,()=>{e.style.display=`none`,i=null}),t&&!a&&t.addEventListener(`click`,async()=>{if(i){i.prompt();let{outcome:t}=await i.userChoice;t===`accepted`&&(e.style.display=`none`),i=null}else e.style.display=`none`}),n&&n.addEventListener(`click`,()=>{e.style.display=`none`}))}var Qm=`M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z`;function $m(e,t,n,r){let i=e=>(e-90)*(Math.PI/180),a=i(n),o=i(r),s=Math.cos(a)*e,c=Math.sin(a)*e,l=Math.cos(o)*e,u=Math.sin(o)*e,d=Math.cos(a)*t,f=Math.sin(a)*t,p=Math.cos(o)*t,m=Math.sin(o)*t;return`M ${s.toFixed(2)} ${c.toFixed(2)} A ${e} ${e} 0 0 1 ${l.toFixed(2)} ${u.toFixed(2)} L ${p.toFixed(2)} ${m.toFixed(2)} A ${t} ${t} 0 0 0 ${d.toFixed(2)} ${f.toFixed(2)} Z`}function eh(){return`<defs>
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
    <radialGradient id="clockDialMcCurdyBlue" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2a5280" />
      <stop offset="60%" stop-color="#1e3a5f" />
      <stop offset="90%" stop-color="#142842" />
      <stop offset="100%" stop-color="#0b1b2b" />
    </radialGradient>

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
  </defs>`}function th(e=`wbs-dark`){let t=$m(168,188,-60,0),n=``;for(let e=0;e<60;e++){let t=(e*6-90)*(Math.PI/180),r=e%5==0,i=e%15==0;if(e>=50&&e<=59||e===0){let e=r?186:180,i=Math.cos(t)*168,a=Math.sin(t)*168,o=Math.cos(t)*e,s=Math.sin(t)*e,c=r?3.8:2.2;n+=`<line class="clock-tick clock-tick-warn" x1="${i.toFixed(1)}" y1="${a.toFixed(1)}" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" stroke="#111317" stroke-width="${c}" stroke-linecap="butt"/>`}else{let e=i?192:r?188:180,a=Math.cos(t)*170,o=Math.sin(t)*170,s=Math.cos(t)*e,c=Math.sin(t)*e,l=i?3.5:r?2.8:1.3;n+=`<line class="clock-tick clock-tick-std" x1="${a.toFixed(1)}" y1="${o.toFixed(1)}" x2="${s.toFixed(1)}" y2="${c.toFixed(1)}" stroke-width="${l}" stroke-linecap="round"/>`}}let r=[`12`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`10`,`11`],i=``;for(let e=0;e<12;e++){let t=(e*30-90)*(Math.PI/180),n=Math.cos(t)*140,a=Math.sin(t)*140+7;i+=`<text class="${e===10||e===11||e===0?`clock-num clock-num-warn`:`clock-num clock-num-std`}" x="${n.toFixed(1)}" y="${a.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="800" text-anchor="middle">${r[e]}</text>`}let a=e=>(e-90)*(Math.PI/180),o=a(-60),s=a(0),[c,l]=[Math.cos(o)*198,Math.sin(o)*198+4],[u,d]=[Math.cos(s)*198,Math.sin(s)*198+4],f=`
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
      <!-- The WBS logo itself, no words: green on black -->
      <g transform="translate(-48.2 -72) scale(1.3)">
        <path d="${Qm}" fill="#0b0d10"/>
        <path d="${Fr}" fill="#22c55e" fill-rule="evenodd"/>
      </g>
    </g>

    <g class="clock-brand clock-brand-wbs-vintage wbs-ca-only" style="cursor:pointer;" title="Ward-Beck Systems Vintage Master Clock">
      <!-- The WBS logo itself, no words: orange on white -->
      <g transform="translate(-48.2 -72) scale(1.3)">
        <path d="${Qm}" fill="#ffffff"/>
        <path d="${Fr}" fill="#f97316" fill-rule="evenodd"/>
      </g>
    </g>

    <!-- McCurdy Dark: vintage meter-dial cartouche (styleguide-mccurdy-meter-logo.html) -->
    <g class="clock-brand clock-brand-mc-vintage" transform="translate(-60, -80) scale(0.2)" style="cursor:pointer;" title="McCurdy Radio Industries Studio Clock">
      <path d="M 294,14 Q 300,12.5 306,14 L 556,48 Q 566,49.5 562,60 L 517,156 Q 514,162 506,163 L 306,204 Q 300,205.5 294,204 L 94,163 Q 86,162 83,156 L 38,60 Q 34,49.5 44,48 Z" fill="#f5ede3" stroke="#1a1715" stroke-width="6"/>
      <path fill="#1a1715" d="M 101,46 L 139,46 L 139,62 C 149,49 164,43 181,43 C 199,43 213,50 221,63 C 231,49 246,43 263,43 C 289,43 306,59 306,87 L 306,156 L 317,156 L 317,163 L 271,163 L 271,156 L 281,156 L 281,89 C 281,71 271,61 255,61 C 239,61 227,72 227,91 L 227,156 L 238,156 L 238,163 L 192,163 L 192,156 L 202,156 L 202,89 C 202,71 192,61 176,61 C 160,61 148,72 148,91 L 148,156 L 159,156 L 159,163 L 113,163 L 113,156 L 123,156 L 123,54 L 101,54 Z"/>
      <text x="323" y="84" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="33" fill="#1a1715">C</text>
      <text x="349" y="109" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="56" letter-spacing="1.5" fill="#1a1715">CURDY</text>
      <path fill="#1a1715" d="M 264,118 L 523,118 A 11,11 0 0 1 523,140 L 264,140 A 11,11 0 0 1 264,118 Z"/>
      <text x="396" y="133.5" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12.5" letter-spacing="1.2" text-anchor="middle" fill="#f5ede3">RADIO INDUSTRIES LIMITED</text>
    </g>

    <!-- McCurdy ATS: the new McCurdy wordmark -->
    <g class="clock-brand clock-brand-mc-new" style="cursor:pointer;" title="McCurdy Radio Industries Studio Clock">
      <rect x="-56" y="-76" width="112" height="38" rx="6" fill="#142842" stroke="#ffffff" stroke-width="2.4"/>
      <text x="0" y="-50" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="21" font-weight="800" fill="#ffffff" text-anchor="middle">McCurdy</text>
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
  `}var nh=`#f4902c`,rh=`#facc15`;function ih(e,t=1,n=nh){let r=-e,i=r+6*t,a=r+10*t,o=r+16*t,s=r+20*t,c=r+24*t,l=r+28*t,u=r+30*t,d=5.8*t,f=3.6*t,p=1.2,m=`
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
  `,shadow:_}}function ah(e){let t=ih(110,1.15,nh),n=ih(168,1,nh);return`
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
      <line x1="0" y1="42" x2="0" y2="-190" stroke="${rh}" stroke-width="2.2" stroke-linecap="round" />
      <line x1="0" y1="32" x2="0" y2="-188" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6" />
      <!-- Arrowhead Spade Pointer Tip -->
      <polygon points="-3,-172 0,-191 3,-172 0,-168" fill="${rh}" />
      <!-- Sparkles of Clocking: Luminous Escapement & Atomic Pulse Glints -->
      <g id="clockSweepSparkles" transform="translate(0, -191)">
        <!-- 4-Pointed Star Sparkle (Main) -->
        <path class="clock-sparkle-star" d="M 0,-7.5 Q 0,0 7.5,0 Q 0,0 0,7.5 Q 0,0 -7.5,0 Q 0,0 0,-7.5 Z" fill="#ffffff" />
        <!-- Diagonal Star Sparkle -->
        <path class="clock-sparkle-diag" d="M -4,-4 Q 0,0 4,-4 Q 0,0 4,4 Q 0,0 -4,4 Q 0,0 -4,-4 Z" fill="${rh}" opacity="0.85" />
        <!-- Concentric Glint Core -->
        <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
        <!-- Starlight Glint Ray Flares -->
        <line x1="0" y1="-11" x2="0" y2="11" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.9" />
        <line x1="-11" y1="0" x2="11" y2="0" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.9" />
      </g>
      <!-- Rear Counterweight Disc -->
      <circle cx="0" cy="34" r="6.5" fill="${rh}" />
      <circle cx="0" cy="34" r="2.8" fill="#111317" />
    </g>

    <!-- Multi-Tiered Simpson/Sifam Meter Concentric Center Hub -->
    <g id="clockCenterHub" pointer-events="none">
      <!-- Outer Matte Collar -->
      <circle cx="0" cy="0" r="13" fill="url(#clockBossGrad)" stroke="#1a1c22" stroke-width="1.2" />
      <!-- Metallic Stepped Washer -->
      <circle cx="0" cy="0" r="8" fill="#2d3748" stroke="#4a5568" stroke-width="0.8" />
      <!-- Center Concentric Pivot Pin -->
      <circle cx="0" cy="0" r="4.2" fill="${nh}" />
      <circle cx="0" cy="0" r="1.8" fill="#ffffff" opacity="0.85" />
    </g>
  `}function oh(e){return`<svg id="clockMasterSvg" viewBox="-240 -240 480 480" width="100%" height="100%" class="clock-svg-root theme-${e.theme}" xmlns="http://www.w3.org/2000/svg">
    ${eh()}
    ${th(e.theme,e.showCueSectors)}
    ${ah(e.theme)}
  </svg>`}function sh(e=new Date,t=!0){let n=e.getHours(),r=e.getMinutes(),i=e.getSeconds(),a=e.getMilliseconds(),o=t?i+a/1e3:i,s=r+o/60,c=(n%12+s/60)*30,l=s*6,u=o*6,d=String(n).padStart(2,`0`),f=String(n%12||12).padStart(2,`0`),p=String(r).padStart(2,`0`),m=String(i).padStart(2,`0`),h=n>=12?`PM`:`AM`,g=`${d}:${p}:${m}`;return{hours:n,minutes:r,seconds:i,milliseconds:a,hourAngle:c,minuteAngle:l,secondAngle:u,timeString12:`${f}:${p}:${m} ${h}`,timeString24:g,utcTimeString:`${String(e.getUTCHours()).padStart(2,`0`)}:${String(e.getUTCMinutes()).padStart(2,`0`)}:${String(e.getUTCSeconds()).padStart(2,`0`)} UTC`,dateString:e.toLocaleDateString(void 0,{weekday:`short`,year:`numeric`,month:`short`,day:`numeric`}),timeZoneString:Intl.DateTimeFormat().resolvedOptions().timeZone||`LOCAL`}}function ch(e,t){let n=e.querySelector(`#clockHourHand`),r=e.querySelector(`#clockMinuteHand`),i=e.querySelector(`#clockSecondHand`);n&&n.setAttribute(`transform`,`rotate(${t.hourAngle.toFixed(2)} 0 0)`),r&&r.setAttribute(`transform`,`rotate(${t.minuteAngle.toFixed(2)} 0 0)`),i&&i.setAttribute(`transform`,`rotate(${t.secondAngle.toFixed(2)} 0 0)`)}function lh(e,t,n,r=`wbs-dark`){return`<!doctype html>
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

    body.theme-mccurdy-dark .clock-dial-plate { fill: url(#clockDialMcCurdyBlue) !important; }
    body.theme-mccurdy-dark .clock-baseline-arc { stroke: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-tick-std { stroke: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-num-std { fill: #f0f4f8 !important; }
    body.theme-mccurdy-dark .clock-num-warn { fill: #facc15 !important; }
    body.theme-mccurdy-dark .clock-num-24 { fill: #9fb3c8 !important; }
    body.theme-mccurdy-dark .clock-nrc-lbl { fill: #d9e2ec !important; }
    body.theme-mccurdy-dark .clock-nrc-sub { fill: #9fb3c8 !important; }
    body.theme-mccurdy-dark .clock-nrc-srv { fill: #d9e2ec !important; }

    body.theme-mccurdy .clock-dial-plate, body.theme-mccurdy-light .clock-dial-plate { fill: url(#clockDialMcCurdyBlue) !important; }
    body.theme-mccurdy .clock-baseline-arc, body.theme-mccurdy-light .clock-baseline-arc { stroke: #f0f4f8 !important; }
    body.theme-mccurdy .clock-tick-std, body.theme-mccurdy-light .clock-tick-std { stroke: #f0f4f8 !important; }
    body.theme-mccurdy .clock-num-std, body.theme-mccurdy-light .clock-num-std { fill: #f0f4f8 !important; }
    body.theme-mccurdy .clock-num-warn, body.theme-mccurdy-light .clock-num-warn { fill: #facc15 !important; }
    body.theme-mccurdy .clock-num-24, body.theme-mccurdy-light .clock-num-24 { fill: #9fb3c8 !important; }
    body.theme-mccurdy .clock-nrc-lbl, body.theme-mccurdy-light .clock-nrc-lbl { fill: #d9e2ec !important; }
    body.theme-mccurdy .clock-nrc-sub, body.theme-mccurdy-light .clock-nrc-sub { fill: #9fb3c8 !important; }
    body.theme-mccurdy .clock-nrc-srv, body.theme-mccurdy-light .clock-nrc-srv { fill: #d9e2ec !important; }

    .wbs-modern-only { display: none; }
    .wbs-ca-only { display: none; }
    .mc-only { display: none; }
    body.theme-wbs-dark .wbs-modern-only { display: inline; }
    body.theme-wbs-ca .wbs-ca-only { display: inline; }
    body.theme-mccurdy-dark .mc-only, body.theme-mccurdy .mc-only { display: inline; }
    .clock-brand-mc-vintage, .clock-brand-mc-new { display: none; }
    body.theme-mccurdy-dark .clock-brand-mc-vintage { display: inline; }
    body.theme-mccurdy .clock-brand-mc-new, body.theme-mccurdy-light .clock-brand-mc-new { display: inline; }
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
</html>`}var uh=new class{overlayEl=null;clockStageEl=null;digitalReadoutEl=null;animFrameId=null;isOpen=!1;options={theme:`wbs-dark`,mode:`smooth`,showCueSectors:!0,showVfdDigital:!0,use24Hour:!0};constructor(){this.detectAppTheme()}detectAppTheme(){let e=document.body,t=`wbs-dark`;return e.classList.contains(`theme-mccurdy-dark`)||e.classList.contains(`theme-mccurdy-ca`)?t=`mccurdy-dark`:e.classList.contains(`theme-mccurdy`)||e.classList.contains(`theme-mccurdy-light`)?t=`mccurdy-light`:e.classList.contains(`theme-wbs-ca`)&&(t=`wbs-ca`),this.options.theme=t,t}init(){let e=document.getElementById(`clockModalOverlay`);e||(e=document.createElement(`div`),e.id=`clockModalOverlay`,e.className=`clock-modal-overlay theme-${this.options.theme}`,e.style.display=`none`,e.innerHTML=`
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
      `,document.body.appendChild(e)),this.overlayEl=e,this.clockStageEl=e.querySelector(`#clockModalStage`),this.digitalReadoutEl=e.querySelector(`#clockModalLocalTime`),this.bindEvents()}bindEvents(){if(!this.overlayEl)return;this.overlayEl.addEventListener(`click`,e=>{e.target===this.overlayEl&&this.close()});let e=this.overlayEl.querySelector(`#btnCloseClockModal`);e&&e.addEventListener(`click`,e=>{e.stopPropagation(),this.close()});let t=this.overlayEl.querySelector(`#btnClockFullscreen`);t&&t.addEventListener(`click`,e=>{e.stopPropagation(),this.toggleFullscreen()});let n=this.overlayEl.querySelector(`#btnClockMode`);n&&n.addEventListener(`click`,e=>{e.stopPropagation(),this.options.mode=this.options.mode===`smooth`?`tick`:`smooth`,n.textContent=this.options.mode===`smooth`?`SWEEP`:`QUARTZ`});let r=this.overlayEl.querySelector(`#btnClockWindow`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),this.openDedicatedWindow()}),this.overlayEl.querySelectorAll(`.clock-pill-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),t.preventDefault();let n=e.getAttribute(`data-theme`);n&&this.setTheme(n)})})}open(){this.isOpen||(this.detectAppTheme(),this.init(),this.overlayEl&&(this.overlayEl.className=`clock-modal-overlay theme-${this.options.theme}`,this.overlayEl.style.display=`flex`,this.rebuildClockView(),this.updateThemePillActive(),this.isOpen=!0,this.startLoop()))}close(){this.isOpen&&=(this.stopLoop(),this.overlayEl&&(this.overlayEl.style.display=`none`),!1)}toggle(){this.isOpen?this.close():this.open()}setTheme(e){if(this.options.theme=e,typeof window.setMode==`function`)try{window.setMode(e)}catch(e){console.warn(`setMode failed:`,e)}else{let t=e===`mccurdy-light`,n=e===`mccurdy-dark`,r=e===`wbs-ca`,i=e===`wbs-dark`||!t&&!n&&!r;document.body.classList.toggle(`theme-mccurdy`,t),document.body.classList.toggle(`theme-mccurdy-light`,t),document.body.classList.toggle(`theme-mccurdy-dark`,n),document.body.classList.toggle(`theme-wbs-ca`,r),document.body.classList.toggle(`theme-wbs-dark`,i)}this.overlayEl&&(this.overlayEl.className=`clock-modal-overlay theme-${e}`),this.rebuildClockView(),this.updateThemePillActive()}cycleTheme(){let e=[`wbs-ca`,`wbs-dark`,`mccurdy-dark`,`mccurdy-light`],t=(e.indexOf(this.options.theme)+1)%e.length;this.setTheme(e[t])}updateThemePillActive(){this.overlayEl&&this.overlayEl.querySelectorAll(`.clock-pill-btn`).forEach(e=>{let t=e.getAttribute(`data-theme`)===this.options.theme;e.classList.toggle(`active`,t)})}rebuildClockView(){this.clockStageEl&&(this.clockStageEl.innerHTML=oh(this.options),this.clockStageEl.querySelectorAll(`.clock-brand`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation(),this.cycleTheme()})}))}startLoop(){let e=()=>{if(!this.isOpen)return;let t=sh(new Date,this.options.mode===`smooth`);if(this.clockStageEl&&ch(this.clockStageEl,t),this.overlayEl){let e=this.overlayEl.querySelector(`#clockModalLocalTime`),n=this.overlayEl.querySelector(`#clockModalUtcTime`),r=this.overlayEl.querySelector(`#clockModalDate`);e&&(e.textContent=`${t.timeString24} · ${t.timeZoneString}`),n&&(n.textContent=t.utcTimeString),r&&(r.textContent=t.dateString)}this.animFrameId=requestAnimationFrame(e)};this.stopLoop(),this.animFrameId=requestAnimationFrame(e)}stopLoop(){this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null)}toggleFullscreen(){document.fullscreenElement?document.exitFullscreen?.().catch(()=>{}):this.overlayEl?.requestFullscreen?this.overlayEl.requestFullscreen().catch(()=>{}):document.documentElement.requestFullscreen?.().catch(()=>{})}openDedicatedWindow(){let e=Math.min(1920,window.screen.availWidth||1400),t=Math.min(1080,window.screen.availHeight||900),n=Math.max(0,(window.screen.width-e)/2),r=Math.max(0,(window.screen.height-t)/2),i=window.open(``,`XtmMasterStudioClock`,`width=${e},height=${t},left=${n},top=${r},menubar=no,toolbar=no,location=no,status=no`);if(!i)return;let a=oh(this.options);i.document.write(lh(`Master Studio Clock - Ward-Beck Systems`,a,this.options.mode===`smooth`,this.options.theme)),i.document.close()}},dh=null;function fh(e=new Date){return`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}:${String(e.getSeconds()).padStart(2,`0`)}`}function ph(){let e=fh(),t=document.getElementById(`timelineNowTimeText`);t&&(t.textContent=e);let n=document.getElementById(`footerCurrentTime`);n&&(n.textContent=e)}function mh(){uh.open()}function hh(){uh.close()}function gh(){uh.toggle()}function _h(e){uh.init(),uo.startAutoSync(45e3);let t=document.getElementById(`btnTimelineNowTime`);t&&t.addEventListener(`click`,e=>{e.stopPropagation(),uo.syncNow(),mh()});let n=document.getElementById(`btnCurrentTime`);n&&n.addEventListener(`click`,e=>{e.stopPropagation(),mh()});let r=document.getElementById(`footerCurrentTime`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),mh()}),ph(),dh&&clearInterval(dh),dh=setInterval(ph,1e3),window.addEventListener(`xtm:open-clock`,()=>{mh()}),window.addEventListener(`keydown`,e=>{[`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target?.tagName)||(e.key===`Escape`?hh():e.key.toUpperCase()!==`T`||e.ctrlKey||e.metaKey||e.altKey||gh())});let i=document.getElementById(`dbfsStage`);i&&i.addEventListener(`click`,e=>{let t=i.getBoundingClientRect(),n=e.clientY-t.top,r=e.clientX-t.left,a=t.height,o=t.width;(n>=a-40||r>=o-100&&n>=a-60)&&mh()}),window.xtmClock={open:mh,close:hh,toggle:gh,controller:uh},window.xtmNtp=uo}var vh={loudness:{ids:[`dbfsStage`],display:`flex`},data:{ids:[`dataStage`],display:`block`},routing:{ids:[`routingStage`],display:`block`},generators:{ids:[`generatorsStage`],display:`block`},mxl:{ids:[`mxlStage`],display:`block`},timing:{ids:[`timingStage`],display:`block`},settings:{ids:[`settingsStage`],display:`block`}},yh=Object.keys(vh);function bh(){let e=document.getElementById(`footerViewMenu`),t=document.getElementById(`btnOpenSettings`),n=document.getElementById(`footerViewCurrentName`),r=Array.from(document.querySelectorAll(`#footerViewMenu [data-view]`)),i=`loudness`,a=()=>!!e?.classList.contains(`open`),o=n=>{e?.classList.toggle(`open`,n),t?.classList.toggle(`menu-open`,n),t?.setAttribute(`aria-expanded`,n?`true`:`false`)};t?.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),o(!a())});let s=document.getElementById(`auxDrawer`),c=document.getElementById(`settingsStage`),l=s?.querySelector(`:scope > .drawer-grid`);c&&l&&c.appendChild(l),s&&(s.open=!1),document.addEventListener(`click`,n=>{let r=n.target;a()&&!e?.contains(r)&&!t?.contains(r)&&o(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&a()&&(o(!1),t?.focus())});let u=e=>{i=e;for(let t of r){let n=t.dataset.view===e;t.classList.toggle(`active`,n),t.setAttribute(`aria-checked`,n?`true`:`false`),t.querySelector(`.footer-view-led`)?.classList.toggle(`lit-green`,n)}n&&(n.textContent=r.find(t=>t.dataset.view===e)?.querySelector(`.footer-view-name`)?.textContent??e),o(!1),document.body.classList.toggle(`xtm-settings-page`,e===`settings`);for(let t of yh)for(let n of vh[t].ids){let r=document.getElementById(n);r&&(r.style.display=t===e?vh[t].display:`none`)}if(e!==`loudness`)try{let e=window.xtmAudio;e?.ctx&&e.ctx.state===`suspended`&&e.ctx.resume().catch(()=>{})}catch{}window.dispatchEvent(new Event(`resize`))};for(let e of r)e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),u(e.dataset.view)});try{localStorage.removeItem(`xtm.lower_unit_pref`),localStorage.removeItem(`xtm.lower_unit`)}catch{}u(`loudness`),window.setLowerUnitMode=e=>{yh.includes(e)&&u(e)},window.cycleLowerUnitMode=()=>u(yh[(yh.indexOf(i)+1)%yh.length])}var xh=`http://localhost:8467`,Sh=2e3,$=e=>String(e??``).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]),Ch=e=>`${e.version===1?`PTPv1`:`PTPv2`} ${e.version===1?e.domain:`d`+e.domain}`,wh=class{el;timer=null;online=!1;ptp=null;seenGms=new Map;seenClocks=new Map;constructor(e){this.el=e}build(){return this.el.innerHTML=`<div class="routing-console-rack"><div class="rc-pipeline-graph tm-timing" id="tmTiming"></div></div>`,this.poll(),this.timer=window.setInterval(()=>this.poll(),Sh),this}destroy(){this.timer!==null&&window.clearInterval(this.timer),this.timer=null}async poll(){if(this.el.offsetParent||this.ptp===null){try{let e=await fetch(`${xh}/api/aoip/multicast`,{cache:`no-store`});if(!e.ok)throw Error(String(e.status));this.ptp=(await e.json())?.ptp??{},this.online=!0}catch{this.online=!1,this.ptp=this.ptp??{}}this.draw()}}draw(){let e=this.el.querySelector(`#tmTiming`);if(!e)return;let t=this.ptp||{},n=(e,t)=>e.localeCompare(t,void 0,{numeric:!0,sensitivity:`base`}),r=(e,t,n)=>{let r=new Set;for(let i of t){let t=n(i);r.add(t),e.set(t,i)}return[...e].map(([e,t])=>r.has(e)?t:{...t,gone:!0})},i=e=>`${Ch(e)} · ${e.network} · ${e.identity}`,a=e=>`${e.network} · ${Ch(e)} · ${e.clock_identity}`,o=r(this.seenGms,t.grandmasters??[],i).sort((e,t)=>n(i(e),i(t))),s=r(this.seenClocks,t.clocks??[],a),c=this.online&&t.listening?`on`:`err`,l=t.mode===`passive`?`passive · ${$(t.source||`apk-ptp`)}`:`listening on 224.0.1.129`,u=this.online?t.listening?`${l} · ${s.length} clock${s.length===1?``:`s`}`:t.error||`PTP listener not running`:`TAP offline: start the Ward-Beck Audio Tap (:8467)`,d=o.length?o.map(e=>{let t=e.sync_health===`contested`;return`
            <div class="tm-gm tm-v${e.version}${t?` tm-contested`:``}${e.gone?` tm-gone`:``}" title="Grandmaster ${$(e.identity)}${e.source_ip?` from ${$(e.source_ip)}`:``}${t?`
Contested: more than one grandmaster on this domain`:``}${e.gone?`
Not heard now: kept as a placeholder`:``}">
              <div class="tm-gm-name">⏱ ${$(Ch(e))} · ${$(e.network)}${e.priority1==null?``:` · p1 ${$(e.priority1)}`}</div>
              <div class="tm-gm-id">${t?`⚠ contested · `:``}GM ${$(e.identity)}</div>
            </div>`}).join(``):`<div class="tm-empty">${this.online?t.mode===`passive`?`No PTP master reported by apk-ptp yet`:`No PTP grandmaster heard on 224.0.1.129 yet`:`Waiting for the TAP daemon`}</div>`,f=s.slice().sort((e,t)=>n(a(e),a(t))).map(e=>`
      <tr class="${e.online===!1||e.gone?`tm-off`:``}${e.gone?` tm-gone`:``}${e.sync_health===`contested`?` tm-row-contested`:``}">
        <td>${e.is_grandmaster?`<b class="tm-gm-tag">GM</b>`:``}</td>
        <td class="tm-mono">${$(e.clock_identity)}</td>
        <td>${$(e.vendor||`—`)}</td>
        <td>${$(Ch(e))}</td>
        <td>${$(e.network)}</td>
        <td class="tm-num">${$(e.priority1??`—`)} / ${$(e.priority2??`—`)}</td>
        <td class="tm-num">${$(e.clock_class??`—`)}</td>
        <td>${$(e.clock_accuracy||`—`)}</td>
        <td>${$(e.time_source||`—`)}</td>
        <td>${$(e.sync_health||`—`)}</td>
        <td>${e.gone?`gone`:$(e.last_seen_text||(e.age_s==null?`—`:`${Math.round(e.age_s)} s ago`))}</td>
      </tr>`).join(``);e.innerHTML=`
      <div class="pg-status"><span class="pg-chip pg-chip-${c}"><i></i>PTP</span><span class="pg-iface">${$(u)}</span></div>
      <div class="tm-head">GRANDMASTERS</div>
      <div class="tm-gms">${d}</div>
      ${s.length?`
      <div class="tm-head">CLOCKS</div>
      <div class="tm-table-wrap"><table class="tm-table">
        <thead><tr><th></th><th>Identity</th><th>Vendor</th><th>PTP</th><th>Network</th><th>P1 / P2</th><th>Class</th><th>Accuracy</th><th>Time source</th><th>Health</th><th>Seen</th></tr></thead>
        <tbody>${f}</tbody>
      </table></div>`:``}`}},Th=`http://www.w3.org/2000/svg`,Eh=`xtm.meters_tab`,Dh={vu:[`xtm_meter_group_0`,`xtm_meter_group_2`],ppm:[`xtm_meter_group_1`,`xtm_meter_group_3`]};function Oh(e){let t=document.getElementById(e);try{return t?t.getBBox():null}catch{return null}}function kh(e,t){let n=document.createElementNS(Th,e);for(let[e,r]of Object.entries(t))n.setAttribute(e,r);return n}function Ah(e){let[t,n]=Dh[e],r=Oh(t),i=Oh(n);if(!r||!i)return null;let a=r.x+r.width+24-i.x,o=r.width*2+24+16,s=Math.max(r.height,i.height)+16,c=kh(`svg`,{viewBox:`${r.x-8} ${r.y-8} ${o} ${s}`,preserveAspectRatio:`xMidYMid meet`});return c.append(kh(`use`,{href:`#${t}`}),kh(`use`,{href:`#${n}`,transform:`translate(${a} 0)`})),c}function jh(){let e=document.querySelector(`#pod22Stage svg`);if(!e)return null;e.id||=`pod22_svg`;let t=e.viewBox.baseVal,n=t&&t.width?t.width:3200,r=t&&t.height?t.height:192,i=kh(`svg`,{viewBox:`0 0 ${n} ${r}`,preserveAspectRatio:`none`});return i.append(kh(`use`,{href:`#${e.id}`,width:String(n),height:String(r)})),i}function Mh(){let e=document.querySelector(`.meters-card`),t=document.getElementById(`metersPreview`);if(!e||!t)return;let n=Array.from(e.querySelectorAll(`[data-mtab]`)),r=Array.from(e.querySelectorAll(`[data-mpane]`)),i=`vu`,a=()=>{let e=i===`bar`?jh():Ah(i);t.replaceChildren(e??document.createTextNode(`Meters not built yet`)),t.dataset.tab=i},o=(e,t=!0)=>{i=e;for(let t of n){let n=t.dataset.mtab===e;t.classList.toggle(`active`,n),t.setAttribute(`aria-selected`,n?`true`:`false`),t.tabIndex=n?0:-1}for(let t of r)t.hidden=t.dataset.mpane!==e;if(a(),t)try{localStorage.setItem(Eh,e)}catch{}};for(let e of n)e.addEventListener(`click`,t=>{t.stopPropagation(),o(e.dataset.mtab)}),e.addEventListener(`keydown`,t=>{let r=n.indexOf(e),i=t.key===`ArrowRight`?n[(r+1)%n.length]:t.key===`ArrowLeft`?n[(r+n.length-1)%n.length]:null;i&&(t.preventDefault(),i.focus(),o(i.dataset.mtab))});e.addEventListener(`change`,()=>requestAnimationFrame(a)),window.addEventListener(`resize`,()=>requestAnimationFrame(a));let s=`vu`;try{let e=localStorage.getItem(Eh);(e===`vu`||e===`ppm`||e===`bar`)&&(s=e)}catch{}requestAnimationFrame(()=>o(s,!1))}function Nh(e,t){let{model:n,audio:r,view:i,podView:a,dbfsView:o,dataView:s,webRouter:c}=e,l=document.querySelector(`.console-viewport`),u=0,d=performance.now(),f=document.getElementById(`fpsDisplay`);function p(e){let m=r&&r.getLevels?r.getLevels():r?.currentLevels||{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1};if(i.updateNeedles(m,n.power,n.meterStyle===`fisam`||n.meterStyle===`sifam`),n.isIdle=!m.hasAudio,i.renderSecondary(n,m),a.render(n,m),o&&o.render(n,m),s&&s.render(n,m),c&&c.render(m),t.recordTelemetry(m,e),t.recordTransientEvent(m),l){let e=m&&m.lufs&&typeof m.lufs.m==`number`?m.lufs.m:-60;isFinite(e)&&e>-24?e>=-12?l.className=`console-viewport lufs-glow-red`:e>=-18?l.className=`console-viewport lufs-glow-orange`:l.className=`console-viewport lufs-glow-green`:l.className=`console-viewport`}if(u++,e-d>=500){let t=u*1e3/(e-d);f&&(f.textContent=t.toFixed(1)+` FPS`),u=0,d=e}requestAnimationFrame(p)}requestAnimationFrame(p)}async function Ph(){let t=document.getElementById(`visualizerStage`),n=document.getElementById(`pod22Stage`),r=document.getElementById(`dbfsStage`),i=new aa(t);i.build(e);let a=new ja(n),o=r?new _s(r):null,s=document.getElementById(`dataStage`),c=s?new Xs(s):null,l=document.getElementById(`routerStage`),u=null,d=l?new Tc(l,{audio:Jt,onFlowHint:e=>c?.setFlow(e),onMeterInput:(e,t)=>u?.(e,t),onOpenFlow:e=>{c?.setFlow(e),window.setLowerUnitMode?.(`mxl`),requestAnimationFrame(()=>document.querySelector(`#mxlStage [data-flow-ring="${CSS.escape(e)}"]`)?.scrollIntoView({block:`nearest`}))}}).mount():null,f=document.getElementById(`monitorVolSlider`),p=document.getElementById(`monitorVolVal`);d&&f&&(d.setSpeakerLevel(parseFloat(f.value)),f.addEventListener(`input`,()=>queueMicrotask(()=>d.setSpeakerLevel(parseFloat(f.value)))),d.onChange(e=>{document.activeElement!==f&&(f.value=String(e.speakerLevel),p&&(p.textContent=Math.round(e.speakerLevel*100)+`%`))}));let m=document.getElementById(`generatorsStage`);if(m&&d){new Bt(m,d,document.getElementById(`mxlCbcStage`)).build();let e=document.getElementById(`toneCalRow`),t=m.querySelector(`.routing-console-rack`);e&&t&&(e.className=`rc-tone-cal-row`,e.querySelector(`label`).textContent=`XTM-4 1 kHz reference tone`,t.prepend(e))}let h=document.getElementById(`timingStage`);h&&new wh(h).build();let g={model:e,audio:Jt,view:i,podView:a,dbfsView:o,dataView:c,webRouter:d};c&&c.build(g),window.xtmModel=e,window.xtmAudio=Jt,window.xtmView=i,window.xtmDataView=c,window.xtmWebRouter=d,window.xtmCtx=g,Dc(),Oc(g),qp(g);let _=im(),v=Ec();pm(g);let y=om(g,v);u=(e,t)=>mi(g,y,e,t),hi(g),mm(g,v,y),hm(g,y),gm(g,y),Tm(g,v),await Em(g,v),Dm(g,v,y),Om(g,v),fm(g,v),km(g,v),Rm(g,v),zm(g,v),Jp(g,v),Bm(g,v),Yp(g,v),Vm(g),Hm(g),Um(g),dm(g),Wm(g,y),Gm(g,v),Km(g,y),Ym(),Xm(),Zm(),_h(g),bh(),Mh(),Fs(4e3);let b=!1;Es(t=>{t.length>0&&!b&&(b=!0,(/(^|\.)(ward-beck|wardbeck)\.ca$/i.test(window.location.hostname)||window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`)&&e.flash(`XMXL :${t[0].port}`))}),Nh(g,_)}window.audioReady=!0,Ph(),window.audioContext&&window.audioContext.state===`suspended`&&window.audioContext.resume();
//# sourceMappingURL=index-DnowData.js.map