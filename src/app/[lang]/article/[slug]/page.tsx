import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { parseTags } from '@/lib/types'
import ArticleTOC from '@/components/ArticleTOC'
import ArticleTOCSidebar from '@/components/ArticleTOCSidebar'
import AltSlugSetter from '@/components/AltSlugSetter'
import RelatedArticles from '@/components/RelatedArticles'
import TimeDisplay from '@/components/TimeDisplay'
import ShareButtons from '@/components/ShareButtons'
import type { Metadata } from 'next'

export const revalidate = 3600

const INDEX_MAP: Record<string, string> = { us: 'S&P 500', it: 'FTSE MIB' }
const RELATED_SELECT = 'meta_slug, headline, direction, change_pct, symbol, company_name'

async function getArticle(slug: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts!alert_id(price_at_alert, previous_close)')
    .eq('meta_slug', slug).eq('lang_code', lang).eq('published', true).single()
  return data
}

async function getRelated(stockId: string, sector: string | null, lang: string, excludeSlug: string) {
  const results: any[] = []
  const excludeSlugs = [excludeSlug]

  if (stockId) {
    const { data } = await supabase.from('articles').select(RELATED_SELECT)
      .eq('stock_id', stockId).eq('lang_code', lang).eq('published', true)
      .neq('meta_slug', excludeSlug).order('published_at', { ascending: false }).limit(2)
    if (data?.length) { results.push(...data); excludeSlugs.push(...data.map((a: any) => a.meta_slug)) }
  }

  if (results.length < 3 && sector) {
    const needed = 3 - results.length
    const { data } = await supabase.from('articles').select(RELATED_SELECT + ', stocks!inner(sector)')
      .eq('lang_code', lang).eq('published', true).eq('stocks.sector', sector)
      .order('published_at', { ascending: false }).limit(needed + excludeSlugs.length)
    if (data?.length) {
      const filtered = data.filter((a: any) => !excludeSlugs.includes(a.meta_slug)).slice(0, needed)
      results.push(...filtered); excludeSlugs.push(...filtered.map((a: any) => a.meta_slug))
    }
  }

  if (results.length < 3) {
    const needed = 3 - results.length
    const { data } = await supabase.from('articles').select(RELATED_SELECT)
      .eq('lang_code', lang).eq('published', true)
      .order('published_at', { ascending: false }).limit(needed + excludeSlugs.length)
    if (data?.length) {
      results.push(...data.filter((a: any) => !excludeSlugs.includes(a.meta_slug)).slice(0, needed))
    }
  }

  return results.slice(0, 3)
}

