"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FlashcardViewer from "@/components/FlashcardViewer";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY } from "@/lib/constants";

interface Flashcard {
  id: string;
  area_id: number;
  term: string;
  definition: string;
}

export default function FlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = parseInt(params.areaId as string);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const area = AREAS_OF_RESPONSIBILITY.find((a) => a.id === areaId);

  useEffect(() => {
    const loadFlashcards = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`/api/flashcards?area_id=${areaId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFlashcards(data.flashcards || []);
        }
      } catch {
        // Silently fail
      }

      setLoading(false);
    };

    loadFlashcards();
  }, [areaId, router]);

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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/practice" className="hover:text-york-red transition">
            Practice
          </Link>
          <span>/</span>
          <span className="text-york-black font-medium">Flashcards</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-york-red-light flex items-center justify-center flex-shrink-0">
              <span className="text-york-red font-bold text-sm">{areaId}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-york-black">
                Study Flashcards
              </h1>
              <p className="text-sm text-gray-500">
                Area {areaId}: {area?.name || "Unknown"}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Review these key terms and definitions before taking the practice quiz.
            Flip each card to reveal the definition.
          </p>
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer
          flashcards={flashcards}
          areaName={area?.name || "this area"}
        />

        {/* Bottom action */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/practice"
            className="text-center px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
          >
            ← Back to Practice
          </Link>
          <Link
            href={`/quiz/area/${areaId}`}
            className="text-center px-6 py-3 rounded-lg bg-york-red text-white font-medium text-sm hover:bg-york-red-dark transition"
          >
            Take Practice Quiz — Area {areaId}
          </Link>
        </div>
      </div>
    </>
  );
}
