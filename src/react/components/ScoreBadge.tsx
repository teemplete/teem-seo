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
