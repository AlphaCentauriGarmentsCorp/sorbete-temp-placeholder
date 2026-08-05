// src/components/StatusPill.jsx — order/payment status badge (design/dashboard.css .pill).
export default function StatusPill({ tone, children }) {
  return <span className={'pill pill--' + tone}>{children}</span>
}
