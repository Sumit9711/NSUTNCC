/**
 * main.js — NSUT NCC Global JS
 * Handles: navbar scroll, hamburger, scroll animations
 */
(function () {
  'use strict';

  /* ── NAVBAR SCROLL EFFECT ──────────────────────────── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── HAMBURGER MENU ────────────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks   = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) navLinks.classList.remove('open');
    });
    // Close on nav link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ── SCROLL REVEAL ANIMATIONS ──────────────────────── */
  const animatables = document.querySelectorAll('[data-animate]');
  if (animatables.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animatables.forEach(el => observer.observe(el));
  }

  /* ── PAGE TRANSITION ───────────────────────────────── */
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.hostname === location.hostname &&
        !link.href.includes('#') &&
        !link.target) {
      link.addEventListener('click', (e) => {
        const main = document.getElementById('pageMain');
        if (main) {
          e.preventDefault();
          main.style.opacity = '0';
          main.style.transform = 'translateY(10px)';
          main.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          setTimeout(() => { location.href = link.href; }, 220);
        }
      });
    }
  });

})();