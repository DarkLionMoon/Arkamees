/**
 * @fileoverview Arcamis — Toast Notifications
 *
 * Funzione pura: crea, anima e rimuove toast dal DOM.
 * Nessuna dipendenza esterna.
 *
 * @module ui/toast
 */

const DEFAULT_DURATION_MS = 3_000;
const ANIMATION_OUT_MS    = 400;

/**
 * Mostra un toast temporaneo.
 * @param {string} text
 * @param {string} [icon='ℹ️']
 * @param {number} [duration=3000]
 */
export function showToast(text, icon = 'ℹ️', duration = DEFAULT_DURATION_MS) {
  const toast = _createToast(text, icon);
  document.body.appendChild(toast);

  // Forza il reflow per triggherare la transizione CSS
  toast.getBoundingClientRect();
  toast.classList.add('vis');

  setTimeout(() => {
    toast.classList.remove('vis');
    setTimeout(() => toast.remove(), ANIMATION_OUT_MS);
  }, duration);
}

/** @returns {HTMLDivElement} */
function _createToast(text, icon) {
  const el = document.createElement('div');
  el.className = 'toast';
  // Usiamo textContent per sicurezza, poi aggiungiamo l'icona come nodo separato
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  const textNode = document.createTextNode(` ${text}`);
  el.appendChild(iconSpan);
  el.appendChild(textNode);
  return el;
}

// Retrocompatibilità con chiamate dirette nell'HTML
window.showToast = showToast;
