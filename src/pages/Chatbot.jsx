// src/pages/Chatbot.jsx — mock support chat (gated).
// Canned replies only — no real NLP/backend. TODO: wire to a real support channel or bot.
import { useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoSend } from 'react-icons/io5'
import '../design/dashboard.css'

const GREETING = { role: 'bot', text: 'Hi! 👋 I’m the Sorbetes assistant. Ask about pricing, turnaround, fabrics, or your order status.' }

// Very small canned-response matcher (demo only).
function reply(text) {
  const t = text.toLowerCase()
  if (/price|magkano|cost|quote/.test(t)) return 'Tees start at ₱200/pc (50-pc minimum). Build a quote from “Start an order” for exact numbers.'
  if (/turnaround|how long|kailan|deliver/.test(t)) return 'Standard turnaround is 7–15 days after your downpayment. Rush options are available for a fee.'
  if (/fabric|gsm|cotton/.test(t)) return 'We stock 220 GSM up to Premium 280 GSM (CVC & cotton). See the Fabric & Print guide for details.'
  if (/payment|gcash|maya|cash|downpayment/.test(t)) return 'Online: GCash, Maya, or bank transfer. Walk-in adds cash. It’s ₱1,000 sample fee → 60% downpayment → 40% balance.'
  if (/status|track|order/.test(t)) return 'You can follow every stage under “Track order”. I’ll flag anything that needs your action there.'
  return 'Thanks! A team member will follow up shortly. Meanwhile, you can start an order or track an existing one from the menu.'
}

export default function Chatbot() {
  const [msgs, setMsgs] = useState([GREETING])
  const [input, setInput] = useState('')
  const logRef = useRef(null)

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'bot', text: reply(text) }])
    setInput('')
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    })
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Support · demo bot</div>
              <h1 className="dash-title">Chat</h1>
            </div>
          </div>

          <div className="panel">
            <div className="chat-log" ref={logRef}>
              {msgs.map((m, i) => (
                <div key={i} className={'chat-msg chat-msg--' + m.role}>{m.text}</div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message…"
              />
              <button className="btn btn-gold" onClick={send}><IoSend /></button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
