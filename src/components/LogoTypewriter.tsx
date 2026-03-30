'use client'

import { useEffect, useRef, useState } from 'react'

export default function LogoTypewriter() {
  const [animated, setAnimated] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const didRun = useRef(false)

  const letters = [
    { ch: 'R', gold: false },
    { ch: 'e', gold: false },
    { ch: 'k', gold: false },
    { ch: 'a', gold: true },
    { ch: 'p', gold: true },
    { ch: 'p', gold: true },
  ]

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    // Only animate once per session
    const key = 'rekapp-logo-animated'
    if (sessionStorage.getItem(key)) {
      setVisibleCount(letters.length)
      setAnimated(true)
      return
    }

    sessionStorage.setItem(key, '1')

    // Stagger each letter
    letters.forEach((_, i) => {
      setTimeout(() => {
        setVisibleCount(i + 1)
        if (i === letters.length - 1) {
          // After last letter, trigger the gold glow pulse
          setTimeout(() => setAnimated(true), 200)
        }
      }, 80 + i * 110)
    })
  }, [])

  return (
    <span className="logo-typewriter" aria-label="Rekapp">
      {letters.map((l, i) => (
        <span
          key={i}
          className={
            'logo-letter' +
            (l.gold ? ' logo-letter-gold' : '') +
            (i < visibleCount ? ' visible' : '') +
            (animated && l.gold ? ' glow' : '')
          }
        >
          {l.ch}
        </span>
      ))}
    </span>
  )
}
