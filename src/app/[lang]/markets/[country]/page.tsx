import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { getCountry, getCountryName } from '@/lib/countries'
import FeedItem from '@/components/FeedItem'
import MarketMovers from '@/components/MarketMovers'

export const revalidate = 60

const CURRENCY_MAP: Record<string, string> = { us: '$', it: '\u20ac', fr: '\u20ac', es: '\u20ac' }

async function getArticles(code: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts!alert_id(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(30)
  return data ?? []
}

async function getMarketSummary(code: string, lang: string) {
  const { data } = await supabase
    .from('market_summaries')
    .select('summary, index_price, index_change_pct, generated_at')
    .eq('country_code', code)
    .eq('lang_code', lang)
    .order('generated_at', { ascending: false })
    .limit(1)
  return data?.[0] ?? null
}

async function getMovers(code: string, lang: string) {
  // Get all live stock data for this market
  const { data: liveData } = await supabase
    .from('stock_live')
    .select('stock_id, price, change_pct, stocks!inner(symbol, name, country_code)')
    .eq('stocks.country_code', code)
    .not('change_pct', 'is', null)
    .order('change_pct', { ascending: false })

  if (!liveData?.length) return { risers: [], fallers: [] }

  // Get recent article slugs for stocks that have coverage (for linking)
  const stockIds = liveData.map((d: any) => d.stock_id)
  const { data: articleData } = await supabase
    .from('articles')
    .select('stock_id, meta_slug')
    .eq('lang_code', lang)
    .eq('published', true)
    .in('stock_id', stockIds)
    .order('published_at', { ascending: false })

  // Build slug map: stock_id -> most recent article slug
  const slugMap: Record<string, string> = {}
  if (articleData) {
    for (const a of articleData) {
      if (!slugMap[a.stock_id]) slugMap[a.stock_id] = a.meta_slug
    }
  }

  const mapped = liveData.map((d: any) => {
    const stock = Array.isArray(d.stocks) ? d.stocks[0] : d.stocks
    return {
      symbol: stock?.symbol ?? '?',
      name: stock?.name ?? '',
      change_pct: Number(d.change_pct),
      price: Number(d.price),
      article_slug: slugMap[d.stock_id] ?? null,
    }
  }).filter((d: any) => d.symbol !== '?' && d.change_pct !== 0)

  const risers = mapped
    .filter((d: any) => d.change_pct > 0)
    .sort((a: any, b: any) => b.change_pct - a.change_pct)
    .slice(0, 5)

  const fallers = mapped
    .filter((d: any) => d.change_pct < 0)
    .sort((a: any, b: any) => a.change_pct - b.change_pct)
    .slice(0, 5)

  return { risers, fallers }
}

export default async function MarketDetailPage({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  const t = useTranslations(lang as Lang)
  const cfg = getCountry(country)
  if (!cfg || !cfg.active) notFound()
  const currency = CURRENCY_MAP[country] || '$'
  const [articles, summary, { risers, fallers }] = await Promise.all([
    getArticles(country, lang),
    getMarketSummary(country, lang),
    getMovers(country, lang),
  ])
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.54rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{cfg.flag} {getCountryName(country, lang)}</div>
        <h1 className="page-title">{cfg.index}</h1>
      </div>
      {summary?.summary && (
        <div className="mkt-detail-summary">{summary.summary}</div>
      )}
      <MarketMovers risers={risers} fallers={fallers} indexName={cfg.index} lang={lang as Lang} currency={currency} />
      <div className="sec-head"><span className="sec-lbl">{t.markets.latest}</span><div className="sec-line" /></div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="empty-state">{({ en: 'No articles available yet.', it: 'Nessun articolo disponibile.', fr: 'Aucun article disponible.', es: 'No hay art\u00edculos disponibles.' }[lang] || 'No articles available yet.')}</div>}
      </div>
    </div>
  )
}
