'use client'

import { useEffect, useState } from 'react'
import { analyze } from '../core/analyze'
import type { AnalysisResult, AnalyzeInput, LocaleOption } from '../core/types'

export interface UseTeemSEOOptions {
  content: string
  focusKeyphrase?: string
  title?: string
  metaDescription?: string
  slug?: string
  /** Site origin for internal vs outbound link classification and snippet host */
  siteUrl?: string
  locale?: LocaleOption
  messageLocale?: AnalyzeInput['messageLocale']
  isKeyphraseUsedElsewhere?: AnalyzeInput['isKeyphraseUsedElsewhere']
  /** Debounce ms for re-analysis (default 200) */
  debounceMs?: number
}

export function useTeemSEO(options: UseTeemSEOOptions): {
  result: AnalysisResult | null
  loading: boolean
} {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const debounceMs = options.debounceMs ?? 200

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      void analyze({
        content: options.content,
        focusKeyphrase: options.focusKeyphrase,
        title: options.title,
        metaDescription: options.metaDescription,
        slug: options.slug,
        siteUrl: options.siteUrl,
        locale: options.locale,
        messageLocale: options.messageLocale,
        isKeyphraseUsedElsewhere: options.isKeyphraseUsedElsewhere,
      }).then((r) => {
        if (!cancelled) {
          setResult(r)
          setLoading(false)
        }
      })
    }, debounceMs)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    options.content,
    options.focusKeyphrase,
    options.title,
    options.metaDescription,
    options.slug,
    options.siteUrl,
    options.locale,
    options.messageLocale,
    options.isKeyphraseUsedElsewhere,
    debounceMs,
  ])

  return { result, loading }
}
