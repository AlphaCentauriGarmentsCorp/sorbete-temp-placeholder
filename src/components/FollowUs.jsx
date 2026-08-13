// src/components/FollowUs.jsx — the standalone "Follow us" section.
//
// Fifth port from the old frontend (Homepage.jsx's `.hp-follow`), 2026-08-13. Distinct from
// the small "Follow us" link group inside Footer.jsx (§7's footer reorganisation) — over
// there the old site has BOTH: this big promotional section on the homepage, and a second,
// small one inside its own footer. Same three socials, same real links, just a different
// scale and a different job (this one is a homepage moment; the footer one is a utility
// link). Sits right after Trusted by Brands, matching the old site's own order.
import { IoLogoFacebook, IoLogoInstagram, IoLogoTiktok } from 'react-icons/io5'
import '../design/FollowUs.css'

const SOCIALS = [
  { icon: <IoLogoFacebook />, label: 'Facebook', href: 'https://www.facebook.com/SorbetesApparel' },
  { icon: <IoLogoInstagram />, label: 'Instagram', href: 'https://www.instagram.com/sorbetesapparelstudio/' },
  { icon: <IoLogoTiktok />, label: 'TikTok', href: 'https://www.tiktok.com/@sorbetesapparelstudio.ph' },
]

export default function FollowUs() {
  return (
    <section className="fu" aria-label="Follow us">
      <h2 className="fu-title" data-reveal>Follow us</h2>
      <p className="fu-sub" data-reveal>See what we&apos;ve been working on.</p>
      <div className="fu-icons" data-reveal>
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            className="fu-circle"
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open Sorbetes Apparel on ${s.label}`}
          >
            {s.icon}
          </a>
        ))}
      </div>
    </section>
  )
}
