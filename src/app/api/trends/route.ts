import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/trends?range=all|7d|30d&start=<utc-iso>&end=<utc-iso>
//
// We no longer use daily_summaries for chart/averages — that table is keyed by
// UTC date, so a meal at 10 pm CT appears in the next UTC day's bucket.
// Instead we return raw meals and let the client group by local date.
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') ?? 'all';

  // Client sends UTC boundaries of its local date window so the filter is
  // timezone-correct. Fall back to a UTC-date approach if not provided.
  const startParam = searchParams.get('start');
  const endParam   = searchParams.get('end');

  let mealsQuery = supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(2000); // enough for years of daily logging

  if (range !== 'all' && startParam && endParam) {
    mealsQuery = mealsQuery.gte('logged_at', startParam).lte('logged_at', endParam);
  } else if (range !== 'all') {
    // Fallback: UTC-based range (imprecise but safe)
    const days = range === '30d' ? 30 : 7;
    const from = new Date();
    from.setDate(from.getDate() - days);
    mealsQuery = mealsQuery.gte('logged_at', from.toISOString());
  }

  const { data: meals, error: mealErr } = await mealsQuery;
  if (mealErr) return NextResponse.json({ error: mealErr.message }, { status: 500 });

  // Return raw meals — the client groups by local date so timezone is exact.
  return NextResponse.json({ meals: meals ?? [] });
}
