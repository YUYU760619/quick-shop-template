"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartIndicator from "../components/cart-indicator";
import { supabase } from "../lib/supabase";

type Product = { id: number; name: string; price: number; image?: string; stock?: number; snack_type?: string };

export default function KoreanSnacksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("全部");

  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    if (requestedType && ["餅乾", "泡麵", "飲料", "其他"].includes(requestedType)) setActiveType(requestedType);
    supabase.from("products").select("id, name, price, image, stock, snack_type").eq("category", "韓國零食").eq("is_active", true).order("id", { ascending: false }).then(({ data, error }) => {
      if (error) console.error("讀取韓國零食失敗：", error);
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const visibleProducts = activeType === "全部" ? products : products.filter((product) => (product.snack_type || "餅乾") === activeType);

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#f4efe6]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link href="/"><strong className="block text-2xl font-black leading-none tracking-[-.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.28em] text-[#f05a19]">咕司大福</span></Link>
        <div className="flex items-center gap-2"><Link href="/#shop" className="rounded-full border-2 border-black px-4 py-3 text-xs font-black sm:px-5 sm:text-sm">← 回商城</Link><CartIndicator /></div>
      </div>
    </header>

    <section className="overflow-hidden border-b-2 border-black bg-[#ffd84d]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.15fr_.85fr] md:px-10 md:py-24">
        <div><p className="text-sm font-black tracking-[.32em] text-[#e43d30]">GOOD STUFF / K-SNACK</p><h1 className="mt-7 text-[clamp(3.8rem,8vw,7rem)] font-black leading-none tracking-[-.065em]"><span className="block">韓國</span><span className="mt-3 block">零食區</span></h1><p className="mt-9 max-w-xl text-lg font-bold leading-8">追劇、熬夜、嘴饞都需要。咕司大福幫你挑有趣又好吃的韓國零食。</p></div>
        <div className="flex min-h-64 rotate-2 items-center justify-center rounded-[2rem] border-2 border-black bg-[#e43d30] p-8 text-center text-white shadow-[12px_12px_0_#171512]"><div><p className="text-7xl">🍜🍪</p><p className="mt-6 text-3xl font-black leading-tight">오늘 뭐 먹지？<br/><span className="text-[#ffd84d]">今天吃什麼？</span></p></div></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="flex items-end justify-between border-b-2 border-black pb-5"><div><p className="text-xs font-black tracking-[.25em] text-[#e43d30]">KOREAN SNACK COLLECTION</p><h2 className="mt-2 text-4xl font-black md:text-6xl">嘴饞就來這。</h2></div><span className="hidden font-black text-black/50 sm:block">{visibleProducts.length} 件好吃的</span></div>
      <div className="mt-7 flex gap-3 overflow-x-auto pb-2">{["全部", "餅乾", "泡麵", "飲料", "其他"].map((type)=><button key={type} type="button" onClick={()=>setActiveType(type)} className={`shrink-0 rounded-full border-2 border-black px-5 py-3 text-sm font-black ${activeType===type ? "bg-[#e43d30] text-white shadow-[3px_3px_0_#171512]" : "bg-[#fffaf1]"}`}>{type}</button>)}</div>
      {loading ? <p className="py-20 text-center font-black tracking-[.18em]">零食上架中…</p> : visibleProducts.length ? <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <Link key={product.id} href={`/products/${product.id}`} className="group flex overflow-hidden rounded-[1.6rem] border-2 border-black bg-[#fffaf1] shadow-[7px_7px_0_#171512] transition hover:-translate-y-1"><div className="flex w-full flex-col"><div className="relative aspect-square overflow-hidden bg-white">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width:640px) 100vw, 25vw" className="object-contain p-4 transition duration-300 group-hover:scale-105" unoptimized /> : <div className="grid h-full place-items-center text-6xl">🍿</div>}</div><div className="flex flex-1 flex-col border-t-2 border-black p-5"><p className="text-[11px] font-black tracking-[.2em] text-[#e43d30]">韓國零食 / {product.snack_type || "其他"}</p><h3 className="mt-2 text-xl font-black leading-snug">{product.name}</h3><div className="mt-auto flex items-end justify-between gap-3 pt-6"><span className="text-sm font-bold text-black/45">{(product.stock || 0) > 0 ? `庫存 ${product.stock}` : "目前售罄"}</span><strong className="whitespace-nowrap text-lg">NT$ {product.price.toLocaleString()}</strong></div></div></div></Link>)}</div> : <div className="mt-8 rounded-[2rem] border-2 border-dashed border-black/30 bg-[#fffaf1] p-14 text-center"><p className="text-6xl">🍪</p><h3 className="mt-5 text-2xl font-black">這個分類目前沒有商品</h3><p className="mt-3 font-semibold text-black/50">到後台編輯韓國零食，選擇對應的零食分類。</p></div>}
    </section>
  </main>;
}
