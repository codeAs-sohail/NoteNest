import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
const RootLayout = lazy(() => import('./layouts/RootLayout'));

// Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const AddNote = lazy(() => import('./pages/AddNote'));
const NoteDetail = lazy(() => import('./pages/NoteDetail'));

import { NotificationProvider } from './context/NotificationContext';
import { MotionConfig } from 'framer-motion';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <MotionConfig reducedMotion="user">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(22, 25, 34, 0.96)',
                color: '#f4f5f7',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.32)',
                fontWeight: '500',
                backdropFilter: 'blur(16px)',
              },
            }} 
          />
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] text-sm text-slate-400">Loading NoteNest…</div>}>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create" element={<AddNote />} />
              <Route path="/notifications" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </MotionConfig>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
