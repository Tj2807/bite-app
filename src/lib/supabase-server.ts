// ── Server-only Supabase helpers — do NOT import in client components ─────────
// This file uses next/headers and next/server, which are server-only APIs.

import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Get the authenticated user from a Route Handler request ─────────────────
// Uses the session cookie from the request. Returns null if unauthenticated.
export async function getAuthUser(req: NextRequest) {
  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: () => {}, // read-only in route handlers — middleware refreshes tokens
    },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}
