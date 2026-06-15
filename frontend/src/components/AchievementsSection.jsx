import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '../contexts/AuthContext'
import AchievementsParticles from './AchievementsParticles'

gsap.registerPlugin(ScrollTrigger)

const ACHIEVEMENTS_DATA = [
  {
    id: 1,
    title: 'Harshit Tehlan — Completed BMC',
    desc: 'Completion of BMC reflects disciplined training, steady resolve, and exemplary turnout during the course. A proud milestone for NSUT NCC.',
    image: '/static/images/camps/snic/3.png',
    tag: 'BMC COMPLETION'
  },
  {
    id: 2,
    title: 'Tanishq Sir — Recommended',
    desc: 'A recommendation is earned through consistent performance, mentorship, and leadership qualities. NSUT NCC salutes this honorable recognition.',
    image: '/static/images/camps/snic/7.png',
    tag: 'RECOMMENDED'
  },
  {
    id: 3,
    title: 'Sumit — Became the SUO',
    desc: 'Assuming the SUO role demonstrates command confidence, responsibility, and institutional pride. Congratulations to a leader in formation.',
    image: '/static/images/camps/uptrek/IMG-20250414-WA0128.jpg',
    tag: 'SUO APPOINTMENT'
  },
  {
    id: 4,
    title: 'Placeholder — Annual Training Camp Excellence',
    desc: 'Details coming soon. This placeholder represents future achievement content to be added.',
    image: '/static/images/camps/snic/1.jpg',
    tag: 'ATC EXCELLENCE'
  },
  {
    id: 5,
    title: 'Placeholder — Republic Day Camp Representation',
    desc: 'Details coming soon. This placeholder represents future achievement content to be added.',
    image: '/static/images/camps/uptrek/IMG-20250414-WA0128.jpg',
    tag: 'RDC NOMINATION'
  },
  {
    id: 6,
    title: 'Placeholder — Best Cadet Award',
    desc: 'Details coming soon. This placeholder represents future achievement content to be added.',
    image: '/static/images/camps/snic/5.jpg',
    tag: 'BEST CADET'
  },
  {
    id: 7,
    title: 'Cadet Aditya — Gold Medal in Shooting',
    desc: 'Demonstrated exceptional marksmanship at the inter-battalion shooting competition, securing the top position with precision and composure.',
    image: '/static/images/camps/snic/4.jpg',
    tag: 'SHOOTING GOLD'
  },
  {
    id: 8,
    title: 'Cadet Priya — Selected for TSC',
    desc: 'TSC selection is a testament to unwavering dedication, physical endurance, and leadership potential. A proud achievement for the unit.',
    image: '/static/images/camps/uptrek/IMG-20250414-WA0129.jpg',
    tag: 'TSC SELECTION'
  },
  {
    id: 9,
    title: 'NSUT NCC — Best Marching Contingent',
    desc: 'The unit secured the Best Marching Contingent award at the annual NCC day parade, showcasing synchronized drill and disciplined bearing.',
    image: '/static/images/camps/snic/3.png',
    tag: 'BEST CONTINGENT'
  },
  {
    id: 10,
    title: 'Cadet Rohan — Commander\'s Medal',
    desc: 'Awarded the Commander\'s Medal for outstanding performance across all training domains including drill, campcraft, and community service.',
    image: '/static/images/camps/snic/7.png',
    tag: 'COMMANDER MEDAL'
  },
  {
    id: 11,
    title: 'Cadet Simran — CATC Excellence Trophy',
    desc: 'Won the CATC Overall Excellence Trophy for exemplary conduct, leadership, and skill demonstration during the combined annual training camp.',
    image: '/static/images/camps/uptrek/IMG-20250414-WA0128.jpg',
    tag: 'CATC EXCELLENCE'
  },
  {
    id: 12,
    title: 'NSUT NCC — Clean Campus Drive Award',
    desc: 'Recognized for organizing and executing a highly impactful campus cleanliness and awareness drive under the Swachh Bharat Abhiyan initiative.',
    image: '/static/images/camps/snic/1.jpg',
    tag: 'SOCIAL SERVICE'
  },
]

