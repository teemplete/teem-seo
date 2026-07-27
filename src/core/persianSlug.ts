import { normalizeKeyphrase, slugifyKeyphrase } from './parseContent'

const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

/** Common FA → Latin slug forms (loanwords + frequent romanizations). */
const FA_SLUG_EQUIVALENTS: Record<string, string[]> = {
  سئو: ['seo'],
  گوگل: ['google'],
  محتوا: ['content', 'mohtava', 'mohtavaa'],
  دیجیتال: ['digital', 'dijital'],
  مارکتینگ: ['marketing'],
  بازاریابی: ['marketing', 'bazaryabi'],
  آنلاین: ['online', 'onlin'],
  اینترنت: ['internet'],
  وبسایت: ['website', 'web-site', 'websites'],
  وب: ['web'],
  سایت: ['site', 'website'],
  بلاگ: ['blog'],
  مقاله: ['article', 'maghale', 'maghaleh'],
  راهنما: ['guide', 'rahnama'],
  خرید: ['buy', 'kharid', 'purchase'],
  فروش: ['sale', 'foroosh', 'forush'],
  قیمت: ['price', 'gheymat'],
  آموزش: ['tutorial', 'amozesh', 'amoozesh', 'training', 'learn'],
  طراحی: ['design', 'tarahi'],
  برنامه: ['program', 'app', 'barname'],
  اپلیکیشن: ['app', 'application'],
  موبایل: ['mobile'],
  گوشی: ['phone', 'mobile', 'goshi'],
  لپتاپ: ['laptop'],
  'لپ تاپ': ['laptop'],
  اینستاگرام: ['instagram', 'insta'],
  تلگرام: ['telegram'],
  واتساپ: ['whatsapp', 'whats-app'],
  یوتیوب: ['youtube'],
  فیسبوک: ['facebook'],
  توییتر: ['twitter', 'x'],
  ایمیل: ['email', 'e-mail'],
  هوش: ['ai', 'intelligence'],
  مصنوعی: ['artificial', 'masnooi'],
  کلمات: ['keywords', 'words', 'kalamat'],
  کلیدی: ['key', 'keyword', 'keyphrase'],
  رتبه: ['rank', 'ranking', 'rotbe'],
  لینک: ['link'],
  'بک لینک': ['backlink', 'back-link'],
  'بک\u200cلینک': ['backlink', 'back-link'],
}

/** Multi-letter digraphs first, then single letters. و/ی get context variants elsewhere. */
const FA_CHAR_MAP: Array<[string, string]> = [
  ['خ', 'kh'],
  ['چ', 'ch'],
  ['ش', 'sh'],
  ['ژ', 'zh'],
  ['غ', 'gh'],
  ['ق', 'gh'],
  ['ا', 'a'],
  ['آ', 'a'],
  ['أ', 'a'],
  ['إ', 'e'],
  ['ب', 'b'],
  ['پ', 'p'],
  ['ت', 't'],
  ['ث', 's'],
  ['ج', 'j'],
  ['ح', 'h'],
  ['د', 'd'],
  ['ذ', 'z'],
  ['ر', 'r'],
  ['ز', 'z'],
  ['س', 's'],
  ['ص', 's'],
  ['ض', 'z'],
  ['ط', 't'],
  ['ظ', 'z'],
  ['ع', 'a'],
  ['ف', 'f'],
  ['ک', 'k'],
  ['ك', 'k'],
  ['گ', 'g'],
  ['ل', 'l'],
  ['م', 'm'],
  ['ن', 'n'],
  ['ه', 'h'],
  ['ة', 'h'],
  ['ۀ', 'h'],
  ['ء', ''],
  ['ئ', 'e'],
  ['ؤ', 'o'],
  ['ى', 'i'],
  ['ي', 'i'],
  ['ی', 'i'],
  ['و', 'v'],
]

export function hasArabicScript(text: string): boolean {
  return ARABIC_SCRIPT.test(text)
}

export function isMostlyLatinSlug(slug: string): boolean {
  const letters = slug.match(/\p{L}/gu) ?? []
  if (letters.length === 0) return false
  const latin = letters.filter((ch) => /[A-Za-z]/.test(ch)).length
  return latin / letters.length >= 0.7
}

function decodeSlug(slug: string): string {
  const trimmed = slug.trim()
  if (!/%[0-9A-Fa-f]{2}/.test(trimmed)) return trimmed
  try {
    return decodeURIComponent(trimmed.replace(/\+/g, ' '))
  } catch {
    return trimmed
  }
}

function stripNonSlug(text: string): string {
  return text.replace(/[^\p{L}\p{N}-]/gu, '')
}

