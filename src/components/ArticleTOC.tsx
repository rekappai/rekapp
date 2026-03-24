'use client'
import { useState, useEffect, useRef } from 'react'
import type { Lang } from '@/lib/i18n'

function renderBody(text: string) {
  // Split on double newlines, then check each block
  return text.split('\n\n').filter(Boolean).map((block, i) => {
    const trimmed = block.trim()
    if (trimmed.startsWith('## ')) {
      // Render as h2
      return (
        <h2 key={i} className="art-subhead">
          {trimmed.slice(3)}
        </h2>
      )
    }
    // Also handle single newline before ##
    if (trimmed.startsWith('#')) {
      return (
        <h2 key={i} className="art-subhead">
          {trimmed.replace(/^#+\s*/, '')}
        </h2>
      )
    }
    return <p key={i}>{trimmed}</p>
  })
}

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id as 'recap' | 'explainer')
        })
      },
      { threshold: 0.3 }
    )
    if (recapRef.current)     observer.observe(recapRef.current)
    if (explainerRef.current) observer.observe(explainerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Mobile tab bar */}
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

      <div
        id="recap"
        ref={recapRef}
        className={'art-toc-section' + (active === 'recap' ? ' active' : '')}
      >
        <div className="art-body">
          {renderBody(recapBody)}
        </div>
      </div>

      {explainerBody && (
        <div
          id="explainer"
          ref={explainerRef}
          className={'art-toc-section' + (active === 'explainer' ? ' active' : '')}
        >
          <div className="expl-head desktop-only">
            <span className="expl-lbl">{labels.explainer}</span>
            <div className="expl-line" />
          </div>
          <div className="art-body">
            {renderBody(explainerBody)}
          </div>
        </div>
      )}
    </>
  )
}
