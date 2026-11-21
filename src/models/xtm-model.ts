/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Hardware Firmware Model (PIC16F874 / 42V400C Emulation)
 * Handles front panel state, EEPROM persistence, source selection,
 * filter & impedance configuration, and dot-matrix display formatting.
 */

import type {
  VisualizerMode,
  MeterStyle,
  XtmModeStateA,
  XtmModeStateD,
  XtmModeStateS,
  XtmModeStateSet
} from '../types/telemetry';

export class XtmModel {
  public power: boolean = true;
  public mode: VisualizerMode = 'A';
  public prevMode: VisualizerMode = 'A';

  public a: XtmModeStateA = { src: 0, lvl: 64 }; // lvl 64 = +4 dBu (0 VU Standard Reference)
  public d: XtmModeStateD = { src: 1, lvl: 42 }; // lvl 42 = -18 dBFS (0 VU Standard Reference)
  public s: XtmModeStateS = { pair: [1] };       // S1..S4 (1kHz, Pink Noise, 400Hz, Sweep)
  public selectedInput: number = 1;             // 1..4 (Hardware Selector Switch)
  public mcRangeMode: 'outer' | 'inner' | 'cal' = 'outer'; // McCurdy Range Selector Switch
  public mcAttenuatorStep: number = 15;         // 0..30 (McCurdy 31-step Attenuator, step 15 = -20 outer / 0 inner)

  public hp: number = 0;   // 0 = HP OUT, 1 = HP IN (80Hz rumble cut)
  public term: number = 0; // 0 = TERM HZ, 1 = TERM LZ (600 Ohm load)

  public set: XtmModeStateSet = { scr: 'HP' };

  public meterStyle: MeterStyle = 'sifam';
  public dialLamp: string = 'amber';
  public ppmStyle: string = 'black';
  public artMode: string = 'svg';
  public vfdMetric: string = 'lufs';

  public flashMsg: string | null = null;
  public flashTimer: any = null;
  public isIdle: boolean = true;

  // 1 dB increments from -60 dBFS to 0 dBFS
  public toneCalLevels: number[] = (() => {
    const arr: number[] = [];
    for (let i = -60; i <= 0; i++) {
      arr.push(i);
    }
    return arr;
  })();
  public toneCalIdx: number = 42; // Default: -18 dBFS (0 VU Standard Reference Alignment)

  public onChange: ((model: XtmModel) => void) | null = null;

  constructor() {
    this.toneCalIdx = this.toneCalLevels.indexOf(-18);
    if (this.toneCalIdx < 0) this.toneCalIdx = 42;
    this.loadEEPROM();
  }

  public lvlDb(idx: number): number {
    return idx - 60;
  }

  public lvlChars(idx: number): string {
    const db = this.lvlDb(idx);
    const sign = db > 0 ? '+' : (db < 0 ? '-' : ' ');
    const abs = Math.abs(db);
    const str = abs < 10 ? '0' + abs : '' + abs;
    return sign + str;
  }

