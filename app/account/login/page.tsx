"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MemberLoginPage() {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [loading,setLoading]=useState(false);
  const resetPassword=async()=>{ if(!email.trim()) return alert("請先輸入會員 Email。"); setLoading(true); const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/account/reset-password`}); setLoading(false); alert(error?`寄送失敗：${error.message}`:"密碼重設信已寄出，請到 Email 信箱查看。"); };
  const submit=async()=>{ if(!email||password.length<6|| (mode==="signup"&&!name.trim())) return alert("請完整填寫資料，密碼至少 6 個字元。"); setLoading(true);
    if(mode==="signup"){ const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name.trim()}}}); setLoading(false); if(error)return alert(`註冊失敗：${error.message}`); if(!data.session)return alert("註冊完成！請先到 Email 信箱完成驗證，再回來登入。"); }
    else {const {error}=await supabase.auth.signInWithPassword({email,password}); setLoading(false); if(error)return alert("登入失敗，請確認 Email、密碼或是否已完成信箱驗證。");}
    window.location.href="/account";
  };
  return <main className="grid min-h-screen place-items-center bg-[#f4efe6] px-5 text-[#171512]"><div className="w-full max-w-md rounded-[2rem] border-2 border-black bg-[#fffaf1] p-7 shadow-[10px_10px_0_#f05a19]"><p className="text-sm font-black tracking-[.25em] text-[#f05a19]">GOOD STUFF MEMBER</p><h1 className="mt-3 text-4xl font-black">{mode==="login"?"會員登入":"加入會員"}</h1><div className="mt-7 grid gap-4">{mode==="signup"&&<label className="grid gap-2 text-sm font-black">姓名<input value={name} onChange={e=>setName(e.target.value)} className="rounded-xl border-2 border-black px-4 py-3" /></label>}<label className="grid gap-2 text-sm font-black">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="rounded-xl border-2 border-black px-4 py-3" /></label><label className="grid gap-2 text-sm font-black">密碼<input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="rounded-xl border-2 border-black px-4 py-3" placeholder="至少 6 個字元" /></label>{mode==="login"&&<button type="button" onClick={resetPassword} disabled={loading} className="justify-self-end text-sm font-black text-black/55 underline underline-offset-4">忘記密碼？</button>}<button onClick={submit} disabled={loading} className="rounded-full bg-black px-5 py-4 font-black text-white disabled:opacity-40">{loading?"處理中…":mode==="login"?"登入":"建立會員"}</button><button onClick={()=>setMode(mode==="login"?"signup":"login")} className="rounded-full border-2 border-black px-5 py-3 font-black">{mode==="login"?"還沒有會員？立即註冊":"已有會員？回到登入"}</button></div><Link href="/" className="mt-6 inline-block text-sm font-black text-black/50">← 返回商店</Link></div></main>;
}
