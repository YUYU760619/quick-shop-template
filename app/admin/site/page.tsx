"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SiteSettingsPage() {
  // 首頁主圖
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // 店家資訊
  const [shopInfo, setShopInfo] = useState({
  shop_name: "",
  address: "",
  business_hours: "",
  phone: "",
  instagram: "",
  line_url: "",
  slogan: "",
  description: "",
  service_title: "",
  service_description: "",
});

  const [savingInfo, setSavingInfo] = useState(false);

  // 服務形象圖
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [serviceUploading, setServiceUploading] = useState(false);
  const [currentServiceImage, setCurrentServiceImage] = useState("");

  // 讀取店家資訊
  useEffect(() => {
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
  shop_name: data.shop_name || "",
  address: data.address || "",
  business_hours: data.business_hours || "",
  phone: data.phone || "",
  instagram: data.instagram || "",
  line_url: data.line_url || "",
  slogan: data.slogan || "",
  description: data.description || "",
  service_title: data.service_title || "",
  service_description: data.service_description || "",
});
      }
    };

    fetchShopInfo();
  }, []);

  // 儲存店家資訊
  const handleSaveShopInfo = async () => {
    setSavingInfo(true);

    const { data: existing, error: fetchError } = await supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .single();

    if (fetchError) {
      console.error(fetchError);
      alert("讀取店家資訊失敗");
      setSavingInfo(false);
      return;
    }

    const { error } = await supabase
      .from("site_settings")
      .update(shopInfo)
      .eq("id", existing.id);

    if (error) {
      console.error(error);
      alert("店家資訊儲存失敗");
      setSavingInfo(false);
      return;
    }

    alert("店家資訊已儲存");
    setSavingInfo(false);
  };

  // 讀取目前兩張圖片
  useEffect(() => {
    const { data: heroData } = supabase.storage
      .from("product-images")
      .getPublicUrl("hero-image");

    setCurrentImage(`${heroData.publicUrl}?t=${Date.now()}`);

    const { data: serviceData } = supabase.storage
      .from("product-images")
      .getPublicUrl("service-image");

    setCurrentServiceImage(
      `${serviceData.publicUrl}?t=${Date.now()}`
    );
  }, []);

  // 上傳首頁主圖
  const handleUpload = async () => {
    if (!file) {
      alert("請先選擇首頁圖片");
      return;
    }

    setUploading(true);

    const filePath = "hero-image";

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      alert("首頁圖片上傳失敗");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    setCurrentImage(`${data.publicUrl}?t=${Date.now()}`);

    alert("首頁圖片更換成功");
    setFile(null);
    setUploading(false);
  };

  // 上傳服務形象圖
  const handleServiceUpload = async () => {
    if (!serviceFile) {
      alert("請先選擇服務形象圖片");
      return;
    }

    setServiceUploading(true);

    const filePath = "service-image";

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, serviceFile, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      alert("服務形象圖片上傳失敗");
      setServiceUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    setCurrentServiceImage(
      `${data.publicUrl}?t=${Date.now()}`
    );

    alert("服務形象圖片更換成功");
    setServiceFile(null);
    setServiceUploading(false);
  };

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm tracking-[0.3em] text-zinc-500">
          SITE SETTINGS
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          網站設定
        </h1>

        <p className="mt-3 text-zinc-400">
          管理網站上的主要圖片。
        </p>

{/* 店家資訊 */}
<div className="mt-10 rounded-3xl border border-white/10 bg-[#1a1a1a] p-8">
  <h2 className="text-2xl font-bold">
    店家資訊
  </h2>

  <p className="mt-2 text-zinc-400">
    修改網站顯示的基本店家資料。
  </p>

  <div className="mt-6 space-y-5">
    <div>
  <label className="mb-2 block text-sm text-zinc-400">
    首頁標語
  </label>

  <input
    type="text"
    value={shopInfo.slogan}
    onChange={(e) =>
      setShopInfo({
        ...shopInfo,
        slogan: e.target.value,
      })
    }
    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
  />
</div>

