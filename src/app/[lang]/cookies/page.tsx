import { type Lang } from '@/lib/i18n'

const content = {
  en: {
    title: 'Cookie policy',
    updated: 'Last updated: March 2026',
    sections: [
      { h: 'What are cookies', p: 'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you interact with it.' },
      { h: 'Essential cookies', p: 'These cookies are necessary for the site to function properly. They include session cookies and language preference cookies. They cannot be disabled.' },
      { h: 'Analytics cookies', p: 'We use Mixpanel and Google Analytics to understand how visitors use Rekapp. These cookies collect anonymous data about page views, time on site, and navigation patterns. You can opt out of these cookies through the consent banner.' },
      { h: 'Third-party cookies', p: 'Our analytics providers (Google, Mixpanel) may set their own cookies. These are governed by their respective privacy policies.' },
      { h: 'Managing cookies', p: 'You can manage cookie preferences through the consent banner shown on your first visit. You can also clear cookies through your browser settings at any time.' },
      { h: 'Changes', p: 'We may update this cookie policy. Changes will be posted on this page.' },
    ],
  },
  it: {
    title: 'Informativa sui cookie',
    updated: 'Ultimo aggiornamento: marzo 2026',
    sections: [
      { h: 'Cosa sono i cookie', p: 'I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito web.' },
      { h: 'Cookie essenziali', p: 'Questi cookie sono necessari per il corretto funzionamento del sito. Includono cookie di sessione e preferenze linguistiche. Non possono essere disabilitati.' },
      { h: 'Cookie analitici', p: 'Utilizziamo Mixpanel e Google Analytics per comprendere come i visitatori utilizzano Rekapp. Puoi disattivare questi cookie tramite il banner di consenso.' },
      { h: 'Cookie di terze parti', p: 'I nostri fornitori di analisi (Google, Mixpanel) possono impostare i propri cookie, regolati dalle rispettive informative sulla privacy.' },
      { h: 'Gestione dei cookie', p: 'Puoi gestire le preferenze sui cookie tramite il banner mostrato alla prima visita o cancellare i cookie dalle impostazioni del browser.' },
      { h: 'Modifiche', p: 'Potremmo aggiornare questa informativa. Le modifiche saranno pubblicate su questa pagina.' },
    ],
  },
  fr: {
    title: 'Politique de cookies',
    updated: 'Derni\u00e8re mise \u00e0 jour : mars 2026',
    sections: [
      { h: 'Que sont les cookies', p: "Les cookies sont de petits fichiers texte stock\u00e9s sur votre appareil lorsque vous visitez un site web." },
      { h: 'Cookies essentiels', p: 'Ces cookies sont n\u00e9cessaires au fonctionnement du site. Ils ne peuvent pas \u00eatre d\u00e9sactiv\u00e9s.' },
      { h: 'Cookies analytiques', p: "Nous utilisons Mixpanel et Google Analytics. Vous pouvez refuser ces cookies via la banni\u00e8re de consentement." },
      { h: 'Cookies tiers', p: "Nos fournisseurs d'analyse peuvent d\u00e9finir leurs propres cookies." },
      { h: 'Gestion des cookies', p: "Vous pouvez g\u00e9rer vos pr\u00e9f\u00e9rences via la banni\u00e8re ou les param\u00e8tres de votre navigateur." },
      { h: 'Modifications', p: 'Cette politique peut \u00eatre mise \u00e0 jour.' },
    ],
  },
}

export default async function CookiePage({ params }: { params: Promise<{ lang: string }> }) {
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
