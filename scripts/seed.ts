/**
 * Seed script — run with:
 * npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Make sure .env.local exists with these values.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  const filePath = resolve(__dirname, "../ches_questions.json");
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const questions = data.questions;
  console.log(`Found ${questions.length} questions to seed...`);

  const rows = questions.map((q: Record<string, unknown>) => {
    const choices = q.choices as Record<string, string>;
    return {
      question_text: q.question as string,
      choice_a: choices.a,
      choice_b: choices.b,
      choice_c: choices.c,
      choice_d: choices.d,
      correct_answer: q.correct_answer as string,
      area_id: q.area_id as number,
      is_preassessment: false,
      needs_review: (q.needs_review as boolean) || false,
    };
  });

  // Insert in batches of 50
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
}

seed();
