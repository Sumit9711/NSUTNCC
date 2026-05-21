/* ============================================================
   ATTENDANCE SYSTEM v2 — attendance.js
   Dynamic register: year → month → spreadsheet with dates
   ============================================================ */
(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────────────── */
  const S = {
    year:      null,      // '1' | '2' | '3'
    calYear:   new Date().getFullYear(),
    month:     null,      // 1–12
    sessions:  [],        // [{id, date, notes, photo_count}]
    cadets:    [],        // [{id, name, dli, _rank}]
    /* attendance[cadet_id][session_id] = 'P' | 'A' */
    attendance: {},
    /* dirtySessionIds: set of session_ids that have unsaved changes */
    dirty: new Set(),
  };

  const MONTHS      = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTHS_FULL = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

  let currentPhase = 1;

  /* ── PHASE NAVIGATION ──────────────────────────────────────── */
  window.goPhase = function (n) {
    if (n >= 2 && !S.year)  { flash('addSessMsg', 'Select a year first', 'err'); return; }
    if (n >= 3 && !S.month) { flash('addSessMsg', 'Select a month first', 'err'); return; }

    document.querySelectorAll('.att-phase').forEach(p => p.classList.remove('active'));
    document.getElementById(`phase${n}`).classList.add('active');
    currentPhase = n;
    updatePhaseBar(n);

    if (n === 3) initRegister();
  };

  function updatePhaseBar(active) {
    document.querySelectorAll('.phase-item').forEach(el => {
      const p = +el.dataset.phase;
      el.classList.toggle('active', p === active);
      el.classList.toggle('done',   p < active);
    });
  }

  function updateChips() {
    const cy = document.getElementById('hchipYear');
    const cm = document.getElementById('hchipMonth');
    if (S.year)  { cy.textContent = `Year ${S.year}`; cy.classList.add('set'); }
    if (S.month) { cm.textContent = `${MONTHS_FULL[S.month-1]} ${S.calYear}`; cm.classList.add('set'); }
  }

  /* ── PHASE 1: YEAR ─────────────────────────────────────────── */
  document.querySelectorAll('.year-card').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.year-card').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      S.year = this.dataset.year;
      updateChips();
      setTimeout(() => goPhase(2), 300);
    });
  });

  /* ── PHASE 2: MONTH ────────────────────────────────────────── */
  function buildMonthGrid() {
    document.getElementById('calLabel').textContent = S.calYear;
    const grid = document.getElementById('monthGrid');
    grid.innerHTML = '';
    MONTHS.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'mp-btn' + (S.month === i+1 && S.calYear === S.calYear ? ' selected' : '');
      btn.textContent = m;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mp-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        S.month = i + 1;
        updateChips();
        setTimeout(() => goPhase(3), 260);
      });
      grid.appendChild(btn);
    });
  }
  document.getElementById('calPrev').addEventListener('click', () => { S.calYear--; buildMonthGrid(); });
  document.getElementById('calNext').addEventListener('click', () => { S.calYear++; buildMonthGrid(); });
  buildMonthGrid();

  /* ── PHASE 3: REGISTER ─────────────────────────────────────── */
  async function initRegister() {
    document.getElementById('registerTitle').textContent =
      `ATTENDANCE REGISTER — ${MONTHS_FULL[S.month-1].toUpperCase()} ${S.calYear} | YEAR ${S.year}`;

    // Reset
    S.sessions   = [];
    S.cadets     = [];
    S.attendance = {};
    S.dirty      = new Set();

    showTableLoading();

    try {
      const [sessRes, cadetsRes] = await Promise.all([
        fetch(`/attendance/sessions?year=${S.calYear}&month=${S.month}`),
        fetch(`/attendance/cadets?year=${S.year}`)
      ]);

      S.sessions = await sessRes.json();
      S.cadets   = await cadetsRes.json();

      // Fetch all attendance for all sessions in this month for this year
      await fetchAllAttendance();

      buildRegister();
      refreshStats();

    } catch (err) {
      console.error(err);
      showTableError('Failed to load data. Please try again.');
    }
  }

  async function fetchAllAttendance() {
    if (!S.sessions.length || !S.cadets.length) return;

    const promises = S.sessions.map(sess =>
      fetch(`/attendance/records?session_id=${sess.id}&year=${S.year}`)
        .then(r => r.json())
        .then(rows => {
          rows.forEach(row => {
            if (!S.attendance[row.id]) S.attendance[row.id] = {};
            S.attendance[row.id][sess.id] = row.status || 'A';
          });
        })
    );
    await Promise.all(promises);
  }

  /* ── BUILD THE REGISTER TABLE ──────────────────────────────── */
  function buildRegister() {
    const headRow = document.getElementById('registerHeadRow');
    const body    = document.getElementById('registerBody');

    // Re-build header: clear dynamic cols, keep fixed ones, re-add total/pct
    // Remove old date-th's
    headRow.querySelectorAll('.th-date').forEach(el => el.remove());
    headRow.querySelector('.th-total')?.remove();
    headRow.querySelector('.th-pct')?.remove();

    if (!S.sessions.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state-td">No sessions yet. Add a class date above.</td></tr>';
      updateStats(S.cadets.length, 0);
      return;
    }

    // Add date column headers
    S.sessions.forEach(sess => {
      const th = document.createElement('th');
      th.className = 'th-date';
      th.dataset.sessId = sess.id;
      th.innerHTML = buildDateHeaderHTML(sess);
      headRow.appendChild(th);
    });

    // Add total & pct
    const thTotal = document.createElement('th');
    thTotal.className = 'th-total'; thTotal.textContent = 'TOTAL';
    headRow.appendChild(thTotal);
    const thPct = document.createElement('th');
    thPct.className = 'th-pct'; thPct.textContent = 'ATT.%';
    headRow.appendChild(thPct);

    // Build body rows
    body.innerHTML = '';
    if (!S.cadets.length) {
      body.innerHTML = `<tr><td colspan="${6+S.sessions.length}" class="empty-state-td">No cadets found for Year ${S.year}.</td></tr>`;
      return;
    }

    S.cadets.forEach((cadet, idx) => {
      body.appendChild(buildCadetRow(cadet, idx));
    });

    // Attach header button listeners
    attachHeaderListeners();
    // Update totals column
    refreshAllCadetTotals();
  }

  function buildDateHeaderHTML(sess) {
    const dateObj  = new Date(sess.date + 'T00:00:00');
    const display  = dateObj.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    const dayName  = dateObj.toLocaleDateString('en-IN', { weekday:'short' }).toUpperCase();
    const photoCount = sess.photo_count || 0;

    return `
      <div class="th-date-inner">
        <span class="th-date-text">${display}</span>
        <span style="font-size:.55rem;color:var(--a-dim);font-family:var(--font-m)">${dayName}</span>
        ${sess.notes ? `<span class="th-date-notes" title="${sess.notes}">${sess.notes}</span>` : ''}
        <div class="th-date-actions">
          <button class="th-date-bulk-btn" data-action="all-present" data-sess="${sess.id}" title="Mark all present">✓ALL</button>
          <button class="th-date-bulk-btn" data-action="all-absent"  data-sess="${sess.id}" title="Mark all absent">✗ALL</button>
          <button class="th-date-photo-btn" data-action="photos" data-sess="${sess.id}" title="Upload/view photos">📷</button>
        </div>
        ${photoCount > 0 ? `<span class="photo-count-badge">${photoCount}</span>` : ''}
      </div>`;
  }

  function buildCadetRow(cadet, idx) {
    const tr = document.createElement('tr');
    tr.dataset.cadetId = cadet.id;
    tr.style.animationDelay = `${idx * 18}ms`;

    let cells = `
      <td class="td-sno sticky-col"><span class="td-cadet-dli">${idx+1}</span></td>
      <td class="td-name sticky-col-2">
        <div class="td-cadet-name">${esc(cadet.name)}</div>
      </td>
      <td><span class="td-cadet-dli">${esc(cadet.dli || '—')}</span></td>
      <td><span class="td-cadet-rank">${esc(cadet._rank || '—')}</span></td>`;

    S.sessions.forEach(sess => {
      const status = getStatus(cadet.id, sess.id);
      cells += `
        <td class="td-att" data-cadet="${cadet.id}" data-sess="${sess.id}">
          <div class="att-toggle ${status === 'P' ? 'present' : ''}" 
               onclick="toggleCell(${cadet.id}, ${sess.id}, this)"></div>
        </td>`;
    });

    cells += `
      <td class="td-total" id="tot-${cadet.id}">0</td>
      <td class="td-pct"   id="pct-${cadet.id}">—</td>`;

    tr.innerHTML = cells;
    return tr;
  }

  function attachHeaderListeners() {
    document.querySelectorAll('[data-action="all-present"]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); bulkMark(+btn.dataset.sess, 'P'); });
    });
    document.querySelectorAll('[data-action="all-absent"]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); bulkMark(+btn.dataset.sess, 'A'); });
    });
    document.querySelectorAll('[data-action="photos"]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); openPhotoModal(+btn.dataset.sess); });
    });
  }

  /* ── TOGGLE INDIVIDUAL CELL ────────────────────────────────── */
  window.toggleCell = function (cadetId, sessId, el) {
    if (!S.attendance[cadetId]) S.attendance[cadetId] = {};
    const current = S.attendance[cadetId][sessId] || 'A';
    const next    = current === 'P' ? 'A' : 'P';
    S.attendance[cadetId][sessId] = next;
    el.classList.toggle('present', next === 'P');
    S.dirty.add(sessId);
    refreshCadetTotal(cadetId);
    refreshStats();
  };

  /* ── BULK MARK ─────────────────────────────────────────────── */
  function bulkMark(sessId, status) {
    S.cadets.forEach(c => {
      if (!S.attendance[c.id]) S.attendance[c.id] = {};
      S.attendance[c.id][sessId] = status;
    });
    S.dirty.add(sessId);

    // Update DOM
    document.querySelectorAll(`[data-sess="${sessId}"] .att-toggle`).forEach(el => {
      el.classList.toggle('present', status === 'P');
    });
    refreshAllCadetTotals();
    refreshStats();
  }

  /* ── TOTALS ────────────────────────────────────────────────── */
  function refreshCadetTotal(cadetId) {
    const present = S.sessions.filter(sess => getStatus(cadetId, sess.id) === 'P').length;
    const total   = S.sessions.length;
    const pct     = total > 0 ? Math.round(present * 100 / total) : 0;

    const totEl = document.getElementById(`tot-${cadetId}`);
    const pctEl = document.getElementById(`pct-${cadetId}`);
    if (totEl) totEl.textContent = present;
    if (pctEl) {
      pctEl.textContent = total > 0 ? pct + '%' : '—';
      pctEl.className = 'td-pct ' + (pct >= 75 ? 'pct-ok' : pct >= 50 ? 'pct-warn' : 'pct-bad');
    }
  }

  function refreshAllCadetTotals() {
    S.cadets.forEach(c => refreshCadetTotal(c.id));
  }

  function refreshStats() {
    const total    = S.cadets.length;
    const sessions = S.sessions.length;
    let sumPct = 0, lowCount = 0;

    S.cadets.forEach(c => {
      const present = S.sessions.filter(sess => getStatus(c.id, sess.id) === 'P').length;
      const pct     = sessions > 0 ? present * 100 / sessions : 0;
      sumPct += pct;
      if (pct < 75) lowCount++;
    });

    const avg = total > 0 && sessions > 0 ? Math.round(sumPct / total) : null;
    setEl('stTotal',    total);
    setEl('stSessions', sessions);
    setEl('stAvgPct',   avg !== null ? avg + '%' : '—');
    setEl('stLowCount', lowCount);
  }

  function updateStats(cadets, sessions) {
    setEl('stTotal', cadets); setEl('stSessions', sessions);
    setEl('stAvgPct', '—'); setEl('stLowCount', 0);
  }

  /* ── ADD SESSION ────────────────────────────────────────────── */
  document.getElementById('addSessBtn').addEventListener('click', async () => {
    const date  = document.getElementById('newSessDate').value.trim();
    const notes = document.getElementById('newSessNotes').value.trim();
    if (!date) { flash('addSessMsg', 'Please pick a date', 'err'); return; }

    const res  = await fetch('/attendance/sessions/add', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, notes })
    });
    const data = await res.json();
    if (data.error) { flash('addSessMsg', data.error, 'err'); return; }

    flash('addSessMsg', `✓ Session added: ${date}`, 'ok');
    document.getElementById('newSessDate').value  = '';
    document.getElementById('newSessNotes').value = '';

    // Add to state
    S.sessions.push({ id: data.id, date, notes, photo_count: 0 });
    // Init attendance for new session
    S.cadets.forEach(c => {
      if (!S.attendance[c.id]) S.attendance[c.id] = {};
      S.attendance[c.id][data.id] = 'A';
    });
    buildRegister();
    refreshStats();
  });

  /* ── SAVE ALL ───────────────────────────────────────────────── */
  document.getElementById('saveAllBtn').addEventListener('click', async () => {
    if (!S.dirty.size) { flash('saveAllMsg', 'Nothing changed', 'ok'); return; }

    const sessIds = [...S.dirty];
    let saved = 0, errors = 0;

    for (const sessId of sessIds) {
      const records = S.cadets.map(c => ({
        cadet_id: c.id,
        status:   getStatus(c.id, sessId)
      }));
      const res  = await fetch('/attendance/mark', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessId, records })
      });
      const data = await res.json();
      if (data.error) errors++;
      else saved++;
    }

    if (errors === 0) {
      S.dirty.clear();
      flash('saveAllMsg', `✓ Saved ${sessIds.length} session(s)`, 'ok');
    } else {
      flash('saveAllMsg', `${saved} saved, ${errors} failed`, 'err');
    }
  });

  /* ── ANALYTICS MODAL ────────────────────────────────────────── */
  window.openAnalytics = async function () {
    if (!S.year || !S.month) return;

    openModal('analyticsModal');
    document.getElementById('analyticsBody').innerHTML = '<div class="spinner"></div>';

    const res  = await fetch(`/attendance/analytics?year=${S.calYear}&month=${S.month}&cadet_year=${S.year}`);
    const data = await res.json();
    if (data.error) {
      document.getElementById('analyticsBody').innerHTML = `<p class="form-msg err">${data.error}</p>`;
      return;
    }

    const cadets = data.cadets || [];
    const low    = cadets.filter(c => +c.pct < 75).length;
    const top    = cadets.length ? Math.max(...cadets.map(c => +c.pct || 0)) : 0;

    let html = `
      <div class="ana-summary">
        <div class="ana-chip gold">
          <span class="ana-chip-num">${data.total_sessions}</span>
          <span class="ana-chip-lbl">SESSIONS</span>
        </div>
        <div class="ana-chip red">
          <span class="ana-chip-num">${low}</span>
          <span class="ana-chip-lbl">BELOW 75%</span>
        </div>
        <div class="ana-chip green">
          <span class="ana-chip-num">${top}%</span>
          <span class="ana-chip-lbl">TOP ATTENDANCE</span>
        </div>
      </div>
      <table class="ana-table">
        <thead>
          <tr>
            <th>#</th><th>NAME</th><th>DLI</th><th>RANK</th>
            <th>ATTENDED</th><th>TOTAL</th><th>ATTENDANCE %</th><th>STATUS</th>
          </tr>
        </thead>
        <tbody>`;

    cadets.sort((a,b) => (+b.pct||0) - (+a.pct||0)).forEach((r,i) => {
      const pct  = +r.pct || 0;
      const cls  = pct >= 75 ? 'ok' : pct >= 50 ? 'warn' : 'bad';
      const barC = pct >= 75 ? ''   : pct >= 50 ? 'mid'  : 'low';
      html += `
        <tr>
          <td style="color:var(--a-dim);font-family:var(--font-m);font-size:.68rem">${i+1}</td>
          <td style="font-weight:600">${esc(r.name)}</td>
          <td style="font-family:var(--font-m);font-size:.7rem;color:var(--a-muted)">${r.dli||'—'}</td>
          <td style="font-family:var(--font-m);font-size:.66rem;color:var(--a-dim)">${r._rank||'—'}</td>
          <td style="font-family:var(--font-d);font-size:1rem;color:var(--a-gold)">${r.attended}</td>
          <td style="color:var(--a-muted)">${r.total}</td>
          <td>
            <div class="pct-bar-wrap">
              <div class="pct-bar">
                <div class="pct-bar-fill ${barC}" style="width:0%" data-pct="${pct}"></div>
              </div>
              <span class="pct-num ${barC==='low'?'pct-bad':barC==='mid'?'pct-warn':'pct-ok'}">${pct}%</span>
            </div>
          </td>
          <td><span class="ana-badge ${cls}">${cls==='ok'?'GOOD':cls==='warn'?'AVERAGE':'LOW'}</span></td>
        </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('analyticsBody').innerHTML = html;

    requestAnimationFrame(() => {
      document.querySelectorAll('#analyticsBody .pct-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  };

  window.closeAnalytics = function () { closeModal('analyticsModal'); };

  /* ── PHOTO MODAL ─────────────────────────────────────────────── */
  let currentPhotoSession = null;
  let selectedFiles = [];

  window.openPhotoModal = async function (sessId) {
    currentPhotoSession = sessId;
    selectedFiles = [];
    const sess = S.sessions.find(s => s.id === sessId);
    const dateStr = sess ? sess.date : '';
    document.getElementById('photoModalTitle').textContent = `SESSION PHOTOS — ${dateStr}`;
    document.getElementById('uploadPhotosBtn').style.display = 'none';
    document.getElementById('photoUploadMsg').textContent = '';
    document.getElementById('photoFileInput').value = '';

    openModal('photoModal');
    await loadPhotoGallery(sessId);
  };

  window.closePhotoModal = function () {
    closeModal('photoModal');
    currentPhotoSession = null;
    selectedFiles = [];
  };

  async function loadPhotoGallery(sessId) {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '<div class="spinner"></div>';

    try {
      const res  = await fetch(`/attendance/sessions/${sessId}/photos`);
      const data = await res.json();
      renderGallery(data.photos || []);

      // Update photo count badge in header
      const sess = S.sessions.find(s => s.id === sessId);
      if (sess) {
        sess.photo_count = (data.photos || []).length;
        const th = document.querySelector(`[data-sess-id="${sessId}"]`);
        if (th) th.innerHTML = buildDateHeaderHTML(sess);
      }
    } catch(e) {
      gallery.innerHTML = '<p class="form-msg err">Could not load photos.</p>';
    }
  }

  function renderGallery(photos) {
    const gallery = document.getElementById('photoGallery');
    if (!photos.length) {
      gallery.innerHTML = '<p style="font-family:var(--font-m);font-size:.7rem;color:var(--a-dim);text-align:center;padding:1rem">No photos uploaded yet.</p>';
      return;
    }
    gallery.innerHTML = '';
    photos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'photo-thumb';
      div.innerHTML = `
        <img src="${p.url}" alt="Session photo" loading="lazy">
        <div class="photo-thumb-overlay">
          <span>${p.filename}</span>
          <button class="photo-delete-btn" onclick="deletePhoto(${p.id}, ${currentPhotoSession})">✕</button>
        </div>`;
      gallery.appendChild(div);
    });
  }

  window.deletePhoto = async function (photoId, sessId) {
    if (!confirm('Delete this photo?')) return;
    const res  = await fetch(`/attendance/sessions/photos/${photoId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) { flash('photoUploadMsg', data.error, 'err'); return; }
    await loadPhotoGallery(sessId);
  };

  // File input handling
  const fileInput = document.getElementById('photoFileInput');
  const dropZone  = document.getElementById('photoDropZone');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    selectedFiles = Array.from(fileInput.files);
    if (selectedFiles.length) {
      document.getElementById('photoUploadMsg').textContent = `${selectedFiles.length} file(s) selected`;
      document.getElementById('photoUploadMsg').className = 'form-msg ok';
      document.getElementById('uploadPhotosBtn').style.display = 'inline-flex';
    }
  });

  // Drag & drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    selectedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (selectedFiles.length) {
      document.getElementById('photoUploadMsg').textContent = `${selectedFiles.length} file(s) ready`;
      document.getElementById('photoUploadMsg').className = 'form-msg ok';
      document.getElementById('uploadPhotosBtn').style.display = 'inline-flex';
    }
  });

  document.getElementById('uploadPhotosBtn').addEventListener('click', async () => {
    if (!selectedFiles.length || !currentPhotoSession) return;

    const fd = new FormData();
    selectedFiles.forEach(f => fd.append('photos', f));

    flash('photoUploadMsg', 'Uploading...', 'ok');
    const res  = await fetch(`/attendance/sessions/${currentPhotoSession}/photos/upload`, {
      method: 'POST', body: fd
    });
    const data = await res.json();
    if (data.error) { flash('photoUploadMsg', data.error, 'err'); return; }

    flash('photoUploadMsg', `✓ ${data.uploaded} photo(s) uploaded`, 'ok');
    selectedFiles = [];
    document.getElementById('uploadPhotosBtn').style.display = 'none';
    document.getElementById('photoFileInput').value = '';
    await loadPhotoGallery(currentPhotoSession);
  });

  /* ── MODAL HELPERS ───────────────────────────────────────────── */
  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }
  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(el => {
    el.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.remove('open');
        document.body.style.overflow = '';
        currentPhotoSession = null;
        selectedFiles = [];
      }
    });
  });

  /* ── TABLE HELPERS ───────────────────────────────────────────── */
  function showTableLoading() {
    document.getElementById('registerBody').innerHTML =
      '<tr><td colspan="20" class="empty-state-td"><div class="spinner"></div></td></tr>';
  }
  function showTableError(msg) {
    document.getElementById('registerBody').innerHTML =
      `<tr><td colspan="20" class="empty-state-td">${msg}</td></tr>`;
  }

  /* ── UTILS ───────────────────────────────────────────────────── */
  function getStatus(cadetId, sessId) {
    return (S.attendance[cadetId] && S.attendance[cadetId][sessId]) || 'A';
  }
  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function flash(id, msg, type, dur = 4000) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className   = `form-msg ${type}`;
    if (dur > 0) setTimeout(() => { el.textContent = ''; el.className = 'form-msg'; }, dur);
  }
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str; return d.innerHTML;
  }

})();