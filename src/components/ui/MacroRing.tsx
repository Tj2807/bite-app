'use client';

interface MacroRingProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;        // tailwind bg color class
  ringColor: string;    // hex for SVG stroke
}

export function MacroRing({ label, value, target, unit = 'g', color, ringColor }: MacroRingProps) {
  const pct = Math.min(value / target, 1);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const over = value > target;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[64px]">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 50 50" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="25" cy="25" r={radius} fill="none"
            stroke="#e9e8e4" strokeWidth="4" />
          {/* Progress */}
          <circle cx="25" cy="25" r={radius} fill="none"
            stroke={over ? '#ba1a1a' : ringColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center icon placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center rounded-full`}>
          <span className="text-[10px] font-semibold text-bite-on-surface-muted" style={{ fontFamily: 'var(--font-sans)' }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-bite-on-surface-muted">{label}</div>
        <div className="text-sm font-semibold text-bite-on-surface">
          {value}<span className="text-[10px] font-normal">{unit}</span>
        </div>
        <div className="text-[10px] text-bite-outline">/{target}{unit}</div>
      </div>
    </div>
  );
}
