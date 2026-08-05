// src/context/SessionContext.jsx — auth/session state, backed by the real Laravel API
// (email + password, src/api/auth.js). `ready` guards against a signed-in flash while we
// restore the session from storage.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { registerAccount, loginAccount } from '../api/auth.js'
import { setToken } from '../api/client.js'
import { navigate, getParam } from '../utils/navigation.js'
import { getJSON, setJSON, remove } from '../utils/storage.js'

const STORAGE_KEY = 'sorbetes_session'
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)

  // Restore any persisted session once on mount.
  useEffect(() => {
    const session = getJSON(STORAGE_KEY)
    if (session?.token) {
      setToken(session.token)
      setUser(session.user)
    }
    setReady(true)
  }, [])

  // Shared by register()/login(): persist the session and resume the intended
  // destination if RequireAuth stashed one as ?next=…
  const afterAuth = (session) => {
    setToken(session.token)
    setUser(session.user)
    setJSON(STORAGE_KEY, session)
    const next = getParam('next')
    navigate(next ? decodeURIComponent(next) : '?page=my-orders')
    return session
  }

  const register = useCallback(async ({ name, email, password }) => {
    setPending(true)
    try {
      return afterAuth(await registerAccount({ name, email, password }))
    } finally {
      setPending(false)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setPending(true)
    try {
      return afterAuth(await loginAccount({ email, password }))
    } finally {
      setPending(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setToken(null)
    setUser(null)
    remove(STORAGE_KEY)
    navigate('?page=home')
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, ready, pending, register, login, signOut }),
    [user, ready, pending, register, login, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>')
  return ctx
}
