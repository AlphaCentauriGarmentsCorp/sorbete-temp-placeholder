// src/components/Navbar.jsx — site-wide top nav + trust strip. Wordmark + links + auth-aware
// actions. Restyled to match the black-bar reference design (logo badge, gold outline "Get
// instant quote" + solid "Start an order"). Fixes SYSTEM-FLOW §7 dead links: "Start an order"
// and "Log in" are real routes here.
//
// Note: the reference also showed a "Flow map" nav item — dropped here since no such page
// exists in this build; adding it would just be a new dead link (the exact §7 bug class this
// app already fixes elsewhere).
import { useState } from 'react'
import { IoMenu, IoClose, IoPersonCircleOutline } from 'react-icons/io5'
import { navigate, getPageParam } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import { peso, MIN_QTY, SIZE_PRICES } from '../data/orderConfig.js'
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
    <>
      <header className="nav">
        <div className="nav-inner">
          <button className="nav-brand" onClick={() => go('home')} aria-label="Sorbetes home">
            <img className="nav-brand-icon" src="/img/logo.jpg" alt="" />
            <span>Sorbetes</span>
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

            <button className="btn nav-quote" onClick={() => go('direct-form')}>
              Get instant quote
            </button>
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
            <button className="nav-sheet-link" onClick={() => go('direct-form')}>
              Get instant quote
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

      {/* Global chrome, shown under the nav on every page. Not sticky — scrolls away with
          the page, unlike the nav bar above. */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          Direct factory — Quezon City &nbsp;·&nbsp; In-house production &nbsp;·&nbsp; Min. {MIN_QTY} pcs
          &nbsp;·&nbsp; Classic tee from {peso(SIZE_PRICES.Standard.XS)}/pc
        </div>
      </div>
    </>
  )
}
