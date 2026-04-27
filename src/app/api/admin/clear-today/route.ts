import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/admin/clear-today — deletes today's chat messages, meals, and daily summary
// DELETE THIS FILE after use
export async function POST() {
  const supabase = createServerSupabaseClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStr = todayStart.toISOString();
  const todayDate = todayStr.split('T')[0];

  const [chatRes, mealsRes, summaryRes] = await Promise.all([
    supabase.from('chat_messages').delete().gte('created_at', todayStr),
    supabase.from('meals').delete().gte('logged_at', todayStr),
    supabase.from('daily_summaries').delete().eq('date', todayDate),
  ]);

  return NextResponse.json({
    chat_messages: chatRes.error ? `ERROR: ${chatRes.error.message}` : 'cleared',
    meals: mealsRes.error ? `ERROR: ${mealsRes.error.message}` : 'cleared',
    daily_summaries: summaryRes.error ? `ERROR: ${summaryRes.error.message}` : 'cleared',
    date_cleared: todayDate,
  });
}
