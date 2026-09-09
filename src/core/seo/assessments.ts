import type { LanguagePack } from '../language/en'
import {
  containsKeyphrase,
  countKeyphraseOccurrences,
  estimateTitleWidth,
  normalizeKeyphrase,
} from '../parseContent'
import {
  hasArabicScript,
  isAcceptableLatinizedPersianSlug,
  keyphraseMatchesSlug,
} from '../persianSlug'
import { result } from '../scoring'
import type { AssessmentResult, ParsedContent } from '../types'

export interface SeoContext {
  content: ParsedContent
  focusKeyphrase: string
  title: string
  metaDescription: string
  slug: string
  pack: LanguagePack
  keyphraseUsedElsewhere?: boolean
}

function kpWords(keyphrase: string): number {
  return normalizeKeyphrase(keyphrase).split(/\s+/).filter(Boolean).length
}

export function assessKeyphraseLength(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const kp = ctx.focusKeyphrase.trim()
  if (!kp) return result({ id: 'keyphraseLength', rating: 'bad', text: m.keyphraseMissing })
  const words = kpWords(kp)
  if (words > 4) return result({ id: 'keyphraseLength', rating: 'ok', text: m.keyphraseTooLong, meta: { words } })
  return result({ id: 'keyphraseLength', rating: 'good', text: m.keyphraseOk, meta: { words } })
}

export function assessKeyphraseInTitle(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInTitle', rating: 'bad', text: m.keyphraseMissing })
  }
  if (containsKeyphrase(ctx.title, ctx.focusKeyphrase)) {
    return result({ id: 'keyphraseInTitle', rating: 'good', text: m.keyphraseInTitleGood })
  }
  return result({ id: 'keyphraseInTitle', rating: 'bad', text: m.keyphraseInTitleBad })
}

export function assessKeyphraseInMeta(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInMetaDescription', rating: 'bad', text: m.keyphraseMissing })
  }
  if (containsKeyphrase(ctx.metaDescription, ctx.focusKeyphrase)) {
    return result({ id: 'keyphraseInMetaDescription', rating: 'good', text: m.keyphraseInMetaGood })
  }
  return result({ id: 'keyphraseInMetaDescription', rating: 'bad', text: m.keyphraseInMetaBad })
}

export function assessKeyphraseInIntroduction(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInIntroduction', rating: 'bad', text: m.keyphraseMissing })
  }
  if (containsKeyphrase(ctx.content.introduction, ctx.focusKeyphrase)) {
    return result({ id: 'keyphraseInIntroduction', rating: 'good', text: m.keyphraseInIntroGood })
  }
  return result({ id: 'keyphraseInIntroduction', rating: 'bad', text: m.keyphraseInIntroBad })
}

export function assessKeyphraseInContent(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInContent', rating: 'bad', text: m.keyphraseMissing })
  }
  if (containsKeyphrase(ctx.content.plainText, ctx.focusKeyphrase)) {
    return result({ id: 'keyphraseInContent', rating: 'good', text: m.keyphraseInContentGood })
  }
  return result({ id: 'keyphraseInContent', rating: 'bad', text: m.keyphraseInContentBad })
}

export function assessKeyphraseDensity(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const kp = ctx.focusKeyphrase.trim()
  if (!kp) return result({ id: 'keyphraseDensity', rating: 'bad', text: m.keyphraseMissing })

  const occurrences = countKeyphraseOccurrences(ctx.content.plainText, kp)
  const kpWordCount = Math.max(1, kpWords(kp))
  const density =
    ctx.content.wordCount === 0
      ? 0
      : (occurrences * kpWordCount * 100) / ctx.content.wordCount
  const rounded = Math.round(density * 100) / 100
  const label = String(rounded)

  if (rounded >= 0.5 && rounded <= 3) {
    return result({
      id: 'keyphraseDensity',
      rating: 'good',
      text: m.densityGood(label),
      meta: { density: rounded, occurrences },
    })
  }
  if (rounded < 0.5) {
    return result({
      id: 'keyphraseDensity',
      rating: rounded === 0 ? 'bad' : 'ok',
      text: m.densityLow(label),
      meta: { density: rounded, occurrences },
    })
  }
  return result({
    id: 'keyphraseDensity',
    rating: 'bad',
    text: m.densityHigh(label),
    meta: { density: rounded, occurrences },
  })
}

