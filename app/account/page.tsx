"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = { full_name:string; phone:string; email:string; default_delivery:string; default_address:string };
type OrderItem = { id:number; product_name:string; color?:string; size?:string; quantity:number; unit_price:number };
type Order = { id:string; order_number:string; subtotal:number; status:string; created_at:string; delivery_method:string; delivery_address:string; order_items:OrderItem[] };

const blank: Profile = { full_name:"", phone:"", email:"", default_delivery:"宅配", default_address:"" };

export default function AccountPage() {
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<Profile>(blank);
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) { window.location.replace("/account/login"); return; }
      const [{ data:member }, { data:orderRows }] = await Promise.all([
        supabase.from("member_profiles").select("full_name,phone,email,default_delivery,default_address").eq("id", session.user.id).single(),
        supabase.from("orders").select("id,order_number,subtotal,status,created_at,delivery_method,delivery_address,order_items(id,product_name,color,size,quantity,unit_price)").eq("member_id", session.user.id).order("created_at", { ascending:false }),
      ]);
      setProfile(member || { ...blank, email:session.user.email || "" });
      setOrders((orderRows as Order[]) || []);
      setChecking(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) return window.location.replace("/account/login");
    const { error } = await supabase.from("member_profiles").update({ full_name:profile.full_name.trim(), phone:profile.phone.trim(), default_delivery:profile.default_delivery, default_address:profile.default_address.trim(), updated_at:new Date().toISOString() }).eq("id", session.user.id);
    setSaving(false);
    alert(error ? `儲存失敗：${error.message}` : "會員資料已儲存。");
  };

  const logout = async () => { await supabase.auth.signOut(); window.location.replace("/"); };
  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] font-black">讀取會員資料中…</main>;

  return <main className="min-h-screen bg-[#f4efe6] px-5 py-10 text-[#171512] md:px-10">
    <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-black tracking-[.25em] text-[#f05a19]">GOOD STUFF MEMBER</p><h1 className="mt-2 text-5xl font-black">我的會員資料</h1></div><div className="flex gap-3"><Link href="/" className="rounded-full border-2 border-black px-5 py-3 font-black">返回商店</Link><button onClick={logout} className="rounded-full bg-black px-5 py-3 font-black text-white">登出</button></div></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]"><section className="h-fit rounded-[2rem] border-2 border-black bg-[#fffaf1] p-6 shadow-[8px_8px_0_#f05a19]"><h2 className="text-2xl font-black">基本資料</h2><div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-black">姓名<input value={profile.full_name} onChange={(e)=>setProfile({...profile,full_name:e.target.value})} className="rounded-xl border-2 border-black bg-white px-4 py-3" /></label>
        <label className="grid gap-2 text-sm font-black">手機<input value={profile.phone} onChange={(e)=>setProfile({...profile,phone:e.target.value})} className="rounded-xl border-2 border-black bg-white px-4 py-3" /></label>
        <label className="grid gap-2 text-sm font-black">Email<input value={profile.email} disabled className="rounded-xl border-2 border-black bg-black/5 px-4 py-3 text-black/50" /></label>
        <label className="grid gap-2 text-sm font-black">常用配送<select value={profile.default_delivery} onChange={(e)=>setProfile({...profile,default_delivery:e.target.value})} className="rounded-xl border-2 border-black bg-white px-4 py-3"><option>宅配</option><option>7-ELEVEN 店到店</option><option>全家店到店</option></select></label>
        <label className="grid gap-2 text-sm font-black">常用地址／門市<input value={profile.default_address} onChange={(e)=>setProfile({...profile,default_address:e.target.value})} className="rounded-xl border-2 border-black bg-white px-4 py-3" /></label>
        <button onClick={save} disabled={saving} className="rounded-full bg-black px-5 py-4 font-black text-white disabled:opacity-40">{saving?"儲存中…":"儲存會員資料"}</button>
      </div></section><section><h2 className="text-3xl font-black">我的訂單</h2>{!orders.length?<div className="mt-5 rounded-[2rem] border-2 border-dashed border-black/30 p-10 text-center"><p className="font-black">目前沒有會員訂單</p><p className="mt-2 text-sm text-black/50">登入後建立的新訂單會自動出現在這裡。</p></div>:<div className="mt-5 space-y-5">{orders.map((order)=><article key={order.id} className="rounded-[2rem] border-2 border-black bg-[#fffaf1] p-6 shadow-[6px_6px_0_#171512]"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm font-black text-[#f05a19]">{order.order_number}</p><p className="mt-1 text-sm text-black/50">{new Date(order.created_at).toLocaleString("zh-TW")}</p></div><strong className="rounded-full bg-black px-4 py-2 text-sm text-white">{order.status}</strong></div><div className="mt-5 space-y-2 border-t border-black/15 pt-4">{order.order_items.map((item)=><div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.product_name} {[item.color,item.size].filter(Boolean).join(" / ")} × {item.quantity}</span><strong>NT$ {(item.unit_price*item.quantity).toLocaleString()}</strong></div>)}</div><div className="mt-4 flex justify-between border-t border-black/15 pt-4"><span className="font-black">訂單金額</span><strong className="text-xl text-[#f05a19]">NT$ {Number(order.subtotal).toLocaleString()}</strong></div></article>)}</div>}</section></div>
    </div>
  </main>;
}

