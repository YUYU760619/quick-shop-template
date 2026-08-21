"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    size: "",
    stock: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert("讀取商品失敗");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || "",
        price: String(data.price ?? ""),
        size: data.size || "",
        stock: String(data.stock ?? ""),
        image: data.image || "",
        description: data.description || "",
      });

      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSave = async () => {
  setSaving(true);

  let imageUrl = form.image;

  // 有選新圖片才上傳
  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error(uploadError);
      alert("圖片上傳失敗");
      setSaving(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: form.name,
      price: Number(form.price),
      size: form.size,
      stock: Number(form.stock),
      image: imageUrl,
      description: form.description,
    })
    .eq("id", id);

  setSaving(false);

  if (error) {
    console.error(error);
    alert("修改失敗");
    return;
  }

  alert("商品修改成功");
  window.location.href = "/admin/products";
};
  if (loading) {
    return (
      <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-zinc-400">讀取商品中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">編輯商品</h1>

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
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存修改"}
          </button>
        </div>
      </div>
    </main>
  );
}