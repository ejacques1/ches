import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
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

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all non-admin students
  const { data: students } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("is_admin", false);

  const studentIds = (students || []).map((s) => s.id);

  if (studentIds.length === 0) {
    return NextResponse.json({
      class_area_scores: [],
      preassessment_area_scores: [],
      practice_area_scores: [],
      total_students: 0,
      students_completed_preassessment: 0,
      students_with_practice: 0,
    });
  }

  // Get all completed attempts for students
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, user_id, quiz_type")
    .in("user_id", studentIds)
    .not("completed_at", "is", null);

  const allAttemptIds = (attempts || []).map((a) => a.id);
  const preAttemptIds = (attempts || []).filter((a) => a.quiz_type === "preassessment").map((a) => a.id);
  const practiceAttemptIds = (attempts || []).filter((a) => a.quiz_type !== "preassessment").map((a) => a.id);

  // Students who completed preassessment
  const preStudents = new Set((attempts || []).filter((a) => a.quiz_type === "preassessment").map((a) => a.user_id));
  const practiceStudents = new Set((attempts || []).filter((a) => a.quiz_type !== "preassessment").map((a) => a.user_id));

  // Get all answers
  const { data: allAnswers } = allAttemptIds.length > 0
    ? await supabaseAdmin
        .from("quiz_answers")
        .select("area_id, is_correct, attempt_id")
        .in("attempt_id", allAttemptIds)
    : { data: [] };

  // Calculate area scores for different groupings
  function calcAreaScores(answerList: typeof allAnswers, label: string) {
    const areaMap: Record<number, { correct: number; total: number; students: Set<string> }> = {};
    for (const ans of answerList || []) {
      if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { correct: 0, total: 0, students: new Set() };
      areaMap[ans.area_id].total++;
      if (ans.is_correct) areaMap[ans.area_id].correct++;
      // Find which student this belongs to
      const attempt = (attempts || []).find((a) => a.id === ans.attempt_id);
      if (attempt) areaMap[ans.area_id].students.add(attempt.user_id);
    }
    return Object.entries(areaMap)
      .map(([aid, d]) => ({
        area_id: parseInt(aid),
        avg_percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
        total_questions: d.total,
        correct_count: d.correct,
        student_count: d.students.size,
      }))
      .sort((a, b) => a.area_id - b.area_id);
  }

  const preAnswers = (allAnswers || []).filter((a) => preAttemptIds.includes(a.attempt_id));
  const practiceAnswers = (allAnswers || []).filter((a) => practiceAttemptIds.includes(a.attempt_id));

  // Combined scores (practice weighted more if exists, fallback to pre)
  const combinedAreaScores = calcAreaScores(allAnswers, "combined");
  const preAreaScores = calcAreaScores(preAnswers, "preassessment");
  const practiceAreaScores = calcAreaScores(practiceAnswers, "practice");

  return NextResponse.json({
    class_area_scores: combinedAreaScores,
    preassessment_area_scores: preAreaScores,
    practice_area_scores: practiceAreaScores,
    total_students: studentIds.length,
    students_completed_preassessment: preStudents.size,
    students_with_practice: practiceStudents.size,
  });
}
