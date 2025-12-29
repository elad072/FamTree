import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect internal routes, allow public to see landing and login
    const isAuthPage = request.nextUrl.pathname.startsWith('/login')
    const isCallbackPage = request.nextUrl.pathname.startsWith('/auth')
    const isPublicPage = request.nextUrl.pathname === '/' || isAuthPage || isCallbackPage

    if (user) {
        // Fetch profile to check approval
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_approved, role')
            .eq('id', user.id)
            .single()

        // If profile exists, check approval. If it doesn't exist, we'll let them to the home page to auto-create it.
        const isApproved = profile ? (profile.is_approved || profile.role === 'admin') : true
        const isInternalPage = request.nextUrl.pathname.startsWith('/family') || request.nextUrl.pathname.startsWith('/admin')

        if (!isApproved && isInternalPage && profile) {
            // Redirect explicitly unapproved users
            return NextResponse.redirect(new URL('/?error=pending_approval', request.url))
        }

        if (isAuthPage) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    } else if (!isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
