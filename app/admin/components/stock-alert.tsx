"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type StockProduct = {
  category?: string;
  stock?: number;
  product_variants?: { stock: number }[];
};

export default function StockAlert() {
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    const checkStock = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category, stock, product_variants(stock)")
        .eq("is_active", true);
      if (error) return console.error("讀取庫存提醒失敗：", error);
      const products = (data || []) as StockProduct[];
      setLowCount(products.filter((product) => {
        if (product.category === "服飾") {
          const variants = product.product_variants || [];
          return variants.length === 0 || variants.some((variant) => Number(variant.stock) <= 2);
        }
        return Number(product.stock || 0) <= 2;
      }).length);
    };
    checkStock();
    const timer = window.setInterval(checkStock, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") checkStock(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  return (
    <Link href="/admin/products" className="relative rounded-lg px-2 py-2 text-sm text-zinc-400 hover:text-white" title={lowCount ? `${lowCount} 項商品需要補貨` : "商品庫存正常"}>
      商品
      {lowCount > 0 && <span className="absolute -right-2 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-black text-white">{lowCount > 99 ? "99+" : lowCount}</span>}
    </Link>
  );
}
