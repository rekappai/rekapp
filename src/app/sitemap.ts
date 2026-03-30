import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LANGUAGES = ['en', 'it', 'fr']
const BASE_URL = 'https://rekapp.ai'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // ── Static pages per language ──────────────────────────────────────
  const staticPages = ['', '/markets', '/topics', '/archive', '/search']

  for (const lang of LANGUAGES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'hourly' : 'daily',
        priority: page === '' ? 1.0 : 0.7,
      })
    }
  }

  // ── Market detail pages ────────────────────────────────────────────
  const activeMarkets = ['us', 'it', 'fr']

  for (const lang of LANGUAGES) {
    for (const market of activeMarkets) {
      entries.push({
        url: `${BASE_URL}/${lang}/markets/${market}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      })
    }
  }

  // ── Article pages ──────────────────────────────────────────────────
  const { data: articles } = await supabase
    .from('articles')
    .select('meta_slug, lang_code, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5000)

  if (articles) {
    for (const article of articles) {
      if (!article.meta_slug) continue
      entries.push({
        url: `${BASE_URL}/${article.lang_code}/article/${article.meta_slug}`,
        lastModified: new Date(article.published_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return entries
}
