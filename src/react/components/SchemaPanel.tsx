'use client'

import type { Locale, MetaFieldsValue, SchemaType } from '../../core/types'

export interface SchemaPanelProps {
  value: MetaFieldsValue
  onChange: (value: MetaFieldsValue) => void
  locale?: Locale
  readOnly?: boolean
  siteUrl?: string
}

const SCHEMA_OPTIONS: SchemaType[] = [
  'WebPage',
  'Article',
  'NewsArticle',
  'BlogPosting',
  'FAQPage',
  'HowTo',
  'Product',
  'ItemPage',
  'CollectionPage',
  'ProfilePage',
  'AboutPage',
  'ContactPage',
]

const LABELS = {
  en: {
    heading: 'Schema',
    help: 'Choose the schema.org type that best describes this page. Search engines use it to understand your content.',
    type: 'Page type (schema.org)',
    preview: 'JSON-LD preview',
    descriptions: {
      WebPage: 'A generic web page. Use when no more specific type fits.',
      Article: 'A news, blog, or editorial article.',
      NewsArticle: 'A news article published by a news organization.',
      BlogPosting: 'A blog post as part of a blog or similar publication.',
      FAQPage: 'A page with frequently asked questions and answers.',
      HowTo: 'A how-to guide with step-by-step instructions.',
      Product: 'A product page for something that can be purchased.',
      ItemPage: 'A page about a single item (e.g. a listing detail).',
      CollectionPage: 'A page listing a collection of items or pages.',
      ProfilePage: 'A page about a person or organization profile.',
      AboutPage: 'An about page for a person, organization, or site.',
      ContactPage: 'A contact page with ways to reach you.',
    } satisfies Record<SchemaType, string>,
  },
  fa: {
    heading: 'طرح Schema',
    help: 'نوع schema.org مناسب این صفحه را انتخاب کنید. موتورهای جستجو با آن محتوا را بهتر می‌فهمند.',
    type: 'نوع صفحه (schema.org)',
    preview: 'پیش‌نمایش JSON-LD',
    descriptions: {
      WebPage: 'صفحه وب عمومی؛ وقتی نوع دقیق‌تری مناسب نیست.',
      Article: 'مقاله خبری، وبلاگ یا محتوای تحریریه‌ای.',
      NewsArticle: 'مقاله خبری منتشرشده توسط رسانه خبری.',
      BlogPosting: 'پست وبلاگ به‌عنوان بخشی از یک وبلاگ.',
      FAQPage: 'صفحه پرسش‌های متداول با پاسخ‌ها.',
      HowTo: 'راهنمای گام‌به‌گام انجام یک کار.',
      Product: 'صفحه محصول قابل خرید.',
      ItemPage: 'صفحه مربوط به یک آیتم واحد (مثلاً جزئیات آگهی).',
      CollectionPage: 'صفحه‌ای که مجموعه‌ای از آیتم‌ها را فهرست می‌کند.',
      ProfilePage: 'صفحه پروفایل شخص یا سازمان.',
      AboutPage: 'صفحه درباره ما برای شخص، سازمان یا سایت.',
      ContactPage: 'صفحه تماس با راه‌های ارتباطی.',
    } satisfies Record<SchemaType, string>,
  },
}

function buildPreview(value: MetaFieldsValue, siteUrl?: string, locale: Locale = 'en') {
  const type = value.schemaType ?? 'Article'
  const url =
    value.canonicalUrl?.trim() ||
    (siteUrl && value.slug
      ? `${siteUrl.replace(/\/$/, '')}/${value.slug.replace(/^\//, '')}`
      : undefined)

  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: value.title || undefined,
    name: value.title || undefined,
    description: value.metaDescription || undefined,
    url,
    inLanguage: locale === 'fa' ? 'fa-IR' : 'en-US',
    ...(value.socialImage?.trim() ? { image: value.socialImage.trim() } : {}),
  }
}

export function SchemaPanel({
  value,
  onChange,
  locale = 'en',
  readOnly,
  siteUrl,
}: SchemaPanelProps) {
  const t = LABELS[locale]
  const schemaType = value.schemaType ?? 'Article'
  const preview = buildPreview(value, siteUrl, locale)

  return (
    <div className="teemseo-schema">
      <p className="teemseo-panel-help">{t.help}</p>
      <label className="teemseo-field">
        <span>{t.type}</span>
        <select
          value={schemaType}
          disabled={readOnly}
          onChange={(e) =>
            onChange({ ...value, schemaType: e.target.value as SchemaType })
          }
        >
          {SCHEMA_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <p className="teemseo-schema__desc">{t.descriptions[schemaType]}</p>
      <div className="teemseo-schema__preview">
        <span className="teemseo-schema__preview-label">{t.preview}</span>
        <pre dir="ltr">{JSON.stringify(preview, null, 2)}</pre>
      </div>
    </div>
  )
}
