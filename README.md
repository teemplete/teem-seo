# TeemSEO

Yoast-like SEO and readability analysis for **React** and **Next.js**, with full **English** and **Persian (فارسی)** support.

TeemSEO analyzes content against a focus keyphrase, meta fields, structure, links, and readability — then shows traffic-light feedback (`good` / `ok` / `bad`). Use the full UI sidebar, headless analysis only, or compose your own UI from exported hooks and components.

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [Package entry points](#package-entry-points)
- [Quick start (React)](#quick-start-react)
- [Next.js (App Router)](#nextjs-app-router)
- [Headless analysis](#headless-analysis)
- [Analysis result shape](#analysis-result-shape)
- [Suggested internal links](#suggested-internal-links)
- [Link classification](#link-classification-internal-vs-outbound)
- [Persian slug matching](#persian-slug-matching)
- [What it checks](#what-it-checks)
- [Props reference](#props-reference)
- [Core utilities](#core-utilities)
- [Custom UI (`teemseo/react`)](#custom-ui-teemseoreact)
- [Styling](#styling)
- [Integration patterns](#integration-patterns)
- [Local demo](#local-demo)
- [License](#license)

## Features

- SEO checks: keyphrase placement, density, title/meta length, text length, H1/subheadings, internal & outbound links, optional duplicate keyphrase
- Readability: English Flesch + shared rules; Persian-specific heuristics (no English Flesch on FA content)
- Bilingual UI messages (EN / FA) with automatic RTL for Persian
- SERP snippet preview
- Internal link suggestions accordion (host provides ranking via callback or API)
- Persian slug intelligence: `سئو` ↔ `seo`, `محتوا` ↔ `mohtava`, percent-encoded Persian slugs, and more
- Tree-shakeable core — use without React if you only need `analyze()`

## Requirements

- **Node.js** ≥ 18
- **React** ≥ 18 (optional — only for UI)
- **Next.js** ≥ 13 (optional — only for `teemseo/next` helpers)

Peer dependencies are optional in `package.json`; install `react` / `react-dom` when using the UI, and `next` when using metadata/JSON-LD helpers.

## Install

```bash
npm install teemseo
# or
pnpm add teemseo
# or
yarn add teemseo
```

Import styles once wherever you render `<TeemSEO />`:

```ts
import 'teemseo/styles.css'
```

## Package entry points

| Import | When to use |
|--------|-------------|
| `teemseo` | Default — core analysis + React UI re-exported |
| `teemseo/react` | **Recommended in Next.js App Router** — client components only (`'use client'`) |
| `teemseo/next` | `buildMetadata`, `buildJsonLd` for Next.js metadata / structured data |
| `teemseo/styles.css` | Default sidebar styles |

```ts
// Vite / CRA / Pages Router — either works
import { TeemSEO, analyzeSync } from 'teemseo'

// Next.js App Router — prefer the react entry in Client Components
import { TeemSEO } from 'teemseo/react'
import { buildMetadata } from 'teemseo/next'
```

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

**Content format:** pass HTML (from TipTap, CKEditor, Quill, etc.) or plain text. Plain text is wrapped into paragraphs automatically.

**Controlled meta:** pass initial `focusKeyphrase`, `title`, `metaDescription`, `slug` as props and listen to `onChangeMeta` to sync with your CMS state (see [Integration patterns](#integration-patterns)).

## Next.js (App Router)

Split server metadata from client analysis:

```tsx
// app/blog/[slug]/edit/page.tsx
'use client'

import { TeemSEO } from 'teemseo/react'
import 'teemseo/styles.css'

export default function EditPage({ html }: { html: string }) {
  return (
    <TeemSEO
      content={html}
      siteUrl="https://example.com"
      locale="auto"
      // ...meta props
    />
  )
}
```

```ts
// app/blog/[slug]/page.tsx
import { buildMetadata, buildJsonLd, jsonLdScriptContent } from 'teemseo/next'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return buildMetadata({
    title: post.title,
    description: post.metaDescription,
    slug: post.slug,
    siteUrl: 'https://example.com',
    locale: 'fa',
    from: post, // can include allowIndex / allowFollow
  })
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  const jsonLd = buildJsonLd({
    type: 'Article',
    title: post.title,
    description: post.metaDescription,
    url: `https://example.com/${post.slug}`,
    authorName: post.author,
    locale: 'fa',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* or: dangerouslySetInnerHTML={{ __html: jsonLdScriptContent({ ... }) }} */}
      <article>{/* ... */}</article>
    </>
  )
}
```

## Headless analysis

No UI — use in APIs, workers, or custom dashboards:

```ts
import { analyze, analyzeSync } from 'teemseo'

const result = analyzeSync({
  content: '<h1>سلام</h1><p>این متن درباره سئو محتوا است...</p>',
  focusKeyphrase: 'سئو محتوا',
  title: 'راهنمای سئو محتوا',
  metaDescription: 'همه چیز درباره سئو محتوا برای نویسندگان فارسی‌زبان.',
  slug: 'seo-mohtava',
  siteUrl: 'https://example.com',
  locale: 'auto',
})

console.log(result.seoScore, result.readabilityScore, result.overallScore)
console.log(result.seo, result.readability, result.stats)
```

Async variant when checking duplicate keyphrases across your site:

```ts
const result = await analyze({
  content,
  focusKeyphrase: 'seo',
  siteUrl: 'https://example.com',
  isKeyphraseUsedElsewhere: async (kp) => db.exists(kp),
})
```

`analyzeSync` does **not** call `isKeyphraseUsedElsewhere` (use `analyze` for that).

## Analysis result shape

```ts
interface AnalysisResult {
  locale: 'en' | 'fa'              // detected content language
  messageLocale: 'en' | 'fa'       // language of assessment messages
  seo: AssessmentResult[]
  readability: AssessmentResult[]
  seoScore: 'good' | 'ok' | 'bad'
  readabilityScore: 'good' | 'ok' | 'bad'
  overallScore: 'good' | 'ok' | 'bad'
  stats: {
    wordCount: number
    sentenceCount: number
    paragraphCount: number
    headingCount: number
    imageCount: number
    linkCount: number
    keyphraseDensity: number       // percentage
  }
}

interface AssessmentResult {
  id: AssessmentId
  rating: 'good' | 'ok' | 'bad'
  score: number
  text: string                     // localized message
  meta?: Record<string, string | number | boolean>
}
```

Scores aggregate individual assessments: mostly `good` → `good` overall; mix of `ok`/`bad` → `ok`; mostly `bad` → `bad`.

## Suggested internal links

TeemSEO does **not** crawl your site. Pass `getInternalLinkSuggestions` so your CMS/API ranks related pages for the accordion UI.

**Query TeemSEO sends:**

```ts
interface InternalLinkQuery {
  focusKeyphrase: string
  title: string
  slug: string
  prominentWords: string[]   // top content words (stop words removed)
  locale: 'en' | 'fa'
  excludeUrls: string[]      // current page URL + internal links already in content
  limit: number
}
```

**Each suggestion you return:**

```ts
interface InternalLinkSuggestion {
  title: string
  url: string
  excerpt?: string
  score?: number             // 0..1, optional sort hint
  matchedTerms?: string[]    // shown as chips in the UI
}
```

### Callback (recommended)

```tsx
import { TeemSEO, type GetInternalLinkSuggestions } from 'teemseo'
import 'teemseo/styles.css'

const getInternalLinkSuggestions: GetInternalLinkSuggestions = async (query) => {
  const res = await fetch('/api/internal-links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  })
  const data = await res.json()
  return data.suggestions
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

**Fetch behavior:** requests run only when the accordion is opened. After a successful response for the current content/meta, reopen/close does not refetch. Editing content or keyphrase invalidates the cache.

## Link classification (internal vs outbound)

Pass **`siteUrl`** (site origin) so TeemSEO can tell internal links from outbound ones:

| `href` | With `siteUrl="https://example.com"` |
|--------|--------------------------------------|
| `/blog/seo` | Internal (root-relative path) |
| `https://example.com/blog/seo` | Internal (same hostname) |
| `//example.com/about` | Internal (protocol-relative, same host) |
| `https://other.com/x` | Outbound |
| `google.com` | Outbound (bare domain) |

Without `siteUrl`, absolute / protocol-relative / bare-domain URLs are treated as **outbound**; root-relative paths (`/…`) stay **internal**.

## Persian slug matching

The `keyphraseInSlug` assessment uses smart matching for Persian content:

- Persian characters in the slug (`سئو-محتوا`)
- Percent-encoded Persian slugs
- Romanized forms (`محتوا` → `mohtava`, `سئو` → `seo`)
- Common English equivalents for loanwords
- Acceptable Latin slugs for Persian keyphrases (e.g. keyphrase `سئو محتوا`, slug `seo-mohtava`)

Use the helpers directly if you build your own slug UI:

```ts
import { keyphraseMatchesSlug, slugifyKeyphrase, hasArabicScript } from 'teemseo'

keyphraseMatchesSlug('سئو محتوا', 'seo-mohtava') // true
slugifyKeyphrase('سئو محتوا')                    // 'سئو-محتوا'
hasArabicScript('content SEO')                   // false
```

## What it checks

### SEO assessments

| ID | What it checks |
|----|----------------|
| `keyphraseLength` | Focus keyphrase is set and not too long |
| `keyphraseInTitle` | Keyphrase appears in SEO title |
| `keyphraseInMetaDescription` | Keyphrase in meta description |
| `keyphraseInIntroduction` | Keyphrase in first paragraph |
| `keyphraseInContent` | Keyphrase in body |
| `keyphraseDensity` | Keyphrase density in range |
| `keyphraseInSubheadings` | Keyphrase in H2–H6 |
| `keyphraseInImageAlt` | Keyphrase in image alt text |
| `keyphraseInSlug` | Keyphrase reflected in slug (incl. Persian rules) |
| `titleLength` | Title length for SERP |
| `metaDescriptionLength` | Meta description length |
| `textLength` | Minimum content length |
| `internalLinks` | At least one internal link |
| `outboundLinks` | At least one outbound link |
| `singleH1` | Exactly one H1 |
| `subheadingDistribution` | Subheadings spread through long content |
| `keyphraseUsedElsewhere` | Optional duplicate keyphrase on another page |

### Readability assessments

| ID | English | Persian |
|----|---------|---------|
| `fleschReadingEase` | ✓ | — |
| `persianReadability` | — | ✓ |
| `sentenceLength` | ✓ | ✓ |
| `paragraphLength` | ✓ | ✓ |
| `passiveVoice` | ✓ | ✓ (Persian passive markers) |
| `transitionWords` | ✓ | ✓ |
| `consecutiveSentences` | ✓ | ✓ |
| `readabilitySubheadings` | ✓ | ✓ |

UI messages follow `messageLocale` (or detected content locale). RTL is applied automatically for FA.

## Props reference

### `<TeemSEO />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | **Required.** HTML or plain text to analyze. |
| `focusKeyphrase` | `string` | `''` | Focus keyphrase for SEO checks. |
| `title` | `string` | `''` | SEO / SERP title. |
| `metaDescription` | `string` | `''` | Meta description. |
| `slug` | `string` | `''` | URL slug (path segment, usually without leading `/`). |
| `siteUrl` | `string` | — | Site origin (e.g. `https://example.com`). Classifies internal vs outbound links and appears in the SERP snippet. |
| `locale` | `'en' \| 'fa' \| 'auto'` | `'auto'` | Content language; `'auto'` detects from text. |
| `messageLocale` | `'en' \| 'fa'` | — | Override language of UI / assessment messages (independent of content locale). |
| `className` | `string` | — | Extra class on the root `<aside>`. |
| `analysisOnly` | `boolean` | `false` | Hide editable meta fields; show analysis + snippet only. |
| `isCornerstone` | `boolean` | `false` | Mark page as cornerstone content. |
| `allowIndex` | `boolean` | `true` | Allow search engines to index this page. |
| `allowFollow` | `boolean` | `true` | Allow search engines to follow links. |
| `onChangeMeta` | `(value: MetaFieldsValue) => void` | — | Fires when editable meta fields change. |
| `onAnalysis` | `(result: AnalysisResult) => void` | — | Fires whenever a new analysis result is ready. |
| `isKeyphraseUsedElsewhere` | `(keyphrase: string) => boolean \| Promise<boolean>` | — | Return `true` if the keyphrase is already used on another page. |
| `getInternalLinkSuggestions` | `GetInternalLinkSuggestions` | — | Callback that returns related internal pages for the accordion. |

`MetaFieldsValue`:

```ts
{
  focusKeyphrase: string
  title: string
  metaDescription: string
  slug: string
  isCornerstone?: boolean
  allowIndex?: boolean
  allowFollow?: boolean
}
```

### `analyze` / `analyzeSync`

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | **Required.** HTML or plain text. |
| `focusKeyphrase` | `string` | Focus keyphrase. |
| `title` | `string` | SEO title. |
| `metaDescription` | `string` | Meta description. |
| `slug` | `string` | URL slug. |
| `siteUrl` | `string` | Site origin for link classification. |
| `locale` | `'en' \| 'fa' \| 'auto'` | Content language. |
| `messageLocale` | `'en' \| 'fa'` | Message language override. |
| `isKeyphraseUsedElsewhere` | `(keyphrase: string) => boolean \| Promise<boolean>` | Async only in `analyze()`. |

### `useTeemSEO`

Same options as `analyze`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `debounceMs` | `number` | `200` | Debounce before re-running analysis. |

Returns `{ result: AnalysisResult | null, loading: boolean }`.

### `useInternalLinkSuggestions`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | **Required.** Content used to build the suggestion query. |
| `focusKeyphrase` | `string` | — | Passed into the query. |
| `title` | `string` | — | Passed into the query. |
| `slug` | `string` | — | Current page slug / exclude URL. |
| `siteUrl` | `string` | — | Absolutizes current URL and existing internal links for `excludeUrls`. |
| `locale` | `'en' \| 'fa' \| 'auto'` | `'auto'` | Content language for prominent words. |
| `messageLocale` | `'en' \| 'fa'` | — | UI locale hint. |
| `limit` | `number` | `8` | Max suggestions requested. |
| `debounceMs` | `number` | — | Debounce before fetching. |
| `enabled` | `boolean` | — | When `false`, no request (e.g. accordion closed). |
| `getInternalLinkSuggestions` | `GetInternalLinkSuggestions` | — | Host fetcher / callback. |

### `buildMetadata` (`teemseo/next`)

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title. |
| `description` | `string` | Meta description. |
| `slug` | `string` | Path segment for canonical URL. |
| `siteUrl` | `string` | Origin used with `slug` to build canonical / OG URL. |
| `canonical` | `string` | Explicit canonical URL (overrides `siteUrl` + `slug`). |
| `locale` | `'en' \| 'fa'` | Sets Open Graph locale (`en_US` / `fa_IR`). |
| `openGraph` | `{ type?, images? }` | Open Graph extras. |
| `twitter` | `{ card?, site?, creator? }` | Twitter card extras. |
| `from` | `Partial<MetaFieldsValue> \| AnalysisResult` | Prefill title/description/slug/robots from editor state or analysis. |
| `robots` | `{ index?, follow? }` | Robots overrides (defaults from `from.allowIndex` / `from.allowFollow`). |

### `buildJsonLd` / `jsonLdScriptContent` (`teemseo/next`)

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | **Required.** Headline / name. |
| `type` | `'Article' \| 'WebPage' \| 'BlogPosting'` | Schema `@type` (default `Article`). |
| `description` | `string` | Schema description. |
| `url` | `string` | Canonical page URL. |
| `image` | `string \| string[]` | Image URL(s). |
| `datePublished` | `string` | ISO date published. |
| `dateModified` | `string` | ISO date modified. |
| `authorName` | `string` | Author name. |
| `publisherName` | `string` | Publisher name. |
| `publisherLogo` | `string` | Publisher logo URL. |
| `locale` | `'en' \| 'fa'` | Used to derive `inLanguage` when not set. |
| `inLanguage` | `string` | Explicit language tag (e.g. `fa-IR`). |

`jsonLdScriptContent(input)` returns a JSON string ready for `<script type="application/ld+json">`.

## Core utilities

Exported from `teemseo` for custom pipelines:

| Function | Purpose |
|----------|---------|
| `parseContent(html, { siteUrl?, locale? })` | Parse HTML/plain text into words, headings, links, images, etc. |
| `detectLocale(text)` | Detect `'en'` or `'fa'` from text |
| `resolveLocale(option, text)` | Resolve `'auto'` to a concrete locale |
| `getLanguagePack(locale)` | Stop words, transition words, message templates |
| `normalizeKeyphrase(kp)` | Normalize keyphrase for matching |
| `slugifyKeyphrase(kp)` | Slugify keyphrase (Unicode-aware) |
| `keyphraseMatchesSlug(kp, slug)` | Persian-aware slug ↔ keyphrase match |
| `hasArabicScript(text)` | Whether text contains Arabic/Persian script |
| `getProminentWords(content, locale?)` | Top content words for internal link ranking |
| `buildInternalLinkQuery(input)` | Build `InternalLinkQuery` object |
| `createInternalLinkSuggestionsFetcher(url)` | POST fetcher helper |
| `filterExcludedSuggestions(list, excludeUrls)` | Remove excluded URLs from suggestions |
| `aggregateRating(assessments)` | Collapse assessments to `good`/`ok`/`bad` |
| `overallFrom(seo, readability)` | Combined overall score |
| `fleschReadingEase(text)` | English Flesch score (0–100+) |

## Custom UI (`teemseo/react`)

Build your own layout with the same pieces TeemSEO uses internally:

```tsx
'use client'

import {
  useTeemSEO,
  AnalysisPanel,
  SnippetPreview,
  MetaFields,
  SeoAccordions,
  ScoreBadge,
} from 'teemseo/react'
import 'teemseo/styles.css'

export function MySeoPanel({ content, meta, onChangeMeta }) {
  const { result, loading } = useTeemSEO({
    content,
    ...meta,
    siteUrl: 'https://example.com',
    locale: 'auto',
  })

  return (
    <div className="teemseo">
      {result && <ScoreBadge rating={result.overallScore} locale={result.messageLocale} />}
      <MetaFields value={meta} onChange={onChangeMeta} locale="fa" />
      <SnippetPreview {...meta} siteUrl="https://example.com" locale="fa" />
      <AnalysisPanel result={result} loading={loading} locale="fa" />
      <SeoAccordions content={content} value={meta} onChange={onChangeMeta} locale="fa" siteUrl="https://example.com" />
    </div>
  )
}
```

Also exported: `Accordion`, `ScoreLight`.

## Styling

Import `teemseo/styles.css`. All styles are scoped under `.teemseo` and use CSS variables you can override:

```css
.teemseo {
  --teemseo-accent: #0f766e;
  --teemseo-good: #15803d;
  --teemseo-ok: #ca8a04;
  --teemseo-bad: #dc2626;
  --teemseo-radius: 10px;
  --teemseo-font: "Vazirmatn", sans-serif;
}
```

Wrap TeemSEO in a container with `max-width` if the default `420px` sidebar width does not fit your layout.

## Integration patterns

### CMS / blog editor

1. Store `content` (HTML), `title`, `metaDescription`, `slug`, `focusKeyphrase` in your CMS.
2. Render `<TeemSEO content={html} siteUrl={SITE_URL} ... />` beside the editor.
3. Use `onChangeMeta` to write meta field changes back to CMS state.
4. Optionally wire `isKeyphraseUsedElsewhere` to your posts table.
5. Implement `getInternalLinkSuggestions` with your search index or SQL.

### Analysis-only mode

Show scores without editable fields (e.g. preview mode):

```tsx
<TeemSEO
  content={html}
  focusKeyphrase={kp}
  title={title}
  metaDescription={desc}
  slug={slug}
  siteUrl={SITE_URL}
  analysisOnly
/>
```

### Server-side gate before publish

```ts
import { analyzeSync } from 'teemseo'

const result = analyzeSync({ content, focusKeyphrase, title, metaDescription, slug, siteUrl })
const blockers = result.seo.filter((a) => a.rating === 'bad')
if (blockers.length > 0) {
  throw new Error(`SEO issues: ${blockers.map((b) => b.text).join('; ')}`)
}
```

## Local demo

```bash
git clone <repo>
cd TeemSEO
npm install
npm run build
cd examples/demo && npm install && npm run dev
```

The demo switches between English and Persian sample content and shows live analysis + internal link suggestions.

## License

MIT
