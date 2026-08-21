"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NewProductPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    size: "",
    stock: "",
    image: "",
    description: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("請填寫商品名稱與價格");
      return;
    }

    setSubmitting(true);

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("圖片上傳失敗");
        setSubmitting(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        size: form.size,
        stock: Number(form.stock),
        image: imageUrl,
        description: form.description,
      },
    ]);

    if (error) {
      console.error(error);
      alert("新增失敗");
      setSubmitting(false);
      return;
    }

    alert("商品新增成功");
    window.location.href = "/admin/products";

    setForm({
      name: "",
      price: "",
      size: "",
      stock: "",
      image: "",
      description: "",
    });

    setImageFile(null);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">新增商品</h1>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              商品名稱
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="例如：Air Jordan 1 Low"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              價格
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="例如：2980"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                尺寸
              </label>
              <input
                type="text"
                value={form.size}
                onChange={(e) =>
                  setForm({ ...form, size: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
                placeholder="例如：US 9"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                庫存
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
                placeholder="例如：1"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              商品圖片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3"
            />

            {imageFile && (
              <p className="mt-2 text-sm text-zinc-500">
                已選擇：{imageFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              商品描述
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-32 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
              placeholder="輸入商品狀況、尺寸、品牌等資訊"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {submitting ? "新增中..." : "新增商品"}
          </button>
        </div>
      </div>
    </main>
  );
}