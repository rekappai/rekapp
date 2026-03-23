'use client'

import { useRouter } from 'next/navigation'
import { type Lang } from '@/lib/i18n'

export default function TopicsClient({
  lang,
  activeTag,
  topics,
}: {
  lang: Lang
  activeTag?: string
  topics: { slug: string; label: string }[]
}) {
  const router = useRouter()
  const select = (slug: string) => {
    router.push(slug === activeTag ? `/${lang}/topics` : `/${lang}/topics?tag=${slug}`)
  }
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map(({ slug, label }) => (
        <button
          key={slug}
          onClick={() => select(slug)}
          className={`font-[family-name:var(--font-dm-mono)] text-[0.6rem] tracking-[0.06em] px-3.5 py-2 border transition-all
            ${activeTag === slug
              ? 'text-[--gold] border-[--gold-border] bg-[rgba(196,162,94,0.06)]'
              : 'text-[--text-dim] border-[--ink-border] hover:text-[--gold] hover:border-[--gold-border]'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
