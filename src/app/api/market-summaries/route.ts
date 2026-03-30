import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lang = sp.get('lang') || 'en'
  const country = sp.get('country') || null

  let query = supabase
    .from('market_summaries')
    .select('country_code, session_date, lang_code, summary, index_price, index_change_pct, generated_at')
    .eq('lang_code', lang)
    .order('session_date', { ascending: false })
    .order('generated_at', { ascending: false })

  if (country) {
    query = query.eq('country_code', country)
    const { data } = await query.limit(1)
    return NextResponse.json(data?.[0] ?? null)
  }

  // Get latest for each country
  const { data } = await query.limit(20)
  if (!data) return NextResponse.json([])

  // Deduplicate: keep only the latest per country
  const seen = new Set<string>()
  const latest = data.filter(d => {
    if (seen.has(d.country_code)) return false
    seen.add(d.country_code)
    return true
  })

  return NextResponse.json(latest)
}
