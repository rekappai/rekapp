import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import TopicsClient from '@/components/TopicsClient'

export const revalidate = 120

async function getArticles(lang: string, tag?: string) {
  let query = supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  if (tag) query = query.contains('tags', JSON.stringify([tag]))
  const { data } = await query
  return data ?? []
}

export default async function TopicsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ tag?: string }>
}) {
  const { lang } = await params
  const { tag } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = await getArticles(lang, tag)
  const topicKeys = ['earnings','analysts','ai','banks','energy','evs','semiconductors','macro','ma','rates','ipo','fda','trade'] as const

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="py-8 border-b border-[--ink-border]">
        <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,2.5vw,2.2rem)] font-normal tracking-tight text-[--text] mb-4">{t.topics.title}</h1>
        <TopicsClient lang={lang as Lang} activeTag={tag} topics={topicKeys.map(k => ({ slug: k, label: t.topics[k] }))} />
      </div>
      <div className="border-t border-[--ink-border] mt-2">
        {articles.map((article, i) => (
          <FeedItem key={article.id} article={article} lang={lang as Lang} hero={i === 0} />
        ))}
        {articles.length === 0 && (
          <div className="py-10 font-[family-name:var(--font-dm-mono)] text-[0.62rem] text-[--text-dim]">{t.archive.noResults}</div>
        )}
      </div>
    </div>
  )
}
