export type Locale = 'en' | 'fa'
export type LocaleOption = Locale | 'auto'

export type Rating = 'good' | 'ok' | 'bad'

export type AssessmentId =
  | 'keyphraseLength'
  | 'keyphraseInTitle'
  | 'keyphraseInMetaDescription'
  | 'keyphraseInIntroduction'
  | 'keyphraseInContent'
  | 'keyphraseDensity'
  | 'keyphraseInSubheadings'
  | 'keyphraseInImageAlt'
  | 'keyphraseInSlug'
  | 'titleLength'
  | 'metaDescriptionLength'
  | 'textLength'
  | 'outboundLinks'
  | 'internalLinks'
  | 'singleH1'
  | 'subheadingDistribution'
  | 'keyphraseUsedElsewhere'
  | 'fleschReadingEase'
  | 'sentenceLength'
  | 'paragraphLength'
  | 'passiveVoice'
  | 'transitionWords'
  | 'consecutiveSentences'
  | 'readabilitySubheadings'
  | 'persianReadability'

export interface AssessmentResult {
  id: AssessmentId
  rating: Rating
  score: number
  text: string
  /** Optional numeric detail for UI (e.g. density %) */
  meta?: Record<string, string | number | boolean>
}

export interface AnalyzeInput {
  content: string
  focusKeyphrase?: string
  title?: string
  metaDescription?: string
  slug?: string
  /** Site origin used to classify internal vs outbound links */
  siteUrl?: string
  locale?: LocaleOption
  /** Return true if this keyphrase is already used on another page */
  isKeyphraseUsedElsewhere?: (keyphrase: string) => boolean | Promise<boolean>
  /** Override message language independently of content language */
  messageLocale?: Locale
}

export interface ParsedImage {
  src: string
  alt: string
}

export interface ParsedLink {
  href: string
  text: string
  isInternal: boolean
}

export interface ParsedHeading {
  level: number
  text: string
}

export interface ParsedContent {
  plainText: string
  html: string
  words: string[]
  wordCount: number
  sentences: string[]
  paragraphs: string[]
  headings: ParsedHeading[]
  images: ParsedImage[]
  links: ParsedLink[]
  introduction: string
}

export interface AnalysisResult {
  locale: Locale
  messageLocale: Locale
  seo: AssessmentResult[]
  readability: AssessmentResult[]
  seoScore: Rating
  readabilityScore: Rating
  overallScore: Rating
  stats: {
    wordCount: number
    sentenceCount: number
    paragraphCount: number
    headingCount: number
    imageCount: number
    linkCount: number
    keyphraseDensity: number
  }
}

export interface MetaFieldsValue {
  focusKeyphrase: string
  title: string
  metaDescription: string
  slug: string
}
