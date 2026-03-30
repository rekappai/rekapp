'use client'
import { useState, useEffect } from 'react'
import type { Lang } from '@/lib/i18n'

export default function ArticleTOCSidebar({
  lang,
  hasExplainer,
}: {
  lang: Lang
  hasExplainer: boolean
}) {
  const [active, setActive] = useState<'recap' | 'explainer'>('recap')

  const labels = {
    recap:     lang === 'it' ? 'Notizia'        : 'News Recap',
    explainer: lang === 'it' ? 'Cosa significa' : 'What Does It Mean',
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id as 'recap' | 'explainer')
        })
      },
      { threshold: 0.3 }
    )
    const recap = document.getElementById('recap')
    const explainer = document.getElementById('explainer')
    if (recap) observer.observe(recap)
    if (explainer) observer.observe(explainer)
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: 'recap' | 'explainer') => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  if (!hasExplainer) return null

  return (
    <div className="art-toc-sb">
      <div className="art-sb-lbl">{lang === 'it' ? 'In questo articolo' : 'In this article'}</div>
      {(['recap', 'explainer'] as const).map(id => (
        <button
          key={id}
          className={'art-toc-sb-item' + (active === id ? ' active' : '')}
          onClick={() => scrollTo(id)}
        >
          <span className="art-toc-sb-dot" />
          <span className="art-toc-sb-label">{labels[id]}</span>
        </button>
      ))}
    </div>
  )
}
