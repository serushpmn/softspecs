"use client";

type SortKey = "score_desc" | "price_asc" | "price_desc" | "ram_desc";

type Props = {
  minPrice?: number | null;
  maxPrice?: number | null;
  minSSD?: number | null;
  sort: SortKey;

  onChange: (next: {
    minPrice?: number | null;
    maxPrice?: number | null;
    minSSD?: number | null;
    sort: SortKey;
  }) => void;
};

export default function FiltersBar({
  minPrice,
  maxPrice,
  minSSD,
  sort,
  onChange,
}: Props) {
  const set = (patch: Partial<Props>) =>
    onChange({
      minPrice,
      maxPrice,
      minSSD,
      sort,
      ...patch,
    });

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm mb-4" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm mb-1">حداقل قیمت (€)</label>
          <input
            type="number"
            value={minPrice ?? ""}
            onChange={(e) =>
              set({ minPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="مثلاً 600"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">حداکثر قیمت (€)</label>
          <input
            type="number"
            value={maxPrice ?? ""}
            onChange={(e) =>
              set({ maxPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="مثلاً 2000"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">حداقل SSD (GB)</label>
          <input
            type="number"
            value={minSSD ?? ""}
            onChange={(e) =>
              set({ minSSD: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="مثلاً 512"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">مرتب‌سازی</label>
          <select
            value={sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="score_desc">امتیاز (بیشتر → کمتر)</option>
            <option value="price_asc">قیمت (کمتر → بیشتر)</option>
            <option value="price_desc">قیمت (بیشتر → کمتر)</option>
            <option value="ram_desc">رم (بیشتر → کمتر)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
