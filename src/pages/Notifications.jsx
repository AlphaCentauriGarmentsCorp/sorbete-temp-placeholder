// src/pages/Notifications.jsx — activity feed derived from the user's order timelines, gated.
// A real build would also fold in SMS/push events (mocks/sms.js) once a backend emits them.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { navigate } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { getState } from '../data/orderStates.js'
import { fmtDateTime } from '../utils/format.js'
import '../design/dashboard.css'

export default function Notifications() {
  const { user } = useSession()
  const { listForUser } = useOrders()
  const events = listForUser(user.email)
    .flatMap((o) => o.timeline.map((e) => ({ ...e, ref: o.ref, orderId: o.id })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 40)

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Updates</div>
              <h1 className="dash-title">Notifications</h1>
            </div>
          </div>

          <div className="panel">
            {events.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Nothing yet — updates on your orders show up here.</p>
            ) : (
              <div className="notif-list">
                {events.map((e, i) => (
                  <button className="notif-item" key={i} onClick={() => navigate('?page=my-orders-info&id=' + e.orderId)}>
                    <span className="notif-dot" />
                    <span className="notif-body">
                      <span className="notif-text">
                        <span className="notif-ref">{e.ref}</span> — {e.note || getState(e.status).label}
                      </span>
                    </span>
                    <span className="notif-time">{fmtDateTime(e.at)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
