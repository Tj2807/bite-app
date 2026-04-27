import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret     = process.env.GUEST_SECRET ?? 'bite-guest-demo';
  const guestUserId = process.env.GUEST_USER_ID;

  if (!guestUserId) {
    return NextResponse.json({ error: 'Guest mode not configured' }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('bite_guest', secret, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
