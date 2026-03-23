import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { parseTags } from '@/lib/types'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600

async function getArticle(slug: string, lang: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('meta_slug', slug)
    .eq('lang_code', lang)
    .eq('published', true)
    .single()
  if (error || !data) return null
  return data
}

async function getRelated(stockId: string, lang: string, excludeSlug: string) {
  const { data } = await supabase
    .from('articles')
    .select('headline, meta_slug, stocks(symbol), alerts(direction, change_pct)')
    .eq('lang_code', lang)
    .eq('stock_id', stockId)
    .eq('published', true)
    .neq('meta_slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3)
  return data ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const article = await getArticle(slug, lang)
  if (!article) return {}
  return { title: article.meta_title || article.headline, description: article.meta_description || '' }
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const t = useTranslations(lang as Lang)
  const article = await getArticle(slug, lang)
  if (!article) notFound()

  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags)
  const related = await getRelated(article.stock_id, lang, slug)
  const up = alert?.direction === 'up'

  const publishedDate = new Date(article.published_at).toLocaleDateString(
    lang === 'it' ? 'it-IT' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
  const publishedTime = new Date(article.published_at).toLocaleTimeString(
    lang === 'it' ? 'it-IT' : 'en-GB',
    { hour: '2-digit', minute: '2-digit' }
  )

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="flex items-center gap-3.5 pt-5">
        <Link href={`/${lang}`} className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.12em] uppercase text-[--text-dim] hover:text-[--gold] transition-colors">
          {t.article.back}
        </Link>
        <div className="flex-1 h-px bg-[--ink-border]" />
      </div>

      <div className="grid border-t border-[--ink-border] mt-0" style={{ gridTemplateColumns: '1fr 280px' }}>
        <article className="py-8 pr-11 border-r border-[--ink-border]">
          <div className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.18em] uppercase text-[--gold] mb-3">
            {stock?.country_code?.toUpperCase()} · {stock?.sector} · {publishedDate}, {publishedTime}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.85rem] font-normal leading-[1.22] tracking-tight text-[--text] mb-3.5">
            {article.headline}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap text-[0.7rem] text-[--text-dim] pb-5 mb-5 border-b border-[--ink-border]">
            <span>{t.article.byline}</span>
            <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] text-[--up] border border-[#2d4a34] px-[7px] py-[2px]">
              {t.article.factChecked}
            </span>
            <span>{publishedTime}</span>
          </div>

          <div className="flex gap-1.5 mb-5 pb-5 border-b border-[--ink-border]">
            <Link href={`/en/article/${slug}`} className={`flex items-center gap-1 px-2.5 py-1 border font-[family-name:var(--font-dm-mono)] text-[0.58rem] transition-all ${lang === 'en' ? 'text-[--text] border-[#3a3830] bg-[--ink-raised]' : 'text-[--text-dim] border-[--ink-border] hover:text-[--gold] hover:border-[--gold-border]'}`}>
              🇬🇧 English
            </Link>
            <Link href={`/it/article/${slug}`} className={`flex items-center gap-1 px-2.5 py-1 border font-[family-name:var(--font-dm-mono)] text-[0.58rem] transition-all ${lang === 'it' ? 'text-[--text] border-[#3a3830] bg-[--ink-raised]' : 'text-[--text-dim] border-[--ink-border] hover:text-[--gold] hover:border-[--gold-border]'}`}>
              🇮🇹 Italiano
            </Link>
          </div>

          <div className="space-y-4 mb-7">
            {article.body?.split('\n\n').filter(Boolean).map((para: string, i: number) => (
              <p key={i} className={`leading-[1.82] text-[--text] ${i === 0 ? 'text-[0.95rem]' : 'text-[0.88rem]'}`}>{para}</p>
            ))}
          </div>

          {article.explainer_body && (
            <>
              <div className="flex items-center gap-3 my-7">
                <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.16em] uppercase text-[--gold] whitespace-nowrap">
                  {t.article.whatItMeans}
                </span>
                <div className="flex-1 h-px bg-[--ink-border]" />
              </div>
              <div className="space-y-4">
                {article.explainer_body.split('\n\n').filter(Boolean).map((para: string, i: number) => (
                  <p key={i} className="text-[0.88rem] leading-[1.82] text-[--text]">{para}</p>
                ))}
              </div>
            </>
          )}

          {tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[--ink-border]">
              <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.16em] uppercase text-[--text-dim] mb-2.5">{t.article.tags}</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag: string) => (
                  <Link key={tag} href={`/${lang}/topics?tag=${tag}`} className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.08em] uppercase text-[--text-dim] border border-[--ink-border] px-2 py-1 hover:text-[--gold] hover:border-[--gold-border] transition-all">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="pl-7 pt-8">
          {stock && alert && (
            <div className="mb-6 pb-6 border-b border-[--ink-border]">
              <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.16em] uppercase text-[--text-dim] mb-3">
                {stock.symbol} · {stock.name}
              </div>
              <div className="font-[family-name:var(--font-dm-mono)] text-[1.8rem] font-medium text-[--text] leading-none mb-1.5">
                {alert.price_at_alert ? `${stock.country_code === 'us' ? '$' : '€'}${Number(alert.price_at_alert).toFixed(2)}` : '—'}
              </div>
              <div className={`flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[0.75rem] mb-4 ${up ? 'text-[--up]' : 'text-[--down]'}`}>
                <span>{up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%</span>
              </div>
              {([
                [t.article.previousClose, alert.previous_close ? `${stock.country_code === 'us' ? '$' : '€'}${Number(alert.previous_close).toFixed(2)}` : '—'],
                [t.article.capTier, stock.cap_tier ? (stock.cap_tier === 'large' ? t.article.large : stock.cap_tier === 'mid' ? t.article.mid : t.article.small) : '—'],
                [t.article.moveThreshold, stock.cap_tier === 'large' ? '±4.0%' : stock.cap_tier === 'mid' ? '±8.0%' : '±10.0%'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-[--ink-border] last:border-0 text-[0.7rem]">
                  <span className="text-[--text-dim]">{label}</span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-[--text]">{value}</span>
                </div>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[--ink-border]">
              <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.16em] uppercase text-[--text-dim] mb-3">{t.article.related}</div>
              <div className="flex flex-col gap-3.5">
                {related.map((r: any) => (
                  <Link key={r.meta_slug} href={`/${lang}/article/${r.meta_slug}`} className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-[family-name:var(--font-dm-mono)] text-[0.56rem] text-[--text] bg-[--ink-border] px-1.5 py-0.5">{r.stocks?.symbol}</span>
                      <span className={`font-[family-name:var(--font-dm-mono)] text-[0.58rem] ${r.alerts?.direction === 'up' ? 'text-[--up]' : 'text-[--down]'}`}>
                        {r.alerts?.direction === 'up' ? '+' : ''}{Number(r.alerts?.change_pct ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="font-[family-name:var(--font-playfair)] text-[0.8rem] leading-[1.35] text-[--text] group-hover:text-white transition-colors">
                      {r.headline}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
