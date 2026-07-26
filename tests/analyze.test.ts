import { describe, expect, it } from 'vitest'
import { analyzeSync, detectLocale, parseContent } from '../src/core'

const EN_HTML = `
<h1>Complete guide to content SEO</h1>
<p>Content SEO helps your pages rank. Content SEO starts with a clear focus keyphrase in the introduction.</p>
<p>However, you also need structure. Therefore, use headings and short sentences. For example, keep paragraphs readable.</p>
<h2>Content SEO tactics</h2>
<p>Additionally, add internal and outbound links. Meanwhile, use images with useful alt text.</p>
<p>Finally, write more than three hundred words so search engines understand the topic deeply. In other words, depth matters for ranking and user trust. Consequently, expand explanations with concrete examples that readers can apply immediately.</p>
<p>On the other hand, avoid stuffing. Instead, keep keyphrase density natural while covering related questions. Likewise, vary sentence openings so the text feels human and scannable throughout the article body.</p>
<img src="/a.jpg" alt="content SEO checklist" />
<a href="/blog/seo">Internal guide</a>
<a href="https://developers.google.com/search">Google docs</a>
`

const FA_HTML = `
<h1>راهنمای کامل سئو محتوا</h1>
<p>سئو محتوا به دیده‌شدن صفحات شما کمک می‌کند. سئو محتوا باید از همان پاراگراف اول با کلمه کلیدی آغاز شود.</p>
<p>اما ساختار هم مهم است. بنابراین از زیرعنوان‌ها و جملات کوتاه استفاده کنید. برای مثال پاراگراف‌ها را خوانا نگه دارید.</p>
<h2>تاکتیک‌های سئو محتوا</h2>
<p>علاوه بر این لینک داخلی و خارجی اضافه کنید. همچنین تصاویر را با متن جایگزین مفید همراه کنید.</p>
<p>در نهایت بیش از سیصد کلمه بنویسید تا موضوع برای موتورهای جستجو روشن شود. به عبارت دیگر عمق محتوا برای رتبه و اعتماد کاربر اهمیت دارد. در نتیجه مثال‌های کاربردی بیشتری بیاورید.</p>
<p>با این حال از زیاده‌روی در تکرار پرهیز کنید. از سوی دیگر چگالی کلمه کلیدی را طبیعی نگه دارید. همچنین شروع جملات را متنوع کنید تا متن انسانی و قابل اسکن بماند.</p>
<img src="/a.jpg" alt="چک‌لیست سئو محتوا" />
<a href="/blog/seo">راهنمای داخلی</a>
<a href="https://developers.google.com/search">مستندات گوگل</a>
`

describe('detectLocale', () => {
  it('detects English', () => {
    expect(detectLocale('Hello world and SEO tips')).toBe('en')
  })

  it('detects Persian', () => {
    expect(detectLocale('این یک متن فارسی درباره سئو است')).toBe('fa')
  })
})

describe('parseContent', () => {
  it('extracts headings images and links', () => {
    const parsed = parseContent(EN_HTML, { siteUrl: 'https://example.com' })
    expect(parsed.headings.length).toBeGreaterThan(0)
    expect(parsed.images[0]?.alt).toContain('content SEO')
    expect(parsed.links.some((l) => l.isInternal)).toBe(true)
    expect(parsed.links.some((l) => !l.isInternal)).toBe(true)
    expect(parsed.wordCount).toBeGreaterThan(50)
  })
})

describe('analyzeSync', () => {
  it('returns SEO and readability assessments for English', () => {
    const result = analyzeSync({
      content: EN_HTML,
      focusKeyphrase: 'content SEO',
      title: 'Complete guide to content SEO tips',
      metaDescription:
        'Learn content SEO with practical tactics for titles, meta descriptions, headings, and readable copy that ranks.',
      slug: 'content-seo-guide',
      siteUrl: 'https://example.com',
      locale: 'en',
    })

    expect(result.locale).toBe('en')
    expect(result.seo.length).toBeGreaterThan(10)
    expect(result.readability.length).toBeGreaterThan(4)
    expect(result.seo.find((a) => a.id === 'keyphraseInTitle')?.rating).toBe('good')
    expect(result.readability.some((a) => a.id === 'fleschReadingEase')).toBe(true)
    expect(['good', 'ok', 'bad']).toContain(result.overallScore)
  })

  it('returns Persian readability assessment for FA content', () => {
    const result = analyzeSync({
      content: FA_HTML,
      focusKeyphrase: 'سئو محتوا',
      title: 'راهنمای کامل سئو محتوا برای نویسندگان',
      metaDescription:
        'با سئو محتوا رتبه بگیرید: عنوان، توضیحات متا، زیرعنوان، لینک‌سازی و نکات خوانایی متن فارسی را در این راهنما بیاموزید.',
      slug: 'seo-mohtava',
      siteUrl: 'https://example.com',
      locale: 'fa',
    })

    expect(result.locale).toBe('fa')
    expect(result.seo.find((a) => a.id === 'keyphraseInContent')?.rating).toBe('good')
    expect(result.readability.some((a) => a.id === 'persianReadability')).toBe(true)
    expect(result.readability.some((a) => a.id === 'fleschReadingEase')).toBe(false)
    expect(result.messageLocale).toBe('fa')
  })

  it('flags missing keyphrase', () => {
    const result = analyzeSync({
      content: '<p>Short text.</p>',
      title: 'Hi',
      locale: 'en',
    })
    expect(result.seo.find((a) => a.id === 'keyphraseLength')?.rating).toBe('bad')
  })
})
