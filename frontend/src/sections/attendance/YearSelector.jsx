const YEARS = [
  { value: '1', roman: 'I', label: '1st Year', sub: 'BATCH I' },
  { value: '2', roman: 'II', label: '2nd Year', sub: 'BATCH II' },
  { value: '3', roman: 'III', label: '3rd Year', sub: 'BATCH III' },
]

export default function YearSelector({ selectedYear, onSelect }) {
  return (
    <section className="animate-fade-up">
      <h2 className="font-heading text-2xl font-bold tracking-widest text-cream mb-6">
        SELECT CADET YEAR
      </h2>
      <div className="flex gap-5 flex-wrap">
        {YEARS.map((yr, i) => (
          <button
            key={yr.value}
            onClick={() => onSelect(yr.value)}
            className={`
              relative overflow-hidden flex flex-col items-center justify-center gap-1
              w-36 h-36 md:w-48 md:h-48 rounded-xl backdrop-blur-sm cursor-pointer
              border-[1.5px] transition-all duration-300
              hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              ${selectedYear === yr.value
                ? 'border-gold bg-army-mid/70 shadow-[0_0_0_2px_rgba(201,168,76,0.25),0_16px_48px_rgba(0,0,0,0.5)]'
                : 'border-white/[0.07] bg-white/[0.04] hover:border-gold/[0.35]'
              }
            `}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="font-heading text-5xl md:text-6xl font-bold text-gold leading-none">
              {yr.roman}
            </span>
            <span className="font-heading text-base font-semibold tracking-wide text-cream">
              {yr.label}
            </span>
            <span className="font-mono text-[0.56rem] tracking-[0.18em] text-ncc-dim">
              {yr.sub}
            </span>
            {/* Shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          </button>
        ))}
      </div>
    </section>
  )
}
