// src/components/FoundersTestimonials.jsx — the Founders Club testimonial carousel.
//
// Ported from the OLD frontend (~/Desktop/github/old_sorbetes-frontend, Homepage.jsx's
// .hp-testimonial) on 2026-08-13 at the owner's request. DESIGN and ASSETS were copied; the
// logic is new.
//
// ⚠️ The important difference from the original: over there each testimonial was a single
// flat 1920×693 JPG with all the text baked into the pixels. That can't be responsive — on a
// 390px phone the whole card renders ~140px tall and the body copy lands around 4px. The
// owner asked for this to work properly on phones, so it's rebuilt as real markup: the
// founder photo and brand logo were cropped out of each source JPG (they split cleanly at
// the same 68% boundary on all five), and the quote text was transcribed from them.
//
// Auto-advance is on by default; it pauses on hover/focus and is disabled outright for
// visitors who ask for reduced motion.
import { useCallback, useEffect, useRef, useState } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'
import '../design/FoundersTestimonials.css'

const AUTOPLAY_MS = 7000

// Transcribed verbatim from the source images — including "CHRONOS ATHELICTS", which is
// spelled that way in the original artwork (left as-is rather than silently corrected).
const TESTIMONIALS = [
  {
    slug: 'kush',
    brand: 'KUSH CO.',
    name: 'Bam Santiago',
    paragraphs: [
      'Every so often a new company comes along and completely shifts an entire industry. Sorbetes did it for KUSH Co. and other local brand apparels',
      'SORBETES STUDIO helped us grow with its high quality prints using their advance technologies and outstanding services.',
    ],
    highlight: 'This manufacturing company officially receives the highest praise from KUSH CO.',
  },
  {
    slug: 'revel',
    brand: 'REVEL',
    name: 'Mykee Jofet & Chelsea Ongsee',
    paragraphs: [
      'I appreciate the excellent service you provided, high quality products with fast and smooth transaction without any delays! Will definitely recommend and work with you again soon.',
    ],
  },
  {
    slug: 'senoritos',
    brand: 'SENIORITOS',
    name: 'Paolo Tugano',
    paragraphs: [
      'SORBETES STUDIO is one of the legit printing services here in the Philippines. One of the pioneers and experienced in terms of printing. The margin of error in productions are almost zero because they make sure the quality of your product at sampling/prototyping phase.',
      'They’re very professional, kind, accommodating, and very considerate. Staff are also very easy to work with! 10/10!',
    ],
  },
  {
    slug: 'stay-hungry',
    brand: 'STAY HUNGRY PH',
    name: 'Ninay Mercado',
    paragraphs: [
      'As a start-up shirt business back in 2019, I knew it was important to find the right supplier for my clothing line. SORBETES STUDIO has definitely helped turn my ideas into reality. I like that I can customize it from scratch - from fabrics, cuts, to prints.',
      'STAY HUNGRY PH team is grateful to have Sorbetes as our partner in growing our company.',
    ],
  },
  {
    slug: 'variant5',
    brand: 'CHRONOS ATHELICTS',
    name: 'Lloyd Yniguez',
    paragraphs: [
      'SORBETES STUDIO is our partner for years now. They helped us open a lot of opportunities for our business. With our goal of being one of the best brands in our market, it is sure that Sorbetes Avenue is with us towards that journey. With their commitment to quality and creativity, they never failed to deliver what to expect. Product quality, creative techniques, and good service are the things that made us to be one of their loyal customers.',
    ],
  },
]

const N = TESTIMONIALS.length

export default function FoundersTestimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const go = useCallback((delta) => setIndex((i) => (i + delta + N) % N), [])

  // Auto-advance. Re-armed on every index change so a manual tap restarts the full dwell
  // rather than cutting the next slide short.
  useEffect(() => {
    if (paused || reduced) return
    const id = setTimeout(() => go(1), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [index, paused, reduced, go])

  // Swipe on touch devices — the arrows are small on a phone and a carousel that can't be
  // swiped feels broken there.
  const touchX = useRef(null)
  const onTouchStart = (e) => { touchX.current = e.changedTouches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  const t = TESTIMONIALS[index]

  return (
    <section
      className="ftc"
      aria-roledescription="carousel"
      aria-label="Founders Club testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="ftc-card">
        {/* key on the slug so the fade replays on every change */}
        <div className="ftc-body" key={t.slug}>
          <div className="ftc-top">
            <img className="ftc-fc-logo" src="/founders/founders-club-logo.png" alt="The Founders Club" />
            <img className="ftc-brand-logo" src={`/founders/${t.slug}-logo.png`} alt={t.brand} />
            <span className="ftc-quote-mark" aria-hidden="true">&ldquo;</span>
          </div>

          <div className="ftc-quote">
            {t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {t.highlight && <p className="ftc-highlight">{t.highlight}</p>}
          </div>

          <div className="ftc-who">
            <div className="ftc-who-text">
              <div className="ftc-name">{t.name}</div>
              <div className="ftc-role"><strong>Founder,</strong> {t.brand}</div>
            </div>
            <div className="ftc-socials" aria-hidden="true">
              <span className="ftc-social"><FaFacebookF /></span>
              <span className="ftc-social"><FaInstagram /></span>
            </div>
          </div>
        </div>

        <div className="ftc-photo">
          <img key={t.slug} src={`/founders/${t.slug}-photo.jpg`} alt={`${t.name} of ${t.brand}`} loading="lazy" />
        </div>
      </div>

      <button type="button" className="ftc-nav ftc-nav--prev" aria-label="Previous testimonial" onClick={() => go(-1)}>
        <IoChevronBack />
      </button>
      <button type="button" className="ftc-nav ftc-nav--next" aria-label="Next testimonial" onClick={() => go(1)}>
        <IoChevronForward />
      </button>

      <div className="ftc-dots" role="tablist" aria-label="Choose testimonial">
        {TESTIMONIALS.map((x, i) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${x.brand} testimonial`}
            className={'ftc-dot' + (i === index ? ' ftc-dot--on' : '')}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
