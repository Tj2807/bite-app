// ─── Nutrition Types ─────────────────────────────────────────────────────────

export interface Nutrition {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  [key: string]: number; // extensible for future macros
}

export interface Meal {
  id: string;
  logged_at: string;          // ISO date string
  meal_name: string;
  calories: number;
  nutrition: Nutrition;
  notes?: string;
  is_cheat_day?: boolean;
}

export interface DailySummary {
  id: string;
  date: string;               // YYYY-MM-DD
  calories: number;
  nutrition: Nutrition;
  is_cheat_day?: boolean;
  meal_count?: number;
}

export interface UserGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  logged_meal?: LoggedMealCard | null; // structured meal card shown after logging
  created_at: string;
}

export interface LoggedMealCard {
  name: string;
  calories: number;
  nutrition: Nutrition;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ChatApiResponse {
  message: string;
  logged_meal?: LoggedMealCard | null;
}

export interface TrendsData {
  summaries: DailySummary[];
  averages: {
    calories: number;
    nutrition: Nutrition;
  };
  meals: Meal[];
}

// ─── Default Goals ────────────────────────────────────────────────────────────

export const DEFAULT_GOALS: UserGoals = {
  calories: 1900,
  protein_g: 160,
  carbs_g: 180,
  fat_g: 60,
  fiber_g: 30,
};
