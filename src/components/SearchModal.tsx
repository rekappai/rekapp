'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type Lang } from '@/lib/i18n'

type SearchResult = {
  id: string
  headline: string
  meta_slug: string
  published_at: string
  direction: string | null
  change_pct: number | null
  country_code: string
  symbol: string | null
  company_name: string | null
}

const LABELS: Record<string, {
  placeholder: string; placeholderShort: string; cancel: string; noResults: string;
  hint: string; articles: string
}> = {
  en: { placeholder: 'Search by ticker, company, or keyword...', placeholderShort: 'Search...', cancel: 'Cancel', noResults: 'No results found. Try a ticker symbol or company name.', hint: 'Min. 2 characters', articles: 'Articles' },
  it: { placeholder: 'Cerca per ticker, azienda o parola chiave...', placeholderShort: 'Cerca...', cancel: 'Annulla', noResults: 'Nessun risultato. Prova con un ticker o il nome dell\'azienda.', hint: 'Min. 2 caratteri', articles: 'Articoli' },
  fr: { placeholder: 'Rechercher par ticker, entreprise ou mot-clé...', placeholderShort: 'Rechercher...', cancel: 'Annuler', noResults: 'Aucun résultat. Essayez un ticker ou un nom d\'entreprise.', hint: 'Min. 2 caractères', articles: 'Articles' },
  es: { placeholder: 'Buscar por ticker, empresa o palabra clave...', placeholderShort: 'Buscar...', cancel: 'Cancelar', noResults: 'Sin resultados. Prueba con un ticker o nombre de empresa.', hint: 'Mín. 2 caracteres', articles: 'Artículos' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export default function SearchModal({ lang, isOpen, onClose }: { lang: Lang; isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const labels = LABELS[lang] || LABELS.en
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setActiveIdx(-1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Close on click outside (desktop)
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid closing on the same click that opened it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [isOpen, onClose])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [lang])

  const handleInput = (val: string) => {
    setQuery(val)
    setActiveIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      setLoading(true)
      debounceRef.current = setTimeout(() => doSearch(val), 300)
    } else {
      setResults([])
      setLoading(false)
    }
  }

  const navigate = (slug: string) => {
    onClose()
    router.push('/' + lang + '/article/' + slug)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); return }
    if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault()
      navigate(results[activeIdx].meta_slug)
    }
  }

  if (!isOpen) return null

  const hasResults = query.length >= 2 && results.length > 0
  const showEmpty = query.length >= 2 && !loading && results.length === 0
  const showLoading = query.length >= 2 && loading && results.length === 0
  const showHint = query.length > 0 && query.length < 2

  return (
    <>
      {/* Desktop: backdrop dims the page */}
      <div className="sm-backdrop" onClick={onClose} />

      {/* Mobile: full-screen takeover. Desktop: contained dropdown below header */}
      <div className="sm-wrapper" ref={containerRef}>
        {/* Search input bar */}
        <div className="sm-bar">
          <svg className="sm-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="16.65" y1="16.65" x2="21" y2="21" />
          </svg>
          <input
            ref={inputRef}
            className="sm-bar-input"
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? labels.placeholderShort : labels.placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="sm-bar-close" onClick={onClose}>
            <span className="sm-bar-close-esc">esc</span>
            <span className="sm-bar-close-cancel">{labels.cancel}</span>
          </button>
        </div>

        {/* Results dropdown */}
        {(hasResults || showEmpty || showLoading || showHint) && (
          <div className="sm-results">
            {hasResults && (
              <>
                <div className="sm-section">{labels.articles}</div>
                {results.map((r, i) => {
                  const up = r.direction === 'up'
                  return (
                    <div
                      key={r.id}
                      className={'sm-item' + (i === activeIdx ? ' active' : '')}
                      onClick={() => navigate(r.meta_slug)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      {r.symbol && <span className="sm-ticker">{r.symbol}</span>}
                      <div className="sm-body">
                        <div className="sm-headline">{r.headline}</div>
                        <div className="sm-meta">
                          {r.change_pct != null && r.change_pct !== 0 && (
                            <span className={'sm-chg ' + (up ? 'up' : 'dn')}>
                              {up ? '+' : ''}{Number(r.change_pct).toFixed(1)}%
                            </span>
                          )}
                          <span className="sm-time">{timeAgo(r.published_at)}</span>
                          {r.country_code && <span className="sm-market">{r.country_code.toUpperCase()}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            {showEmpty && <div className="sm-empty">{labels.noResults}</div>}
            {showLoading && <div className="sm-empty">...</div>}
            {showHint && <div className="sm-empty">{labels.hint}</div>}
          </div>
        )}

        {/* Keyboard hints — desktop only */}
        {hasResults && (
          <div className="sm-hints">
            <kbd>↵</kbd> open · <kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>esc</kbd> close
          </div>
        )}
      </div>
    </>
  )
}
