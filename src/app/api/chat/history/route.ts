import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/chat/history — returns today's chat messages in chronological order
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  // Client sends its local midnight as a UTC ISO string so the query is
  // timezone-correct regardless of where the server runs (Vercel = UTC).
  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get('start');
  // Fallback: UTC midnight (legacy behaviour, fine for UTC users)
  const todayStartFallback = new Date();
  todayStartFallback.setUTCHours(0, 0, 0, 0);
  const startISO = startParam ?? todayStartFallback.toISOString();

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startISO)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
