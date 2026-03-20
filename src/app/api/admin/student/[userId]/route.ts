import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
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

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get student profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Get all completed attempts
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, quiz_type, area_id, total_questions, correct_count, score_percent, completed_at")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  const preAttempts = (attempts || []).filter((a) => a.quiz_type === "preassessment");
  const practiceAttempts = (attempts || []).filter((a) => a.quiz_type !== "preassessment");

  // Get pre-assessment answers by area (from latest pre-assessment)
  let preAreaScores: { area_id: number; correct: number; total: number; percent: number }[] = [];
  if (preAttempts.length > 0) {
    const latestPreId = preAttempts[0].id;
    const { data: preAnswers } = await supabaseAdmin
      .from("quiz_answers")
      .select("area_id, is_correct")
      .eq("attempt_id", latestPreId);

    if (preAnswers) {
      const areaMap: Record<number, { correct: number; total: number }> = {};
      for (const ans of preAnswers) {
        if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { correct: 0, total: 0 };
        areaMap[ans.area_id].total++;
        if (ans.is_correct) areaMap[ans.area_id].correct++;
      }
      preAreaScores = Object.entries(areaMap)
        .map(([aid, d]) => ({
          area_id: parseInt(aid),
          correct: d.correct,
          total: d.total,
          percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
        }))
        .sort((a, b) => a.area_id - b.area_id);
    }
  }

  // Get practice area averages
  let practiceAreaScores: { area_id: number; avg_percent: number; total_questions: number }[] = [];
  if (practiceAttempts.length > 0) {
    const practiceIds = practiceAttempts.map((a) => a.id);
    const { data: practiceAnswers } = await supabaseAdmin
      .from("quiz_answers")
      .select("area_id, is_correct")
      .in("attempt_id", practiceIds);

    if (practiceAnswers) {
      const areaMap: Record<number, { correct: number; total: number }> = {};
      for (const ans of practiceAnswers) {
        if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { correct: 0, total: 0 };
        areaMap[ans.area_id].total++;
        if (ans.is_correct) areaMap[ans.area_id].correct++;
      }
      practiceAreaScores = Object.entries(areaMap)
        .map(([aid, d]) => ({
          area_id: parseInt(aid),
          avg_percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
          total_questions: d.total,
        }))
        .sort((a, b) => a.area_id - b.area_id);
    }
  }

  // Determine areas needing support (below 50% in most recent data)
  const areasNeedingSupport: number[] = [];
  for (let areaId = 1; areaId <= 8; areaId++) {
    const practiceScore = practiceAreaScores.find((a) => a.area_id === areaId);
    const preScore = preAreaScores.find((a) => a.area_id === areaId);
    // Use practice score if exists, otherwise pre-assessment
    const score = practiceScore?.avg_percent ?? preScore?.percent ?? null;
    if (score !== null && score < 50) {
      areasNeedingSupport.push(areaId);
    }
  }

  return NextResponse.json({
    profile,
    preAttempts,
    practiceAttempts,
    preAreaScores,
    practiceAreaScores,
    areasNeedingSupport,
  });
}
