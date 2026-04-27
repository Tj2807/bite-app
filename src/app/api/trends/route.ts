import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/trends?range=all|7d|30d
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') ?? 'all';

  // Build date filter — 'all' fetches everything
  let summaryQuery = supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  let mealsQuery = supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(100);

  if (range !== 'all') {
    const days = range === '30d' ? 30 : 7;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromStr = fromDate.toISOString().split('T')[0];
    summaryQuery = summaryQuery.gte('date', fromStr);
    mealsQuery   = mealsQuery.gte('logged_at', `${fromStr}T00:00:00Z`);
  }

  const [{ data: summaries, error: summErr }, { data: meals, error: mealErr }] =
    await Promise.all([summaryQuery, mealsQuery]);

  if (summErr) return NextResponse.json({ error: summErr.message }, { status: 500 });
  if (mealErr) return NextResponse.json({ error: mealErr.message }, { status: 500 });

  // Compute averages across all returned summaries
  const s = summaries ?? [];
  const count = s.length || 1;
  const avgCalories = Math.round(s.reduce((acc, d) => acc + d.calories, 0) / count);
  const avgProtein  = +(s.reduce((acc, d) => acc + (d.nutrition.protein_g ?? 0), 0) / count).toFixed(1);
  const avgCarbs    = +(s.reduce((acc, d) => acc + (d.nutrition.carbs_g   ?? 0), 0) / count).toFixed(1);
  const avgFat      = +(s.reduce((acc, d) => acc + (d.nutrition.fat_g     ?? 0), 0) / count).toFixed(1);
  const avgFiber    = +(s.reduce((acc, d) => acc + (d.nutrition.fiber_g   ?? 0), 0) / count).toFixed(1);

  return NextResponse.json({
    summaries: s,
    averages: {
      calories: avgCalories,
      nutrition: { protein_g: avgProtein, carbs_g: avgCarbs, fat_g: avgFat, fiber_g: avgFiber },
    },
    meals: meals ?? [],
  });
}
