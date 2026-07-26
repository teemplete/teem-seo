import { describe, expect, it } from 'vitest'
import {
  buildInternalLinkQuery,
  filterExcludedSuggestions,
} from '../src/core/internalLinks'

describe('buildInternalLinkQuery', () => {
  it('includes prominent words and excludes current + existing internal links', () => {
    const query = buildInternalLinkQuery({
      content:
        '<p>Content SEO helps ranking. Content SEO needs structure.</p><p>See <a href="/blog/seo">guide</a>.</p>',
      focusKeyphrase: 'content SEO',
      title: 'Content SEO guide',
      slug: 'content-seo-guide',
      siteUrl: 'https://example.com',
      locale: 'en',
      limit: 5,
    })

    expect(query.focusKeyphrase).toBe('content SEO')
    expect(query.limit).toBe(5)
    expect(query.locale).toBe('en')
    expect(query.prominentWords.length).toBeGreaterThan(0)
    expect(query.excludeUrls).toContain('https://example.com/content-seo-guide')
    expect(query.excludeUrls.some((u) => u.includes('/blog/seo'))).toBe(true)
  })
})

describe('filterExcludedSuggestions', () => {
  it('drops suggestions that match excludeUrls', () => {
    const filtered = filterExcludedSuggestions(
      [
        { title: 'A', url: 'https://example.com/blog/seo' },
        { title: 'B', url: 'https://example.com/blog/other' },
      ],
      ['/blog/seo', 'https://example.com/blog/seo'],
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.url).toBe('https://example.com/blog/other')
  })
})
