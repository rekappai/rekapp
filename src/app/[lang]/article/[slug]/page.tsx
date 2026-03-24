import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { parseTags } from '@/lib/types'
import ArticleTOC from '@/components/ArticleTOC'
import ArticleTOCSidebar from '@/components/ArticleTOCSidebar'
import type { Metadata } from 'next'

export const revalidate = 3600

async function getArticle(slug: string, lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts(direction, change_pct, price_at_alert, previous_close)')
    .eq('meta_slug', slug).eq('lang_code', lang).eq('published', true).single()
  return data
}

async function getRelated(stockId: string, lang: string, excludeSlug: string) {
  const { data } = await supabase
    .from('articles')
    .select('headline, meta_slug, stocks(symbol), alerts(direction, change_pct)')
    .eq('lang_code', lang).eq('stock_id', stockId).eq('published', true)
    .neq('meta_slug', excludeSlug).order('published_at', { ascending: false }).limit(3)
  return data ?? []
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
  const alert = Array.isArray((article as any).alerts) ? (article as any).alerts[0] : (article as any).alerts
  const tags = parseTags(article.tags)
  const related = await getRelated(article.stock_id, lang, slug)
  const up = alert?.direction === 'up'
  const cur = stock?.country_code === 'us' ? '$' : '\u20ac'
  const loc = lang === 'it' ? 'it-IT' : 'en-GB'
  const pubDate = new Date(article.published_at).toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' })
  const pubTime = new Date(article.published_at).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
  const hasExplainer = !!article.explainer_body

  return (
    <div className="page">
      <div className="back-row">
        <Link href={'/' + lang} className="back-btn">{t.article.back}</Link>
        <div className="back-line" />
      </div>
      <div className="art-view-layout">
        <article className="art-main">
          <div className="art-kicker">{stock?.country_code?.toUpperCase()} \u00b7 {stock?.sector} \u00b7 {pubDate}, {pubTime}</div>
          <h1 className="art-h1">{article.headline}</h1>
          <div className="art-byline">
            <span>{t.article.byline}</span>
            <span className="fact-badge">\u2713 {t.article.factChecked}</span>
            <span>{pubTime}</span>
          </div>

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
        </article>

        <aside className="art-sb">
          {/* TOC — desktop sidebar */}
          <ArticleTOCSidebar lang={lang as Lang} hasExplainer={hasExplainer} />

          {stock && alert && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{stock.symbol} \u00b7 {stock.name}</div>
              <div className="price-big">{alert.price_at_alert ? cur + Number(alert.price_at_alert).toFixed(2) : '\u2014'}</div>
              <div className="price-chg" style={{ color: up ? 'var(--up)' : 'var(--down)' }}>
                {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
              </div>
              {[
                [t.article.previousClose, alert.previous_close ? cur + Number(alert.previous_close).toFixed(2) : '\u2014'],
                [t.article.capTier, stock.cap_tier === 'large' ? t.article.large : stock.cap_tier === 'mid' ? t.article.mid : t.article.small],
                [t.article.moveThreshold, stock.cap_tier === 'large' ? '\u00b14.0%' : stock.cap_tier === 'mid' ? '\u00b18.0%' : '\u00b110.0%'],
              ].map(([l, v]) => (
                <div key={l} className="mini-row"><span className="mini-lbl">{l}</span><span className="mini-val">{v}</span></div>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{t.article.related}</div>
              {related.map((r: any) => {
                const rs = Array.isArray(r.stocks) ? r.stocks[0] : r.stocks
                const ra = Array.isArray(r.alerts) ? r.alerts[0] : r.alerts
                return (
                  <Link key={r.meta_slug} href={'/' + lang + '/article/' + r.meta_slug} style={{ display:'block', marginBottom:14, textDecoration:'none' }}>
                    <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
                      <span className="ticker-badge" style={{ fontSize:'0.56rem' }}>{rs?.symbol}</span>
                      <span className={'chg ' + (ra?.direction==='up'?'up':'dn')} style={{ fontSize:'0.58rem' }}>
                        {ra?.direction==='up'?'+':''}{Number(ra?.change_pct??0).toFixed(1)}%
                      </span>
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
