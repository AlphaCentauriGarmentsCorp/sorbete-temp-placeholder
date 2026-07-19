// src/components/RequireAuth.jsx — session gate for dashboard/tracking routes.
// Locked model (FRONTEND-BUILD-SPEC §2): Google sign-in required for order placement +
// all dashboard/tracking pages. Quote-building stays open to guests (not wrapped in this).
import { useEffect } from 'react'
import { navigate, getPageParam, getParams } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

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
      <div className="page">
        <Navbar />
        <div className="page-body">
          <div className="stub">
            <div className="stub-eyebrow">Sign in required</div>
            <h1>Redirecting to sign in…</h1>
            <p>
              This page — <code>?page={getPageParam()}</code> — needs a Google sign-in. Taking you
              there now.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return children
}
