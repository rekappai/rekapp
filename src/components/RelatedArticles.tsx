import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

type RelatedArticle = {
  meta_slug: string
  headline: string
  stocks?: { symbol: string } | { symbol: string }[] | null
  alerts?: { direction: string; change_pct: number } | { direction: string; change_pct: number }[] | null
}

export default function RelatedArticles({ articles, lang }: { articles: RelatedArticle[]; lang: Lang }) {
  if (!articles.length) return null

  return (
    <div className="related-articles">
      <div className="sec-head">
        <span className="sec-lbl">{lang === 'it' ? 'Altre storie' : 'More stories'}</span>
        <div className="sec-line" />
      </div>
      <div className="related-grid">
        {articles.map(a => {
          const stock = Array.isArray(a.stocks) ? a.stocks[0] : a.stocks
          const alert = Array.isArray(a.alerts) ? a.alerts[0] : a.alerts
          const up = alert?.direction === 'up'
          return (
            <Link key={a.meta_slug} href={'/' + lang + '/article/' + a.meta_slug} className="related-card">
              <div className="related-meta">
                {stock?.symbol && <span className="ticker-badge">{stock.symbol}</span>}
                {alert?.change_pct != null && Number(alert.change_pct) !== 0 && (
                  <span className={'chg ' + (up ? 'up' : 'dn')}>
                    {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="related-headline">{a.headline}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
