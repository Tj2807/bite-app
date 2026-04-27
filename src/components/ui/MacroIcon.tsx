'use client';

// Monoline organic icons for each macro — matching the Bite design system

interface MacroIconProps {
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber';
  size?: number;
  className?: string;
}

export function MacroIcon({ type, size = 20, className = '' }: MacroIconProps) {
  const icons = {
    calories: (
      // Energy spark / soft flame
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M12 2C8 7 9 10 12 12c-3 1-4 4-2 7 3-2 3-5 1-7 2 0 5-2 5-5-1 1-3 1-4-5z" />
      </svg>
    ),
    protein: (
      // Bean / pod silhouette
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M7 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7z" />
        <path d="M12 5c1.5 2 1.5 5 0 7" />
      </svg>
    ),
    carbs: (
      // Grain stalk
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <line x1="12" y1="20" x2="12" y2="4" />
        <path d="M12 9 Q9 7 8 4" />
        <path d="M12 9 Q15 7 16 4" />
        <path d="M12 13 Q9 11 7 9" />
        <path d="M12 13 Q15 11 17 9" />
      </svg>
    ),
    fat: (
      // Avocado half
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M12 3C9 3 7 6 7 10c0 5 2 9 5 9s5-4 5-9c0-4-2-7-5-7z" />
        <circle cx="12" cy="13" r="2.5" />
      </svg>
    ),
    fiber: (
      // Leafy branch with 3 leaves
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M12 20 Q12 12 12 6" />
        <path d="M12 10 Q9 7 6 8 Q8 11 12 10z" />
        <path d="M12 10 Q15 7 18 8 Q16 11 12 10z" />
        <path d="M12 15 Q9 12 7 13 Q9 16 12 15z" />
      </svg>
    ),
  };

  return icons[type] ?? null;
}
