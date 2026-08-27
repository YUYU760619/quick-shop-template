"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../components/cart-context";
import { supabase } from "../lib/supabase";

export default function CheckoutPage() {
  const { items, total, ready, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", delivery: "宅配", address: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const isStorePickup = form.delivery !== "宅配";

  useEffect(() => {
    const loadMember = async () => {
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("member_profiles").select("full_name,phone,email,default_delivery,default_address").eq("id", session.user.id).single();
      if (data) setForm((current) => ({ ...current, name:data.full_name || current.name, phone:data.phone || current.phone, email:data.email || session.user.email || current.email, delivery:data.default_delivery || current.delivery, address:data.default_address || current.address }));
    };
    loadMember();
  }, []);

  const validate = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim()) { alert("請完整填寫姓名、手機、Email 與收件資料。"); return false; }
    if (!/^09\d{8}$/.test(form.phone)) { alert("請輸入正確手機號碼。"); return false; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { alert("請輸入正確 Email。"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (submitting || !items.length) return;
    if (!validate()) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("place_order", {
      p_customer: form,
      p_items: items.map((item) => ({ product_id: item.productId, variant_id: item.variantId || "", color: item.color || "", size: item.size || "", quantity: item.quantity })),
    });
    setSubmitting(false);
    if (error) { console.error(error); const message = error.message.includes("庫存") || error.message.includes("訂購資料") || error.message.includes("配送") ? error.message : "訂單暫時無法建立，請稍後再試或改用 LINE 詢問。"; alert(`訂單建立失敗：${message}`); return; }
    setOrderNumber(data.order_number);
    clearCart();
  };

  const send = async () => {
    if (!validate()) return;
    const details = items.map((item, i) => `${i + 1}. ${item.name}\n規格：${[item.color, item.size].filter(Boolean).join(" / ") || "無"}\n數量：${item.quantity}\n小計：NT$ ${(item.price * item.quantity).toLocaleString()}`).join("\n\n");
    const message = `GOOD STUFF 訂購資料\n\n${details}\n\n商品小計：NT$ ${total.toLocaleString()}\n配送方式：${form.delivery}\n姓名：${form.name}\n手機：${form.phone}\nEmail：${form.email}\n收件地址：${form.address}\n備註：${form.note || "無"}\n\n請協助確認庫存、運費與付款方式。`;
    await navigator.clipboard.writeText(message);
    alert("訂購資料已複製！到 LINE 後直接貼上即可。");
    window.open("https://lin.ee/Xjq4kmL", "_blank", "noopener,noreferrer");
  };

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] text-[#171512]"><p className="font-black">讀取購物車中…</p></main>;

  if (orderNumber) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] px-5 text-[#171512]"><div className="max-w-xl rounded-[2rem] border-2 border-black bg-[#fffaf1] p-10 text-center shadow-[10px_10px_0_#f05a19]"><p className="text-sm font-black tracking-[.25em] text-[#f05a19]">ORDER RECEIVED</p><h1 className="mt-4 text-5xl font-black">訂單已成立</h1><p className="mt-6 text-black/60">訂單編號</p><strong className="mt-2 block text-2xl">{orderNumber}</strong><p className="mt-6 leading-7">我們會透過你留下的聯絡資料確認庫存、運費與付款方式。</p><Link href="/" className="mt-8 inline-block rounded-full bg-black px-7 py-4 font-black text-white">返回首頁</Link></div></main>;
  if (!items.length) return <main className="grid min-h-screen place-items-center bg-[#f4efe6]"><div className="text-center"><p className="text-4xl font-black">購物車是空的</p><Link href="/#shop" className="mt-6 inline-block rounded-full bg-black px-7 py-4 font-black text-white">先去找好東西 →</Link></div></main>;

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="border-b-2 border-black"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"><Link href="/"><strong className="block text-2xl font-black">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.28em] text-[#f05a19]">咕司大福</span></Link><Link href="/cart" className="rounded-full border-2 border-black px-5 py-3 text-sm font-black">← 回購物車</Link></div></header>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20"><p className="text-sm font-black tracking-[.28em] text-[#f05a19]">CHECKOUT PREVIEW</p><h1 className="mt-3 text-5xl font-black md:text-7xl">填寫訂購資料</h1><p className="mt-4 font-semibold text-black/55">送出後會建立正式訂單，由店家確認庫存、運費與付款方式；也可改用 LINE 詢問。</p>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]"><form className="grid gap-5 rounded-[2rem] border-2 border-black bg-[#fffaf1] p-6 shadow-[8px_8px_0_#171512] md:grid-cols-2 md:p-8">
        {[["姓名", "name", "text", "收件人姓名"], ["手機", "phone", "tel", "0912345678"], ["Email", "email", "email", "訂單聯絡信箱"]].map(([label, key, type, placeholder]) => <label key={key} className={`grid gap-2 text-sm font-black ${key === "email" ? "md:col-span-2" : ""}`}>{label}<input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="rounded-xl border-2 border-black bg-white px-4 py-3 font-medium" placeholder={placeholder} /></label>)}
        <label className="grid gap-2 text-sm font-black md:col-span-2">配送方式<select value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} className="rounded-xl border-2 border-black bg-white px-4 py-3 font-medium"><option>宅配</option><option>7-ELEVEN 店到店</option><option>全家店到店</option></select></label>
        <label className="grid gap-2 text-sm font-black md:col-span-2">{isStorePickup ? "取件門市" : "收件地址"}<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl border-2 border-black bg-white px-4 py-3 font-medium" placeholder={isStorePickup ? "請填寫完整門市名稱與店號" : "請填寫完整宅配地址"} /></label>
        <label className="grid gap-2 text-sm font-black md:col-span-2">備註<textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={4} className="rounded-xl border-2 border-black bg-white px-4 py-3 font-medium" /></label>
      </form><aside className="h-fit rounded-[2rem] border-2 border-black bg-[#e7dccb] p-6 shadow-[8px_8px_0_#f05a19]"><h2 className="text-2xl font-black">確認商品</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item.key} className="grid grid-cols-[64px_1fr] gap-3 border-b border-black/20 pb-4"><div className="relative aspect-square rounded-xl border border-black bg-white">{item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" unoptimized />}</div><div><strong className="line-clamp-2 text-sm">{item.name}</strong><p className="mt-1 text-xs text-black/50">{[item.color, item.size].filter(Boolean).join(" / ")} · {item.quantity} 件</p><p className="mt-1 text-sm font-black">NT$ {(item.price * item.quantity).toLocaleString()}</p></div></div>)}</div><div className="mt-6 flex items-end justify-between"><span className="font-bold">商品小計</span><strong className="text-3xl text-[#f05a19]">NT$ {total.toLocaleString()}</strong></div><button type="button" onClick={placeOrder} disabled={submitting} className="mt-6 w-full rounded-full bg-black px-6 py-4 font-black text-white disabled:opacity-40">{submitting ? "建立訂單中…" : "送出正式訂單 →"}</button><button type="button" onClick={send} className="mt-3 w-full rounded-full border-2 border-black px-6 py-3 font-black">改用 LINE 詢問</button><p className="mt-3 text-center text-xs text-black/45">正式訂單建立後仍由店家確認庫存與付款方式。</p></aside></div>
    </section>
  </main>;
}
