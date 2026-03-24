import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

async function getMovers(lang: string) {
  // Step 1: get latest articles with stock info
  const { data: articles } = await supabase
    .from('articles')
    .select('meta_slug, headline, alert_id, stocks(symbol, name)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5)

  if (!articles?.length) return []

  // Step 2: fetch the alerts by id
  const alertIds = articles.map((a: any) => a.alert_id).filter(Boolean)
  const { data: alerts } = await supabase
    .from('alerts')
    .select('id, direction, change_pct')
    .in('id', alertIds)

  const alertMap: Record<string, any> = {}
  alerts?.forEach((a: any) => { alertMap[a.id] = a })

  return articles.map((a: any) => ({
    ...a,
    alert: alertMap[a.alert_id] ?? null,
  }))
}

export default async function Sidebar({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const movers = await getMovers(lang)

  return (
    <div className="feed-sidebar">
      <div className="sb-widget">
        <div className="sb-head">{t.sidebar.movers}</div>
        {movers.map((item: any) => {
          const stock = Array.isArray(item.stocks) ? item.stocks[0] : item.stocks
          const alert = item.alert
          const up = alert?.direction === 'up'
          return (
            <Link key={item.meta_slug} href={'/' + lang + '/article/' + item.meta_slug} className="mover-row">
              <span className="mover-sym">{stock?.symbol}</span>
              <span className="mover-name">{stock?.name}</span>
              <span className={'mover-chg ' + (up ? 'up' : 'dn')}>
                {up ? '+' : ''}{Number(alert?.change_pct ?? 0).toFixed(1)}%
              </span>
            </Link>
          )
        })}
      </div>
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