export function assessKeyphraseInSubheadings(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInSubheadings', rating: 'bad', text: m.keyphraseMissing })
  }
  const subs = ctx.content.headings.filter((h) => h.level >= 2)
  const hit = subs.some((h) => containsKeyphrase(h.text, ctx.focusKeyphrase))
  if (hit) {
    return result({ id: 'keyphraseInSubheadings', rating: 'good', text: m.keyphraseInSubheadingsGood })
  }
  return result({
    id: 'keyphraseInSubheadings',
    rating: subs.length === 0 ? 'ok' : 'bad',
    text: m.keyphraseInSubheadingsBad,
  })
}

export function assessKeyphraseInImageAlt(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInImageAlt', rating: 'bad', text: m.keyphraseMissing })
  }
  const { images } = ctx.content
  if (images.length === 0) {
    return result({ id: 'keyphraseInImageAlt', rating: 'ok', text: m.keyphraseInAltBad })
  }
  const hit = images.some((img) => containsKeyphrase(img.alt, ctx.focusKeyphrase))
  if (hit) {
    return result({ id: 'keyphraseInImageAlt', rating: 'good', text: m.keyphraseInAltGood })
  }
  return result({ id: 'keyphraseInImageAlt', rating: 'ok', text: m.keyphraseInAltOk })
}

export function assessKeyphraseInSlug(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  if (!ctx.focusKeyphrase.trim()) {
    return result({ id: 'keyphraseInSlug', rating: 'bad', text: m.keyphraseMissing })
  }
  if (keyphraseMatchesSlug(ctx.focusKeyphrase, ctx.slug)) {
    return result({ id: 'keyphraseInSlug', rating: 'good', text: m.keyphraseInSlugGood })
  }
  // Persian keyphrases commonly use English/romanized slugs — never mark as bad when a slug exists.
  if (isAcceptableLatinizedPersianSlug(ctx.focusKeyphrase, ctx.slug)) {
    return result({ id: 'keyphraseInSlug', rating: 'ok', text: m.keyphraseInSlugOk })
  }
  // Empty slug with a Persian keyphrase: soft warning only (same common practice).
  if (hasArabicScript(ctx.focusKeyphrase)) {
    return result({ id: 'keyphraseInSlug', rating: 'ok', text: m.keyphraseInSlugOk })
  }
  return result({ id: 'keyphraseInSlug', rating: 'bad', text: m.keyphraseInSlugBad })
}

export function assessTitleLength(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const title = ctx.title.trim()
  if (!title) return result({ id: 'titleLength', rating: 'bad', text: m.titleMissing })

  const chars = title.length
  const width = estimateTitleWidth(title, ctx.pack.titleCharWidth)

  if (chars >= 30 && chars <= 60 && width <= 600) {
    return result({ id: 'titleLength', rating: 'good', text: m.titleLengthGood, meta: { chars, width } })
  }
  if (chars < 30 || width < 200) {
    return result({ id: 'titleLength', rating: 'ok', text: m.titleLengthShort, meta: { chars, width } })
  }
  return result({ id: 'titleLength', rating: 'bad', text: m.titleLengthLong, meta: { chars, width } })
}

export function assessMetaDescriptionLength(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const desc = ctx.metaDescription.trim()
  if (!desc) {
    return result({ id: 'metaDescriptionLength', rating: 'bad', text: m.metaMissing })
  }
  const chars = desc.length
  if (chars >= 120 && chars <= 160) {
    return result({
      id: 'metaDescriptionLength',
      rating: 'good',
      text: m.metaLengthGood,
      meta: { chars },
    })
  }
  if (chars < 120) {
    return result({
      id: 'metaDescriptionLength',
      rating: 'ok',
      text: m.metaLengthShort,
      meta: { chars },
    })
  }
  return result({
    id: 'metaDescriptionLength',
    rating: 'bad',
    text: m.metaLengthLong,
    meta: { chars },
  })
}

export function assessTextLength(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const n = ctx.content.wordCount
  if (n >= 300) {
    return result({ id: 'textLength', rating: 'good', text: m.textLengthGood(n), meta: { words: n } })
  }
  if (n >= 150) {
    return result({ id: 'textLength', rating: 'ok', text: m.textLengthOk(n), meta: { words: n } })
  }
  return result({ id: 'textLength', rating: 'bad', text: m.textLengthBad(n), meta: { words: n } })
}

