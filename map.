/**
 * @fileoverview Arcamis — Interactive Map
 *
 * Gestisce tooltip, click sui pin e apertura dei pannelli sub-mappa.
 * Usa event delegation invece di listener per ogni pin (O(1) listener).
 *
 * @module ui/map
 */

import { navigatePage } from '../core/router.js';

const MAP_ID    = 'arcamis-map';
const TOOLTIP_ID = 'map-tip';

export function initMap() {
  const map     = document.getElementById(MAP_ID);
  const tooltip = document.getElementById(TOOLTIP_ID);
  if (!map) return;

  // ── Event delegation sul contenitore ──────────────────────────────────────
  // Un solo listener invece di N (uno per pin) → molto più efficiente.

  map.addEventListener('mouseover',  e => _handleHover(e, map, tooltip));
  map.addEventListener('mouseout',   e => _handleOut(e, tooltip));
  map.addEventListener('click',      e => _handleClick(e));

  // Click sui nodi interni alle sub-mappe (mloc)
  document.querySelectorAll('.mloc').forEach(loc => {
    loc.addEventListener('click', () => {
      const id   = loc.dataset.id;
      const name = loc.dataset.name;
      if (id) navigatePage(id, name, '📍');
    });
  });
}

// ─── Privato ──────────────────────────────────────────────────────────────────

/** @param {MouseEvent} e */
function _handleHover(e, mapEl, tooltip) {
  const pin = e.target.closest('.mpin');
  if (!pin || !tooltip) return;

  document.getElementById('mt-name').textContent = pin.dataset.name   ?? '';
  document.getElementById('mt-desc').textContent = pin.dataset.desc   ?? '';

  const hint = document.getElementById('mt-hint');
  if (hint) {
    hint.textContent = pin.dataset.explored === 'true' ? 'Clicca per aprire' : 'Inesplorato';
  }

  tooltip.classList.add('visible');
  _positionTooltip(pin, mapEl, tooltip);
}

/** @param {MouseEvent} e */
function _handleOut(e, tooltip) {
  if (!e.target.closest('.mpin')) return;
  tooltip?.classList.remove('visible');
}

/** @param {MouseEvent} e */
function _handleClick(e) {
  const pin = e.target.closest('.mpin');
  if (!pin) return;

  const { id, name, sub } = pin.dataset;

  if (sub) {
    _openSubMap(sub);
    return;
  }

  if (id) navigatePage(id, name ?? '', '📍');
}

/** @param {HTMLElement} pin @param {HTMLElement} mapEl @param {HTMLElement} tip */
function _positionTooltip(pin, mapEl, tip) {
  const pr = pin.getBoundingClientRect();
  const mr = mapEl.getBoundingClientRect();
  tip.style.left = `${pr.left - mr.left + pr.width / 2}px`;
  tip.style.top  = `${pr.top  - mr.top  - 10}px`;
}

/** @param {string} subId */
function _openSubMap(subId) {
  // Chiude tutti gli altri prima di aprire
  document.querySelectorAll('.sub-map-panel').forEach(p => p.classList.remove('open'));
  document.getElementById(`sub-${subId}`)?.classList.add('open');
}

/** Esposta globalmente per i bottoni close inline nell'HTML. */
export function closeSubMap(id) {
  if (id) {
    document.getElementById(`sub-${id}`)?.classList.remove('open');
  } else {
    document.querySelectorAll('.sub-map-panel').forEach(p => p.classList.remove('open'));
  }
}

// Retrocompatibilità con onclick inline nell'HTML
window.closeSubMap = closeSubMap;
