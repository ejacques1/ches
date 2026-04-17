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

  // Check admin status using service role (bypasses RLS)
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all non-admin profiles
  // Get all profiles (students and admins)
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, is_admin")
    .order("full_name");

  // Get all completed quiz attempts
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, user_id, quiz_type, area_id, score_percent, completed_at")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  // Get all quiz answers for practice attempts to compute per-area scores for comprehensive quizzes
  const practiceAttemptIds = (attempts || [])
    .filter((a) => a.quiz_type === "area" || a.quiz_type === "comprehensive")
    .map((a) => a.id);

  let allAnswers: { attempt_id: string; area_id: number; is_correct: boolean }[] = [];
  if (practiceAttemptIds.length > 0) {
    const { data: answers } = await supabaseAdmin
      .from("quiz_answers")
      .select("attempt_id, area_id, is_correct")
      .in("attempt_id", practiceAttemptIds);
    allAnswers = answers || [];
  }

  const students = (profiles || []).map((p) => {
    const userAttempts = attempts?.filter((a) => a.user_id === p.id) ?? [];
    const preAttempt = userAttempts.find((a) => a.quiz_type === "preassessment");
    const practiceAttempts = userAttempts.filter(
      (a) => a.quiz_type === "area" || a.quiz_type === "comprehensive"
    );
    const latestPractice = practiceAttempts[0];

    // Build per-area practice scores from quiz_answers
    const userPracticeIds = practiceAttempts.map((a) => a.id);
    const userAnswers = allAnswers.filter((ans) => userPracticeIds.includes(ans.attempt_id));
    const areaScores: Record<number, { correct: number; total: number }> = {};
    for (const ans of userAnswers) {
      if (!areaScores[ans.area_id]) areaScores[ans.area_id] = { correct: 0, total: 0 };
      areaScores[ans.area_id].total++;
      if (ans.is_correct) areaScores[ans.area_id].correct++;
    }
    const areas_practiced: { area_id: number; score: number }[] = [];
    for (const [aId, data] of Object.entries(areaScores)) {
      areas_practiced.push({
        area_id: parseInt(aId),
        score: data.total > 0 ? Math.round((100 * data.correct) / data.total) : 0,
      });
    }
    areas_practiced.sort((a, b) => a.area_id - b.area_id);

    return {
      id: p.id,
      full_name: p.full_name || "—",
      email: p.email,
      is_admin: p.is_admin,
      preassessment_date: preAttempt?.completed_at ?? null,
      preassessment_score: preAttempt?.score_percent ?? null,
      practice_count: practiceAttempts.length,
      latest_practice_score: latestPractice?.score_percent ?? null,
      areas_practiced,
    };
  });

  return NextResponse.json({ students });
}
