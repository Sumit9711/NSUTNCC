import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { attendanceApi } from '../../utils/api'
import Modal from '../../components/ui/Modal'

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AttendanceRegister({ year, calYear, month, onBack }) {
  const [sessions, setSessions] = useState([])
  const [cadets, setCadets] = useState([])
  const [attendance, setAttendance] = useState({}) // { [cadetId]: { [sessId]: 'P'|'A' } }
  const [dirty, setDirty] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add session form
  const [newDate, setNewDate] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [addingSession, setAddingSession] = useState(false)
  const [addMsg, setAddMsg] = useState(null)

  // Save
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  // Analytics modal
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Photo modal
  const [photoModal, setPhotoModal] = useState({ open: false, sessId: null })
  const [photos, setPhotos] = useState([])
  const [photoLoading, setPhotoLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [photoMsg, setPhotoMsg] = useState(null)
  const fileInputRef = useRef(null)

  // ── LOAD DATA ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [sessData, cadetsData] = await Promise.all([
          attendanceApi.getSessions(calYear, month),
          attendanceApi.getCadets(year),
        ])

        if (cancelled) return
        setSessions(sessData)
        setCadets(cadetsData)

        // Fetch attendance for all sessions
        const att = {}
        const promises = sessData.map((sess) =>
          attendanceApi.getRecords(sess.id, year).then((rows) => {
            rows.forEach((row) => {
              if (!att[row.id]) att[row.id] = {}
              att[row.id][sess.id] = row.status || 'A'
            })
          })
        )
        await Promise.all(promises)
        if (!cancelled) {
          setAttendance(att)
          setDirty(new Set())
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [year, calYear, month])

  // ── TOGGLE CELL ────────────────────────────────────
  const toggleCell = useCallback((cadetId, sessId) => {
    setAttendance((prev) => {
      const cadetAtt = { ...(prev[cadetId] || {}) }
      cadetAtt[sessId] = cadetAtt[sessId] === 'P' ? 'A' : 'P'
      return { ...prev, [cadetId]: cadetAtt }
    })
    setDirty((prev) => new Set(prev).add(sessId))
  }, [])

  // ── BULK MARK ──────────────────────────────────────
  const bulkMark = useCallback((sessId, status) => {
    setAttendance((prev) => {
      const next = { ...prev }
      cadets.forEach((c) => {
        next[c.id] = { ...(next[c.id] || {}), [sessId]: status }
      })
      return next
    })
    setDirty((prev) => new Set(prev).add(sessId))
  }, [cadets])

  // ── STATS ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total = cadets.length
    const sessCount = sessions.length
    let sumPct = 0, lowCount = 0

    cadets.forEach((c) => {
      const present = sessions.filter((s) =>
        attendance[c.id]?.[s.id] === 'P'
      ).length
      const pct = sessCount > 0 ? (present * 100) / sessCount : 0
      sumPct += pct
      if (pct < 75) lowCount++
    })

    const avg = total > 0 && sessCount > 0 ? Math.round(sumPct / total) : null
    return { total, sessions: sessCount, avg, lowCount }
  }, [cadets, sessions, attendance])

  // ── CADET TOTALS ───────────────────────────────────
  const getCadetStats = useCallback((cadetId) => {
    const present = sessions.filter((s) => attendance[cadetId]?.[s.id] === 'P').length
    const total = sessions.length
    const pct = total > 0 ? Math.round((present * 100) / total) : 0
    return { present, pct }
  }, [sessions, attendance])

  // ── ADD SESSION ────────────────────────────────────
  const handleAddSession = useCallback(async () => {
    if (!newDate) { setAddMsg({ type: 'err', text: 'Please pick a date' }); return }

    // Validate date is in the selected month
    const d = new Date(newDate + 'T00:00:00')
    if (d.getFullYear() !== calYear || d.getMonth() + 1 !== month) {
      setAddMsg({ type: 'err', text: `Date must be in ${MONTHS_FULL[month - 1]} ${calYear}` })
      return
    }

    setAddingSession(true)
    try {
      const data = await attendanceApi.addSession(newDate, newNotes)
      setSessions((prev) => [...prev, { id: data.id, date: newDate, notes: newNotes, photo_count: 0 }])

      // Initialize attendance for new session
      setAttendance((prev) => {
        const next = { ...prev }
        cadets.forEach((c) => {
          next[c.id] = { ...(next[c.id] || {}), [data.id]: 'A' }
        })
        return next
      })

      setNewDate('')
      setNewNotes('')
      setAddMsg({ type: 'ok', text: `✓ Session added: ${newDate}` })
    } catch (err) {
      setAddMsg({ type: 'err', text: err.message })
    } finally {
      setAddingSession(false)
    }
  }, [newDate, newNotes, calYear, month, cadets])

  // ── SAVE ALL ───────────────────────────────────────
  const handleSaveAll = useCallback(async () => {
    if (!dirty.size) { setSaveMsg({ type: 'ok', text: 'Nothing changed' }); return }

    setSaving(true)
    const sessIds = [...dirty]
    let saved = 0, errors = 0

    for (const sessId of sessIds) {
      try {
        const records = cadets.map((c) => ({
          cadet_id: c.id,
          status: attendance[c.id]?.[sessId] || 'A',
        }))
        await attendanceApi.markAttendance(sessId, records)
        saved++
      } catch {
        errors++
      }
    }

    if (errors === 0) {
      setDirty(new Set())
      setSaveMsg({ type: 'ok', text: `✓ Saved ${sessIds.length} session(s)` })
    } else {
      setSaveMsg({ type: 'err', text: `${saved} saved, ${errors} failed` })
    }
    setSaving(false)
  }, [dirty, cadets, attendance])

  // ── ANALYTICS ──────────────────────────────────────
  const openAnalytics = useCallback(async () => {
    setAnalyticsOpen(true)
    setAnalyticsLoading(true)
    try {
      const data = await attendanceApi.getAnalytics(calYear, month, year)
      setAnalyticsData(data)
    } catch (err) {
      setAnalyticsData({ error: err.message })
    } finally {
      setAnalyticsLoading(false)
    }
  }, [calYear, month, year])

  // ── PHOTO MODAL ────────────────────────────────────
  const openPhotoModal = useCallback(async (sessId) => {
    setPhotoModal({ open: true, sessId })
    setPhotoLoading(true)
    setPhotoMsg(null)
    setSelectedFiles([])
    try {
      const data = await attendanceApi.getSessionPhotos(sessId)
      setPhotos(data.photos || [])
      // Update session photo count
      setSessions((prev) => prev.map((s) => s.id === sessId ? { ...s, photo_count: (data.photos || []).length } : s))
    } catch {
      setPhotos([])
    } finally {
      setPhotoLoading(false)
    }
  }, [])

  const handlePhotoUpload = useCallback(async () => {
    if (!selectedFiles.length || !photoModal.sessId) return
    setUploading(true)
    try {
      const data = await attendanceApi.uploadSessionPhotos(photoModal.sessId, selectedFiles)
      setPhotoMsg({ type: 'ok', text: `✓ ${data.uploaded} photo(s) uploaded` })
      setSelectedFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      // Reload gallery
      const refreshed = await attendanceApi.getSessionPhotos(photoModal.sessId)
      setPhotos(refreshed.photos || [])
      setSessions((prev) => prev.map((s) => s.id === photoModal.sessId ? { ...s, photo_count: (refreshed.photos || []).length } : s))
    } catch (err) {
      setPhotoMsg({ type: 'err', text: err.message })
    } finally {
      setUploading(false)
    }
  }, [selectedFiles, photoModal.sessId])

  const handleDeletePhoto = useCallback(async (photoId) => {
    if (!confirm('Delete this photo?')) return
    try {
      await attendanceApi.deletePhoto(photoId)
      const data = await attendanceApi.getSessionPhotos(photoModal.sessId)
      setPhotos(data.photos || [])
      setSessions((prev) => prev.map((s) => s.id === photoModal.sessId ? { ...s, photo_count: (data.photos || []).length } : s))
    } catch (err) {
      setPhotoMsg({ type: 'err', text: err.message })
    }
  }, [photoModal.sessId])

  const handleDeleteSession = useCallback(async (sessId, displayDate) => {
    if (!confirm(`Are you sure you want to delete the session on ${displayDate}? All attendance records and uploaded photos for this date will be permanently deleted.`)) return

    try {
      await attendanceApi.deleteSession(sessId)
      setSessions((prev) => prev.filter((s) => s.id !== sessId))
      
      // Clean up attendance map
      setAttendance((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((cId) => {
          if (next[cId]) {
            const cadetAtt = { ...next[cId] }
            delete cadetAtt[sessId]
            next[cId] = cadetAtt
          }
        })
        return next
      })

      // Clean up dirty state
      setDirty((prev) => {
        const next = new Set(prev)
        next.delete(sessId)
        return next
      })

      setAddMsg({ type: 'ok', text: `✓ Session deleted: ${displayDate}` })
    } catch (err) {
      setAddMsg({ type: 'err', text: err.message || 'Failed to delete session' })
    }
  }, [])


  // Auto-clear messages
  useEffect(() => {
    if (addMsg) { const t = setTimeout(() => setAddMsg(null), 4000); return () => clearTimeout(t) }
  }, [addMsg])
  useEffect(() => {
    if (saveMsg) { const t = setTimeout(() => setSaveMsg(null), 4000); return () => clearTimeout(t) }
  }, [saveMsg])

  // ── RENDER ─────────────────────────────────────────
  if (loading) {
    return (
      <section className="animate-fade-up text-center py-20">
        <div className="spinner" />
        <p className="font-mono text-xs text-ncc-dim mt-4 tracking-widest">Loading register...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="animate-fade-up text-center py-20">
        <p className="text-ncc-red-light font-mono text-sm">{error}</p>
        <button onClick={onBack} className="att-btn-outline mt-4">← Go Back</button>
      </section>
    )
  }

  return (
    <section className="animate-fade-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-heading text-lg md:text-xl font-bold tracking-widest text-cream">
          ATTENDANCE REGISTER — {MONTHS_FULL[month - 1]?.toUpperCase()} {calYear} | YEAR {year}
        </h2>
        <div className="flex gap-2 items-center">
          <button onClick={openAnalytics} className="att-btn-outline">📊 Analytics</button>
          <button onClick={onBack} className="att-btn-outline">← Back</button>
        </div>
      </div>

      {/* Add session bar */}
      <div className="glass-card-dark p-4 mb-4">
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-gold/75 block mb-3">ADD CLASS DATE</span>
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.05] text-cream font-mono text-sm outline-none flex-1 min-w-[130px] focus:border-gold/40 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all"
            style={{ colorScheme: 'dark' }}
          />
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.05] text-cream font-mono text-sm outline-none flex-1 min-w-[130px] focus:border-gold/40 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all"
          />
          <button
            onClick={handleAddSession}
            disabled={addingSession}
            className="att-btn-primary disabled:opacity-50"
          >
            {addingSession ? '...' : '+ ADD DATE'}
          </button>
        </div>
        {addMsg && (
          <p className={`font-mono text-[0.64rem] tracking-widest mt-2 ${addMsg.type === 'ok' ? 'text-ncc-green-ok-light' : 'text-ncc-red-light'}`}>
            {addMsg.text}
          </p>
        )}
        
        {/* Active sessions list in this month */}
        {sessions.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-3">
            <span className="font-mono text-[0.52rem] tracking-[0.15em] text-ncc-muted block mb-2">ACTIVE SESSIONS IN THIS MONTH:</span>
            <div className="flex flex-wrap gap-2">
              {sessions.map((sess) => {
                const dateObj = new Date(sess.date + 'T00:00:00')
                const display = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                return (
                  <div key={sess.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-army-green/20 border border-gold/15 text-[0.7rem] font-mono text-cream">
                    <span>{display}</span>
                    {sess.notes && <span className="text-[0.62rem] text-ncc-muted font-sans font-medium">({sess.notes})</span>}
                    <button
                      onClick={() => handleDeleteSession(sess.id, display)}
                      className="text-[0.68rem] text-ncc-red-light hover:text-ncc-red-light/80 bg-transparent border-none cursor-pointer p-0 font-bold ml-1"
                      title="Delete this session"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stats ribbon */}
      <div className="glass-card-dark p-4 mb-4 flex items-center gap-4 flex-wrap">
        <StatPill label="CADETS" value={stats.total} />
        <StatPill label="SESSIONS" value={stats.sessions} color="green" />
        <StatPill label="AVG ATT." value={stats.avg !== null ? `${stats.avg}%` : '—'} color="gold" />
        <StatPill label="BELOW 75%" value={stats.lowCount} color="red" />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            disabled={saving || !dirty.size}
            className="att-btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : '✓ SAVE ALL'}
          </button>
          {saveMsg && (
            <span className={`font-mono text-[0.64rem] ${saveMsg.type === 'ok' ? 'text-ncc-green-ok-light' : 'text-ncc-red-light'}`}>
              {saveMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Register Table — Desktop */}
      <div className="glass-card-dark p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto overflow-y-auto max-h-[68vh]">
          {sessions.length === 0 ? (
            <div className="text-center py-12 font-mono text-xs text-ncc-dim tracking-widest">
              No sessions yet. Add a class date above.
            </div>
          ) : (
            <table className="w-full min-w-max border-collapse text-sm">
              <thead className="sticky top-0 z-[4]">
                <tr>
                  <th className="sticky left-0 z-[5] px-3 py-3 text-center font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 whitespace-nowrap border-b border-gold/20 border-r border-white/[0.07] w-[52px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    S.No
                  </th>
                  <th className="sticky left-[52px] z-[5] px-3 py-3 text-left font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 whitespace-nowrap border-b border-gold/20 border-r border-white/[0.07] min-w-[190px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    CADET NAME
                  </th>
                  <th className="px-3 py-3 text-center font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 whitespace-nowrap border-b border-gold/20 border-r border-white/[0.07] min-w-[110px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    DLI
                  </th>
                  <th className="px-3 py-3 text-center font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 whitespace-nowrap border-b border-gold/20 border-r border-white/[0.07] min-w-[90px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    RANK
                  </th>
                  {sessions.map((sess) => {
                    const dateObj = new Date(sess.date + 'T00:00:00')
                    const display = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()
                    return (
                      <th key={sess.id} className="px-3 py-2 text-center border-b border-gold/20 border-r border-white/[0.07] min-w-[110px] relative" style={{ background: 'rgba(12,22,10,0.95)' }}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono text-[0.6rem] tracking-widest text-cream">{display}</span>
                          <span className="font-mono text-[0.55rem] text-ncc-dim">{dayName}</span>
                          {sess.notes && <span className="font-display text-[0.6rem] text-ncc-muted italic max-w-[90px] truncate">{sess.notes}</span>}
                          <div className="flex gap-1 items-center">
                            <button onClick={() => bulkMark(sess.id, 'P')} className="text-[0.52rem] font-mono px-1.5 py-0.5 rounded border border-white/[0.07] bg-transparent text-ncc-muted hover:border-gold/30 hover:text-gold cursor-pointer transition-all">✓ALL</button>
                            <button onClick={() => bulkMark(sess.id, 'A')} className="text-[0.52rem] font-mono px-1.5 py-0.5 rounded border border-white/[0.07] bg-transparent text-ncc-muted hover:border-gold/30 hover:text-gold cursor-pointer transition-all">✗ALL</button>
                            <button onClick={() => openPhotoModal(sess.id)} className="text-[0.62rem] px-1 py-0.5 rounded border border-gold/20 bg-gold/[0.06] text-gold hover:bg-gold/[0.15] cursor-pointer transition-all" title="View/Upload Photos">📷</button>
                            <button onClick={() => handleDeleteSession(sess.id, display)} className="text-[0.62rem] px-1 py-0.5 rounded border border-ncc-red/20 bg-ncc-red/[0.06] text-ncc-red-light hover:bg-ncc-red/[0.15] cursor-pointer transition-all" title="Delete Session">🗑️</button>
                          </div>
                        </div>
                        {sess.photo_count > 0 && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold text-black font-mono text-[0.5rem] font-bold flex items-center justify-center">
                            {sess.photo_count}
                          </span>
                        )}
                      </th>
                    )
                  })}
                  <th className="px-3 py-3 text-center font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 border-b border-gold/20 border-r border-white/[0.07] min-w-[70px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    TOTAL
                  </th>
                  <th className="px-3 py-3 text-center font-mono text-[0.58rem] tracking-[0.15em] text-gold/85 border-b border-gold/20 min-w-[80px]" style={{ background: 'rgba(10,20,8,0.95)' }}>
                    ATT.%
                  </th>
                </tr>
              </thead>
              <tbody>
                {cadets.length === 0 ? (
                  <tr>
                    <td colSpan={6 + sessions.length} className="text-center py-12 font-mono text-xs text-ncc-dim tracking-widest">
                      No cadets found for Year {year}.
                    </td>
                  </tr>
                ) : (
                  cadets.map((cadet, idx) => {
                    const { present, pct } = getCadetStats(cadet.id)
                    return (
                      <tr key={cadet.id} className="group hover:bg-army-mid/[0.15]">
                        <td className="sticky left-0 z-[3] px-3 py-2 text-center border-b border-r border-white/[0.07] font-mono text-xs text-ncc-dim" style={{ background: '#0d1a0a' }}>
                          {idx + 1}
                        </td>
                        <td className="sticky left-[52px] z-[3] px-3 py-2 text-left border-b border-r border-white/[0.07] font-display text-sm font-semibold text-cream" style={{ background: '#0d1a0a' }}>
                          {cadet.name}
                        </td>
                        <td className="px-3 py-2 text-center border-b border-r border-white/[0.07] font-mono text-xs text-ncc-muted">
                          {cadet.dli || '—'}
                        </td>
                        <td className="px-3 py-2 text-center border-b border-r border-white/[0.07] font-mono text-[0.64rem] text-ncc-dim">
                          {cadet._rank || '—'}
                        </td>
                        {sessions.map((sess) => {
                          const status = attendance[cadet.id]?.[sess.id] || 'A'
                          return (
                            <td key={sess.id} className="px-2 py-1.5 text-center border-b border-r border-white/[0.07]">
                              <button
                                onClick={() => toggleCell(cadet.id, sess.id)}
                                className={`w-9 h-9 rounded-lg border-[1.5px] mx-auto flex items-center justify-center cursor-pointer transition-all duration-200 select-none text-base font-bold
                                  ${status === 'P'
                                    ? 'bg-ncc-green-ok/20 border-ncc-green-ok/50 shadow-[0_0_10px_rgba(39,174,96,0.2)] text-ncc-green-ok-light'
                                    : 'bg-ncc-red/10 border-white/[0.07] text-ncc-red/60'
                                  }
                                  hover:scale-[1.15] hover:border-gold/40
                                `}
                              >
                                {status === 'P' ? '✓' : '✗'}
                              </button>
                            </td>
                          )
                        })}
                        <td className="px-3 py-2 text-center border-b border-r border-white/[0.07] font-heading text-base font-bold text-gold">
                          {present}
                        </td>
                        <td className={`px-3 py-2 text-center border-b font-mono text-sm ${
                          pct >= 75 ? 'text-ncc-green-ok-light' : pct >= 50 ? 'text-gold-bright' : 'text-ncc-red-light'
                        }`}>
                          {sessions.length > 0 ? `${pct}%` : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Register Cards — Mobile */}
      <div className="md:hidden space-y-3">
        {sessions.length === 0 ? (
          <div className="glass-card-dark p-6 text-center font-mono text-xs text-ncc-dim tracking-widest">
            No sessions yet. Add a class date above.
          </div>
        ) : cadets.length === 0 ? (
          <div className="glass-card-dark p-6 text-center font-mono text-xs text-ncc-dim tracking-widest">
            No cadets found for Year {year}.
          </div>
        ) : (
          cadets.map((cadet, idx) => {
            const { present, pct } = getCadetStats(cadet.id)
            return (
              <div key={cadet.id} className="glass-card-dark p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-mono text-[0.6rem] text-ncc-dim">#{idx + 1}</span>
                    <h4 className="font-display text-sm font-semibold text-cream">{cadet.name}</h4>
                    <p className="font-mono text-[0.65rem] text-ncc-muted">{cadet.dli || '—'} · {cadet._rank || '—'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-lg font-bold text-gold">{present}</span>
                    <span className="text-ncc-dim text-xs">/{sessions.length}</span>
                    <span className={`block font-mono text-xs ${pct >= 75 ? 'text-ncc-green-ok-light' : pct >= 50 ? 'text-gold-bright' : 'text-ncc-red-light'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sessions.map((sess) => {
                    const status = attendance[cadet.id]?.[sess.id] || 'A'
                    const dateObj = new Date(sess.date + 'T00:00:00')
                    const display = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    return (
                      <button
                        key={sess.id}
                        onClick={() => toggleCell(cadet.id, sess.id)}
                        className={`px-2 py-1 rounded text-[0.6rem] font-mono border cursor-pointer transition-all
                          ${status === 'P'
                            ? 'bg-ncc-green-ok/20 border-ncc-green-ok/40 text-ncc-green-ok-light'
                            : 'bg-ncc-red/10 border-white/[0.07] text-ncc-red/60'
                          }
                        `}
                        title={display}
                      >
                        {display}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Analytics Modal */}
      <Modal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} title="ANALYTICS">
        {analyticsLoading ? (
          <div className="spinner" />
        ) : analyticsData?.error ? (
          <p className="text-ncc-red-light font-mono text-sm">{analyticsData.error}</p>
        ) : analyticsData ? (
          <AnalyticsContent data={analyticsData} />
        ) : null}
      </Modal>

      {/* Photo Modal */}
      <Modal isOpen={photoModal.open} onClose={() => setPhotoModal({ open: false, sessId: null })} title={`SESSION PHOTOS`} maxWidth="max-w-[700px]">
        {/* Upload area */}
        <div className="mb-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gold/25 rounded-xl p-6 cursor-pointer text-center hover:border-gold hover:bg-gold/[0.06] transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                setSelectedFiles(Array.from(e.target.files))
                setPhotoMsg(null)
              }}
            />
            <span className="text-4xl mb-3">📷</span>
            <span className="font-display text-sm text-cream">Drop geotagged photos here or <span className="text-gold underline">click to upload</span></span>
            <span className="font-mono text-[0.6rem] text-ncc-dim mt-1 tracking-widest">JPG, PNG, WEBP • Multiple files OK</span>
          </label>
          {selectedFiles.length > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-xs text-ncc-green-ok-light">{selectedFiles.length} file(s) selected</span>
              <button onClick={handlePhotoUpload} disabled={uploading} className="att-btn-primary disabled:opacity-50">
                {uploading ? 'Uploading...' : '⬆ UPLOAD'}
              </button>
            </div>
          )}
          {photoMsg && (
            <p className={`font-mono text-[0.64rem] mt-2 ${photoMsg.type === 'ok' ? 'text-ncc-green-ok-light' : 'text-ncc-red-light'}`}>
              {photoMsg.text}
            </p>
          )}
        </div>
        {/* Gallery */}
        {photoLoading ? (
          <div className="spinner" />
        ) : photos.length === 0 ? (
          <p className="font-mono text-xs text-ncc-dim text-center py-4 tracking-widest">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative rounded-lg overflow-hidden border border-white/[0.07] aspect-[4/3]">
                <img src={p.url} alt="Session photo" loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 flex items-center justify-between">
                  <span className="font-mono text-[0.55rem] text-gold truncate">{p.filename}</span>
                  <button onClick={() => handleDeletePhoto(p.id)} className="bg-ncc-red/60 border-none rounded text-white text-[0.65rem] px-1.5 py-0.5 cursor-pointer hover:bg-ncc-red/90 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </section>
  )
}

function StatPill({ label, value, color }) {
  const colors = {
    green: 'border-ncc-green-ok/30 bg-ncc-green-ok/[0.07]',
    gold: 'border-gold/30 bg-gold/[0.07]',
    red: 'border-ncc-red/30 bg-ncc-red/[0.07]',
  }
  const numColors = {
    green: 'text-ncc-green-ok-light',
    gold: 'text-gold-bright',
    red: 'text-ncc-red-light',
  }
  return (
    <div className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-lg border bg-white/[0.04] gap-0.5 ${colors[color] || 'border-white/[0.07]'}`}>
      <span className={`font-heading text-2xl font-bold leading-none ${numColors[color] || 'text-gold-bright'}`}>{value}</span>
      <span className="font-mono text-[0.5rem] tracking-[0.15em] text-ncc-dim">{label}</span>
    </div>
  )
}

function AnalyticsContent({ data }) {
  const cadets = data.cadets || []
  const low = cadets.filter((c) => +c.pct < 75).length
  const top = cadets.length ? Math.max(...cadets.map((c) => +c.pct || 0)) : 0

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="flex-1 min-w-[120px] p-4 rounded-lg border border-gold/30 bg-gold/[0.08] text-center">
          <span className="block font-heading text-3xl font-bold text-gold-bright">{data.total_sessions}</span>
          <span className="font-mono text-[0.55rem] tracking-[0.15em] text-ncc-dim">SESSIONS</span>
        </div>
        <div className="flex-1 min-w-[120px] p-4 rounded-lg border border-ncc-red/30 bg-ncc-red/[0.08] text-center">
          <span className="block font-heading text-3xl font-bold text-ncc-red-light">{low}</span>
          <span className="font-mono text-[0.55rem] tracking-[0.15em] text-ncc-dim">BELOW 75%</span>
        </div>
        <div className="flex-1 min-w-[120px] p-4 rounded-lg border border-ncc-green-ok/30 bg-ncc-green-ok/[0.08] text-center">
          <span className="block font-heading text-3xl font-bold text-ncc-green-ok-light">{top}%</span>
          <span className="font-mono text-[0.55rem] tracking-[0.15em] text-ncc-dim">TOP ATTENDANCE</span>
        </div>
      </div>

      {/* Analytics table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {['#', 'NAME', 'DLI', 'RANK', 'ATTENDED', 'TOTAL', 'ATTENDANCE %', 'STATUS'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[0.58rem] tracking-[0.15em] text-gold border-b border-gold/15 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...cadets].sort((a, b) => (+b.pct || 0) - (+a.pct || 0)).map((r, i) => {
              const pct = +r.pct || 0
              const cls = pct >= 75 ? 'ok' : pct >= 50 ? 'warn' : 'bad'
              return (
                <tr key={r.id} className="hover:bg-army-mid/25">
                  <td className="px-3 py-2 border-b border-white/[0.07] font-mono text-xs text-ncc-dim">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07] font-semibold">{r.name}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07] font-mono text-xs text-ncc-muted">{r.dli || '—'}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07] font-mono text-[0.66rem] text-ncc-dim">{r._rank || '—'}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07] font-heading text-base text-gold">{r.attended}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07] text-ncc-muted">{r.total}</td>
                  <td className="px-3 py-2 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${cls === 'bad' ? 'bg-ncc-red' : cls === 'warn' ? 'bg-gold' : 'bg-ncc-green-ok'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`font-mono text-xs w-10 text-right ${cls === 'bad' ? 'text-ncc-red-light' : cls === 'warn' ? 'text-gold-bright' : 'text-ncc-green-ok-light'}`}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/[0.07]">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[0.56rem] tracking-widest border ${
                      cls === 'ok' ? 'bg-ncc-green-ok/[0.12] border-ncc-green-ok/40 text-ncc-green-ok-light'
                      : cls === 'warn' ? 'bg-gold/10 border-gold/35 text-gold-bright'
                      : 'bg-ncc-red/[0.12] border-ncc-red/40 text-ncc-red-light'
                    }`}>
                      {cls === 'ok' ? 'GOOD' : cls === 'warn' ? 'AVERAGE' : 'LOW'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Analytics cards - Mobile */}
      <div className="md:hidden space-y-2">
        {[...cadets].sort((a, b) => (+b.pct || 0) - (+a.pct || 0)).map((r, i) => {
          const pct = +r.pct || 0
          const cls = pct >= 75 ? 'ok' : pct >= 50 ? 'warn' : 'bad'
          return (
            <div key={r.id} className="p-3 rounded-lg border border-white/[0.07] bg-white/[0.03]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[0.6rem] text-ncc-dim">#{i + 1}</span>
                  <h4 className="font-display text-sm font-semibold text-cream">{r.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[0.56rem] border ${
                  cls === 'ok' ? 'bg-ncc-green-ok/[0.12] border-ncc-green-ok/40 text-ncc-green-ok-light'
                  : cls === 'warn' ? 'bg-gold/10 border-gold/35 text-gold-bright'
                  : 'bg-ncc-red/[0.12] border-ncc-red/40 text-ncc-red-light'
                }`}>
                  {pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div className={`h-full rounded-full ${cls === 'bad' ? 'bg-ncc-red' : cls === 'warn' ? 'bg-gold' : 'bg-ncc-green-ok'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
