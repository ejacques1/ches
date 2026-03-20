"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY, getAreaName, getScoreBgColor, getScoreColor } from "@/lib/constants";

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

interface AreaProgress {
  area_id: number;
  preassessment_percent: number | null;
  practice_percent: number | null;
  trend: number[]; // array of scores over time
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [preassessmentScores, setPreassessmentScores] = useState<AreaScore[]>([]);
  const [hasPreassessment, setHasPreassessment] = useState(false);
  const [practiceAttempts, setPracticeAttempts] = useState<QuizAttempt[]>([]);
  const [questionCounts, setQuestionCounts] = useState<QuestionCount[]>([]);
  const [areaProgress, setAreaProgress] = useState<AreaProgress[]>([]);
  const [overallPreScore, setOverallPreScore] = useState<number | null>(null);
  const [overallPracticeScore, setOverallPracticeScore] = useState<number | null>(null);

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
        // Admins viewing as student don't need to take pre-assessment
        if (profile?.is_admin) {
          setLoading(false);
          return;
        }
        router.push("/preassessment");
        return;
      }

      setHasPreassessment(true);
      setOverallPreScore(preAttempts[0].score_percent);

      // Get preassessment area scores from the latest attempt
      const latestPreId = preAttempts[0].id;
      const { data: preAnswers } = await supabase
        .from("quiz_answers")
        .select("area_id, is_correct")
        .eq("attempt_id", latestPreId);

      const preScoreMap: Record<number, { total: number; correct: number }> = {};
      if (preAnswers) {
        for (const ans of preAnswers) {
          if (!preScoreMap[ans.area_id]) preScoreMap[ans.area_id] = { total: 0, correct: 0 };
          preScoreMap[ans.area_id].total++;
          if (ans.is_correct) preScoreMap[ans.area_id].correct++;
        }
        const scores = Object.entries(preScoreMap).map(([aId, d]) => ({
          area_id: parseInt(aId),
          total_questions: d.total,
          correct_count: d.correct,
          score_percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
        }));
        setPreassessmentScores(scores.sort((a, b) => a.area_id - b.area_id));
      }

      // Get ALL practice attempts (not just 20)
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .in("quiz_type", ["area", "comprehensive"])
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (attempts) {
        setPracticeAttempts(attempts);

        // Calculate overall practice score
        if (attempts.length > 0) {
          const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_count, 0);
          const totalQs = attempts.reduce((sum, a) => sum + a.total_questions, 0);
          setOverallPracticeScore(totalQs > 0 ? Math.round((100 * totalCorrect) / totalQs * 10) / 10 : 0);
        }

        // Get practice answers for area-level progress
        const practiceIds = attempts.map((a) => a.id);
        if (practiceIds.length > 0) {
          const { data: practiceAnswers } = await supabase
            .from("quiz_answers")
            .select("area_id, is_correct, attempt_id")
            .in("attempt_id", practiceIds);

          if (practiceAnswers) {
            // Build area progress data
            const practiceAreaMap: Record<number, { correct: number; total: number }> = {};
            for (const ans of practiceAnswers) {
              if (!practiceAreaMap[ans.area_id]) practiceAreaMap[ans.area_id] = { correct: 0, total: 0 };
              practiceAreaMap[ans.area_id].total++;
              if (ans.is_correct) practiceAreaMap[ans.area_id].correct++;
            }

            // Build trend per area (score per attempt, chronological order)
            const attemptsByTime = [...attempts].sort(
              (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
            );
            const areaTrends: Record<number, number[]> = {};
            for (const attempt of attemptsByTime) {
              const attemptAnswers = practiceAnswers.filter((a) => a.attempt_id === attempt.id);
              const areaScoresForAttempt: Record<number, { correct: number; total: number }> = {};
              for (const ans of attemptAnswers) {
                if (!areaScoresForAttempt[ans.area_id]) areaScoresForAttempt[ans.area_id] = { correct: 0, total: 0 };
                areaScoresForAttempt[ans.area_id].total++;
                if (ans.is_correct) areaScoresForAttempt[ans.area_id].correct++;
              }
              for (const [aId, d] of Object.entries(areaScoresForAttempt)) {
                const aid = parseInt(aId);
                if (!areaTrends[aid]) areaTrends[aid] = [];
                areaTrends[aid].push(d.total > 0 ? Math.round((100 * d.correct) / d.total) : 0);
              }
            }

            const progress: AreaProgress[] = Array.from({ length: 8 }, (_, i) => {
              const areaId = i + 1;
              const pre = preScoreMap[areaId];
              const practice = practiceAreaMap[areaId];
              return {
                area_id: areaId,
                preassessment_percent: pre ? Math.round((100 * pre.correct) / pre.total * 10) / 10 : null,
                practice_percent: practice
                  ? Math.round((100 * practice.correct) / practice.total * 10) / 10
                  : null,
                trend: areaTrends[areaId] || [],
              };
            });
            setAreaProgress(progress);
          }
        }
      }

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

  // Identify weak areas (below 50%)
  const weakAreas = areaProgress.filter((a) => {
    const score = a.practice_percent ?? a.preassessment_percent;
    return score !== null && score < 50;
  });

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-york-black mb-1">
          Welcome, {fullName || "Student"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">Your CHES exam preparation dashboard</p>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${overallPreScore !== null ? getScoreColor(overallPreScore) : "text-gray-300"}`}>
              {overallPreScore !== null ? `${overallPreScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pre-Assessment</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${overallPracticeScore !== null ? getScoreColor(overallPracticeScore) : "text-gray-300"}`}>
              {overallPracticeScore !== null ? `${overallPracticeScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Practice Avg</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-york-black">{practiceAttempts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Quizzes Taken</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${
              overallPreScore !== null && overallPracticeScore !== null
                ? overallPracticeScore > overallPreScore
                  ? "text-score-green"
                  : overallPracticeScore < overallPreScore
                  ? "text-score-red"
                  : "text-gray-400"
                : "text-gray-300"
            }`}>
              {overallPreScore !== null && overallPracticeScore !== null
                ? `${overallPracticeScore > overallPreScore ? "+" : ""}${(overallPracticeScore - overallPreScore).toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Growth</p>
          </div>
        </div>

        {/* Areas Needing Attention */}
        {weakAreas.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-score-red mb-2">Focus Areas</h2>
            <p className="text-xs text-gray-500 mb-3">
              These areas are below 50% — focus your practice here
            </p>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map((a) => (
                <Link
                  key={a.area_id}
                  href={`/quiz/area/${a.area_id}`}
                  className="bg-white border border-red-200 text-score-red px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Area {a.area_id}: {getAreaName(a.area_id)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Progress by Area — Pre-Assessment vs Practice */}
        {hasPreassessment && areaProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-york-black">Your Progress by Area</h2>
                <p className="text-xs text-gray-400">Pre-assessment baseline vs. practice performance</p>
              </div>
              <Link href="/preassessment" className="text-xs text-york-red hover:underline">
                Retake Pre-Assessment
              </Link>
            </div>
            <div className="space-y-4">
              {areaProgress.map((area) => (
                <div key={area.area_id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Area {area.area_id}: {getAreaName(area.area_id)}
                    </span>
                    {area.preassessment_percent !== null && area.practice_percent !== null && (
                      <span
                        className={`text-xs font-semibold ${
                          area.practice_percent > area.preassessment_percent
                            ? "text-score-green"
                            : area.practice_percent < area.preassessment_percent
                            ? "text-score-red"
                            : "text-gray-400"
                        }`}
                      >
                        {area.practice_percent > area.preassessment_percent ? "↑" : area.practice_percent < area.preassessment_percent ? "↓" : "→"}{" "}
                        {Math.abs(area.practice_percent - area.preassessment_percent).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Pre-assessment bar */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">Pre</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`${area.preassessment_percent !== null ? getScoreBgColor(area.preassessment_percent) : "bg-gray-300"} rounded-full h-2 opacity-50`}
                            style={{ width: `${Math.max(area.preassessment_percent ?? 0, 3)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-10 text-right ${area.preassessment_percent !== null ? getScoreColor(area.preassessment_percent) : "text-gray-300"}`}>
                          {area.preassessment_percent !== null ? `${area.preassessment_percent}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {/* Practice bar */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">Now</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`${area.practice_percent !== null ? getScoreBgColor(area.practice_percent) : "bg-gray-300"} rounded-full h-2`}
                            style={{ width: `${Math.max(area.practice_percent ?? 0, 3)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-10 text-right ${area.practice_percent !== null ? getScoreColor(area.practice_percent) : "text-gray-300"}`}>
                          {area.practice_percent !== null ? `${area.practice_percent}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Trend line */}
                  {area.trend.length > 1 && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-xs text-gray-400 w-8">Trend</span>
                      <div className="flex items-center gap-0.5">
                        {area.trend.map((score, i) => (
                          <span key={i} className={`text-xs font-medium ${getScoreColor(score)}`}>
                            {score}%{i < area.trend.length - 1 ? " → " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                  {practiceAttempts.slice(0, 20).map((attempt) => (
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
