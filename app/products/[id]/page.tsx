"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  size: string;
  stock: number;
  image: string;
  description: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProduct(data);
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
              <div>
                <p className="text-sm text-zinc-500">尺寸</p>
                <p className="mt-1">
                  {product.size || "未填寫"}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">庫存</p>
                <p className="mt-1">
                  {product.stock}
                </p>
              </div>
            </div>
            <button
  type="button"
  onClick={async () => {
    const message = `我想詢問這個商品
商品：${product.name}
價格：NT$ ${product.price}
尺寸：${product.size || "未填寫"}`;

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