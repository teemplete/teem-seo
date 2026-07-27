import { describe, expect, it } from 'vitest'
import { buildJsonLd, buildMetadata } from '../src/next'

describe('buildMetadata', () => {
  it('maps title description and canonical', () => {
    const meta = buildMetadata({
      title: 'Hello',
      description: 'World',
      siteUrl: 'https://example.com',
      slug: 'hello',
      locale: 'en',
    })
    expect(meta.title).toBe('Hello')
    expect(meta.description).toBe('World')
    expect(meta.alternates?.canonical).toBe('https://example.com/hello')
    expect(meta.openGraph?.locale).toBe('en_US')
    expect(meta.robots).toEqual({ index: true, follow: true })
  })

  it('respects allowIndex and allowFollow from meta', () => {
    const meta = buildMetadata({
      from: {
        focusKeyphrase: 'x',
        title: 't',
        metaDescription: 'd',
        slug: 's',
        allowIndex: false,
        allowFollow: false,
      },
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })

  it('uses canonicalUrl and advanced robots flags from meta', () => {
    const meta = buildMetadata({
      from: {
        focusKeyphrase: 'x',
        title: 't',
        metaDescription: 'd',
        slug: 's',
        canonicalUrl: 'https://example.com/canonical-page',
        noImageIndex: true,
        noArchive: true,
        noSnippet: true,
      },
    })
    expect(meta.alternates?.canonical).toBe('https://example.com/canonical-page')
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    })
  })
})

describe('buildJsonLd', () => {
  it('builds Article schema', () => {
    const json = buildJsonLd({
      type: 'Article',
      title: 'Test',
      description: 'Desc',
      authorName: 'Erfan',
      locale: 'fa',
    })
    expect(json['@type']).toBe('Article')
    expect(json.inLanguage).toBe('fa-IR')
    expect((json.author as { name: string }).name).toBe('Erfan')
  })

  it('accepts FAQPage schema type', () => {
    const json = buildJsonLd({
      type: 'FAQPage',
      title: 'FAQ',
      description: 'Answers',
    })
    expect(json['@type']).toBe('FAQPage')
  })
})

describe('social meta', () => {
  it('prefers social title description and image for OG/Twitter', () => {
    const meta = buildMetadata({
      from: {
        focusKeyphrase: 'x',
        title: 'SEO title',
        metaDescription: 'SEO desc',
        slug: 's',
        socialTitle: 'Share title',
        socialDescription: 'Share desc',
        socialImage: 'https://cdn.example.com/og.jpg',
        twitterCard: 'summary',
      },
      siteUrl: 'https://example.com',
    })
    expect(meta.openGraph?.title).toBe('Share title')
    expect(meta.openGraph?.description).toBe('Share desc')
    expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn.example.com/og.jpg' }])
    expect(meta.twitter?.card).toBe('summary')
    expect(meta.twitter?.title).toBe('Share title')
    expect(meta.twitter?.images).toEqual(['https://cdn.example.com/og.jpg'])
  })
})
