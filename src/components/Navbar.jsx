// src/components/Navbar.jsx — site-wide top nav. Wordmark + links + auth-aware actions.
// Fixes SYSTEM-FLOW §7 dead links: "Start an order" and "Log in" are real routes here.
import { useState } from 'react'
import { IoMenu, IoClose, IoPersonCircleOutline } from 'react-icons/io5'
import { navigate, getPageParam } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import '../design/chrome.css'

const LINKS = [
  { label: 'Our Story', page: 'our-story' },
  { label: 'Services', page: 'services' },
  { label: 'Portfolio', page: 'portfolio' },
  { label: 'Guides', page: 'guide' },
  { label: "Founder's Club", page: 'founders-club' },
  { label: 'Contact', page: 'get-in-touch' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, signOut } = useSession()
  const current = getPageParam()

  const go = (page) => {
    setOpen(false)
    navigate('?page=' + page)
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="nav-brand" onClick={() => go('home')} aria-label="Sorbetes home">
          Sorbetes
        </button>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <button
              key={l.page}
              className={'nav-link' + (current === l.page ? ' nav-link--on' : '')}
              onClick={() => go(l.page)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="nav-ghost" onClick={() => go('quick-quote')}>
            Get a quote
          </button>

          {isAuthenticated ? (
            <div className="nav-account">
              <button className="nav-ghost" onClick={() => go('my-orders')}>
                My Orders
              </button>
              <button className="nav-user" onClick={() => go('account')} title={user?.email}>
                <IoPersonCircleOutline />
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>
              <button className="nav-signout" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="nav-ghost" onClick={() => go('auth')}>
              Log in
            </button>
          )}

          <button className="btn btn-gold nav-cta" onClick={() => go('start')}>
            Start an order
          </button>
        </div>

        <button
          className="nav-burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IoClose /> : <IoMenu />}
        </button>
      </div>

      {open && (
        <div className="nav-sheet">
          {LINKS.map((l) => (
            <button key={l.page} className="nav-sheet-link" onClick={() => go(l.page)}>
              {l.label}
            </button>
          ))}
          <div className="nav-sheet-div" />
          <button className="nav-sheet-link" onClick={() => go('quick-quote')}>
            Get a quote
          </button>
          {isAuthenticated ? (
            <>
              <button className="nav-sheet-link" onClick={() => go('my-orders')}>
                My Orders
              </button>
              <button className="nav-sheet-link" onClick={() => go('account')}>
                Account
              </button>
              <button
                className="nav-sheet-link"
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button className="nav-sheet-link" onClick={() => go('auth')}>
              Log in
            </button>
          )}
          <button className="btn btn-gold nav-sheet-cta" onClick={() => go('start')}>
            Start an order
          </button>
        </div>
      )}
    </header>
  )
}
