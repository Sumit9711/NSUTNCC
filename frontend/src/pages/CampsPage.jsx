import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { campsApi } from '../utils/api'

gsap.registerPlugin(ScrollTrigger)

const FALLBACK_IMG = '/NCC.jpg'

export default function CampsPage() {
  const navigate = useNavigate()
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const sectionRef = useRef(null)
  const slidesRef = useRef([])

  useEffect(() => {
    async function loadCamps() {
      setLoading(true)
      setError(null)
      try {
        const data = await campsApi.getCamps()
        setCamps(data)
      } catch (err) {
        console.error('Failed to load camps:', err)
        setError(err.message || 'Failed to retrieve camp files.')
      } finally {
        setLoading(false)
      }
    }
    loadCamps()
  }, [])

  // ── Build slideshow ──
  useEffect(() => {
    if (loading || camps.length === 0) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const section = sectionRef.current
    const slides = slidesRef.current
    if (!section || slides.length === 0) return

    // Kill any existing ScrollTrigger for camps
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.id === 'camps-scroll') st.kill()
    })

    if (camps.length <= 1) {
      if (slides[0]) {
        gsap.set(slides[0], { opacity: 1, scale: 1, pointerEvents: 'auto' })
        const clipEl = slides[0].querySelector('.slide-clip')
        if (clipEl) gsap.set(clipEl, { clipPath: 'circle(100% at 50% 50%)' })
        const contentEl = slides[0].querySelector('.slide-content')
        if (contentEl) gsap.set(contentEl, { opacity: 1, y: 0 })
        const blurEl = slides[0].querySelector('.slide-blur')
        if (blurEl) gsap.set(blurEl, { opacity: 1 })
      }
      return
    }

    if (reduceMotion) return

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(slides, { opacity: 0, scale: 0.92, pointerEvents: 'none' })
      if (slides[0]) {
        gsap.set(slides[0], { opacity: 1, scale: 1, pointerEvents: 'auto' })
        const clipEl = slides[0].querySelector('.slide-clip')
        if (clipEl) gsap.set(clipEl, { clipPath: 'circle(100% at 50% 50%)' })
        const contentEl = slides[0].querySelector('.slide-content')
        if (contentEl) gsap.set(contentEl, { opacity: 1, y: 0 })
        const blurEl = slides[0].querySelector('.slide-blur')
        if (blurEl) gsap.set(blurEl, { opacity: 1 })
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'none' },
        onUpdate: () => {
          const progress = tl.progress()
          const idx = Math.min(Math.round(progress * (camps.length - 1)), camps.length - 1)
          setActiveIndex(idx)
        }
      })

      // Build linear transitions between slides
      for (let i = 0; i < camps.length - 1; i++) {
        const currentSlide = slides[i]
        const nextSlide = slides[i + 1]

        const currentContent = currentSlide.querySelector('.slide-content')
        const currentBlur = currentSlide.querySelector('.slide-blur')

        const nextClip = nextSlide.querySelector('.slide-clip')
        const nextContent = nextSlide.querySelector('.slide-content')
        const nextBlur = nextSlide.querySelector('.slide-blur')
        const nextCorner = nextSlide.querySelector('.slide-corner')

        // Transition Slide i to Slide i+1 over timeline segment [i, i + 1]

        // 1. Next slide enters (crossfade on top)
        tl.to(nextSlide, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 1 }, i)
        if (nextClip) {
          tl.fromTo(nextClip, 
            { clipPath: 'circle(0% at 50% 50%)' }, 
            { clipPath: 'circle(100% at 50% 50%)', duration: 1 }, 
            i
          )
        }
        if (nextBlur) {
          tl.fromTo(nextBlur, { opacity: 0 }, { opacity: 1, duration: 1 }, i)
        }
        if (nextCorner) {
          tl.fromTo(nextCorner, { opacity: 0 }, { opacity: 1, duration: 0.6 }, i + 0.2)
        }
        if (nextContent) {
          const nextChildren = nextContent.children
          if (nextChildren && nextChildren.length > 0) {
            tl.fromTo(nextChildren, 
              { opacity: 0, y: 40 }, 
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 
              i + 0.2
            )
          } else {
            tl.fromTo(nextContent, 
              { opacity: 0, y: 40 }, 
              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 
              i + 0.2
            )
          }
        }

        // 2. Current slide leaves
        tl.to(currentSlide, { opacity: 0, scale: 1.08, pointerEvents: 'none', duration: 1 }, i)
        if (currentBlur) {
          tl.to(currentBlur, { opacity: 0, duration: 1 }, i)
        }
        if (currentContent) {
          const currentChildren = currentContent.children
          if (currentChildren && currentChildren.length > 0) {
            tl.to(currentChildren, 
              { opacity: 0, y: -30, duration: 0.5, stagger: 0.05, ease: 'power2.in' }, 
              i
            )
          } else {
            tl.to(currentContent, 
              { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 
              i
            )
          }
        }
      }

      ScrollTrigger.create({
        id: 'camps-scroll',
        trigger: section,
        start: 'top top',
        end: `+=${(camps.length - 1) * 120}vh`,
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => { tl.progress(self.progress) }
      })

      ScrollTrigger.refresh()
    })

    return () => ctx.revert()
  }, [loading, camps])

  const openCampGallery = useCallback((folder) => navigate(`/camp/${folder}`), [navigate])

  const goToCamp = useCallback((index) => {
    const st = ScrollTrigger.getById('camps-scroll')
    if (st) {
      const progress = index / (camps.length - 1)
      window.scrollTo({ top: st.start + (st.end - st.start) * progress, behavior: 'smooth' })
    }
  }, [camps.length])

  return (
    <div className="min-h-screen bg-army-dark text-cream">
      {/* ── Header ── */}
      <header className="relative px-4 md:px-8 py-5 md:py-6 border-b border-gold/[0.06] bg-army-dark/95 backdrop-blur-glass z-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.35em] text-gold/50 uppercase mb-0.5">
              NSUT NCC &mdash; Field Operations
            </p>
            <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold tracking-widest leading-none"
              style={{
                background: 'linear-gradient(135deg, #e8c76a 0%, #c9a84c 40%, #8a6d28 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              CAMP CHRONICLES
            </h1>
            <p className="font-mono text-[0.5rem] md:text-[0.6rem] text-ncc-muted tracking-widest mt-1">
              Scroll to explore each chapter of the NCC journey
            </p>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-lg border border-gold/12 bg-army-deep/50 backdrop-blur-glass">
            <span className="font-heading text-xl md:text-2xl font-bold text-gold tracking-wide">{camps.length}</span>
            <span className="font-mono text-[0.45rem] md:text-[0.5rem] tracking-[0.25em] text-ncc-muted uppercase">Archives</span>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 px-4">
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-1 rounded-full border-2 border-t-gold border-gold/20 animate-spin" />
          </div>
          <p className="font-mono text-xs text-ncc-muted tracking-[0.3em] uppercase">Loading camp archives...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-40 px-4">
          <div className="border border-ncc-red/25 bg-ncc-red/5 text-ncc-red-light p-8 rounded-xl text-center max-w-md backdrop-blur-glass">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-ncc-red/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-mono text-sm font-semibold tracking-wider mb-2 uppercase">Access Failure</p>
            <p className="font-body text-xs text-cream/60">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 font-mono text-[0.6rem] tracking-wider border border-ncc-red-light/25 text-ncc-red-light px-5 py-2 rounded-lg hover:bg-ncc-red/10 transition-all cursor-pointer">
              Retry Connection
            </button>
          </div>
        </div>
      ) : camps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-gold/15 flex items-center justify-center text-gold/30">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-bold tracking-widest text-gold mb-2 uppercase">No Archives Found</h3>
          <p className="font-mono text-xs text-ncc-muted max-w-sm text-center leading-relaxed">Operational camp logs could not be located.</p>
        </div>
      ) : (
        <>
          {/* ── PINNED GALLERY ── */}
          <section ref={sectionRef} className="relative bg-army-dark" style={{ height: `${camps.length * 130}vh` }}>
            <div className="camps-gallery-sticky">
              <div className="absolute inset-0 pointer-events-none z-0 opacity-15"
                style={{
                  backgroundImage: 'linear-gradient(rgba(61,139,61,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(61,139,61,0.03) 1px, transparent 1px)',
                  backgroundSize: '80px 80px',
                  maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
                  WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
                }}
              />

              {camps.map((camp, idx) => {
                const imgSrc = camp.cover_file ? `/static/images/camps/${camp.folder}/${camp.cover_file}` : FALLBACK_IMG
                return (
                  <div key={camp.folder} ref={el => slidesRef.current[idx] = el}
                    className="camps-slide" style={{ zIndex: camps.length - idx }}
                    onClick={() => openCampGallery(camp.folder)} role="button" tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openCampGallery(camp.folder) }}
                  >
                    <div className="slide-blur absolute inset-0 z-0 opacity-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        filter: 'blur(60px) saturate(1.4)', transform: 'scale(1.3)',
                      }}
                    />
                    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-army-dark/40 via-transparent to-army-dark/80 pointer-events-none" />

                    <div className="camps-slide-panel z-[2]">
                      <div className="slide-clip w-full h-full overflow-hidden">
                        <img src={imgSrc} alt={camp.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading={idx === 0 ? 'eager' : 'lazy'} />
                      </div>
                      <div className="absolute inset-0 pointer-events-none border border-gold/[0.06] rounded-[inherit]" />
                    </div>

                    <div className="slide-content z-[3]">
                      <p className="font-mono text-[clamp(0.45rem,0.8vw,0.65rem)] tracking-[0.35em] text-gold/60 uppercase mb-1.5 md:mb-2">
                        Chapter {String(idx + 1).padStart(2, '0')}
                      </p>
                      <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-bold tracking-[0.03em] leading-none text-cream">
                        {camp.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-2 md:mt-3">
                        <span className="font-mono text-[clamp(0.5rem,0.8vw,0.7rem)] tracking-[0.2em] text-cream/50 uppercase">
                          {camp.count || 0} Photographs
                        </span>
                        {camp.date && (
                          <>
                            <span className="w-px h-3 bg-gold/20" />
                            <span className="font-mono text-[clamp(0.5rem,0.8vw,0.7rem)] tracking-[0.2em] text-gold/50 uppercase">{camp.date}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-4 md:mt-6">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[clamp(0.5rem,0.8vw,0.65rem)] tracking-[0.25em] uppercase text-gold/80 border border-gold/20 px-4 py-2 rounded-full hover:bg-gold/10 hover:border-gold/40 transition-all cursor-pointer">
                          Explore Gallery
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="slide-corner z-[3]">
                      <div className="absolute top-0 right-0 w-6 h-6 md:w-10 md:h-10">
                        <div className="absolute top-0 right-0 w-full h-[1.5px] bg-gradient-to-l from-gold/30 to-transparent" />
                        <div className="absolute top-0 right-0 w-[1.5px] h-full bg-gradient-to-b from-gold/30 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 md:w-10 md:h-10">
                        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-gold/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-[1.5px] h-full bg-gradient-to-t from-gold/30 to-transparent" />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Progress */}
              {camps.length > 1 && (
                <div className="camps-progress z-10">
                  <div className="flex flex-col items-center gap-2">
                    {camps.map((_, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <button className={`camps-progress-dot ${idx <= activeIndex ? 'active' : ''}`}
                          onClick={e => { e.stopPropagation(); goToCamp(idx) }} aria-label={`Go to camp ${idx + 1}`}
                        />
                        {idx < camps.length - 1 && <div className="camps-progress-line" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="camps-counter z-10">
                <span className="text-gold/80 font-mono text-[clamp(0.65rem,1.2vw,1rem)]">{String(activeIndex + 1).padStart(2, '0')}</span>
                <span className="text-cream/25 mx-1 font-mono text-[clamp(0.45rem,0.8vw,0.65rem)]">/</span>
                <span className="text-cream/30 font-mono text-[clamp(0.45rem,0.8vw,0.65rem)]">{String(camps.length).padStart(2, '0')}</span>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 camps-scroll-hint">
                <span className="font-mono text-[0.45rem] md:text-[0.55rem] tracking-[0.3em] text-cream/25 uppercase">Scroll to navigate</span>
                <div className="w-px h-6 md:h-8 bg-gradient-to-b from-gold/25 to-transparent" />
              </div>
            </div>
          </section>

          {/* ── GRID ── */}
          <section className="py-20 md:py-28 px-4 md:px-8 relative z-[1] bg-army-dark">
            <div className="max-w-[1300px] mx-auto text-center mb-10 md:mb-14">
              <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.35em] text-gold/50 uppercase mb-2">Complete Record</p>
              <h2 className="font-heading text-2xl md:text-4xl font-bold tracking-widest text-cream">ALL CAMPS AT A GLANCE</h2>
              <div className="mx-auto mt-3 w-12 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-[1300px] mx-auto">
              {camps.map((camp, idx) => {
                const imgSrc = camp.cover_file ? `/static/images/camps/${camp.folder}/${camp.cover_file}` : FALLBACK_IMG
                return (
                  <button key={camp.folder} onClick={() => { const st = ScrollTrigger.getById('camps-scroll'); if (st) goToCamp(idx); else openCampGallery(camp.folder) }}
                    className="group text-left bg-army-deep/30 backdrop-blur-glass border border-gold/[0.08] hover:border-gold/25 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer p-0 shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                  >
                    <div className="relative h-44 md:h-52 overflow-hidden bg-army-dark">
                      <img src={imgSrc} alt={camp.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-90" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-army-dark/80 via-army-dark/10 to-transparent opacity-90" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-heading text-lg md:text-xl font-bold text-cream tracking-wide">{camp.name}</h3>
                      </div>
                      <div className="absolute top-3 right-3 font-mono text-[0.5rem] tracking-[0.2em] text-gold/50 bg-army-dark/60 px-2 py-1 rounded border border-gold/10">{String(idx + 1).padStart(2, '0')}</div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.2em] text-ncc-muted uppercase">{camp.count || 0} Photos</span>
                      <span className="flex items-center gap-1 font-mono text-[0.55rem] md:text-[0.6rem] tracking-wider text-gold/60 group-hover:text-gold transition-colors">
                        View <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
