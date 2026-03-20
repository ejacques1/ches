"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentView, setStudentView] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const res = await fetch("/api/admin/check", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) setIsAdmin(true);
        } catch {
          // Not admin or error
        }
      }
    };
    checkAdmin();
  }, []);

  // Detect if admin is on a student page
  useEffect(() => {
    if (isAdmin) {
      const isOnStudentPage = pathname === "/dashboard" || pathname === "/preassessment" || pathname?.startsWith("/quiz");
      setStudentView(isOnStudentPage);
    }
  }, [isAdmin, pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleView = () => {
    if (studentView) {
      // Switch back to admin
      setStudentView(false);
      router.push("/admin");
    } else {
      // Switch to student view
      setStudentView(true);
      router.push("/dashboard");
    }
  };

  const showAdminNav = isAdmin && !studentView;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Student view banner */}
      {isAdmin && studentView && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1.5 text-center">
          <span className="text-xs text-yellow-700 font-medium">
            Viewing as Student
          </span>
          <button
            onClick={() => { setStudentView(false); router.push("/admin"); }}
            className="ml-3 text-xs text-york-red font-semibold hover:underline"
          >
            Back to Admin
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href={showAdminNav ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <span className="text-xl font-bold text-york-red">CHES Study Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {showAdminNav ? (
              <>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-york-red transition">
                  Dashboard
                </Link>
                <Link href="/admin/questions" className="text-sm text-gray-600 hover:text-york-red transition">
                  Questions
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-york-red transition">
                  Dashboard
                </Link>
                <Link href="/preassessment" className="text-sm text-gray-600 hover:text-york-red transition">
                  Pre-Assessment
                </Link>
              </>
            )}

            {/* View toggle for admins */}
            {isAdmin && (
              <button
                onClick={toggleView}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition border border-gray-300 hover:border-york-red hover:text-york-red"
              >
                {studentView ? "Admin View" : "Student View"}
              </button>
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
              {showAdminNav ? (
                <>
                  <Link href="/admin" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/admin/questions" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Questions
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/preassessment" className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Pre-Assessment
                  </Link>
                </>
              )}

              {/* View toggle for admins (mobile) */}
              {isAdmin && (
                <button
                  onClick={() => { setMenuOpen(false); toggleView(); }}
                  className="px-3 py-2 text-sm text-left text-york-red font-medium hover:bg-gray-50 rounded"
                >
                  {studentView ? "Switch to Admin View" : "Switch to Student View"}
                </button>
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
