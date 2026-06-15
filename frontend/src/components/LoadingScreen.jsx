import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LOADING_MESSAGES = [
  'VERIFYING CREDENTIALS',
  'LOADING SYSTEMS',
  'ESTABLISHING CONNECTION',
  'INITIALIZING MODULES',
  'CALIBRATING INTERFACE',
  'SYSTEM READY',
]

export default function LoadingScreen({ onComplete }) {
  const containerRef = useRef(null)
  const progressRef = useRef(null)
  const completed = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const messages = container.querySelectorAll('.ls-msg')
    const progressFill = container.querySelector('.ls-progress-fill')

    const tl = gsap.timeline({
      onComplete: () => {
        if (!completed.current) {
          completed.current = true
          onComplete?.()
        }
      }
    })

    tl.set(container, { opacity: 1 })

    // Phase 1: Grid + ambient glow fade in (0-1s)
    tl.from('.ls-grid', { opacity: 0, duration: 0.8, ease: 'power2.out' })
    tl.from('.ls-ambient', { opacity: 0, duration: 1.2 }, '-=0.6')

    // Phase 2: Emblem reveal with dramatic entrance (1-3s)
    tl.fromTo('.ls-emblem', { scale: 0, rotation: -90, opacity: 0 }, {
      scale: 1, rotation: 0, opacity: 1, duration: 1.8,
      ease: 'elastic.out(0.9, 0.4)',
    }, '-=0.5')
    tl.fromTo('.ls-emblem-ring', { scale: 0.8, opacity: 1 }, {
      scale: 2.5, opacity: 0, duration: 2.2,
      ease: 'power2.out',
    }, '-=1.5')
    tl.from('.ls-emblem-glow', { opacity: 0, duration: 1.5 }, '-=1.5')

    // Phase 3: NSUT NCC title (3-4.5s)
    tl.from('.ls-title', {
      y: 50, opacity: 0, duration: 1.2,
      ease: 'power3.out',
    }, '-=0.3')
    tl.from('.ls-title-accent', { scaleX: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')

    // Phase 3.5: 6DBN badge (4-5s)
    tl.from('.ls-badge', {
      y: 20, opacity: 0, duration: 0.8,
      ease: 'power2.out',
    }, '-=0.4')

    // Phase 4: Subtitle (4.5-5.5s)
    tl.from('.ls-subtitle', {
      y: 20, opacity: 0, duration: 0.8,
      ease: 'power2.out',
    }, '-=0.3')

    // Phase 5: Status messages cycle (5.5-8.5s)
    messages.forEach((msg, i) => {
      tl.fromTo(msg, { opacity: 0, y: 8 }, { opacity: 0.7, y: 0, duration: 0.3, ease: 'power1.out' })
      if (i === messages.length - 1) {
        tl.to(msg, { opacity: 1, duration: 0.2 }, '+=0.1')
      } else {
        tl.to(msg, { opacity: 0, y: -4, duration: 0.25 }, '+=0.6')
      }
    })

    // Phase 6: Progress bar fills (8.5-9.5s)
    tl.to(progressFill, {
      width: '100%', duration: 1.2,
      ease: 'power2.inOut',
    }, '-=0.5')

    // Phase 7: Dramatic exit (9.5-11s)
    tl.to('.ls-emblem', { scale: 1.05, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.2')
    tl.to('.ls-title', { y: -15, opacity: 0, duration: 0.4 }, '-=0.3')
    tl.to('.ls-badge', { opacity: 0, duration: 0.3 }, '-=0.3')
    tl.to('.ls-subtitle', { opacity: 0, duration: 0.3 }, '-=0.3')
    tl.to('.ls-msg-5', { opacity: 0, duration: 0.3 }, '-=0.3')
    tl.to(container, { opacity: 0, duration: 0.6, ease: 'power2.in' }, '-=0.2')

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(30,58,30,0.6) 0%, #0a140a 60%)',
      }}
    >
      {/* Grid background */}
      <div
        className="ls-grid absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="ls-ambient absolute pointer-events-none opacity-0"
        style={{
          width: '80vmax',
          height: '80vmax',
          background: 'radial-gradient(circle, rgba(61,139,61,0.08) 0%, transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Emblem */}
      <div className="ls-emblem relative mb-8">
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
          style={{
            border: '2px solid rgba(201,168,76,0.3)',
            background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
            boxShadow: '0 0 60px rgba(201,168,76,0.15), inset 0 0 30px rgba(201,168,76,0.08)',
          }}
        >
          <span className="text-4xl md:text-5xl select-none drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]">{'\u2694'}</span>
        </div>
        <div
          className="ls-emblem-ring absolute -inset-4 rounded-full opacity-0"
          style={{ border: '1px solid rgba(201,168,76,0.15)' }}
        />
        <div
          className="ls-emblem-glow absolute -inset-8 rounded-full opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Title */}
      <h1
        className="ls-title font-heading text-3xl md:text-5xl font-bold tracking-[0.2em] mb-2"
        style={{
          background: 'linear-gradient(135deg, #f0d878 0%, #c9a84c 40%, #8a6d28 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.2))',
        }}
      >
        NSUT NCC
      </h1>

      {/* Accent line */}
      <div
        className="ls-title-accent w-16 h-[2px] mb-3"
        style={{
          background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
          transformOrigin: 'left center',
          scaleX: 0,
        }}
      />

      {/* 6DBN Badge */}
      <p className="ls-badge font-mono text-[0.5rem] md:text-[0.6rem] tracking-[0.35em] text-gold/60 mb-4 select-none">
        {'⚔'} 6DBN NCC {'⚔'}
      </p>

      <p className="ls-subtitle font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.35em] text-gold/50 mb-10">
        DEFENSE HUB &bull; INITIALIZING
      </p>

      {/* Status messages */}
      <div className="flex flex-col gap-2 items-center mb-8 min-h-[80px] justify-center">
        {LOADING_MESSAGES.map((text, i) => (
          <span
            key={text}
            className={`ls-msg ls-msg-${i} font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.25em] text-cream/50 absolute opacity-0`}
          >
            {text}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-48 md:w-56 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="ls-progress-fill h-full rounded-full"
          style={{
            width: '0%',
            background: 'linear-gradient(90deg, #6b8f3a, #c9a84c, #f0d878)',
            boxShadow: '0 0 12px rgba(201,168,76,0.3)',
          }}
        />
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.4rem] tracking-[0.4em] text-cream/15 uppercase select-none">
        National Cadet Corps &bull; NSUT
      </div>
    </div>
  )
}
