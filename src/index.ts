export {
  analyze,
  analyzeSync,
  parseContent,
  normalizeKeyphrase,
  slugifyKeyphrase,
  keyphraseMatchesSlug,
  hasArabicScript,
  getProminentWords,
  buildInternalLinkQuery,
  createInternalLinkSuggestionsFetcher,
  filterExcludedSuggestions,
  detectLocale,
  resolveLocale,
  getLanguagePack,
  aggregateRating,
  overallFrom,
  fleschReadingEase,
} from './core'

export { TEEMSEO_VERSION } from './version'

export type {
  AnalysisResult,
  AnalyzeInput,
  AssessmentId,
  AssessmentResult,
  GetInternalLinkSuggestions,
  InternalLinkQuery,
  InternalLinkSuggestion,
  Locale,
  LocaleOption,
  MetaFieldsValue,
  ParsedContent,
  ProminentWord,
  Rating,
  SchemaType,
  TwitterCardType,
  UploadSocialImage,
} from './core'

// React UI — for Next.js App Router prefer `import { TeemSEO } from 'teemseo/react'`
export { TeemSEO } from './react/TeemSEO'
export type { TeemSEOProps } from './react/TeemSEO'
export { useTeemSEO } from './react/useTeemSEO'
export type { UseTeemSEOOptions } from './react/useTeemSEO'
export { useInternalLinkSuggestions } from './react/useInternalLinkSuggestions'
export type { UseInternalLinkSuggestionsOptions } from './react/useInternalLinkSuggestions'
