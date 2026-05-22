import { NextRequest, NextResponse } from 'next/server'

const PLATFORM_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'qkart.io',
  'www.qkart.io',
])

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? ''

  if (!host || PLATFORM_HOSTS.has(host)) {
    return NextResponse.next()
  }

  const apiUrl = process.env.API_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${apiUrl}/p/domain/${encodeURIComponent(host)}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return NextResponse.next()

    const json = await res.json()
    const slug: string | undefined = json?.data?.slug

    if (!slug) return NextResponse.next()

    const url = req.nextUrl.clone()
    url.pathname = `/u/${slug}`
    return NextResponse.rewrite(url)
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon\\.ico|u/).*)'],
}
