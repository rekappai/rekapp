import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import Sidebar from '@/components/Sidebar'
import Ticker from '@/components/Ticker'
import LoadMore from '@/components/LoadMore'

export const revalidate = 60

async function getArticles(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts!alert_id(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(10)
  return data ?? []
}

async function getTicker() {
  const { data } = await supabase
    .from('articles')
    .select('stocks(symbol), alerts!alert_id(direction, change_pct)')
    .eq('published', true)
    .order('published_at', { ascending: false }).limit(10)
  return data ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const meta = {
    en: { title: 'Rekapp — Financial Intelligence, Live', description: 'AI-generated financial news for S&P 500 and FTSE MIB. Real-time alerts, bilingual articles, fact-checked.' },
    it: { title: 'Rekapp — Intelligenza Finanziaria in Tempo Reale', description: 'Notizie finanziarie generate dall\'IA per S&P 500 e FTSE MIB. Aggiornamenti in tempo reale, articoli bilingue, verificati.' },
  } as Record<string, { title: string; description: string }>
  return meta[lang] ?? meta.en
}


export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const [articles, tickerRaw] = await Promise.all([getArticles(lang), getTicker()])

  const tickerItems = tickerRaw
    .filter((r: any) => r.stocks?.symbol && r.alerts?.change_pct != null)
    .map((r: any) => ({ symbol: r.stocks.symbol, change_pct: r.alerts.change_pct }))

  const loc = lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'en-GB'
  const fmt = (d: string) => new Date(d).toLocaleDateString(loc, { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const today = fmt(new Date().toISOString())

  const grouped = articles.reduce((acc: Record<string, any[]>, a) => {
    const d = fmt(a.published_at)
    if (!acc[d]) acc[d] = []
    acc[d].push(a)
    return acc
  }, {})

  return (
    <>
      <Ticker items={tickerItems} />
      <div className="page">
        <div className="home-head">
          <div className="home-eyebrow">{t.feed.eyebrow}</div>
          <h1 className="home-title">{t.feed.title} — <em>{t.feed.titleEm}</em></h1>
        </div>
        <div className="feed-layout">
          <div className="feed-col">
            {Object.entries(grouped).map(([date, dayArticles], gi) => (
              <div key={date}>
                <div className="feed-date-divider">
                  <span className="feed-date-lbl">
                    {date === today ? (lang === 'fr' ? "Aujourd'hui — " : lang === 'it' ? 'Oggi — ' : 'Today — ') + date : date}
                  </span>
                  <div className="feed-date-line" />
                  <span className="feed-date-count">{dayArticles.length} {t.archive.stories.toLowerCase()}</span>
                </div>
                {dayArticles.map((article, i) => (
                  <FeedItem key={article.id} article={article} lang={lang as Lang} hero={gi === 0 && i === 0} />
                ))}
              </div>
            ))}
            {articles.length === 0 && (
              <div className="empty-state">{lang === 'fr' ? 'Aucun article disponible.' : lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}</div>
            )}
          </div>
          <Sidebar lang={lang as Lang} />
        </div>
      </div>
    </>
  )
}
export const dynamic = "force-dynamic"
