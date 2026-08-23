"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Product = { id: string; name: string; category?: string; image?: string; stock?: number; price: number; product_variants?: { stock: number }[] };
const fallback = { address: "台北｜可私訊詢問收送方式", hours: "預約制", phone: "", instagram: "https://instagram.com/", line: "https://line.me/" };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState(fallback);
  const [activeCategory, setActiveCategory] = useState("全部");

  useEffect(() => {
    const load = async () => {
      const [productResult, settingResult] = await Promise.all([
        supabase.from("products").select("*, product_variants(stock)").order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*").limit(1).single(),
      ]);
      if (productResult.error) console.error("讀取商品失敗：", productResult.error); else setProducts(productResult.data || []);
      if (!settingResult.error && settingResult.data) setShopInfo({ address: settingResult.data.address || fallback.address, hours: settingResult.data.business_hours || fallback.hours, phone: settingResult.data.phone || fallback.phone, instagram: settingResult.data.instagram || fallback.instagram, line: settingResult.data.line_url || fallback.line });
    };
    load();
  }, []);

  const categories = ["全部", "鞋類", "服飾", "其他"];
  const visibleProducts = activeCategory === "全部"
    ? products
    : products.filter((product) => (product.category || "其他") === activeCategory);

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#f4efe6]/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
      <a href="#top"><strong className="block text-2xl font-black leading-none tracking-[-0.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[0.28em] text-[#f05a19]">咕司大福</span></a>
      <nav className="hidden gap-8 text-sm font-bold md:flex"><a href="#shop">SHOP</a><Link href="/booking">NULO CLEAN</Link><a href="#about">ABOUT</a></nav>
      <a href="#shop" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">逛好東西 →</a>
    </div><nav className="grid grid-cols-3 border-t border-black/20 text-center text-xs font-black md:hidden"><a href="#shop" className="border-r border-black/20 px-2 py-3">SHOP</a><Link href="/booking" className="border-r border-black/20 px-2 py-3">NULO CLEAN</Link><a href="#about" className="px-2 py-3">ABOUT</a></nav></header>

    <section id="top" className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[.9fr_1.1fr] md:px-10 md:py-16">
      <div><p className="mb-6 inline-flex rounded-full border-2 border-black bg-[#f05a19] px-4 py-2 text-xs font-black tracking-[.18em] text-white">GOOD STUFF, GOOD LIFE.</p><h1 className="text-[clamp(4.6rem,11vw,9rem)] font-black leading-[.75] tracking-[-.085em]">GOOD<br/>STUFF</h1><div className="mt-6 inline-block -rotate-1 bg-[#f05a19] px-5 py-2 text-3xl font-black md:text-4xl">咕司大福</div><p className="mt-8 max-w-lg text-lg font-semibold leading-8">好東西，都在這。鞋、服飾、生活選物，看到喜歡的就帶走。</p><div className="mt-9"><a href="#shop" className="inline-block rounded-full bg-black px-7 py-4 font-black text-white">開始逛逛</a></div></div>
      <div className="overflow-hidden rounded-[2rem] border-2 border-black bg-[#fffaf1] shadow-[12px_12px_0_#171512]"><Image src="/good-stuff-hero-v2.png" alt="GOOD STUFF 咕司大福品牌角色大福雞" width={643} height={364} className="h-auto w-full" preload/></div>
    </section>

    <section id="shop" className="scroll-mt-28 border-y-2 border-black bg-[#e7dccb] px-5 py-20 text-[#171512] md:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-sm font-black tracking-[.3em] text-[#f05a19]">SHOP GOOD STUFF</p><h2 className="mt-3 text-5xl font-black tracking-[-.05em] md:text-7xl">最近有什麼好東西？</h2></div><div className="flex flex-wrap gap-2" aria-label="商品分類">{categories.map((category)=><button key={category} type="button" onClick={()=>setActiveCategory(category)} aria-pressed={activeCategory===category} className={`rounded-full border-2 border-black px-5 py-2 text-sm font-black transition ${activeCategory===category ? "bg-[#f05a19] text-white shadow-[3px_3px_0_#171512]" : "bg-[#fffaf1] hover:bg-white"}`}>{category}</button>)}</div></div>
      {visibleProducts.length ? <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => { const stock = product.category === "服飾" ? product.product_variants?.reduce((sum, item) => sum + item.stock, 0) || 0 : product.stock || 0; return <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-[1.5rem] border-2 border-black bg-[#fffaf1] shadow-[6px_6px_0_#171512] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#f05a19]"><div className="relative aspect-square overflow-hidden bg-white">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center text-black/40">GOOD STUFF</div>}</div><div className="border-t-2 border-black p-6"><div className="flex justify-between gap-4"><div><p className="text-xs font-bold tracking-[.2em] text-[#f05a19]">{product.category || "其他"}</p><h3 className="mt-2 text-xl font-black">{product.name}</h3></div><p className="font-black">NT$ {product.price}</p></div><p className="mt-5 text-sm text-black/50">{stock > 0 ? `庫存 ${stock} · 看商品 →` : "目前售罄"}</p></div></Link>; })}</div> : <div className="mt-12 rounded-3xl border-2 border-dashed border-black/30 bg-[#fffaf1]/50 p-12 text-center text-black/60">這個分類目前還沒有商品。</div>}
    </div></section>

    <section id="about" className="px-5 py-20 md:px-10"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2"><div><p className="text-sm font-black tracking-[.28em] text-[#f05a19]">ABOUT GOOD STUFF</p><h2 className="mt-3 text-5xl font-black tracking-[-.05em]">我們只放<br/>覺得不錯的東西。</h2></div><div className="text-lg leading-8"><p>GOOD STUFF｜咕司大福，不把自己限制成鞋店或服飾店。今天有鞋、有衣服，也可能有意想不到的生活小物。</p><div className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-black pt-6 text-sm"><div><span className="block text-black/45">出貨／服務地區</span><strong>{shopInfo.address}</strong></div><div><span className="block text-black/45">聯絡時間</span><strong>{shopInfo.hours}</strong></div></div></div></div></section>

    <footer className="bg-[#171512] px-5 py-10 text-[#f4efe6] md:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row"><div><strong className="text-3xl font-black tracking-[-.06em]">GOOD STUFF</strong><p className="mt-2 text-sm text-white/50">咕司大福 · 好東西，都在這。</p></div><div className="flex gap-5 text-sm font-bold"><a href={shopInfo.instagram}>Instagram</a><a href={shopInfo.line}>LINE</a>{shopInfo.phone && <a href={`tel:${shopInfo.phone.replace(/-/g,"")}`}>電話</a>}</div></div></footer>
  </main>;
}
