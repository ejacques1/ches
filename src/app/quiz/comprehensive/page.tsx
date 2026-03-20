"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import QuizEngine from "@/components/QuizEngine";

export default function ComprehensiveQuizPage() {
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  if (started && questionCount) {
    return (
      <>
        <Navbar />
        <QuizEngine quizType="comprehensive" questionCount={questionCount} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-york-black mb-4">
            Comprehensive Practice
          </h1>
          <p className="text-gray-600 mb-8">
            Practice questions from all Areas of Responsibility. Choose how many
            questions you&apos;d like.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            {[25, 50].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`px-6 py-3 rounded-lg border-2 font-medium transition ${
                  questionCount === count
                    ? "border-york-red bg-york-red-light text-york-red"
                    : "border-gray-200 hover:border-york-red text-gray-600"
                }`}
              >
                {count} Questions
              </button>
            ))}
            <button
              onClick={() => setQuestionCount(999)}
              className={`px-6 py-3 rounded-lg border-2 font-medium transition ${
                questionCount === 999
                  ? "border-york-red bg-york-red-light text-york-red"
                  : "border-gray-200 hover:border-york-red text-gray-600"
              }`}
            >
              All Questions
            </button>
          </div>

          <button
            onClick={() => questionCount && setStarted(true)}
            disabled={!questionCount}
            className="bg-york-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-york-red-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Practice
          </button>
        </div>
      </div>
    </>
  );
}
