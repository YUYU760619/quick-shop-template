"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import OrderAlert from "./components/order-alert";
import StockAlert from "./components/stock-alert";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      // 登入頁本身不需要檢查登入
      if (pathname === "/admin/login") {
        setChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase.from("member_profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/admin/login?unauthorized=1");
        return;
      }

      setChecking(false);
    };

    checkLogin();
  }, [pathname, router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      alert("登出失敗");
      return;
    }

    router.replace("/admin/login");
  };

  // 登入頁不要顯示後台導覽與登出
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 檢查登入狀態時先不要顯示後台
  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <p className="text-zinc-400">
          檢查登入狀態...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a
            href="/admin"
            className="font-bold tracking-wider"
          >
            NULO CLEAN ADMIN
          </a>

          <div className="flex items-center gap-4">
            <StockAlert />

            <a href="/admin/members" className="text-sm text-zinc-400 hover:text-white">
              會員
            </a>

            <a
              href="/admin/bookings"
              className="text-sm text-zinc-400 hover:text-white"
            >
              預約
            </a>

            <OrderAlert />

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-zinc-300 hover:border-white/40 hover:text-white"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
