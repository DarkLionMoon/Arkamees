/**
 * @fileoverview Arcamis — Font Size Controller
 * @module ui/font
 */

import { subscribe, getState, stepFontSize } from '../core/state.js';

export function initFont() {
  _applyFontSize(getState('fontSize'));
  subscribe('fontSize', _applyFontSize);

  document.getElementById('font-btn-up')  ?.addEventListener('click', () => stepFontSize(1));
  document.getElementById('font-btn-down')?.addEventListener('click', () => stepFontSize(-1));
}

/** @param {number} scale */
function _applyFontSize(scale) {
  document.documentElement.style.setProperty('--font-scale', scale);
}
