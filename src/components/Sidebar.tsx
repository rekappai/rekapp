import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

async function getMovers(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('meta_slug, headline, direction, change_pct, stocks(symbol, name)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5)
  return data ?? []
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
          const up = item.direction === 'up'
          return (
            <Link key={item.meta_slug} href={'/' + lang + '/article/' + item.meta_slug} className="mover-row">
              <span className="mover-sym">{stock?.symbol}</span>
              <span className="mover-name">{stock?.name}</span>
              <span className={'mover-chg ' + (up ? 'up' : 'dn')}>
                {up ? '+' : ''}{Number(item.change_pct ?? 0).toFixed(1)}%
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
