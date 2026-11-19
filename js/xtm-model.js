/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Hardware Firmware Model (PIC16F874 / 42V400C Emulation)
 * Handles front panel state, EEPROM persistence, source selection,
 * filter & impedance configuration, and dot-matrix display formatting.
 */

class XtmModel {
  constructor() {
    this.power = true;
    this.mode = 'A'; // 'A' (Soundcard Input), 'D' (Computer Audio Output), 'S' (Test Oscillators), 'SET' (Setup)
    this.prevMode = 'A'; // Mode prior to entering SETUP

    // Inputs
    this.a = { src: 0, lvl: 64 }; // A0 (Default Soundcard), A1 (Alt Soundcard), lvl 64 = +4 dBu
    this.d = { src: 1, lvl: 40 }; // D1 (Computer Audio Output), D0 (1 kHz Reference Tone), lvl 40 = -20 dBFS
    this.s = { pair: [1] }; // S1..S4 (1kHz, Pink Noise, 400Hz, Sweep)

    // Sub-Audible Filter & Termination
    this.hp = 0;   // 0 = HP OUT (filter bypassed), 1 = HP IN (80Hz rumble cut)
    this.term = 0; // 0 = TERM HZ (bridging >20k), 1 = TERM LZ (600 Ohm load)

    // Setup Menu
    this.set = {
      scr: 'HP' // 'HP' or 'TERM'
    };

    // Meter movement style & backlight
    this.meterStyle = 'simpson'; // 'simpson' (classic 300ms) or 'sifam' (taut-band 200ms)
    this.dialLamp = 'amber';     // VU lamp: 'amber', 'white', 'parchment'
    this.ppmStyle = 'black';     // PPM dial: 'black' (Authentic European Black PPM)
    this.artMode = 'svg';
    this.vfdMetric = 'lufs';     // Requirement 15: 'lufs', 'lus', 'lum', 'lui', 'lra'

    // Temporary message flash for VFD dot-matrix display
    this.flashMsg = null;
    this.flashTimer = null;
    this.isIdle = true;

    // 1 kHz Tone Calibration presets (-24, -20, -18, -14, -12, -6, 0 dBFS)
    this.toneCalLevels = [-24, -20, -18, -14, -12, -6, 0];
    this.toneCalIdx = this.toneCalLevels.indexOf(0); // Default: 0 dBFS (Digital Peak Full Scale Ceiling)

    this.onChange = null;

    // Load persisted state from EEPROM simulation
    this.loadEEPROM();
  }

  /* ---------------- Table conversions (42V400C.asm) ---------------- */
  // Level index: 0 = -60 dB, 60 = 0 dB, 64 = +4 dB, 90 = +30 dB
  lvlDb(idx) {
    return idx - 60;
  }

  lvlChars(idx) {
    const db = this.lvlDb(idx);
    const sign = db > 0 ? '+' : (db < 0 ? '-' : ' ');
    const abs = Math.abs(db);
    const str = abs < 10 ? '0' + abs : '' + abs;
    return sign + str;
  }

  flash(msg, durationMs = 1200) {
    this.flashMsg = msg;
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.flashMsg = null;
      this.notify();
    }, durationMs);
  }

  /* ---------------- Display Text Formatter ---------------- */
  getDisplayText() {
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
      const p = this.s.pair[0];
      if (p === 1) {
        const cal = this.toneCalLevels[this.toneCalIdx];
        if (cal === 0) return '1k 0dBFS';
        return '1k ' + (cal >= 0 ? '+' : '') + cal + 'dB';
      }
      const names = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      if (names[p]) return names[p];
      return 'TEST ' + p + '  ';
    }

    return 'XTM4    ';
  }

  /* ---------------- Input & Sensitivity Formatter ---------------- */
  getInputSensText() {
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
      const p = this.s.pair[0];
      if (p === 1) {
        const cal = this.toneCalLevels[this.toneCalIdx];
        if (cal === 0) return '1k 0dBFS';
        return ('1k ' + (cal >= 0 ? '+' : '') + cal + 'dB').padEnd(8).substring(0, 8);
      }
      const names = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      if (names[p]) return names[p].padEnd(8).substring(0, 8);
      return ('TEST ' + p).padEnd(8).substring(0, 8);
    }
    return 'A1 +4dB ';
  }

  /* ---------------- Button Handlers ---------------- */
  pressMode() {
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

  holdMode() {
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

  pressSource() {
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
      let p = this.s.pair[0] + 1;
      if (p > 4) p = 1;
      this.s.pair[0] = p;
      const testNames = ['', '1kHZ REF', 'PINK NOIS', '400H TONE', 'SWEP TONE'];
      this.flash(testNames[p]);
    }
    this.saveEEPROM();
    this.notify();
  }

  pressDown() {
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
      if (this.s.pair[0] === 1) {
        if (this.toneCalIdx > 0) {
          this.toneCalIdx--;
          const cal = this.toneCalLevels[this.toneCalIdx];
          this.flash('1k ' + (cal >= 0 ? '+' : '') + cal + 'dB');
        }
      }
    }
    this.saveEEPROM();
    this.notify();
  }

  pressUp() {
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
      if (this.s.pair[0] === 1) {
        if (this.toneCalIdx < this.toneCalLevels.length - 1) {
          this.toneCalIdx++;
          const cal = this.toneCalLevels[this.toneCalIdx];
          this.flash('1k ' + (cal >= 0 ? '+' : '') + cal + 'dB');
        }
      }
    }
    this.saveEEPROM();
    this.notify();
  }

  togglePower() {
    this.power = !this.power;
    this.notify();
  }

  getActiveReferenceLevel() {
    if (this.mode === 'A') return this.lvlDb(this.a.lvl);
    if (this.mode === 'D') return this.lvlDb(this.d.lvl);
    if (this.mode === 'S') return this.lvlDb(this.s.lvl);
    return 4;
  }

  /* ---------------- EEPROM Storage ---------------- */
  saveEEPROM() {
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
        toneCalIdx: this.toneCalIdx,
        vfdMetric: this.vfdMetric
      };
      localStorage.setItem('wbs_xtm4_eeprom', JSON.stringify(state));
    } catch (_) {}
  }

  loadEEPROM() {
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
        if (obj.dialLamp) this.dialLamp = obj.dialLamp;
        if (obj.ppmStyle) this.ppmStyle = obj.ppmStyle;
        if (typeof localStorage !== 'undefined' && localStorage.getItem('wbs_xtm4_tone_cal_dbfs_v1') !== 'true') {
          this.toneCalIdx = this.toneCalLevels.indexOf(0);
          localStorage.setItem('wbs_xtm4_tone_cal_dbfs_v1', 'true');
          this.saveEEPROM();
        } else if (obj.toneCalIdx !== undefined) {
          this.toneCalIdx = obj.toneCalIdx;
        }
        if (obj.vfdMetric) this.vfdMetric = obj.vfdMetric;
      }
    } catch (_) {}
  }

  notify() {
    if (this.onChange) this.onChange(this);
  }
}

window.xtmModel = new XtmModel();
