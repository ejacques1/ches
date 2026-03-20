"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

export default function UploadQuestionsPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<number>(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const questions = data.questions;
      if (!Array.isArray(questions) || questions.length === 0) {
        setError("Invalid JSON format. Expected { \"questions\": [...] }");
        setUploading(false);
        return;
      }

      // Map and validate
      const rows = questions.map((q: Record<string, unknown>) => {
        const choices = q.choices as Record<string, string>;
        return {
          question_text: q.question as string || q.question_text as string,
          choice_a: choices?.a || (q as Record<string, string>).choice_a || "",
          choice_b: choices?.b || (q as Record<string, string>).choice_b || "",
          choice_c: choices?.c || (q as Record<string, string>).choice_c || "",
          choice_d: choices?.d || (q as Record<string, string>).choice_d || "",
          correct_answer: q.correct_answer as string,
          area_id: q.area_id as number,
          is_preassessment: false,
          needs_review: (q.needs_review as boolean) || false,
        };
      });

      // Validate
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r.question_text || !r.choice_a || !r.correct_answer || !r.area_id) {
          setError(`Question ${i + 1} is missing required fields.`);
          setUploading(false);
          return;
        }
      }

      setPreview(rows.length);

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error: insertError } = await supabase.from("questions").insert(batch);
        if (insertError) {
          setError(`Error inserting batch starting at question ${i + 1}: ${insertError.message}`);
          setUploading(false);
          return;
        }
      }

      router.push("/admin/questions");
    } catch {
      setError("Failed to parse JSON file. Please check the format.");
    }

    setUploading(false);
  };

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/admin/questions" className="text-sm text-york-red hover:underline mb-4 inline-block">
            &larr; Back to Questions
          </Link>
          <h1 className="text-2xl font-bold text-york-black mb-6">Bulk Upload Questions</h1>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-4">
              Upload a JSON file with questions. The expected format:
            </p>

            <pre className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 overflow-x-auto mb-6">
{`{
  "questions": [
    {
      "question": "Question text here",
      "choices": {
        "a": "Choice A",
        "b": "Choice B",
        "c": "Choice C",
        "d": "Choice D"
      },
      "correct_answer": "b",
      "area_id": 3
    }
  ]
}`}
            </pre>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {preview > 0 && !error && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                Uploading {preview} questions...
              </div>
            )}

            <label className="block">
              <span className="bg-york-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-york-red-dark transition cursor-pointer inline-block">
                {uploading ? "Uploading..." : "Select JSON File"}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </AdminGuard>
    </>
  );
}
