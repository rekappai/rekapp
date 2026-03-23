import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'

export const revalidate = 300

async function getMarketArticles(countryCode: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('id, headline, meta_slug, published_at')
    .eq('country_code', countryCode)
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function MarketsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const active = COUNTRIES.filter(c => c.active)
  const soon   = COUNTRIES.filter(c => !c.active)

  const statsMap: Record<string, any[]> = {}
  await Promise.all(active.map(async c => { statsMap[c.code] = await getMarketArticles(c.code, lang) }))

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="py-8 border-b border-[--ink-border]">
        <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,2.5vw,2.2rem)] font-normal tracking-tight text-[--text] mb-1.5">{t.markets.title}</h1>
        <p className="text-[0.82rem] text-[--text-dim] max-w-lg">{t.markets.sub}</p>
      </div>

      <div className="flex items-center gap-3.5 py-6">
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] whitespace-nowrap">{t.markets.active}</span>
        <div className="flex-1 h-px bg-[--ink-border]" />
      </div>

      <div className="grid gap-px bg-[--ink-border] border border-[--ink-border]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
        {active.map(country => {
          const articles = statsMap[country.code] ?? []
          const latest = articles[0]
          return (
            <Link key={country.code} href={`/${lang}/markets/${country.code}`} className="bg-[--ink] p-5 hover:bg-[--ink-hover] transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[1.4rem] mb-1.5 leading-none">{country.flag}</div>
                  <div className="font-[family-name:var(--font-playfair)] text-[1.05rem] text-[--text]">{country.index}</div>
                  <div className="font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.1em] uppercase text-[--text-dim] mt-1">{country.name}</div>
                </div>
                <span className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.1em] uppercase text-[--up] border border-[#2d4a34] px-2 py-1">{t.markets.status.open}</span>
              </div>
              <div className="border-t border-[--ink-border] pt-3.5 mb-3.5">
                <div className="font-[family-name:var(--font-dm-mono)] text-[0.88rem] font-medium text-[--text]">{articles.length}</div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[0.5rem] tracking-[0.1em] uppercase text-[--text-dim] mt-1">{t.markets.stat.stories}</div>
              </div>
              {latest && (
                <div className="text-[0.72rem] text-[--text-dim] border-t border-[--ink-border] pt-3 truncate">
                  {lang === 'it' ? 'Ultimo:' : 'Latest:'} {latest.headline}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-3.5 py-6 mt-4">
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] whitespace-nowrap">{t.markets.soon}</span>
        <div className="flex-1 h-px bg-[--ink-border]" />
      </div>

      <div className="grid gap-px bg-[--ink-border] border border-[--ink-border] mb-12 opacity-40" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
        {soon.map(country => (
          <div key={country.code} className="bg-[--ink] p-5">
            <div className="text-[1.3rem] mb-1.5 leading-none">{country.flag}</div>
            <div className="font-[family-name:var(--font-playfair)] text-[1rem] text-[--text]">{country.index}</div>
            <div className="font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.1em] uppercase text-[--text-dim] mt-1">{country.name}</div>
            <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.1em] uppercase text-[--text-dim] border border-[--ink-border] px-2 py-1 inline-block mt-3">{t.markets.status.soon}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
