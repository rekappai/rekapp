import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lang = sp.get('lang') || 'en'
  const offset = parseInt(sp.get('offset') || '0', 10)
  const limit = parseInt(sp.get('limit') || '20', 10)
  const tag = sp.get('tag') || null

  let query = supabase
    .from('articles')
    .select('*, stocks(symbol, name, sector, cap_tier, country_code), alerts!alert_id(direction, change_pct, price_at_alert, previous_close, triggered_at)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tag) query = query.contains('tags', JSON.stringify([tag]))

  const { data, error } = await query
  if (error) return NextResponse.json({ articles: [], hasMore: false })

  return NextResponse.json({
    articles: data ?? [],
    hasMore: (data ?? []).length === limit,
  })
}
