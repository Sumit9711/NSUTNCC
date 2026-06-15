import { useState, useEffect, useCallback } from 'react'

export default function Modal({ isOpen, onClose, title, maxWidth = 'max-w-[860px]', children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => setVisible(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 transition-all duration-200 ${
        isOpen ? 'bg-black/75 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          w-full ${maxWidth} max-h-[88vh] flex flex-col
          rounded-xl border border-gold/20
          backdrop-blur-[24px]
          shadow-[0_24px_80px_rgba(0,0,0,0.7)]
          transition-all duration-300
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-5'}
        `}
        style={{ background: 'rgba(20,36,15,0.75)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <h3 className="font-heading text-xl tracking-widest text-cream">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/[0.07] text-ncc-muted hover:border-ncc-red-light hover:text-ncc-red-light transition-colors flex items-center justify-center cursor-pointer bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
