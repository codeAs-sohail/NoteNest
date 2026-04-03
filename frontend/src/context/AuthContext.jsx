import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const AuthContext = createContext(null)

const STORAGE_ACCESS = 'notenest_access'
const STORAGE_REFRESH = 'notenest_refresh'
const STORAGE_USER = 'notenest_user'

function decodeAccessToken(token) {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeAccessToken(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 >= payload.exp
}

function userFromPayload(payload) {
  if (!payload) return null
  const username = payload.username
  const email = payload.email
  const user_id = payload.user_id ?? payload.userId ?? null
  if (!username && !email && !user_id) return null
  return { username: username || '', email: email || '', user_id }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_ACCESS)
    localStorage.removeItem(STORAGE_REFRESH)
    localStorage.removeItem(STORAGE_USER)
    setUser(null)
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('notenest:auth-expired', onExpired)
    return () => window.removeEventListener('notenest:auth-expired', onExpired)
  }, [])

  useEffect(() => {
    const access = localStorage.getItem(STORAGE_ACCESS)
    const stored = localStorage.getItem(STORAGE_USER)
    if (!access || isTokenExpired(access)) {
      clearStoredAuth()
      setReady(true)
      return
    }
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(userFromPayload(decodeAccessToken(access)))
      }
    } else {
      setUser(userFromPayload(decodeAccessToken(access)))
    }
    setReady(true)
  }, [clearStoredAuth])

  const login = useCallback((access, refresh, profile = null) => {
    localStorage.setItem(STORAGE_ACCESS, access)
    localStorage.setItem(STORAGE_REFRESH, refresh)
    const payload = decodeAccessToken(access)
    const fromToken = userFromPayload(payload)
    const base = fromToken || {
      username: '',
      email: '',
      user_id: payload?.user_id ?? payload?.userId ?? null,
    }
    const next = profile ? { ...base, ...profile } : base
    localStorage.setItem(STORAGE_USER, JSON.stringify(next))
    setUser(next)
  }, [])

  const syncUserProfile = useCallback((profileUpdates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(profileUpdates || {}) }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(STORAGE_REFRESH)
    try {
      if (refresh) {
        await api.post('/Logout/', { refresh })
      }
    } catch {
      /* still clear session locally */
    } finally {
      clearStoredAuth()
      navigate('/login', { replace: true })
    }
  }, [clearStoredAuth, navigate])

  const access = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ACCESS) : null
  const isAuthenticated = Boolean(
    ready && access && !isTokenExpired(access) && user && (user.username || user.email)
  )

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated,
      login,
      syncUserProfile,
      logout,
    }),
    [user, ready, isAuthenticated, login, syncUserProfile, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