export function assessOutboundLinks(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const outbound = ctx.content.links.filter((l) => !l.isInternal)
  if (outbound.length > 0) {
    return result({
      id: 'outboundLinks',
      rating: 'good',
      text: m.outboundGood,
      meta: { count: outbound.length },
    })
  }
  return result({ id: 'outboundLinks', rating: 'ok', text: m.outboundBad, meta: { count: 0 } })
}

export function assessInternalLinks(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const internal = ctx.content.links.filter((l) => l.isInternal && !l.href.startsWith('#'))
  if (internal.length > 0) {
    return result({
      id: 'internalLinks',
      rating: 'good',
      text: m.internalGood,
      meta: { count: internal.length },
    })
  }
  return result({ id: 'internalLinks', rating: 'ok', text: m.internalBad, meta: { count: 0 } })
}

export function assessSingleH1(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const h1s = ctx.content.headings.filter((h) => h.level === 1)
  if (h1s.length === 1) {
    return result({ id: 'singleH1', rating: 'good', text: m.singleH1Good })
  }
  if (h1s.length === 0) {
    return result({ id: 'singleH1', rating: 'ok', text: m.singleH1None })
  }
  return result({
    id: 'singleH1',
    rating: 'bad',
    text: m.singleH1Many(h1s.length),
    meta: { count: h1s.length },
  })
}

export function assessSubheadingDistributionSeo(ctx: SeoContext): AssessmentResult {
  const m = ctx.pack.messages.seo
  const words = ctx.content.wordCount
  const subs = ctx.content.headings.filter((h) => h.level >= 2).length

  if (words < 300) {
    return result({
      id: 'subheadingDistribution',
      rating: 'good',
      text: m.subheadingGood,
      meta: { subheadings: subs },
    })
  }

  const expected = Math.floor(words / 300)
  if (subs >= expected) {
    return result({
      id: 'subheadingDistribution',
      rating: 'good',
      text: m.subheadingGood,
      meta: { subheadings: subs },
    })
  }
  if (subs > 0) {
    return result({
      id: 'subheadingDistribution',
      rating: 'ok',
      text: m.subheadingOk,
      meta: { subheadings: subs },
    })
  }
  return result({
    id: 'subheadingDistribution',
    rating: 'bad',
    text: m.subheadingBad,
    meta: { subheadings: 0 },
  })
}

export function assessKeyphraseElsewhere(ctx: SeoContext): AssessmentResult | null {
  if (ctx.keyphraseUsedElsewhere === undefined) return null
  const m = ctx.pack.messages.seo
  if (ctx.keyphraseUsedElsewhere) {
    return result({
      id: 'keyphraseUsedElsewhere',
      rating: 'bad',
      text: m.keyphraseElsewhereBad,
    })
  }
  return result({
    id: 'keyphraseUsedElsewhere',
    rating: 'good',
    text: m.keyphraseElsewhereGood,
  })
}

function hasKeyphrase(ctx: SeoContext): boolean {
  return ctx.focusKeyphrase.trim().length > 0
}

export function runSeoAssessments(ctx: SeoContext): AssessmentResult[] {
  const hasKp = hasKeyphrase(ctx)

  const assessments = [
    assessKeyphraseLength(ctx),
    hasKp ? assessKeyphraseInTitle(ctx) : null,
    hasKp ? assessKeyphraseInMeta(ctx) : null,
    hasKp ? assessKeyphraseInIntroduction(ctx) : null,
    hasKp ? assessKeyphraseInContent(ctx) : null,
    hasKp ? assessKeyphraseDensity(ctx) : null,
    hasKp ? assessKeyphraseInSubheadings(ctx) : null,
    hasKp ? assessKeyphraseInImageAlt(ctx) : null,
    hasKp ? assessKeyphraseInSlug(ctx) : null,
    assessTitleLength(ctx),
    assessMetaDescriptionLength(ctx),
    assessTextLength(ctx),
    assessOutboundLinks(ctx),
    assessInternalLinks(ctx),
    assessSingleH1(ctx),
    assessSubheadingDistributionSeo(ctx),
    assessKeyphraseElsewhere(ctx),
  ]
  return assessments.filter((a): a is AssessmentResult => a !== null)
}
