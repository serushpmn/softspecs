"use client";

import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const progressVariants = {
  hidden: { width: 0 },
  visible: (weight: number) => ({
    width: `${weight}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  })
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
    <motion.section 
      className="space-y-8" 
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        اهمیت هر کاربری را مشخص کنید
      </motion.h2>

      {selected.length === 1 ? (
        <motion.div 
          className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-green-200/50 text-center max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="text-6xl mb-4">🎯</div>
          <div className="text-lg text-gray-700 mb-2">
            فقط یک کاربری انتخاب شده:
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {categories.find((c) => c.id === selected[0])?.name} (۱۰۰٪)
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-6 max-w-2xl mx-auto"
          variants={containerVariants}
        >
          {selected.map((id, index) => {
            const cat = categories.find((c) => c.id === id);
            const weight = weights[id] || 0;
            
            return (
              <motion.div 
                key={id} 
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  borderColor: "#60a5fa"
                }}
                custom={index}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{cat?.icon}</div>
                    <label className="text-xl font-bold text-gray-800">{cat?.name}</label>
                  </div>
                  <motion.div 
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    {Math.round(weight)}%
                  </motion.div>
                </div>
                
                {/* Custom Range Slider */}
                <div className="relative" dir="ltr">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weight}
                    onChange={(e) => onWeightChange(id, Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #60a5fa 0%, #a78bfa ${weight}%, #e5e7eb ${weight}%, #e5e7eb 100%)`
                    }}
                  />
                  
                   {/* Weight markers */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2" dir="ltr">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Fixed action bar */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pointer-events-auto container max-w-6xl mx-auto p-3">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between">
            <motion.button
              onClick={onPrev}
              className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              بازگشت
            </motion.button>
            <motion.button
              onClick={onNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              انتخاب نرم‌افزارها
              <svg className="w-5 h-5 inline-block ml-2 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
