"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY } from "@/lib/constants";

export default function EditQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({
    question_text: "",
    choice_a: "",
    choice_b: "",
    choice_c: "",
    choice_d: "",
    correct_answer: "a",
    area_id: 1,
    is_preassessment: false,
    needs_review: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("id", parseInt(questionId))
        .single();

      if (data) {
        setForm({
          question_text: data.question_text,
          choice_a: data.choice_a,
          choice_b: data.choice_b,
          choice_c: data.choice_c,
          choice_d: data.choice_d,
          correct_answer: data.correct_answer,
          area_id: data.area_id,
          is_preassessment: data.is_preassessment,
          needs_review: data.needs_review,
        });
      }
      setLoading(false);
    };
    load();
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("questions")
      .update({
        question_text: form.question_text,
        choice_a: form.choice_a,
        choice_b: form.choice_b,
        choice_c: form.choice_c,
        choice_d: form.choice_d,
        correct_answer: form.correct_answer,
        area_id: form.area_id,
        is_preassessment: form.is_preassessment,
        needs_review: form.needs_review,
      })
      .eq("id", parseInt(questionId));

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/questions");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <AdminGuard>
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
          </div>
        </AdminGuard>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/admin/questions" className="text-sm text-york-red hover:underline mb-4 inline-block">
            &larr; Back to Questions
          </Link>
          <h1 className="text-2xl font-bold text-york-black mb-6">Edit Question #{questionId}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
              />
            </div>

            {(["a", "b", "c", "d"] as const).map((letter) => (
              <div key={letter}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choice {letter.toUpperCase()}
                </label>
                <input
                  type="text"
                  value={form[`choice_${letter}` as keyof typeof form] as string}
                  onChange={(e) =>
                    setForm({ ...form, [`choice_${letter}`]: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select
                  value={form.correct_answer}
                  onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                >
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area of Responsibility</label>
                <select
                  value={form.area_id}
                  onChange={(e) => setForm({ ...form, area_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                >
                  {AREAS_OF_RESPONSIBILITY.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id}. {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_preassessment"
                  checked={form.is_preassessment}
                  onChange={(e) => setForm({ ...form, is_preassessment: e.target.checked })}
                  className="rounded border-gray-300 text-york-red focus:ring-york-red"
                />
                <label htmlFor="is_preassessment" className="text-sm text-gray-700">
                  Pre-assessment
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needs_review"
                  checked={form.needs_review}
                  onChange={(e) => setForm({ ...form, needs_review: e.target.checked })}
                  className="rounded border-gray-300 text-york-red focus:ring-york-red"
                />
                <label htmlFor="needs_review" className="text-sm text-gray-700">
                  Needs review
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-york-red text-white py-3 rounded-lg font-semibold hover:bg-york-red-dark transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </AdminGuard>
    </>
  );
}
