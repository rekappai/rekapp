import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import SearchClient from '@/components/SearchClient'

async function searchArticles(query: string, lang: string) {
  if (!query || query.length < 2) return []
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang)
    .eq('published', true)
    .ilike('headline', `%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { lang } = await params
  const { q } = await searchParams
  const t = useTranslations(lang as Lang)
  const articles = q ? await searchArticles(q, lang) : []

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="py-8 border-b border-[--ink-border]">
        <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,2.5vw,2.2rem)] font-normal tracking-tight text-[--text] mb-5">{t.search.title}</h1>
        <SearchClient lang={lang as Lang} initialQuery={q} />
        <p className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.1em] text-[--text-dim] mt-3">{t.search.hint}</p>
      </div>
      {q && (
        <div className="border-t border-[--ink-border] mt-2">
          {articles.length === 0
            ? <div className="py-10 font-[family-name:var(--font-dm-mono)] text-[0.62rem] text-[--text-dim]">{t.archive.noResults}</div>
            : articles.map((article, i) => <FeedItem key={article.id} article={article} lang={lang as Lang} hero={i === 0} />)
          }
        </div>
      )}
    </div>
  )
}
