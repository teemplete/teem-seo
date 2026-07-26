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
})
