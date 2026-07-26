'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  AnalysisResult,
  AnalyzeInput,
  Locale,
  LocaleOption,
  MetaFieldsValue,
} from '../core/types'
import { AnalysisPanel } from './components/AnalysisPanel'
import { MetaFields } from './components/MetaFields'
import { ScoreBadge } from './components/ScoreBadge'
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
}: TeemSEOProps) {
  const [meta, setMeta] = useState<MetaFieldsValue>({
    focusKeyphrase,
    title,
    metaDescription,
    slug,
  })

  useEffect(() => {
    setMeta({
      focusKeyphrase,
      title,
      metaDescription,
      slug,
    })
  }, [focusKeyphrase, title, metaDescription, slug])

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
    </aside>
  )
}
