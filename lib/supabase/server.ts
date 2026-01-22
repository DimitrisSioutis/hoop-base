import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseServerClient(responseToSetCookies?: any) {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('[SERVER] setAll called for cookie:', name)
            // Set on cookies() for server components
            cookieStore.set(name, value, options)

            // ALSO set on response if provided (for route handlers)
            if (responseToSetCookies) {
              console.log('[SERVER] Setting cookie on response:', name)
              responseToSetCookies.cookies.set(name, value, options)
              console.log('[SERVER] Response now has', responseToSetCookies.cookies.getAll().length, 'cookies')
            }
          })
        } catch (e) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
          console.log('[SERVER] Cookie set error:', e)
        }
      },
    },
  })
}
