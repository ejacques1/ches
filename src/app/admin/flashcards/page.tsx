"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";
import { AREAS_OF_RESPONSIBILITY } from "@/lib/constants";

interface Flashcard {
  id: string;
  area_id: number;
  term: string;
  definition: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<number>(0); // 0 = all
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArea, setNewArea] = useState(1);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [saving, setSaving] = useState(false);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  };

  const loadFlashcards = async () => {
    const token = await getToken();
    const url = selectedArea
      ? `/api/admin/flashcards?area_id=${selectedArea}`
      : "/api/admin/flashcards";

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setFlashcards(data.flashcards || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);

  const toggleActive = async (fc: Flashcard) => {
    const token = await getToken();
    const res = await fetch("/api/admin/flashcards", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: fc.id, is_active: !fc.is_active }),
    });

    if (res.ok) {
      setFlashcards((prev) =>
        prev.map((f) => (f.id === fc.id ? { ...f, is_active: !f.is_active } : f))
      );
    }
  };

  const startEdit = (fc: Flashcard) => {
    setEditingId(fc.id);
    setEditTerm(fc.term);
    setEditDefinition(fc.definition);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const token = await getToken();
    const res = await fetch("/api/admin/flashcards", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: editingId, term: editTerm, definition: editDefinition }),
    });

    if (res.ok) {
      setFlashcards((prev) =>
        prev.map((f) =>
          f.id === editingId ? { ...f, term: editTerm, definition: editDefinition } : f
        )
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  const addFlashcard = async () => {
    if (!newTerm.trim() || !newDefinition.trim()) return;
    setSaving(true);
    const token = await getToken();
    const res = await fetch("/api/admin/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ area_id: newArea, term: newTerm, definition: newDefinition }),
    });

    if (res.ok) {
      setNewTerm("");
      setNewDefinition("");
      setShowAddForm(false);
      loadFlashcards();
    }
    setSaving(false);
  };

  const deleteFlashcard = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this flashcard?")) return;
    const token = await getToken();
    const res = await fetch("/api/admin/flashcards", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setFlashcards((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const filtered = flashcards;
  const activeCount = filtered.filter((f) => f.is_active).length;
  const inactiveCount = filtered.filter((f) => !f.is_active).length;

  return (
    <>
      <Navbar />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/admin" className="hover:text-york-red transition">
                  Admin Dashboard
                </Link>
                <span>/</span>
                <span className="text-york-black font-medium">Flashcards</span>
              </div>
              <h1 className="text-2xl font-bold text-york-black">Manage Flashcards</h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeCount} active · {inactiveCount} inactive
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-york-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-dark transition"
            >
              {showAddForm ? "Cancel" : "+ Add Flashcard"}
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="font-semibold text-york-black mb-4">Add New Flashcard</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                  >
                    {AREAS_OF_RESPONSIBILITY.map((a) => (
                      <option key={a.id} value={a.id}>
                        Area {a.id}: {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="e.g., Needs Assessment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                  <textarea
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="The definition that appears when the card is flipped..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                  />
                </div>
                <button
                  onClick={addFlashcard}
                  disabled={saving || !newTerm.trim() || !newDefinition.trim()}
                  className="bg-york-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-york-red-dark transition disabled:opacity-50 w-fit"
                >
                  {saving ? "Saving..." : "Add Flashcard"}
                </button>
              </div>
            </div>
          )}

          {/* Area filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedArea(0)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedArea === 0
                  ? "bg-york-red text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Areas ({flashcards.length})
            </button>
            {AREAS_OF_RESPONSIBILITY.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArea(a.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedArea === a.id
                    ? "bg-york-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Area {a.id}
              </button>
            ))}
          </div>

          {/* Flashcards list */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((fc) => (
                <div
                  key={fc.id}
                  className={`bg-white rounded-xl shadow-sm border p-4 ${
                    !fc.is_active ? "opacity-50 border-gray-300" : "border-gray-200"
                  }`}
                >
                  {editingId === fc.id ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-york-red"
                      />
                      <textarea
                        value={editDefinition}
                        onChange={(e) => setEditDefinition(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-york-red"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="bg-york-red text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-york-red-dark transition disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-york-red-light text-york-red px-2 py-0.5 rounded-full font-medium">
                              Area {fc.area_id}
                            </span>
                            {!fc.is_active && (
                              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-york-black text-sm mt-1">
                            {fc.term}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {fc.definition}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(fc)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleActive(fc)}
                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition ${
                              fc.is_active ? "text-green-500" : "text-gray-400"
                            }`}
                            title={fc.is_active ? "Deactivate" : "Activate"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {fc.is_active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteFlashcard(fc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No flashcards found for this area.
                </div>
              )}
            </div>
          )}
        </div>
      </AdminGuard>
    </>
  );
}
