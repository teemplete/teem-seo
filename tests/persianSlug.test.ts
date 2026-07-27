import { describe, expect, it } from 'vitest'
import {
  analyzeSync,
  keyphraseMatchesSlug,
  hasArabicScript,
} from '../src/core'
import { isAcceptableLatinizedPersianSlug, transliteratePersianWord } from '../src/core/persianSlug'

describe('persian slug matching', () => {
  it('detects Arabic script', () => {
    expect(hasArabicScript('سئو محتوا')).toBe(true)
    expect(hasArabicScript('content seo')).toBe(false)
  })

  it('matches romanized Persian slug seo-mohtava for سئو محتوا', () => {
    expect(keyphraseMatchesSlug('سئو محتوا', 'seo-mohtava')).toBe(true)
  })

  it('matches English equivalent slug for Persian keyphrase', () => {
    expect(keyphraseMatchesSlug('سئو محتوا', 'seo-content')).toBe(true)
    expect(keyphraseMatchesSlug('خرید لپ تاپ', 'buy-laptop')).toBe(true)
  })

  it('matches Persian characters in the slug', () => {
    expect(keyphraseMatchesSlug('سئو محتوا', 'سئو-محتوا')).toBe(true)
  })

  it('matches percent-encoded Persian slug', () => {
    const encoded = encodeURIComponent('سئو-محتوا')
    expect(keyphraseMatchesSlug('سئو محتوا', encoded)).toBe(true)
  })

  it('matches Latin keyphrases as before', () => {
    expect(keyphraseMatchesSlug('content SEO', 'content-seo-guide')).toBe(true)
    expect(keyphraseMatchesSlug('content SEO', 'unrelated')).toBe(false)
  })

  it('rejects unrelated Latin slug when words do not match', () => {
    expect(keyphraseMatchesSlug('سئو محتوا', 'random-post')).toBe(false)
  })

  it('treats meaningful Latin slug as acceptable for Persian keyphrase', () => {
    expect(isAcceptableLatinizedPersianSlug('سئو محتوا', 'random-post')).toBe(true)
    expect(isAcceptableLatinizedPersianSlug('سئو محتوا', '')).toBe(false)
    expect(isAcceptableLatinizedPersianSlug('content seo', 'content-seo')).toBe(false)
  })

  it('transliterates محتوا with vowel variants', () => {
    const forms = transliteratePersianWord('محتوا')
    expect(forms.some((f) => f.includes('mht') || f.includes('moht') || sequentialHas(f, 'mhtva'))).toBe(
      true,
    )
  })
})

function sequentialHas(hay: string, needle: string): boolean {
  let j = 0
  for (const ch of hay) {
    if (ch === needle[j]) j++
    if (j === needle.length) return true
  }
  return false
}

describe('analyzeSync keyphraseInSlug for FA', () => {
  it('rates seo-mohtava as good for سئو محتوا', () => {
    const result = analyzeSync({
      content: '<p>سئو محتوا موضوع این صفحه است و سئو محتوا را توضیح می‌دهد.</p>',
      focusKeyphrase: 'سئو محتوا',
      title: 'راهنمای سئو محتوا',
      metaDescription: 'درباره سئو محتوا و نکات کاربردی برای رتبه گرفتن در گوگل بخوانید.',
      slug: 'seo-mohtava',
      locale: 'fa',
    })
    expect(result.seo.find((a) => a.id === 'keyphraseInSlug')?.rating).toBe('good')
  })

  it('rates unrelated Latin slug as ok not bad for Persian keyphrase', () => {
    const result = analyzeSync({
      content: '<p>سئو محتوا موضوع این صفحه است.</p>',
      focusKeyphrase: 'سئو محتوا',
      title: 'راهنمای سئو محتوا',
      metaDescription: 'درباره سئو محتوا و نکات کاربردی بخوانید تا رتبه بهتری بگیرید.',
      slug: 'my-first-post',
      locale: 'fa',
    })
    expect(result.seo.find((a) => a.id === 'keyphraseInSlug')?.rating).toBe('ok')
  })

  it('rates empty slug as ok not bad for Persian keyphrase', () => {
    const result = analyzeSync({
      content: '<p>سئو محتوا موضوع این صفحه است.</p>',
      focusKeyphrase: 'سئو محتوا',
      title: 'راهنمای سئو محتوا',
      metaDescription: 'درباره سئو محتوا و نکات کاربردی بخوانید تا رتبه بهتری بگیرید.',
      slug: '',
      locale: 'fa',
    })
    expect(result.seo.find((a) => a.id === 'keyphraseInSlug')?.rating).toBe('ok')
  })
})
