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

  const { attempt_id } = await req.json();

  // Verify ownership
  const { data: attempt } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("id", attempt_id)
    .eq("user_id", user.id)
    .single();

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  // Calculate final score
  const { data: answers } = await supabaseAdmin
    .from("quiz_answers")
    .select("is_correct, area_id, question_id, selected_answer")
    .eq("attempt_id", attempt_id);

  if (!answers) {
    return NextResponse.json({ error: "No answers found" }, { status: 404 });
  }

  const total = answers.length;
  const correct = answers.filter((a) => a.is_correct).length;
  const percent = total > 0 ? Math.round((100 * correct) / total * 10) / 10 : 0;

  // Update attempt with final score
  await supabaseAdmin
    .from("quiz_attempts")
    .update({
      total_questions: total,
      correct_count: correct,
      score_percent: percent,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attempt_id);

  // Calculate per-area breakdown
  const areaMap: Record<number, { total: number; correct: number }> = {};
  for (const ans of answers) {
    if (!areaMap[ans.area_id]) {
      areaMap[ans.area_id] = { total: 0, correct: 0 };
    }
    areaMap[ans.area_id].total++;
    if (ans.is_correct) areaMap[ans.area_id].correct++;
  }

  const area_scores = Object.entries(areaMap).map(([areaId, data]) => ({
    area_id: parseInt(areaId),
    total: data.total,
    correct: data.correct,
    percent: data.total > 0 ? Math.round((100 * data.correct) / data.total * 10) / 10 : 0,
  }));

  // For practice quizzes, also return which questions were wrong with correct answers
  let wrong_questions: { question_id: number; question_text: string; selected_answer: string; correct_answer: string; area_id: number }[] = [];

  if (attempt.quiz_type !== "preassessment") {
    const wrongAnswers = answers.filter((a) => !a.is_correct);
    if (wrongAnswers.length > 0) {
      const questionIds = wrongAnswers.map((a) => a.question_id);
      const { data: questions } = await supabaseAdmin
        .from("questions")
        .select("id, question_text, correct_answer, area_id, choice_a, choice_b, choice_c, choice_d")
        .in("id", questionIds);

      if (questions) {
        wrong_questions = wrongAnswers.map((ans) => {
          const q = questions.find((q) => q.id === ans.question_id)!;
          return {
            question_id: q.id,
            question_text: q.question_text,
            selected_answer: ans.selected_answer,
            correct_answer: q.correct_answer,
            area_id: q.area_id,
          };
        });
      }
    }
  }

  return NextResponse.json({
    total,
    correct,
    percent,
    area_scores,
    wrong_questions,
    quiz_type: attempt.quiz_type,
  });
}