async function getAlternateSlug(alertId: string | null, stockId: string, otherLang: string): Promise<string | null> {
  if (alertId) {
    const { data } = await supabase.from('articles').select('meta_slug')
      .eq('alert_id', alertId).eq('lang_code', otherLang).eq('published', true).single()
    if (data?.meta_slug) return data.meta_slug
  }
  const { data } = await supabase.from('articles').select('meta_slug')
    .eq('stock_id', stockId).eq('lang_code', otherLang).eq('published', true)
    .order('published_at', { ascending: false }).limit(1).single()
  return data?.meta_slug ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const a = await getArticle(slug, lang)
  if (!a) return {}
  return { title: a.meta_title || a.headline, description: a.meta_description || '' }
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const t = useTranslations(lang as Lang)
  const article = await getArticle(slug, lang)
  if (!article) notFound()

  const stock = Array.isArray((article as any).stocks) ? (article as any).stocks[0] : (article as any).stocks
  const alertData = Array.isArray((article as any).alerts) ? (article as any).alerts[0] : (article as any).alerts
  const tags = parseTags(article.tags)
  const otherLang = lang === 'en' ? 'it' : 'en'
  const altSlug = await getAlternateSlug(article.alert_id, article.stock_id, otherLang)
  const altHref = altSlug ? '/' + otherLang + '/article/' + altSlug : '/' + otherLang
  const related = await getRelated(article.stock_id, stock?.sector ?? null, lang, slug)
  const direction = (article as any).direction
  const changePct = (article as any).change_pct
  const up = direction === 'up'
  const cur = stock?.country_code === 'us' ? '$' : '\u20ac'
  const hasExplainer = !!article.explainer_body
  const indexName = stock?.country_code ? (INDEX_MAP[stock.country_code] ?? stock.country_code.toUpperCase()) : null
  const kicker = [indexName, stock?.sector].filter(Boolean).join(' \xb7 ')

  return (
    <div className="page">
      <AltSlugSetter href={altHref} />
      <div className="back-row">
        <Link href={'/' + lang} className="back-btn">{t.article.back}</Link>
        <div className="back-line" />
      </div>
      <div className="art-view-layout">
        <article className="art-main">
          <div className="art-kicker">
            {kicker}{kicker ? ' \xb7 ' : ''}<TimeDisplay iso={article.published_at} format="datetime" />
          </div>
          <h1 className="art-h1">{article.headline}</h1>
          <ShareButtons url={`https://www.rekapp.ai/${lang}/article/${slug}`} title={article.headline} />
          <div className="art-byline">
            <span>{t.article.byline}</span>
            <span className="fact-badge">{t.article.factChecked}</span>
            <TimeDisplay iso={article.published_at} format="time" />
          </div>
          <ShareButtons url={`https://www.rekapp.ai/${lang}/article/${slug}`} title={article.headline} />

          <ArticleTOC
            lang={lang as Lang}
            recapBody={article.body ?? ''}
            explainerBody={article.explainer_body ?? null}
          />

          {tags.length > 0 && (
            <div className="art-tags">
              <div className="art-tags-lbl">{t.article.tags}</div>
              <div className="tags">
                {tags.map((tag: string) => (
                  <Link key={tag} href={'/' + lang + '/topics?tag=' + tag} className="tag">{tag}</Link>
                ))}
              </div>
            </div>
          )}

          <RelatedArticles articles={related} lang={lang as Lang} />
        </article>

        <aside className="art-sb">
          <ArticleTOCSidebar lang={lang as Lang} hasExplainer={hasExplainer} />

          {stock && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{stock.symbol} &middot; {stock.name}</div>
              {changePct != null && (
                <>
                  <div className="price-big">
                    {alertData?.price_at_alert ? cur + Number(alertData.price_at_alert).toFixed(2) : '\u2014'}
                  </div>
                  <div className="price-chg" style={{ color: up ? 'var(--up)' : 'var(--down)' }}>
                    {up ? '+' : ''}{Number(changePct).toFixed(1)}%
                  </div>
                </>
              )}
              {[
                [t.article.previousClose, alertData?.previous_close ? cur + Number(alertData.previous_close).toFixed(2) : '\u2014'],
                [t.article.capTier, stock.cap_tier === 'large' ? t.article.large : stock.cap_tier === 'mid' ? t.article.mid : t.article.small],
                [t.article.moveThreshold, stock.cap_tier === 'large' ? '\xb14.0%' : stock.cap_tier === 'mid' ? '\xb18.0%' : '\xb110.0%'],
              ].map(([l, v]) => (
                <div key={l} className="mini-row"><span className="mini-lbl">{l}</span><span className="mini-val">{v}</span></div>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{lang === 'it' ? 'Altre storie' : 'More stories'}</div>
              {related.map((r: any) => {
                const rs = Array.isArray(r.stocks) ? r.stocks[0] : r.stocks
                const rup = r.direction === 'up'
                return (
                  <Link key={r.meta_slug} href={'/' + lang + '/article/' + r.meta_slug} style={{ display:'block', marginBottom:14, textDecoration:'none' }}>
                    <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
                      <span className="ticker-badge" style={{ fontSize:'0.56rem' }}>{rs?.symbol}</span>
                      {r.change_pct != null && (
                        <span className={'chg ' + (rup?'up':'dn')} style={{ fontSize:'0.58rem' }}>
                          {rup?'+':''}{Number(r.change_pct).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontSize:'0.8rem', lineHeight:1.35, color:'var(--text)' }}>{r.headline}</div>
                  </Link>
                )
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
