'use client'

import { useState } from 'react'
import { type Lang } from '@/lib/i18n'
import FeedItem from './FeedItem'

interface LoadMoreProps {
  lang: Lang
  initialCount: number
  tag?: string
  pageSize?: number
}

export default function LoadMore({ lang, initialCount, tag, pageSize = 20 }: LoadMoreProps) {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialCount >= pageSize)

  if (!hasMore && articles.length === 0) return null

  const loadMore = async () => {
    setLoading(true)
    const offset = initialCount + articles.length
    const params = new URLSearchParams({
      lang,
      offset: String(offset),
      limit: String(pageSize),
    })
    if (tag) params.set('tag', tag)

    try {
      const res = await fetch('/api/feed?' + params.toString())
      const data = await res.json()
      setArticles(prev => [...prev, ...data.articles])
      setHasMore(data.hasMore)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {articles.map((a: any) => (
        <FeedItem key={a.id} article={a} lang={lang} />
      ))}
      {hasMore && (
        <div className="load-more-wrap">
          <button onClick={loadMore} disabled={loading} className="load-more-btn">
            {loading
              ? (lang === 'it' ? 'Caricamento...' : lang === 'fr' ? 'Chargement...' : 'Loading...')
              : (lang === 'it' ? 'Carica altri articoli' : lang === 'fr' ? 'Charger plus' : 'Load more stories')
            }
          </button>
        </div>
      )}
    </>
  )
}
