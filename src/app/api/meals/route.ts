import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meals?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);

  // Prefer explicit UTC-boundary params sent by the client in its local timezone.
  // Fall back to a UTC-date-based range if not provided.
  let startOfDay: string;
  let endOfDay: string;
  const startParam = searchParams.get('start');
  const endParam   = searchParams.get('end');
  if (startParam && endParam) {
    startOfDay = startParam;
    endOfDay   = endParam;
  } else {
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    startOfDay = `${date}T00:00:00.000Z`;
    endOfDay   = `${date}T23:59:59.999Z`;
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', startOfDay)
    .lte('logged_at', endOfDay)
    .order('logged_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/meals — manual meal entry
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('meals')
    .insert({
      logged_at: body.logged_at ?? new Date().toISOString(),
      meal_name: body.meal_name,
      calories: body.calories,
      nutrition: body.nutrition ?? {},
      notes: body.notes,
      is_cheat_day: body.is_cheat_day ?? false,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/meals?id=uuid
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Ensure user only deletes their own meals
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
