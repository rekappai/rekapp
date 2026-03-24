'use client'
import { useState, useEffect, useRef } from 'react'
import type { Lang } from '@/lib/i18n'

export default function ArticleTOC({
  lang,
  recapBody,
  explainerBody,
}: {
  lang: Lang
  recapBody: string
  explainerBody: string | null
}) {
  const [active, setActive] = useState<'recap' | 'explainer'>('recap')
  const recapRef = useRef<HTMLDivElement>(null)
  const explainerRef = useRef<HTMLDivElement>(null)

  const labels = {
    recap:     lang === 'it' ? 'Notizia'        : 'News Recap',
    explainer: lang === 'it' ? 'Cosa significa' : 'What Does It Mean',
  }

  // Desktop: track scroll to highlight active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActive(e.target.id as 'recap' | 'explainer')
          }
        })
      },
      { threshold: 0.3 }
    )
    if (recapRef.current)    observer.observe(recapRef.current)
    if (explainerRef.current) observer.observe(explainerRef.current)
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: 'recap' | 'explainer') => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <>
      {/* ── Mobile: horizontal tab bar ── */}
      {explainerBody && (
        <div className="art-toc-mob">
          <button
            className={'art-toc-mob-btn' + (active === 'recap' ? ' active' : '')}
            onClick={() => setActive('recap')}
          >
            <span className="art-toc-dot" />
            {labels.recap}
          </button>
          <button
            className={'art-toc-mob-btn' + (active === 'explainer' ? ' active' : '')}
            onClick={() => setActive('explainer')}
          >
            <span className="art-toc-dot" />
            {labels.explainer}
          </button>
        </div>
      )}

      {/* ── Article body ── */}
      {/* On mobile, show/hide sections based on active tab */}
      {/* On desktop, show both sections stacked */}
      <div
        id="recap"
        ref={recapRef}
        className={'art-toc-section' + (active === 'recap' ? ' active' : '')}
      >
        <div className="art-body">
          {recapBody.split('\n\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      {explainerBody && (
        <div
          id="explainer"
          ref={explainerRef}
          className={'art-toc-section' + (active === 'explainer' ? ' active' : '')}
        >
          {/* Desktop: show the gold divider heading */}
          <div className="expl-head desktop-only">
            <span className="expl-lbl">{labels.explainer}</span>
            <div className="expl-line" />
          </div>
          <div className="art-body">
            {explainerBody.split('\n\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}

      {/* Desktop TOC — rendered in sidebar via slot, passed as prop to parent */}
    </>
  )
}
