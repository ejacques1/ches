"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY, getAreaName, getScoreColor } from "@/lib/constants";

interface QuestionCount {
  area_id: number;
  count: number;
}

interface AreaScore {
  area_id: number;
  percent: number;
}

export default function PracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState<QuestionCount[]>([]);
  const [areaScores, setAreaScores] = useState<AreaScore[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Get available question counts per area
      const { data: questions } = await supabase
        .from("questions")
        .select("area_id")
        .eq("is_preassessment", false)
        .eq("needs_review", false);

      if (questions) {
        const counts: Record<number, number> = {};
        for (const q of questions) {
          counts[q.area_id] = (counts[q.area_id] || 0) + 1;
        }
        setQuestionCounts(
          Object.entries(counts).map(([k, v]) => ({ area_id: parseInt(k), count: v }))
        );
      }

      // Get practice scores per area
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("id")
        .eq("user_id", session.user.id)
        .in("quiz_type", ["area", "comprehensive"])
        .not("completed_at", "is", null);

      if (attempts && attempts.length > 0) {
        const attemptIds = attempts.map((a) => a.id);
        const { data: answers } = await supabase
          .from("quiz_answers")
          .select("area_id, is_correct")
          .in("attempt_id", attemptIds);

        if (answers) {
          const areaMap: Record<number, { correct: number; total: number }> = {};
          for (const ans of answers) {
            if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { correct: 0, total: 0 };
            areaMap[ans.area_id].total++;
            if (ans.is_correct) areaMap[ans.area_id].correct++;
          }
          setAreaScores(
            Object.entries(areaMap).map(([k, v]) => ({
              area_id: parseInt(k),
              percent: v.total > 0 ? Math.round((100 * v.correct) / v.total) : 0,
            }))
          );
        }
      }

      setLoading(false);
    };
    loadData();
  }, [router]);

  const getCountForArea = (areaId: number) =>
    questionCounts.find((c) => c.area_id === areaId)?.count ?? 0;

  const getScoreForArea = (areaId: number) =>
    areaScores.find((s) => s.area_id === areaId);

  const totalPracticeQuestions = questionCounts.reduce((sum, c) => sum + c.count, 0);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-york-black mb-1">Practice Quizzes</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Choose a specific area to focus on, or take a comprehensive quiz across all areas.
        </p>

        {/* Comprehensive Quiz - prominent */}
        <Link
          href="/quiz/comprehensive"
          className="block bg-york-red text-white rounded-xl p-6 mb-8 hover:bg-york-red-dark transition shadow-md"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl mb-1">Comprehensive Quiz</h2>
              <p className="text-sm opacity-80">
                Practice questions from all 8 areas — {totalPracticeQuestions} questions available
              </p>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Practice by Area */}
        <h2 className="font-semibold text-york-black mb-4">Practice by Area</h2>
        <div className="grid gap-3">
          {AREAS_OF_RESPONSIBILITY.map((area) => {
            const count = getCountForArea(area.id);
            const score = getScoreForArea(area.id);

            return (
              <Link
                key={area.id}
                href={`/quiz/area/${area.id}`}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center flex-shrink-0">
                    <span className="text-york-red font-bold text-sm">{area.id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-york-black text-sm">{area.name}</h3>
                    <p className="text-xs text-gray-400">{count} questions available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {score && (
                    <span className={`text-sm font-bold ${getScoreColor(score.percent)}`}>
                      {score.percent}%
                    </span>
                  )}
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
