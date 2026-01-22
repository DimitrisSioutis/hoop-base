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

  // Check if user is enabled in the database
  if (user) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("is_enabled")
      .eq("id", user.id)
      .single()

    const isEnabled = dbUser?.is_enabled ?? false

    // If user is not enabled, redirect to login with pending message
    if (!isEnabled && !isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("pending", "true")
      return NextResponse.redirect(url)
    }

    // If user is enabled and on login page, redirect to matches
    if (isEnabled && isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = "/matches"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
