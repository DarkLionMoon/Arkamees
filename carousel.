/**
 * @fileoverview Arcamis — Hero Carousel
 *
 * Gestisce lo slider hero: navigazione manuale, auto-avanzamento
 * e aggiornamento dei dot. Pulisce il proprio interval quando smontato.
 *
 * @module ui/carousel
 */

const AUTO_INTERVAL_MS = 6_000;

const SELECTORS = Object.freeze({
  SLIDE:   '.slide',
  DOT:     '.cdot',
  DOT_ACTIVE: 'ca',
  SLIDE_ACTIVE: 'active',
  PREV:    '#cprev',
  NEXT:    '#cnext',
});

/**
 * Inizializza il carousel e restituisce una funzione di cleanup.
 * @returns {() => void} teardown
 */
export function initCarousel() {
  const slides = [...document.querySelectorAll(SELECTORS.SLIDE)];
  const dots   = [...document.querySelectorAll(SELECTORS.DOT)];

  if (slides.length === 0) return () => {};

  let currentIndex = 0;

  // ── Navigazione ────────────────────────────────────────────────────────────

  function goTo(index) {
    slides[currentIndex].classList.remove(SELECTORS.SLIDE_ACTIVE);
    dots[currentIndex]  ?.classList.remove(SELECTORS.DOT_ACTIVE);

    currentIndex = ((index % slides.length) + slides.length) % slides.length;

    slides[currentIndex].classList.add(SELECTORS.SLIDE_ACTIVE);
    dots[currentIndex]  ?.classList.add(SELECTORS.DOT_ACTIVE);
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  // ── Event listeners ────────────────────────────────────────────────────────

  document.querySelector(SELECTORS.NEXT)?.addEventListener('click', () => {
    resetInterval();
    next();
  });

  document.querySelector(SELECTORS.PREV)?.addEventListener('click', () => {
    resetInterval();
    prev();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      resetInterval();
      goTo(i);
    });
  });

  // Espone jumpToSlide per il click inline nell'HTML (retrocompatibilità)
  window.jumpToSlide = (i) => { resetInterval(); goTo(i); };
  window.changeSlide = (dir) => { resetInterval(); goTo(currentIndex + dir); };

  // ── Auto-avanzamento ───────────────────────────────────────────────────────

  let intervalId = setInterval(next, AUTO_INTERVAL_MS);

  function resetInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(next, AUTO_INTERVAL_MS);
  }

  // Pausa quando il tab non è visibile (risparmio CPU)
  function onVisibilityChange() {
    if (document.hidden) {
      clearInterval(intervalId);
    } else {
      intervalId = setInterval(next, AUTO_INTERVAL_MS);
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
