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
  const [flashcardCounts, setFlashcardCounts] = useState<Record<number, number>>({});
  const [areaScores, setAreaScores] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const token = session.access_token;

      try {
        const [practiceRes, flashcardRes] = await Promise.all([
          fetch("/api/practice-data", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/flashcards", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (practiceRes.ok) {
          const data = await practiceRes.json();
          setQuestionCounts(data.questionCounts || {});
          setAreaScores(data.areaScores || {});
        }

        if (flashcardRes.ok) {
          const data = await flashcardRes.json();
          setFlashcardCounts(data.flashcardCounts || {});
        }
      } catch {
        // Silently fail
      }

      setLoading(false);
    };
    loadData();
  }, [router]);

  const getCountForArea = (areaId: number) => questionCounts[areaId] ?? 0;
  const getFlashcardCount = (areaId: number) => flashcardCounts[areaId] ?? 0;
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
        <h1 className="text-2xl font-bold text-york-black mb-1">Practice &amp; Study</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Study flashcards to learn key concepts, then test yourself with practice quizzes.
        </p>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800 font-medium mb-1">📖 Recommended Study Flow</p>
          <p className="text-sm text-blue-700">
            <strong>1.</strong> Study the flashcards to learn key terms &amp; definitions →{" "}
            <strong>2.</strong> Take the practice quiz to test your understanding →{" "}
            <strong>3.</strong> Review areas where you scored below 80%
          </p>
        </div>

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
        <h2 className="font-semibold text-york-black mb-4">Study &amp; Practice by Area</h2>
        <div className="grid gap-4">
          {AREAS_OF_RESPONSIBILITY.map((area) => {
            const count = getCountForArea(area.id);
            const fcCount = getFlashcardCount(area.id);
            const score = areaScores[area.id];

            return (
              <div
                key={area.id}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center flex-shrink-0">
                      <span className="text-york-red font-bold text-sm">{area.id}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-york-black text-sm">{area.name}</h3>
                      <p className="text-xs text-gray-400">
                        {fcCount} flashcards · {count} quiz questions
                      </p>
                    </div>
                  </div>
                  {score !== undefined && (
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                  )}
                </div>

                {/* Two buttons side by side */}
                <div className="flex gap-2 ml-13">
                  <Link
                    href={`/flashcards/${area.id}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Study Flashcards
                  </Link>
                  <Link
                    href={`/quiz/area/${area.id}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg bg-york-red text-white text-sm font-medium hover:bg-york-red-dark transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Take Quiz
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
