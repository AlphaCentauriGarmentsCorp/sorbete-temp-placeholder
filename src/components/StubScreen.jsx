// src/components/StubScreen.jsx — full-page placeholder (design/global.css .stub):
// "not found", "redirecting", "finalizing" screens that are just a message + optional actions.
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function StubScreen({ eyebrow, title, children, actions }) {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="stub">
          <div className="stub-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{children}</p>
          {actions && <div className="stub-links">{actions}</div>}
        </div>
      </div>
      <Footer />
    </div>
  )
}
