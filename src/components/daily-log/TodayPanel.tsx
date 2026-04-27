'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Meal, UserGoals, DEFAULT_GOALS } from '@/types';
import { getGoals } from '@/lib/goals';

interface TodayPanelProps { refreshKey: number; }

export function TodayPanel({ refreshKey }: TodayPanelProps) {
  const [meals, setMeals]     = useState<Meal[]>([]);
  const [goals, setGoals]     = useState<UserGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);

  // Use local date (not UTC) so IST users past midnight see today's meals
  const todayStr = new Date().toLocaleDateString('en-CA'); // gives YYYY-MM-DD in local TZ

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${todayStr}`);
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch { setMeals([]); }
    finally { setLoading(false); }
  }, [todayStr]);

  useEffect(() => {
    setGoals(getGoals());
    fetchMeals();
  }, [refreshKey, fetchMeals]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein:  acc.protein  + (m.nutrition?.protein_g ?? 0),
      carbs:    acc.carbs    + (m.nutrition?.carbs_g   ?? 0),
      fat:      acc.fat      + (m.nutrition?.fat_g     ?? 0),
      fiber:    acc.fiber    + (m.nutrition?.fiber_g   ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const calPct = Math.min(totals.calories / goals.calories, 1);

  const handleDelete = async (id: string) => {
    await fetch(`/api/meals?id=${id}`, { method: 'DELETE' });
    fetchMeals();
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto scrollbar-thin"
      style={{ backgroundColor: 'var(--color-surface-container-low)' }}
    >
      <div className="p-8 lg:p-10 space-y-8 max-w-2xl mx-auto w-full">

        {/* ── Date header ───────────────────────────────────────────── */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>
              Today&apos;s Balance
            </h1>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(193,200,194,0.3)',
              color: 'var(--color-primary)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
          </button>
        </div>

        {/* ── Macro Bento Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Calories — full width */}
          <div
            className="col-span-2 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(193,200,194,0.2)',
              boxShadow: '0 4px 12px rgba(44,76,59,0.02)',
            }}
          >
            {/* Decorative bg icon */}
            <div className="absolute -right-4 -top-4" style={{ color: 'rgba(199,235,212,0.25)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>local_fire_department</span>
            </div>
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
                local_fire_department
              </span>
              <span className="text-label-sm uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                Energy
              </span>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <span className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>
                  {totals.calories.toLocaleString()}
                </span>
                <span className="text-body-md ml-1" style={{ color: 'var(--color-on-surface-variant)' }}>kcal</span>
              </div>
              <span className="text-label-sm" style={{ color: 'rgba(21,53,38,0.7)' }}>
                Target: {goals.calories.toLocaleString()}
              </span>
            </div>
            <div
              className="mt-4 w-full h-1 rounded-full overflow-hidden relative z-10"
              style={{ backgroundColor: 'var(--color-surface-container)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${calPct * 100}%`,
                  backgroundColor: totals.calories > goals.calories ? 'var(--color-error)' : 'var(--color-primary)',
                }}
              />
            </div>
          </div>

          {/* Protein */}
          <MacroCard
            icon="egg"
            label="Protein"
            value={totals.protein}
            target={goals.protein_g}
            bg="var(--color-surface)"
            iconBg="rgba(218,232,190,0.4)"
            iconColor="var(--color-secondary)"
            textColor="var(--color-primary)"
          />

          {/* Carbs */}
          <MacroCard
            icon="grass"
            label="Carbs"
            value={totals.carbs}
            target={goals.carbs_g}
            bg="var(--color-surface)"
            iconBg="rgba(199,235,212,0.35)"
            iconColor="var(--color-primary)"
            textColor="var(--color-primary)"
          />

          {/* Fat */}
          <MacroCard
            icon="water_drop"
            label="Fat"
            value={totals.fat}
            target={goals.fat_g}
            bg="var(--color-surface)"
            iconBg="rgba(229,226,216,0.6)"
            iconColor="var(--color-tertiary)"
            textColor="var(--color-tertiary)"
          />

          {/* Fiber */}
          <MacroCard
            icon="eco"
            label="Fiber"
            value={totals.fiber}
            target={goals.fiber_g}
            bg="var(--color-surface)"
            iconBg="var(--color-secondary-container)"
            iconColor="var(--color-secondary)"
            textColor="var(--color-secondary)"
          />
        </div>

        {/* ── Meals today ───────────────────────────────────────────── */}
        <div>
          <h3
            className="text-headline-sm mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-secondary)' }}>restaurant</span>
            Nourishment Today
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-[72px] rounded-lg animate-pulse"
                  style={{ backgroundColor: 'var(--color-surface-container)' }} />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--color-outline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                spa
              </span>
              <p className="text-body-md">Nothing logged yet today.</p>
              <p className="text-label-sm mt-1">Tell Bite what you ate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map(meal => (
                <MealRow key={meal.id} meal={meal} onDelete={() => handleDelete(meal.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MacroCard ─────────────────────────────────────────────────────────────────

function MacroCard({ icon, label, value, target, bg, iconBg, iconColor, textColor }: {
  icon: string; label: string; value: number; target: number;
  bg: string; iconBg: string; iconColor: string; textColor: string;
}) {
  return (
    <div
      className="p-5 rounded-xl flex flex-col justify-between"
      style={{
        backgroundColor: bg,
        border: '1px solid rgba(193,200,194,0.2)',
        boxShadow: '0 2px 8px rgba(44,76,59,0.02)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: iconColor }}>
            {icon}
          </span>
        </div>
        <span className="text-label-sm uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
          {label}
        </span>
      </div>
      <div>
        <span className="text-headline-md" style={{ color: textColor }}>{value.toFixed(0)}</span>
        <span className="text-body-md ml-1" style={{ color: 'var(--color-on-surface-variant)' }}>g</span>
      </div>
    </div>
  );
}

// ── MealRow ───────────────────────────────────────────────────────────────────

function MealRow({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
  const n = meal.nutrition;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="p-4 rounded-lg flex justify-between items-center transition-colors group cursor-default"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-secondary-fixed)' : 'rgba(218,232,190,0.5)'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-surface-container)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-on-surface-variant)' }}>
            restaurant
          </span>
        </div>
        <div>
          <h4 className="text-body-md font-medium" style={{ color: 'var(--color-on-surface)' }}>
            {meal.meal_name}
          </h4>
          <p className="text-label-sm mt-0.5" style={{ color: 'rgba(66,72,67,0.7)' }}>
            {format(new Date(meal.logged_at), 'h:mm a')}
            {n && ` · P:${n.protein_g?.toFixed(0)}g C:${n.carbs_g?.toFixed(0)}g F:${n.fat_g?.toFixed(0)}g`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-body-md" style={{ color: 'var(--color-primary)' }}>{meal.calories} kcal</span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-outline)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        </button>
      </div>
    </div>
  );
}
