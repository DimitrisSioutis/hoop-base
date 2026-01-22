import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: true,
              path: '/',
              // Don't use httpOnly - browser client needs to read these via JS
            })
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const isAuthPage = request.nextUrl.pathname === "/login"
  const isAuthCallback = request.nextUrl.pathname === "/auth/callback"

  if (!user && !isAuthPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to matches if already logged in and trying to access login
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/matches"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
