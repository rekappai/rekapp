import { NextResponse } from 'next/server'

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://rekapp.ai/api/sitemap`

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
