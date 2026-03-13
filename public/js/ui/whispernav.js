/**
 * @fileoverview Arcamis — Whisper Navigation
 *
 * Genera la nav laterale con dot per le sezioni di una pagina wiki.
 * Usa IntersectionObserver per evidenziare la sezione attiva
 * (zero scroll listener → zero jank).
 *
 * @module ui/whisperNav
 */

const NAV_ID           = 'whisper-nav';
const CONTENT_SELECTOR = '.nc';
const HEAD_SELECTORS   = 'h2, h3';
const MIN_HEADINGS     = 2;
const LABEL_MAX_LEN    = 32;
const ACTIVE_CLASS     = 'wn-active';

/** @type {IntersectionObserver|null} */
let _observer = null;

/**
 * Costruisce la whisper nav per la pagina corrente.
 * Va chiamata dopo che il contenuto è stato renderizzato nel DOM.
 */
export function buildWhisperNav() {
  _teardown();

  const headings = [
    ...document.querySelectorAll(`${CONTENT_SELECTOR} ${HEAD_SELECTORS}`)
  ];
  if (headings.length < MIN_HEADINGS) return;

  const nav  = _createNav(headings);
  const dots = [...nav.querySelectorAll('.wn-dot')];

  document.body.appendChild(nav);
  _setupObserver(headings, dots);
}

/**
 * Rimuove la whisper nav e l'observer correnti.
 * Chiamare prima di navigare a una nuova pagina.
 */
export function teardownWhisperNav() {
  _teardown();
}

// ─── Privato ──────────────────────────────────────────────────────────────────

/** @param {Element[]} headings */
function _createNav(headings) {
  const nav = document.createElement('nav');
  nav.id = NAV_ID;

  headings.forEach((h, i) => {
    if (!h.id) h.id = `wsec-${i}`;

    const dot = document.createElement('a');
    dot.className = 'wn-dot';
    dot.href = '#';
    dot.setAttribute('data-label', h.textContent.trim().slice(0, LABEL_MAX_LEN));

    dot.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    nav.appendChild(dot);
  });

  return nav;
}

/**
 * Evidenzia il dot corrispondente alla sezione visibile.
 * @param {Element[]} headings
 * @param {Element[]} dots
 */
function _setupObserver(headings, dots) {
  _observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = headings.indexOf(entry.target);
        if (idx === -1) continue;
        dots.forEach((d, i) => d.classList.toggle(ACTIVE_CLASS, i === idx));
      }
    },
    { rootMargin: '-20% 0px -75% 0px', threshold: 0 }
  );

  headings.forEach(h => _observer.observe(h));
}

function _teardown() {
  _observer?.disconnect();
  _observer = null;
  document.getElementById(NAV_ID)?.remove();
}
