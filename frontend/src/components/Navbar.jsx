/**
 * Navbar — Responsive navigation with auth-aware links.
 * Shows Login when not authenticated, user menu when logged in.
 * Admin link only visible to admins.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠', key: 'home' },
  { path: '/uniform', label: 'Uniform', icon: '👔', key: 'uniform' },
  { path: '/ranks', label: 'Ranks', icon: '🎖', key: 'ranks' },
  { path: '/cadets', label: 'Cadets', icon: '👥', key: 'cadets' },
  { path: '/camps', label: 'Camps', icon: '⛺', key: 'camps' },
  { path: '/events', label: 'Events', icon: '📅', key: 'events' },
  { path: '/drills', label: 'Drills', icon: '🪖', key: 'drills' },
  { path: '/contact', label: 'Contact', icon: '📞', key: 'contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const profileBtnRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (!e.target.closest('#mainNav')) setIsOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [isOpen])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handler = (e) => {
      if (!e.target.closest('.profile-dropdown-container') && !e.target.closest('#profileDropdown')) setProfileOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [profileOpen])

  // Calculate dropdown position from button ref
  const openProfile = useCallback(() => {
    if (!profileOpen && profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right })
    }
    setProfileOpen(prev => !prev)
  }, [profileOpen])

  // Recalculate position on resize while open
  useEffect(() => {
    if (!profileOpen || !profileBtnRef.current) return
    const onResize = () => {
      const rect = profileBtnRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [profileOpen])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home'
    return location.pathname.startsWith(path)
  }

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  return (
    <nav
      id="mainNav"
      className={`sticky top-0 z-[1000] border-b px-4 md:px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-army-dark/[0.96] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-army-dark/[0.82] backdrop-blur-[18px] saturate-[1.4]'
      } border-gold/[0.18]`}
    >
      <div className="max-w-[1300px] mx-auto flex items-center justify-between h-[62px]">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 no-underline font-display text-2xl font-bold text-cream tracking-wide">
          <span className="text-xl drop-shadow-[0_0_6px_rgba(201,168,76,0.7)] hover:drop-shadow-[0_0_10px_rgba(201,168,76,1)] transition-all duration-300">
            ⚔
          </span>
          <span className="hidden sm:inline">NSUT ⚔ 6DBN NCC</span>
          <span className="sm:hidden">NCC</span>
        </Link>

        {/* Right side: desktop nav + auth + hamburger */}
        <div className="flex items-center gap-2">
          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-0.5 list-none mr-1">
            {NAV_ITEMS.filter(item => {
              if (!isAuthenticated) {
                if (item.key === 'cadets' || item.key === 'drills') return false
              }
              return true
            }).map((item) => (
              <li key={item.key}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 no-underline text-sm font-medium
                    px-2 py-1.5 rounded-lg whitespace-nowrap tracking-wide
                    transition-colors duration-300 text-[0.82rem]
                    ${isActive(item.path)
                      ? 'text-gold-bright bg-gold/10 border-b-2 border-gold'
                      : 'text-cream/65 hover:text-gold-bright hover:bg-gold/10'
                    }
                  `}
                >
                  <span className="text-[0.9rem]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <Link
                  to="/dashboard"
                  className={`
                    flex items-center gap-1.5 no-underline text-sm font-medium
                    px-2 py-1.5 rounded-lg whitespace-nowrap tracking-wide
                    transition-colors duration-300 text-[0.82rem]
                    ${isActive('/dashboard')
                      ? 'text-gold-bright bg-gold/10 border-b-2 border-gold'
                      : 'text-cream/65 hover:text-gold-bright hover:bg-gold/10'
                    }
                  `}
                >
                  <span className="text-[0.9rem]">📊</span>
                  <span>Dashboard</span>
                </Link>
              </li>
            )}
            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/attendance"
                    className={`
                      flex items-center gap-1.5 no-underline text-sm font-medium
                      px-2 py-1.5 rounded-lg whitespace-nowrap tracking-wide
                      transition-colors duration-300 text-[0.82rem]
                      ${isActive('/attendance')
                        ? 'text-gold-bright bg-gold/10 border-b-2 border-gold'
                        : 'text-cream/65 hover:text-gold-bright hover:bg-gold/10'
                      }
                    `}
                  >
                    <span className="text-[0.9rem]">📋</span>
                    <span>Attendance</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className={`
                      flex items-center gap-1.5 no-underline text-sm font-medium
                      px-2 py-1.5 rounded-lg whitespace-nowrap tracking-wide
                      transition-colors duration-300 text-[0.82rem] border
                      ${isActive('/admin')
                        ? 'text-gold-bright bg-gold/20 border-gold/40'
                        : 'text-gold bg-gold/[0.12] border-gold/25 hover:bg-gold/[0.22]'
                      }
                    `}
                  >
                    <span className="text-[0.9rem]">⚙</span>
                    <span>Admin</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth button — always visible in nav bar */}
          <div className="flex items-center">
            {!loading && (
              isAuthenticated ? (
                <div className="relative profile-dropdown-container">
                  <button
                    ref={profileBtnRef}
                    onClick={(e) => { e.stopPropagation(); openProfile(); }}
                    className="flex items-center gap-1.5 no-underline font-mono text-[0.72rem] tracking-wider text-army-dark bg-gold hover:bg-gold-bright px-4 py-1.5 rounded-[10px] transition-all duration-300 font-bold cursor-pointer border-none"
                  >
                    <span>👤</span>
                    <span>{isAdmin ? 'ADMIN' : 'PROFILE'}</span>
                    <span className="text-[10px] ml-0.5">{profileOpen ? '▲' : '▼'}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 no-underline font-mono text-[0.72rem] tracking-wider text-army-dark bg-gold hover:bg-gold-bright px-4 py-1.5 rounded-lg transition-all duration-300 font-bold"
                >
                  <span>🔐</span>
                  <span>LOGIN</span>
                </Link>
              )
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            className="flex md:hidden flex-col gap-[5px] cursor-pointer p-1.5 border-none bg-transparent"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className={`w-6 h-0.5 bg-cream rounded transition-all duration-300 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`w-6 h-0.5 bg-cream rounded transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-cream rounded transition-all duration-300 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel (separate from desktop nav / auth) */}
      <div
        className={`
          md:hidden fixed top-[62px] flex-col items-start w-64 h-[calc(100vh-62px)]
          bg-army-dark/[0.97] backdrop-blur-[20px] p-6 gap-1
          border-l border-gold/[0.15]
          overflow-y-auto
          transition-all duration-300 z-[999]
          ${isOpen ? 'right-0' : '-right-full'}
        `}
      >
        <ul className="list-none flex flex-col w-full gap-1">
          {NAV_ITEMS.filter(item => {
            if (!isAuthenticated) {
              if (item.key === 'cadets' || item.key === 'drills') return false
            }
            return true
          }).map((item) => (
            <li key={item.key}>
              <Link
                to={item.path}
                className="flex items-center gap-1.5 no-underline text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] w-full text-cream/65 hover:text-gold-bright hover:bg-gold/10"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-[0.9rem]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          <li className="w-full h-px bg-gold/10 my-2" />

          {isAuthenticated && (
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 no-underline text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] w-full text-cream/65 hover:text-gold-bright hover:bg-gold/10"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-[0.9rem]">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
          )}
          {isAdmin && (
            <>
              <li>
                <Link
                  to="/attendance"
                  className="flex items-center gap-1.5 no-underline text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] w-full text-cream/65 hover:text-gold-bright hover:bg-gold/10"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-[0.9rem]">📋</span>
                  <span>Attendance</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 no-underline text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] w-full text-gold bg-gold/[0.12] border border-gold/25 hover:bg-gold/[0.22]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-[0.9rem]">⚙</span>
                  <span>Admin</span>
                </Link>
              </li>
            </>
          )}

          {/* Mobile auth action at bottom */}
          <li className="border-t border-gold/10 pt-3 mt-3">
            {isAuthenticated ? (
              <button
                onClick={(e) => { setIsOpen(false); handleLogout(e) }}
                className="flex items-center gap-1.5 w-full text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] text-ncc-red-light bg-ncc-red/10 border border-ncc-red/25 hover:bg-ncc-red/20 cursor-pointer"
              >
                <span>🚪</span>
                <span>LOGOUT</span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 w-full text-sm font-medium px-3 py-2.5 rounded-lg tracking-wide transition-colors duration-300 text-[0.95rem] text-gold bg-gold/[0.12] border border-gold/25 hover:bg-gold/[0.22] no-underline"
                onClick={() => setIsOpen(false)}
              >
                <span>🔐</span>
                <span>LOGIN</span>
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Profile dropdown — floating below navbar with glassmorphism */}
      {profileOpen && isAuthenticated && (
        <div
          id="profileDropdown"
          className="fixed z-[1101] min-w-[220px] md:min-w-[260px] flex flex-col gap-3 p-4 md:p-5 rounded-xl border shadow-2xl animate-page-in"
          style={{
            top: dropdownPos.top,
            right: Math.max(dropdownPos.right, 12),
            background: 'rgba(14,26,14,0.75)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            borderColor: 'rgba(201,168,76,0.2)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0.5 border-b border-gold/10 pb-2 text-left">
            <span className="text-[0.6rem] md:text-[0.65rem] tracking-[0.2em] text-gold font-mono uppercase">
              {user?.rank || (isAdmin ? 'Admin' : 'Cadet')}
            </span>
            <span className="font-display font-bold text-sm md:text-base tracking-wide text-cream truncate">
              {user?.name || 'User'}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-[0.65rem] md:text-[0.7rem] text-cream/70 text-left">
            <div className="flex justify-between gap-2">
              <span className="text-gold/60">DLI:</span>
              <span className="truncate">{user?.dli_number}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gold/60">EMAIL:</span>
              <span className="truncate max-w-[140px] md:max-w-[180px]" title={user?.email}>{user?.email}</span>
            </div>
          </div>

          <button
            onClick={(e) => { setProfileOpen(false); handleLogout(e); }}
            className="w-full text-center font-mono text-[0.65rem] md:text-xs tracking-wider text-ncc-red-light hover:text-ncc-red-light/80 bg-ncc-red/10 border border-ncc-red/25 py-2 rounded-lg cursor-pointer transition-all hover:bg-ncc-red/20 mt-1"
          >
            LOGOUT
          </button>
        </div>
      )}
    </nav>
  )
}
