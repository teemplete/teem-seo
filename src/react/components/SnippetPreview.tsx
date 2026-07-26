'use client'

import { useState } from 'react'

export interface SnippetPreviewProps {
  title: string
  metaDescription: string
  slug: string
  siteUrl?: string
  locale?: 'en' | 'fa'
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function SnippetPreview({
  title,
  metaDescription,
  slug,
  siteUrl = 'https://example.com',
  locale = 'en',
}: SnippetPreviewProps) {
  const [mode, setMode] = useState<'mobile' | 'desktop'>('mobile')
  const host = (() => {
    try {
      return new URL(siteUrl).hostname
    } catch {
      return 'example.com'
    }
  })()
  const path = slug ? ` › ${slug.replace(/^\/+|\/+$/g, '').replace(/\//g, ' › ')}` : ''
  const displayTitle = truncate(
    title || (locale === 'fa' ? 'عنوان صفحه' : 'Page title'),
    mode === 'mobile' ? 55 : 60,
  )
  const displayDesc = truncate(
    metaDescription ||
      (locale === 'fa'
        ? 'توضیحات متا اینجا نمایش داده می‌شود.'
        : 'Meta description will appear here.'),
    mode === 'mobile' ? 120 : 160,
  )

  return (
    <div className="teemseo-snippet">
      <div className="teemseo-snippet__toolbar">
        <span>{locale === 'fa' ? 'پیش‌نمایش گوگل' : 'Google preview'}</span>
        <div className="teemseo-snippet__modes">
          <button
            type="button"
            className={mode === 'mobile' ? 'is-active' : ''}
            onClick={() => setMode('mobile')}
          >
            {locale === 'fa' ? 'موبایل' : 'Mobile'}
          </button>
          <button
            type="button"
            className={mode === 'desktop' ? 'is-active' : ''}
            onClick={() => setMode('desktop')}
          >
            {locale === 'fa' ? 'دسکتاپ' : 'Desktop'}
          </button>
        </div>
      </div>
      <div className={`teemseo-snippet__card teemseo-snippet__card--${mode}`} dir="ltr">
        <div className="teemseo-snippet__url">
          <span className="teemseo-snippet__favicon" aria-hidden />
          <div>
            <strong>{host}</strong>
            <span>
              {host}
              {path}
            </span>
          </div>
        </div>
        <a className="teemseo-snippet__title" href="#" onClick={(e) => e.preventDefault()}>
          {displayTitle}
        </a>
        <p className="teemseo-snippet__desc">{displayDesc}</p>
      </div>
    </div>
  )
}
