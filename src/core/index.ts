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
  Rating,
} from './types'

export { analyze, analyzeSync } from './analyze'
export { parseContent, normalizeKeyphrase, slugifyKeyphrase } from './parseContent'
export { keyphraseMatchesSlug, hasArabicScript } from './persianSlug'
export { getProminentWords } from './prominentWords'
export type { ProminentWord } from './prominentWords'
export {
  buildInternalLinkQuery,
  createInternalLinkSuggestionsFetcher,
  filterExcludedSuggestions,
} from './internalLinks'
export { detectLocale, resolveLocale, getLanguagePack } from './language/detect'
export { aggregateRating, overallFrom } from './scoring'
export { fleschReadingEase } from './readability/assessments'
