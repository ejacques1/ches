"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        if (data?.is_admin) setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-york-red">CHES Study Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-york-red transition">
              Dashboard
            </Link>
            <Link href="/preassessment" className="text-sm text-gray-600 hover:text-york-red transition">
              Pre-Assessment
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-york-red transition">
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-york-red transition"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 pt-3">
              <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/preassessment" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                Pre-Assessment
              </Link>
              {isAdmin && (
                <Link href="/admin" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-sm text-left text-gray-500 hover:bg-gray-50 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
