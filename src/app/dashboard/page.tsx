"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY, getAreaName, getScoreBgColor, getScoreColor } from "@/lib/constants";

interface AreaScore {
  area_id: number;
  total: number;
  correct: number;
  percent: number;
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

interface DashboardData {
  profile: { full_name: string; is_admin: boolean };
  hasPreassessment: boolean;
  overallPreScore: number | null;
  preassessmentScores: AreaScore[];
  practiceAttempts: QuizAttempt[];
  overallPracticeScore: number | null;
  questionCounts: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          setError("Failed to load dashboard data");
          setLoading(false);
          return;
        }

        const dashData = await res.json();
        setData(dashData);
      } catch {
        setError("Failed to load dashboard data");
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

  if (error || !data) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-red-500">{error || "Something went wrong"}</p>
        </div>
      </>
    );
  }

  const getCountForArea = (areaId: number) =>
    data.questionCounts[String(areaId)] ?? 0;

  // Identify weak areas (below 50%)
  const weakAreas = data.preassessmentScores.filter((a) => a.percent < 50);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-york-black mb-1">
          Welcome, {data.profile.full_name || "Student"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">Your CHES exam preparation dashboard</p>

        {/* Pre-assessment banner if not completed */}
        {!data.hasPreassessment && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-yellow-800 mb-1">Take Your Pre-Assessment</h2>
            <p className="text-sm text-yellow-700 mb-3">
              Start with a pre-assessment to identify your strengths and areas for growth across the 8 Areas of Responsibility.
            </p>
            <Link
              href="/preassessment"
              className="inline-block bg-york-red text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-york-red-dark transition"
            >
              Start Pre-Assessment
            </Link>
          </div>
        )}

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${data.overallPreScore !== null ? getScoreColor(data.overallPreScore) : "text-gray-300"}`}>
              {data.overallPreScore !== null ? `${data.overallPreScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pre-Assessment</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${data.overallPracticeScore !== null ? getScoreColor(data.overallPracticeScore) : "text-gray-300"}`}>
              {data.overallPracticeScore !== null ? `${data.overallPracticeScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Practice Avg</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-york-black">{data.practiceAttempts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Quizzes Taken</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className={`text-2xl font-bold ${
              data.overallPreScore !== null && data.overallPracticeScore !== null
                ? data.overallPracticeScore > data.overallPreScore
                  ? "text-score-green"
                  : data.overallPracticeScore < data.overallPreScore
                  ? "text-score-red"
                  : "text-gray-400"
                : "text-gray-300"
            }`}>
              {data.overallPreScore !== null && data.overallPracticeScore !== null
                ? `${data.overallPracticeScore > data.overallPreScore ? "+" : ""}${(data.overallPracticeScore - data.overallPreScore).toFixed(1)}%`
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

        {/* Pre-Assessment Scores by Area */}
        {data.hasPreassessment && data.preassessmentScores.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-york-black">Pre-Assessment Results</h2>
                <p className="text-xs text-gray-400">Your baseline scores by area</p>
              </div>
              <Link href="/preassessment" className="text-xs text-york-red hover:underline">
                View Full Results
              </Link>
            </div>
            <div className="space-y-3">
              {data.preassessmentScores.map((area) => (
                <div key={area.area_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      Area {area.area_id}: {getAreaName(area.area_id)}
                    </span>
                    <span className={`font-semibold ${getScoreColor(area.percent)}`}>
                      {area.correct}/{area.total} — {area.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${getScoreBgColor(area.percent)} rounded-full h-2.5 transition-all`}
                      style={{ width: `${Math.max(area.percent, 3)}%` }}
                    />
                  </div>
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

        {/* Your CHES Prep Team */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="font-semibold text-york-black mb-1">Your CHES Prep Team</h2>
          <p className="text-xs text-gray-400 mb-4">Need help? Your faculty advisors are here to support you.</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center">
                <span className="text-york-red font-bold text-sm">EJ</span>
              </div>
              <div>
                <p className="text-sm font-medium text-york-black">Dr. Erin Jacques</p>
                <p className="text-xs text-gray-400">Faculty Advisor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center">
                <span className="text-york-red font-bold text-sm">NG</span>
              </div>
              <div>
                <p className="text-sm font-medium text-york-black">Dr. Nicholas Grosskopf</p>
                <p className="text-xs text-gray-400">Faculty Advisor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center">
                <span className="text-york-red font-bold text-sm">EV</span>
              </div>
              <div>
                <p className="text-sm font-medium text-york-black">Dr. Emilia Vignola</p>
                <p className="text-xs text-gray-400">Faculty Advisor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Practice History */}
        {data.practiceAttempts.length > 0 && (
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
                  {data.practiceAttempts.slice(0, 20).map((attempt) => (
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
