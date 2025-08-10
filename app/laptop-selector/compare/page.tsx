"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient"; // اگر مسیر فرق دارد، اصلاح کن

type Row = {
  id: number;
  name: string;
  image_url: string | null;
  price_eur: number | null;
  purchase_url: string | null;
  cpu_name: string | null;
  cpu_score: number | null;
  ram_gb: number | null;
  gpu_name: string | null;
  gpu_score: number | null;
  ssd_size_gb: number | null;
};

export default function ComparePage() {
  const sp = useSearchParams();
  const router = useRouter();

  const ids = useMemo(
    () =>
      (sp.get("ids") || "")
        .split(",")
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n))
        .slice(0, 3),
    [sp]
  );

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (ids.length === 0) {
          setRows([]);
          return;
        }

        const { data, error } = await supabase
          .from("v_laptops_expanded")
          .select("*")
          .in("id", ids);

        if (error) throw error;

        // حفظ ترتیب IDs
        const map = new Map<number, Row>((data as Row[]).map((d) => [d.id, d]));
        setRows(ids.map((id) => map.get(id)).filter(Boolean) as Row[]);
      } catch (e: any) {
        setErr(e?.message ?? "خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    })();
  }, [ids]);

  if (loading)
    return (
      <div className="p-6 text-center" dir="rtl">
        در حال بارگذاری…
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/laptop-selector" className="text-brand-600 hover:underline">
          ← بازگشت
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
          مقایسه لپ‌تاپ‌ها
        </h1>
        <div />
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {err}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-gray-600">
          ابتدا از صفحه نتایج، تا ۳ مدل را برای مقایسه انتخاب کنید.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-brand-50 to-accent-50">
                <th className="p-4 text-right sticky left-0 bg-gradient-to-r from-brand-50 to-accent-50 z-10 w-44">مشخصه</th>
                {rows.map((r) => (
                  <th key={r.id} className="p-4 text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.image_url}
                            alt={r.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">بدون تصویر</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          <Link href={`/laptop-selector/${r.id}`} className="hover:underline">
                            {r.name}
                          </Link>
                        </div>
                        {typeof r.price_eur === "number" && (
                          <div className="text-sm text-gray-700">
                            €{r.price_eur.toLocaleString?.() ?? r.price_eur}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {(
                [
                  [
                    "امتیاز کلی تقریبی",
                    (r: Row) => (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600">
                        {(Math.round(((r.cpu_score ?? 0) * 0.4 + (r.ram_gb ?? 0) * 0.4 + (r.gpu_score ?? 0) * 0.2) || 0))}%
                      </span>
                    ),
                  ],
                  ["پردازنده", (r: Row) => r.cpu_name || "-"],
                  [
                    "امتیاز CPU",
                    (r: Row) => (
                      <span className="inline-block px-2 py-1 rounded bg-brand-50 text-brand-700 text-xs font-semibold">
                        {r.cpu_score ?? "-"}
                      </span>
                    ),
                  ],
                  ["گرافیک", (r: Row) => r.gpu_name || "-"],
                  [
                    "امتیاز GPU",
                    (r: Row) => (
                      <span className="inline-block px-2 py-1 rounded bg-accent-50 text-accent-700 text-xs font-semibold">
                        {r.gpu_score ?? "-"}
                      </span>
                    ),
                  ],
                  [
                    "RAM",
                    (r: Row) => (r.ram_gb != null ? `${r.ram_gb} GB` : "-"),
                  ],
                  [
                    "SSD",
                    (r: Row) => (r.ssd_size_gb ? `${r.ssd_size_gb} GB` : "-"),
                  ],
                  [
                    "لینک خرید",
                    (r: Row) =>
                      r.purchase_url ? (
                        <a
                          href={r.purchase_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          مشاهده
                        </a>
                      ) : (
                        "-"
                      ),
                  ],
                ] as Array<[string, (r: Row) => ReactNode]>
              ).map(([label, render], idx) => (
                <tr key={idx} className={idx % 2 ? "bg-gray-50/50" : "bg-white"}>
                  <td className="p-4 font-medium w-44 sticky left-0 bg-inherit z-10">{label}</td>
                  {rows.map((r) => (
                    <td key={r.id} className="p-4 align-top">
                      {render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/laptop-selector")}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
          >
            تغییر انتخاب
          </button>

          <div className="flex items-center gap-3">
            <Link
              href={`/laptop-selector/${rows[0].id}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold shadow-sm hover:shadow-md"
            >
              مشاهده جزئیات اولین مدل
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
