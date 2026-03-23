import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import SearchClient from '@/components/SearchClient'

async function search(query: string, lang: string) {
  if (!query || query.length < 2) return []
  const { data } = await supabase.from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .ilike('headline', '%' + query + '%')
    .order('published_at', { ascending: false }).limit(20)
  return data ?? []
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const { lang } = await params
  const { q } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = q ? await search(q, lang) : []
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title" style={{ marginBottom:20 }}>{t.search.title}</h1>
        <SearchClient lang={lang as Lang} initialQuery={q} />
        <p style={{ fontFamily:'DM Mono,monospace', fontSize:'0.54rem', letterSpacing:'0.1em', color:'var(--text-dim)', marginTop:12 }}>{t.search.hint}</p>
      </div>
      {q && (
        <div style={{ borderTop:'1px solid var(--ink-border)' }}>
          {articles.length === 0
            ? <div className="empty-state">{t.archive.noResults}</div>
            : articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        </div>
      )}
    </div>
  )
}
