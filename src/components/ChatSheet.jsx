// src/components/ChatSheet.jsx — "Chat with us" bottom sheet (Messenger / Viber / WhatsApp).
// Handles are placeholders per HANDOFF.md "Known gaps" — swap for real ones before launch.
import { IoLogoWhatsapp, IoChatbubbleEllipses, IoClose } from 'react-icons/io5'
import '../design/chrome.css'

// TODO: replace placeholder contact handles with the studio's real accounts.
const CHANNELS = [
  {
    label: 'Messenger',
    hint: 'Fastest — we reply during studio hours',
    href: 'https://m.me/sorbetesmfg',
    icon: <IoChatbubbleEllipses />,
    tint: '#0084ff',
  },
  {
    label: 'Viber',
    hint: '+63 900 000 0000',
    href: 'viber://chat?number=%2B639000000000',
    icon: <IoChatbubbleEllipses />,
    tint: '#7360f2',
  },
  {
    label: 'WhatsApp',
    hint: '+63 900 000 0000',
    href: 'https://wa.me/639000000000',
    icon: <IoLogoWhatsapp />,
    tint: '#25d366',
  },
]

export default function ChatSheet({ open, onClose }) {
  if (!open) return null
  return (
    <div className="chat-backdrop" onClick={onClose}>
      <div className="chat-sheet" role="dialog" aria-label="Chat with us" onClick={(e) => e.stopPropagation()}>
        <div className="chat-head">
          <div>
            <div className="chat-title">Chat with us</div>
            <div className="chat-sub">Pick a channel — we'll help you spec your order.</div>
          </div>
          <button className="chat-x" aria-label="Close" onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className="chat-list">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              className="chat-item"
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="chat-icon" style={{ background: c.tint }}>
                {c.icon}
              </span>
              <span>
                <span className="chat-item-label">{c.label}</span>
                <span className="chat-item-hint">{c.hint}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
