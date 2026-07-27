'use client'

import { useId, useRef, useState } from 'react'
import type { Locale, MetaFieldsValue, TwitterCardType, UploadSocialImage } from '../../core/types'

export interface SocialPanelProps {
  value: MetaFieldsValue
  onChange: (value: MetaFieldsValue) => void
  locale?: Locale
  readOnly?: boolean
  siteUrl?: string
  /**
   * When provided, shows an Upload button. Your app uploads the file
   * (e.g. to S3 / CMS) and returns the public URL for `socialImage`.
   */
  onUploadSocialImage?: UploadSocialImage
}

type SocialPlatform =
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'whatsapp'
  | 'threads'
  | 'slack'
  | 'instagram'

const PLATFORMS: SocialPlatform[] = [
  'facebook',
  'x',
  'linkedin',
  'whatsapp',
  'threads',
  'slack',
  'instagram',
]

const LABELS = {
  en: {
    help: 'Control how your link looks when shared on social networks. Empty fields fall back to the SEO title and meta description.',
    title: 'Social title',
    description: 'Social description',
    image: 'Social image URL',
    upload: 'Upload',
    uploading: 'Uploading…',
    clear: 'Clear',
    uploadError: 'Upload failed. Try again or paste a URL.',
    twitterCard: 'X / Twitter card',
    cardLarge: 'Large image',
    cardSummary: 'Summary',
    platforms: {
      facebook: 'Facebook',
      x: 'X',
      linkedin: 'LinkedIn',
      whatsapp: 'WhatsApp',
      threads: 'Threads',
      slack: 'Slack',
      instagram: 'Instagram',
    } satisfies Record<SocialPlatform, string>,
    fallbackTitle: 'Page title',
    fallbackDesc: 'Your social description will appear here.',
    instagramNote:
      'Instagram does not show rich link previews for shared URLs. Use Stories or posts with an image instead; the image URL below can still feed other networks.',
    imagePlaceholder: 'https://…',
  },
  fa: {
    help: 'تعیین کنید پست شما در شبکه‌های اجتماعی چگونه دیده شود. فیلدهای خالی به عنوان SEO و توضیحات متا برمی‌گردند.',
    title: 'عنوان اجتماعی',
    description: 'توضیحات اجتماعی',
    image: 'آدرس تصویر اجتماعی',
    upload: 'آپلود',
    uploading: 'در حال آپلود…',
    clear: 'پاک کردن',
    uploadError: 'آپلود ناموفق بود. دوباره تلاش کنید یا URL بگذارید.',
    twitterCard: 'کارت X / توییتر',
    cardLarge: 'تصویر بزرگ',
    cardSummary: 'خلاصه',
    platforms: {
      facebook: 'فیس‌بوک',
      x: 'ایکس',
      linkedin: 'لینکدین',
      whatsapp: 'واتس‌اپ',
      threads: 'تردز',
      slack: 'اسلک',
      instagram: 'اینستاگرام',
    } satisfies Record<SocialPlatform, string>,
    fallbackTitle: 'عنوان صفحه',
    fallbackDesc: 'توضیحات اجتماعی اینجا نمایش داده می‌شود.',
    instagramNote:
      'اینستاگرام پیش‌نمایش غنی لینک برای URLهای اشتراک‌گذاری‌شده نشان نمی‌دهد. از استوری یا پست با تصویر استفاده کنید؛ آدرس تصویر زیر همچنان برای شبکه‌های دیگر کاربرد دارد.',
    imagePlaceholder: 'https://…',
  },
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

function resolveSocial(value: MetaFieldsValue, locale: Locale) {
  const title =
    value.socialTitle?.trim() ||
    value.title ||
    (locale === 'fa' ? LABELS.fa.fallbackTitle : LABELS.en.fallbackTitle)
  const description =
    value.socialDescription?.trim() ||
    value.metaDescription ||
    (locale === 'fa' ? LABELS.fa.fallbackDesc : LABELS.en.fallbackDesc)
  const image = value.socialImage?.trim() || ''
  return { title, description, image }
}

function hostFrom(siteUrl?: string, slug?: string, canonical?: string) {
  const raw =
    canonical?.trim() ||
    (siteUrl && slug
      ? `${siteUrl.replace(/\/$/, '')}/${slug.replace(/^\//, '')}`
      : siteUrl) ||
    'https://example.com'
  try {
    const u = new URL(raw)
    return { host: u.hostname.replace(/^www\./, ''), url: raw }
  } catch {
    return { host: 'example.com', url: raw }
  }
}

function SocialPreview({
  platform,
  title,
  description,
  image,
  host,
  card,
  locale,
}: {
  platform: SocialPlatform
  title: string
  description: string
  image: string
  host: string
  card: TwitterCardType
  locale: Locale
}) {
  const t = LABELS[locale]
  const large = card === 'summary_large_image'

  if (platform === 'instagram') {
    return (
      <div className="teemseo-social-preview teemseo-social-preview--instagram">
        <p className="teemseo-panel-help">{t.instagramNote}</p>
        {image ? (
          <div className="teemseo-social-preview__ig-frame">
            <img src={image} alt="" />
          </div>
        ) : null}
      </div>
    )
  }

  if (platform === 'x') {
    return (
      <div
        className={`teemseo-social-preview teemseo-social-preview--x${large ? ' is-large' : ''}`}
        dir="ltr"
      >
        {image ? (
          <div className="teemseo-social-preview__media">
            <img src={image} alt="" />
          </div>
        ) : (
          <div className="teemseo-social-preview__media teemseo-social-preview__media--empty" />
        )}
        <div className="teemseo-social-preview__body">
          <strong>{truncate(title, 70)}</strong>
          <p>{truncate(description, 120)}</p>
          <span>{host}</span>
        </div>
      </div>
    )
  }

  if (platform === 'whatsapp') {
    return (
      <div className="teemseo-social-preview teemseo-social-preview--whatsapp" dir="ltr">
        <div className="teemseo-social-preview__wa">
          {image ? <img src={image} alt="" /> : null}
          <div>
            <strong>{truncate(title, 60)}</strong>
            <p>{truncate(description, 90)}</p>
            <span>{host}</span>
          </div>
        </div>
      </div>
    )
  }

  if (platform === 'slack') {
    return (
      <div className="teemseo-social-preview teemseo-social-preview--slack" dir="ltr">
        <div className="teemseo-social-preview__slack-bar" aria-hidden />
        <div className="teemseo-social-preview__slack-body">
          <span>{host}</span>
          <strong>{truncate(title, 70)}</strong>
          <p>{truncate(description, 140)}</p>
          {image ? (
            <div className="teemseo-social-preview__media">
              <img src={image} alt="" />
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // facebook / linkedin / threads — Open Graph style
  const modifier =
    platform === 'linkedin'
      ? 'linkedin'
      : platform === 'threads'
        ? 'threads'
        : 'facebook'

  return (
    <div
      className={`teemseo-social-preview teemseo-social-preview--${modifier}`}
      dir="ltr"
    >
      {image ? (
        <div className="teemseo-social-preview__media">
          <img src={image} alt="" />
        </div>
      ) : (
        <div className="teemseo-social-preview__media teemseo-social-preview__media--empty" />
      )}
      <div className="teemseo-social-preview__body">
        <span>{host.toUpperCase()}</span>
        <strong>{truncate(title, platform === 'linkedin' ? 100 : 80)}</strong>
        <p>{truncate(description, platform === 'linkedin' ? 160 : 110)}</p>
      </div>
    </div>
  )
}

export function SocialPanel({
  value,
  onChange,
  locale = 'en',
  readOnly,
  siteUrl,
  onUploadSocialImage,
}: SocialPanelProps) {
  const t = LABELS[locale]
  const fileInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<SocialPlatform>('facebook')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const set = (patch: Partial<MetaFieldsValue>) => onChange({ ...value, ...patch })
  const resolved = resolveSocial(value, locale)
  const { host } = hostFrom(siteUrl, value.slug, value.canonicalUrl)
  const card = value.twitterCard ?? 'summary_large_image'
  const canUpload = Boolean(onUploadSocialImage) && !readOnly

  const handleFile = async (file: File | undefined) => {
    if (!file || !onUploadSocialImage) return
    setUploadError(null)
    setUploading(true)
    try {
      const url = await onUploadSocialImage(file)
      if (typeof url === 'string' && url.trim()) {
        set({ socialImage: url.trim() })
      } else {
        setUploadError(t.uploadError)
      }
    } catch {
      setUploadError(t.uploadError)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="teemseo-social">
      <p className="teemseo-panel-help">{t.help}</p>

      <label className="teemseo-field">
        <span>{t.title}</span>
        <input
          type="text"
          value={value.socialTitle ?? ''}
          readOnly={readOnly}
          placeholder={value.title}
          onChange={(e) => set({ socialTitle: e.target.value })}
        />
      </label>
      <label className="teemseo-field">
        <span>{t.description}</span>
        <textarea
          className="teemseo-field__textarea"
          rows={3}
          value={value.socialDescription ?? ''}
          readOnly={readOnly}
          placeholder={value.metaDescription}
          onChange={(e) => set({ socialDescription: e.target.value })}
        />
      </label>

      <div className="teemseo-field">
        <span>{t.image}</span>
        <div className={`teemseo-social-image${canUpload ? ' has-upload' : ''}`}>
          <input
            type="url"
            value={value.socialImage ?? ''}
            readOnly={readOnly}
            dir="ltr"
            placeholder={t.imagePlaceholder}
            onChange={(e) => {
              setUploadError(null)
              set({ socialImage: e.target.value })
            }}
          />
          {canUpload ? (
            <>
              <input
                ref={fileRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                className="teemseo-social-image__file"
                disabled={uploading}
                onChange={(e) => {
                  void handleFile(e.target.files?.[0])
                }}
              />
              <label
                htmlFor={fileInputId}
                className={`teemseo-social-image__upload${uploading ? ' is-busy' : ''}`}
                aria-disabled={uploading}
              >
                {uploading ? t.uploading : t.upload}
              </label>
            </>
          ) : null}
          {value.socialImage?.trim() && !readOnly ? (
            <button
              type="button"
              className="teemseo-social-image__clear"
              onClick={() => {
                setUploadError(null)
                set({ socialImage: '' })
              }}
            >
              {t.clear}
            </button>
          ) : null}
        </div>
        {uploadError ? <p className="teemseo-social-image__error">{uploadError}</p> : null}
      </div>
      <div className="teemseo-advanced__row">
        <span className="teemseo-advanced__label">{t.twitterCard}</span>
        <div className="teemseo-yesno" role="radiogroup" aria-label={t.twitterCard}>
          <button
            type="button"
            role="radio"
            aria-checked={card === 'summary_large_image'}
            className={card === 'summary_large_image' ? 'is-active' : ''}
            disabled={readOnly}
            onClick={() => set({ twitterCard: 'summary_large_image' })}
          >
            {t.cardLarge}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={card === 'summary'}
            className={card === 'summary' ? 'is-active' : ''}
            disabled={readOnly}
            onClick={() => set({ twitterCard: 'summary' })}
          >
            {t.cardSummary}
          </button>
        </div>
      </div>

      <div className="teemseo-social__platforms" role="tablist">
        {PLATFORMS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={platform === id}
            className={platform === id ? 'is-active' : ''}
            onClick={() => setPlatform(id)}
          >
            {t.platforms[id]}
          </button>
        ))}
      </div>

      <SocialPreview
        platform={platform}
        title={resolved.title}
        description={resolved.description}
        image={resolved.image}
        host={host}
        card={card}
        locale={locale}
      />
    </div>
  )
}
