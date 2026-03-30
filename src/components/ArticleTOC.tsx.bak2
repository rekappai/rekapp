'use client'
import React, { useState, useEffect, useRef } from 'react'
import type { Lang } from '@/lib/i18n'

function renderBody(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let paraLines: string[] = []
  let key = 0

  const flushPara = () => {
    const para = paraLines.join(' ').trim()
    if (para) elements.push(<p key={key++}>{para}</p>)
    paraLines = []
  }

  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.match(/^#{1,3}\s+/)) {
      flushPara()
      const heading = trimmed.replace(/^#{1,3}\s+/, '')
      if (heading) elements.push(<h2 key={key++} className="art-subhead">{heading}</h2>)
    } else if (trimmed === '') {
      flushPara()
    } else {
      paraLines.push(trimmed)
    }
  })

  flushPara()
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
