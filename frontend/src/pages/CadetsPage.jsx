import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { cadetsApi } from '../utils/api'

export default function CadetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cadets, setCadets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const selectedYear = searchParams.get('year')

  useEffect(() => {
    if (!selectedYear) return

    async function fetchCadets() {
      setLoading(true)
      setError(null)
      try {
        const res = await cadetsApi.getCadets(selectedYear)
        setCadets(res)
      } catch (err) {
        console.error('Error fetching cadets:', err)
        setError(err.message || 'Failed to load cadets.')
      } finally {
        setLoading(false)
      }
    }
    fetchCadets()
  }, [selectedYear])

  const handleSelectYear = (year) => {
    setSearchParams({ year })
    setSearchTerm('')
  }

  // Filter cadets based on live search query
  const filteredCadets = cadets.filter((c) => {
    const q = searchTerm.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.dli && c.dli.toLowerCase().includes(q)) ||
      (c._rank && c._rank.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone_no && c.phone_no.toLowerCase().includes(q)) ||
      (c.college && c.college.toLowerCase().includes(q)) ||
      (c.unit && c.unit.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-army-dark text-cream flex flex-col pb-20 animate-page-in">
      <PageHeader
        eyebrow="NSUT NCC — BATTALION ROSTER"
        title="OUR CADETS"
        subtitle="Select a batch year to view the cadet roster"
      />

      <main className="flex-1 max-w-[1300px] mx-auto w-full px-4 md:px-8 py-8">
        {/* Year Selector Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { key: 'all', label: 'All Years', img: '/allyr.jpeg' },
            { key: '1', label: '1st Year', img: '/2ndyr.jpeg' },
            { key: '2', label: '2nd Year', img: '/1styr.jpeg' },
            { key: '3', label: '3rd Year', img: '/3rdyr.jpeg' },
          ].map((item) => {
            const isSelected = selectedYear === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleSelectYear(item.key)}
                className={`relative group h-28 md:h-36 rounded-md overflow-hidden border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-gold shadow-lg shadow-gold/20 scale-[1.02] z-10'
                    : 'border-gold/15 hover:border-gold/50 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-army-dark via-army-dark/50 to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <span className="font-heading text-sm md:text-base font-bold text-cream tracking-wide block">
                    {item.label}
                  </span>
                  {isSelected && (
                    <span className="font-mono text-[0.55rem] text-gold-bright tracking-wider uppercase">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* CADETS ROSTER SECTION */}
        {!selectedYear ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-army-deep/30 border border-gold/10 rounded-lg max-w-md mx-auto text-center backdrop-blur-glass">
            <span className="text-3xl mb-4">👆</span>
            <h3 className="font-heading text-lg font-bold tracking-widest text-gold mb-1 uppercase">
              Select A Batch
            </h3>
            <p className="font-mono text-xs text-ncc-muted leading-relaxed">
              Select one of the batch tabs above to retrieve the cadets list from the database command panel.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-9 h-9 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs text-ncc-muted tracking-wider">LOADING ROSTER FILES...</p>
          </div>
        ) : error ? (
          <div className="border border-ncc-red/30 bg-ncc-red/5 text-ncc-red-light p-6 rounded-md text-center max-w-md mx-auto">
            <p className="font-mono text-sm font-semibold mb-2">ROSTER LOADING FAILURE</p>
            <p className="font-body text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 font-mono text-[0.65rem] border border-ncc-red-light/35 px-3 py-1.5 rounded hover:bg-ncc-red/10 transition-colors cursor-pointer"
            >
              RELOAD CONNECTION
            </button>
          </div>
        ) : filteredCadets.length > 0 ? (
          <div className="space-y-4">
            {/* Table Controls (Search & Meta info) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-md border border-gold/10 bg-army-deep/40 backdrop-blur-glass">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gold font-bold">
                  {filteredCadets.length} CADET{filteredCadets.length !== 1 ? 'S' : ''} FOUND
                </span>
                <span className="font-mono text-[0.6rem] bg-gold/10 border border-gold/25 text-gold-bright px-2 py-0.5 rounded uppercase">
                  {selectedYear === 'all' ? 'All Batches' : `Year ${selectedYear}`}
                </span>
              </div>
              <div className="relative w-full md:w-72">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ncc-muted pointer-events-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, DLI, rank, email..."
                  className="w-full pl-9 pr-4 py-2 font-mono text-xs text-cream bg-army-dark/80 border border-gold/20 focus:border-gold focus:outline-none rounded transition-colors placeholder:text-ncc-muted/60"
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-md border border-gold/10 bg-army-deep/20 backdrop-blur-glass shadow-xl">
              <table className="w-full border-collapse text-left font-body">
                <thead>
                  <tr className="border-b border-gold/20 bg-army-green/45 font-mono text-xs text-gold tracking-wider uppercase">
                    <th className="py-4 px-4 font-bold text-center">#</th>
                    <th className="py-4 px-4 font-bold">DLI No</th>
                    <th className="py-4 px-4 font-bold">Rank</th>
                    <th className="py-4 px-4 font-bold">Name</th>
                    <th className="py-4 px-4 font-bold">Phone</th>
                    <th className="py-4 px-4 font-bold">Email</th>
                    <th className="py-4 px-4 font-bold">Unit</th>
                    <th className="py-4 px-4 font-bold">College</th>
                    <th className="py-4 px-4 font-bold text-center">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/[0.08] text-xs">
                  {filteredCadets.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gold/[0.02] transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-ncc-muted">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono text-gold-bright font-medium">{c.dli}</td>
                      <td className="py-3.5 px-4 text-cream/80">{c._rank}</td>
                      <td className="py-3.5 px-4 font-semibold text-cream">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono text-cream/70">{c.phone_no || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono text-ncc-muted select-all truncate max-w-[180px]" title={c.email}>
                        {c.email}
                      </td>
                      <td className="py-3.5 px-4 text-cream/80">{c.unit}</td>
                      <td className="py-3.5 px-4 text-cream/80">{c.college}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-[0.6rem] font-bold bg-army-green text-gold-bright border border-gold/30 px-2 py-0.5 rounded">
                          {c.year}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards Grid View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCadets.map((c, idx) => (
                <div
                  key={c.id}
                  className="rounded border border-gold/10 bg-army-deep/45 p-4 space-y-3.5 shadow-md backdrop-blur-glass relative overflow-hidden"
                >
                  {/* Decorative tag */}
                  <div className="absolute top-0 right-0 w-2 h-full bg-gold/30" />

                  {/* Header info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[0.65rem] text-gold-bright font-bold tracking-wider">
                        #{idx + 1} — DLI: {c.dli}
                      </span>
                      <h4 className="font-heading text-base font-bold text-cream mt-0.5">{c.name}</h4>
                    </div>
                    <span className="font-mono text-[0.6rem] font-bold bg-gold/10 border border-gold/35 text-gold-bright px-2 py-0.5 rounded">
                      Batch {c.year}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gold/[0.08] pt-2 text-[0.7rem]">
                    <div>
                      <p className="font-mono text-[0.55rem] text-ncc-muted uppercase">Rank</p>
                      <p className="text-cream/90 font-medium">{c._rank || 'Cadet'}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[0.55rem] text-ncc-muted uppercase">Unit</p>
                      <p className="text-cream/90 truncate">{c.unit}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-mono text-[0.55rem] text-ncc-muted uppercase">College</p>
                      <p className="text-cream/90 truncate">{c.college}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[0.55rem] text-ncc-muted uppercase">Phone</p>
                      <p className="font-mono text-cream/95">{c.phone_no || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-mono text-[0.55rem] text-ncc-muted uppercase">Email Address</p>
                      <p className="font-mono text-cream/95 select-all truncate">{c.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-army-deep/20 border border-gold/10 rounded-lg max-w-md mx-auto text-center">
            <span className="text-3xl mb-4">🔍</span>
            <h3 className="font-heading text-lg font-bold tracking-widest text-gold mb-1 uppercase">
              No Matches Found
            </h3>
            <p className="font-mono text-xs text-ncc-muted leading-relaxed">
              No cadets in batch {selectedYear === 'all' ? 'all years' : selectedYear} match the query "{searchTerm}". Try a different filter term.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
