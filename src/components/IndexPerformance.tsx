'use client'
import { useEffect, useState } from 'react'

type IndexData = {
  country: string
  name: string
  currency: string
  price?: number
  change_pct?: number
}

export default function IndexPerformance({ country }: { country: string }) {
  const [data, setData] = useState<IndexData | null>(null)

  useEffect(() => {
    fetch('/api/index-performance')
      .then(r => r.json())
      .then((all: IndexData[]) => {
        const found = all.find(d => d.country === country)
        if (found) setData(found)
      })
  }, [country])

  if (!data?.price) return null

  const up = (data.change_pct ?? 0) >= 0
  const cur = data.currency

  return (
    <div className="index-perf">
      <span className="index-perf-name">{data.name}</span>
      <span className="index-perf-price">{cur}{Number(data.price).toLocaleString()}</span>
      <span className={'index-perf-chg ' + (up ? 'up' : 'dn')}>
        {up ? '+' : ''}{data.change_pct?.toFixed(2)}%
      </span>
    </div>
  )
}
