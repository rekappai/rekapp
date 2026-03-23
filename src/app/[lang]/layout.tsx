import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { languages } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Lang } from '@/lib/i18n'
import '../globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export async function generateStaticParams() {
  return languages.map(lang => ({ lang }))
}

export const metadata: Metadata = {
  title: 'Rekapp — Financial Intelligence',
  description: 'AI-generated financial intelligence for global markets.',
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="bg-[--ink] text-[--text] antialiased font-[family-name:var(--font-dm-sans)]">
        <Header lang={lang as Lang} />
        <main>{children}</main>
        <Footer lang={lang as Lang} />
      </body>
    </html>
  )
}
