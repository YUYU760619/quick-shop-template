"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type OrderItem = { id:number; product_name:string; color?:string; size?:string; quantity:number; unit_price:number };
type Order = { id:string; order_number:string; customer_name:string; phone:string; email:string; delivery_method:string; delivery_address:string; note:string; subtotal:number; status:string; created_at:string; updated_at?:string; order_items:OrderItem[] };
const statuses = ["待確認", "待付款", "已付款", "已出貨", "完成", "取消"];
const retentionDays = 0;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [tab, setTab] = useState<"active" | "cancelled">("active");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending:false });
      if (error) console.error(error);
      else {
        const nextOrders = data || [];
        setOrders(nextOrders);
        setDraftStatuses(Object.fromEntries(nextOrders.map((order) => [order.id, order.status])));
      }
      setLoading(false);
    };
    load();
  }, []);

  const activeCount = orders.filter((order) => order.status !== "取消").length;
  const cancelledCount = orders.filter((order) => order.status === "取消").length;
  const visibleOrders = useMemo(() => orders.filter((order) => tab === "cancelled" ? order.status === "取消" : order.status !== "取消"), [orders, tab]);

  const updateStatus = async (order: Order) => {
    const nextStatus = draftStatuses[order.id] || order.status;
    if (nextStatus === order.status) return alert("訂單狀態沒有變更。");
    if (nextStatus === "取消" && !window.confirm(`確定要取消訂單 ${order.order_number} 嗎？\n取消後會移到「已取消訂單」。`)) return;
    setSaving(order.id);
    const { error } = await supabase.from("orders").update({ status:nextStatus, updated_at:new Date().toISOString() }).eq("id", order.id);
    setSaving("");
    if (error) return alert(`更新失敗：${error.message}`);
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status:nextStatus } : item));
    alert(nextStatus === "取消" ? "訂單已取消，並移至已取消訂單。" : `訂單狀態已更新為「${nextStatus}」。`);
  };

  const deletionInfo = (order: Order) => {
    const cancelledAt = new Date(order.updated_at || order.created_at).getTime();
    const elapsedDays = Math.floor((Date.now() - cancelledAt) / 86400000);
    return { eligible: elapsedDays >= retentionDays, remaining: Math.max(0, retentionDays - elapsedDays) };
  };

  const permanentlyDelete = async (order: Order) => {
    const info = deletionInfo(order);
    if (order.status !== "取消" || !info.eligible) return alert(`取消訂單需保留滿 ${retentionDays} 天，目前還要 ${info.remaining} 天。`);
    const typed = window.prompt(`這會永久刪除訂單與所有明細，無法復原。\n請輸入訂單編號確認：\n${order.order_number}`);
    if (typed !== order.order_number) return typed === null ? undefined : alert("訂單編號不正確，已取消刪除。");
    setSaving(order.id);
    const { error } = await supabase.from("orders").delete().eq("id", order.id).eq("status", "取消");
    setSaving("");
    if (error) return alert(`刪除失敗：${error.message}`);
    setOrders((current) => current.filter((item) => item.id !== order.id));
    setDraftStatuses((current) => { const next = { ...current }; delete next[order.id]; return next; });
    alert("取消訂單已永久刪除。");
  };

  return <main className="px-6 py-12"><div className="mx-auto max-w-6xl">
    <p className="text-sm tracking-[.25em] text-orange-500">ORDERS</p>
    <h1 className="mt-3 text-4xl font-bold">訂單管理</h1>
    <div className="mt-8 flex flex-wrap gap-3">
      <button type="button" onClick={() => setTab("active")} className={`rounded-full border px-5 py-3 text-sm font-bold ${tab === "active" ? "border-orange-500 bg-orange-500 text-black" : "border-white/15 text-zinc-300"}`}>進行中訂單 {activeCount}</button>
      <button type="button" onClick={() => setTab("cancelled")} className={`rounded-full border px-5 py-3 text-sm font-bold ${tab === "cancelled" ? "border-red-500 bg-red-500 text-white" : "border-white/15 text-zinc-300"}`}>已取消訂單 {cancelledCount}</button>
    </div>
    {loading ? <p className="mt-10 text-zinc-500">讀取訂單中…</p> : !visibleOrders.length ? <div className="mt-10 rounded-3xl border border-white/10 bg-[#1a1a1a] p-10 text-center text-zinc-500">{tab === "cancelled" ? "目前沒有已取消訂單" : "目前沒有進行中訂單"}</div> : <div className="mt-10 space-y-6">{visibleOrders.map((order) => <article key={order.id} className={`rounded-3xl border p-6 ${order.status === "取消" ? "border-red-500/20 bg-red-950/10" : "border-white/10 bg-[#1a1a1a]"}`}>
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div><p className="text-sm text-orange-400">{order.order_number}</p><h2 className="mt-2 text-2xl font-bold">{order.customer_name}</h2><p className="mt-2 text-sm text-zinc-500">{new Date(order.created_at).toLocaleString("zh-TW")}</p></div>
        <div className="min-w-44"><label className="text-xs text-zinc-500">訂單狀態</label><select value={draftStatuses[order.id] || order.status} disabled={saving === order.id} onChange={(event) => setDraftStatuses((current) => ({ ...current, [order.id]:event.target.value }))} className="mt-2 block w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3">{statuses.map((status) => <option key={status}>{status}</option>)}</select><button type="button" onClick={() => updateStatus(order)} disabled={saving === order.id || (draftStatuses[order.id] || order.status) === order.status} className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-30">{saving === order.id ? "更新中…" : "確認更新"}</button></div>
      </div>
      <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-2"><div className="space-y-2 text-sm text-zinc-300"><p>{order.phone}</p><p>{order.email}</p><p>{order.delivery_method}</p><p>{order.delivery_address}</p>{order.note && <p className="text-zinc-500">備註：{order.note}</p>}</div><div className="space-y-3">{order.order_items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.product_name} {[item.color,item.size].filter(Boolean).join(" / ")} × {item.quantity}</span><strong>NT$ {(item.unit_price*item.quantity).toLocaleString()}</strong></div>)}<div className="flex justify-between border-t border-white/10 pt-3 text-lg"><span>商品小計</span><strong className="text-orange-400">NT$ {order.subtotal.toLocaleString()}</strong></div>{order.status === "取消" && (() => { const info = deletionInfo(order); return <div className="mt-5 border-t border-red-500/20 pt-5 text-right"><p className="mb-2 text-xs text-zinc-500">輸入完整訂單編號後才能永久刪除</p><button type="button" onClick={() => permanentlyDelete(order)} disabled={!info.eligible || saving === order.id} className="rounded-xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-400 disabled:cursor-not-allowed disabled:opacity-30">永久刪除訂單</button></div>; })()}</div></div>
    </article>)}</div>}
  </div></main>;
}
