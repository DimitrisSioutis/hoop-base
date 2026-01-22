import { type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/matches"

  if (code) {
    const cookieStore = await cookies()

    // Use a promise to capture cookies when setAll is called
    let resolveSetAll: (cookies: { name: string; value: string; options: any }[]) => void
    const cookiesPromise = new Promise<{ name: string; value: string; options: any }[]>((resolve) => {
      resolveSetAll = resolve
    })

    const collectedCookies: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              collectedCookies.push({ name, value, options })
            })
            resolveSetAll!(collectedCookies)
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {

      const timeoutPromise = new Promise<{ name: string; value: string; options: any }[]>((resolve) => {
        setTimeout(() => {
          resolve(collectedCookies)
        }, 500)
      })

      const cookiesToSet = await Promise.race([cookiesPromise, timeoutPromise])

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      let redirectUrl

      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }

      const headers = new Headers({
        'Location': redirectUrl,
      })

      for (const { name, value, options } of cookiesToSet) {
        const maxAge = options?.maxAge || 31536000
        // Don't use HttpOnly - browser client needs to read these cookies via JavaScript
        const cookieString = `${name}=${value}; Path=/; Secure; SameSite=Lax; Max-Age=${maxAge}`
        headers.append('Set-Cookie', cookieString)
      }

      return new Response(null, {
        status: 302,
        headers,
      })
    }
  }

  return new Response(null, {
    status: 302,
    headers: { 'Location': `${origin}/login?error=auth` },
  })
}
