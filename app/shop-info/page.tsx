"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fallback = {
  address: "台北｜線上商店",
  hours: "預約制",
  phone: "",
  instagram: "https://instagram.com/",
  line: "https://line.me/",
};

export default function ShopInfoPage() {
  const [shop, setShop] = useState(fallback);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).single().then(({ data }) => {
      if (!data) return;
      setShop({
        address: data.address || fallback.address,
        hours: data.business_hours || fallback.hours,
        phone: data.phone || fallback.phone,
        instagram: data.instagram || fallback.instagram,
        line: data.line_url || fallback.line,
      });
    });
  }, []);

  const sections = [
    {
      id: "contact",
      tag: "CONTACT",
      title: "商店與聯絡方式",
      content: <><p>GOOD STUFF｜咕司大福為線上選物商店，販售鞋類、服飾、韓國零食與其他生活選物；NULO CLEAN 為預約制球鞋清潔服務。</p><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div><dt>服務地區</dt><dd>{shop.address}</dd></div><div><dt>聯絡時間</dt><dd>{shop.hours}</dd></div>{shop.phone&&<div><dt>聯絡電話</dt><dd><a href={`tel:${shop.phone.replace(/-/g,"")}`}>{shop.phone}</a></dd></div>}</dl><div className="mt-6 flex flex-wrap gap-3"><a href={shop.line} className="info-button">LINE 聯絡</a><a href={shop.instagram} className="info-button secondary">Instagram</a></div></>,
    },
    {
      id: "shipping",
      tag: "SHIPPING",
      title: "配送與訂單說明",
      content: <ul><li>目前提供宅配、7-ELEVEN 店到店及全家店到店；可用方式以結帳頁顯示為準。</li><li>訂單成立後，店家會確認商品庫存、收件資料、運費及付款方式；確認完成才進入正式出貨流程。</li><li>現貨原則上於款項與資料確認後 3 個工作日內寄出；例假日、預購、特殊商品或不可抗力情形除外。</li><li>實際運費會在付款前清楚告知。因收件資料錯誤、逾期未取或拒收產生的再次配送費用，將另行聯絡處理。</li><li>收到商品後請儘速開箱確認；如有短少、錯誤或運送損壞，請保留包裝並立即聯絡我們。</li></ul>,
    },
    {
      id: "returns",
      tag: "RETURNS",
      title: "退換貨與退款政策",
      content: <ul><li>一般通訊交易商品，消費者依法享有收受商品後 7 日內解除契約的權利；7 日為猶豫期而非試用期。</li><li>如需退貨，請先透過 LINE 或商店聯絡方式通知，並保留商品本體、附件、贈品及原包裝，以便確認與安排取回。</li><li>僅為檢查商品所必要的拆封不影響權利；超出必要檢查而造成商品價值減損時，將依法處理。</li><li>易於腐敗、保存期限較短或解約時即將逾期的食品，若商品頁已事先清楚告知，依法可能不適用 7 日解除權；瑕疵、寄錯或運送損壞仍請立即聯絡處理。</li><li>退款將於退貨及訂單狀況確認後，依原付款方式或雙方確認方式辦理。</li></ul>,
    },
    {
      id: "privacy",
      tag: "PRIVACY",
      title: "隱私權政策",
      content: <ul><li>為完成會員、訂單、配送、客服與售後服務，我們可能蒐集姓名、Email、手機、收件地址、配送方式及訂單紀錄。</li><li>資料僅用於提供服務、交易安全、法令遵循及必要的營運管理，不會任意出售或提供給無關第三方。</li><li>為完成服務，必要資料可能由網站系統、金流及物流服務商處理；各服務商依其隱私政策與法令負責資料安全。</li><li>我們會在提供服務或依法保存所需期間保留資料，期滿後刪除、停止使用或去識別化。</li><li>會員可登入查看及修改基本資料；如需查詢、更正或刪除其他個人資料，請透過商店聯絡方式提出。</li></ul>,
    },
    {
      id: "terms",
      tag: "TERMS",
      title: "會員與購物服務條款",
      content: <ul><li>請提供真實、完整且可聯絡的會員與訂購資料，並妥善保管帳號密碼。</li><li>商品資訊、價格及庫存以網站顯示為準；若遇價格或庫存異常，店家會先聯絡說明，不會未經確認逕行收取額外費用。</li><li>訂單送出代表提出購買要約；店家完成庫存與付款確認後，交易才進入履行程序。</li><li>禁止以網站從事詐欺、干擾系統、冒用他人資料或其他違法行為。</li><li>條款未盡事項依中華民國相關法令及雙方另行約定處理；依法不得限制的消費者權利不受本條款影響。</li></ul>,
    },
  ];

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="border-b-2 border-black px-5 py-5 md:px-10"><div className="mx-auto flex max-w-6xl items-center justify-between gap-5"><Link href="/"><strong className="block text-2xl font-black leading-none">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.25em] text-[#f05a19]">咕司大福</span></Link><Link href="/" className="rounded-full border-2 border-black px-5 py-3 text-sm font-black">返回商店</Link></div></header>
    <section className="px-5 py-14 md:px-10 md:py-20"><div className="mx-auto max-w-6xl"><p className="text-sm font-black tracking-[.28em] text-[#f05a19]">SHOPPING GUIDE</p><h1 className="mt-3 text-5xl font-black tracking-[-.06em] md:text-7xl">購物與服務說明</h1><p className="mt-5 max-w-2xl font-bold leading-7 text-black/55">下單前先看清楚，買得安心，雞也比較不會緊張。</p><nav className="mt-9 flex flex-wrap gap-2">{sections.map(section=><a key={section.id} href={`#${section.id}`} className="rounded-full border-2 border-black bg-[#fffaf1] px-4 py-2 text-sm font-black hover:bg-[#f05a19] hover:text-white">{section.title}</a>)}</nav><div className="mt-12 space-y-7">{sections.map((section,index)=><article id={section.id} key={section.id} className={`scroll-mt-8 rounded-[2rem] border-2 border-black p-7 shadow-[8px_8px_0_#171512] md:p-10 ${index===0?"bg-[#ffd84d]":"bg-[#fffaf1]"}`}><p className="text-xs font-black tracking-[.25em] text-[#f05a19]">{section.tag}</p><h2 className="mt-2 text-3xl font-black md:text-4xl">{section.title}</h2><div className="policy-content mt-6">{section.content}</div></article>)}</div><p className="mt-12 text-center text-sm font-bold text-black/45">最後更新：2026 年 8 月 27 日</p></div></section>
  </main>;
}
