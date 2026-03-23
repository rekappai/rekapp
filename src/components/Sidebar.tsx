import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

async function getTopMovers(lang: string) {
  const { data } = await supabase
    .from('articles')
    .select('headline, meta_slug, stocks(symbol, name), alerts(direction, change_pct)')
    .eq('lang_code', lang)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function Sidebar({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  const movers = await getTopMovers(lang)

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 pl-7 pt-6">
      <div className="mb-7 pb-7 border-b border-[--ink-border]">
        <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.18em] uppercase text-[--gold] mb-3.5">
          {t.sidebar.movers}
        </div>
        <div className="flex flex-col">
          {movers.map((item: any) => {
            const up = item.alerts?.direction === 'up'
            return (
              <Link
                key={item.meta_slug}
                href={`/${lang}/article/${item.meta_slug}`}
                className="flex items-center gap-2.5 py-2 border-b border-[--ink-border] last:border-0 hover:opacity-80 transition-opacity"
              >
                <span className="font-[family-name:var(--font-dm-mono)] text-[0.62rem] font-medium text-[--text] w-14 shrink-0">{item.stocks?.symbol}</span>
                <span className="text-[0.7rem] text-[--text-dim] flex-1 truncate">{item.stocks?.name}</span>
                <span className={`font-[family-name:var(--font-dm-mono)] text-[0.65rem] font-medium shrink-0 ${up ? 'text-[--up]' : 'text-[--down]'}`}>
                  {up ? '+' : ''}{Number(item.alerts?.change_pct ?? 0).toFixed(1)}%
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mb-7 pb-7 border-b border-[--ink-border]">
        <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.18em] uppercase text-[--gold] mb-3.5">
          {t.sidebar.indices}
        </div>
        <Link href={`/${lang}/markets`} className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.12em] uppercase text-[--text-dim] hover:text-[--gold] transition-colors">
          {t.sidebar.allMarkets}
        </Link>
      </div>

      <div className="mb-7">
        <div className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.18em] uppercase text-[--gold] mb-3.5">
          {t.sidebar.topics}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['earnings','analysts','ai','banks','energy','evs','macro'] as const).map(key => (
            <Link
              key={key}
              href={`/${lang}/topics?tag=${key}`}
              className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.08em] uppercase text-[--text-dim] border border-[--ink-border] px-2 py-1 hover:text-[--gold] hover:border-[--gold-border] transition-all"
            >
              {t.topics[key]}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
