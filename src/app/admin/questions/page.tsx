"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { getAreaName, AREAS_OF_RESPONSIBILITY } from "@/lib/constants";

interface Question {
  id: number;
  question_text: string;
  correct_answer: string;
  area_id: number;
  is_preassessment: boolean;
  needs_review: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterArea, setFilterArea] = useState<number | null>(null);
  const [filterPre, setFilterPre] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  const loadQuestions = async () => {
    let query = supabase
      .from("questions")
      .select("id, question_text, correct_answer, area_id, is_preassessment, needs_review")
      .order("area_id")
      .order("id");

    if (filterArea) query = query.eq("area_id", filterArea);
    if (filterPre !== null) query = query.eq("is_preassessment", filterPre);

    const { data } = await query;
    setQuestions(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [filterArea, filterPre]);

  const togglePreassessment = async (id: number, current: boolean) => {
    await supabase.from("questions").update({ is_preassessment: !current }).eq("id", id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_preassessment: !current } : q))
    );
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await supabase.from("questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filtered = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  const preCount = questions.filter((q) => q.is_preassessment).length;

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <Link href="/admin" className="text-sm text-york-red hover:underline mb-2 inline-block">
                &larr; Back to Admin
              </Link>
              <h1 className="text-2xl font-bold text-york-black">Question Management</h1>
              <p className="text-sm text-gray-500">
                {questions.length} questions total — {preCount} marked as pre-assessment
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/questions/add"
                className="bg-york-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-dark transition"
              >
                Add Question
              </Link>
              <Link
                href="/admin/questions/upload"
                className="border border-york-red text-york-red px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-light transition"
              >
                Bulk Upload
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
            />
            <select
              value={filterArea ?? ""}
              onChange={(e) => setFilterArea(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
            >
              <option value="">All Areas</option>
              {AREAS_OF_RESPONSIBILITY.map((a) => (
                <option key={a.id} value={a.id}>
                  Area {a.id}: {a.name}
                </option>
              ))}
            </select>
            <select
              value={filterPre === null ? "" : filterPre ? "true" : "false"}
              onChange={(e) =>
                setFilterPre(e.target.value === "" ? null : e.target.value === "true")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
            >
              <option value="">All Questions</option>
              <option value="true">Pre-Assessment Only</option>
              <option value="false">Practice Only</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="px-4 py-3 font-medium w-12">ID</th>
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium w-28">Area</th>
                    <th className="px-4 py-3 font-medium w-16">Ans</th>
                    <th className="px-4 py-3 font-medium w-20">Pre-Asmt</th>
                    <th className="px-4 py-3 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{q.id}</td>
                      <td className="px-4 py-3 text-york-black max-w-md">
                        <span className="line-clamp-2">{q.question_text}</span>
                        {q.needs_review && (
                          <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            Needs Review
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {q.area_id}. {getAreaName(q.area_id)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-york-black uppercase">
                        {q.correct_answer}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePreassessment(q.id, q.is_preassessment)}
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            q.is_preassessment
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {q.is_preassessment ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/questions/edit/${q.id}`}
                            className="text-xs text-york-red hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No questions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminGuard>
    </>
  );
}
