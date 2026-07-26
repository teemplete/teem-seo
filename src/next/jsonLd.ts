export type JsonLdType = 'Article' | 'WebPage' | 'BlogPosting'

export interface BuildJsonLdInput {
  type?: JsonLdType
  title: string
  description?: string
  url?: string
  image?: string | string[]
  datePublished?: string
  dateModified?: string
  authorName?: string
  publisherName?: string
  publisherLogo?: string
  locale?: 'en' | 'fa'
  inLanguage?: string
}

export function buildJsonLd(input: BuildJsonLdInput): Record<string, unknown> {
  const type = input.type ?? 'Article'
  const images = input.image
    ? Array.isArray(input.image)
      ? input.image
      : [input.image]
    : undefined

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: input.title,
    name: input.title,
    description: input.description,
    url: input.url,
    inLanguage: input.inLanguage ?? (input.locale === 'fa' ? 'fa-IR' : 'en-US'),
    image: images,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
  }

  if (input.authorName) {
    base.author = {
      '@type': 'Person',
      name: input.authorName,
    }
  }

  if (input.publisherName) {
    base.publisher = {
      '@type': 'Organization',
      name: input.publisherName,
      logo: input.publisherLogo
        ? { '@type': 'ImageObject', url: input.publisherLogo }
        : undefined,
    }
  }

  // Strip undefined keys for cleaner output
  return JSON.parse(JSON.stringify(base)) as Record<string, unknown>
}

/** Serialize JSON-LD for embedding in a <script type="application/ld+json"> tag */
export function jsonLdScriptContent(input: BuildJsonLdInput): string {
  return JSON.stringify(buildJsonLd(input))
}
