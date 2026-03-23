import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import TopicsClient from '@/components/TopicsClient'

export const revalidate = 120

async function getArticles(lang: string, tag?: string) {
  let q = supabase.from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(20)
  if (tag) q = q.contains('tags', JSON.stringify([tag]))
  const { data } = await q
  return data ?? []
}

export default async function TopicsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ tag?: string }> }) {
  const { lang } = await params
  const { tag } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = await getArticles(lang, tag)
  const keys = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade'] as const
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t.topics.title}</h1>
        <TopicsClient lang={lang as Lang} activeTag={tag} topics={keys.map(k => ({ slug: k, label: t.topics[k] }))} />
      </div>
      <div style={{ borderTop:'1px solid var(--ink-border)' }}>
        {articles.map((a, i) => <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />)}
        {articles.length === 0 && <div className="empty-state">{t.archive.noResults}</div>}
      </div>
    </div>
  )
}
