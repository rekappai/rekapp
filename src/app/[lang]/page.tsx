import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { type Article } from '@/lib/types'
import FeedItem from '@/components/FeedItem'
import Sidebar from '@/components/Sidebar'
import Ticker from '@/components/Ticker'

export const revalidate = 60

async function getArticles(lang: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(50)
  if (error) { console.error('Feed fetch error:', error); return [] }
  return data ?? []
}

async function getTickerData() {
  const { data } = await supabase
    .from('articles')
    .select('stocks(symbol), alerts(direction, change_pct)')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const [articles, tickerRaw] = await Promise.all([getArticles(lang), getTickerData()])

  const tickerItems = tickerRaw
    .filter((r: any) => r.stocks?.symbol && r.alerts?.change_pct != null)
    .map((r: any) => ({ symbol: r.stocks.symbol, change_pct: r.alerts.change_pct }))

  const grouped = articles.reduce((acc: Record<string, Article[]>, article) => {
    const date = new Date(article.published_at).toLocaleDateString(
      lang === 'it' ? 'it-IT' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    )
    if (!acc[date]) acc[date] = []
    acc[date].push(article)
    return acc
  }, {})

  const today = new Date().toLocaleDateString(
    lang === 'it' ? 'it-IT' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <>
      <Ticker items={tickerItems} />
      <div className="max-w-[1240px] mx-auto px-[--pad]">
        <div className="py-8 border-b border-[--ink-border]">
          <div className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] mb-2">
            {t.feed.eyebrow}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.7rem,3vw,2.8rem)] font-normal tracking-tight text-[--text] leading-[1.15]">
            {t.feed.title} — <em className="italic text-[--gold]">{t.feed.titleEm}</em>
          </h1>
        </div>

        <div className="flex gap-0">
          <div className="flex-1 border-r border-[--ink-border] min-w-0">
            {Object.entries(grouped).map(([date, dayArticles], groupIndex) => (
              <div key={date}>
                <div className="sticky top-[52px] z-10 flex items-center gap-3 px-5 py-3.5 bg-[--ink-raised] border-b border-[--ink-border]">
                  <span className="font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.14em] uppercase text-[--gold] whitespace-nowrap">
                    {date === today ? (lang === 'it' ? 'Oggi' : 'Today') + ' — ' + date : date}
                  </span>
                  <div className="flex-1 h-px bg-[--ink-border]" />
                  <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.1em] text-[--text-dim] whitespace-nowrap">
                    {dayArticles.length} {t.archive.stories.toLowerCase()}
                  </span>
                </div>
                {dayArticles.map((article, i) => (
                  <FeedItem key={article.id} article={article} lang={lang as Lang} hero={groupIndex === 0 && i === 0} />
                ))}
              </div>
            ))}
            {articles.length === 0 && (
              <div className="p-10 font-[family-name:var(--font-dm-mono)] text-[0.62rem] tracking-[0.1em] text-[--text-dim]">
                {lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}
              </div>
            )}
          </div>
          <Sidebar lang={lang as Lang} />
        </div>
      </div>
    </>
  )
}
