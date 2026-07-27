'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  AnalysisResult,
  AnalyzeInput,
  GetInternalLinkSuggestions,
  Locale,
  LocaleOption,
  MetaFieldsValue,
} from '../core/types'
import { AnalysisPanel } from './components/AnalysisPanel'
import { MetaFields } from './components/MetaFields'
import { ScoreBadge, ScoreLight } from './components/ScoreBadge'
import { SeoAccordions } from './components/SeoAccordions'
import { SnippetPreview } from './components/SnippetPreview'
import { useTeemSEO } from './useTeemSEO'

export interface TeemSEOProps {
  /** HTML or plain-text content to analyze */
  content: string
  /** Focus keyphrase for SEO assessments */
  focusKeyphrase?: string
  /** SEO / SERP title */
  title?: string
  /** Meta description */
  metaDescription?: string
  /** URL slug (path segment without leading slash) */
  slug?: string
  /**
   * Site origin (e.g. `https://example.com`).
   * Used to classify internal vs outbound links: `/path` is always internal;
   * full URLs on this host (e.g. `https://example.com/path`) count as internal too.
   * Also shown in the SERP snippet preview.
   */
  siteUrl?: string
  /** Content language: `'en'` | `'fa'` | `'auto'` (detect from text) */
  locale?: LocaleOption
  /** Override UI / assessment message language independently of content locale */
  messageLocale?: Locale
  /** Extra class name on the root `<aside>` */
  className?: string
  /** Called when editable meta fields change */
  onChangeMeta?: (value: MetaFieldsValue) => void
  /** Called whenever a new analysis result is ready */
  onAnalysis?: (result: AnalysisResult) => void
  /** Return `true` if the keyphrase is already used on another page */
  isKeyphraseUsedElsewhere?: AnalyzeInput['isKeyphraseUsedElsewhere']
  /** Hide editable fields and only show analysis + snippet */
  analysisOnly?: boolean
  /** Mark this page as cornerstone content */
  isCornerstone?: boolean
  /** Allow search engines to index this page (default `true`) */
  allowIndex?: boolean
  /** Allow search engines to follow links (default `true`) */
  allowFollow?: boolean
  /** Explicit canonical URL */
  canonicalUrl?: string
  /** Title used in breadcrumb trails */
  breadcrumbTitle?: string
  /** Meta robots: noimageindex */
  noImageIndex?: boolean
  /** Meta robots: noarchive */
  noArchive?: boolean
  /** Meta robots: nosnippet */
  noSnippet?: boolean
  /**
   * Host callback that returns related internal pages for the suggestions accordion.
   * Use `createInternalLinkSuggestionsFetcher(url)` to POST to an API.
   */
  getInternalLinkSuggestions?: GetInternalLinkSuggestions
}

export function TeemSEO({
  content,
  focusKeyphrase = '',
  title = '',
  metaDescription = '',
  slug = '',
  siteUrl,
  locale = 'auto',
  messageLocale,
  className,
  onChangeMeta,
  onAnalysis,
  isKeyphraseUsedElsewhere,
  analysisOnly = false,
  isCornerstone,
  allowIndex,
  allowFollow,
  canonicalUrl,
  breadcrumbTitle,
  noImageIndex,
  noArchive,
  noSnippet,
  getInternalLinkSuggestions,
}: TeemSEOProps) {
  const [meta, setMeta] = useState<MetaFieldsValue>({
    focusKeyphrase,
    title,
    metaDescription,
    slug,
    isCornerstone: isCornerstone ?? false,
    allowIndex: allowIndex ?? true,
    allowFollow: allowFollow ?? true,
    canonicalUrl: canonicalUrl ?? '',
    breadcrumbTitle: breadcrumbTitle ?? '',
    noImageIndex: noImageIndex ?? false,
    noArchive: noArchive ?? false,
    noSnippet: noSnippet ?? false,
  })

  useEffect(() => {
    setMeta((prev) => ({
      ...prev,
      focusKeyphrase,
      title,
      metaDescription,
      slug,
      ...(isCornerstone !== undefined ? { isCornerstone } : {}),
      ...(allowIndex !== undefined ? { allowIndex } : {}),
      ...(allowFollow !== undefined ? { allowFollow } : {}),
      ...(canonicalUrl !== undefined ? { canonicalUrl } : {}),
      ...(breadcrumbTitle !== undefined ? { breadcrumbTitle } : {}),
      ...(noImageIndex !== undefined ? { noImageIndex } : {}),
      ...(noArchive !== undefined ? { noArchive } : {}),
      ...(noSnippet !== undefined ? { noSnippet } : {}),
    }))
  }, [
    focusKeyphrase,
    title,
    metaDescription,
    slug,
    isCornerstone,
    allowIndex,
    allowFollow,
    canonicalUrl,
    breadcrumbTitle,
    noImageIndex,
    noArchive,
    noSnippet,
  ])

  const { result, loading } = useTeemSEO({
    content,
    focusKeyphrase: meta.focusKeyphrase,
    title: meta.title,
    metaDescription: meta.metaDescription,
    slug: meta.slug,
    siteUrl,
    locale,
    messageLocale,
    isKeyphraseUsedElsewhere,
  })

  useEffect(() => {
    if (result && onAnalysis) onAnalysis(result)
  }, [result, onAnalysis])

  const uiLocale: Locale = messageLocale ?? result?.messageLocale ?? (locale === 'auto' ? 'en' : locale)

  const heading = useMemo(
    () => (uiLocale === 'fa' ? 'TeemSEO آنالیز' : 'TeemSEO Analysis'),
    [uiLocale],
  )

  const handleMeta = (value: MetaFieldsValue) => {
    setMeta(value)
    onChangeMeta?.(value)
  }

  return (
    <aside
      className={['teemseo', className].filter(Boolean).join(' ')}
      dir={uiLocale === 'fa' ? 'rtl' : 'ltr'}
      data-locale={uiLocale}
    >
      <header className="teemseo-header">
        <div>
          <strong className="teemseo-brand">TeemSEO</strong>
          <span className="teemseo-heading">{heading}</span>
        </div>
        {result && (
          <div className="teemseo-header__scores">
            <ScoreLight rating={result.seoScore} kind="seo" locale={uiLocale} />
            <ScoreLight
              rating={result.readabilityScore}
              kind="readability"
              locale={uiLocale}
            />
            <ScoreBadge rating={result.overallScore} locale={uiLocale} />
          </div>
        )}
      </header>

      {!analysisOnly && (
        <MetaFields value={meta} onChange={handleMeta} locale={uiLocale} />
      )}

      <SnippetPreview
        title={meta.title}
        metaDescription={meta.metaDescription}
        slug={meta.slug}
        siteUrl={siteUrl}
        locale={uiLocale}
      />

      <AnalysisPanel result={result} loading={loading} locale={uiLocale} />

      {!analysisOnly && (
        <SeoAccordions
          content={content}
          value={meta}
          onChange={handleMeta}
          locale={uiLocale}
          siteUrl={siteUrl}
          getInternalLinkSuggestions={getInternalLinkSuggestions}
        />
      )}
    </aside>
  )
}
