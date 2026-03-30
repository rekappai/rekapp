import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

type RelatedArticle = {
  meta_slug: string
  headline: string
  symbol?: string | null
  direction?: string | null
  change_pct?: number | null
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
          const up = a.direction === 'up'
          return (
            <Link key={a.meta_slug} href={'/' + lang + '/article/' + a.meta_slug} className="related-card">
              <div className="related-meta">
                {a.symbol && <span className="ticker-badge">{a.symbol}</span>}
                {a.change_pct != null && Number(a.change_pct) !== 0 && (
                  <span className={'chg ' + (up ? 'up' : 'dn')}>
                    {up ? '+' : ''}{Number(a.change_pct).toFixed(1)}%
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
