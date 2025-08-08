"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Types
interface Program {
  id: number;
  name: string;
  version?: string;
  os?: string; // stringified JSON
  cpu_min_name?: string;
  cpu_min_bench?: number | null;
  gpu_min_name?: string;
  gpu_min_bench?: number | null;
  ram_min?: string;
  ram_min_gb?: number | null;
  disk_space?: string;
  is_free?: boolean;
  is_open_source?: boolean;
  featured?: boolean;
}

interface Filters {
  OS: string;
  cpu: string;
  ram: string;
  gpu: string;
  diskType: string;
  isFree: boolean;
  isOpenSource: boolean;
}

interface UserSpecs {
  ram: string;
  cpuCores: string;
}

interface Cpu {
  id: number;
  name: string;
  benchmark: number | null;
  rank: number | null;
}
interface Gpu {
  id: number;
  name: string;
  benchmark: number | null;
  rank: number | null;
}
interface Ram {
  id: number;
  name: string;
}
interface Os {
  id: number;
  name: string;
}

// Main App Component
export default function App() {
  const defaultFilters: Filters = {
    OS: "",
    cpu: "",
    ram: "",
    gpu: "",
    diskType: "",
    isFree: false,
    isOpenSource: false,
  };

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [userSpecs, setUserSpecs] = useState<UserSpecs>({
    ram: "",
    cpuCores: "",
  });
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null
  );
  const [cpuList, setCpuList] = useState<Cpu[]>([]);
  const [gpuList, setGpuList] = useState<Gpu[]>([]);
  const [ramList, setRamList] = useState<Ram[]>([]);
  const [osList, setOsList] = useState<Os[]>([]);
  const [pendingFilters, setPendingFilters] = useState<Filters>(defaultFilters);
  const [pendingSearch, setPendingSearch] = useState<string>("");

  // Load lookup tables (cpus/gpus/rams) for select options
  useEffect(() => {
    const loadLookups = async () => {
      const [
        { data: oses, error: e0 },
        { data: cpus, error: e1, count: c1 },
        { data: gpus, error: e2 },
        { data: rams, error: e3 },
      ] = await Promise.all([
        supabase
          .from("os")
          .select("id,name", { count: "exact" })
          .order("name", { ascending: true })
          .range(0, 9999),
        supabase
          .from("cpus")
          .select("id,name,benchmark,rank", { count: "exact" })
          .order("rank", { ascending: true, nullsFirst: false })
          .order("name", { ascending: true })
          .range(0, 9999),
        supabase
          .from("gpus")
          .select("id,name,benchmark,rank", { count: "exact" })
          .order("rank", { ascending: true, nullsFirst: false })
          .order("name", { ascending: true })
          .range(0, 9999),
        supabase
          .from("rams")
          .select("id,name", { count: "exact" })
          .order("name", { ascending: true })
          .range(0, 9999),
      ]);

      if (e0) console.error("os error:", e0);
      if (e1) console.error("cpus error:", e1);
      if (e2) console.error("gpus error:", e2);
      if (e3) console.error("rams error:", e3);

      setOsList(oses || []);
      setCpuList(cpus || []);
      setGpuList(gpus || []);
      setRamList(rams || []);

      console.log("cpus fetched:", cpus?.length, "count:", c1);
    };
    loadLookups();
  }, []);

  // Always fetch programs using the new RPC function, even if all filters are empty
  useEffect(() => {
    setLoading(true);
    setErrorMsg("");
    const params: any = {
      user_cpu_name: filters.cpu || null,
      user_gpu_name: filters.gpu || null,
      user_ram: filters.ram ? parseInt(filters.ram) : null,
      os_name: filters.OS || null,
      program_name: searchTerm || null,
    };
    supabase
      .rpc("programs_by_user_specs", params)
      .then(({ data, error }: { data: any; error: any }) => {
        setLoading(false);
        if (error) {
          setErrorMsg(error.message);
          setPrograms([]);
        } else {
          setPrograms((data || []) as Program[]);
        }
      });
  }, [filters.cpu, filters.gpu, filters.ram, filters.OS, searchTerm]);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .limit(1);
      if (error) {
        console.error("Supabase connection error:", error.message);
      } else {
        console.log("Supabase connection successful. Sample data:", data);
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    async function testRelations() {
      // توجه: اگر نام‌های FK متفاوت است، آن‌ها را اصلاح کن
      const { data, error } = await supabase
        .from("programs")
        .select(
          `
        id,name,version,OS,Disk_space,category,
        cpu_min:cpus!programs_cpu_min_id_fkey (id,name,benchmark,rank),
        cpu_rec:cpus!programs_cpu_rec_id_fkey (id,name,benchmark,rank),
        gpu_min:gpus!programs_gpu_min_id_fkey (id,name,benchmark,rank),
        gpu_rec:gpus!programs_gpu_rec_id_fkey (id,name,benchmark,rank),
        ram_min:rams!programs_ram_min_id_fkey (id,name),
        ram_rec:rams!programs_ram_rec_id_fkey (id,name)
      `
        )
        .limit(3);

      if (error) {
        console.error("Relation test error:", error);
        return;
      }
      console.log("Relation test sample:", data);

      // چند بررسی ساده
      const ok = (data ?? []).every(
        (p: any) =>
          p.name &&
          p.cpu_min?.name &&
          p.cpu_rec?.name &&
          p.gpu_min?.name &&
          p.gpu_rec?.name &&
          p.ram_min?.name &&
          p.ram_rec?.name
      );
      console.log("All relations resolved:", ok);
    }
    testRelations();
  }, []);

  // A helper function to parse ram string like "8 GB" to integer 8
  const parseRam = (ramStr: string): number => {
    const match = ramStr.match(/(\d+)\s*GB/);
    return match ? parseInt(match[1]) : 0;
  };

  // تابع کمکی برای حذف "or newer" و trim کردن
  const cleanOS = (os: string) => os.replace(/or newer/gi, "").trim();

  // تابع کمکی: استخراج عدد RAM از name جدول rams یا از مقادیر برنامه‌ها
  const parseRamNumber = (v: unknown): number => {
    if (typeof v === "number") return v;
    const m = String(v ?? "").match(/\d+/);
    return m ? parseInt(m[0], 10) : NaN;
  };

  // استخراج گزینه‌های یکتا برای فیلترهای آرایه‌ای با حذف "or newer"
  const OSOptions = [
    "",
    ...(osList.length
      ? osList.map((o) => o.name)
      : Array.from(
          new Set(
            programs
              .flatMap((p) => (Array.isArray(p.OS) ? p.OS : [p.OS]))
              .filter((os): os is string => typeof os === "string" && !!os)
              .map(cleanOS)
          )
        )),
  ];

  // گزینه‌های فیلتر بر اساس جداول lookup (مرتب‌سازی عددی RAM)
  const cpuOptions = [
    "",
    ...Array.from(
      new Set(
        [
          // از جدول cpus
          ...cpuList.map((c) => c.name).filter(Boolean),
          // از داده‌های برنامه‌ها (CPU_min/CPU_rec)
          ...(programs
            .flatMap((p) => {
              const mins = Array.isArray(p.CPU_min) ? p.CPU_min : [p.CPU_min];
              const recs = Array.isArray(p.CPU_rec) ? p.CPU_rec : [p.CPU_rec];
              return [...mins, ...recs];
            })
            .filter(Boolean) as string[]),
        ].map((s) => s.trim())
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const gpuOptions = ["", ...gpuList.map((g) => g.name)];
  const ramOptions = [
    "",
    ...Array.from(
      new Set(
        [
          ...ramList.map((r) => parseRamNumber(r.name)),
          ...programs.map((p) => parseRamNumber(p.Ram_min)),
          ...programs.map((p) => parseRamNumber(p.Ram_rec)),
        ].filter((n) => Number.isFinite(n)) as number[]
      )
    )
      .sort((a, b) => a - b)
      .map((n) => String(n)),
  ];

  // لیست یکتای نام برنامه‌ها (بدون نسخه) برای سرچ برنامه
  const programNameOptions = [
    "",
    ...Array.from(new Set(programs.map((p) => p.name))).sort((a, b) =>
      a.localeCompare(b)
    ),
  ];

  // Programs are now fetched from the server, no client-side filtering
  const filteredPrograms = programs;

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleUserSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserSpecs((prevSpecs) => ({ ...prevSpecs, [name]: value }));
  };

  // A helper function to compare user's specs with a program's requirements
  const checkCompatibility = (program: Program): boolean => {
    const userRam = parseInt(userSpecs.ram);
    const userCores = parseInt(userSpecs.cpuCores);

    if (!userRam || !userCores) return false;

    const minRam = parseRam(program.Ram_min as unknown as string);

    // ایمن‌سازی برای union type
    const cpuMatch = String(program.CPU_min).match(/(\d+)/);
    const minCores = cpuMatch ? parseInt(cpuMatch[1]) : 1;

    const isCompatible = userRam >= minRam && userCores >= minCores;
    return isCompatible;
  };

  const selectedProgram = filteredPrograms.find(
    (p) => p.id === selectedProgramId
  );

  // کامپوننت عمومی برای سرچ و انتخاب
  function Autocomplete({
    label,
    value,
    options,
    placeholder,
    onSelect,
    width = "w-56",
  }: {
    label: string;
    value: string;
    options: string[];
    placeholder: string;
    onSelect: (val: string) => void;
    width?: string;
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value ?? "");
    const [highlighted, setHighlighted] = useState<number>(-1);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => setQuery(value ?? ""), [value]);

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const filtered = (options ?? [])
      .filter((opt) => opt?.toLowerCase().includes((query ?? "").toLowerCase()))
      .slice(0, 50); // حداکثر 50 مورد

    // همیشه گزینه خالی را اول لیست بیاور
    const list = Array.from(new Set<string>(["", ...filtered]));

    useEffect(() => {
      // همواره ایندکس هایلایت در بازه معتبر
      if (highlighted >= list.length) setHighlighted(list.length - 1);
    }, [list.length, highlighted]);

    const labelOf = (opt: string) => (opt === "" ? "Any" : opt);

    return (
      <div className={`relative ${width}`} ref={ref}>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                return;
              }
              if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                setOpen(true);
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((i) => Math.min(i + 1, list.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                if (open && highlighted >= 0 && highlighted < list.length) {
                  const chosen = list[highlighted];
                  onSelect(chosen);
                  setQuery(chosen);
                  setOpen(false);
                }
              }
            }}
            placeholder={placeholder}
            className="w-full pr-8 p-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {value || query ? (
            <button
              type="button"
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => {
                onSelect("");
                setQuery("");
                setOpen(false);
                setHighlighted(-1);
              }}
            >
              ×
            </button>
          ) : null}
        </div>

        {open ? (
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
            {list.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
            ) : (
              list.map((opt, idx) => (
                <div
                  key={opt || "__ANY__"}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlighted
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  } ${opt === value ? "bg-blue-700 text-white" : ""}`}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseLeave={() => setHighlighted(-1)}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
                    setHighlighted(-1);
                  }}
                >
                  {labelOf(opt)}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    );
  }

  // جستجوی سروری CPU با debounce و ilike
  function AutocompleteServerSearch({
    label,
    value,
    onSelect,
    placeholder = "",
    width = "w-56",
  }: {
    label: string;
    value: string;
    onSelect: (val: string) => void;
    placeholder?: string;
    width?: string;
  }) {
    const [query, setQuery] = useState(value ?? "");
    const [results, setResults] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState<number>(-1);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      setQuery(value ?? "");
    }, [value]);

    useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
      const q = (query ?? "").trim();
      const timer = setTimeout(() => {
        if (q.length < 2) {
          setResults([]);
          return;
        }
        setLoading(true);
        supabase
          .from("cpus")
          .select("name")
          .ilike("name", `%${q}%`)
          .order("name", { ascending: true })
          .limit(50)
          .then(({ data, error }: { data: any; error: any }) => {
            setLoading(false);
            if (error) {
              console.error("CPU search error:", error);
              setResults([]);
            } else {
              const uniq: string[] = Array.from(
                new Set(
                  ((data ?? []) as { name: string }[])
                    .map((d) => d.name)
                    .filter((n): n is string => typeof n === "string" && !!n)
                )
              ).sort((a, b) => a.localeCompare(b));
              setResults(uniq);
              setHighlighted(uniq.length ? 0 : -1);
            }
          });
      }, 300);
      return () => clearTimeout(timer);
    }, [query]);

    return (
      <div className={`relative ${width}`} ref={ref}>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (query.trim().length < 2) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlighted((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              if (open && highlighted >= 0 && highlighted < results.length) {
                const chosen = results[highlighted];
                onSelect(chosen);
                setQuery(chosen);
                setOpen(false);
                setHighlighted(-1);
              }
            }
          }}
          className="w-full p-2 pr-8 rounded-lg bg-gray-700 text-gray-100 border border-gray-600"
        />
        {(value || query) && (
          <button
            type="button"
            aria-label="Clear"
            className="absolute right-2 top-7 -translate-y-1/2 text-gray-300 hover:text-white"
            onClick={() => {
              onSelect("");
              setQuery("");
              setOpen(false);
              setHighlighted(-1);
            }}
          >
            ×
          </button>
        )}

        {open && query.trim().length >= 2 && (
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
            {loading ? (
              <div className="px-3 py-2 text-gray-400 text-sm">Loading...</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
            ) : (
              results.map((opt, idx) => (
                <div
                  key={opt}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlighted
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  } ${opt === value ? "bg-blue-700 text-white" : ""}`}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseLeave={() => setHighlighted(-1)}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
                    setHighlighted(-1);
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // جستجوی سروری GPU با debounce و ilike
  function AutocompleteServerSearchGPU({
    label,
    value,
    onSelect,
    placeholder = "",
    width = "w-56",
  }: {
    label: string;
    value: string;
    onSelect: (val: string) => void;
    placeholder?: string;
    width?: string;
  }) {
    const [query, setQuery] = useState(value ?? "");
    const [results, setResults] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState<number>(-1);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => setQuery(value ?? ""), [value]);

    useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
      const q = (query ?? "").trim();
      const timer = setTimeout(() => {
        if (q.length < 2) {
          setResults([]);
          return;
        }
        setLoading(true);
        supabase
          .from("gpus")
          .select("name")
          .ilike("name", `%${q}%`)
          .order("name", { ascending: true })
          .limit(50)
          .then(({ data, error }: { data: any; error: any }) => {
            setLoading(false);
            if (error) {
              console.error("GPU search error:", error);
              setResults([]);
            } else {
              const uniq: string[] = Array.from(
                new Set(
                  ((data ?? []) as { name: string }[])
                    .map((d) => d.name)
                    .filter((n): n is string => typeof n === "string" && !!n)
                )
              ).sort((a, b) => a.localeCompare(b));
              setResults(uniq);
              setHighlighted(uniq.length ? 0 : -1);
            }
          });
      }, 300);
      return () => clearTimeout(timer);
    }, [query]);

    return (
      <div className={`relative ${width}`} ref={ref}>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (query.trim().length < 2) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlighted((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              if (open && highlighted >= 0 && highlighted < results.length) {
                const chosen = results[highlighted];
                onSelect(chosen);
                setQuery(chosen);
                setOpen(false);
                setHighlighted(-1);
              }
            }
          }}
          className="w-full p-2 pr-8 rounded-lg bg-gray-700 text-gray-100 border border-gray-600"
        />
        {(value || query) && (
          <button
            type="button"
            aria-label="Clear"
            className="absolute right-2 top-7 -translate-y-1/2 text-gray-300 hover:text-white"
            onClick={() => {
              onSelect("");
              setQuery("");
              setOpen(false);
              setHighlighted(-1);
            }}
          >
            ×
          </button>
        )}

        {open && query.trim().length >= 2 && (
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
            {loading ? (
              <div className="px-3 py-2 text-gray-400 text-sm">Loading...</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
            ) : (
              results.map((opt, idx) => (
                <div
                  key={opt}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlighted
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  } ${opt === value ? "bg-blue-700 text-white" : ""}`}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseLeave={() => setHighlighted(-1)}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
                    setHighlighted(-1);
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // رندر اصلی صفحه
  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans flex flex-col items-center p-4">
      <div className="container max-w-6xl mx-auto space-y-8">
        <header className="py-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Software Specs Finder
          </h1>
        </header>

        {/* Search + Filters */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-6 w-full">
          {/* فیلترهای انتخاب برنامه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <Autocomplete
              label="Program"
              value={pendingSearch}
              options={programNameOptions}
              placeholder="Search program..."
              onSelect={(val) => setPendingSearch(val)}
              width="w-full"
            />
            <Autocomplete
              label="OS"
              value={pendingFilters.OS}
              options={OSOptions}
              placeholder="Search OS..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, OS: val }))}
              width="w-full"
            />
            <AutocompleteServerSearch
              label="CPU"
              value={pendingFilters.cpu}
              onSelect={(val) => setPendingFilters((f) => ({ ...f, cpu: val }))}
              placeholder="Search CPU..."
              width="w-full"
            />
            <AutocompleteServerSearchGPU
              label="GPU"
              value={pendingFilters.gpu}
              onSelect={(val) => setPendingFilters((f) => ({ ...f, gpu: val }))}
              placeholder="Search GPU..."
              width="w-full"
            />
            <Autocomplete
              label="RAM"
              value={pendingFilters.ram}
              options={ramOptions}
              placeholder="Search RAM..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, ram: val }))}
              width="w-full"
            />
          </div>

          {/* دکمه‌های اعمال و ریست */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setFilters(pendingFilters);
                setSearchTerm(pendingSearch);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-semibold shadow-md w-full sm:w-auto"
            >
              ✅ Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingFilters(defaultFilters);
                setPendingSearch("");
                setFilters(defaultFilters);
                setSearchTerm("");
                setSelectedProgramId(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-white font-semibold shadow-md w-full sm:w-auto"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Programs list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-lg text-blue-400">
              Loading...
            </div>
          ) : errorMsg ? (
            <div className="col-span-full text-center py-8 text-lg text-red-400">
              {errorMsg}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-lg text-gray-400">
              No programs found.
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white">
                  {program.name}{" "}
                  {program.version ? (
                    <span className="text-sm text-gray-400 font-normal">
                      ({program.version})
                    </span>
                  ) : null}
                </h3>
                <div className="mt-4 text-sm text-gray-300 space-y-2 leading-relaxed">
                  {/* OS readable display */}
                  {program.os && (
                    <div>
                      <span className="font-semibold text-blue-400">OS:</span>{" "}
                      <span className="text-white">
                        {(() => {
                          try {
                            const arr = JSON.parse(program.os!);
                            return Array.isArray(arr)
                              ? arr.join(" / ")
                              : program.os;
                          } catch {
                            return program.os;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  {program.cpu_min_name && (
                    <div>
                      <span className="font-semibold text-purple-400">
                        CPU min:
                      </span>{" "}
                      <span className="text-white">{program.cpu_min_name}</span>
                      {program.cpu_min_bench !== undefined && (
                        <span className="text-gray-400">
                          {" "}
                          (bench: {program.cpu_min_bench})
                        </span>
                      )}
                    </div>
                  )}
                  {program.gpu_min_name && (
                    <div>
                      <span className="font-semibold text-green-400">
                        GPU min:
                      </span>{" "}
                      <span className="text-white">{program.gpu_min_name}</span>
                      {program.gpu_min_bench !== undefined && (
                        <span className="text-gray-400">
                          {" "}
                          (bench: {program.gpu_min_bench})
                        </span>
                      )}
                    </div>
                  )}
                  {program.ram_min && (
                    <div>
                      <span className="font-semibold text-pink-400">
                        RAM min:
                      </span>{" "}
                      <span className="text-white">{program.ram_min}</span>
                      {program.ram_min_gb !== undefined && (
                        <span className="text-gray-400">
                          {" "}
                          ({program.ram_min_gb} GB)
                        </span>
                      )}
                    </div>
                  )}
                  {program.disk_space && (
                    <div>
                      <span className="font-semibold text-yellow-400">
                        Disk:
                      </span>{" "}
                      <span className="text-white">{program.disk_space}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} // ← پایان کامپوننت App
