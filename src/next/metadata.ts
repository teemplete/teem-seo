import type { AnalysisResult, MetaFieldsValue } from '../core/types'

export interface BuildMetadataInput {
  title?: string
  description?: string
  slug?: string
  siteUrl?: string
  canonical?: string
  locale?: 'en' | 'fa'
  openGraph?: {
    type?: 'website' | 'article'
    images?: Array<string | { url: string; width?: number; height?: number; alt?: string }>
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    site?: string
    creator?: string
  }
  /** Prefer values from analysis meta / result */
  from?: Partial<MetaFieldsValue> | AnalysisResult
}

/**
 * Build a Next.js App Router-compatible Metadata-like object.
 * Compatible with `export const metadata` / `generateMetadata` shapes.
 */
export function buildMetadata(input: BuildMetadataInput) {
  const fromMeta =
    input.from && 'focusKeyphrase' in input.from
      ? (input.from as Partial<MetaFieldsValue>)
      : undefined

  const title = input.title ?? fromMeta?.title ?? ''
  const description = input.description ?? fromMeta?.metaDescription ?? ''
  const slug = input.slug ?? fromMeta?.slug ?? ''
  const canonical =
    input.canonical ??
    (input.siteUrl && slug
      ? `${input.siteUrl.replace(/\/$/, '')}/${slug.replace(/^\//, '')}`
      : undefined)

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: title || undefined,
      description: description || undefined,
      url: canonical,
      locale: input.locale === 'fa' ? 'fa_IR' : 'en_US',
      type: input.openGraph?.type ?? 'article',
      images: input.openGraph?.images,
    },
    twitter: {
      card: input.twitter?.card ?? 'summary_large_image',
      title: title || undefined,
      description: description || undefined,
      site: input.twitter?.site,
      creator: input.twitter?.creator,
    },
  }
}
