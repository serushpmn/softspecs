"use client";

import { motion } from "framer-motion";

type CategoryId =
  | "general"
  | "office"
  | "education"
  | "programming"
  | "graphics"
  | "video"
  | "music"
  | "engineering"
  | "data"
  | "gaming"
  | "specialized";

export type Category = { id: CategoryId; name: string; icon: string; subitems: string[] };

type Props = {
  categories: Category[];
  selected: CategoryId[];
  onToggle: (id: CategoryId) => void;
  onNext: () => void;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    y: -8,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export default function Step1CategorySelect({
  categories,
  selected,
  onToggle,
  onNext,
}: Props) {
  return (
    <motion.section
      className="space-y-8"
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        دسته‌بندی کلی کاربرد لپ‌تاپ
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        variants={containerVariants}
      >
        {categories.map((cat, index) => {
          const isSelected = selected.includes(cat.id);
          return (
            <motion.button
              type="button"
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={`relative overflow-hidden text-center rounded-2xl p-5 transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/30"
                  : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300/50 shadow-lg hover:shadow-xl"
              }`}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              custom={index}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background decoration */}
              <div
                className={`absolute inset-0 opacity-10 ${
                  isSelected ? "bg-white" : "bg-gradient-to-br from-blue-100 to-purple-100"
                }`}
              />

              {/* Icon centered */}
              <div className="mb-3 relative z-10">
                <div className="text-5xl md:text-6xl mx-auto inline-block">{cat.icon}</div>
              </div>
              {isSelected && (
                <motion.div
                  className="absolute top-3 left-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Title */}
              <div className={`font-extrabold text-lg md:text-xl mb-2 relative z-10 ${isSelected ? "text-white" : "text-gray-800"}`}>
                {cat.name}
              </div>

              {/* Subitems */}
              <ul className={`space-y-0.5 text-sm leading-snug relative z-10 ${isSelected ? "text-white/90" : "text-gray-700"}`}>
                {cat.subitems.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Fixed action bar with selected chips */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pointer-events-auto container max-w-6xl mx-auto p-3">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {selected.length === 0 ? (
                <span className="text-sm text-gray-600">یک دسته انتخاب کنید</span>
              ) : (
                selected.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-sm"
                  >
                    {categories.find((c) => c.id === id)?.name ?? id}
                    <button
                      className="text-blue-700 hover:text-blue-900"
                      onClick={() => onToggle(id)}
                      aria-label={`حذف ${categories.find((c) => c.id === id)?.name ?? id}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <motion.button
              disabled={selected.length === 0}
              onClick={onNext}
              className={`relative overflow-hidden px-6 py-2.5 rounded-xl font-bold shadow-md transition-all ${
                selected.length === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
              }`}
              whileHover={selected.length > 0 ? { scale: 1.03 } : {}}
              whileTap={selected.length > 0 ? { scale: 0.97 } : {}}
            >
              مرحله بعد
              <motion.svg
                className="w-5 h-5 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth={3}
  d="M11 7l-5 5m0 0l5 5m-5-5h12"
/>

              </motion.svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
