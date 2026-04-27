import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/chat/history — returns today's chat messages in chronological order
export async function GET() {
  const supabase = createServerSupabaseClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
