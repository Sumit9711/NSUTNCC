/* ============================================================
   ATTENDANCE SYSTEM — attendance.js
   ============================================================ */
(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────────── */
  const S = {
    year:        null,   // cadet year "1"/"2"/"3"
    calYear:     new Date().getFullYear(),
    month:       null,   // 1–12
    sessions:    [],
    sessionId:   null,
    sessionDate: '',
    cadets:      [],     // [{id,name,dli,year,_rank,status}]
    analytics:   null,
  };

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTH_FULL = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

  /* ── STEP MANAGEMENT ────────────────────────────────────── */
  let currentStep = 1;

  window.goToStep = function (n) {
    // Validate prerequisites
    if (n >= 2 && !S.year)   { flashMsg('addSessionMsg','Select a year first','err'); return; }
    if (n >= 3 && !S.month)  { flashMsg('addSessionMsg','Select a month first','err'); return; }
    if (n === 4 && !S.sessionId){ flashMsg('addSessionMsg','Select a session to mark attendance','err'); return; }
    if (n === 5 && !S.month)    { return; }

    document.querySelectorAll('.att-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${n}`).classList.add('active');
    currentStep = n;
    updateStepBar(n);
    updateTabNav(n);

    if (n === 3) loadSessions();
    if (n === 4) loadMarkAttendance();
    if (n === 5) loadAnalytics();
  };

  function updateStepBar(active) {
    document.querySelectorAll('.step-item').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.toggle('active', s === active);
      el.classList.toggle('done',   s < active);
    });
  }

  function updateTabNav(active) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.goto) === active);
    });
  }

  /* ── HEADER CHIPS ───────────────────────────────────────── */
  function updateChips() {
    const cy = document.getElementById('hchipYear');
    const cm = document.getElementById('hchipMonth');
    const cs = document.getElementById('hchipSession');
    if (S.year)  { cy.textContent = `Year ${S.year}`; cy.classList.add('set'); }
    if (S.month) { cm.textContent = `${MONTH_FULL[S.month-1]} ${S.calYear}`; cm.classList.add('set'); }
    if (S.sessionDate){ cs.textContent = S.sessionDate; cs.classList.add('set'); }
  }

  /* ── STEP 1: YEAR SELECTION ─────────────────────────────── */
  document.querySelectorAll('.year-card').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.year-card').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      S.year = this.dataset.year;
      updateChips();
      setTimeout(() => goToStep(2), 280);
    });
  });

  /* ── STEP 2: MONTH SELECTION ────────────────────────────── */
  function buildMonthGrid() {
    document.getElementById('calLabel').textContent = S.calYear;
    const grid = document.getElementById('monthGrid');
    grid.innerHTML = '';
    MONTHS.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'month-btn' + (S.month === i+1 ? ' selected' : '');
      btn.textContent = m;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        S.month = i + 1;
        updateChips();
        setTimeout(() => goToStep(3), 250);
      });
      grid.appendChild(btn);
    });
  }

  document.getElementById('calPrev').addEventListener('click', () => { S.calYear--; buildMonthGrid(); });
  document.getElementById('calNext').addEventListener('click', () => { S.calYear++; buildMonthGrid(); });
  buildMonthGrid();

  /* ── STEP 3: SESSIONS ───────────────────────────────────── */
  async function loadSessions() {
    const res  = await fetch(`/attendance/sessions?year=${S.calYear}&month=${S.month}`);
    S.sessions = await res.json();
    renderSessions();
  }

  function renderSessions() {
    const list  = document.getElementById('sessionsList');
    const badge = document.getElementById('sessionsCountBadge');
    badge.textContent = `${S.sessions.length} session${S.sessions.length !== 1 ? 's' : ''}`;

    if (!S.sessions.length) {
      list.innerHTML = '<div class="empty-state">No sessions yet for this month.</div>';
      return;
    }

    list.innerHTML = '';
    S.sessions.forEach(sess => {
      const row = document.createElement('div');
      row.className = 'session-row' + (sess.id === S.sessionId ? ' selected-session' : '');
      row.innerHTML = `
        <span class="session-date">${sess.date}</span>
        <span class="session-notes">${sess.notes || ''}</span>
        <div class="session-row-btns">
          <button class="session-btn mark">✓ MARK</button>
          <button class="session-btn analytics">📊 STATS</button>
        </div>`;
      row.querySelector('.session-btn.mark').addEventListener('click', () => {
        S.sessionId   = sess.id;
        S.sessionDate = sess.date;
        updateChips();
        goToStep(4);
      });
      row.querySelector('.session-btn.analytics').addEventListener('click', () => {
        S.sessionId   = sess.id;
        S.sessionDate = sess.date;
        goToStep(5);
      });
      list.appendChild(row);
    });
  }

  /* Add session */
  document.getElementById('addSessionBtn').addEventListener('click', async () => {
    const date  = document.getElementById('newSessionDate').value;
    const notes = document.getElementById('newSessionNotes').value;
    if (!date) { flashMsg('addSessionMsg','Please select a date','err'); return; }

    const res  = await fetch('/attendance/sessions/add', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ date, notes })
    });
    const data = await res.json();

    if (data.error) { flashMsg('addSessionMsg', data.error, 'err'); return; }
    flashMsg('addSessionMsg', `Session added: ${date}`, 'ok');
    document.getElementById('newSessionDate').value  = '';
    document.getElementById('newSessionNotes').value = '';
    await loadSessions();
  });

  /* ── STEP 4: MARK ATTENDANCE ────────────────────────────── */
  async function loadMarkAttendance() {
    document.getElementById('markSessionDate').textContent = S.sessionDate || '—';
    document.getElementById('markYear').textContent = `${S.year}${S.year==='1'?'st':S.year==='2'?'nd':'rd'} Year`;

    const res = await fetch(`/attendance/records?session_id=${S.sessionId}&year=${S.year}`);
    S.cadets  = await res.json();
    renderCadetList();
    updateMarkStats();
  }

  function renderCadetList() {
    const list = document.getElementById('cadetAttList');
    list.innerHTML = '';
    if (!S.cadets.length) {
      list.innerHTML = '<div class="empty-state">No cadets found for this year.</div>';
      return;
    }
    S.cadets.forEach((c, idx) => {
      const isPresent = c.status === 'P';
      const row = document.createElement('div');
      row.className = `cadet-att-row${isPresent ? ' present' : ''}`;
      row.style.animationDelay = `${idx * 30}ms`;
      row.dataset.index = idx;
      row.innerHTML = `
        <div class="cadet-left">
          <div class="cadet-att-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="cadet-att-name">${c.name}</div>
            <div class="cadet-att-dli">${c.dli || '—'} ${c._rank ? '· '+c._rank : ''}</div>
          </div>
        </div>
        <div class="cadet-att-status">
          <span class="status-pill">${isPresent ? 'PRESENT' : 'ABSENT'}</span>
          <span class="toggle-icon">${isPresent ? '✓' : '○'}</span>
        </div>`;
      row.addEventListener('click', () => toggleCadet(idx, row));
      list.appendChild(row);
    });
  }

  function toggleCadet(idx, row) {
    const c = S.cadets[idx];
    c.status = c.status === 'P' ? 'A' : 'P';
    row.classList.toggle('present', c.status === 'P');
    row.querySelector('.status-pill').textContent = c.status === 'P' ? 'PRESENT' : 'ABSENT';
    row.querySelector('.toggle-icon').textContent = c.status === 'P' ? '✓' : '○';
    updateMarkStats();
  }

  function updateMarkStats() {
    const present = S.cadets.filter(c => c.status === 'P').length;
    const absent  = S.cadets.length - present;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent  = absent;
    document.getElementById('totalCount').textContent   = S.cadets.length;
  }

  /* Bulk actions */
  document.getElementById('markAllPresent').addEventListener('click', () => {
    S.cadets.forEach(c => c.status = 'P');
    renderCadetList(); updateMarkStats();
  });
  document.getElementById('markAllAbsent').addEventListener('click', () => {
    S.cadets.forEach(c => c.status = 'A');
    renderCadetList(); updateMarkStats();
  });

  /* Submit attendance */
  document.getElementById('submitAttBtn').addEventListener('click', async () => {
    if (!S.sessionId) { flashMsg('submitMsg','No session selected','err'); return; }
    const records = S.cadets.map(c => ({ cadet_id: c.id, status: c.status }));
    const res  = await fetch('/attendance/mark', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ session_id: S.sessionId, records })
    });
    const data = await res.json();
    if (data.error) { flashMsg('submitMsg', data.error, 'err'); return; }
    flashMsg('submitMsg', `✓ Saved attendance for ${data.saved} cadets`, 'ok');
  });

  /* ── STEP 5: ANALYTICS ──────────────────────────────────── */
  let anaData    = [];
  let anaSort    = 'pct';
  let anaFilter  = 'all';

  async function loadAnalytics() {
    if (!S.year || !S.month) return;
    const res  = await fetch(
      `/attendance/analytics?year=${S.calYear}&month=${S.month}&cadet_year=${S.year}`
    );
    const data = await res.json();
    if (data.error) return;

    S.analytics = data;
    anaData     = data.cadets;

    document.getElementById('anaTotalSessions').textContent = data.total_sessions;
    const low  = anaData.filter(c => c.pct < 75).length;
    const top  = anaData.length ? Math.max(...anaData.map(c => parseFloat(c.pct)||0)) : 0;
    document.getElementById('anaLowCount').textContent = low;
    document.getElementById('anaTopPct').textContent   = top + '%';

    renderAnalyticsTable();
  }

  function renderAnalyticsTable() {
    let rows = [...anaData];

    // Filter
    if (anaFilter === 'low')  rows = rows.filter(r => r.pct < 75);
    if (anaFilter === 'top')  rows = rows.filter(r => r.pct >= 90);

    // Sort
    if (anaSort === 'name') rows.sort((a,b) => a.name.localeCompare(b.name));
    else rows.sort((a,b) => (parseFloat(b.pct)||0) - (parseFloat(a.pct)||0));

    const tbody = document.getElementById('analyticsBody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No data for selected filter.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    rows.forEach((r, i) => {
      const pct  = parseFloat(r.pct) || 0;
      const cls  = pct >= 75 ? 'ok' : pct >= 50 ? 'warn' : 'bad';
      const barC = pct >= 75 ? ''   : pct >= 50 ? 'mid'  : 'low';
      const tr   = document.createElement('tr');
      tr.style.animationDelay = `${i * 25}ms`;
      tr.innerHTML = `
        <td style="color:var(--a-dim);font-family:var(--font-m);font-size:.68rem">${i+1}</td>
        <td style="font-weight:600">${r.name}</td>
        <td style="font-family:var(--font-m);font-size:.72rem;color:var(--a-muted)">${r.dli||'—'}</td>
        <td style="font-family:var(--font-m);font-size:.68rem;color:var(--a-dim)">${r._rank||'—'}</td>
        <td style="font-family:var(--font-d);font-size:1rem;color:var(--a-gold)">${r.attended}</td>
        <td style="color:var(--a-muted)">${r.total}</td>
        <td>
          <div class="pct-bar-wrap">
            <div class="pct-bar">
              <div class="pct-bar-fill ${barC}" style="width:0%" data-pct="${pct}"></div>
            </div>
            <span class="pct-num" style="color:var(--a-${barC==='low'?'red-l':barC==='mid'?'gold-l':'green-ok-l'})">${pct}%</span>
          </div>
        </td>
        <td><span class="status-badge ${cls}">${cls==='ok'?'GOOD':cls==='warn'?'AVERAGE':'LOW'}</span></td>`;
      tbody.appendChild(tr);
    });

    // Animate progress bars after paint
    requestAnimationFrame(() => {
      document.querySelectorAll('.pct-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  }

  /* Sort & filter controls */
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      anaSort = this.dataset.sort;
      renderAnalyticsTable();
    });
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      anaFilter = this.dataset.filter;
      renderAnalyticsTable();
    });
  });

  /* ── UTILS ──────────────────────────────────────────────── */
  function flashMsg(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className   = `form-msg ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'form-msg'; }, 4000);
  }

})();