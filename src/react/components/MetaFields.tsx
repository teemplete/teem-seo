'use client'

import type { MetaFieldsValue } from '../../core/types'

export interface MetaFieldsProps {
  value: MetaFieldsValue
  onChange: (value: MetaFieldsValue) => void
  locale?: 'en' | 'fa'
  readOnly?: boolean
}

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
          <em>{value.title.length}/60</em>
        </span>
        <input
          type="text"
          value={value.title}
          readOnly={readOnly}
          onChange={(e) => set({ title: e.target.value })}
        />
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
          <em>{value.metaDescription.length}/160</em>
        </span>
        <textarea
          rows={3}
          value={value.metaDescription}
          readOnly={readOnly}
          onChange={(e) => set({ metaDescription: e.target.value })}
        />
      </label>
    </div>
  )
}
