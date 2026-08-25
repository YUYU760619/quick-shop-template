"use client";

import { useEffect, useState } from "react";
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
  is_active: boolean;
  product_variants?: { color: string; size: string; stock: number }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");

  const getStockInfo = (product: Product) => {
    if (product.category === "服飾") {
      const variants = product.product_variants || [];
      const total = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
      const soldOut = variants.length === 0 || variants.every((variant) => Number(variant.stock) === 0);
      const lowVariants = variants.filter((variant) => Number(variant.stock) <= 2);
      return { total, soldOut, low: lowVariants.length > 0, lowVariants };
    }
    const total = Number(product.stock || 0);
    return { total, soldOut: total === 0, low: total <= 2, lowVariants: [] as { color: string; size: string; stock: number }[] };
  };

  const visibleProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || String(product.id).includes(searchTerm.trim());
    const stockInfo = getStockInfo(product);
    const matchesStatus = statusFilter === "全部" ||
      (statusFilter === "上架中" && product.is_active) ||
      (statusFilter === "已下架" && !product.is_active) ||
      (statusFilter === "低庫存" && product.is_active && stockInfo.low && !stockInfo.soldOut) ||
      (statusFilter === "已售完" && product.is_active && stockInfo.soldOut);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(color, size, stock)")
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
  const toggleActive = async (product: Product) => {
    const nextActive = !product.is_active;
    const action = nextActive ? "重新上架" : "下架";
    if (!window.confirm(`確定要${action}「${product.name}」嗎？`)) return;
    const { error } = await supabase.from("products").update({ is_active: nextActive }).eq("id", product.id);
    if (error) return alert(`${action}失敗：${error.message}`);
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_active: nextActive } : item));
    alert(`商品已${action}`);
  };
  const handleDelete = async (id: number) => {
  const confirmed = window.confirm("確定要刪除這個商品嗎？");

  if (!confirmed) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert(error.code === "23503" ? "這項商品已有訂單紀錄，不能永久刪除，請改用「下架」。" : `刪除失敗：${error.message}`);
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

        {!loading && products.length > 0 && <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4"><p className="text-xs text-zinc-500">上架商品</p><strong className="mt-1 block text-2xl">{products.filter((item) => item.is_active).length}</strong></div>
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4"><p className="text-xs text-orange-300">低庫存（含規格）</p><strong className="mt-1 block text-2xl text-orange-400">{products.filter((item) => item.is_active && getStockInfo(item).low && !getStockInfo(item).soldOut).length}</strong></div>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"><p className="text-xs text-red-300">已售完</p><strong className="mt-1 block text-2xl text-red-400">{products.filter((item) => item.is_active && getStockInfo(item).soldOut).length}</strong></div>
        </div>}

        {!loading && products.length > 0 && <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px]"><input type="search" value={searchTerm} onChange={(event)=>setSearchTerm(event.target.value)} placeholder="搜尋商品名稱或 ID…" className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none focus:border-white/30"/><select value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 outline-none"><option>全部</option><option>上架中</option><option>已下架</option><option>低庫存</option><option>已售完</option></select></div>}

        {loading ? (
          <p className="text-zinc-400">讀取商品中...</p>
        ) : products.length === 0 ? (
          <p className="text-zinc-400">目前還沒有商品</p>
        ) : (
          <div className="space-y-4">
            {visibleProducts.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-500">找不到符合條件的商品</div>}
            {visibleProducts.map((product) => {
              const stockInfo = getStockInfo(product);
              return (
              <div
                key={product.id}
                className={`rounded-2xl border p-5 ${product.is_active ? "border-white/10 bg-[#1a1a1a]" : "border-zinc-700 bg-[#151515] opacity-70"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white">{product.image ? <img src={product.image} alt="" className="h-full w-full object-contain p-1"/> : <div className="grid h-full place-items-center text-xs font-bold text-zinc-500">NO IMAGE</div>}</div>
                    <div className="min-w-0">
                    <h2 className="text-xl font-bold">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      類別：{product.category || "鞋類"}
                    </p>
                    <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${product.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700 text-zinc-300"}`}>{product.is_active ? "上架中" : "已下架"}</p>
                    {product.is_active && stockInfo.soldOut && <p className="ml-2 mt-2 inline-block rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">已售完</p>}
                    {product.is_active && stockInfo.low && !stockInfo.soldOut && <p className="ml-2 mt-2 inline-block rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-400">低庫存</p>}

                    <div className="mt-3 space-y-1 text-sm text-zinc-300">
                      <p>價格：NT$ {product.price}</p>
                      {product.category === "服飾" ? (
                        <>
                          <p>規格：{product.product_variants?.length || 0} 組，總庫存：{stockInfo.total}</p>
                          {stockInfo.lowVariants.length > 0 && <p className="max-w-xl text-orange-400">需補貨：{stockInfo.lowVariants.map((variant) => `${variant.color}/${variant.size} 剩 ${variant.stock}`).join("、")}</p>}
                        </>
                      ) : (
                        <>
                          <p>尺寸：{product.size || "未填寫"}</p>
                          <p>庫存：{product.stock}</p>
                        </>
                      )}
                    </div>

                    {product.description && (
                      <p className="mt-4 text-sm text-zinc-400">
                        {product.description}
                      </p>
                    )}
                    </div>
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
    onClick={() => toggleActive(product)}
    className={`rounded-lg border px-4 py-2 text-sm ${product.is_active ? "border-amber-500/40 text-amber-400" : "border-emerald-500/40 text-emerald-400"}`}
  >
    {product.is_active ? "下架" : "重新上架"}
  </button>

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
            );})}
          </div>
        )}
      </div>
    </main>
  );
}
