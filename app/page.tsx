"use client";

import { useState } from "react";

// Define TypeScript interfaces for better type safety
interface Program {
  id: number;
  name: string;
  version: string;
  os: string[];
  cpu_min: string;
  cpu_rec: string;
  ram_min: string;
  ram_rec: string;
  gpu_min: string;
  gpu_rec: string;
  disk_space: string;
  disk_type: string;
  is_free: boolean;
  is_open_source: boolean;
}

interface Filters {
  os: string;
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

// This is a simulated database. The app now uses this data directly.
const mockPrograms: Program[] = [
  {
    id: 1,
    name: "Photoshop",
    version: "2025",
    os: ["Windows 10", "11", "macOS Monterey"],
    cpu_min: "Intel Core i3",
    cpu_rec: "Intel Core i5",
    ram_min: "4 GB",
    ram_rec: "8 GB",
    gpu_min: "NVIDIA GTX 1050",
    gpu_rec: "NVIDIA GTX 1060",
    disk_space: "5 GB",
    disk_type: "SSD",
    is_free: false,
    is_open_source: false,
  },
  {
    id: 2,
    name: "Blender",
    version: "3.6",
    os: ["Windows 10", "11", "macOS Monterey", "Linux"],
    cpu_min: "Intel Core i3",
    cpu_rec: "Intel Core i7",
    ram_min: "8 GB",
    ram_rec: "16 GB",
    gpu_min: "NVIDIA GTX 760",
    gpu_rec: "NVIDIA RTX 2060",
    disk_space: "500 MB",
    disk_type: "HDD",
    is_free: true,
    is_open_source: true,
  },
  {
    id: 3,
    name: "VS Code",
    version: "1.80",
    os: ["Windows 10", "11", "macOS Monterey", "Linux"],
    cpu_min: "1.6 GHz Dual Core",
    cpu_rec: "2.0 GHz Quad Core",
    ram_min: "2 GB",
    ram_rec: "4 GB",
    gpu_min: "Intel HD",
    gpu_rec: "Intel UHD",
    disk_space: "200 MB",
    disk_type: "SSD",
    is_free: true,
    is_open_source: true,
  },
  {
    id: 4,
    name: "Unity",
    version: "2023.2",
    os: ["Windows 10", "11", "macOS Monterey"],
    cpu_min: "Intel Core i5",
    cpu_rec: "Intel Core i7",
    ram_min: "8 GB",
    ram_rec: "16 GB",
    gpu_min: "NVIDIA GeForce GT 740",
    gpu_rec: "NVIDIA GeForce GTX 1060",
    disk_space: "10 GB",
    disk_type: "SSD",
    is_free: true,
    is_open_source: false,
  },
  {
    id: 5,
    name: "AutoCAD",
    version: "2024",
    os: ["Windows 10", "11", "macOS Monterey"],
    cpu_min: "Intel Core i3",
    cpu_rec: "Intel Core i7",
    ram_min: "8 GB",
    ram_rec: "16 GB",
    gpu_min: "1 GB GPU with 29 GB/s Bandwidth",
    gpu_rec: "8 GB GPU with 106 GB/s Bandwidth",
    disk_space: "10 GB",
    disk_type: "SSD",
    is_free: false,
    is_open_source: false,
  },
];

// Main App Component
export default function App() {
  // Use mock data directly instead of fetching from an external API
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    os: "",
    cpu: "",
    ram: "",
    gpu: "",
    diskType: "",
    isFree: false,
    isOpenSource: false,
  });
  const [userSpecs, setUserSpecs] = useState<UserSpecs>({ ram: "", cpuCores: "" });
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  // A helper function to parse ram string like "8 GB" to integer 8
  const parseRam = (ramStr: string): number => {
    const match = ramStr.match(/(\d+)\s*GB/);
    return match ? parseInt(match[1]) : 0;
  };

  // Define dropdown options
  const osOptions = [
    "",
    "Windows 11",
    "Windows 10",
    "Windows 8",
    "Windows 7",
    "macOS",
    "Linux",
  ];
  const cpuOptions = [
    "",
    "Pentium",
    "Intel Core i3",
    "Intel Core i5",
    "Intel Core i7",
    "Intel Core i9",
    "AMD...",
    "M1",
    "M2",
  ];
  const ramOptions = [
    "",
    ...Array.from({ length: 32 }, (_, i) => `${(i + 1) * 2} GB`),
  ];
  const gpuOptions = [
    "",
    "Intel HD",
    "Intel UHD",
    "NVIDIA GTX 1050",
    "NVIDIA GTX 1060",
    "NVIDIA 5090",
  ];
  const diskTypeOptions = ["", "HDD", "SSD"];

  // Filter the programs list based on search and filters
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesOS =
      !filters.os ||
      program.os.some((os) =>
        os.toLowerCase().includes(filters.os.toLowerCase())
      );
    const matchesCPU =
      !filters.cpu ||
      program.cpu_min.toLowerCase().includes(filters.cpu.toLowerCase());
    const matchesGPU =
      !filters.gpu ||
      program.gpu_min.toLowerCase().includes(filters.gpu.toLowerCase());
    const matchesDiskType =
      !filters.diskType ||
      (program.disk_type &&
        program.disk_type.toLowerCase() === filters.diskType.toLowerCase());
    const matchesRAM =
      !filters.ram || parseRam(program.ram_min) <= parseRam(filters.ram);
    const matchesTags =
      (!filters.isFree || program.is_free) &&
      (!filters.isOpenSource || program.is_open_source);

    return (
      matchesSearch &&
      matchesOS &&
      matchesCPU &&
      matchesGPU &&
      matchesDiskType &&
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

    const minRam = parseRam(program.ram_min);
    
    // For simplicity, we'll assume CPU cores are a good proxy for performance.
    // Extract number from CPU string like "Intel Core i5" -> 5, "1.6 GHz Dual Core" -> 2
    const cpuMatch = program.cpu_min.match(/(\d+)/);
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

        {/* User's System Info Input */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-2 text-blue-300">
            Your System Specifications
          </h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="number"
              name="ram"
              placeholder="RAM (GB)"
              value={userSpecs.ram}
              onChange={handleUserSpecChange}
              className="w-40 p-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="cpuCores"
              placeholder="CPU Cores"
              value={userSpecs.cpuCores}
              onChange={handleUserSpecChange}
              className="w-40 p-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedProgram && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2">
              <span className="text-sm font-semibold">
                Compatibility with {selectedProgram.name}:
              </span>
              {checkCompatibility(selectedProgram) ? (
                <span className="text-green-400 font-bold">✅ Compatible</span>
              ) : (
                <span className="text-red-400 font-bold">❌ Incompatible</span>
              )}
            </div>
          )}
        </div>

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
              name="os"
              onChange={handleFilterChange}
              value={filters.os}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {osOptions.map((os) => (
                <option key={os} value={os}>
                  {os || "Select Operating System"}
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

            {/* Disk Type Filter */}
            <select
              name="diskType"
              onChange={handleFilterChange}
              value={filters.diskType}
              className="p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {diskTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type || "Select Disk Type"}
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
              <p className="text-sm text-gray-500 mb-4">
                {program.os.join(" / ")}
              </p>

              <div className="space-y-3 mt-4">
                <p>
                  <span className="font-semibold text-gray-300">CPU:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Minimum: {program.cpu_min}
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Recommended: {program.cpu_rec}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-300">RAM:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Minimum: {program.ram_min}
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Recommended: {program.ram_rec}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-300">GPU:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Minimum: {program.gpu_min}
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    Recommended: {program.gpu_rec}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-300">Disk Type:</span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    {program.disk_type}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-300">
                    Disk Space:
                  </span>
                  <br />
                  <span className="text-gray-400 ml-4">
                    {program.disk_space}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
