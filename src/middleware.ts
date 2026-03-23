import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED = ['en', 'it']
const DEFAULT   = 'en'

function detectLang(req: NextRequest): string {
  const header = req.headers.get('accept-language') ?? ''
  // Parse "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7" → ['it', 'en', ...]
  const preferred = header
    .split(',')
    .map(part => part.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find(lang => SUPPORTED.includes(lang))
  return preferred ?? DEFAULT
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip if already on a language path, or is a static/api route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    SUPPORTED.some(lang => pathname.startsWith('/' + lang))
  ) {
    return NextResponse.next()
  }

  // Redirect / → /en or /it based on browser language
  const lang = detectLang(req)
  const url = req.nextUrl.clone()
  url.pathname = '/' + lang + pathname
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
