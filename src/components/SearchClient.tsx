'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function SearchClient({ lang, initialQuery }: { lang: Lang; initialQuery?: string }) {
  const t = useTranslations(lang)
  const router = useRouter()
  const [q, setQ] = useState(initialQuery ?? '')

  const submit = () => {
    if (q.trim()) router.push(`/${lang}/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="flex max-w-[560px] border border-[--ink-border] bg-[--ink-raised]">
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={t.search.placeholder}
        className="flex-1 bg-transparent border-none px-3 py-3 text-[0.88rem] text-[--text] placeholder:text-[--text-dim] outline-none"
      />
      <button
        onClick={submit}
        className="border-l border-[--ink-border] px-3 font-[family-name:var(--font-dm-mono)] text-[0.56rem] tracking-[0.1em] uppercase text-[--text-dim] hover:text-[--gold] transition-colors"
      >
        {t.search.go}
      </button>
    </div>
  )
}
