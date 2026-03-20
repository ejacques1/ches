"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { getAreaName, getScoreBgColor, getScoreColor } from "@/lib/constants";

interface Profile {
  full_name: string;
  email: string;
  created_at: string;
}

interface Attempt {
  id: number;
  quiz_type: string;
  area_id: number | null;
  total_questions: number;
  correct_count: number;
  score_percent: number;
  completed_at: string;
}

interface AreaAvg {
  area_id: number;
  avg_percent: number;
  attempts: number;
}

export default function StudentDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preAttempts, setPreAttempts] = useState<Attempt[]>([]);
  const [practiceAttempts, setPracticeAttempts] = useState<Attempt[]>([]);
  const [areaAverages, setAreaAverages] = useState<AreaAvg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, email, created_at")
        .eq("id", userId)
        .single();

      if (prof) setProfile(prof);

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (attempts) {
        setPreAttempts(attempts.filter((a) => a.quiz_type === "preassessment"));
        const practice = attempts.filter(
          (a) => a.quiz_type === "area" || a.quiz_type === "comprehensive"
        );
        setPracticeAttempts(practice);

        // Calculate per-area averages from quiz_answers
        const { data: answers } = await supabase
          .from("quiz_answers")
          .select("area_id, is_correct, attempt_id")
          .in(
            "attempt_id",
            practice.map((a) => a.id)
          );

        if (answers) {
          const areaMap: Record<number, { correct: number; total: number }> = {};
          for (const ans of answers) {
            if (!areaMap[ans.area_id]) areaMap[ans.area_id] = { correct: 0, total: 0 };
            areaMap[ans.area_id].total++;
            if (ans.is_correct) areaMap[ans.area_id].correct++;
          }
          const avgs = Object.entries(areaMap)
            .map(([aid, d]) => ({
              area_id: parseInt(aid),
              avg_percent: d.total > 0 ? Math.round((100 * d.correct) / d.total * 10) / 10 : 0,
              attempts: d.total,
            }))
            .sort((a, b) => a.area_id - b.area_id);
          setAreaAverages(avgs);
        }
      }

      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/admin" className="text-sm text-york-red hover:underline mb-4 inline-block">
            &larr; Back to Admin
          </Link>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : profile ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-york-black">{profile.full_name || "Student"}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-xs text-gray-400">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Pre-assessment History */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="font-semibold text-york-black mb-4">Pre-Assessment History</h2>
                {preAttempts.length === 0 ? (
                  <p className="text-gray-400 text-sm">Not yet taken</p>
                ) : (
                  <div className="space-y-3">
                    {preAttempts.map((a, i) => (
                      <div key={a.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <div>
                          <span className="text-sm text-gray-600">
                            {new Date(a.completed_at).toLocaleDateString()}
                          </span>
                          {i === 0 && (
                            <span className="ml-2 text-xs bg-york-red-light text-york-red px-2 py-0.5 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <span className={`font-bold ${getScoreColor(a.score_percent)}`}>
                          {a.correct_count}/{a.total_questions} ({a.score_percent}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Area Averages */}
              {areaAverages.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="font-semibold text-york-black mb-4">Practice Averages by Area</h2>
                  <div className="space-y-3">
                    {areaAverages.map((a) => (
                      <div key={a.area_id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{getAreaName(a.area_id)}</span>
                          <span className={`font-semibold ${getScoreColor(a.avg_percent)}`}>
                            {a.avg_percent}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getScoreBgColor(a.avg_percent)} rounded-full h-2`}
                            style={{ width: `${Math.max(a.avg_percent, 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice History */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-semibold text-york-black mb-4">Practice Quiz History</h2>
                {practiceAttempts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No practice attempts yet</p>
                ) : (
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
                        {practiceAttempts.map((a) => (
                          <tr key={a.id} className="border-b border-gray-50">
                            <td className="py-2 text-gray-600">
                              {new Date(a.completed_at).toLocaleDateString()}
                            </td>
                            <td className="py-2">
                              {a.quiz_type === "area"
                                ? `Area ${a.area_id}: ${getAreaName(a.area_id!)}`
                                : "Comprehensive"}
                            </td>
                            <td className={`py-2 font-semibold ${getScoreColor(a.score_percent)}`}>
                              {a.correct_count}/{a.total_questions} ({a.score_percent}%)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-400">Student not found</p>
          )}
        </div>
      </AdminGuard>
    </>
  );
}
