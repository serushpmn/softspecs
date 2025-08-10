"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient"; // اگر مسیر فرق دارد، اصلاح کن

type LaptopRow = {
  id: number;
  name: string;
  ssd_size_gb: number | null;
  image_url: string | null;
  price_eur: number | null;
  purchase_url: string | null;
  cpu_name: string | null;
  cpu_score: number | null;
  ram_gb: number | null;
  gpu_name: string | null;
  gpu_score: number | null;
  created_at?: string;
  updated_at?: string;
};

export default function LaptopDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<LaptopRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const idNum = useMemo(() => {
    const n = Number(params.id);
    return Number.isFinite(n) ? n : null;
  }, [params.id]);

  useEffect(() => {
    (async () => {
      if (idNum == null) {
        setErr("شناسه نامعتبر است.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("v_laptops_expanded")
          .select("*")
          .eq("id", idNum)
          .single();

        if (error) throw error;
        setData(data as LaptopRow);
      } catch (e: any) {
        setErr(e?.message ?? "خطا در دریافت اطلاعات لپ‌تاپ");
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum]);

  if (loading)
    return (
      <div className="p-6 text-center" dir="rtl">
        در حال بارگذاری…
      </div>
    );
  if (err || !data)
    return (
      <div className="p-6 max-w-3xl mx-auto" dir="rtl">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {err || "موردی یافت نشد."}
        </div>
        <button onClick={() => router.back()} className="bg-gray-200 px-4 py-2 rounded">
          بازگشت
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/laptop-selector" className="text-brand-600 hover:underline">
          ← بازگشت به لیست
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
          {data.name}
        </h1>
        <div />
      </div>

      {/* Main product card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gallery */}
          <div>
            <motion.div
              className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {data.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.image_url} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 text-center">
                  <div className="text-4xl mb-2">💻</div>
                  تصویر موجود نیست
                </div>
              )}
            </motion.div>
            {/* Thumbnails placeholder for future multiple images */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {typeof data.price_eur === "number" && (
              <div className="text-xl mb-3">
                <span className="text-gray-600">قیمت تقریبی: </span>
                <span className="font-extrabold text-gray-900">
                  €{data.price_eur.toLocaleString?.() ?? data.price_eur}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-gray-800">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">پردازنده</div>
                <div className="font-semibold">{data.cpu_name || "-"}</div>
                {typeof data.cpu_score === "number" && (
                  <div className="text-xs text-gray-500 mt-1">Benchmark: {data.cpu_score}</div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">گرافیک</div>
                <div className="font-semibold">{data.gpu_name || "-"}</div>
                {typeof data.gpu_score === "number" && (
                  <div className="text-xs text-gray-500 mt-1">Benchmark: {data.gpu_score}</div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">حافظهٔ RAM</div>
                <div className="font-semibold">{data.ram_gb ?? "-"} گیگابایت</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">حافظهٔ SSD</div>
                <div className="font-semibold">{data.ssd_size_gb ? `${data.ssd_size_gb} GB` : "-"}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {data.purchase_url ? (
                <a
                  href={data.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold shadow-sm hover:shadow-md"
                >
                  خرید از وبسایت خارجی
                </a>
              ) : (
                <span className="text-sm text-gray-500">لینک خرید ثبت نشده.</span>
              )}
              <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">
                بازگشت
              </button>
            </div>

            {/* Pros/Cons mockup */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="font-bold text-green-700 mb-2">نقاط قوت</div>
                <ul className="text-sm text-green-800 space-y-1 list-disc pr-5">
                  <li>عملکرد مناسب در کاربری روزمره</li>
                  <li>کیفیت ساخت خوب و سبک</li>
                  <li>مصرف انرژی بهینه</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="font-bold text-red-700 mb-2">نقاط ضعف</div>
                <ul className="text-sm text-red-800 space-y-1 list-disc pr-5">
                  <li>محدودیت در بازی‌های سنگین</li>
                  <li>قیمت نسبتاً بالا</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-xl font-bold mb-3">توضیحات و نقد و بررسی</h2>
          <p className="text-gray-700 leading-7">
            این بخش می‌تواند شامل بررسی تخصصی، کیفیت نمایشگر، عمر باتری، تجربه تایپ و تاچ‌پد،
            بازدهی خنک‌کنندگی، نویز فن و تجربه کاربری باشد. همچنین می‌توانید در آینده
            محتوای تولیدی یا ویدیوهای یوتیوب را به این بخش متصل کنید.
          </p>
          <ul className="mt-3 text-gray-700 list-disc pr-5 space-y-1">
            <li>نمایشگر با کیفیت مناسب برای کارهای چندرسانه‌ای</li>
            <li>کیبورد با چیدمان راحت و نور پس‌زمینه</li>
            <li>شارژدهی باتری یک روز کاری سبک</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-lg font-bold mb-3">مشخصات کلیدی</h3>
          <div className="space-y-2 text-gray-800">
            <div className="flex items-center justify-between"><span>CPU</span><span className="font-semibold">{data.cpu_name || "-"}</span></div>
            <div className="flex items-center justify-between"><span>GPU</span><span className="font-semibold">{data.gpu_name || "-"}</span></div>
            <div className="flex items-center justify-between"><span>RAM</span><span className="font-semibold">{data.ram_gb ?? "-"} GB</span></div>
            <div className="flex items-center justify-between"><span>SSD</span><span className="font-semibold">{data.ssd_size_gb ? `${data.ssd_size_gb} GB` : "-"}</span></div>
            {typeof data.price_eur === "number" && (
              <div className="flex items-center justify-between"><span>قیمت</span><span className="font-extrabold">€{data.price_eur.toLocaleString?.() ?? data.price_eur}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Related placeholder */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3">محصولات مشابه</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white border border-gray-200 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
