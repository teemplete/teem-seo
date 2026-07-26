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
import { ScoreBadge } from './components/ScoreBadge'
import { SeoAccordions } from './components/SeoAccordions'
import { SnippetPreview } from './components/SnippetPreview'
import { useTeemSEO } from './useTeemSEO'

export interface TeemSEOProps {
  content: string
  focusKeyphrase?: string
  title?: string
  metaDescription?: string
  slug?: string
  siteUrl?: string
  locale?: LocaleOption
  messageLocale?: Locale
  className?: string
  /** Controlled meta fields change */
  onChangeMeta?: (value: MetaFieldsValue) => void
  onAnalysis?: (result: AnalysisResult) => void
  isKeyphraseUsedElsewhere?: AnalyzeInput['isKeyphraseUsedElsewhere']
  /** Hide editable fields and only show analysis + snippet */
  analysisOnly?: boolean
  isCornerstone?: boolean
  allowIndex?: boolean
  allowFollow?: boolean
  /**
   * Host callback that returns related internal pages.
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
    }))
  }, [focusKeyphrase, title, metaDescription, slug, isCornerstone, allowIndex, allowFollow])

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
        {result && <ScoreBadge rating={result.overallScore} locale={uiLocale} />}
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
