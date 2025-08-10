"use client";

import { motion } from "framer-motion";

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
    <div className="mb-8" dir="rtl">
      <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex-1 text-center transition-colors ${
              step >= s.id ? "font-semibold text-gray-900" : ""
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Track glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50" />

        {/* Animated progress */}
        <motion.div
          className="relative h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Light shimmer */}
          <motion.div
            className="absolute inset-y-0 right-0 w-16 bg-white/30 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </motion.div>

        {/* Step markers */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {STEPS.map((s) => (
            <motion.div
              key={s.id}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                step >= s.id
                  ? "bg-white border-purple-500 shadow-md"
                  : "bg-white border-gray-300"
              }`}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  step >= s.id ? "bg-purple-600" : "bg-gray-300"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: step >= s.id ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
