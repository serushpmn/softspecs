"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Types
interface Program {
  id: number;
  name: string;
  version: string;
  OS: string[] | string;
  CPU_min: string[] | string;
  CPU_rec: string[] | string;
  Ram_min: string | number;
  Ram_rec: string | number;
  GPU_min: string;
  GPU_rec: string;
  Disk_space: string;
  is_free: boolean;
  is_open_source: boolean;
  featured: boolean;
  category?: string[];
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
        { data: cpus, error: e1 },
        { data: gpus, error: e2 },
        { data: rams, error: e3 },
      ] = await Promise.all([
        supabase
          .from("os")
          .select("id,name")
          .order("name", { ascending: true }), // ← نام جدول OS خودت را بگذار
        supabase
          .from("cpus")
          .select("id,name,benchmark,rank")
          .order("rank", { ascending: true }),
        supabase
          .from("gpus")
          .select("id,name,benchmark,rank")
          .order("rank", { ascending: true }),
        supabase
          .from("rams")
          .select("id,name")
          .order("name", { ascending: true }),
      ]);
      if (e0) console.error("os error:", e0);
      if (e1) console.error("cpus error:", e1);
      if (e2) console.error("gpus error:", e2);
      if (e3) console.error("rams error:", e3);
      setOsList(oses || []);
      setCpuList(cpus || []);
      setGpuList(gpus || []);
      setRamList(rams || []);
    };
    loadLookups();
  }, []);

  useEffect(() => {
    async function fetchPrograms() {
      const { data, error } = await supabase.from("programs").select("*");
      if (error) {
        console.error("Supabase error:", error.message);
      } else {
        setPrograms(data as Program[]);
        console.log("Fetched programs:", data); // این خط را اضافه کنید
      }
    }
    fetchPrograms();
  }, []);

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
              .filter(Boolean)
              .map(cleanOS)
          )
        )),
  ];

  // گزینه‌های فیلتر بر اساس جداول lookup (مرتب‌سازی عددی RAM)
  const cpuOptions = ["", ...cpuList.map((c) => c.name)];
  const gpuOptions = ["", ...gpuList.map((g) => g.name)];
  const ramOptions = [
    "",
    ...Array.from(
      new Set(
        [
          // از جدول rams
          ...ramList.map((r) => parseRamNumber(r.name)),
          // از داده‌های برنامه‌ها (در صورت نبود در جدول)
          ...programs.map((p) => parseRamNumber(p.Ram_min)),
          ...programs.map((p) => parseRamNumber(p.Ram_rec)),
        ].filter((n) => Number.isFinite(n)) as number[]
      )
    )
      .sort((a, b) => a - b)
      .map((n) => String(n)),
  ];

  // Filter the programs list based on search and filters
  const sortedPrograms = [...programs].sort((a, b) => {
    // ابتدا featured=true، سپس بقیه
    if (a.featured === b.featured) return 0;
    return a.featured ? -1 : 1;
  });

  const filteredPrograms = sortedPrograms.filter((program) => {
    // جستجو بر اساس نام
    const matchesSearch =
      !searchTerm ||
      program.name.toLowerCase().includes(searchTerm.toLowerCase());

    // فیلتر سیستم عامل
    const matchesOS =
      !filters.OS ||
      (Array.isArray(program.OS)
        ? program.OS.some((os) =>
            os.toLowerCase().includes(filters.OS.toLowerCase())
          )
        : program.OS &&
          program.OS.toLowerCase().includes(filters.OS.toLowerCase()));

    // فیلتر CPU
    const matchesCPU =
      !filters.cpu ||
      (Array.isArray(program.CPU_min)
        ? program.CPU_min.some((v) =>
            v?.toLowerCase().includes(filters.cpu.toLowerCase())
          ) ||
          (Array.isArray(program.CPU_rec)
            ? program.CPU_rec.some((v) =>
                v?.toLowerCase().includes(filters.cpu.toLowerCase())
              )
            : (program.CPU_rec as unknown as string)
                ?.toLowerCase?.()
                .includes(filters.cpu.toLowerCase()))
        : (program.CPU_min as unknown as string)
            ?.toLowerCase?.()
            .includes(filters.cpu.toLowerCase()) ||
          (program.CPU_rec as unknown as string)
            ?.toLowerCase?.()
            .includes(filters.cpu.toLowerCase()));

    const matchesGPU =
      !filters.gpu ||
      program.GPU_min?.toLowerCase().includes(filters.gpu.toLowerCase()) ||
      program.GPU_rec?.toLowerCase().includes(filters.gpu.toLowerCase());

    const parseRam = (s: string) => {
      const m = String(s).match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    };
    const selRam = parseRam(filters.ram);
    const progMinRam = parseRam(program.Ram_min as unknown as string);
    const progRecRam = parseRam(program.Ram_rec as unknown as string);
    const matchesRAM =
      !filters.ram ||
      selRam === 0 ||
      progMinRam === selRam ||
      progRecRam === selRam;

    return (
      matchesSearch &&
      matchesOS &&
      matchesCPU &&
      matchesGPU &&
      matchesRAM /* + سایر فیلترها */
    );
  });

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
    const [query, setQuery] = useState(value || "");
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => setQuery(value || ""), [value]);

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const filtered = options
      // حذف نکن! باید گزینه خالی ("") باقی بماند
      .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));

    // همیشه گزینه خالی را اول لیست بیاور
    const list = Array.from(new Set(["", ...filtered]));

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
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            className="w-full pr-8 p-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(value || query) && (
            <button
              type="button"
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => {
                onSelect("");
                setQuery("");
                setOpen(false);
              }}
            >
              ×
            </button>
          )}
        </div>
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
            {list.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
            ) : (
              list.map((opt) => (
                <div
                  key={opt || "__ANY__"}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-600 hover:text-white ${
                    opt === value ? "bg-blue-700 text-white" : ""
                  }`}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
                  }}
                >
                  {labelOf(opt)}
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
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <input
            type="text"
            value={pendingSearch}
            placeholder="Search program..."
            onChange={(e) => setPendingSearch(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          />
          <div className="flex flex-wrap gap-4">
            <Autocomplete
              label="OS"
              value={pendingFilters.OS}
              options={OSOptions.filter(Boolean)}
              placeholder="Search OS..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, OS: val }))}
            />
            <Autocomplete
              label="CPU"
              value={pendingFilters.cpu}
              options={cpuOptions.filter(Boolean)}
              placeholder="Search CPU..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, cpu: val }))}
            />
            <Autocomplete
              label="RAM"
              value={pendingFilters.ram}
              options={ramOptions.filter(Boolean)}
              placeholder="Search RAM..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, ram: val }))}
              width="w-40"
            />
            <Autocomplete
              label="GPU"
              value={pendingFilters.gpu}
              options={gpuOptions.filter(Boolean)}
              placeholder="Search GPU..."
              onSelect={(val) => setPendingFilters((f) => ({ ...f, gpu: val }))}
            />
          </div>

          {/* دکمه‌های اعمال و ریست */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFilters(pendingFilters);
                setSearchTerm(pendingSearch);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
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
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Programs list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700"
            >
              <h3 className="text-lg font-semibold">
                {program.name}{" "}
                <span className="text-gray-400">({program.version})</span>
              </h3>
              <div className="mt-3 text-sm space-y-2">
                <div>
                  OS:{" "}
                  {Array.isArray(program.OS)
                    ? program.OS.join(" / ")
                    : program.OS}
                </div>
                <div>
                  CPU min:{" "}
                  {Array.isArray(program.CPU_min)
                    ? program.CPU_min.join(" / ")
                    : program.CPU_min}
                </div>
                <div>
                  CPU rec:{" "}
                  {Array.isArray(program.CPU_rec)
                    ? program.CPU_rec.join(" / ")
                    : program.CPU_rec}
                </div>
                <div>
                  RAM: {program.Ram_min} / {program.Ram_rec}
                </div>
                <div>
                  GPU: {program.GPU_min} / {program.GPU_rec}
                </div>
                <div>Disk: {program.Disk_space}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} // ← پایان کامپوننت App
