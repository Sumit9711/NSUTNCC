import PageHeader from '../components/ui/PageHeader'

export default function ComingSoonPage({ title, icon }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        eyebrow="SYSTEM MODULE"
        title={title}
        subtitle={`RECON & INITIALIZATION FOR ${title.toUpperCase()} SECTION`}
      />
      <main className="flex-1 max-w-[1300px] mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-army-green border border-gold/[0.15] flex items-center justify-center text-5xl md:text-6xl text-gold shadow-lg shadow-black/40 animate-pulse relative z-10">
            {icon}
          </div>
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-wider text-cream mb-4">
          Under Construction
        </h2>
        <p className="font-mono text-xs md:text-sm text-ncc-muted max-w-md mb-8 leading-relaxed">
          The {title} division section is currently undergoing standard maintenance and code refactoring. Cadets will be notified once deployment is complete.
        </p>
        <div className="font-mono text-[0.65rem] text-gold tracking-widest uppercase border border-gold/30 px-4 py-2 rounded bg-army-deep">
          STATUS: IN_TRANSIT
        </div>
      </main>
    </div>
  )
}
