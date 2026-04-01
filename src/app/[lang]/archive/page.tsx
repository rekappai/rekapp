import { supabase } from '@/lib/supabase'
import { useTranslations, type Lang } from '@/lib/i18n'
import ArchiveClient from '@/components/ArchiveClient'

export const revalidate = 300

async function getArticles(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select(`
      id, headline, meta_slug, published_at, country_code, tags, direction, change_pct,
      stocks ( symbol, name ),
      alerts!alert_id ( direction, change_pct )
    `)
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(300)
  return (data ?? []) as any[]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const meta: Record<string, { title: string; description: string }> = {
    en: { title: 'Archive \u2014 Rekapp', description: 'Every financial story, every market, every day. Browse the full Rekapp archive.' },
    it: { title: 'Archivio \u2014 Rekapp', description: "Ogni articolo finanziario, ogni mercato, ogni giorno. Sfoglia l'archivio completo." },
    fr: { title: 'Archives \u2014 Rekapp', description: "Chaque article financier, chaque march\u00e9, chaque jour. Parcourez les archives compl\u00e8tes." },
    es: { title: 'Archivo \u2014 Rekapp', description: 'Cada art\u00edculo financiero, cada mercado, cada d\u00eda. Explora el archivo completo.' },
  }
  return meta[lang] ?? meta.en
}

export default async function ArchivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = useTranslations(lang as Lang)
  const articles = await getArticles(lang)
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t.archive.title}</h1>
        <p className="page-sub">{t.archive.sub}</p>
      </div>
      <ArchiveClient articles={articles} lang={lang as Lang} t={t} />
    </div>
  )
}
