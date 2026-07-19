// src/context/SessionContext.jsx — auth/session state (mock Google OAuth).
// Locked model (FRONTEND-BUILD-SPEC §2): Google-only. `ready` guards against a
// signed-in flash while we restore the session from storage.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { signInWithGoogle, signOutGoogle } from '../mocks/auth.js'
import { navigate, getParam } from '../utils/navigation.js'

const STORAGE_KEY = 'sorbetes_session'
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)

  // Restore any persisted session once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* ignore malformed session */
    }
    setReady(true)
  }, [])

  const signIn = useCallback(async (profile) => {
    setPending(true)
    try {
      const session = await signInWithGoogle(profile)
      setUser(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      // Resume intended destination if RequireAuth stashed one as ?next=…
      const next = getParam('next')
      navigate(next ? decodeURIComponent(next) : '?page=my-orders')
      return session
    } finally {
      setPending(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await signOutGoogle()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    navigate('?page=home')
  }, [])

  return (
    <SessionContext.Provider value={{ user, isAuthenticated: !!user, ready, pending, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>')
  return ctx
}
