/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Settings-drawer controls shared by several feature modules. */

export interface DrawerControls {
  drawerSourceBadge: HTMLElement | null;
  selectDevice: HTMLSelectElement | null;
  inputGainSlider: HTMLInputElement | null;
  inputGainVal: HTMLElement | null;
  chkMonitor: HTMLInputElement | null;
  monitorVolSlider: HTMLInputElement | null;
  monitorVolVal: HTMLElement | null;
  selectMeterStyle: HTMLSelectElement | null;
  selectToneCal: HTMLSelectElement | null;
  selectLampColor: HTMLSelectElement | null;
  selectDialBg: HTMLSelectElement | null;
  selectConsoleBg: HTMLSelectElement | null;
  chkHpf: HTMLInputElement | null;
  chkTerm: HTMLInputElement | null;
  chkPodHold: HTMLInputElement | null;
  selectPodDecay: HTMLSelectElement | null;
  selectPpmBallistics: HTMLSelectElement | null;
}

export function queryDrawerControls(): DrawerControls {
  return {
    drawerSourceBadge: document.getElementById('drawerSourceBadge'),
    selectDevice: document.getElementById('selectDevice') as HTMLSelectElement | null,
    inputGainSlider: document.getElementById('inputGainSlider') as HTMLInputElement | null,
    inputGainVal: document.getElementById('inputGainVal'),
    chkMonitor: document.getElementById('chkMonitor') as HTMLInputElement | null,
    monitorVolSlider: document.getElementById('monitorVolSlider') as HTMLInputElement | null,
    monitorVolVal: document.getElementById('monitorVolVal'),
    selectMeterStyle: document.getElementById('selectMeterStyle') as HTMLSelectElement | null,
    selectToneCal: document.getElementById('selectToneCal') as HTMLSelectElement | null,
    selectLampColor: document.getElementById('selectLampColor') as HTMLSelectElement | null,
    selectDialBg: document.getElementById('selectDialBackground') as HTMLSelectElement | null,
    selectConsoleBg: document.getElementById('selectConsoleBackground') as HTMLSelectElement | null,
    chkHpf: document.getElementById('chkHpf') as HTMLInputElement | null,
    chkTerm: document.getElementById('chkTerm') as HTMLInputElement | null,
    chkPodHold: document.getElementById('chkPodHold') as HTMLInputElement | null,
    selectPodDecay: document.getElementById('selectPodDecay') as HTMLSelectElement | null,
    selectPpmBallistics: document.getElementById('selectPpmBallistics') as HTMLSelectElement | null
  };
}
