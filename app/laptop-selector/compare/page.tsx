"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient"; // در صورت تفاوت مسیر، اصلاح کن

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
        const map = new Map((data || []).map((d: any) => [d.id, d]));
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
      <div className="mb-4 flex items-center justify-between">
        <Link href="/laptop-selector" className="text-blue-600 hover:underline">
          ← بازگشت
        </Link>
        <h1 className="text-2xl font-bold">مقایسه لپ‌تاپ‌ها</h1>
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
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">مشخصه</th>
                {rows.map((r) => (
                  <th key={r.id} className="p-3 text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.image_url}
                            alt={r.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">
                            بدون تصویر
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          <Link
                            href={`/laptop-selector/${r.id}`}
                            className="hover:underline"
                          >
                            {r.name}
                          </Link>
                        </div>
                        {typeof r.price_eur === "number" && (
                          <div className="text-sm text-gray-600">
                            €{r.price_eur.toLocaleString?.() ?? r.price_eur}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                ["پردازنده", (r: Row) => r.cpu_name || "-"],
                ["امتیاز CPU", (r: Row) => r.cpu_score ?? "-"],
                ["گرافیک", (r: Row) => r.gpu_name || "-"],
                ["امتیاز GPU", (r: Row) => r.gpu_score ?? "-"],
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
                        className="text-blue-600 hover:underline"
                      >
                        مشاهده
                      </a>
                    ) : (
                      "-"
                    ),
                ],
              ].map(([label, render], idx) => (
                <tr key={idx} className={idx % 2 ? "bg-gray-50/50" : ""}>
                  <td className="p-3 font-medium w-40">{label}</td>
                  {rows.map((r) => (
                    <td key={r.id} className="p-3">
                      {(render as any)(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 text-left">
          <button
            onClick={() => router.push("/laptop-selector")}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            تغییر انتخاب
          </button>
        </div>
      )}
    </div>
  );
}
