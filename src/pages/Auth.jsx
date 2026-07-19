// src/pages/Auth.jsx — Google sign-in trigger (mocked).
// FRONTEND-BUILD-SPEC §2: Google OAuth only — no email/password, no OTP, no reset.
// The real handshake is faked in src/mocks/auth.js; this screen just triggers it.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { FcGoogle } from 'react-icons/fc'
import { IoShieldCheckmarkOutline } from 'react-icons/io5'
import { useSession } from '../context/SessionContext.jsx'
import { FAKE_GOOGLE_PROFILES } from '../data/mockData.js'
import { navigate, getParam } from '../utils/navigation.js'
import '../design/Auth.css'

export default function Auth() {
  const { isAuthenticated, user, signIn, signOut, pending } = useSession()
  const nextRaw = getParam('next')

  if (isAuthenticated) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-body auth-wrap">
          <div className="auth-card">
            <div className="auth-eyebrow">You're signed in</div>
            <h1 className="auth-title">Hi, {user?.name?.split(' ')[0]}.</h1>
            <p className="auth-lead">You're signed in with Google as {user?.email}.</p>
            <div className="auth-actions">
              <button className="btn btn-gold" onClick={() => navigate('?page=my-orders')}>
                Go to my orders
              </button>
              <button className="btn btn-ghost" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body auth-wrap">
        <div className="auth-card">
          <div className="auth-eyebrow">Sign in</div>
          <h1 className="auth-title">Sign in to Sorbetes</h1>
          <p className="auth-lead">
            We use Google to sign you in — no separate password to remember. You only need this to
            place an order and track it; browsing and building a quote stay open.
          </p>

          {/* Mock Google buttons — one per fake profile. A real build shows a single
              "Continue with Google" that opens Google's consent screen. */}
          <div className="auth-google-list">
            {FAKE_GOOGLE_PROFILES.map((p) => (
              <button
                key={p.id}
                className="auth-google"
                disabled={pending}
                onClick={() => signIn(p)}
              >
                <FcGoogle className="auth-google-icon" />
                <span className="auth-google-text">
                  <span className="auth-google-main">Continue with Google</span>
                  <span className="auth-google-sub">{p.email}</span>
                </span>
              </button>
            ))}
          </div>

          {pending && <div className="auth-pending">Signing you in…</div>}

          <div className="auth-note">
            <IoShieldCheckmarkOutline />
            <span>
              Demo build — this is a <strong>mock</strong> Google sign-in (no real OAuth). Pick a
              test profile above.
            </span>
          </div>

          {nextRaw && (
            <div className="auth-next">After signing in we'll take you back to where you were.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
