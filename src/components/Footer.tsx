import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  return (
    <footer className="border-t border-[--ink-border] px-[--pad] py-6 flex justify-between items-center flex-wrap gap-3 mt-16">
      <Link href={`/${lang}`} className="font-[family-name:var(--font-playfair)] text-[0.95rem] text-[--text-dim]">
        Rek<span className="text-[--gold]">app</span>
      </Link>
      <span className="font-[family-name:var(--font-dm-mono)] text-[0.52rem] tracking-[0.08em] text-[--text-dim]">
        © {new Date().getFullYear()} Rekapp · {t.footer.copy}
      </span>
    </footer>
  )
}
