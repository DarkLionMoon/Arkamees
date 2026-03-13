/**
 * @fileoverview Arcamis — Entry Point
 *
 * Unico punto di inizializzazione dell'app.
 * Nessuna logica qui: solo bootstrap ordinato dei moduli.
 *
 * Ordine di inizializzazione:
 * 1. Dati (sincronizza globali retrocompat.)
 * 2. Core: stato e router
 * 3. UI: tema, font, nav, search, carousel, mappa, overlay, utils
 * 4. Hook per notion-render (afterPageRender)
 *
 * @module main
 */

// ── Core ──────────────────────────────────────────────────────────────────────
import './core/data.js';               // sincronizza window.pages / window.getPage
import { initRouter, navigateHome }   from './core/router.js';

// ── UI ────────────────────────────────────────────────────────────────────────
import { initTheme }           from './ui/theme.js';
import { initFont }            from './ui/fonts.js';
import { initNav }             from './ui/nav.js';
import { initSearch }          from './ui/search.js';
import { initCarousel }        from './ui/carousel.js';
import { initMap }             from './ui/map.js';
import { initOverlay }         from './ui/overlay.js';
import { buildWhisperNav, teardownWhisperNav } from './ui/whispernav.js';
import {
  initLoader,
  initPullToRefresh,
  initCopyLink,
  initFadeInObserver,
} from './ui/utils.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

initLoader();
initTheme();
initFont();
initRouter();
initNav();
initSearch();
initCarousel();
initMap();
initOverlay();
initPullToRefresh();
initCopyLink();
initFadeInObserver();

// ─── Hook notion-render ───────────────────────────────────────────────────────
//
// notion-render.js chiama `window.afterPageRender()` dopo aver iniettato
// il contenuto nel DOM. Lo intercettiamo qui per aggiornare lo stato UI
// senza toccare notion-render.
//
// Pattern: chain of responsibility — se notion-render definisce già
// afterPageRender, la preserviamo.

const _prevAfterPageRender = window.afterPageRender;

window.afterPageRender = function () {
  // Esegui prima la logica originale (se esiste)
  _prevAfterPageRender?.();

  // Mostra la page view, nascondi la home
  const hv = document.getElementById('hv');
  const pv = document.getElementById('pv');
  if (hv) hv.style.display = 'none';
  if (pv) pv.style.display = 'block';
  document.body.classList.add('page-open');

  // Ricostruisci la whisper nav per la nuova pagina
  teardownWhisperNav();
  setTimeout(buildWhisperNav, 300);
};

// Espone navigateHome per i bottoni "Home" inline nell'HTML
window.showHome = navigateHome;

// Espone navigatePage come `gp` (global page) per retrocompatibilità
// con tutti gli onclick nell'HTML esistente
import { navigatePage } from './core/router.js';
window.gp = navigatePage;
