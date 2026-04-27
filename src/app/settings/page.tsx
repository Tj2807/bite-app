'use client';

import { useState, useEffect } from 'react';
import { UserGoals, DEFAULT_GOALS } from '@/types';
import { getGoals, saveGoals } from '@/lib/goals';

export default function SettingsPage() {
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [saved, setSaved]  = useState(false);

  useEffect(() => { setGoals(getGoals()); }, []);

  const handleSave = () => {
    saveGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (key: keyof UserGoals, val: string) =>
    setGoals(prev => ({ ...prev, [key]: Number(val) }));

  return (
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>settings</span>
            Settings
          </h1>
          <p className="text-body-md mt-2" style={{ color: 'var(--color-on-surface-variant)' }}>
            Customize your daily nutrition targets.
          </p>
        </div>

        {/* Goals card */}
        <div
          className="rounded-[24px] p-8 space-y-6"
          style={{
            backgroundColor: 'var(--color-surface-bright)',
            border: '1px solid rgba(193,200,194,0.2)',
            boxShadow: '0 4px 24px rgba(44,76,59,0.02)',
          }}
        >
          <h2 className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>Daily Nutrition Goals</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <GoalInput label="Daily Calories" unit="kcal" icon="local_fire_department"
              value={goals.calories} onChange={v => update('calories', v)} />
            <GoalInput label="Protein" unit="g" icon="egg"
              value={goals.protein_g} onChange={v => update('protein_g', v)} />
            <GoalInput label="Carbohydrates" unit="g" icon="grass"
              value={goals.carbs_g} onChange={v => update('carbs_g', v)} />
            <GoalInput label="Fat" unit="g" icon="water_drop"
              value={goals.fat_g} onChange={v => update('fat_g', v)} />
            <GoalInput label="Fiber" unit="g" icon="eco"
              value={goals.fiber_g} onChange={v => update('fiber_g', v)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 transition-colors text-label-sm"
              style={{
                padding: '12px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 2px 8px rgba(44,76,59,0.15)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {saved ? 'check' : 'save'}
              </span>
              {saved ? 'Saved!' : 'Save Goals'}
            </button>
            <button
              onClick={() => setGoals(DEFAULT_GOALS)}
              className="flex items-center gap-2 transition-colors text-label-sm"
              style={{
                padding: '12px 20px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: 'var(--color-on-surface-variant)',
                border: '1px solid rgba(193,200,194,0.5)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
              Reset
            </button>
          </div>
        </div>

        {/* About card */}
        <div
          className="rounded-[24px] p-8 space-y-3"
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            border: '1px solid rgba(193,200,194,0.15)',
          }}
        >
          <h2 className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>About Bite</h2>
          <div className="space-y-2 text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
            <p>🌱 Bite is your mindful eating companion — designed to make nutrition logging feel natural, not anxious.</p>
            <p>🤖 Powered by Gemini AI for intelligent meal understanding and personalized coaching.</p>
            <p>📊 Your data lives in Supabase and is never shared.</p>
          </div>
          <div
            className="text-label-sm pt-3 mt-3"
            style={{ borderTop: '1px solid rgba(193,200,194,0.3)', color: 'var(--color-outline)' }}
          >
            To diagnose AI issues, visit{' '}
            <a href="/api/chat/test" target="_blank" className="underline" style={{ color: 'var(--color-primary)' }}>
              /api/chat/test
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

function GoalInput({ label, unit, icon, value, onChange }: {
  label: string; unit: string; icon: string; value: number; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="text-label-sm uppercase tracking-wider flex items-center gap-1.5 mb-2"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all"
        style={{
          border: '1px solid rgba(193,200,194,0.4)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-body-md min-w-0 focus:outline-none"
          style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-sans)' }}
        />
        <span className="text-label-sm flex-shrink-0" style={{ color: 'var(--color-outline)' }}>{unit}</span>
      </div>
    </div>
  );
}
