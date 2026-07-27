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
  /** Override robots; defaults come from from.allowIndex / from.allowFollow / advanced flags */
  robots?: {
    index?: boolean
    follow?: boolean
    noimageindex?: boolean
    noarchive?: boolean
    nosnippet?: boolean
  }
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
  const socialTitle = fromMeta?.socialTitle?.trim() || title
  const socialDescription = fromMeta?.socialDescription?.trim() || description
  const socialImage = fromMeta?.socialImage?.trim()
  const canonical =
    input.canonical ??
    (fromMeta?.canonicalUrl?.trim() || undefined) ??
    (input.siteUrl && slug
      ? `${input.siteUrl.replace(/\/$/, '')}/${slug.replace(/^\//, '')}`
      : undefined)

  const index = input.robots?.index ?? fromMeta?.allowIndex ?? true
  const follow = input.robots?.follow ?? fromMeta?.allowFollow ?? true
  const noimageindex = input.robots?.noimageindex ?? fromMeta?.noImageIndex ?? false
  const noarchive = input.robots?.noarchive ?? fromMeta?.noArchive ?? false
  const nosnippet = input.robots?.nosnippet ?? fromMeta?.noSnippet ?? false

  const ogImages =
    input.openGraph?.images ??
    (socialImage ? [{ url: socialImage }] : undefined)

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index,
      follow,
      ...(noimageindex ? { noimageindex: true } : {}),
      ...(noarchive ? { noarchive: true } : {}),
      ...(nosnippet ? { nosnippet: true } : {}),
    },
    openGraph: {
      title: socialTitle || undefined,
      description: socialDescription || undefined,
      url: canonical,
      locale: input.locale === 'fa' ? 'fa_IR' : 'en_US',
      type: input.openGraph?.type ?? 'article',
      images: ogImages,
    },
    twitter: {
      card: input.twitter?.card ?? fromMeta?.twitterCard ?? 'summary_large_image',
      title: socialTitle || undefined,
      description: socialDescription || undefined,
      images: socialImage ? [socialImage] : undefined,
      site: input.twitter?.site,
      creator: input.twitter?.creator,
    },
  }
}
