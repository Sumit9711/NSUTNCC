// ranks.js — Interactive rank card modal with animations
(function () {
  'use strict';

  const overlay    = document.getElementById('rankModal');
  const modalImg   = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const modalName  = document.getElementById('modalName');
  const modalDli   = document.getElementById('modalDli');
  const modalDesc  = document.getElementById('modalDesc');
  const closeBtn   = document.getElementById('rankModalClose');
  const closeBtnAlt = document.getElementById('rankModalCloseBtn');

  function openModal(card) {
    const rank = card.dataset.rank || '';
    const name = card.dataset.name || '';
    const dli  = card.dataset.dli  || '';
    const desc = card.dataset.desc || '';

    // Pull image src from card's img
    const img = card.querySelector('img');
    modalImg.src = img ? img.src : '';
    modalImg.alt = name;

    modalBadge.textContent = rank;
    modalBadge.className   = 'modal-badge';
    modalName.textContent  = name;
    modalDli.textContent   = dli ? `DLI: ${dli}` : '';
    modalDesc.textContent  = desc;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    setTimeout(() => closeBtn.focus(), 100);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach to all rank cards
  document.querySelectorAll('.rank-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

})();