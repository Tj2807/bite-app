import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Preferred model order — we'll intersect with what's actually available for the key
const MODEL_PREFERENCE = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash-lite',
];

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set. Check your .env.local file.');
  return { genAI: new GoogleGenerativeAI(key), key };
}

// Fetch the list of models that actually support generateContent for this API key
async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const json = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    return (json.models ?? [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  } catch {
    return []; // fall back to trying all preferred models blindly
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(contextBlock: string, goalsBlock: string): string {
  return `You are Bite Assistant — a warm, encouraging AI nutrition coach in the "Bite: Mindful Eating" app.

USER'S DAILY GOALS: ${goalsBlock}

RECENT MEAL HISTORY (last 7 days):
${contextBlock}

PERSONALITY: Calm, grounded, and encouraging. Never preachy. Brief, natural language.

MEAL LOGGING: When the user mentions eating something, estimate the macros and respond naturally. Then append a JSON block at the END of your response (nothing after it):
\`\`\`json
{"action":"log_meal","meal_name":"...","calories":000,"nutrition":{"protein_g":0.0,"carbs_g":0.0,"fat_g":0.0,"fiber_g":0.0}}
\`\`\`

NUTRITION QUESTIONS: Give specific, data-backed insights using the history above. Keep it under 3 short paragraphs.

GREETINGS: Warm greeting + one insight from their recent logs + ask what they'd like to nourish themselves with.

Always be concise. The app is calm and intentional.`;
}

// ── Fetch recent context ──────────────────────────────────────────────────────
async function getRecentContext(userId: string): Promise<{ context: string; goals: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ data: summaries }, { data: goalsRows }] = await Promise.all([
      supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7),
      supabase.from('user_goals').select('*').eq('user_id', userId).limit(1),
    ]);

    const goals = goalsRows?.[0] ?? { calories: 1900, protein_g: 160, carbs_g: 180, fat_g: 60, fiber_g: 30 };
    const goalsBlock = `${goals.calories} kcal | P: ${goals.protein_g}g | C: ${goals.carbs_g}g | F: ${goals.fat_g}g | Fiber: ${goals.fiber_g}g`;

    if (!summaries?.length) return { context: 'No recent history yet.', goals: goalsBlock };

    const lines = summaries.map((s) => {
      const n = s.nutrition as Record<string, number>;
      return `${s.date}: ${s.calories} kcal | P:${n.protein_g?.toFixed(0)}g C:${n.carbs_g?.toFixed(0)}g F:${n.fat_g?.toFixed(0)}g Fi:${n.fiber_g?.toFixed(0)}g`;
    });
    return { context: lines.join('\n'), goals: goalsBlock };
  } catch {
    return { context: 'Unable to fetch history.', goals: '1900 kcal | P:160g | C:180g | F:60g | Fiber:30g' };
  }
}

// ── Extract JSON meal action ──────────────────────────────────────────────────
function extractMealAction(text: string): Record<string, unknown> | null {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

// ── Save meal to Supabase ─────────────────────────────────────────────────────
async function saveMeal(action: Record<string, unknown>, userId: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('meals').insert({
      logged_at: new Date().toISOString(),
      meal_name: action.meal_name,
      calories: action.calories,
      nutrition: action.nutrition,
      user_id: userId,
    });
  } catch (err) {
    console.error('[saveMeal]', err);
  }
}

// ── Main POST handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await req.json() as {
      messages: Array<{ role: string; content: string }>;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    let genAI: GoogleGenerativeAI;
    let apiKey: string;
    try {
      ({ genAI, key: apiKey } = getGenAI());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gemini API key not configured';
      console.error('[chat] API key error:', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const [{ context, goals }, availableModels] = await Promise.all([
      getRecentContext(user.id),
      getAvailableModels(apiKey),
    ]);
    const systemInstruction = buildSystemPrompt(context, goals);

    // Build model list: prefer our ordered list intersected with what's available,
    // then fall back to trying preferred list blindly if listModels failed.
    const modelsToTry = availableModels.length > 0
      ? [
          ...MODEL_PREFERENCE.filter(m => availableModels.includes(m)),
          // Also try any available generateContent model as last resort
          ...availableModels.filter(m =>
            !MODEL_PREFERENCE.includes(m) &&
            !m.includes('embedding') && !m.includes('aqa')
          ).slice(0, 2),
        ]
      : MODEL_PREFERENCE;

    console.log('[chat] Models to try:', modelsToTry);

    // Convert message history to Gemini format.
    // Gemini requires history to start with 'user' — strip any leading assistant messages.
    const allButLast = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const firstUserIdx = allButLast.findIndex((m) => m.role === 'user');
    const history = firstUserIdx >= 0 ? allButLast.slice(firstUserIdx) : [];
    const lastMessage = messages[messages.length - 1].content;

    // Try each model in order
    let rawText = '';
    let usedModel = '';
    let lastError: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        rawText = result.response.text();
        usedModel = modelName;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[chat] Model ${modelName} failed:`, lastError);
        continue;
      }
    }

    if (!rawText) {
      console.error('[chat] All models failed. Last error:', lastError);
      return NextResponse.json(
        { error: `AI unavailable: ${lastError}. Visit /api/chat/test to diagnose.` },
        { status: 503 }
      );
    }

    // Parse meal logging action
    const action = extractMealAction(rawText);
    let loggedMeal = null;

    if (action?.action === 'log_meal') {
      await saveMeal(action, user.id);
      loggedMeal = {
        name: action.meal_name as string,
        calories: action.calories as number,
        nutrition: action.nutrition as Record<string, number>,
      };
    }

    // Strip JSON block from displayed message
    const cleanMessage = rawText.replace(/```json[\s\S]*?```/g, '').trim();

    // Save chat history — insert sequentially so timestamps differ and ORDER BY works
    const supabase = createServerSupabaseClient();
    const { error: userSaveErr } = await supabase
      .from('chat_messages')
      .insert({ role: 'user', content: lastMessage, user_id: user.id });
    if (userSaveErr) console.error('[chat] Failed to save user message:', userSaveErr.message);

    const { error: assistantSaveErr } = await supabase
      .from('chat_messages')
      .insert({ role: 'assistant', content: cleanMessage, logged_meal: loggedMeal, user_id: user.id });
    if (assistantSaveErr) console.error('[chat] Failed to save assistant message:', assistantSaveErr.message);

    console.log(`[chat] Responded via ${usedModel}`);
    return NextResponse.json({ message: cleanMessage, logged_meal: loggedMeal });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    console.error('[chat] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
