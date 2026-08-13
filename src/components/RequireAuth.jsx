// src/components/RequireAuth.jsx — session gate for dashboard/tracking routes.
// Locked model (FRONTEND-BUILD-SPEC §2): sign-in required for order placement +
// all dashboard/tracking pages. Quote-building stays open to guests (not wrapped in this).
import { useEffect } from 'react'
import { navigate, getPageParam, getParams } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import StubScreen from './StubScreen.jsx'

export default function RequireAuth({ children }) {
  const { isAuthenticated, ready } = useSession()

  useEffect(() => {
    if (ready && !isAuthenticated) {
      // Preserve intended destination so Auth can resume after sign-in.
      const params = getParams()
      const next = encodeURIComponent('?' + new URLSearchParams(params).toString())
      navigate('?page=auth&next=' + next)
    }
  }, [ready, isAuthenticated])

  if (!ready) return null // brief: session is being restored from storage

  if (!isAuthenticated) {
    return (
      <StubScreen eyebrow="Sign in required" title="Redirecting to sign in…">
        This page — <code>?page={getPageParam()}</code> — needs you to sign in. Taking you there now.
      </StubScreen>
    )
  }

  return children
}
