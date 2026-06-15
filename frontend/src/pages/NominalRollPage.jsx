import { useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { nominalRollApi } from '../utils/api'

export default function NominalRollPage() {
  // --- STATE ---
  const [step, setStep] = useState(1) // 1: Upload, 2: Configure/Select, 3: Generate
  const [loading, setLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [progress, setProgress] = useState({ active: false, fill: 0, label: '' })

  const [fileName, setFileName] = useState('')
  const [tempFile, setTempFile] = useState(null)
  const [allCadets, setAllCadets] = useState([]) // [{...row, _rowIdx: n}]
  const [columns, setColumns] = useState([]) // all columns from file
  const [selectedCols, setSelectedCols] = useState([]) // ordered active columns
  const [selectedIds, setSelectedIds] = useState(new Set()) // row index numbers
  const [serialCol, setSerialCol] = useState(true)
  const [sortBy, setSortBy] = useState('none')
  const [searchTerm, setSearchTerm] = useState('')

  const fileInputRef = useRef(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', isError: false })

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError })
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false })
    }, 4000)
  }

  // --- DETECT COLUMNS FOR CARD RENDER ---
  const autoFields = useMemo(() => {
    if (columns.length === 0) return { nameCol: '', dliCol: '', rankCol: '' }
    const nameCol = columns.find(c => /name/i.test(c)) || columns[0] || ''
    const dliCol = columns.find(c => /dli/i.test(c)) || ''
    const rankCol = columns.find(c => /rank/i.test(c)) || ''
    return { nameCol, dliCol, rankCol }
  }, [columns])

  // --- FILTER CADETS BY SEARCH ---
  const filteredCadets = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return allCadets
    return allCadets.filter((cadet) => {
      const name = String(cadet[autoFields.nameCol] || '').toLowerCase()
      const dli = String(cadet[autoFields.dliCol] || '').toLowerCase()
      return name.includes(q) || dli.includes(q)
    })
  }, [allCadets, searchTerm, autoFields])

  // --- FILE SELECTION & UPLOAD ---
  const triggerBrowse = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) uploadFile(file)
  }

  const handleDragOverFile = (e) => {
    e.preventDefault()
  }

  const handleDropFile = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const uploadFile = async (file) => {
    setLoading(true)
    try {
      const data = await nominalRollApi.upload(file)
      setTempFile(data.temp_file)
      setColumns(data.columns)
      setSelectedCols([...data.columns])
      const cadetsWithIdx = data.cadets.map((r, i) => ({ ...r, _rowIdx: i }))
      setAllCadets(cadetsWithIdx)
      setFileName(file.name)
      // Auto select all visible cadets
      setSelectedIds(new Set(cadetsWithIdx.map((c) => c._rowIdx)))
      setStep(2)
      showToast(`✓ Loaded ${data.total} cadets from ${file.name}`)
    } catch (err) {
      console.error('Upload error:', err)
      showToast(err.message || 'File upload failed.', true)
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setTempFile(null)
    setColumns([])
    setSelectedCols([])
    setAllCadets([])
    setFileName('')
    setSelectedIds(new Set())
    setSearchTerm('')
    setSortBy('none')
    setStep(1)
  }

  // --- COLUMN MANAGEMENT (Reordering & Selection) ---
  const handleColCheckboxChange = (col, checked) => {
    if (checked) {
      if (!selectedCols.includes(col)) {
        setSelectedCols([...selectedCols, col])
      }
    } else {
      setSelectedCols(selectedCols.filter((c) => c !== col))
    }
  }

  const selectAllColumns = () => {
    setSelectedCols([...columns])
  }

  const deselectAllColumns = () => {
    setSelectedCols([])
  }

  // Column Drag and Drop
  const handleDragStart = (idx) => {
    setDraggedIndex(idx)
  }

  const handleDrop = (targetIdx) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return
    const reordered = [...selectedCols]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIdx, 0, draggedItem)
    setSelectedCols(reordered)
    setDraggedIndex(null)
  }

  // --- CADET SELECTION ---
  const toggleCadet = (idx) => {
    const nextSet = new Set(selectedIds)
    if (nextSet.has(idx)) {
      nextSet.delete(idx)
    } else {
      nextSet.add(idx)
    }
    setSelectedIds(nextSet)
  }

  const selectAllCadets = () => {
    // Select all visible cadets
    const nextSet = new Set(selectedIds)
    filteredCadets.forEach((c) => nextSet.add(c._rowIdx))
    setSelectedIds(nextSet)
  }

  const deselectAllCadets = () => {
    // Deselect all visible cadets
    const nextSet = new Set(selectedIds)
    filteredCadets.forEach((c) => nextSet.delete(c._rowIdx))
    setSelectedIds(nextSet)
  }

  // --- GENERATION ACTION ---
  const handleGenerate = async () => {
    if (!tempFile || selectedIds.size === 0) return
    setGenerateLoading(true)
    setStep(3)

    // Progress Bar Animation simulation
    setProgress({ active: true, fill: 10, label: 'Compiling parameters...' })
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev.fill >= 90) {
          clearInterval(interval)
          return prev
        }
        return {
          active: true,
          fill: prev.fill + 20,
          label: prev.fill > 60 ? 'Finalizing workbook layout...' : 'Sorting cadet seniority matrices...',
        }
      })
    }, 400)

    try {
      const colsToUse = selectedCols.length > 0 ? selectedCols : columns
      const blob = await nominalRollApi.generate({
        temp_file: tempFile,
        selected_ids: Array.from(selectedIds),
        columns: colsToUse,
        sort_by: sortBy,
        serial_col: serialCol,
      })

      clearInterval(interval)
      setProgress({ active: true, fill: 100, label: 'Download ready!' })

      // Trigger actual browser download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'NSUT_NCC_Nominal_Roll.xlsx'
      a.click()
      URL.revokeObjectURL(url)

      showToast('✓ Nominal Roll generated & downloaded!')
      setTimeout(() => {
        setProgress({ active: false, fill: 0, label: '' })
        setStep(2)
      }, 2500)
    } catch (err) {
      clearInterval(interval)
      setProgress({ active: false, fill: 0, label: '' })
      setStep(2)
      console.error(err)
      showToast(err.message || 'Generation failed.', true)
    } finally {
      setGenerateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-army-dark text-cream flex flex-col pb-20 relative">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[999] px-5 py-3 rounded-md font-mono text-xs shadow-xl transition-all duration-300 border ${
            toast.isError
              ? 'bg-ncc-red/90 text-cream border-ncc-red-light'
              : 'bg-army-green/90 text-gold-bright border-gold/45'
          }`}
        >
          {toast.message}
        </div>
      )}

      <PageHeader eyebrow="ADMIN SYSTEM MODULE" title="NOMINAL ROLL" subtitle="Generate styled cadet sheets from file rosters">
        <Link
          to="/admin"
          className="font-mono text-xs text-gold hover:text-gold-bright flex items-center gap-1 border border-gold/20 hover:border-gold/40 px-3.5 py-2 rounded bg-army-deep/40 transition-colors"
        >
          ← ADMIN PANEL
        </Link>
      </PageHeader>

      {/* STEP INDICATORS BAR */}
      <div className="border-b border-gold/[0.12] bg-army-deep/20">
        <div className="max-w-[1300px] mx-auto px-6 py-4 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, label: 'Upload File', activeStep: 1 },
            { num: 2, label: 'Configure Layout', activeStep: 2 },
            { num: 3, label: 'Export Excel', activeStep: 3 },
          ].map((s) => {
            const isCompleted = step > s.activeStep
            const isActive = step === s.activeStep
            return (
              <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                    isCompleted
                      ? 'bg-gold border-gold text-army-dark'
                      : isActive
                      ? 'border-gold-bright text-gold-bright bg-army-green/30 animate-pulse'
                      : 'border-gold/25 text-ncc-muted bg-transparent'
                  }`}
                >
                  {isCompleted ? '✓' : s.num}
                </span>
                <span
                  className={`font-mono text-[0.7rem] uppercase tracking-wider ${
                    isActive ? 'text-cream font-bold' : isCompleted ? 'text-gold' : 'text-ncc-muted'
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 3 && <span className="text-ncc-muted mx-2 pointer-events-none">/</span>}
              </div>
            )
          })}
        </div>
      </div>

      <main className="flex-1 max-w-[1300px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN - CONFIGURATOR PANELS */}
        <aside className="w-full lg:w-[32%] flex flex-col gap-6">
          {/* UPLOAD PANEL */}
          <section className="bg-army-deep/40 backdrop-blur-glass border border-gold/10 p-5 rounded-md shadow-lg">
            <h3 className="font-heading text-base font-bold text-cream tracking-wide mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-mono text-[0.6rem] text-gold-bright">
                1
              </span>
              Roster Source File
            </h3>

            {!tempFile ? (
              <div
                onDragOver={handleDragOverFile}
                onDrop={handleDropFile}
                className="border-2 border-dashed border-gold/15 hover:border-gold/45 bg-army-dark/40 py-8 px-4 rounded-md flex flex-col items-center justify-center text-center transition-all duration-300"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <span className="text-3xl mb-2 text-gold/60">📂</span>
                <p className="font-mono text-[0.75rem] text-cream font-bold">Drag & Drop Cadet List</p>
                <p className="font-mono text-[0.6rem] text-ncc-muted my-1.5">or</p>
                <button
                  onClick={triggerBrowse}
                  disabled={loading}
                  className="font-mono text-[0.65rem] font-bold bg-gold hover:bg-gold-bright text-army-dark px-3 py-1.5 rounded transition-all cursor-pointer"
                >
                  {loading ? 'Uploading...' : 'Browse Local Files'}
                </button>
                <p className="font-mono text-[0.55rem] text-ncc-muted mt-3">Supports .xlsx, .xls, .csv</p>
              </div>
            ) : (
              <div className="bg-army-dark/80 border border-gold/20 p-4 rounded-md flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl mt-0.5">📄</span>
                  <div className="min-w-0">
                    <p className="font-heading text-xs font-bold text-cream truncate">{fileName}</p>
                    <p className="font-mono text-[0.6rem] text-ncc-muted mt-0.5">
                      {allCadets.length} Cadets Loaded
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="font-mono text-[0.6rem] border border-ncc-red/30 hover:border-ncc-red-light bg-ncc-red/5 hover:bg-ncc-red/20 text-ncc-red-light py-1.5 rounded transition-all cursor-pointer"
                >
                  Remove & Upload Another
                </button>
              </div>
            )}
          </section>

          {/* COLUMN CONFIG PANEL */}
          <section className="bg-army-deep/40 backdrop-blur-glass border border-gold/10 p-5 rounded-md shadow-lg">
            <h3 className="font-heading text-base font-bold text-cream tracking-wide mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-mono text-[0.6rem] text-gold-bright">
                2
              </span>
              Target Columns
            </h3>
            <p className="font-body text-[0.65rem] text-ncc-muted leading-relaxed mb-4">
              Toggle checkboxes to select and drag handles <span className="font-bold">⠿</span> to reorder columns in the output sheet.
            </p>

            {!tempFile ? (
              <p className="font-mono text-[0.65rem] text-ncc-muted italic text-center py-6 border border-gold/5 bg-army-dark/20 rounded">
                No active document columns
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 font-mono text-[0.6rem]">
                  <button
                    onClick={selectAllColumns}
                    className="flex-1 bg-army-green/35 hover:bg-army-green border border-gold/25 py-1 rounded cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllColumns}
                    className="flex-1 bg-army-dark/50 hover:bg-army-dark border border-gold/15 py-1 rounded cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Columns List container */}
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {/* Selected columns (reorderable) */}
                  {selectedCols.map((col, idx) => (
                    <div
                      key={`sel-${col}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      className={`flex items-center gap-2.5 p-2 rounded-md border text-[0.7rem] bg-army-green/10 border-gold/20 select-none ${
                        draggedIndex === idx ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      <span className="text-ncc-muted font-mono cursor-grab hover:text-gold font-bold">⠿</span>
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={(e) => handleColCheckboxChange(col, e.target.checked)}
                        className="rounded border-gold/30 text-gold focus:ring-gold/30"
                      />
                      <span className="font-heading font-medium text-cream truncate max-w-[140px]" title={col}>
                        {col}
                      </span>
                    </div>
                  ))}

                  {/* Unselected columns */}
                  {columns
                    .filter((c) => !selectedCols.includes(c))
                    .map((col) => (
                      <div
                        key={`unsel-${col}`}
                        className="flex items-center gap-2.5 p-2 rounded-md border text-[0.7rem] bg-army-dark/30 border-gold/5 opacity-55 select-none"
                      >
                        <span className="text-ncc-muted/20 font-mono">⠿</span>
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={(e) => handleColCheckboxChange(col, e.target.checked)}
                          className="rounded border-gold/20 text-gold focus:ring-gold/30"
                        />
                        <span className="font-heading font-medium text-ncc-muted truncate max-w-[140px]" title={col}>
                          {col}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="h-px bg-gold/10 w-full my-3" />

                <label className="flex items-center gap-2 font-mono text-[0.65rem] text-gold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serialCol}
                    onChange={(e) => setSerialCol(e.target.checked)}
                    className="rounded border-gold/30 text-gold focus:ring-gold/30"
                  />
                  ADD S.NO COLUMN IN FINAL OUTPUT
                </label>
              </div>
            )}
          </section>

          {/* SORT ORDER PANEL */}
          <section className="bg-army-deep/40 backdrop-blur-glass border border-gold/10 p-5 rounded-md shadow-lg">
            <h3 className="font-heading text-base font-bold text-cream tracking-wide mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-mono text-[0.6rem] text-gold-bright">
                3a
              </span>
              Cadet Seniority Sorting
            </h3>

            <div className="space-y-3 font-mono text-[0.65rem]">
              {[
                { val: 'none', label: 'NO SORTING', sub: 'Retain file order' },
                { val: 'rank', label: 'SORT BY RANK', sub: 'Seniority: SUO → Cadet' },
                { val: 'dli', label: 'SORT BY DLI NO', sub: 'Numeric cadet seniority' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer transition-all ${
                    sortBy === opt.val
                      ? 'bg-gold/10 border-gold text-gold-bright'
                      : 'bg-army-dark/30 border-gold/10 text-ncc-muted hover:border-gold/30 hover:text-cream'
                  }`}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    value={opt.val}
                    checked={sortBy === opt.val}
                    onChange={() => setSortBy(opt.val)}
                    className="mt-0.5 text-gold border-gold/30 focus:ring-gold/25"
                  />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">{opt.label}</span>
                    <span className="text-[0.55rem] text-ncc-muted tracking-normal font-sans font-medium">
                      {opt.sub}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN - MAIN INTERACTIVE CADETS GRID */}
        <div className="w-full lg:w-[68%] flex flex-col gap-6">
          {/* CADETS SELECT PANEL */}
          <section className="bg-army-deep/40 backdrop-blur-glass border border-gold/10 p-6 rounded-md shadow-lg flex-1 flex flex-col min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-heading text-base font-bold text-cream tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-mono text-[0.6rem] text-gold-bright">
                    3b
                  </span>
                  Select Cadets
                </h3>
                <p className="font-mono text-[0.6rem] text-ncc-muted mt-1">
                  Click to select · <span className="text-gold-bright font-bold">{selectedIds.size}</span> of{' '}
                  <span className="text-cream font-bold">{allCadets.length}</span> cadets active
                </p>
              </div>

              {tempFile && (
                <div className="flex gap-2 font-mono text-[0.6rem] self-start sm:self-center">
                  <button
                    onClick={selectAllCadets}
                    className="bg-army-green/35 hover:bg-army-green border border-gold/25 px-3 py-1.5 rounded cursor-pointer"
                  >
                    Select Page
                  </button>
                  <button
                    onClick={deselectAllCadets}
                    className="bg-army-dark/50 hover:bg-army-dark border border-gold/15 px-3 py-1.5 rounded cursor-pointer"
                  >
                    Deselect Page
                  </button>
                </div>
              )}
            </div>

            {/* Live Search bar */}
            {tempFile && (
              <div className="relative w-full mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ncc-muted">🔍</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter cadets by name or DLI seniority..."
                  className="w-full pl-9 pr-8 py-2 font-mono text-xs text-cream bg-army-dark/80 border border-gold/20 focus:border-gold focus:outline-none rounded transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ncc-muted hover:text-cream cursor-pointer"
                    title="Clear filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Grid of Cadets */}
            <div className="flex-1 border border-gold/10 bg-army-dark/30 rounded-md p-4 max-h-[420px] overflow-y-auto">
              {!tempFile ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <span className="text-4xl mb-3 opacity-30">📋</span>
                  <h4 className="font-heading text-sm font-semibold tracking-wider text-gold mb-1 uppercase">
                    Roster File Required
                  </h4>
                  <p className="font-mono text-[0.6rem] text-ncc-muted max-w-xs leading-relaxed">
                    Upload a cadet Excel sheet in step 1 to display and select personnel records.
                  </p>
                </div>
              ) : filteredCadets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredCadets.map((c) => {
                    const isSelected = selectedIds.has(c._rowIdx)
                    const name = String(c[autoFields.nameCol] || '')
                    const dli = String(c[autoFields.dliCol] || '')
                    const rank = String(c[autoFields.rankCol] || '')

                    return (
                      <button
                        key={c._rowIdx}
                        onClick={() => toggleCadet(c._rowIdx)}
                        className={`flex flex-col text-left p-3 rounded border font-body select-none transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-army-green/40 border-gold shadow shadow-gold/10'
                            : 'bg-army-deep/20 border-gold/10 hover:border-gold/25'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[0.55rem] text-ncc-muted tracking-wider truncate max-w-[120px]">
                            DLI: {dli || '—'}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[0.55rem] font-bold ${
                              isSelected ? 'bg-gold border-gold text-army-dark' : 'border-gold/20'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-semibold text-cream truncate w-full mt-1.5" title={name}>
                          {name || 'Unknown'}
                        </h4>
                        {rank && (
                          <span className="font-mono text-[0.55rem] text-gold-bright mt-1 tracking-wider uppercase">
                            {rank}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 font-mono text-[0.65rem] text-ncc-muted">
                  <span>🔍</span>
                  <p className="mt-2">No cadets match the filter query "{searchTerm}"</p>
                </div>
              )}
            </div>
          </section>

          {/* GENERATE WORKBOOK PANEL */}
          <section className="bg-army-deep/40 backdrop-blur-glass border border-gold/10 p-6 rounded-md shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-base font-bold text-cream tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-mono text-[0.6rem] text-gold-bright">
                    4
                  </span>
                  Generate Nominal Roll
                </h3>
                <p className="font-mono text-[0.6rem] text-ncc-muted mt-1">
                  {selectedIds.size > 0 && tempFile
                    ? `Ready: ${selectedIds.size} cadet records configured with ${selectedCols.length} columns.`
                    : 'Configure file source and select cadets to activate export button.'}
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!tempFile || selectedIds.size === 0 || generateLoading}
                className="font-mono text-xs text-army-dark bg-gold hover:bg-gold-bright disabled:bg-army-green/10 disabled:border-gold/10 disabled:text-ncc-muted font-bold py-3 px-6 rounded border border-gold/35 shadow-md transition-all self-start sm:self-center cursor-pointer flex items-center gap-2"
              >
                <span>⬇</span> {generateLoading ? 'Generating...' : 'Export Styled Excel'}
              </button>
            </div>

            {/* Fake progress bar */}
            {progress.active && (
              <div className="mt-5 space-y-2 animate-fade-up">
                <div className="w-full h-2.5 bg-army-dark/80 rounded overflow-hidden border border-gold/10">
                  <div
                    className="h-full bg-gradient-to-r from-army-green to-gold transition-all duration-300"
                    style={{ width: `${progress.fill}%` }}
                  />
                </div>
                <p className="font-mono text-[0.6rem] text-gold-bright tracking-wider uppercase text-center">
                  {progress.label}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
