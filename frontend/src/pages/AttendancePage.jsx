import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/ui/PageHeader'
import PhaseBar from '../sections/attendance/PhaseBar'
import YearSelector from '../sections/attendance/YearSelector'
import MonthPicker from '../sections/attendance/MonthPicker'
import AttendanceRegister from '../sections/attendance/AttendanceRegister'

export default function AttendancePage() {
  const [phase, setPhase] = useState(1)
  const [year, setYear] = useState(null)       // '1' | '2' | '3'
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(null)      // 1-12

  const goPhase = useCallback((n) => {
    if (n >= 2 && !year) return
    if (n >= 3 && !month) return
    setPhase(n)
  }, [year, month])

  const handleYearSelect = useCallback((y) => {
    setYear(y)
    setTimeout(() => setPhase(2), 300)
  }, [])

  const handleMonthSelect = useCallback((m) => {
    setMonth(m)
    setTimeout(() => setPhase(3), 260)
  }, [])

  const MONTHS_FULL = useMemo(() => [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ], [])

  return (
    <div className="min-h-screen pb-24" style={{
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(40,75,28,0.35) 0%, transparent 60%), linear-gradient(170deg, #060b06 0%, #080d08 50%, #070c07 100%)'
    }}>
      {/* Header */}
      <PageHeader
        eyebrow="NSUT NCC — ADMIN PANEL"
        title="ATTENDANCE"
        subtitle="Select year → month → manage sessions & mark cadets"
      >
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`font-mono text-[0.65rem] tracking-[0.12em] px-3 py-1 rounded-full border transition-all ${
            year ? 'bg-army-mid/60 border-gold text-gold-bright' : 'bg-gold/[0.08] border-gold/20 text-gold'
          }`}>
            {year ? `Year ${year}` : 'Year —'}
          </span>
          <span className="text-ncc-dim text-sm">›</span>
          <span className={`font-mono text-[0.65rem] tracking-[0.12em] px-3 py-1 rounded-full border transition-all ${
            month ? 'bg-army-mid/60 border-gold text-gold-bright' : 'bg-gold/[0.08] border-gold/20 text-gold'
          }`}>
            {month ? `${MONTHS_FULL[month - 1]} ${calYear}` : 'Month —'}
          </span>
        </div>
      </PageHeader>

      {/* Phase Bar */}
      <PhaseBar phase={phase} onGoPhase={goPhase} />

      {/* Body */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 pt-6">
        {/* Phase 1: Year */}
        {phase === 1 && (
          <YearSelector selectedYear={year} onSelect={handleYearSelect} />
        )}

        {/* Phase 2: Month */}
        {phase === 2 && (
          <MonthPicker
            calYear={calYear}
            setCalYear={setCalYear}
            selectedMonth={month}
            onSelect={handleMonthSelect}
            onBack={() => goPhase(1)}
          />
        )}

        {/* Phase 3: Register */}
        {phase === 3 && (
          <AttendanceRegister
            year={year}
            calYear={calYear}
            month={month}
            onBack={() => goPhase(2)}
          />
        )}
      </div>
    </div>
  )
}
