'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildInternalLinkQuery,
  filterExcludedSuggestions,
} from '../core/internalLinks'
import type {
  GetInternalLinkSuggestions,
  InternalLinkSuggestion,
  Locale,
  LocaleOption,
} from '../core/types'

export interface UseInternalLinkSuggestionsOptions {
  content: string
  focusKeyphrase?: string
  title?: string
  slug?: string
  siteUrl?: string
  locale?: LocaleOption
  messageLocale?: Locale
  limit?: number
  debounceMs?: number
  /** When false, no request is made (e.g. accordion closed). */
  enabled?: boolean
  getInternalLinkSuggestions?: GetInternalLinkSuggestions
}

function buildCacheKey(options: UseInternalLinkSuggestionsOptions): string {
  return JSON.stringify({
    content: options.content,
    focusKeyphrase: options.focusKeyphrase ?? '',
    title: options.title ?? '',
    slug: options.slug ?? '',
    siteUrl: options.siteUrl ?? '',
    locale: options.locale ?? 'auto',
    messageLocale: options.messageLocale ?? '',
    limit: options.limit ?? 8,
  })
}

export function useInternalLinkSuggestions(
  options: UseInternalLinkSuggestionsOptions,
): {
  suggestions: InternalLinkSuggestion[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedKey, setFetchedKey] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const debounceMs = options.debounceMs ?? 200
  const getter = options.getInternalLinkSuggestions
  const enabled = options.enabled ?? false
  const cacheKey = useMemo(
    () => buildCacheKey(options),
    [
      options.content,
      options.focusKeyphrase,
      options.title,
      options.slug,
      options.siteUrl,
      options.locale,
      options.messageLocale,
      options.limit,
    ],
  )

  const refetch = useCallback(() => {
    setFetchedKey(null)
    setRefreshToken((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!getter) {
      setSuggestions([])
      setLoading(false)
      setError(null)
      setFetchedKey(null)
      return
    }

    // Only fetch while accordion is open, and only if this query hasn't been cached yet.
    if (!enabled || fetchedKey === cacheKey) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    // Immediate on manual refetch; light debounce for first open / content change.
    const delay = refreshToken > 0 && fetchedKey === null ? 0 : debounceMs

    const timer = window.setTimeout(() => {
      const query = buildInternalLinkQuery({
        content: options.content,
        focusKeyphrase: options.focusKeyphrase,
        title: options.title,
        slug: options.slug,
        siteUrl: options.siteUrl,
        locale: options.locale,
        messageLocale: options.messageLocale,
        limit: options.limit,
      })

      void Promise.resolve(getter(query))
        .then((list) => {
          if (cancelled) return
          const filtered = filterExcludedSuggestions(
            Array.isArray(list) ? list : [],
            query.excludeUrls,
          )
          const sorted = [...filtered].sort(
            (a, b) => (b.score ?? 0) - (a.score ?? 0),
          )
          setSuggestions(sorted.slice(0, query.limit))
          setFetchedKey(cacheKey)
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setSuggestions([])
          setFetchedKey(null)
          setLoading(false)
          setError(err instanceof Error ? err.message : 'Failed to load suggestions')
        })
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    getter,
    enabled,
    cacheKey,
    fetchedKey,
    refreshToken,
    options.content,
    options.focusKeyphrase,
    options.title,
    options.slug,
    options.siteUrl,
    options.locale,
    options.messageLocale,
    options.limit,
    debounceMs,
  ])

  return { suggestions, loading, error, refetch }
}
