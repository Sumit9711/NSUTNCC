/**
 * CadetDashboard — Post-login view for cadets showing their attendance data,
 * charts, session history, and session photos.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { attendanceApi } from '../utils/api'

gsap.registerPlugin(ScrollTrigger)

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CadetDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const chartRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await attendanceApi.getMyAttendance()
        if (!cancelled) setData(res)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // GSAP entrance animations
  useEffect(() => {
    if (loading || !sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.dash-card', {
        y: 40, opacity: 0, duration: 0.6,
        stagger: 0.1, ease: 'power3.out',
      })
      gsap.from('.dash-chart-bar', {
        scaleY: 0, duration: 0.8, delay: 0.3,
        stagger: 0.06, ease: 'power2.out',
        transformOrigin: 'bottom',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [loading, data])

  // Chart data
  const chartData = useMemo(() => {
    if (!data?.monthly) return []
    return data.monthly.slice(0, 12).reverse().map((m) => ({
      label: `${MONTH_NAMES[m.month - 1]} ${String(m.year).slice(2)}`,
      total: m.total,
      present: m.present,
      pct: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0,
    }))
  }, [data])

  const maxSessions = useMemo(() => {
    return Math.max(1, ...chartData.map((d) => d.total))
  }, [chartData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner" />
          <p className="font-mono text-xs text-ncc-dim mt-4 tracking-widest">LOADING DASHBOARD...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="min-h-screen pb-24 animate-page-in" style={{
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(40,75,28,0.35) 0%, transparent 60%), linear-gradient(170deg, #060b06 0%, #080d08 50%, #070c07 100%)',
    }}>
      <PageHeader
        eyebrow={`WELCOME, ${user?.dli_number || 'CADET'}`}
        title="MY DASHBOARD"
        subtitle={data?.cadet ? `${data.cadet.name} • Year ${data.cadet.year}` : 'Your attendance overview'}
      />

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-8">
        {error && (
          <div className="glass-card-dark p-4 text-center mb-6">
            <p className="text-ncc-red-light font-mono text-sm">{error}</p>
          </div>
        )}

        {!data?.cadet ? (
          <div className="glass-card-dark p-8 text-center">
            <div className="text-4xl mb-4 opacity-40">🎖</div>
            <h3 className="font-heading text-xl text-cream mb-2">Profile Not Linked</h3>
            <p className="font-mono text-xs text-ncc-muted max-w-md mx-auto">
              Your DLI number ({user?.dli_number}) was not found in the cadet roster.
              Contact an admin to ensure your DLI is registered.
            </p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="TOTAL SESSIONS" value={data.total_sessions} icon="📋" />
              <StatCard label="PRESENT" value={data.present} icon="✓" color="green" />
              <StatCard label="ABSENT" value={data.total_sessions - data.present} icon="✗" color="red" />
              <StatCard label="ATTENDANCE" value={`${data.percentage}%`} icon="📊"
                color={data.percentage >= 75 ? 'green' : data.percentage >= 50 ? 'gold' : 'red'} />
            </div>

            {/* Attendance Chart */}
            {chartData.length > 0 && (
              <div className="dash-card glass-card-dark p-6 mb-8">
                <h3 className="font-heading text-lg font-bold tracking-widest text-cream mb-5">
                  MONTHLY ATTENDANCE
                </h3>
                <div ref={chartRef} className="flex items-end gap-2 md:gap-3 h-[200px] overflow-x-auto pb-2">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-shrink-0 min-w-[40px] md:min-w-[50px] h-full justify-end">
                      <span className="font-mono text-[0.55rem] text-cream mb-1">{d.present}/{d.total}</span>
                      {/* Total bar (background) */}
                      <div className="w-full relative rounded-t-md overflow-hidden"
                        style={{ height: `${(d.total / maxSessions) * 140}px` }}
                      >
                        <div className="absolute inset-0 bg-white/[0.06] rounded-t-md" />
                        {/* Present bar (foreground) */}
                        <div
                          className={`dash-chart-bar absolute bottom-0 left-0 right-0 rounded-t-md ${
                            d.pct >= 75 ? 'bg-ncc-green-ok/60' : d.pct >= 50 ? 'bg-gold/50' : 'bg-ncc-red/50'
                          }`}
                          style={{ height: d.total > 0 ? `${(d.present / d.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="font-mono text-[0.5rem] text-ncc-muted mt-1.5 whitespace-nowrap">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 justify-center">
                  <Legend color="bg-ncc-green-ok/60" label="≥75%" />
                  <Legend color="bg-gold/50" label="50-74%" />
                  <Legend color="bg-ncc-red/50" label="<50%" />
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="dash-card glass-card-dark p-6 mb-8">
              <h3 className="font-heading text-lg font-bold tracking-widest text-cream mb-4">
                RECENT SESSIONS
              </h3>
              {data.sessions?.length === 0 ? (
                <p className="font-mono text-xs text-ncc-dim text-center py-4">No sessions recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {data.sessions?.slice(0, 30).map((s, i) => {
                    const dateObj = new Date(s.date + 'T00:00:00')
                    const display = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${s.status === 'P' ? 'bg-ncc-green-ok' : 'bg-ncc-red'}`} />
                          <span className="font-mono text-xs text-cream">{display}</span>
                          {s.notes && <span className="font-body text-[0.65rem] text-ncc-muted">({s.notes})</span>}
                        </div>
                        <span className={`font-mono text-[0.65rem] tracking-wider font-bold ${
                          s.status === 'P' ? 'text-ncc-green-ok-light' : 'text-ncc-red-light'
                        }`}>
                          {s.status === 'P' ? 'PRESENT' : 'ABSENT'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Session Photos */}
            {data.photos?.length > 0 && (
              <div className="dash-card glass-card-dark p-6">
                <h3 className="font-heading text-lg font-bold tracking-widest text-cream mb-4">
                  SESSION PHOTOS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {data.photos.map((p) => (
                    <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/[0.07] aspect-[4/3] group">
                      <img src={p.url} alt={p.name} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                        <span className="font-mono text-[0.5rem] text-gold truncate block">{p.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


function StatCard({ label, value, icon, color }) {
  const borderColor = {
    green: 'border-ncc-green-ok/30',
    red: 'border-ncc-red/30',
    gold: 'border-gold/30',
  }
  const valColor = {
    green: 'text-ncc-green-ok-light',
    red: 'text-ncc-red-light',
    gold: 'text-gold-bright',
  }
  return (
    <div className={`dash-card glass-card-dark p-4 text-center ${borderColor[color] || 'border-white/[0.07]'}`}
      style={{ border: `1px solid` }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`font-heading text-2xl md:text-3xl font-bold ${valColor[color] || 'text-gold-bright'}`}>{value}</div>
      <div className="font-mono text-[0.5rem] tracking-[0.15em] text-ncc-dim mt-1">{label}</div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="font-mono text-[0.55rem] text-ncc-muted">{label}</span>
    </div>
  )
}
