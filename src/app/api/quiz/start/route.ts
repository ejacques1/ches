import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quiz_type, area_id, question_count } = await req.json();

  // Validate quiz_type
  if (!["preassessment", "area", "comprehensive"].includes(quiz_type)) {
    return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
  }

  // Build question query — exclude correct_answer from response, exclude needs_review questions
  let query = supabaseAdmin
    .from("questions")
    .select("id, question_text, choice_a, choice_b, choice_c, choice_d, area_id")
    .eq("needs_review", false);

  if (quiz_type === "preassessment") {
    query = query.eq("is_preassessment", true);
  } else if (quiz_type === "area") {
    if (!area_id || area_id < 1 || area_id > 8) {
      return NextResponse.json({ error: "Invalid area_id" }, { status: 400 });
    }
    query = query.eq("is_preassessment", false).eq("area_id", area_id);
  } else {
    // comprehensive — all non-preassessment questions
    query = query.eq("is_preassessment", false);
  }

  const { data: questions, error: qError } = await query;

  if (qError) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No questions available" }, { status: 404 });
  }

  // Shuffle questions
  let shuffled = [...questions].sort(() => Math.random() - 0.5);

  // For comprehensive, optionally limit question count
  if (quiz_type === "comprehensive" && question_count && question_count < shuffled.length) {
    shuffled = shuffled.slice(0, question_count);
  }

  // For preassessment, keep them in a fixed order by id
  if (quiz_type === "preassessment") {
    shuffled = [...questions].sort((a, b) => a.id - b.id);
  }

  // Create quiz attempt
  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_type,
      area_id: quiz_type === "area" ? area_id : null,
      total_questions: shuffled.length,
      correct_count: 0,
      score_percent: 0,
    })
    .select("id")
    .single();

  if (attemptError) {
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
  }

  return NextResponse.json({
    attempt_id: attempt.id,
    questions: shuffled,
    total: shuffled.length,
  });
}
