"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage(){
  const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [saving,setSaving]=useState(false); const [done,setDone]=useState(false);
  const save=async()=>{if(password.length<6)return alert("新密碼至少需要 6 個字元。");if(password!==confirm)return alert("兩次輸入的密碼不一致。");setSaving(true);const {error}=await supabase.auth.updateUser({password});setSaving(false);if(error)return alert(`密碼更新失敗：${error.message}`);setDone(true);};
  return <main className="grid min-h-screen place-items-center bg-[#f4efe6] px-5 text-[#171512]"><div className="w-full max-w-md rounded-[2rem] border-2 border-black bg-[#fffaf1] p-7 shadow-[10px_10px_0_#f05a19]"><p className="text-sm font-black tracking-[.25em] text-[#f05a19]">GOOD STUFF MEMBER</p>{done?<><h1 className="mt-3 text-4xl font-black">密碼已更新</h1><p className="mt-5 font-bold text-black/55">現在可以使用新密碼登入會員。</p><Link href="/account/login" className="mt-7 block rounded-full bg-black px-5 py-4 text-center font-black text-white">回會員登入</Link></>:<><h1 className="mt-3 text-4xl font-black">設定新密碼</h1><div className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-black">新密碼<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded-xl border-2 border-black px-4 py-3" placeholder="至少 6 個字元" /></label><label className="grid gap-2 text-sm font-black">再次輸入<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} className="rounded-xl border-2 border-black px-4 py-3" /></label><button onClick={save} disabled={saving} className="rounded-full bg-black px-5 py-4 font-black text-white disabled:opacity-40">{saving?"更新中…":"更新密碼"}</button></div></>}</div></main>;
}
