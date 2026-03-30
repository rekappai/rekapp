'use client'

import { useEffect, useRef, useState } from 'react'
import { type Lang, useTranslations } from '@/lib/i18n'
import { COUNTRIES } from '@/lib/countries'
import Link from 'next/link'

// ISO 3166-1 numeric → country code mapping for our markets
const ISO_TO_CODE: Record<number, string> = {
  840: 'us',
  380: 'it',
  250: 'fr',
  826: 'uk',
  276: 'de',
  724: 'es',
  76: 'br',
  392: 'jp',
}

type MarketInfo = {
  code: string
  name: string
  index: string
  flag: string
  hours: string
  timezone: string
  open: number
  close: number
  active: boolean
  currency: string
}

const MARKET_DATA: Record<string, MarketInfo> = {
  us: { code: 'us', name: 'United States', index: 'S&P 500', flag: '🇺🇸', hours: '9:30 - 16:00 ET', timezone: 'America/New_York', open: 9.5, close: 16, active: true, currency: '$' },
  it: { code: 'it', name: 'Italy', index: 'FTSE MIB', flag: '🇮🇹', hours: '9:00 - 17:30 CET', timezone: 'Europe/Rome', open: 9, close: 17.5, active: true, currency: '€' },
  fr: { code: 'fr', name: 'France', index: 'CAC 40', flag: '🇫🇷', hours: '9:00 - 17:30 CET', timezone: 'Europe/Paris', open: 9, close: 17.5, active: true, currency: '€' },
  uk: { code: 'uk', name: 'United Kingdom', index: 'FTSE 100', flag: '🇬🇧', hours: '8:00 - 16:30 GMT', timezone: 'Europe/London', open: 8, close: 16.5, active: false, currency: '£' },
  de: { code: 'de', name: 'Germany', index: 'DAX 40', flag: '🇩🇪', hours: '9:00 - 17:30 CET', timezone: 'Europe/Berlin', open: 9, close: 17.5, active: false, currency: '€' },
  es: { code: 'es', name: 'Spain', index: 'IBEX 35', flag: '🇪🇸', hours: '9:00 - 17:30 CET', timezone: 'Europe/Madrid', open: 9, close: 17.5, active: false, currency: '€' },
  br: { code: 'br', name: 'Brazil', index: 'Bovespa', flag: '🇧🇷', hours: '10:00 - 17:00 BRT', timezone: 'America/Sao_Paulo', open: 10, close: 17, active: false, currency: 'R$' },
  jp: { code: 'jp', name: 'Japan', index: 'Nikkei 225', flag: '🇯🇵', hours: '9:00 - 15:00 JST', timezone: 'Asia/Tokyo', open: 9, close: 15, active: false, currency: '¥' },
}

function getMarketStatus(m: MarketInfo): 'open' | 'closed' | 'soon' {
  if (!m.active) return 'soon'
  try {
    const now = new Date()
    const local = new Date(now.toLocaleString('en-US', { timeZone: m.timezone }))
    const day = local.getDay()
    const time = local.getHours() + local.getMinutes() / 60
    if (day === 0 || day === 6) return 'closed'
    return (time >= m.open && time < m.close) ? 'open' : 'closed'
  } catch {
    return 'closed'
  }
}

type IndexData = {
  country: string
  price?: number
  change_pct?: number
  currency: string
}

type SelectedMarket = {
  market: MarketInfo
  status: 'open' | 'closed' | 'soon'
  indexData?: IndexData
  latest?: string
}

