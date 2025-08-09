"use client";

type CategoryId = "programming" | "graphics" | "gaming" | "office";

export type Category = { id: CategoryId; name: string; icon: string };

type Props = {
  categories: Category[];
  selected: CategoryId[];
  onToggle: (id: CategoryId) => void;
  onNext: () => void;
};

export default function Step1CategorySelect({
  categories,
  selected,
  onToggle,
  onNext,
}: Props) {
  return (
    <section className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-semibold text-center">
        برای چه کاری قصد تهیه لپ‌تاپ دارید؟
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={`card bg-white p-4 rounded-lg border-2 text-center shadow-sm transition ${
                isSelected ? "border-blue-600 bg-blue-50" : "border-transparent"
              }`}
            >
              <div className="text-4xl mb-2">{cat.icon}</div>
              <div className="font-semibold">{cat.name}</div>
            </button>
          );
        })}
      </div>

      <div className="text-center mt-6">
        <button
          disabled={selected.length === 0}
          onClick={onNext}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          مرحله بعد
        </button>
      </div>
    </section>
  );
}
