import { type Lang } from '@/lib/i18n'

const content = {
  en: {
    title: 'Privacy policy',
    updated: 'Last updated: March 2026',
    sections: [
      { h: 'What we collect', p: 'Rekapp collects anonymous usage data through cookies and analytics tools (Mixpanel, Google Analytics) to understand how visitors interact with the platform. We do not collect personally identifiable information unless you voluntarily provide it (e.g. signing up for a newsletter).' },
      { h: 'How we use your data', p: 'Usage data helps us improve article quality, understand which markets and topics matter most to readers, and optimise the platform experience. We do not sell or share personal data with third parties for marketing purposes.' },
      { h: 'Cookies', p: 'We use essential cookies to maintain site functionality and analytics cookies to measure engagement. You can manage your cookie preferences at any time through the cookie settings banner.' },
      { h: 'Third-party services', p: 'Rekapp uses Google Tag Manager, Mixpanel, and Google Analytics for analytics. These services may set their own cookies. We also use Vercel for hosting and Supabase for data storage. Each operates under its own privacy policy.' },
      { h: 'Data retention', p: 'Analytics data is retained for up to 12 months. If you request deletion of any personal data, contact us at privacy@rekapp.ai.' },
      { h: 'Your rights (GDPR)', p: 'If you are in the European Economic Area, you have the right to access, correct, delete, or restrict processing of your personal data. You may also withdraw consent for non-essential cookies at any time. Contact privacy@rekapp.ai for any requests.' },
      { h: 'Changes', p: 'We may update this policy from time to time. Changes will be posted on this page with an updated date.' },
    ],
  },
  it: {
    title: 'Informativa sulla privacy',
    updated: 'Ultimo aggiornamento: marzo 2026',
    sections: [
      { h: 'Cosa raccogliamo', p: 'Rekapp raccoglie dati anonimi di utilizzo tramite cookie e strumenti di analisi (Mixpanel, Google Analytics) per comprendere come i visitatori interagiscono con la piattaforma. Non raccogliamo informazioni personali identificabili a meno che non vengano fornite volontariamente.' },
      { h: 'Come utilizziamo i dati', p: "I dati di utilizzo ci aiutano a migliorare la qualit\u00e0 degli articoli, capire quali mercati e argomenti interessano di pi\u00f9 ai lettori e ottimizzare l'esperienza della piattaforma. Non vendiamo n\u00e9 condividiamo dati personali con terze parti a fini di marketing." },
      { h: 'Cookie', p: 'Utilizziamo cookie essenziali per il funzionamento del sito e cookie analitici per misurare il coinvolgimento. Puoi gestire le tue preferenze sui cookie in qualsiasi momento.' },
      { h: 'Servizi di terze parti', p: 'Rekapp utilizza Google Tag Manager, Mixpanel e Google Analytics per le analisi. Utilizziamo inoltre Vercel per l\'hosting e Supabase per l\'archiviazione dei dati.' },
      { h: 'Conservazione dei dati', p: 'I dati analitici vengono conservati per un massimo di 12 mesi. Per richiedere la cancellazione dei dati personali, contattare privacy@rekapp.ai.' },
      { h: 'I tuoi diritti (GDPR)', p: 'Se ti trovi nello Spazio Economico Europeo, hai il diritto di accedere, correggere, cancellare o limitare il trattamento dei tuoi dati personali. Contatta privacy@rekapp.ai per qualsiasi richiesta.' },
      { h: 'Modifiche', p: 'Potremmo aggiornare questa informativa periodicamente. Le modifiche saranno pubblicate su questa pagina.' },
    ],
  },
  fr: {
    title: 'Politique de confidentialit\u00e9',
    updated: 'Derni\u00e8re mise \u00e0 jour : mars 2026',
    sections: [
      { h: 'Ce que nous collectons', p: "Rekapp collecte des donn\u00e9es d'utilisation anonymes via des cookies et des outils d'analyse (Mixpanel, Google Analytics) pour comprendre comment les visiteurs interagissent avec la plateforme." },
      { h: 'Comment nous utilisons vos donn\u00e9es', p: "Les donn\u00e9es d'utilisation nous aident \u00e0 am\u00e9liorer la qualit\u00e9 des articles et \u00e0 optimiser l'exp\u00e9rience. Nous ne vendons pas vos donn\u00e9es personnelles." },
      { h: 'Cookies', p: 'Nous utilisons des cookies essentiels et analytiques. Vous pouvez g\u00e9rer vos pr\u00e9f\u00e9rences \u00e0 tout moment.' },
      { h: 'Services tiers', p: "Rekapp utilise Google Tag Manager, Mixpanel et Google Analytics. Nous utilisons Vercel pour l'h\u00e9bergement et Supabase pour le stockage." },
      { h: 'Conservation des donn\u00e9es', p: "Les donn\u00e9es analytiques sont conserv\u00e9es jusqu'\u00e0 12 mois. Contactez privacy@rekapp.ai pour toute demande de suppression." },
      { h: 'Vos droits (RGPD)', p: "Si vous \u00eates dans l'EEE, vous avez le droit d'acc\u00e9der, corriger, supprimer ou limiter le traitement de vos donn\u00e9es. Contactez privacy@rekapp.ai." },
      { h: 'Modifications', p: 'Cette politique peut \u00eatre mise \u00e0 jour. Les changements seront publi\u00e9s sur cette page.' },
    ],
  },
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const c = content[lang as keyof typeof content] ?? content.en
  return (
    <div className="page" style={{ maxWidth: 700, paddingTop: 32, paddingBottom: 64 }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>{c.title}</h1>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 32 }}>{c.updated}</p>
      {c.sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8 }}>{s.h}</h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-dim)' }}>{s.p}</p>
        </div>
      ))}
    </div>
  )
}
