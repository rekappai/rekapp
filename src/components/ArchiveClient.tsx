'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { parseTags } from '@/lib/types'
import type { Lang } from '@/lib/i18n'

type ArchiveArticle = {
  id: string
  headline: string
  meta_slug: string
  published_at: string
  country_code: string
  tags: string | string[]
  stocks?: { symbol: string; name: string } | null
  alerts?: { direction: string; change_pct: number } | null
}

const TOPIC_SLUGS = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade']

export default function ArchiveClient({ articles, lang, t }: { articles: ArchiveArticle[]; lang: Lang; t: any }) {
  const [fMarket, setFMarket] = useState('all')
  const [fDir,    setFDir]    = useState('all')
  const [fTopic,  setFTopic]  = useState('all')
  const [drawer,  setDrawer]  = useState(false)

  const filtered = useMemo(() => articles.filter(a => {
    if (fMarket !== 'all' && a.country_code !== fMarket) return false
    if (fDir    !== 'all' && a.alerts?.direction !== fDir) return false
    if (fTopic  !== 'all' && !parseTags(a.tags).includes(fTopic)) return false
    return true
  }), [articles, fMarket, fDir, fTopic])

  const grouped = useMemo(() => {
    const months: Record<string, Record<string, ArchiveArticle[]>> = {}
    for (const a of filtered) {
      const d = new Date(a.published_at)
      const month = d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { month: 'long', year: 'numeric' })
      const day   = d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      if (!months[month]) months[month] = {}
      if (!months[month][day]) months[month][day] = []
      months[month][day].push(a)
    }
    return months
  }, [filtered, lang])

  const activeCount = [fMarket, fDir, fTopic].filter(v => v !== 'all').length

  const Pill = ({ val, active, onClick, label }: { val: string; active: boolean; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={`font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.06em] px-2.5 py-[5px] border whitespace-nowrap transition-all
        ${active ? 'text-[--gold] border-[--gold-border] bg-[rgba(196,162,94,0.06)]' : 'text-[--text-dim] border-[--ink-border] hover:text-[--gold] hover:border-[--gold-border]'}`}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden lg:flex items-stretch border-b border-[--ink-border] bg-[--ink-raised] overflow-x-auto">
        {[
          { label: t.archive.filter.market, key: 'market', val: fMarket, set: setFMarket, opts: [['all',t.archive.filter.all],['us','S&P 500'],['it','FTSE MIB']] },
          { label: t.archive.filter.direction, key: 'dir', val: fDir, set: setFDir, opts: [['all',t.archive.filter.all],['up',t.archive.filter.gainers],['down',t.archive.filter.losers]] },
        ].map(group => (
          <div key={group.key} className="flex items-center gap-2 px-4 py-2.5 border-r border-[--ink-border] shrink-0">
            <span className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.14em] uppercase text-[--text-dim] whitespace-nowrap mr-1">{group.label}</span>
            {group.opts.map(([v, l]) => <Pill key={v} val={v} active={group.val === v} onClick={() => group.set(v)} label={l} />)}
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto">
          <span className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.14em] uppercase text-[--text-dim] whitespace-nowrap mr-1">{t.archive.filter.topic}</span>
          <Pill val="all" active={fTopic==='all'} onClick={() => setFTopic('all')} label={t.archive.filter.all} />
          {TOPIC_SLUGS.map(s => <Pill key={s} val={s} active={fTopic===s} onClick={() => setFTopic(s)} label={t.topics[s] ?? s} />)}
        </div>
      </div>

      {/* Mobile filter button */}
      <button
        className={`lg:hidden w-full flex items-center justify-between px-[--pad] py-3 border-b border-[--ink-border] bg-[--ink-raised] font-[family-name:var(--font-dm-mono)] text-[0.6rem] tracking-[0.1em] uppercase transition-colors ${activeCount > 0 ? 'text-[--gold]' : 'text-[--text-dim]'}`}
        onClick={() => setDrawer(o => !o)}
      >
        <span>{activeCount > 0 ? `${t.archive.filters} (${activeCount})` : t.archive.filters}</span>
        <span className={`transition-transform ${drawer ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {drawer && (
        <div className="lg:hidden border-b border-[--ink-border] bg-[--ink-raised] px-[--pad] py-4 space-y-4">
          {[
            { label: t.archive.filter.market, val: fMarket, set: setFMarket, opts: [['all',t.archive.filter.all],['us','S&P 500'],['it','FTSE MIB']] as [string,string][] },
            { label: t.archive.filter.direction, val: fDir, set: setFDir, opts: [['all',t.archive.filter.all],['up',t.archive.filter.gainers],['down',t.archive.filter.losers]] as [string,string][] },
          ].map(group => (
            <div key={group.label}>
              <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.14em] uppercase text-[--gold] mb-2">{group.label}</div>
              <div className="flex gap-1.5 flex-wrap">
                {group.opts.map(([v,l]) => <Pill key={v} val={v} active={group.val===v} onClick={() => group.set(v)} label={l} />)}
              </div>
            </div>
          ))}
          <div>
            <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.14em] uppercase text-[--gold] mb-2">{t.archive.filter.topic}</div>
            <div className="flex gap-1.5 flex-wrap">
              <Pill val="all" active={fTopic==='all'} onClick={() => setFTopic('all')} label={t.archive.filter.all} />
              {TOPIC_SLUGS.map(s => <Pill key={s} val={s} active={fTopic===s} onClick={() => setFTopic(s)} label={t.topics[s] ?? s} />)}
            </div>
          </div>
          <button onClick={() => setDrawer(false)} className="w-full py-2.5 border border-[--ink-border] font-[family-name:var(--font-dm-mono)] text-[0.6rem] tracking-[0.12em] uppercase text-[--text-dim] hover:text-[--text] transition-all">
            {t.archive.filter.done}
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center font-[family-name:var(--font-dm-mono)] text-[0.62rem] text-[--text-dim]">{t.archive.noResults}</div>
      )}

      {Object.entries(grouped).map(([month, days]) => (
        <div key={month} className="mt-6">
          <div className="flex items-center gap-3.5 mb-0">
            <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] whitespace-nowrap">{month}</span>
            <div className="flex-1 h-px bg-[--ink-border]" />
          </div>
          {Object.entries(days).map(([day, dayArticles]) => (
            <div key={day} className="grid border-b border-[--ink-border] hover:bg-[--ink-hover] transition-colors" style={{ gridTemplateColumns: '140px 1fr auto' }}>
              <div className="py-4 pr-5 border-r border-[--ink-border]">
                <div className="font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.12em] uppercase text-[--text-dim]">
                  {new Date(dayArticles[0].published_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { weekday: 'long' })}
                </div>
                <div className="font-[family-name:var(--font-playfair)] text-[1.5rem] font-normal text-[--text] leading-none mt-1">
                  {new Date(dayArticles[0].published_at).getDate()}
                </div>
              </div>
              <div className="py-4 px-5 flex flex-col gap-2">
                {dayArticles.map(a => {
                  const up = a.alerts?.direction === 'up'
                  return (
                    <Link key={a.id} href={`/${lang}/article/${a.meta_slug}`} className="flex items-baseline gap-2.5 group">
                      {a.stocks?.symbol && (
                        <span className="font-[family-name:var(--font-dm-mono)] text-[0.58rem] text-[--text] bg-[--ink-border] px-1.5 py-0.5 shrink-0">{a.stocks.symbol}</span>
                      )}
                      {a.alerts?.change_pct != null && (
                        <span className={`font-[family-name:var(--font-dm-mono)] text-[0.58rem] shrink-0 ${up ? 'text-[--up]' : 'text-[--down]'}`}>
                          {up ? '+' : ''}{Number(a.alerts.change_pct).toFixed(1)}%
                        </span>
                      )}
                      <span className="text-[0.78rem] text-[--text-dim] group-hover:text-[--text] transition-colors truncate">{a.headline}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="py-4 pl-4 text-right shrink-0">
                <div className="font-[family-name:var(--font-dm-mono)] text-[0.7rem] text-[--text]">{dayArticles.length}</div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[0.5rem] tracking-[0.1em] uppercase text-[--text-dim] mt-0.5">{t.archive.stories}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
