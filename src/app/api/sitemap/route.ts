import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LANGUAGES = ['en', 'it', 'fr']
const BASE_URL = 'https://rekapp.ai'
const ACTIVE_MARKETS = ['us', 'it', 'fr']

function entry(loc: string, lastmod: string, changefreq: string, priority: number): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const now = new Date().toISOString().split('T')[0]
  const urls: string[] = []

  const staticPages = [
    { path: '', changefreq: 'hourly', priority: 1.0 },
    { path: '/markets', changefreq: 'daily', priority: 0.7 },
    { path: '/topics', changefreq: 'daily', priority: 0.7 },
    { path: '/archive', changefreq: 'daily', priority: 0.6 },
    { path: '/search', changefreq: 'weekly', priority: 0.4 },
  ]

  for (const lang of LANGUAGES) {
    for (const page of staticPages) {
      urls.push(entry(`${BASE_URL}/${lang}${page.path}`, now, page.changefreq, page.priority))
    }
    for (const market of ACTIVE_MARKETS) {
      urls.push(entry(`${BASE_URL}/${lang}/markets/${market}`, now, 'daily', 0.6))
    }
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('meta_slug, lang_code, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5000)

  if (articles) {
    for (const a of articles) {
      if (!a.meta_slug) continue
      const date = new Date(a.published_at).toISOString().split('T')[0]
      urls.push(entry(`${BASE_URL}/${a.lang_code}/article/${a.meta_slug}`, date, 'weekly', 0.8))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
