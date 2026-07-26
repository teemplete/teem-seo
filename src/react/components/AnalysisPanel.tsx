'use client'

import { useState } from 'react'
import type { AnalysisResult, AssessmentResult, Rating } from '../../core/types'
import { ScoreBadge } from './ScoreBadge'

export interface AnalysisPanelProps {
  result: AnalysisResult | null
  loading?: boolean
  locale?: 'en' | 'fa'
}

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

export function AnalysisPanel({ result, loading, locale = 'en' }: AnalysisPanelProps) {
  const [tab, setTab] = useState<'seo' | 'readability'>('seo')
  const t =
    locale === 'fa'
      ? {
          seo: 'سئو',
          readability: 'خوانایی',
          empty: 'هنوز آنالیزی موجود نیست.',
          loading: 'در حال آنالیز…',
          words: 'کلمه',
          density: 'چگالی',
        }
      : {
          seo: 'SEO',
          readability: 'Readability',
          empty: 'No analysis yet.',
          loading: 'Analyzing…',
          words: 'words',
          density: 'density',
        }

  return (
    <div className="teemseo-analysis">
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

      <div className="teemseo-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'seo'}
          className={tab === 'seo' ? 'is-active' : ''}
          onClick={() => setTab('seo')}
        >
          {t.seo}
          {result && <ScoreBadge rating={result.seoScore} locale={locale} />}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'readability'}
          className={tab === 'readability' ? 'is-active' : ''}
          onClick={() => setTab('readability')}
        >
          {t.readability}
          {result && <ScoreBadge rating={result.readabilityScore} locale={locale} />}
        </button>
      </div>

      <div className="teemseo-tabpanel" role="tabpanel">
        {loading && !result ? (
          <p className="teemseo-empty">{t.loading}</p>
        ) : tab === 'seo' ? (
          <AssessmentList items={result?.seo ?? []} empty={t.empty} />
        ) : (
          <AssessmentList items={result?.readability ?? []} empty={t.empty} />
        )}
      </div>
    </div>
  )
}
