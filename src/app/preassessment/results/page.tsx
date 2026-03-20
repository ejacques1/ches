"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAreaName, getScoreBgColor, getScoreLabel } from "@/lib/constants";
import Link from "next/link";

interface AreaScore {
  area_id: number;
  total: number;
  correct: number;
  percent: number;
}

interface Results {
  total: number;
  correct: number;
  percent: number;
  area_scores: AreaScore[];
  quiz_type: string;
}

export default function PreassessmentResultsPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    }>
      <PreassessmentResultsContent />
    </Suspense>
  );
}

function PreassessmentResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);

  const attemptId = searchParams.get("attempt");

  useEffect(() => {
    if (!attemptId) {
      router.push("/dashboard");
      return;
    }
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
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-york-black text-center mb-2">
            Pre-Assessment Results
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Here&apos;s how you performed across the 8 Areas of Responsibility
          </p>

          {/* Overall score */}
          <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-4xl font-bold text-york-black">
              {results.correct}/{results.total}
            </p>
            <p className="text-lg text-gray-600">
              {results.percent}% Overall
            </p>
          </div>

          {/* Per-area breakdown */}
          <div className="space-y-4">
            {sortedAreas.map((area) => (
              <div key={area.area_id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-york-black">
                    Area {area.area_id}: {getAreaName(area.area_id)}
                  </span>
                  <span className="text-gray-500">
                    {area.correct}/{area.total} — {area.percent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`${getScoreBgColor(area.percent)} rounded-full h-4 transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(area.percent, 8)}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {getScoreLabel(area.percent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Focus message */}
          {sortedAreas.some((a) => a.percent < 50) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              Focus your practice on the areas highlighted in red.
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-york-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-york-red-dark transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