export default function MarketMap({ lang, latestHeadlines }: { lang: Lang; latestHeadlines?: Record<string, string> }) {
  const t = useTranslations(lang)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<SelectedMarket | null>(null)
  const [indexPerf, setIndexPerf] = useState<IndexData[]>([])
  const [loaded, setLoaded] = useState(false)
  const svgRef = useRef<any>(null)
  const gRef = useRef<any>(null)

  // Fetch index performance data
  useEffect(() => {
    fetch('/api/index-performance')
      .then(r => r.json())
      .then(data => setIndexPerf(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    Promise.all([
      import('d3'),
      import('topojson-client'),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json()),
    ]).then(([d3, topojson, world]) => {
      if (cancelled) return

      const container = containerRef.current!
      const W = 960
      const H = 500

      const countries = topojson.feature(world, world.objects.countries) as any
      const proj = d3.geoMercator().center([15, 30]).scale(150).translate([W / 2, H / 2])
      const path = d3.geoPath().projection(proj)

      const svg = d3.select(container).append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .style('display', 'block')
        .style('cursor', 'grab')

      svg.on('mousedown', () => svg.style('cursor', 'grabbing'))
      svg.on('mouseup', () => svg.style('cursor', 'grab'))

      svgRef.current = svg
      svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0d0c0b')

      const g = svg.append('g')
      gRef.current = g

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .on('zoom', (ev) => {
          g.attr('transform', ev.transform.toString())
          g.selectAll('.map-label').attr('transform', function () {
            const el = this as any
            const cx = el.getAttribute('data-cx')
            const cy = el.getAttribute('data-cy')
            if (!cx || !cy) return ''
            const s = 1 / ev.transform.k
            return `translate(${cx},${cy}) scale(${s})`
          })
          g.selectAll('path').each(function (d: any) {
            const self = this as any;
            const code = ISO_TO_CODE[+d?.id]
            const base = code ? 0.8 : 0.4
            d3.select(self).attr('stroke-width', base / ev.transform.k)
          })
        })

      svg.call(zoom as any)

      // Start zoomed into Europe (where most markets are)
      const isMobile = window.innerWidth < 768
      const europeTransform = isMobile
        ? d3.zoomIdentity.translate(-700, -280).scale(3.5)
        : d3.zoomIdentity.translate(-580, -220).scale(2.5)
      svg.call(zoom.transform as any, europeTransform)

      // Zoom controls
      const ziBtn = document.getElementById('map-zi')
      const zoBtn = document.getElementById('map-zo')
      const zrBtn = document.getElementById('map-zr')
      if (ziBtn) ziBtn.addEventListener('click', () => svg.transition().duration(300).call(zoom.scaleBy as any, 1.5))
      if (zoBtn) zoBtn.addEventListener('click', () => svg.transition().duration(300).call(zoom.scaleBy as any, 0.67))
      if (zrBtn) zrBtn.addEventListener('click', () => svg.transition().duration(300).call(zoom.transform as any, d3.zoomIdentity))

      // Draw countries
      g.selectAll('path')
        .data(countries.features)
        .enter().append('path')
        .attr('d', path as any)
        .attr('class', (d: any) => {
          const code = ISO_TO_CODE[+d.id]
          if (!code) return 'map-country'
          const m = MARKET_DATA[code]
          if (!m) return 'map-country'
          const s = getMarketStatus(m)
          return `map-country map-active map-${s}`
        })
        .style('cursor', (d: any) => ISO_TO_CODE[+d.id] ? 'pointer' : 'default')
        .on('click', (ev: any, d: any) => {
          const code = ISO_TO_CODE[+d.id]
          if (!code) return
          const m = MARKET_DATA[code]
          if (!m) return

          // Hide hint
          const hint = document.getElementById('map-hint')
          if (hint) hint.style.opacity = '0'

          // Highlight
          g.selectAll('path').classed('map-sel', false)
          d3.select(ev.currentTarget).classed('map-sel', true)

          // Show label
          g.selectAll('.map-label').classed('map-label-vis', false)
          g.select(`.map-label[data-cid="${d.id}"]`).classed('map-label-vis', true)

          // Update selected state (React will handle the panel)
          setSelected({
            market: m,
            status: getMarketStatus(m),
          })
        })

      // Labels
      const labelData = countries.features.filter((d: any) => ISO_TO_CODE[+d.id])
      g.selectAll('text.map-label')
        .data(labelData)
        .enter().append('text')
        .attr('class', 'map-label')
        .attr('data-cid', (d: any) => d.id)
        .attr('data-cx', (d: any) => { const c = path.centroid(d as any); return c?.[0] ?? 0 })
        .attr('data-cy', (d: any) => { const c = path.centroid(d as any); return c?.[1] ?? 0 })
        .attr('transform', (d: any) => {
          const c = path.centroid(d as any)
          if (!c || isNaN(c[0])) return ''
          return `translate(${c[0]},${c[1]})`
        })
        .attr('dy', -14)
        .attr('text-anchor', 'middle')
        .style('font-family', "'DM Mono', monospace")
        .style('font-size', '9px')
        .style('letter-spacing', '0.04em')
        .style('fill', '#c8c1b5')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .text((d: any) => {
          const code = ISO_TO_CODE[+d.id]
          return code ? MARKET_DATA[code]?.index ?? '' : ''
        })

      setLoaded(true)

      // Update statuses every minute
      const interval = setInterval(() => {
        g.selectAll('path').attr('class', (d: any) => {
          const code = ISO_TO_CODE[+d?.id]
          if (!code) return 'map-country'
          const m = MARKET_DATA[code]
          if (!m) return 'map-country'
          const s = getMarketStatus(m)
          let cl = `map-country map-active map-${s}`
          if (d3.select(`path[class*="map-sel"]`).datum() === d) cl += ' map-sel'
          return cl
        })
      }, 60000)

      return () => clearInterval(interval)
    })

    return () => { cancelled = true }
  }, [])

  // Resolve selected market data
  const selectedIndex = selected ? indexPerf.find(d => d.country === selected.market.code) : null
  const selectedLatest = selected ? latestHeadlines?.[selected.market.code] : null

  const hintText = lang === 'it' ? 'Tocca un paese evidenziato per esplorare'
    : lang === 'fr' ? 'Cliquez sur un pays en surbrillance'
    : 'Click a highlighted country to explore'

  const soonText = lang === 'it' ? 'La copertura è in arrivo.'
    : lang === 'fr' ? 'La couverture arrive bientôt.'
    : 'Coverage is coming soon.'

  const latestLabel = lang === 'it' ? 'Ultima notizia' : lang === 'fr' ? 'Dernière actu' : 'Latest'
  const hoursLabel = lang === 'it' ? 'Orari' : lang === 'fr' ? 'Horaires' : 'Hours'
  const closeLabel = lang === 'it' ? 'Ultima chiusura' : lang === 'fr' ? 'Dernière clôture' : 'Last close'
  const changeLabel = lang === 'it' ? 'Variazione' : lang === 'fr' ? 'Variation' : 'Change'

  return (
    <div className="market-map-wrap">
      <div className="market-map-container" ref={containerRef}>
        {!loaded && (
          <div className="market-map-loading">
            {lang === 'it' ? 'Caricamento mappa...' : lang === 'fr' ? 'Chargement...' : 'Loading map...'}
          </div>
        )}
        <div className="market-map-zoom" style={{ display: loaded ? 'flex' : 'none' }}>
          <button className="market-map-zoom-btn" id="map-zi">+</button>
          <button className="market-map-zoom-btn" id="map-zo">-</button>
          <button className="market-map-zoom-btn" id="map-zr" style={{ fontSize: '10px', marginTop: 4 }}>R</button>
        </div>
        {loaded && !selected && (
          <div className="market-map-hint" id="map-hint">{hintText}</div>
        )}
      </div>

      {selected && (
        <div className="market-map-panel">
          <div className="mmp-top">
            <span className="mmp-name">{selected.market.flag} {selected.market.name}</span>
            <span className="mmp-idx">{selected.market.index}</span>
            <span className={`mmp-status ${selected.status}`}>
              {selected.status === 'soon'
                ? (lang === 'it' ? 'Prossimamente' : lang === 'fr' ? 'Bientôt' : 'Coming soon')
                : selected.status === 'open'
                  ? (lang === 'it' ? 'Aperto' : lang === 'fr' ? 'Ouvert' : 'Open')
                  : (lang === 'it' ? 'Chiuso' : lang === 'fr' ? 'Fermé' : 'Closed')
              }
            </span>
          </div>

          {selected.market.active ? (
            <>
              <div className="mmp-grid">
                <div className="mmp-cell">
                  <div className="mmp-cell-lbl">{hoursLabel}</div>
                  <div className="mmp-cell-val">{selected.market.hours}</div>
                </div>
                <div className="mmp-cell">
                  <div className="mmp-cell-lbl">{closeLabel}</div>
                  <div className="mmp-cell-val">
                    {selectedIndex?.price
                      ? `${selected.market.currency}${Number(selectedIndex.price).toLocaleString()}`
                      : '--'}
                  </div>
                </div>
                <div className="mmp-cell">
                  <div className="mmp-cell-lbl">{changeLabel}</div>
                  <div className={`mmp-cell-val ${selectedIndex?.change_pct != null ? (selectedIndex.change_pct >= 0 ? 'up' : 'dn') : ''}`}>
                    {selectedIndex?.change_pct != null
                      ? `${selectedIndex.change_pct >= 0 ? '+' : ''}${selectedIndex.change_pct.toFixed(2)}%`
                      : '--'}
                  </div>
                </div>
              </div>
              {selectedLatest && (
                <Link href={`/${lang}/markets/${selected.market.code}`} className="mmp-story">
                  <span className="mmp-story-lbl">{latestLabel}</span>
                  <span className="mmp-story-txt">{selectedLatest}</span>
                  <span className="mmp-story-arrow">&rarr;</span>
                </Link>
              )}
            </>
          ) : (
            <div className="mmp-soon">
              {selected.market.index} {soonText} {hoursLabel}: {selected.market.hours}
            </div>
          )}
        </div>
      )}

      <div className="market-map-legend">
        <span className="mml-item"><span className="mml-dot mml-open"></span>{lang === 'it' ? 'Aperto' : lang === 'fr' ? 'Ouvert' : 'Open'}</span>
        <span className="mml-item"><span className="mml-dot mml-closed"></span>{lang === 'it' ? 'Chiuso' : lang === 'fr' ? 'Fermé' : 'Closed'}</span>
        <span className="mml-item"><span className="mml-dot mml-soon"></span>{lang === 'it' ? 'Prossimamente' : lang === 'fr' ? 'Bientôt' : 'Coming soon'}</span>
      </div>
    </div>
  )
}
