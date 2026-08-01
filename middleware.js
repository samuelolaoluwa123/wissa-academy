import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res = NextResponse.next({ request: req })
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  // Not logged in → must go to auth
  if (!user && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // NOTE: We intentionally do NOT redirect logged-in users away from /auth
  // This forces users to actively sign in each visit (security requirement)

  // Role-based route protection — a logged-in user still shouldn't be able
  // to view dashboards for a role that isn't theirs (e.g. a student loading
  // /instructor/dashboard directly by URL).
  if (user && (pathname.startsWith('/student') || pathname.startsWith('/instructor'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'student'

    if (pathname.startsWith('/instructor') && role !== 'instructor') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url))
    }
    if (pathname.startsWith('/student') && role === 'instructor') {
      return NextResponse.redirect(new URL('/instructor/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/student/:path*',
    '/instructor/:path*',
    '/courses/:path*',
  ],
}