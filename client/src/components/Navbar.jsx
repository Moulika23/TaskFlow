/*
  components/Navbar.jsx — Shared top navigation for all authenticated pages

  WHY A SHARED COMPONENT?
  Every authenticated page (Dashboard, Projects, Workspace, Profile) needs
  the same navbar. Putting it here means we write it once and import it.
  If we need to add a new nav link, we add it in one place and all pages
  get it automatically.

  useLocation() gives us the current URL path.
  We use it to highlight the active link with a different style.
*/

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() // e.g. { pathname: '/dashboard' }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Helper: return the right classes depending on whether this link is active
  const linkClass = (path) => {
    const isActive = location.pathname === path ||
      (path !== '/dashboard' && location.pathname.startsWith(path))

    return isActive
      ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
      : 'text-muted hover:text-text transition-colors'
  }

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* ── LEFT: Logo ── */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold text-primary">TaskFlow</span>
        </Link>

        {/* ── MIDDLE: Nav Links ── */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/projects" className={linkClass('/projects')}>
            Projects
          </Link>
        </div>

        {/* ── RIGHT: User menu ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="text-sm font-medium text-text hidden sm:block">
              {user?.name?.split(' ')[0]}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-danger transition-colors ml-2"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
