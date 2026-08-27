"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import CartIndicator from "../../components/cart-indicator";
import { useCart } from "../../components/cart-context";

type Variant = { id: number; color: string; size: string; stock: number };
type GalleryImage = { id: number; image_url: string; sort_order: number };
type Product = { id: number; name: string; price: number; category?: string; size?: string; stock: number; image?: string; description?: string; product_variants?: Variant[]; product_images?: GalleryImage[] };

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      let { data, error } = await supabase.from("products").select("*, product_variants(id, color, size, stock), product_images(id, image_url, sort_order)").eq("id", id).eq("is_active", true).order("sort_order", { referencedTable: "product_images", ascending: true }).single();
      if (error) {
        const fallback = await supabase.from("products").select("*, product_variants(id, color, size, stock)").eq("id", id).eq("is_active", true).single();
        data = fallback.data ? { ...fallback.data, product_images: [] } : null;
        error = fallback.error;
      }
      if (error || !data) { console.error(error); setLoading(false); return; }
      setProduct(data);
      if ((data.category === "服飾" || data.category === "鞋類") && data.product_variants?.length) {
        const firstAvailable = data.product_variants.find((variant: Variant) => variant.stock > 0) || data.product_variants[0];
        setSelectedColor(firstAvailable.color);
        setSelectedSize(firstAvailable.size);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] text-[#171512]"><p className="font-black tracking-[.18em]">GOOD STUFF LOADING…</p></main>;
  if (!product) return <main className="grid min-h-screen place-items-center bg-[#f4efe6] text-[#171512]"><div className="text-center"><p className="text-3xl font-black">找不到這個商品</p><Link href="/#shop" className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-black text-white">回到商城</Link></div></main>;

  const variants = product.product_variants || [];
  const colors = [...new Set(variants.map((variant) => variant.color))];
  const colorVariants = variants.filter((variant) => variant.color === selectedColor);
  const selectedVariant = colorVariants.find((variant) => variant.size === selectedSize);
  const usesVariants = (product.category === "服飾" || product.category === "鞋類") && variants.length > 0;
  const availableStock = usesVariants ? selectedVariant?.stock || 0 : product.stock || 0;
  const galleryImages = [product.image, ...(product.product_images || []).map((item) => item.image_url)].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

  const selectColor = (color: string) => {
    const nextVariants = variants.filter((variant) => variant.color === color);
    const next = nextVariants.find((variant) => variant.stock > 0) || nextVariants[0];
    setSelectedColor(color);
    setSelectedSize(next?.size || "");
  };

  const askOnLine = async () => {
    const message = `我想詢問這個商品\n商品：${product.name}\n價格：NT$ ${product.price}\n類別：${product.category || "其他"}\n顏色：${usesVariants ? selectedColor : "不適用"}\n尺寸：${usesVariants ? selectedSize : product.size || "未填寫"}\n庫存：${availableStock}`;
    await navigator.clipboard.writeText(message);
    alert("商品資料已複製！到 LINE 後直接貼上即可。");
    window.open("https://lin.ee/Xjq4kmL", "_blank", "noopener,noreferrer");
  };

  return <main className="min-h-screen bg-[#f4efe6] text-[#171512]">
    <header className="border-b-2 border-black"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"><Link href="/"><strong className="block text-2xl font-black leading-none tracking-[-.06em]">GOOD STUFF</strong><span className="text-xs font-bold tracking-[.28em] text-[#f05a19]">咕司大福</span></Link><div className="flex gap-2"><Link href="/#shop" className="hidden rounded-full border-2 border-black px-5 py-3 text-sm font-black sm:block">← 回商城</Link><CartIndicator/></div></div></header>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-10 md:grid-cols-[1.08fr_.92fr] md:px-10 md:py-16">
      <div className="space-y-7">
        {galleryImages.length ? galleryImages.map((imageUrl, index) => (
          <div key={imageUrl} className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-black bg-white shadow-[12px_12px_0_#171512]">
            <Image src={imageUrl} alt={`${product.name} 商品圖片 ${index + 1}`} fill sizes="(max-width:768px) 100vw,55vw" className="object-contain p-4" unoptimized />
            <span className="absolute bottom-4 right-4 rounded-full border-2 border-black bg-[#fffaf1] px-3 py-1 text-xs font-black">{index + 1} / {galleryImages.length}</span>
          </div>
        )) : <div className="grid aspect-square place-items-center rounded-[2rem] border-2 border-black bg-white text-xl font-black text-black/30 shadow-[12px_12px_0_#171512]">GOOD STUFF</div>}
      </div>
      <div className="md:py-4"><div className="flex items-center justify-between gap-4"><p className="inline-block rounded-full bg-[#f05a19] px-4 py-2 text-xs font-black tracking-[.18em] text-white">{product.category || "其他"}</p><span className={`text-sm font-black ${availableStock > 0 ? "text-black/50" : "text-[#f05a19]"}`}>{availableStock > 0 ? `現貨 ${availableStock}` : "目前售罄"}</span></div><h1 className="mt-6 text-4xl font-black leading-tight tracking-[-.045em] md:text-6xl">{product.name}</h1><p className="mt-6 text-4xl font-black text-[#f05a19]">NT$ {product.price.toLocaleString()}</p>

        {usesVariants ? <div className="mt-10 space-y-8">
          <div><p className="mb-3 text-sm font-black tracking-[.15em]">選擇顏色</p><div className="flex flex-wrap gap-3">{colors.map((color)=>{const colorStock=variants.filter((variant)=>variant.color===color).reduce((sum,variant)=>sum+variant.stock,0);return <button key={color} type="button" onClick={()=>selectColor(color)} className={`rounded-full border-2 border-black px-5 py-3 font-black transition ${selectedColor===color ? "bg-black text-white shadow-[4px_4px_0_#f05a19]" : "bg-[#fffaf1]"}`}>{color}{colorStock===0 && " · 售罄"}</button>})}</div></div>
          <div><p className="mb-3 text-sm font-black tracking-[.15em]">選擇尺寸</p><div className="flex flex-wrap gap-3">{colorVariants.map((variant)=><button key={variant.id} type="button" disabled={variant.stock===0} onClick={()=>setSelectedSize(variant.size)} className={`min-w-16 rounded-xl border-2 border-black px-5 py-3 font-black transition disabled:cursor-not-allowed disabled:border-black/20 disabled:text-black/25 ${selectedSize===variant.size ? "bg-[#f05a19] text-white shadow-[4px_4px_0_#171512]" : "bg-[#fffaf1]"}`}>{variant.size}</button>)}</div></div>
        </div> : <div className="mt-10 grid grid-cols-2 gap-4"><div className="rounded-2xl border-2 border-black bg-[#fffaf1] p-5"><span className="text-sm text-black/45">{product.category === "韓國零食" ? "規格／容量" : "尺寸"}</span><strong className="mt-1 block text-xl">{product.size || "不適用"}</strong></div><div className="rounded-2xl border-2 border-black bg-[#fffaf1] p-5"><span className="text-sm text-black/45">庫存</span><strong className="mt-1 block text-xl">{product.stock || 0}</strong></div></div>}

        <button type="button" onClick={()=>{addItem({productId:product.id,variantId:usesVariants?selectedVariant?.id:undefined,name:product.name,price:product.price,image:product.image,category:product.category||"其他",color:usesVariants?selectedColor:undefined,size:usesVariants?selectedSize:product.size,maxStock:availableStock});setAdded(true);setTimeout(()=>setAdded(false),1800)}} disabled={availableStock===0} className="mt-10 w-full rounded-full bg-black px-7 py-5 text-lg font-black text-white transition hover:bg-[#f05a19] disabled:cursor-not-allowed disabled:bg-black/25">{availableStock>0?(added?"已加入購物車 ✓":"加入購物車 →"):"商品目前售罄"}</button><button type="button" onClick={askOnLine} disabled={availableStock===0} className="mt-3 w-full rounded-full border-2 border-black px-7 py-4 font-black transition hover:bg-[#fffaf1] disabled:opacity-30">先用 LINE 詢問</button><p className="mt-3 text-center text-xs text-black/45">購物車目前只保存在這台裝置，不會送出訂單或扣除庫存。</p>

        {product.description && <div className="mt-10 border-t-2 border-black pt-8"><p className="text-sm font-black tracking-[.15em] text-[#f05a19]">PRODUCT DETAILS</p><p className="mt-4 whitespace-pre-line leading-8 text-black/65">{product.description}</p></div>}
      </div>
    </section>
  </main>;
}
