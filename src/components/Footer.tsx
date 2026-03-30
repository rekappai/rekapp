import Link from 'next/link'
import { type Lang, useTranslations } from '@/lib/i18n'

export default function Footer({ lang }: { lang: Lang }) {
  const t = useTranslations(lang)

  const disclaimer = ({ en: 'Rekapp provides AI-generated content for informational purposes only. This does not constitute financial advice.', it: 'Rekapp fornisce contenuti generati dall\'IA a scopo informativo. Non costituisce consulenza finanziaria.', fr: 'Rekapp fournit du contenu généré par IA à titre informatif. Ceci ne constitue pas un conseil financier.', es: 'Rekapp ofrece contenido generado por IA con fines informativos. No constituye asesoramiento financiero.' } as Record<string,string>)[lang] || 'Rekapp provides AI-generated content for informational purposes only. This does not constitute financial advice.'

  return (
    <footer>
      <div className="footer-inner footer-col">
        <div className="footer-top">
          <Link href={'/' + lang} className="foot-logo">Rek<span>app</span></Link>
          <div className="footer-links">
            <Link href={'/' + lang + '/privacy'} className="footer-link">
              {({ en: 'Privacy policy', it: 'Privacy', fr: 'Confidentialité', es: 'Privacidad' }[lang] || 'Privacy policy')}
            </Link>
            <Link href={'/' + lang + '/terms'} className="footer-link">
              {({ en: 'Terms of use', it: 'Termini di utilizzo', fr: "Conditions d'utilisation", es: 'Condiciones de uso' }[lang] || 'Terms of use')}
            </Link>
            <Link href={'/' + lang + '/cookies'} className="footer-link">
              {({ en: 'Cookie policy', it: 'Cookie', fr: 'Cookies', es: 'Cookies' }[lang] || 'Cookie policy')}
            </Link>
          </div>
        </div>
        <div className="footer-disclaimer">{disclaimer}</div>
        <span className="foot-copy">© {new Date().getFullYear()} Rekapp \u00b7 {t.footer.copy}</span>
      </div>
    </footer>
  )
}
