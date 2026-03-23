import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import ArchiveClient from '@/components/ArchiveClient'

export const revalidate = 300

async function getArchiveArticles(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('id, headline, meta_slug, published_at, country_code, tags, stocks(symbol, name), alerts(direction, change_pct)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(200)
  return data ?? []
}

export default async function ArchivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const articles = (await getArchiveArticles(lang)) as any[]

  return (
    <div className="max-w-[1240px] mx-auto px-[--pad]">
      <div className="py-8 border-b border-[--ink-border]">
        <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,2.5vw,2.2rem)] font-normal tracking-tight text-[--text] mb-1.5">{t.archive.title}</h1>
        <p className="text-[0.82rem] text-[--text-dim]">{t.archive.sub}</p>
      </div>
      <ArchiveClient articles={articles} lang={lang as Lang} t={t} />
    </div>
  )
}
