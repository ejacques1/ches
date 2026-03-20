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

  const { attempt_id, question_id, selected_answer } = await req.json();

  if (!attempt_id || !question_id || !selected_answer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["a", "b", "c", "d"].includes(selected_answer)) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  // Verify the attempt belongs to this user
  const { data: attempt } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, user_id, quiz_type")
    .eq("id", attempt_id)
    .eq("user_id", user.id)
    .single();

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  // Check if already answered
  const { data: existing } = await supabaseAdmin
    .from("quiz_answers")
    .select("id")
    .eq("attempt_id", attempt_id)
    .eq("question_id", question_id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Already answered this question" }, { status: 400 });
  }

  // Look up correct answer server-side
  const { data: question } = await supabaseAdmin
    .from("questions")
    .select("correct_answer, area_id")
    .eq("id", question_id)
    .single();

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const is_correct = selected_answer === question.correct_answer;

  // Record the answer
  await supabaseAdmin.from("quiz_answers").insert({
    attempt_id,
    question_id,
    selected_answer,
    is_correct,
    area_id: question.area_id,
  });

  // For preassessment, don't reveal the correct answer
  if (attempt.quiz_type === "preassessment") {
    return NextResponse.json({ is_correct: null, correct_answer: null });
  }

  // For practice quizzes, reveal the correct answer
  return NextResponse.json({
    is_correct,
    correct_answer: question.correct_answer,
  });
}
