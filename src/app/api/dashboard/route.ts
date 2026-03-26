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

  const userId = user.id;

  // Get profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", userId)
    .single();

  // Get completed pre-assessment (latest)
  const { data: preAttempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_type", "preassessment")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1);

  let preassessmentScores: { area_id: number; total: number; correct: number; percent: number }[] = [];
  let overallPreScore: number | null = null;

  if (preAttempts && preAttempts.length > 0) {
    overallPreScore = preAttempts[0].score_percent;

    const { data: preAnswers } = await supabaseAdmin
      .from("quiz_answers")
      .select("area_id, is_correct")
      .eq("attempt_id", preAttempts[0].id);

    if (preAnswers) {
      const preScoreMap: Record<number, { total: number; correct: number }> = {};
      for (const ans of preAnswers) {
        if (!preScoreMap[ans.area_id]) preScoreMap[ans.area_id] = { total: 0, correct: 0 };
        preScoreMap[ans.area_id].total++;
        if (ans.is_correct) preScoreMap[ans.area_id].correct++;
      }
      preassessmentScores = Object.entries(preScoreMap)
        .map(([aId, d]) => ({
          area_id: parseInt(aId),
          total: d.total,
          correct: d.correct,
          percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
        }))
        .sort((a, b) => a.area_id - b.area_id);
    }
  }

  // Get practice attempts
  const { data: practiceAttempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .in("quiz_type", ["area", "comprehensive"])
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  let overallPracticeScore: number | null = null;
  if (practiceAttempts && practiceAttempts.length > 0) {
    const totalCorrect = practiceAttempts.reduce((sum, a) => sum + a.correct_count, 0);
    const totalQs = practiceAttempts.reduce((sum, a) => sum + a.total_questions, 0);
    overallPracticeScore = totalQs > 0 ? Math.round((100 * totalCorrect) / totalQs * 10) / 10 : 0;
  }

  // Get question counts per area (non-preassessment, active)
  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("area_id")
    .eq("is_preassessment", false)
    .eq("needs_review", false);

  const questionCounts: Record<number, number> = {};
  if (questions) {
    for (const q of questions) {
      questionCounts[q.area_id] = (questionCounts[q.area_id] || 0) + 1;
    }
  }

  return NextResponse.json({
    profile: {
      full_name: profile?.full_name || user.email || "Student",
      is_admin: profile?.is_admin || false,
    },
    hasPreassessment: preAttempts && preAttempts.length > 0,
    overallPreScore,
    preassessmentScores,
    practiceAttempts: practiceAttempts || [],
    overallPracticeScore,
    questionCounts,
  });
}
