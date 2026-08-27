"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("請輸入 Email 和密碼");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("登入失敗，請確認 Email 或密碼");
      return;
    }

    const { data: profile } = await supabase.from("member_profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      alert("這個帳號是一般會員，沒有後台管理權限。");
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6 text-white">
      <div className="w-full max-w-md">
        <p className="text-sm tracking-[0.3em] text-zinc-500">
          ADMIN
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          後台登入
        </h1>

        <div className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="管理員 Email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              密碼
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="密碼"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </div>

        <a
          href="/"
          className="mt-8 inline-block text-sm text-zinc-500 hover:text-white"
        >
          ← 返回網站首頁
        </a>
      </div>
    </main>
  );
}
