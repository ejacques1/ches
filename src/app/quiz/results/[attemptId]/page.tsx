"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAreaName, getScoreBgColor, getScoreLabel } from "@/lib/constants";
import Link from "next/link";

interface AreaScore {
  area_id: number;
  total: number;
  correct: number;
  percent: number;
}

interface WrongQuestion {
  question_id: number;
  question_text: string;
  selected_answer: string;
  correct_answer: string;
  area_id: number;
}

interface Results {
  total: number;
  correct: number;
  percent: number;
  area_scores: AreaScore[];
  wrong_questions: WrongQuestion[];
  quiz_type: string;
}

export default function QuizResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz_results_${attemptId}`);
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      router.push("/dashboard");
    }
  }, [attemptId, router]);

  if (!results) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    );
  }

  const sortedAreas = [...results.area_scores].sort((a, b) => a.area_id - b.area_id);

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Score summary */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-york-black text-center mb-2">
            Quiz Results
          </h1>

          <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-4xl font-bold text-york-black">
              {results.correct}/{results.total}
            </p>
            <p className="text-lg text-gray-600">{results.percent}%</p>
          </div>

          {/* Area breakdown */}
          {sortedAreas.length > 1 && (
            <div className="space-y-4 mb-6">
              <h2 className="font-semibold text-york-black">Score by Area</h2>
              {sortedAreas.map((area) => (
                <div key={area.area_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-york-black">
                      {getAreaName(area.area_id)}
                    </span>
                    <span className="text-gray-500">
                      {area.correct}/{area.total} — {area.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getScoreBgColor(area.percent)} rounded-full h-3 transition-all`}
                      style={{ width: `${Math.max(area.percent, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wrong questions */}
        {results.wrong_questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="font-semibold text-york-black mb-4">
              Questions You Missed ({results.wrong_questions.length})
            </h2>
            <div className="space-y-4">
              {results.wrong_questions.map((q, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm text-gray-700 mb-2">{q.question_text}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-red-600">
                      Your answer: <strong>{q.selected_answer.toUpperCase()}</strong>
                    </span>
                    <span className="text-green-600">
                      Correct: <strong>{q.correct_answer.toUpperCase()}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {getAreaName(q.area_id)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-york-red text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-york-red-dark transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
