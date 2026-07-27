'use client'

import { useMemo, useState } from 'react'
import { getProminentWords } from '../../core/prominentWords'
import type {
  GetInternalLinkSuggestions,
  InternalLinkSuggestion,
  Locale,
  MetaFieldsValue,
} from '../../core/types'
import { useInternalLinkSuggestions } from '../useInternalLinkSuggestions'
import { Accordion } from './Accordion'

export interface SeoAccordionsProps {
  content: string
  value: MetaFieldsValue
  onChange: (value: MetaFieldsValue) => void
  locale?: Locale
  readOnly?: boolean
  siteUrl?: string
  getInternalLinkSuggestions?: GetInternalLinkSuggestions
}

const LABELS = {
  en: {
    cornerstone: 'Cornerstone content',
    cornerstoneHelp:
      'Cornerstone content is your most important, comprehensive articles. Mark this page so it stands out in your content strategy.',
    cornerstoneToggle: 'Mark as cornerstone content',
    advanced: 'Advanced',
    allowIndex: 'Allow search engines to show this content in search results?',
    allowFollow: 'Should search engines follow links in this content?',
    canonicalUrl: 'Canonical URL',
    breadcrumbTitle: 'Breadcrumbs title',
    robotsAdvanced: 'Meta robots advanced',
    noImageIndex: 'No Image Index',
    noArchive: 'No Archive',
    noSnippet: 'No Snippet',
    yes: 'Yes',
    no: 'No',
    insights: 'Insights',
    prominentWords: 'Prominent words',
    prominentEmpty: 'Not enough content to extract prominent words yet.',
    count: 'count',
    internalLinks: 'Suggested internal links',
    internalLinksHelp:
      'Related pages from your site that you can link to from this content.',
    internalLinksEmpty: 'No related pages found yet.',
    internalLinksLoading: 'Looking for related pages…',
    internalLinksError: 'Could not load suggestions.',
    internalLinksUnavailable:
      'Provide getInternalLinkSuggestions to show related pages from your site.',
    copyLink: 'Copy link',
    copied: 'Copied',
    recheck: 'Recheck',
  },
  fa: {
    cornerstone: 'مقاله بنیاد محتوا',
    cornerstoneHelp:
      'مقالات بنیاد، مهم‌ترین و جامع‌ترین محتوای شما هستند. این صفحه را علامت بزنید تا در استراتژی محتوا برجسته شود.',
    cornerstoneToggle: 'نشانه‌گذاری به عنوان مقاله بنیاد محتوا (cornerstone)',
    advanced: 'پیشرفته',
    allowIndex: 'به موتورهای جستجو اجازه نمایش این محتوا در نتایج جستجو را می‌دهید؟',
    allowFollow: 'موتورهای جستجو باید لینک‌های موجود در این محتوا را دنبال کنند؟',
    canonicalUrl: 'آدرس کنونیکال (Canonical URL)',
    breadcrumbTitle: 'عنوان مسیر راهنما (Breadcrumbs)',
    robotsAdvanced: 'متا ربات‌های پیشرفته',
    noImageIndex: 'بدون ایندکس تصویر (No Image Index)',
    noArchive: 'بدون آرشیو (No Archive)',
    noSnippet: 'بدون اسنیپت (No Snippet)',
    yes: 'بله',
    no: 'خیر',
    insights: 'بینش',
    prominentWords: 'کلمه‌های برجسته پرکاربرد',
    prominentEmpty: 'هنوز محتوای کافی برای استخراج کلمات برجسته وجود ندارد.',
    count: 'تعداد',
    internalLinks: 'لینک‌های پیشنهادی داخلی',
    internalLinksHelp: 'صفحات مرتبط سایت که می‌توانید از این محتوا به آن‌ها لینک دهید.',
    internalLinksEmpty: 'هنوز صفحه مرتبطی یافت نشد.',
    internalLinksLoading: 'در حال یافتن صفحات مرتبط…',
    internalLinksError: 'بارگذاری پیشنهادها ممکن نشد.',
    internalLinksUnavailable:
      'برای نمایش صفحات مرتبط، getInternalLinkSuggestions را فراهم کنید.',
    copyLink: 'کپی لینک',
    copied: 'کپی شد',
    recheck: 'بررسی دوباره',
  },
}

