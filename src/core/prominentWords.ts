import { getLanguagePack, resolveLocale } from './language/detect'
import { parseContent } from './parseContent'
import type { LocaleOption } from './types'

export interface ProminentWord {
  word: string
  count: number
}

/**
 * Extract frequently used (prominent) content words, excluding stop words.
 * Sorted by count descending.
 */
export function getProminentWords(
  content: string,
  options?: { locale?: LocaleOption; limit?: number; minLength?: number },
): ProminentWord[] {
  const limit = options?.limit ?? 12
  const minLength = options?.minLength ?? 3
  const parsed = parseContent(content, { locale: options?.locale })
  const locale = resolveLocale(options?.locale, parsed.plainText)
  const stopWords = getLanguagePack(locale).stopWords

  const counts = new Map<string, number>()
  for (const raw of parsed.words) {
    const word = raw.toLowerCase()
    if (word.length < minLength) continue
    if (stopWords.has(word)) continue
    if (/^\d+$/.test(word)) continue
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, locale))
    .slice(0, limit)
}
