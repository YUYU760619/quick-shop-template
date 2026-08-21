"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function BookingPage() {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    shoes: "",
    service: "",
    note: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.shoes || !form.service) {
      alert("請填寫姓名、電話、鞋款與清潔項目");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("bookings").insert([
      {
        name: form.name,
        phone: form.phone,
        shoes: form.shoes,
        service: form.service,
        note: form.note,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert("預約送出失敗");
      return;
    }

    alert("預約送出成功");

    setForm({
      name: "",
      phone: "",
      shoes: "",
      service: "",
      note: "",
    });
  };

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <a
          href="/"
          className="mb-8 inline-block text-sm text-zinc-400 hover:text-white"
        >
          ← 返回首頁
        </a>

        <p className="text-sm tracking-[0.3em] text-zinc-500">
          BOOKING
        </p>

        <h1 className="mt-3 text-3xl font-bold md:text-5xl">
          預約清潔
        </h1>

        <div className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              姓名
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              電話
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              鞋款
            </label>
            <input
              type="text"
              value={form.shoes}
              onChange={(e) =>
                setForm({ ...form, shoes: e.target.value })
              }
              placeholder="例如：Air Jordan 1"
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              清潔項目
            </label>
            <select
              value={form.service}
              onChange={(e) =>
                setForm({ ...form, service: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
            >
              <option value="">請選擇</option>
              <option value="基礎清潔">基礎清潔</option>
              <option value="深層清潔">深層清潔</option>
              <option value="麂皮清潔">麂皮清潔</option>
              <option value="鞋底清潔">鞋底清潔</option>
              <option value="局部處理">局部處理</option>
              <option value="特殊鞋款">特殊鞋款</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              備註
            </label>
            <textarea
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              className="min-h-32 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="例如：鞋面有油漬、泛黃、麂皮掉色..."
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {submitting ? "送出中..." : "送出預約"}
          </button>
        </div>
      </div>
    </main>
  );
}