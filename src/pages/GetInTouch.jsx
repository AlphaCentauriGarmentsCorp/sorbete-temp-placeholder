// src/pages/GetInTouch.jsx — contact page (marketing). Form is mocked (no backend).
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoLocationOutline, IoTimeOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import '../design/marketing.css'

const MAPS_EMBED =
  'https://maps.google.com/maps?q=117%20Mother%20Ignacia%20Ave%2C%20Diliman%2C%20Quezon%20City&t=&z=16&ie=UTF8&iwloc=&output=embed'

export default function GetInTouch() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const upd = (patch) => setForm((f) => ({ ...f, ...patch }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    // TODO: replace with real contact endpoint — see FRONTEND-BUILD-SPEC.md §3
    setSent(true)
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero">
          <div className="mk-eyebrow">Get in touch</div>
          <h1 className="mk-h1">Let's make something.</h1>
          <p className="mk-lead">Questions on fabrics, timelines, or a big run? Message us — or just start a quote and we'll take it from there.</p>
        </section>

        <section className="mk-section">
          <div className="git-grid">
            <div className="git-card">
              <div className="git-row">
                <IoLocationOutline />
                <div><div className="git-k">Studio</div><div className="git-v">117 Mother Ignacia Ave, Diliman, Quezon City</div></div>
              </div>
              <div className="git-row">
                <IoTimeOutline />
                <div><div className="git-k">Hours</div><div className="git-v">Mon–Sat · 9:00 AM – 6:00 PM</div></div>
              </div>
              <div className="git-row">
                <IoChatbubbleEllipsesOutline />
                <div><div className="git-k">Chat</div><div className="git-v">Messenger · Viber · WhatsApp (see footer)</div></div>
              </div>
              <div className="git-map" style={{ marginTop: 8 }}>
                <iframe title="Studio map" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>

            <div className="git-card">
              <div className="mk-feature-title" style={{ marginBottom: 12 }}>Send a message</div>
              {sent ? (
                <div className="git-sent">Thanks, {form.name.split(' ')[0] || 'there'}! We got your message and will reply soon. (Demo — not actually sent.)</div>
              ) : (
                <form className="git-form" onSubmit={submit}>
                  <input className="git-input" placeholder="Your name" value={form.name} onChange={(e) => upd({ name: e.target.value })} />
                  <input className="git-input" type="email" placeholder="Email" value={form.email} onChange={(e) => upd({ email: e.target.value })} />
                  <textarea className="git-input" rows="5" placeholder="What are you planning?" value={form.message} onChange={(e) => upd({ message: e.target.value })} />
                  <button className="btn btn-gold" type="submit">Send message</button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
