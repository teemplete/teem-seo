import { describe, expect, it } from 'vitest'
import { getProminentWords } from '../src/core/prominentWords'

describe('getProminentWords', () => {
  it('returns frequent content words sorted by count', () => {
    const words = getProminentWords(
      '<p>Content SEO helps pages rank. Content SEO needs structure. Content SEO rewards depth.</p>',
      { locale: 'en', limit: 5 },
    )
    expect(words[0]?.word).toBe('content')
    expect(words[0]?.count).toBeGreaterThanOrEqual(3)
    expect(words.every((w) => w.word !== 'the')).toBe(true)
  })

  it('filters Persian stop words', () => {
    const words = getProminentWords(
      '<p>سئو محتوا برای رتبه مهم است و سئو محتوا باید طبیعی باشد و سئو محتوا عمق دارد.</p>',
      { locale: 'fa', limit: 5 },
    )
    expect(words.some((w) => w.word === 'سئو' || w.word === 'محتوا')).toBe(true)
    expect(words.every((w) => w.word !== 'و' && w.word !== 'برای' && w.word !== 'است')).toBe(true)
  })
})
