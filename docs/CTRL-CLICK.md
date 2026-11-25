<!-- Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. -->
# Ctrl-click: the magic wand

Holding **Ctrl** (**⌘** on macOS) while clicking turns a control's click into a shortcut. A plain
click always does the ordinary thing; Ctrl only adds. Nothing destructive hides behind Ctrl, and
anything Ctrl does can be undone by a plain click or another Ctrl-click.

## Rules
1. **Plain click is never changed.** Ctrl is an extra, so touch screens lose nothing.
2. **One meaning per kind of control.** Knobs go to 0; logos change looks; buttons go to a
   reference state. A new Ctrl action fits one of these families or starts a new one here first.
3. **Visible result.** The control shows its new state at once (knob turns, LED lights, flash on the VFD).
4. **No audio surprises.** Ctrl never raises a level above where it is, starts a generator, or
   opens a route by itself. Going *to 0* is fine; going *loud* is not.
5. **Ctrl + Alt** is kept for layout shortcuts (already: dual-meter mode on the dial logos).
6. **Write it down.** Every Ctrl action is listed below with the file that handles it.

## In use
| Where | Ctrl-click does | Plain click does | Code |
|---|---|---|---|
| XTM-4 sensitivity / DR knob (WBS) | Sensitivity to 0 dB (CARD IN / SYST OUT). In TEST GEN: POD-33 to −18 dBFS (0 VU), never full scale | Turn by drag / wheel | `src/views/xtm/runtime/pointer.ts` → `SENS_ZERO` → `XtmModel.sensitivityToZero()` |
| McCurdy attenuator knob | The attenuator step that reads 0 dB on its scale | Turn by drag / wheel | same |
| XTM-4 MONITOR knob (the system volume, like the keyboard keys) | System volume to 0 | Turn by drag / wheel; double-click = 70 % | `src/views/xtm/controls/monitor-knob.ts` |
| Footer logos (Ward-Beck.ca, .com, McCurdyRadio.ca, .com) | Background only steps .ca → .com → Radio.ca → Radio.com; meters and layout stay | Whole house look (and clears the background override) | `index.html` `switchOrCycleTab(mode, event)`, `css/base/viewport.css` |
| Router CH 2 strip, or the XTM-4 INPUT button holding the tab | Share a **new** tab (the picker opens again) | Play the tab already shared (no picker) | `WebRouter/src/web-router.ts` click handler; `pointer.ts` → `NEW_INPUT_n` → `model-bindings.ts` |
| Dial face logo (Ctrl + Alt) | Dual-meter mode (no centre) on / off | Cycle meter style | `src/views/xtm/runtime/pointer.ts` |

## Candidates
Ideas that fit the rules, not built yet. Pick, then move to the table above.

**Knobs and levels (→ 0 / reference)**
- Router output meter faders (HW 1 speaker slider): Ctrl-click = 0 (mute by level), as the MONITOR knob.
- POD-33 level buttons: Ctrl-click a level = set it on all four AES outputs at once.
- Bit Spitter AUDIO LEVEL: Ctrl-click = OFF.
- AMS-81 mix grid gain: Ctrl-click = Off; Ctrl-click the channel header = 0 dB on L and R.
- Input trim (Settings): Ctrl-click = 0 dB.

**Router**
- Crosspoint: Ctrl-click = route this input to *every* meter input (MTR 1–4) in one go.
- Output head (MTR / HW / MXL67): Ctrl-click = clear every route into that output.
- Input strip: Ctrl-click = solo, i.e. play it on HW 1 without disturbing the other routes.
- Crosspoint: Ctrl-click = lock it against presets and the reconcile pass.

**Generators**
- POD-33 frequency button: Ctrl-click = same frequency on all four AES outputs.
- POD-33 AES row name: Ctrl-click = copy this row to the other three.
- Bit Spitter ×4 pair row: Ctrl-click a setting = apply to all four pairs.
- Bit Spitter LINE FAULT: Ctrl-click = fault for 2 s only, then back to Clean (a "glitch" button).

**Receivers**
- Stream picker: Ctrl-click = re-join the stream (stop / start) to kick a stuck receiver.
- Ring eye: Ctrl-click = open that flow in the data tab's big eye.
- AMS-81 pair button: Ctrl-click = that pair on both receivers.

**Views and tabs**
- Footer view tab: Ctrl-click = open that view in a new browser window (same #view/skin URL).
- Settings cog: Ctrl-click = copy the current #view/skin link to the clipboard.
- Data-tab pipeline card: Ctrl-click = copy its flow id / SDP.
- Logging tab line: Ctrl-click = copy that one line.

**Timing**
- PTP clock row: Ctrl-click = copy the clock identity; Ctrl-click a grandmaster = filter the event list to it.
- NTP log row: Ctrl-click = copy the row as text.
