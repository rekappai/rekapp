'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type Lang, useTranslations } from '@/lib/i18n'

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

const SEARCH_LABELS: Record<string, {
  placeholder: string; cancel: string; noResults: string;
  hint: string; articles: string
}> = {
  en: { placeholder: 'Search by ticker, company, or keyword...', cancel: 'Cancel', noResults: 'No results found. Try a ticker symbol or company name.', hint: 'Min. 2 characters', articles: 'Articles' },
  it: { placeholder: 'Cerca per ticker, azienda o parola chiave...', cancel: 'Annulla', noResults: 'Nessun risultato. Prova con un ticker o il nome dell\'azienda.', hint: 'Min. 2 caratteri', articles: 'Articoli' },
  fr: { placeholder: 'Rechercher par ticker, entreprise ou mot-clé...', cancel: 'Annuler', noResults: 'Aucun résultat. Essayez un ticker ou un nom d\'entreprise.', hint: 'Min. 2 caractères', articles: 'Articles' },
  es: { placeholder: 'Buscar por ticker, empresa o palabra clave...', cancel: 'Cancelar', noResults: 'Sin resultados. Prueba con un ticker o nombre de empresa.', hint: 'Mín. 2 caracteres', articles: 'Artículos' },
}

function timeAgo(iso: string, lang: string): string {
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const labels = SEARCH_LABELS[lang] || SEARCH_LABELS.en

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setActiveIdx(-1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Debounced search
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

  return (
    <>
      {/* Backdrop — desktop only */}
      <div className="search-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="search-modal">
        {/* Input bar */}
        <div className="search-modal-bar">
          <svg className="search-modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="16.65" y1="16.65" x2="21" y2="21" />
          </svg>
          <input
            ref={inputRef}
            className="search-modal-input"
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="search-modal-close" onClick={onClose}>{labels.cancel}</button>
        </div>

        {/* Results */}
        <div className="search-modal-results">
          {query.length >= 2 && results.length > 0 && (
            <>
              <div className="search-modal-section">{labels.articles}</div>
              {results.map((r, i) => {
                const up = r.direction === 'up'
                return (
                  <div
                    key={r.id}
                    className={'search-modal-item' + (i === activeIdx ? ' active' : '')}
                    onClick={() => navigate(r.meta_slug)}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    {r.symbol && <span className="search-modal-ticker">{r.symbol}</span>}
                    <div className="search-modal-body">
                      <div className="search-modal-headline">{r.headline}</div>
                      <div className="search-modal-meta">
                        {r.change_pct != null && r.change_pct !== 0 && (
                          <span className={'search-modal-chg ' + (up ? 'up' : 'dn')}>
                            {up ? '+' : ''}{Number(r.change_pct).toFixed(1)}%
                          </span>
                        )}
                        <span className="search-modal-time">{timeAgo(r.published_at, lang)}</span>
                        {r.country_code && <span className="search-modal-market">{r.country_code.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="search-modal-empty">{labels.noResults}</div>
          )}
          {query.length >= 2 && loading && results.length === 0 && (
            <div className="search-modal-empty" style={{ color: 'var(--text-dim)' }}>...</div>
          )}
          {query.length < 2 && query.length > 0 && (
            <div className="search-modal-empty">{labels.hint}</div>
          )}
        </div>

        {/* Desktop keyboard hints */}
        <div className="search-modal-hints">
          <kbd>↵</kbd> open &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd> navigate &nbsp;·&nbsp; <kbd>esc</kbd> close
        </div>
      </div>
    </>
  )
}
