import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddNote from './pages/AddNote.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Explore from './pages/Explore.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Toast from './components/Toast.jsx'

function Shell({ children }) {
  return (
    <>
      <Navbar />
      <main className="main">{children}</main>
      <Toast />
    </>
  )
}

export default function App() {
  const { isAuthenticated, ready } = useAuth()
  const redirectTarget = ready ? (isAuthenticated ? '/dashboard' : '/login') : '/login'

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Shell>
            <Navigate to={redirectTarget} replace />
          </Shell>
        }
      />
      <Route
        path="/login"
        element={
          <Shell>
            {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          </Shell>
        }
      />
      <Route
        path="/register"
        element={
          <Shell>
            {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
          </Shell>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Shell>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </Shell>
        }
      />
      <Route
        path="/add-note"
        element={
          <Shell>
            <PrivateRoute>
              <AddNote />
            </PrivateRoute>
          </Shell>
        }
      />
      <Route
        path="/explore"
        element={
          <Shell>
            <PrivateRoute>
              <Explore />
            </PrivateRoute>
          </Shell>
        }
      />
      <Route
        path="/profile"
        element={
          <Shell>
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          </Shell>
        }
      />
      <Route
        path="*"
        element={
          <Shell>
            <Navigate to={redirectTarget} replace />
          </Shell>
        }
      />
    </Routes>
  )
}
