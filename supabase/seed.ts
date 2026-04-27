/**
 * Bite — Seed Script
 * Imports historical meal data from seed_meals.json into Supabase.
 *
 * Run with:
 *   npx tsx supabase/seed.ts
 *
 * Requires .env.local to be set up with Supabase credentials.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  const mealsPath = path.join(__dirname, 'seed_meals.json');
  const meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8'));

  console.log(`🌱  Seeding ${meals.length} meals…`);

  // Insert in batches of 50
  const BATCH = 50;
  for (let i = 0; i < meals.length; i += BATCH) {
    const batch = meals.slice(i, i + BATCH);
    const { error } = await supabase.from('meals').insert(batch);
    if (error) {
      console.error(`❌  Batch ${i / BATCH + 1} failed:`, error.message);
    } else {
      console.log(`✅  Batch ${i / BATCH + 1} inserted (${batch.length} rows)`);
    }
  }

  // Verify daily_summaries were auto-created by trigger
  const { count } = await supabase
    .from('daily_summaries')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎉  Done! ${count} daily summaries auto-generated.`);
}

seed().catch(console.error);
