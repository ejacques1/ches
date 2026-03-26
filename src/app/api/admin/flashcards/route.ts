import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;
  return { user, supabaseAdmin };
}

// GET all flashcards (including inactive) for admin management
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabaseAdmin } = auth;
  const areaId = req.nextUrl.searchParams.get("area_id");

  let query = supabaseAdmin
    .from("flashcards")
    .select("*")
    .order("area_id", { ascending: true })
    .order("created_at", { ascending: true });

  if (areaId) {
    query = query.eq("area_id", parseInt(areaId));
  }

  const { data: flashcards, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flashcards: flashcards || [] });
}

// POST: Create a new flashcard
export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabaseAdmin } = auth;
  const { area_id, term, definition } = await req.json();

  if (!area_id || !term || !definition) {
    return NextResponse.json({ error: "area_id, term, and definition are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("flashcards")
    .insert({ area_id, term, definition })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flashcard: data });
}

// PUT: Update a flashcard
export async function PUT(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabaseAdmin } = auth;
  const { id, term, definition, is_active, area_id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Flashcard id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (term !== undefined) updates.term = term;
  if (definition !== undefined) updates.definition = definition;
  if (is_active !== undefined) updates.is_active = is_active;
  if (area_id !== undefined) updates.area_id = area_id;

  const { data, error } = await supabaseAdmin
    .from("flashcards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flashcard: data });
}

// DELETE: Permanently delete a flashcard
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabaseAdmin } = auth;
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Flashcard id is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("flashcards")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
