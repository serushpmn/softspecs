"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import { debounce } from "../utils/debounce";
import type { ProgramReq } from "../types";

type Props = {
  onPick: (program: ProgramReq) => void; // وقتی کاربر یک برنامه را انتخاب کرد
  placeholder?: string;
  limit?: number;
};

export default function AutocompletePrograms({
  onPick,
  placeholder = "جستجوی برنامه یا بازی…",
  limit = 20,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProgramReq[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  const runSearch = async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("v_programs_requirements")
        .select("*")
        .ilike("name", `%${q}%`)
        .limit(limit);

      if (error) throw error;
      setResults((data || []) as ProgramReq[]);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const debounced = useMemo(() => debounce(runSearch, 300), []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={boxRef} dir="rtl">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
          </svg>
        </div>
        <input
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            debounced(val);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 px-4 py-3 pr-10 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
        />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-auto"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {loading && (
              <div className="px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
                  <path d="M12 2a10 10 0 0110 10" className="text-blue-500" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                در حال جستجو…
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">
                چیزی پیدا نشد.
              </div>
            )}

            {!loading &&
              results.map((p, idx) => (
                <motion.button
                  key={p.id}
                  className="w-full text-right px-4 py-3 hover:bg-gray-50/80 transition flex items-center gap-2"
                  onClick={() => {
                    onPick(p);
                    setQuery("");
                    setResults([]);
                    setOpen(false);
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <span className="text-blue-500">🔎</span>
                  {p.name}
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
