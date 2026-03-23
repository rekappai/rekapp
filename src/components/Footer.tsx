import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)
  return (
    <footer>
      <Link href={'/' + lang} className="foot-logo">Rek<span>app</span></Link>
      <span className="foot-copy">© {new Date().getFullYear()} Rekapp · {t.footer.copy}</span>
    </footer>
  )
}
