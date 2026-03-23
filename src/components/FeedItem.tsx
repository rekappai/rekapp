import Link from 'next/link'
import { type Article, parseTags } from '@/lib/types'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function FeedItem({ article, lang, hero = false }: { article: Article; lang: Lang; hero?: boolean }) {
  const t = useTranslations(lang)
  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags).slice(0, 2)
  const up = alert?.direction === 'up'
  const time = new Date(article.published_at).toLocaleTimeString(
    lang === 'it' ? 'it-IT' : 'en-GB', { hour: '2-digit', minute: '2-digit' }
  )

  const Meta = () => (
    <div className="feed-meta">
      {stock?.symbol && <span className="ticker-badge">{stock.symbol}</span>}
      {alert?.change_pct != null && (
        <span className={'chg ' + (up ? 'up' : 'dn')}>
          {up ? '▴' : '▾'} {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
        </span>
      )}
      {article.country_code && <span className="feed-market">{article.country_code.toUpperCase()}</span>}
      <span className="card-time">{time}</span>
    </div>
  )

  const Tags = () => tags.length > 0 ? (
    <div className="tags" style={{ marginLeft: 'auto' }}>
      {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
    </div>
  ) : null

  if (hero) {
    return (
      <Link href={'/' + lang + '/article/' + article.meta_slug} className="feed-item hero">
        <div className="feed-content hero">
          <Meta />
          <div className="feed-h hero">{article.headline}</div>
          {article.body && <div className="feed-p hero">{article.body.slice(0, 280)}</div>}
          <div className="feed-foot">
            <span className="read-btn">{t.feed.readMore}</span>
            <Tags />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={'/' + lang + '/article/' + article.meta_slug} className="feed-item">
      <div className="feed-time-col">
        <span className="feed-time">{time}</span>
        <span className="feed-dot" />
      </div>
      <div className="feed-content">
        <Meta />
        <div className="feed-h">{article.headline}</div>
        {article.body && <div className="feed-p">{article.body.slice(0, 160)}</div>}
        <div className="feed-foot">
          <span className="read-btn">{t.feed.readMore}</span>
          <Tags />
        </div>
      </div>
    </Link>
  )
}
