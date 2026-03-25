import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'

export const revalidate = 300

function isMarketOpen(timezone: string, openHour: number, closeHour: number): boolean {
  const now = new Date()
  const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const day = local.getDay()
  const time = local.getHours() + local.getMinutes() / 60
  if (day === 0 || day === 6) return false
  return time >= openHour && time < closeHour
}

const MARKET_HOURS: Record<string, { timezone: string; open: number; close: number }> = {
  us: { timezone: 'America/New_York', open: 9.5, close: 16 },
  it: { timezone: 'Europe/Rome', open: 9, close: 17.5 },
}

const INDEX_SYMBOLS: Record<string, string> = {
  us: '%5EGSPC',
  it: 'FTSEMIB.MI',
}

async function getIndexPerformance(country: string) {
  try {
    const res = await fetch(
      'https://www.rekapp.ai/api/index-performance',
      { next: { revalidate: 60 } }
    )
    const all = await res.json()
    const found = all.find((d: any) => d.country === country)
    if (!found) return null
    return { price: found.price, change_pct: found.change_pct }
  } catch { return null }
}

async function getCount(code: string, lang: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count } = await supabase.from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .gte('published_at', today.toISOString())
  return count ?? 0
}

async function getLatest(code: string, lang: string) {
  const { data } = await supabase.from('articles').select('headline')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(1)
  return data?.[0]?.headline ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const meta = {
    en: { title: 'Markets — Rekapp', description: 'Financial intelligence across global indices. S&P 500, FTSE MIB and more.' },
    it: { title: 'Mercati — Rekapp', description: 'Intelligenza finanziaria sui principali indici globali. S&P 500, FTSE MIB e altri.' },
  } as Record<string, { title: string; description: string }>
  return meta[lang] ?? meta.en
}

export default async function MarketsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const active = COUNTRIES.filter(c => c.active)
  const soon = COUNTRIES.filter(c => !c.active)

  const stats: Record<string, any> = {}
  await Promise.all(active.map(async c => {
    const [count, latest, index] = await Promise.all([
      getCount(c.code, lang),
      getLatest(c.code, lang),
      getIndexPerformance(c.code),
    ])
    const hours = MARKET_HOURS[c.code]
    const open = hours ? isMarketOpen(hours.timezone, hours.open, hours.close) : false
    stats[c.code] = { count, latest, open, index }
  }))

  const openMarkets = active.filter(c => stats[c.code]?.open)
  const closedMarkets = active.filter(c => !stats[c.code]?.open)

  const renderCard = (c: typeof active[0]) => {
    const s = stats[c.code]
    const cur = c.code === 'us' ? '$' : '€'
    return (
      <Link key={c.code} href={'/' + lang + '/markets/' + c.code} className="mkt-card">
        <div className="mkt-card-head">
          <div>
            <div className="mkt-card-flag">{c.flag}</div>
            <div className="mkt-card-name">{c.index}</div>
            <div className="mkt-card-country">{c.name}</div>
          </div>
          <span className={'mkt-card-status ' + (s.open ? 'open' : 'closed')}>
            {s.open ? t.markets.status.open : t.markets.status.closed}
          </span>
        </div>
        {s.index && (
          <div className="index-perf">
            <span className="index-perf-price">{cur}{Number(s.index.price).toLocaleString()}</span>
            <span className={'index-perf-chg ' + (s.index.change_pct >= 0 ? 'up' : 'dn')}>
              {s.index.change_pct >= 0 ? '+' : ''}{s.index.change_pct.toFixed(2)}%
            </span>
          </div>
        )}
        <div className="mkt-card-stats">
          <div className="mkt-card-stat">
            <div className="mkt-card-stat-val">{s.count}</div>
            <div className="mkt-card-stat-lbl">{t.markets.stat.stories} {lang === 'it' ? 'oggi' : 'today'}</div>
          </div>
        </div>
        {s.latest && <div className="mkt-card-foot">{lang === 'it' ? 'Ultimo:' : 'Latest:'} {s.latest}</div>}
      </Link>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t.markets.title}</h1>
        <p className="page-sub">{t.markets.sub}</p>
      </div>

      {openMarkets.length > 0 && (
        <>
          <div className="sec-head"><span className="sec-lbl">{lang === 'it' ? 'Mercati aperti' : 'Open now'}</span><div className="sec-line" /></div>
          <div className="mkt-directory" style={{}}>
            {openMarkets.map(c => renderCard(c))}
          </div>
        </>
      )}

      {closedMarkets.length > 0 && (
        <>
          <div className="sec-head" style={{ marginTop: 16 }}><span className="sec-lbl">{lang === 'it' ? 'Mercati chiusi' : 'Closed'}</span><div className="sec-line" /></div>
          <div className="mkt-directory" style={{}}>
            {closedMarkets.map(c => renderCard(c))}
          </div>
        </>
      )}

      <div className="sec-head" style={{ marginTop: 16 }}><span className="sec-lbl">{t.markets.soon}</span><div className="sec-line" /></div>
      <div className="mkt-directory mkt-directory-dim" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
        {soon.map(c => (
          <div key={c.code} className="mkt-card mkt-card-soon">
            <div className="mkt-card-flag">{c.flag}</div>
            <div className="mkt-card-name">{c.index}</div>
            <div className="mkt-card-country">{c.name}</div>
            <span className="mkt-card-status soon" style={{ marginTop: 12, display: 'inline-block' }}>{t.markets.status.soon}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
