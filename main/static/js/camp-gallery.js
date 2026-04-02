/* ============================================================
   CAMPS GALLERY SYSTEM — camps-gallery.js
   Lightbox · Scroll Reveal · Keyboard Nav · Page Transitions
   ============================================================ */

(function () {
  'use strict';

  /* ── SCROLL REVEAL ─────────────────────────────────────── */
  function initScrollReveal() {
  const cards = document.querySelectorAll('.reveal-card');
  if (!cards.length) return;

  // Immediately reveal cards already in viewport
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      card.classList.add('revealed');
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );

  cards.forEach((card) => io.observe(card));
}

  /* ── PAGE TRANSITIONS (camps ↔ gallery) ─────────────────── */
  function initPageTransitions() {
    const links = document.querySelectorAll('a.camp-card, a.back-btn');

    links.forEach((link) => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href.startsWith('#') || e.ctrlKey || e.metaKey) return;

        e.preventDefault();
        const page = document.querySelector('.camps-page, .gallery-page');
        if (page) {
          page.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          page.style.opacity = '0';
          page.style.transform = 'translateY(-10px)';
          setTimeout(() => { window.location.href = href; }, 300);
        } else {
          window.location.href = href;
        }
      });
    });
  }

  /* ── LIGHTBOX ───────────────────────────────────────────── */
  function initLightbox() {
    const galleryImgs = document.querySelectorAll('.gallery-img');
    if (!galleryImgs.length) return;

    const lightbox     = document.getElementById('lightbox');
    const lbBackdrop   = document.getElementById('lightboxBackdrop');
    const lbImg        = document.getElementById('lightboxImg');
    const lbClose      = document.getElementById('lightboxClose');
    const lbPrev       = document.getElementById('lightboxPrev');
    const lbNext       = document.getElementById('lightboxNext');
    const lbCounter    = document.getElementById('lightboxCounter');
    const lbImgWrap    = document.getElementById('lightboxImgWrap');

    if (!lightbox || !lbImg) return;

    // Build ordered image list from the grid data attribute
    const grid = document.getElementById('masonryGrid');
    let images = [];
    if (grid && grid.dataset.images) {
      try {
        images = JSON.parse(grid.dataset.images);
      } catch (_) {}
    }
    if (!images.length) {
      galleryImgs.forEach((img) => images.push(img.src));
    }

    let currentIndex = 0;

    /* Open */
    function openLightbox(index) {
      currentIndex = index;
      lbImg.src = images[currentIndex];
      lbImg.alt = `Camp photo ${currentIndex + 1}`;
      updateCounter();
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';

      // Trigger open animation next frame
      requestAnimationFrame(() => {
        lightbox.classList.add('open');
      });
    }

    /* Close */
    function closeLightbox() {
      lightbox.classList.remove('open');
      setTimeout(() => {
        lightbox.setAttribute('hidden', '');
        document.body.style.overflow = '';
        lbImg.src = '';
      }, 380);
    }

    /* Navigate */
    function navigate(dir) {
      currentIndex = (currentIndex + dir + images.length) % images.length;
      // Fade the image during swap
      lbImgWrap.style.opacity = '0';
      lbImgWrap.style.transform = `scale(0.94) translateX(${dir * -20}px)`;
      setTimeout(() => {
        lbImg.src = images[currentIndex];
        lbImg.alt = `Camp photo ${currentIndex + 1}`;
        updateCounter();
        lbImgWrap.style.transition = 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        lbImgWrap.style.opacity = '1';
        lbImgWrap.style.transform = 'scale(1) translateX(0)';
      }, 200);
    }

    function updateCounter() {
      if (lbCounter) {
        lbCounter.textContent = `${currentIndex + 1} / ${images.length}`;
      }
    }

    /* Bind gallery images */
    galleryImgs.forEach((img) => {
      img.addEventListener('click', () => {
        const idx = parseInt(img.dataset.index, 10) || 0;
        openLightbox(idx);
      });
    });

    /* Controls */
    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    /* Keyboard */
    document.addEventListener('keydown', (e) => {
      if (lightbox.hasAttribute('hidden')) return;
      switch (e.key) {
        case 'ArrowLeft':  navigate(-1);    break;
        case 'ArrowRight': navigate(1);     break;
        case 'Escape':     closeLightbox(); break;
      }
    });

    /* Touch / swipe support */
    let touchStartX = 0;
    lbImgWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lbImgWrap.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ── CARD TILT EFFECT ───────────────────────────────────── */
  function initCardTilt() {
    const cards = document.querySelectorAll('.camp-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 → 0.5
        const y = (e.clientY - rect.top)  / rect.height - 0.5;

        card.style.transform = `
          translateY(-8px)
          rotateX(${(-y * 6).toFixed(2)}deg)
          rotateY(${(x * 6).toFixed(2)}deg)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    initScrollReveal();
    initPageTransitions();
    initLightbox();
    initCardTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();