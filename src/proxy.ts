import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — keeps the JWT alive
  const { data: { user } } = await supabase.auth.getUser();

  // Guest mode — cookie-based bypass that shows Tejas's data
  const guestToken  = request.cookies.get('bite_guest')?.value;
  const guestSecret = process.env.GUEST_SECRET ?? 'bite-guest-demo';
  const isGuest     = !!process.env.GUEST_USER_ID && guestToken === guestSecret;

  const { pathname } = request.nextUrl;
  const protectedPaths = ['/log', '/trends', '/settings'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !user && !isGuest) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If already logged in (or guest) and hitting the landing page, go straight to /log
  if (pathname === '/' && (user || isGuest)) {
    return NextResponse.redirect(new URL('/log', request.url));
  }

  return response;
}

export const config = {
  // Exclude: API routes, Next.js internals, auth callback, and any file with
  // an extension (static assets like .png, .svg, .woff2, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)'  ],
};
