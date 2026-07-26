import { getProminentWords } from './prominentWords'
import { parseContent } from './parseContent'
import type {
  GetInternalLinkSuggestions,
  InternalLinkQuery,
  InternalLinkSuggestion,
  Locale,
  LocaleOption,
} from './types'
import { resolveLocale } from './language/detect'

function absolutizeUrl(href: string, siteUrl?: string): string {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href
  }
  if (!siteUrl) return href
  try {
    return new URL(href, siteUrl).href
  } catch {
    return href
  }
}

/**
 * Build the query payload TeemSEO sends to the host suggestions API.
 */
export function buildInternalLinkQuery(input: {
  content: string
  focusKeyphrase?: string
  title?: string
  slug?: string
  siteUrl?: string
  locale?: LocaleOption
  messageLocale?: Locale
  limit?: number
}): InternalLinkQuery {
  const locale =
    input.messageLocale ?? resolveLocale(input.locale, input.content)
  const parsed = parseContent(input.content, {
    siteUrl: input.siteUrl,
    locale: input.locale,
  })
  const slug = (input.slug ?? '').replace(/^\//, '')
  const currentUrl =
    input.siteUrl && slug
      ? `${input.siteUrl.replace(/\/$/, '')}/${slug}`
      : slug
        ? `/${slug}`
        : ''

  const excludeUrls = new Set<string>()
  if (currentUrl) excludeUrls.add(currentUrl)
  if (slug) {
    excludeUrls.add(`/${slug}`)
    excludeUrls.add(slug)
  }

  for (const link of parsed.links) {
    if (!link.isInternal) continue
    if (link.href.startsWith('#')) continue
    excludeUrls.add(link.href)
    excludeUrls.add(absolutizeUrl(link.href, input.siteUrl))
  }

  return {
    focusKeyphrase: input.focusKeyphrase ?? '',
    title: input.title ?? '',
    slug,
    prominentWords: getProminentWords(input.content, {
      locale,
      limit: 12,
    }).map((w) => w.word),
    locale,
    excludeUrls: [...excludeUrls].filter(Boolean),
    limit: input.limit ?? 8,
  }
}

/**
 * Helper: POST query JSON to a host URL and parse `{ suggestions: [...] }`.
 */
export function createInternalLinkSuggestionsFetcher(
  url: string,
  init?: Omit<RequestInit, 'body' | 'method'>,
): GetInternalLinkSuggestions {
  return async (query) => {
    const res = await fetch(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify(query),
    })
    if (!res.ok) {
      throw new Error(`Internal link suggestions failed (${res.status})`)
    }
    const data = (await res.json()) as {
      suggestions?: InternalLinkSuggestion[]
    }
    return Array.isArray(data.suggestions) ? data.suggestions : []
  }
}

/**
 * Filter out suggestions that collide with excludeUrls (client-side safety net).
 */
export function filterExcludedSuggestions(
  suggestions: InternalLinkSuggestion[],
  excludeUrls: string[],
): InternalLinkSuggestion[] {
  const excluded = new Set(
    excludeUrls.map((u) => u.replace(/\/$/, '').toLowerCase()),
  )
  return suggestions.filter((s) => {
    const url = s.url.replace(/\/$/, '').toLowerCase()
    if (excluded.has(url)) return false
    try {
      const path = new URL(s.url, 'https://example.invalid').pathname.replace(
        /\/$/,
        '',
      )
      if (excluded.has(path) || excluded.has(path.replace(/^\//, ''))) return false
    } catch {
      /* ignore */
    }
    return true
  })
}
