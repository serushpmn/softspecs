"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  onBack: () => void;

  // مقایسه
  compareIds: number[];
  onToggleCompare: (id: number) => void;
  onClearCompare: () => void;
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
    y: 30, 
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const scoreVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 20
    }
  }
};

export default function Step4Results({
  results,
  onRestart,
  onBack,
  compareIds,
  onToggleCompare,
  onClearCompare,
}: Props) {
  const canAdd = (id: number) =>
    compareIds.includes(id) || compareIds.length < 3;

  const compareQuery = compareIds.join(",");

  return (
    <motion.section 
      className="space-y-8" 
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        لپ‌تاپ‌های پیشنهادی
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {results.map(({ laptop, score, analysis }, index) => {
          const scoreClass =
            score > 85
              ? "from-green-500 to-emerald-500"
              : score > 60
              ? "from-yellow-500 to-orange-500"
              : "from-red-500 to-pink-500";
          const checked = compareIds.includes(laptop.id);

          return (
            <motion.div
              key={laptop.id}
              className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-200/50 hover:border-orange-300/50 transition-all duration-300 overflow-hidden flex flex-col"
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                borderColor: "#f97316"
              }}
              custom={index}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col gap-4 h-full">
                <Link href={`/laptop-selector/${laptop.id}`} className="block group">
                  <motion.div 
                    className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {laptop.image_url ? (
                      <motion.img
                        src={laptop.image_url}
                        alt={laptop.name || "laptop"}
                        className="w-full h-full object-cover rounded-lg"
                        initial={{ scale: 1.06 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.03 }}
                      />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <div className="text-4xl mb-2">💻</div>
                        تصویر لپ‌تاپ
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </motion.div>
                </Link>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/laptop-selector/${laptop.id}`}
                      className="text-2xl font-bold hover:text-orange-600 transition-colors duration-200"
                    >
                      {laptop.name}
                    </Link>

                    <motion.div 
                      className="text-center"
                      variants={scoreVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="text-sm text-gray-600 mb-1">امتیاز سازگاری</div>
                      <div className={`font-bold text-white rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-br ${scoreClass} shadow-lg`}>
                        {score}%
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
                      <span className="text-blue-500">🖥️</span>
                      <div>
                        <strong>پردازنده:</strong> {laptop.cpu_name || "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
                      <span className="text-green-500">💾</span>
                      <div>
                        <strong>رم:</strong> {laptop.ram_gb ?? "-"} گیگابایت
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
                      <span className="text-purple-500">🎮</span>
                      <div>
                        <strong>گرافیک:</strong> {laptop.gpu_name || "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
                      <span className="text-orange-500">💿</span>
                      <div>
                        <strong>حافظه:</strong>{" "}
                        {laptop.ssd_size_gb ? `${laptop.ssd_size_gb} GB SSD` : "-"}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="mt-4 flex items-center gap-3 flex-wrap"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      href={`/laptop-selector/${laptop.id}`}
                      className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      مشاهده جزئیات
                    </Link>

                    {typeof laptop.price_eur === "number" && (
                      <div className="text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-lg border border-green-200">
                        <strong>قیمت:</strong> €
                        {laptop.price_eur?.toLocaleString?.() ?? laptop.price_eur}
                      </div>
                    )}

                    <label className="ml-auto inline-flex items-center gap-2 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && !canAdd(laptop.id)}
                          onChange={() => onToggleCompare(laptop.id)}
                          className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 focus:ring-2"
                        />
                        {checked && (
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
                      <span
                        className={`font-medium ${
                          !checked && !canAdd(laptop.id) ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        افزودن به مقایسه
                      </span>
                    </label>
                  </motion.div>

                  {analysis.length > 0 && (
                    <motion.div 
                      className="mt-4 pt-3 border-t border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <h4 className="font-semibold mb-3 text-gray-800">تحلیل عملکرد:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.map((a, idx) => (
                          <motion.span
                            key={idx}
                            className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                              a.color === "green"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : a.color === "yellow"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 + idx * 0.05 }}
                          >
                            {a.name}: {a.status}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {results.length === 0 && (
          <motion.div 
            className="text-center text-gray-500 py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl">هنوز لپ‌تاپی در دیتابیس ثبت نشده</div>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.button
          onClick={onRestart}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          شروع مجدد
        </motion.button>
      </motion.div>

      {/* نوار شناور مقایسه مدرن */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div 
            className="fixed inset-x-0 bottom-6 flex justify-center z-40 pointer-events-none"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl">📊</div>
                <span className="text-sm font-medium text-gray-700">
                  مقایسه: {compareIds.length}/3 انتخاب شده
                </span>
              </div>
              
              <Link
                href={`/laptop-selector/compare?ids=${compareQuery}`}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                رفتن به صفحه مقایسه
              </Link>
              
              <motion.button
                onClick={onClearCompare}
                className="text-sm text-gray-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                پاک‌کردن
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed action bar (Back / Restart) */}
      <motion.div
        className="fixed bottom-0 inset-x-0 z-30 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pointer-events-auto container max-w-6xl mx-auto p-3">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between">
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">
              بازگشت
            </button>
            <button onClick={onRestart} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-sm hover:shadow-md">
              شروع مجدد
            </button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
