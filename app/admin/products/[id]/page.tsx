"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Variant = {
  id?: number;
  color: string;
  size: string;
  stock: string;
};

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "鞋類",
    size: "",
    stock: "",
    image: "",
    description: "",
  });
  const [variants, setVariants] = useState<Variant[]>([]);

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
        category: data.category || "鞋類",
        size: data.size || "",
        stock: String(data.stock ?? ""),
        image: data.image || "",
        description: data.description || "",
      });

      const { data: variantData, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, color, size, stock")
        .eq("product_id", id)
        .order("id", { ascending: true });

      if (variantsError) {
        console.error("Supabase product_variants select error:", {
          error: variantsError,
          message: variantsError.message,
          details: variantsError.details,
          hint: variantsError.hint,
          code: variantsError.code,
        });
        alert(`讀取商品規格失敗：${variantsError.message}`);
      } else {
        setVariants(
          (variantData || []).map((variant) => ({
            id: variant.id,
            color: variant.color,
            size: variant.size,
            stock: String(variant.stock),
          }))
        );
      }

      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSave = async () => {
  if (
    form.category === "服飾" &&
    (variants.length === 0 || variants.some((variant) => !variant.color || !variant.size || variant.stock === ""))
  ) {
    alert("請完整填寫每個服飾規格的顏色、尺寸與庫存");
    return;
  }

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
      category: form.category,
      size: form.size,
      stock: Number(form.stock),
      image: imageUrl,
      description: form.description,
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase products update error:", {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    alert(`修改失敗：${error.message}`);
    setSaving(false);
    return;
  }

  const { error: deleteVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", id);

  if (deleteVariantsError) {
    console.error("Supabase product_variants delete error:", {
      error: deleteVariantsError,
      message: deleteVariantsError.message,
      details: deleteVariantsError.details,
      hint: deleteVariantsError.hint,
      code: deleteVariantsError.code,
    });
    alert(`商品規格刪除失敗：${deleteVariantsError.message}`);
    setSaving(false);
    return;
  }

  if (form.category === "服飾") {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      variants.map((variant) => ({
        product_id: id,
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
      alert(`商品規格新增失敗：${variantsError.message}`);
      setSaving(false);
      return;
    }
  }

  setSaving(false);
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
            <label className="mb-2 block text-sm text-zinc-300">商品類別</label>
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
                <div key={variant.id ?? index} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px]">
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
                    className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 md:col-span-3 md:justify-self-end"
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
