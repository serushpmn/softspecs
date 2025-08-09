"use client";

import Link from "next/link";

export type LaptopRow = {
  id: number;
  name: string;
  ssd_size_gb: number | null;
  image_url: string | null;
  price_eur: number | null;
  cpu_name: string | null;
  cpu_score: number | null;
  ram_gb: number | null;
  gpu_name: string | null;
  gpu_score: number | null;
};

export type AnalysisItem = {
  name: string; // program name
  status: "عالی" | "قابل قبول" | "ضعیف";
  color: "green" | "yellow" | "red";
};

export type ResultItem = {
  laptop: LaptopRow;
  score: number; // 0..100
  analysis: AnalysisItem[];
};

type Props = {
  results: ResultItem[];
  onRestart: () => void;

  // مقایسه
  compareIds: number[];
  onToggleCompare: (id: number) => void;
  onClearCompare: () => void;
};

export default function Step4Results({
  results,
  onRestart,
  compareIds,
  onToggleCompare,
  onClearCompare,
}: Props) {
  const canAdd = (id: number) =>
    compareIds.includes(id) || compareIds.length < 3;

  const compareQuery = compareIds.join(",");

  return (
    <section className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-semibold text-center">
        لپ‌تاپ‌های پیشنهادی
      </h2>

      <div className="space-y-4">
        {results.map(({ laptop, score, analysis }) => {
          const scoreClass =
            score > 85
              ? "bg-green-500"
              : score > 60
              ? "bg-yellow-500"
              : "bg-red-500";
          const checked = compareIds.includes(laptop.id);

          return (
            <div
              key={laptop.id}
              className="group bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6"
            >
              <Link
                href={`/laptop-selector/${laptop.id}`}
                className="md:w-1/3 block"
              >
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {laptop.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={laptop.image_url}
                      alt={laptop.name || "laptop"}
                      className="w-full h-full object-cover rounded-lg transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <span className="text-gray-500">تصویر لپ‌تاپ</span>
                  )}
                </div>
              </Link>

              <div className="md:w-2/3">
                <div className="flex justify-between items-start">
                  <Link
                    href={`/laptop-selector/${laptop.id}`}
                    className="text-2xl font-bold hover:underline"
                  >
                    {laptop.name}
                  </Link>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">امتیاز سازگاری</div>
                    <div
                      className={`font-bold text-white rounded-full w-16 h-16 flex items-center justify-center ${scoreClass}`}
                    >
                      {score}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                  <div>
                    <strong>پردازنده:</strong> {laptop.cpu_name || "-"}
                  </div>
                  <div>
                    <strong>رم:</strong> {laptop.ram_gb ?? "-"} گیگابایت
                  </div>
                  <div>
                    <strong>گرافیک:</strong> {laptop.gpu_name || "-"}
                  </div>
                  <div>
                    <strong>حافظه:</strong>{" "}
                    {laptop.ssd_size_gb ? `${laptop.ssd_size_gb} GB SSD` : "-"}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/laptop-selector/${laptop.id}`}
                    className="inline-block bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    مشاهده جزئیات
                  </Link>

                  {typeof laptop.price_eur === "number" && (
                    <div className="text-gray-700">
                      <strong>قیمت:</strong> €
                      {laptop.price_eur?.toLocaleString?.() ?? laptop.price_eur}
                    </div>
                  )}

                  <label className="ml-auto inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && !canAdd(laptop.id)}
                      onChange={() => onToggleCompare(laptop.id)}
                    />
                    <span
                      className={
                        !checked && !canAdd(laptop.id) ? "text-gray-400" : ""
                      }
                    >
                      افزودن به مقایسه
                    </span>
                  </label>
                </div>

                {analysis.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">تحلیل عملکرد:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.map((a, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 text-sm rounded-full ${
                            a.color === "green"
                              ? "bg-green-100 text-green-800"
                              : a.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {a.name}: {a.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="text-center text-gray-500">
            هنوز لپ‌تاپی در دیتابیس ثبت نشده.
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onRestart}
          className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg"
        >
          شروع مجدد
        </button>
      </div>

      {/* نوار شناور مقایسه */}
      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center z-40 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur border shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
            <span className="text-sm">
              مقایسه: {compareIds.length}/3 انتخاب شده
            </span>
            <Link
              href={`/laptop-selector/compare?ids=${compareQuery}`}
              className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-700"
            >
              رفتن به صفحه مقایسه
            </Link>
            <button
              onClick={onClearCompare}
              className="text-sm text-gray-700 hover:underline"
            >
              پاک‌کردن
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
