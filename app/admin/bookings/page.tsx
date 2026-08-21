"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Booking = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  shoes: string;
  service: string;
  note: string;
  status: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("讀取預約失敗");
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (
    id: number,
    status: string
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("更新狀態失敗");
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? { ...booking, status }
          : booking
      )
    );
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "確定要刪除這筆預約嗎？"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("刪除預約失敗");
      return;
    }

    setBookings((current) =>
      current.filter((booking) => booking.id !== id)
    );

    alert("預約已刪除");
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.status === filter
        );

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">
          預約管理
        </h1>

        {/* 狀態篩選 */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-4 py-2 text-sm ${
              filter === "all"
                ? "bg-white text-black"
                : "border border-white/20 text-white"
            }`}
          >
            全部
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-xl px-4 py-2 text-sm ${
              filter === "pending"
                ? "bg-white text-black"
                : "border border-white/20 text-white"
            }`}
          >
            待處理
          </button>

          <button
            type="button"
            onClick={() => setFilter("contacted")}
            className={`rounded-xl px-4 py-2 text-sm ${
              filter === "contacted"
                ? "bg-white text-black"
                : "border border-white/20 text-white"
            }`}
          >
            已聯絡
          </button>

          <button
            type="button"
            onClick={() => setFilter("cleaning")}
            className={`rounded-xl px-4 py-2 text-sm ${
              filter === "cleaning"
                ? "bg-white text-black"
                : "border border-white/20 text-white"
            }`}
          >
            清洗中
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-xl px-4 py-2 text-sm ${
              filter === "completed"
                ? "bg-white text-black"
                : "border border-white/20 text-white"
            }`}
          >
            已完成
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-400">
            讀取預約中...
          </p>
        ) : filteredBookings.length === 0 ? (
          <p className="text-zinc-400">
            目前沒有符合的預約
          </p>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5"
              >
                <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">
                        {booking.name}
                      </h2>

                      <span className="text-sm text-zinc-500">
                        ID：{booking.id}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                      <p>
                        電話：{booking.phone}
                      </p>

                      <p>
                        鞋款：{booking.shoes}
                      </p>

                      <p>
                        清潔項目：{booking.service}
                      </p>

                      <p>
                        建立時間：
                        {new Date(
                          booking.created_at
                        ).toLocaleString("zh-TW")}
                      </p>
                    </div>

                    {booking.note && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-sm text-zinc-500">
                          備註
                        </p>

                        <p className="mt-2 text-sm text-zinc-300">
                          {booking.note}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-40">
                    <label className="mb-2 block text-sm text-zinc-500">
                      處理狀態
                    </label>

                    <select
                      value={booking.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(
                          booking.id,
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none"
                    >
                      <option value="pending">
                        待處理
                      </option>

                      <option value="contacted">
                        已聯絡
                      </option>

                      <option value="cleaning">
                        清洗中
                      </option>

                      <option value="completed">
                        已完成
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(booking.id)
                      }
                      className="mt-3 w-full rounded-xl border border-red-500/40 px-4 py-3 text-sm text-red-400"
                    >
                      刪除預約
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}