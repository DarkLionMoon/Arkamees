/**
 * @fileoverview Arcamis — Portal Overlay
 *
 * Gestisce l'overlay del portale Discord.
 * Tiene traccia della lista "recenti" reagendo allo stato.
 *
 * @module ui/overlay
 */

import { subscribe, getState } from '../core/state.js';
import { navigatePage } from '../core/router.js';

const OVERLAY_ID = 'overlay';

export function initOverlay() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return;

  // Apri/chiudi via tasto overlay
  document.getElementById('ovbtn')?.addEventListener('click', _openOverlay);

  // Chiudi cliccando lo sfondo
  overlay.addEventListener('click', e => {
    if (e.target === overlay) _closeOverlay();
  });

  // Reattivo ai cambiamenti dei recenti
  subscribe('recentPages', _renderRecentPages);
  _renderRecentPages(getState('recentPages'));

  // Shortcut tastiera: Shift+Tab
  document.addEventListener('keydown', e => {
    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      overlay.classList.contains('open') ? _closeOverlay() : _openOverlay();
    }
  });

  // Espone `cv()` e `ovo()` per retrocompatibilità con onclick inline HTML
  window.cv  = _closeOverlay;
  window.ovo = _openOverlay;
}

// ─── Privato ──────────────────────────────────────────────────────────────────

function _openOverlay()  { document.getElementById(OVERLAY_ID)?.classList.add('open'); }
function _closeOverlay() { document.getElementById(OVERLAY_ID)?.classList.remove('open'); }

/** @param {import('../core/state.js').RecentPage[]} pages */
function _renderRecentPages(pages) {
  const container = document.getElementById('ov-recenti');
  if (!container) return;

  if (!pages.length) {
    container.innerHTML = '';
    return;
  }

  const frag = document.createDocumentFragment();

  const label = document.createElement('div');
  label.className = 'portal-sh';
  label.textContent = 'Visitati di recente';
  frag.appendChild(label);

  for (const page of pages) {
    const item = document.createElement('div');
    item.className = 'ov-rec-item';

    const icon = document.createElement('span');
    icon.textContent = page.icon;

    const text = document.createTextNode(` ${page.title}`);

    item.appendChild(icon);
    item.appendChild(text);
    item.addEventListener('click', () => {
      _closeOverlay();
      navigatePage(page.id, page.title, page.icon);
    });

    frag.appendChild(item);
  }

  container.replaceChildren(frag);
}
