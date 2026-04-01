'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

type Mover = {
  meta_slug: string
  symbol: string
  company_name: string
  direction: string
  change_pct: number
}

const EXPLAINER_RISERS: Record<string, (index: string) => string> = {
  en: (idx) => `${idx} constituents with the largest percentage gains in today's session. Significant moves often follow earnings surprises, analyst upgrades, or broader sector catalysts. A stock appearing here is not a recommendation to buy; it simply means something noteworthy occurred.`,
  it: (idx) => `I titoli del ${idx} con i maggiori rialzi percentuali nella seduta odierna. Movimenti significativi spesso seguono sorprese sugli utili, upgrade degli analisti o catalizzatori settoriali. La presenza di un titolo in questa lista non costituisce una raccomandazione all'acquisto; indica semplicemente che si è verificato un evento degno di nota.`,
  fr: (idx) => `Les valeurs du ${idx} affichant les plus fortes hausses en pourcentage lors de la séance du jour. Les mouvements importants font souvent suite à des surprises sur les résultats, des relèvements d'analystes ou des catalyseurs sectoriels. La présence d'une valeur ici ne constitue pas une recommandation d'achat ; elle signifie simplement qu'un événement notable s'est produit.`,
  es: (idx) => `Los valores del ${idx} con las mayores subidas porcentuales en la sesión de hoy. Los movimientos significativos suelen producirse tras sorpresas en los resultados, mejoras de calificación de analistas o catalizadores sectoriales. La presencia de un valor aquí no constituye una recomendación de compra; simplemente indica que ha ocurrido algo relevante.`,
}

const EXPLAINER_FALLERS: Record<string, (index: string) => string> = {
  en: (idx) => `${idx} constituents with the steepest percentage declines in today's session. Sharp drops can follow poor earnings, analyst downgrades, or adverse news. Context matters: a 5% fall in a volatile stock is routine, while the same move in a defensive name is unusual.`,
  it: (idx) => `I titoli del ${idx} con le maggiori perdite percentuali nella seduta odierna. Cali significativi possono seguire risultati deludenti, downgrade degli analisti o notizie negative. Il contesto è importante: un calo del 5% in un titolo volatile è normale, mentre lo stesso movimento in un titolo difensivo è insolito.`,
  fr: (idx) => `Les valeurs du ${idx} accusant les plus fortes baisses en pourcentage lors de la séance du jour. Les chutes marquées peuvent faire suite à des résultats décevants, des dégradations d'analystes ou des nouvelles défavorables. Le contexte compte : une baisse de 5 % sur une valeur volatile est courante, tandis que le même mouvement sur une valeur défensive est inhabituel.`,
  es: (idx) => `Los valores del ${idx} con las mayores caídas porcentuales en la sesión de hoy. Las caídas pronunciadas pueden producirse tras resultados decepcionantes, rebajas de calificación de analistas o noticias adversas. El contexto importa: una caída del 5% en un valor volátil es habitual, mientras que el mismo movimiento en un valor defensivo resulta inusual.`,
}

const LABELS: Record<string, { risers: string; fallers: string }> = {
  en: { risers: 'Top risers', fallers: 'Top fallers' },
  it: { risers: 'Maggiori rialzi', fallers: 'Maggiori ribassi' },
  fr: { risers: 'Plus fortes hausses', fallers: 'Plus fortes baisses' },
  es: { risers: 'Mayores subidas', fallers: 'Mayores caídas' },
}

function MoverRow({ item, lang }: { item: Mover; lang: string }) {
  const up = item.direction === 'up'
  return (
    <Link href={'/' + lang + '/article/' + item.meta_slug} className="movers-row">
      <div className="movers-left">
        <span className="movers-sym">{item.symbol}</span>
        <span className="movers-name">{item.company_name}</span>
      </div>
      <span className={'movers-pct ' + (up ? 'up' : 'dn')}>
        {up ? '+' : '\u2212'}{Math.abs(item.change_pct).toFixed(1)}%
      </span>
    </Link>
  )
}

function MoversCard({ title, colorClass, items, explainerFn, indexName, lang }: {
  title: string
  colorClass: string
  items: Mover[]
  explainerFn: (index: string) => string
  indexName: string
  lang: string
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
        <MoverRow key={item.meta_slug} item={item} lang={lang} />
      ))}
    </div>
  )
}

export default function MarketMovers({ risers, fallers, indexName, lang }: {
  risers: Mover[]
  fallers: Mover[]
  indexName: string
  lang: Lang
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
      />
      <MoversCard
        title={labels.fallers}
        colorClass="dn"
        items={fallers}
        explainerFn={fallerExplainer}
        indexName={indexName}
        lang={lang}
      />
    </div>
  )
}
