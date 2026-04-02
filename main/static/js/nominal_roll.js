/**
 * nominal_roll.js
 * NSUT NCC Nominal Roll Generator
 * Full client-side logic: upload, column config, search, selection, sorting UI, generate
 */
(function () {
  'use strict';

  /* ── STATE ────────────────────────────────────────────────── */
  const state = {
    tempFile: null,
    allCadets: [],        // [{...row data, _rowIdx: n}, ...]
    columns: [],          // all columns from file
    selectedCols: [],     // ordered selected columns
    selectedIds: new Set(), // _rowIdx values
    searchQuery: '',
    sortBy: 'none',
  };

  /* ── ELEMENT REFS ─────────────────────────────────────────── */
  const uploadZone    = document.getElementById('uploadZone');
  const fileInput     = document.getElementById('fileInput');
  const uploadBtn     = document.getElementById('uploadBtn');
  const uploadStatus  = document.getElementById('uploadStatus');
  const uploadFileName= document.getElementById('uploadFileName');
  const uploadCount   = document.getElementById('uploadCount');
  const clearFileBtn  = document.getElementById('clearFileBtn');
  const colList       = document.getElementById('colList');
  const selectAllCols = document.getElementById('selectAllCols');
  const deselectAllCols= document.getElementById('deselectAllCols');
  const serialColCheck= document.getElementById('serialColCheck');
  const cadetGrid     = document.getElementById('cadetGrid');
  const cadetEmpty    = document.getElementById('cadetEmpty');
  const cadetSearch   = document.getElementById('cadetSearch');
  const searchClear   = document.getElementById('searchClear');
  const selectAllCadetsBtn  = document.getElementById('selectAllCadets');
  const deselectAllCadetsBtn= document.getElementById('deselectAllCadets');
  const selCountEl    = document.getElementById('selCount');
  const totalCountEl  = document.getElementById('totalCount');
  const generateBtn   = document.getElementById('generateBtn');
  const generateHint  = document.getElementById('generateHint');
  const generateProgress= document.getElementById('generateProgress');
  const progressFill  = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');

  /* ── TOAST ────────────────────────────────────────────────── */
  function toast(msg, isError = false) {
    let t = document.getElementById('nrToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'nrToast'; t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    void t.offsetWidth;                      // reflow
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ── STEP INDICATOR ───────────────────────────────────────── */
  function setStep(n) {
    document.querySelectorAll('.nr-step').forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.remove('active', 'done');
      if (sn === n) s.classList.add('active');
      else if (sn < n) s.classList.add('done');
    });
  }

  /* ── FILE UPLOAD ──────────────────────────────────────────── */
  uploadBtn.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('click', (e) => {
    if (e.target === uploadZone || e.target.classList.contains('upload-icon') ||
        e.target.classList.contains('upload-main')) fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) processUpload(fileInput.files[0]);
  });

  // Drag & drop
  ['dragenter', 'dragover'].forEach(evt =>
    uploadZone.addEventListener(evt, (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); })
  );
  ['dragleave', 'drop'].forEach(evt =>
    uploadZone.addEventListener(evt, (e) => { e.preventDefault(); uploadZone.classList.remove('drag-over'); })
  );
  uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) processUpload(file);
  });

  clearFileBtn.addEventListener('click', () => resetAll());

  async function processUpload(file) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading…';

    const fd = new FormData();
    fd.append('file', file);

    try {
      const resp = await fetch('/admin/nominal-roll/upload', { method: 'POST', body: fd });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        toast(data.error || 'Upload failed', true);
        return;
      }

      state.tempFile = data.temp_file;
      state.columns = data.columns;
      state.selectedCols = [...data.columns];
      state.allCadets = data.cadets.map((r, i) => ({ ...r, _rowIdx: i }));

      uploadFileName.textContent = file.name;
      uploadCount.textContent = `${data.total} cadet${data.total !== 1 ? 's' : ''} loaded`;
      uploadZone.hidden = true;
      uploadStatus.hidden = false;

      renderColumns();
      renderCadetGrid();
      setStep(2);
      toast(`✓ Loaded ${data.total} cadets from ${file.name}`);

    } catch (err) {
      toast('Network error during upload', true);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Browse File';
    }
  }

  /* ── COLUMN LIST (with drag-to-reorder) ──────────────────── */
  function renderColumns() {
    colList.innerHTML = '';
    if (!state.columns.length) {
      colList.innerHTML = '<p class="empty-hint">Upload a file to see columns</p>';
      return;
    }

    state.selectedCols.forEach((col, idx) => {
      const item = document.createElement('div');
      item.className = 'col-item selected';
      item.draggable = true;
      item.dataset.col = col;
      item.dataset.idx = idx;

      const isSelected = state.selectedCols.includes(col);

      item.innerHTML = `
        <span class="col-drag-handle">⠿</span>
        <input class="col-check" type="checkbox" ${isSelected ? 'checked' : ''} data-col="${col}" title="Include column">
        <span class="col-name" title="${col}">${col}</span>
      `;

      // Checkbox change
      item.querySelector('.col-check').addEventListener('change', (e) => {
        if (!e.target.checked) {
          state.selectedCols = state.selectedCols.filter(c => c !== col);
        } else if (!state.selectedCols.includes(col)) {
          state.selectedCols.push(col);
        }
        item.classList.toggle('selected', e.target.checked);
      });

      // Drag events
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', col);
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
      item.addEventListener('dragover', (e) => {
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-over-item');
      });
      item.addEventListener('dragleave', () => item.classList.remove('drag-over-item'));
      item.addEventListener('drop', (e) => {
        e.preventDefault(); item.classList.remove('drag-over-item');
        const draggedCol = e.dataTransfer.getData('text/plain');
        if (draggedCol === col) return;
        const fromIdx = state.selectedCols.indexOf(draggedCol);
        const toIdx   = state.selectedCols.indexOf(col);
        if (fromIdx === -1 || toIdx === -1) return;
        state.selectedCols.splice(fromIdx, 1);
        state.selectedCols.splice(toIdx, 0, draggedCol);
        renderColumns();
      });

      colList.appendChild(item);
    });

    // Add unchecked columns not in selectedCols
    state.columns.forEach(col => {
      if (state.selectedCols.includes(col)) return;
      const item = document.createElement('div');
      item.className = 'col-item';
      item.draggable = false;
      item.dataset.col = col;
      item.innerHTML = `
        <span class="col-drag-handle" style="opacity:0.2">⠿</span>
        <input class="col-check" type="checkbox" data-col="${col}" title="Include column">
        <span class="col-name" title="${col}">${col}</span>
      `;
      item.querySelector('.col-check').addEventListener('change', (e) => {
        if (e.target.checked && !state.selectedCols.includes(col)) {
          state.selectedCols.push(col);
          renderColumns();
        }
      });
      colList.appendChild(item);
    });
  }

  selectAllCols.addEventListener('click', () => {
    state.selectedCols = [...state.columns];
    renderColumns();
  });
  deselectAllCols.addEventListener('click', () => {
    state.selectedCols = [];
    renderColumns();
  });

  /* ── CADET GRID ───────────────────────────────────────────── */
  function detectFields() {
    // Auto-detect name/DLI/rank column names
    const cols = state.columns.map(c => c.toLowerCase());
    const nameCol = state.columns.find(c => /name/i.test(c)) || state.columns[0] || '';
    const dliCol  = state.columns.find(c => /dli/i.test(c)) || '';
    const rankCol = state.columns.find(c => /rank/i.test(c)) || '';
    return { nameCol, dliCol, rankCol };
  }

  function renderCadetGrid() {
    cadetGrid.innerHTML = '';
    const { nameCol, dliCol, rankCol } = detectFields();
    const q = state.searchQuery.toLowerCase().trim();

    totalCountEl.textContent = state.allCadets.length;

    let visible = 0;
    state.allCadets.forEach(cadet => {
      const name  = String(cadet[nameCol] || '');
      const dli   = String(cadet[dliCol]  || '');
      const rank  = String(cadet[rankCol] || '');
      const isSelected = state.selectedIds.has(cadet._rowIdx);

      // Filter by search
      const matchSearch = !q ||
        name.toLowerCase().includes(q) ||
        dli.toLowerCase().includes(q);

      const item = document.createElement('div');
      item.className = 'cadet-item' + (isSelected ? ' selected' : '') + (matchSearch ? '' : ' hidden');
      item.dataset.rowIdx = cadet._rowIdx;

      item.innerHTML = `
        ${isSelected ? '<span class="cadet-check">✓</span>' : '<span class="cadet-check" style="display:none">✓</span>'}
        <span class="cadet-item-name" title="${name}">${name || '—'}</span>
        <span class="cadet-item-dli" title="${dli}">${dli || '—'}</span>
        ${rank ? `<span class="cadet-item-rank">${rank}</span>` : ''}
      `;

      item.addEventListener('click', () => toggleCadet(cadet._rowIdx, item));
      cadetGrid.appendChild(item);
      if (matchSearch) visible++;
    });

    // Empty state
    if (state.allCadets.length === 0) {
      cadetGrid.innerHTML = `
        <div class="cadet-empty" id="cadetEmpty">
          <div class="cadet-empty-icon">📋</div>
          <p>Upload a file to load cadets</p>
        </div>`;
    } else if (visible === 0 && q) {
      const noRes = document.createElement('div');
      noRes.className = 'cadet-empty'; noRes.style.gridColumn = '1/-1';
      noRes.innerHTML = `<div class="cadet-empty-icon">🔍</div><p>No cadets match "<strong>${q}</strong>"</p>`;
      cadetGrid.appendChild(noRes);
    }

    updateSelCount();
    updateGenerateBtn();
  }

  function toggleCadet(rowIdx, itemEl) {
    if (state.selectedIds.has(rowIdx)) {
      state.selectedIds.delete(rowIdx);
      itemEl.classList.remove('selected');
      itemEl.querySelector('.cadet-check').style.display = 'none';
    } else {
      state.selectedIds.add(rowIdx);
      itemEl.classList.add('selected');
      itemEl.querySelector('.cadet-check').style.display = 'inline';
    }
    updateSelCount();
    updateGenerateBtn();
  }

  function updateSelCount() {
    selCountEl.textContent = state.selectedIds.size;
  }

  /* ── SEARCH ───────────────────────────────────────────────── */
  let searchDebounce;
  cadetSearch.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = cadetSearch.value;
      searchClear.hidden = !cadetSearch.value;
      renderCadetGrid();
    }, 160);
  });

  searchClear.addEventListener('click', () => {
    cadetSearch.value = '';
    state.searchQuery = '';
    searchClear.hidden = true;
    renderCadetGrid();
  });

  /* ── SELECT / DESELECT ALL ────────────────────────────────── */
  selectAllCadetsBtn.addEventListener('click', () => {
    // Only select visible (filtered) cadets
    document.querySelectorAll('.cadet-item:not(.hidden)').forEach(item => {
      const idx = parseInt(item.dataset.rowIdx);
      state.selectedIds.add(idx);
      item.classList.add('selected');
      item.querySelector('.cadet-check').style.display = 'inline';
    });
    updateSelCount(); updateGenerateBtn();
  });

  deselectAllCadetsBtn.addEventListener('click', () => {
    state.selectedIds.clear();
    document.querySelectorAll('.cadet-item').forEach(item => {
      item.classList.remove('selected');
      item.querySelector('.cadet-check').style.display = 'none';
    });
    updateSelCount(); updateGenerateBtn();
  });

  /* ── SORT RADIO ───────────────────────────────────────────── */
  document.querySelectorAll('input[name="sortBy"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.sortBy = radio.value;
    });
  });

  /* ── GENERATE BUTTON ──────────────────────────────────────── */
  function updateGenerateBtn() {
    const ok = state.selectedIds.size > 0 && state.tempFile;
    generateBtn.disabled = !ok;
    generateHint.textContent = ok
      ? `Ready: ${state.selectedIds.size} cadet${state.selectedIds.size !== 1 ? 's' : ''} selected.`
      : 'Select cadets and configure options above.';
  }

  async function animateProgress(duration = 1800) {
    generateProgress.hidden = false;
    progressFill.style.width = '0%';
    progressLabel.textContent = 'Processing…';

    let start = null;
    return new Promise(resolve => {
      function step(ts) {
        if (!start) start = ts;
        const pct = Math.min(((ts - start) / duration) * 90, 90);
        progressFill.style.width = pct + '%';
        if (pct < 90) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  generateBtn.addEventListener('click', async () => {
    if (!state.tempFile) { toast('Please upload a file first', true); return; }
    if (state.selectedIds.size === 0) { toast('Please select at least one cadet', true); return; }

    const cols = state.selectedCols.length > 0 ? state.selectedCols : state.columns;
    if (cols.length === 0) { toast('Please select at least one column', true); return; }

    generateBtn.disabled = true;
    const progressPromise = animateProgress(2000);
    setStep(4);

    try {
      const resp = await fetch('/admin/nominal-roll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_file: state.tempFile,
          selected_ids: Array.from(state.selectedIds),
          columns: cols,
          sort_by: state.sortBy,
          serial_col: serialColCheck.checked,
        }),
      });

      await progressPromise;
      progressFill.style.width = '100%';
      progressLabel.textContent = 'Complete!';

      if (!resp.ok) {
        const err = await resp.json();
        toast(err.error || 'Generation failed', true);
        return;
      }

      // Trigger download
      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = 'NSUT_NCC_Nominal_Roll.xlsx';
      a.click();
      URL.revokeObjectURL(url);

      toast('✓ Nominal Roll downloaded!');

      // Reset state for next generation
      state.tempFile = null;
      setTimeout(() => { generateProgress.hidden = true; progressFill.style.width = '0%'; }, 2000);

    } catch (err) {
      toast('Network error during generation', true);
    } finally {
      generateBtn.disabled = false;
      setTimeout(updateGenerateBtn, 100);
    }
  });

  /* ── RESET ────────────────────────────────────────────────── */
  function resetAll() {
    state.tempFile = null;
    state.allCadets = [];
    state.columns = [];
    state.selectedCols = [];
    state.selectedIds.clear();
    state.searchQuery = '';
    state.sortBy = 'none';

    fileInput.value = '';
    uploadZone.hidden = false;
    uploadStatus.hidden = true;

    colList.innerHTML = '<p class="empty-hint">Upload a file to see columns</p>';
    cadetGrid.innerHTML = `
      <div class="cadet-empty">
        <div class="cadet-empty-icon">📋</div>
        <p>Upload a file to load cadets</p>
      </div>`;

    selCountEl.textContent = '0';
    totalCountEl.textContent = '0';
    cadetSearch.value = '';
    searchClear.hidden = true;
    generateProgress.hidden = true;

    document.querySelector('input[name="sortBy"][value="none"]').checked = true;
    setStep(1);
    updateGenerateBtn();
  }

})();