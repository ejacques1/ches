/**
 * Seed script — run with:
 * node --env-file=.env.local scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const filePath = resolve(__dirname, "../ches_questions.json");
const raw = readFileSync(filePath, "utf-8");
const data = JSON.parse(raw);

const questions = data.questions;
console.log(`Found ${questions.length} questions to seed...`);

const rows = questions.map((q) => ({
  question_text: q.question,
  choice_a: q.choices.a,
  choice_b: q.choices.b,
  choice_c: q.choices.c,
  choice_d: q.choices.d,
  correct_answer: q.correct_answer,
  area_id: q.area_id,
  is_preassessment: false,
  needs_review: q.needs_review || false,
}));

let inserted = 0;
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50);
  const { error } = await supabase.from("questions").insert(batch);
  if (error) {
    console.error(`Error at batch starting at ${i}:`, error.message);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`Inserted ${inserted}/${rows.length}...`);
}

console.log(`\nDone! ${inserted} questions seeded.`);
console.log("Next step: Use the admin UI to mark 24-40 questions as pre-assessment.");
