/**
 * @fileoverview Arcamis — Theme Controller
 *
 * Si iscrive allo stato `theme` e aggiorna il DOM di conseguenza.
 * Nessun accesso diretto a localStorage: quello lo fa state.js.
 *
 * @module ui/theme
 */

import { subscribe, getState, toggleTheme } from '../core/state.js';

const TOGGLE_BTN_ID = 'theme-toggle';

/**
 * Inizializza il tema: applica lo stato corrente e si iscrive ai cambiamenti.
 * Collega il bottone del toggle se presente.
 */
export function initTheme() {
  // Applica subito senza aspettare un evento
  _applyTheme(getState('theme'));

  // Reagisce ai cambiamenti futuri
  subscribe('theme', _applyTheme);

  // Wiring del bottone (idempotente)
  const btn = document.getElementById(TOGGLE_BTN_ID);
  btn?.addEventListener('click', toggleTheme);
}

// ─── Privato ──────────────────────────────────────────────────────────────────

/** @param {'dark'|'light'} theme */
function _applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');

  const btn = document.getElementById(TOGGLE_BTN_ID);
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}
