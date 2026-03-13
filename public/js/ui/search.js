/**
 * @fileoverview Arcamis — Search
 *
 * Ricerca fuzzy sui metadati delle pagine.
 * Non accoppiata al DOM: riceve l'input e restituisce risultati.
 *
 * @module ui/search
 */

import { PAGES } from '../core/data.js';
import { navigatePage } from '../core/router.js';

const INPUT_ID  = 'ts';
const RESULTS_ID = 'sr';
const MIN_QUERY_LEN = 2;

export function initSearch() {
  const input   = document.getElementById(INPUT_ID);
  const results = document.getElementById(RESULTS_ID);
  if (!input || !results) return;

  input.addEventListener('input', () => _handleInput(input.value, results));
  input.addEventListener('blur',  () => setTimeout(() => _clearResults(input, results), 200));
}

// ─── Privato ──────────────────────────────────────────────────────────────────

/**
 * @param {string} raw
 * @param {HTMLElement} resultsEl
 */
function _handleInput(raw, resultsEl) {
  const query = raw.trim().toLowerCase();

  if (query.length < MIN_QUERY_LEN) {
    resultsEl.innerHTML = '';
    return;
  }

  const matches = _search(query);
  _renderResults(matches, resultsEl);
}

/**
 * Ricerca case-insensitive su label e chiave.
 * Complessità O(n) — n = ~30 pagine, ampiamente sufficiente.
 * @param {string} query - già lowercased
 */
function _search(query) {
  return PAGES.filter(p =>
    p.l.toLowerCase().includes(query) ||
    p.k.toLowerCase().includes(query)
  );
}

/** @param {import('../core/data.js').PageMeta[]} pages */
function _renderResults(pages, container) {
  if (!pages.length) {
    container.innerHTML = '<div class="sr-empty">Nessun risultato</div>';
    return;
  }

  // DocumentFragment per un singolo reflow
  const frag = document.createDocumentFragment();
  for (const page of pages) {
    const item = document.createElement('div');
    item.className = 'sr-item';
    item.innerHTML = `<span>${page.i}</span> ${_escape(page.l)}`;
    item.addEventListener('click', () => {
      _clearResults(
        document.getElementById(INPUT_ID),
        container
      );
      navigatePage(page.id, page.l, page.i);
    });
    frag.appendChild(item);
  }

  container.replaceChildren(frag);
}

/**
 * @param {HTMLInputElement|null} input
 * @param {HTMLElement} results
 */
function _clearResults(input, results) {
  results.innerHTML = '';
  if (input) input.value = '';
}

/** Previene XSS nel caso i dati vengano modificati esternamente. */
function _escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
