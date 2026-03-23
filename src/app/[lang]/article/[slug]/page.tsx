import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import { parseTags } from '@/lib/types'
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

  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags)
  const related = await getRelated(article.stock_id, lang, slug)
  const up = alert?.direction === 'up'
  const cur = stock?.country_code === 'us' ? '$' : '€'
  const loc = lang === 'it' ? 'it-IT' : 'en-GB'
  const pubDate = new Date(article.published_at).toLocaleDateString(loc, { day:'numeric', month:'long', year:'numeric' })
  const pubTime = new Date(article.published_at).toLocaleTimeString(loc, { hour:'2-digit', minute:'2-digit' })

  return (
    <div className="page">
      <div className="back-row">
        <Link href={'/' + lang} className="back-btn">{t.article.back}</Link>
        <div className="back-line" />
      </div>
      <div className="art-view-layout">
        <article className="art-main">
          <div className="art-kicker">{stock?.country_code?.toUpperCase()} · {stock?.sector} · {pubDate}, {pubTime}</div>
          <h1 className="art-h1">{article.headline}</h1>
          <div className="art-byline">
            <span>{t.article.byline}</span>
            <span className="fact-badge">{t.article.factChecked}</span>
            <span>{pubTime}</span>
          </div>
          <div className="art-lang">
            <Link href={'/en/article/' + slug} className={lang === 'en' ? 'active' : ''}>🇬🇧 English</Link>
            <Link href={'/it/article/' + slug} className={lang === 'it' ? 'active' : ''}>🇮🇹 Italiano</Link>
          </div>
          <div className="art-body">
            {article.body?.split('\n\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
          {article.explainer_body && (
            <>
              <div className="expl-head">
                <span className="expl-lbl">{t.article.whatItMeans}</span>
                <div className="expl-line" />
              </div>
              <div className="art-body">
                {article.explainer_body.split('\n\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </>
          )}
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
          {stock && alert && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{stock.symbol} · {stock.name}</div>
              <div className="price-big">{alert.price_at_alert ? cur + Number(alert.price_at_alert).toFixed(2) : '—'}</div>
              <div className="price-chg" style={{ color: up ? 'var(--up)' : 'var(--down)' }}>
                {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
              </div>
              {[
                [t.article.previousClose, alert.previous_close ? cur + Number(alert.previous_close).toFixed(2) : '—'],
                [t.article.capTier, stock.cap_tier === 'large' ? t.article.large : stock.cap_tier === 'mid' ? t.article.mid : t.article.small],
                [t.article.moveThreshold, stock.cap_tier === 'large' ? '±4.0%' : stock.cap_tier === 'mid' ? '±8.0%' : '±10.0%'],
              ].map(([l, v]) => (
                <div key={l} className="mini-row"><span className="mini-lbl">{l}</span><span className="mini-val">{v}</span></div>
              ))}
            </div>
          )}
          {related.length > 0 && (
            <div className="art-sb-sec">
              <div className="art-sb-lbl">{t.article.related}</div>
              {related.map((r: any) => (
                <Link key={r.meta_slug} href={'/' + lang + '/article/' + r.meta_slug} style={{ display:'block', marginBottom:14, textDecoration:'none' }}>
                  <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
                    <span className="ticker-badge" style={{ fontSize:'0.56rem' }}>{r.stocks?.symbol}</span>
                    <span className={'chg ' + (r.alerts?.direction==='up'?'up':'dn')} style={{ fontSize:'0.58rem' }}>
                      {r.alerts?.direction==='up'?'+':''}{Number(r.alerts?.change_pct??0).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'0.8rem', lineHeight:1.35, color:'var(--text)' }}>{r.headline}</div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
