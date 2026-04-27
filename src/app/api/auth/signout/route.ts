import { NextResponse } from 'next/server';

// Clears the guest cookie (real Supabase sessions are signed out client-side)
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('bite_guest', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // immediately expire
  });
  return response;
}
