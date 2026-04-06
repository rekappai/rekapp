'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'
import { useAltSlug } from '@/lib/AltSlugContext'
import LogoTypewriter from './LogoTypewriter'
import ThemeToggle from './ThemeToggle'
import SearchModal from './SearchModal'

const ALL_LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'it', flag: '🇮🇹', label: 'IT' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
    { code: 'es', flag: '🇪🇸', label: 'ES' },
]

export default function Header({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const pathname = usePathname()
  const [mob, setMob] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { altHref, altSlugs } = useAltSlug()

  const curLang = ALL_LANGS.find(l => l.code === lang)!
  const otherLangs = ALL_LANGS.filter(l => l.code !== lang)

  const langPath = (targetLang: string) => {
    if (altSlugs && altSlugs[targetLang]) {
      return altSlugs[targetLang]
    }
    if (altHref) {
      return altHref.replace('/' + lang, '/' + targetLang)
    }
    return pathname.replace('/' + lang, '/' + targetLang)
  }

  const nav = [
    { href: '/' + lang,              label: t.nav.feed },
    { href: '/' + lang + '/markets', label: t.nav.markets },
    { href: '/' + lang + '/topics',  label: t.nav.topics },
    { href: '/' + lang + '/archive', label: t.nav.archive },
]

  
  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
            <LogoTypewriter />
          </Link>

          <nav className="nav-primary">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={'nav-item' + (isActive(item.href) ? ' active' : '')}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-right">
            <button className="search-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>
            <div className="lang-wrap">
              <button className={'lang-btn' + (langOpen ? ' open' : '')} onClick={() => setLangOpen(o => !o)}>
                <span>{curLang.flag}</span>
                <span>{curLang.label}</span>
                <span className="lang-caret">&#9660;</span>
              </button>
              {langOpen && (
                <div className="lang-drop open">
                  {otherLangs.map(ol => (
                    <Link
                      key={ol.code}
                      href={langPath(ol.code)}
                      className="lang-opt"
                      onClick={() => setLangOpen(false)}
                    >
                      {ol.flag} {ol.label}
                    </Link>
                  ))}
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
            <div className="mob-section-head">Language / Lingua / Langue</div>
            <div className="mob-lang-pills">
              {otherLangs.map(ol => (
                <Link
                  key={ol.code}
                  href={langPath(ol.code)}
                  className="mob-pill"
                  onClick={() => setMob(false)}
                >
                  {ol.flag} {ol.label}
                </Link>
              ))}
            </div>
          </div>
                    <div className="mob-section">
            <button
              className="mob-row search-mob-row"
              onClick={() => { setMob(false); setSearchOpen(true) }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <circle cx="11" cy="11" r="7" /><line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
              {t.nav.search || 'Search'}
            </button>
          </div>
          <div className="mob-drawer-bottom">
            <div className="drawer-theme-row">
              <span className="drawer-theme-label">
                {({ en: 'Theme', it: 'Tema', fr: 'Thème', es: 'Tema' }[lang] || 'Theme')}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
      <SearchModal lang={lang} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