function YesNo({
  value,
  onChange,
  yesLabel,
  noLabel,
  name,
  disabled,
}: {
  value: boolean
  onChange: (next: boolean) => void
  yesLabel: string
  noLabel: string
  name: string
  disabled?: boolean
}) {
  return (
    <div className="teemseo-yesno" role="radiogroup" aria-label={name}>
      <button
        type="button"
        role="radio"
        aria-checked={value}
        className={value ? 'is-active' : ''}
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        className={!value ? 'is-active' : ''}
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </button>
    </div>
  )
}

function ProminentBars({
  content,
  locale,
  emptyLabel,
}: {
  content: string
  locale: Locale
  emptyLabel: string
}) {
  const words = useMemo(
    () => getProminentWords(content, { locale, limit: 12 }),
    [content, locale],
  )
  const max = words[0]?.count ?? 0

  if (words.length === 0 || max === 0) {
    return <p className="teemseo-empty">{emptyLabel}</p>
  }

  return (
    <ul className="teemseo-bars" aria-label={LABELS[locale].prominentWords}>
      {words.map(({ word, count }) => {
        const pct = Math.max(8, Math.round((count / max) * 100))
        return (
          <li key={word} className="teemseo-bars__item">
            <div className="teemseo-bars__meta">
              <span className="teemseo-bars__word">{word}</span>
              <span className="teemseo-bars__count">{count}</span>
            </div>
            <div
              className="teemseo-bars__track"
              role="meter"
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={`${word}: ${count}`}
            >
              <span className="teemseo-bars__fill" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

function CopyLinkButton({
  url,
  copyLabel,
  copiedLabel,
}: {
  url: string
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className={`teemseo-suggestions__copy${copied ? ' is-copied' : ''}`}
      onClick={() => {
        void copyText(url).then((ok) => {
          if (!ok) return
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1600)
        })
      }}
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  )
}

function InternalLinkList({
  suggestions,
  loading,
  error,
  available,
  locale,
}: {
  suggestions: InternalLinkSuggestion[]
  loading: boolean
  error: string | null
  available: boolean
  locale: Locale
}) {
  const t = LABELS[locale]

  if (!available) {
    return <p className="teemseo-empty">{t.internalLinksUnavailable}</p>
  }
  if (loading && suggestions.length === 0) {
    return <p className="teemseo-empty">{t.internalLinksLoading}</p>
  }
  if (error) {
    return <p className="teemseo-empty">{t.internalLinksError}</p>
  }
  if (suggestions.length === 0) {
    return <p className="teemseo-empty">{t.internalLinksEmpty}</p>
  }

  return (
    <ul className="teemseo-suggestions">
      {suggestions.map((item) => (
        <li key={item.url} className="teemseo-suggestions__item">
          <div className="teemseo-suggestions__head">
            <a
              className="teemseo-suggestions__title"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
            <CopyLinkButton
              url={item.url}
              copyLabel={t.copyLink}
              copiedLabel={t.copied}
            />
          </div>
          <span className="teemseo-suggestions__url" dir="ltr">
            {item.url}
          </span>
          {item.excerpt ? (
            <p className="teemseo-suggestions__excerpt">{item.excerpt}</p>
          ) : null}
          {item.matchedTerms && item.matchedTerms.length > 0 ? (
            <div className="teemseo-suggestions__terms">
              {item.matchedTerms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function SeoAccordions({
  content,
  value,
  onChange,
  locale = 'en',
  readOnly,
  siteUrl,
  getInternalLinkSuggestions,
}: SeoAccordionsProps) {
  const t = LABELS[locale]
  const isCornerstone = value.isCornerstone ?? false
  const allowIndex = value.allowIndex ?? true
  const allowFollow = value.allowFollow ?? true
  const noImageIndex = value.noImageIndex ?? false
  const noArchive = value.noArchive ?? false
  const noSnippet = value.noSnippet ?? false
  const [linksOpen, setLinksOpen] = useState(false)

  const set = (patch: Partial<MetaFieldsValue>) => onChange({ ...value, ...patch })

  const { suggestions, loading, error, refetch } = useInternalLinkSuggestions({
    content,
    focusKeyphrase: value.focusKeyphrase,
    title: value.title,
    slug: value.slug,
    siteUrl,
    locale,
    messageLocale: locale,
    enabled: linksOpen,
    getInternalLinkSuggestions,
  })

  return (
    <div className="teemseo-accordions">
      <Accordion title={t.internalLinks} open={linksOpen} onOpenChange={setLinksOpen}>
        <div className="teemseo-suggestions__toolbar">
          <p className="teemseo-accordion__help">{t.internalLinksHelp}</p>
          {getInternalLinkSuggestions ? (
            <button
              type="button"
              className="teemseo-suggestions__recheck"
              disabled={loading}
              onClick={refetch}
            >
              {t.recheck}
            </button>
          ) : null}
        </div>
        <InternalLinkList
          suggestions={suggestions}
          loading={loading}
          error={error}
          available={Boolean(getInternalLinkSuggestions)}
          locale={locale}
        />
      </Accordion>

      <Accordion title={t.cornerstone} defaultOpen={false}>
        <p className="teemseo-accordion__help">{t.cornerstoneHelp}</p>
        <label className="teemseo-check">
          <input
            type="checkbox"
            checked={isCornerstone}
            disabled={readOnly}
            onChange={(e) => set({ isCornerstone: e.target.checked })}
          />
          <span>{t.cornerstoneToggle}</span>
        </label>
      </Accordion>

      <Accordion title={t.advanced} defaultOpen={false}>
        <div className="teemseo-advanced">
          <div className="teemseo-advanced__row">
            <span className="teemseo-advanced__label">{t.allowIndex}</span>
            <YesNo
              name={t.allowIndex}
              value={allowIndex}
              yesLabel={t.yes}
              noLabel={t.no}
              disabled={readOnly}
              onChange={(next) => set({ allowIndex: next })}
            />
          </div>
          <div className="teemseo-advanced__row">
            <span className="teemseo-advanced__label">{t.allowFollow}</span>
            <YesNo
              name={t.allowFollow}
              value={allowFollow}
              yesLabel={t.yes}
              noLabel={t.no}
              disabled={readOnly}
              onChange={(next) => set({ allowFollow: next })}
            />
          </div>
          <label className="teemseo-field">
            <span>{t.canonicalUrl}</span>
            <input
              type="url"
              value={value.canonicalUrl ?? ''}
              readOnly={readOnly}
              dir="ltr"
              placeholder="https://"
              onChange={(e) => set({ canonicalUrl: e.target.value })}
            />
          </label>
          <label className="teemseo-field">
            <span>{t.breadcrumbTitle}</span>
            <input
              type="text"
              value={value.breadcrumbTitle ?? ''}
              readOnly={readOnly}
              onChange={(e) => set({ breadcrumbTitle: e.target.value })}
            />
          </label>
          <fieldset className="teemseo-advanced__robots">
            <legend className="teemseo-advanced__label">{t.robotsAdvanced}</legend>
            <label className="teemseo-check">
              <input
                type="checkbox"
                checked={noImageIndex}
                disabled={readOnly}
                onChange={(e) => set({ noImageIndex: e.target.checked })}
              />
              <span>{t.noImageIndex}</span>
            </label>
            <label className="teemseo-check">
              <input
                type="checkbox"
                checked={noArchive}
                disabled={readOnly}
                onChange={(e) => set({ noArchive: e.target.checked })}
              />
              <span>{t.noArchive}</span>
            </label>
            <label className="teemseo-check">
              <input
                type="checkbox"
                checked={noSnippet}
                disabled={readOnly}
                onChange={(e) => set({ noSnippet: e.target.checked })}
              />
              <span>{t.noSnippet}</span>
            </label>
          </fieldset>
        </div>
      </Accordion>

      <Accordion title={t.insights} defaultOpen={false}>
        <p className="teemseo-accordion__help">{t.prominentWords}</p>
        <ProminentBars content={content} locale={locale} emptyLabel={t.prominentEmpty} />
      </Accordion>
    </div>
  )
}
