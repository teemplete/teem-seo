import type { AssessmentResult, Rating } from './types'

const RATING_ORDER: Record<Rating, number> = {
  bad: 0,
  ok: 1,
  good: 2,
}

export function result(partial: Omit<AssessmentResult, 'score'> & { score?: number }): AssessmentResult {
  const score =
    partial.score ??
    (partial.rating === 'good' ? 9 : partial.rating === 'ok' ? 6 : 3)
  return { ...partial, score }
}

export function aggregateRating(results: AssessmentResult[]): Rating {
  if (results.length === 0) return 'ok'
  const bad = results.filter((r) => r.rating === 'bad').length
  const good = results.filter((r) => r.rating === 'good').length
  const avg =
    results.reduce((sum, r) => sum + RATING_ORDER[r.rating], 0) / results.length

  // Strong pass: no red lights and mostly green
  if (bad === 0 && (good === results.length || avg >= 1.6)) return 'good'

  // One or two red lights are forgivable — keep overall at ok, not bad
  if (bad <= 2 && avg >= 1.0) return 'ok'

  // Widespread problems
  if (bad >= 3 || bad >= Math.ceil(results.length * 0.35) || avg < 0.85) return 'bad'
  if (avg >= 1.15) return 'ok'
  return 'bad'
}

export function overallFrom(seo: Rating, readability: Rating): Rating {
  const min = Math.min(RATING_ORDER[seo], RATING_ORDER[readability])
  if (min === 0) return 'bad'
  if (min === 1) return 'ok'
  return 'good'
}
