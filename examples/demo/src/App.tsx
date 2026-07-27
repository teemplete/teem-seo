import { useCallback, useMemo, useState } from 'react'
import {
  TeemSEO,
  type AnalysisResult,
  type MetaFieldsValue,
} from 'teem-seo'
import { buildJsonLd, buildMetadata } from 'teem-seo/next'
import 'teem-seo/styles.css'
import { mockGetInternalLinkSuggestions } from './mockInternalLinks'

type OutputTab = 'meta' | 'analysis' | 'metadata' | 'jsonld'

const EN_SAMPLE = `<h1>Complete guide to content SEO</h1>
<p>Content SEO helps your pages rank in search. Content SEO starts with a clear focus keyphrase in the introduction of your article.</p>
<p>However, you also need structure. Therefore, use headings and short sentences. For example, keep paragraphs readable and scannable for busy readers.</p>
<h2>Content SEO tactics that work</h2>
<p>Additionally, add internal and outbound links. Meanwhile, use images with useful alt text so accessibility and SEO improve together.</p>
<p>Finally, write more than three hundred words so search engines understand the topic deeply. In other words, depth matters for ranking and user trust. Consequently, expand explanations with concrete examples that readers can apply immediately on their own sites.</p>
<p>On the other hand, avoid stuffing the same phrase endlessly. Instead, keep keyphrase density natural while covering related questions. Likewise, vary sentence openings so the text feels human throughout the article body and remains pleasant to read from start to finish.</p>
<img src="/a.jpg" alt="content SEO checklist on a desk" />
<p>See our <a href="/blog/seo">internal SEO guide</a> and the official <a href="https://developers.google.com/search">Google Search docs</a> for more.</p>`

const FA_SAMPLE = `<h1>راهنمای کامل سئو محتوا</h1>
<p>سئو محتوا به دیده‌شدن صفحات شما کمک می‌کند. سئو محتوا باید از همان پاراگراف اول با کلمه کلیدی آغاز شود تا موضوع صفحه روشن باشد.</p>
<p>اما ساختار هم مهم است. بنابراین از زیرعنوان‌ها و جملات کوتاه استفاده کنید. برای مثال پاراگراف‌ها را خوانا و قابل اسکن نگه دارید.</p>
<h2>تاکتیک‌های سئو محتوا</h2>
<p>علاوه بر این لینک داخلی و خارجی اضافه کنید. همچنین تصاویر را با متن جایگزین مفید همراه کنید تا دسترسی‌پذیری و سئو همزمان بهتر شوند.</p>
<p>در نهایت بیش از سیصد کلمه بنویسید تا موضوع برای موتورهای جستجو روشن شود. به عبارت دیگر عمق محتوا برای رتبه و اعتماد کاربر اهمیت دارد. در نتیجه مثال‌های کاربردی بیشتری در متن بیاورید.</p>
<p>با این حال از زیاده‌روی در تکرار پرهیز کنید. از سوی دیگر چگالی کلمه کلیدی را طبیعی نگه دارید. همچنین شروع جملات را متنوع کنید تا متن انسانی و خوانا بماند.</p>
<img src="/a.jpg" alt="چک‌لیست سئو محتوا روی میز" />
<p>به <a href="/blog/seo">راهنمای داخلی</a> و <a href="https://developers.google.com/search">مستندات گوگل</a> سر بزنید.</p>`

const SITE_URL = 'https://example.com'

