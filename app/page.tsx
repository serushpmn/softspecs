"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Define TypeScript interfaces for better type safety
interface Program {
  id: number;
  name: string;
  version: string;
  OS: string[]; // آرایه
  CPU_min: string[]; // آرایه
  CPU_rec: string[];
  Ram_min: string;
  Ram_Rec: string;
  GPU_min: string;
  GPU_rec: string;
  Disk_Space: string;
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

  const cpuOptions = [
    "",
    ...Array.from(
      new Set(
        programs
          .flatMap((p) => (Array.isArray(p.CPU_min) ? p.CPU_min : [p.CPU_min]))
          .filter(Boolean)
      )
    ),
  ];

  const ramOptions = [
    "",
    ...Array.from(new Set(programs.map((p) => p.Ram_min).filter(Boolean))),
  ];

  const gpuOptions = [
    "",
    ...Array.from(new Set(programs.map((p) => p.GPU_min).filter(Boolean))),
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
        ? program.CPU_min.some((cpu) =>
            cpu.toLowerCase().includes(filters.cpu.toLowerCase())
          )
        : program.CPU_min &&
          program.CPU_min.toLowerCase().includes(filters.cpu.toLowerCase()));

    // فیلتر GPU
    const matchesGPU =
      !filters.gpu ||
      (program.GPU_min &&
        program.GPU_min.toLowerCase().includes(filters.gpu.toLowerCase()));

    // فیلتر RAM
    const matchesRAM =
      !filters.ram || parseRam(program.Ram_min) <= parseRam(filters.ram);

    // فیلتر رایگان و متن‌باز
    const matchesTags =
      (!filters.isFree || program.is_free) &&
      (!filters.isOpenSource || program.is_open_source);

    return (
      matchesSearch &&
      matchesOS &&
      matchesCPU &&
      matchesGPU &&
      matchesRAM &&
      matchesTags
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
            {/* OS Filter */}
            <select
              name="OS"
              onChange={handleFilterChange}
              value={filters.OS}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OSOptions.map((OS) => (
                <option key={OS} value={OS}>
                  {OS || "Select Operating System"}
                </option>
              ))}
            </select>

            {/* CPU Filter */}
            <select
              name="cpu"
              onChange={handleFilterChange}
              value={filters.cpu}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cpuOptions.map((cpu) => (
                <option key={cpu} value={cpu}>
                  {cpu || "Select CPU"}
                </option>
              ))}
            </select>

            {/* RAM Filter */}
            <select
              name="ram"
              onChange={handleFilterChange}
              value={filters.ram}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ramOptions.map((ram) => (
                <option key={ram} value={ram}>
                  {ram || "Select RAM"}
                </option>
              ))}
            </select>

            {/* GPU Filter */}
            <select
              name="gpu"
              onChange={handleFilterChange}
              value={filters.gpu}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {gpuOptions.map((gpu) => (
                <option key={gpu} value={gpu}>
                  {gpu || "Select GPU"}
                </option>
              ))}
            </select>

            {/* Tags as Buttons */}
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.isFree
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white"
              }`}
              onClick={() =>
                setFilters((prev) => ({ ...prev, isFree: !prev.isFree }))
              }
            >
              Free
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.isOpenSource
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-purple-500 hover:text-white"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  isOpenSource: !prev.isOpenSource,
                }))
              }
            >
              Open Source
            </button>
          </div>
        </div>

        {/* Programs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`bg-gray-800 p-6 rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-200
                ${
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
                        : program.CPU_min
                        ? program.CPU_min
                        : "Intel or AMD processor"}
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
                        : program.CPU_rec
                        ? program.CPU_rec
                        : "Intel or AMD processor with 64-bit support"}
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
                      {program.Ram_Rec}
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
                    {program.Disk_Space}
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
              </div>

              {/* ستاره برای featured */}
              {program.featured && (
                <div className="flex justify-end mt-2">
                  <span title="Featured" className="text-yellow-400 text-xl">
                    ★
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
