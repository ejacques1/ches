"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAreaName } from "@/lib/constants";

interface Question {
  id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  area_id: number;
}

interface QuizEngineProps {
  quizType: "preassessment" | "area" | "comprehensive";
  areaId?: number;
  questionCount?: number;
}

type FeedbackState = {
  is_correct: boolean | null;
  correct_answer: string | null;
} | null;

export default function QuizEngine({ quizType, areaId, questionCount }: QuizEngineProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "loading" | "quiz" | "submitting">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionStartTime = useRef<number>(Date.now());

  const isPreassessment = quizType === "preassessment";

  const resetQuestionTimer = useCallback(() => {
    questionStartTime.current = Date.now();
  }, []);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  };

  const startQuiz = async () => {
    setPhase("loading");
    setError("");
    const token = await getToken();

    const res = await fetch("/api/quiz/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quiz_type: quizType,
        area_id: areaId,
        question_count: questionCount,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to start quiz");
      setPhase("intro");
      return;
    }

    setAttemptId(data.attempt_id);
    setQuestions(data.questions);
    setCurrentIndex(0);
    resetQuestionTimer();
    setPhase("quiz");
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !attemptId || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);

    const token = await getToken();
    const res = await fetch("/api/quiz/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attempt_id: attemptId,
        question_id: questions[currentIndex].id,
        selected_answer: selectedAnswer,
        time_spent_seconds: timeSpent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // If already answered, just move to next question instead of showing error
      if (data.error === "Already answered this question") {
        goToNext();
        return;
      }
      setError(data.error || "Failed to submit answer");
      setIsSubmitting(false);
      return;
    }

    if (isPreassessment) {
      // No feedback, go to next question immediately
      goToNext();
    } else {
      // Show feedback for practice quizzes
      setFeedback(data);
      setIsSubmitting(false);
    }
  };

  const goToNext = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setIsSubmitting(false);

    if (currentIndex + 1 >= questions.length) {
      completeQuiz();
    } else {
      setCurrentIndex(currentIndex + 1);
      resetQuestionTimer();
    }
  };

  const completeQuiz = async () => {
    setPhase("submitting");
    const token = await getToken();

    const res = await fetch("/api/quiz/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ attempt_id: attemptId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to complete quiz");
      return;
    }

    // Store results in sessionStorage and navigate to results page
    sessionStorage.setItem(`quiz_results_${attemptId}`, JSON.stringify(data));

    if (isPreassessment) {
      router.push(`/preassessment/results?attempt=${attemptId}`);
    } else {
      router.push(`/quiz/results/${attemptId}`);
    }
  };

  const currentQ = questions[currentIndex];
  const choices = currentQ
    ? [
        { key: "a", text: currentQ.choice_a },
        { key: "b", text: currentQ.choice_b },
        { key: "c", text: currentQ.choice_c },
        { key: "d", text: currentQ.choice_d },
      ]
    : [];

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {isPreassessment ? (
            <>
              <h1 className="text-2xl font-bold text-york-black mb-4">Pre-Assessment</h1>
              <p className="text-gray-600 mb-6">
                This assessment helps identify your strengths and areas for growth
                across the 8 Areas of Responsibility. Your results will guide your
                study plan.
              </p>
              <div className="bg-york-red-light rounded-lg p-4 mb-6 text-sm text-york-black">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="text-left space-y-1">
                  <li>- Questions are presented one at a time</li>
                  <li>- You cannot go back to previous questions</li>
                  <li>- Correct answers will NOT be revealed</li>
                  <li>- You&apos;ll see your score breakdown by area at the end</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-york-black mb-4">
                {quizType === "area"
                  ? `Practice: ${getAreaName(areaId!)}`
                  : "Comprehensive Practice"}
              </h1>
              <p className="text-gray-600 mb-6">
                Answer each question and get immediate feedback. Your first answer
                is locked — make it count!
              </p>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={startQuiz}
            className="bg-york-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-york-red-dark transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (phase === "loading" || phase === "submitting") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">
          {phase === "loading" ? "Loading questions..." : "Calculating your results..."}
        </p>
      </div>
    );
  }

  // Quiz
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          {!isPreassessment && currentQ && (
            <span className="text-xs text-gray-400">Area: {getAreaName(currentQ.area_id)}</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-york-red rounded-full h-2 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <p className="text-lg text-york-black leading-relaxed mb-6">
          {currentQ?.question_text}
        </p>

        <div className="space-y-3">
          {choices.map((choice) => {
            let classes = "w-full text-left px-4 py-3 rounded-lg border-2 transition text-sm ";

            if (feedback) {
              if (choice.key === feedback.correct_answer) {
                classes += "border-score-green bg-green-50 text-green-800";
              } else if (choice.key === selectedAnswer && !feedback.is_correct) {
                classes += "border-score-red bg-red-50 text-red-800";
              } else {
                classes += "border-gray-200 text-gray-400";
              }
            } else if (selectedAnswer === choice.key) {
              classes += "border-york-red bg-york-red-light text-york-black";
            } else {
              classes += "border-gray-200 hover:border-york-red hover:bg-gray-50 text-york-black";
            }

            return (
              <button
                key={choice.key}
                onClick={() => !feedback && setSelectedAnswer(choice.key)}
                disabled={!!feedback}
                className={classes}
              >
                <span className="font-semibold mr-2 uppercase">{choice.key}.</span>
                {choice.text}
              </button>
            );
          })}
        </div>

        {/* Feedback message for practice quizzes */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              feedback.is_correct
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {feedback.is_correct
              ? "Correct!"
              : `Incorrect — the correct answer is ${feedback.correct_answer?.toUpperCase()}`}
          </div>
        )}
      </div>

      {/* Action button */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {!feedback ? (
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer || isSubmitting}
          className="w-full bg-york-red text-white py-3 rounded-lg font-semibold hover:bg-york-red-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : isPreassessment ? "Next" : "Submit Answer"}
        </button>
      ) : (
        <button
          onClick={goToNext}
          className="w-full bg-york-red text-white py-3 rounded-lg font-semibold hover:bg-york-red-dark transition"
        >
          {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
        </button>
      )}
    </div>
  );
}
