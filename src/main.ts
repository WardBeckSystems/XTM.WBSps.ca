/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems XTM-4 Master Visualizer Suite
 * Vite Application Entrypoint
 */

import '../css/xtm.css';
import { initApp } from './app';

if (document.readyState === 'loading') {
} else {
  window.initApp = initApp;
}
