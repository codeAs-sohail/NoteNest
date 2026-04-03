import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="navbar">
      <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar__brand">
        NoteNest
      </Link>
      <nav className="navbar__links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar__link">
              Dashboard
            </Link>
            <Link to="/profile" className="navbar__link">
              Profile
            </Link>
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">
              Login
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
