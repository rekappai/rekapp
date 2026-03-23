import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { getCountry } from '@/lib/countries'
import FeedItem from '@/components/FeedItem'

export const revalidate = 60

async function getArticles(countryCode: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('country_code', countryCode)
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(30)
  return data ?? []
}

export default async function MarketDetailPage({ params }: { params: Promise<{ lang: string; country: string }> }) {
  const { lang, country } = await params
  const t = useTranslations(lang as Lang)
  const countryConfig = getCountry(country)
  if (!countryConfig || !countryConfig.active) notFound()

  const articles = await getArticles(country, lang)

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="py-8 border-b border-[--ink-border]">
        <div className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.16em] uppercase text-[--gold] mb-2">{countryConfig.flag} {countryConfig.name}</div>
        <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,2.5vw,2.2rem)] font-normal tracking-tight text-[--text]">{countryConfig.index}</h1>
      </div>
      <div className="flex items-center gap-3.5 py-6">
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] whitespace-nowrap">{t.markets.latest}</span>
        <div className="flex-1 h-px bg-[--ink-border]" />
      </div>
      <div className="border-t border-[--ink-border]">
        {articles.map((article, i) => (
          <FeedItem key={article.id} article={article} lang={lang as Lang} hero={i === 0} />
        ))}
        {articles.length === 0 && (
          <div className="py-10 font-[family-name:var(--font-dm-mono)] text-[0.62rem] text-[--text-dim]">
            {lang === 'it' ? 'Nessun articolo disponibile.' : 'No articles available yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
