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

// --- Core ---
import './public/js/core/data.js';   
import { initRouter } from './public/js/core/router.js';
import { state }      from './public/js/core/state.js';

// --- UI ---
import { initTheme }    from './public/js/ui/theme.js';
import { initFont }     from './public/js/ui/fonts.js';      // Corretto con 's'
import { initNav }      from './public/js/ui/nav.js';
import { initSearch }   from './public/js/ui/search.js';
import { initCarousel } from './public/js/ui/carousel.js';
import { initMap }      from './public/js/ui/map.js';
import { initOverlay }  from './public/js/ui/overlay.js';
import { buildWhisperNav, teardownWhisperNav } from './public/js/ui/whispernav.js'; // Tutto minuscolo
import { initLoader, initPullToRefresh, initCopyLink, initFadeInObserver } from './public/js/ui/utils.js';

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
