// src/pages/Stub.jsx — branded placeholder for routes not yet built.
// Replaced page-by-page as later phases land. Keeps navigation live in the meantime.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { navigate } from '../utils/navigation.js'

export default function Stub({ title, phase }) {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="stub">
          <div className="stub-eyebrow">Scaffold · coming in Phase {phase}</div>
          <h1>{title}</h1>
          <p>
            This screen is wired into the router but not built yet. The Phase&nbsp;1 scaffold
            stands up the app shell, query-param routing, mock session, and the order data model;
            each page is filled in on its scheduled phase.
          </p>
          <div className="stub-links">
            <button className="btn btn-dark" onClick={() => navigate('?page=home')}>
              ← Home
            </button>
            <button className="btn btn-gold" onClick={() => navigate('?page=start')}>
              Start an order
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
