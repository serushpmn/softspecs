"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "./Step1CategorySelect";
import type { ProgramReq } from "../types";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
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
    <motion.section 
      className="space-y-8" 
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        نرم‌افزارها یا بازی‌ها را انتخاب کنید
      </motion.h2>

      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {selectedCategories.map((cat, catIndex) => {
          const catMeta = categories.find((c) => c.id === cat);
          const list = byCategory[cat] || [];

          return (
            <motion.div 
              key={cat} 
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                borderColor: "#a78bfa"
              }}
              custom={catIndex}
            >
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-3">
                <div className="text-3xl">{catMeta?.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800">{catMeta?.name}</h3>
              </div>

              <div className="space-y-4">
                {list.map((p, progIndex) => (
                  <motion.div
                    key={p.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + catIndex * 0.1 + progIndex * 0.05 }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedProgramIds.includes(p.id)}
                          onChange={() => onToggleProgram(p.id)}
                          className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-2"
                        />
                        {selectedProgramIds.includes(p.id) && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                        {p.name}
                      </span>
                    </label>

                    <motion.button
                      onClick={() => setOpenId(p.id)}
                      className="text-purple-600 text-sm hover:text-purple-800 font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`نمایش سیستم موردنیاز برای ${p.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      سیستم موردنیاز
                    </motion.button>
                  </motion.div>
                ))}

                {list.length === 0 && (
                  <motion.div 
                    className="text-gray-500 text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + catIndex * 0.1 }}
                  >
                    <div className="text-4xl mb-2">📝</div>
                    موردی برای این دسته ثبت نشده
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div 
        className="flex justify-center gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.button
          onClick={onPrev}
          className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-2xl border border-gray-200 hover:bg-gray-200 transition-all duration-300"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت
          </span>
        </motion.button>
        
        <motion.button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            نمایش لپ‌تاپ‌ها
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>

      {/* Modal مدرن */}
      <AnimatePresence>
        {openProgram && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{openProgram.name}</h3>
                  <motion.button
                    onClick={() => setOpenId(null)}
                    className="text-white/80 hover:text-white text-3xl transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="بستن"
                  >
                    ×
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-2xl">⚡</div>
                      <div className="font-bold text-lg text-blue-800">حداقل سیستم</div>
                    </div>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <strong>CPU:</strong> {openProgram.cpu_min_name || "-"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <strong>RAM:</strong> {openProgram.ram_min_gb ?? "-"} GB
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <strong>GPU:</strong> {openProgram.gpu_min_name || "-"}
                      </li>
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-2xl">🚀</div>
                      <div className="font-bold text-lg text-green-800">سیستم پیشنهادی</div>
                    </div>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <strong>CPU:</strong> {openProgram.cpu_rec_name || "-"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <strong>RAM:</strong> {openProgram.ram_rec_gb ?? "-"} GB
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <strong>GPU:</strong> {openProgram.gpu_rec_name || "-"}
                      </li>
                    </ul>
                  </motion.div>
                </div>

                <motion.div 
                  className="text-center mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => setOpenId(null)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    بستن
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
