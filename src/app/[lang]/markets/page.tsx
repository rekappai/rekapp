import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'

export const revalidate = 300

async function getCount(code: string, lang: string) {
  const { count } = await supabase.from('articles').select('id', { count:'exact', head:true })
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
  return count ?? 0
}

async function getLatest(code: string, lang: string) {
  const { data } = await supabase.from('articles').select('headline')
    .eq('country_code', code).eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending:false }).limit(1)
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
  const soon   = COUNTRIES.filter(c => !c.active)

  const stats: Record<string, { count:number; latest:string|null }> = {}
  await Promise.all(active.map(async c => {
    const [count, latest] = await Promise.all([getCount(c.code, lang), getLatest(c.code, lang)])
    stats[c.code] = { count, latest }
  }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t.markets.title}</h1>
        <p className="page-sub">{t.markets.sub}</p>
      </div>
      <div className="sec-head"><span className="sec-lbl">{t.markets.active}</span><div className="sec-line" /></div>
      <div className="mkt-directory" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {active.map(c => {
          const s = stats[c.code]
          return (
            <Link key={c.code} href={'/' + lang + '/markets/' + c.code} className="mkt-card">
              <div className="mkt-card-head">
                <div>
                  <div className="mkt-card-flag">{c.flag}</div>
                  <div className="mkt-card-name">{c.index}</div>
                  <div className="mkt-card-country">{c.name}</div>
                </div>
                <span className="mkt-card-status open">{t.markets.status.open}</span>
              </div>
              <div className="mkt-card-stats">
                <div className="mkt-card-stat">
                  <div className="mkt-card-stat-val">{s.count}</div>
                  <div className="mkt-card-stat-lbl">{t.markets.stat.stories}</div>
                </div>
              </div>
              {s.latest && <div className="mkt-card-foot">{lang === 'it' ? 'Ultimo:' : 'Latest:'} {s.latest}</div>}
            </Link>
          )
        })}
      </div>
      <div className="sec-head" style={{ marginTop:16 }}><span className="sec-lbl">{t.markets.soon}</span><div className="sec-line" /></div>
      <div className="mkt-directory mkt-directory-dim" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
        {soon.map(c => (
          <div key={c.code} className="mkt-card mkt-card-soon">
            <div className="mkt-card-flag">{c.flag}</div>
            <div className="mkt-card-name">{c.index}</div>
            <div className="mkt-card-country">{c.name}</div>
            <span className="mkt-card-status soon" style={{ marginTop:12, display:'inline-block' }}>{t.markets.status.soon}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