/** Transliterate one Persian word; و → v and o variants. */
export function transliteratePersianWord(word: string): string[] {
  const normalized = normalizeKeyphrase(word)
  if (!normalized) return []

  const variants = new Set<string>()

  const build = (vav: string, ye: string): string => {
    let out = ''
    for (const ch of normalized) {
      if (ch === 'و') {
        out += vav
        continue
      }
      if (ch === 'ی' || ch === 'ي' || ch === 'ى') {
        out += ye
        continue
      }
      const mapped = FA_CHAR_MAP.find(([fa]) => fa === ch)
      out += mapped ? mapped[1] : /[A-Za-z0-9-]/.test(ch) ? ch : ''
    }
    return out.replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  for (const vav of ['v', 'o', 'u', 'ou', 'oo']) {
    for (const ye of ['i', 'y', 'ee']) {
      const t = build(vav, ye)
      if (t) variants.add(t)
    }
  }

  // Digraph-aware pass with default و→v, ی→i
  let digraph = ''
  let i = 0
  while (i < normalized.length) {
    const two = normalized.slice(i, i + 2)
    const digraphHit = FA_CHAR_MAP.find(([fa]) => fa.length === 2 && fa === two)
    if (digraphHit) {
      digraph += digraphHit[1]
      i += 2
      continue
    }
    const ch = normalized[i]!
    if (ch === 'و') digraph += 'v'
    else if (ch === 'ی' || ch === 'ي' || ch === 'ى') digraph += 'i'
    else {
      const mapped = FA_CHAR_MAP.find(([fa]) => fa === ch)
      digraph += mapped ? mapped[1] : /[A-Za-z0-9-]/.test(ch) ? ch : ''
    }
    i += 1
  }
  if (digraph) variants.add(digraph)

  return [...variants]
}

/** Letters-only skeleton for fuzzy romanization match (short vowels omitted in FA). */
function latinSkeleton(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** True if `needle` letters appear in order inside `hay` (extra Latin vowels allowed). */
function sequentialLetterMatch(hay: string, needle: string): boolean {
  const h = latinSkeleton(hay)
  const n = latinSkeleton(needle)
  if (!n || !h) return false
  if (h.includes(n)) return true
  let j = 0
  for (let i = 0; i < h.length && j < n.length; i++) {
    if (h[i] === n[j]) j++
  }
  return j === n.length
}

function wordEquivalents(word: string): string[] {
  const n = normalizeKeyphrase(word)
  const fromMap = FA_SLUG_EQUIVALENTS[n] ?? FA_SLUG_EQUIVALENTS[word] ?? []
  return [...new Set([n, stripNonSlug(n), ...fromMap, ...transliteratePersianWord(n)].filter(Boolean))]
}

function wordMatchesSlug(word: string, slug: string): boolean {
  const cleaned = stripNonSlug(word)
  if (cleaned && slug.includes(cleaned.toLowerCase())) return true

  const tokens = slug.split(/[-_/]+/).filter(Boolean)
  for (const eq of wordEquivalents(word)) {
    const e = eq.toLowerCase()
    if (!e) continue
    if (slug.includes(e)) return true
    if (tokens.some((t) => t === e || sequentialLetterMatch(t, e))) return true
  }
  return false
}

/**
 * Whether the focus keyphrase is reflected in the slug.
 * Supports Persian characters in the slug, percent-encoded Persian,
 * romanized Persian (e.g. محتوا → mohtava), and common English equivalents (سئو → seo).
 */
export function keyphraseMatchesSlug(keyphrase: string, rawSlug: string): boolean {
  const kp = normalizeKeyphrase(keyphrase)
  if (!kp) return false

  const slug = decodeSlug(rawSlug).toLowerCase().replace(/^\/+|\/+$/g, '')
  if (!slug) return false

  const slugified = slugifyKeyphrase(kp)
  if (slugified && slug.includes(slugified)) return true

  const words = kp.split(/\s+/).filter(Boolean)
  if (words.length === 0) return false

  // Latin / mixed keyphrases: every word must appear (existing behavior).
  if (!hasArabicScript(kp)) {
    return words.every((w) => slug.includes(stripNonSlug(w).toLowerCase()))
  }

  // Cover multi-word FA compounds (e.g. لپ تاپ → laptop) by preferring longer spans.
  const matched = new Array(words.length).fill(false)
  for (let len = Math.min(3, words.length); len >= 1; len--) {
    for (let start = 0; start <= words.length - len; start++) {
      if (matched.slice(start, start + len).every(Boolean)) continue
      const span = words.slice(start, start + len).join(' ')
      if (wordMatchesSlug(span, slug)) {
        for (let i = start; i < start + len; i++) matched[i] = true
      }
    }
  }
  return matched.every(Boolean)
}

/** Latin slug with a Persian keyphrase is common practice; treat as acceptable when non-empty. */
export function isAcceptableLatinizedPersianSlug(keyphrase: string, rawSlug: string): boolean {
  const kp = normalizeKeyphrase(keyphrase)
  const slug = decodeSlug(rawSlug).toLowerCase().replace(/^\/+|\/+$/g, '')
  if (!kp || !slug) return false
  if (!hasArabicScript(kp)) return false
  if (!isMostlyLatinSlug(slug)) return false
  // Meaningful slug: at least one letter token ≥ 2 chars
  return slug.split(/[-_/]+/).some((t) => /[a-z]{2,}/i.test(t))
}
