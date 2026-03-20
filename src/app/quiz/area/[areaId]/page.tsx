"use client";

import { use } from "react";
import Navbar from "@/components/Navbar";
import QuizEngine from "@/components/QuizEngine";

export default function AreaQuizPage({ params }: { params: Promise<{ areaId: string }> }) {
  const { areaId } = use(params);
  const areaIdNum = parseInt(areaId);

  if (isNaN(areaIdNum) || areaIdNum < 1 || areaIdNum > 8) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-red-500">Invalid area ID</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <QuizEngine quizType="area" areaId={areaIdNum} />
    </>
  );
}
