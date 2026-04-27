-- ═══════════════════════════════════════════════════════════════════════════
--  Bite: Auth Migration — adds per-user data isolation
--  Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Add user_id columns ──────────────────────────────────────────────────
ALTER TABLE meals           ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE chat_messages   ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_goals      ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── 2. Indexes on user_id ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS meals_user_id_idx           ON meals           (user_id);
CREATE INDEX IF NOT EXISTS daily_summaries_user_id_idx ON daily_summaries (user_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx   ON chat_messages   (user_id);
CREATE INDEX IF NOT EXISTS user_goals_user_id_idx      ON user_goals      (user_id);

-- ─── 3. Fix daily_summaries unique constraint to include user_id ─────────────
-- (date alone is no longer unique — each user has their own per-date row)
ALTER TABLE daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_date_key;
ALTER TABLE daily_summaries ADD CONSTRAINT daily_summaries_date_user_key UNIQUE (date, user_id);

-- ─── 4. Drop old permissive policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all_meals"           ON meals;
DROP POLICY IF EXISTS "allow_all_daily_summaries" ON daily_summaries;
DROP POLICY IF EXISTS "allow_all_chat"            ON chat_messages;
DROP POLICY IF EXISTS "allow_all_goals"           ON user_goals;

-- ─── 5. New per-user RLS policies ────────────────────────────────────────────
CREATE POLICY "users_own_meals" ON meals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_daily_summaries" ON daily_summaries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_chat" ON chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 6. Update refresh_daily_summary to be user-aware ───────────────────────
CREATE OR REPLACE FUNCTION refresh_daily_summary(target_date date, target_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_calories   int;
  v_nutrition  jsonb;
  v_count      int;
BEGIN
  SELECT
    COALESCE(SUM(calories), 0),
    jsonb_build_object(
      'protein_g', COALESCE(SUM((nutrition->>'protein_g')::numeric), 0),
      'carbs_g',   COALESCE(SUM((nutrition->>'carbs_g')::numeric), 0),
      'fat_g',     COALESCE(SUM((nutrition->>'fat_g')::numeric), 0),
      'fiber_g',   COALESCE(SUM((nutrition->>'fiber_g')::numeric), 0)
    ),
    COUNT(*)
  INTO v_calories, v_nutrition, v_count
  FROM meals
  WHERE date_trunc('day', logged_at AT TIME ZONE 'UTC') = target_date::timestamp
    AND user_id = target_user_id;

  INSERT INTO daily_summaries (date, calories, nutrition, meal_count, updated_at, user_id)
  VALUES (target_date, v_calories, v_nutrition, v_count, now(), target_user_id)
  ON CONFLICT (date, user_id) DO UPDATE SET
    calories   = EXCLUDED.calories,
    nutrition  = EXCLUDED.nutrition,
    meal_count = EXCLUDED.meal_count,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- ─── 7. Update trigger to pass user_id ───────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_refresh_daily_summary()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM refresh_daily_summary(
    date_trunc('day', COALESCE(NEW.logged_at, OLD.logged_at) AT TIME ZONE 'UTC')::date,
    COALESCE(NEW.user_id, OLD.user_id)
  );
  RETURN NEW;
END;
$$;
