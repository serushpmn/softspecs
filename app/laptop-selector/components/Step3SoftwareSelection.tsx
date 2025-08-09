"use client";

import { useMemo, useState } from "react";
import type { Category } from "./Step1CategorySelect";
import type { ProgramReq } from "./Step3SoftwareSelection";

type CategoryId = Category["id"];

type Props = {
  categories: Category[];
  selectedCategories: CategoryId[];
  programs: ProgramReq[]; // از v_programs_requirements
  selectedProgramIds: number[];
  onToggleProgram: (id: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Step3SoftwareSelection({
  categories,
  selectedCategories,
  programs,
  selectedProgramIds,
  onToggleProgram,
  onPrev,
  onNext,
}: Props) {
  // برای نمایش مودال
  const [openId, setOpenId] = useState<number | null>(null);
  const openProgram = programs.find((p) => p.id === openId) || null;

  const belongsTo = (p: ProgramReq, cat: CategoryId) => {
    if (!p.category) return false;
    if (Array.isArray(p.category))
      return p.category.some((x) => String(x).toLowerCase().includes(cat));
    return String(p.category).toLowerCase().includes(cat);
  };

  // گروه‌بندی برنامه‌ها بر اساس دسته‌های انتخاب‌شده
  const byCategory = useMemo(() => {
    const result: Record<CategoryId, ProgramReq[]> = {
      programming: [],
      graphics: [],
      gaming: [],
      office: [],
    };
    selectedCategories.forEach((cat) => {
      result[cat] = programs.filter((p) => belongsTo(p, cat));
    });
    return result;
  }, [programs, selectedCategories]);

  return (
    <section className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-semibold text-center">
        نرم‌افزارها یا بازی‌ها را انتخاب کنید.
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {selectedCategories.map((cat) => {
          const catMeta = categories.find((c) => c.id === cat);
          const list = byCategory[cat] || [];

          return (
            <div key={cat} className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3 border-b pb-2">
                {catMeta?.name}
              </h3>

              <div className="space-y-3">
                {list.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProgramIds.includes(p.id)}
                        onChange={() => onToggleProgram(p.id)}
                      />
                      <span>{p.name}</span>
                    </label>

                    <button
                      onClick={() => setOpenId(p.id)}
                      className="text-blue-600 text-sm hover:underline"
                      aria-label={`نمایش سیستم موردنیاز برای ${p.name}`}
                    >
                      سیستم موردنیاز
                    </button>
                  </div>
                ))}

                {list.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    موردی برای این دسته ثبت نشده.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onPrev}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg"
        >
          بازگشت
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          نمایش لپ‌تاپ‌ها
        </button>
      </div>

      {/* Modal ساده */}
      {openProgram && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenId(null)}
              className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 text-2xl"
              aria-label="بستن"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4">{openProgram.name}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold mb-2">حداقل سیستم</div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pr-5">
                  <li>CPU: {openProgram.cpu_min_name || "-"}</li>
                  <li>RAM: {openProgram.ram_min_gb ?? "-"} GB</li>
                  <li>GPU: {openProgram.gpu_min_name || "-"}</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold mb-2">سیستم پیشنهادی</div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pr-5">
                  <li>CPU: {openProgram.cpu_rec_name || "-"}</li>
                  <li>RAM: {openProgram.ram_rec_gb ?? "-"} GB</li>
                  <li>GPU: {openProgram.gpu_rec_name || "-"}</li>
                </ul>
              </div>
            </div>

            <div className="text-left mt-5">
              <button
                onClick={() => setOpenId(null)}
                className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
