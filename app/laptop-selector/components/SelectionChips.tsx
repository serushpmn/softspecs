"use client";

import { motion } from "framer-motion";
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

const chipVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  hover: { y: -2, scale: 1.03 },
  tap: { scale: 0.97 },
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
    <motion.div
      className="flex flex-wrap gap-2 items-center justify-center mb-6"
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {selectedCategories.map((id) => (
        <motion.span
          key={id}
          className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm"
          variants={chipVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="text-base">🔷</span>
          {catName(id)}
          <motion.button
            className="text-blue-700/90 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center"
            onClick={() => onRemoveCategory(id)}
            aria-label={`حذف ${catName(id)}`}
            whileHover={{ rotate: 90, scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </motion.span>
      ))}

      {selectedPrograms.map((p) => (
        <motion.span
          key={p.id}
          className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm"
          variants={chipVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="text-base">✅</span>
          {p.name}
          <motion.button
            className="text-emerald-700/90 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-full w-5 h-5 flex items-center justify-center"
            onClick={() => onRemoveProgram(p.id)}
            aria-label={`حذف ${p.name}`}
            whileHover={{ rotate: 90, scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </motion.span>
      ))}

      {selectedCategories.length === 0 && selectedPrograms.length === 0 && (
        <motion.span 
          className="text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          هنوز چیزی انتخاب نشده.
        </motion.span>
      )}
    </motion.div>
  );
}
