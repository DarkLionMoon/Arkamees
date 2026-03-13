/**
 * @fileoverview Arcamis — Utility Behaviors
 *
 * Piccole feature autonome che non appartengono ad altri moduli:
 * - Pull-to-refresh (mobile)
 * - Copy page link
 * - Fade-in scroll observer
 * - Loader hide
 *
 * @module ui/utils
 */

import { showToast } from './toast.js';

// ─── Loader ────────────────────────────────────────────────────────────────────

export function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('site-loader')?.classList.add('hidden');
    }, 500);
  });
}

// ─── Pull-to-refresh ──────────────────────────────────────────────────────────

const PTR_THRESHOLD_PX = 60;

export function initPullToRefresh() {
  const indicator = document.getElementById('ptr-indicator');
  let startY    = 0;
  let isPulling = false;

  document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!startY) return;
    if (e.touches[0].clientY - startY > PTR_THRESHOLD_PX) {
      isPulling = true;
      indicator?.classList.add('visible');
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (isPulling) location.reload();
    isPulling = false;
    startY    = 0;
    indicator?.classList.remove('visible');
  });
}

// ─── Copy page link ────────────────────────────────────────────────────────────

export function initCopyLink() {
  window.copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast('Link copiato', '🔗', 2_400);
    } catch {
      // Fallback per browser senza Clipboard API
      showToast('Copia manuale: ' + location.href, '🔗', 4_000);
    }
  };
}

// ─── Fade-in on scroll ────────────────────────────────────────────────────────

export function initFadeInObserver() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target); // osserva solo una volta
      }
    }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}
