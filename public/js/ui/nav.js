/**
 * @fileoverview Arcamis — Navigation Controller
 *
 * Gestisce: dropdown topbar, mobile nav drawer, bottom nav badges.
 * Pattern: stato locale al modulo, nessuna variabile globale.
 *
 * @module ui/nav
 */

import { subscribe, getState, markChangelogSeen } from '../core/state.js';
import { navigateHome } from '../core/router.js';

// ─── Dropdown ─────────────────────────────────────────────────────────────────

export function initNav() {
  _initDropdowns();
  _initMobileNav();
  _initScrollTop();
  _initChangelogBadge();
  _initHomeButton();
  _bindGlobalFunctions();
}

function _initHomeButton() {
  document.getElementById('tlogo')?.addEventListener('click', navigateHome);
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

function _initDropdowns() {
  // Chiude tutto cliccando fuori
  document.addEventListener('click', e => {
    if (!e.target.closest('.tn-drop')) _closeAllDropdowns();
  });

  // Ogni dropdown apre/chiude al click sul suo trigger
  document.querySelectorAll('.tn-drop').forEach(dd => {
    const trigger = dd.querySelector(':scope > .tn');
    trigger?.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dd.classList.contains('open');
      _closeAllDropdowns();
      if (!isOpen) dd.classList.add('open');
    });
  });
}

function _closeAllDropdowns() {
  document.querySelectorAll('.tn-drop.open').forEach(d => d.classList.remove('open'));
}

// ── Mobile nav ────────────────────────────────────────────────────────────────

function _initMobileNav() {
  document.getElementById('hamburger')?.addEventListener('click', _toggleMobileNav);

  // Chiude cliccando fuori
  document.addEventListener('click', e => {
    const nav = document.getElementById('mobile-nav');
    const hamburger = document.getElementById('hamburger');
    if (nav?.classList.contains('open') &&
        !nav.contains(e.target) &&
        !hamburger?.contains(e.target)) {
      _closeMobileNav();
    }
  });
}

function _toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const isOpen = nav?.classList.toggle('open');
  document.body.classList.toggle('nav-open', isOpen ?? false);
}

function _closeMobileNav() {
  document.getElementById('mobile-nav')?.classList.remove('open');
  document.body.classList.remove('nav-open');
}

// ── Scroll top ────────────────────────────────────────────────────────────────

function _initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

// ── Changelog badge ───────────────────────────────────────────────────────────

function _initChangelogBadge() {
  _renderChangelogBadge(getState('changelogSeen'));
  subscribe('changelogSeen', _renderChangelogBadge);
}

/** @param {boolean} seen */
function _renderChangelogBadge(seen) {
  document.querySelectorAll('.changelog-badge').forEach(b => {
    b.style.display = seen ? 'none' : 'block';
  });
}

// ── Esposizione globale (retrocompatibilità con onclick inline HTML) ───────────

function _bindGlobalFunctions() {
  window.closeDd         = _closeAllDropdowns;
  window.toggleMobileNav = _toggleMobileNav;
  window.closeMobileNav  = _closeMobileNav;
  window.goToTop         = () => {
    document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  window.markChangelogSeen = () => {
    markChangelogSeen();
    _closeMobileNav();
  };
}
