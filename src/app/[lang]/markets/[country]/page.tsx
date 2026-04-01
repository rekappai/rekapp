import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { getCountry, getCountryName } from '@/lib/countries'
import FeedItem from '@/components/FeedItem'
import MarketMovers from '@/components/MarketMovers'

export const revalidate = 60

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
  const { data } = await supabase
    .from('articles')
    .select('meta_slug, headline, direction, change_pct, symbol, company_name')
    .eq('country_code', code)
    .eq('lang_code', lang)
    .eq('published', true)
    .not('change_pct', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50)

  if (!data?.length) return { risers: [], fallers: [] }

  const seen = new Set<string>()
  const deduped = data.filter((a: any) => {
    if (seen.has(a.symbol)) return false
    seen.add(a.symbol)
    return true
  })

  const risers = deduped
    .filter((a: any) => a.direction === 'up')
    .sort((a: any, b: any) => b.change_pct - a.change_pct)
    .slice(0, 5)

  const fallers = deduped
    .filter((a: any) => a.direction === 'down')
    .sort((a: any, b: any) => a.change_pct - b.change_pct)
    .slice(0, 5)

  return { risers, fallers }
}

export default async function MarketDetailPage({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  const t = useTranslations(lang as Lang)
  const cfg = getCountry(country)
  if (!cfg || !cfg.active) notFound()
  const [articles, summary, { risers, fallers }] = await Promise.all([getArticles(country, lang), getMarketSummary(country, lang), getMovers(country, lang)])
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.54rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{cfg.flag} {cfg.name}</div>
        <h1 className="page-title">{cfg.index}</h1>
      </div>
      {summary?.summary && (
        <div className="mkt-detail-summary">{summary.summary}</div>
      )}
      <MarketMovers risers={risers} fallers={fallers} indexName={cfg.index} lang={lang as Lang} />
      <div className="sec-head"><span className="sec-lbl">{t.markets.latest}</span><div className="sec-line" /></div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="empty-state">{({ en: 'No articles available yet.', it: 'Nessun articolo disponibile.', fr: 'Aucun article disponible.', es: 'No hay artículos disponibles.' }[lang] || 'No articles available yet.')}</div>}
      </div>
    </div>
  )
}
