import { UserGoals, DEFAULT_GOALS } from '@/types';

const GOALS_KEY = 'bite_goals';

export function getGoals(): UserGoals {
  if (typeof window === 'undefined') return DEFAULT_GOALS;
  try {
    const stored = localStorage.getItem(GOALS_KEY);
    return stored ? { ...DEFAULT_GOALS, ...JSON.parse(stored) } : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: UserGoals): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
