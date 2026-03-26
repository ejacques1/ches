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

  const areaId = req.nextUrl.searchParams.get("area_id");

  if (areaId) {
    // Get flashcards for a specific area
    const { data: flashcards, error } = await supabaseAdmin
      .from("flashcards")
      .select("id, area_id, term, definition")
      .eq("area_id", parseInt(areaId))
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ flashcards: flashcards || [] });
  }

  // Get flashcard counts per area
  const { data: flashcards, error } = await supabaseAdmin
    .from("flashcards")
    .select("area_id")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts: Record<number, number> = {};
  if (flashcards) {
    for (const fc of flashcards) {
      counts[fc.area_id] = (counts[fc.area_id] || 0) + 1;
    }
  }

  return NextResponse.json({ flashcardCounts: counts });
}