export default function App() {
  const [lang, setLang] = useState<'en' | 'fa'>('en')
  const [content, setContent] = useState(EN_SAMPLE)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [outputTab, setOutputTab] = useState<OutputTab>('meta')
  const [meta, setMeta] = useState<MetaFieldsValue>({
    focusKeyphrase: 'content SEO',
    title: 'Complete guide to content SEO for writers',
    metaDescription:
      'Learn content SEO with practical tactics for titles, meta descriptions, headings, links, and readable copy that ranks.',
    slug: 'content-seo-guide',
    isCornerstone: false,
    allowIndex: true,
    allowFollow: true,
    canonicalUrl: '',
    breadcrumbTitle: '',
    noImageIndex: false,
    noArchive: false,
    noSnippet: false,
    schemaType: 'Article',
    socialTitle: '',
    socialDescription: '',
    socialImage: '',
    twitterCard: 'summary_large_image',
  })

  const switchLang = (next: 'en' | 'fa') => {
    setLang(next)
    if (next === 'fa') {
      setContent(FA_SAMPLE)
      setMeta({
        focusKeyphrase: 'سئو محتوا',
        title: 'راهنمای کامل سئو محتوا برای نویسندگان',
        metaDescription:
          'با سئو محتوا رتبه بگیرید: عنوان، توضیحات متا، زیرعنوان، لینک‌سازی و نکات خوانایی متن فارسی را در این راهنما بیاموزید.',
        slug: 'seo-mohtava',
        isCornerstone: false,
        allowIndex: true,
        allowFollow: true,
        canonicalUrl: '',
        breadcrumbTitle: '',
        noImageIndex: false,
        noArchive: false,
        noSnippet: false,
        schemaType: 'Article',
        socialTitle: '',
        socialDescription: '',
        socialImage: '',
        twitterCard: 'summary_large_image',
      })
    } else {
      setContent(EN_SAMPLE)
      setMeta({
        focusKeyphrase: 'content SEO',
        title: 'Complete guide to content SEO for writers',
        metaDescription:
          'Learn content SEO with practical tactics for titles, meta descriptions, headings, links, and readable copy that ranks.',
        slug: 'content-seo-guide',
        isCornerstone: false,
        allowIndex: true,
        allowFollow: true,
        canonicalUrl: '',
        breadcrumbTitle: '',
        noImageIndex: false,
        noArchive: false,
        noSnippet: false,
        schemaType: 'Article',
        socialTitle: '',
        socialDescription: '',
        socialImage: '',
        twitterCard: 'summary_large_image',
      })
    }
  }

  const subtitle = useMemo(
    () =>
      lang === 'fa'
        ? 'متن را ویرایش کنید و آنالیز Yoast-مانند را زنده ببینید.'
        : 'Edit the content and watch Yoast-like analysis update live.',
    [lang],
  )

  const getInternalLinkSuggestions = useCallback(mockGetInternalLinkSuggestions, [])

  /** Demo upload: turns the file into a blob URL (swap for your real API in production). */
  const onUploadSocialImage = useCallback(async (file: File) => {
    await new Promise((r) => setTimeout(r, 400))
    return URL.createObjectURL(file)
  }, [])

  const nextMetadata = useMemo(
    () =>
      buildMetadata({
        siteUrl: SITE_URL,
        locale: lang,
        from: meta,
      }),
    [lang, meta],
  )

  const jsonLd = useMemo(
    () =>
      buildJsonLd({
        type: meta.schemaType ?? 'Article',
        title: meta.title,
        description: meta.metaDescription,
        url:
          meta.canonicalUrl?.trim() ||
          `${SITE_URL}/${meta.slug.replace(/^\//, '')}`,
        image: meta.socialImage?.trim() || undefined,
        locale: lang,
      }),
    [lang, meta],
  )

  const outputPayload = useMemo(() => {
    switch (outputTab) {
      case 'meta':
        return meta
      case 'analysis':
        return analysis
      case 'metadata':
        return nextMetadata
      case 'jsonld':
        return jsonLd
    }
  }, [analysis, jsonLd, meta, nextMetadata, outputTab])

  const outputTabs: { id: OutputTab; label: string; hint: string }[] = [
    {
      id: 'meta',
      label: 'onChangeMeta',
      hint: lang === 'fa' ? 'مقادیر متا برای ذخیره در CMS' : 'Meta values to persist in your CMS',
    },
    {
      id: 'analysis',
      label: 'onAnalysis',
      hint:
        lang === 'fa'
          ? 'نتیجه آنالیز، امتیازها و آمار'
          : 'Analysis result, scores, and stats',
    },
    {
      id: 'metadata',
      label: 'buildMetadata',
      hint:
        lang === 'fa'
          ? 'آبجکت Metadata آماده برای Next.js'
          : 'Next.js Metadata object ready to return',
    },
    {
      id: 'jsonld',
      label: 'buildJsonLd',
      hint:
        lang === 'fa'
          ? 'اسکیمای JSON-LD برای صفحه'
          : 'JSON-LD schema for the page',
    },
  ]

  const activeHint = outputTabs.find((t) => t.id === outputTab)?.hint ?? ''

  return (
    <div className="demo" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <header className="demo-hero">
        <p className="demo-brand">TeemSEO</p>
        <h1>{lang === 'fa' ? 'دموی آنالیز محتوا' : 'Content analysis demo'}</h1>
        <p>{subtitle}</p>
        <div className="demo-lang">
          <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => switchLang('en')}>
            English
          </button>
          <button type="button" className={lang === 'fa' ? 'is-active' : ''} onClick={() => switchLang('fa')}>
            فارسی
          </button>
        </div>
      </header>

      <main className="demo-layout">
        <div className="demo-editor-col">
          <section className="demo-editor">
            <label>
              {lang === 'fa' ? 'محتوا (HTML)' : 'Content (HTML)'}
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={22} />
            </label>
          </section>

          <section className="demo-output" aria-label={lang === 'fa' ? 'خروجی' : 'Output'}>
            <div className="demo-output__header">
              <h2>{lang === 'fa' ? 'خروجی' : 'Output'}</h2>
              <p>{activeHint}</p>
            </div>
            <div className="demo-output__tabs" role="tablist">
              {outputTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={outputTab === tab.id}
                  className={outputTab === tab.id ? 'is-active' : ''}
                  onClick={() => setOutputTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <pre className="demo-output__code" role="tabpanel">
              {outputPayload == null
                ? lang === 'fa'
                  ? '// در حال آنالیز…'
                  : '// Analyzing…'
                : JSON.stringify(outputPayload, null, 2)}
            </pre>
          </section>
        </div>
        <TeemSEO
          content={content}
          focusKeyphrase={meta.focusKeyphrase}
          title={meta.title}
          metaDescription={meta.metaDescription}
          slug={meta.slug}
          isCornerstone={meta.isCornerstone}
          allowIndex={meta.allowIndex}
          allowFollow={meta.allowFollow}
          canonicalUrl={meta.canonicalUrl}
          breadcrumbTitle={meta.breadcrumbTitle}
          noImageIndex={meta.noImageIndex}
          noArchive={meta.noArchive}
          noSnippet={meta.noSnippet}
          schemaType={meta.schemaType}
          socialTitle={meta.socialTitle}
          socialDescription={meta.socialDescription}
          socialImage={meta.socialImage}
          twitterCard={meta.twitterCard}
          siteUrl={SITE_URL}
          locale={lang}
          onChangeMeta={setMeta}
          onAnalysis={setAnalysis}
          getInternalLinkSuggestions={getInternalLinkSuggestions}
          onUploadSocialImage={onUploadSocialImage}
        />
      </main>
    </div>
  )
}
