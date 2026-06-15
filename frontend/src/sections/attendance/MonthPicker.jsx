const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export default function MonthPicker({ calYear, setCalYear, selectedMonth, onSelect, onBack }) {
  return (
    <section className="animate-fade-up">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-heading text-2xl font-bold tracking-widest text-cream">
          SELECT MONTH
        </h2>
        <button onClick={onBack} className="att-btn-outline">← Back</button>
      </div>

      <div className="glass-card-dark p-6">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCalYear((y) => y - 1)}
            className="w-9 h-9 rounded-lg border border-white/[0.07] bg-transparent text-ncc-muted hover:border-gold/30 hover:text-gold-bright cursor-pointer flex items-center justify-center text-lg transition-all"
          >
            ←
          </button>
          <span className="font-heading text-2xl tracking-widest text-cream">{calYear}</span>
          <button
            onClick={() => setCalYear((y) => y + 1)}
            className="w-9 h-9 rounded-lg border border-white/[0.07] bg-transparent text-ncc-muted hover:border-gold/30 hover:text-gold-bright cursor-pointer flex items-center justify-center text-lg transition-all"
          >
            →
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => onSelect(i + 1)}
              className={`
                py-3 px-2 rounded-lg border font-mono text-xs tracking-[0.12em] text-center
                cursor-pointer transition-all duration-200
                ${selectedMonth === i + 1
                  ? 'bg-army-mid/75 border-gold text-gold-bright font-semibold shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                  : 'border-white/[0.07] bg-white/[0.03] text-ncc-muted hover:bg-army-mid/50 hover:text-cream hover:border-gold/25 hover:-translate-y-0.5'
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
