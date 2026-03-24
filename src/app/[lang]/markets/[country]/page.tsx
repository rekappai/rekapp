import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { getCountry } from '@/lib/countries'
import FeedItem from '@/components/FeedItem'

export const revalidate = 60

async function getArticles(code: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts!alert_id(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(30)
  return data ?? []
}

export default async function MarketDetailPage({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  const t = useTranslations(lang as Lang)
  const cfg = getCountry(country)
  if (!cfg || !cfg.active) notFound()
  const articles = await getArticles(country, lang)
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.54rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{cfg.flag} {cfg.name}</div>
        <h1 className="page-title">{cfg.index}</h1>
      </div>
      <div className="sec-head"><span className="sec-lbl">{t.markets.latest}</span><div className="sec-line" /></div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="empty-state">{lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}</div>}
      </div>
    </div>
  )
}
