"use client";

import type { Category } from "./Step1CategorySelect";

type CategoryId = Category["id"];

type ProgramLite = { id: number; name: string };

type Props = {
  categories: Category[];
  selectedCategories: CategoryId[];
  selectedPrograms: ProgramLite[];
  onRemoveCategory: (id: CategoryId) => void;
  onRemoveProgram: (id: number) => void;
};

export default function SelectionChips({
  categories,
  selectedCategories,
  selectedPrograms,
  onRemoveCategory,
  onRemoveProgram,
}: Props) {
  const catName = (id: CategoryId) =>
    categories.find((c) => c.id === id)?.name ?? id;

  return (
    <div
      className="flex flex-wrap gap-2 items-center justify-center mb-4"
      dir="rtl"
    >
      {selectedCategories.map((id) => (
        <span
          key={id}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-sm"
        >
          {catName(id)}
          <button
            className="text-blue-700 hover:text-blue-900"
            onClick={() => onRemoveCategory(id)}
            aria-label={`حذف ${catName(id)}`}
          >
            ×
          </button>
        </span>
      ))}

      {selectedPrograms.map((p) => (
        <span
          key={p.id}
          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-sm"
        >
          {p.name}
          <button
            className="text-emerald-700 hover:text-emerald-900"
            onClick={() => onRemoveProgram(p.id)}
            aria-label={`حذف ${p.name}`}
          >
            ×
          </button>
        </span>
      ))}

      {selectedCategories.length === 0 && selectedPrograms.length === 0 && (
        <span className="text-gray-500 text-sm">هنوز چیزی انتخاب نشده.</span>
      )}
    </div>
  );
}
