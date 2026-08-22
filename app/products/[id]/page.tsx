"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  size: string;
  stock: number;
  image: string;
  description: string;
  product_variants?: Variant[];
};

type Variant = {
  id: number;
  color: string;
  size: string;
  stock: number;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(id, color, size, stock)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProduct(data);
      if (data.category === "服飾" && data.product_variants?.length) {
        setSelectedColor(data.product_variants[0].color);
        setSelectedSize(data.product_variants[0].size);
      }
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-400">讀取商品中...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-400">找不到這個商品</p>
        </div>
      </main>
    );
  }

  const variants = product.product_variants || [];
  const colors = [...new Set(variants.map((variant) => variant.color))];
  const sizes = [...new Set(variants.filter((variant) => !selectedColor || variant.color === selectedColor).map((variant) => variant.size))];
  const selectedVariant = variants.find(
    (variant) => variant.color === selectedColor && variant.size === selectedSize
  );

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <a
          href="/"
          className="mb-8 inline-block text-sm text-zinc-400 hover:text-white"
        >
          ← 返回首頁
        </a>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1a]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                尚未上傳圖片
              </div>
            )}
          </div>

          <div>
            <p className="text-sm tracking-[0.3em] text-zinc-500">
              PRODUCT
            </p>

            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-3xl font-bold">
              NT$ {product.price}
            </p>

            <div className="mt-8 space-y-4 text-zinc-300">
              {product.category === "服飾" ? (
                <>
                  <div>
                    <p className="text-sm text-zinc-500">顏色</p>
                    <select
                      value={selectedColor}
                      onChange={(e) => {
                        const nextColor = e.target.value;
                        const nextSize = variants.find((variant) => variant.color === nextColor)?.size || "";
                        setSelectedColor(nextColor);
                        setSelectedSize(nextSize);
                      }}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white outline-none"
                    >
                      {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">尺寸</p>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white outline-none"
                    >
                      {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">對應庫存</p>
                    <p className="mt-1">{selectedVariant?.stock ?? 0}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-zinc-500">尺寸</p>
                    <p className="mt-1">{product.size || "未填寫"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">庫存</p>
                    <p className="mt-1">{product.stock}</p>
                  </div>
                </>
              )}
            </div>
            <button
  type="button"
  onClick={async () => {
    const message = `我想詢問這個商品
商品：${product.name}
價格：NT$ ${product.price}
類別：${product.category || "鞋類"}
顏色：${product.category === "服飾" ? selectedColor : "不適用"}
尺寸：${product.category === "服飾" ? selectedSize : (product.size || "未填寫")}
庫存：${product.category === "服飾" ? (selectedVariant?.stock ?? 0) : product.stock}`;

    await navigator.clipboard.writeText(message);

    alert("商品資料已複製！等等到 LINE 直接貼上就可以了。");

    window.open("https://lin.ee/Xjq4kmL", "_blank");
  }}
  className="mt-8 inline-block w-full rounded-full bg-white px-6 py-4 text-center font-bold text-black transition hover:bg-zinc-200"
>
  LINE 詢問此商品
</button>

            {product.description && (
              <div className="mt-8 border-t border-white/10 pt-8">
                <p className="text-sm text-zinc-500">
                  商品描述
                </p>

                <p className="mt-3 leading-7 text-zinc-300">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}