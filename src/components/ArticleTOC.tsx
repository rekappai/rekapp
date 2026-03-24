'use client'
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import type { Lang } from '@/lib/i18n'

function renderBody(text: string) {
  // First, ensure ## headings are always on their own line
  // Handle cases where Gemini puts heading and paragraph on same line
  const normalised = text
    .replace(/(##[^\n]+)\n?([^#\n])/g, '$1\n\n$2')  // ensure blank line after heading
    .replace(/([^\n])(##)/g, '$1\n\n$2')               // ensure blank line before heading

  const blocks = normalised.split('\n\n').filter(Boolean)
  const elements: React.ReactNode[] = []

  blocks.forEach((block, i) => {
    const trimmed = block.trim()
    if (trimmed.startsWith('#')) {
      elements.push(
        <h2 key={i} className="art-subhead">
          {trimmed.replace(/^#+\s*/, '')}
        </h2>
      )
    } else if (trimmed) {
      elements.push(<p key={i}>{trimmed}</p>)
    }
  })

  return elements
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
