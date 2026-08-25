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
type ProductImage = { id: number; image_url: string; sort_order: number };

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "鞋類",
    snack_type: "餅乾",
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
        snack_type: data.snack_type || "餅乾",
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

      const { data: galleryData, error: galleryError } = await supabase.from("product_images").select("id, image_url, sort_order").eq("product_id", id).order("sort_order", { ascending: true });
      if (galleryError) console.error("讀取穿搭圖失敗：", galleryError);
      else setGalleryImages(galleryData || []);

      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    const urls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  const removeGalleryImage = async (image: ProductImage) => {
    if (!window.confirm("確定要移除這張穿搭圖嗎？")) return;
    const { error } = await supabase.from("product_images").delete().eq("id", image.id);
    if (error) return alert(`移除失敗：${error.message}`);
    setGalleryImages((current) => current.filter((item) => item.id !== image.id));
  };

  const removeMainImage = async () => {
    if (!window.confirm("確定要刪除目前主圖嗎？")) return;
    const replacement = galleryImages[0];
    const { error } = await supabase.from("products").update({ image: replacement?.image_url || null }).eq("id", id);
    if (error) return alert(`刪除主圖失敗：${error.message}`);
    if (replacement) {
      const { error: removeError } = await supabase.from("product_images").delete().eq("id", replacement.id);
      if (removeError) return alert(`遞補主圖失敗：${removeError.message}`);
      setGalleryImages((current) => current.filter((item) => item.id !== replacement.id));
    }
    setForm((current) => ({ ...current, image: replacement?.image_url || "" }));
    setImageFile(null);
  };

  const makePrimaryImage = async (image: ProductImage) => {
    const oldMain = form.image;
    const { error: productError } = await supabase.from("products").update({ image: image.image_url }).eq("id", id);
    if (productError) return alert(`設定主圖失敗：${productError.message}`);
    if (oldMain) {
      const { error } = await supabase.from("product_images").update({ image_url: oldMain }).eq("id", image.id);
      if (error) return alert(`交換圖片失敗：${error.message}`);
      setGalleryImages((current) => current.map((item) => item.id === image.id ? { ...item, image_url: oldMain } : item));
    } else {
      const { error } = await supabase.from("product_images").delete().eq("id", image.id);
      if (error) return alert(`設定主圖失敗：${error.message}`);
      setGalleryImages((current) => current.filter((item) => item.id !== image.id));
    }
    setForm((current) => ({ ...current, image: image.image_url }));
  };

  const moveGalleryImage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const reordered = [...galleryImages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const normalized = reordered.map((image, imageIndex) => ({ ...image, sort_order: imageIndex }));
    setGalleryImages(normalized);
    const results = await Promise.all(normalized.map((image) => supabase.from("product_images").update({ sort_order: image.sort_order }).eq("id", image.id)));
    const failed = results.find((result) => result.error);
    if (failed?.error) alert(`調整順序失敗：${failed.error.message}`);
  };

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
      snack_type: form.category === "韓國零食" ? form.snack_type : null,
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

  const { data: storedVariants, error: storedVariantsError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", id);

  if (storedVariantsError) {
    setSaving(false);
    return alert(`讀取原有商品規格失敗：${storedVariantsError.message}`);
  }

  const keptIds = variants.flatMap((variant) => variant.id ? [variant.id] : []);
  const removedIds = (storedVariants || []).map((variant) => variant.id).filter((variantId) => !keptIds.includes(variantId));

  // 歷史訂單會保留規格 ID，因此移除規格時只歸零，不實際刪除資料。
  if (removedIds.length) {
    const { error: retireError } = await supabase.from("product_variants").update({ stock: 0 }).in("id", removedIds);
    if (retireError) {
      setSaving(false);
      return alert(`停用舊商品規格失敗：${retireError.message}`);
    }
  }

  if (form.category === "服飾") {
    for (const variant of variants) {
      const values = { product_id: id, color: variant.color.trim(), size: variant.size.trim(), stock: Number(variant.stock) };
      const result = variant.id
        ? await supabase.from("product_variants").update(values).eq("id", variant.id).eq("product_id", id)
        : await supabase.from("product_variants").insert(values);
      if (result.error) {
        setSaving(false);
        return alert(`商品規格儲存失敗：${result.error.message}`);
      }
    }
  }

  if (galleryFiles.length) {
    const newImages: { product_id: number; image_url: string; sort_order: number }[] = [];
    for (const [index, file] of galleryFiles.entries()) {
      const fileExt = file.name.split(".").pop();
      const fileName = `gallery-${id}-${Date.now()}-${index}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
      if (uploadError) { setSaving(false); return alert(`穿搭圖上傳失敗：${uploadError.message}`); }
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      newImages.push({ product_id: id, image_url: data.publicUrl, sort_order: galleryImages.length + index });
    }
    const { error: galleryInsertError } = await supabase.from("product_images").insert(newImages);
    if (galleryInsertError) { setSaving(false); return alert(`穿搭圖儲存失敗：${galleryInsertError.message}`); }
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

        <div className="mb-8 grid gap-5 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-white">
            {imagePreview || form.image ? (
              <img src={imagePreview || form.image} alt={form.name || "商品圖片"} className="h-full w-full object-contain p-2" />
            ) : (
              <div className="grid h-full place-items-center text-sm font-bold text-zinc-500">尚無商品圖片</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[.2em] text-orange-400">目前編輯商品</p>
            <h2 className="mt-2 break-words text-xl font-bold">{form.name}</h2>
            <p className="mt-2 text-sm text-zinc-500">{form.category} · 商品 ID {id}</p>
            {imageFile && <p className="mt-3 text-sm font-bold text-emerald-400">新圖片預覽 · 儲存後才會正式更換</p>}
            {(form.image || imageFile) && <button type="button" onClick={removeMainImage} className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-bold text-red-400">刪除目前主圖</button>}
          </div>
        </div>

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
              <option value="韓國零食">韓國零食</option>
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
                {form.category === "韓國零食" ? "規格／容量" : "尺寸"}
              </label>
              <input
                type="text"
                value={form.size}
                placeholder={form.category === "韓國零食" ? "例如：55g／3包入" : "例如：US 9"}
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

          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <div><h2 className="font-bold">穿搭圖／更多商品圖片</h2><p className="mt-1 text-sm text-zinc-500">可一次選擇多張；儲存後會顯示在商品頁主圖下方。</p></div>
            {(galleryImages.length > 0 || galleryPreviews.length > 0) && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{galleryImages.map((image,index)=><div key={image.id} className="overflow-hidden rounded-xl border border-white/10 bg-white"><img src={image.image_url} alt={`副圖 ${index+1}`} className="aspect-square w-full object-contain"/><div className="grid grid-cols-2 gap-1 bg-[#111] p-2"><button type="button" onClick={()=>makePrimaryImage(image)} className="col-span-2 rounded bg-orange-600 px-2 py-2 text-xs font-bold text-white">設為主圖</button><button type="button" disabled={index===0} onClick={()=>moveGalleryImage(index,-1)} className="rounded border border-white/20 px-2 py-2 text-xs font-bold disabled:opacity-25">← 前移</button><button type="button" disabled={index===galleryImages.length-1} onClick={()=>moveGalleryImage(index,1)} className="rounded border border-white/20 px-2 py-2 text-xs font-bold disabled:opacity-25">後移 →</button><button type="button" onClick={()=>removeGalleryImage(image)} className="col-span-2 rounded border border-red-500/50 px-2 py-2 text-xs font-bold text-red-400">刪除圖片</button></div></div>)}{galleryPreviews.map((url,index)=><div key={url} className="overflow-hidden rounded-xl border border-emerald-500/40 bg-white"><img src={url} alt={`新穿搭圖 ${index+1}`} className="aspect-square w-full object-contain"/><p className="bg-emerald-600 px-2 py-1 text-center text-xs font-bold">待儲存</p></div>)}</div>}
            <input type="file" accept="image/*" multiple onChange={(event)=>setGalleryFiles(Array.from(event.target.files || []))} className="mt-4 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3"/>
          </div>

          {form.category === "韓國零食" && <div><label className="mb-2 block text-sm text-zinc-300">零食分類</label><select value={form.snack_type} onChange={(e)=>setForm({...form,snack_type:e.target.value})} className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"><option value="餅乾">餅乾</option><option value="泡麵">泡麵</option><option value="飲料">飲料</option><option value="其他">其他</option></select></div>}

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
