import type {
  GetInternalLinkSuggestions,
  InternalLinkQuery,
} from 'teemseo'

interface CatalogPage {
  title: string
  url: string
  excerpt: string
  keyphrase: string
  tags: string[]
  isCornerstone?: boolean
  locale: 'en' | 'fa'
}

const CATALOG: CatalogPage[] = [
  {
    locale: 'en',
    title: 'Internal linking best practices',
    url: 'https://example.com/blog/internal-linking',
    excerpt: 'How to build topical clusters with internal links.',
    keyphrase: 'internal linking',
    tags: ['seo', 'links', 'content'],
    isCornerstone: true,
  },
  {
    locale: 'en',
    title: 'Keyword research for content teams',
    url: 'https://example.com/blog/keyword-research',
    excerpt: 'Find focus keyphrases that match search intent.',
    keyphrase: 'keyword research',
    tags: ['seo', 'keyphrase', 'content'],
  },
  {
    locale: 'en',
    title: 'On-page SEO checklist',
    url: 'https://example.com/blog/on-page-seo',
    excerpt: 'Titles, meta descriptions, headings, and content SEO basics.',
    keyphrase: 'on-page SEO',
    tags: ['seo', 'content', 'meta'],
  },
  {
    locale: 'en',
    title: 'Writing readable web copy',
    url: 'https://example.com/blog/readable-copy',
    excerpt: 'Short sentences, transitions, and scannable paragraphs.',
    keyphrase: 'readable copy',
    tags: ['readability', 'content', 'writing'],
  },
  {
    locale: 'en',
    title: 'Internal SEO guide',
    url: 'https://example.com/blog/seo',
    excerpt: 'Our hub for SEO tactics and resources.',
    keyphrase: 'SEO guide',
    tags: ['seo'],
  },
  {
    locale: 'fa',
    title: 'بهترین روش‌های لینک‌سازی داخلی',
    url: 'https://example.com/blog/link-dakheli',
    excerpt: 'چگونه با لینک داخلی خوشه موضوعی بسازید.',
    keyphrase: 'لینک داخلی',
    tags: ['سئو', 'لینک', 'محتوا'],
    isCornerstone: true,
  },
  {
    locale: 'fa',
    title: 'تحقیق کلمه کلیدی برای تیم محتوا',
    url: 'https://example.com/blog/tahghigh-kalame',
    excerpt: 'کلمه کلیدی کانونی متناسب با نیت جستجو پیدا کنید.',
    keyphrase: 'تحقیق کلمه کلیدی',
    tags: ['سئو', 'کلمه کلیدی', 'محتوا'],
  },
  {
    locale: 'fa',
    title: 'چک‌لیست سئو داخلی صفحه',
    url: 'https://example.com/blog/seo-safhe',
    excerpt: 'عنوان، توضیحات متا، زیرعنوان و اصول سئو محتوا.',
    keyphrase: 'سئو داخلی',
    tags: ['سئو', 'محتوا', 'متا'],
  },
  {
    locale: 'fa',
    title: 'نوشتن متن خوانا برای وب',
    url: 'https://example.com/blog/matn-khana',
    excerpt: 'جملات کوتاه، کلمات ربط و پاراگراف‌های قابل اسکن.',
    keyphrase: 'متن خوانا',
    tags: ['خوانایی', 'محتوا', 'نوشتار'],
  },
  {
    locale: 'fa',
    title: 'راهنمای داخلی سئو',
    url: 'https://example.com/blog/seo',
    excerpt: 'هاب تاکتیک‌ها و منابع سئو.',
    keyphrase: 'راهنمای سئو',
    tags: ['سئو'],
  },
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\u200c\u200d]/g, '')
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}'’-]+/u)
    .filter((t) => t.length > 1)
}

function scorePage(page: CatalogPage, query: InternalLinkQuery): {
  score: number
  matchedTerms: string[]
} {
  const hay = normalize(
    `${page.title} ${page.keyphrase} ${page.excerpt} ${page.tags.join(' ')}`,
  )
  const matched = new Set<string>()
  let score = 0

  const kp = normalize(query.focusKeyphrase)
  if (kp && hay.includes(kp)) {
    score += 3
    matched.add(query.focusKeyphrase)
  }

  for (const word of query.prominentWords) {
    const w = normalize(word)
    if (w && hay.includes(w)) {
      score += 2
      matched.add(word)
    }
  }

  for (const token of tokenize(query.title)) {
    if (hay.includes(token)) {
      score += 1
      matched.add(token)
    }
  }

  if (page.isCornerstone) score += 1

  return { score, matchedTerms: [...matched].slice(0, 4) }
}

/** Demo-only mock of a host CMS suggestions API. */
export const mockGetInternalLinkSuggestions: GetInternalLinkSuggestions = async (
  query,
) => {
  await new Promise((r) => setTimeout(r, 180))

  const excluded = new Set(
    query.excludeUrls.map((u) => u.replace(/\/$/, '').toLowerCase()),
  )

  const ranked = CATALOG.filter((p) => p.locale === query.locale)
    .filter((p) => !excluded.has(p.url.replace(/\/$/, '').toLowerCase()))
    .map((page) => {
      const { score, matchedTerms } = scorePage(page, query)
      return { page, score, matchedTerms }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, query.limit)
    .map(({ page, score, matchedTerms }) => ({
      title: page.title,
      url: page.url,
      excerpt: page.excerpt,
      score: Math.min(1, score / 10),
      matchedTerms,
    }))

  return ranked
}
