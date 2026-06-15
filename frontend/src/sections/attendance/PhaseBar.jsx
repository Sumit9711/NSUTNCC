export default function PhaseBar({ phase, onGoPhase }) {
  const phases = [
    { num: 1, label: 'Year' },
    { num: 2, label: 'Month' },
    { num: 3, label: 'Register' },
  ]

  return (
    <div className="sticky top-[57px] z-[60] border-b border-gold/10 backdrop-blur-xl" style={{ background: 'rgba(8,14,8,0.9)' }}>
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-3 flex items-center">
        {phases.map((p, i) => (
          <div key={p.num} className="contents">
            <button
              onClick={() => onGoPhase(p.num)}
              className={`flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] cursor-pointer shrink-0 transition-colors duration-200 bg-transparent border-none ${
                phase === p.num ? 'text-gold-bright'
                : p.num < phase ? 'text-ncc-green-ok-light'
                : 'text-ncc-dim hover:text-ncc-muted'
              }`}
            >
              <span className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[0.62rem] font-bold shrink-0 transition-all ${
                phase === p.num ? 'bg-gold/[0.18] border-gold'
                : p.num < phase ? 'bg-ncc-green-ok/[0.18] border-ncc-green-ok'
                : 'border-current'
              }`}>
                {p.num < phase ? '✓' : p.num}
              </span>
              <span className="hidden md:inline">{p.label}</span>
            </button>
            {i < phases.length - 1 && (
              <div className="flex-1 h-px bg-white/[0.06] mx-3 min-w-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
