import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)

  const disclaimer = lang === 'it'
    ? 'Rekapp fornisce contenuti generati dall\'IA a scopo informativo. Non costituisce consulenza finanziaria.'
    : lang === 'fr'
    ? 'Rekapp fournit du contenu g\u00e9n\u00e9r\u00e9 par IA \u00e0 titre informatif. Ceci ne constitue pas un conseil financier.'
    : 'Rekapp provides AI-generated content for informational purposes only. This does not constitute financial advice.'

  return (
    <footer>
      <div className="footer-inner footer-col">
        <div className="footer-top">
          <Link href={'/' + lang} className="foot-logo">Rek<span>app</span></Link>
          <div className="footer-links">
            <Link href={'/' + lang + '/privacy'} className="footer-link">
              {lang === 'it' ? 'Privacy' : lang === 'fr' ? 'Confidentialit\u00e9' : 'Privacy policy'}
            </Link>
            <Link href={'/' + lang + '/terms'} className="footer-link">
              {lang === 'it' ? 'Termini di utilizzo' : lang === 'fr' ? "Conditions d'utilisation" : 'Terms of use'}
            </Link>
            <Link href={'/' + lang + '/cookies'} className="footer-link">
              {lang === 'it' ? 'Cookie' : lang === 'fr' ? 'Cookies' : 'Cookie policy'}
            </Link>
          </div>
        </div>
        <div className="footer-disclaimer">{disclaimer}</div>
        <span className="foot-copy">\u00a9 {new Date().getFullYear()} Rekapp \u00b7 {t.footer.copy}</span>
      </div>
    </footer>
  )
}
