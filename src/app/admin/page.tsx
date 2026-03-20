"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { getScoreColor } from "@/lib/constants";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  preassessment_date: string | null;
  preassessment_score: number | null;
  practice_count: number;
  latest_practice_score: number | null;
}

export default function AdminPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch("/api/admin/students", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) { setLoading(false); return; }

      const data = await res.json();
      setStudents(data.students);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-york-black">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                {students.length} registered students
              </p>
            </div>
            <Link
              href="/admin/questions"
              className="bg-york-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-dark transition"
            >
              Manage Questions
            </Link>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red focus:border-transparent"
            />
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
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Pre-Assessment</th>
                    <th className="px-4 py-3 font-medium">Practice Attempts</th>
                    <th className="px-4 py-3 font-medium">Latest Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/student/${s.id}`}
                          className="text-york-red font-medium hover:underline"
                        >
                          {s.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
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
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No students found
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
