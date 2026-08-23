"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      alert("登出失敗");
      return;
    }

    router.replace("/admin/login");
  };

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        {/* 標題 */}
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm tracking-[0.3em] text-zinc-500">
              ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              NULO CLEAN 後台
            </h1>

            <p className="mt-3 text-zinc-400">
              管理商品、清潔服務與預約
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm text-zinc-300 hover:border-white/40 hover:text-white"
          >
            登出
          </button>
        </div>

        {/* 後台功能 */}
        <div className="grid gap-6 md:grid-cols-2">

          <a href="/admin/orders" className="rounded-3xl border border-orange-500/30 bg-[#1a1a1a] p-8 transition hover:-translate-y-1 hover:border-orange-500"><p className="text-sm tracking-[0.2em] text-orange-500">ORDERS</p><h2 className="mt-4 text-3xl font-bold">訂單管理</h2><p className="mt-4 leading-7 text-zinc-400">查看訂購內容、收件資料與更新訂單狀態。</p><div className="mt-8 text-sm font-medium">進入訂單管理 →</div></a>

          {/* 商品管理 */}
          <a
            href="/admin/products"
            className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 transition hover:-translate-y-1 hover:border-white/30"
          >
            <p className="text-sm tracking-[0.2em] text-zinc-500">
              PRODUCTS
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              商品管理
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              新增商品、修改價格與庫存、更新圖片、刪除商品。
            </p>

            <div className="mt-8 text-sm font-medium">
              進入商品管理 →
            </div>
          </a>

          {/* 預約管理 */}
          <a
            href="/admin/bookings"
            className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 transition hover:-translate-y-1 hover:border-white/30"
          >
            <p className="text-sm tracking-[0.2em] text-zinc-500">
              BOOKINGS
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              預約管理
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              查看客人預約、鞋款與備註，管理預約狀態。
            </p>

            <div className="mt-8 text-sm font-medium">
              進入預約管理 →
            </div>
          </a>

          {/* 網站設定 */}
          <a
            href="/admin/site"
            className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 transition hover:-translate-y-1 hover:border-white/30"
          >
            <p className="text-sm tracking-[0.2em] text-zinc-500">
              SITE
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              網站設定
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              更換首頁圖片與修改網站顯示內容。
            </p>

            <div className="mt-8 text-sm font-medium">
              進入網站設定 →
            </div>
          </a>

          {/* 清潔服務管理 */}
          <a
            href="/admin/services"
            className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 transition hover:-translate-y-1 hover:border-white/30"
          >
            <p className="text-sm tracking-[0.2em] text-zinc-500">
              SERVICES
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              清潔服務管理
            </h2>

            <p className="mt-4 leading-7 text-zinc-400">
              新增、修改或刪除清潔服務與價格。
            </p>

            <div className="mt-8 text-sm font-medium">
              進入清潔服務管理 →
            </div>
          </a>

        </div>

        {/* 返回首頁 */}
        <div className="mt-8">
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← 返回網站首頁
          </a>
        </div>

      </div>
    </main>
  );
}
