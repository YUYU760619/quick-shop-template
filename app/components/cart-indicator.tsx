"use client";
import Link from "next/link";
import { useCart } from "./cart-context";
export default function CartIndicator(){const {count}=useCart();return <Link href="/cart" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">購物車 {count>0&&<span className="ml-1 inline-grid min-w-5 place-items-center rounded-full bg-[#f05a19] px-1">{count}</span>}</Link>}