<div>
  <label className="mb-2 block text-sm text-zinc-400">
    首頁介紹文字
  </label>
  <div>
  <label className="mb-2 block text-sm text-zinc-400">
    服務區塊標題
  </label>

  <input
    type="text"
    value={shopInfo.service_title}
    onChange={(e) =>
      setShopInfo({
        ...shopInfo,
        service_title: e.target.value,
      })
    }
    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
  />
</div>

<div>
  <label className="mb-2 block text-sm text-zinc-400">
    服務區塊介紹
  </label>

  <textarea
    value={shopInfo.service_description}
    onChange={(e) =>
      setShopInfo({
        ...shopInfo,
        service_description: e.target.value,
      })
    }
    rows={4}
    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
  />
</div>

  <textarea
    value={shopInfo.description}
    onChange={(e) =>
      setShopInfo({
        ...shopInfo,
        description: e.target.value,
      })
    }
    rows={4}
    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
  />
</div>
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        店名
      </label>
      <input
        type="text"
        value={shopInfo.shop_name}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            shop_name: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        地址／收送方式
      </label>
      <input
        type="text"
        value={shopInfo.address}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            address: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        營業時間
      </label>
      <input
        type="text"
        value={shopInfo.business_hours}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            business_hours: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        電話
      </label>
      <input
        type="text"
        value={shopInfo.phone}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            phone: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        Instagram
      </label>
      <input
        type="text"
        value={shopInfo.instagram}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            instagram: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        LINE 連結
      </label>
      <input
        type="text"
        value={shopInfo.line_url}
        onChange={(e) =>
          setShopInfo({
            ...shopInfo,
            line_url: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 outline-none focus:border-white/30"
      />
    </div>
  </div>

  <button
    type="button"
    onClick={handleSaveShopInfo}
    disabled={savingInfo}
    className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-50"
  >
    {savingInfo ? "儲存中..." : "儲存店家資訊"}
  </button>
</div>

        {/* 首頁主圖 */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-[#1a1a1a] p-8">
          <h2 className="text-2xl font-bold">
            首頁主圖
          </h2>

          <p className="mt-2 text-zinc-400">
            更換首頁右側的主視覺圖片。
          </p>

          {currentImage && (
            <div className="mt-6">
              <p className="mb-3 text-sm text-zinc-400">
                目前圖片
              </p>

              <img
                src={currentImage}
                alt="目前首頁圖片"
                className="w-full rounded-2xl border border-white/10"
              />
            </div>
          )}

          <label className="mt-6 inline-block cursor-pointer rounded-xl border border-white/20 px-5 py-3 text-sm hover:border-white/40">
            選擇圖片

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
              className="hidden"
            />
          </label>

          <p className="mt-3 text-sm text-zinc-400">
            {file
              ? `已選擇：${file.name}`
              : "尚未選擇圖片"}
          </p>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-50"
          >
            {uploading
              ? "上傳中..."
              : "更換首頁圖片"}
          </button>
        </div>

        {/* 服務形象圖 */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#1a1a1a] p-8">
          <h2 className="text-2xl font-bold">
            服務形象圖
          </h2>

          <p className="mt-2 text-zinc-400">
            更換「不只是洗乾淨」區塊的圖片。
          </p>

          {currentServiceImage && (
            <div className="mt-6">
              <p className="mb-3 text-sm text-zinc-400">
                目前圖片
              </p>

              <img
                src={currentServiceImage}
                alt="目前服務形象圖片"
                className="w-full rounded-2xl border border-white/10"
              />
            </div>
          )}

          <label className="mt-6 inline-block cursor-pointer rounded-xl border border-white/20 px-5 py-3 text-sm hover:border-white/40">
            選擇圖片

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) =>
                setServiceFile(
                  e.target.files?.[0] ?? null
                )
              }
              className="hidden"
            />
          </label>

          <p className="mt-3 text-sm text-zinc-400">
            {serviceFile
              ? `已選擇：${serviceFile.name}`
              : "尚未選擇圖片"}
          </p>

          <button
            type="button"
            onClick={handleServiceUpload}
            disabled={serviceUploading}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-50"
          >
            {serviceUploading
              ? "上傳中..."
              : "更換服務形象圖"}
          </button>
        </div>

        <a
          href="/admin"
          className="mt-8 inline-block text-sm text-zinc-500 hover:text-white"
        >
          ← 返回後台
        </a>
      </div>
    </main>
  );
}