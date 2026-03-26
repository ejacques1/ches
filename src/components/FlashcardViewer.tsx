"use client";

import { useState, useCallback } from "react";

interface Flashcard {
  id: string;
  area_id: number;
  term: string;
  definition: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  areaName: string;
}

export default function FlashcardViewer({ flashcards, areaName }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [cards, setCards] = useState(flashcards);

  const currentCard = cards[currentIndex];
  const total = cards.length;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, total]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const shuffle = useCallback(() => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  }, [cards]);

  const reset = useCallback(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(false);
  }, [flashcards]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    },
    [flip, next, prev]
  );

  if (total === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No flashcards available for this area yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Card {currentIndex + 1} of {total}
          {shuffled && <span className="ml-2 text-york-red">(shuffled)</span>}
        </p>
        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            🔀 Shuffle
          </button>
          {shuffled && (
            <button
              onClick={reset}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              ↺ Reset Order
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-york-red rounded-full h-1.5 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer select-none"
        onClick={flip}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front (Term) */}
          <div
            className="bg-white rounded-2xl shadow-lg p-8 min-h-[280px] flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-york-red font-semibold uppercase tracking-wider mb-4">
              Term
            </p>
            <h2 className="text-2xl font-bold text-york-black text-center leading-snug">
              {currentCard.term}
            </h2>
            <p className="text-xs text-gray-400 mt-6">Click or press Space to flip</p>
          </div>

          {/* Back (Definition) */}
          <div
            className="bg-york-red rounded-2xl shadow-lg p-8 min-h-[280px] flex flex-col items-center justify-center absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wider mb-4">
              Definition
            </p>
            <p className="text-lg text-white text-center leading-relaxed">
              {currentCard.definition}
            </p>
            <p className="text-xs text-white/50 mt-6">Click or press Space to flip back</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            currentIndex === 0
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={next}
          disabled={currentIndex === total - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            currentIndex === total - 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-york-red text-white hover:bg-york-red-dark"
          }`}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Completion message */}
      {currentIndex === total - 1 && isFlipped && (
        <div className="mt-6 text-center bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700 font-medium">
            🎉 You&apos;ve reviewed all {total} flashcards for {areaName}!
          </p>
          <p className="text-green-600 text-sm mt-1">
            Ready to test yourself? Go back and take the practice quiz.
          </p>
        </div>
      )}

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Use ← → arrow keys to navigate, Space to flip
      </p>
    </div>
  );
}
