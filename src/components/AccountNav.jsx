// src/components/AccountNav.jsx — sub-nav shared across the account-settings pages.
// Mirrors the prototype's Account ↔ Address ↔ Rewards ↔ Founder's Club sub-nav
// (there's no separate change-password page — see Auth.jsx for the actual sign-in flow).
import { navigate, getPageParam } from '../utils/navigation.js'

const ITEMS = [
  { label: 'Account', page: 'account' },
  { label: 'Addresses', page: 'address' },
  { label: 'Rewards', page: 'rewards' },
  { label: "Founder's Club", page: 'founders-club' },
]

export default function AccountNav() {
  const cur = getPageParam()
  return (
    <div className="acct-nav">
      {ITEMS.map((i) => (
        <button
          key={i.page}
          className={'acct-nav-item' + (cur === i.page ? ' acct-nav-item--on' : '')}
          onClick={() => navigate('?page=' + i.page)}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}
