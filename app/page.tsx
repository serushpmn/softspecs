"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Define TypeScript interfaces for better type safety
interface Program {
  id: number;
  name: string;
  version: string;
  OS: string[]; // آرایه
  CPU_min: string[] | string; // ← allow string or array
  CPU_rec: string[] | string; // ← allow string or array
  Ram_min: string | number; // ← allow number from DB
  Ram_rec: string | number; // ← allow number from DB
  GPU_min: string;
  GPU_rec: string;
  Disk_space: string; // ← fix casing to match DB
  is_free: boolean;
  is_open_source: boolean;
  featured: boolean; // اضافه شد
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

// تعریف مدل‌های جدید
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

// Main App Component
export default function App() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    OS: "",
    cpu: "",
    ram: "",
    gpu: "",
    diskType: "",
    isFree: false,
    isOpenSource: false,
  });
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

  // Load lookup tables (cpus/gpus/rams) for select options
  useEffect(() => {
    const loadLookups = async () => {
      const [
        { data: cpus, error: e1 },
        { data: gpus, error: e2 },
        { data: rams, error: e3 },
      ] = await Promise.all([
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
      if (e1) console.error("cpus error:", e1);
      if (e2) console.error("gpus error:", e2);
      if (e3) console.error("rams error:", e3);
      setCpuList(cpus || []);
      setGpuList(gpus || []);
      setRamList(rams || []);
    };
    loadLookups();
  }, []);

  useEffect(() => {
    async function fetchPrograms() {
      const { data, error } = await supabase.from("programs").select("*");
      if (!error && data) {
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

  // استخراج گزینه‌های یکتا برای فیلترهای آرایه‌ای با حذف "or newer"
  const OSOptions = [
    "",
    ...Array.from(
      new Set(
        programs
          .flatMap((p) => (Array.isArray(p.OS) ? p.OS : [p.OS]))
          .filter(Boolean)
          .map(cleanOS)
      )
    ),
  ];

  // گزینه‌های فیلتر بر اساس جداول lookup
  const cpuOptions = ["", ...cpuList.map((c) => c.name)];
  const gpuOptions = ["", ...gpuList.map((g) => g.name)];
  const ramOptions = ["", ...ramList.map((r) => r.name)];

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

    const minRam = parseRam(program.Ram_min);

    // For simplicity, we'll assume CPU cores are a good proxy for performance.
    // Extract number from CPU string like "Intel Core i5" -> 5, "1.6 GHz Dual Core" -> 2
    const cpuMatch = program.CPU_min.match(/(\d+)/);
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
      .filter(Boolean)
      .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));

    return (
      <div className={`relative ${width}`} ref={ref}>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-600 hover:text-white ${
                    opt === value ? "bg-blue-700 text-white" : ""
                  }`}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
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
  } // پایان تعریف کامپوننت Autocomplete

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans flex flex-col items-center p-4">
      <div className="container max-w-6xl mx-auto space-y-8">
        <header className="py-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Software Specs Finder
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Find system requirements for your favorite software.
          </p>
        </header>

        {/* Search and Filters */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <input
            type="text"
            placeholder="Search software..."
            className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-4 justify-start">
            {/* OS Search */}
            <Autocomplete
              label="OS"
              value={filters.OS}
              options={OSOptions.filter(Boolean)}
              placeholder="Search OS..."
              onSelect={(val) => setFilters((f) => ({ ...f, OS: val }))}
              width="w-56"
            />
            {/* CPU Search */}
            <Autocomplete
              label="CPU"
              value={filters.cpu}
              options={cpuOptions.filter(Boolean)}
              placeholder="Search CPU..."
              onSelect={(val) => setFilters((f) => ({ ...f, cpu: val }))}
              width="w-56"
            />
            {/* RAM Search */}
            <Autocomplete
              label="RAM"
              value={filters.ram}
              options={ramOptions.filter(Boolean)}
              placeholder="Search RAM..."
              onSelect={(val) => setFilters((f) => ({ ...f, ram: val }))}
              width="w-44"
            />
            {/* GPU Search */}
            <Autocomplete
              label="GPU"
              value={filters.gpu}
              options={gpuOptions.filter(Boolean)}
              placeholder="Search GPU..."
              onSelect={(val) => setFilters((f) => ({ ...f, gpu: val }))}
              width="w-56"
            />
          </div>
        </div>

        {/* Programs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`bg-gray-800 p-6 rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedProgramId === program.id
                  ? "border-blue-500 scale-105"
                  : "border-gray-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedProgramId(program.id)}
            >
              <h3 className="text-xl font-bold text-blue-400">
                {program.name}{" "}
                <span className="font-normal text-gray-400 text-lg">
                  ({program.version})
                </span>
              </h3>

              <p className="text-md text-gray-300 mb-4">
                {Array.isArray(program.OS)
                  ? program.OS.join(" / ")
                  : program.OS || "No OS specified"}
              </p>

              <div className="space-y-3 mt-4">
                <p>
                  <span className="font-semibold text-gray-300">CPU:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    min:
                    <span className="text-gray-300 font-bold ml-2">
                      {Array.isArray(program.CPU_min)
                        ? program.CPU_min.length > 0
                          ? program.CPU_min.join(" / ")
                          : "Intel or AMD processor"
                        : program.CPU_min || "Intel or AMD processor"}
                    </span>
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Rec:
                    <span className="text-gray-300 font-bold ml-2">
                      {Array.isArray(program.CPU_rec)
                        ? program.CPU_rec.length > 0
                          ? program.CPU_rec.join(" / ")
                          : "Intel or AMD processor with 64-bit support"
                        : program.CPU_rec ||
                          "Intel or AMD processor with 64-bit support"}
                    </span>
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-gray-300">RAM:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    min:
                    <span className="text-gray-300 font-bold ml-2">
                      {program.Ram_min}
                    </span>
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Rec:
                    <span className="text-gray-300 font-bold ml-2">
                      {program.Ram_rec}
                    </span>
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-gray-300">GPU:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    min:
                    <span className="text-gray-300 font-bold ml-2">
                      {program.GPU_min}
                    </span>
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Rec:
                    <span className="text-gray-300 font-bold ml-2">
                      {program.GPU_rec}
                    </span>
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-gray-300">
                    Disk Space:
                  </span>
                  <br />
                  <span className="text-gray-400 font-semibold ml-4">
                    {program.Disk_space}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {program.is_free && (
                  <span className="bg-green-600 text-white px-3 py-1 text-xs rounded-full font-medium">
                    Free
                  </span>
                )}
                {program.is_open_source && (
                  <span className="bg-purple-600 text-white px-3 py-1 text-xs rounded-full font-medium">
                    Open Source
                  </span>
                )}
                {!program.is_free && !program.is_open_source && (
                  <span className="bg-orange-600 text-white px-3 py-1 text-xs rounded-full font-medium">
                    Paid
                  </span>
                )}
                {program.featured && (
                  <div className="flex justify-end mt-2 ml-auto">
                    <span title="Featured" className="text-yellow-400 text-2xl">
                      ★
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
