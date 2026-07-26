import type { Locale, LocaleOption } from '../types'
import { enPack, type LanguagePack } from './en'
import { faPack } from './fa'

const PERSIAN_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

export function detectLocale(text: string): Locale {
  if (!text || !text.trim()) return 'en'
  const sample = text.slice(0, 4000)
  const persianMatches = sample.match(new RegExp(PERSIAN_CHAR.source, 'g'))
  const persianCount = persianMatches?.length ?? 0
  const letterMatches = sample.match(/[A-Za-z\u0600-\u06FF]/g)
  const letterCount = letterMatches?.length ?? 1
  return persianCount / letterCount >= 0.3 ? 'fa' : 'en'
}

export function resolveLocale(option: LocaleOption | undefined, text: string): Locale {
  if (option && option !== 'auto') return option
  return detectLocale(text)
}

export function getLanguagePack(locale: Locale): LanguagePack {
  return locale === 'fa' ? faPack : enPack
}
