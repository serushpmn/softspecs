"use client";

import { motion } from "framer-motion";

type CategoryId = "programming" | "graphics" | "gaming" | "office";

export type Category = { id: CategoryId; name: string; icon: string };

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
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9 
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

const buttonVariants = {
  hover: { 
    scale: 1.05,
    y: -8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { 
    scale: 0.95 
  }
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
        برای چه کاری قصد تهیه لپ‌تاپ دارید؟
      </motion.h2>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        variants={containerVariants}
      >
        {categories.map((cat, index) => {
          const isSelected = selected.includes(cat.id);
          return (
            <motion.button
              type="button"
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 ${
                isSelected 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/30" 
                  : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-300/50 shadow-lg hover:shadow-xl"
              }`}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              custom={index}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Background decoration */}
              <div className={`absolute inset-0 opacity-10 ${
                isSelected ? "bg-white" : "bg-gradient-to-br from-blue-100 to-purple-100"
              }`} />
              
              {/* Icon with floating animation */}
              <motion.div 
                className="text-5xl md:text-6xl mb-4 relative z-10"
                animate={isSelected ? {
                  y: [0, -10, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                } : {}}
              >
                {cat.icon}
              </motion.div>
              
              {/* Category name */}
              <div className={`font-bold text-lg relative z-10 ${
                isSelected ? "text-white" : "text-gray-800"
              }`}>
                {cat.name}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
              
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

      <motion.div 
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.button
          disabled={selected.length === 0}
          onClick={onNext}
          className={`relative overflow-hidden px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 ${
            selected.length === 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          } text-white`}
          whileHover={selected.length > 0 ? { scale: 1.05, y: -2 } : {}}
          whileTap={selected.length > 0 ? { scale: 0.95 } : {}}
        >
          <span className="relative z-10">مرحله بعد</span>
          
          {/* Button background animation */}
          {selected.length > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Arrow icon */}
          <motion.svg 
            className="w-5 h-5 ml-2 inline-block relative z-10"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </motion.svg>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
