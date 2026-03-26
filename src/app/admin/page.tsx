"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { getAreaName, getScoreColor, getScoreBgColor } from "@/lib/constants";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  preassessment_date: string | null;
  preassessment_score: number | null;
  practice_count: number;
  latest_practice_score: number | null;
}

interface AreaScore {
  area_id: number;
  avg_percent: number;
  total_questions: number;
  correct_count: number;
  student_count: number;
}

interface Metrics {
  class_area_scores: AreaScore[];
  preassessment_area_scores: AreaScore[];
  practice_area_scores: AreaScore[];
  total_students: number;
  students_completed_preassessment: number;
  students_with_practice: number;
}

export default function AdminPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "students">("overview");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const token = session.access_token;

      // Fetch students and metrics in parallel
      const [studentsRes, metricsRes] = await Promise.all([
        fetch("/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/metrics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      setLoading(false);
    };
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/admin/promote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_id: userId, is_admin: !currentIsAdmin }),
    });

    if (res.ok) {
      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, is_admin: !currentIsAdmin } : s))
      );
    }
  };

  // Find weakest areas (sorted by score ascending)
  const weakestAreas = metrics?.class_area_scores
    ? [...metrics.class_area_scores].sort((a, b) => a.avg_percent - b.avg_percent)
    : [];

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-york-black">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                CHES Study Hub — York College Department of Health and Human Performance
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/flashcards"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
              >
                Manage Flashcards
              </Link>
              <Link
                href="/admin/questions"
                className="bg-york-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-dark transition"
              >
                Manage Questions
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-white text-york-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Class Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "students"
                  ? "bg-white text-york-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Students ({students.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : activeTab === "overview" ? (
            /* ============ CLASS OVERVIEW TAB ============ */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                  <p className="text-3xl font-bold text-york-black">{metrics?.total_students ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Students</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                  <p className="text-3xl font-bold text-york-black">{metrics?.students_completed_preassessment ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed Pre-Assessment</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                  <p className="text-3xl font-bold text-york-black">{metrics?.students_with_practice ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Started Practicing</p>
                </div>
              </div>

              {/* Class-Wide Weakest Areas */}
              {weakestAreas.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="font-semibold text-york-black mb-1">Class-Wide Areas Needing Support</h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Ranked by average score across all students (pre-assessment + practice combined)
                  </p>
                  <div className="space-y-3">
                    {weakestAreas.map((area, i) => (
                      <div key={area.area_id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">
                            {i < 3 && area.avg_percent < 50 && (
                              <span className="inline-block w-2 h-2 bg-score-red rounded-full mr-2" />
                            )}
                            Area {area.area_id}: {getAreaName(area.area_id)}
                          </span>
                          <span className={`font-semibold ${getScoreColor(area.avg_percent)}`}>
                            {area.avg_percent}%
                            <span className="text-gray-400 font-normal text-xs ml-1">
                              ({area.student_count} student{area.student_count !== 1 ? "s" : ""})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${getScoreBgColor(area.avg_percent)} rounded-full h-2.5 transition-all`}
                            style={{ width: `${Math.max(area.avg_percent, 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Assessment vs Practice Comparison */}
              {metrics && metrics.preassessment_area_scores.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="font-semibold text-york-black mb-1">Pre-Assessment vs. Practice Scores</h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Comparing initial assessment with practice performance to track class growth
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b bg-gray-50">
                          <th className="px-4 py-3 font-medium">Area</th>
                          <th className="px-4 py-3 font-medium text-center">Pre-Assessment Avg</th>
                          <th className="px-4 py-3 font-medium text-center">Practice Avg</th>
                          <th className="px-4 py-3 font-medium text-center">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((areaId) => {
                          const pre = metrics.preassessment_area_scores.find((a) => a.area_id === areaId);
                          const practice = metrics.practice_area_scores.find((a) => a.area_id === areaId);
                          const change = pre && practice ? practice.avg_percent - pre.avg_percent : null;

                          return (
                            <tr key={areaId} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-gray-700">
                                Area {areaId}: {getAreaName(areaId)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {pre ? (
                                  <span className={`font-semibold ${getScoreColor(pre.avg_percent)}`}>
                                    {pre.avg_percent}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {practice ? (
                                  <span className={`font-semibold ${getScoreColor(practice.avg_percent)}`}>
                                    {practice.avg_percent}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {change !== null ? (
                                  <span
                                    className={`font-semibold ${
                                      change > 0
                                        ? "text-score-green"
                                        : change < 0
                                        ? "text-score-red"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {change > 0 ? "+" : ""}
                                    {change.toFixed(1)}%
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

              {/* Quick note if no data yet */}
              {weakestAreas.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-400">No quiz data yet. Students need to complete the pre-assessment first.</p>
                </div>
              )}
            </div>
          ) : (
            /* ============ STUDENTS TAB ============ */
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b bg-gray-50">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Pre-Assessment</th>
                      <th className="px-4 py-3 font-medium">Practice Attempts</th>
                      <th className="px-4 py-3 font-medium">Latest Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 ${s.is_admin ? "bg-yellow-50" : ""}`}>
                        <td className="px-4 py-3">
                          {s.is_admin ? (
                            <span className="font-medium text-gray-700">{s.full_name}</span>
                          ) : (
                            <Link
                              href={`/admin/student/${s.id}`}
                              className="text-york-red font-medium hover:underline"
                            >
                              {s.full_name}
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.email}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleAdmin(s.id, s.is_admin)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                              s.is_admin
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {s.is_admin ? "Admin" : "Student"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {s.preassessment_score !== null ? (
                            <span className={`font-semibold ${getScoreColor(s.preassessment_score)}`}>
                              {s.preassessment_score}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Not taken</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.practice_count}</td>
                        <td className="px-4 py-3">
                          {s.latest_practice_score !== null ? (
                            <span className={`font-semibold ${getScoreColor(s.latest_practice_score)}`}>
                              {s.latest_practice_score}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminGuard>
    </>
  );
}
