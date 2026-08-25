"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { key: string; productId: number; variantId?: number; name: string; price: number; image?: string; category: string; color?: string; size?: string; quantity: number; maxStock: number };
type CartValue = { items: CartItem[]; count: number; total: number; ready: boolean; addItem: (item: Omit<CartItem,"key"|"quantity">) => void; updateQuantity: (key:string, quantity:number)=>void; removeItem:(key:string)=>void; clearCart:()=>void };
const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(()=>{ try { const saved=localStorage.getItem("good-stuff-cart"); if(saved) setItems(JSON.parse(saved)); } finally { setReady(true); } },[]);
  useEffect(()=>{ if(ready) localStorage.setItem("good-stuff-cart",JSON.stringify(items)); },[items,ready]);
  const value=useMemo<CartValue>(()=>({items,count:items.reduce((sum,item)=>sum+item.quantity,0),total:items.reduce((sum,item)=>sum+item.price*item.quantity,0),ready,addItem:(next)=>setItems((current)=>{const key=[next.productId,next.color||"",next.size||""].join("-");const found=current.find((item)=>item.key===key);return found?current.map((item)=>item.key===key?{...item,quantity:Math.min(item.quantity+1,item.maxStock)}:item):[...current,{...next,key,quantity:1}]}),updateQuantity:(key,quantity)=>setItems((current)=>current.map((item)=>item.key===key?{...item,quantity:Math.max(1,Math.min(quantity,item.maxStock))}:item)),removeItem:(key)=>setItems((current)=>current.filter((item)=>item.key!==key)),clearCart:()=>setItems([])}),[items,ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart must be used inside CartProvider");return value;}
