// src/pages/Auth.jsx — email + password sign in / create account (src/api/auth.js).
// This app's own simple auth system — every account is a CUSTOMER, the
// seller/admin (staff) point of view lives in a separate, not-yet-connected system.
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoShieldCheckmarkOutline } from 'react-icons/io5'
import { useSession } from '../context/SessionContext.jsx'
import { ApiError } from '../api/client.js'
import { navigate, getParam } from '../utils/navigation.js'
import '../design/Auth.css'

export default function Auth() {
  const { isAuthenticated, user, register, login, signOut, pending } = useSession()
  const nextRaw = getParam('next')
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const upd = (patch) => setForm((f) => ({ ...f, ...patch }))

  if (isAuthenticated) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-body auth-wrap">
          <div className="auth-card">
            <div className="auth-eyebrow">You're signed in</div>
            <h1 className="auth-title">Hi, {user?.name?.split(' ')[0]}.</h1>
            <p className="auth-lead">You're signed in as {user?.email}.</p>
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

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        await register(form)
      } else {
        await login(form)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body auth-wrap">
        <div className="auth-card">
          <div className="auth-eyebrow">{mode === 'register' ? 'Create account' : 'Sign in'}</div>
          <h1 className="auth-title">
            {mode === 'register' ? 'Create your Sorbetes account' : 'Sign in to Sorbetes'}
          </h1>
          <p className="auth-lead">
            {mode === 'register'
              ? 'One quick account so you can place and track orders.'
              : 'Sign in to place an order and track it. Browsing and building a quote stay open to guests.'}
          </p>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <input
                className="auth-input"
                placeholder="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => upd({ name: e.target.value })}
                required
              />
            )}
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => upd({ email: e.target.value })}
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={mode === 'register' ? 8 : undefined}
              value={form.password}
              onChange={(e) => upd({ password: e.target.value })}
              required
            />

            {error && <div className="auth-error">{error}</div>}

            <button className="btn btn-gold" type="submit" disabled={pending}>
              {pending ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            className="auth-switch"
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}
          >
            {mode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>

          <div className="auth-note">
            <IoShieldCheckmarkOutline />
            <span>Your password is stored securely (hashed) — we never see or store it in plain text.</span>
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
