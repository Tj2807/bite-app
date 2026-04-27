import { createServerClient } from '@supabase/ssr';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /auth/callback — Supabase exchanges the OAuth code for a session here
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') ?? '/log';

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  const userId = data.user.id;

  // ── Claim existing unclaimed data for first-time users ──────────────────────
  // Historical data (meals, chat, goals) has user_id = NULL.
  // Assign it to the first user who logs in.
  const admin = createServerSupabaseClient();

  const { count: existingMeals } = await admin
    .from('meals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((existingMeals ?? 0) === 0) {
    // This user has no data yet — claim any unclaimed rows
    await Promise.all([
      admin.from('meals').update({ user_id: userId }).is('user_id', null),
      admin.from('daily_summaries').update({ user_id: userId }).is('user_id', null),
      admin.from('chat_messages').update({ user_id: userId }).is('user_id', null),
      admin.from('user_goals').update({ user_id: userId }).is('user_id', null),
    ]);
    console.log(`[auth/callback] Claimed existing data for user ${userId}`);
  }

  // Ensure user has a goals row
  const { count: goalsCount } = await admin
    .from('user_goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((goalsCount ?? 0) === 0) {
    await admin.from('user_goals').insert({
      user_id: userId,
      calories: 1900,
      protein_g: 160,
      carbs_g: 180,
      fat_g: 60,
      fiber_g: 30,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
