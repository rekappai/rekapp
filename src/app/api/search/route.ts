import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  const lang = req.nextUrl.searchParams.get('lang') || 'en'

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Search by headline match
  const { data: byHeadline } = await supabase
    .from('articles')
    .select('id, headline, meta_slug, published_at, direction, change_pct, country_code, stocks(symbol, name)')
    .eq('lang_code', lang)
    .eq('published', true)
    .ilike('headline', `%${q}%`)
    .order('published_at', { ascending: false })
    .limit(8)

  // Search by stock symbol or company name (via stock join)
  const { data: bySymbol } = await supabase
    .from('articles')
    .select('id, headline, meta_slug, published_at, direction, change_pct, country_code, stocks!inner(symbol, name)')
    .eq('lang_code', lang)
    .eq('published', true)
    .or(`symbol.ilike.%${q}%,name.ilike.%${q}%`, { referencedTable: 'stocks' })
    .order('published_at', { ascending: false })
    .limit(8)

  // Merge and deduplicate
  const seen = new Set<string>()
  const merged: any[] = []

  for (const list of [byHeadline || [], bySymbol || []]) {
    for (const a of list) {
      if (seen.has(a.id)) continue
      seen.add(a.id)
      const stock = Array.isArray(a.stocks) ? a.stocks[0] : a.stocks
      merged.push({
        id: a.id,
        headline: a.headline,
        meta_slug: a.meta_slug,
        published_at: a.published_at,
        direction: a.direction,
        change_pct: a.change_pct,
        country_code: a.country_code,
        symbol: stock?.symbol || null,
        company_name: stock?.name || null,
      })
    }
  }

  // Sort by published_at desc, limit to 10
  merged.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  const results = merged.slice(0, 10)

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } }
  )
}
