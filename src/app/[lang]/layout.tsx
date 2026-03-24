import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { languages } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Lang } from '@/lib/i18n'
import Script from 'next/script'
import { AltSlugProvider } from '@/lib/AltSlugContext'
import '../globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-dm-mono', weight: ['400', '500'], display: 'swap' })

export async function generateStaticParams() {
  return languages.map(lang => ({ lang }))
}

export const metadata: Metadata = {
  title: 'Rekapp — Financial Intelligence',
  description: 'AI-generated financial intelligence for global markets.',
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <html lang={lang} className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PJNMR9GN');` }} />
      </head>
      <body style={{ background: 'var(--ink)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PJNMR9GN" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        <AltSlugProvider>
          <Header lang={lang as Lang} />
          <main style={{ minHeight: '60vh' }}>{children}</main>
          <Footer lang={lang as Lang} />
        </AltSlugProvider>
      </body>
    </html>
  )
}
