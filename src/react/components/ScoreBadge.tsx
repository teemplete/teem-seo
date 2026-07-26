'use client'

import type { Rating } from '../../core/types'

const LABELS: Record<Rating, { en: string; fa: string }> = {
  good: { en: 'Good', fa: 'خوب' },
  ok: { en: 'OK', fa: 'قابل قبول' },
  bad: { en: 'Needs work', fa: 'نیاز به بهبود' },
}

export function ScoreBadge({
  rating,
  locale = 'en',
  label,
}: {
  rating: Rating
  locale?: 'en' | 'fa'
  label?: string
}) {
  const text = label ?? LABELS[rating][locale]
  return (
    <span className={`teemseo-badge teemseo-badge--${rating}`} title={text}>
      <span className="teemseo-badge__dot" aria-hidden />
      <span className="teemseo-badge__label">{text}</span>
    </span>
  )
}

function SeoIcon() {
  return (
    <svg className="teemseo-light__icon" viewBox="0 0 16 16" aria-hidden focusable="false">
      <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.2 10.2 13.5 13.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ReadabilityIcon() {
  return (
    <svg className="teemseo-light__icon" viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d="M3.5 3.25h3.2c.9 0 1.55.45 2.05 1.05.5-.6 1.15-1.05 2.05-1.05h1.7v8.5h-1.9c-.85 0-1.45.25-1.95.7v-6.7c0-.55-.4-.95-.95-.95H3.5v6.95c0 .55.4.95.95.95H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ScoreLight({
  rating,
  kind,
  locale = 'en',
}: {
  rating: Rating
  kind: 'seo' | 'readability'
  locale?: 'en' | 'fa'
}) {
  const kindLabel =
    kind === 'seo'
      ? locale === 'fa'
        ? 'سئو'
        : 'SEO'
      : locale === 'fa'
        ? 'خوانایی'
        : 'Readability'
  const status = LABELS[rating][locale]
  const title = `${kindLabel}: ${status}`

  return (
    <span
      className={`teemseo-light teemseo-light--${rating}`}
      title={title}
      aria-label={title}
    >
      {kind === 'seo' ? <SeoIcon /> : <ReadabilityIcon />}
      <span className="teemseo-light__dot" aria-hidden />
    </span>
  )
}
