// ── Server-only Supabase helpers — do NOT import in client components ─────────
// This file uses next/headers and next/server, which are server-only APIs.

import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Get the authenticated user from a Route Handler request ─────────────────
// Returns the real Supabase user, OR Tejas's user object for guest sessions.
export async function getAuthUser(req: NextRequest) {
  // Guest bypass — cookie matches secret and GUEST_USER_ID is configured
  const guestToken  = req.cookies.get('bite_guest')?.value;
  const guestSecret = process.env.GUEST_SECRET ?? 'bite-guest-demo';
  const guestUserId = process.env.GUEST_USER_ID;
  if (guestToken && guestToken === guestSecret && guestUserId) {
    return { id: guestUserId } as { id: string };
  }

  // Normal Supabase auth
  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: () => {},
    },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}
