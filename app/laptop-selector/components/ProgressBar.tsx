"use client";

type Props = {
  step: 1 | 2 | 3 | 4;
};

const STEPS = [
  { id: 1, title: "دسته‌ها" },
  { id: 2, title: "اهمیت" },
  { id: 3, title: "نرم‌افزارها" },
  { id: 4, title: "نتایج" },
] as const;

export default function ProgressBar({ step }: Props) {
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-6" dir="rtl">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex-1 text-center ${
              step >= s.id ? "font-semibold text-gray-900" : ""
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
