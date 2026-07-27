import type {
  ParsedContent,
  ParsedHeading,
  ParsedImage,
  ParsedLink,
} from './types'
import { getLanguagePack, resolveLocale } from './language/detect'
import type { LocaleOption } from './types'

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  )
}

function attr(tag: string, name: string): string {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const m = tag.match(re)
  return decodeEntities(m?.[2] ?? m?.[3] ?? m?.[4] ?? '')
}

function extractHeadings(html: string): ParsedHeading[] {
  const headings: ParsedHeading[] = []
  const re = /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    headings.push({
      level: Number(m[1]),
      text: stripTags(m[2]).trim(),
    })
  }
  return headings
}

function extractImages(html: string): ParsedImage[] {
  const images: ParsedImage[] = []
  const re = /<img\b[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    images.push({
      src: attr(m[0], 'src'),
      alt: attr(m[0], 'alt'),
    })
  }
  return images
}

function looksLikeBareDomain(href: string): boolean {
  if (!href || href.startsWith('.') || href.startsWith('#')) return false
  if (href.startsWith('/') && !href.startsWith('//')) return false
  const pathPart = href.split(/[?#]/)[0] ?? ''
  if (!pathPart.includes('/') && /\.(html?|php|asp|aspx|jsp)$/i.test(pathPart)) return false
  try {
    const parsed = new URL(/^https?:\/\//i.test(href) ? href : `https://${href}`)
    return parsed.hostname.includes('.')
  } catch {
    return false
  }
}

function isInternalHref(href: string, siteUrl?: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return true
  }
  if (href.startsWith('/') && !href.startsWith('//')) return true

  const absolute = /^https?:\/\//i.test(href)
  const protocolRelative = href.startsWith('//')
  const bareDomain = !absolute && !protocolRelative && looksLikeBareDomain(href)

  if (protocolRelative || absolute || bareDomain) {
    if (!siteUrl) return false
    try {
      const base = new URL(siteUrl)
      const resolved = protocolRelative
        ? new URL(`https:${href}`)
        : bareDomain
          ? new URL(`https://${href}`)
          : new URL(href)
      return resolved.hostname === base.hostname
    } catch {
      return false
    }
  }

  if (!siteUrl) return true
  try {
    const base = new URL(siteUrl)
    const target = new URL(href, siteUrl)
    return target.hostname === base.hostname
  } catch {
    return true
  }
}

function extractLinks(html: string, siteUrl?: string): ParsedLink[] {
  const links: ParsedLink[] = []
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const href = attr(m[1], 'href')
    if (!href) continue
    links.push({
      href,
      text: stripTags(m[2]).trim(),
      isInternal: isInternalHref(href, siteUrl),
    })
  }
  return links
}

function tokenizeWords(text: string): string[] {
  return text
    .replace(/[\u200c\u200d]/g, '') // ZWNJ/ZWJ
    .split(/[^\p{L}\p{N}'’\-]+/u)
    .map((w) => w.trim())
    .filter(Boolean)
}

function splitSentences(text: string, localeOption?: LocaleOption): string[] {
  const locale = resolveLocale(localeOption, text)
  const pack = getLanguagePack(locale)
  return text
    .split(pack.sentenceSplitRegex)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}

export function parseContent(
  content: string,
  options?: { siteUrl?: string; locale?: LocaleOption },
): ParsedContent {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  const html = looksLikeHtml ? content : `<p>${content.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
  const plainText = stripTags(html)
  const words = tokenizeWords(plainText)
  const paragraphs = splitParagraphs(plainText)
  const sentences = splitSentences(plainText, options?.locale)
  const headings = extractHeadings(html)
  const images = extractImages(html)
  const links = extractLinks(html, options?.siteUrl)

  return {
    plainText,
    html,
    words,
    wordCount: words.length,
    sentences,
    paragraphs,
    headings,
    images,
    links,
    introduction: paragraphs[0] ?? sentences[0] ?? '',
  }
}

export function normalizeKeyphrase(keyphrase: string): string {
  return keyphrase
    .trim()
    .replace(/[\u200c\u200d]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function slugifyKeyphrase(keyphrase: string): string {
  return normalizeKeyphrase(keyphrase)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function countKeyphraseOccurrences(text: string, keyphrase: string): number {
  const kp = normalizeKeyphrase(keyphrase)
  if (!kp) return 0
  const hay = normalizeKeyphrase(text)
  if (!hay.includes(kp)) return 0
  // Escape regex special chars
  const escaped = kp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')
  return (hay.match(re) ?? []).length
}

export function containsKeyphrase(text: string, keyphrase: string): boolean {
  return countKeyphraseOccurrences(text, keyphrase) > 0
}

export function estimateTitleWidth(title: string, charWidth = 10): number {
  // Approximate Google SERP title truncation (~580–600px)
  let width = 0
  for (const ch of title) {
    if (ch === ' ') width += charWidth * 0.35
    else if (/[\u0600-\u06FF]/.test(ch)) width += charWidth * 0.95
    else if (/[A-Z]/.test(ch)) width += charWidth * 1.15
    else if (/[ilI1]/.test(ch)) width += charWidth * 0.45
    else if (/[mwMW]/.test(ch)) width += charWidth * 1.35
    else width += charWidth
  }
  return Math.round(width)
}

export { tokenizeWords, splitSentences }
