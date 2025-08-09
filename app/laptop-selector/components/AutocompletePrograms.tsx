"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { debounce } from "../utils/debounce";
import type { ProgramReq } from "./Step3SoftwareSelection";

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
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">در حال جستجو…</div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              چیزی پیدا نشد.
            </div>
          )}

          {!loading &&
            results.map((p) => (
              <button
                key={p.id}
                className="w-full text-right px-4 py-2 hover:bg-gray-50"
                onClick={() => {
                  onPick(p);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
              >
                {p.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
