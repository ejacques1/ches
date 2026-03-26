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

  // Check for completed pre-assessment
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_type", "preassessment")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1);

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ completed: false });
  }

  const attempt = attempts[0];

  // Get area scores
  const { data: answers } = await supabaseAdmin
    .from("quiz_answers")
    .select("area_id, is_correct")
    .eq("attempt_id", attempt.id);

  const areaMap: Record<number, { total: number; correct: number }> = {};
  if (answers) {
    for (const ans of answers) {
      if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { total: 0, correct: 0 };
      areaMap[ans.area_id].total++;
      if (ans.is_correct) areaMap[ans.area_id].correct++;
    }
  }

  const area_scores = Object.entries(areaMap)
    .map(([aId, d]) => ({
      area_id: parseInt(aId),
      total: d.total,
      correct: d.correct,
      percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
    }))
    .sort((a, b) => a.area_id - b.area_id);

  return NextResponse.json({
    completed: true,
    total_questions: attempt.total_questions,
    correct_count: attempt.correct_count,
    score_percent: attempt.score_percent,
    completed_at: attempt.completed_at,
    area_scores,
  });
}
