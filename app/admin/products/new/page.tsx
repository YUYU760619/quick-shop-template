"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type VariantForm = {
  color: string;
  size: string;
  stock: string;
};

export default function NewProductPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "鞋類",
    size: "",
    stock: "",
    image: "",
    description: "",
  });
  const [variants, setVariants] = useState<VariantForm[]>([
    { color: "", size: "", stock: "" },
  ]);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("請填寫商品名稱與價格");
      return;
    }

    if (
      form.category === "服飾" &&
      variants.some((variant) => !variant.color || !variant.size || variant.stock === "")
    ) {
      alert("請完整填寫每個服飾規格的顏色、尺寸與庫存");
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

    const { data, error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        size: form.size,
        stock: Number(form.stock),
        image: imageUrl,
        description: form.description,
      },
    ]).select("id").single();

    if (error || !data) {
      console.error("Supabase products insert error:", {
        error,
        responseData: data,
        errorDetails: error
          ? {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            }
          : "products insert returned no data",
      });
      alert(error ? `新增失敗：${error.message}` : "新增失敗：商品未回傳 ID");
      setSubmitting(false);
      return;
    }

    if (form.category === "服飾") {
      const { error: variantsError } = await supabase.from("product_variants").insert(
        variants.map((variant) => ({
          product_id: data.id,
          color: variant.color.trim(),
          size: variant.size.trim(),
          stock: Number(variant.stock),
        }))
      );

      if (variantsError) {
        console.error("Supabase product_variants insert error:", {
          error: variantsError,
          message: variantsError.message,
          details: variantsError.details,
          hint: variantsError.hint,
          code: variantsError.code,
        });
        alert(`服飾規格儲存失敗：${variantsError.message}`);
        setSubmitting(false);
        return;
      }
    }

    alert("商品新增成功");
    window.location.href = "/admin/products";

    setForm({
      name: "",
      price: "",
      category: "鞋類",
      size: "",
      stock: "",
      image: "",
      description: "",
    });

    setImageFile(null);
    setVariants([{ color: "", size: "", stock: "" }]);
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
              商品類別
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"
            >
              <option value="鞋類">鞋類</option>
              <option value="服飾">服飾</option>
              <option value="其他">其他</option>
            </select>
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

          {form.category !== "服飾" && (
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
          )}

          {form.category === "服飾" && (
            <div className="space-y-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold">服飾規格</h2>
                  <p className="mt-1 text-sm text-zinc-500">每個顏色與尺寸組合各自設定庫存。</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { color: "", size: "", stock: "" }])}
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm"
                >
                  新增規格
                </button>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px]">
                  <input
                    type="text"
                    placeholder="顏色，例如：黑色"
                    value={variant.color}
                    onChange={(e) => setVariants(variants.map((item, itemIndex) => itemIndex === index ? { ...item, color: e.target.value } : item))}
                    className="min-w-0 w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="尺寸，例如：M、XL"
                    value={variant.size}
                    onChange={(e) => setVariants(variants.map((item, itemIndex) => itemIndex === index ? { ...item, size: e.target.value } : item))}
                    className="min-w-0 w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="庫存"
                    value={variant.stock}
                    onChange={(e) => setVariants(variants.map((item, itemIndex) => itemIndex === index ? { ...item, stock: e.target.value } : item))}
                    className="min-w-0 w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, itemIndex) => itemIndex !== index))}
                    disabled={variants.length === 1}
                    className="w-full justify-self-end rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 disabled:opacity-40 md:col-span-3 md:w-auto"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          )}

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