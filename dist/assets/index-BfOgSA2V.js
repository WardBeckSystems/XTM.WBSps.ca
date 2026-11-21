/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{power=!0;mode=`A`;prevMode=`A`;a={src:0,lvl:64};d={src:1,lvl:42};s={pair:[1]};selectedInput=1;mcRangeMode=`outer`;mcAttenuatorStep=15;hp=0;term=0;set={scr:`HP`};meterStyle=`sifam`;dialLamp=`amber`;ppmStyle=`black`;artMode=`svg`;vfdMetric=`lufs`;flashMsg=null;flashTimer=null;isIdle=!0;toneCalLevels=(()=>{let e=[];for(let t=-60;t<=0;t++)e.push(t);return e})();toneCalIdx=42;onChange=null;constructor(){this.toneCalIdx=this.toneCalLevels.indexOf(-18),this.toneCalIdx<0&&(this.toneCalIdx=42),this.loadEEPROM()}lvlDb(e){return e-60}lvlChars(e){let t=this.lvlDb(e),n=t>0?`+`:t<0?`-`:` `,r=Math.abs(t);return n+(r<10?`0`+r:``+r)}flash(e,t=1200){this.flashMsg=e,this.flashTimer&&clearTimeout(this.flashTimer),this.flashTimer=setTimeout(()=>{this.flashMsg=null,this.notify()},t)}getDisplayText(){if(!this.power)return`        `;if(this.flashMsg)return this.flashMsg.padEnd(8).substring(0,8);if(this.isIdle&&this.mode!==`SET`)return`WardBeck`;if(this.mode===`SET`)return this.set.scr===`HP`?this.hp?` HP  IN `:` HP  OUT`:this.term?`TERM LZ `:`TERM HZ `;if(this.mode===`A`){let e=`A`+this.a.src,t=this.term?`z`:` `,n=this.lvlChars(this.a.lvl),r=this.hp?`f`:` `;return e+t+n+r}if(this.mode===`D`){let e=this.lvlChars(this.d.lvl),t=this.hp?`f`:` `;return`SYS `+e+t}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}return[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e]||`TEST `+e+`  `}return`XTM4    `}getInputSensText(){if(this.mode===`A`){let e=`A`+this.a.src,t=this.lvlDb(this.a.lvl),n=(t>=0?`+`:``)+t+`dB`;return(e+` `+n).padEnd(8).substring(0,8)}if(this.mode===`D`){let e=this.lvlDb(this.d.lvl);return(`SYS `+((e>=0?`+`:``)+e+`dB`)).padEnd(8).substring(0,8)}if(this.mode===`S`){let e=this.s.pair[0]??1;if(e===1||e===3){let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;return t===0?(n+`0dBFS`).padEnd(8).substring(0,8):(n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8)}let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];return t?t.padEnd(8).substring(0,8):(`TEST `+e).padEnd(8).substring(0,8)}return`A1 +4dB `}pressMode(){this.power&&(this.mode===`SET`?this.mode=this.prevMode:this.mode===`A`?(this.mode=`D`,this.flash(`SYST OUT`)):this.mode===`D`?(this.mode=`S`,this.flash(`TEST GEN`)):(this.mode=`A`,this.flash(`CARD IN `)),this.saveEEPROM(),this.notify())}holdMode(){this.power&&(this.mode===`SET`?this.mode=this.prevMode:(this.prevMode=this.mode,this.mode=`SET`,this.set.scr=`HP`,this.flash(`SETUP   `)),this.saveEEPROM(),this.notify())}pressSource(){if(this.power){if(this.mode===`SET`)this.set.scr=this.set.scr===`HP`?`TERM`:`HP`;else if(this.mode===`A`)this.a.src=+(this.a.src===0),this.flash(this.a.src===0?`MIC / IN1`:`LINE/IN2`);else if(this.mode===`D`)this.d.src=+(this.d.src===0),this.flash(this.d.src===1?`SYST OUT`:`1kHZ TONE`);else if(this.mode===`S`){let e=(this.s.pair[0]??1)+1;e>4&&(e=1),this.s.pair[0]=e;let t=[``,`1kHZ REF`,`PINK NOIS`,`400H TONE`,`SWEP TONE`][e];t&&this.flash(t)}this.selectedInput=this.getSelectedInput(),this.saveEEPROM(),this.notify()}}getSelectedInput(){return this.mode===`A`?this.a.src===0?1:2:this.mode===`D`?3:this.mode===`S`?4:this.selectedInput||1}setInput(e){this.power&&(this.selectedInput=e,e===1?(this.mode=`A`,this.a.src=0,this.flash(`INPUT 1`)):e===2?(this.mode=`A`,this.a.src=1,this.flash(`INPUT 2`)):e===3?(this.mode=`D`,this.d.src=1,this.flash(`INPUT 3`)):e===4&&(this.mode=`S`,this.s.pair[0]=1,this.flash(`INPUT 4`)),this.saveEEPROM(),this.notify())}getMcCurdySensitivityDb(){return this.mcRangeMode===`cal`?4:this.mcRangeMode===`inner`?-30+this.mcAttenuatorStep*2:-50+this.mcAttenuatorStep*2}setMccurdyRange(e){this.power&&(this.mcRangeMode=e,this.applyMccurdySensitivity())}toggleMccurdyRange(){this.power&&(this.mcRangeMode=this.mcRangeMode===`outer`?`inner`:(this.mcRangeMode,`outer`),this.applyMccurdySensitivity())}setMccurdyAttenuatorStep(e){this.power&&(this.mcAttenuatorStep=Math.max(0,Math.min(30,Math.round(e))),this.mcRangeMode===`cal`&&(this.mcRangeMode=`outer`),this.applyMccurdySensitivity())}setSensitivityDb(e){if(!this.power)return;let t=Math.max(0,Math.min(90,Math.round(e+60)));if(this.a.lvl=t,this.d.lvl=t,this.mcRangeMode===`inner`){let t=(e- -30)/2;t>=0&&t<=30&&(this.mcAttenuatorStep=Math.round(t))}else if(this.mcRangeMode===`outer`){let t=(e- -50)/2;t>=0&&t<=30&&(this.mcAttenuatorStep=Math.round(t))}this.flash(`SENS `+this.lvlChars(t)),this.saveEEPROM(),this.notify()}applyMccurdySensitivity(){let e=this.getMcCurdySensitivityDb(),t=Math.max(0,Math.min(90,Math.round(e+60)));if(this.a.lvl=t,this.d.lvl=t,this.mcRangeMode===`cal`)this.flash(`CAL +4dBu`);else{let t=this.mcRangeMode===`outer`?`OUT`:`IN `,n=(e>0?`+`:``)+e;this.flash(`${t} ${n}dB`)}this.saveEEPROM(),this.notify()}pressDown(){if(this.power){if(this.mode===`SET`)this.set.scr===`HP`?this.hp=0:this.term=1;else if(this.mode===`A`)this.a.lvl>0&&this.a.lvl--,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl>0&&this.d.lvl--,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx>0){this.toneCalIdx--;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}pressUp(){if(this.power){if(this.mode===`SET`)this.set.scr===`HP`?this.hp=1:this.term=0;else if(this.mode===`A`)this.a.lvl<90&&this.a.lvl++,this.flash(`SENS `+this.lvlChars(this.a.lvl));else if(this.mode===`D`)this.d.lvl<90&&this.d.lvl++,this.flash(`SENS `+this.lvlChars(this.d.lvl));else if(this.mode===`S`){let e=this.s.pair[0]??1;if((e===1||e===3)&&this.toneCalIdx<this.toneCalLevels.length-1){this.toneCalIdx++;let t=this.toneCalLevels[this.toneCalIdx]??0,n=e===3?`400 `:`1k `;this.flash((n+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}}this.saveEEPROM(),this.notify()}}togglePower(){this.power=!this.power,this.notify()}getActiveReferenceLevel(){return this.mode===`A`?this.lvlDb(this.a.lvl):this.mode===`D`?this.lvlDb(this.d.lvl):4}saveEEPROM(){try{let e={mode:this.mode===`SET`?this.prevMode:this.mode,a:this.a,d:this.d,s:this.s,hp:this.hp,term:this.term,meterStyle:this.meterStyle,dialLamp:this.dialLamp,ppmStyle:this.ppmStyle,selectedInput:this.getSelectedInput(),mcRangeMode:this.mcRangeMode,mcAttenuatorStep:this.mcAttenuatorStep,toneCalIdx:this.toneCalIdx,toneCalLevel:this.toneCalLevels[this.toneCalIdx]??0,vfdMetric:this.vfdMetric};localStorage.setItem(`wbs_xtm4_eeprom`,JSON.stringify(e))}catch{}}loadEEPROM(){try{let e=localStorage.getItem(`wbs_xtm4_eeprom`);if(e){let t=JSON.parse(e);if(t.mode&&(this.mode=this.prevMode=t.mode),t.a&&(this.a=Object.assign(this.a,t.a)),t.d&&(this.d=Object.assign(this.d,t.d)),t.s&&(this.s=Object.assign(this.s,t.s)),t.hp!==void 0&&(this.hp=t.hp),t.term!==void 0&&(this.term=t.term),t.meterStyle&&(this.meterStyle=t.meterStyle),t.selectedInput&&(this.selectedInput=t.selectedInput),t.mcRangeMode&&(this.mcRangeMode=t.mcRangeMode),typeof t.mcAttenuatorStep==`number`&&(this.mcAttenuatorStep=t.mcAttenuatorStep),t.dialLamp&&(this.dialLamp=t.dialLamp),t.ppmStyle&&(this.ppmStyle=t.ppmStyle),typeof localStorage<`u`&&localStorage.getItem(`wbs_xtm4_tone_cal_dbfs_v3`)!==`true`)this.toneCalIdx=this.toneCalLevels.indexOf(-18),localStorage.setItem(`wbs_xtm4_tone_cal_dbfs_v3`,`true`),this.saveEEPROM();else if(typeof t.toneCalLevel==`number`){let e=this.toneCalLevels.indexOf(t.toneCalLevel);e>=0&&(this.toneCalIdx=e)}else t.toneCalIdx!==void 0&&t.toneCalIdx>=0&&t.toneCalIdx<this.toneCalLevels.length&&(this.toneCalIdx=t.toneCalIdx);t.vfdMetric&&(this.vfdMetric=t.vfdMetric)}}catch{}}notify(){this.onChange&&this.onChange(this)}},t=class{instance=null;memory=null;isLoaded=!1;inputLOffset=0;inputROffset=0;outputOffset=0;initDspFn=null;setRefLevelFn=null;setCalGainFn=null;setPeakTrimFn=null;setPpmTypeFn=null;setVuBallisticsFn=null;resetLoudnessFn=null;processBlockFn=null;async load(e=`./meter-dsp.wasm`){try{let t;try{t=await fetch(e)}catch{t=await fetch(`/meter-dsp.wasm`)}let n=await t.arrayBuffer(),{instance:r}=await WebAssembly.instantiate(n,{env:{abort:(e,t,n,r)=>{console.warn(`[WASM DSP] Abort at line ${n}:${r}`)},trace:(e,t)=>{}}});this.instance=r;let i=r.exports;return this.memory=i.memory,this.inputLOffset=i.inputBufferL?.value??i.inputBufferL,this.inputROffset=i.inputBufferR?.value??i.inputBufferR,this.outputOffset=i.outputTelemetry?.value??i.outputTelemetry,this.initDspFn=i.initDsp,this.setRefLevelFn=i.setRefLevel,this.setCalGainFn=i.setCalGain,this.setPeakTrimFn=i.setPeakTrim,this.setPpmTypeFn=i.setPpmType,this.setVuBallisticsFn=i.setVuBallistics,this.resetLoudnessFn=i.resetLoudness,this.processBlockFn=i.processBlock,this.isLoaded=!0,!0}catch(e){return console.warn(`WASM DSP loading failed, falling back to JS DSP:`,e),this.isLoaded=!1,!1}}get ready(){return this.isLoaded&&this.instance!==null}init(e,t,n){this.initDspFn&&this.initDspFn(e,t,n)}setRefLevel(e,t=!1){this.setRefLevelFn&&this.setRefLevelFn(e,+!!t)}setCalGain(e){this.setCalGainFn&&this.setCalGainFn(e)}setPeakTrim(e){this.setPeakTrimFn&&this.setPeakTrimFn(e)}setPpmType(e){this.setPpmTypeFn&&this.setPpmTypeFn(e)}setVuBallistics(e,t){this.setVuBallisticsFn&&this.setVuBallisticsFn(e,t)}resetLoudness(){this.resetLoudnessFn&&this.resetLoudnessFn()}process(e,t,n){if(!this.ready||!this.memory||!this.processBlockFn)return!1;let r=Math.min(e.length,4096),i=this.memory.buffer,a=new Float32Array(i,this.inputLOffset,r),o=new Float32Array(i,this.inputROffset,r);a.set(e.subarray(0,r)),o.set(t.subarray(0,r)),this.processBlockFn(r);let s=new Float32Array(i,this.outputOffset,20);return n.vuL=s[0]??0,n.vuR=s[1]??0,n.ppmDbL=s[2]??-120,n.ppmDbR=s[3]??-120,n.ppmFracL=s[4]??0,n.ppmFracR=s[5]??0,n.dbfsA=s[6]??-120,n.dbfsB=s[7]??-120,n.dbfsSum=s[8]??-120,n.dbfsDiff=s[9]??-120,n.lufsM=s[10]??-70,n.lufsS=s[11]??-70,n.phaseCorr=s[12]??1,n.hasAudio=(s[13]??0)>.5,n.peakA=(s[14]??0)>.5,n.peakB=(s[15]??0)>.5,n.lufsML=s[16]??-70,n.lufsMR=s[17]??-70,n.blockEnergy=s[18]??0,!0}};function n(){return{simpson:{f0:2.16,zeta:.815},sifam:{f0:2.4,zeta:.85}}}function r(){return[{x1:0,x2:0,y1:0,y2:0,p:0},{x1:0,x2:0,y1:0,y2:0,p:0}]}function i(){return[{env:0,q:-.12,qv:0},{env:0,q:-.12,qv:0}]}function a(){return{sL2:0,sR2:0,sLR:0,correlation:1,led:7}}function o(){return{stage1:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],stage2:[{x1:0,x2:0,y1:0,y2:0},{x1:0,x2:0,y1:0,y2:0}],meanSquareM_L:0,meanSquareM_R:0,meanSquareS_L:0,meanSquareS_R:0,sumEnergy:0,blockCount:0,shortTermHist:[]}}function s(){return{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],dbfs:[-60,-60,-60,-60],lufs:{m:-60,s:-60,i:-60,lra:0,mL:-60,mR:-60},rmsDb:[-60,-60],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1}}function c(){return{vuL:0,vuR:0,ppmDbL:-120,ppmDbR:-120,ppmFracL:0,ppmFracR:0,dbfsA:-120,dbfsB:-120,dbfsSum:-120,dbfsDiff:-120,lufsM:-70,lufsS:-70,lufsML:-70,lufsMR:-70,blockEnergy:0,phaseCorr:1,hasAudio:!1,peakA:!1,peakB:!1}}var l=`class WbsMeterProcessor extends AudioWorkletProcessor{constructor(){super();this.bufSize=1024;this.bufL=new Float32Array(this.bufSize);this.bufR=new Float32Array(this.bufSize);this.idx=0;}process(inputs){const input=inputs[0];if(input&&input.length>0){const ch0=input[0];const ch1=input.length>1?input[1]:ch0;const len=ch0.length;for(let i=0;i<len;i++){this.bufL[this.idx]=ch0[i];this.bufR[this.idx]=ch1[i];this.idx++;if(this.idx>=this.bufSize){this.port.postMessage({ch0:this.bufL.slice(),ch1:this.bufR.slice()});this.idx=0;}}}return true;}}registerProcessor("wbs-meter-processor",WbsMeterProcessor);`,u=`wbs-meter-processor`,d=[`./meter-processor.js`,`meter-processor.js`,`js/meter-processor.js`],f={standard_vu:{id:`standard_vu`,name:`Standard VU (ANSI C16.5)`,standard:`ANSI C16.5-1942`,attackMs:300,releaseMs:300,f0:2.16,zeta:.815,notes:`ANSI C16.5-1942. Philosophy: Approximates perceived loudness. 0 VU = +4 dBu (-18 dBFS). 300ms attack/decay, 1-1.5% overshoot.`},console_standard:{id:`console_standard`,name:`Console Standard`,standard:`Studio Console`,attackMs:200,releaseMs:800,f0:2.8,zeta:.75,notes:`Studio Console Standard. 200ms attack, 800ms release.`},fast_response:{id:`fast_response`,name:`Fast Response (Percussive)`,standard:`Transient Monitor`,attackMs:50,releaseMs:200,f0:5.5,zeta:.707,notes:`Fast response for tracking percussive drum transients.`},slow_response:{id:`slow_response`,name:`Slow Response (Heavy Inertia)`,standard:`Damped Movement`,attackMs:500,releaseMs:2e3,f0:1.4,zeta:.85,notes:`Slow response with heavy damped needle inertia.`},super_slow:{id:`super_slow`,name:`Super Slow Vintage`,standard:`Galvanometer Drift`,attackMs:1e3,releaseMs:4e3,f0:.8,zeta:.9,notes:`Very heavy needle movement simulating vintage mechanical galvanometer drift.`},master_console:{id:`master_console`,name:`Master Console Bank`,standard:`Master Bus Console`,attackMs:300,releaseMs:1500,f0:1.9,zeta:.8,notes:`Master console broadcast monitoring with extended release.`},compressor_gr:{id:`compressor_gr`,name:`Compressor Gain Reduction`,standard:`Dynamics GR`,attackMs:10,releaseMs:100,f0:9,zeta:.707,notes:`Ultra-fast gain reduction dynamics.`}},p={f0:2.16,zeta:.815},m=8.8458296;function h(e){return e.vuCoeffs[e.vuStyle]||{f0:p.f0,zeta:p.zeta}}function g(e,t){let n=2/(1/t),r=h(e),i=2*Math.PI*r.f0,a=n*n+2*r.zeta*i*n+i*i;e.vuB0=i*i/a,e.vuB1=2*i*i/a,e.vuB2=e.vuB0,e.vuA1=2*(i*i-n*n)/a,e.vuA2=(n*n-2*r.zeta*i*n+i*i)/a}function _(e,t,n){let r=e.vuB0*n+e.vuB1*t.x1+e.vuB2*t.x2-e.vuA1*t.y1-e.vuA2*t.y2;t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,t.p=Math.max(-.03,Math.min(1.15,r))}function v(e){return e>.005?20*Math.log10(e)+3:-1/0}function y(e,t){if(t!==`simpson`&&t!==`sifam`)return;e.vuStyle=t,e.calculateCoefficients();let n=h(e);e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}function b(e,t){let n=f[t]||f.standard_vu;e.vuBallisticPreset=n.id,e.vuCoeffs[e.vuStyle]={f0:n.f0,zeta:n.zeta},e.calculateCoefficients(),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setVuBallistics(n.f0,n.zeta)}var x={num:1,key:`type1`,attack:.01,tauDecay:1.5/Math.LN10},S={num:2,key:`type2`,attack:.01,tauDecay:56/(24*Math.LN10)},C=[x,S,{num:3,key:`nordic`,attack:.005,tauDecay:2/Math.LN10},{num:4,key:`fast_peak`,attack:.001,tauDecay:1/Math.LN10}];function ee(e){for(let t of C)if(e===t.num||e===t.key)return t;return null}var te=18.465;function ne(e,t){e.ppmAttack=.01,e.ppmAttCoeff=1-Math.exp(-1/(e.ppmAttack*t));let n=e.ppmType===1?x.tauDecay:S.tauDecay;e.ppmDecCoeff=Math.exp(-1/(n*t)),e.wasmDsp.ready&&e.wasmDsp.setPpmType(e.ppmType)}function re(e,t){let n=ee(t);n&&(e.ppmBallisticPreset=n.key);let r=n||S,i=r.num;e.ppmType=i===1?1:2;let a=e.ctx?e.ctx.sampleRate:48e3;e.ppmAttack=r.attack,e.ppmAttCoeff=1-Math.exp(-1/(r.attack*a)),e.ppmDecCoeff=Math.exp(-1/(r.tauDecay*a)),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPpmType(i)}function ie(e,t,n){n>t.env?t.env+=(n-t.env)*e.ppmAttCoeff:t.env*=e.ppmDecCoeff}function ae(e,t){return e>1e-6?20*Math.log10(e)+te+t:-1/0}function w(e){return e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function oe(e,t){e.phaseAlpha=1-Math.exp(-1/(.3*t))}function se(e,t,n,r){e.sL2+=t*(n*n-e.sL2),e.sR2+=t*(r*r-e.sR2),e.sLR+=t*(n*r-e.sLR)}function ce(e,t){let n=Math.sqrt(e.sL2*e.sR2)+1e-9;return t?Math.max(-1,Math.min(1,e.sLR/n)):1}function le(e,t){let n=-1;return t&&(n=e<=-.75?0:e<=-.5?1:e<=-.2?2:e<=.1?3:e<=.4?4:e<=.7?5:e<=.9?6:7),n}function ue(e,t){let n=Math.round((e+1)*3.5);return n<0&&(n=0),n>7&&(n=7),t?n:-1}function de(e,t){let n=10**(3.9998438/20),r=Math.tan(Math.PI*1681.974450955532/t),i=r*r,a=Math.SQRT2,o=1+a*r+i;e.kShelf_b0=(n+a*Math.sqrt(n)*r+i)/o,e.kShelf_b1=2*(i-n)/o,e.kShelf_b2=(n-a*Math.sqrt(n)*r+i)/o,e.kShelf_a1=2*(i-1)/o,e.kShelf_a2=(1-a*r+i)/o;let s=.5003270373238773,c=Math.tan(Math.PI*38.13547087602444/t),l=c*c,u=1+c/s+l;e.kHp_b0=1/u,e.kHp_b1=-2/u,e.kHp_b2=1/u,e.kHp_a1=2*(l-1)/u,e.kHp_a2=(1-c/s+l)/u}function fe(e,t,n){let r=e.kShelf_b0*n+e.kShelf_b1*t.x1+e.kShelf_b2*t.x2-e.kShelf_a1*t.y1-e.kShelf_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function pe(e,t,n){let r=e.kHp_b0*n+e.kHp_b1*t.x1+e.kHp_b2*t.x2-e.kHp_a1*t.y1-e.kHp_a2*t.y2;return t.x2=t.x1,t.x1=n,t.y2=t.y1,t.y1=r,r}function me(e,t){let n=1024/t;e.lufsAlphaM=1-Math.exp(-n/.4),e.lufsAlphaS=1-Math.exp(-n/3)}function he(e){return e>1e-12?Math.max(-60,-.691+10*Math.log10(e)):-60}function ge(e,t){e.sumEnergy+=t,e.blockCount++}function _e(e){let t=e.blockCount>0?e.sumEnergy/e.blockCount:0;return t>0?he(t):-1/0}function ve(e,t){t>-60&&(e.shortTermHist.push(t),e.shortTermHist.length>200&&e.shortTermHist.shift())}function ye(e){if(e.shortTermHist.length>=10){let t=[...e.shortTermHist].sort((e,t)=>e-t),n=t[Math.floor(t.length*.1)],r=t[Math.floor(t.length*.95)];return Math.max(0,r-n)}return 0}function be(e,t,n,r){let i=e.lufsState;if(r){i.meanSquareM_L+=e.lufsAlphaM*(t-i.meanSquareM_L),i.meanSquareM_R+=e.lufsAlphaM*(n-i.meanSquareM_R),i.meanSquareS_L+=e.lufsAlphaS*(t-i.meanSquareS_L),i.meanSquareS_R+=e.lufsAlphaS*(n-i.meanSquareS_R);let r=t+n;r>125e-9&&ge(i,r)}else i.meanSquareM_L*=.92,i.meanSquareM_R*=.92,i.meanSquareS_L*=.97,i.meanSquareS_R*=.97}function T(e){e.meanSquareM_L=0,e.meanSquareM_R=0,e.meanSquareS_L=0,e.meanSquareS_R=0,e.sumEnergy=0,e.blockCount=0,e.shortTermHist=[]}function xe(e){T(e.lufsState),e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.resetLoudness()}function Se(e){if(!e.ctx)return;let t=e.ctx.sampleRate;g(e,t),ne(e,t),oe(e,t),de(e,t),me(e,t)}async function Ce(e){return e.ctx||=new(window.AudioContext||window.webkitAudioContext)({latencyHint:`interactive`}),e.ctx.state===`suspended`||(Se(e),await we(e),await e.wasmDsp.load(),e.ctx&&e.wasmDsp.ready&&(e.wasmDsp.init(e.ctx.sampleRate,e.refLevelDb,e.peakSensTrim),e.wasmDsp.setRefLevel(e.refLevelDb,e.isRefDigital),e.wasmDsp.setPeakTrim(e.peakSensTrim))),e.ctx}async function we(e){if(e.workletLoaded||!e.ctx||!e.ctx.audioWorklet)return;let[t,n,r]=d;try{try{await e.ctx.audioWorklet.addModule(t)}catch{try{await e.ctx.audioWorklet.addModule(n)}catch{await e.ctx.audioWorklet.addModule(r)}}e.workletLoaded=!0}catch{try{let t=new Blob([l],{type:`application/javascript`}),n=URL.createObjectURL(t);await e.ctx.audioWorklet.addModule(n),URL.revokeObjectURL(n),e.workletLoaded=!0}catch{e.workletLoaded=!1}}}async function Te(){try{return(await navigator.mediaDevices.enumerateDevices()).filter(e=>e.kind===`audioinput`)}catch(e){return console.warn(`Could not enumerate audio devices:`,e),[]}}var Ee={echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1};function De(e){let t=[];return e&&(t.push({audio:{deviceId:{exact:e},...Ee,channelCount:{ideal:2}}}),t.push({audio:{deviceId:{ideal:e},...Ee}}),t.push({audio:{deviceId:{exact:e}}}),t.push({audio:{deviceId:e}})),t.push({audio:{...Ee,channelCount:{ideal:2}}}),t.push({audio:{...Ee}}),t.push({audio:!0}),t}async function Oe(e,t=null){await e.ensureContext(),e.stopCurrentSource();try{if((await Te()).length===0){let t=new DOMException(`No audio input devices detected on this system`,`NotFoundError`);throw e.onStatusChange&&e.onStatusChange({type:`error`,error:t.message}),t}}catch(e){if(e?.name===`NotFoundError`)throw e}let n=De(t),r=null,i=null;for(let e of n)try{if(r=await navigator.mediaDevices.getUserMedia(e),r&&r.getAudioTracks().length>0)break}catch(t){i=t,console.warn(`getUserMedia candidate constraint failed:`,e,t)}if(!r){console.warn(`Attempting fallback to default audio device...`);try{r=await navigator.mediaDevices.getUserMedia({audio:!0})}catch(t){throw console.error(`Fallback failed:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:i?.message||`Audio device unavailable`}),i||Error(`Could not access audio device`)}}try{e.stream=r;let n=r.getAudioTracks()[0];n&&(n.enabled=!0),e.activeDeviceId=(n&&n.getSettings?n.getSettings():{}).deviceId||t,e.isSystemAudio=!1,e.sourceType=`mic`,e.setupAudioGraph(r),e.ctx&&e.ctx.state===`suspended`&&await e.ctx.resume();let i=await e.getAudioInputDevices();e.onDevicesChange&&e.onDevicesChange(i,e.activeDeviceId);let a=n?.label||`Soundcard Input`;return e.onStatusChange&&e.onStatusChange({type:`soundcard`,label:a}),!0}catch(t){throw console.error(`Error in audio graph setup for sound card:`,t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),t}}async function ke(e){if(e.sourceType===`system`&&e.stream&&e.stream.active)return!0;try{let t=await navigator.mediaDevices.getDisplayMedia({video:!0,audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},systemAudio:`include`,surfaceSwitching:`include`,selfBrowserSurface:`exclude`,monitorTypeSurfaces:`include`});t.getVideoTracks().forEach(e=>e.stop());let n=t.getAudioTracks();if(n.length===0)throw Error(`No audio track selected. When prompted, ensure "Share audio" is checked.`);return await e.ensureContext(),e.stopCurrentSource(),e.stream=t,e.isSystemAudio=!0,e.activeDeviceId=null,e.sourceType=`system`,e.setupAudioGraph(t),n[0].onended=()=>{e.stopCurrentSource(),e.onStatusChange&&e.onStatusChange({type:`disconnected`,label:`Audio Stopped`})},e.onStatusChange&&e.onStatusChange({type:`system`,label:n[0].label||`Computer System Audio`}),!0}catch(t){return t?.name===`NotAllowedError`?console.info(`[AudioEngine] System audio capture cancelled by user.`):console.warn(`[AudioEngine] Error capturing system audio:`,t?.message||t),e.onStatusChange&&e.onStatusChange({type:`error`,error:t?.message}),!1}}function Ae(e,t,n){let r=e.createOscillator();return r.type=`sine`,r.frequency.setValueAtTime(n,e.currentTime),r.connect(t),r.start(),r}function je(e){let t=e.sampleRate*4,n=e.createBuffer(2,t,e.sampleRate);for(let e=0;e<2;e++){let r=n.getChannelData(e),i=0,a=0,o=0,s=0,c=0,l=0,u=0;for(let e=0;e<t;e++){let t=Math.random()*2-1;i=.99886*i+t*.0555179,a=.99332*a+t*.0750759,o=.969*o+t*.153852,s=.8665*s+t*.3104856,c=.55*c+t*.5329522,l=-.7616*l-t*.016898,r[e]=(i+a+o+s+c+l+u+t*.5362)*.11,u=t*.115926}}return n}function Me(e,t){let n=e.createBufferSource();return n.buffer=je(e),n.loop=!0,n.connect(t),n.start(),n}var Ne=20,Pe=2e4,Fe=8,Ie=9e3;function Le(e,t){e.frequency.setValueAtTime(Ne,t.currentTime),e.frequency.exponentialRampToValueAtTime(Pe,t.currentTime+Fe)}function Re(e,t,n){let r=t.createOscillator();return r.type=`sine`,Le(r,t),r.connect(n),r.start(),e.testOsc=r,e.sweepTimer=setInterval(()=>{if(e.sourceType===`test`&&e.testType===`sweep`&&e.testOsc)try{let n=e.testOsc;n.frequency.cancelScheduledValues(t.currentTime),Le(n,t)}catch{}},Ie),r}var ze=e=>e===`sine1k`||e===`sine400`;function Be(e,t=`sine1k`){e.ctx&&e.ctx.state===`suspended`&&e.ctx.resume(),e.stopCurrentSource(),e.sourceType=`test`,e.testType=t;let n=e.ctx;if(!n)return;e.testGain=n.createGain();let r=ze(t)?10**(e.toneCalDb/20):t===`pink`?.35:.5;e.testGain.gain.value=r,ze(t)?e.testOsc=Ae(n,e.testGain,t===`sine1k`?1e3:400):t===`pink`?e.testOsc=Me(n,e.testGain):t===`sweep`&&(e.testOsc=Re(e,n,e.testGain)),e.setupAudioGraph(e.testGain,!0),e.onStatusChange&&e.onStatusChange({type:`test`,label:`Test Generator (${t})`})}function Ve(e,t){if(e.toneCalDb=t,e.testGain&&e.ctx&&ze(e.testType)){let n=10**(t/20);try{e.testGain.gain.cancelScheduledValues(e.ctx.currentTime),e.testGain.gain.linearRampToValueAtTime(n,e.ctx.currentTime+.05)}catch{e.testGain.gain.value=n}}}function He(e,t){e.inputTrimDb=t,Ue(e)}function Ue(e){if(!e.inputGainNode||!e.ctx)return;let t=10**(e.inputTrimDb/20);e.inputGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function We(e,t){e.hpfEnabled=t,Ge(e)}function Ge(e){e.hpfNode&&e.ctx&&(e.hpfEnabled?e.hpfNode.frequency.setValueAtTime(80,e.ctx.currentTime):e.hpfNode.frequency.setValueAtTime(5,e.ctx.currentTime))}function Ke(e,t,n=null){e.monitorEnabled=t,n!==null&&(e.monitorVolume=n),Je(e)}function qe(e,t){e.monitorVolume=t,Je(e)}function Je(e){if(!e.monitorGainNode||!e.ctx)return;let t=e.monitorEnabled?e.monitorVolume:0;e.monitorGainNode.gain.setValueAtTime(t,e.ctx.currentTime)}function Ye(e,t,n=!1){let r=e.ctx;if(r){if(e.sourceNode=n?t:r.createMediaStreamSource(t),e.inputGainNode=r.createGain(),e.inputGainNode.channelCount=2,e.inputGainNode.channelCountMode=`explicit`,e.inputGainNode.channelInterpretation=`speakers`,Ue(e),e.hpfNode=r.createBiquadFilter(),e.hpfNode.type=`highpass`,e.hpfNode.frequency.setValueAtTime(80,r.currentTime),e.hpfNode.Q.setValueAtTime(.707,r.currentTime),Ge(e),e.monitorGainNode=r.createGain(),Je(e),e.monitorGainNode.connect(r.destination),e.splitterNode=r.createChannelSplitter(2),e.workletLoaded&&typeof AudioWorkletNode<`u`)try{e.processorNode=new AudioWorkletNode(r,u),e.processorNode.port.onmessage=t=>{t.data&&t.data.ch0&&t.data.ch1&&e.processAudioBlockBuffers(t.data.ch0,t.data.ch1)}}catch{e.processorNode=null}if(e.processorNode||(e.processorNode=r.createScriptProcessor(1024,2,2),e.processorNode.onaudioprocess=t=>e.processAudioBlock(t)),e.sourceNode&&e.inputGainNode&&e.hpfNode&&e.monitorGainNode&&e.processorNode){e.sourceNode.connect(e.inputGainNode),e.inputGainNode.connect(e.hpfNode),e.hpfNode.connect(e.monitorGainNode),e.hpfNode.connect(e.processorNode);let t=r.createGain();t.gain.value=0,e.processorNode.connect(t),t.connect(r.destination)}}}function Xe(e){if(e.sweepTimer&&=(clearInterval(e.sweepTimer),null),e.testOsc){try{e.testOsc.stop()}catch{}e.testOsc.disconnect(),e.testOsc=null}if(e.stream&&=(e.stream.getTracks().forEach(e=>e.stop()),null),e.sourceNode){try{e.sourceNode.disconnect()}catch{}e.sourceNode=null}if(e.processorNode){try{e.processorNode.port&&(e.processorNode.port.onmessage=null),e.processorNode.disconnect()}catch{}e.processorNode=null}e.sourceType=`none`,e.isSystemAudio=!1}function Ze(e,t,n=!1){e.refLevelDb=t,e.isRefDigital=n,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setRefLevel(t,n)}function Qe(e,t){e.peakSensTrim=t,e.wasmDsp&&e.wasmDsp.ready&&e.wasmDsp.setPeakTrim(t)}function $e(e){return e.isRefDigital?10**((-18-e.refLevelDb)/20):10**((4-e.refLevelDb)/20)}function et(e,t,n){if(!e.wasmDsp.ready||!e.wasmDsp.process(t,n,e.wasmResult))return!1;let r=e.wasmResult,i=e.currentLevels;i.vu[0]=r.vuL,i.vu[1]=r.vuR,i.vuDb[0]=v(r.vuL),i.vuDb[1]=v(r.vuR),i.ppm[0]=r.ppmFracL,i.ppm[1]=r.ppmFracR,i.ppmDb[0]=r.ppmDbL,i.ppmDb[1]=r.ppmDbR,i.dbfs[0]=r.dbfsA,i.dbfs[1]=r.dbfsB,i.dbfs[2]=r.dbfsSum,i.dbfs[3]=r.dbfsDiff,i.lufs.m=r.lufsM,i.lufs.s=r.lufsS,i.lufs.mL=r.lufsML,i.lufs.mR=r.lufsMR,i.phaseCorrelation=r.phaseCorr,i.hasAudio=r.hasAudio,i.peak[0]=r.peakA,i.peak[1]=r.peakB,i.phaseLed=ue(r.phaseCorr,r.hasAudio);let a=r.blockEnergy>0?r.blockEnergy:r.lufsM>-70?10**((r.lufsM+.691)/10):0;return(r.hasAudio||a>125e-9)&&a>125e-9&&ge(e.lufsState,a),i.lufs.i=_e(e.lufsState),ve(e.lufsState,r.lufsS),i.lufs.lra=ye(e.lufsState),!0}var tt=e=>e>1e-6?20*Math.log10(e):-120,nt=(e,t)=>e>0?Math.max(-60,10*Math.log10(e/t)):-60;function rt(e,t,n){let r=t.length,i=$e(e),a=m,o=e.vuState[0],s=e.vuState[1],c=e.ppmState[0],l=e.ppmState[1],u=e.lufsState.stage1[0],d=e.lufsState.stage1[1],f=e.lufsState.stage2[0],p=e.lufsState.stage2[1],h=!1,g=!1,y=!1,b=0,x=0,S=0,C=0,ee=0,te=0,ne=0,re=0;for(let m=0;m<r;m++){let r=t[m]*i,v=n[m]*i,ae=Math.abs(r),w=Math.abs(v);_(e,o,ae*a),_(e,s,w*a);let oe=Math.abs(t[m]),ce=Math.abs(n[m]),le=Math.abs(t[m]+n[m]),ue=Math.abs(t[m]-n[m]);oe>b&&(b=oe),ce>x&&(x=ce),le>S&&(S=le),ue>C&&(C=ue),ne+=t[m]*t[m],re+=n[m]*n[m],(ae>1e-4||w>1e-4)&&(h=!0);let de=pe(e,f,fe(e,u,t[m])),me=pe(e,p,fe(e,d,n[m]));ee+=de*de,te+=me*me,ie(e,c,ae),ie(e,l,w),ae>=1&&(g=!0),w>=1&&(y=!0),se(e.phaseState,e.phaseAlpha,r,v)}let oe=e.peakSensTrim||0,ue=ae(c.env,oe),de=ae(l.env,oe),me=ce(e.phaseState,h);e.phaseState.correlation=me;let ge=le(me,h);e.phaseState.led=ge;let T=e.lufsState;be(e,ee/r,te/r,h);let xe=he(T.meanSquareM_L+T.meanSquareM_R),Se=he(T.meanSquareS_L+T.meanSquareS_R),Ce=_e(T),we=he(T.meanSquareM_L),Te=he(T.meanSquareM_R);ve(T,Se);let Ee=ye(T);e.currentLevels={vu:[o.p,s.p],ppm:[w(ue),w(de)],vuDb:[v(o.p),v(s.p)],ppmDb:[ue,de],dbfs:[tt(b),tt(x),tt(S),tt(C)],lufs:{m:xe,s:Se,i:Ce,lra:Ee,mL:we,mR:Te},rmsDb:[nt(ne,r),nt(re,r)],phaseCorrelation:me,phaseLed:ge,peak:[g,y],hasAudio:h}}var it=new class{ctx=null;sourceNode=null;stream=null;isSystemAudio=!1;activeDeviceId=null;sourceType=`none`;inputGainNode=null;inputTrimDb=0;hpfNode=null;hpfEnabled=!1;monitorGainNode=null;monitorEnabled=!1;monitorVolume=.7;splitterNode=null;processorNode=null;testOsc=null;testGain=null;testType=`none`;toneCalDb=-18;sweepTimer=null;vuStyle=`simpson`;vuBallisticPreset=`standard_vu`;vuCoeffs=n();vuState=r();ppmAttack=.005;ppmType=2;ppmBallisticPreset=`type2`;ppmDecayDbPerSec=24/2.8;peakSensTrim=0;ppmState=i();phaseAlpha=.001;phaseState=a();refLevelDb=4;isRefDigital=!1;domain=`analog`;lufsState=o();currentLevels=s();onStatusChange=null;onDevicesChange=null;workletLoaded=!1;vuB0=0;vuB1=0;vuB2=0;vuA1=0;vuA2=0;ppmAttCoeff=0;ppmDecCoeff=0;kShelf_b0=0;kShelf_b1=0;kShelf_b2=0;kShelf_a1=0;kShelf_a2=0;kHp_b0=0;kHp_b1=0;kHp_b2=0;kHp_a1=0;kHp_a2=0;lufsAlphaM=0;lufsAlphaS=0;wasmDsp=new t;wasmResult=c();ensureContext(){return Ce(this)}initWorklet(){return we(this)}calculateCoefficients(){Se(this)}setVuStyle(e){y(this,e)}setVuBallisticPreset(e){b(this,e)}vuDbOf(e){return v(e)}getAudioInputDevices(){return Te()}connectSoundCard(e=null){return Oe(this,e)}connectSystemAudio(){return ke(this)}startTestGenerator(e=`sine1k`){Be(this,e)}setToneCalibration(e){Ve(this,e)}setupAudioGraph(e,t=!1){Ye(this,e,t)}stopCurrentSource(){Xe(this)}processAudioBlock(e){let t=e.inputBuffer.getChannelData(0),n=e.inputBuffer.numberOfChannels>1?e.inputBuffer.getChannelData(1):t;this.processAudioBlockBuffers(t,n)}processAudioBlockBuffers(e,t){et(this,e,t)||rt(this,e,t)}getLevels(){return this.currentLevels}setHighPass(e){We(this,e)}updateHpfState(){Ge(this)}setInputTrim(e){He(this,e)}updateInputGain(){Ue(this)}setMonitor(e,t=null){Ke(this,e,t)}setMonitorVolume(e){qe(this,e)}updateMonitorState(){Je(this)}setReferenceLevel(e,t=!1){Ze(this,e,t)}setPeakSensTrim(e){Qe(this,e)}setPpmType(e){re(this,e)}resetLoudness(){xe(this)}},E=3200,at=[373,1002,2198,2827],D={x:1380,y:80,w:440,h:98},ot={MODE:1385,SOURCE:1499,DOWN:1613,UP:1727},O={x0:1438,pitch:46,cy:42,count:8},st=8.2,ct={x:1540,y:80,w:120,h:56},lt={bx:22,by:18},ut={input1X:687.5,input2X:2512.5,input2LineX0:1912};function k(e){return 10**((e-3)/20)}function A(e,t=!1){return t?-50+100*Math.max(-.03,Math.min(1.08,e)):-45+90*Math.max(-.03,Math.min(1.08,e))}function dt(e){return e===null||!Number.isFinite(e)?-.12:e>=-12?(e+12)/24:-.12*(1-10**((e+12)/20))}function j(e,t=!1){return t?-50+100*Math.max(-.13,Math.min(1.08,e)):-45+90*Math.max(-.13,Math.min(1.08,e))}function ft(e){return e?-50:-45}var pt={" ":[0,0,0,0,0,0,0],"-":[0,0,0,31,0,0,0],"/":[0,1,2,4,8,16,0],".":[0,0,0,0,0,12,12],":":[0,12,12,0,12,12,0],"+":[0,4,4,31,4,4,0],"%":[24,25,2,4,8,19,3],0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[31,2,4,2,1,17,14],4:[2,6,10,18,31,2,2],5:[31,16,30,1,1,17,14],6:[6,8,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,2,12],A:[14,17,17,17,31,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[28,18,17,17,17,18,28],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],a:[0,0,14,1,15,17,15],b:[16,16,22,25,17,17,30],c:[0,0,14,16,16,17,14],d:[1,1,13,19,17,17,15],e:[0,0,14,17,31,16,14],f:[6,9,8,28,8,8,8],g:[0,15,17,17,15,1,14],h:[16,16,22,25,17,17,17],i:[4,0,12,4,4,4,14],k:[16,16,18,20,24,20,18],l:[12,4,4,4,4,4,14],m:[0,0,26,21,21,17,17],n:[0,0,22,25,17,17,17],o:[0,0,14,17,17,17,14],p:[0,0,30,17,30,16,16],r:[0,0,22,25,16,16,16],s:[0,0,14,16,14,1,30],t:[8,8,28,8,8,9,6],u:[0,0,17,17,17,19,13],v:[0,0,17,17,17,10,4],w:[0,0,17,17,21,21,10],x:[0,0,17,10,4,10,17],y:[0,0,17,17,15,1,14],z:[0,0,31,2,4,8,31]};function mt(e,t,n,r,i,a){let o=``,s=r*.38;for(let c=0;c<e.length;c++){let l=pt[e[c]??` `]??pt[` `],u=t+c*r*6.2;for(let e=0;e<7;e++){let t=l[e]??0;for(let c=0;c<5;c++){let l=t>>4-c&1;o+=`<circle cx="${(u+c*r).toFixed(1)}" cy="${(n+e*r).toFixed(1)}" r="${s.toFixed(2)}" fill="${l?i:a}"/>`}}}return o}var ht={0:`abcdef`,1:`bc`,2:`abged`,3:`abgcd`,4:`fgbc`,5:`afgcd`,6:`afgedc`,7:`abc`,8:`abcdefg`,9:`abcdfg`,"-":`g`," ":``};function gt(e,t){let n=t.x+(t.w-82)/2,r=t.y+(t.h-48)/2,i=``;return[...e.padStart(2).slice(-2)].forEach((e,t)=>{let a=n+t*48+3,o=r,s={a:[a+3,o,28,6],d:[a+3,o+48-6,28,6],g:[a+3,o+24-3,28,6],f:[a-3+1,o+3,6,18],b:[a+34-3-1,o+3,6,18],e:[a-3+1,o+24+3,6,18],c:[a+34-3-1,o+24+3,6,18]},c=ht[e]??``;for(let e of`abcdefg`){let t=s[e];i+=`<rect x="${t[0].toFixed(1)}" y="${t[1].toFixed(1)}" width="${t[2]}" height="${t[3]}" rx="2" fill="${c.includes(e)?`#ff2d1f`:`rgba(255,45,31,0.09)`}" transform="skewX(-6)" transform-origin="${(a+17).toFixed(1)} ${(o+24).toFixed(1)}"/>`}}),i}function _t(e,t){return(n,r)=>{let i=n*Math.PI/180;return[e+r*Math.sin(i),t-r*Math.cos(i)]}}function vt(e){return(t,n,r,i,a)=>{let[o,s]=e(t,r),[c,l]=e(n,r);return`<path d="M${o.toFixed(1)} ${s.toFixed(1)} A${r} ${r} 0 0 1 ${c.toFixed(1)} ${l.toFixed(1)}" fill="none" stroke="${a}" stroke-width="${i}"/>`}}function M(e,t,n,r,i,a){let[o,s]=e(t,n),[c,l]=e(t,r);return`<line x1="${o.toFixed(1)}" y1="${s.toFixed(1)}" x2="${c.toFixed(1)}" y2="${l.toFixed(1)}" stroke="${i}" stroke-width="${a}"/>`}var yt=`#ef4444`;function bt(e,t,n,r,i){let a=e=>j((e+12)/24,i),o=yt,s=t=>t-e.offset,c=n(a(s(e.redFrom)),a(12),273,16,o);for(let n of e.minors){let i=s(n);i<-12||i>12||(c+=M(t,a(i),265,279,n>=e.redFrom?o:r,4))}for(let n of e.majors){let i=s(n);if(i<-12||i>12)continue;let l=n>=e.redFrom?o:r;c+=M(t,a(i),265,289,l,4);let[u,d]=t(a(i),313);c+=`<text x="${u.toFixed(1)}" y="${(d+8).toFixed(1)}" font-size="${e.fmt(n).length>3?22:26}" font-weight="700" text-anchor="middle" fill="${l}">${e.fmt(n)}</text>`}let[l,u]=t(0,195);return c+=`<text x="${l.toFixed(1)}" y="${u.toFixed(1)}" font-size="18" font-weight="800" letter-spacing="2" text-anchor="middle" fill="${r}" opacity="0.8">${e.caption}</text>`,c}var xt={offset:-9,majors:[-20,-15,-10,-5,0,3],minors:[-17.5,-12.5,-7.5,-2.5,1,2],redFrom:0,caption:`DIN`,fmt:e=>e>0?`+`+e:String(e)},St={offset:0,majors:[-12,-6,0,6,9,12],minors:[-9,-3,3],redFrom:9,caption:`NORDIC`,fmt:e=>e===0?`TEST`:e>0?`+`+e:String(e)},Ct={offset:-18,majors:[-30,-24,-18,-12,-6],minors:[-27,-21,-15,-9],redFrom:-9,caption:`dBFS`,fmt:e=>String(e)},wt=`#facc15`;function Tt(e,t){let{P:n,arc:r,ink:i,isSifam:a}=e,o=r(j(18/24,a),j(1,a),273,16,wt);for(let e=-12;e<=12;e+=2){let r=j((e+12)/24,a),s=e>=6&&t?`#facc15`:i;o+=M(n,r,265,265+(e%4?14:24),s,4)}return[-12,-8,-4,0,4,8,12].forEach(e=>{let r=j((e+12)/24,a),[s,c]=n(r,313),l=e>=8&&t?`#facc15`:i;o+=`<text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),o}function Et(e){let{P:t,arc:n,ink:r,isSifam:i}=e,a=e=>j((e+12)/24,i),o=`<g class="mc-only">`;o+=n(a(8),a(12),274,18,`#e3c22a`),o+=n(a(8),a(12),268,1.6,`#1a1a1a`)+n(a(8),a(12),280,1.6,`#1a1a1a`);for(let e=-12;e<=12;e+=2){let n=e%4==0;o+=M(t,a(e),n?249:265,n?285:277,r,n?4:3)}let s=(e,t,n,i=24)=>`<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-size="${i}" font-weight="500" text-anchor="middle" dominant-baseline="central" fill="${r}" font-family="Helvetica, Arial, sans-serif">${n}</text>`;[-12,-8,-4,4,8,12].forEach(e=>{let[n,r]=t(a(e),309);o+=s(n,r,String(Math.abs(e)))});let[c,l]=t(a(0),295);o+=s(c,l-34,`TONE`)+s(c,l-4,`&#8722; | +`,22),[-12,-8,-4,0,4,8,12].forEach(e=>{let n=e+8,[r,i]=t(a(e),223);o+=s(r,i,n>0?`+`+n:String(n))});let[u,d]=t(j(.9,i),357);return o+=s(u,d,`PGM`),o+=`</g>`,o}var Dt={type1:xt,nordic:St,fast_peak:Ct};function Ot(e){return Dt[e]??St}function kt(e,t,n){let{P:r,arc:i,ink:a,isSifam:o}=e,s=i(j(0,o),j(1,o),265,4,a);return s+=`<g class="wbs-only">`,s+=t===`type2`?Tt(e,n):bt(Ot(t),r,i,a,o),s+=`</g>`,s+=Et(e),s}function At(e,t,n){return`
        <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${n+6}" stroke="rgba(0,0,0,0.30)" stroke-width="3.5" stroke-linecap="round"/>
      `}function jt(e,t,n,r,i){return`
      <g id="xtm_needle_${e}" transform="rotate(${t} ${n} ${r})">
        ${i.shadow}
        ${i.body}
      </g>`}var Mt=`#dc2626`,Nt=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],Pt=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],Ft=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function It(e){let{P:t,arc:n,ink:r,isSifam:i}=e,a=Mt,o=``;return o+=n(A(k(-20),i),A(k(0),i),265,3.8,r),o+=n(A(k(0),i),A(k(3),i),268,10,a),Nt.forEach(e=>{let n=A(k(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=M(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),Pt.forEach(e=>{let n=A(k(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=M(t,n,265,289,l,`4.2`)+`
              <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),Ft.forEach(({pc:e,d:n})=>{let a=A(k(n),i),[s,c]=t(a,257),[l,u]=t(a,233);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="4.2" fill="${r}"/>
              <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function Lt(e){let{P:t,ink:n}=e,r=Math.abs(A(k(1),!0)),[i,a]=t(-r,337),[o,s]=t(r,337);return`<text x="${i.toFixed(1)}" y="${a.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${n}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>
              <text x="${o.toFixed(1)}" y="${s.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${Mt}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>`}function Rt(e,t,n){let r=t-(n+34);return{shadow:`
          <line x1="${e+2}" y1="${t+2}" x2="${e+2}" y2="${r+4}" stroke="rgba(0,0,0,0.30)" stroke-width="3.2" stroke-linecap="round"/>
        `,body:`
          <polygon points="${e-2.8},${t} ${e+2.8},${t} ${e+.8},${r} ${e-.8},${r}" fill="#0b0c0e"/>
          <line x1="${e-.5}" y1="${t}" x2="${e-.5}" y2="${r+4}" stroke="rgba(255,255,255,0.35)" stroke-width="1.1"/>
          <circle cx="${e}" cy="${t}" r="8" fill="#0b0c0e"/>
          <circle cx="${e}" cy="${t}" r="3.5" fill="#334155"/>
        `}}function zt(e,t,n){let r=t-(n+34);return{shadow:At(e,t,r),body:`
          <polygon points="${e-3.8},${t} ${e+3.8},${t} ${e+1.2},${r} ${e-1.2},${r}" fill="#ffd600"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var Bt={isSifam:!0,legend:Lt,vuNeedle:Rt,ppmNeedle:zt};function Vt(e){let{ink:t,x0:n,y0:r}=e;return`<text x="${(n+56).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${t}">VU</text>
              <text x="${(n+580-56).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${Mt}" text-anchor="end">VU</text>`}function Ht(e,t,n){let r=t-(n+24);return{shadow:`
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
        `}}function Ut(e,t,n){let r=t-(n+34);return{shadow:At(e,t,r),body:`
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(255,214,0,0.22)" stroke-width="7.5" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="#ffd600" stroke-width="4.6" stroke-linecap="round"/>
          <line x1="${e}" y1="${t}" x2="${e}" y2="${r+2}" stroke="#fffbe6" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="${e}" cy="${t}" r="7" fill="#14181f"/>
          <circle cx="${e}" cy="${t}" r="3" fill="#ffd600"/>
        `}}var Wt={isSifam:!1,legend:Vt,vuNeedle:Ht,ppmNeedle:Ut},Gt={isSifam:!1,legend:Wt.legend,vuNeedle:Wt.vuNeedle,ppmNeedle:Wt.ppmNeedle},Kt=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],qt=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],Jt=[{pc:0,d:-20},{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function Yt(e){let{ink:t,x0:n,y0:r}=e;return`<text x="${(n+56).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${t}">VU</text>
          <text x="${(n+580-56).toFixed(0)}" y="${r+58}" font-size="26" font-weight="800" fill="${Mt}" text-anchor="end">VU</text>`}function Xt(e){let{P:t,arc:n,ink:r,isSifam:i}=e,a=Mt,o=``;return o+=n(A(k(-20),i),A(k(0),i),265,3.8,r),o+=n(A(k(0),i),A(k(3),i),268,10,a),Kt.forEach(e=>{let n=A(k(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=M(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),qt.forEach(e=>{let n=A(k(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=M(t,n,265,289,l,`4.2`)+`
      <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),o+=n(A(k(-20),i),A(k(0),i),255,2.2,a),Jt.forEach(({pc:e,d:n})=>{let r=A(k(n),i),[s,c]=t(r,255),[l,u]=t(r,231);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="4.2" fill="${a}"/>
      <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="800" text-anchor="middle" fill="${a}">${e}</text>`}),o}var Zt={isSifam:!1,legend:Yt,vuNeedle:Wt.vuNeedle,ppmNeedle:Wt.ppmNeedle,renderScale:Xt},Qt=`rgb(244, 144, 44)`,$t=[-15,-8.5,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5],en=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3],tn=[{pc:20,d:-14},{pc:40,d:-8},{pc:60,d:-4.4},{pc:80,d:-1.9},{pc:100,d:0}];function nn(e){let{ink:t,x0:n,y0:r}=e,i=n+60,a=n+580-60,o=r+52;return`
    <text x="${i.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${t}" transform="rotate(-26, ${i.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5">VU</text>
    <text x="${a.toFixed(0)}" y="${o.toFixed(0)}" font-size="24" font-weight="700" fill="${Mt}" transform="rotate(26, ${a.toFixed(0)}, ${o.toFixed(0)})" letter-spacing="0.5" text-anchor="end">VU</text>`}function rn(e){let{P:t,arc:n,ink:r,isSifam:i}=e,a=Mt,o=``;return o+=n(A(k(-20),i),A(k(0),i),265,3.8,r),o+=n(A(k(0),i),A(k(3),i),268,10,a),$t.forEach(e=>{let n=A(k(e),i),s=Math.abs(e)<=3?12:14,c=e>0?a:r;o+=M(t,n,265,265+s,c,Math.abs(e)<=3?`2.5`:`3`)}),en.forEach(e=>{let n=A(k(e),i),[s,c]=t(n,311),l=e>0?a:r;o+=M(t,n,265,289,l,`4.2`)+`
      <text x="${s.toFixed(1)}" y="${(c+8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${l}">${e>0?`+`+e:e}</text>`}),tn.forEach(({pc:e,d:n})=>{let a=A(k(n),i),[s,c]=t(a,255),[l,u]=t(a,231);o+=`<circle cx="${s.toFixed(1)}" cy="${c.toFixed(1)}" r="3.8" fill="${r}"/>
      <text x="${l.toFixed(1)}" y="${(u+6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${r}">${e}</text>`}),o}function an(e,t,n){let r=t-(n+24);return{shadow:`
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
        Z" fill="${Qt}"/>
      <line x1="${e}" y1="${t-5}" x2="${e}" y2="${r+4}" stroke="rgba(255,255,255,0.40)" stroke-width="0.8"/>
      <circle cx="${e}" cy="${t}" r="7" fill="${Qt}"/>
      <circle cx="${e}" cy="${t}" r="3" fill="#2d3748"/>
    `}}function on(e,t,n){let r=t-(n+34);return{shadow:At(e,t,r),body:`
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="rgba(244, 144, 44, 0.28)" stroke-width="7.5" stroke-linecap="round"/>
      <line x1="${e}" y1="${t}" x2="${e}" y2="${r}" stroke="${Qt}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${e}" cy="${t}" r="7" fill="#141008"/>
      <circle cx="${e}" cy="${t}" r="3" fill="${Qt}"/>
    `}}var sn={sifam:Bt,simpson:Wt,standard_vu:Gt,mccurdy_vu:Zt,wbs_m405:{isSifam:!1,legend:nn,vuNeedle:an,ppmNeedle:on,renderScale:rn}};function cn(e){return sn[e]??Wt}var ln={id:`amber`,gradientId:`xamber`,bloom:!0,gradient:`<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`},un={id:`white`,gradientId:`xwhite`,bloom:!1,gradient:`<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`},dn={id:`parchment`,gradientId:`xparchment`,bloom:!0,gradient:`<radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>`},fn=`<radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`;function pn(e){return e===`white`?un:e===`parchment`?dn:ln}function mn(e){return`url(#${pn(e).gradientId})`}function hn(e){return e!==`white`}var gn=`<radialGradient id="xblackppm" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`;function _n(e,t,n){let r=`#171512`,i=`#141008`;return e?(r=t?`url(#xblackppm)`:`#0a0b0d`,i=t?`#f8fafc`:`#475569`):t?(r=mn(n),i=`#141008`):i=`#0c0a06`,{fill:r,ink:i}}var vn=`M2.43 4.14 C2.43 8.26 2.43 13.33 2.43 17.45 C2.43 20.03 31.29 20.41 33.55 20.41 C37.4 20.41 36.81 20.41 40.67 20.41 C42.87 20.41 71.66 20.03 71.66 17.45 L71.66 4.14 C71.66 1.57 42.82 1.26 40.67 1.23 L33.55 1.23 C31.29 1.23 2.43 1.57 2.43 4.14 Z M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z M7.82 6.09 L13.37 16.43 L15.16 16.43 L9.61 6.09 L7.82 6.09 Z M17.85 6.09 L18.93 6.09 L18.59 6.09 L19.64 6.09 L15.16 16.43 L14.27 14.58 L17.87 6.03 L17.85 6.09 Z M18.74 6.09 L23.4 16.43 L25.19 16.43 L20.53 6.09 L18.74 6.09 Z M25.19 16.43 L30.56 6.09 L28.77 6.09 L24.29 14.58 L25.19 16.43 Z M32.53 6.09 L32.53 16.43 L34.32 16.43 L34.32 6.09 L32.53 6.09 Z M34.32 6.09 L46.14 6.09 L45.24 7.94 L34.32 7.94 L34.32 6.09 Z M45.24 7.94 L46.14 6.09 L47.57 7.01 L46.14 8.49 L45.24 7.94 Z M47.57 7.01 L47.93 7.94 L46.14 8.49 L47.57 7.01 Z M47.93 7.94 L46.14 8.49 L46.14 9.78 L47.93 10.34 L47.93 7.94 Z M47.93 10.34 L46.14 9.78 L45.78 10.34 L47.03 11.26 L47.93 10.34 Z M47.03 11.26 L45.78 12.18 L46.14 12.55 L47.93 12.18 L47.03 11.26 Z M47.93 12.18 L47.93 14.58 L46.14 14.03 L46.14 12.55 L47.93 12.18 Z M47.93 14.58 L47.57 15.51 L46.14 14.03 L47.93 14.58 Z M47.57 15.51 L46.14 16.43 L45.24 14.58 L46.14 14.03 L47.57 15.51 Z M46.14 16.43 L45.24 14.58 L34.32 14.58 L34.32 16.43 L46.14 16.43 Z M34.32 10.34 L34.32 12.18 L45.78 12.18 L45.78 10.34 L34.32 10.34 Z M45.78 10.34 L45.78 12.18 L47.03 11.26 L45.78 10.34 Z M66.19 7.94 L66.19 6.09 L51.69 6.09 L52.58 7.94 L66.19 7.94 Z M52.58 7.94 L51.69 6.09 L50.25 7.01 L51.69 8.49 L52.58 7.94 Z M51.69 8.49 L50.25 7.01 L49.9 7.94 L51.69 8.49 Z M49.9 7.94 L51.69 8.49 L51.69 9.78 L49.9 10.34 L49.9 7.94 Z M49.9 10.34 L51.69 9.78 L51.69 9.78 L50.25 11.26 L49.9 10.34 Z M51.69 9.78 L50.25 11.26 L51.69 12.18 L52.58 10.34 L51.69 9.78 Z M51.69 12.18 L52.58 10.34 L64.4 10.34 L63.5 12.18 L51.69 12.18 Z M63.5 12.18 L64.4 10.34 L65.83 11.26 L64.4 12.55 L63.5 12.18 Z M65.83 11.26 L64.4 12.55 L66.19 12.18 L65.83 11.26 Z M64.4 12.55 L66.19 12.18 L66.19 14.58 L64.4 14.03 L64.4 12.55 Z M66.19 14.58 L65.83 15.51 L64.4 14.03 L66.19 14.58 Z M65.83 15.51 L64.4 14.03 L63.5 14.58 L64.4 16.43 L65.83 15.51 Z M63.5 14.58 L64.4 16.43 L49.9 16.43 L49.9 14.58 L63.5 14.58 Z`;function yn(e,t,n){return`<g class="wbs-only" transform="translate(${(e-44.5).toFixed(1)}, ${(t+22).toFixed(1)}) scale(1.2)">
              <path d="${vn}" fill="${n}" fill-rule="evenodd"/>
            </g>`}function bn(e,t,n){let r=e-42,i=t+16;return`
    <!-- McCurdyRadio.com ATS-100 Cream Console: Authentic Cartouche Box & Wordmark -->
    <g class="mc-only mc-com-only" transform="translate(${(e-42).toFixed(1)}, ${(t+22).toFixed(1)})">
      <rect x="0" y="0" width="84" height="28" rx="2.5"
            fill="none" stroke="${n}" stroke-width="1.5" stroke-opacity="0.85" />
      <text x="42" y="19"
            font-family="'Arial Black', Helvetica, Arial, sans-serif"
            font-size="13.5" font-weight="900" letter-spacing="-0.6" text-anchor="middle"
            fill="none" stroke="${n}" stroke-width="1.2" stroke-opacity="0.9">McCurdy</text>
    </g>

    <!-- McCurdyRadio.ca Vintage Metallic Blue: Authentic Shield Logo with Blue Field -->
    <g class="mc-only mc-ca-only">
      <svg x="${r.toFixed(1)}" y="${i.toFixed(1)}" width="84" height="39" viewBox="100 85 800 370" aria-hidden="true">
        <defs>
          <linearGradient id="mcShieldBlueVu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e3a5f"/>
            <stop offset="50%" stop-color="#2a5280"/>
            <stop offset="100%" stop-color="#142842"/>
          </linearGradient>
        </defs>
        <!-- Symmetrical Shield Border & Metallic Blue Field -->
        <path d="M 140,185 Q 132,160 165,155 L 475,112 Q 500,108 525,112 L 835,155 Q 868,160 860,185 L 785,375 Q 775,398 748,402 L 525,442 Q 500,446 475,442 L 252,402 Q 225,398 215,375 Z"
              fill="url(#mcShieldBlueVu)" stroke="#d9e2e8" stroke-width="24" stroke-linejoin="round"/>
        <!-- Lowercase 'm' with extended crossbar -->
        <path d="M 248,175 L 322,175 L 322,200 C 342,178 368,170 394,173 C 418,176 434,188 444,206 C 464,180 494,170 524,173 C 564,177 586,206 586,250 L 586,322 L 782,322 L 770,350 L 586,350 L 586,362 L 608,362 L 608,385 L 498,385 L 498,362 L 520,362 L 520,350 L 452,350 L 452,322 L 520,322 L 520,255 C 520,230 508,218 488,218 C 468,218 454,232 454,258 L 454,305 L 390,305 L 390,255 C 390,230 378,218 358,218 C 338,218 324,232 324,258 L 324,362 L 346,362 L 346,385 L 248,385 L 248,362 L 268,362 L 268,200 L 248,200 Z"
              fill="#f4f6f8"/>
        <!-- CCURDY Lettering -->
        <g fill="#f4f6f8" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800" letter-spacing="1.5">
          <text x="598" y="258" font-size="32">C</text>
          <text x="622" y="272" font-size="44">CURDY</text>
        </g>
      </svg>
    </g>`}var xn=`<linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
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
        </radialGradient>`;function Sn(e,t){return`
      <!-- Recessed Chamber Inner Glass Shadows -->
      <rect x="${e}" y="${t}" width="580" height="28" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${e}" y="${t+290-28}" width="580" height="28" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${e}" y="${t}" width="20" height="290" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${e+580-20}" y="${t}" width="20" height="290" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${e+1}" y="${t+1}" width="578" height="288" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen -->
      <path d="M ${e+6} ${t+6} L ${e+580*.72} ${t+6} L ${e+6} ${t+290*.82} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${e+6}" y="${(t+127.6).toFixed(1)}" width="568" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>
    </g>`}function Cn(e,t,n=e+290){let r=n-304,i=n-274,a=`M ${r+14} 47 h 580 a 14 14 0 0 1 14 14 v 332 a 14 14 0 0 1 -14 14 h -580 a 14 14 0 0 1 -14 -14 v -332 a 14 14 0 0 1 14 -14 Z M ${i+7} 65 h 534 a 7 7 0 0 1 7 7 v 198 a 7 7 0 0 1 -7 7 h -534 a 7 7 0 0 1 -7 -7 v -198 a 7 7 0 0 1 7 -7 Z`,o=n-289,s=`M ${o+8} 56 h 562 a 8 8 0 0 1 8 8 v 270 a 8 8 0 0 1 -8 8 h -562 a 8 8 0 0 1 -8 -8 v -270 a 8 8 0 0 1 8 -8 Z M ${i+7} 65 h 534 a 7 7 0 0 1 7 7 v 198 a 7 7 0 0 1 -7 7 h -534 a 7 7 0 0 1 -7 -7 v -198 a 7 7 0 0 1 7 -7 Z`;return`
    <!-- Modern Sleek Bezel (Ward-Beck.com / McCurdyRadio.com) -->
    <g class="modern-bezel">
      <path d="M${e-4} ${t+290-24} L${e-4} ${t+290-18} A24 24 0 0 0 ${e+18} ${t+290+4} L${e+580-18} ${t+290+4} A24 24 0 0 0 ${e+580+4} ${t+290-18} L${e+580+4} ${t+290-24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
      <rect x="${e-2}" y="${t-2}" width="584" height="294" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
      <rect x="${e}" y="${t}" width="580" height="290" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>
    </g>

    <!-- McCurdyRadio.ca Vintage 3D Molded Bakelite Bezel Housing (Full Thickness) -->
    <g class="vintage-bezel-3d bezel-mc">
      <!-- Molded Housing Body -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.8" d="${a}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${r+16} 49 L ${r+608-16} 49" stroke="#484d56" stroke-width="1.4" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${r+6}" y="53" width="596" height="348" rx="11" fill="none" stroke="#25272c" stroke-width="1.0" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${i-2}" y="63" width="552" height="216" rx="9" fill="none" stroke="#08090b" stroke-width="2.5" pointer-events="none"/>
      <rect x="${i}" y="65" width="548" height="212" rx="7" fill="none" stroke="#2b2e34" stroke-width="1.4" stroke-opacity="0.85" pointer-events="none"/>

      <!-- Window Inner Shadows & Specular Glass Reflection Sheen -->
      <rect x="${i}" y="65" width="548" height="22" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${i}" y="259" width="548" height="18" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${i}" y="65" width="16" height="212" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${i+548-16}" y="65" width="16" height="212" fill="url(#xch_right)" pointer-events="none"/>
      <path d="M ${i+6} 71 L ${i+356.2} 71 L ${i+6} 265 Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${i+6}" y="${154.04.toFixed(1)}" width="536" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${r+2}" y1="292" x2="${r+608-2}" y2="292" stroke="#0c0d0f" stroke-width="2.0" pointer-events="none"/>
      <line x1="${r+2}" y1="293.8" x2="${r+608-2}" y2="293.8" stroke="#2c2f36" stroke-width="1.1" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt -->
      <g class="trim-screw-interactive" transform="translate(${n}, 344)">
        <circle cx="0" cy="0" r="18" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="16.5" fill="none" stroke="#08090a" stroke-width="0.9"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="14.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.1"/>
          <rect x="-12.5" y="-2.0" width="25" height="4.0" rx="0.9" fill="#090a0c"/>
          <line x1="-11.8" y1="2.1" x2="11.8" y2="2.1" stroke="#4e525b" stroke-width="0.8"/>
        </g>
      </g>
    </g>

    <!-- Ward-Beck.ca Vintage 3D Molded Bakelite Bezel Housing (1/2 Thickness of McCurdy) -->
    <g class="vintage-bezel-3d bezel-wbs">
      <!-- Molded Housing Body -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.1" d="${s}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${o+10} 57.5 L ${o+578-10} 57.5" stroke="#484d56" stroke-width="1.0" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${o+4}" y="60" width="570" height="278" rx="6" fill="none" stroke="#25272c" stroke-width="0.8" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${i-1.5}" y="63.5" width="551" height="215" rx="8" fill="none" stroke="#08090b" stroke-width="1.6" pointer-events="none"/>
      <rect x="${i}" y="65" width="548" height="212" rx="7" fill="none" stroke="#2b2e34" stroke-width="1.0" stroke-opacity="0.85" pointer-events="none"/>

      <!-- Window Inner Shadows & Specular Glass Reflection Sheen -->
      <rect x="${i}" y="65" width="548" height="18" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${i}" y="263" width="548" height="14" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${i}" y="65" width="12" height="212" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${i+548-12}" y="65" width="12" height="212" fill="url(#xch_right)" pointer-events="none"/>
      <path d="M ${i+6} 71 L ${i+356.2} 71 L ${i+6} 265 Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${i+6}" y="${154.04.toFixed(1)}" width="536" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${o+2}" y1="285" x2="${o+578-2}" y2="285" stroke="#0c0d0f" stroke-width="1.4" pointer-events="none"/>
      <line x1="${o+2}" y1="286.2" x2="${o+578-2}" y2="286.2" stroke="#2c2f36" stroke-width="0.8" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt -->
      <g class="trim-screw-interactive" transform="translate(${n}, 314)">
        <circle cx="0" cy="0" r="13" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.0"/>
        <circle cx="0" cy="0" r="11.8" fill="none" stroke="#08090a" stroke-width="0.7"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="10.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="0.9"/>
          <rect x="-8.5" y="-1.5" width="17" height="3.0" rx="0.6" fill="#090a0c"/>
          <line x1="-8.0" y1="1.6" x2="8.0" y2="1.6" stroke="#4e525b" stroke-width="0.6"/>
        </g>
      </g>
    </g>`}function wn(e,t,n){let r=e+85,i=t-25;return`
    <!-- VU Meter Shattered Glass Fracture Overlay -->
    <g class="vu-glass-shatter" id="vu_shatter_${n}" style="display: none; pointer-events: none;">
      <!-- Subtle fractured glass desaturation / micro-crystalline veil -->
      <radialGradient id="shatterGlow_${n}" cx="${r}" cy="${i}" r="220" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="25%" stop-color="#ffffff" stop-opacity="0.18"/>
        <stop offset="60%" stop-color="#c8e4f5" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.0"/>
      </radialGradient>
      <circle cx="${r}" cy="${i}" r="210" fill="url(#shatterGlow_${n})"/>

      <!-- Primary Impact Center Crater -->
      <circle cx="${r}" cy="${i}" r="4.5" fill="#ffffff" opacity="0.9"/>
      <circle cx="${r}" cy="${i}" r="9" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.85"/>
      <circle cx="${r}" cy="${i}" r="15" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.7"/>

      <!-- Dark Crevice Fracture Shadows (Depth behind cracks) -->
      <g stroke="#05070a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" fill="none">
        <!-- Radial Spiderweb Crevices -->
        <path d="M ${r} ${i} L ${r-35} ${i-22} L ${r-85} ${i-38} L ${r-145} ${i-42} L ${r-220} ${i-65} L ${r-280} ${i-85}" />
        <path d="M ${r} ${i} L ${r-28} ${i+15} L ${r-72} ${i+48} L ${r-130} ${i+82} L ${r-195} ${i+115} L ${r-260} ${i+130}" />
        <path d="M ${r} ${i} L ${r-45} ${i-8} L ${r-110} ${i-12} L ${r-180} ${i+18} L ${r-250} ${i+35} L ${r-310} ${i+42}" />
        <path d="M ${r} ${i} L ${r-12} ${i-40} L ${r-35} ${i-75} L ${r-65} ${i-115} L ${r-95} ${i-145}" />
        <path d="M ${r} ${i} L ${r+25} ${i-28} L ${r+60} ${i-55} L ${r+95} ${i-80} L ${r+125} ${i-105}" />
        <path d="M ${r} ${i} L ${r+35} ${i+18} L ${r+75} ${i+42} L ${r+115} ${i+75} L ${r+145} ${i+110}" />
        <path d="M ${r} ${i} L ${r+18} ${i+38} L ${r+32} ${i+85} L ${r+45} ${i+135}" />
        <path d="M ${r} ${i} L ${r-18} ${i+42} L ${r-38} ${i+95} L ${r-62} ${i+145}" />

        <!-- Concentric Fractures -->
        <path d="M ${r-28} ${i-18} L ${r-35} ${i-6} L ${r-22} ${i+12} L ${r+15} ${i+14} L ${r+22} ${i-12} Z" />
        <path d="M ${r-65} ${i-30} L ${r-78} ${i+5} L ${r-52} ${i+38} L ${r+28} ${i+32} L ${r+55} ${i-22} L ${r+18} ${i-48} Z" />
        <path d="M ${r-125} ${i-36} L ${r-142} ${i+15} L ${r-105} ${i+68} L ${r-30} ${i+82} L ${r+62} ${i+36} L ${r+85} ${i-48} L ${r-25} ${i-72} Z" />
        <path d="M ${r-195} ${i-55} L ${r-215} ${i+28} L ${r-165} ${i+95} L ${r-75} ${i+125} L ${r+95} ${i+68} L ${r+118} ${i-75} L ${r-55} ${i-110} Z" />
      </g>

      <!-- Sharp White Specular Fractures & Cracks (Light-catching glass edges) -->
      <g stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none">
        <!-- Radial Cracks -->
        <path d="M ${r} ${i} L ${r-34} ${i-23} L ${r-84} ${i-39} L ${r-144} ${i-43} L ${r-219} ${i-66} L ${r-279} ${i-86}" />
        <path d="M ${r} ${i} L ${r-27} ${i+14} L ${r-71} ${i+47} L ${r-129} ${i+81} L ${r-194} ${i+114} L ${r-259} ${i+129}" />
        <path d="M ${r} ${i} L ${r-44} ${i-9} L ${r-109} ${i-13} L ${r-179} ${i+17} L ${r-249} ${i+34} L ${r-309} ${i+41}" />
        <path d="M ${r} ${i} L ${r-11} ${i-41} L ${r-34} ${i-76} L ${r-64} ${i-116} L ${r-94} ${i-146}" />
        <path d="M ${r} ${i} L ${r+26} ${i-27} L ${r+61} ${i-54} L ${r+96} ${i-79} L ${r+126} ${i-104}" />
        <path d="M ${r} ${i} L ${r+36} ${i+17} L ${r+76} ${i+41} L ${r+116} ${i+74} L ${r+146} ${i+109}" />
        <path d="M ${r} ${i} L ${r+19} ${i+37} L ${r+33} ${i+84} L ${r+46} ${i+134}" />
        <path d="M ${r} ${i} L ${r-17} ${i+41} L ${r-37} ${i+94} L ${r-61} ${i+144}" />

        <!-- Fine Micro-Fissures -->
        <path d="M ${r-45} ${i-8} L ${r-58} ${i-24} L ${r-72} ${i-28}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${r-110} ${i-12} L ${r-125} ${i+8} L ${r-148} ${i+14}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${r-72} ${i+48} L ${r-92} ${i+42} L ${r-118} ${i+52}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${r+35} ${i+18} L ${r+52} ${i+8} L ${r+78} ${i+6}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${r+60} ${i-55} L ${r+82} ${i-45} L ${r+105} ${i-52}" stroke-width="0.8" opacity="0.8" />

        <!-- Concentric Fractures -->
        <path d="M ${r-27} ${i-19} L ${r-34} ${i-7} L ${r-21} ${i+11} L ${r+16} ${i+13} L ${r+23} ${i-13} Z" />
        <path d="M ${r-64} ${i-31} L ${r-77} ${i+4} L ${r-51} ${i+37} L ${r+29} ${i+31} L ${r+56} ${i-23} L ${r+19} ${i-49} Z" />
        <path d="M ${r-124} ${i-37} L ${r-141} ${i+14} L ${r-104} ${i+67} L ${r-29} ${i+81} L ${r+63} ${i+35} L ${r+86} ${i-49} L ${r-24} ${i-73} Z" />
        <path d="M ${r-194} ${i-56} L ${r-214} ${i+27} L ${r-164} ${i+94} L ${r-74} ${i+124} L ${r+96} ${i+67} L ${r+119} ${i-76} L ${r-54} ${i-111} Z" />
      </g>

      <!-- Specular Shard Highlights (Prismatic glass facets) -->
      <polygon points="${r-35},${i-22} ${r-85},${i-38} ${r-78},${i+5} ${r-45},${i-8}" fill="#ffffff" opacity="0.08"/>
      <polygon points="${r+25},${i-28} ${r+60},${i-55} ${r+55},${i-22} ${r+22},${i-12}" fill="#ffffff" opacity="0.12"/>
      <polygon points="${r-72},${i+48} ${r-130},${i+82} ${r-105},${i+68} ${r-52},${i+38}" fill="#ffffff" opacity="0.09"/>
    </g>
  `}function Tn(e,t,n,r,i,a,o,s,c){let l=t-290,u=n-145,d=t,f=cn(s),p=s===`sifam`,m=r===`ppm`||o,h=_t(d,410),g=vt(h),{fill:_,ink:v}=_n(m,i,a),y={P:h,arc:g,ink:v,isSifam:p,x0:l,y0:u},b=`<clipPath id="xmc${e}"><rect x="${l}" y="${u}" width="580" height="290" rx="5"/></clipPath>
    <g clip-path="url(#xmc${e})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect class="xt-face xt-lamp-${r===`vu`&&!o?a:`ppm`}" x="${l}" y="${u}" width="580" height="290" rx="5" fill="${_}"/>`;r===`vu`&&i&&hn(a)&&(b+=`<ellipse class="xt-bloom xt-lamp-${a}" cx="${t}" cy="${u+115}" rx="${243.6.toFixed(1)}" ry="82" fill="url(#xincand_bloom)"/>`),r===`vu`?(b+=f.renderScale?f.renderScale(y):It(y),b+=f.legend(y)):b+=kt(y,c,o),b+=`<g class="wbs-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (Ward-Beck)</title>
          ${yn(t,n,v)}
        </g>`,b+=`<g class="mc-only xtm-btn dial-logo-interactive" data-btn="CYCLE_STYLE" style="cursor: pointer;">
          <title>Click to cycle meter styles (McCurdy)</title>
          ${bn(t,n,v)}
        </g>`;let x=m?f.ppmNeedle(d,410,265):f.vuNeedle(d,410,265);return b+=jt(e,ft(p),d,410,x),b+=Sn(l,u),r===`vu`&&!o&&(b+=wn(t,n,e)),b+=Cn(l,u,t),b}function En(){return`M 1845 82 A 12 12 0 0 0 1833 70 H 1367 A 12 12 0 0 0 1355 82 V 402 A 12 12 0 0 0 1367 414 H 1833 A 12 12 0 0 0 1845 402 Z ${`M ${D.x} ${D.y+6} a 6 6 0 0 1 6 -6 h ${D.w-12} a 6 6 0 0 1 6 6 v ${D.h-12} a 6 6 0 0 1 -6 6 h -${D.w-12} a 6 6 0 0 1 -6 -6 Z`} ${Object.keys(ot).map(e=>`M ${(ot[e]??1385)-2} 225 a 3 3 0 0 1 3 -3 h 92 a 3 3 0 0 1 3 3 v 133 a 3 3 0 0 1 -3 3 h -92 a 3 3 0 0 1 -3 -3 Z`).join(` `)}`}function Dn(){return`<path class="wbs-only" d="${En()}" fill="#15803d" fill-rule="evenodd"/>`}var On=`<defs>
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
      </defs>`;function kn(e){let{bx:t,by:n}=lt,r=e-290-t,i=65-n,a=580+2*t,o=290+2*n;return`<g class="mc-com-only" filter="url(#mc_shadow)">
        <rect x="${r}" y="${i}" width="${a}" height="${o}" rx="4" fill="url(#mc_bezel)" stroke="#0d0d0e" stroke-width="2"/>
        <polygon points="${r},${i} ${r+a},${i} ${r+a-t},${i+n} ${r+t},${i+n}" fill="#36373a"/>
        <polygon points="${r},${i+o} ${r+a},${i+o} ${r+a-t},${i+o-n} ${r+t},${i+o-n}" fill="#111113"/>
        <polygon points="${r},${i} ${r+t},${i+n} ${r+t},${i+o-n} ${r},${i+o}" fill="#232426"/>
        <polygon points="${r+a},${i} ${r+a-t},${i+n} ${r+a-t},${i+o-n} ${r+a},${i+o}" fill="#191a1c"/>
        <rect x="${r+t}" y="${i+n}" width="580" height="290" fill="#0e0e10"/>
      </g>`}function An(e,t,n){return`
      ${n===null?``:`<line x1="${n}" y1="404" x2="${e-70}" y2="404" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${e+70}" y1="404" x2="${e+600}" y2="404" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${e}" y="404" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${t}</text>`}function jn(){let e=E,t=`<g class="mc-only">
      ${On}
      <rect class="mc-panel-bg" x="1" y="1" width="${e-2}" height="428" rx="6" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <line x1="4" y1="3" x2="${e-4}" y2="3" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`;for(let e of at)t+=kn(e);return t+=An(ut.input1X,`INPUT 1`,null)+An(ut.input2X,`INPUT 2`,ut.input2LineX0),t+=`</g>`,t}function Mn(e,t,n){let r=n*16,i=``;for(let a=0;a<=r;a++){let o=a/r*Math.PI*2-Math.PI/2,s=e+t*Math.cos(n*(o+Math.PI/2)),c=(s*Math.cos(o)).toFixed(2),l=(s*Math.sin(o)).toFixed(2);i+=a===0?`M ${c},${l}`:` L ${c},${l}`}return i+` Z`}function Nn(){let e=`font-family="Helvetica, Arial, sans-serif" font-weight="700"`,t=ct;return`<g class="mc-com-only">
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
    </g>`}function Pn(){let e=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,t=1580,n=``,r=``,i=``;for(let e=0;e<=30;e++){let a=(135+e*9)*Math.PI/180,o=Math.cos(a),s=Math.sin(a),c=-50+e*2,l=-30+e*2,u=(c>0?`+`:``)+c,d=(l>0?`+`:``)+l,f=e%5==0,p=f?142:146,m=(t+p*s).toFixed(1),h=(215-p*o).toFixed(1),g=(t+158*s).toFixed(1),_=(215-158*o).toFixed(1);n+=`<line x1="${m}" y1="${h}" x2="${g}" y2="${_}" stroke="#ffffff" stroke-width="${f?`2.2`:`1.3`}" stroke-opacity="${f?`0.95`:`0.8`}"/>`;let v=(t+126*s).toFixed(1),y=(215-126*o+3.8).toFixed(1);r+=`<text x="${v}" y="${y}" font-size="${Math.abs(l)>=10?`10.5`:`11.5`}" font-weight="700" fill="#cbd5e1" text-anchor="middle">${d}</text>`;let b=(t+172*s).toFixed(1),x=(215-172*o+4.2).toFixed(1);i+=`<text x="${b}" y="${x}" font-size="${Math.abs(c)>=10?`11.5`:`12.5`}" font-weight="800" fill="#f8fafc" text-anchor="middle">${u}</text>`}let a=Mn(66,3.4,14),o=``;for(let e=0;e<14;e++){let t=(e*360/14+360/28)*Math.PI/180;o+=`<line x1="${(58*Math.cos(t)).toFixed(2)}" y1="${(58*Math.sin(t)).toFixed(2)}" x2="${(66*Math.cos(t)).toFixed(2)}" y2="${(66*Math.sin(t)).toFixed(2)}"/>`}return Mn(16,1.6,12),`<g class="mc-ca-only">
      <defs>
        <linearGradient id="mc_dial_slate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d5366"/><stop offset="50%" stop-color="#314353"/><stop offset="100%" stop-color="#24333f"/>
        </linearGradient>
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
        <linearGradient id="mc_jack_bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="mc_shield_blue_ca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a5f"/>
          <stop offset="50%" stop-color="#2a5280"/>
          <stop offset="100%" stop-color="#142842"/>
        </linearGradient>
        <filter id="mc_knob_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
        <filter id="mc_badge_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Center Console Bay Outline / Bezel in McCurdy Slate Finish (500x398) -->
      <rect x="1350" y="16" width="500" height="398" rx="8" fill="url(#mc_panel_blue)" stroke="#4d687f" stroke-width="2.5"/>

      <!-- ================================================================= -->
      <!-- LEFT SECTION: JACKS (INPUT 600Ω / 20K, MON OUTPUT 20K) & SA14023  -->
      <!-- ================================================================= -->
      <g id="mc-left-jacks" ${e}>
        <!-- INPUT Header & Bracket grouping Jack 1 and Jack 2 -->
        <text x="1354" y="184" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1">INPUT</text>
        <path d="M 1362,142 H 1358 V 218 H 1362" fill="none" stroke="#f8fafc" stroke-width="1.3"/>

        <!-- Jack 1 (INPUT 600Ω) - Interactive MODE button -->
        <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer" transform="translate(1376, 142)">
          <title>Input 1 (600Ω - MODE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="146" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">600Ω</text>

        <!-- Jack 2 (INPUT 20K) - Interactive SOURCE button -->
        <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer" transform="translate(1376, 215)">
          <title>Input 2 (20K Bridging - SOURCE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="219" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Jack 3 (MON. OUTPUT 20K) -->
        <text x="1354" y="282" font-size="9" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.6">MON.</text>
        <text x="1354" y="294" font-size="9" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.6">OUTPUT</text>
        <g class="xtm-btn mc-jack" data-btn="DOWN" style="cursor:pointer" transform="translate(1376, 288)">
          <title>Monitor Output (20K)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="292" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Model Designation Silkscreen (Lower Left) -->
        <text x="1376" y="388" font-size="13" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="1.8">SA14023</text>
      </g>

      <!-- ================================================================= -->
      <!-- CENTERPIECE: FULL 2 RU VERTICAL USAGE MCCURDY ATTENUATOR KNOB     -->
      <!-- (Diameter 344px spanning y=43..387, Centered at x=1580, y=215)    -->
      <!-- ================================================================= -->
      <g id="mccurdy-vintage-knob-assembly" class="xtm-btn mccurdy-knob" filter="url(#mc_knob_shadow)" style="cursor:grab; touch-action:none; user-select:none;">
        <title>McCurdy SA14023 Dual-Concentric Attenuator (-50 to +10 dB / -30 to +30 dB)</title>

        <!-- Circular Slate Blue Background Plate (r=186) -->
        <circle cx="${t}" cy="215" r="186" fill="url(#mc_dial_slate)" stroke="#1a2530" stroke-width="2.5"/>
        <circle cx="${t}" cy="215" r="183" fill="none" stroke="#5a7690" stroke-width="1" stroke-opacity="0.5"/>

        <!-- Silkscreen Scales Group (Inner -30 to +30, Outer -50 to +10) -->
        <g id="mc-knob-scales" ${e}>
          ${n}
          <g id="mc_scale_inner_group">${r}</g>
          <g id="mc_scale_outer_group">${i}</g>
        </g>

        <!-- Silver Skirt Base Disc (r=96) with Inner Bevel Line -->
        <circle cx="${t}" cy="215" r="96" fill="url(#mc_skirt_silver)" stroke="#555a64" stroke-width="1.5"/>
        <circle cx="${t}" cy="215" r="74" fill="none" stroke="#8a909c" stroke-width="1.1"/>

        <!-- Rotating 14-Flute Barrel Body with Solid Triangle Pointer and Yellow Cap -->
        <g id="mccurdy_vintage_knob_rotor" data-cx="${t}" data-cy="215" transform="translate(${t}, 215)">
          <!-- Solid Black Pointer Arrow at 9 o'clock (-95px to -74px from center on rotating skirt) -->
          <polygon points="-95,0 -74,-9 -74,9" fill="#141517"/>

          <!-- 14-Flute Barrel Body -->
          <path d="${a}" fill="url(#mc_barrel_grad)" stroke="#4b505a" stroke-width="1.3"/>
          <g stroke="#666c77" stroke-width="1.2" stroke-linecap="round">
            ${o}
          </g>

          <!-- Outer Raised Gold Bezel Ring (r=48) & Specular Highlight -->
          <circle cx="0" cy="0" r="48" fill="none" stroke="url(#mc_gold_rim)" stroke-width="2.4"/>
          <path d="M -34,-34 A 48,48 0 0 1 34,-34" fill="none" stroke="#fde68a" stroke-width="1.5" stroke-opacity="0.85"/>

          <!-- Bright Cadmium Yellow Cap Face (r=45) matching authentic vintage hardware -->
          <circle cx="0" cy="0" r="45" fill="url(#mc_yellow_cap)" stroke="#9c7a0b" stroke-width="1.0"/>

          <!-- Solid Black Index Line pointing at 9 o'clock (aligned with skirt pointer) -->
          <line x1="-4" y1="0" x2="-42" y2="0" stroke="#141517" stroke-width="3.2" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- RIGHT SECTION: TOGGLE SWITCH (UPPER) & 4 SELECTOR SWITCHES (SIDE) -->
      <!-- ================================================================= -->
      <!-- Chrome Bat-Handle Toggle Switch Assembly (Upper Right, cx=1802, cy=95) -->
      <g id="mc-toggle-assembly" class="xtm-btn" data-btn="MC_TOGGLE" style="cursor:pointer" transform="translate(1802, 95)">
        <title>Range Switch: Click to Toggle Range (MTR / CAL / MON)</title>
        <text x="0" y="-32" ${e} font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">MTR</text>
        <text x="22" y="3.5" ${e} font-size="9" font-weight="700" fill="#94a3b8" text-anchor="start">CAL</text>
        <text x="0" y="38" ${e} font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">MON</text>

        <!-- Chrome Bezel Nut -->
        <circle cx="0" cy="0" r="19" fill="url(#chromeMetalGrad)" stroke="#1a2530" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="13.5" fill="#141c24" stroke="#0a121a" stroke-width="1"/>

        <!-- Bat Handle Stick (Angled Upwards to MTR) -->
        <g id="mc_toggle_stick_rotor" transform="rotate(-24)">
          <path d="M -3.5,0 L -4,-28 C -4,-33 4,-33 4,-28 L 3.5,0 Z" fill="url(#mc_toggle_stick)" stroke="#334155" stroke-width="0.8"/>
          <circle cx="0" cy="-30" r="4.8" fill="#f1f5f9"/>
        </g>
      </g>

      <!-- 4 Interlocking Selector Switches Across the Side Labeled 1 2 3 4 -->
      <!-- Snap up when another is pushed -->
      ${[1,2,3,4].map(t=>{let n=168+(t-1)*62;return`
      <g class="xtm-btn mc-selector-btn ${t===1?`mc-btn-latched`:``}" id="mc_input_btn_${t}" data-btn="INPUT_${t}" data-input="${t}" style="cursor:pointer" transform="translate(1802, ${n})" role="button" tabindex="0" aria-label="Input ${t}">
        <title>Input ${t} Selector Switch (Push to select, snaps up when another is pushed)</title>
        <text x="0" y="-19" ${e} font-size="8.5" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.5">INPUT ${t}</text>
        <!-- Outer Bezel & Well -->
        <circle cx="0" cy="0" r="17" fill="url(#chromeMetalGrad)" stroke="#152636" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="13" fill="#0d141c" stroke="#080e14" stroke-width="1"/>
        <!-- Pushbutton Cap (Latches down / snaps up) -->
        <circle class="mc-btn-cap" cx="0" cy="0" r="10.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text class="mc-btn-label" x="0" y="4" ${e} font-size="11.5" font-weight="900" fill="#f8fafc" text-anchor="middle">${t}</text>
      </g>`}).join(``)}
    </g>`}function Fn(){return Nn()+Pn()}function In(e){if(!e.power)return`  `;let t=null;if(e.mode===`A`?t=e.lvlDb(e.a.lvl):e.mode===`D`?t=e.lvlDb(e.d.lvl):e.mode===`S`&&(t=e.toneCalLevels[e.toneCalIdx]??0),t===null)return`--`;let n=Math.min(99,Math.abs(Math.round(t)));return t<0&&n<10?`-`+n:String(n).padStart(2,`0`)}function Ln(e){return gt(e,ct)}var Rn=`<linearGradient id="mc_vuface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dfc784"/><stop offset="25%" stop-color="#eedba1"/>
          <stop offset="85%" stop-color="#ebd699"/><stop offset="100%" stop-color="#d5bd7b"/>
        </linearGradient>`,zn=`<linearGradient id="xgreen_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="25%" stop-color="#16a34a"/>
          <stop offset="75%" stop-color="#15803d"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>`;function Bn(){return`
    <!-- Modern Dark Canvas (Ward-Beck.com) -->
    <rect class="wbs-only wbs-dark-canvas" width="${E}" height="430" fill="#0f1114"/>

    <!-- Vintage Ward-Beck M600 Anodized Brushed Aluminum Chassis (Ward-Beck.ca) -->
    <g class="wbs-ca-only" id="wbs-ca-broadcast-chassis">
      <!-- Warm Anodized Aluminum Faceplate Base (MF-6B standard #C6C3B3) -->
      <rect width="${E}" height="430" fill="url(#aluPlate)"/>

      <!-- M600 Anodized Extruded Aluminum Top Rail Lip (MF-6B Standard) -->
      <rect x="0" y="0" width="${E}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="18" x2="${E}" y2="18" stroke="#8C897B" stroke-width="1.2"/>
      <line x1="0" y1="19.5" x2="${E}" y2="19.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>

      <!-- M600 Anodized Extruded Aluminum Bottom Rail Lip -->
      <line x1="0" y1="410.5" x2="${E}" y2="410.5" stroke="#8C897B" stroke-width="1.2"/>
      <rect x="0" y="412" width="${E}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="412" x2="${E}" y2="412" stroke="#D4D2C5" stroke-width="1.2"/>
    </g>`}var Vn=`<path d="M 630 414 H 49 A 14 14 0 0 1 35 400 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 400 A 14 14 0 0 1 1326 414 H 745"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="687.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">LEFT</text>`,Hn=`<path d="M 2455 414 H 1874 A 14 14 0 0 1 1860 400 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 400 A 14 14 0 0 1 3151 414 H 2570"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="2512.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">RIGHT</text>`,Un=`<defs>
        ${ln.gradient}

        ${fn}

        ${gn}

        ${un.gradient}

        ${Rn}
        ${dn.gradient}

        ${xn}

        ${zn}

        
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
      </defs>`,Wn=`#4a1a17`,Gn=`#ff2d1f`;function Kn(){let e=``;for(let t=0;t<O.count;t++){let n=O.x0+t*O.pitch,r=O.cy;e+=`
      <rect class="mc-only mc-phase-seg" id="xphase_ledr_${t}" x="${(n-16).toFixed(1)}" y="${(r-10).toFixed(1)}" width="32" height="20" rx="2.5" fill="${Wn}" stroke="#2b0d0c" stroke-width="1"/>`}return`<g class="mc-only">
          <rect x="1408" y="24" width="384" height="36" rx="3" fill="#171719" stroke="#5c5952" stroke-width="1.5"/>
          <rect x="1413" y="28" width="374" height="28" fill="url(#mc_led)"/>
          ${e}
        </g>`}var qn=Kn();function Jn(e){return{lit:e<=1?`#ff4d36`:e<=3?`#ffb43a`:`#9dff3a`,off:e<=1?`#3a1810`:e<=3?`#3a2810`:`#142e17`}}function Yn(){let e=``;for(let t=0;t<O.count;t++){let n=O.x0+t*O.pitch,r=O.cy;e+=`
              <circle class="wbs-only" cx="${n}" cy="${r}" r="22" fill="#08090a" stroke="#25282f" stroke-width="2"/>
              <circle class="wbs-only" id="xphase_led_${t}" cx="${n}" cy="${r}" r="17" fill="#142e17"/>`}return e}function Xn(){return Object.keys(ot).map(e=>{let t=ot[e]??1385;return`
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
          </g>`}).join(``)}var Zn={down:{top:`#15803d`,topStroke:`#86efac`,bot:`#0e2e18`,border:`#86efac`,lbl:`#ffffff`},up:{top:`#2d3748`,topStroke:`#374151`,bot:`#11151c`,border:`#1f2937`,lbl:`#ffffff`}};function Qn(e=!0){return`<g class="wbs-ca-only" id="vintage-wbs-center">
    <!-- 1. Centered DR Vernier Dial Scale + Fluted Instrument Knob (Centered at x=1600, y=154, Scale=0.94) -->
    <g transform="translate(1600, 154) scale(0.94)">
      <!-- DR Differential Decade / Vernier Dial Scale & Markings (Origin at 0, 0) -->
      <g id="dr-dial-scale" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" fill="#2A2B2A" stroke="#2A2B2A">
        <!-- Top Header "DR" and "- 0 +" -->
        <text x="0" y="-112" font-size="14" font-weight="700" text-anchor="middle" stroke="none" letter-spacing="1.2">DR</text>
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

        <!-- White Triangular Pointer on Skirt (Pointing to ~ +4.2 on right scale = +15 deg) -->
        <g id="wbs_vintage_knob_pointer" transform="rotate(15)">
          <polygon points="0,-74 -8.5,-54 8.5,-54" fill="#eceae2" stroke="#18191b" stroke-width="0.6" />
        </g>

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

          <!-- White Radial Indicator Line on Cap & Top Flute running straight to middle of arrow head -->
          <line x1="0" y1="2" x2="0" y2="-40" stroke="#f2f0ea" stroke-width="3.2" stroke-linecap="round" />
          <line x1="0" y1="-39" x2="0" y2="-55" stroke="#eceae2" stroke-width="2.8" stroke-linecap="butt" />
        </g>
      </g>
    </g>

    <!-- 2. AC Pilot Indicator Lamp Assembly (Placed in Right Margin at cx=1785, cy=154) -->
    <g id="ac-pilot-lamp" class="wbs-ac-pilot-lamp" transform="translate(1785, 154)" filter="url(#lampDropShadow)">
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
    ${$n(e)}
  </g>`}function $n(e=!0){let t=`font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`,n=[{num:1,sub:`MIC`},{num:2,sub:`LINE`},{num:3,sub:`DIGITAL`},{num:4,sub:`TEST GEN`}],r=1420,i=`
    <!-- INPUT SELECTOR Header & Hairline Rules (Above switches) -->
    <g ${t}>
      <line x1="1380" y1="272" x2="1515" y2="272" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
      <text x="1600" y="275.5" font-size="10.5" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="2.5">INPUT SELECTOR</text>
      <line x1="1685" y1="272" x2="1820" y2="272" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
    </g>

    <!-- Continuous Outer Recessed Bezel Housing for 4 Butted Switches -->
    <rect x="1418" y="293" width="364" height="58" rx="4" fill="#0c0e11" stroke="#2c323b" stroke-width="1.4" filter="url(#winkButtonShadow)" />
    <rect x="${r}" y="295" width="360" height="54" rx="2.5" fill="#060709" />
  `;return n.forEach((n,a)=>{let o=r+a*90,s=n.num;i+=`
      <!-- Silkscreen Header Above Button ${s} -->
      <text x="${o+45}" y="289" ${t} font-size="9.5" font-weight="800" fill="#2A2B2A" text-anchor="middle" letter-spacing="1">INPUT ${s}</text>

      <!-- WINK SWITCH: INPUT ${s} -->
      <g class="xtm-btn wink-switch ${s===1?`wink-open`:``}" id="wink_btn_${s}" data-btn="INPUT_${s}" data-input="${s}" style="cursor:pointer" role="button" tabindex="0" aria-label="Input ${s} (${n.sub})">
        <title>Input ${s}: ${n.sub} (Wink Selector Switch)</title>

        <!-- Divider line between butted switch cells -->
        ${a>0?`<line x1="${o}" y1="295" x2="${o}" y2="349" stroke="#1e2229" stroke-width="1.2" />`:``}

        <!-- Aperture Clip Path -->
        <clipPath id="wink_clip_${s}">
          <rect x="${o}" y="295" width="90" height="54" rx="2" />
        </clipPath>

        <!-- Top Inset Shadow (Visible when switch depresses / pushes downward into aperture) -->
        <rect class="wink-depressed-shadow" x="${o}" y="295" width="90" height="8" fill="url(#depressedShadowGrad)" opacity="0" pointer-events="none" />

        <!-- Button Cap Body (Pushes downward when selected) -->
        <g class="wink-button-cap" clip-path="url(#wink_clip_${s})">
          <!-- 1. Illuminated Active Neon Core (Revealed when selected / active) -->
          <rect class="wink-neon-core" x="${o}" y="295" width="90" height="54" fill="${e?`url(#winkNeonGrad)`:`#0f2416`}" ${e?`filter="url(#winkGlow)"`:``} />
          <rect x="${o}" y="295" width="90" height="54" fill="none" stroke="#86efac" stroke-width="1" opacity="0.6" />

          <!-- Inside Illuminated Numeral & Label -->
          <text class="wink-text-inside" x="${o+45}" y="323" ${t} font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))">${s}</text>
          <text class="wink-subtext-inside" x="${o+45}" y="337" ${t} font-size="8.5" font-weight="800" fill="#dcfce7" text-anchor="middle" letter-spacing="1">${n.sub}</text>

          <!-- 2. Mechanical Eyelids / Shutters (Slide open vertically when active) -->
          <!-- Top Shutter Blade -->
          <g class="wink-shutter-top">
            <rect x="${o}" y="295" width="90" height="27" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${o+2}" y1="296.5" x2="${o+90-2}" y2="296.5" stroke="#475569" stroke-width="0.8" stroke-opacity="0.6" />
          </g>

          <!-- Bottom Shutter Blade -->
          <g class="wink-shutter-bot">
            <rect x="${o}" y="322" width="90" height="27" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${o+2}" y1="348" x2="${o+90-2}" y2="348" stroke="#0b0d10" stroke-width="0.8" />
          </g>

          <!-- Center Meeting Slit Line (Visible when closed) -->
          <line class="wink-slit-line" x1="${o}" y1="322" x2="${o+90}" y2="322" stroke="#0a0c0f" stroke-width="1.2" />

          <!-- Inactive / Closed Numeral Etched on Shutter Surface -->
          <text class="wink-text-closed" x="${o+45}" y="329" ${t} font-size="20" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="1">${s}</text>

          <!-- 3. Convex Glass Lens Overlay with Specular Glint & Bezel Rim -->
          <rect class="wink-lens" x="${o}" y="295" width="90" height="54" fill="url(#winkGlassLens)" pointer-events="none" />
          <path class="wink-glint" d="M ${o+4} 297.5 L ${o+90-4} 297.5" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" pointer-events="none" />
          <rect class="wink-bezel" x="${o}" y="295" width="90" height="54" fill="none" stroke="url(#winkBezelGrad)" stroke-width="1.2" pointer-events="none" />
        </g>
      </g>
    `}),i}function er(e){return`<g>
        ${qn}

        <!-- Modern Ward-Beck Console Section (Ward-Beck.com) -->
        <g class="wbs-modern-only">
          <text class="xt-deg" x="1390" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
          ${Yn()}
          <text class="xt-deg" x="1812" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>

          <!-- Center Console Signature Solid Green Plate Stencil (Borders just the shape with scalloped notches) -->
          ${Dn()}

          <!-- Center VFD Dot-Matrix Display Cutout Window -->
          <rect class="wbs-only" x="${D.x}" y="${D.y}" width="${D.w}" height="${D.h}" rx="6" fill="#040605" stroke="#052e16" stroke-width="2.5"/>
          <g class="wbs-only" id="xvfd_group" ${e?`filter="url(#xglow)"`:``}></g>
        </g>

        <!-- McCurdy Centre Console Section (McCurdyRadio.ca / .com) -->
        ${Fn()}

        <!-- Vintage Ward-Beck Console Section (Ward-Beck.ca - DR Vernier Dial, Skirted Knob, AC Lamp) -->
        ${Qn(e)}

        <!-- Mode & Source / Up & Down Front-Panel Buttons -->
        ${Xn()}
      </g>`}function tr(e){let t=e.power,n=(n,r,i)=>Tn(n,at[n]??r,210,i,t,e.dialLamp,i===`ppm`,e.meterStyle,e.ppmStandard);return`<svg viewBox="0 0 ${E} 430" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      ${Un}

      <!-- Seamless Borderless Canvas -->
      ${Bn()}
      ${jn()}

      <!-- Channel A Signature Green Console Frame -->
      ${Vn}

      <!-- Channel A Pair: Meter 0 (VU) + Meter 1 (PPM) -->
      ${n(0,373,`vu`)}
      ${n(1,1002,`ppm`)}

      <!-- Center Console Section -->
      ${er(t)}

      <!-- Channel B Signature Green Console Frame -->
      ${Hn}

      <!-- Channel B Pair: Meter 2 (VU) + Meter 3 (PPM) -->
      ${n(2,2198,`vu`)}
      ${n(3,2827,`ppm`)}
    </svg>`}function nr(e,t,n){let r=e?.vu??[0,0],i=e?.ppm??[-.12,-.12],a=ft(n),o=ft(n);return[t?A(r[0]??0,n):a,t?j(i[0]??-.12,n):o,t?A(r[1]??0,n):a,t?j(i[1]??-.12,n):o]}function rr(e,t,n){for(let r=0;r<4;r++){let i=e[r],a=t[r];if(Math.abs(i-a)>.005){t[r]=i;let e=n[r],a=at[r]??0;e&&e.setAttribute(`transform`,`rotate(${i.toFixed(2)} ${a} 410)`)}}}function ir(e,t){return e+(t?100:0)}function ar(e,t,n,r){for(let i=0;i<8;i++){let a=e[i];if(!a)continue;let o=n&&i===t,s=Jn(i),c=r?Gn:s.lit,l=r?Wn:s.off;a.setAttribute(`fill`,o?c:l),o?a.setAttribute(`filter`,`url(#xledglow)`):a.removeAttribute(`filter`)}}function or(e){return!!(e&&(e.hasAudio||e.ppmDb&&((e.ppmDb[0]??-99)>-55||(e.ppmDb[1]??-99)>-55)||e.dbfs&&((e.dbfs[0]??-99)>-58||(e.dbfs[1]??-99)>-58)||e.vuDb&&((e.vuDb[0]??-99)>-55||(e.vuDb[1]??-99)>-55)))}var sr=`#c8f53c`,cr=`rgba(150,200,60,.06)`,lr=`#fbbf24`,ur=`rgba(251,191,36,.08)`;function dr(e,t){let n=e.vfdMetric||`lufs`,r=-60,i=`LU`;if(n===`lus`?(r=typeof t.lufs?.s==`number`?t.lufs.s:-60,i=`S `):n===`lum`?(r=typeof t.lufs?.m==`number`?t.lufs.m:-60,i=`M `):n===`lui`?(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`I `):n===`lra`?(r=typeof t.lufs?.lra==`number`?t.lufs.lra:0,i=`RA`):(r=typeof t.lufs?.i==`number`?t.lufs.i:-60,i=`LU`),n===`lra`)return(r.toFixed(1)+` `+i).padStart(8).substring(0,8);if(Number.isFinite(r)&&r>-59.5){let e=r.toFixed(1);return(e+` `+i).length<=8?(e+` `+i).padStart(8):e+i}return`-INF `+i}function fr(e,t,n,r){if(!e.power)return{txt:`        `,on:sr,off:cr};if(e.flashMsg)return{txt:e.flashMsg.padEnd(8).substring(0,8),on:sr,off:cr};if(e.mode===`SET`)return{txt:e.getDisplayText(),on:sr,off:cr};if(r)return{txt:Math.floor(n%1600/800)===0?`LOSS OF `:` SIGNAL `,on:lr,off:ur};let i=n%6e3,a;return a=i<4e3?dr(e,t):i<5e3?`WardBeck`:`Systems `,{txt:a,on:sr,off:cr}}function pr(e){let t=st,n=48.4*t,r=D.x+(D.w-n)/2,i=D.y+(D.h-6*t)/2;return mt(e.txt,r,i,t,e.on,e.off)}function mr(e,t){if(t)return`⚠ LOSS OF SIGNAL (NO AUDIO DETECTED)`;if(e){if(e.mode===`D`)return`COMPUTER AUDIO OUTPUT`;if(e.mode===`S`)return`TEST OSCILLATOR`;if(e.mode===`SET`)return`SETUP & CALIBRATION`}return`SOUNDCARD INPUT`}function hr(e,t){Object.keys(ot).forEach(n=>{t[n]={border:e.querySelector(`#xtm_btn_border_${n}`),top:e.querySelector(`#xtm_btn_top_${n}`),bot:e.querySelector(`#xtm_btn_bot_${n}`),sheen:e.querySelector(`#xtm_btn_sheen_${n}`),lbl:e.querySelector(`#xtm_btn_lbl_${n}`)}})}function gr(e,t){Object.keys(ot).forEach(n=>{let r=e[n];if(!r||!r.top)return;let i=t===n?Zn.down:Zn.up;r.top.setAttribute(`fill`,i.top),r.top.setAttribute(`stroke`,i.topStroke),r.bot&&r.bot.setAttribute(`fill`,i.bot),r.border&&r.border.setAttribute(`stroke`,i.border),r.lbl&&r.lbl.setAttribute(`fill`,i.lbl)})}var _r=300,vr=90;function yr(e,t){let n=null,r=null,i=()=>{n&&=(clearTimeout(n),null),r&&=(clearInterval(r),null)};e.addEventListener(`pointerdown`,e=>{let a=e.target?.closest(`.xtm-btn`);if(a){e.preventDefault();let o=a.getAttribute(`data-btn`);o&&(t.heldButton=o,t.onButtonPressed&&t.onButtonPressed(o),(o===`UP`||o===`DOWN`)&&(i(),n=setTimeout(()=>{r=setInterval(()=>{t.heldButton===o&&t.onButtonPressed?t.onButtonPressed(o):i()},vr)},_r)))}});let a=()=>{if(i(),t.heldButton){let e=t.heldButton;t.heldButton=null,t.onButtonReleased&&t.onButtonReleased(e)}};window.addEventListener(`pointerup`,a),window.addEventListener(`pointercancel`,a)}var br=class{container;isBuilt=!1;_eventsAttached=!1;heldButton=null;VW=E;VH=430;MW=580;MH=290;MX=at;MYc=210;py=410;R=265;DISP=D;BX=ot;BW=94;BH=135;BY=224;currentMeterStyle=`simpson`;ppmStandard=`type2`;lastAudioTime=performance.now();hasSignalLost=!1;lastSignalLostState=!1;needleEls=[null,null,null,null];phaseLedEls=[];phaseLedRectEls=[];vfdEl=null;modeTitleEl=null;btnEls={};winkEls=[null,null,null,null,null];mcInputEls=[null,null,null,null,null];vuShatterEls=[null,null,null,null];isGlassShattered=!1;vuRedStartTime=0;lastSensKey=``;lastAngles=[-999,-999,-999,-999];lastPhaseLed=-999;lastDisplayText=``;lastModeTitle=``;lastHeldButton=null;lastActiveInput=-999;lastMcRangeMode=``;lastMcAttenuatorStep=-999;MC_WIN=ct;lastMcDigits=``;onButtonPressed=null;onButtonReleased=null;constructor(e){this.container=e}getCenterPlatePath(){return En()}vuFrac(e){return k(e)}vuAngle(e,t=!1){return A(e,t)}ppmFrac(e){return dt(e)}ppmAngle(e,t=!1){return j(e,t)}renderDotMatrix(e,t,n,r,i,a){return mt(e,t,n,r,i,a)}renderAltPpmFace(e,t,n,r){return bt(Ot(this.ppmStandard),e,t,n,r)}renderMeterShell(e,t,n,r,i,a,o=!1,s=`simpson`){return Tn(e,t,n,r,i,a,o,s,this.ppmStandard)}renderMcCurdyPanel(){return jn()}renderMcCurdyCenter(){return Fn()}renderSevenSeg(e){return gt(e,this.MC_WIN)}mcRangeText(e){return In(e)}buildShell(e){return this.currentMeterStyle=e?.meterStyle||`simpson`,tr({power:e.power,dialLamp:e.dialLamp,meterStyle:e.meterStyle,ppmStandard:this.ppmStandard})}build(e){this.container&&(this.container.innerHTML=this.buildShell(e),this.initDom(),this.lastMcDigits=``,this.lastPhaseLed=-999,this.lastActiveInput=-999,this.lastMcRangeMode=``,this.lastMcAttenuatorStep=-999,this.isBuilt=!0)}initDom(){if(this.container){for(let e=0;e<4;e++)this.needleEls[e]=this.container.querySelector(`#xtm_needle_${e}`);this.phaseLedEls=[];for(let e=0;e<8;e++)this.phaseLedEls[e]=this.container.querySelector(`#xphase_led_${e}`),this.phaseLedRectEls[e]=this.container.querySelector(`#xphase_ledr_${e}`);this.vfdEl=this.container.querySelector(`#xvfd_group`),this.modeTitleEl=this.container.querySelector(`#xtm_mode_title`),hr(this.container,this.btnEls),this.winkEls=[null],this.mcInputEls=[null];for(let e=1;e<=4;e++)this.winkEls.push(this.container.querySelector(`#wink_btn_${e}`)),this.mcInputEls.push(this.container.querySelector(`#mc_input_btn_${e}`));this.vuShatterEls=[this.container.querySelector(`#vu_shatter_0`),null,this.container.querySelector(`#vu_shatter_2`),null],this.attachEvents()}}attachEvents(){!this._eventsAttached&&this.container&&(this._eventsAttached=!0,yr(this.container,this))}updateNeedles(e,t=!0,n){this.container&&this.isBuilt&&rr(nr(e,t,n===void 0?this.currentMeterStyle===`sifam`:n),this.lastAngles,this.needleEls)}renderSecondary(e,t){if(!this.container)return;this.isBuilt||this.build(e);let n=e.power,r=n?t.phaseLed:-1,i=document.body.classList.contains(`theme-mccurdy`)||document.body.classList.contains(`theme-mccurdy-dark`),a=ir(r,i);a!==this.lastPhaseLed&&(this.lastPhaseLed=a,ar(i?this.phaseLedRectEls:this.phaseLedEls,r,n,i));let o=performance.now();or(t)?(this.lastAudioTime=o,this.hasSignalLost=!1):o-this.lastAudioTime>=1e4&&(this.hasSignalLost=!0);let s=fr(e,t,o,this.hasSignalLost);(s.txt!==this.lastDisplayText||this.hasSignalLost!==this.lastSignalLostState)&&this.vfdEl&&(this.lastDisplayText=s.txt,this.lastSignalLostState=this.hasSignalLost,this.vfdEl.innerHTML=pr(s));let c=In(e);if(c!==this.lastMcDigits&&this.container){let e=this.container.querySelector(`#xmc_digits`);e&&(e.innerHTML=Ln(c),this.lastMcDigits=c)}let l=mr(e,this.hasSignalLost);l!==this.lastModeTitle&&this.modeTitleEl&&(this.lastModeTitle=l,this.modeTitleEl.textContent=l),this.heldButton!==this.lastHeldButton&&(this.lastHeldButton=this.heldButton,gr(this.btnEls,this.heldButton));let u=n?e.getSelectedInput():0;if(u!==this.lastActiveInput){this.lastActiveInput=u;for(let e=1;e<=4;e++){let t=this.winkEls[e];if(t){let n=e===u;t.classList.toggle(`wink-open`,n),t.setAttribute(`aria-pressed`,n?`true`:`false`)}let n=this.mcInputEls[e];if(n){let t=e===u;n.classList.toggle(`mc-btn-latched`,t),n.setAttribute(`aria-pressed`,t?`true`:`false`)}}}let d=`${e.mode}_${e.a.lvl}_${e.d.lvl}_${u}_${e.mcAttenuatorStep}_${e.mcRangeMode}`;this.lastSensKey!==d&&(this.lastSensKey=d,this.isGlassShattered&&(this.isGlassShattered=!1,this.updateShatterState(!1)),this.vuRedStartTime=0),n&&t.hasAudio&&(t.vuDb&&(t.vuDb[0]>=0||t.vuDb[1]>=0)||t.vu&&(t.vu[0]>=1||t.vu[1]>=1))?this.vuRedStartTime===0?this.vuRedStartTime=o:!this.isGlassShattered&&o-this.vuRedStartTime>=2500&&(this.isGlassShattered=!0,this.updateShatterState(!0)):this.vuRedStartTime=0;let f=e.mcRangeMode||`outer`,p=e.mcAttenuatorStep??15;if(f!==this.lastMcRangeMode||p!==this.lastMcAttenuatorStep){this.lastMcRangeMode=f,this.lastMcAttenuatorStep=p;let e=this.container?.querySelector(`#mc_toggle_stick_rotor`);if(e){let t=f===`outer`?-24:f===`inner`?24:0;e.setAttribute(`transform`,`rotate(${t})`)}let t=this.container?.querySelector(`#mc_toggle_lbl_outer`),n=this.container?.querySelector(`#mc_toggle_sub_outer`),r=this.container?.querySelector(`#mc_toggle_lbl_cal`),i=this.container?.querySelector(`#mc_toggle_lbl_inner`),a=this.container?.querySelector(`#mc_toggle_sub_inner`),o=f===`outer`,s=f===`inner`,c=f===`cal`;t&&t.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n&&(n.setAttribute(`fill`,o?`#fbbf24`:`#64748b`),n.setAttribute(`fill-opacity`,o?`1`:`0.5`)),r&&r.setAttribute(`fill`,c?`#fbbf24`:`#94a3b8`),i&&i.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a&&(a.setAttribute(`fill`,s?`#fbbf24`:`#64748b`),a.setAttribute(`fill-opacity`,s?`1`:`0.5`));let l=this.container?.querySelector(`#mc_scale_outer_group`),u=this.container?.querySelector(`#mc_scale_inner_group`);l&&(l.style.transition=`opacity 0.2s ease`,l.style.opacity=o?`1`:`0.35`),u&&(u.style.transition=`opacity 0.2s ease`,u.style.opacity=s?`1`:`0.35`);let d=this.container?.querySelector(`#mccurdy_vintage_knob_rotor`);if(d){let e=d.getAttribute(`data-cx`)||`1580`,t=d.getAttribute(`data-cy`)||`215`,n=(p-15)*9;d.setAttribute(`transform`,`translate(${e}, ${t}) rotate(${n.toFixed(1)})`)}}}updateShatterState(e){for(let t of this.vuShatterEls)t&&(t.style.display=e?`inline`:`none`)}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(e),this.initDom(),!0);let n=e?e.meterStyle===`sifam`:!1;this.updateNeedles(t,!e||e.power,n),this.renderSecondary(e,t)}},xr=`PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.PK`.split(`.`),Sr=[-45,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],Cr=`-100.-90.-80.-70.-60.-55.-50.-45.PR.-36.-32.-28.-26.-24.-22.-20.-18.-16.-15.-14.-13.-12.-11.-10.-9.-8.-7.-6.-5.-4.-3.-2.-1.0.+1.+2.+3.+4.+5.+6.+7.+8.+9.+10.+11.+12.+13.+14.+15.+16.+17.+18.+19.+20.+21.+22.PK`.split(`.`),wr=[-100,-90,-80,-70,-60,-55,-50,-45,-42,-36,-32,-28,-26,-24,-22,-20,-18,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24];function Tr(e){return e?-8:0}function Er(e){return e?48:40}function Dr(e){return e?Cr:xr}function Or(e){return e?wr:Sr}function kr(e,t,n){if(!Number.isFinite(e)||e<(t?-110:-55))return-1;let r=-1;for(let t=0;t<n.length;t++){let i=n[t];if(i!==void 0&&e>=i)r=t;else break}return r}var Ar=3200;function jr(e){return 1600+(e-25)*46}var Mr=`#111317`;function Nr(e,t){return e===t?`#dc2626`:e>=40||e===25?`#ef4444`:e===24||e===26?`#facc15`:e<0?`#10b981`:e<=18?`#22c55e`:e<=23?`#f59e0b`:e<=33?`#f97316`:`#ef4444`}function Pr(e,t){return e===25||e===t?`#ef4444`:e===24||e===26?`#facc15`:e>=40?`#ef4444`:e>26?`#f97316`:e>=19?`#f59e0b`:e<0?`#10b981`:`#94a3b8`}var Fr=`
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
        `,Ir=`
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
        `;function Lr(e){let t=(e,t,n,r,i,a,o)=>{let s=(e-n/2).toFixed(1),c=(t-r/2).toFixed(1);return`
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
        ${e.extendedLed22?Fr:Ir}
      </g>
    </svg>`}function Rr(e,t){let n=[{},{}];for(let r=e;r<=t;r++)n[0][r]=!1,n[1][r]=!1;return n}function zr(e,t){return Math.max(.001,Math.min(.1,(e-t)/1e3))}function Br(e,t,n){let r=t.vuDb[n]??-90;if(e.scaleMode===`log`){if(t.lufs&&t.lufs.mL!==void 0){let e=n===0?t.lufs.mL:t.lufs.mR;e!==void 0&&Number.isFinite(e)&&e>-59&&(r=e+24)}}else e.scaleMode===`vu`?r=t.vuDb[n]??-90:e.scaleMode===`peak`&&(r=t.ppmDb[n]??-90);return r}function Vr(e,t,n,r){let i=e.smoothDb[t]??-100;if(n>=i){let e=1-Math.exp(-r/.01);i+=e*(n-i)}else{let t=24/2.8;e.decayType===`type1`?t=20/1.5:e.decayType===`vu`?t=20/.3:e.decayType===`instant`&&(t=45),i=Math.max(n,i-t*r)}return e.smoothDb[t]=i,i}function Hr(e,t,n){let r=e.dbToSegmentIndex(n),i=e.heldPeak[t]??-1,a=e.holdTimer[t]??0;return r>=i?(e.heldPeak[t]=r,e.holdTimer[t]=90):a>0?e.holdTimer[t]=a-1:e.heldPeak[t]=Math.max(-1,i-1),e.heldPeak[t]??-1}function Ur(e,t,n,r){let i=Rr(e.minP,e.maxP);if(n)for(let n=0;n<2;n++){let a=Vr(e,n,Br(e,t,n),r),o=e.dbToSegmentIndex(a),s=e.SCALE.length-1,c=i[n];if(c)for(let t=0;t<=o&&t<s;t++){let n=e.minP+t;c[n]=!0}let l=Hr(e,n,t.ppmDb[n]??-90);if(l>=0&&l<=s&&c){let t=e.minP+l;c[t]=!0}let u=e.extendedLed22?22:14,d=t.peak[n];c&&(d||(t.ppmDb[n]??-90)>=u)&&(c[e.maxP]=!0)}else e.heldPeak=[-1,-1],e.holdTimer=[0,0];return i}function Wr(e,t,n,r){t.ledEls=[{},{}],t.glowEls=[{},{}],t.lastLit=[{},{}];for(let i=0;i<2;i++)for(let a=n;a<=r;a++){let n=t.ledEls[i],r=t.glowEls[i],o=t.lastLit[i];n&&r&&o&&(n[a]=e.querySelector(`#pod_led_${i}_${a}`),r[a]=e.querySelector(`#pod_core_${i}_${a}`),o[a]=null)}}function Gr(e,t,n,r,i){for(let a=0;a<2;a++){let o=t[a],s=e.lastLit[a],c=e.ledEls[a],l=e.glowEls[a];if(o&&s&&c&&l)for(let e=n;e<=r;e++){let t=o[e]??!1;if(s[e]!==t){s[e]=t;let n=c[e],r=l[e];if(!n)continue;t?(n.setAttribute(`fill`,i(e)),n.setAttribute(`opacity`,`0.88`),n.setAttribute(`filter`,`url(#smokyglow)`),r&&r.setAttribute(`opacity`,`0.24`)):(n.setAttribute(`fill`,Mr),n.setAttribute(`opacity`,`0.15`),n.removeAttribute(`filter`),r&&r.setAttribute(`opacity`,`0`))}}}}var Kr=class{container;isBuilt=!1;heldPeak=[-1,-1];holdTimer=[0,0];dip={BS0:0,BS1:1};PW=Ar;PH=192;SCALE_STD=xr;THRESHOLDS_STD=Sr;SCALE_EXT=Cr;THRESHOLDS_EXT=wr;extendedLed22=!0;scaleMode=`log`;decayType=`type2`;smoothDb=[-100,-100];lastTime=performance.now();ledEls=[{},{}];glowEls=[{},{}];lastLit=[{},{}];constructor(e){this.container=e}get minP(){return Tr(this.extendedLed22)}get maxP(){return Er(this.extendedLed22)}get SCALE(){return Dr(this.extendedLed22)}get DB_THRESHOLDS(){return Or(this.extendedLed22)}setDecay(e){this.decayType=e,this.dip.BS0=+(e===`type1`)}setExtendedRange(e){this.extendedLed22!==e&&(this.extendedLed22=e,this.isBuilt=!1,this.heldPeak=[-1,-1],this.holdTimer=[0,0],this.container&&(this.container.innerHTML=this.buildShell(),this.initDom(),this.isBuilt=!0))}segX(e){return jr(e)}segColor(e){return Nr(e,this.maxP)}scaleNumColor(e,t){return Pr(e,this.maxP)}dbToSegmentIndex(e){return kr(e,this.extendedLed22,this.DB_THRESHOLDS)}buildShell(){return Lr(this)}initDom(){this.container&&Wr(this.container,this,this.minP,this.maxP)}render(e,t){if(!this.container)return;this.isBuilt||=(this.container.innerHTML=this.buildShell(),this.initDom(),!0);let n=performance.now(),r=zr(n,this.lastTime);this.lastTime=n;let i=Ur(this,t,e.power,r);Gr(this,i,this.minP,this.maxP,e=>this.segColor(e))}},N=[{sec:10,label:`10s`},{sec:20,label:`20s`},{sec:30,label:`30s`},{sec:40,label:`40s`},{sec:50,label:`50s`},{sec:60,label:`1 min`},{sec:90,label:`1 min 30`},{sec:120,label:`2 min`},{sec:150,label:`2 min 30`},{sec:180,label:`3 min`},{sec:240,label:`4 min`},{sec:300,label:`5 min`},{sec:360,label:`6 min`},{sec:420,label:`7 min`},{sec:480,label:`8 min`},{sec:540,label:`9 min`},{sec:600,label:`10 min`}],qr=[{fps:60,label:`60 FPS (Eco)`,warning:null},{fps:120,label:`120 FPS (Standard)`,warning:null},{fps:240,label:`240 FPS (Default)`,warning:null},{fps:480,label:`480 FPS (High)`,warning:null},{fps:960,label:`960 FPS (Ultra)`,warning:null}];function Jr(e){return N[Math.max(0,Math.min(N.length-1,Math.round(Number(e))))].sec}function Yr(e){let t=0,n=1/0;for(let r=0;r<N.length;r++){let i=Math.abs(N[r].sec-e);i<n&&(n=i,t=r)}return t}function Xr(e){let t=N.find(t=>t.sec===e);if(t)return t.label;if(e<60)return e+`s`;let n=Math.floor(e/60),r=e%60;return n>=10?`10 min`:r>0?`${n} min ${r}`:`${n} min`}function Zr(e){return[e.histL,e.histR,e.histSum,e.histDiff,e.histNormL,e.histNormR,e.histNormSum,e.histNormDiff,e.histLufsM,e.histLufsS,e.histLufsI,e.histPhase]}function Qr(e){e.pyr=new Map;let t=e.bufferSize;for(let n of Zr(e)){let r=[new Float32Array],i=[new Float32Array];for(let e=1;e<=14;e++)r.push(new Float32Array((t>>e)+2).fill(-60)),i.push(new Float32Array((t>>e)+2).fill(0));e.pyr.set(n,{max:r,sum:i})}e.pyrFor=e.histL,e.absCount=0}function $r(e){(e.count===0||e.pyrFor!==e.histL)&&Qr(e);let t=e.absCount,n=e.head;for(let[r,i]of e.pyr){let e=r[n];for(let n=1;n<=14;n++){let r=i.max[n],a=i.sum[n],o=Math.floor(t/(1<<n))%r.length;t&(1<<n)-1?(e>r[o]&&(r[o]=e),a[o]=a[o]+e):(r[o]=e,a[o]=e)}}e.absCount=t+1}function ei(e,t,n){let r=e.absCount-e.count,i=e.absCount-1,a=Math.max(r,Math.min(i,n)),o=Math.floor(a),s=Math.min(i,o+1),c=a-o,l=e.bufferSize,u=((e.head-(e.absCount-o))%l+l)%l,d=((e.head-(e.absCount-s))%l+l)%l;return t[u]*(1-c)+t[d]*c}function ti(e,t,n,r,i){let a=e.pyr.get(t),o=1<<n,s=Math.ceil((e.absCount-e.count)/o),c=Math.floor((e.absCount-1)/o),l=Math.max(s,Math.min(c,r)),u=l%a.max[n].length;if(!i)return a.max[n][u];let d=Math.min(o,e.absCount-l*o);return a.sum[n][u]/Math.max(1,d)}function ni(e,t,n,r,i){if(n<=0)return ei(e,t,r);let a=r/(1<<n)-.5,o=Math.floor(a),s=a-o;return ti(e,t,n,o,i)*(1-s)+ti(e,t,n,o+1,i)*s}function ri(e,t,n,r,i,a=!1){let o=(e,t,n)=>{let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)},s=2.5*o(.5,1,i),c=Math.max(0,Math.min(13,Math.log2(Math.max(1,r))+s)),l=Math.floor(c),u=c-l,d=r=>ni(e,t,l,n,r)*(1-u)+ni(e,t,l+1,n,r)*u,f=a?1:o(.35,.6,i),p=f<1?d(!1):0,m=f>0?d(!0):0;return p*(1-f)+m*f}function ii(e,t){e.histL=new Float32Array(t).fill(-60),e.histR=new Float32Array(t).fill(-60),e.histSum=new Float32Array(t).fill(-60),e.histDiff=new Float32Array(t).fill(-60),e.histNormL=new Float32Array(t).fill(-60),e.histNormR=new Float32Array(t).fill(-60),e.histNormSum=new Float32Array(t).fill(-60),e.histNormDiff=new Float32Array(t).fill(-60),e.histLufsM=new Float32Array(t).fill(-60),e.histLufsS=new Float32Array(t).fill(-60),e.histLufsI=new Float32Array(t).fill(-60),e.histPhase=new Float32Array(t).fill(1)}function ai(e,t){e.bufferSize!==t&&(e.bufferSize=t,ii(e,t),e.head=0,e.count=0,e.graphDirty=!0)}function oi(e){e.head=0,e.count=0,e.histL.fill(-60),e.histR.fill(-60),e.histSum.fill(-60),e.histDiff.fill(-60),e.histNormL.fill(-60),e.histNormR.fill(-60),e.histNormSum.fill(-60),e.histNormDiff.fill(-60),e.histLufsM.fill(-60),e.histLufsS.fill(-60),e.histLufsI.fill(-60),e.envL=-60,e.envR=-60,e.envSum=-60,e.envDiff=-60,e.envLufsM=-60,e.envLufsS=-60,e.normL=-60,e.normR=-60,e.normSum=-60,e.normDiff=-60,e.peakMaxL=-60,e.peakMaxR=-60,e.lufsMaxM=-60,e.clipCountL=0,e.clipCountR=0,e.graphDirty=!0}function si(e,t,n,r,i,a,o,s,c){let l=performance.now(),u=1e3/e.captureSpeed-1.5;if(e.lastPushTime&&l-e.lastPushTime<u)return;let d=e.lastPushTime?Math.max(.001,Math.min(.1,(l-e.lastPushTime)/1e3)):1/e.captureSpeed;e.lastPushTime=l;let f=isFinite(t)?Math.max(-60,Math.min(0,t)):-60,p=isFinite(n)?Math.max(-60,Math.min(0,n)):-60,m=isFinite(o)?Math.max(-60,Math.min(6.02,o)):-60,h=isFinite(s)?Math.max(-60,Math.min(6.02,s)):-60,g=isFinite(r)?Math.max(-60,Math.min(0,r)):-60,_=isFinite(i)?Math.max(-60,Math.min(0,i)):-60,v=isFinite(c)?Math.max(-60,Math.min(0,c)):-60,y=isFinite(a)?Math.max(-1,Math.min(1,a)):1,b=75*d;e.envL=f>=e.envL?f:Math.max(-60,e.envL-b),e.envR=p>=e.envR?p:Math.max(-60,e.envR-b),e.envSum=m>=e.envSum?m:Math.max(-60,e.envSum-b),e.envDiff=h>=e.envDiff?h:Math.max(-60,e.envDiff-b);let x=1-Math.exp(-d/.4);e.normL+=x*(e.envL-e.normL),e.normR+=x*(e.envR-e.normR),e.normSum+=x*(e.envSum-e.normSum),e.normDiff+=x*(e.envDiff-e.normDiff);let S=30*d,C=10*d;e.envLufsM=e.envLufsM===void 0||e.count===0||g>=e.envLufsM?g:Math.max(-60,e.envLufsM-S),e.envLufsS=e.envLufsS===void 0||e.count===0||_>=e.envLufsS?_:Math.max(-60,e.envLufsS-C),e.histL[e.head]=e.envL,e.histR[e.head]=e.envR,e.histSum[e.head]=e.envSum,e.histDiff[e.head]=e.envDiff,e.histNormL[e.head]=e.normL,e.histNormR[e.head]=e.normR,e.histNormSum[e.head]=e.normSum,e.histNormDiff[e.head]=e.normDiff,e.histLufsM[e.head]=e.envLufsM,e.histLufsS[e.head]=e.envLufsS,e.histLufsI[e.head]=v,e.histPhase[e.head]=y,$r(e),e.head=(e.head+1)%e.bufferSize,e.count<e.bufferSize&&e.count++,f>=0&&e.clipCountL++,p>=0&&e.clipCountR++,f>e.peakMaxL&&(e.peakMaxL=f),p>e.peakMaxR&&(e.peakMaxR=p),g>e.lufsMaxM&&(e.lufsMaxM=g)}function P(e,t){let n=localStorage.getItem(e);return n===null?t:n===`true`}function ci(){return{showChA:P(`xtm_scope_show_cha`,!1),showChB:P(`xtm_scope_show_chb`,!1),showSum:P(`xtm_scope_show_sum`,!0),showDiff:P(`xtm_scope_show_diff`,!1),showLufs:P(`xtm_scope_show_lufs`,!0),showLufsS:P(`xtm_scope_show_lufs_s`,!1),showLufsI:P(`xtm_scope_show_lufs_i`,!1),show0DbfsLine:P(`xtm_scope_show_0dbfs`,!0),isDocked:localStorage.getItem(`xtm_hud_docked`)===`true`}}function li(){return{bg:`#07090c`,grid:`#1a202c`,gridTime:`#141824`,gridRef:`#15803d`,gridTargetBrd:`#10b981`,gridTargetStr:`#f97316`,gridWarn:`#d97706`,gridClip:`#dc2626`,textMuted:`#64748b`,textCyan:`#ffffff`,textGold:`#ef4444`,textSum:`#22c55e`,textDiff:`#06b6d4`,textLufs:`#f4902c`,textLufsS:`#c084fc`,textInteg:`#34d399`,lineL:`#ffffff`,lineR:`#ef4444`,lineSum:`#22c55e`,lineDiff:`#06b6d4`,lineLufs:`#f4902c`,fillL:`rgba(255, 255, 255, 0.08)`,fillR:`rgba(239, 68, 68, 0.08)`,fillSum:`rgba(34, 197, 94, 0.09)`,fillDiff:`rgba(6, 182, 212, 0.08)`,fillLufs:`rgba(244, 144, 44, 0.14)`}}var ui={bg:`#e5e1d5`,grid:`#cdc8bb`,gridTime:`#d3cec2`,textMuted:`#68655d`,textCyan:`#232325`,lineL:`#232325`,fillL:`rgba(35, 35, 37, 0.08)`},di=`
      <div class="dbfs-inner" style="position:relative;width:100%;height:100%;flex:1;display:flex;flex-direction:column;background:var(--dbfs-bg, #07090c);overflow:hidden;user-select:none;">
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
      </div>`,fi=[{key:`showChA`,storage:`xtm_scope_show_cha`,drawerId:`chkShowChA`},{key:`showChB`,storage:`xtm_scope_show_chb`,drawerId:`chkShowChB`},{key:`showSum`,storage:`xtm_scope_show_sum`,drawerId:`chkShowSum`},{key:`showDiff`,storage:`xtm_scope_show_diff`,drawerId:`chkShowDiff`},{key:`showLufs`,storage:`xtm_scope_show_lufs`,drawerId:`chkShowLufs`},{key:`showLufsS`,storage:`xtm_scope_show_lufs_s`,drawerId:`chkShowLufsS`},{key:`showLufsI`,storage:`xtm_scope_show_lufs_i`,drawerId:`chkShowLufsI`}];function pi(e,t){e.hudEl=t.querySelector(`#dbfsHoverHud`),e.hudChA=t.querySelector(`#hudChA`),e.hudChB=t.querySelector(`#hudChB`),e.hudSum=t.querySelector(`#hudSum`),e.hudDiff=t.querySelector(`#hudDiff`),e.hudLufsM=t.querySelector(`#hudLufsM`),e.hudLufsS=t.querySelector(`#hudLufsS`),e.hudLufsI=t.querySelector(`#hudLufsI`),e.hudLra=t.querySelector(`#hudLra`),e.hudMax=t.querySelector(`#hudMax`),e.hudClipRow=t.querySelector(`#hudClipRow`),e.hudClips=t.querySelector(`#hudClips`),e.hudTimeMode=t.querySelector(`#hudTimeMode`),e.wrapper=t.querySelector(`.dbfs-canvas-wrapper`),e.dockContainer=null,e.btnDock=t.querySelector(`#btnDockHud`),e.hudChkChA=t.querySelector(`#hudChkChA`),e.hudChkChB=t.querySelector(`#hudChkChB`),e.hudChkSum=t.querySelector(`#hudChkSum`),e.hudChkDiff=t.querySelector(`#hudChkDiff`),e.hudChkLufsM=t.querySelector(`#hudChkLufsM`),e.hudChkLufsS=t.querySelector(`#hudChkLufsS`),e.hudChkLufsI=t.querySelector(`#hudChkLufsI`),e.hudRowChA=t.querySelector(`#hudRowChA`),e.hudRowChB=t.querySelector(`#hudRowChB`),e.hudRowSum=t.querySelector(`#hudRowSum`),e.hudRowDiff=t.querySelector(`#hudRowDiff`),e.hudRowLufsM=t.querySelector(`#hudRowLufsM`),e.hudRowLufsS=t.querySelector(`#hudRowLufsS`),e.hudRowLufsI=t.querySelector(`#hudRowLufsI`)}function mi(e){return[[e.hudChkChA,e.hudRowChA,`showChA`],[e.hudChkChB,e.hudRowChB,`showChB`],[e.hudChkSum,e.hudRowSum,`showSum`],[e.hudChkDiff,e.hudRowDiff,`showDiff`],[e.hudChkLufsM,e.hudRowLufsM,`showLufs`],[e.hudChkLufsS,e.hudRowLufsS,`showLufsS`],[e.hudChkLufsI,e.hudRowLufsI,`showLufsI`]]}function hi(e){let t=mi(e);for(let[n,,r]of t)n&&(n.checked=e[r]);for(let[,n,r]of t)n&&n.classList.toggle(`trace-off`,!e[r]);let n=fi.map(e=>document.getElementById(e.drawerId));fi.forEach((t,r)=>{let i=n[r];i&&(i.checked=e[t.key])}),e.graphDirty=!0}function gi(e){mi(e).forEach(([t,,n],r)=>{if(!t)return;let i=fi[r].storage;t.addEventListener(`change`,t=>{e[n]=t.target.checked,localStorage.setItem(i,String(e[n])),hi(e)})}),e._updateTraceToggles=()=>hi(e),hi(e)}function _i(e){for(let t of fi){let n=document.getElementById(t.drawerId);n&&(n.checked=e[t.key],n.addEventListener(`change`,n=>{e[t.key]=n.target.checked,localStorage.setItem(t.storage,String(e[t.key])),e._updateTraceToggles&&e._updateTraceToggles()}))}}function vi(e){let t=document.getElementById(`btnScopeLog`),n=document.getElementById(`btnScopeSuperLog`),r=document.getElementById(`btnScopeLin`),i=document.getElementById(`scopeLengthSlider`),a=document.getElementById(`scopeLengthVal`),o=document.getElementById(`btnScopeClear`),s=document.getElementById(`scopeSpeedSlider`),c=document.getElementById(`scopeSpeedVal`),l=t=>()=>{e.setTimeMode(t),e.onTimeModeChange&&e.onTimeModeChange(t)};if(t&&r&&(t.addEventListener(`click`,l(`log`)),n&&n.addEventListener(`click`,l(`super_log`)),r.addEventListener(`click`,l(`lin`))),i&&(i.min=`0`,i.max=String(N.length-1),i.step=`1`,i.value=String(e.secondsToSlider(e.captureLength)),a&&(a.textContent=e.formatDuration(e.captureLength)),i.addEventListener(`input`,t=>{let n=parseFloat(t.target.value);e.captureLength=e.sliderToSeconds(n),a&&(a.textContent=e.formatDuration(e.captureLength))})),o&&o.addEventListener(`click`,()=>{e.clear(),e.onClear&&e.onClear()}),s){s.min=`0`,s.max=String(qr.length-1),s.step=`1`;let t=qr.findIndex(t=>t.fps===e.captureSpeed);t<0&&(t=2),s.value=String(t),c&&(c.textContent=qr[t].label);let n=document.getElementById(`scopeSpeedWarning`),r=document.getElementById(`scopeSpeedWarningText`);s.addEventListener(`input`,t=>{let i=qr[Math.max(0,Math.min(qr.length-1,parseInt(t.target.value,10)))];e.captureSpeed!==i.fps&&(e.captureSpeed=i.fps,e.resizeBuffer(Math.round(e.maxCaptureSec*e.captureSpeed))),c&&(c.textContent=i.label),i.warning?n&&r&&(r.textContent=`⚠️ `+i.warning,n.style.display=`block`):n&&(n.style.display=`none`)})}}function yi(e){let t=document.getElementById(`chkEnableFade`),n=document.getElementById(`chkEnableFadeLabel`),r=document.getElementById(`hfFadeSlider`),i=document.getElementById(`hfFadeVal`),a=()=>{let a=!e.enableFade||e.hfFadeDistance>=100;t&&(t.checked=e.enableFade),n&&(n.textContent=a?`Off (Full View)`:`On (Fading)`),i&&(i.textContent=a?`100% (Full View)`:e.hfFadeDistance+`%`),r&&(r.value=String(e.hfFadeDistance))};t&&t.addEventListener(`change`,t=>{e.enableFade=t.target.checked,e.enableFade?e.hfFadeDistance>=100&&(e.hfFadeDistance=50):e.hfFadeDistance=100,a()}),r&&r.addEventListener(`input`,t=>{e.hfFadeDistance=parseFloat(t.target.value),e.enableFade=!(e.hfFadeDistance>=100),a()}),a()}function bi(e){yi(e);let t=document.getElementById(`chk0DbfsLine`);t&&(t.checked=e.show0DbfsLine,t.addEventListener(`change`,t=>{e.show0DbfsLine=t.target.checked,localStorage.setItem(`xtm_scope_show_0dbfs`,String(e.show0DbfsLine)),e.graphDirty=!0}));let n=document.getElementById(`chkHoverTelemetry`);n&&(n.checked=e.showHoverTelemetry,n.addEventListener(`change`,t=>{e.showHoverTelemetry=t.target.checked,e.isDocked?e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):e.hudEl&&(e.hudEl.style.display=e.showHoverTelemetry?``:`none`)}));let r=document.getElementById(`chkDockHud`);r&&(r.checked=e.isDocked,r.addEventListener(`change`,t=>{e.setDocked(t.target.checked)})),e.btnDock&&e.btnDock.addEventListener(`click`,t=>{t.stopPropagation(),e.setDocked(!e.isDocked)});let i=document.getElementById(`chkCursorTrace`);i&&(i.checked=e.showCursorTrace,i.addEventListener(`change`,t=>{e.showCursorTrace=t.target.checked}));let a=document.getElementById(`chkPhasePlot`);a&&(a.checked=e.plotPhase,a.addEventListener(`change`,t=>{e.plotPhase=t.target.checked}))}function xi(e,t,n,r){let i=t.getBoundingClientRect(),a=e.dpr||1,o=(n.clientX-i.left)*a,s=(n.clientY-i.top)*a,c=18*a,l=26*a,u=175*a,d=28*a,f=Math.max(10,(e.h||300)-c-l),p=Math.max(10,(e.w||800)-u-d),m=Math.round(c+f*(1-42/60));return{x:o,y:s,over:Math.abs(s-m)<=r*a&&o>=u-40*a&&o<=u+p+20*a}}function Si(e,t){t.addEventListener(`pointermove`,n=>{let{x:r,y:i,over:a}=xi(e,t,n,32);e.hoverX=r,e.hoverY=i,!e.isDocked&&e.hudEl&&e.showHoverTelemetry&&(e.hudEl.style.display=`block`),e.isHoveringLime=a,t.style.cursor=a?`ns-resize`:`crosshair`}),t.addEventListener(`pointerleave`,()=>{e.hoverX=null,e.hoverY=null,e.isHoveringLime=!1,t.style.cursor=`default`,!e.isDocked&&e.hudEl&&(e.hudEl.style.display=``)}),t.addEventListener(`wheel`,n=>{let{over:r}=xi(e,t,n,35);if(!r)return;n.preventDefault(),n.stopPropagation();let i=e.secondsToSlider(e.captureLength),a=i;if(n.deltaY<0?a=Math.max(0,i-1):n.deltaY>0&&(a=Math.min(N.length-1,i+1)),a!==i){e.captureLength=N[a].sec,e.zoomFeedbackTime=performance.now(),e.zoomFeedbackText=`ZOOM: ${e.formatDuration(e.captureLength)}`;let t=document.getElementById(`scopeLengthSlider`),n=document.getElementById(`scopeLengthVal`);t&&(t.value=String(a)),n&&(n.textContent=e.formatDuration(e.captureLength))}},{passive:!1})}function Ci(e,t){let n=t.querySelector(`.hud-header`);if(!(n&&e.wrapper&&e.hudEl))return;let r=e.hudEl,i=e.wrapper,a=!1,o=0,s=0,c=0,l=0;n.addEventListener(`pointerdown`,e=>{if(e.target.closest(`button`)||e.target.closest(`input`))return;a=!0,o=e.clientX,s=e.clientY;let t=r.getBoundingClientRect(),u=i.getBoundingClientRect();c=t.left-u.left,l=t.top-u.top;try{n.setPointerCapture(e.pointerId)}catch{}e.preventDefault()}),n.addEventListener(`pointermove`,e=>{if(!a)return;let t=e.clientX-o,n=e.clientY-s,u=i.getBoundingClientRect(),d=r.getBoundingClientRect(),f=Math.max(0,u.width-d.width),p=Math.max(0,u.height-d.height),m=Math.max(0,Math.min(f,c+t)),h=Math.max(0,Math.min(p,l+n));r.style.left=`${m}px`,r.style.top=`${h}px`,r.style.right=`auto`});let u=e=>{if(a){a=!1;try{n.releasePointerCapture(e.pointerId)}catch{}}};n.addEventListener(`pointerup`,u),n.addEventListener(`pointercancel`,u)}function wi(e){if(!e.container)return;let t=e.container;t.innerHTML=di,e.canvas=t.querySelector(`#dbfsCanvas`),e.canvas&&(e.ctx=e.canvas.getContext(`2d`,{alpha:!1})),e.graphCanvas=document.createElement(`canvas`),e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0,e.renderFrameCount=0,pi(e,t),gi(e),vi(e),bi(e),_i(e);let n=t.querySelector(`.dbfs-canvas-wrapper`);n&&(Si(e,n),Ci(e,t)),e.handleResize(),window.addEventListener(`resize`,()=>e.handleResize()),window.ResizeObserver&&(e.ro=new ResizeObserver(()=>e.handleResize()),e.ro.observe(e.container)),e.setDocked(e.isDocked)}var Ti=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`,Ei=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v10M17 7l-5 5-5-5M4 17h16M4 21h16"/></svg>`;function Di(e,t){e.isDocked=!!t;try{localStorage.setItem(`xtm_hud_docked`,e.isDocked?`true`:`false`)}catch{}let n=document.getElementById(`chkDockHud`);n&&(n.checked=e.isDocked),e.btnDock&&(e.btnDock.title=e.isDocked?`Undock to auto-hiding floating HUD`:`Pin / Dock HUD in scope`,e.btnDock.innerHTML=e.isDocked?Ti:Ei),e.hudEl&&(e.isDocked?(e.hudEl.classList.add(`docked`),e.hudEl.style.display=e.showHoverTelemetry?`flex`:`none`):(e.hudEl.classList.remove(`docked`),e.hudEl.style.display=e.showHoverTelemetry?``:`none`))}function Oi(e,t){e.beta=Math.max(1,t),e.logBetaDenom=Math.log(1+e.beta),e.graphDirty=!0}function ki(e,t){e.timeMode=t,e.graphDirty=!0;let n=document.getElementById(`btnScopeLog`),r=document.getElementById(`btnScopeSuperLog`),i=document.getElementById(`btnScopeLin`),a=document.getElementById(`scopeLogOptionsRow`);if(n&&i&&(n.classList.toggle(`active`,t===`log`),r&&r.classList.toggle(`active`,t===`super_log`),i.classList.toggle(`active`,t===`lin`)),t===`super_log`){e.setBeta(60);let t=document.getElementById(`selectScopeLogWarp`);t&&(t.value=`60`)}a&&(a.style.display=t===`log`||t===`super_log`?`flex`:`none`)}function Ai(e,t){e.captureLength=Math.max(1,Math.min(e.maxCaptureSec||600,t));let n=document.getElementById(`scopeLengthVal`),r=document.getElementById(`scopeLengthSlider`);n&&(n.textContent=e.formatDuration(e.captureLength)),r&&(r.value=String(e.secondsToSlider(e.captureLength))),e.graphDirty=!0}function ji(e){if(!e.canvas||!e.canvas||!e.canvas.parentElement)return;let t=e.canvas.parentElement.getBoundingClientRect(),n=Math.min(window.devicePixelRatio||1,2),r=Math.round(t.width*n),i=Math.round(t.height*n);r>0&&i>0&&(e.canvas.width!==r||e.canvas.height!==i)&&(e.canvas.width=r,e.canvas.height=i,e.w=r,e.h=i,e.dpr=n,e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=r,e.graphCanvas.height=i,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0)}function Mi(e){let t=e.dbfs||[-60,-60,-60,-60],n=isFinite(t[0])?Math.max(-60,t[0]):-60,r=isFinite(t[1])?Math.max(-60,t[1]):-60,i=-60,a=-60;if(typeof t[2]==`number`&&isFinite(t[2]))i=Math.max(-60,t[2]);else{let t=10**(n/20),a=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+a*a+2*t*a*o))*.5;i=s>1e-6?20*Math.log10(s):-60}if(typeof t[3]==`number`&&isFinite(t[3]))a=Math.max(-60,t[3]);else{let t=10**(n/20),i=10**(r/20),o=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1,s=Math.sqrt(Math.max(0,t*t+i*i-2*t*i*o))*.5;a=s>1e-6?20*Math.log10(s):-60}let o=e.lufs||{},s=isFinite(o.m)?Math.max(-60,o.m):-60,c=isFinite(o.s)?Math.max(-60,o.s):-60,l=typeof o.i==`number`&&isFinite(o.i)&&o.i>-60?o.i:-60,u=typeof o.lra==`number`&&isFinite(o.lra)?o.lra:0,d=e&&typeof e.phaseCorrelation==`number`?e.phaseCorrelation:1;return{liveL:n,liveR:r,liveSum:i,liveDiff:a,liveLufsM:s,liveLufsS:c,liveLufsI:l,liveLra:u,livePhase:d}}function Ni(e,t,n,r){t&&(t.hasAudio||n.liveL>-58||n.liveR>-58||n.liveSum>-55)?(e.lastAudioTime=r,e.hasSignalLost=!1):e.lastAudioTime?r-e.lastAudioTime>=1e4&&(e.hasSignalLost=!0):e.lastAudioTime=r}function Pi(e){let t=e.w,n=e.h,r=e.dpr||1,i=175*r,a=28*r,o=18*r,s=26*r,c=Math.max(10,t-i-a),l=Math.max(10,n-o-s),u=e=>o+l*(1-(Math.max(-60,Math.min(6,e))- -60)/66);return{W:t,H:n,dpr:r,padL:i,padR:a,padT:o,padB:s,plotW:c,plotH:l,maxX:Math.round(i+c),limeY:Math.round(u(-18)),bufLen:e.bufferSize,dbToY:u}}var Fi={bg:`#dedcd4`,grid:`#c4c0b2`,gridTime:`#cdc8bb`,textMuted:`#5c5a50`,textCyan:`#2a2b2a`,lineL:`#2a2b2a`,fillL:`rgba(42, 43, 42, 0.08)`,lineR:`#b91c1c`,fillR:`rgba(185, 28, 28, 0.08)`,lineSum:`#15803d`,fillSum:`rgba(21, 128, 61, 0.09)`,textSum:`#15803d`,textGold:`#b91c1c`},Ii={bg:`#16222c`,grid:`#243543`,gridTime:`#1e2c38`,textMuted:`#94a3b8`,textCyan:`#f8fafc`,lineL:`#f8fafc`,fillL:`rgba(248, 250, 252, 0.08)`,lineR:`#ef4444`,fillR:`rgba(239, 68, 68, 0.08)`,lineSum:`#22c55e`,fillSum:`rgba(34, 197, 94, 0.09)`};function Li(e){e.PAL_DARK||={...e.PAL};let t=document.body.classList.contains(`theme-wbs-ca`),n=document.body.classList.contains(`theme-mccurdy`),r=document.body.classList.contains(`theme-mccurdy-dark`);return t?(e.PAL={...e.PAL_DARK,...Fi},!0):n?(e.PAL={...e.PAL_DARK,...ui},!0):r?(e.PAL={...e.PAL_DARK,...Ii},!1):(e.PAL=e.PAL_DARK,!1)}var Ri=[{db:6,lineCol:`rgba(239, 68, 68, 0.30)`,labelCol:`#ef4444`,bold:!0,label:`+6 dBFS (SUM MAX)`},{db:3,lineCol:`rgba(34, 197, 94, 0.26)`,labelCol:`#22c55e`,bold:!1,label:`+3 dBFS (SUM OVERLOAD)`},{db:0,lineCol:`rgba(220, 38, 38, 0.34)`,labelCol:`#dc2626`,bold:!0,label:`0 dBFS (PEAK)`},{db:-3,lineCol:`rgba(217, 119, 6, 0.26)`,labelCol:`#d97706`,bold:!1,label:`-3 dBFS`},{db:-4,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-4 dBFS`},{db:-8,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-8 dBFS`},{db:-12,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-12 dBFS`},{db:-14,lineCol:`rgba(249, 115, 22, 0.30)`,labelCol:`#f97316`,bold:!0,label:`-14 LUFS (STREAM)`},{db:-16,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-16 dBFS`},{db:-18,lineCol:`rgba(74, 222, 128, 0.35)`,labelCol:`#4ade80`,bold:!0,label:`-18 dBFS (0 VU)`},{db:-20,lineCol:`rgba(100, 116, 139, 0.20)`,labelCol:`#64748b`,bold:!1,label:`-20 dBFS (SMPTE)`},{db:-24,lineCol:`rgba(16, 185, 129, 0.28)`,labelCol:`#10b981`,bold:!0,label:`-24 LUFS (BROADCAST)`},{db:-28,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-28 dBFS`},{db:-32,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-32 dBFS`},{db:-36,lineCol:`rgba(100, 116, 139, 0.18)`,labelCol:`#64748b`,bold:!1,label:`-36 dBFS`},{db:-40,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-40 dBFS`},{db:-44,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-44 dBFS`},{db:-48,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-48 dBFS`},{db:-52,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-52 dBFS`},{db:-56,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-56 dBFS`},{db:-60,lineCol:`rgba(71, 85, 105, 0.15)`,labelCol:`#475569`,bold:!1,label:`-60 dBFS`}];function zi(e){return Ri.filter(t=>!(t.db===0&&!e.show0DbfsLine||t.db>0&&!e.showSum))}var Bi={label:`LOGARITHMIC`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.6,label:t(e*.6)},{sec:e*.3,label:t(e*.3)},{sec:e*.15,label:t(e*.15)},{sec:e*.05,label:t(e*.05)},{sec:0,label:t(0)}]},Vi={label:`SUPER TRANSIENT LOG`,verticalGrid:!1,steps:(e,t)=>[{sec:e,label:t(e)},{sec:e*.4,label:t(e*.4)},{sec:e*.15,label:t(e*.15)},{sec:e*.04,label:t(e*.04)},{sec:e*.01,label:t(e*.01)},{sec:0,label:t(0)}]},Hi={label:`LINEAR`,verticalGrid:!0,steps:(e,t)=>{let n=[],r=e/5;for(let i=e;i>.01;i-=r)n.push({sec:i,label:t(i)});return n.push({sec:0,label:t(0)}),n}};function Ui(e){return e===`super_log`?Vi:e===`log`?Bi:Hi}function Wi(e){return e!==`lin`}function Gi(e){let t=new Date(Date.now()-e*1e3);return`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}:${String(t.getSeconds()).padStart(2,`0`)}`}function Ki(e,t,n,r,i,a){let{dpr:o,padL:s,padT:c,plotW:l,plotH:u}=n;t.font=`${Math.round(10*o)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.textAlign=`center`,t.textBaseline=`top`,t.fillStyle=e.PAL.textMuted,t.strokeStyle=e.PAL.gridTime,t.lineWidth=1*o;let d=Ui(e.timeMode),f=d.steps(r,Gi),p=Wi(e.timeMode);f.forEach(e=>{let n;if(!p)n=Math.round(s+l*(1-e.sec/r));else{let t=e.sec/r,o=e.sec===0?0:Math.log(1+i*t)/a;n=Math.round(s+l*(1-o))}d.verticalGrid&&(t.beginPath(),t.moveTo(n,c),t.lineTo(n,c+u),t.stroke()),t.beginPath(),t.moveTo(n,c+u),t.lineTo(n,c+u+4*o),t.stroke(),t.fillText(e.label,n,c+u+6*o)})}function qi(e,t,n,r,i){let a=Math.round(n*e.captureSpeed),o=Math.min(e.count,a);if(o<2)return null;let s=t.bufLen,c=(e.head-o+s)%s,l=Wi(e.timeMode),u=e=>{if(l){let n=e<=1e-5?0:Math.log(1+r*e)/i;return t.padL+t.plotW*(1-n)}return t.padL+t.plotW*(1-e)},d=(o-1)/e.captureSpeed,f=Math.max(0,Math.min(1,d/n));return{capSec:n,beta:r,logBetaDenom:i,warped:l,targetSamples:o,startIdx:c,minX:Math.round(u(f))}}function Ji(e,t,n,r){let i=Math.max(0,Math.min(1,(r-t.padL)/t.plotW)),a,o=0;n.warped?(o=1-i,a=((1+n.beta)**+o-1)/n.beta):a=1-i;let s=Math.max(0,Math.min(n.capSec,a*n.capSec)),c=n.targetSamples-1-s*e.captureSpeed;return[Math.max(0,Math.min(n.targetSamples-1,c)),o]}function F(e,t,n,r,i){let a=e.createLinearGradient(t,0,n,0);return a.addColorStop(0,`rgba(${r}, 0)`),a.addColorStop(1,`rgba(${r}, ${i})`),a}function Yi(e,t,n){let r=e.enableFade&&e.hfFadeDistance<100,i=e.PAL.fillLufs;if(r){let a=Math.max(10,Math.min(95,e.hfFadeDistance||50))/100,o=Math.round(n.padL+n.plotW*(1-a)),s=Math.round(n.padL+n.plotW*(1-a*.5));return{strokeA:F(t,o,s,`255, 255, 255`,`1`),fillA:F(t,o,s,`255, 255, 255`,`0.08`),strokeB:F(t,o,s,`239, 68, 68`,`1`),fillB:F(t,o,s,`239, 68, 68`,`0.08`),strokeSum:F(t,o,s,`34, 197, 94`,`1`),fillSum:F(t,o,s,`34, 197, 94`,`0.09`),strokeDiff:F(t,o,s,`6, 182, 212`,`1`),fillDiff:F(t,o,s,`6, 182, 212`,`0.08`),fillLufs:i,doFade:r}}return{strokeA:e.PAL.lineL,fillA:e.PAL.fillL,strokeB:e.PAL.lineR,fillB:e.PAL.fillR,strokeSum:e.PAL.lineSum,fillSum:e.PAL.fillSum,strokeDiff:e.PAL.lineDiff,fillDiff:e.PAL.fillDiff,fillLufs:i,doFade:r}}function Xi(e,t,n,r,i,a,o,s,c=!0,l=!1,u=null){let{dpr:d,padL:f,padT:p,plotW:m,plotH:h,maxX:g,bufLen:_,dbToY:v}=n,{minX:y,targetSamples:b,startIdx:x,capSec:S}=r;if(t.beginPath(),y>=g)return;let C=g-y,ee=e.absCount-b,te=e.pyr.has(i)&&e.pyrFor===e.histL;for(let a=0;a<=C;a++){let o=g-a,[s,c]=Ji(e,n,r,o),l=Ji(e,n,r,o-.5)[0],d=Ji(e,n,r,o+.5)[0]-l,p=te&&d>1.5,h=1-Math.max(0,Math.min(1,(o-f)/m)),y=ee+s,C=Math.floor(s),ne=Math.min(b-1,C+1),re=s-C,ie=(x+C)%_,ae=(x+ne)%_,w=p?ri(e,i,y,d,h):i[ie]*(1-re)+i[ae]*re,oe=t=>p&&e.pyr.has(t)?ri(e,t,y,d,h):t[ie]*(1-re)+t[ae]*re;if(u){if(r.warped){if(c>.05){let e=Math.min(1,(c-.05)/.35),t=e*e*(3-2*e),n=oe(u);w=w*(1-t)+n*t}}else{let t=S*e.captureSpeed/m;if(t>4){let e=Math.min(1,(t-4)/8),n=oe(u);w=w*(1-e)+n*e}}}a===0?t.moveTo(o,v(w)):t.lineTo(o,v(w))}if(a&&(t.strokeStyle=a,t.lineWidth=s*d,t.stroke()),c&&o){let e=p+h;t.lineTo(y,e),t.lineTo(g,e),t.closePath(),t.fillStyle=o,t.fill()}}function Zi(e,t,n,r,i,a){let o=n.dpr,s=(i,a,o,s,c=!0,l=!1,u=null)=>Xi(e,t,n,r,i,a,o,s,c,l,u);e.showChB&&s(e.histR,i.strokeB,i.fillB,1.5,!0,i.doFade,e.histNormR),e.showChA&&s(e.histL,i.strokeA,i.fillA,1.5,!0,i.doFade,e.histNormL),e.showSum&&s(e.histSum,i.strokeSum,i.fillSum,1.8,!0,i.doFade,e.histNormSum),e.showDiff&&s(e.histDiff,i.strokeDiff,i.fillDiff,1.8,!0,i.doFade,e.histNormDiff),e.showLufs&&(t.save(),a||(t.shadowColor=`#f97316`,t.shadowBlur=12*o),s(e.histLufsM,a?null:`rgba(249, 115, 22, 0.45)`,i.fillLufs,5,!0,!1),s(e.histLufsM,`#fb923c`,null,2.6,!1,!1),t.restore()),e.showLufsS&&s(e.histLufsS,e.PAL.textLufsS,null,2,!1,!1),e.showLufsI&&s(e.histLufsI,e.PAL.textInteg,null,2,!1,!1)}function Qi(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,maxX:c,bufLen:l,dbToY:u}=n,{minX:d,targetSamples:f,startIdx:p}=r,m=u(-46),h=u(-60),g=e=>h-e/180*(h-m),_=`rgba(168, 85, 247, 0.85)`;t.save(),t.fillStyle=i?`rgba(168, 85, 247, 0.06)`:`rgba(168, 85, 247, 0.05)`,t.fillRect(o,m,s,h-m),t.setLineDash([3*a,4*a]),t.lineWidth=1*a,t.strokeStyle=`rgba(168, 85, 247, 0.35)`;for(let e of[0,90,180]){let n=Math.round(g(e))+.5;t.beginPath(),t.moveTo(o,n),t.lineTo(o+s,n),t.stroke()}t.setLineDash([]),t.font=`bold ${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.fillStyle=_;let v=o+s-4*a;t.textBaseline=`top`,t.fillText(`180° PHASE`,v,m+2*a),t.textBaseline=`middle`,t.fillText(`90°`,v,g(90)),t.textBaseline=`bottom`,t.fillText(`0°`,v,h-2*a),t.restore();let y=t=>Ji(e,n,r,t)[0],b=e.absCount-f,x=e.pyr.has(e.histPhase)&&e.pyrFor===e.histL;t.beginPath();let S=c-d;for(let n=0;n<=S;n++){let r=c-n,i=y(r),a=y(r+.5)-y(r-.5),u;if(x&&a>1.5){let t=1-Math.max(0,Math.min(1,(r-o)/s));u=ri(e,e.histPhase,b+i,a,t,!0)}else{let t=Math.floor(i),n=Math.min(f-1,t+1),r=i-t;u=e.histPhase[(p+t)%l]*(1-r)+e.histPhase[(p+n)%l]*r}let d=g(180-Math.acos(Math.max(-1,Math.min(1,u)))*180/Math.PI);n===0?t.moveTo(r,d):t.lineTo(r,d)}t.strokeStyle=_,t.lineWidth=1.4*a,t.stroke()}function $i(e,t,n){let r=t.dbToY(-14),i=t.dbToY(-24);e.save(),e.fillStyle=n?`rgba(249, 115, 22, 0.08)`:`rgba(249, 115, 22, 0.06)`,e.fillRect(t.padL,r,t.plotW,i-r),e.restore()}function ea(e,t,n,r,i){let{dpr:a,padL:o,plotW:s,dbToY:c}=n;t.save(),t.font=`${Math.round(10*a)}px ui-monospace, "SF Mono", monospace`,t.textAlign=`right`,t.textBaseline=`middle`,t.setLineDash([]);let l=13*a,u=[],d=new Set,f=[...r].sort((e,t)=>Number(t.bold)-Number(e.bold));for(let e of f){let t=c(e.db);u.every(e=>Math.abs(e-t)>=l)&&(u.push(t),d.add(e.db))}r.forEach(n=>{let r=Math.round(c(n.db)),l=n.db===-20;(d.has(n.db)||n.bold||l)&&(t.save(),t.setLineDash([]),t.strokeStyle=l&&e.isHoveringLime?`#4ade80`:n.lineCol,t.lineWidth=l?e.isHoveringLime?2*a:1.2*a:1*a,l&&e.isHoveringLime&&!i&&(t.shadowColor=`rgba(74, 222, 128, 0.8)`,t.shadowBlur=6*a),t.beginPath(),t.moveTo(o,r),t.lineTo(o+s,r),t.stroke(),t.restore(),t.save(),i||(t.shadowColor=`rgba(0, 0, 0, 0.95)`,t.shadowBlur=3*a),t.fillStyle=n.bold||l?n.labelCol:i?`#4a4740`:`#94a3b8`,d.has(n.db)&&t.fillText(n.label,o-10*a,r),t.restore())}),t.restore(),t.setLineDash([])}function ta(e,t){let n=e.graphCtx;if(!n)return!1;e.graphDirty=!1;let r=Li(e);n.fillStyle=e.PAL.bg,n.fillRect(0,0,t.W,t.H);let i=zi(e),a=e.getActiveSpanSec(),o=e.beta||(e.timeMode===`super_log`?60:15),s=e.logBetaDenom||Math.log(1+o);Ki(e,n,t,a,o,s);let c=qi(e,t,a,o,s);return c&&(Zi(e,n,t,c,Yi(e,n,t),r),e.plotPhase&&c.minX<t.maxX&&Qi(e,n,t,c,r)),$i(n,t,r),ea(e,n,t,i,r),!0}function na(e,t,n,r,i,a,o,s,c,l){e.fillStyle=o,e.strokeStyle=s,e.lineWidth=c,e.beginPath(),e.rect(n,r,i,a),e.fill(),e.stroke(),e.fillStyle=l,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(t,n+i/2,r+a/2)}function ra(e,t,n){let{dpr:r,padL:i,plotW:a,limeY:o}=n;if(e.zoomFeedbackTime&&performance.now()-e.zoomFeedbackTime<1900){let n=performance.now()-e.zoomFeedbackTime,s=Math.max(0,Math.min(1,1-(n-1100)/800));t.save(),t.globalAlpha=s;let c=e.zoomFeedbackText||`ZOOM: ${e.formatDuration(e.captureLength)}`;t.font=`bold ${Math.round(11*r)}px ui-monospace, "SF Mono", monospace`;let l=t.measureText(c).width+20*r,u=22*r;na(t,c,Math.round(i+(a-l)/2),Math.round(o-u/2),l,u,`rgba(11, 15, 23, 0.94)`,`#22c55e`,1.5*r,`#4ade80`),t.restore()}else if(e.isHoveringLime){t.save();let n=`↕ SCROLL TO ZOOM TIME (${e.formatDuration(e.captureLength)})`;t.font=`bold ${Math.round(9.5*r)}px ui-monospace, "SF Mono", monospace`;let s=t.measureText(n).width+16*r,c=18*r;na(t,n,Math.round(i+a-s-10*r),Math.round(o-c/2),s,c,`rgba(11, 15, 23, 0.88)`,`rgba(34, 197, 94, 0.6)`,1*r,`#86efac`),t.restore()}}function ia(e,t,n){let{dpr:r,padL:i,padT:a,plotW:o,plotH:s}=n;e.showCursorTrace&&e.hoverX!==null&&e.hoverX>=i&&e.hoverX<=i+o&&(t.strokeStyle=`rgba(56, 189, 248, 0.6)`,t.lineWidth=1*r,t.setLineDash([3*r,3*r]),t.beginPath(),t.moveTo(e.hoverX,a),t.lineTo(e.hoverX,a+s),t.stroke(),t.setLineDash([]))}function I(e,t,n,r,i){e.fillStyle=i,e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.fill()}function aa(e,t,n){let{dpr:r,bufLen:i,dbToY:a}=n,o=n.maxX,s=(e.head-1+i)%i,c=a(e.histL[s]),l=a(e.histR[s]),u=a(e.histLufsM[s]);e.showChB&&I(t,o,l,3.2*r,e.PAL.lineR),e.showChA&&I(t,o,c,3.2*r,e.PAL.lineL),e.showSum&&I(t,o,a(e.histSum[s]),3.5*r,e.PAL.lineSum),e.showDiff&&I(t,o,a(e.histDiff[s]),3.5*r,e.PAL.lineDiff),e.showLufs&&(I(t,o,u,7*r,`rgba(244, 144, 44, 0.35)`),I(t,o,u,4.2*r,e.PAL.lineLufs),I(t,o,u,1.8*r,`#ffffff`)),e.showLufsS&&I(t,o,a(e.histLufsS[s]),3.8*r,e.PAL.textLufsS),e.showLufsI&&I(t,o,a(e.histLufsI[s]),3.8*r,e.PAL.textInteg)}var oa=e=>e>-60?e.toFixed(1):`-INF`,sa=e=>e>-60?(e>0?`+`:``)+e.toFixed(1):`-INF`;function ca(e,t,n){if(!e.hudChA)return;let r=(e.head-1+n)%n,i=e.histL[r],a=e.histR[r];e.hudChA.textContent=oa(i)+` dBFS`,e.hudChB&&(e.hudChB.textContent=oa(a)+` dBFS`),e.hudSum&&(e.hudSum.textContent=sa(e.histSum[r])+` dBFS`),e.hudDiff&&(e.hudDiff.textContent=sa(e.histDiff[r])+` dBFS`),e.hudLufsM&&(e.hudLufsM.textContent=oa(t.liveLufsM)+` LUFS`),e.hudLufsS&&(e.hudLufsS.textContent=oa(t.liveLufsS)+` LUFS`),e.hudLufsI&&(e.hudLufsI.textContent=oa(t.liveLufsI)+` LUFS`),e.hudLra&&(e.hudLra.textContent=(t.liveLra>0?t.liveLra.toFixed(1):`0.0`)+` LU`),e.hudMax&&(e.hudMax.textContent=`L ${oa(e.peakMaxL)} | R ${oa(e.peakMaxR)}`),e.hudTimeMode&&(e.hasSignalLost?(e.hudTimeMode.textContent=`⚠ LOSS OF SIGNAL (SILENCE > 10s)`,e.hudTimeMode.style.color=`#fbbf24`):(e.hudTimeMode.textContent=`ITU-R BS.1770-4 · ${Ui(e.timeMode).label}`,e.hudTimeMode.style.color=``)),e.clipCountL>0||e.clipCountR>0?(e.hudClipRow&&(e.hudClipRow.style.display=`flex`),e.hudClips&&(e.hudClips.textContent=String(e.clipCountL+e.clipCountR))):e.hudClipRow&&(e.hudClipRow.style.display=`none`)}function la(e,t,n,r){e.hasSignalLost&&Math.floor(r%1200/600)===0&&(t.save(),t.font=`bold ${Math.round(11*n.dpr)}px ui-monospace, monospace`,t.textAlign=`right`,t.textBaseline=`top`,t.fillStyle=`#fbbf24`,t.fillText(`⚠ LOSS OF SIGNAL (>10s)`,n.W-32*n.dpr,n.padT+8*n.dpr),t.restore())}function ua(e,t,n){if(!e.ctx||!e.w||!e.h)return;let r=Mi(n),i=performance.now();Ni(e,n,r,i),e.push(r.liveL,r.liveR,r.liveLufsM,r.liveLufsS,r.livePhase,r.liveSum,r.liveDiff,r.liveLufsI);let a=e.w,o=e.h;e.graphCanvas&&e.graphCanvas.width===a&&e.graphCanvas.height===o||(e.graphCanvas||=document.createElement(`canvas`),e.graphCanvas.width=a,e.graphCanvas.height=o,e.graphCtx=e.graphCanvas.getContext(`2d`,{alpha:!1}),e.graphDirty=!0),e.isHoveringLime!==e._lastHoveringLime&&(e.graphDirty=!0,e._lastHoveringLime=e.isHoveringLime),e.renderFrameCount=(e.renderFrameCount||0)+1;let s=Pi(e);if(!ta(e,s)||!e.ctx||!e.graphCanvas)return;e.ctx.drawImage(e.graphCanvas,0,0);let c=e.ctx;ra(e,c,s),ia(e,c,s),aa(e,c,s),ca(e,r,s.bufLen),la(e,c,s,i)}var da=class{container;canvas=null;ctx=null;graphCanvas=null;graphCtx=null;graphDirty=!0;renderFrameCount=0;_lastGraphRenderTime=0;timeMode=`log`;onTimeModeChange=null;beta=15;logBetaDenom=Math.log(16);maxCaptureSec=600;captureLength=60;captureSpeed=60;lastPushTime=0;bufferSize;static PYR_LEVELS=14;absCount=0;pyr=new Map;pyrFor=null;histL;histR;histSum;histDiff;histNormL;histNormR;histNormSum;histNormDiff;histLufsM;histLufsS;histLufsI;histPhase;envL=-60;envR=-60;envSum=-60;envDiff=-60;envLufsM=-60;envLufsS=-60;normL=-60;normR=-60;normSum=-60;normDiff=-60;head=0;count=0;isHoveringLime=!1;_lastHoveringLime=!1;zoomFeedbackTime=0;zoomFeedbackText=``;showChA;showChB;showSum;showDiff;showLufs;showLufsS;showLufsI;show0DbfsLine;enableFade=!1;hfFadeDistance=100;showHoverTelemetry=!0;showCursorTrace=!0;plotPhase=!0;isDocked;hoverX=null;hoverY=null;peakMaxL=-60;peakMaxR=-60;lufsMaxM=-60;clipCountL=0;clipCountR=0;lastAudioTime=performance.now();hasSignalLost=!1;PAL;PAL_DARK=null;static PAL_MC=ui;wrapper=null;hudEl=null;btnDock=null;dockContainer=null;hudChA=null;hudChB=null;hudSum=null;hudDiff=null;hudLufsM=null;hudLufsS=null;hudLufsI=null;hudLra=null;hudMax=null;hudClipRow=null;hudClips=null;hudTimeMode=null;hudChkChA=null;hudChkChB=null;hudChkSum=null;hudChkDiff=null;hudChkLufsM=null;hudChkLufsS=null;hudChkLufsI=null;hudRowChA=null;hudRowChB=null;hudRowSum=null;hudRowDiff=null;hudRowLufsM=null;hudRowLufsS=null;hudRowLufsI=null;_updateTraceToggles;onClear=null;ro;w=0;h=0;dpr=1;constructor(e){this.container=e,this.canvas=null,this.ctx=null,this.timeMode=`log`,this.onTimeModeChange=null,this.beta=15,this.logBetaDenom=Math.log(16),this.maxCaptureSec=600,this.captureLength=60,this.captureSpeed=240,this.lastPushTime=0,this.bufferSize=Math.round(this.maxCaptureSec*this.captureSpeed),ii(this,this.bufferSize),this.envL=-60,this.envR=-60,this.envSum=-60,this.envDiff=-60,this.normL=-60,this.normR=-60,this.normSum=-60,this.normDiff=-60,this.head=0,this.count=0,this.isHoveringLime=!1,this.zoomFeedbackTime=0,this.zoomFeedbackText=``;let t=ci();this.showChA=t.showChA,this.showChB=t.showChB,this.showSum=t.showSum,this.showDiff=t.showDiff,this.showLufs=t.showLufs,this.showLufsS=t.showLufsS,this.showLufsI=t.showLufsI,this.show0DbfsLine=t.show0DbfsLine,this.enableFade=!1,this.hfFadeDistance=100,this.showHoverTelemetry=!0,this.showCursorTrace=!0,this.plotPhase=!0,this.isDocked=t.isDocked,this.hoverX=null,this.hoverY=null,this.peakMaxL=-60,this.peakMaxR=-60,this.lufsMaxM=-60,this.clipCountL=0,this.clipCountR=0,this.PAL=li(),this.initCanvas()}sliderToSeconds(e){return Jr(e)}secondsToSlider(e){return Yr(e)}formatDuration(e){return Xr(e)}getActiveSpanSec(){return Math.min(this.maxCaptureSec||600,this.captureLength)}resizeBuffer(e){ai(this,e)}pyrSources(){return Zr(this)}pyrReset(){Qr(this)}pyrPush(){$r(this)}rawAt(e,t){return ei(this,e,t)}blockAt(e,t,n,r){return ti(this,e,t,n,r)}levelAt(e,t,n,r){return ni(this,e,t,n,r)}pyrSample(e,t,n,r,i=!1){return ri(this,e,t,n,r,i)}clear(){oi(this)}initCanvas(){wi(this)}setDocked(e){Di(this,e)}setBeta(e){Oi(this,e)}setTimeMode(e){ki(this,e)}setCaptureLength(e){Ai(this,e)}handleResize(){ji(this)}push(e,t,n,r,i=1,a=-60,o=-60,s=-60){si(this,e,t,n,r,i,a,o,s)}render(e,t){ua(this,e,t)}};function fa(){return{drawerSourceBadge:document.getElementById(`drawerSourceBadge`),selectDevice:document.getElementById(`selectDevice`),inputGainSlider:document.getElementById(`inputGainSlider`),inputGainVal:document.getElementById(`inputGainVal`),chkMonitor:document.getElementById(`chkMonitor`),monitorVolSlider:document.getElementById(`monitorVolSlider`),monitorVolVal:document.getElementById(`monitorVolVal`),selectMeterStyle:document.getElementById(`selectMeterStyle`),selectToneCal:document.getElementById(`selectToneCal`),selectLampColor:document.getElementById(`selectLampColor`),chkHpf:document.getElementById(`chkHpf`),chkTerm:document.getElementById(`chkTerm`),chkPodHold:document.getElementById(`chkPodHold`),selectPodDecay:document.getElementById(`selectPodDecay`),selectPpmBallistics:document.getElementById(`selectPpmBallistics`)}}function pa(){let e=document.getElementById(`auxDrawer`),t=document.getElementById(`btnOpenSettings`);function n(t){t&&(t.preventDefault(),t.stopPropagation()),e&&(e.open=!e.open)}t&&t.addEventListener(`click`,n);let r=e?.querySelector(`summary`);r&&r.addEventListener(`click`,e=>{let t=e.target;t&&t.closest(`#btnOpenSettings`)||t&&t.closest(`a, button`)||e.preventDefault()})}function ma(){let e=document.getElementById(`settingsLockOverlay`),t=document.getElementById(`lockProgressFill`),n=document.getElementById(`lockCountdown`),r=!1;try{r=sessionStorage.getItem(`wbs_settings_unlocked`)===`true`}catch{}let i=null,a=null;function o(){r?e&&(e.classList.add(`unlocked`),e.classList.remove(`holding-unlock`)):(e&&(e.classList.remove(`unlocked`),e.classList.remove(`holding-unlock`)),t&&(t.style.width=`0%`),n&&(n.textContent=`5.0s`))}o(),window.addEventListener(`keydown`,s=>{s.key===`Control`&&!i&&!r&&(i=performance.now(),e&&e.classList.add(`holding-unlock`),a=setInterval(()=>{if(!i)return;let e=performance.now()-i,s=Math.min(100,e/5e3*100),c=Math.max(0,(5e3-e)/1e3);if(t&&(t.style.width=s+`%`),n&&(n.textContent=c.toFixed(1)+`s`),e>=5e3){clearInterval(a),a=null,i=null,r=!0;try{sessionStorage.setItem(`wbs_settings_unlocked`,`true`)}catch{}n&&(n.textContent=`UNLOCKED`),t&&(t.style.width=`100%`),setTimeout(()=>{o()},350)}},40))}),window.addEventListener(`keyup`,r=>{r.key===`Control`&&i&&(clearInterval(a),a=null,i=null,e&&e.classList.remove(`holding-unlock`),t&&(t.style.width=`0%`),n&&(n.textContent=`5.0s`))})}function ha(e){let{model:t,audio:n}=e,r=document.getElementById(`selectVfdMetric`),i=document.getElementById(`selectPeakSens`);r&&(r.value=t.vfdMetric||`lufs`,r.addEventListener(`change`,e=>{t.vfdMetric=e.target.value,t.saveEEPROM()})),i&&i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);n.setPeakSensTrim(t)})}var ga=`wbs_storage_consent`,_a=`wbs_console_config_profile`;function va(){try{let e=localStorage.getItem(ga);return e===`allowed`?`allowed`:e===`session_only`?`session_only`:`prompt`}catch{return`session_only`}}function ya(e){try{localStorage.setItem(ga,e)}catch{}}function ba(){try{localStorage.removeItem(ga)}catch{}}function xa(e,t){try{if(e()){let e=localStorage.getItem(t);if(e!==null)return e}return sessionStorage.getItem(t)}catch{return null}}function Sa(e,t,n){try{e()?localStorage.setItem(t,n):sessionStorage.setItem(t,n)}catch{}}function Ca(e){try{localStorage.removeItem(e),sessionStorage.removeItem(e)}catch{}}function wa(e){let t=e.toneCalLevels[e.toneCalIdx]??0;return{power:e.power,mode:e.mode,meterStyle:e.meterStyle,dialLamp:e.dialLamp,vfdMetric:e.vfdMetric,inputA:{src:e.a.src,lvl:e.a.lvl},inputD:{src:e.d.src,lvl:e.d.lvl},testGenS:{pair:[...e.s.pair]},highPassFilter:e.hp===1,termination600Ohm:e.term===1,toneCalibrationDbfs:t}}function Ta(e){return{vuReferenceLevelDbu:e.refLevelDb,ppmPeakSensitivityTrimDb:e.peakSensTrim,vuBallisticPreset:e.vuBallisticPreset,ppmBallisticPreset:e.ppmBallisticPreset,inputGainTrimDb:e.inputTrimDb,monitorAudio:{enabled:e.monitorEnabled,volume:e.monitorVolume}}}function Ea(e){return{extendedLed22Range:e.extendedLed22,scaleMode:e.scaleMode,decayType:e.decayType||`type2`,peakHold:e.dip?.BS1===1}}function Da(e){return{timeMode:e.timeMode,captureLengthSeconds:e.captureLength,captureSpeedFps:e.captureSpeed,logWarpBeta:e.beta,traces:{channelA:e.showChA,channelB:e.showChB,sum:e.showSum,diff:e.showDiff,momentaryLufs:e.showLufs,shortTermLufs:e.showLufsS,integratedLufs:e.showLufsI},display:{show0DbfsCeilingLine:e.show0DbfsLine,enableWaveformFade:e.enableFade,hfFadeDistancePercent:e.hfFadeDistance,showHoverTelemetryHud:e.showHoverTelemetry,showCursorTraceLine:e.showCursorTrace,plotPhaseCorrelation:e.plotPhase,hudDocked:e.isDocked}}}function Oa(e,t,n,r){return{version:`1.1.0`,timestamp:new Date().toISOString(),profileName:`Ward-Beck Systems Broadcast Mastering Suite Profile`,console:wa(e),ballistics:Ta(t),pod22:Ea(n),scope:Da(r)}}var L=Symbol(`NOT_RESOLVED`);function R(e,t){return{tagName:e,nodeKind:`scalar`,implicit:t.implicit??!1,matchByTagPrefix:t.matchByTagPrefix??!1,implicitFirstChars:t.implicitFirstChars??null,resolve:t.resolve,identify:t.identify,represent:t.represent??(e=>String(e)),representTagName:t.representTagName??(()=>e)}}function ka(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`sequence`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addItem:t.addItem,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}function Aa(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`mapping`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addPair:t.addPair,has:t.has,keys:t.keys,get:t.get,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}var ja=R(`tag:yaml.org,2002:str`,{resolve:e=>e,identify:e=>typeof e==`string`}),Ma=[``,`~`,`null`,`Null`,`NULL`],Na=R(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>Ma.indexOf(e)===-1?L:null,identify:e=>e===null,represent:()=>`null`}),Pa=R(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[`n`],resolve:(e,t)=>e===`null`||t&&e===``?null:L,identify:e=>e===null,represent:()=>`null`}),Fa=[``,`~`,`null`,`Null`,`NULL`],Ia=R(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>Fa.indexOf(e)===-1?L:null,identify:e=>e===null,represent:()=>`null`}),La=[`true`,`True`,`TRUE`],Ra=[`false`,`False`,`FALSE`],za=R(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`T`,`f`,`F`],resolve:e=>La.indexOf(e)!==-1||Ra.indexOf(e)===-1&&L,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Ba=[`true`],Va=[`false`],Ha=R(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`f`],resolve:e=>Ba.indexOf(e)!==-1||Va.indexOf(e)===-1&&L,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Ua=[`true`,`True`,`TRUE`,`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`],Wa=[`false`,`False`,`FALSE`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],Ga=R(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`y`,`Y`,`n`,`N`,`t`,`T`,`f`,`F`,`o`,`O`],resolve:e=>Ua.indexOf(e)!==-1||Wa.indexOf(e)===-1&&L,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Ka=RegExp(`^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$`),qa=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Ja(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function Ya(e,t){if(t){if(!qa.test(e))return L}else if(!Ka.test(e))return L;let n=Ja(e);return Number.isFinite(n)?n:L}var Xa=R(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:Ya,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Za=RegExp(`^-?(?:0|[1-9][0-9]*)$`),Qa=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function $a(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function eo(e,t){if(t){if(!Qa.test(e))return L}else if(!Za.test(e))return L;let n=$a(e);return Number.isFinite(n)?n:L}var to=R(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:eo,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),no=RegExp(`^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$`);function ro(e){let t=e.replace(/_/g,``),n=1;if((t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`))return n*parseInt(t.slice(2),2);if(t.startsWith(`0x`))return n*parseInt(t.slice(2),16);if(t.includes(`:`)){let e=0;for(let n of t.split(`:`))e=e*60+Number(n);return n*e}return t!==`0`&&t[0]===`0`?n*parseInt(t,8):n*parseInt(t,10)}function io(e){if(!no.test(e))return L;let t=ro(e);return Number.isFinite(t)?t:L}var ao=R(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:io,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),oo=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),so=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function co(e){if(!oo.test(e))return L;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)||so.test(e)?r:L}function lo(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var uo=R(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:co,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:lo}),fo=RegExp(`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$`),po=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function mo(e,t){if(t){if(!po.test(e))return L;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)?r:L}if(!fo.test(e))return L;let n=Number(e);return Number.isFinite(n)?n:L}function ho(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var go=R(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:mo,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:ho}),_o=RegExp(`^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),vo=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function yo(e){if(!_o.test(e))return L;let t=e.toLowerCase().replace(/_/g,``),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=0;if(t.includes(`:`)){for(let e of t.split(`:`))r=r*60+Number(e);r*=n}else r=n*parseFloat(t);return Number.isFinite(r)||vo.test(e)?r:L}function bo(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var xo=R(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:yo,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:bo}),So=R(`tag:yaml.org,2002:merge`,{implicit:!0,implicitFirstChars:[`<`],resolve:(e,t)=>e===`<<`||t&&e===``?`<<`:L,identify:()=>!1}),Co=/^[A-Za-z0-9+/]*={0,2}$/;function wo(e){let t=e.replace(/\s/g,``);if(t.length%4!=0||!Co.test(t))return L;let n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function To(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var Eo=R(`tag:yaml.org,2002:binary`,{resolve:wo,identify:e=>Object.prototype.toString.call(e)===`[object Uint8Array]`,represent:To}),Do=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),Oo=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function ko(e,t,n,r=0,i=0,a=0,o=0){let s=new Date(Date.UTC(e,t,n,r,i,a,o));return s.setUTCFullYear(e,t,n),s}function Ao(e){let t=Do.exec(e);if(t===null&&(t=Oo.exec(e)),t===null)return L;let n=+t[1],r=t[2]-1,i=+t[3];if(!t[4]){let e=ko(n,r,i);return e.getUTCFullYear()!==n||e.getUTCMonth()!==r||e.getUTCDate()!==i?L:e}let a=+t[4],o=+t[5],s=+t[6],c=0;if(a>23||o>59||s>59)return L;if(t[7]){let e=t[7].slice(0,3);for(;e.length<3;)e+=`0`;c=+e}let l=ko(n,r,i,a,o,s,c);if(l.getUTCFullYear()!==n||l.getUTCMonth()!==r||l.getUTCDate()!==i)return L;if(t[9]){let e=+t[10],n=+(t[11]||0);if(e>23||n>59)return L;let r=(e*60+n)*6e4;l.setTime(l.getTime()-(t[9]===`-`?-r:r))}return l}var jo=R(`tag:yaml.org,2002:timestamp`,{implicit:!0,implicitFirstChars:[...`0123456789`],resolve:Ao,identify:e=>e instanceof Date,represent:e=>e.toISOString()}),Mo=ka(`tag:yaml.org,2002:seq`,{create:()=>[],addItem:(e,t)=>{e.push(t)},identify:Array.isArray});function No(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype}function Po(e,t){let n={};for(let r of t)e[r]!==void 0&&(n[r]=e[r]);return n}var Fo=ka(`tag:yaml.org,2002:omap`,{create:()=>({list:[],seen:new Set}),addItem:(e,t)=>{let n;if(t instanceof Map){if(t.size!==1)return`cannot resolve an ordered map item`;n=t.keys().next().value}else if(No(t)){let e=Object.keys(t);if(e.length!==1)return`cannot resolve an ordered map item`;n=e[0]}else return`cannot resolve an ordered map item`;return e.seen.has(n)?`duplicate key in ordered map`:(e.seen.add(n),e.list.push(t),``)},finalize:e=>e.list,identify:()=>!1}),Io=ka(`tag:yaml.org,2002:pairs`,{create:()=>[],addItem:(e,t)=>{if(t instanceof Map)return t.size===1?(e.push(t.entries().next().value),``):`cannot resolve a pairs item`;if(Object.prototype.toString.call(t)!==`[object Object]`)return`cannot resolve a pairs item`;let n=t,r=Object.keys(n);return r.length===1?(e.push([r[0],n[r[0]]]),``):`cannot resolve a pairs item`},identify:()=>!1}),Lo=Aa(`tag:yaml.org,2002:map`,{create:()=>({}),identify:No,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{if(typeof t==`object`&&t)return`object-based map does not support complex keys`;let r=String(t);return r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``},has:(e,t)=>typeof t==`object`&&t?!1:Object.prototype.hasOwnProperty.call(e,String(t)),keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}}),Ro=Aa(`tag:yaml.org,2002:set`,{create:()=>new Set,identify:e=>e instanceof Set,represent:e=>{let t=new Map;for(let n of e)t.set(n,null);return t},addPair:(e,t,n)=>n===null?(e.add(t),``):`cannot resolve a set item`,has:(e,t)=>e.has(t),keys:e=>e.keys(),get:()=>null});function zo(){return{scalar:Object.create(null),sequence:Object.create(null),mapping:Object.create(null)}}function Bo(){return{scalar:[],sequence:[],mapping:[]}}function Vo(e){let t=[];for(let n of e){let e=t.length;for(let r=0;r<t.length;r++){let i=t[r];if(i.nodeKind===n.nodeKind&&i.tagName===n.tagName&&i.matchByTagPrefix===n.matchByTagPrefix){e=r;break}}t[e]=n}return t}var Ho=class e{tags;implicitScalarTags;implicitScalarByFirstChar;implicitScalarAnyFirstChar;defaultScalarTag;defaultSequenceTag;defaultMappingTag;exact;prefix;constructor(e){let t=Vo(e),n=[],r=zo(),i=Bo();for(let e of t){if(e.nodeKind===`scalar`&&e.implicit){if(e.matchByTagPrefix)throw Error(`Implicit scalar tags cannot match by tag prefix`);n.push(e)}switch(e.nodeKind){case`scalar`:e.matchByTagPrefix?i.scalar.push(e):r.scalar[e.tagName]=e;break;case`sequence`:e.matchByTagPrefix?i.sequence.push(e):r.sequence[e.tagName]=e;break;case`mapping`:e.matchByTagPrefix?i.mapping.push(e):r.mapping[e.tagName]=e}}let a=n.filter(e=>e.implicitFirstChars===null),o=new Set;for(let e of n)if(e.implicitFirstChars!==null)for(let t of e.implicitFirstChars)o.add(t);let s=new Map;for(let e of o)s.set(e,n.filter(t=>t.implicitFirstChars===null||t.implicitFirstChars.indexOf(e)!==-1));let c=r.scalar[`tag:yaml.org,2002:str`];if(!c)throw Error(`schema does not define the default scalar tag (tag:yaml.org,2002:str)`);this.tags=t,this.implicitScalarTags=n,this.implicitScalarByFirstChar=s,this.implicitScalarAnyFirstChar=a,this.defaultScalarTag=c,this.defaultSequenceTag=r.sequence[`tag:yaml.org,2002:seq`],this.defaultMappingTag=r.mapping[`tag:yaml.org,2002:map`],this.exact=r,this.prefix=i}lookupScalarTag(e){let t=this.exact.scalar[e];if(t)return t;for(let t of this.prefix.scalar)if(e.startsWith(t.tagName))return t}lookupSequenceTag(e){let t=this.exact.sequence[e];if(t)return t;for(let t of this.prefix.sequence)if(e.startsWith(t.tagName))return t}lookupMappingTag(e){let t=this.exact.mapping[e];if(t)return t;for(let t of this.prefix.mapping)if(e.startsWith(t.tagName))return t}resolveImplicitScalarTag(e){let t=this.implicitScalarByFirstChar.get(e.charAt(0))??this.implicitScalarAnyFirstChar;for(let n of t){let t=n.resolve(e,!1,n.tagName);if(t!==L)return{value:t,tag:n}}let n=this.defaultScalarTag;return{value:n.resolve(e,!1,n.tagName),tag:n}}withTags(...t){let n=[];for(let e of t)n=n.concat(e);return new e([...this.tags,...n])}},Uo=new Ho([ja,Mo,Lo]);new Ho([...Uo.tags,Pa,Ha,to,go]);var Wo=new Ho([...Uo.tags,Na,za,Xa,uo]),Go=new Ho([...Uo.tags,Ia,Ga,ao,xo,jo,So,Eo,Fo,Io,Ro]).withTags({...ao,resolve:(e,t,n)=>{let r=ao.resolve(e,t,n);return r===L?Xa.resolve(e,t,n):r}},{...xo,resolve:(e,t,n)=>{let r=xo.resolve(e,t,n);return r===L?uo.resolve(e,t,n):r}});Aa(`tag:yaml.org,2002:map`,{create:()=>new Map,addPair:(e,t,n)=>(e.set(t,n),``),has:(e,t)=>e.has(t),keys:e=>e.keys(),get:(e,t)=>e.get(t),identify:e=>e instanceof Map||No(e),represent:e=>{if(e instanceof Map)return e;let t=new Map,n=e;for(let e of Object.keys(n))t.set(e,n[e]);return t}});function Ko(e){if(Array.isArray(e)){let t=Array.prototype.slice.call(e);for(let e=0;e<t.length;e++){if(Array.isArray(t[e]))return null;typeof t[e]==`object`&&Object.prototype.toString.call(t[e])===`[object Object]`&&(t[e]=`[object Object]`)}return String(t)}return typeof e==`object`&&Object.prototype.toString.call(e)===`[object Object]`?`[object Object]`:String(e)}Aa(`tag:yaml.org,2002:map`,{create:()=>({}),identify:No,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{let r=Ko(t);return r===null?`nested arrays are not supported inside keys`:(r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``)},has:(e,t)=>{let n=Ko(t);return n!==null&&Object.prototype.hasOwnProperty.call(e,n)},keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}});var qo={maxLength:79,indent:1,linesBefore:3,linesAfter:2};function Jo(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function Yo(e,t){return` `.repeat(Math.max(t-e.length,0))+e}function Xo(e,t){if(!e.buffer)return null;let n={...qo,...t},r=/\r?\n|\r|\0/g,i=[0],a=[],o,s=-1;for(;o=r.exec(e.buffer);)a.push(o.index),i.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);let c=``,l=Math.min(e.line+n.linesAfter,a.length).toString().length,u=n.maxLength-(n.indent+l+3);for(let t=1;t<=n.linesBefore&&!(s-t<0);t++){let r=Jo(e.buffer,i[s-t],a[s-t],e.position-(i[s]-i[s-t]),u);c=`${` `.repeat(n.indent)}${Yo((e.line-t+1).toString(),l)} | ${r.str}\n${c}`}let d=Jo(e.buffer,i[s],a[s],e.position,u);c+=`${` `.repeat(n.indent)}${Yo((e.line+1).toString(),l)} | ${d.str}\n`,c+=`${`-`.repeat(n.indent+l+3+d.pos)}^\n`;for(let t=1;t<=n.linesAfter&&!(s+t>=a.length);t++){let r=Jo(e.buffer,i[s+t],a[s+t],e.position-(i[s]-i[s+t]),u);c+=`${` `.repeat(n.indent)}${Yo((e.line+t+1).toString(),l)} | ${r.str}\n`}return c.replace(/\n$/,``)}function Zo(e,t){let n=``;return e.mark?(e.mark.name&&(n+=`in "${e.mark.name}" `),n+=`(${e.mark.line+1}:${e.mark.column+1})`,!t&&e.mark.snippet&&(n+=`\n\n${e.mark.snippet}`),`${e.reason} ${n}`):e.reason}var Qo=class e extends Error{reason;mark;constructor(e,t){super(),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=Zo(this,!1),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toString(e){return`${this.name}: ${Zo(this,e)}`}static throwAt(t,n,r,i=``){let a=0,o=0;for(let e=0;e<n;e++){let n=t.charCodeAt(e);n===10?(a++,o=e+1):n===13&&(a++,t.charCodeAt(e+1)===10&&e++,o=e+1)}let s={name:i,buffer:t,position:n,line:a,column:n-o};throw s.snippet=Xo(s),new e(r,s)}},z={DOCUMENT:1,SEQUENCE:2,MAPPING:3,SCALAR:4,ALIAS:5,POP:6},B={PLAIN:1,SINGLE_QUOTED:2,DOUBLE_QUOTED:3,LITERAL_BLOCK:4,FOLDED_BLOCK:5},V={BLOCK:1,FLOW:2},H={CLIP:1,STRIP:2,KEEP:3},$o=-1;function es(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}var ts=Array(256),ns=Array(256);for(let e=0;e<256;e++)ts[e]=+!!es(e),ns[e]=es(e);function rs(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function is(e){return e>=48&&e<=57?e-48:(e|32)-97+10}function as(e){return e===120?2:e===117?4:8}function os(e,t,n){let r=0;for(;t<n;){let n=e.charCodeAt(t);if(n===10)r++,t++;else if(n===13)r++,t++,e.charCodeAt(t)===10&&t++;else if(n===32||n===9)t++;else break}return{position:t,breaks:r}}function ss(e){return e===1?` `:`
`.repeat(e-1)}function cs(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===10||t===13){r+=e.slice(a,o);let t=os(e,i,n);r+=ss(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,o)}function ls(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===39)r+=e.slice(a,i)+`'`,i+=2,a=o=i;else if(t===10||t===13){r+=e.slice(a,o);let t=os(e,i,n);r+=ss(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function us(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===92){r+=e.slice(a,i),i++;let t=e.charCodeAt(i);if(t===10||t===13)i=os(e,i,n).position;else if(t<256&&ts[t])r+=ns[t],i++;else{let n=as(t),a=0;for(;n>0;n--){i++;let t=is(e.charCodeAt(i));a=(a<<4)+t}r+=rs(a),i++}a=o=i}else if(t===10||t===13){r+=e.slice(a,o);let t=os(e,i,n);r+=ss(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function ds(e,t,n,r,i,a){let o=r<0?0:r,s=e.slice(t,n).replace(/\r\n?/g,`
`),c=s===``?[]:(s.endsWith(`
`)?s.slice(0,-1):s).split(`
`),l=``,u=!1,d=0,f=!1;for(let e of c){let t=0;for(;t<o&&e.charCodeAt(t)===32;)t++;if(r<0||t>=e.length){d++;continue}let n=e.slice(o),i=n.charCodeAt(0);a?i===32||i===9?(f=!0,l+=`
`.repeat(u?1+d:d)):f?(f=!1,l+=`
`.repeat(d+1)):d===0?u&&(l+=` `):l+=`
`.repeat(d):l+=`
`.repeat(u?1+d:d),l+=n,u=!0,d=0}return i===H.KEEP?l+=`
`.repeat(u?1+d:d):i!==H.STRIP&&u&&(l+=`
`),l}function fs(e,t){if(t.valueStart===$o)return``;let{valueStart:n,valueEnd:r}=t;if(t.fast)return e.slice(n,r);switch(t.style){case B.SINGLE_QUOTED:return ls(e,n,r);case B.DOUBLE_QUOTED:return us(e,n,r);case B.LITERAL_BLOCK:return ds(e,n,r,t.indent,t.chomping,!1);case B.FOLDED_BLOCK:return ds(e,n,r,t.indent,t.chomping,!0);default:return cs(e,n,r)}}var ps=Object.assign(Object.create(null),{"!":`!`,"!!":`tag:yaml.org,2002:`}),ms=`-#;/?:@&=+$_.~*'()`,hs=ms+`!,[]`,gs=`0123456789ABCDEF`;function U(e){return`%`+gs[e>>4]+gs[e&15]}function _s(e,t){let n=t?ms:hs,r=``;for(let t=0;t<e.length;t++){let i=e.charCodeAt(t);i>=48&&i<=57||i>=65&&i<=90||i>=97&&i<=122||n.includes(e[t])?r+=e[t]:(i>=55296&&i<=56319&&(i=65536+((i&1023)<<10)+(e.charCodeAt(++t)&1023)),r+=i<128?U(i):i<2048?U(192|i>>6)+U(128|i&63):i<65536?U(224|i>>12)+U(128|i>>6&63)+U(128|i&63):U(240|i>>18)+U(128|i>>12&63)+U(128|i>>6&63)+U(128|i&63))}return r}function vs(e){let t=``,n=0;for(;n<e.length;){if(e.charCodeAt(n)!==37){t+=e[n++];continue}let r=parseInt(e.slice(n+1,n+3),16);if(n+=3,r>=192){let t=r<224?1:r<240?2:3;for(r&=(1<<6-t)-1;t-->0;)r=r<<6|parseInt(e.slice(n+1,n+3),16)&63,n+=3}r<65536?t+=String.fromCharCode(r):(r-=65536,t+=String.fromCharCode(55296|r>>10,56320|r&1023))}return t}function ys(e,t){if(e.startsWith(`!<`)&&e.endsWith(`>`))return vs(e.slice(2,-1));let n=e.indexOf(`!`,1),r=n===-1?`!`:e.slice(0,n+1);return vs(t?.[r]??ps[r]??r)+vs(e.slice(r.length))}function bs(e){let t=e;return t.charCodeAt(0)===33?(t=t.slice(1),`!${_s(t,!0)}`):t.slice(0,18)===`tag:yaml.org,2002:`?`!!${_s(t.slice(18),!0)}`:`!<${_s(t,!1)}>`}var xs=-1,Ss=`tag:yaml.org,2002:merge`,Cs={filename:``,schema:Wo,json:!1,maxTotalMergeKeys:1e4,maxAliases:-1};function ws(e){return`tagStart`in e&&e.tagStart!==xs?e.tagStart:`anchorStart`in e&&e.anchorStart!==xs?e.anchorStart:`valueStart`in e&&e.valueStart!==xs?e.valueStart:`start`in e?e.start:0}function W(e,t){Qo.throwAt(e.source,e.position,t,e.filename)}function Ts(e,t,n,r){try{return n.finalize(r)}catch(n){if(n instanceof Qo)throw n;Qo.throwAt(e.source,t,n instanceof Error?n.message:String(n),e.filename)}}function Es(e,t){let n=fs(e.source,t),r=t.tagStart===xs?``:e.source.slice(t.tagStart,t.tagEnd),i=e.schema.defaultScalarTag;if(r!==``){if(r===`!`)return{value:n,tag:i};let t=ys(r,e.tagHandlers),a=e.schema.lookupScalarTag(t);if(a){let r=a.resolve(n,!0,t);return r===L&&W(e,`cannot resolve a node with !<${t}> explicit tag`),{value:r,tag:a}}let o=e.schema.lookupMappingTag(t)??e.schema.lookupSequenceTag(t);if(o){n!==``&&W(e,`cannot resolve a node with !<${t}> explicit tag`);let r=o.create(t);return{value:o.carrierIsResult?r:Ts(e,e.position,o,r),tag:o}}W(e,`unknown scalar tag !<${t}>`)}return t.style===B.PLAIN?e.schema.resolveImplicitScalarTag(n):{value:i.resolve(n,!1,i.tagName),tag:i}}function Ds(e,t,n){let r=t.tagStart===xs?``:e.source.slice(t.tagStart,t.tagEnd);return r===``||r===`!`?n:ys(r,e.tagHandlers)}function Os(e){return e.nodeKind===`mapping`}function ks(e){e.totalMergeKeys++,e.maxTotalMergeKeys!==-1&&e.totalMergeKeys>e.maxTotalMergeKeys&&W(e,`merge keys exceeded maxTotalMergeKeys (${e.maxTotalMergeKeys})`)}function As(e,t,n,r){ks(e);for(let i of r.keys(n)){if(ks(e),t.tag.has(t.value,i))continue;let a=t.tag.addPair(t.value,i,r.get(n,i));a&&W(e,a),t.overridable??=new Set,t.overridable.add(i)}}function js(e,t,n,r){if(e.position=t.keyPosition,Os(r))As(e,t,n,r);else if(r.nodeKind===`sequence`&&Array.isArray(n)){n.length>100&&W(e,`abnormal merge sequence size`);for(let r of n){let n=e.nodeTags.get(r);n||W(e,`cannot merge mappings; the provided source object is unacceptable`),As(e,t,r,n)}}else W(e,`cannot merge mappings; the provided source object is unacceptable`)}function Ms(e,t,n,r,i){if(e.position=t.keyPosition,t.keyIsMerge){js(e,t,r,i);return}!e.json&&t.tag.has(t.value,n)&&!t.overridable?.has(n)&&W(e,`duplicated mapping key`);let a=t.tag.addPair(t.value,n,r);a&&W(e,a),t.overridable?.delete(n)}function Ns(e,t,n){let r=e.frames[e.frames.length-1];if(r.kind===`document`)r.value=t,r.hasValue=!0;else if(r.kind===`sequence`){Os(n)&&e.nodeTags.set(t,n);let i=r.tag.addItem(r.value,t,r.index++);i&&W(e,i)}else if(r.hasKey){let i=r.key;r.key=void 0,r.hasKey=!1,Ms(e,r,i,t,n)}else r.key=t,r.keyPosition=e.position,r.hasKey=!0,r.keyIsMerge=n.tagName===Ss}function Ps(e,t,n,r,i){if(t.anchorStart!==xs){let a={value:n,tag:r,isValueFinal:i};return e.anchors.set(e.source.slice(t.anchorStart,t.anchorEnd),a),a}return null}function Fs(e,t){let n={...Cs,...t,events:e,documents:[],eventIndex:0,position:0,frames:[],anchors:new Map,nodeTags:new Map,tagHandlers:Object.create(null),totalMergeKeys:0,aliasCount:0};for(;n.eventIndex<n.events.length;){let e=n.events[n.eventIndex++];switch(n.position=ws(e),e.type){case z.DOCUMENT:n.anchors=new Map,n.nodeTags=new Map,n.aliasCount=0,n.tagHandlers=Object.create(null);for(let t of e.directives)t.kind===`tag`&&(n.tagHandlers[t.handle]=t.prefix);n.frames.push({kind:`document`,position:n.position,value:void 0,hasValue:!1});break;case z.SCALAR:{let{value:t,tag:r}=Es(n,e);Ps(n,e,t,r,!0),Ns(n,t,r);break}case z.SEQUENCE:{let t=Ds(n,e,`tag:yaml.org,2002:seq`),r=n.schema.lookupSequenceTag(t);r||W(n,`unknown sequence tag !<${t}>`);let i=r.create(t),a=Ps(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`sequence`,position:n.position,value:i,tag:r,anchor:a,index:0});break}case z.MAPPING:{let t=Ds(n,e,`tag:yaml.org,2002:map`),r=n.schema.lookupMappingTag(t);r||W(n,`unknown mapping tag !<${t}>`);let i=r.create(t),a=Ps(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`mapping`,position:n.position,value:i,tag:r,anchor:a,key:void 0,keyPosition:n.position,hasKey:!1,keyIsMerge:!1,overridable:null});break}case z.ALIAS:{n.maxAliases!==-1&&++n.aliasCount>n.maxAliases&&W(n,`aliases exceeded maxAliases (${n.maxAliases})`);let t=n.source.slice(e.anchorStart,e.anchorEnd),r=n.anchors.get(t);r||W(n,`unidentified alias "${t}"`),r.isValueFinal||W(n,`recursive alias "${t}" is not supported for tag ${r.tag.tagName} because it uses finalize()`),Ns(n,r.value,r.tag);break}case z.POP:{let e=n.frames.pop();if(e.kind===`mapping`&&e.hasKey&&(n.position=e.keyPosition,W(n,`incomplete mapping pair in event stream`)),e.kind===`document`)n.documents.push(e.value);else{let t=e.tag.carrierIsResult?e.value:Ts(n,e.position,e.tag,e.value);e.anchor&&(e.anchor.value=t,e.anchor.isValueFinal=!0),Ns(n,t,e.tag)}break}}}return n.documents}var G=-1,Is=Object.prototype.hasOwnProperty,Ls=1,Rs=2,zs=3,Bs=4,Vs=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Hs=/[,\[\]{}]/,Us=/^(?:!|!!|![0-9A-Za-z-]+!)$/,Ws=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`,Gs=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`,Ks=RegExp(`^(?:${Ws})*$`),qs=RegExp(`^(?:${Gs})+$`),Js=RegExp(`^(?:!(?:${Ws})*|${Gs}(?:${Ws})*)$`),Ys={filename:``,maxDepth:100};function Xs(e,t,n){e.events.push({type:z.DOCUMENT,explicitStart:t,explicitEnd:n,directives:e.directives})}function Zs(e,t,n,r,i,a,o){e.events.push({type:z.SEQUENCE,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function Qs(e,t,n,r,i,a,o){e.events.push({type:z.MAPPING,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function $s(e,t){e.events.splice(t.eventsLength,0,{type:z.MAPPING,start:t.position,anchorStart:G,anchorEnd:G,tagStart:G,tagEnd:G,style:V.FLOW})}function ec(e,t,n,r,i,a,o,s,c=H.CLIP,l=-1,u=!1){e.events.push({type:z.SCALAR,valueStart:t,valueEnd:n,anchorStart:r,anchorEnd:i,tagStart:a,tagEnd:o,style:s,chomping:c,indent:l,fast:u})}function tc(e,t,n){e.events.push({type:z.ALIAS,anchorStart:t,anchorEnd:n})}function nc(e){e.events.push({type:z.POP})}function K(e){ec(e,G,G,G,G,G,G,B.PLAIN)}function rc(){return{anchorStart:G,anchorEnd:G,tagStart:G,tagEnd:G}}function ic(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,eventsLength:e.events.length}}function ac(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.events.length=t.eventsLength}function q(e,t){Qo.throwAt(e.input.slice(0,e.length),e.position,t,e.filename)}function J(e){return e===10||e===13}function oc(e){return e===9||e===32}function Y(e){return oc(e)||J(e)}function X(e){return e===0||Y(e)}function sc(e){return e===44||e===91||e===93||e===123||e===125}function cc(e){return e>=48&&e<=57?e-48:-1}function lc(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function uc(e){return e===120?2:e===117?4:e===85?8:0}function dc(e){return e===48||e===97||e===98||e===116||e===9||e===110||e===118||e===102||e===114||e===101||e===32||e===34||e===47||e===92||e===78||e===95||e===76||e===80}function fc(e){e.input.charCodeAt(e.position)===10?e.position++:(e.position++,e.input.charCodeAt(e.position)===10&&e.position++),e.line++,e.lineStart=e.position,e.lineIndent=0,e.firstTabInLine=-1}function Z(e,t){let n=0,r=e.input.charCodeAt(e.position),i=e.position===e.lineStart||Y(e.input.charCodeAt(e.position-1));for(;r!==0;){for(;oc(r);)i=!0,r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&i&&r===35)do r=e.input.charCodeAt(++e.position);while(!J(r)&&r!==0);if(!J(r))break;for(fc(e),n++,i=!0,r=e.input.charCodeAt(e.position);r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return n}function pc(e,t=e.position){let n=e.input.charCodeAt(t);if((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)){let n=e.input.charCodeAt(t+3);return n===0||Y(n)}return!1}function mc(e){e.position===e.lineStart&&e.input.charCodeAt(e.position)===65279&&(e.position++,e.lineStart=e.position)}function hc(e){if(e.position!==e.lineStart)return!1;if(pc(e))return!0;if(e.input.charCodeAt(e.position)!==65279)return!1;let t=ic(e);mc(e),Z(e,!0);let n=e.input.charCodeAt(e.position),r=e.position===e.lineStart&&(n===37||n===45&&pc(e));return ac(e,t),r}function gc(e){let t=e.input.charCodeAt(e.position);for(;t!==0&&!J(t);)t=e.input.charCodeAt(++e.position)}function _c(e,t,n){let r=Vs.exec(e.input.slice(t,n));r!==null&&(e.position=t+r.index+r[0].length-1,q(e,`the stream contains non-printable characters`))}function vc(e,t,n){if(e.input.charCodeAt(e.position)!==33)return!1;t.tagStart!==G&&q(e,`duplication of a tag property`);let r=e.position,i=!1,a=!1,o=`!`,s=e.input.charCodeAt(++e.position);s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33&&(a=!0,o=`!!`,s=e.input.charCodeAt(++e.position));let c=e.position,l;if(i){for(;s!==0&&s!==62;)s=e.input.charCodeAt(++e.position);s!==62&&q(e,`unexpected end of the stream within a verbatim tag`),l=e.input.slice(c,e.position),e.position++}else{for(;s!==0&&!Y(s)&&!(n&&sc(s));)s===33&&(a?q(e,`tag suffix cannot contain exclamation marks`):(o=e.input.slice(c-1,e.position+1),Us.test(o)||q(e,`named tag handle cannot contain such characters`),a=!0,c=e.position+1)),s=e.input.charCodeAt(++e.position);l=e.input.slice(c,e.position),Hs.test(l)&&q(e,`tag suffix cannot contain flow indicator characters`)}return l&&!(i?Ks.test(l):qs.test(l))&&q(e,`tag name cannot contain such characters: ${l}`),!i&&o!==`!`&&o!==`!!`&&!Is.call(e.tagHandlers,o)&&q(e,`undeclared tag handle "${o}"`),t.tagStart=r,t.tagEnd=e.position,!0}function yc(e,t){if(e.input.charCodeAt(e.position)!==38)return!1;t.anchorStart!==G&&q(e,`duplication of an anchor property`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position))&&!sc(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&q(e,`name of an anchor node must contain at least one character`),t.anchorStart=n,t.anchorEnd=e.position,!0}function bc(e,t){if(e.input.charCodeAt(e.position)!==42)return!1;(t.anchorStart!==G||t.tagStart!==G)&&q(e,`alias node should not have any properties`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position))&&!sc(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&q(e,`name of an alias node must contain at least one character`),tc(e,n,e.position),!0}function xc(e,t){Z(e,!1),e.lineIndent<t&&q(e,`deficient indentation`)}function Sc(e,t,n){if(e.input.charCodeAt(e.position)!==39)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===39){if(e.input.charCodeAt(e.position+1)===39){i=!1,e.position+=2;continue}let t=e.position;return e.position++,ec(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,B.SINGLE_QUOTED,H.CLIP,-1,i),!0}J(a)?(i=!1,xc(e,t)):e.position===e.lineStart&&pc(e)?q(e,`unexpected end of the document within a single quoted scalar`):a!==9&&a<32?q(e,`expected valid JSON character`):e.position++}q(e,`unexpected end of the stream within a single quoted scalar`)}function Cc(e,t,n){if(e.input.charCodeAt(e.position)!==34)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===34){let t=e.position;return e.position++,ec(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,B.DOUBLE_QUOTED,H.CLIP,-1,i),!0}if(a===92){i=!1;let n=e.input.charCodeAt(++e.position);if(J(n))xc(e,t);else if(dc(n))e.position++;else{let t=uc(n);for(t===0&&q(e,`unknown escape sequence`);t-->0;)e.position++,lc(e.input.charCodeAt(e.position))<0&&q(e,`expected hexadecimal character`);e.position++}}else J(a)?(i=!1,xc(e,t)):e.position===e.lineStart&&pc(e)?q(e,`unexpected end of the document within a double quoted scalar`):a!==9&&a<32?q(e,`expected valid JSON character`):e.position++}q(e,`unexpected end of the stream within a double quoted scalar`)}function wc(e,t,n){let r=e.input.charCodeAt(e.position),i=H.CLIP,a=-1,o=!1;if(r!==124&&r!==62)return!1;let s=r===124?B.LITERAL_BLOCK:B.FOLDED_BLOCK;for(e.position++;e.input.charCodeAt(e.position)!==0;){let n=e.input.charCodeAt(e.position),r=cc(n);if(n===43||n===45)i!==H.CLIP&&q(e,`repeat of a chomping mode identifier`),i=n===43?H.KEEP:H.STRIP,e.position++;else if(r>=0)r===0&&q(e,`bad explicit indentation width of a block scalar; it cannot be less than one`),o&&q(e,`repeat of an indentation width identifier`),a=t+r-1,o=!0,e.position++;else break}let c=!1;for(;oc(e.input.charCodeAt(e.position));)c=!0,e.position++;c&&e.input.charCodeAt(e.position)===35&&gc(e),J(e.input.charCodeAt(e.position))?fc(e):e.input.charCodeAt(e.position)!==0&&q(e,`a line break is expected`);let l=o?a:-1,u=0,d=e.position,f=e.position;for(;e.input.charCodeAt(e.position)!==0;){let n=e.position,r=0;for(;e.input.charCodeAt(n+r)===32;)r++;let i=e.input.charCodeAt(n+r);if(i===0){l>=0?r>l&&(f=n+r):r>0&&(f=n+r);break}if(hc(e))break;if(!o&&l===-1&&J(i)&&(u=Math.max(u,r)),!o&&l===-1&&!J(i)&&(i===9&&r<t&&(e.position=n+r,q(e,`tab characters must not be used in indentation`)),r>=t&&r<u&&(e.position=n+r,q(e,`bad indentation of a mapping entry`))),l===-1&&i!==0&&!J(i)&&r<t){e.lineIndent=r,e.position=n+r;break}!o&&i!==0&&!J(i)&&l===-1&&(l=r);let a=l===-1?t+1:l;if(i!==0&&!J(i)&&r<a){e.lineIndent=r,e.position=n+r;break}gc(e),f=e.position,J(e.input.charCodeAt(e.position))&&(fc(e),f=e.position)}return _c(e,d,f),ec(e,d,f,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,s,i,l),!0}function Tc(e,t){let n=e.input.charCodeAt(e.position),r=t===Ls;if(n===0||Y(n)||n===35||n===38||n===42||n===33||n===124||n===62||n===39||n===34||n===37||n===64||n===96||sc(n))return!1;if(n===63||n===45){let t=e.input.charCodeAt(e.position+1);if(X(t)||r&&sc(t))return!1}return!0}function Ec(e,t,n,r){if(!Tc(e,n))return!1;let i=e.position,a=e.position,o=e.input.charCodeAt(e.position),s=n===Ls,c=!1;for(;o!==0&&!hc(e);){if(o===58){let t=e.input.charCodeAt(e.position+1);if(X(t)||s&&sc(t))break}else if(o===35){if(Y(e.input.charCodeAt(e.position-1)))break}else if(s&&sc(o))break;else if(J(o)){let n=e.position,r=e.line,i=e.lineStart,a=e.lineIndent;if(Z(e,!1),e.lineIndent>=t){c=!0,o=e.input.charCodeAt(e.position);continue}e.position=n,e.line=r,e.lineStart=i,e.lineIndent=a;break}oc(o)||(a=e.position+1),o=e.input.charCodeAt(++e.position)}return a!==i&&(_c(e,i,a),ec(e,i,a,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,B.PLAIN,H.CLIP,-1,!c),!0)}function Dc(e,t){let n=e.line;Z(e,!0),(e.line>n&&e.lineIndent<t||e.firstTabInLine!==-1&&e.lineIndent<t)&&q(e,`deficient indentation`)}function Oc(e,t,n){let r=e.input.charCodeAt(e.position),i=r===123,a=e.position,o=!0;if(r!==91&&r!==123)return!1;let s=i?125:93;for(i?Qs(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.FLOW):Zs(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.FLOW),e.position++;e.input.charCodeAt(e.position)!==0;){Dc(e,t);let n=e.input.charCodeAt(e.position);if(n===s)return e.position++,nc(e),!0;o?n===44&&q(e,`expected the node content, but found ','`):q(e,`missed comma between flow collection entries`);let r=!1,a=!1;n===63&&Y(e.input.charCodeAt(e.position+1))&&(r=a=!0,e.position+=1,Dc(e,t));let c=e.line,l=ic(e),u=jc(e,t,Ls,!1,!0);Dc(e,t),n=e.input.charCodeAt(e.position),(i||a||e.line===c)&&n===58?(r=!0,e.position++,Dc(e,t),i||$s(e,l),u||K(e),jc(e,t,Ls,!1,!0)||K(e),Dc(e,t),i||nc(e)):i&&r?(u||K(e),K(e)):i?K(e):r&&($s(e,l),u||K(e),K(e),nc(e)),n=e.input.charCodeAt(e.position),n===44?(o=!0,e.position++):o=!1}q(e,`unexpected end of the stream within a flow collection`)}function kc(e,t,n){if(e.firstTabInLine!==-1||e.input.charCodeAt(e.position)!==45||!X(e.input.charCodeAt(e.position+1)))return!1;for(Zs(e,e.position,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,V.BLOCK);e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1));){e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,q(e,`tab characters must not be used in indentation`));let n=e.line;e.position++;let r=Z(e,!0)>0;if(e.firstTabInLine!==-1&&e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1))&&q(e,`bad indentation of a sequence entry`),r&&e.lineIndent<=t?K(e):jc(e,t,zs,!1,!0),Z(e,!0),e.lineIndent<t||e.position>=e.length)break;e.lineIndent>t&&q(e,`bad indentation of a sequence entry`),e.line===n&&e.input.charCodeAt(e.position)===45&&X(e.input.charCodeAt(e.position+1))&&q(e,`bad indentation of a sequence entry`)}return nc(e),!0}function Ac(e,t,n,r){let i=!1,a=!1,o=!1,s=!1;if(e.firstTabInLine!==-1)return!1;let c=e.input.charCodeAt(e.position);for(;c!==0;){!i&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,q(e,`tab characters must not be used in indentation`));let l=e.input.charCodeAt(e.position+1),u=e.line;if((c===63||c===58)&&X(l))o||=(Qs(e,e.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,V.BLOCK),!0),c===63?(i&&K(e),a=!0,i=!0):(i||(K(e),a=!0),i=!1),e.position+=1,s=!0;else{i&&=(K(e),!1);let t=ic(e);if(!jc(e,n,Rs,!1,!0))break;if(e.line===u){for(c=e.input.charCodeAt(e.position);oc(c);)c=e.input.charCodeAt(++e.position);if(c===58)c=e.input.charCodeAt(++e.position),X(c)||q(e,`a whitespace character is expected after the key-value separator within a block mapping`),o||=(e.events.splice(t.eventsLength,0,{type:z.MAPPING,start:t.position,anchorStart:r.anchorStart,anchorEnd:r.anchorEnd,tagStart:r.tagStart,tagEnd:r.tagEnd,style:V.BLOCK}),!0),a=!0,i=!1,s=!1;else if(a)q(e,`expected ':' after a mapping key`);else return r.anchorStart!==G||r.tagStart!==G?(ac(e,t),!1):!0}else if(a)q(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return r.anchorStart!==G||r.tagStart!==G?(ac(e,t),!1):!0}if(jc(e,t,Bs,!0,s)&&(s=!1),i||(s&&=(K(e),!1)),Z(e,!0),c=e.input.charCodeAt(e.position),(e.line===u||e.lineIndent>t)&&c!==0)q(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return a?(i&&K(e),o&&nc(e),!0):!1}function jc(e,t,n,r,i,a=!0){e.depth>=e.maxDepth&&q(e,`nesting exceeded maxDepth (${e.maxDepth})`),e.depth++;let o=1,s=!1,c=!1,l=null,u=rc(),d=n===Bs||n===zs,f=d,p=d;if(r&&Z(e,!0)&&(s=!0,o=e.lineIndent>t?1:e.lineIndent===t?0:-1),o===1)for(;;){let r=e.input.charCodeAt(e.position),i=ic(e);if(s&&o!==1&&(r===33||r===38))break;if(s&&p&&(u.tagStart!==G||u.anchorStart!==G)&&(r===33||r===38)){let n=ic(e),r=t+1;if(Ac(e,e.position-e.lineStart,r,u)&&e.events[n.eventsLength]?.type===z.MAPPING)return e.depth--,!0;ac(e,n)}if(s&&(r===33&&u.tagStart!==G||r===38&&u.anchorStart!==G)||!vc(e,u,n===Ls)&&!yc(e,u))break;l===null&&(l=i),Z(e,!0)?(s=!0,f=p,o=e.lineIndent>t?1:e.lineIndent===t?0:-1):f=!1}if(f&&=s||i,o===1||n===Bs){let r=n===Ls||n===Rs?t:t+1,i=e.position-e.lineStart;if(o===1){if(f&&(kc(e,i,u)||Ac(e,i,r,u))||Oc(e,r,u))c=!0;else{let t=e.input.charCodeAt(e.position);if(l!==null&&a&&p&&!f&&t!==124&&t!==62){let t=ic(e),n=l.position-l.lineStart;ac(e,l),Ac(e,n,r,rc())&&e.events[t.eventsLength]?.type===z.MAPPING?c=!0:ac(e,t)}!c&&(d&&wc(e,r,u)||Sc(e,r,u)||Cc(e,r,u)||bc(e,u)||Ec(e,r,n,u))&&(c=!0)}}else o===0&&(c=f&&kc(e,i,u))}return d&&=!c,!c&&(u.anchorStart!==G||u.tagStart!==G||d)&&(ec(e,G,G,u.anchorStart,u.anchorEnd,u.tagStart,u.tagEnd,B.PLAIN),c=!0),e.depth--,c||u.anchorStart!==G||u.tagStart!==G}function Mc(e){if(e.lineIndent>0||e.input.charCodeAt(e.position)!==37)return!1;e.position++;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position));)e.position++;let n=e.input.slice(t,e.position),r=[];for(n.length===0&&q(e,`directive name must not be less than one character in length`);e.input.charCodeAt(e.position)!==0&&!J(e.input.charCodeAt(e.position));){for(;oc(e.input.charCodeAt(e.position));)e.position++;if(e.input.charCodeAt(e.position)===35||J(e.input.charCodeAt(e.position))||e.input.charCodeAt(e.position)===0)break;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!Y(e.input.charCodeAt(e.position));)e.position++;r.push(e.input.slice(t,e.position))}if(J(e.input.charCodeAt(e.position))&&fc(e),n===`YAML`){e.directives.some(e=>e.kind===`yaml`)&&q(e,`duplication of %YAML directive`),r.length!==1&&q(e,`YAML directive accepts exactly one argument`);let t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]);t===null&&q(e,`ill-formed argument of the YAML directive`),parseInt(t[1],10)!==1&&q(e,`unacceptable YAML version of the document`),e.directives.push({kind:`yaml`,version:r[0]})}else if(n===`TAG`){r.length!==2&&q(e,`TAG directive accepts exactly two arguments`);let[t,n]=r;Us.test(t)||q(e,`ill-formed tag handle (first argument) of the TAG directive`),Is.call(e.tagHandlers,t)&&q(e,`there is a previously declared suffix for "${t}" tag handle`),Js.test(n)||q(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagHandlers[t]=n,e.directives.push({kind:`tag`,handle:t,prefix:n})}return!0}function Nc(e){e.directives=[],e.tagHandlers=Object.create(null);let t=!1;for(Z(e,!0);Mc(e);)t=!0,Z(e,!0);let n=!1,r=!1,i=!0;if(e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45&&X(e.input.charCodeAt(e.position+3))){n=!0;let t=e.line;e.position+=3,Z(e,!0),i=e.line>t}else t&&q(e,`directives end mark is expected`);let a=e.events.length;if(!n&&e.position===e.lineStart&&e.input.charCodeAt(e.position)===46&&pc(e)){e.position+=3,Z(e,!0);return}if(Xs(e,n,!1),jc(e,e.lineIndent-1,Bs,!1,i,i)||K(e),Z(e,!0),e.position===e.lineStart&&pc(e)&&(r=e.input.charCodeAt(e.position)===46,r)){let t=e.line;e.position+=3,Z(e,!0),e.line===t&&e.position<e.length&&q(e,`end of the stream or a document separator is expected`)}let o=e.events[a];o?.type===z.DOCUMENT&&(o.explicitEnd=r),nc(e),!r&&e.position<e.length&&!hc(e)&&q(e,`end of the stream or a document separator is expected`)}function Pc(e,t){let n=e.length,r={...Ys,...t,input:`${e}\0`,length:n,position:0,line:0,lineStart:0,lineIndent:0,firstTabInLine:-1,depth:0,directives:[],tagHandlers:Object.create(null),events:[]},i=e.indexOf(`\0`);for(i!==-1&&Qo.throwAt(e,i,`null byte is not allowed in input`,r.filename);r.position<r.length&&(mc(r),Z(r,!0),!(r.position>=r.length));){let e=r.position;Nc(r),r.position===e&&q(r,`can not read a document`)}return r.events}var Fc={...Ys,...Cs};function Ic(e,t={}){let n={...Fc,...t},r=String(e),i=Object.keys(Ys),a=Object.keys(Cs);return Fs(Pc(r,Po(n,i)),{...Po(n,a),source:r})}function Lc(e,t){let n=Ic(e,t);if(n.length===0)throw new Qo(`expected a document, but the input is empty`);if(n.length===1)return n[0];throw new Qo(`expected a single document in the stream, but found more`)}var Rc=Symbol(`INVALID`);function zc(e){let t=new Set([e.defaultScalarTag,e.defaultSequenceTag,e.defaultMappingTag].filter(e=>e!==void 0)),n=e.implicitScalarTags,r=e.tags.filter(e=>!(e.nodeKind===`scalar`&&e.implicit)&&!t.has(e)),i=e.tags.filter(e=>t.has(e));return[...n.map(e=>({tag:e,implicitTag:!0})),...r.map(e=>({tag:e,implicitTag:!1})),...i.map(e=>({tag:e,implicitTag:!0}))]}function Bc(e,t){for(let n=0,r=e.representTypes.length;n<r;n+=1){let{tag:r,implicitTag:i}=e.representTypes[n];if(r.identify(t)){let e;return e=r.matchByTagPrefix?r.representTagName(t):r.tagName,{tag:r,tagName:e,implicitTag:i}}}return null}function Vc(e,t){if(!e.noRefs&&typeof t==`object`&&t){let n=e.refs.get(t);if(n)return n.anchor===void 0&&(n.anchor=`ref_${e.refCounter++}`),{kind:`alias`,anchor:n.anchor}}let n=Bc(e,t);if(!n){if(t===void 0||e.skipInvalid)return Rc;throw new Qo(`unacceptable kind of an object to dump ${Object.prototype.toString.call(t)}`)}let{tag:r,tagName:i,implicitTag:a}=n,o=a?i:bs(i);if(r.nodeKind===`scalar`)return{kind:`scalar`,tag:o,tagged:!a,style:B.PLAIN,value:r.represent(t)};if(r.nodeKind===`sequence`){let n=r.represent(t),i={kind:`sequence`,tag:o,tagged:!a,style:V.BLOCK,items:[]};e.noRefs||e.refs.set(t,i);for(let t=0,r=n.length;t<r;t+=1){let r=Vc(e,n[t]);r===Rc&&n[t]===void 0&&(r=Vc(e,null)),r!==Rc&&i.items.push(r)}return i}let s=r.represent(t),c={kind:`mapping`,tag:o,tagged:!a,style:V.BLOCK,items:[]};e.noRefs||e.refs.set(t,c);for(let[t,n]of s){let r=Vc(e,t);if(r===Rc)continue;let i=Vc(e,n);i!==Rc&&c.items.push({key:r,value:i})}return c}function Hc(e,t,n={}){let r=Vc({representTypes:zc(t),noRefs:n.noRefs??!1,skipInvalid:n.skipInvalid??!1,refs:new Map,refCounter:0},e);return[{contents:r===Rc?null:r,directives:[]}]}var Uc=Symbol(`visit:break`),Wc=Symbol(`visit:skip`);function Gc(e,t,n){let r=t(e,n);if(r===Uc)return!0;if(r===Wc)return!1;let i=n.depth+1;switch(e.kind){case`sequence`:for(let n of e.items)if(Gc(n,t,{depth:i,parent:e,isKey:!1}))return!0;break;case`mapping`:for(let{key:n,value:r}of e.items)if(Gc(n,t,{depth:i,parent:e,isKey:!0})||Gc(r,t,{depth:i,parent:e,isKey:!1}))return!0}return!1}function Kc(e,t){for(let n of e)if(n.contents&&Gc(n.contents,t,{depth:0,parent:null,isKey:!1}))return}function qc(e,t){return!!(e&1<<t)}var Jc={applyQuoteFlowKeysOption:Xc,doubleQuoteForInvisibles:Zc,doubleQuoteWhitespaceOnly:Qc,applyForceQuotesOption:$c,tryLongOrMultilineAsBlock:el,quoteInvalidPlain:tl,fallbackToDoubleQuoted:nl};function Yc(e){return e.presenterOptions.quoteStyle===`single`&&qc(e.allowedStylesMask,B.SINGLE_QUOTED)?B.SINGLE_QUOTED:B.DOUBLE_QUOTED}function Xc(e){e.presenterOptions.quoteFlowKeys&&e.isKey&&e.flowOnly&&e.style===B.PLAIN&&(e.style=B.DOUBLE_QUOTED)}function Zc(e){e.style===B.PLAIN&&/[\t\x7F-\xA0\u2028\u2029\uFEFF\uFFFE\uFFFF]/.test(e.node.value)&&(e.style=B.DOUBLE_QUOTED)}function Qc(e){e.style===B.PLAIN&&/^\s+$/.test(e.node.value)&&(e.style=B.DOUBLE_QUOTED)}function $c(e){e.presenterOptions.forceQuotes&&(e.isKey||e.style!==B.PLAIN||e.node.tag===e.presenterOptions.schema.defaultScalarTag.tagName&&(e.style=e.node.value.includes(`
`)?B.DOUBLE_QUOTED:Yc(e)))}function el(e){if(e.style!==B.PLAIN||e.isKey)return;let t=e.node.value,n=t.indexOf(`
`)!==-1;if(!qc(e.allowedStylesMask,B.LITERAL_BLOCK)){n&&(e.style=B.DOUBLE_QUOTED);return}let r=e.presenterOptions.lineWidth;if(r===-1){n&&(e.style=B.LITERAL_BLOCK);return}let i=Math.max(Math.min(r,40),r-e.shiftOfContent),a=0,o=!1;for(;a<=t.length;){let e=t.length,n=t.indexOf(`
`,a);n!==-1&&(e=n);let r=t.slice(a,e);if(r.length>i&&r[0]!==` `&&/ [^ \t]/.test(r)&&(o=!0),n===-1)break;a=n+1}o?e.style=B.FOLDED_BLOCK:n&&(e.style=B.LITERAL_BLOCK)}function tl(e){e.style===B.PLAIN&&!qc(e.allowedStylesMask,B.PLAIN)&&(e.style=Yc(e))}function nl(e){qc(e.allowedStylesMask,e.style)||(e.style=B.DOUBLE_QUOTED)}function rl(e,t){return e|1<<t}var il=`[\\x09\\x0A\\x0D\\x20-\\x7E\\x85\\xA0-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]`,al=`[\\n\\r]`,ol=`\\uFEFF`,sl=`[ \\t]`,cl=`(?:(?!(?:${al}|${ol}))${il})`,ll=`(?:(?!${sl})${cl})`,ul=`[\\x09\\x20-\\uD7FF\\uE000-\\uFFFF\\u{10000}-\\u{10FFFF}]`,dl=`[-?:,\\[\\]{}#&*!|>'"%@\`]`,fl=`[,\\[\\]{}]`,pl=ll,ml=`(?:(?!${fl})${ll})`,hl=`(?:(?:(?!${dl})${ll})|[?:-](?=${pl}))`,gl=`(?:(?:(?!${dl})${ll})|[?:-](?=${ml}))`,_l=`(?:(?:(?![:#])${pl})|:(?=${pl}))#*`,vl=`(?:(?:(?![:#])${ml})|:(?=${ml}))#*`,yl=`(?:${sl}*${_l})*`,bl=`(?:${sl}*${vl})*`,xl=`${hl}#*${yl}`,Sl=`${gl}#*${bl}`,Cl=xl,wl=Sl,Tl=`\\n+${_l}${yl}`,El=`\\n+${vl}${bl}`,Dl=`${xl}(?:${Tl})*`,Ol=`${Sl}(?:${El})*`,kl=RegExp(`^(?:${Dl})$`,`u`),Al=RegExp(`^(?:${Ol})$`,`u`),jl=RegExp(`^(?:${Cl})$`,`u`),Ml=RegExp(`^(?:${wl})$`,`u`),Nl=RegExp(`^(?:${ul})*$`,`u`),Pl=RegExp(`^(?:${ul}|\\n)*$`,`u`),Fl=RegExp(`^(?:${cl}|\\n)*$`,`u`),Il=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/,Ll=/^(?:---|\.\.\.)(?=$|[ \t\n\r])/m;function Rl(e){let t=e.node.value;if(t!==``){if(!(e.isKey?e.flowOnly?Ml:jl:e.flowOnly?Al:kl).test(t)||e.shiftOfFirstLine===0&&Il.test(t))return!1;if(e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1){let n=t.slice(e+1);if(Ll.test(n))return!1}}}let n=e.presenterOptions.schema.resolveImplicitScalarTag(t).tag.tagName;return!(!e.node.tagged&&n!==e.node.tag||!e.node.tagged&&t===`=`&&n===e.presenterOptions.schema.defaultScalarTag.tagName)}function zl(e){let t=e.node.value;if(!(e.isKey?Nl:Pl).test(t)||/[ \t]\n|\n[ \t]/.test(t))return!1;if(!e.isKey&&e.shiftOfContent===0){let e=t.indexOf(`
`);if(e!==-1&&Ll.test(t.slice(e+1)))return!1}return!0}function Bl(e){if(e.flowOnly||!Fl.test(e.node.value))return!1;let t=e.shiftOfContent-e.shiftOfParent;return!(t<1||t>9&&/^\n* /.test(e.node.value)||e.shiftOfContent===0&&Ll.test(e.node.value))}function Vl(e){let t=rl(0,B.DOUBLE_QUOTED);Rl(e)&&(t=rl(t,B.PLAIN)),zl(e)&&(t=rl(t,B.SINGLE_QUOTED)),Bl(e)&&(t=rl(rl(t,B.LITERAL_BLOCK),B.FOLDED_BLOCK)),e.allowedStylesMask=t}function Hl(e){switch(e.style){case B.PLAIN:return Ul(e);case B.SINGLE_QUOTED:return Wl(e);case B.LITERAL_BLOCK:return Gl(e);case B.FOLDED_BLOCK:return Kl(e);case B.DOUBLE_QUOTED:return ql(e)}}function Ul(e){return Jl(e.node.value,e.shiftOfContent)}function Wl(e){return`'${Jl(e.node.value,e.shiftOfContent).replace(/'/g,`''`)}'`}function Gl(e){let t=e.node.value;return`|`+Zl(t,e.shiftOfParent,e.shiftOfContent)+Ql(Yl(t,e.shiftOfContent))}function Kl(e){let t=e.node.value,n=e.presenterOptions.lineWidth,r=1/0;return n!==-1&&(r=Math.max(Math.min(n,40),n-e.shiftOfContent)),`>`+Zl(t,e.shiftOfParent,e.shiftOfContent)+Ql(Yl(tu(t,r),e.shiftOfContent))}function ql(e){return`"${iu(e.node.value)}"`}function Jl(e,t){let n=e.indexOf(`
`);if(n===-1)return e;let r=` `.repeat(t),i=e.slice(0,n),a=/(\n+)([^\n]*)/g;a.lastIndex=n;let o;for(;o=a.exec(e);){let e=o[1].length,t=o[2];i+=`
`.repeat(e+1)+r+t}return i}function Yl(e,t){let n=` `.repeat(t),r=0,i=``,a=e.length;for(;r<a;){let t,o=e.indexOf(`
`,r);o===-1?(t=e.slice(r),r=a):(t=e.slice(r,o+1),r=o+1),t.length&&t!==`
`&&(i+=n),i+=t}return i}function Xl(e){return/^\n* /.test(e)}function Zl(e,t,n){let r=Xl(e)?String(n-t):``,i=e[e.length-1]===`
`;return`${r}${i&&(e[e.length-2]===`
`||e===`
`)?`+`:i?``:`-`}\n`}function Ql(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function $l(e){return e===` `||e===`	`}function eu(e,t){if(e===``||$l(e[0]))return e;let n=/ [^ \t]/g,r,i=0,a,o=0,s=0,c=``;for(;r=n.exec(e);)s=r.index,s-i>t&&(a=o>i?o:s,c+=`\n${e.slice(i,a)}`,i=a+1),o=s;return c+=`
`,e.length-i>t&&o>i?c+=`${e.slice(i,o)}\n${e.slice(o+1)}`:c+=e.slice(i),c.slice(1)}function tu(e,t){let n=/(\n+)([^\n]*)/g,r=e.indexOf(`
`);r===-1&&(r=e.length),n.lastIndex=r;let i=eu(e.slice(0,r),t),a=e[0]===`
`||$l(e[0]),o,s;for(;s=n.exec(e);){let e=s[1],n=s[2];o=n!==``&&$l(n[0]),i+=e+(!a&&!o&&n!==``?`
`:``)+eu(n,t),a=o}return i}var nu=/["\\\x00-\x1F\x7F-\xA0\u2028\u2029\uD800-\uDFFF\uFEFF\uFFFE\uFFFF]/gu;function ru(e){switch(e){case`\0`:return`\\0`;case`\x07`:return`\\a`;case`\b`:return`\\b`;case`	`:return`\\t`;case`
`:return`\\n`;case`\v`:return`\\v`;case`\f`:return`\\f`;case`\r`:return`\\r`;case`\x1B`:return`\\e`;case`"`:return`\\"`;case`\\`:return`\\\\`;case``:return`\\N`;case`\xA0`:return`\\_`;case`\u2028`:return`\\L`;case`\u2029`:return`\\P`}let t=e.charCodeAt(0),n=t.toString(16).toUpperCase();return t<=255?`\\x${`0`.repeat(2-n.length)}${n}`:`\\u${`0`.repeat(4-n.length)}${n}`}function iu(e){return e.replace(nu,ru)}var au=10,ou={indent:2,seqNoIndent:!1,seqInlineFirst:!0,lineWidth:80,flowBracketPadding:!1,flowSkipCommaSpace:!1,flowSkipColonSpace:!1,quoteFlowKeys:!1,quoteStyle:`single`,forceQuotes:!1,scalarStyleRules:Object.keys(Jc).map(e=>Reflect.get(Jc,e)),tagBeforeAnchor:!1};function su(e){return e.tagged?e.tag:bs(e.tag)}function cu(e){let t={...ou,...e};return t.flowSkipColonSpace&&(t.quoteFlowKeys=!0),{...t,defaultScalarTagName:t.schema.defaultScalarTag.tagName,openEnded:!1}}function lu(e,t){return`\n${` `.repeat(e.indent*t)}`}function uu(e,t,n,r,i,a){return{node:t,parent:n,level:r,isKey:i,flowOnly:a,shiftOfParent:r===0?-1:e.indent*(r-1),shiftOfContent:e.indent*Math.max(1,r),shiftOfFirstLine:r===0?0:e.indent*r,presenterOptions:e,allowedStylesMask:0,style:t.style}}function du(e,t,n){let r=``;for(let i=0,a=n.items.length;i<a;i+=1){let a=Q(e,t,n.items[i],n,{}).text;i>0&&(r+=`,${e.flowSkipCommaSpace?``:` `}`),r+=a}let i=e.flowBracketPadding&&n.items.length>0?` `:``;return`[${i}${r}${i}]`}function fu(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=Q(e,t+1,n.items[a],n,{block:!0,compact:e.seqInlineFirst,isblockseq:!0}).text;r&&i===``||(i+=lu(e,t)),o===``||au===o.charCodeAt(0)?i+=`-`:i+=`- `,i+=o}return i}function pu(e,t,n){let r=``;for(let{key:i,value:a}of n.items){let o=``;r!==``&&(o+=`,${e.flowSkipCommaSpace?``:` `}`);let s=Q(e,t,i,n,{iskey:!0}),c=s.text,l=Q(e,t,a,n,{}).text,u=e.flowSkipColonSpace||l===``?``:` `,d=i.kind===`scalar`&&s.noBody&&(i.tagged||i.anchor!==void 0),f=i.kind===`alias`||d?` `:``;o+=`${c}${f}:${u}${l}`,r+=o}let i=e.flowBracketPadding&&r!==``?` `:``;return`{${i}${r}${i}}`}function mu(e,t,n,r){let i=``;for(let a=0,o=n.items.length;a<o;a+=1){let o=``;r&&i===``||(o+=lu(e,t));let{key:s,value:c}=n.items[a],l=(s.kind===`mapping`||s.kind===`sequence`)&&s.style===V.BLOCK&&s.items.length!==0||s.kind===`scalar`&&(s.style===B.LITERAL_BLOCK||s.style===B.FOLDED_BLOCK),u=l?Q(e,t+1,s,n,{block:!0,compact:!0,isblockseq:!hu(e,s,t+1)}):Q(e,t+1,s,n,{block:!0,compact:!0,iskey:!0}),d=u.text,f=s.kind===`scalar`&&s.value.indexOf(`
`)!==-1,p=d.length>1024&&/^[\s\S]{1025}/u.test(d),m=l||f||p;m&&(d&&au===d.charCodeAt(0)?o+=`?`:o+=`? `),o+=d,m&&(o+=lu(e,t));let h=Q(e,t+1,c,n,{block:!0,compact:m,isblockseq:m&&!hu(e,c,t+1)}).text,g=s.kind===`scalar`&&u.noBody&&(s.tagged||s.anchor!==void 0),_=!m&&(s.kind===`alias`||g)?` `:``;h===``||au===h.charCodeAt(0)?o+=`${_}:`:o+=`${_}: `,o+=h,i+=o}return i}function hu(e,t,n){return t.kind===`alias`||t.tagged||t.anchor!==void 0||e.indent<2&&n>0}function Q(e,t,n,r,i){if(n.kind===`alias`)return e.openEnded=!1,{text:`*${n.anchor}`,noBody:!1};let{block:a=!1,iskey:o=!1,isblockseq:s=!1}=i,c=i.compact??!1,l=n.anchor!==void 0;hu(e,n,t)&&(c=!1);let u,d=n.tagged,f=a&&(n.kind===`mapping`||n.kind===`sequence`)&&n.style===V.BLOCK&&n.items.length!==0;if(n.kind===`mapping`)u=f?mu(e,t,n,c):pu(e,t,n);else if(n.kind===`sequence`)u=f?e.seqNoIndent&&!s&&t>0?fu(e,t-1,n,c):fu(e,t,n,c):du(e,t,n);else{let i=uu(e,n,r,t,o,!a);Vl(i);for(let t of e.scalarStyleRules)t(i);u=Hl(i),e.openEnded=(i.style===B.LITERAL_BLOCK||i.style===B.FOLDED_BLOCK)&&(n.value===`
`||n.value.endsWith(`

`)),d=n.tagged||u===``&&i.flowOnly&&r?.kind===`sequence`&&!l||i.style!==B.PLAIN&&n.tag!==e.defaultScalarTagName}n.kind!==`mapping`&&n.kind!==`sequence`||f||(e.openEnded=!1),f&&c&&t>0&&e.indent>2&&(u=`${` `.repeat(e.indent-2)}${u}`);let p=u===``,m=u;if(d||l){let t=[],r=d?su(n):null,i=l?`&${n.anchor}`:null;e.tagBeforeAnchor?(r!==null&&t.push(r),i!==null&&t.push(i)):(i!==null&&t.push(i),r!==null&&t.push(r));let a=u===``||u.charCodeAt(0)===au?``:` `;m=`${t.join(` `)}${a}${u}`}return{text:m,noBody:p}}function gu(e){return(e.kind===`sequence`||e.kind===`mapping`)&&e.style===V.BLOCK&&e.items.length!==0&&!e.tagged&&e.anchor===void 0}function _u(e){let t=``;for(let n of e.directives){if(n.kind===`yaml`){t+=`%YAML ${n.version}\n`;continue}let{handle:e,prefix:r}=n;t+=`%TAG ${e} ${r}\n`}return t}function vu(e,t){let n=cu(t),r=``,i=!1;for(let t=0;t<e.length;t+=1){let a=e[t];n.openEnded=!1;let o=_u(a),s=o!==``,c=a.explicitStart||s||t>0&&!i;if(r+=o,a.contents===null)c&&(r+=`---
`);else if(c){let e=Q(n,0,a.contents,null,{block:!0,compact:!0}).text,t=e===``?``:s||gu(a.contents)?`
`:` `;r+=`---${t}${e}\n`}else r+=Q(n,0,a.contents,null,{block:!0,compact:!0}).text+`
`;i=a.explicitEnd||n.openEnded,i&&(r+=`...
`)}return r}var yu={...ou,schema:Go,skipInvalid:!1,noRefs:!1,flowLevel:-1,sortKeys:!1,transform:()=>{}};function bu(e,t){let n=String(e),r=String(t);return n<r?-1:+(n>r)}function xu(e,t={}){let n={...yu,...t},r=Hc(e,n.schema,{noRefs:n.noRefs,skipInvalid:n.skipInvalid});if(n.flowLevel>=0&&Kc(r,(e,t)=>{if(!(t.depth<n.flowLevel))return(e.kind===`sequence`||e.kind===`mapping`)&&(e.style=V.FLOW),Wc}),n.sortKeys){let e=n.sortKeys===!0?bu:n.sortKeys;Kc(r,t=>{t.kind===`mapping`&&t.items.sort((t,n)=>e(t.key.kind===`scalar`?t.key.value:``,n.key.kind===`scalar`?n.key.value:``))})}return n.transform(r),vu(r,{...Po(n,Object.keys(ou)),schema:n.schema})}z.DOCUMENT,z.SEQUENCE,z.MAPPING,z.SCALAR,z.ALIAS,z.POP,B.PLAIN,B.SINGLE_QUOTED,B.DOUBLE_QUOTED,B.LITERAL_BLOCK,B.FOLDED_BLOCK,V.BLOCK,V.FLOW,H.CLIP,H.STRIP,H.KEEP;function Su(e){let t=xu(e,{indent:2,lineWidth:-1,noRefs:!0});return[`# ======================================================================`,`# WARD-BECK SYSTEMS - CONSOLE MASTER CALIBRATION PROFILE (.WBS)`,`# Hardware Emulation: XTM-4 Mastering Meter & POD-22 Dual LED Bar`,`# Exported: ${e.timestamp}`,`# Compatible with: https://xtm.wbsps.ca/`,`# ======================================================================

`].join(`
`)+t}function Cu(e,t){let n=new Date().toISOString().slice(0,10),r=t||`WBS-Console-Config-${n}.WBS`,i=new Blob([e],{type:`text/yaml;charset=utf-8`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=r,document.body.appendChild(o),o.click(),setTimeout(()=>{document.body.removeChild(o),URL.revokeObjectURL(a)},150)}function wu(e){let t=Lc(e);if(!t||typeof t!=`object`)throw Error(`Invalid YAML configuration file format.`);let n=t;if(!n.console&&!n.ballistics&&!n.scope)throw Error(`Unrecognized WBS configuration structure: missing console, ballistics, or scope blocks.`);return t}function Tu(e,t){if(e.console&&(typeof e.console.power==`boolean`&&(t.power=e.console.power),e.console.mode&&(t.mode=t.prevMode=e.console.mode),e.console.meterStyle&&(t.meterStyle=e.console.meterStyle),e.console.dialLamp&&(t.dialLamp=e.console.dialLamp),e.console.vfdMetric&&(t.vfdMetric=e.console.vfdMetric),e.console.highPassFilter!==void 0&&(t.hp=+!!e.console.highPassFilter),e.console.termination600Ohm!==void 0&&(t.term=+!!e.console.termination600Ohm),e.console.inputA&&(t.a.src=e.console.inputA.src??t.a.src,t.a.lvl=e.console.inputA.lvl??t.a.lvl),e.console.inputD&&(t.d.src=e.console.inputD.src??t.d.src,t.d.lvl=e.console.inputD.lvl??t.d.lvl),e.console.testGenS?.pair&&(t.s.pair=[...e.console.testGenS.pair]),typeof e.console.toneCalibrationDbfs==`number`)){let n=t.toneCalLevels.indexOf(e.console.toneCalibrationDbfs);n>=0&&(t.toneCalIdx=n)}}function Eu(e,t){if(e.ballistics){if(typeof e.ballistics.vuReferenceLevelDbu==`number`&&t.setReferenceLevel(e.ballistics.vuReferenceLevelDbu,e.console?.mode===`D`),typeof e.ballistics.ppmPeakSensitivityTrimDb==`number`){t.setPeakSensTrim(e.ballistics.ppmPeakSensitivityTrimDb);let n=document.getElementById(`selectPeakSens`);n&&(n.value=String(e.ballistics.ppmPeakSensitivityTrimDb))}if(e.ballistics.vuBallisticPreset){t.setVuBallisticPreset(e.ballistics.vuBallisticPreset);let n=document.getElementById(`selectVuBallistics`);n&&(n.value=e.ballistics.vuBallisticPreset)}if(e.ballistics.ppmBallisticPreset){t.setPpmType(e.ballistics.ppmBallisticPreset);let n=document.getElementById(`selectPpmBallistics`);n&&(n.value=e.ballistics.ppmBallisticPreset)}typeof e.ballistics.inputGainTrimDb==`number`&&t.setInputTrim(e.ballistics.inputGainTrimDb),e.ballistics.monitorAudio&&t.setMonitor(!!e.ballistics.monitorAudio.enabled,e.ballistics.monitorAudio.volume??.5)}}function Du(e,t){if(e.pod22){if(typeof e.pod22.extendedLed22Range==`boolean`&&t.setExtendedRange(e.pod22.extendedLed22Range),e.pod22.scaleMode&&(t.scaleMode=e.pod22.scaleMode),e.pod22.decayType){t.setDecay(e.pod22.decayType);let n=document.getElementById(`selectPodDecay`);n&&(n.value=e.pod22.decayType)}if(typeof e.pod22.peakHold==`boolean`){t&&t.dip&&(t.dip.BS1=+!!e.pod22.peakHold);let n=document.getElementById(`chkPodHold`);n&&(n.checked=e.pod22.peakHold)}}}function Ou(e,t){e.scope&&(e.scope.timeMode&&t.setTimeMode(e.scope.timeMode),typeof e.scope.captureLengthSeconds==`number`&&t.setCaptureLength(e.scope.captureLengthSeconds),typeof e.scope.captureSpeedFps==`number`&&(t.captureSpeed=e.scope.captureSpeedFps),typeof e.scope.logWarpBeta==`number`&&t.setBeta(e.scope.logWarpBeta),e.scope.traces&&(typeof e.scope.traces.channelA==`boolean`&&(t.showChA=e.scope.traces.channelA),typeof e.scope.traces.channelB==`boolean`&&(t.showChB=e.scope.traces.channelB),typeof e.scope.traces.sum==`boolean`&&(t.showSum=e.scope.traces.sum),typeof e.scope.traces.diff==`boolean`&&(t.showDiff=e.scope.traces.diff),typeof e.scope.traces.momentaryLufs==`boolean`&&(t.showLufs=e.scope.traces.momentaryLufs),typeof e.scope.traces.shortTermLufs==`boolean`&&(t.showLufsS=e.scope.traces.shortTermLufs),typeof e.scope.traces.integratedLufs==`boolean`&&(t.showLufsI=e.scope.traces.integratedLufs)),e.scope.display&&(typeof e.scope.display.show0DbfsCeilingLine==`boolean`&&(t.show0DbfsLine=e.scope.display.show0DbfsCeilingLine),typeof e.scope.display.enableWaveformFade==`boolean`&&(t.enableFade=e.scope.display.enableWaveformFade),typeof e.scope.display.hfFadeDistancePercent==`number`&&(t.hfFadeDistance=e.scope.display.hfFadeDistancePercent),typeof e.scope.display.showHoverTelemetryHud==`boolean`&&(t.showHoverTelemetry=e.scope.display.showHoverTelemetryHud),typeof e.scope.display.showCursorTraceLine==`boolean`&&(t.showCursorTrace=e.scope.display.showCursorTraceLine),typeof e.scope.display.plotPhaseCorrelation==`boolean`&&(t.plotPhase=e.scope.display.plotPhaseCorrelation),typeof e.scope.display.hudDocked==`boolean`&&t.setDocked(e.scope.display.hudDocked)))}function ku(e){let t=(e,t)=>{if(t===void 0)return;let n=document.getElementById(e);n&&(n.checked=t)},n=(e,t)=>{if(t==null)return;let n=document.getElementById(e);n&&(n.value=String(t))};if(e.scope?.traces&&(t(`chkShowChA`,e.scope.traces.channelA),t(`chkShowChB`,e.scope.traces.channelB),t(`chkShowSum`,e.scope.traces.sum),t(`chkShowDiff`,e.scope.traces.diff),t(`chkShowLufs`,e.scope.traces.momentaryLufs),t(`chkShowLufsS`,e.scope.traces.shortTermLufs),t(`chkShowLufsI`,e.scope.traces.integratedLufs)),e.scope?.display&&(t(`chk0DbfsLine`,e.scope.display.show0DbfsCeilingLine),t(`chkFadeEnabled`,e.scope.display.enableWaveformFade),t(`chkHoverTelemetry`,e.scope.display.showHoverTelemetryHud),t(`chkCursorTrace`,e.scope.display.showCursorTraceLine),t(`chkPhasePlot`,e.scope.display.plotPhaseCorrelation),t(`chkDockHud`,e.scope.display.hudDocked)),e.ballistics){n(`inputGainTrimSlider`,e.ballistics.inputGainTrimDb);let r=document.getElementById(`inputGainTrimVal`);if(r){let t=e.ballistics.inputGainTrimDb;r.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}n(`peakSensTrimSlider`,e.ballistics.ppmPeakSensitivityTrimDb);let i=document.getElementById(`peakSensTrimVal`);if(i){let t=e.ballistics.ppmPeakSensitivityTrimDb;i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`}e.ballistics.monitorAudio&&(t(`chkMonitorAudio`,e.ballistics.monitorAudio.enabled),n(`monitorVolumeSlider`,e.ballistics.monitorAudio.volume))}e.pod22&&t(`chkExtendedLed22`,e.pod22.extendedLed22Range)}var $=class e{static instance;static getInstance(){return e.instance||=new e,e.instance}getConsent(){return va()}setConsent(e){ya(e)}resetConsent(){ba()}hasPersistentConsent(){return this.getConsent()===`allowed`}storageGet(e){return xa(()=>this.hasPersistentConsent(),e)}storageSet(e,t){Sa(()=>this.hasPersistentConsent(),e,t)}storageRemove(e){Ca(e)}buildConfig(e,t,n,r){return Oa(e,t,n,r)}exportToYaml(e,t,n,r){return Su(this.buildConfig(e,t,n,r))}downloadWbsFile(e,t,n,r,i){Cu(this.exportToYaml(e,t,n,r),i)}parseWbsYaml(e){return wu(e)}applyConfig(e,t,n,r,i){Tu(e,t),Eu(e,n),Du(e,r),Ou(e,i),this.syncDrawerDom(e),typeof i._updateTraceToggles==`function`&&i._updateTraceToggles(),i.graphDirty=!0,this.saveConfig(t,n,r,i),t.flash(`CONFIGOK`,1600),t.notify()}syncDrawerDom(e){ku(e)}saveConfig(e,t,n,r){try{let i=this.buildConfig(e,t,n,r),a=JSON.stringify(i);this.storageSet(_a,a)}catch{}}loadSavedConfig(e,t,n,r){try{let i=this.storageGet(_a);if(!i)return!1;let a=JSON.parse(i);return this.applyConfig(a,e,t,n,r),!0}catch{return!1}}}.getInstance();function Au(e,t=e.model){e.dbfsView&&$.saveConfig(t,e.audio,e.podView,e.dbfsView)}function ju(e){let{podView:t}=e,n=document.getElementById(`chkExtendedLed22`);if(n&&t){let e=localStorage.getItem(`xtm_extended_led22`),r=e===null||e===`true`;n.checked=r,t.setExtendedRange(r),n.addEventListener(`change`,e=>{t.setExtendedRange(e.target.checked);try{localStorage.setItem(`xtm_extended_led22`,e.target.checked)}catch{}})}}function Mu(e,t){let{podView:n}=e,{chkPodHold:r}=t,i=document.getElementById(`selectPodScale`);i&&n&&(i.value=n.scaleMode,i.addEventListener(`change`,e=>{n.scaleMode=e.target.value})),r&&r.addEventListener(`change`,e=>{n.dip.BS1=+!!e.target.checked})}function Nu(e,t){let{podView:n}=e,{selectPodDecay:r}=t;r&&(r.value=n.decayType||`type2`,r.addEventListener(`change`,t=>{n.setDecay(t.target.value),Au(e)}))}function Pu(){let e=[],t=0;function n(n,r){if(r-t<1e3)return;t=r;let i=n.dbfs||[-60,-60,-60,-60],a=n.lufs||{};e.push({time:new Date().toISOString(),chA:n.hasAudio?i[0].toFixed(2):`-60.00`,chB:n.hasAudio?i[1].toFixed(2):`-60.00`,sum:n.hasAudio&&typeof i[2]==`number`?i[2].toFixed(2):`-60.00`,diff:n.hasAudio&&typeof i[3]==`number`?i[3].toFixed(2):`-60.00`,lufsM:isFinite(a.m)?a.m.toFixed(2):`-60.00`,lufsS:isFinite(a.s)?a.s.toFixed(2):`-60.00`,lufsI:isFinite(a.i)?a.i.toFixed(2):`-60.00`,lra:isFinite(a.lra)?a.lra.toFixed(2):`0.00`,phase:typeof n.phaseCorrelation==`number`?n.phaseCorrelation.toFixed(3):`1.000`}),e.length>7200&&e.shift()}let r=[],i=-60,a=-60;function o(e){if(!e||!e.hasAudio)return;let t=e.dbfs||[-60,-60,-60,-60],n=t[0],o=t[1],s=typeof t[2]==`number`?t[2]:Math.max(n,o),c=typeof t[3]==`number`?t[3]:-60,l=n-i,u=o-a;i=n,a=o,(l>=3.5||u>=3.5||n>=-9||o>=-9)&&(r.push({time:new Date().toISOString(),chA:n.toFixed(2),chB:o.toFixed(2),sum:s.toFixed(2),diff:c.toFixed(2),deltaA:l.toFixed(2),deltaB:u.toFixed(2),lufsM:e.lufs&&isFinite(e.lufs.m)?e.lufs.m.toFixed(2):`-60.00`}),r.length>5e3&&r.shift())}return{telemetryLog:e,transientLog:r,recordTelemetry:n,recordTransientEvent:o}}function Fu(e,t){let n=new Blob([e],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t}-${new Date().toISOString().replace(/[:.]/g,`-`)}.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}function Iu(){let e=document.getElementById(`btnExportCsvTest`),t=document.getElementById(`chkAutoExportHourly`),n=Pu(),{telemetryLog:r,transientLog:i}=n;function a(){if(r.length===0){alert(`Recording telemetry... Please ensure audio is playing and try again.`);return}let e=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,LUFS_Momentary,LUFS_ShortTerm,LUFS_Integrated,LRA_LU,Phase_Correlation
`;for(let t of r)e+=`${t.time},${t.chA},${t.chB},${t.sum},${t.diff},${t.lufsM},${t.lufsS},${t.lufsI},${t.lra},${t.phase}\n`;Fu(e,`WBS-Mastering-Telemetry`)}e&&e.addEventListener(`click`,a);function o(){if(i.length===0){alert(`Recording transients... Please play dynamic audio with sharp transients and try again.`);return}let e=`Timestamp,Ch_A_Peak_dBFS,Ch_B_Peak_dBFS,L_Plus_R_Sum_dBFS,L_Minus_R_Diff_dBFS,Delta_ChA_dB,Delta_ChB_dB,LUFS_Momentary
`;for(let t of i)e+=`${t.time},${t.chA},${t.chB},${t.sum},${t.diff},${t.deltaA},${t.deltaB},${t.lufsM}\n`;Fu(e,`WBS-Super-Transient-Log`)}let s=document.getElementById(`btnExportTransientLog`);return s&&s.addEventListener(`click`,o),t&&setInterval(()=>{t.checked&&r.length>0&&a()},36e5),n}function Lu(e,t){let{audio:n}=e,{selectDevice:r,drawerSourceBadge:i}=t,a={isAudioStarted:!1,lastModeKey:null,syncAudioWithHardwareMode:o};async function o(e){let t=a.lastModeKey;await s(e),a.lastModeKey!==t&&n.setReferenceLevel(e.getActiveReferenceLevel(),e.mode===`D`)}async function s(e){if(!window.audioReady||e.mode===`SET`)return;let t=e.mode+`:`+(e.mode===`A`?e.a.src:e.mode===`D`?e.d.src:e.s.pair[0]);if(!(t===a.lastModeKey&&a.isAudioStarted)){if(a.lastModeKey=t,a.isAudioStarted=!0,e.mode===`A`){let t=[];try{t=await n.getAudioInputDevices()}catch{t=[]}if(!t||t.length===0){i&&(i.textContent=`Source: Calibrated Internal Tone (No Audio Input Devices Detected)`,i.style.color=`#38bdf8`),n.setToneCalibration(-18),n.startTestGenerator(`sine1k`);return}let a=r?r.value:null,o=t.filter(e=>e.label.toLowerCase().includes(`mic`)),s=t.filter(e=>e.label.toLowerCase().includes(`line`));a||(a=e.a.src===1?s.length>0?s[0].deviceId:t.length>1?t[1].deviceId:t[0].deviceId:o.length>0?o[0].deviceId:t[0].deviceId,r&&(r.value=a||``));let c=r?.options[r.selectedIndex]?.text||t.find(e=>e.deviceId===a)?.label||`Soundcard Input`;i&&(i.textContent=`Source: `+c,i.style.color=`#7df9ff`);try{await n.connectSoundCard(a),n.setInputTrim(e.a.lvl-64)}catch(e){let t=e?.name===`NotFoundError`||e?.message?.includes(`not found`)||e?.message?.includes(`detected`);t||console.warn(`Could not connect soundcard:`,e),i&&(i.textContent=t?`Source: Calibrated Internal Tone (No Audio Input Devices)`:`Source Error: `+(e?.message||`Failed to open soundcard`),i.style.color=t?`#38bdf8`:`#ff4d4f`),n.setToneCalibration(-18),n.startTestGenerator(`sine1k`)}}else if(e.mode===`D`){if(e.d.src===1){if(i&&(i.textContent=`Source: Computer Audio Output`),!await n.connectSystemAudio()){if(e.d.src=0,i){let t=e.toneCalLevels[e.toneCalIdx];i.textContent=`Source: 1 kHz Digital Reference Tone (${t>=0?`+`:``}${t} dBFS)`}n.setToneCalibration(e.toneCalLevels[e.toneCalIdx]),n.startTestGenerator(`sine1k`),e.flash(`1k TONE `)}}else{if(i){let t=e.toneCalLevels[e.toneCalIdx];i.textContent=`Source: 1 kHz Digital Reference Tone (${t>=0?`+`:``}${t} dBFS)`}n.setToneCalibration(e.toneCalLevels[e.toneCalIdx]),n.startTestGenerator(`sine1k`)}}else if(e.mode===`S`){let t=[``,`sine1k`,`pink`,`sine400`,`sweep`],r=[``,`1 kHz Sine Tone`,`Pink Noise`,`400 Hz Lineup Tone`,`20Hz-20kHz Sweep`],a=t[e.s.pair[0]]||`sine1k`,o=r[e.s.pair[0]]||`1 kHz Sine Tone`;i&&(i.textContent=`Source: `+o),n.setToneCalibration(e.toneCalLevels[e.toneCalIdx]),n.startTestGenerator(a)}}}return a}function Ru(e){let{model:t,audio:n}=e;n.setReferenceLevel(t.getActiveReferenceLevel(),t.mode===`D`),n.setHighPass(t.hp===1),n.setVuStyle(t.meterStyle)}function zu(e,t,n){let{model:r,audio:i}=e,{selectToneCal:a,chkHpf:o,chkTerm:s,selectLampColor:c,selectMeterStyle:l,drawerSourceBadge:u}=t;r.onChange=t=>{let r=t.mode===`D`;i.setReferenceLevel(t.getActiveReferenceLevel(),r),i.setInputTrim(t.a.lvl-64),i.setHighPass(t.hp===1),i.setVuStyle(t.meterStyle);let d=t.toneCalLevels[t.toneCalIdx];if(i.setToneCalibration(d),a&&(a.value=String(d)),o&&(o.checked=t.hp===1),s&&(s.checked=t.term===1),c&&(c.value=t.dialLamp),l&&(l.value=t.meterStyle),u&&t.mode===`S`){let e=t.s.pair[0]??1;(e===1||e===3)&&(u.textContent=`Source: ${e===3?`400 Hz`:`1 kHz`} Digital Lineup Tone (${d>=0?`+`:``}${d} dBFS)`)}n.syncAudioWithHardwareMode(t),Au(e,t)}}function Bu(e,t){let{model:n,view:r}=e;r.onButtonPressed=async e=>{if(e===`MODE`)n.pressMode();else if(e===`SOURCE`)n.pressSource();else if(e===`DOWN`)n.pressDown();else if(e===`UP`)n.pressUp();else if(e.startsWith(`INPUT_`)){let t=parseInt(e.replace(`INPUT_`,``),10);t>=1&&t<=4&&n.setInput(t)}else if(e===`CYCLE_STYLE`){let e=[`sifam`,`simpson`,`wbs_m405`,`mccurdy_vu`,`standard_vu`],t=e.indexOf(n.meterStyle);n.meterStyle=e[(t+1)%e.length],n.notify()}else e===`MC_TOGGLE`?n.toggleMccurdyRange():e===`MC_RANGE_OUTER`?n.setMccurdyRange(`outer`):e===`MC_RANGE_INNER`?n.setMccurdyRange(`inner`):e===`MC_RANGE_CAL`&&n.setMccurdyRange(`cal`);t.syncAudioWithHardwareMode(n)},r.onButtonReleased=()=>{}}function Vu(e,t){let{model:n}=e;document.addEventListener(`pointerdown`,async e=>{!t.isAudioStarted&&!e.target.closest(`.aux-drawer`)&&(window.audioReady=!0,window.audioContext&&window.audioContext.state===`suspended`&&await window.audioContext.resume(),await t.syncAudioWithHardwareMode(n))},{once:!0,passive:!0})}function Hu(e,t){let{audio:n}=e,{drawerSourceBadge:r,selectDevice:i}=t;n.onStatusChange=e=>{r&&(e.type===`soundcard`?(r.textContent=`Source: `+(e.label||`Soundcard Input`),r.style.color=`#7df9ff`):e.type===`system`?(r.textContent=`Source: `+(e.label||`Computer System Audio`),r.style.color=`#7df9ff`):e.type===`test`?(r.textContent=`Source: `+e.label,r.style.color=`#ffd152`):e.type===`error`?(r.textContent=`Source Error: `+(e.error||`Connection Failed`),r.style.color=`#ff4d4f`):e.type===`disconnected`&&(r.textContent=`Source: Audio Stopped`,r.style.color=`#888`))},n.onDevicesChange=(e,t)=>{if(!i)return;let n=t||i.value;i.innerHTML=`<option value="">Default Soundcard Input</option>`,e.forEach((e,t)=>{let r=document.createElement(`option`);r.value=e.deviceId,r.textContent=e.label||`Audio Interface ${t+1}`,e.deviceId===n&&(r.selected=!0),i.appendChild(r)})}}async function Uu(e,t){let{audio:n}=e,{selectDevice:r}=t;async function i(){if(!r)return;let e=r.value||n.activeDeviceId,t=await n.getAudioInputDevices();r.innerHTML=`<option value="">Default Soundcard Input</option>`,t.forEach((t,n)=>{let i=document.createElement(`option`);i.value=t.deviceId,i.textContent=t.label||`Audio Interface ${n+1}`,t.deviceId===e&&(i.selected=!0),r.appendChild(i)})}try{await i()}catch{}navigator.mediaDevices&&navigator.mediaDevices.ondevicechange!==void 0&&(navigator.mediaDevices.ondevicechange=i)}function Wu(e,t,n){let{model:r,audio:i}=e,{selectDevice:a,drawerSourceBadge:o}=t;a&&a.addEventListener(`change`,async()=>{let e=a.value||null;n.isAudioStarted=!0;let t=a.options[a.selectedIndex]?.text||`Soundcard Input`;o&&(o.textContent=`Connecting: `+t+`...`,o.style.color=`#ffd152`),r.mode!==`A`&&(r.mode=`A`,r.a.src=0,r.saveEEPROM()),n.lastModeKey=`A:`+e;try{await i.connectSoundCard(e),o&&(o.textContent=`Source: `+t,o.style.color=`#7df9ff`),r.flash(`CARD IN`),i.setReferenceLevel(r.getActiveReferenceLevel(),r.mode===`D`),n.nudgeSens(r)}catch(e){let t=e?.name===`NotFoundError`||e?.message?.includes(`not found`)||e?.message?.includes(`detected`);t||console.error(`Failed to connect selected device:`,e),o&&(o.textContent=t?`Source: Calibrated Internal Tone (No Audio Input Devices)`:`Device Error: `+(e?.message||`Cannot access device`),o.style.color=t?`#38bdf8`:`#ff4d4f`),i.setToneCalibration(-18),i.startTestGenerator(`sine1k`)}})}function Gu(e,t){let{audio:n}=e,{inputGainSlider:r,inputGainVal:i,chkMonitor:a,monitorVolSlider:o,monitorVolVal:s}=t;r&&r.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setInputTrim(t),i&&(i.textContent=(t>0?`+`:``)+t.toFixed(1)+` dB`)}),a&&a.addEventListener(`change`,e=>{n.setMonitor(e.target.checked)}),o&&o.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);n.setMonitorVolume(t),s&&(s.textContent=Math.round(t*100)+`%`)})}function Ku(e,t){let{model:n,audio:r,view:i}=e,{selectMeterStyle:a}=t;a&&(a.value=n.meterStyle,a.addEventListener(`change`,e=>{n.meterStyle=e.target.value,r.setVuStyle(e.target.value),n.saveEEPROM(),i.isBuilt=!1}));let o=document.getElementById(`selectVuBallistics`);o&&(o.value=r.vuBallisticPreset||`standard_vu`,o.addEventListener(`change`,t=>{r.setVuBallisticPreset(t.target.value),Au(e)}))}function qu(e,t){let{model:n,audio:r}=e,{selectToneCal:i}=t;if(i){i.innerHTML=``;for(let e=0;e>=-60;e--){let t=document.createElement(`option`);t.value=String(e);let n=`${e} dBFS`;e===-18?n+=` (0 VU ANSI C16.5 / EBU Reference - Default)`:e===0?n+=` (Peak Full Scale Ceiling)`:e===-6?n+=` (High Peak Alignment)`:e===-12?n+=` (Digital Nominal)`:e===-14?n+=` (AES / Streaming Target)`:e===-20?n+=` (0 VU SMPTE RP155 Reference)`:e===-24&&(n+=` (EBU R128 / ATSC A/85)`),t.textContent=n,i.appendChild(t)}i.value=String(n.toneCalLevels[n.toneCalIdx]??-18),i.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);r.setToneCalibration(t);let i=n.toneCalLevels.indexOf(t);if(i!==-1&&(n.toneCalIdx=i,n.saveEEPROM(),n.mode===`S`&&(n.s.pair[0]===1||n.s.pair[0]===3))){let e=n.s.pair[0]===3?`400 `:`1k `;n.flash((e+(t>=0?`+`:``)+t+`dB`).padEnd(8).substring(0,8))}})}}var Ju=e=>{try{return localStorage.getItem(e)}catch{return null}},Yu=(e,t)=>{try{localStorage.setItem(e,t)}catch{}};function Xu(e,t){let{model:n,view:r}=e,{selectLampColor:i}=t,a=()=>document.body.classList.contains(`theme-mccurdy`)?`xtm.lamp.mccurdy`:`xtm.lamp.dark`,o=()=>{let e=document.body.classList.contains(`theme-mccurdy`),t=Ju(a())||(e?`parchment`:n.dialLamp||`amber`);t!==n.dialLamp&&(n.dialLamp=t,r.isBuilt=!1),i&&(i.value=n.dialLamp)};Ju(`xtm.lamp.dark`)||Yu(`xtm.lamp.dark`,n.dialLamp||`amber`),o(),new MutationObserver(o).observe(document.body,{attributes:!0,attributeFilter:[`class`]}),i&&(i.value=n.dialLamp||`amber`,i.addEventListener(`change`,e=>{n.dialLamp=e.target.value,Yu(a(),n.dialLamp),n.saveEEPROM(),r.isBuilt=!1}))}function Zu(e,t){let{model:n,audio:r}=e,{chkHpf:i,chkTerm:a}=t;i&&i.addEventListener(`change`,e=>{n.hp=+!!e.target.checked,r.setHighPass(e.target.checked),n.saveEEPROM(),n.notify()}),a&&a.addEventListener(`change`,e=>{n.term=+!!e.target.checked,n.saveEEPROM(),n.notify()})}function Qu(e,t){let{audio:n,view:r}=e,{selectPpmBallistics:i}=t;i&&(i.value=n.ppmBallisticPreset||`type2`,r.ppmStandard=i.value,r.isBuilt=!1,i.addEventListener(`change`,t=>{n.setPpmType(t.target.value),r.ppmStandard=t.target.value,r.isBuilt=!1,Au(e)}))}function $u(e){let{audio:t,dbfsView:n}=e;n&&(n.onClear=()=>{t.resetLoudness()});let r=document.getElementById(`selectScopeLogWarp`);r&&n&&r.addEventListener(`change`,e=>{n.setBeta(parseFloat(e.target.value))});let i=document.getElementById(`selectTimeScale`);i&&n&&(i.value=n.timeMode,i.addEventListener(`change`,e=>{n.setTimeMode(e.target.value)}),n.onTimeModeChange=t=>{i.value=t,Au(e)})}function ed(e){let t=document.getElementById(`wbsConsentBanner`),n=document.getElementById(`btnConsentAllow`),r=document.getElementById(`btnConsentSession`),i=document.getElementById(`btnResetConsent`),a=document.getElementById(`consentStatusText`);function o(){let e=$.getConsent();a&&(e===`allowed`?(a.textContent=`ALLOWED (Persistent Memory)`,a.style.color=`#22c55e`):e===`session_only`?(a.textContent=`SESSION ONLY`,a.style.color=`#eab308`):(a.textContent=`PROMPTING...`,a.style.color=`#38bdf8`)),t&&(t.style.display=e===`prompt`?`flex`:`none`)}n&&n.addEventListener(`click`,()=>{$.setConsent(`allowed`),o(),Au(e)}),r&&r.addEventListener(`click`,()=>{$.setConsent(`session_only`),o()}),i&&i.addEventListener(`click`,()=>{$.resetConsent(),o()}),o()}function td(e){let{model:t,audio:n,podView:r,dbfsView:i}=e;i&&$.loadSavedConfig(t,n,r,i)}function nd(e,t){let{model:n,audio:r,podView:i,dbfsView:a}=e,o=document.getElementById(`btnExportWbs`);o&&a&&o.addEventListener(`click`,()=>{$.downloadWbsFile(n,r,i,a),n.flash(`SAVED.WBS`,1400)});let s=document.getElementById(`btnImportWbs`),c=document.getElementById(`inputImportWbs`);s&&c&&a&&(s.addEventListener(`click`,()=>{c.click()}),c.addEventListener(`change`,async e=>{let o=e.target.files?.[0];if(o)try{let e=await o.text(),s=$.parseWbsYaml(e);$.applyConfig(s,n,r,i,a),await t.syncAudioWithHardwareMode(n)}catch(e){console.error(`WBS configuration import failed:`,e),alert(`Error importing .WBS configuration: `+(e?.message||`Invalid format`)),n.flash(`CFG ERR `,1600)}finally{c.value=``}}))}function rd(e,t){let n=()=>Au(e),r=document.getElementById(`selectPeakSens`),i=document.getElementById(`chkExtendedLed22`),a=document.getElementById(`selectVuBallistics`),o=document.getElementById(`selectScopeLogWarp`),{inputGainSlider:s,monitorVolSlider:c,chkMonitor:l,chkPodHold:u,selectPodDecay:d,selectPpmBallistics:f}=t;[s,c,r].forEach(e=>{e?.addEventListener(`change`,n)}),[l,i,u,d,f,a,o].forEach(e=>{e?.addEventListener(`change`,n)})}function id(e,t){let{model:n}=e;window.addEventListener(`keydown`,e=>{if([`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target.tagName))return;let r=e.key.toUpperCase();r===`M`?(n.pressMode(),t.syncAudioWithHardwareMode(n)):r===`S`?(n.pressSource(),t.syncAudioWithHardwareMode(n)):r===`ARROWDOWN`||r===`D`?n.pressDown():r===`ARROWUP`||r===`U`?n.pressUp():r===`H`?n.holdMode():r===`P`&&n.togglePower()})}var ad=!1;function od(e){if(ad)return;ad=!0,document.body.classList.add(`has-new-version`);let t=document.getElementById(`btnOpenSettings`),n=document.querySelector(`.drawer-gear-label`),r=document.getElementById(`drawerToggleLeft`),i=e?e.startsWith(`v`)?e:`v${e}`:``;if(t&&(t.classList.add(`has-update`),t.setAttribute(`title`,`New version available${i?` (`+i+`)`:``}! Click Settings to update`)),n&&(n.classList.add(`has-update`),!n.querySelector(`.settings-update-dot`))){let e=document.createElement(`span`);e.className=`settings-update-dot`,e.title=`New update available`,n.appendChild(e)}r&&r.classList.add(`has-update`);let a=document.querySelector(`.drawer-grid`);if(a&&!document.getElementById(`updateAvailableBanner`)){let e=document.createElement(`div`);e.id=`updateAvailableBanner`,e.className=`update-available-banner`,e.innerHTML=`
      <span>⚡ New version available${i?` (`+i+`)`:``}</span>
      <button type="button" id="btnReloadNewVersion">Reload &amp; Update Now</button>
    `,a.parentElement?.insertBefore(e,a),document.getElementById(`btnReloadNewVersion`)?.addEventListener(`click`,()=>{window.location.reload()})}let o=document.querySelector(`.build-stamp`);o&&(o.innerHTML=`<span style="color:#f97316;cursor:pointer;font-weight:bold" title="Click to reload with new version">Update: ${i||`Available`} ⟳</span>`,o.addEventListener(`click`,()=>window.location.reload()))}function sd(){window.testUpdatePulse=(e=`1.0.99`)=>od(e);async function e(){try{let e=await fetch(`./version.json?cache=`+Date.now(),{cache:`no-store`});if(!e.ok)return;let{version:t}=await e.json();t&&t!==`1.0.47`&&od(t)}catch{}}setTimeout(e,3e3),setInterval(e,6e4),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&e()});let t=document.querySelector(`.build-stamp`);if(t){let e=`v1.0.47`;t.textContent=e,t.setAttribute(`title`,`Ward-Beck Systems XTM-4 ${e}`)}}function cd(){`serviceWorker`in navigator&&(navigator.serviceWorker.addEventListener(`message`,e=>{e.data?.type===`xtm-update-ready`&&(console.info(`XTM: new version stored; update ready.`),od())}),navigator.serviceWorker.register(`sw.js`,{updateViaCache:`none`}).then(e=>{e.waiting&&od(),e.addEventListener(`updatefound`,()=>{let t=e.installing;t&&t.addEventListener(`statechange`,()=>{t.state===`installed`&&navigator.serviceWorker.controller&&od()})})}).catch(e=>{console.warn(`Service worker registration failed:`,e)}))}function ld(){let e=document.getElementById(`pwaInstallBanner`),t=document.getElementById(`btnPwaInstall`),n=document.getElementById(`btnPwaDismiss`),r=document.getElementById(`pwaSubText`),i=null,a=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,o=/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)||window.innerWidth<=840,s=window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0;e&&!s&&(window.addEventListener(`beforeinstallprompt`,t=>{t.preventDefault(),i=t,e.style.display=`block`}),o&&a&&(r&&(r.innerHTML=`Tap the Share icon <strong>[⎋]</strong> in Safari and choose <strong>Add to Home Screen</strong>`),t&&(t.textContent=`How to Install`,t.addEventListener(`click`,()=>{alert(`To install this app on iOS:
1. Tap the Share button in Safari (box with up arrow).
2. Scroll down and tap "Add to Home Screen".`)})),e.style.display=`block`),window.addEventListener(`appinstalled`,()=>{e.style.display=`none`,i=null}),t&&!a&&t.addEventListener(`click`,async()=>{if(i){i.prompt();let{outcome:t}=await i.userChoice;t===`accepted`&&(e.style.display=`none`),i=null}else e.style.display=`none`}),n&&n.addEventListener(`click`,()=>{e.style.display=`none`}))}function ud(e,t){let{model:n,audio:r,view:i,podView:a,dbfsView:o}=e,s=document.querySelector(`.console-viewport`),c=0,l=performance.now(),u=document.getElementById(`fpsDisplay`);function d(e){let f=r&&r.getLevels?r.getLevels():r?.currentLevels||{vu:[0,0],ppm:[-.12,-.12],vuDb:[-1/0,-1/0],ppmDb:[-1/0,-1/0],phaseCorrelation:1,phaseLed:-1,peak:[!1,!1],hasAudio:!1};if(i.updateNeedles(f,n.power,n.meterStyle===`sifam`),n.isIdle=!f.hasAudio,i.renderSecondary(n,f),a.render(n,f),o&&o.render(n,f),t.recordTelemetry(f,e),t.recordTransientEvent(f),s){let e=f&&f.lufs&&typeof f.lufs.m==`number`?f.lufs.m:-60;isFinite(e)&&e>-24?e>=-12?s.className=`console-viewport lufs-glow-red`:e>=-18?s.className=`console-viewport lufs-glow-orange`:s.className=`console-viewport lufs-glow-green`:s.className=`console-viewport`}if(c++,e-l>=500){let t=c*1e3/(e-l);u&&(u.textContent=t.toFixed(1)+` FPS`),c=0,l=e}requestAnimationFrame(d)}requestAnimationFrame(d)}async function dd(){let t=document.getElementById(`visualizerStage`),n=document.getElementById(`pod22Stage`),r=document.getElementById(`dbfsStage`),i=new br(t);i.build(e);let a={model:e,audio:it,view:i,podView:new Kr(n),dbfsView:r?new da(r):null};window.xtmModel=e,window.xtmAudio=it,window.xtmView=i,window.xtmCtx=a,pa(),ma(),ha(a),ju(a);let o=Iu(),s=fa();Ru(a);let c=Lu(a,s);zu(a,s,c),Bu(a,c),Vu(a,c),Hu(a,s),await Uu(a,s),Wu(a,s,c),Gu(a,s),Ku(a,s),qu(a,s),Xu(a,s),Zu(a,s),Mu(a,s),Qu(a,s),Nu(a,s),$u(a),ed(a),td(a),nd(a,c),rd(a,s),id(a,c),sd(),cd(),ld(),ud(a,o)}window.audioReady=!0,dd(),window.audioContext&&window.audioContext.state===`suspended`&&window.audioContext.resume();
//# sourceMappingURL=index-BfOgSA2V.js.map