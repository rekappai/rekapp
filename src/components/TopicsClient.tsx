'use client'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

export default function TopicsClient({ lang, activeTag, topics }: { lang: Lang; activeTag?: string; topics: { slug: string; label: string }[] }) {
  const router = useRouter()
  return (
    <div className="topics-cloud">
      {topics.map(({ slug, label }) => (
        <button key={slug} className={'topic-pill' + (activeTag === slug ? ' active' : '')}
          onClick={() => router.push(slug === activeTag ? '/' + lang + '/topics' : '/' + lang + '/topics?tag=' + slug)}>
          {label}
        </button>
      ))}
    </div>
  )
}
