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

  // Get question counts per area
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

  // Get practice scores per area
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", user.id)
    .in("quiz_type", ["area", "comprehensive"])
    .not("completed_at", "is", null);

  const areaScores: Record<number, { correct: number; total: number }> = {};
  if (attempts && attempts.length > 0) {
    const attemptIds = attempts.map((a) => a.id);
    const { data: answers } = await supabaseAdmin
      .from("quiz_answers")
      .select("area_id, is_correct")
      .in("attempt_id", attemptIds);

    if (answers) {
      for (const ans of answers) {
        if (!areaScores[ans.area_id]) areaScores[ans.area_id] = { correct: 0, total: 0 };
        areaScores[ans.area_id].total++;
        if (ans.is_correct) areaScores[ans.area_id].correct++;
      }
    }
  }

  const areaScorePercents: Record<number, number> = {};
  for (const [aId, d] of Object.entries(areaScores)) {
    areaScorePercents[parseInt(aId)] = d.total > 0 ? Math.round((100 * d.correct) / d.total) : 0;
  }

  return NextResponse.json({
    questionCounts,
    areaScores: areaScorePercents,
  });
}
