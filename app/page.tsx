"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
const shop = {
  name: "NULO CLEAN",
  slogan: "讓你喜歡的鞋，重新乾淨一次。",
  description:
    "球鞋清潔與保養服務。日常髒污、深層清潔、麂皮鞋款，依照不同材質使用適合的方式處理。",

  address: "台北｜可私訊詢問收送方式",
  hours: "預約制",
  phone: "",

  instagram: "https://instagram.com/",
  line: "https://line.me/",

  image: "/nulo-clean.png.png",

  menu: [
    ["基礎清潔", "Basic Cleaning", "NT$380"],
    ["深層清潔", "Deep Cleaning", "NT$500"],
    ["麂皮清潔", "Suede Cleaning", "NT$800"],
    ["鞋底清潔", "Sole Cleaning", "NT$300"],
    ["局部處理", "Spot Treatment", "私訊報價"],
    ["特殊鞋款", "Special Shoes", "私訊報價"],
  ],
};

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [serviceImage, setServiceImage] = useState("/nulo-clean-service.png.png");
  const [shopInfo, setShopInfo] = useState({
  shop_name: shop.name,
  address: shop.address,
  business_hours: shop.hours,
  phone: shop.phone,
  instagram: shop.instagram,
  line_url: shop.line,
  slogan: shop.slogan,
  description: shop.description,
  service_title: "",
service_description: "",
});
 const [booking, setBooking] = useState({
    name: "",
    phone: "",
    shoes: "",
    service: "",
    note: "",
  });
 useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("讀取商品失敗：", error);
      return;
    }

    setProducts(data || []);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("讀取服務失敗：", error);
      return;
    }

    setServices(data || []);
  };

  const fetchHeroImage = () => {
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl("hero-image");

    setHeroImage(`${data.publicUrl}?t=${Date.now()}`);
  };

  const fetchServiceImage = () => {
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl("service-image");

    setServiceImage(`${data.publicUrl}?t=${Date.now()}`);
  };

  const fetchShopInfo = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("讀取店家資訊失敗：", error);
      return;
    }

    if (data) {
      setShopInfo({
        shop_name: data.shop_name || shop.name,
        address: data.address || shop.address,
        business_hours: data.business_hours || shop.hours,
        phone: data.phone || shop.phone,
        instagram: data.instagram || shop.instagram,
        line_url: data.line_url || shop.line,
        slogan: data.slogan || shop.slogan,
        description: data.description || shop.description,
        service_title: data.service_title || "",
        service_description: data.service_description || "",
      });
    }
  };

  fetchProducts();
  fetchServices();
  fetchHeroImage();
  fetchServiceImage();
  fetchShopInfo();
}, []);
   const handleBooking = async () => {
  if (
    !booking.name ||
    !booking.phone ||
    !booking.shoes ||
    !booking.service
  ) {
    alert("請填寫姓名、電話、鞋款與清潔項目。");
    return;
  }

  const phoneRegex = /^09\d{8}$/;

  if (!phoneRegex.test(booking.phone)) {
    alert("請輸入正確的手機號碼，例如 0912345678。");
    return;
  }

  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        name: booking.name,
        phone: booking.phone,
        shoes: booking.shoes,
        service: booking.service,
        note: booking.note,
      },
    ]);

  if (error) {
    console.error("預約送出失敗：", error);
    alert("預約送出失敗，請稍後再試。");
    return;
  }

  alert("預約送出成功！我們收到資料後會再與你聯絡。");

  setBooking({
    name: "",
    phone: "",
    shoes: "",
    service: "",
    note: "",
  });
};

 


  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* 導覽列 */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <h1 className="text-xl font-bold tracking-widest">
         {shopInfo.shop_name}
        </h1>

        <a
  href="#booking"
  className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
>
  立即預約
</a>
      </header>

      {/* 首頁主視覺 */}
      <section className="grid min-h-[80vh] items-center gap-10 px-6 py-10 md:grid-cols-2 md:px-12">
        
        {/* 左邊文字 */}
        <div>
          <p className="mb-4 text-sm tracking-[0.3em] text-zinc-400">
            TAIPEI · SNEAKER · CARE
          </p>

          <h2 className="text-4xl font-bold leading-tight md:text-6xl">
  {shopInfo.slogan}
</h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
  {shopInfo.description}
