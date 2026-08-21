"use client";

import { useEffect, useState } from "react";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        alert("讀取商品失敗");
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);
  const handleDelete = async (id: number) => {
  const confirmed = window.confirm("確定要刪除這個商品嗎？");

  if (!confirmed) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("刪除失敗");
    return;
  }

  setProducts((current) =>
    current.filter((product) => product.id !== id)
  );

  alert("商品已刪除");
};

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">商品管理</h1>

          <a
            href="/admin/products/new"
            className="rounded-xl bg-white px-5 py-3 font-bold text-black"
          >
            ＋ 新增商品
          </a>
        </div>

        {loading ? (
          <p className="text-zinc-400">讀取商品中...</p>
        ) : products.length === 0 ? (
          <p className="text-zinc-400">目前還沒有商品</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {product.name}
                    </h2>

                    <div className="mt-3 space-y-1 text-sm text-zinc-300">
                      <p>價格：NT$ {product.price}</p>
                      <p>尺寸：{product.size || "未填寫"}</p>
                      <p>庫存：{product.stock}</p>
                    </div>

                    {product.description && (
                      <p className="mt-4 text-sm text-zinc-400">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
  <div className="text-sm text-zinc-500">
    ID：{product.id}
  </div>

  <a
    href={`/admin/products/${product.id}`}
    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white"
  >
    編輯
  </a>

  <button
    type="button"
    onClick={() => handleDelete(product.id)}
    className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400"
  >
    刪除
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