import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QUICK_NAV = [
  { path: '/cadets', icon: '👥', title: 'Cadets', desc: 'Browse all cadets by year' },
  { path: '/ranks', icon: '🎖', title: 'Ranks', desc: 'Rank holders & hierarchy' },
  { path: '/uniform', icon: '👔', title: 'Uniform', desc: 'Complete uniform guide' },
  { path: '/attendance', icon: '📋', title: 'Attendance', desc: 'Track parade attendance' },
  { path: '/events', icon: '📅', title: 'Events', desc: 'Upcoming NCC events' },
  { path: '/admin', icon: '⚙', title: 'Admin Tools', desc: 'Nominal roll & more', isAdmin: true },
]

const STATS = [
  { value: '3', label: 'Years' },
  { value: '∞', label: 'Spirit' },
  { value: '1', label: 'Battalion' },
]

export default function HomePage() {
  const heroRef = useRef(null)
  const quickNavRef = useRef(null)
  const statsRef = useRef(null)
  const counterRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text entrance
      gsap.from('.hero-badge-anim', {
        opacity: 0, y: 30, duration: 0.7, delay: 0.2,
        ease: 'power3.out',
      })
      gsap.from('.hero-title-anim', {
        opacity: 0, x: -40, duration: 0.9, delay: 0.35,
        ease: 'power3.out',
      })
      gsap.from('.hero-subtitle-anim', {
        opacity: 0, x: -40, duration: 0.8, delay: 0.5,
        ease: 'power3.out',
      })
      gsap.from('.hero-desc-anim', {
        opacity: 0, y: 20, duration: 0.7, delay: 0.65,
        ease: 'power2.out',
      })
      gsap.from('.hero-cta-anim', {
        opacity: 0, y: 20, duration: 0.7, delay: 0.8,
        ease: 'power2.out',
      })

      // Hero image entrance
      gsap.from('.hero-visual-anim', {
        opacity: 0, x: 40, scale: 0.95, duration: 1, delay: 0.3,
        ease: 'power3.out',
      })

      // Stat chips stagger
      gsap.from('.stat-chip-anim', {
        opacity: 0, y: 30, scale: 0.9, duration: 0.6,
        stagger: 0.12, delay: 0.9,
        ease: 'back.out(1.7)',
      })

      // Scroll hint
      gsap.from('.scroll-hint-anim', {
        opacity: 0, duration: 1, delay: 1.5,
      })

      // Quick nav section — scroll triggered
      gsap.from('.section-title-anim', {
        scrollTrigger: {
          trigger: '.quick-nav-section',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0, y: 40, duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.qn-card-anim', {
        scrollTrigger: {
          trigger: '.quick-nav-section',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        opacity: 0, y: 50, scale: 0.95, duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Animated counter for stats with numeric values
  useEffect(() => {
    const counters = counterRefs.current
    counters.forEach((el) => {
      if (!el) return
      const target = el.dataset.value
      if (!target || isNaN(target)) return
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: parseInt(target),
          duration: 1.5,
          delay: 1,
          ease: 'power2.out',
          snap: { textContent: 1 },
        }
      )
    })
  }, [])

  return (
    <div ref={heroRef}>
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="min-h-screen flex items-center relative overflow-hidden py-24 md:py-16 px-4 md:px-8">
        {/* Grid background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(61,139,61,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,139,61,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
          }}
        />

        <div className="max-w-[1200px] mx-auto flex items-center gap-8 md:gap-16 flex-wrap relative z-[1] w-full">
          {/* Text side */}
          <div className="flex-1 min-w-[300px] flex flex-col gap-5">
            <div className="hero-badge-anim inline-block w-fit bg-gold/[0.15] border border-gold/[0.35] text-gold px-3.5 py-1 rounded-full text-xs font-semibold tracking-[1.5px] uppercase">
              National Cadet Corps · NSUT
            </div>

            <h1 className="font-display flex flex-col leading-[1.1]">
              <span
                className="hero-title-anim text-[clamp(3rem,7vw,5.5rem)] font-bold tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #f5f0e0, #5faf5f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                NSUTNCC
              </span>
              <span className="hero-subtitle-anim text-[clamp(1.3rem,3vw,2rem)] font-medium text-gold tracking-[4px]">
                Defense Hub
              </span>
            </h1>

            <p className="hero-desc-anim text-cream/65 text-lg max-w-[420px]">
              Empowering NSUT cadets to lead, serve, and succeed. One battalion, one spirit.
            </p>

            <div className="hero-cta-anim flex gap-4 flex-wrap">
              <Link to="/cadets" className="btn-primary no-underline">View Cadets</Link>
              <Link to="/ranks" className="btn-ghost no-underline">Our Ranks</Link>
            </div>
          </div>

          {/* Visual side */}
          <div className="hero-visual-anim flex-1 min-w-[280px] flex flex-col gap-4 items-center">
            <div className="relative inline-block">
              <img
                src="/static/NCC.jpg"
                alt="NSUT NCC"
                className="w-full max-w-[420px] rounded-[20px] border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] block"
              />
              <div
                className="absolute -inset-2.5 rounded-[28px] -z-10 animate-glow-pulse"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(61,139,61,0.2), transparent 70%)',
                }}
              />
            </div>

            {/* Stats */}
            <div ref={statsRef} className="flex gap-3">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="stat-chip-anim flex flex-col items-center glass-card px-4 py-2.5 rounded-xl min-w-[70px]"
                >
                  <span
                    ref={(el) => (counterRefs.current[i] = el)}
                    data-value={stat.value}
                    className="font-display text-xl font-bold text-gold"
                  >
                    {stat.value}
                  </span>
                  <span className="text-[0.7rem] text-cream/65 tracking-wide uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint-anim absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-cream/65 text-[0.72rem] tracking-[2px] uppercase animate-scroll-bounce">
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ── QUICK NAV SECTION ────────────────────── */}
      <section className="quick-nav-section py-20 px-4 md:px-8 relative z-[1]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="section-title-anim section-title">Quick Access</h2>

          <div ref={quickNavRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_NAV.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  qn-card-anim group
                  flex flex-col items-start gap-2 p-5
                  glass-card rounded-[22px] no-underline text-inherit
                  transition-all duration-300 relative overflow-hidden
                  hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]
                  ${item.isAdmin
                    ? 'border-gold/20 hover:border-gold/50'
                    : 'hover:border-army-bright/40'
                  }
                `}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-army-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="text-3xl leading-none">{item.icon}</div>
                <h3 className="font-display text-[1.05rem] font-bold text-cream tracking-wide">
                  {item.title}
                </h3>
                <p className="text-[0.78rem] text-cream/65">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
