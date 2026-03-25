import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import FeedItem from '@/components/FeedItem'
import TopicsClient from '@/components/TopicsClient'

export const revalidate = 120

async function getArticles(lang: string, tag?: string) {
  if (tag) {
    const { data } = await supabase.rpc('articles_by_tag', { tag_name: tag, lang })
    return data ?? []
  }
  const { data } = await supabase.from('articles')
    .select('*')
    .eq('lang_code', lang).eq('published', true)
    .order('published_at', { ascending: false }).limit(20)
  return data ?? []
}

async function getTrendingTags(lang: string): Promise<{ slug: string; label: string }[]> {
  const { data } = await supabase.rpc('trending_tags', { lang })
  if (!data?.length) return []
  return data.map((r: any) => ({ slug: r.tag, label: r.tag }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const meta = {
    en: { title: 'Topics — Rekapp', description: 'Browse financial stories by topic: earnings, analysts, AI, energy, banks and more.' },
    it: { title: 'Argomenti — Rekapp', description: 'Sfoglia le storie finanziarie per argomento: utili, analisti, IA, energia, banche e altro.' },
  } as Record<string, { title: string; description: string }>
  return meta[lang] ?? meta.en
}

export default async function TopicsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ tag?: string }> }) {
  const { lang } = await params
  const { tag } = await searchParams
  const t = useTranslations(lang as Lang)
  const [articles, topics] = await Promise.all([
    getArticles(lang, tag),
    getTrendingTags(lang),
  ])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{lang === 'it' ? 'In tendenza' : 'Trending'}</h1>
        <TopicsClient lang={lang as Lang} activeTag={tag} topics={topics} />
      </div>
      <div style={{ borderTop: '1px solid var(--ink-border)' }}>
        {articles.map((a: any, i: number) => (
          <FeedItem key={a.id} article={a} lang={lang as Lang} hero={i === 0} />
        ))}
        {articles.length === 0 && (
          <div className="empty-state">{t.archive.noResults}</div>
        )}
      </div>
    </div>
  )
}
