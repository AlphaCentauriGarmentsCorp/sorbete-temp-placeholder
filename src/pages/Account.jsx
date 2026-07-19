// src/pages/Account.jsx — profile + account sub-nav (gated).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AccountNav from '../components/AccountNav.jsx'
import { IoLogoGoogle } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { isTerminal } from '../data/orderStates.js'
import '../design/dashboard.css'

const initialsOf = (name = '') => name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

export default function Account() {
  const { user, signOut } = useSession()
  const { listForUser } = useOrders()
  const orders = listForUser(user.email)
  const active = orders.filter((o) => !isTerminal(o.status)).length
  const delivered = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Account</div>
              <h1 className="dash-title">Your account</h1>
            </div>
          </div>

          <AccountNav />

          <div className="panel">
            <div className="acct-profile">
              <div className="acct-avatar">{initialsOf(user.name)}</div>
              <div>
                <div className="acct-name">{user.name}</div>
                <div className="acct-email">{user.email}</div>
              </div>
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13.5, margin: '16px 0 0' }}>
              <IoLogoGoogle /> Signed in with Google
            </p>
          </div>

          <div className="panel">
            <div className="panel-h">Order summary</div>
            <div className="acct-stats">
              <div className="acct-stat"><div className="acct-stat-n">{orders.length}</div><div className="acct-stat-l">Total orders</div></div>
              <div className="acct-stat"><div className="acct-stat-n">{active}</div><div className="acct-stat-l">In progress</div></div>
              <div className="acct-stat"><div className="acct-stat-n">{delivered}</div><div className="acct-stat-l">Delivered</div></div>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-gold" onClick={() => navigate('?page=my-orders')}>My orders</button>
            <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
