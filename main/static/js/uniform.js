/* ============================================================
   UNIFORM GUIDE — uniform.js
   ============================================================ */
(function () {
  'use strict';

  const PARTS = {
    beret: {
      name: 'Beret Cap', badge: 'HEADGEAR', icon: 'BRT',
      sub: 'Angle & placement guide',
      desc: 'The NCC beret is worn with the badge centered above the left eye. Excess fabric drapes neatly to the right side of the head.',
      steps: [
        'Place the beret so the badge sits 2.5 cm above the left eyebrow.',
        'Pull firmly down so it sits flat on the skull with no gaps.',
        'Drape all excess fabric to the right, just above the right ear.',
        'No hair should be visible from the front or sides.',
        'The beret must be clean and properly shaped before every parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample1',
    },
    hackle: {
      name: 'Hackle', badge: 'HEADGEAR ACCESSORY', icon: 'HCK',
      sub: 'Placement on cap',
      desc: 'The hackle is a decorative plume worn on the right side of the beret or cap for specific corps. Its colour identifies the regiment or wing.',
      steps: [
        'Identify your corps colour — only authorized personnel wear the hackle.',
        'Insert the hackle holder into the beret band on the right side.',
        'The plume should stand upright, angled slightly backward.',
        'Secure tightly so it does not shift during drill movements.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_hackle',
    },
    capbadge: {
      name: 'Cap Badge', badge: 'INSIGNIA', icon: 'CBG',
      sub: 'Centering & polishing',
      desc: 'The cap badge is the NCC emblem worn at the front-center of the beret. It must be polished to a high shine before every parade.',
      steps: [
        'Center the badge horizontally on the front of the beret.',
        'It should sit 2–3 cm above the brim edge.',
        'Fasten the pin firmly through the beret fabric.',
        'Polish with Brasso or metal polish before each parade.',
        'Never wear a tarnished or damaged badge on parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_badge',
    },
    scarf: {
      name: 'Neck Scarf', badge: 'NECKWEAR', icon: 'SCF',
      sub: 'Folding & wearing protocol',
      desc: 'The NCC scarf is folded into a triangle, worn around the neck with the point to the back, and knotted neatly at the front collar.',
      steps: [
        'Fold the scarf diagonally into a neat triangle.',
        'Drape it around the neck with the long edge at the top.',
        'Cross the two ends at the front and tie a single flat knot.',
        'The knot sits at the base of the throat, perfectly centered.',
        'Tuck any excess fabric under the shirt collar.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample5',
    },
    shoulder: {
      name: 'Cadet Rank', badge: 'RANK INSIGNIA', icon: 'RNK',
      sub: 'Shoulder epaulette placement',
      desc: 'Shoulder rank insignia indicate the cadet\'s rank and must be positioned precisely on both shoulders at equal height, flush with the sleeve seam.',
      steps: [
        'Slide the epaulette onto the shoulder strap of the shirt.',
        'Position it 1 cm below the shoulder seam.',
        'Ensure both sides are at equal height — measure if unsure.',
        'The rank slide must be centered on the strap, not tilted.',
        'Polish any metal rank pips before parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample2',
    },
    lanyard: {
      name: 'Lace Yard (Lanyard)', badge: 'CORD', icon: 'LNY',
      sub: 'Wing-based looping guide',
      desc: 'The lanyard colour depends on your wing. It loops from the left shoulder epaulette, under the arm, and fastens to the second shirt button.',
      steps: [
        'Identify your wing colour: Army (green), Navy (blue), Air (sky blue).',
        'Loop the lanyard over the left shoulder epaulette.',
        'Bring it across the chest, under the left arm.',
        'Loop back to the front and clip to the second shirt button.',
        'Ensure the cord lies flat with no twists or tangles.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample3',
    },
    nameplate: {
      name: 'Name Plate', badge: 'IDENTIFICATION', icon: 'NMP',
      sub: 'Correct chest positioning',
      desc: 'The nameplate is placed on the right chest pocket, centered horizontally, sitting directly above the pocket flap.',
      steps: [
        'Center the nameplate horizontally above the right chest pocket.',
        'Position 3 mm above the top edge of the pocket flap.',
        'Text must be horizontal — not tilted in any direction.',
        'Pin or clip firmly so it does not shift during drill.',
        'Ensure the nameplate is clean and text is clearly legible.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample7',
    },
    nccshield: {
      name: 'NCC Shield', badge: 'EMBLEM', icon: 'SHD',
      sub: 'Placement on uniform',
      desc: 'The NCC Shield (or Corps badge) is worn on the left chest or sleeve as specified by the unit. It identifies the NCC Corps and wing.',
      steps: [
        'Sew the NCC shield on the left sleeve, 5 cm below the shoulder seam.',
        'Alternatively, pin to the left chest as per unit instructions.',
        'Ensure it is perfectly horizontal and wrinkle-free.',
        'Iron the sleeve flat before attaching the shield.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_shield',
    },
    shirt: {
      name: 'Shirt', badge: 'UNIFORM TOP', icon: 'SRT',
      sub: 'Pressing & wearing standard',
      desc: 'The NCC khaki shirt must be starched and pressed with sharp creases on both sleeves and down the front placket before every parade.',
      steps: [
        'Wash and starch the shirt the day before parade.',
        'Iron sharp vertical creases on both sleeves.',
        'Iron the front placket flat — buttons must be centered.',
        'Tuck the shirt firmly into the trouser before buckling the belt.',
        'All buttons must be fastened including the collar button on parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_shirt',
    },
    shatses: {
      name: 'Shatses (Webbing)', badge: 'WEBBING', icon: 'SHT',
      sub: 'Fitting cross-body webbing',
      desc: 'Shatses is the cross-body webbing or shoulder strap system worn over the shirt. It must be adjusted to sit flat and symmetric across the chest.',
      steps: [
        'Put on the shirt and belt first before fitting shatses.',
        'Clip the shatses onto the belt at the front and back.',
        'Adjust the shoulder straps so they cross symmetrically at the chest.',
        'There should be no slack — straps must be taut but not constricting.',
        'Brush and clean the webbing before parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_webbing',
    },
    belt: {
      name: 'Belt with Buckle', badge: 'WAIST', icon: 'BLT',
      sub: 'Centering & polishing buckle',
      desc: 'The NCC white web belt is worn at the natural waist. The brass buckle must be centered with the shirt placket and polished to a mirror shine.',
      steps: [
        'Thread the belt through all trouser loops before tucking shirt.',
        'Center the brass buckle with the shirt button line.',
        'Tighten so the belt is firm but allows comfortable breathing.',
        'The free end points to the left after buckling.',
        'Polish the brass buckle to a mirror shine before every parade.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample4',
    },
    jhaltan: {
      name: 'Jhaltan / Paltu', badge: 'UNIFORM FLAP', icon: 'JHT',
      sub: 'Shirt flap protocol',
      desc: 'Jhaltan refers to the shirt flap that hangs over the belt on the left side. It must be neatly folded and tucked, or left hanging as per unit orders.',
      steps: [
        'After tucking the shirt, pull out the left flap as per orders.',
        'The flap should hang straight and evenly — not bunched.',
        'Iron the flap flat before parade so it falls cleanly.',
        'During formal parade the flap is typically tucked in fully.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_jhaltan',
    },
    kumerband: {
      name: 'Kamar Band (Kumerband)', badge: 'WAISTBAND', icon: 'KMB',
      sub: 'Pleats must face downward',
      desc: 'The kumerband is a pleated fabric waistband worn over the shirt for formal occasions. All pleats must face downward — this is a strict protocol.',
      steps: [
        'Wrap the kumerband around the natural waist over the shirt.',
        'Ensure ALL pleats are facing downward — upward pleats are a violation.',
        'The band must fully cover the trouser waistband.',
        'Hook or velcro securely at the back, centered on the spine.',
        'It should be firm but allow full breathing without strain.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample11',
    },
    gloves: {
      name: 'Gloves', badge: 'HANDWEAR', icon: 'GLV',
      sub: 'Ceremonial drill standard',
      desc: 'White cotton gloves are worn for ceremonial parades and guard of honour. They must be spotlessly clean and fit snugly without creasing.',
      steps: [
        'Wash and press gloves before every ceremonial parade.',
        'Pull each glove on from the wrist, smoothing out any creases.',
        'The glove cuff should overlap the shirt cuff by 1 cm.',
        'During drill, fingers must remain together and perfectly straight.',
        'Remove gloves only after the dismissal order is given.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample8',
    },
    trouser: {
      name: 'Trouser', badge: 'UNIFORM BOTTOM', icon: 'TRS',
      sub: 'Creasing & length standard',
      desc: 'NCC khaki trousers must have sharp front creases and be hemmed so the bottom edge just touches the top of the boot.',
      steps: [
        'Wash, starch and iron sharp front creases before parade.',
        'The trouser hem should touch the top of the DMS boot.',
        'Ensure the fly is straight and buttoned fully.',
        'Belt loops must all be occupied before putting on the belt.',
        'No bunching or bagginess at the knees or ankles.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample_trouser',
    },
    spade: {
      name: 'Spade / Anklet', badge: 'FIELD EQUIPMENT', icon: 'SPD',
      sub: 'Carrying & attaching guide',
      desc: 'The entrenching spade is carried during field camps. Anklets are worn around the boot-trouser junction to create a neat tuck.',
      steps: [
        'For anklets: wrap around the trouser bottom above the boot.',
        'Fasten so the trouser is tucked neatly inside the boot.',
        'For the spade: fold the blade 90° and lock the hinge.',
        'Insert into the canvas carrier with the handle pointing down.',
        'Attach the carrier to the left side of the webbing belt.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample9',
    },
    dms: {
      name: 'DMS Shoe', badge: 'FOOTWEAR', icon: 'DMS',
      sub: 'Polishing & lacing guide',
      desc: 'Direct Moulded Sole (DMS) boots are standard NCC footwear. They must be polished to a mirror-glass shine with straight-bar military lacing.',
      steps: [
        'Remove all mud and dust with a dry brush before polishing.',
        'Apply black shoe polish in circular motions with a cloth.',
        'Buff with a soft brush until a mirror-glass shine is achieved.',
        'Lace using the straight-bar pattern — all rows must be horizontal.',
        'Tuck the bow knot inside the lacing after tying.',
      ],
      tutorial: 'https://www.youtube.com/watch?v=sample10',
    },
  };

  /* ── DOM ─────────────────────────────────────────────────── */
  const pins         = document.querySelectorAll('.hotspot-pin');
  const panelDefault = document.getElementById('panelDefault');
  const panelDetail  = document.getElementById('panelDetail');
  const panelBackBtn = document.getElementById('panelBackBtn');
  const detailBadge  = document.getElementById('detailBadge');
  const detailTitle  = document.getElementById('detailTitle');
  const detailDesc   = document.getElementById('detailDesc');
  const detailSteps  = document.getElementById('detailSteps');
  const detailTutBtn = document.getElementById('detailTutorialBtn');
  const chipsWrap    = document.getElementById('partsChipList');
  const allPartsGrid = document.getElementById('allPartsGrid');

  /* ── OPEN ────────────────────────────────────────────────── */
  function openPart(key) {
    const d = PARTS[key];
    if (!d) return;

    // highlight pins
    pins.forEach(p => p.classList.toggle('active', p.dataset.part === key));

    detailBadge.textContent = d.badge;
    detailTitle.textContent = d.name;
    detailDesc.textContent  = d.desc;
    detailTutBtn.href       = d.tutorial;

    detailSteps.innerHTML = d.steps.map((s,i) => `
      <div class="step-item" style="animation-delay:${i*65}ms">
        <div class="step-num">${i+1}</div><span>${s}</span>
      </div>`).join('');

    panelDefault.style.display = 'none';
    panelDetail.removeAttribute('hidden');
    panelDetail.classList.remove('panel-entering');
    void panelDetail.offsetWidth;
    panelDetail.classList.add('panel-entering');

    if (window.innerWidth < 960) {
      document.getElementById('uniPanel')
        .scrollIntoView({ behavior:'smooth', block:'start' });
    }
  }

  function closePart() {
    pins.forEach(p => p.classList.remove('active'));
    panelDetail.setAttribute('hidden','');
    panelDefault.style.display = '';
  }

  /* ── BIND PINS ───────────────────────────────────────────── */
  pins.forEach(pin => {
    pin.addEventListener('click', () => openPart(pin.dataset.part));
    pin.addEventListener('keydown', e => {
      if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openPart(pin.dataset.part); }
    });
  });

  panelBackBtn.addEventListener('click', closePart);

  /* ── CHIPS ───────────────────────────────────────────────── */
  if (chipsWrap) {
    Object.entries(PARTS).forEach(([key, d]) => {
      const c = document.createElement('span');
      c.className   = 'parts-chip';
      c.textContent = d.name;
      c.addEventListener('click', () => openPart(key));
      chipsWrap.appendChild(c);
    });
  }

  /* ── ALL PARTS GRID ──────────────────────────────────────── */
  if (allPartsGrid) {
    Object.entries(PARTS).forEach(([key, d], idx) => {
      const card = document.createElement('div');
      card.className = 'part-card';
      card.style.setProperty('--card-index', idx);
      card.setAttribute('tabindex','0');
      card.innerHTML = `
        <div class="part-card-icon">${d.icon}</div>
        <div class="part-card-text">
          <h3 class="part-card-name">${d.name}</h3>
          <p class="part-card-sub">${d.sub}</p>
        </div>
        <div class="part-card-arrow">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M8 5l3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </div>`;
      card.addEventListener('click', () => {
        openPart(key);
        document.getElementById('uniPanel')
          .scrollIntoView({ behavior:'smooth', block:'start' });
      });
      card.addEventListener('keydown', e => { if(e.key==='Enter') openPart(key); });
      allPartsGrid.appendChild(card);
    });
  }

  /* ── SCROLL REVEAL ───────────────────────────────────────── */
  const targets = document.querySelectorAll('.reveal-item, .part-card, .all-parts-header');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.style.getPropertyValue('--card-index')||0);
        setTimeout(() => e.target.classList.add('revealed'), idx * 50);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  targets.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('revealed');
    } else { io.observe(el); }
  });

})();