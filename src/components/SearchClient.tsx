'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function SearchClient({ lang, initialQuery }: { lang: Lang; initialQuery?: string }) {
  const t = useTranslations(lang)
  const router = useRouter()
  const [q, setQ] = useState(initialQuery ?? '')
  const submit = () => { if (q.trim()) router.push('/' + lang + '/search?q=' + encodeURIComponent(q.trim())) }
  return (
    <div className="search-page-box">
      <input className="search-page-input" value={q} placeholder={t.search.placeholder}
        onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="search-page-btn" onClick={submit}>{t.search.go}</button>
    </div>
  )
}