export default function AchievementsSection() {
  const { isAdmin } = useAuth()
  const achSectionRef = useRef(null)
  const achTrackRef = useRef(null)

  const [achievements, setAchievements] = useState([])
  const [achActive, setAchActive] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [achLoading, setAchLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAchievements(data)
        else setAchievements(ACHIEVEMENTS_DATA)
      })
      .catch(() => setAchievements(ACHIEVEMENTS_DATA))
      .finally(() => setAchLoading(false))
  }, [])

  const handleAddAchievement = async (e) => {
    e.preventDefault()
    if (!newTitle || !newDesc || !newTag || !newImage) { setErrorMsg('All fields are required.'); return }
    setIsSubmitting(true); setErrorMsg('')
    const formData = new FormData()
    formData.append('title', newTitle); formData.append('description', newDesc)
    formData.append('tag', newTag); formData.append('image', newImage)
    try {
      const res = await fetch('/api/achievements/add', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.success) {
        setAchievements(prev => [data.achievement, ...prev])
        setNewTitle(''); setNewDesc(''); setNewTag(''); setNewImage(null); setShowAddForm(false)
      } else { setErrorMsg(data.error || 'Failed to add achievement.') }
    } catch { setErrorMsg('Server connection failed.') }
    finally { setIsSubmitting(false) }
  }

  useEffect(() => {
    if (achievements.length === 0) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const section = achSectionRef.current
    const track = achTrackRef.current
    if (!section || !track) return

    // Clean up existing scroll trigger
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.id === 'achievements-scroll') st.kill()
    })

    const viewport = section.querySelector('.achievements-viewport')

    let rafId = null

    // Main horizontal scroll timeline
    const scrollTween = gsap.to(track, {
      x: () => {
        const vw = viewport ? viewport.offsetWidth : window.innerWidth
        return -Math.max(track.scrollWidth - vw, 0)
      },
      ease: 'none',
      scrollTrigger: {
        id: 'achievements-scroll',
        trigger: section,
        start: 'top top',
        end: () => {
          const vw = viewport ? viewport.offsetWidth : window.innerWidth
          // Adjust distance to be slightly shorter and more consistent
          return `+=${Math.max(track.scrollWidth - vw, 0) * 0.9}`
        },
        pin: true,
        pinSpacing: true,
        scrub: 1.0, // Snappier scrub
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (rafId) cancelAnimationFrame(rafId)
          rafId = requestAnimationFrame(() => {
            const progress = self.progress
            setScrollProgress(progress)
            const newIdx = Math.min(
              Math.floor(progress * achievements.length),
              achievements.length - 1
            )
            setAchActive(newIdx)
          })
        }
      }
    })

    // Cinematic enhancements for achievements cards (dynamic tilt, entry scale, parallax images)
    const cards = track.querySelectorAll('.achievement-card')
    const cardScrollTriggers = []

    cards.forEach((card, index) => {
      // 1. Card Scale and Tilt Transition on Entrance/Exit
      const cardTween = gsap.fromTo(card,
        { scale: 0.88, rotateY: 12, opacity: 0.65 },
        {
          scale: 1,
          rotateY: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: 'left 92%',
            end: 'left 50%',
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      )
      cardScrollTriggers.push(cardTween.scrollTrigger)

      // Transition card down and tilt away as it exits left
      const cardExitTween = gsap.to(card, {
        scale: 0.88,
        rotateY: -12,
        opacity: 0.65,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: card,
          containerAnimation: scrollTween,
          start: 'right 50%',
          end: 'right 8%',
          scrub: true,
          invalidateOnRefresh: true,
        }
      })
      cardScrollTriggers.push(cardExitTween.scrollTrigger)

      // 2. Parallax Scrolling Effect inside Card Images
      const img = card.querySelector('.achievement-card-img img')
      if (img) {
        const imgTween = gsap.fromTo(img,
          { xPercent: -8, scale: 1.1 },
          {
            xPercent: 8,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 100%',
              end: 'right 0%',
              scrub: true,
              invalidateOnRefresh: true,
            }
          }
        )
        cardScrollTriggers.push(imgTween.scrollTrigger)
      }
    })

    // Refresh dimensions after images load
    const images = track.querySelectorAll('img')
    const handleLoad = () => ScrollTrigger.refresh()
    images.forEach(img => {
      if (img.complete) {
        handleLoad()
      } else {
        img.addEventListener('load', handleLoad, { once: true })
        img.addEventListener('error', handleLoad, { once: true })
      }
    })

    // Handle resize
    const handleResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', handleResize)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill()
      scrollTween.kill()
      cardScrollTriggers.forEach(st => st && st.kill())
      images.forEach(img => {
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleLoad)
      })
      window.removeEventListener('resize', handleResize)
    }
  }, [achievements])

  return (
    <section
      ref={achSectionRef}
      className="achievements-section bg-army-dark border-b border-gold/[0.05] flex flex-col relative overflow-hidden"
    >
      {/* Three.js Background Particles */}
      <AchievementsParticles sectionRef={achSectionRef} progress={scrollProgress} />

      {/* Header - always visible during pin */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-14 md:pt-16 pb-4 md:pb-6">
        <div className="flex justify-between items-end w-full flex-wrap gap-4">
          <div>
            <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.35em] text-gold/50 uppercase mb-1">
              NSUT NCC &mdash; Unit Excellence
            </p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-wide text-cream relative">
              Achievements
              <span className="block w-[50px] h-[3px] bg-gradient-to-r from-gold to-transparent mt-2 rounded-full" />
            </h2>
            <p className="text-cream/50 text-xs md:text-sm mt-2 max-w-[600px]">
              Honoring milestones, credentials, and exceptional service of our cadets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.55rem] tracking-[0.2em] text-ncc-muted">
              {String(achActive + 1).padStart(2, '0')}/{String(achievements.length).padStart(2, '0')}
            </span>
            {isAdmin && (
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary font-mono text-xs py-2 px-4 rounded-xl shadow-md border-none flex items-center gap-1.5 cursor-pointer z-30"
              >
                <span>{'\u{1F3C6}'}</span>
                <span>{showAddForm ? 'Close' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>

        {isAdmin && showAddForm && (
          <form onSubmit={handleAddAchievement} className="relative z-30 mt-6 w-full max-w-[600px] glass-card-dark p-5 md:p-6 flex flex-col gap-4 border border-gold/20 rounded-[20px] text-cream text-left animate-page-in">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base md:text-lg font-bold text-gold">New Achievement</h3>
              <span className="font-mono text-[0.4rem] tracking-[0.3em] text-cream/20 uppercase border border-cream/10 px-2 py-0.5 rounded">Admin Only</span>
            </div>
            <div className="w-full h-px bg-gold/10" />
            {errorMsg && <div className="bg-ncc-red/15 border border-ncc-red/35 text-ncc-red-light text-xs p-3 rounded-lg flex items-center gap-2">{'\u26A0'} {errorMsg}</div>}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] md:text-[10px] font-mono text-gold/75 tracking-wider uppercase">Title</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Cadet Name — Award" className="glass-input p-2 md:p-2.5 rounded-lg text-xs md:text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] md:text-[10px] font-mono text-gold/75 tracking-wider uppercase">Tag</label>
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="e.g. BMC COMPLETION" className="glass-input p-2 md:p-2.5 rounded-lg text-xs md:text-sm" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] md:text-[10px] font-mono text-gold/75 tracking-wider uppercase">Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the milestone..." className="glass-input p-2 md:p-2.5 rounded-lg text-xs md:text-sm h-20 md:h-24 resize-none" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] md:text-[10px] font-mono text-gold/75 tracking-wider uppercase">Image</label>
              <input type="file" accept="image/*" onChange={e => setNewImage(e.target.files[0])} className="text-[0.65rem] md:text-xs text-cream/70 file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-lg file:border-0 file:text-[0.6rem] md:file:text-xs file:font-mono file:bg-gold/15 file:text-gold file:hover:bg-gold/25 file:cursor-pointer" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-gold font-mono text-[0.7rem] md:text-xs w-full py-2 md:py-2.5 rounded-xl cursor-pointer mt-1 md:mt-2 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>{'\u{1F504}'} Publishing...</>
              ) : (
                <>{'\u2694'} Publish Achievement</>
              )}
            </button>
          </form>
        )}

        {/* Active card indicator */}
        <div className="mt-4 md:mt-5 flex items-center gap-4">
          <div className="flex gap-1.5 flex-1">
            {achievements.map((_, idx) => (
              <div
                key={idx}
                className={`h-[3px] flex-1 rounded-full transition-all duration-700 ease-out ${idx <= achActive ? 'bg-gold/70 shadow-[0_0_6px_rgba(201,168,76,0.3)]' : 'bg-white/[0.05]'}`}
              />
            ))}
          </div>
          <span className="font-mono text-[0.5rem] tracking-[0.2em] text-ncc-muted/60 whitespace-nowrap">
            {String(achActive + 1).padStart(2, '0')} / {String(achievements.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Scrollable track */}
      <div className="achievements-viewport relative z-10 flex-1">
        <div ref={achTrackRef} className="achievements-track flex items-center">
          {achLoading ? (
            <div className="flex items-center justify-center" style={{ width: '100vw', minHeight: '300px' }}>
              <div className="spinner" />
            </div>
          ) : achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 text-cream/40" style={{ width: '100vw', minHeight: '300px' }}>
              <span className="text-3xl">{'\u{1F3C6}'}</span>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase">No achievements recorded yet</p>
            </div>
          ) : (
            achievements.map((ach) => (
              <div key={ach.id} className="achievement-card preserve-3d">
                <div className="achievement-card-img overflow-hidden relative">
                  <img
                    src={ach.image_path || ach.image}
                    alt={ach.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fb = e.currentTarget.parentElement?.querySelector('.img-fallback')
                      if (fb) fb.classList.remove('hidden')
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="img-fallback hidden absolute inset-0 flex-col items-center justify-center bg-army-deep text-cream/30">
                    <span className="text-3xl mb-1">{'\u{1F3C6}'}</span>
                    <span className="font-mono text-[0.5rem] tracking-[0.2em]">IMAGE UNAVAILABLE</span>
                  </div>
                  <span className="achievement-card-tag">{ach.tag}</span>
                </div>
                <div className="achievement-card-content">
                  <div>
                    <h3 className="achievement-card-title">{ach.title}</h3>
                    <p className="achievement-card-desc">{ach.description || ach.desc}</p>
                  </div>
                  <div className="achievement-card-footer">
                    <span className="achievement-card-footer-left">NSUT NCC &middot; UNIT LOG</span>
                    <span className="achievement-card-footer-right">
                      <span className="achievement-card-footer-dot" />
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
