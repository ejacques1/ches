"use client";

import Navbar from "@/components/Navbar";
import QuizEngine from "@/components/QuizEngine";

export default function PreassessmentPage() {
  return (
    <>
      <Navbar />
      <QuizEngine quizType="preassessment" />
    </>
  );
}
