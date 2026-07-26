import type { LanguagePack } from '../language/en'
import { tokenizeWords } from '../parseContent'
import { result } from '../scoring'
import type { AssessmentResult, Locale, ParsedContent } from '../types'

export interface ReadabilityContext {
  content: ParsedContent
  pack: LanguagePack
  locale: Locale
}

function sentenceWordCounts(sentences: string[]): number[] {
  return sentences.map((s) => tokenizeWords(s).length).filter((n) => n > 0)
}

function countSyllablesEn(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  const groups = cleaned.match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups?.length ?? 1)
}

export function fleschReadingEase(text: string): number {
  const words = tokenizeWords(text)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const wordCount = Math.max(1, words.length)
  const sentenceCount = Math.max(1, sentences.length)
  const syllableCount = words.reduce((sum, w) => sum + countSyllablesEn(w), 0)
  const score =
    206.835 -
    1.015 * (wordCount / sentenceCount) -
    84.6 * (syllableCount / wordCount)
  return Math.round(Math.max(0, Math.min(100, score)))
}

function isPassiveEnglish(sentence: string): boolean {
  const lower = sentence.toLowerCase()
  // Simple heuristic: be-verb + past participle-ish
  return /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/.test(lower) ||
    /\b(am|is|are|was|were|be|been|being)\s+(being\s+)?\w+(en|ne|d)\b/.test(lower)
}

function isPassivePersian(sentence: string): boolean {
  // Common Persian passive markers: شده، می‌شود، گردید، می‌گردد
  return /(شده|شده است|می‌شود|مي‌شود|گردید|می‌گردد|گشته است)\b/.test(sentence)
}

function hasTransition(sentence: string, transitions: string[]): boolean {
  const lower = sentence.toLowerCase()
  return transitions.some((t) => lower.includes(t.toLowerCase()))
}

export function assessFlesch(ctx: ReadabilityContext): AssessmentResult | null {
  if (ctx.locale !== 'en') return null
  const m = ctx.pack.messages.readability
  const score = fleschReadingEase(ctx.content.plainText)
  if (score >= 60) {
    return result({ id: 'fleschReadingEase', rating: 'good', text: m.fleschGood(score), meta: { score } })
  }
  if (score >= 40) {
    return result({ id: 'fleschReadingEase', rating: 'ok', text: m.fleschOk(score), meta: { score } })
  }
  return result({ id: 'fleschReadingEase', rating: 'bad', text: m.fleschBad(score), meta: { score } })
}

export function assessPersianReadability(ctx: ReadabilityContext): AssessmentResult | null {
  if (ctx.locale !== 'fa') return null
  const m = ctx.pack.messages.readability
  const counts = sentenceWordCounts(ctx.content.sentences)
  if (counts.length === 0) {
    return result({ id: 'persianReadability', rating: 'ok', text: m.persianOk })
  }
  const avgSentence = counts.reduce((a, b) => a + b, 0) / counts.length
  const words = ctx.content.words
  const avgWordLen =
    words.length === 0 ? 0 : words.reduce((a, w) => a + w.length, 0) / words.length

  // Heuristic: shorter sentences + moderate word length = easier FA reading
  const complexity = avgSentence * 0.55 + avgWordLen * 3.2
  if (complexity <= 18) {
    return result({
      id: 'persianReadability',
      rating: 'good',
      text: m.persianGood,
      meta: { avgSentence: Math.round(avgSentence * 10) / 10, avgWordLen: Math.round(avgWordLen * 10) / 10 },
    })
  }
  if (complexity <= 26) {
    return result({
      id: 'persianReadability',
      rating: 'ok',
      text: m.persianOk,
      meta: { avgSentence: Math.round(avgSentence * 10) / 10, avgWordLen: Math.round(avgWordLen * 10) / 10 },
    })
  }
  return result({
    id: 'persianReadability',
    rating: 'bad',
    text: m.persianBad,
    meta: { avgSentence: Math.round(avgSentence * 10) / 10, avgWordLen: Math.round(avgWordLen * 10) / 10 },
  })
}

export function assessSentenceLength(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const counts = sentenceWordCounts(ctx.content.sentences)
  if (counts.length === 0) {
    return result({ id: 'sentenceLength', rating: 'ok', text: m.sentenceGood })
  }
  const long = counts.filter((n) => n > 20).length
  const pct = Math.round((long / counts.length) * 100)
  if (pct <= 25) {
    return result({ id: 'sentenceLength', rating: 'good', text: m.sentenceGood, meta: { percent: pct } })
  }
  if (pct <= 40) {
    return result({ id: 'sentenceLength', rating: 'ok', text: m.sentenceOk(pct), meta: { percent: pct } })
  }
  return result({ id: 'sentenceLength', rating: 'bad', text: m.sentenceBad(pct), meta: { percent: pct } })
}

