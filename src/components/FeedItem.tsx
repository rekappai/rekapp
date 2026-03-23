import Link from 'next/link'
import { type Article, parseTags } from '@/lib/types'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function FeedItem({
  article,
  lang,
  hero = false,
}: {
  article: Article
  lang: Lang
  hero?: boolean
}) {
  const t = useTranslations(lang)
  const stock = (article as any).stocks
  const alert = (article as any).alerts
  const tags = parseTags(article.tags).slice(0, 2)
  const up = alert?.direction === 'up'
  const time = new Date(article.published_at).toLocaleTimeString(
    lang === 'it' ? 'it-IT' : 'en-GB',
    { hour: '2-digit', minute: '2-digit' }
  )

  const Meta = () => (
    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
      {stock?.symbol && (
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.6rem] font-medium text-[--text] bg-[--ink-border] px-[7px] py-[2px]">
          {stock.symbol}
        </span>
      )}
      {alert?.change_pct != null && (
        <span className={`font-[family-name:var(--font-dm-mono)] text-[0.6rem] font-medium ${up ? 'text-[--up]' : 'text-[--down]'}`}>
          {up ? '▴' : '▾'} {up ? '+' : ''}{Number(alert.change_pct).toFixed(1)}%
        </span>
      )}
      {article.country_code && (
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.5rem] tracking-[0.12em] uppercase text-[--text-dim] border border-[--ink-border] px-1.5 py-0.5">
          {article.country_code.toUpperCase()}
        </span>
      )}
      <span className="font-[family-name:var(--font-dm-mono)] text-[0.58rem] text-[--text-dim] ml-auto">{time}</span>
    </div>
  )

  const Tags = () => tags.length > 0 ? (
    <div className="flex gap-1.5 ml-auto">
      {tags.map(tag => (
        <span key={tag} className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.08em] uppercase text-[--text-dim] border border-[--ink-border] px-2 py-1">
          {tag}
        </span>
      ))}
    </div>
  ) : null

  if (hero) {
    return (
      <Link href={`/${lang}/article/${article.meta_slug}`} className="block bg-[--ink-card] border-b border-[--ink-border] p-7 hover:bg-[--ink-hover] transition-colors group">
        <Meta />
        <h2 className="font-[family-name:var(--font-playfair)] text-[1.55rem] font-normal leading-[1.22] tracking-tight text-[--text] mb-2.5 group-hover:text-white transition-colors">
          {article.headline}
        </h2>
        {article.body && (
          <p className="text-[0.82rem] leading-[1.65] text-[--text-dim] mb-3.5 line-clamp-3">
            {article.body.slice(0, 280)}
          </p>
        )}
        <div className="flex items-center gap-2.5">
          <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.12em] uppercase text-[--text-dim]">{t.feed.readMore}</span>
          <Tags />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/${lang}/article/${article.meta_slug}`}
      className="grid border-b border-[--ink-border] hover:bg-[--ink-hover] transition-colors group relative"
      style={{ gridTemplateColumns: '64px 1fr' }}
    >
      <div className="absolute left-0 top-0 w-[2px] h-0 bg-[--gold] group-hover:h-full transition-all duration-200" />
      <div className="flex flex-col items-center justify-start gap-1.5 py-[18px] border-r border-[--ink-border]">
        <span className="font-[family-name:var(--font-dm-mono)] text-[0.58rem] text-[--text-dim]">{time}</span>
        <span className="w-1 h-1 rounded-full bg-[--ink-border] group-hover:bg-[--gold] transition-colors" />
      </div>
      <div className="p-[18px]">
        <Meta />
        <h3 className="font-[family-name:var(--font-playfair)] text-[1rem] font-normal leading-[1.35] tracking-[-0.01em] text-[--text] mb-1.5 group-hover:text-white transition-colors">
          {article.headline}
        </h3>
        {article.body && (
          <p className="text-[0.78rem] leading-[1.62] text-[--text-dim] line-clamp-2 mb-2.5">
            {article.body.slice(0, 160)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.12em] uppercase text-[--text-dim]">{t.feed.readMore}</span>
          <Tags />
        </div>
      </div>
    </Link>
  )
}
