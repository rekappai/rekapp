'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

type Mover = {
  symbol: string
  name: string
  change_pct: number
  price: number
  article_slug?: string | null
}

const EXPLAINER_RISERS: Record<string, (index: string) => string> = {
  en: (idx) => `${idx} constituents with the largest percentage gains in today's session. Significant moves often follow earnings surprises, analyst upgrades, or broader sector catalysts. A stock appearing here is not a recommendation to buy; it simply means something noteworthy occurred.`,
  it: (idx) => `I titoli del ${idx} con i maggiori rialzi percentuali nella seduta odierna. Movimenti significativi spesso seguono sorprese sugli utili, upgrade degli analisti o catalizzatori settoriali. La presenza di un titolo in questa lista non costituisce una raccomandazione all'acquisto; indica semplicemente che si \u00e8 verificato un evento degno di nota.`,
  fr: (idx) => `Les valeurs du ${idx} affichant les plus fortes hausses en pourcentage lors de la s\u00e9ance du jour. Les mouvements importants font souvent suite \u00e0 des surprises sur les r\u00e9sultats, des rel\u00e8vements d'analystes ou des catalyseurs sectoriels. La pr\u00e9sence d'une valeur ici ne constitue pas une recommandation d'achat ; elle signifie simplement qu'un \u00e9v\u00e9nement notable s'est produit.`,
  es: (idx) => `Los valores del ${idx} con las mayores subidas porcentuales en la sesi\u00f3n de hoy. Los movimientos significativos suelen producirse tras sorpresas en los resultados, mejoras de calificaci\u00f3n de analistas o catalizadores sectoriales. La presencia de un valor aqu\u00ed no constituye una recomendaci\u00f3n de compra; simplemente indica que ha ocurrido algo relevante.`,
}

const EXPLAINER_FALLERS: Record<string, (index: string) => string> = {
  en: (idx) => `${idx} constituents with the steepest percentage declines in today's session. Sharp drops can follow poor earnings, analyst downgrades, or adverse news. Context matters: a 5% fall in a volatile stock is routine, while the same move in a defensive name is unusual.`,
  it: (idx) => `I titoli del ${idx} con le maggiori perdite percentuali nella seduta odierna. Cali significativi possono seguire risultati deludenti, downgrade degli analisti o notizie negative. Il contesto \u00e8 importante: un calo del 5% in un titolo volatile \u00e8 normale, mentre lo stesso movimento in un titolo difensivo \u00e8 insolito.`,
  fr: (idx) => `Les valeurs du ${idx} accusant les plus fortes baisses en pourcentage lors de la s\u00e9ance du jour. Les chutes marqu\u00e9es peuvent faire suite \u00e0 des r\u00e9sultats d\u00e9cevants, des d\u00e9gradations d'analystes ou des nouvelles d\u00e9favorables. Le contexte compte : une baisse de 5 % sur une valeur volatile est courante, tandis que le m\u00eame mouvement sur une valeur d\u00e9fensive est inhabituel.`,
  es: (idx) => `Los valores del ${idx} con las mayores ca\u00eddas porcentuales en la sesi\u00f3n de hoy. Las ca\u00eddas pronunciadas pueden producirse tras resultados decepcionantes, rebajas de calificaci\u00f3n de analistas o noticias adversas. El contexto importa: una ca\u00edda del 5% en un valor vol\u00e1til es habitual, mientras que el mismo movimiento en un valor defensivo resulta inusual.`,
}

const LABELS: Record<string, { risers: string; fallers: string }> = {
  en: { risers: 'Top risers', fallers: 'Top fallers' },
  it: { risers: 'Maggiori rialzi', fallers: 'Maggiori ribassi' },
  fr: { risers: 'Plus fortes hausses', fallers: 'Plus fortes baisses' },
  es: { risers: 'Mayores subidas', fallers: 'Mayores ca\u00eddas' },
}

function MoverRow({ item, lang, currency }: { item: Mover; lang: string; currency: string }) {
  const up = item.change_pct > 0
  const content = (
    <div className="movers-row">
      <div className="movers-left">
        <span className="movers-sym">{item.symbol}</span>
        <span className="movers-name">{item.name}</span>
      </div>
      <div className="movers-right">
        <span className="movers-price">{currency}{item.price.toFixed(2)}</span>
        <span className={'movers-pct ' + (up ? 'up' : 'dn')}>
          {up ? '+' : '\u2212'}{Math.abs(item.change_pct).toFixed(1)}%
        </span>
      </div>
    </div>
  )

  if (item.article_slug) {
    return <Link href={'/' + lang + '/article/' + item.article_slug} style={{ textDecoration: 'none' }}>{content}</Link>
  }
  return content
}

function MoversCard({ title, colorClass, items, explainerFn, indexName, lang, currency }: {
  title: string
  colorClass: string
  items: Mover[]
  explainerFn: (index: string) => string
  indexName: string
  lang: string
  currency: string
}) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return null

  return (
    <div className="movers-card">
      <div className="movers-hdr">
        <span className={'movers-lbl ' + colorClass}>{title}</span>
        <button
          className={'movers-pill' + (open ? ' open' : '')}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle explainer"
        >?</button>
      </div>
      <div className={'movers-explainer' + (open ? ' show' : '')}>
        <div className="movers-explainer-inner">{explainerFn(indexName)}</div>
      </div>
      {items.map(item => (
        <MoverRow key={item.symbol} item={item} lang={lang} currency={currency} />
      ))}
    </div>
  )
}

export default function MarketMovers({ risers, fallers, indexName, lang, currency }: {
  risers: Mover[]
  fallers: Mover[]
  indexName: string
  lang: Lang
  currency: string
}) {
  const labels = LABELS[lang] || LABELS.en
  const riserExplainer = EXPLAINER_RISERS[lang] || EXPLAINER_RISERS.en
  const fallerExplainer = EXPLAINER_FALLERS[lang] || EXPLAINER_FALLERS.en

  if (risers.length === 0 && fallers.length === 0) return null

  return (
    <div className="movers-grid">
      <MoversCard
        title={labels.risers}
        colorClass="up"
        items={risers}
        explainerFn={riserExplainer}
        indexName={indexName}
        lang={lang}
        currency={currency}
      />
      <MoversCard
        title={labels.fallers}
        colorClass="dn"
        items={fallers}
        explainerFn={fallerExplainer}
        indexName={indexName}
        lang={lang}
        currency={currency}
      />
    </div>
  )
}
