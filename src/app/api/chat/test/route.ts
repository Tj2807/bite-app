import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'GEMINI_API_KEY is not set in .env.local' },
      { status: 500 }
    );
  }

  const maskedKey = `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;

  // Step 1: list available models via raw fetch so we can see exactly what the key has access to
  let availableModels: string[] = [];
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listJson = await listRes.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    availableModels = (listJson.models ?? [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  } catch (err) {
    return NextResponse.json(
      { ok: false, apiKey: maskedKey, error: `Could not reach Gemini API: ${err}` },
      { status: 500 }
    );
  }

  if (availableModels.length === 0) {
    return NextResponse.json({
      ok: false,
      apiKey: maskedKey,
      error: 'API key works but no generateContent-capable models found. The key may lack Gemini API access.',
      suggestion: 'Go to https://aistudio.google.com/apikey and create a new key, then update GEMINI_API_KEY in .env.local',
    }, { status: 500 });
  }

  // Step 2: try to generate content with the first available model
  const genAI = new GoogleGenerativeAI(apiKey);

  // Prefer flash models, fall back to whatever is available
  const preferred = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
  const toTry = [
    ...preferred.filter(m => availableModels.includes(m)),
    ...availableModels.filter(m => !preferred.includes(m) && !m.includes('embedding') && !m.includes('aqa')),
  ].slice(0, 3);

  let lastError: string | null = null;
  for (const modelName of toTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Bite is ready!" in 5 words or less.');
      return NextResponse.json({
        ok: true,
        model: modelName,
        apiKey: maskedKey,
        response: result.response.text(),
        availableModels,
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: false,
    apiKey: maskedKey,
    availableModels,
    triedModels: toTry,
    lastError,
  }, { status: 500 });
}