export function assessParagraphLength(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const paras = ctx.content.paragraphs
  if (paras.length === 0) {
    return result({ id: 'paragraphLength', rating: 'ok', text: m.paragraphGood })
  }
  const lengths = paras.map((p) => tokenizeWords(p).length)
  const veryLong = lengths.some((n) => n > 150)
  const long = lengths.some((n) => n > 100)
  if (veryLong) {
    return result({ id: 'paragraphLength', rating: 'bad', text: m.paragraphBad })
  }
  if (long) {
    return result({ id: 'paragraphLength', rating: 'ok', text: m.paragraphOk })
  }
  return result({ id: 'paragraphLength', rating: 'good', text: m.paragraphGood })
}

export function assessPassiveVoice(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const sentences = ctx.content.sentences
  if (sentences.length === 0) {
    return result({ id: 'passiveVoice', rating: 'good', text: m.passiveGood })
  }
  const passiveCount = sentences.filter((s) =>
    ctx.locale === 'fa' ? isPassivePersian(s) : isPassiveEnglish(s),
  ).length
  const pct = Math.round((passiveCount / sentences.length) * 100)
  if (pct <= 10) {
    return result({ id: 'passiveVoice', rating: 'good', text: m.passiveGood, meta: { percent: pct } })
  }
  if (pct <= 20) {
    return result({ id: 'passiveVoice', rating: 'ok', text: m.passiveOk(pct), meta: { percent: pct } })
  }
  return result({ id: 'passiveVoice', rating: 'bad', text: m.passiveBad(pct), meta: { percent: pct } })
}

export function assessTransitionWords(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const sentences = ctx.content.sentences
  if (sentences.length === 0) {
    return result({ id: 'transitionWords', rating: 'ok', text: m.transitionOk(0) })
  }
  const withTransition = sentences.filter((s) =>
    hasTransition(s, ctx.pack.transitionWords),
  ).length
  const pct = Math.round((withTransition / sentences.length) * 100)
  if (pct >= 30) {
    return result({
      id: 'transitionWords',
      rating: 'good',
      text: m.transitionGood,
      meta: { percent: pct },
    })
  }
  if (pct >= 20) {
    return result({
      id: 'transitionWords',
      rating: 'ok',
      text: m.transitionOk(pct),
      meta: { percent: pct },
    })
  }
  return result({
    id: 'transitionWords',
    rating: 'bad',
    text: m.transitionBad(pct),
    meta: { percent: pct },
  })
}

export function assessConsecutiveSentences(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const sentences = ctx.content.sentences
  if (sentences.length < 3) {
    return result({ id: 'consecutiveSentences', rating: 'good', text: m.consecutiveGood })
  }

  let streak = 1
  let maxStreak = 1
  let prev = tokenizeWords(sentences[0] ?? '')[0]?.toLowerCase() ?? ''

  for (let i = 1; i < sentences.length; i++) {
    const first = tokenizeWords(sentences[i] ?? '')[0]?.toLowerCase() ?? ''
    if (first && first === prev) {
      streak += 1
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 1
      prev = first
    }
  }

  if (maxStreak >= 3) {
    return result({
      id: 'consecutiveSentences',
      rating: 'bad',
      text: m.consecutiveBad,
      meta: { streak: maxStreak },
    })
  }
  return result({
    id: 'consecutiveSentences',
    rating: 'good',
    text: m.consecutiveGood,
    meta: { streak: maxStreak },
  })
}

export function assessReadabilitySubheadings(ctx: ReadabilityContext): AssessmentResult {
  const m = ctx.pack.messages.readability
  const words = ctx.content.wordCount
  const subs = ctx.content.headings.filter((h) => h.level >= 2).length

  if (words < 300) {
    return result({ id: 'readabilitySubheadings', rating: 'good', text: m.subheadingGood })
  }

  // Roughly one subheading per ~250–300 words
  const ratio = words / Math.max(1, subs)
  if (subs === 0) {
    return result({ id: 'readabilitySubheadings', rating: 'bad', text: m.subheadingBad })
  }
  if (ratio > 350) {
    return result({ id: 'readabilitySubheadings', rating: 'ok', text: m.subheadingOk })
  }
  return result({ id: 'readabilitySubheadings', rating: 'good', text: m.subheadingGood })
}

export function runReadabilityAssessments(ctx: ReadabilityContext): AssessmentResult[] {
  return [
    assessFlesch(ctx),
    assessPersianReadability(ctx),
    assessSentenceLength(ctx),
    assessParagraphLength(ctx),
    assessPassiveVoice(ctx),
    assessTransitionWords(ctx),
    assessConsecutiveSentences(ctx),
    assessReadabilitySubheadings(ctx),
  ].filter((a): a is AssessmentResult => a !== null)
}
