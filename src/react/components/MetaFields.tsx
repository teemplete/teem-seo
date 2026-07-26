'use client'

import type { MetaFieldsValue, Rating } from '../../core/types'

export interface MetaFieldsProps {
  value: MetaFieldsValue
  onChange: (value: MetaFieldsValue) => void
  locale?: 'en' | 'fa'
  readOnly?: boolean
}

const TITLE_MAX = 60
const TITLE_MIN = 30
const META_MAX = 160
const META_MIN = 120

const LABELS = {
  en: {
    keyphrase: 'Focus keyphrase',
    title: 'SEO title',
    slug: 'Slug',
    meta: 'Meta description',
  },
  fa: {
    keyphrase: 'کلمه کلیدی کانونی',
    title: 'عنوان SEO',
    slug: 'نامک (Slug)',
    meta: 'توضیحات متا',
  },
}

function lengthRating(length: number, min: number, max: number): Rating {
  if (length === 0 || length > max) return 'bad'
  if (length < min) return 'ok'
  return 'good'
}

function LengthBar({
  length,
  min,
  max,
}: {
  length: number
  min: number
  max: number
}) {
  const rating = lengthRating(length, min, max)
  const pct = Math.min(100, Math.round((length / max) * 100))

  return (
    <div
      className={`teemseo-lengthbar teemseo-lengthbar--${rating}`}
      role="progressbar"
      aria-valuenow={length}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span className="teemseo-lengthbar__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function MetaFields({ value, onChange, locale = 'en', readOnly }: MetaFieldsProps) {
  const t = LABELS[locale]
  const set = (patch: Partial<MetaFieldsValue>) => onChange({ ...value, ...patch })

  return (
    <div className="teemseo-fields">
      <label className="teemseo-field">
        <span>{t.keyphrase}</span>
        <input
          type="text"
          value={value.focusKeyphrase}
          readOnly={readOnly}
          onChange={(e) => set({ focusKeyphrase: e.target.value })}
        />
      </label>
      <label className="teemseo-field">
        <span>
          {t.title}
          <em>{value.title.length}/{TITLE_MAX}</em>
        </span>
        <input
          type="text"
          value={value.title}
          readOnly={readOnly}
          onChange={(e) => set({ title: e.target.value })}
        />
        <LengthBar length={value.title.length} min={TITLE_MIN} max={TITLE_MAX} />
      </label>
      <label className="teemseo-field">
        <span>{t.slug}</span>
        <input
          type="text"
          value={value.slug}
          readOnly={readOnly}
          onChange={(e) => set({ slug: e.target.value })}
          dir="ltr"
        />
      </label>
      <label className="teemseo-field">
        <span>
          {t.meta}
          <em>{value.metaDescription.length}/{META_MAX}</em>
        </span>
        <textarea
          className="teemseo-field__textarea"
          rows={3}
          value={value.metaDescription}
          readOnly={readOnly}
          onChange={(e) => set({ metaDescription: e.target.value })}
        />
        <LengthBar length={value.metaDescription.length} min={META_MIN} max={META_MAX} />
      </label>
    </div>
  )
}
