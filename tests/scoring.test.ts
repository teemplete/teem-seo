import { describe, expect, it } from 'vitest'
import { aggregateRating, result } from '../src/core/scoring'
import type { AssessmentId, AssessmentResult } from '../src/core/types'

function make(rating: AssessmentResult['rating'], id: AssessmentId = 'outboundLinks'): AssessmentResult {
  return result({ id, rating, text: rating })
}

describe('aggregateRating', () => {
  it('returns good when all assessments are good', () => {
    expect(aggregateRating([make('good'), make('good'), make('good')])).toBe('good')
  })

  it('forgives one red light as ok overall', () => {
    const items = [
      make('bad'),
      ...Array.from({ length: 10 }, () => make('good')),
    ]
    expect(aggregateRating(items)).toBe('ok')
  })

  it('forgives two red lights as ok overall', () => {
    const items = [
      make('bad'),
      make('bad'),
      ...Array.from({ length: 12 }, () => make('good')),
    ]
    expect(aggregateRating(items)).toBe('ok')
  })

  it('marks overall bad when three or more assessments are bad', () => {
    const items = [
      make('bad'),
      make('bad'),
      make('bad'),
      ...Array.from({ length: 10 }, () => make('good')),
    ]
    expect(aggregateRating(items)).toBe('bad')
  })
})
