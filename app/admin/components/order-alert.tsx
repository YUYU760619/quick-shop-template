"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type LatestOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  subtotal: number;
};

export default function OrderAlert() {
  const [count, setCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [toast, setToast] = useState<LatestOrder | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const now = audio.currentTime;
    [659, 784, 988].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.18);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + index * 0.12 + 0.2);
    });
  };

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported");
    setAlertsEnabled(window.localStorage.getItem("good-stuff-order-alerts") === "on");
    const check = async () => {
      const { data, count: nextCount, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, subtotal", { count: "exact" })
        .eq("status", "待確認")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) return console.error("讀取待確認訂單失敗：", error);
      const latest = data?.[0] as LatestOrder | undefined;
      setCount(nextCount || 0);
      if (initializedRef.current && latest && latestIdRef.current && latest.id !== latestIdRef.current) {
        if (window.localStorage.getItem("good-stuff-order-alerts") === "on") {
          setToast(latest);
          playChime();
          window.setTimeout(() => setToast(null), 12000);
        }
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("GOOD STUFF 有新訂單", {
            body: `${latest.customer_name}｜${latest.order_number}｜NT$ ${Number(latest.subtotal).toLocaleString()}`,
            icon: "/daifu-frames/frame-4.png",
          });
        }
      }
      latestIdRef.current = latest?.id || null;
      initializedRef.current = true;
    };
    check();
    const timer = window.setInterval(check, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const enableNotifications = async () => {
    const AudioContextClass = window.AudioContext;
    if (!audioRef.current) audioRef.current = new AudioContextClass();
    await audioRef.current.resume();
    window.localStorage.setItem("good-stuff-order-alerts", "on");
    setAlertsEnabled(true);
    playChime();
    setToast({ id: "test", order_number: "提醒測試成功", customer_name: "本雞已上線", subtotal: 0 });
    window.setTimeout(() => setToast(null), 5000);

    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") new Notification("GOOD STUFF 通知已開啟", { body: "有新訂單時，本雞會通知你。", icon: "/daifu-frames/frame-4.png" });
    }
  };

  return <div className="flex items-center gap-2">
    {toast && <button type="button" onClick={() => setToast(null)} className="fixed right-5 top-20 z-[100] w-[min(360px,calc(100vw-40px))] rounded-2xl border-2 border-black bg-orange-500 p-4 text-left text-black shadow-[7px_7px_0_#000]">
      <span className="block text-xs font-black tracking-[0.2em]">NEW ORDER</span>
      <strong className="mt-1 block text-xl">{toast.customer_name}</strong>
      <span className="mt-1 block text-sm font-bold">{toast.order_number}{toast.subtotal > 0 ? `｜NT$ ${Number(toast.subtotal).toLocaleString()}` : ""}</span>
      <span className="mt-2 block text-xs font-bold">點我關閉，或直接前往訂單管理。</span>
    </button>}
    <Link href="/admin/orders" className="relative rounded-lg px-2 py-2 text-sm text-zinc-400 hover:text-white">
      訂單
      {count > 0 && <span className="absolute -right-2 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] font-black text-black">{count > 99 ? "99+" : count}</span>}
    </Link>
    <button type="button" onClick={enableNotifications} title={alertsEnabled ? "新訂單提醒已開啟（點擊可測試）" : "開啟新訂單提醒"} className={`rounded-lg border px-2 py-1.5 text-sm ${alertsEnabled ? "border-emerald-500/40 text-emerald-400" : "border-white/15 text-zinc-400"}`}>
      {alertsEnabled ? "🔔" : "🔕"}
    </button>
  </div>;
}
