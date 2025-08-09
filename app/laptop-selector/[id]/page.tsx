"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
        <button
          onClick={() => router.back()}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          بازگشت
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl" dir="rtl">
      <div className="mb-4">
        <Link href="/laptop-selector" className="text-blue-600 hover:underline">
          ← بازگشت به لیست
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              {data.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.image_url}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">تصویر موجود نیست</span>
              )}
            </div>
          </div>

          <div className="md:w-1/2">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.name}</h1>

            {typeof data.price_eur === "number" && (
              <div className="text-lg mb-4">
                <span className="text-gray-600">قیمت تقریبی: </span>
                <span className="font-semibold">
                  €{data.price_eur.toLocaleString?.() ?? data.price_eur}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">پردازنده</div>
                <div className="font-semibold">{data.cpu_name || "-"}</div>
                {typeof data.cpu_score === "number" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Benchmark: {data.cpu_score}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">گرافیک</div>
                <div className="font-semibold">{data.gpu_name || "-"}</div>
                {typeof data.gpu_score === "number" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Benchmark: {data.gpu_score}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">حافظهٔ RAM</div>
                <div className="font-semibold">
                  {data.ram_gb ?? "-"} گیگابایت
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">حافظهٔ SSD</div>
                <div className="font-semibold">
                  {data.ssd_size_gb ? `${data.ssd_size_gb} GB` : "-"}
                </div>
              </div>
            </div>

            {/* توضیحات کوتاه (دلخواه: الان پویا نیست، می‌تونی بعداً ستون description اضافه کنی) */}
            <p className="text-gray-700 mt-4 leading-7">
              این لپ‌تاپ با ترکیب سخت‌افزاری فوق، برای استفاده‌های روزمره تا
              کارهای نیمه‌حرفه‌ای مناسب است. اگر نرم‌افزار یا بازی خاصی مدنظرت
              هست، از صفحهٔ «انتخاب نرم‌افزار» بررسی کن که حداقل‌ها و
              پیشنهادی‌ها را پوشش می‌دهد یا نه.
            </p>

            {/* دکمهٔ خرید */}
            <div className="mt-5 flex gap-3">
              {data.purchase_url ? (
                <a
                  href={data.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  خرید از وبسایت خارجی
                </a>
              ) : (
                <span className="text-sm text-gray-500">
                  لینک خرید ثبت نشده.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* می‌تونی در آینده: محصولات مشابه را اینجا لیست کنی */}
    </div>
  );
}
