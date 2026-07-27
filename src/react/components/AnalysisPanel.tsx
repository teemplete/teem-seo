'use client'

import { useState } from 'react'
import type {
  AnalysisResult,
  AssessmentResult,
  Locale,
  MetaFieldsValue,
  Rating,
  UploadSocialImage,
} from '../../core/types'
import { SchemaPanel } from './SchemaPanel'
import { ScoreBadge } from './ScoreBadge'
import { SocialPanel } from './SocialPanel'

export interface AnalysisPanelProps {
  result: AnalysisResult | null
  loading?: boolean
  locale?: Locale
  value?: MetaFieldsValue
  onChangeMeta?: (value: MetaFieldsValue) => void
  siteUrl?: string
  readOnly?: boolean
  onUploadSocialImage?: UploadSocialImage
}

type MainTab = 'analysis' | 'schema' | 'social'
type AnalysisSubTab = 'seo' | 'readability'

function groupByRating(items: AssessmentResult[]): Record<Rating, AssessmentResult[]> {
  return {
    bad: items.filter((i) => i.rating === 'bad'),
    ok: items.filter((i) => i.rating === 'ok'),
    good: items.filter((i) => i.rating === 'good'),
  }
}

function AssessmentList({ items, empty }: { items: AssessmentResult[]; empty: string }) {
  const grouped = groupByRating(items)
  const ordered = [...grouped.bad, ...grouped.ok, ...grouped.good]
  if (ordered.length === 0) {
    return <p className="teemseo-empty">{empty}</p>
  }
  return (
    <ul className="teemseo-list">
      {ordered.map((item) => (
        <li key={item.id} className={`teemseo-list__item teemseo-list__item--${item.rating}`}>
          <span className="teemseo-list__bullet" aria-hidden />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

export function AnalysisPanel({
  result,
  loading,
  locale = 'en',
  value,
  onChangeMeta,
  siteUrl,
  readOnly,
  onUploadSocialImage,
}: AnalysisPanelProps) {
  const [mainTab, setMainTab] = useState<MainTab>('analysis')
  const [subTab, setSubTab] = useState<AnalysisSubTab>('seo')
  const t =
    locale === 'fa'
      ? {
          analysis: 'آنالیز',
          schema: 'طرح Schema',
          social: 'شبکه‌های اجتماعی',
          seo: 'سئو',
          readability: 'خوانایی',
          empty: 'هنوز آنالیزی موجود نیست.',
          loading: 'در حال آنالیز…',
          words: 'کلمه',
          density: 'چگالی',
        }
      : {
          analysis: 'Analysis',
          schema: 'Schema',
          social: 'Social',
          seo: 'SEO',
          readability: 'Readability',
          empty: 'No analysis yet.',
          loading: 'Analyzing…',
          words: 'words',
          density: 'density',
        }

  const editable = Boolean(value && onChangeMeta)

  return (
    <div className="teemseo-analysis">
      <div className="teemseo-tabs teemseo-tabs--main" role="tablist" aria-label={t.analysis}>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'analysis'}
          className={mainTab === 'analysis' ? 'is-active' : ''}
          onClick={() => setMainTab('analysis')}
        >
          {t.analysis}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'schema'}
          className={mainTab === 'schema' ? 'is-active' : ''}
          onClick={() => setMainTab('schema')}
        >
          {t.schema}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'social'}
          className={mainTab === 'social' ? 'is-active' : ''}
          onClick={() => setMainTab('social')}
        >
          {t.social}
        </button>
      </div>

      {mainTab === 'analysis' ? (
        <div className="teemseo-tabpanel" role="tabpanel">
          <div className="teemseo-analysis__scores">
            <div>
              <small>{t.seo}</small>
              {result ? <ScoreBadge rating={result.seoScore} locale={locale} /> : <span>—</span>}
            </div>
            <div>
              <small>{t.readability}</small>
              {result ? (
                <ScoreBadge rating={result.readabilityScore} locale={locale} />
              ) : (
                <span>—</span>
              )}
            </div>
          </div>

          {result && (
            <div className="teemseo-stats">
              <span>
                {result.stats.wordCount} {t.words}
              </span>
              <span>
                {t.density}: {result.stats.keyphraseDensity}%
              </span>
            </div>
          )}

          <div className="teemseo-tabs teemseo-tabs--sub" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'seo'}
              className={subTab === 'seo' ? 'is-active' : ''}
              onClick={() => setSubTab('seo')}
            >
              {t.seo}
              {result && <ScoreBadge rating={result.seoScore} locale={locale} />}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'readability'}
              className={subTab === 'readability' ? 'is-active' : ''}
              onClick={() => setSubTab('readability')}
            >
              {t.readability}
              {result && <ScoreBadge rating={result.readabilityScore} locale={locale} />}
            </button>
          </div>

          <div role="tabpanel">
            {loading && !result ? (
              <p className="teemseo-empty">{t.loading}</p>
            ) : subTab === 'seo' ? (
              <AssessmentList items={result?.seo ?? []} empty={t.empty} />
            ) : (
              <AssessmentList items={result?.readability ?? []} empty={t.empty} />
            )}
          </div>
        </div>
      ) : null}

      {mainTab === 'schema' && editable ? (
        <div className="teemseo-tabpanel" role="tabpanel">
          <SchemaPanel
            value={value!}
            onChange={onChangeMeta!}
            locale={locale}
            readOnly={readOnly}
            siteUrl={siteUrl}
          />
        </div>
      ) : null}

      {mainTab === 'social' && editable ? (
        <div className="teemseo-tabpanel" role="tabpanel">
          <SocialPanel
            value={value!}
            onChange={onChangeMeta!}
            locale={locale}
            readOnly={readOnly}
            siteUrl={siteUrl}
            onUploadSocialImage={onUploadSocialImage}
          />
        </div>
      ) : null}
    </div>
  )
}
