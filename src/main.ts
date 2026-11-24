/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems XTM-4 Master Visualizer Suite
 * Vite Application Entrypoint
 */

import '../css/xtm.css';
import { installLocalNetworkFetch } from './core/local-network';
import { initApp } from './app';

// Before anything polls the TAP on localhost (Chrome Local Network Access).
installLocalNetworkFetch();

if (document.readyState === 'loading') {
} else {
  window.initApp = initApp;
}
