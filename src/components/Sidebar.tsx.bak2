import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

async function getMarketPulse(lang: string) {
  const { data } = await supabase
    .from('market_summaries')
    .select('country_code, summary, index_price, index_change_pct, generated_at')
    .eq('lang_code', lang)
    .order('generated_at', { ascending: false })
    .limit(10)
  if (!data?.length) return []
  const seen = new Set<string>()
  return data.filter(d => {
    if (seen.has(d.country_code)) return false
    seen.add(d.country_code)
    return true
  }).slice(0, 3)
}

async function getMovers(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('meta_slug, headline, direction, change_pct, symbol, company_name')
    .eq('lang_code', lang)
    .eq('published', true)
    .not('change_pct', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50)

  if (!data?.length) return { risers: [], fallers: [] }

  const risers = data
    .filter((a: any) => a.direction === 'up')
    .sort((a: any, b: any) => b.change_pct - a.change_pct)
    .slice(0, 3)

  const fallers = data
    .filter((a: any) => a.direction === 'down')
    .sort((a: any, b: any) => a.change_pct - b.change_pct)
    .slice(0, 3)

  return { risers, fallers }
}

function MoverRow({ item, lang }: { item: any; lang: string }) {
  const up = item.direction === 'up'
  return (
    <Link href={'/' + lang + '/article/' + item.meta_slug} className="mover-row">
      <span className="mover-sym">{item.symbol}</span>
      <span className="mover-name">{item.company_name}</span>
      <span className={'mover-chg ' + (up ? 'up' : 'dn')}>
        {up ? '+' : ''}{Number(item.change_pct).toFixed(1)}%
      </span>
    </Link>
  )
}

export default async function Sidebar({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const { risers, fallers } = await getMovers(lang)
  const pulse = await getMarketPulse(lang)

  return (
    <div className="feed-sidebar">
      {risers.length > 0 && (
        <div className="sb-widget">
          <div className="sb-head">{t.sidebar.risers}</div>
          {risers.map((item: any) => <MoverRow key={item.meta_slug} item={item} lang={lang} />)}
        </div>
      )}
      {fallers.length > 0 && (
        <div className="sb-widget">
          <div className="sb-head">{t.sidebar.fallers}</div>
          {fallers.map((item: any) => <MoverRow key={item.meta_slug} item={item} lang={lang} />)}
        </div>
      )}
      {pulse.length > 0 && (
        <div className="sb-widget">
          <div className="sb-head">{lang === 'it' ? 'Sintesi dei mercati' : lang === 'fr' ? 'Synthèse des marchés' : 'Market pulse'}</div>
          {pulse.map((p: any) => (
            <div key={p.country_code} className="pulse-item">
              <div className="pulse-head">
                <span className="pulse-idx">{p.country_code.toUpperCase()}</span>
                <span className={'pulse-chg ' + (p.index_change_pct >= 0 ? 'up' : 'dn')}>
                  {p.index_change_pct >= 0 ? '+' : ''}{Number(p.index_change_pct).toFixed(2)}%
                </span>
              </div>
              <p className="pulse-text">{p.summary}</p>
            </div>
          ))}
        </div>
      )}
      <div className="sb-widget">
        <div className="sb-head">{t.sidebar.indices}</div>
        <Link href={'/' + lang + '/markets'} className="read-btn">{t.sidebar.allMarkets}</Link>
      </div>
      <div className="sb-widget">
        <div className="sb-head">{t.sidebar.topics}</div>
        <div className="tags">
          {(['earnings','analysts','ai','banks','energy','evs','macro'] as const).map(k => (
            <Link key={k} href={'/' + lang + '/topics?tag=' + k} className="tag">{t.topics[k]}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
