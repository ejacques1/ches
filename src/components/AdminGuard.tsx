"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Use server-side check to bypass RLS
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);
    };
    check();
  }, [router]);

  if (!authorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-york-red border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return <>{children}</>;
}
