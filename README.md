# TeemSEO

Yoast-like SEO and readability analysis for **React** and **Next.js**, with full **English** and **Persian (فارسی)** support.

`TeemSEO` analyzes your content against focus keyphrase, meta fields, structure, links, and readability — then shows traffic-light feedback (good / ok / bad), including text-quality issues.

## Install

```bash
npm install teemseo
```

Peer dependencies: `react` (and optionally `next`).

## Quick start (React)

```tsx
import { TeemSEO } from 'teemseo'
import 'teemseo/styles.css'

export function EditorSidebar({ html }: { html: string }) {
  return (
    <TeemSEO
      content={html}
      focusKeyphrase="content SEO"
      title="Complete guide to content SEO"
      metaDescription="Practical tactics for titles, metas, and readable copy."
      slug="content-seo-guide"
      siteUrl="https://example.com"
      locale="auto"
      onChangeMeta={(meta) => console.log(meta)}
      onAnalysis={(result) => console.log(result.overallScore)}
    />
  )
}
```

## Headless analysis (no UI)

```ts
import { analyze, analyzeSync } from 'teemseo'

const result = analyzeSync({
  content: '<h1>سلام</h1><p>این متن درباره سئو محتوا است...</p>',
  focusKeyphrase: 'سئو محتوا',
  title: 'راهنمای سئو محتوا',
  metaDescription: 'همه چیز درباره سئو محتوا برای نویسندگان فارسی‌زبان.',
  slug: 'seo-mohtava',
  locale: 'auto', // 'en' | 'fa' | 'auto'
})

console.log(result.seoScore, result.readabilityScore)
console.log(result.seo, result.readability)
```

Async variant when checking duplicate keyphrases:

```ts
const result = await analyze({
  content,
  focusKeyphrase: 'seo',
  isKeyphraseUsedElsewhere: async (kp) => db.exists(kp),
})
```

## Next.js helpers

```ts
import { buildMetadata, buildJsonLd } from 'teemseo/next'

export async function generateMetadata() {
  return buildMetadata({
    title: 'My article',
    description: 'Description',
    siteUrl: 'https://example.com',
    slug: 'my-article',
    locale: 'en',
  })
}

const jsonLd = buildJsonLd({
  type: 'Article',
  title: 'My article',
  description: 'Description',
  authorName: 'Author',
  locale: 'fa',
})
```

In a Server Component:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

## Suggested internal links

TeemSEO does not crawl your site. Pass `getInternalLinkSuggestions` so the host CMS/API ranks related pages and returns them for the accordion UI.

**Query TeemSEO sends:**

```ts
{
  focusKeyphrase: string
  title: string
  slug: string
  prominentWords: string[] // top content words (stop words removed)
  locale: 'en' | 'fa'
  excludeUrls: string[]    // current page + internal links already in content
  limit: number
}
```

**Each suggestion you return:**

```ts
{
  title: string
  url: string
  excerpt?: string
  score?: number          // 0..1, optional sort hint
  matchedTerms?: string[] // shown as chips in the UI
}
```

### Callback (recommended)

```tsx
import { TeemSEO, type GetInternalLinkSuggestions } from 'teemseo'
import 'teemseo/styles.css'

const getInternalLinkSuggestions: GetInternalLinkSuggestions = async (query) => {
  // Rank in your DB/search using keyphrase, prominentWords, title, cornerstone, etc.
  // Suggested score weights: 3*keyphrase + 2*prominent + 1*titleTokens + 1*cornerstone
  const res = await fetch('/api/internal-links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  })
  const data = await res.json()
  return data.suggestions // InternalLinkSuggestion[]
}

<TeemSEO
  content={html}
  siteUrl="https://example.com"
  getInternalLinkSuggestions={getInternalLinkSuggestions}
/>
```

### URL helper

If your API accepts `POST` JSON and responds with `{ suggestions: [...] }`:

```tsx
import { TeemSEO, createInternalLinkSuggestionsFetcher } from 'teemseo'

<TeemSEO
  content={html}
  siteUrl="https://example.com"
  getInternalLinkSuggestions={createInternalLinkSuggestionsFetcher(
    'https://example.com/api/internal-links',
  )}
/>
```

Without this prop, the accordion shows a short “provide getInternalLinkSuggestions” message.

Requests run **only when the accordion is opened**. After a successful response for the current content/meta, reopen/close does not refetch. Editing content or keyphrase invalidates the cache so the next open fetches again.

## What it checks

### SEO
- Focus keyphrase length & presence in title, meta, intro, body, subheadings, image alts, slug
- Keyphrase density
- Title / meta description length
- Text length
- Internal & outbound links
- Single H1
- Subheading distribution
- Optional “keyphrase used elsewhere”

### Readability
- **English:** Flesch Reading Ease, sentence/paragraph length, passive voice, transition words, consecutive sentence starts, subheadings
- **Persian:** sentence/paragraph length, transition words, passive markers, consecutive starts, subheadings, plus a Persian complexity heuristic (no English Flesch)

UI messages follow `messageLocale` (or detected content locale) in English or Persian. RTL is applied automatically for FA.

## API surface

| Import | Purpose |
|--------|---------|
| `teemseo` | `analyze`, `analyzeSync`, `TeemSEO`, `useTeemSEO`, `getProminentWords`, `buildInternalLinkQuery`, `createInternalLinkSuggestionsFetcher`, types |
| `teemseo/react` | React-only entry (`TeemSEO`, `useInternalLinkSuggestions`, …) |
| `teemseo/next` | `buildMetadata`, `buildJsonLd` |
| `teemseo/styles.css` | Component styles |

## Local demo

```bash
npm install
npm run build
cd examples/demo && npm install && npm run dev
```

## License

MIT
