import { getLanguagePack, resolveLocale } from './language/detect'
import { countKeyphraseOccurrences, parseContent } from './parseContent'
import { runReadabilityAssessments } from './readability/assessments'
import { runSeoAssessments } from './seo/assessments'
import { aggregateRating, overallFrom } from './scoring'
import type { AnalysisResult, AnalyzeInput } from './types'

function buildResult(
  input: AnalyzeInput,
  keyphraseUsedElsewhere?: boolean,
): AnalysisResult {
  const content = parseContent(input.content ?? '', {
    siteUrl: input.siteUrl,
    locale: input.locale,
  })

  const combinedForLocale = [
    input.content,
    input.title,
    input.metaDescription,
    input.focusKeyphrase,
  ]
    .filter(Boolean)
    .join('\n')

  const locale = resolveLocale(input.locale, combinedForLocale || content.plainText)
  const messageLocale = input.messageLocale ?? locale
  const pack = getLanguagePack(messageLocale)
  const contentPack = getLanguagePack(locale)
  const assessmentPack = {
    ...contentPack,
    messages: pack.messages,
  }

  const focusKeyphrase = input.focusKeyphrase ?? ''

  const seo = runSeoAssessments({
    content,
    focusKeyphrase,
    title: input.title ?? '',
    metaDescription: input.metaDescription ?? '',
    slug: input.slug ?? '',
    pack: assessmentPack,
    keyphraseUsedElsewhere,
  })

  const readability = runReadabilityAssessments({
    content,
    pack: assessmentPack,
    locale,
  })

  const seoScore = aggregateRating(seo)
  const readabilityScore = aggregateRating(readability)
  const occurrences = focusKeyphrase
    ? countKeyphraseOccurrences(content.plainText, focusKeyphrase)
    : 0
  const kpWords = focusKeyphrase.trim().split(/\s+/).filter(Boolean).length || 1
  const keyphraseDensity =
    content.wordCount === 0
      ? 0
      : Math.round(((occurrences * kpWords * 100) / content.wordCount) * 100) / 100

  return {
    locale,
    messageLocale,
    seo,
    readability,
    seoScore,
    readabilityScore,
    overallScore: overallFrom(seoScore, readabilityScore),
    stats: {
      wordCount: content.wordCount,
      sentenceCount: content.sentences.length,
      paragraphCount: content.paragraphs.length,
      headingCount: content.headings.length,
      imageCount: content.images.length,
      linkCount: content.links.length,
      keyphraseDensity,
    },
  }
}

export async function analyze(input: AnalyzeInput): Promise<AnalysisResult> {
  const focusKeyphrase = input.focusKeyphrase ?? ''
  let keyphraseUsedElsewhere: boolean | undefined
  if (input.isKeyphraseUsedElsewhere && focusKeyphrase.trim()) {
    keyphraseUsedElsewhere = await Promise.resolve(
      input.isKeyphraseUsedElsewhere(focusKeyphrase.trim()),
    )
  }
  return buildResult(input, keyphraseUsedElsewhere)
}

/** Synchronous analysis (skips async `isKeyphraseUsedElsewhere`). */
export function analyzeSync(
  input: Omit<AnalyzeInput, 'isKeyphraseUsedElsewhere'>,
): AnalysisResult {
  return buildResult(input)
}
