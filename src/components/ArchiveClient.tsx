'use client'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { parseTags } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

type AA = {
  id: string
  headline: string
  meta_slug: string
  published_at: string
  country_code: string
  tags: string | string[]
  stocks?: { symbol: string; name: string } | { symbol: string; name: string }[] | null
  alerts?: { direction: string; change_pct: number } | { direction: string; change_pct: number }[] | null
}

function getStock(a: AA) {
  if (!a.stocks) return null
  return Array.isArray(a.stocks) ? a.stocks[0] : a.stocks
}

function getAlert(a: AA) {
  if (!a.alerts) return null
  return Array.isArray(a.alerts) ? a.alerts[0] : a.alerts
}

const SLUGS = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade']

export default function ArchiveClient({ articles, lang, t }: { articles: AA[]; lang: Lang; t: any }) {
  const [fM, setFM] = useState('all')
  const [fD, setFD] = useState('all')
  const [fT, setFT] = useState('all')
  const [drawer, setDrawer] = useState(false)

  const filtered = useMemo(() => articles.filter(a => {
    const alert = getAlert(a)
    if (fM !== 'all' && a.country_code !== fM) return false
    if (fD !== 'all' && alert?.direction !== fD) return false
    if (fT !== 'all' && !parseTags(a.tags).includes(fT)) return false
    return true
  }), [articles, fM, fD, fT])

  const grouped = useMemo(() => {
    const months: Record<string, Record<string, AA[]>> = {}
    const loc = lang === 'it' ? 'it-IT' : 'en-GB'
    for (const a of filtered) {
      const d = new Date(a.published_at)
      const mo = d.toLocaleDateString(loc, { month: 'long', year: 'numeric' })
      const dy = d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      if (!months[mo]) months[mo] = {}
      if (!months[mo][dy]) months[mo][dy] = []
      months[mo][dy].push(a)
    }
    return months
  }, [filtered, lang])

  const activeCount = [fM, fD, fT].filter(v => v !== 'all').length

  const Pill = ({ val, cur, set, label }: { val: string; cur: string; set: (v: string) => void; label: string }) => (
    <button className={'arc-pill' + (cur === val ? ' on' : '')} onClick={() => set(val)}>{label}</button>
  )

  const groups = [
    { label: t.archive.filter.market,    cur: fM, set: setFM, opts: [['all', t.archive.filter.all], ['us', 'S&P 500'], ['it', 'FTSE MIB']] as [string, string][] },
    { label: t.archive.filter.direction, cur: fD, set: setFD, opts: [['all', t.archive.filter.all], ['up', t.archive.filter.gainers], ['down', t.archive.filter.losers]] as [string, string][] },
  ]

  return (
    <>
      {/* Desktop filter bar */}
      <div className="arc-filter-bar">
        {groups.map((g, gi) => (
          <div key={g.label} className="arc-filter-group">
            <span className="arc-filter-label">{g.label}</span>
            <div className="arc-filter-pills">
              {g.opts.map(([v, l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
            </div>
            {gi < groups.length - 1 && <div className="arc-filter-divider" />}
          </div>
        ))}
        <div className="arc-filter-divider" />
        <div className="arc-filter-group">
          <span className="arc-filter-label">{t.archive.filter.topic}</span>
          <div className="arc-filter-pills">
            <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
            {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s] ?? s} />)}
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <button
        className={'arc-filter-mob-btn' + (activeCount > 0 ? ' active-filter' : '')}
        onClick={() => setDrawer(o => !o)}
        style={{ display: 'flex' }}
      >
        <span>{activeCount > 0 ? t.archive.filters + ' (' + activeCount + ')' : t.archive.filters}</span>
        <span style={{ transition: 'transform 0.2s', transform: drawer ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {/* Mobile drawer */}
      {drawer && (
        <div className="arc-drawer">
          {groups.map(g => (
            <div key={g.label}>
              <div className="arc-drawer-lbl">{g.label}</div>
              <div className="arc-filter-pills" style={{ flexWrap: 'wrap', gap: 4 }}>
                {g.opts.map(([v, l]) => <Pill key={v} val={v} cur={g.cur} set={g.set} label={l} />)}
              </div>
            </div>
          ))}
          <div>
            <div className="arc-drawer-lbl">{t.archive.filter.topic}</div>
            <div className="arc-filter-pills" style={{ flexWrap: 'wrap', gap: 4 }}>
              <Pill val="all" cur={fT} set={setFT} label={t.archive.filter.all} />
              {SLUGS.map(s => <Pill key={s} val={s} cur={fT} set={setFT} label={t.topics[s] ?? s} />)}
            </div>
          </div>
          <button className="arc-drawer-close" onClick={() => setDrawer(false)}>{t.archive.filter.done}</button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center' }}>{t.archive.noResults}</div>
      )}

      {/* Archive days grouped by month */}
      {Object.entries(grouped).map(([month, days]) => (
        <div key={month} className="archive-month">
          <div className="archive-month-head">
            <span className="archive-month-lbl">{month}</span>
            <div className="archive-month-line" />
          </div>
          {Object.entries(days).map(([, dayArticles]) => (
            <div key={dayArticles[0].id} className="archive-day">
              <div className="archive-day-date">
                <div className="archive-day-weekday">
                  {new Date(dayArticles[0].published_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { weekday: 'long' })}
                </div>
                <div className="archive-day-num">{new Date(dayArticles[0].published_at).getDate()}</div>
              </div>
              <div className="archive-day-stories">
                {dayArticles.map(a => {
                  const stock = getStock(a)
                  const alert = getAlert(a)
                  const up = alert?.direction === 'up'
                  return (
                    <Link key={a.id} href={'/' + lang + '/article/' + a.meta_slug} className="archive-story">
                      {stock?.symbol && (
                        <span className="archive-story-ticker">{stock.symbol}</span>
                      )}
                      {alert?.change_pct != null && (
                        <span className={'archive-story-chg ' + (up ? 'up' : 'dn')}>
                          {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
                        </span>
                      )}
                      <span className="archive-story-h">{a.headline}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="archive-day-meta">
                <div className="archive-day-count">{dayArticles.length}</div>
                <div className="archive-day-count-lbl">{t.archive.stories}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
