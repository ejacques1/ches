"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY, getScoreColor } from "@/lib/constants";

export default function PracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});
  const [areaScores, setAreaScores] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/practice-data", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setQuestionCounts(data.questionCounts || {});
          setAreaScores(data.areaScores || {});
        }
      } catch {
        // Silently fail
      }

      setLoading(false);
    };
    loadData();
  }, [router]);

  const getCountForArea = (areaId: number) => questionCounts[areaId] ?? 0;
  const totalPracticeQuestions = Object.values(questionCounts).reduce((sum, c) => sum + c, 0);

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

        {/* Comprehensive Quiz */}
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
            const score = areaScores[area.id];

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
                  {score !== undefined && (
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                      {score}%
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
