// src/pages/Rewards.jsx — Founder's Club rewards (mock, derived from delivered orders), gated.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AccountNav from '../components/AccountNav.jsx'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { peso } from '../data/orderConfig.js'
import '../design/dashboard.css'

const PERKS = [
  'Priority sampling on new orders',
  'Founding-member pricing on reorders',
  'Early access to new fabrics & drops',
  'Free woven label upgrade on 200+ pc runs',
]

export default function Rewards() {
  const { user } = useSession()
  const { listForUser } = useOrders()
  const delivered = listForUser(user.email).filter((o) => o.status === 'delivered')
  const spend = delivered.reduce((s, o) => s + (o.totals?.grandTotal || 0), 0)
  const points = Math.floor(spend / 100) // mock: 1 pt / ₱100 spent
  const tier = delivered.length >= 5 ? 'Gold Founder' : delivered.length >= 2 ? 'Silver Founder' : 'Founding Member'

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Account</div>
              <h1 className="dash-title">Rewards</h1>
            </div>
          </div>
          <AccountNav />

          <div className="rw-card">
            <div className="rw-tier">{tier}</div>
            <div className="rw-points">{points.toLocaleString('en-PH')} <span>pts</span></div>
            <div className="rw-sub">{delivered.length} delivered order{delivered.length === 1 ? '' : 's'} · {peso(spend)} lifetime</div>
            <ul className="rw-perks">
              {PERKS.map((p) => (
                <li key={p}><IoCheckmarkCircle /> {p}</li>
              ))}
            </ul>
          </div>

          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 14 }}>
            Points are a mock calculation (1&nbsp;pt per ₱100 on delivered orders) for this demo.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
