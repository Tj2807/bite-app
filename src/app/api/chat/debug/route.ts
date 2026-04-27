import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/chat/debug — check what chat_messages are in the DB + test write access
export async function GET() {
  const supabase = createServerSupabaseClient();

  // 1. Fetch last 20 messages
  const { data, error: readErr } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  // 2. Try a test insert then immediately delete it
  const { data: inserted, error: insertErr } = await supabase
    .from('chat_messages')
    .insert({ role: 'user', content: '__debug_test__' })
    .select('id')
    .single();

  let deleteErr = null;
  if (inserted?.id) {
    const { error: de } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', inserted.id);
    deleteErr = de?.message ?? null;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return NextResponse.json({
    total_returned: data?.length ?? 0,
    today_filter_utc: todayStart.toISOString(),
    read_error: readErr?.message ?? null,
    insert_error: insertErr?.message ?? null,
    insert_succeeded: !!inserted?.id,
    delete_error: deleteErr,
    messages: data ?? [],
  });
}
