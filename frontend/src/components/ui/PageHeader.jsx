export default function PageHeader({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <header className={`relative py-10 px-6 md:px-8 border-b border-gold/[0.12] overflow-hidden ${className}`}>
      {/* Grid lines background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gold line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-[1300px] mx-auto relative flex items-start justify-between flex-wrap gap-4">
        <div>
          {eyebrow && (
            <p className="font-mono text-[0.6rem] tracking-[0.25em] text-gold/70 mb-1">{eyebrow}</p>
          )}
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest leading-none"
            style={{
              background: 'linear-gradient(135deg, #e8c76a 0%, #c9a84c 40%, #8a6d28 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="font-mono text-[0.65rem] text-ncc-muted tracking-widest mt-1.5">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </header>
  )
}
