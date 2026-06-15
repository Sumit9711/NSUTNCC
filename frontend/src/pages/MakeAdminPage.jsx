/**
 * MakeAdminPage — Admin-only page to promote a user to admin by DLI number.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import PageHeader from '../components/ui/PageHeader'
import { authApi } from '../utils/api'

export default function MakeAdminPage() {
  const [dli, setDli] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type, text }
  const cardRef = useRef(null)

  useEffect(() => {
    if (!cardRef.current) return
    gsap.from(cardRef.current, {
      y: 40, opacity: 0, duration: 0.6, ease: 'power3.out',
    })
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!dli.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a DLI number.' })
      return
    }

    setLoading(true)
    setFeedback(null)
    try {
      const data = await authApi.makeAdmin(dli.trim())
      setFeedback({ type: 'success', text: data.message })
      setDli('')
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [dli])

  return (
    <div className="min-h-screen pb-24 animate-page-in" style={{
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(40,75,28,0.35) 0%, transparent 60%), linear-gradient(170deg, #060b06 0%, #080d08 50%, #070c07 100%)',
    }}>
      <PageHeader
        eyebrow="NSUT NCC — ADMIN OPERATIONS"
        title="MAKE ADMIN"
        subtitle="Promote a registered user to admin role"
      />

      <div className="max-w-[500px] mx-auto px-4 md:px-8 pt-10">
        <div ref={cardRef} className="glass-card-dark p-8 rounded-xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="font-mono text-[0.62rem] text-ncc-muted tracking-wider">
              Enter the DLI number of the user to promote. This action cannot be undone.
            </p>
          </div>

          {feedback && (
            <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-up ${
              feedback.type === 'success'
                ? 'text-ncc-green-ok-light'
                : 'text-ncc-red-light'
            }`}
              style={{
                background: feedback.type === 'success' ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
              }}
            >
              <span>{feedback.type === 'success' ? '✓' : '⚠'}</span>
              <span className="font-body text-[0.82rem]">{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[0.6rem] tracking-[0.15em] text-gold/70 block mb-1.5">
                DLI NUMBER
              </label>
              <input
                type="text"
                value={dli}
                onChange={(e) => { setDli(e.target.value); setFeedback(null) }}
                placeholder="DL2024SDIA..."
                className="w-full px-4 py-3 rounded-xl text-sm text-cream font-body outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center disabled:opacity-50"
            >
              {loading ? 'Processing...' : '⚡ PROMOTE TO ADMIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
