'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'
import { useAltSlug } from '@/lib/AltSlugContext'

export default function Header({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const pathname = usePathname()
  const [mob, setMob] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { altHref } = useAltSlug()

  const allLangs: { code: Lang; flag: string; label: string }[] = [
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'it', flag: '🇮🇹', label: 'IT' },
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
  ]
  const otherLangs = allLangs.filter(l => l.code !== lang)
  const other = otherLangs[0].code
  const curLang = allLangs.find(l => l.code === lang)!
  const curFlag = curLang.flag

  // Use altHref if on article page, otherwise swap lang prefix
  const switchPath = altHref ?? pathname.replace('/' + lang, '/' + other)

  const nav = [
    { href: '/' + lang,              label: t.nav.feed },
    { href: '/' + lang + '/markets', label: t.nav.markets },
    { href: '/' + lang + '/topics',  label: t.nav.topics },
    { href: '/' + lang + '/archive', label: t.nav.archive },
    { href: '/' + lang + '/search',  label: t.nav.search },
  ]

  const isActive = (href: string) =>
    href === '/' + lang ? pathname === '/' + lang : pathname.startsWith(href)

  return (
    <>
      <header>
        <div className="header-inner">
          <button className={'hamburger' + (mob ? ' open' : '')} onClick={() => setMob(o => !o)} aria-label="Menu">
            <span /><span />
          </button>

          <Link href={'/' + lang} className="logo" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            Rek<span>app</span>
          </Link>

          <nav className="nav-primary">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={'nav-item' + (isActive(item.href) ? ' active' : '')}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-right">
            <div className="lang-wrap">
              <button className={'lang-btn' + (langOpen ? ' open' : '')} onClick={() => setLangOpen(o => !o)}>
                <span>{curFlag}</span>
                <span>{lang.toUpperCase()}</span>
                <span className="lang-caret">&#9660;</span>
              </button>
              {langOpen && (
                <div className="lang-drop open">
                  <Link href={switchPath} className="lang-opt" onClick={() => setLangOpen(false)}>
                    {otherFlag} {otherLabel}
                  </Link>
                </div>
              )}
            </div>
            <div className="live-badge"><span className="live-dot" />Live</div>
          </div>
        </div>
      </header>

      {mob && (
        <div className="mob-drawer open">
          <div className="mob-section">
            <div className="mob-section-head">Navigation</div>
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={'mob-row' + (isActive(item.href) ? ' active' : '')} onClick={() => setMob(false)}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mob-section">
            <div className="mob-section-head">Language / Lingua</div>
            <div className="mob-lang-pills">
              <Link href={switchPath} className="mob-pill" onClick={() => setMob(false)}>
                {otherFlag} {otherLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
