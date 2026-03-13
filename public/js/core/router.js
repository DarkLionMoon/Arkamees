/**
 * @fileoverview Arcamis — Client-side Router
 *
 * Responsabilità singola: gestire la navigazione tra Home e pagine Wiki.
 * Usa l'History API per deep-link e back/forward nativi.
 *
 * @module core/router
 */

import { setState, getState, pushRecentPage } from './state.js';

/** @typedef {{ id: string, label: string, icon: string }} PageRef */

// ─── Elementi DOM (risolti una volta sola) ────────────────────────────────────

const _el = {
  get home() { return document.getElementById('hv'); },
  get page() { return document.getElementById('pv'); },
};

// ─── Inizializzazione ─────────────────────────────────────────────────────────

/**
 * Collega il router all'evento popstate e gestisce il deep-link iniziale.
 * Va chiamato una volta sola in main.js.
 */
export function initRouter() {
  window.addEventListener('popstate', _handlePopState);
  _handleDeepLink();
}

// ─── Navigazione pubblica ─────────────────────────────────────────────────────

/**
 * Naviga alla Home.
 */
export function navigateHome() {
  _showHome();
  history.pushState(null, '', location.pathname);
}

/**
 * Naviga a una pagina Wiki.
 * @param {string} id   - Notion page ID (senza trattini)
 * @param {string} label
 * @param {string} icon
 * @param {boolean} [replace=false] - usa replaceState invece di pushState
 */
export function navigatePage(id, label, icon, replace = false) {
  if (!id) {
    console.warn('[Router] navigatePage chiamato senza id');
    return;
  }

  pushRecentPage({ id, title: label, icon });
  setState('currentPageId', id);

  const stateObj = { id, label, icon };
  const url = `${location.pathname}?p=${id}`;

  if (replace) {
    history.replaceState(stateObj, '', url);
  } else {
    history.pushState(stateObj, '', url);
  }

  // Il rendering effettivo è delegato a notion-render (invariato)
  // tramite la funzione globale `gp` che esiste già nel codebase.
  // Questo permette di adottare il router incrementalmente.
  if (typeof window.gp === 'function') {
    window.gp(id, label, icon, true);
  }
}

// ─── Handler interni ──────────────────────────────────────────────────────────

/** @param {PopStateEvent} event */
function _handlePopState(event) {
  if (event.state?.id) {
    navigatePage(event.state.id, event.state.label, event.state.icon, true);
  } else {
    _showHome();
  }
}

function _handleDeepLink() {
  const params = new URLSearchParams(location.search);
  const pid = params.get('p');
  if (!pid) return;

  // Cerca il label nei dati registrati (window.pages da data.js)
  const pageData = window.pages?.find(p => p.id === pid);
  navigatePage(pid, pageData?.l ?? 'Pagina', pageData?.i ?? '📄', true);
}

function _showHome() {
  setState('currentPageId', null);
  const { home, page } = _el;
  if (home) home.style.display = 'block';
  if (page) page.style.display = 'none';
  document.body.classList.remove('page-open');
}
