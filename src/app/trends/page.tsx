'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import Image from 'next/image';
import { TrendsData, Meal, DEFAULT_GOALS } from '@/types';
import { getGoals } from '@/lib/goals';

type Range = '7d' | '30d' | 'all';

export default function TrendsPage() {
  const [data, setData]     = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]   = useState<Range>('all');
  const goals = getGoals();

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trends?range=${range}`);
      setData(await res.json());
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  const avg = data?.averages;
  const summaries = data?.summaries ?? [];
  const meals = data?.meals ?? [];

  const chartData = summaries.map(s => ({
    date: format(parseISO(s.date), 'EEE'),
    fullDate: s.date,
    calories: s.calories,
    isCheat: s.is_cheat_day,
  }));

  return (
    <AppShell>
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 w-full p-4 md:p-6 xl:p-10 pb-24 md:pb-10">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="space-y-8">

          {/* ── Header + Filters ──────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 md:pt-0">
            <div>
              <h1 className="text-headline-lg flex items-center gap-3" style={{ color: 'var(--color-primary)' }}>
                <Image src="/logo.png" alt="Bite" width={40} height={40} className="rounded-lg object-contain" />
                <span>Bite Trends</span>
              </h1>
              <p className="text-body-md mt-2" style={{ color: 'var(--color-on-surface-variant)' }}>
                Observing the natural rhythm of your nourishment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FilterBtn active={range === 'all'} onClick={() => setRange('all')}>
                All Time
              </FilterBtn>
              <FilterBtn active={range === '7d'} onClick={() => setRange('7d')}>
                Last 7 Days
              </FilterBtn>
              <FilterBtn active={range === '30d'} onClick={() => setRange('30d')}>
                Monthly
              </FilterBtn>
            </div>
          </div>

          {loading ? <LoadingSkeleton /> : (
            <>
              {/* ── Macro Distribution Bento Grid ─────────────────────── */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Summary card */}
                <div
                  className="lg:col-span-4 rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface-bright)',
                    border: '1px solid rgba(193,200,194,0.2)',
                    boxShadow: '0 8px 32px rgba(44,76,59,0.03)',
                    minHeight: '320px',
                  }}
                >
                  {/* Ambient glow */}
                  <div
                    className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: 'rgba(171,207,184,0.15)', filter: 'blur(48px)' }}
                  />
                  <div className="relative z-10">
                    <h2 className="text-headline-sm mb-8" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Average Daily Intake
                    </h2>
                    <div className="flex flex-col mb-8">
                      <div className="flex items-baseline gap-2">
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', lineHeight: 1.1, fontWeight: 600, color: 'var(--color-primary)' }}>
                          {avg?.calories?.toLocaleString() ?? '—'}
                        </span>
                        <span className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>kcal</span>
                      </div>
                      <div className="text-body-md mt-1" style={{ color: 'var(--color-outline)' }}>
                        Target: {goals.calories.toLocaleString()} kcal
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <div className="flex justify-between text-label-sm mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                      <span>Macro Balance</span>
                    </div>
                    <MacroBar
                      protein={avg?.nutrition.protein_g ?? 0}
                      carbs={avg?.nutrition.carbs_g ?? 0}
                      fat={avg?.nutrition.fat_g ?? 0}
                    />
                  </div>
                </div>

                {/* Macro cards grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MacroDetailCard
                    icon="grass" label="Carbs"
                    value={avg?.nutrition.carbs_g} target={goals.carbs_g}
                    pct={avg && goals.carbs_g ? Math.round((avg.nutrition.carbs_g / goals.carbs_g) * 100) : 0}
                    bg="#f2f6f1" border="#e3ebe1"
                    iconBg="var(--color-primary-container)" iconColor="var(--color-on-primary-container)"
                    valueColor="var(--color-primary)" badgeBg="rgba(44,76,59,0.1)" badgeColor="rgba(44,76,59,0.8)"
                  />
                  <MacroDetailCard
                    icon="egg_alt" label="Protein"
                    value={avg?.nutrition.protein_g} target={goals.protein_g}
                    pct={avg && goals.protein_g ? Math.round((avg.nutrition.protein_g / goals.protein_g) * 100) : 0}
                    bg="#f5f3eb" border="#e8e4d5"
                    iconBg="var(--color-secondary-container)" iconColor="var(--color-on-secondary-container)"
                    valueColor="var(--color-secondary)" badgeBg="rgba(86,99,66,0.12)" badgeColor="var(--color-secondary)"
                  />
                  <MacroDetailCard
                    icon="water_drop" label="Fat"
                    value={avg?.nutrition.fat_g} target={goals.fat_g}
                    pct={avg && goals.fat_g ? Math.round((avg.nutrition.fat_g / goals.fat_g) * 100) : 0}
                    bg="#f0f0ea" border="#e4e3dc"
                    iconBg="var(--color-tertiary-container)" iconColor="var(--color-on-tertiary-container)"
                    valueColor="var(--color-tertiary)" badgeBg="rgba(48,48,40,0.1)" badgeColor="var(--color-tertiary)"
                  />
                  <MacroDetailCard
                    icon="eco" label="Fiber"
                    value={avg?.nutrition.fiber_g} target={goals.fiber_g}
                    pct={avg && goals.fiber_g ? Math.round((avg.nutrition.fiber_g / goals.fiber_g) * 100) : 0}
                    bg="#f4f4f0" border="#e3e2df"
                    iconBg="var(--color-surface-tint)" iconColor="var(--color-on-primary)"
                    valueColor="var(--color-surface-tint)" badgeBg="rgba(69,101,83,0.1)" badgeColor="var(--color-surface-tint)"
                  />
                </div>
              </section>

              {/* ── Calorie bar chart ──────────────────────────────────── */}
              {chartData.length > 0 && (
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: 'var(--color-surface-bright)',
                    border: '1px solid rgba(193,200,194,0.2)',
                    boxShadow: '0 4px 24px rgba(44,76,59,0.02)',
                  }}
                >
                  <h2 className="text-headline-sm mb-5" style={{ color: 'var(--color-on-surface)' }}>Daily Calories</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barSize={28} margin={{ left: -24, right: 8 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#727973', fontFamily: 'Plus Jakarta Sans' }}
                        axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#727973', fontFamily: 'Plus Jakarta Sans' }}
                        axisLine={false} tickLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={{
                              backgroundColor: 'white', border: '1px solid var(--color-outline-variant)',
                              borderRadius: '12px', padding: '10px 14px', fontSize: '13px',
                              fontFamily: 'Plus Jakarta Sans', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            }}>
                              <p style={{ color: 'var(--color-on-surface)', fontWeight: 500 }}>{d.fullDate}</p>
                              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{d.calories} kcal</p>
                              {d.isCheat && <p style={{ color: 'var(--color-error)', fontSize: '11px' }}>Cheat day 🍕</p>}
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={goals.calories} stroke="var(--color-outline-variant)" strokeDasharray="3 3" />
                      <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i}
                            fill={entry.isCheat ? '#ffdad6' : entry.calories > goals.calories ? '#ba1a1a' : '#2c4c3b'}
                            opacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ── Log History ───────────────────────────────────────── */}
              <section className="pt-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Log History</h2>
                  <button className="text-label-sm flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--color-primary)' }}>
                    View Full <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                </div>

                {meals.length === 0 ? (
                  <div className="text-center py-16" style={{ color: 'var(--color-outline)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>
                      spa
                    </span>
                    <p className="text-body-md">No meals in this period.</p>
                  </div>
                ) : (
                  <div
                    className="rounded-[24px] overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-surface-bright)',
                      border: '1px solid rgba(193,200,194,0.2)',
                      boxShadow: '0 4px 24px rgba(44,76,59,0.02)',
                    }}
                  >
                    {/* Header row */}
                    <div
                      className="hidden md:grid gap-6 px-8 py-5 text-label-sm uppercase tracking-wider"
                      style={{
                        gridTemplateColumns: '2fr 4fr 2fr 4fr',
                        borderBottom: '1px solid rgba(193,200,194,0.2)',
                        backgroundColor: 'var(--color-surface-container)',
                        color: 'var(--color-on-surface-variant)',
                      }}
                    >
                      <span>Date &amp; Time</span>
                      <span>Meal Description</span>
                      <span className="text-right">Calories</span>
                      <span className="text-right">Macros (P / C / F)</span>
                    </div>

                    <div style={{ borderTop: '1px solid transparent' }}>
                      {meals.map((meal) => (
                        <HistoryRow key={meal.id} meal={meal} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-label-sm transition-all hover:-translate-y-0.5"
      style={{
        padding: '10px 20px',
        borderRadius: '9999px',
        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-container)',
        color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
        border: active ? 'none' : '1px solid rgba(193,200,194,0.3)',
        boxShadow: active ? '0 4px 12px rgba(44,76,59,0.08)' : 'none',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </button>
  );
}

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat || 1;
  return (
    <div className="w-full h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
      <div className="h-full relative group" style={{ width: `${(carbs/total)*100}%`, backgroundColor: 'var(--color-primary-container)', borderRight: '1px solid var(--color-surface-bright)' }} title={`Carbs: ${Math.round((carbs/total)*100)}%`} />
      <div className="h-full relative group" style={{ width: `${(protein/total)*100}%`, backgroundColor: 'var(--color-secondary-container)', borderRight: '1px solid var(--color-surface-bright)' }} title={`Protein: ${Math.round((protein/total)*100)}%`} />
      <div className="h-full relative group" style={{ width: `${(fat/total)*100}%`, backgroundColor: 'var(--color-tertiary-container)' }} title={`Fat: ${Math.round((fat/total)*100)}%`} />
    </div>
  );
}

function MacroDetailCard({ icon, label, value, target, pct, bg, border, iconBg, iconColor, valueColor, badgeBg, badgeColor }: {
  icon: string; label: string; value?: number; target: number; pct: number;
  bg: string; border: string; iconBg: string; iconColor: string;
  valueColor: string; badgeBg: string; badgeColor: string;
}) {
  return (
    <div
      className="rounded-[32px] p-7 flex flex-col justify-between"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconBg, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: iconColor }}>{icon}</span>
          </div>
          <span className="text-headline-sm" style={{ color: valueColor }}>{label}</span>
        </div>
        <span
          className="text-label-sm px-3 py-1 rounded-full"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {pct}%
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', lineHeight: 1, color: valueColor }}>
            {value?.toFixed(0) ?? '—'}
          </span>
          <span className="text-body-md" style={{ color: `${valueColor}99` }}>g</span>
        </div>
        <div className="text-body-md mt-2" style={{ color: `${valueColor}66` }}>Target: {target}g</div>
      </div>
    </div>
  );
}

function HistoryRow({ meal }: { meal: Meal }) {
  const n = meal.nutrition;
  const loggedAt = parseISO(meal.logged_at);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 gap-6 px-8 py-6 transition-colors items-center group"
      style={{
        borderBottom: '1px solid rgba(193,200,194,0.1)',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Date */}
      <div className="col-span-1 md:col-span-2 flex md:block justify-between items-center">
        <span className="text-body-md font-medium block" style={{ color: 'var(--color-on-surface)' }}>
          {format(loggedAt, 'MMM d')}
        </span>
        <span className="text-label-sm mt-1 block" style={{ color: 'var(--color-outline)' }}>
          {format(loggedAt, 'h:mm a')}
        </span>
      </div>

      {/* Meal name */}
      <div className="col-span-1 md:col-span-4 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid rgba(193,200,194,0.3)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-on-surface-variant)' }}>
            restaurant
          </span>
        </div>
        <div>
          <h4 className="text-body-lg font-medium leading-tight" style={{ color: 'var(--color-on-surface)', fontSize: '18px' }}>
            {meal.meal_name}
          </h4>
          {meal.notes && (
            <p className="text-label-sm mt-1 truncate" style={{ color: 'var(--color-outline)', maxWidth: '200px' }}>
              {meal.notes}
            </p>
          )}
        </div>
      </div>

      {/* Calories */}
      <div className="col-span-1 md:col-span-2 flex md:block justify-between items-center md:text-right">
        <span className="md:hidden text-label-sm uppercase" style={{ color: 'var(--color-outline)' }}>Calories</span>
        <span className="text-body-md font-medium" style={{ color: 'var(--color-primary)' }}>{meal.calories} kcal</span>
      </div>

      {/* Macros */}
      <div className="col-span-1 md:col-span-4 flex md:block justify-between items-center md:text-right">
        <span className="md:hidden text-label-sm uppercase" style={{ color: 'var(--color-outline)' }}>Macros</span>
        <div className="flex justify-end gap-2">
          <MacroChip value={n?.protein_g} label="P" bg="#f5f3eb" color="var(--color-secondary)" border="#e8e4d5" />
          <MacroChip value={n?.carbs_g}   label="C" bg="#f2f6f1" color="var(--color-primary)"   border="#e3ebe1" />
          <MacroChip value={n?.fat_g}     label="F" bg="#f0f0ea" color="var(--color-tertiary)"  border="#e4e3dc" />
        </div>
      </div>
    </div>
  );
}

function MacroChip({ value, label, bg, color, border }: {
  value?: number; label: string; bg: string; color: string; border: string;
}) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-lg text-label-sm"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}`, fontFamily: 'var(--font-sans)' }}
    >
      {value?.toFixed(0) ?? '—'}g
      <span className="ml-1" style={{ fontSize: '10px', opacity: 0.7 }}>{label}</span>
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-[32px] h-80" style={{ backgroundColor: 'var(--color-surface-container)' }} />
        <div className="lg:col-span-8 grid grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-[32px] h-44" style={{ backgroundColor: 'var(--color-surface-container)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
