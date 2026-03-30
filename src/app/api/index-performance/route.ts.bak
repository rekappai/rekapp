import { NextResponse } from 'next/server'

const INDICES = [
  { symbol: '%5EGSPC', country: 'us', name: 'S&P 500', currency: '$' },
  { symbol: 'FTSEMIB.MI', country: 'it', name: 'FTSE MIB', currency: '€' },
  { symbol: '%5EFCHI', country: 'fr', name: 'CAC 40', currency: '€' },
]

async function fetchIndex(symbol: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } }
  )
  if (!res.ok) return null
  const data = await res.json()
  const meta = data?.chart?.result?.[0]?.meta
  if (!meta) return null
  const price = meta.regularMarketPrice
  const prev = meta.chartPreviousClose
  const change_pct = prev ? ((price - prev) / prev) * 100 : 0
  return { price, prev, change_pct: Math.round(change_pct * 100) / 100 }
}

export async function GET() {
  const results = await Promise.all(
    INDICES.map(async idx => {
      const data = await fetchIndex(idx.symbol)
      return { ...idx, ...data }
    })
  )
  return NextResponse.json(results)
}