  public flash(msg: string, durationMs: number = 1200): void {
    this.flashMsg = msg;
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.flashMsg = null;
      this.notify();
    }, durationMs);
  }

  public getDisplayText(): string {
    if (!this.power) return '        ';
    if (this.flashMsg) return this.flashMsg.padEnd(8).substring(0, 8);
    if (this.isIdle && this.mode !== 'SET') return 'WardBeck';

    if (this.mode === 'SET') {
      if (this.set.scr === 'HP') {
        return this.hp ? ' HP  IN ' : ' HP  OUT';
      } else {
        return this.term ? 'TERM LZ ' : 'TERM HZ ';
      }
    }

    if (this.mode === 'A') {
      const src = 'A' + this.a.src;
      const termCh = this.term ? 'z' : ' ';
      const lvlStr = this.lvlChars(this.a.lvl);
      const hpCh = this.hp ? 'f' : ' ';
      return src + termCh + lvlStr + hpCh;
    }

    if (this.mode === 'D') {
      const lvlStr = this.lvlChars(this.d.lvl);
      const hpCh = this.hp ? 'f' : ' ';
      return 'SYS ' + lvlStr + hpCh;
    }

    if (this.mode === 'S') {
      const p = this.s.pair[0] ?? 1;
      if (p === 1 || p === 3) {
        const cal = this.toneCalLevels[this.toneCalIdx] ?? 0;
        const prefix = p === 3 ? '400 ' : '1k ';
        if (cal === 0) return (prefix + '0dBFS').padEnd(8).substring(0, 8);
        return (prefix + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8);
      }
      const names = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      const n = names[p];
      if (n) return n;
      return 'TEST ' + p + '  ';
    }

    return 'XTM4    ';
  }

  public getInputSensText(): string {
    if (this.mode === 'A') {
      const src = 'A' + this.a.src;
      const db = this.lvlDb(this.a.lvl);
      const sens = (db >= 0 ? '+' : '') + db + 'dB';
      return (src + ' ' + sens).padEnd(8).substring(0, 8);
    }
    if (this.mode === 'D') {
      const db = this.lvlDb(this.d.lvl);
      const sens = (db >= 0 ? '+' : '') + db + 'dB';
      return ('SYS ' + sens).padEnd(8).substring(0, 8);
    }
    if (this.mode === 'S') {
      const p = this.s.pair[0] ?? 1;
      if (p === 1 || p === 3) {
        const cal = this.toneCalLevels[this.toneCalIdx] ?? 0;
        const prefix = p === 3 ? '400 ' : '1k ';
        if (cal === 0) return (prefix + '0dBFS').padEnd(8).substring(0, 8);
        return (prefix + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8);
      }
      const names = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      const n = names[p];
      if (n) return n.padEnd(8).substring(0, 8);
      return ('TEST ' + p).padEnd(8).substring(0, 8);
    }
    return 'A1 +4dB ';
  }

  public pressMode(): void {
    if (!this.power) return;
    if (this.mode === 'SET') {
      this.mode = this.prevMode;
    } else {
      if (this.mode === 'A') {
        this.mode = 'D';
        this.flash('SYST OUT');
      } else if (this.mode === 'D') {
        this.mode = 'S';
        this.flash('TEST GEN');
      } else {
        this.mode = 'A';
        this.flash('CARD IN ');
      }
    }
    this.saveEEPROM();
    this.notify();
  }

  public holdMode(): void {
    if (!this.power) return;
    if (this.mode !== 'SET') {
      this.prevMode = this.mode;
      this.mode = 'SET';
      this.set.scr = 'HP';
      this.flash('SETUP   ');
    } else {
      this.mode = this.prevMode;
    }
    this.saveEEPROM();
    this.notify();
  }

  public pressSource(): void {
    if (!this.power) return;
    if (this.mode === 'SET') {
      this.set.scr = this.set.scr === 'HP' ? 'TERM' : 'HP';
    } else if (this.mode === 'A') {
      this.a.src = this.a.src === 0 ? 1 : 0;
      this.flash(this.a.src === 0 ? 'MIC / IN1' : 'LINE/IN2');
    } else if (this.mode === 'D') {
      this.d.src = this.d.src === 0 ? 1 : 0;
      this.flash(this.d.src === 1 ? 'SYST OUT' : '1kHZ TONE');
    } else if (this.mode === 'S') {
      let p = (this.s.pair[0] ?? 1) + 1;
      if (p > 4) p = 1;
      this.s.pair[0] = p;
      const testNames = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      const tn = testNames[p];
      if (tn) this.flash(tn);
    }
    this.selectedInput = this.getSelectedInput();
    this.saveEEPROM();
    this.notify();
  }

  public getSelectedInput(): number {
    if (this.mode === 'A') {
      return this.a.src === 0 ? 1 : 2;
    }
    if (this.mode === 'D') return 3;
    if (this.mode === 'S') return 4;
    return this.selectedInput || 1;
  }

  public setInput(inputNum: number): void {
    if (!this.power) return;
    this.selectedInput = inputNum;
    if (inputNum === 1) {
      this.mode = 'A';
      this.a.src = 0;
      this.flash('INPUT 1');
    } else if (inputNum === 2) {
      this.mode = 'A';
      this.a.src = 1;
      this.flash('INPUT 2');
    } else if (inputNum === 3) {
      this.mode = 'D';
      this.d.src = 1;
      this.flash('INPUT 3');
    } else if (inputNum === 4) {
      this.mode = 'S';
      this.s.pair[0] = 1;
      this.flash('INPUT 4');
    }
    this.saveEEPROM();
    this.notify();
  }

  public getMcCurdySensitivityDb(): number {
    if (this.mcRangeMode === 'cal') return 4;
    if (this.mcRangeMode === 'inner') {
      return -30 + this.mcAttenuatorStep * 2;
    }
    return -50 + this.mcAttenuatorStep * 2;
  }

  public setMccurdyRange(mode: 'outer' | 'inner' | 'cal'): void {
    if (!this.power) return;
    this.mcRangeMode = mode;
    this.applyMccurdySensitivity();
  }

  public toggleMccurdyRange(): void {
    if (!this.power) return;
    if (this.mcRangeMode === 'outer') {
      this.mcRangeMode = 'inner';
    } else if (this.mcRangeMode === 'inner') {
      this.mcRangeMode = 'outer';
    } else {
      this.mcRangeMode = 'outer';
    }
    this.applyMccurdySensitivity();
  }

  public setMccurdyAttenuatorStep(step: number): void {
    if (!this.power) return;
    this.mcAttenuatorStep = Math.max(0, Math.min(30, Math.round(step)));
    if (this.mcRangeMode === 'cal') {
      this.mcRangeMode = 'outer';
    }
    this.applyMccurdySensitivity();
  }

  public setSensitivityDb(db: number): void {
    if (!this.power) return;
    const lvl = Math.max(0, Math.min(90, Math.round(db + 60)));
    this.a.lvl = lvl;
    this.d.lvl = lvl;
    if (this.mcRangeMode === 'inner') {
      const step = (db - (-30)) / 2;
      if (step >= 0 && step <= 30) this.mcAttenuatorStep = Math.round(step);
    } else if (this.mcRangeMode === 'outer') {
      const step = (db - (-50)) / 2;
      if (step >= 0 && step <= 30) this.mcAttenuatorStep = Math.round(step);
    }
    this.flash('SENS ' + this.lvlChars(lvl));
    this.saveEEPROM();
    this.notify();
  }

  public applyMccurdySensitivity(): void {
    const db = this.getMcCurdySensitivityDb();
    const lvl = Math.max(0, Math.min(90, Math.round(db + 60)));
    this.a.lvl = lvl;
    this.d.lvl = lvl;
    if (this.mcRangeMode === 'cal') {
      this.flash('CAL +4dBu');
    } else {
      const modeLabel = this.mcRangeMode === 'outer' ? 'OUT' : 'IN ';
      const dbStr = (db > 0 ? '+' : '') + db;
      this.flash(`${modeLabel} ${dbStr}dB`);
    }
    this.saveEEPROM();
    this.notify();
  }

  public pressDown(): void {
    if (!this.power) return;
    if (this.mode === 'SET') {
      if (this.set.scr === 'HP') this.hp = 0;
      else this.term = 1;
    } else if (this.mode === 'A') {
      if (this.a.lvl > 0) this.a.lvl--;
      this.flash('SENS ' + this.lvlChars(this.a.lvl));
    } else if (this.mode === 'D') {
      if (this.d.lvl > 0) this.d.lvl--;
      this.flash('SENS ' + this.lvlChars(this.d.lvl));
    } else if (this.mode === 'S') {
      const p = this.s.pair[0] ?? 1;
      if (p === 1 || p === 3) {
        if (this.toneCalIdx > 0) {
          this.toneCalIdx--;
          const cal = this.toneCalLevels[this.toneCalIdx] ?? 0;
          const prefix = p === 3 ? '400 ' : '1k ';
          this.flash((prefix + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8));
        }
      }
    }
    this.saveEEPROM();
    this.notify();
  }

  public pressUp(): void {
    if (!this.power) return;
    if (this.mode === 'SET') {
      if (this.set.scr === 'HP') this.hp = 1;
      else this.term = 0;
    } else if (this.mode === 'A') {
      if (this.a.lvl < 90) this.a.lvl++;
      this.flash('SENS ' + this.lvlChars(this.a.lvl));
    } else if (this.mode === 'D') {
      if (this.d.lvl < 90) this.d.lvl++;
      this.flash('SENS ' + this.lvlChars(this.d.lvl));
    } else if (this.mode === 'S') {
      const p = this.s.pair[0] ?? 1;
      if (p === 1 || p === 3) {
        if (this.toneCalIdx < this.toneCalLevels.length - 1) {
          this.toneCalIdx++;
          const cal = this.toneCalLevels[this.toneCalIdx] ?? 0;
          const prefix = p === 3 ? '400 ' : '1k ';
          this.flash((prefix + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8));
        }
      }
    }
    this.saveEEPROM();
    this.notify();
  }

  public togglePower(): void {
    this.power = !this.power;
    this.notify();
  }

  public getActiveReferenceLevel(): number {
    if (this.mode === 'A') return this.lvlDb(this.a.lvl);
    if (this.mode === 'D') return this.lvlDb(this.d.lvl);
    return 4;
  }

  public saveEEPROM(): void {
    try {
      const state = {
        mode: this.mode === 'SET' ? this.prevMode : this.mode,
        a: this.a,
        d: this.d,
        s: this.s,
        hp: this.hp,
        term: this.term,
        meterStyle: this.meterStyle,
        dialLamp: this.dialLamp,
        ppmStyle: this.ppmStyle,
        selectedInput: this.getSelectedInput(),
        mcRangeMode: this.mcRangeMode,
        mcAttenuatorStep: this.mcAttenuatorStep,
        toneCalIdx: this.toneCalIdx,
        toneCalLevel: this.toneCalLevels[this.toneCalIdx] ?? 0,
        vfdMetric: this.vfdMetric
      };
      localStorage.setItem('wbs_xtm4_eeprom', JSON.stringify(state));
    } catch (_) {}
  }

  public loadEEPROM(): void {
    try {
      const saved = localStorage.getItem('wbs_xtm4_eeprom');
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj.mode) this.mode = this.prevMode = obj.mode;
        if (obj.a) this.a = Object.assign(this.a, obj.a);
        if (obj.d) this.d = Object.assign(this.d, obj.d);
        if (obj.s) this.s = Object.assign(this.s, obj.s);
        if (obj.hp !== undefined) this.hp = obj.hp;
        if (obj.term !== undefined) this.term = obj.term;
        if (obj.meterStyle) this.meterStyle = obj.meterStyle;
        if (obj.selectedInput) this.selectedInput = obj.selectedInput;
        if (obj.mcRangeMode) this.mcRangeMode = obj.mcRangeMode;
        if (typeof obj.mcAttenuatorStep === 'number') this.mcAttenuatorStep = obj.mcAttenuatorStep;
        if (obj.dialLamp) this.dialLamp = obj.dialLamp;
        if (obj.ppmStyle) this.ppmStyle = obj.ppmStyle;
        if (typeof localStorage !== 'undefined' && localStorage.getItem('wbs_xtm4_tone_cal_dbfs_v3') !== 'true') {
          this.toneCalIdx = this.toneCalLevels.indexOf(-18);
          localStorage.setItem('wbs_xtm4_tone_cal_dbfs_v3', 'true');
          this.saveEEPROM();
        } else if (typeof obj.toneCalLevel === 'number') {
          const idx = this.toneCalLevels.indexOf(obj.toneCalLevel);
          if (idx >= 0) this.toneCalIdx = idx;
        } else if (obj.toneCalIdx !== undefined && obj.toneCalIdx >= 0 && obj.toneCalIdx < this.toneCalLevels.length) {
          this.toneCalIdx = obj.toneCalIdx;
        }
        if (obj.vfdMetric) this.vfdMetric = obj.vfdMetric;
      }
    } catch (_) {}
  }

  public notify(): void {
    if (this.onChange) this.onChange(this);
  }
}

export const xtmModel = new XtmModel();
