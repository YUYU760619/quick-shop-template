"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Service = { id: string; name: string; name_en?: string; price: string };

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceImage, setServiceImage] = useState("/nulo-clean-service.png.png");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", shoes: "", service: "", note: "" });

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (error) console.error("讀取服務失敗：", error); else setServices(data || []);
    });
    const { data } = supabase.storage.from("product-images").getPublicUrl("service-image");
    if (data.publicUrl) setServiceImage(`${data.publicUrl}?t=${Date.now()}`);
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.shoes || !form.service) return alert("請填寫姓名、電話、鞋款與清潔項目。");
    if (!/^09\d{8}$/.test(form.phone)) return alert("請輸入正確的手機號碼，例如 0912345678。");
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert([form]);
    setSubmitting(false);
    if (error) { console.error(error); return alert("預約送出失敗，請稍後再試。"); }
    alert("預約送出成功！我們收到資料後會再與你聯絡。");
    setForm({ name: "", phone: "", shoes: "", service: "", note: "" });
  };

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="border-b-2 border-black"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"><Link href="/"><strong className="block text-2xl font-black leading-none tracking-[-.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.28em] text-[#f05a19]">咕司大福</span></Link><Link href="/" className="rounded-full border-2 border-black px-5 py-3 text-sm font-black">← 回商城</Link></div></header>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-2 md:items-center md:px-10 md:py-20"><div><p className="text-sm font-black tracking-[.28em] text-[#f05a19]">GOOD STUFF SERVICES / 01</p><h1 className="mt-4 text-6xl font-black tracking-[-.065em] md:text-8xl">NULO<br/>CLEAN</h1><p className="mt-5 text-2xl font-bold">把喜歡的鞋，重新整理好。</p><p className="mt-5 max-w-lg leading-8 text-black/60">依照鞋款材質與髒污程度，選擇合適的清潔方式。送出預約後，我們會再和你確認鞋況與報價。</p><a href="#booking-form" className="mt-8 inline-block rounded-full bg-[#f05a19] px-7 py-4 font-black text-white">我要預約 →</a></div><div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-2 border-black bg-white shadow-[12px_12px_0_#171512]"><Image src={serviceImage} alt="NULO CLEAN 球鞋清潔服務" fill sizes="(max-width:768px) 100vw,50vw" className="object-cover"/></div></section>

    <section className="border-y-2 border-black bg-[#171512] px-5 py-16 text-[#f4efe6] md:px-10"><div className="mx-auto max-w-7xl"><p className="text-sm font-black tracking-[.28em] text-[#f05a19]">CLEANING MENU</p><h2 className="mt-3 text-4xl font-black md:text-6xl">清潔服務</h2><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map((service)=><div key={service.id} className="flex justify-between rounded-2xl border border-white/20 bg-white/[.05] p-5"><div><strong className="text-lg">{service.name}</strong><p className="mt-1 text-sm text-white/40">{service.name_en}</p></div><strong className="text-[#f05a19]">{service.price}</strong></div>)}</div></div></section>

    <section id="booking-form" className="bg-[#f05a19] px-5 py-20 md:px-10"><div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-black tracking-[.28em]">BOOKING</p><h2 className="mt-4 text-5xl font-black tracking-[-.05em] text-white">預約清潔</h2><p className="mt-5 max-w-sm font-semibold leading-7">填寫基本資料與鞋款狀況，我們收到後會主動聯絡你。</p></div><form className="grid gap-4 rounded-[2rem] border-2 border-black bg-[#fffaf1] p-6 shadow-[10px_10px_0_#171512] md:p-8">{[["姓名","name","text"],["手機號碼","phone","tel"],["鞋款，例如 Air Jordan 1","shoes","text"]].map(([placeholder,key,type])=><input key={key} type={type} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e)=>setForm({...form,[key]:e.target.value})} className="rounded-xl border-2 border-black bg-white px-5 py-4 outline-none"/>)}<select value={form.service} onChange={(e)=>setForm({...form,service:e.target.value})} className="rounded-xl border-2 border-black bg-white px-5 py-4"><option value="">選擇清潔項目</option>{services.map((service)=><option key={service.id} value={service.name}>{service.name}</option>)}</select><textarea value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} rows={4} placeholder="鞋況或其他備註" className="rounded-xl border-2 border-black bg-white px-5 py-4 outline-none"/><button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-full bg-black px-6 py-4 font-black text-white disabled:opacity-50">{submitting ? "送出中…" : "送出預約"}</button></form></div></section>
  </main>;
}
