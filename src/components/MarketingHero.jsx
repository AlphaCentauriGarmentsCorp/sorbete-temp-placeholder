// src/components/MarketingHero.jsx — marketing-page hero band (design/marketing.css .mk-hero).
// Pass `media` for the split layout (e.g. OurStory's hero image) — otherwise renders the
// plain eyebrow/title/lead hero used by Services, Pricing, guides, etc.
export default function MarketingHero({ eyebrow, title, children, media }) {
  const copy = (
    <>
      <div className="mk-eyebrow">{eyebrow}</div>
      <h1 className="mk-h1">{title}</h1>
      <p className="mk-lead">{children}</p>
    </>
  )

  if (media) {
    return (
      <section className="mk-hero mk-hero--split">
        <div>{copy}</div>
        <div className="mk-hero-media">{media}</div>
      </section>
    )
  }

  return <section className="mk-hero">{copy}</section>
}
