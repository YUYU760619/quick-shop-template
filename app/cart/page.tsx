"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../components/cart-context";

export default function CartPage() {
  const { items, total, ready, updateQuantity, removeItem } = useCart();
  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] text-[#171512]"><p className="font-black">讀取購物車中…</p></main>;
  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="border-b-2 border-black"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"><Link href="/"><strong className="block text-2xl font-black leading-none tracking-[-.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.28em] text-[#f05a19]">咕司大福</span></Link><Link href="/#shop" className="rounded-full border-2 border-black px-5 py-3 text-sm font-black">繼續逛逛</Link></div></header>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
      <p className="text-sm font-black tracking-[.28em] text-[#f05a19]">YOUR GOOD STUFF</p>
      <h1 className="mt-3 text-5xl font-black tracking-[-.05em] md:text-7xl">購物車</h1>
      {!items.length ? <div className="mt-12 rounded-[2rem] border-2 border-dashed border-black/30 bg-[#fffaf1] p-12 text-center"><p className="text-2xl font-black">購物車還是空的</p><Link href="/#shop" className="mt-6 inline-block rounded-full bg-black px-7 py-4 font-black text-white">去找好東西 →</Link></div> : <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">{items.map((item) => <article key={item.key} className="grid grid-cols-[96px_1fr] gap-5 rounded-3xl border-2 border-black bg-[#fffaf1] p-4 shadow-[5px_5px_0_#171512] sm:grid-cols-[132px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-black bg-white">{item.image && <Image src={item.image} alt={item.name} fill sizes="132px" className="object-contain p-2" unoptimized/>}</div>
          <div className="flex min-w-0 flex-col justify-between"><div><p className="text-xs font-black tracking-[.15em] text-[#f05a19]">{item.category}</p><h2 className="mt-1 font-black sm:text-xl">{item.name}</h2><p className="mt-2 text-sm text-black/50">{[item.color,item.size].filter(Boolean).join(" / ") || "無規格"}</p></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center rounded-full border-2 border-black bg-white"><button onClick={() => updateQuantity(item.key,item.quantity-1)} className="px-4 py-2 font-black">−</button><span className="min-w-8 text-center font-black">{item.quantity}</span><button onClick={() => updateQuantity(item.key,item.quantity+1)} disabled={item.quantity>=item.maxStock} className="px-4 py-2 font-black disabled:opacity-25">＋</button></div><div><strong>NT$ {(item.price*item.quantity).toLocaleString()}</strong><button onClick={() => removeItem(item.key)} className="ml-4 text-sm font-bold text-black/40 underline">移除</button></div></div></div>
        </article>)}</div>
        <aside className="h-fit rounded-[2rem] border-2 border-black bg-[#f05a19] p-7 shadow-[8px_8px_0_#171512]"><p className="text-sm font-black tracking-[.18em]">ORDER SUMMARY</p><div className="mt-6 flex items-end justify-between border-b-2 border-black pb-6"><span className="font-bold">商品小計</span><strong className="text-3xl text-white">NT$ {total.toLocaleString()}</strong></div><p className="mt-5 text-sm font-semibold leading-6">送出訂單後會先保留商品庫存，運費與付款方式再由店家確認。</p><Link href="/checkout" className="mt-6 block rounded-full bg-black px-6 py-4 text-center font-black text-white">下一步：填寫資料 →</Link></aside>
      </div>}
    </section>
  </main>;
}
