"use client";

import type { Category } from "./Step1CategorySelect";

type CategoryId = Category["id"];

type Props = {
  categories: Category[];
  selected: CategoryId[];
  weights: Record<CategoryId, number>;
  onWeightChange: (id: CategoryId, value: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Step2Weighting({
  categories,
  selected,
  weights,
  onWeightChange,
  onPrev,
  onNext,
}: Props) {
  return (
    <section className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-semibold text-center">
        اهمیت هر کاربری را مشخص کنید.
      </h2>

      {selected.length === 1 ? (
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          فقط یک کاربری انتخاب شده:{" "}
          <strong>
            {categories.find((c) => c.id === selected[0])?.name} (۱۰۰٪)
          </strong>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg mx-auto">
          {selected.map((id) => {
            const cat = categories.find((c) => c.id === id);
            return (
              <div key={id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold">{cat?.name}</label>
                  <span className="font-bold text-blue-600">
                    {Math.round(weights[id] || 0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[id] || 0}
                  onChange={(e) => onWeightChange(id, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      )}

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
          انتخاب نرم‌افزارها
        </button>
      </div>
    </section>
  );
}
