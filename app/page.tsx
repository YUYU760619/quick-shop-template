"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import CartIndicator from "./components/cart-indicator";

type Product = { id: string; name: string; category?: string; snack_type?: string; image?: string; stock?: number; price: number; product_variants?: { stock: number }[] };
const fallback = { address: "台北｜可私訊詢問收送方式", hours: "預約制", phone: "", instagram: "https://instagram.com/", line: "https://line.me/" };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState(fallback);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const load = async () => {
      const [productResult, settingResult] = await Promise.all([
        supabase.from("products").select("*, product_variants(stock)").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*").limit(1).single(),
      ]);
      if (productResult.error) console.error("讀取商品失敗：", productResult.error); else setProducts(productResult.data || []);
      if (!settingResult.error && settingResult.data) setShopInfo({ address: settingResult.data.address || fallback.address, hours: settingResult.data.business_hours || fallback.hours, phone: settingResult.data.phone || fallback.phone, instagram: settingResult.data.instagram || fallback.instagram, line: settingResult.data.line_url || fallback.line });
    };
    load();
  }, []);

  const categories = ["全部", "鞋類", "服飾", "韓國零食", "其他"];
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => sortBy === "price-low" ? a.price - b.price : sortBy === "price-high" ? b.price - a.price : 0);
  const categoryProducts = (category: string) => {
    const snackType = category === "零食" ? "餅乾" : category;
    if (["餅乾", "泡麵", "飲料"].includes(snackType)) return filteredProducts.filter((product) => product.category === "韓國零食" && (product.snack_type === snackType || (snackType === "餅乾" && !product.snack_type)));
    return filteredProducts.filter((product) => (product.category || "其他") === category);
  };
  const visibleProducts = activeCategory === "全部" ? filteredProducts : categoryProducts(activeCategory);
  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    window.requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }));
  };
  const renderProductCard = (product: Product) => {
    const stock = product.category === "服飾" ? product.product_variants?.reduce((sum, item) => sum + item.stock, 0) || 0 : product.stock || 0;
    return <Link key={product.id} href={`/products/${product.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border-2 border-black bg-[#fffaf1] shadow-[5px_5px_0_#171512] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#f05a19]">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" className="object-contain p-3 transition duration-500 group-hover:scale-105" unoptimized/> : <div className="grid h-full place-items-center text-black/40">GOOD STUFF</div>}</div>
      <div className="flex flex-1 flex-col border-t-2 border-black p-5"><p className="text-[11px] font-bold tracking-[.2em] text-[#f05a19]">{product.category || "其他"}</p><h3 className="mt-2 line-clamp-2 text-lg font-black leading-snug">{product.name}</h3><div className="mt-auto flex items-end justify-between gap-3 pt-5"><p className="text-sm text-black/50">{stock > 0 ? `庫存 ${stock}` : "目前售罄"}</p><p className="whitespace-nowrap font-black">NT$ {product.price.toLocaleString()}</p></div></div>
    </Link>;
  };

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#f4efe6]/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
      <a href="#top"><strong className="block text-2xl font-black leading-none tracking-[-0.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[0.28em] text-[#f05a19]">咕司大福</span></a>
      <nav className="ml-auto hidden items-center gap-5 text-sm font-bold md:flex">
        <div className="group relative"><button type="button" onClick={()=>chooseCategory("全部")} className="py-2">SHOP <span className="ml-1 text-[10px]">▼</span></button><div className="invisible absolute left-1/2 top-full z-50 w-44 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><div className="overflow-hidden rounded-2xl border-2 border-black bg-[#fffaf1] p-2 shadow-[5px_5px_0_#171512]">{categories.map((category)=><button key={category} type="button" onClick={()=>chooseCategory(category)} className={`block w-full rounded-xl px-4 py-3 text-left transition hover:bg-[#f05a19] hover:text-white ${activeCategory===category ? "bg-black text-white" : ""}`}>{category === "全部" ? "全部商品" : category}<span className="float-right opacity-45">{category === "全部" ? products.length : categoryProducts(category).length}</span></button>)}</div></div></div>
        <div className="group relative"><Link href="/korean-snacks" className="block rounded-full bg-[#f05a19] px-4 py-2 text-xs font-black text-white">K-SNACK <span className="ml-1 text-[9px]">▼</span></Link><div className="invisible absolute left-1/2 top-full z-50 w-40 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><div className="rounded-2xl border-2 border-black bg-[#fffaf1] p-2 shadow-[5px_5px_0_#171512]"><Link href="/korean-snacks" className="block rounded-xl bg-black px-4 py-3 text-white hover:bg-[#f05a19]">全部零食 <span className="float-right opacity-60">{categoryProducts("韓國零食").length}</span></Link><Link href="/korean-snacks?type=餅乾" className="block rounded-xl px-4 py-3 hover:bg-[#f05a19] hover:text-white">餅乾 <span className="float-right opacity-45">{categoryProducts("零食").length}</span></Link><Link href="/korean-snacks?type=泡麵" className="block rounded-xl px-4 py-3 hover:bg-[#f05a19] hover:text-white">泡麵 <span className="float-right opacity-45">{categoryProducts("泡麵").length}</span></Link><Link href="/korean-snacks?type=飲料" className="block rounded-xl px-4 py-3 hover:bg-[#f05a19] hover:text-white">飲料 <span className="float-right opacity-45">{categoryProducts("飲料").length}</span></Link></div></div></div>
        <Link href="/booking" className="py-2">SNEAKER CLEANING</Link><a href="#about" className="py-2">ABOUT</a>
      </nav>
      <div className="ml-8 shrink-0"><CartIndicator /></div>
    </div><nav className="grid grid-cols-4 border-t border-black/20 text-center text-[10px] font-black sm:text-xs md:hidden"><a href="#shop" className="border-r border-black/20 px-2 py-3">SHOP</a><Link href="/korean-snacks" className="border-r border-black/20 px-2 py-3">K-SNACK</Link><Link href="/booking" className="border-r border-black/20 px-2 py-3">CLEANING</Link><a href="#about" className="px-2 py-3">ABOUT</a></nav></header>

    <section id="top" className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[.9fr_1.1fr] md:px-10 md:py-16">
      <div><p className="mb-6 inline-flex rounded-full border-2 border-black bg-[#f05a19] px-4 py-2 text-xs font-black tracking-[.18em] text-white">GOOD STUFF, GOOD LIFE.</p><h1 className="text-[clamp(4.6rem,11vw,9rem)] font-black leading-[.75] tracking-[-.085em]">GOOD<br/>STUFF</h1><div className="mt-6 inline-block -rotate-1 bg-[#f05a19] px-5 py-2 text-3xl font-black md:text-4xl">咕司大福</div><p className="mt-8 max-w-lg text-lg font-semibold leading-8">好東西，都在這。鞋、服飾、生活選物，看到喜歡的就帶走。</p><div className="mt-9"><a href="#shop" className="inline-block rounded-full bg-black px-7 py-4 font-black text-white">開始逛逛</a></div></div>
      <div className="overflow-hidden rounded-[2rem] border-2 border-black bg-[#fffaf1] shadow-[12px_12px_0_#171512]"><Image src="/good-stuff-hero-v2.png" alt="GOOD STUFF 咕司大福品牌角色大福雞" width={643} height={364} className="h-auto w-full" preload/></div>
    </section>

    <section id="shop" className="scroll-mt-28 border-y-2 border-black bg-[#e7dccb] px-5 py-20 text-[#171512] md:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-sm font-black tracking-[.3em] text-[#f05a19]">SHOP GOOD STUFF</p><h2 className="mt-3 text-5xl font-black tracking-[-.05em] md:text-7xl">挑你想逛的。</h2></div></div>
      <div className="mt-10 grid gap-3 md:grid-cols-[1fr_auto]"><label className="relative"><span className="sr-only">搜尋商品</span><input type="search" value={searchTerm} onChange={(event)=>setSearchTerm(event.target.value)} placeholder="搜尋商品名稱…" className="w-full rounded-full border-2 border-black bg-[#fffaf1] px-6 py-4 pr-12 font-bold outline-none focus:shadow-[4px_4px_0_#171512]"/>{searchTerm&&<button type="button" onClick={()=>setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-xl" aria-label="清除搜尋">×</button>}</label><select value={sortBy} onChange={(event)=>setSortBy(event.target.value)} className="rounded-full border-2 border-black bg-[#fffaf1] px-6 py-4 font-black outline-none"><option value="newest">最新上架</option><option value="price-low">價格低到高</option><option value="price-high">價格高到低</option></select></div>
      <div className="sticky top-[94px] z-40 -mx-5 mt-5 border-y-2 border-black bg-[#e7dccb]/95 px-5 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0"><div className="flex gap-2 overflow-x-auto pb-1" aria-label="商品分類">{categories.map((category)=>{const count=category === "全部" ? filteredProducts.length : categoryProducts(category).length;return <button key={category} type="button" onClick={()=>setActiveCategory(category)} aria-pressed={activeCategory===category} className={`shrink-0 rounded-full border-2 border-black px-5 py-2 text-sm font-black transition ${activeCategory===category ? "bg-[#f05a19] text-white shadow-[3px_3px_0_#171512]" : "bg-[#fffaf1] hover:bg-white"}`}>{category} <span className="ml-1 opacity-60">{count}</span></button>})}</div></div>
      {activeCategory === "全部" ? <div className="mt-14 space-y-20">{["韓國零食", "鞋類", "服飾", "其他"].map((category)=>{const items=categoryProducts(category);if(!items.length)return null;if(category === "韓國零食") return <section key={category} className="-mx-3 rounded-[2rem] border-2 border-black bg-[#ffd84d] p-6 shadow-[9px_9px_0_#171512] md:p-9"><div className="mb-7 flex flex-col justify-between gap-5 border-b-2 border-black pb-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black tracking-[.25em] text-[#e43d30]">GOOD STUFF / K-SNACK</p><h3 className="mt-2 text-4xl font-black md:text-5xl">韓國零食精選</h3><p className="mt-3 font-bold text-black/55">追劇、嘴饞、熬夜都需要。</p></div><Link href="/korean-snacks" className="shrink-0 rounded-full border-2 border-black bg-[#e43d30] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_#171512]">逛全部韓國零食 →</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.slice(0,4).map(renderProductCard)}</div></section>;return <section key={category}><div className="mb-7 flex items-end justify-between border-b-2 border-black pb-4"><div><p className="text-xs font-black tracking-[.25em] text-[#f05a19]">GOOD STUFF / {category}</p><h3 className="mt-1 text-4xl font-black">{category}</h3></div>{items.length>4&&<button type="button" onClick={()=>setActiveCategory(category)} className="rounded-full border-2 border-black bg-[#fffaf1] px-5 py-2 text-sm font-black hover:bg-white">查看全部 {items.length} 件 →</button>}</div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.slice(0,4).map(renderProductCard)}</div></section>})}</div> : visibleProducts.length ? <div className="mt-12"><div className="mb-7 flex items-end justify-between border-b-2 border-black pb-4"><h3 className="text-4xl font-black">{activeCategory}</h3><span className="font-bold text-black/50">共 {visibleProducts.length} 件</span></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map(renderProductCard)}</div></div> : <div className="mt-12 rounded-3xl border-2 border-dashed border-black/30 bg-[#fffaf1]/50 p-12 text-center text-black/60">這個分類目前還沒有商品。</div>}
    </div></section>

    <section id="about" className="px-5 py-20 md:px-10"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border-2 border-black bg-[#fffaf1] shadow-[10px_10px_0_#171512]"><div className="grid md:grid-cols-[.85fr_1.15fr]"><div className="flex min-h-64 flex-col justify-between bg-[#f05a19] p-8 text-white md:min-h-80 md:p-12"><p className="text-xs font-black tracking-[.3em] text-white/75">ABOUT GOOD STUFF</p><h2 className="mt-12 text-[clamp(3.2rem,6vw,5.8rem)] font-black leading-[.88] tracking-[-.07em]"><span className="block">只有</span><span className="mt-3 block">好物</span></h2></div><div className="flex flex-col justify-between p-8 md:p-12"><p className="text-[clamp(1.5rem,3vw,2.7rem)] font-black leading-tight tracking-[-.04em]">此處不賣雞，只賣好東西。</p><p className="mt-5 max-w-xl text-base font-semibold leading-7 text-black/55">鞋、服飾與日常選物，喜歡的才挑，值得的才留下。</p><div className="mt-12 grid gap-6 border-t-2 border-black pt-6 text-sm sm:grid-cols-2"><div><span className="block text-black/45">出貨／服務地區</span><strong className="mt-1 block">{shopInfo.address}</strong></div><div><span className="block text-black/45">聯絡時間</span><strong className="mt-1 block">{shopInfo.hours}</strong></div></div></div></div></div></section>

    <footer className="bg-[#171512] px-5 py-10 text-[#f4efe6] md:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row"><div><strong className="text-3xl font-black tracking-[-.06em]">GOOD STUFF</strong><p className="mt-2 text-sm text-white/50">咕司大福 · 好東西，都在這。</p></div><div className="flex gap-5 text-sm font-bold"><a href={shopInfo.instagram}>Instagram</a><a href={shopInfo.line}>LINE</a>{shopInfo.phone && <a href={`tel:${shopInfo.phone.replace(/-/g,"")}`}>電話</a>}</div></div></footer>
  </main>;
}
