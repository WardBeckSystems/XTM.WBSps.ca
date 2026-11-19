/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Human-readable YAML profile (.WBS) serialisation, parsing and download. */

import * as yaml from 'js-yaml';
import type { WbsConsoleConfig } from './config-types';

export function configToWbsYaml(config: WbsConsoleConfig): string {
  const yamlBody = yaml.dump(config, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });

  const header = [
    '# ======================================================================',
    '# WARD-BECK SYSTEMS - CONSOLE MASTER CALIBRATION PROFILE (.WBS)',
    '# Hardware Emulation: XTM-4 Mastering Meter & POD-22 Dual LED Bar',
    `# Exported: ${config.timestamp}`,
    '# Compatible with: https://xtm.wbsps.ca/',
    '# ======================================================================\n\n'
  ].join('\n');

  return header + yamlBody;
}

export function downloadYamlText(yamlContent: string, customFilename?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `WBS-Console-Config-${dateStr}.WBS`;

  const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

export function parseWbsYamlText(yamlStr: string): WbsConsoleConfig {
  const loaded = yaml.load(yamlStr);
  if (!loaded || typeof loaded !== 'object') {
    throw new Error('Invalid YAML configuration file format.');
  }
  const c = loaded as Partial<WbsConsoleConfig>;
  if (!c.console && !c.ballistics && !c.scope) {
    throw new Error('Unrecognized WBS configuration structure: missing console, ballistics, or scope blocks.');
  }
  return loaded as WbsConsoleConfig;
}
