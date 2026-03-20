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

interface PreAreaScore {
  area_id: number;
  correct: number;
  total: number;
  percent: number;
}

interface PracticeAreaScore {
  area_id: number;
  avg_percent: number;
  total_questions: number;
}

export default function StudentDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preAttempts, setPreAttempts] = useState<Attempt[]>([]);
  const [practiceAttempts, setPracticeAttempts] = useState<Attempt[]>([]);
  const [preAreaScores, setPreAreaScores] = useState<PreAreaScore[]>([]);
  const [practiceAreaScores, setPracticeAreaScores] = useState<PracticeAreaScore[]>([]);
  const [areasNeedingSupport, setAreasNeedingSupport] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch(`/api/admin/student/${userId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setPreAttempts(data.preAttempts);
        setPracticeAttempts(data.practiceAttempts);
        setPreAreaScores(data.preAreaScores);
        setPracticeAreaScores(data.practiceAreaScores);
        setAreasNeedingSupport(data.areasNeedingSupport);
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

              {/* Areas Needing Support */}
              {areasNeedingSupport.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
                  <h2 className="font-semibold text-score-red mb-2">Areas Needing Support</h2>
                  <p className="text-xs text-gray-500 mb-3">
                    Below 50% — based on practice scores (or pre-assessment if no practice yet)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {areasNeedingSupport.map((areaId) => (
                      <span
                        key={areaId}
                        className="bg-white border border-red-200 text-score-red px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        Area {areaId}: {getAreaName(areaId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Assessment vs Practice Growth */}
              {preAreaScores.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="font-semibold text-york-black mb-1">Score Breakdown by Area</h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Pre-assessment baseline vs. practice performance
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b bg-gray-50">
                          <th className="px-3 py-2 font-medium">Area</th>
                          <th className="px-3 py-2 font-medium text-center">Pre-Assessment</th>
                          <th className="px-3 py-2 font-medium text-center">Practice</th>
                          <th className="px-3 py-2 font-medium text-center">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((areaId) => {
                          const pre = preAreaScores.find((a) => a.area_id === areaId);
                          const practice = practiceAreaScores.find((a) => a.area_id === areaId);
                          const growth = pre && practice ? practice.avg_percent - pre.percent : null;

                          return (
                            <tr key={areaId} className="border-b border-gray-50">
                              <td className="px-3 py-2.5 text-gray-700 text-xs sm:text-sm">
                                {getAreaName(areaId)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {pre ? (
                                  <span className={`font-semibold ${getScoreColor(pre.percent)}`}>
                                    {pre.correct}/{pre.total} ({pre.percent}%)
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {practice ? (
                                  <span className={`font-semibold ${getScoreColor(practice.avg_percent)}`}>
                                    {practice.avg_percent}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {growth !== null ? (
                                  <span
                                    className={`font-semibold ${
                                      growth > 0
                                        ? "text-score-green"
                                        : growth < 0
                                        ? "text-score-red"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {growth > 0 ? "↑" : growth < 0 ? "↓" : "→"}{" "}
                                    {Math.abs(growth).toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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

              {/* Area Progress Bars */}
              {practiceAreaScores.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="font-semibold text-york-black mb-4">Practice Averages by Area</h2>
                  <div className="space-y-3">
                    {practiceAreaScores.map((a) => (
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