</p>

          <div className="mt-8 flex gap-3">
            <a
              href="#menu"
              className="rounded-full bg-white px-6 py-3 font-medium text-black"
            >
              查看服務
            </a>

            <a
              href="#contact"
              className="rounded-full border border-white/30 px-6 py-3 font-medium"
            >
              店家資訊
            </a>
          </div>
        </div>

        {/* 右邊照片 */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl md:h-[600px]">
          <Image
            src={heroImage}
            alt="MOKU COFFEE 咖啡店"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

      </section>
       {/* 清潔服務形象 */}
<section className="border-t border-white/10 px-6 py-20 md:px-12">
  <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
      <Image
        src={serviceImage}
        alt="NULO CLEAN 球鞋清潔服務"
        fill
        className="object-cover"
      />
    </div>

    <div>
      <p className="text-sm tracking-[0.3em] text-zinc-500">
        PROFESSIONAL SHOE CARE
      </p>

      <h2 className="mt-4 text-4xl font-bold md:text-5xl">
  {shopInfo.service_title}
</h2>

      <p className="mt-6 leading-8 text-zinc-400">
  {shopInfo.service_description}
</p>

      <a
        href="#menu"
        className="mt-8 inline-block rounded-full border border-white/30 px-6 py-3 text-sm transition hover:bg-white hover:text-black"
      >
        查看清潔項目
      </a>
    </div>

  </div>
</section>
       {/* 招牌菜單 */}
      <section
        id="menu"
        className="border-t border-white/10 px-6 py-20 md:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm tracking-[0.3em] text-zinc-500">
            OUR SERVICES
          </p>

          <h3 className="mt-3 text-3xl font-bold md:text-5xl">
            清潔服務
          </h3>

          <p className="mt-4 max-w-xl leading-7 text-zinc-400">
            依照鞋款材質與髒污程度，提供適合的清潔與保養方式。
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
              {services.map((service) => (
  <div
    key={service.id}
    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5"
  >
    <div>
      <p className="text-lg font-medium">
        {service.name}
      </p>

      <p className="mt-1 text-sm text-zinc-500">
        {service.name_en}
      </p>
    </div>

    <p className="font-medium">
      {service.price}
    </p>
  </div>
))}
          </div>
        </div>
      </section>
      {/* 商品區 */}
<section className="border-t border-white/10 px-6 py-20 md:px-12">
  <div className="mx-auto max-w-6xl">
    <p className="text-sm tracking-[0.3em] text-zinc-500">
      PRODUCTS
    </p>

    <h2 className="mt-3 text-3xl font-bold md:text-5xl">
      商品
    </h2>

    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <a
          key={product.id}
          href={`/products/${product.id}`}
          className="block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/30"
        >
          {product.image && (
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <h3 className="text-xl font-bold">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {product.category || "鞋類"}
            </p>

            {product.category === "服飾" ? (
              <p className="mt-2 text-zinc-400">
                多規格商品｜庫存：{product.product_variants?.reduce((total: number, variant: { stock: number }) => total + variant.stock, 0) || 0}
              </p>
            ) : (
              <>
                <p className="mt-2 text-zinc-400">
                  尺寸：{product.size || "未填寫"}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  庫存：{product.stock}
                </p>
              </>
            )}

            <p className="mt-4 text-lg font-bold">
              NT$ {product.price}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
</section>
         {/* 店家資訊 */}
      <section
        id="contact"
        className="border-t border-white/10 px-6 py-20 md:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm tracking-[0.3em] text-zinc-500">
              VISIT US
            </p>

            <h3 className="mt-3 text-3xl font-bold md:text-5xl">
              店家資訊
            </h3>

            <div className="mt-8 space-y-5 text-zinc-300">
              <div>
                <p className="text-sm text-zinc-500">地址</p>
                <p className="mt-1">
                  {shopInfo.address}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">營業時間</p>
                <p className="mt-1">
                  {shopInfo.business_hours}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">電話</p>
                <p className="mt-1">
                  {shopInfo.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h4 className="text-2xl font-bold">
              歡迎來坐坐
            </h4>

            <p className="mt-4 leading-7 text-zinc-400">
              最新消息、限定甜點與營業異動，
              歡迎透過 Instagram 或 LINE 與我們聯絡。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={shopInfo.instagram}
                className="rounded-full bg-white px-6 py-3 font-medium text-black"
              >
                Instagram
              </a>

              <a
               href={shopInfo.line_url}
                className="rounded-full border border-white/30 px-6 py-3 font-medium"
              >
                LINE 聯絡
              </a>

              <a
                href={`tel:${shopInfo.phone.replace(/-/g, "")}`}
                className="rounded-full border border-white/30 px-6 py-3 font-medium"
              >
                撥打電話
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* 預約清潔 */}
<section
  id="booking"
  className="border-t border-white/10 px-6 py-20 md:px-12"
>
  <div className="mx-auto max-w-3xl">
    <p className="text-sm tracking-[0.3em] text-zinc-500">
      BOOKING
    </p>

    <h2 className="mt-3 text-3xl font-bold md:text-5xl">
      預約清潔
    </h2>

    <p className="mt-4 leading-7 text-zinc-400">
      填寫基本資料與鞋款狀況，我們會再與你確認清潔方式與報價。
    </p>

    <form className="mt-10 grid gap-5">
      <input
  type="text"
  placeholder="姓名"
  value={booking.name}
  onChange={(e) =>
    setBooking({ ...booking, name: e.target.value })
  }
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 outline-none placeholder:text-zinc-600"
/>

        <input
  type="tel"
  placeholder="電話"
  value={booking.phone}
  onChange={(e) =>
    setBooking({ ...booking, phone: e.target.value })
  }
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 outline-none placeholder:text-zinc-600"
/>

      <input
  type="text"
  placeholder="鞋款，例如 Air Jordan 1"
  value={booking.shoes}
  onChange={(e) =>
    setBooking({ ...booking, shoes: e.target.value })
  }
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 outline-none placeholder:text-zinc-600"
/>

      <select
  value={booking.service}
  onChange={(e) =>
    setBooking({ ...booking, service: e.target.value })
  }
  className="rounded-2xl border border-white/10 bg-[#171717] px-5 py-4 outline-none"
>
  <option value="" disabled>
    選擇清潔項目
  </option>

  {services.map((service) => (
    <option key={service.id} value={service.name}>
      {service.name}
    </option>
  ))}
</select>

      <textarea
  placeholder="備註，例如：鞋面有油漬、泛黃、麂皮掉色..."
  rows={5}
  value={booking.note}
  onChange={(e) =>
    setBooking({ ...booking, note: e.target.value })
  }
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 outline-none placeholder:text-zinc-600"
/>

      <button
        type="button"
        onClick={handleBooking}
        className="mt-2 rounded-full bg-white px-6 py-4 font-medium text-black transition hover:bg-zinc-200"
      >
        送出預約
      </button>
    </form>
  </div>
</section>
    </main>
  );
  }