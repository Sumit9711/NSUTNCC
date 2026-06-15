import { useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-reveal animations using IntersectionObserver.
 * Returns a ref to attach to the container element.
 * All children with [data-animate] will be revealed on scroll.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll('[data-animate]')
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: options.threshold || 0.12,
        rootMargin: options.rootMargin || '0px 0px -40px 0px',
      }
    )

    targets.forEach((target) => observer.observe(target))

    return () => {
      targets.forEach((target) => observer.unobserve(target))
    }
  }, [options.threshold, options.rootMargin])

  return ref
}
