'use client'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { parseTags } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

type StockRow = { symbol: string; name: string }
type AlertRow = { direction: string; change_pct: number }

type AA = {
  id: string
  headline: string
  meta_slug: string
  published_at: string
  country_code: string
  tags: string | string[]
  stocks?: StockRow | StockRow[] | null
  alerts?: AlertRow | AlertRow[] | null
}

function firstStock(a: AA): StockRow | null {
  if (!a.stocks) return null
  return Array.isArray(a.stocks) ? (a.stocks[0] ?? null) : a.stocks
}
function firstAlert(a: AA): AlertRow | null {
  if (!a.alerts) return null
  return Array.isArray(a.alerts) ? (a.alerts[0] ?? null) : a.alerts
}

const INDEX_NAMES: Record<string, string> = { us: 'S&P 500', it: 'FTSE MIB', fr: 'CAC 40', es: 'IBEX 35' }
const SLUGS = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade']

function getLocale(lang: string) {
  return ({ en: 'en-GB', it: 'it-IT', fr: 'fr-FR', es: 'es-ES' }[lang]) || 'en-GB'
}

function getDayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function isToday(dateStr: string) {
  return dateStr === getDayKey(new Date())
}

export default function ArchiveClient({ articles, lang, t }: { articles: AA[]; lang: Lang; t: any }) {
  const [fM, setFM] = useState('all')
  const [fD, setFD] = useState('all')
  const [fT, setFT] = useState('all')
  const [drawer, setDrawer] = useState(false)
  const [openDays, setOpenDays] = useState<Set<string>>(new Set([getDayKey(new Date())]))

  const locale = getLocale(lang)

  const filtered = useMemo(() => articles.filter(a => {
    const alert = firstAlert(a)
    if (fM !== 'all' && a.country_code !== fM) return false
    if (fD !== 'all' && alert?.direction !== fD) return false
    if (fT !== 'all' && !parseTags(a.tags).includes(fT)) return false
    return true
  }), [articles, fM, fD, fT])

  const days = useMemo(() => {
    const map: Record<string, AA[]> = {}
    for (const a of filtered) {
      const key = getDayKey(new Date(a.published_at))
      if (!map[key]) map[key] = []
      map[key].push(a)
    }
    // Sort each day by absolute change_pct descending
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const aChg = Math.abs(firstAlert(a)?.change_pct ?? 0)
        const bChg = Math.abs(firstAlert(b)?.change_pct ?? 0)
        return bChg - aChg
      })
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const toggleDay = (key: string) => {
    setOpenDays(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const activeCount = [fM, fD, fT].filter(v => v !== 'all').length

  const Pill = ({ val, cur, set, label, className }: { val: string; cur: string; set: (v: string) => void; label: string; className?: string }) => (
    <button className={'arc-pill' + (cur === val ? ' active' : '') + (className ? ' ' + className : '')} onClick={() => set(val)}>{label}</button>
  )

  const filterGroups = [
    { label: t.archive.filter.market, cur: fM, set: setFM, opts: [['all', t.archive.filter.all], ['us', 'S&P 500'], ['it', 'FTSE MIB'], ['fr', 'CAC 40'], ['es', 'IBEX 35']] as [string, string][] },
    { label: t.archive.filter.direction, cur: fD, set: setFD, opts: [['all', t.archive.filter.all], ['up', t.archive.filter.gainers], ['down', t.archive.filter.losers]] as [string, string][] },
  ]

  function dayPreview(articles: AA[]): string {
    const top = articles.slice(0, 2).map(a => {
      const alert = firstAlert(a)
      const stock = firstStock(a)
      if (!alert || !stock) return ''
      const sign = alert.direction === 'up' ? '+' : '\u2212'
      return `${stock.symbol} ${sign}${Math.abs(alert.change_pct).toFixed(1)}%`
    }).filter(Boolean)
    return top.join(', ')
  }

  return (
    <>
      {/* Desktop filter bar */}
      <div className="arc-bar">
        {filterGroups.map(g => (
          <div key={g.label} className="arc-bar-group">
            <span className="arc-bar-label">{g.label}</span>
            {g.opts.map(([v, l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
          </div>
        ))}
        <div className="arc-bar-group arc-bar-topic">
          <span className="arc-bar-label">{t.archive.filter.topic}</span>
          <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
          {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s] ?? s} />)}
        </div>
      </div>

      {/* Mobile filter button */}
      <button className={'arc-mob-btn' + (activeCount > 0 ? ' has-filters' : '')} onClick={() => setDrawer(o => !o)}>
        <span>{activeCount > 0 ? `${t.archive.filters} (${activeCount})` : t.archive.filters}</span>
        <span style={{ transition: 'transform 0.2s', transform: drawer ? 'rotate(180deg)' : 'none', fontSize: '0.5rem' }}>\u25BC</span>
      </button>
      {drawer && (
        <div className="arc-drawer">
          {filterGroups.map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <div className="arc-drawer-lbl">{g.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {g.opts.map(([v, l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
              </div>
            </div>
          ))}
          <div>
            <div className="arc-drawer-lbl">{t.archive.filter.topic}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
              {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s] ?? s} />)}
            </div>
          </div>
          <button className="arc-drawer-done" onClick={() => setDrawer(false)}>{t.archive.filter.done}</button>
        </div>
      )}

      {/* Day groups */}
      <div className="arc-days">
        {days.map(([dayKey, dayArticles]) => {
          const d = new Date(dayKey + 'T12:00:00')
          const expanded = openDays.has(dayKey)
          const weekday = d.toLocaleDateString(locale, { weekday: 'long' })
          const dateStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
          const preview = dayPreview(dayArticles)

          return (
            <div key={dayKey} className="arc-day">
              <div className="arc-day-header" onClick={() => toggleDay(dayKey)}>
                <span className={'arc-day-chevron' + (expanded ? ' open' : '')}>\u25B6</span>
                <span className="arc-day-name">{weekday}</span>
                <span className="arc-day-date">{dateStr}</span>
                <div className="arc-day-right">
                  {!expanded && preview && <span className="arc-day-preview">{preview}</span>}
                  <span className="arc-day-count">{dayArticles.length} {t.archive.stories.toLowerCase()}</span>
                </div>
              </div>
              <div className={'arc-day-content' + (expanded ? ' expanded' : ' collapsed')}>
                {dayArticles.map((a, i) => {
                  const stock = firstStock(a)
                  const alert = firstAlert(a)
                  const up = alert?.direction === 'up'
                  const featured = i < 2
                  const market = a.country_code !== 'us' ? INDEX_NAMES[a.country_code] : null
                  const time = new Date(a.published_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

                  return (
                    <Link key={a.id} href={'/' + lang + '/article/' + a.meta_slug} className={'arc-story' + (featured ? ' arc-story-featured' : '')}>
                      <span className="arc-story-sym">{stock?.symbol ?? ''}</span>
                      <span className={'arc-story-hl' + (featured ? ' featured' : '')}>
                        {a.headline}
                        {market && <span className="arc-story-market">{market}</span>}
                      </span>
                      <div className="arc-story-meta">
                        {alert?.change_pct != null && (
                          <span className={'arc-story-pct ' + (up ? 'up' : 'dn')}>
                            {up ? '+' : '\u2212'}{Math.abs(alert.change_pct).toFixed(1)}%
                          </span>
                        )}
                        <span className="arc-story-time">{time}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">{t.archive.noResults}</div>
      )}
    </>
  )
}
