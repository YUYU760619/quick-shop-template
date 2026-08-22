"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Service = {
  id: number;
  name: string;
  name_en: string;
  price: string;
  sort_order: number;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
  name: "",
  name_en: "",
  price: "",
  sort_order: 0,
});

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      alert("讀取服務項目失敗");
      setLoading(false);
      return;
    }

    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price) {
      alert("請填寫服務名稱與價格");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("services").insert([
      {
  name: form.name,
  name_en: form.name_en,
  price: form.price,
  sort_order: form.sort_order,
},
    ]);

    if (error) {
      console.error(error);
      alert("新增服務失敗");
      setSaving(false);
      return;
    }

    setForm({
  name: "",
  name_en: "",
  price: "",
  sort_order: 0,
});

    await fetchServices();
    setSaving(false);
  };

  const handleChange = (
  id: number,
  field: "name" | "name_en" | "price" | "sort_order",
  value: string | number
) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]: value,
            }
          : service
      )
    );
  };

  const handleUpdate = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({
  name: service.name,
  name_en: service.name_en,
  price: service.price,
  sort_order: service.sort_order,
})
      .eq("id", service.id);

    if (error) {
      console.error(error);
      alert("修改服務失敗");
      return;
    }

    alert("服務已更新");
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("確定要刪除這個服務項目嗎？");

    if (!confirmed) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("刪除服務失敗");
      return;
    }

    setServices((prev) =>
      prev.filter((service) => service.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm tracking-[0.3em] text-zinc-500">
          SERVICES
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          清潔服務管理
        </h1>

        <p className="mt-3 text-zinc-400">
          新增、修改或刪除前台顯示的清潔服務與價格。
        </p>

        {/* 新增服務 */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-[#1a1a1a] p-8">
          <h2 className="text-2xl font-bold">
            新增服務
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="服務名稱，例如 基礎清潔"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
            />

            <input
              type="text"
              placeholder="英文名稱，例如 Basic Cleaning"
              value={form.name_en}
              onChange={(e) =>
                setForm({
                  ...form,
                  name_en: e.target.value,
                })
              }
              className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
            />

            <input
              type="text"
              placeholder="價格，例如 NT$380"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
              className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
            />
            <input
  type="number"
  placeholder="排序，例如 1"
  value={form.sort_order}
  onChange={(e) =>
    setForm({
      ...form,
      sort_order: Number(e.target.value),
    })
  }
  className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
/>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-50"
          >
            {saving ? "新增中..." : "新增服務"}
          </button>
        </div>

        {/* 服務列表 */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-zinc-500">
              讀取中...
            </p>
          ) : services.length === 0 ? (
            <p className="text-zinc-500">
              目前還沒有服務項目。
            </p>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-6"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) =>
                      handleChange(
                        service.id,
                        "name",
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
                  />

                  <input
                    type="text"
                    value={service.name_en || ""}
                    onChange={(e) =>
                      handleChange(
                        service.id,
                        "name_en",
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
                  />

                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) =>
                      handleChange(
                        service.id,
                        "price",
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>
                <input
  type="number"
  placeholder="排序"
  value={service.sort_order ?? 0}
  onChange={(e) =>
    handleChange(
      service.id,
      "sort_order",
      Number(e.target.value)
    )
  }
  className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
/>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdate(service)}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black"
                  >
                    儲存修改
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <a
          href="/admin"
          className="mt-8 inline-block text-sm text-zinc-500 hover:text-white"
        >
          ← 返回後台
        </a>
      </div>
    </main>
  );
}