import Image from "next/image";
const shop = {
  name: "MOKU COFFEE",
  slogan: "一杯咖啡，留一點時間給自己。",
  description:
    "位於台北巷弄裡的小咖啡店。提供手沖咖啡、甜點與一個可以慢下來的空間。",

  address: "台北市中山區咖啡街 88 號",
  hours: "週一至週日 10:00 - 20:00",
  phone: "02-1234-5678",

  instagram: "https://instagram.com/",
  line: "https://line.me/",

  image: "/coffee.png",
  menu: [
  ["美式咖啡", "Americano", "NT$100"],
  ["拿鐵", "Cafe Latte", "NT$130"],
  ["手沖咖啡", "Pour Over", "NT$150"],
  ["抹茶拿鐵", "Matcha Latte", "NT$140"],
  ["巴斯克乳酪蛋糕", "Basque Cheesecake", "NT$160"],
  ["提拉米蘇", "Tiramisu", "NT$170"],
],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* 導覽列 */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <h1 className="text-xl font-bold tracking-widest">
          {shop.name}
        </h1>

        <a
          href="#contact"
          className="rounded-full border border-white/30 px-5 py-2 text-sm"
        >
          聯絡我們
        </a>
      </header>

      {/* 首頁主視覺 */}
      <section className="grid min-h-[80vh] items-center gap-10 px-6 py-10 md:grid-cols-2 md:px-12">
        
        {/* 左邊文字 */}
        <div>
          <p className="mb-4 text-sm tracking-[0.3em] text-zinc-400">
            TAIPEI · COFFEE · DAILY
          </p>

          <h2 className="text-4xl font-bold leading-tight md:text-6xl">
  {shop.slogan}
</h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
  {shop.description}
</p>

          <div className="mt-8 flex gap-3">
            <a
              href="#menu"
              className="rounded-full bg-white px-6 py-3 font-medium text-black"
            >
              查看菜單
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
            src={shop.image}
            alt="MOKU COFFEE 咖啡店"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

      </section>
       {/* 招牌菜單 */}
      <section
        id="menu"
        className="border-t border-white/10 px-6 py-20 md:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm tracking-[0.3em] text-zinc-500">
            OUR MENU
          </p>

          <h3 className="mt-3 text-3xl font-bold md:text-5xl">
            招牌菜單
          </h3>

          <p className="mt-4 max-w-xl leading-7 text-zinc-400">
            簡單的咖啡、甜點，適合日常停留的味道。
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
              {shop.menu.map(([name, en, price]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div>
                  <p className="text-lg font-medium">
                    {name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {en}
                  </p>
                </div>

                <p className="font-medium">
                  {price}
                </p>
              </div>
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
                  {shop.address}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">營業時間</p>
                <p className="mt-1">
                  {shop.hours}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">電話</p>
                <p className="mt-1">
                  {shop.phone}
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
                href={shop.instagram}
                className="rounded-full bg-white px-6 py-3 font-medium text-black"
              >
                Instagram
              </a>

              <a
               href={shop.line}
                className="rounded-full border border-white/30 px-6 py-3 font-medium"
              >
                LINE 聯絡
              </a>

              <a
                href={`tel:${shop.phone.replace(/-/g, "")}`}
                className="rounded-full border border-white/30 px-6 py-3 font-medium"
              >
                撥打電話
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}