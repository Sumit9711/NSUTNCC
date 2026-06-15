/**
 * AuthPage — Glassmorphism authentication page with Sign In, Sign Up, and Forgot Password flows.
 * Uses GSAP animations for premium transitions between modes.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../contexts/AuthContext'

const MODES = { SIGNIN: 'signin', SIGNUP: 'signup', FORGOT: 'forgot', RESET: 'reset' }

export default function AuthPage() {
  const { isAuthenticated, signup, signin, forgotPassword, resetPassword, authLoading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.SIGNIN)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', text }
  const [resetEmail, setResetEmail] = useState('')

  // Form state
  const [form, setForm] = useState({
    email: '', dli_number: '', password: '', confirm_password: '',
    identifier: '', code: '', new_password: '', confirm_new: '',
  })

  const cardRef = useRef(null)
  const formRef = useRef(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  // Entrance animation
  useEffect(() => {
    if (!cardRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.auth-orb', {
        scale: 0, opacity: 0, duration: 1.2,
        stagger: 0.2, ease: 'power2.out',
      })
      gsap.from(cardRef.current, {
        y: 60, opacity: 0, scale: 0.95,
        duration: 0.8, delay: 0.2, ease: 'power3.out',
      })
      gsap.from('.auth-title-anim', {
        y: 20, opacity: 0, duration: 0.6, delay: 0.5,
        ease: 'power2.out',
      })
    })
    return () => ctx.revert()
  }, [])

  // Animate form transition on mode change
  useEffect(() => {
    if (!formRef.current) return
    gsap.fromTo(formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }, [mode])

  const clearFeedback = () => setFeedback(null)

  const updateForm = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    clearFeedback()
  }

  const switchMode = (newMode) => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0, y: -15, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          setMode(newMode)
          clearFeedback()
        }
      })
    } else {
      setMode(newMode)
      clearFeedback()
    }
  }

  // ── Handlers ───────────────────────────────────────
  const handleSignup = useCallback(async (e) => {
    e.preventDefault()
    const result = await signup(form.email, form.dli_number, form.password, form.confirm_password)
    if (result.success) {
      setFeedback({ type: 'success', text: 'Account created! Redirecting...' })
      setTimeout(() => navigate('/'), 1000)
    } else {
      setFeedback({ type: 'error', text: result.error })
    }
  }, [form, signup, navigate])

  const handleSignin = useCallback(async (e) => {
    e.preventDefault()
    const result = await signin(form.identifier, form.password)
    if (result.success) {
      setFeedback({ type: 'success', text: 'Welcome back! Redirecting...' })
      setTimeout(() => navigate('/'), 800)
    } else {
      setFeedback({ type: 'error', text: result.error })
    }
  }, [form, signin, navigate])

  const handleForgotPassword = useCallback(async (e) => {
    e.preventDefault()
    const result = await forgotPassword(form.email)
    if (result.success) {
      setResetEmail(result.email)
      setFeedback({ type: 'success', text: result.message })
      setTimeout(() => switchMode(MODES.RESET), 1200)
    } else {
      setFeedback({ type: 'error', text: result.error })
    }
  }, [form.email, forgotPassword])

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault()
    const result = await resetPassword(resetEmail, form.code, form.new_password, form.confirm_new)
    if (result.success) {
      setFeedback({ type: 'success', text: 'Password reset! Redirecting to login...' })
      setTimeout(() => switchMode(MODES.SIGNIN), 1500)
    } else {
      setFeedback({ type: 'error', text: result.error })
    }
  }, [form, resetEmail, resetPassword])

  // ── Render ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10"
      style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(30,58,30,0.5) 0%, #0e1a0e 55%), #0e1a0e',
      }}
    >
      {/* Animated background orbs */}
      <div className="auth-orb absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full animate-orb-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(61,139,61,0.12) 0%, transparent 70%)' }} />
      <div className="auth-orb absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full animate-orb-float-reverse pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
      <div className="auth-orb absolute top-[60%] left-[60%] w-[200px] h-[200px] rounded-full animate-orb-float-slow pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(61,139,61,0.08) 0%, transparent 70%)' }} />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }}
      />

      {/* Glassmorphism Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Glass card */}
        <div className="glass-auth rounded-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8 auth-title-anim">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1.5px solid rgba(201,168,76,0.25)',
                boxShadow: '0 0 30px rgba(201,168,76,0.15)',
              }}
            >
              <span className="text-2xl select-none">⚔</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-[0.15em]"
              style={{
                background: 'linear-gradient(135deg, #e8c76a 0%, #c9a84c 40%, #8a6d28 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {mode === MODES.SIGNIN && 'SIGN IN'}
              {mode === MODES.SIGNUP && 'CREATE ACCOUNT'}
              {mode === MODES.FORGOT && 'FORGOT PASSWORD'}
              {mode === MODES.RESET && 'RESET PASSWORD'}
            </h1>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-ncc-muted mt-1.5">
              {mode === MODES.SIGNIN && 'ENTER YOUR CREDENTIALS'}
              {mode === MODES.SIGNUP && 'REGISTER AS A NEW CADET'}
              {mode === MODES.FORGOT && 'ENTER YOUR REGISTERED EMAIL'}
              {mode === MODES.RESET && 'ENTER THE CODE FROM YOUR EMAIL'}
            </p>
          </div>

          {/* Feedback toast */}
          {feedback && (
            <div className={`glass-toast mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-up ${
              feedback.type === 'success'
                ? 'border-ncc-green-ok/40 text-ncc-green-ok-light'
                : 'border-ncc-red/40 text-ncc-red-light'
            }`}
              style={{
                background: feedback.type === 'success'
                  ? 'rgba(39,174,96,0.1)'
                  : 'rgba(192,57,43,0.1)',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-base">{feedback.type === 'success' ? '✓' : '⚠'}</span>
              <span className="font-body text-[0.82rem]">{feedback.text}</span>
            </div>
          )}

          {/* Form */}
          <div ref={formRef}>
            {mode === MODES.SIGNIN && (
              <form onSubmit={handleSignin} className="space-y-4">
                <GlassInput
                  label="Email or DLI Number"
                  type="text"
                  value={form.identifier}
                  onChange={(v) => updateForm('identifier', v)}
                  placeholder="cadet@gmail.com or DL2024..."
                  autoFocus
                />
                <GlassInput
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => updateForm('password', v)}
                  placeholder="••••••••"
                />
                <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center mt-2 disabled:opacity-50">
                  {authLoading ? 'Signing In...' : 'SIGN IN'}
                </button>

                <div className="flex items-center justify-between mt-4">
                  <button type="button" onClick={() => switchMode(MODES.FORGOT)}
                    className="font-mono text-[0.65rem] text-gold/70 hover:text-gold transition-colors bg-transparent border-none cursor-pointer tracking-wider">
                    Forgot Password?
                  </button>
                  <button type="button" onClick={() => switchMode(MODES.SIGNUP)}
                    className="font-mono text-[0.65rem] text-gold hover:text-gold-bright transition-colors bg-transparent border-none cursor-pointer tracking-wider">
                    Create Account →
                  </button>
                </div>
              </form>
            )}

            {mode === MODES.SIGNUP && (
              <form onSubmit={handleSignup} className="space-y-4">
                <GlassInput
                  label="Gmail Address"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="cadet@gmail.com"
                  autoFocus
                />
                <GlassInput
                  label="DLI Number"
                  type="text"
                  value={form.dli_number}
                  onChange={(v) => updateForm('dli_number', v)}
                  placeholder="DL2024SDIA1440189"
                />
                <GlassInput
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => updateForm('password', v)}
                  placeholder="Minimum 6 characters"
                />
                <GlassInput
                  label="Confirm Password"
                  type="password"
                  value={form.confirm_password}
                  onChange={(v) => updateForm('confirm_password', v)}
                  placeholder="Re-enter password"
                />
                <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center mt-2 disabled:opacity-50">
                  {authLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => switchMode(MODES.SIGNIN)}
                    className="font-mono text-[0.65rem] text-gold hover:text-gold-bright transition-colors bg-transparent border-none cursor-pointer tracking-wider">
                    ← Already have an account? Sign In
                  </button>
                </div>
              </form>
            )}

            {mode === MODES.FORGOT && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <GlassInput
                  label="Registered Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="cadet@gmail.com"
                  autoFocus
                />
                <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center mt-2 disabled:opacity-50">
                  {authLoading ? 'Sending Code...' : 'SEND RESET CODE'}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => switchMode(MODES.SIGNIN)}
                    className="font-mono text-[0.65rem] text-gold hover:text-gold-bright transition-colors bg-transparent border-none cursor-pointer tracking-wider">
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {mode === MODES.RESET && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="glass-toast px-3 py-2 rounded-lg mb-2 text-center"
                  style={{
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}
                >
                  <span className="font-mono text-[0.62rem] text-gold/80 tracking-wider">
                    Code sent to: {resetEmail}
                  </span>
                </div>
                <GlassInput
                  label="Reset Code"
                  type="text"
                  value={form.code}
                  onChange={(v) => updateForm('code', v)}
                  placeholder="6-digit code"
                  autoFocus
                  maxLength={6}
                />
                <GlassInput
                  label="New Password"
                  type="password"
                  value={form.new_password}
                  onChange={(v) => updateForm('new_password', v)}
                  placeholder="Minimum 6 characters"
                />
                <GlassInput
                  label="Confirm New Password"
                  type="password"
                  value={form.confirm_new}
                  onChange={(v) => updateForm('confirm_new', v)}
                  placeholder="Re-enter new password"
                />
                <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center mt-2 disabled:opacity-50">
                  {authLoading ? 'Resetting...' : 'RESET PASSWORD'}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => switchMode(MODES.SIGNIN)}
                    className="font-mono text-[0.65rem] text-gold hover:text-gold-bright transition-colors bg-transparent border-none cursor-pointer tracking-wider">
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Decorative border glow */}
        <div className="absolute -inset-[1px] rounded-2xl -z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, transparent 40%, rgba(61,139,61,0.15) 100%)',
          }}
        />
      </div>
    </div>
  )
}


// ── Glass Input Component ────────────────────────────
function GlassInput({ label, type, value, onChange, placeholder, autoFocus, maxLength }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[0.6rem] tracking-[0.15em] text-gold/70 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="glass-input w-full px-4 py-3 rounded-xl text-sm text-cream font-body outline-none transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${focused ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
          backdropFilter: 'blur(8px)',
          boxShadow: focused ? '0 0 20px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      />
    </div>
  )
}
