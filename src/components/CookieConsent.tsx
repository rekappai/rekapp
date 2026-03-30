'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { type Lang } from '@/lib/i18n'

const text = {
  en: {
    message: 'We use cookies to improve your experience and analyse site usage.',
    accept: 'Accept all',
    essential: 'Essential only',
    policy: 'Cookie policy',
  },
  it: {
    message: 'Utilizziamo i cookie per migliorare la tua esperienza e analizzare l\'utilizzo del sito.',
    accept: 'Accetta tutti',
    essential: 'Solo essenziali',
    policy: 'Informativa cookie',
  },
  fr: {
    message: 'Nous utilisons des cookies pour am\u00e9liorer votre exp\u00e9rience et analyser l\'utilisation du site.',
    accept: 'Tout accepter',
    essential: 'Essentiels uniquement',
    policy: 'Politique de cookies',
  },
  es: {
    message: 'Utilizamos cookies para mejorar tu experiencia y analizar el uso del sitio.',
    accept: 'Aceptar todas',
    essential: 'Solo esenciales',
    policy: 'Política de cookies',
  },
}

export default function CookieConsent({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(false)
  const t = text[lang] ?? text.en

  useEffect(() => {
    if (!localStorage.getItem('rek-cookie-consent')) {
      setVisible(true)
    }
  }, [])

  const accept = (choice: 'all' | 'essential') => {
    localStorage.setItem('rek-cookie-consent', choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-inner">
        <p className="cookie-msg">{t.message}</p>
        <div className="cookie-actions">
          <Link href={'/' + lang + '/cookies'} className="cookie-link">{t.policy}</Link>
          <button className="cookie-btn cookie-btn-secondary" onClick={() => accept('essential')}>{t.essential}</button>
          <button className="cookie-btn cookie-btn-primary" onClick={() => accept('all')}>{t.accept}</button>
        </div>
      </div>
    </div>
  )
}
