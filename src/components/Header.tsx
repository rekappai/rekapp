'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Header({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const pathname = usePathname()
  const [mobOpen, setMobOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const otherLang = lang === 'en' ? 'it' : 'en'
  const otherLangLabel = lang === 'en' ? '🇮🇹 IT' : '🇬🇧 EN'
  const currentFlag = lang === 'en' ? '🇬🇧' : '🇮🇹'
  const switchLangPath = pathname.replace(`/${lang}`, `/${otherLang}`)

  const navItems = [
    { href: `/${lang}`,         label: t.nav.feed },
    { href: `/${lang}/markets`, label: t.nav.markets },
    { href: `/${lang}/topics`,  label: t.nav.topics },
    { href: `/${lang}/archive`, label: t.nav.archive },
    { href: `/${lang}/search`,  label: t.nav.search },
  ]

  const isActive = (href: string) =>
    href === `/${lang}` ? pathname === `/${lang}` : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-50 h-[52px] flex items-center px-[--pad] gap-4 border-b border-[--ink-border] bg-[rgba(13,12,11,0.96)] backdrop-blur-md">
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 p-1 shrink-0"
          onClick={() => setMobOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`block h-px bg-[--text-dim] transition-all duration-200 ${mobOpen ? 'w-[18px] rotate-45 translate-y-[6px]' : 'w-[20px]'}`} />
          <span className={`block h-px bg-[--text-dim] transition-all duration-200 ${mobOpen ? 'w-[18px] -rotate-45' : 'w-[14px]'}`} />
        </button>

        <Link
          href={`/${lang}`}
          className="font-[family-name:var(--font-playfair)] text-[1.3rem] font-semibold tracking-tight text-[--text] shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          Rek<span className="text-[--gold]">app</span>
        </Link>

        <nav className="hidden md:flex items-stretch h-full ml-8">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 h-full font-[family-name:var(--font-dm-mono)] text-[0.6rem] tracking-[0.1em] uppercase border-b-2 transition-colors whitespace-nowrap
                ${isActive(item.href) ? 'text-[--text] border-[--gold]' : 'text-[--text-dim] border-transparent hover:text-[--text]'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className={`flex items-center gap-1.5 px-[10px] py-[5px] border font-[family-name:var(--font-dm-mono)] text-[0.6rem] tracking-[0.1em] transition-all
                ${langOpen ? 'text-[--gold] border-[--gold-border]' : 'text-[--text-dim] border-[--ink-border] hover:text-[--gold] hover:border-[--gold-border]'}`}
            >
              <span>{currentFlag}</span>
              <span>{lang.toUpperCase()}</span>
              <span className={`text-[0.45rem] opacity-50 transition-transform ${langOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {langOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 min-w-[140px] bg-[--ink-raised] border border-[--ink-border] z-[600]">
                <Link
                  href={switchLangPath}
                  onClick={() => setLangOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 font-[family-name:var(--font-dm-mono)] text-[0.62rem] text-[--text-dim] hover:bg-[--ink-hover] hover:text-[--text] transition-colors"
                >
                  {otherLangLabel}
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-[9px] py-1 border border-[--gold-border] font-[family-name:var(--font-dm-mono)] text-[0.58rem] tracking-[0.1em] text-[--gold]">
            <span className="w-[5px] h-[5px] rounded-full bg-[--gold] animate-pulse" />
            Live
          </div>
        </div>
      </header>

      {mobOpen && (
        <div className="fixed top-[52px] left-0 right-0 bottom-0 bg-[--ink-raised] z-40 overflow-y-auto md:hidden">
          <div className="border-b border-[--ink-border]">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobOpen(false)}
                className={`flex items-center px-[--pad] py-3.5 font-[family-name:var(--font-dm-mono)] text-[0.65rem] tracking-[0.1em] uppercase border-t border-[--ink-border] transition-colors
                  ${isActive(item.href) ? 'text-[--gold]' : 'text-[--text-dim] hover:text-[--text]'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="px-[--pad] py-4">
            <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.16em] uppercase text-[--gold] mb-3">
              Language / Lingua
            </div>
            <Link
              href={switchLangPath}
              onClick={() => setMobOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[--ink-border] font-[family-name:var(--font-dm-mono)] text-[0.6rem] text-[--text-dim] hover:text-[--gold] hover:border-[--gold-border] transition-all"
            >
              {otherLangLabel}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
