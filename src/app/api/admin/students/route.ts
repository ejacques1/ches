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
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, is_admin")
    .eq("is_admin", false)
    .order("full_name");

  // Get all completed quiz attempts
  const { data: attempts } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, user_id, quiz_type, score_percent, completed_at")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  const students = (profiles || []).map((p) => {
    const userAttempts = attempts?.filter((a) => a.user_id === p.id) ?? [];
    const preAttempt = userAttempts.find((a) => a.quiz_type === "preassessment");
    const practiceAttempts = userAttempts.filter(
      (a) => a.quiz_type === "area" || a.quiz_type === "comprehensive"
    );
    const latestPractice = practiceAttempts[0];

    return {
      id: p.id,
      full_name: p.full_name || "—",
      email: p.email,
      preassessment_date: preAttempt?.completed_at ?? null,
      preassessment_score: preAttempt?.score_percent ?? null,
      practice_count: practiceAttempts.length,
      latest_practice_score: latestPractice?.score_percent ?? null,
    };
  });

  return NextResponse.json({ students });
}
