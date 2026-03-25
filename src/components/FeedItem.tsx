import Link from 'next/link'
import { type Article, parseTags } from '@/lib/types'
import { type Lang, useTranslations } from '@/lib/i18n'
import TimeDisplay from '@/components/TimeDisplay'

export default function FeedItem({ article, lang, hero = false }: { article: Article; lang: Lang; hero?: boolean }) {
  const t = useTranslations(lang)
  const stock = (article as any).stocks
  const stockData = Array.isArray(stock) ? stock[0] : stock
  const tags = parseTags(article.tags).slice(0, 2)
  const direction = (article as any).direction
  const changePct = (article as any).change_pct
  const up = direction === 'up'

  const Meta = () => (
    <div className="feed-meta">
      {stockData?.symbol && <span className="ticker-badge">{stockData.symbol}</span>}
      {changePct != null && changePct !== 0 && (
        <span className={'chg ' + (up ? 'up' : 'dn')}>
          {up ? '\u25b4' : '\u25be'} {up ? '+' : ''}{Number(changePct).toFixed(1)}%
        </span>
      )}
      {article.country_code && <span className="feed-market">{article.country_code.toUpperCase()}</span>}
      <TimeDisplay iso={article.published_at} format="time" className="card-time" />
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
          {article.body && <div className="feed-p hero">{article.body.split('\n').filter((l: string) => !l.startsWith('#')).join(' ').slice(0, 280)}</div>}
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
        <TimeDisplay iso={article.published_at} format="time" className="feed-time" />
        <span className="feed-dot" />
      </div>
      <div className="feed-content">
        <Meta />
        <div className="feed-h">{article.headline}</div>
        {article.body && <div className="feed-p">{article.body.split('\n').filter((l: string) => !l.startsWith('#')).join(' ').slice(0, 160)}</div>}
        <div className="feed-foot">
          <span className="read-btn">{t.feed.readMore}</span>
          <Tags />
        </div>
      </div>
    </Link>
  )
}
