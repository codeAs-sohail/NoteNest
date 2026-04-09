import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()

  const initials = (user?.username || user?.email || 'U')
    .charAt(0)
    .toUpperCase()

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <Link
        to={isAuthenticated ? '/dashboard' : '/login'}
        className="navbar__brand"
        style={{ textDecoration: 'none' }}
      >
        <div className="navbar__brand-icon">📝</div>
        NoteNest
      </Link>

      <nav className="navbar__links">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className={`navbar__link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/explore"
              className={`navbar__link ${isActive('/explore') ? 'active' : ''}`}
            >
              <span>🌍</span>
              <span>Explore</span>
            </Link>
            <Link
              to="/add-note"
              className={`navbar__link ${isActive('/add-note') ? 'active' : ''}`}
            >
              <span>✏️</span>
              <span>New Note</span>
            </Link>
            <Link
              to="/profile"
              className={`navbar__link ${isActive('/profile') ? 'active' : ''}`}
            >
              <span>👤</span>
              <span>Profile</span>
            </Link>
            
            {/* Notification Icon */}
            <button 
              className="navbar__link" 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.45rem' }}
              title="Notifications"
            >
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }}></span>
            </button>

            <button
              type="button"
              className="navbar__logout"
              onClick={logout}
              style={{ marginLeft: '0.5rem' }}
            >
              <span>🚪</span>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">
              Sign In
            </Link>
            <Link to="/register" className="btn btn--primary btn--sm">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
