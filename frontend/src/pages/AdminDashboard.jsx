/**
 * AdminDashboard — Control center for admin users.
 * All cards are now active with working links.
 */
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../contexts/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-army-dark text-cream flex flex-col pb-20 animate-page-in">
      <PageHeader
        eyebrow="NSUT NCC — CONTROL CENTER"
        title="ADMIN PANEL"
        subtitle={`Logged in as ${user?.dli_number || 'Admin'}`}
      />

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Nominal Roll Tool */}
          <AdminCard
            to="/admin/nominal-roll"
            icon="📊"
            title="Nominal Roll Generator"
            description="Upload cadet roster files (Excel/CSV), customize output fields, sort by rank/DLI seniority, and export formatted records."
            tag="Excel Tool"
          />

          {/* Attendance Manager */}
          <AdminCard
            to="/attendance"
            icon="📋"
            title="Attendance Manager"
            description="Mark, approve, and review parade attendance for active cadet cohorts. Integration with visual reports and database sheets."
            tag="Active"
            tagColor="green"
          />

          {/* Make Admin */}
          <AdminCard
            to="/admin/make-admin"
            icon="🛡️"
            title="Make Admin"
            description="Promote registered cadets to admin role. Enter their DLI number to grant full system access and admin privileges."
            tag="Admin Only"
            tagColor="gold"
          />

          {/* Cadets Directory */}
          <AdminCard
            to="/cadets"
            icon="👥"
            title="Cadets Directory"
            description="Browse and search the full cadet roster by year. View profiles, DLI numbers, and rank assignments."
            tag="Directory"
          />

          {/* Camp Archives */}
          <AdminCard
            to="/camps"
            icon="⛺"
            title="Camp Archives"
            description="View and manage camp photo galleries. Browse field operation documentation and training camp records."
            tag="Gallery"
          />

          {/* Ranks Management */}
          <AdminCard
            to="/ranks"
            icon="🎖"
            title="Rank Holders"
            description="View current and historical rank holders by session. Browse the complete hierarchy and leadership records."
            tag="Records"
          />
        </div>
      </main>
    </div>
  )
}

function AdminCard({ to, icon, title, description, tag, tagColor = 'default' }) {
  const tagClasses = {
    default: 'bg-gold/10 border-gold/25 text-gold-bright',
    green: 'bg-ncc-green-ok/10 border-ncc-green-ok/25 text-ncc-green-ok-light',
    gold: 'bg-gold/15 border-gold/35 text-gold-bright',
  }

  return (
    <Link
      to={to}
      className="group flex flex-col justify-between p-6 bg-army-deep/40 backdrop-blur-glass border border-gold/10 hover:border-gold/40 rounded-md shadow-lg transition-all duration-300 hover:-translate-y-1.5 no-underline text-cream"
    >
      <div className="space-y-4">
        <div className="text-4xl">{icon}</div>
        <h3 className="font-heading text-lg font-bold tracking-wide group-hover:text-gold-bright transition-colors">
          {title}
        </h3>
        <p className="font-body text-xs text-ncc-muted leading-relaxed">
          {description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-gold/[0.08] pt-4">
        <span className={`font-mono text-[0.6rem] px-2.5 py-0.5 rounded uppercase border ${tagClasses[tagColor]}`}>
          {tag}
        </span>
        <span className="text-gold opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
          →
        </span>
      </div>
    </Link>
  )
}
