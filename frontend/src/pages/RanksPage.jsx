import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { ranksApi } from '../utils/api'

export default function RanksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    all_sessions: [],
    active_session: null,
    grouped: {},
  })

  // Track flipped cards by holder name/rank to avoid state issues
  const [flippedCards, setFlippedCards] = useState({})

  const currentSessionParam = searchParams.get('session') || ''

  useEffect(() => {
    async function fetchRanks() {
      setLoading(true)
      setError(null)
      try {
        const res = await ranksApi.getRanks(currentSessionParam)
        setData(res)
        // Reset flipped cards on session change
        setFlippedCards({})
      } catch (err) {
        console.error('Error fetching ranks:', err)
        setError(err.message || 'Failed to load ranks.')
      } finally {
        setLoading(false)
      }
    }
    fetchRanks()
  }, [currentSessionParam])

  const handleSessionChange = (sessionLabel) => {
    setSearchParams({ session: sessionLabel })
  }

  const toggleFlipCard = (key) => {
    setFlippedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleCardKeyDown = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlipCard(key)
    }
  }

  return (
    <div className="min-h-screen bg-army-dark text-cream flex flex-col pb-20">
      <PageHeader
        eyebrow="NSUT NCC — COMMAND STRUCTURE"
        title="RANK PANEL"
        subtitle="Click any card to reveal credentials & details"
      />

      {/* SESSION SWITCHER */}
      {data.all_sessions && data.all_sessions.length > 0 && (
        <div className="border-b border-gold/[0.12] bg-army-deep/40 backdrop-blur-glass sticky top-[57px] z-[60]">
          <div className="max-w-[1300px] mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4 font-mono">
            <span className="text-[0.65rem] tracking-[0.2em] text-gold uppercase font-bold">
              BATCH SESSION
            </span>
            <div className="flex flex-wrap gap-2">
              {data.all_sessions.map((s) => {
                const isActive = data.active_session && s.label === data.active_session.label
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSessionChange(s.label)}
                    className={`relative text-[0.7rem] md:text-xs px-4 py-1.5 rounded border tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-gold text-army-dark border-gold font-bold shadow-md shadow-gold/10'
                        : 'bg-army-green/10 border-gold/20 hover:border-gold/50 text-cream/80 hover:text-cream'
                    }`}
                  >
                    {s.label}
                    {s.is_current === 1 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ncc-red-light rounded-full border-2 border-army-dark animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1300px] mx-auto w-full px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs text-ncc-muted tracking-wider">RETRIEVING COMMAND STRUCTURE...</p>
          </div>
        ) : error ? (
          <div className="border border-ncc-red/30 bg-ncc-red/5 text-ncc-red-light p-6 rounded-md text-center max-w-md mx-auto">
            <p className="font-mono text-sm font-semibold mb-2">ERROR</p>
            <p className="font-body text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 font-mono text-[0.65rem] border border-ncc-red-light/30 px-3 py-1.5 rounded hover:bg-ncc-red/10 transition-colors cursor-pointer"
            >
              RETRY CONNECTION
            </button>
          </div>
        ) : Object.keys(data.grouped).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(data.grouped).map(([rankTitle, holders]) => (
              <div key={rankTitle} className="space-y-6">
                {/* TIER LABEL */}
                <div className="flex items-center gap-4">
                  <div className="h-px bg-gradient-to-r from-transparent to-gold/30 flex-1" />
                  <h2 className="font-heading text-lg md:text-xl font-bold tracking-[0.2em] text-gold uppercase text-center">
                    {rankTitle}
                  </h2>
                  <div className="h-px bg-gradient-to-r from-gold/30 to-transparent flex-1" />
                </div>

                {/* CARDS ROW */}
                <div className="flex flex-wrap justify-center gap-6">
                  {holders.map((holder, idx) => {
                    const cardKey = `${holder.name}-${holder.rank_title}-${idx}`
                    const isFlipped = flippedCards[cardKey] || false

                    return (
                      <div
                        key={cardKey}
                        className="w-[260px] h-[340px] perspective group cursor-pointer focus:outline-none"
                        onClick={() => toggleFlipCard(cardKey)}
                        onKeyDown={(e) => handleCardKeyDown(e, cardKey)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Flip card for ${holder.name}`}
                      >
                        {/* Inner Container to hold front/back */}
                        <div
                          className={`relative w-full h-full duration-700 preserve-3d transition-transform ${
                            isFlipped ? 'rotate-y-180' : ''
                          }`}
                        >
                          {/* FRONT */}
                          <div className="absolute inset-0 backface-hidden rounded-md border border-gold/15 bg-army-deep/40 backdrop-blur-glass p-4 flex flex-col items-center justify-between shadow-lg hover:border-gold/40 transition-all duration-300">
                            {/* Photo Wrap */}
                            <div className="relative w-full h-[220px] rounded bg-army-dark/80 overflow-hidden border border-gold/[0.08]">
                              {holder.photo ? (
                                <img
                                  src={`/images/ranks/${holder.photo}`}
                                  alt={holder.name}
                                  className="w-full h-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <img
                                  src="/dress2.png"
                                  alt={holder.name}
                                  className="w-full h-full object-contain p-6 opacity-60 mix-blend-screen"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-army-dark via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Name & Badge Info */}
                            <div className="w-full text-center mt-3 flex-1 flex flex-col justify-between">
                              <span className="inline-block self-center font-mono text-[0.55rem] tracking-widest text-gold-bright bg-gold/10 border border-gold/20 px-2 py-0.5 rounded uppercase">
                                {holder.rank_title}
                              </span>
                              <h3 className="font-heading text-base font-bold text-cream tracking-wide truncate mt-1">
                                {holder.name}
                              </h3>
                              <span className="font-mono text-[0.55rem] text-ncc-muted tracking-[0.25em] uppercase animate-pulse mt-1.5 block">
                                TAP TO REVEAL
                              </span>
                            </div>
                          </div>

                          {/* BACK */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-md border border-gold/30 bg-army-green/10 backdrop-blur-glass p-6 flex flex-col justify-between shadow-xl overflow-hidden">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-gold/5 blur-[40px] rounded-full pointer-events-none -translate-y-10" />

                            {/* Circular Rank Icon */}
                            <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center text-center font-heading text-xs font-bold text-gold-bright bg-army-deep/80 shadow-md shadow-black/40 mx-auto mt-2">
                              {holder.rank_title}
                            </div>

                            {/* Info fields */}
                            <div className="space-y-3 flex-1 mt-6 text-center">
                              <div>
                                <p className="font-mono text-[0.55rem] tracking-widest text-gold/60 uppercase">
                                  Full Name
                                </p>
                                <p className="font-heading text-sm font-semibold text-cream mt-0.5">
                                  {holder.name}
                                </p>
                              </div>

                              <div>
                                <p className="font-mono text-[0.55rem] tracking-widest text-gold/60 uppercase">
                                  Rank Title
                                </p>
                                <p className="font-body text-xs text-cream mt-0.5">{holder.rank_title}</p>
                              </div>

                              {holder.year_batch && (
                                <div>
                                  <p className="font-mono text-[0.55rem] tracking-widest text-gold/60 uppercase">
                                    Year / Batch
                                  </p>
                                  <p className="font-body text-xs text-cream mt-0.5">{holder.year_batch}</p>
                                </div>
                              )}

                              {data.active_session && (
                                <div>
                                  <p className="font-mono text-[0.55rem] tracking-widest text-gold/60 uppercase">
                                    Session
                                  </p>
                                  <p className="font-body text-xs text-gold mt-0.5">
                                    {data.active_session.label}
                                  </p>
                                </div>
                              )}
                            </div>

                            <span className="font-mono text-[0.55rem] text-gold/70 text-center tracking-[0.2em] mt-auto">
                              TAP TO FLIP BACK
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-army-deep/20 border border-gold/10 rounded max-w-md mx-auto">
            <p className="font-mono text-sm text-ncc-muted">No rank holders found for this session.</p>
          </div>
        )}
      </main>
    </div>
  )
}
