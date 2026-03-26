"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import QuizEngine from "@/components/QuizEngine";
import { supabase } from "@/lib/supabase";
import { getAreaName, getScoreBgColor, getScoreLabel } from "@/lib/constants";

interface AreaScore {
  area_id: number;
  total: number;
  correct: number;
  percent: number;
}

interface CompletedResult {
  attempt_id: number;
  total_questions: number;
  correct_count: number;
  score_percent: number;
  completed_at: string;
  area_scores: AreaScore[];
}

export default function PreassessmentPage() {
  const [loading, setLoading] = useState(true);
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null);
  const [showRetake, setShowRetake] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Check for completed pre-assessment
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("quiz_type", "preassessment")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (attempts && attempts.length > 0) {
        const attempt = attempts[0];

        // Get area scores
        const { data: answers } = await supabase
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

        setCompletedResult({
          attempt_id: attempt.id,
          total_questions: attempt.total_questions,
          correct_count: attempt.correct_count,
          score_percent: attempt.score_percent,
          completed_at: attempt.completed_at,
          area_scores,
        });
      }

      setLoading(false);
    };
    checkExisting();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    );
  }

  // If retaking, show quiz engine
  if (showRetake || !completedResult) {
    return (
      <>
        <Navbar />
        <QuizEngine quizType="preassessment" />
      </>
    );
  }

  // Show previous results
  const sortedAreas = completedResult.area_scores;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-york-black text-center mb-2">
            Your Pre-Assessment Results
          </h1>
          <p className="text-center text-gray-500 mb-1">
            Completed {new Date(completedResult.completed_at).toLocaleDateString()}
          </p>
          <p className="text-center text-xs text-gray-400 mb-6">
            Here&apos;s how you performed across the 8 Areas of Responsibility
          </p>

          {/* Overall score */}
          <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-4xl font-bold text-york-black">
              {completedResult.correct_count}/{completedResult.total_questions}
            </p>
            <p className="text-lg text-gray-600">
              {completedResult.score_percent}% Overall
            </p>
          </div>

          {/* Per-area breakdown */}
          <div className="space-y-4">
            {sortedAreas.map((area) => (
              <div key={area.area_id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-york-black">
                    Area {area.area_id}: {getAreaName(area.area_id)}
                  </span>
                  <span className="text-gray-500">
                    {area.correct}/{area.total} — {area.percent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`${getScoreBgColor(area.percent)} rounded-full h-4 transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(area.percent, 8)}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {getScoreLabel(area.percent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Focus message */}
          {sortedAreas.some((a) => a.percent < 50) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              Focus your practice on the areas highlighted in red.
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-block bg-york-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-york-red-dark transition"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => setShowRetake(true)}
            className="inline-block bg-white text-york-red border-2 border-york-red px-8 py-3 rounded-lg font-semibold hover:bg-york-red-light transition"
          >
            Retake Pre-Assessment
          </button>
        </div>
      </div>
    </>
  );
}
