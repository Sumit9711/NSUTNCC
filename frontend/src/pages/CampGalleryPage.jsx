import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { campsApi } from '../utils/api'

export default function CampGalleryPage() {
  const { campName } = useParams()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const mainImgRef = useRef(null)
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const touchStartRef = useRef(0)
  const thumbRefs = useRef([])
  const transitioning = useRef(false)

  const displayName = campName?.toUpperCase().replace(/[_-]/g, ' ') || 'CAMP'

  useEffect(() => {
    let cancelled = false
    async function loadImages() {
      setLoading(true)
      try {
        const res = await campsApi.getCampGallery(campName)
        if (!cancelled && res?.images) {
          const urls = res.images.map(img => `/static/images/camps/${res.camp_folder}/${img}`)
          setImages(urls)
        }
      } catch (err) {
        console.error('Failed to load gallery:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadImages()
    return () => { cancelled = true }
  }, [campName])

  // ── Animate image transition ──
  const goTo = useCallback((index, direction) => {
    if (transitioning.current) return
    const newIndex = (index + images.length) % images.length
    if (newIndex === activeIndex) return

    transitioning.current = true
    const img = mainImgRef.current
    if (!img) { setActiveIndex(newIndex); return }

    const dir = direction || (newIndex > activeIndex ? 1 : -1)
    const startX = dir * 80

    gsap.timeline({
      defaults: { ease: 'power3.inOut', duration: 0.5 },
      onComplete: () => { setActiveIndex(newIndex); transitioning.current = false }
    })
      .to(img, { opacity: 0, x: -startX, scale: 0.96, duration: 0.35 })
      .set(img, { opacity: 0, x: startX, scale: 0.96, onComplete: () => { img.src = images[newIndex] } })
      .to(img, { opacity: 1, x: 0, scale: 1, duration: 0.6 })
  }, [activeIndex, images])

  const navigateNext = useCallback(() => goTo(activeIndex + 1, 1), [goTo, activeIndex])
  const navigatePrev = useCallback(() => goTo(activeIndex - 1, -1), [goTo, activeIndex])

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') navigateNext()
      else if (e.key === 'ArrowLeft') navigatePrev()
      else if (e.key === 'Escape') setFullscreen(false)
      else if (e.key === 'f' || e.key === 'F') setFullscreen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigateNext, navigatePrev])

  // ── Body scroll lock for fullscreen ──
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    } else {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
    return () => { document.body.style.overflow = ''; document.body.style.height = '' }
  }, [fullscreen])

  const openFullscreen = useCallback((idx) => { setActiveIndex(idx); setFullscreen(true) }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-army-dark text-cream">
      {/* ── Header ── */}
      <header className="relative px-4 md:px-8 py-4 md:py-5 border-b border-gold/[0.06] bg-army-dark/95 backdrop-blur-glass z-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link to="/camps" className="gallery-nav-btn !static !transform-none !w-auto !h-auto !rounded-lg px-3 py-1.5 !text-[0.55rem] !tracking-wider gap-1.5 !font-mono no-underline">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div>
              <p className="font-mono text-[0.45rem] md:text-[0.5rem] tracking-[0.35em] text-gold/50 uppercase mb-0.5">Camp Gallery</p>
              <h1 className="font-heading text-xl md:text-3xl font-bold tracking-wider text-cream">{displayName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-gold/12 bg-army-deep/50 backdrop-blur-glass">
              <span className="font-heading text-lg md:text-xl font-bold text-gold">{images.length}</span>
              <span className="font-mono text-[0.4rem] md:text-[0.45rem] tracking-[0.2em] text-ncc-muted uppercase">Photos</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-1 rounded-full border-2 border-t-gold border-gold/20 animate-spin" />
          </div>
          <p className="font-mono text-xs text-ncc-muted tracking-[0.3em] uppercase">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <div className="w-16 h-16 mb-4 rounded-full border border-gold/15 flex items-center justify-center text-gold/30">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>
          </div>
          <h2 className="font-heading text-xl text-cream mb-2">No images yet</h2>
          <p className="text-ncc-muted text-sm">Add image files to the camp folder</p>
        </div>
      ) : (
        <>
          {/* ── Main Viewer ── */}
          <section className={`relative w-full ${fullscreen ? 'fixed inset-0 z-[300] bg-black' : 'h-[60vh] md:h-[70vh] bg-army-dark/90'}`}>
            {/* Ambient blurred background */}
            {!fullscreen && (
              <div className="absolute inset-0 opacity-15 overflow-hidden pointer-events-none"
                style={{
                  backgroundImage: `url(${images[activeIndex]})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'blur(50px)', transform: 'scale(1.2)',
                }}
              />
            )}

            <div className="relative h-full w-full flex items-center justify-center">
              <img ref={mainImgRef} src={images[activeIndex]} alt={`Photo ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  maxWidth: fullscreen ? '100vw' : '88vw',
                  maxHeight: fullscreen ? '100vh' : '100%',
                  cursor: fullscreen ? 'zoom-out' : 'zoom-in',
                }}
                onClick={() => setFullscreen(prev => !prev)}
                draggable={false}
              />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); navigatePrev() }} className="gallery-nav-btn !left-3 md:!left-6" aria-label="Previous">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigateNext() }} className="gallery-nav-btn !right-3 md:!right-6" aria-label="Next">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Counter overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs md:text-sm tracking-wider text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                {activeIndex + 1} / {images.length}
              </div>

              {/* Fullscreen toggle hint */}
              {!fullscreen && (
                <div className="absolute top-4 right-4 font-mono text-[0.45rem] tracking-[0.2em] text-white/20 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                  Press F for fullscreen
                </div>
              )}
            </div>

            {/* Touch swipe zone */}
            <div className="absolute inset-0 z-5 md:hidden"
              onTouchStart={e => { touchStartRef.current = e.changedTouches[0].clientX }}
              onTouchEnd={e => {
                const dx = e.changedTouches[0].clientX - touchStartRef.current
                if (Math.abs(dx) > 40) {
                  if (dx < 0) navigateNext()
                  else navigatePrev()
                }
              }}
            />
          </section>

          {/* ── Thumbnail Filmstrip ── */}
          <section className="relative px-4 md:px-8 py-4 md:py-6 border-t border-gold/[0.06]">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.3em] text-gold/50 uppercase">Film Strip</p>
                <p className="font-mono text-[0.45rem] md:text-[0.5rem] tracking-wider text-cream/30">
                  {activeIndex + 1} / {images.length}
                </p>
              </div>

              <div ref={trackRef} className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.15) transparent' }}
              >
                {images.map((url, idx) => (
                  <button key={idx} ref={el => thumbRefs.current[idx] = el}
                    onClick={() => goTo(idx, idx > activeIndex ? 1 : -1)}
                    className={`gallery-thumb ${idx === activeIndex ? 'active' : ''}`}
                    aria-label={`Go to photo ${idx + 1}`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                    {/* Active indicator */}
                    {idx === activeIndex && (
                      <div className="absolute inset-0 ring-2 ring-gold/60 rounded-[inherit]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Image Info ── */}
          <section className="px-4 md:px-8 pb-8 md:pb-12">
            <div className="max-w-[1400px] mx-auto">
              <div className="glass-card-dark p-4 md:p-6 rounded-xl border border-gold/[0.06] flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-heading text-lg font-bold text-gold">
                    {activeIndex + 1}
                  </div>
                  <div>
                    <p className="font-heading text-sm md:text-base font-bold text-cream tracking-wide">
                      {displayName} &mdash; Photo {activeIndex + 1}
                    </p>
                    <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.2em] text-cream/40 uppercase mt-0.5">
                      Field Documentation &bull; NSUT NCC
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(images[activeIndex], '_blank')} className="btn-ghost !py-1.5 !px-3 !text-[0.6rem] !rounded-lg">
                    Open Original
                  </button>
                  <button onClick={() => setFullscreen(true)} className="btn-primary !py-1.5 !px-3 !text-[0.6rem] !rounded-lg">
                    Fullscreen
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
