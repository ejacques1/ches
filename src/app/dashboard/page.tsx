"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY, getAreaName, getScoreBgColor, getScoreColor, getScoreLabel } from "@/lib/constants";

interface AreaScore {
  area_id: number;
  total_questions: number;
  correct_count: number;
  score_percent: number;
}

interface QuizAttempt {
  id: number;
  quiz_type: string;
  area_id: number | null;
  total_questions: number;
  correct_count: number;
  score_percent: number;
  completed_at: string;
}

interface QuestionCount {
  area_id: number;
  count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [preassessmentScores, setPreassessmentScores] = useState<AreaScore[]>([]);
  const [hasPreassessment, setHasPreassessment] = useState(false);
  const [practiceAttempts, setPracticeAttempts] = useState<QuizAttempt[]>([]);
  const [questionCounts, setQuestionCounts] = useState<QuestionCount[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Check profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", userId)
        .single();

      if (profile) {
        setFullName(profile.full_name || session.user.email || "");
      }

      // Check if preassessment completed
      const { data: preAttempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .eq("quiz_type", "preassessment")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (!preAttempts || preAttempts.length === 0) {
        // Redirect to pre-assessment
        router.push("/preassessment");
        return;
      }

      setHasPreassessment(true);

      // Get preassessment area scores from the latest attempt
      const latestPreId = preAttempts[0].id;
      const { data: preAnswers } = await supabase
        .from("quiz_answers")
        .select("area_id, is_correct")
        .eq("attempt_id", latestPreId);

      if (preAnswers) {
        const areaMap: Record<number, { total: number; correct: number }> = {};
        for (const ans of preAnswers) {
          if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { total: 0, correct: 0 };
          areaMap[ans.area_id].total++;
          if (ans.is_correct) areaMap[ans.area_id].correct++;
        }
        const scores = Object.entries(areaMap).map(([aId, d]) => ({
          area_id: parseInt(aId),
          total_questions: d.total,
          correct_count: d.correct,
          score_percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
        }));
        setPreassessmentScores(scores.sort((a, b) => a.area_id - b.area_id));
      }

      // Get practice attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .in("quiz_type", ["area", "comprehensive"])
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (attempts) setPracticeAttempts(attempts);

      // Get available question counts per area (non-preassessment)
      const { data: questions } = await supabase
        .from("questions")
        .select("area_id")
        .eq("is_preassessment", false);

      if (questions) {
        const counts: Record<number, number> = {};
        for (const q of questions) {
          counts[q.area_id] = (counts[q.area_id] || 0) + 1;
        }
        setQuestionCounts(
          Object.entries(counts).map(([k, v]) => ({ area_id: parseInt(k), count: v }))
        );
      }

      setLoading(false);
    };
    loadData();
  }, [router]);

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

  const getCountForArea = (areaId: number) =>
    questionCounts.find((c) => c.area_id === areaId)?.count ?? 0;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-york-black mb-1">
          Welcome, {fullName || "Student"}
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Your CHES exam preparation dashboard</p>

        {/* Pre-assessment Summary */}
        {hasPreassessment && preassessmentScores.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-york-black">Pre-Assessment Scores</h2>
              <Link href="/preassessment" className="text-xs text-york-red hover:underline">
                Retake
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {preassessmentScores.map((area) => (
                <div key={area.area_id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 truncate">
                      {getAreaName(area.area_id)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`${getScoreBgColor(area.score_percent)} rounded-full h-2`}
                        style={{ width: `${Math.max(area.score_percent, 3)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(area.score_percent)}`}>
                    {area.score_percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/quiz/comprehensive"
            className="bg-york-red text-white rounded-xl p-6 hover:bg-york-red-dark transition"
          >
            <h3 className="font-semibold text-lg mb-1">Comprehensive Quiz</h3>
            <p className="text-sm opacity-80">Practice all areas</p>
          </Link>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-york-black mb-3">Practice by Area</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {AREAS_OF_RESPONSIBILITY.map((area) => {
                const count = getCountForArea(area.id);
                return (
                  <Link
                    key={area.id}
                    href={`/quiz/area/${area.id}`}
                    className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    <span className="text-york-black">
                      <span className="text-york-red font-bold mr-2">{area.id}.</span>
                      {area.name}
                    </span>
                    <span className="text-xs text-gray-400">{count} Qs</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Practice History */}
        {practiceAttempts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-york-black mb-4">Practice History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        {attempt.quiz_type === "area"
                          ? `Area ${attempt.area_id}: ${getAreaName(attempt.area_id!)}`
                          : "Comprehensive"}
                      </td>
                      <td className={`py-2 font-semibold ${getScoreColor(attempt.score_percent)}`}>
                        {attempt.correct_count}/{attempt.total_questions} ({attempt.score_percent}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
