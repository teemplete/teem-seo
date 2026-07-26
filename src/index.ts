export {
  analyze,
  analyzeSync,
  parseContent,
  normalizeKeyphrase,
  slugifyKeyphrase,
  detectLocale,
  resolveLocale,
  getLanguagePack,
  aggregateRating,
  overallFrom,
  fleschReadingEase,
} from './core'

export type {
  AnalysisResult,
  AnalyzeInput,
  AssessmentId,
  AssessmentResult,
  Locale,
  LocaleOption,
  MetaFieldsValue,
  ParsedContent,
  Rating,
} from './core'

// React UI — for Next.js App Router prefer `import { TeemSEO } from 'teemseo/react'`
export { TeemSEO } from './react/TeemSEO'
export type { TeemSEOProps } from './react/TeemSEO'
export { useTeemSEO } from './react/useTeemSEO'
export type { UseTeemSEOOptions } from './react/useTeemSEO'
