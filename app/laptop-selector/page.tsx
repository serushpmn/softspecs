"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; // در صورت تفاوت مسیر، اصلاح کن

// کامپوننت‌ها
import Step1CategorySelect, {
  type Category,
} from "./components/Step1CategorySelect";
import Step2Weighting from "./components/Step2Weighting";
import Step3SoftwareSelection from "./components/Step3SoftwareSelection";
import type { ProgramReq } from "./types";

import Step4Results, {
  type LaptopRow,
  type ResultItem,
} from "./components/Step4Results";
import AutocompletePrograms from "./components/AutocompletePrograms";
import ProgressBar from "./components/ProgressBar";
import SelectionChips from "./components/SelectionChips";
import FiltersBar from "./components/FiltersBar";

// URL sync
import { useUrlState } from "./utils/useUrlSync";
import type { UrlState } from "./utils/queryState";

// دسته‌ها (ثابت)
const CATEGORIES: Category[] = [
  {
    id: "general",
    name: "کاربری عمومی و روزمره",
    icon: "🏠",
    subitems: [
      "وب‌گردی و شبکه‌های اجتماعی",
      "تماشای فیلم و سریال",
      "کارهای سبک اداری و خانگی",
      "مدیریت ایمیل و پیام‌رسان‌ها",
    ],
  },
  {
    id: "office",
    name: "اداری و تجاری",
    icon: "🏢",
    subitems: [
      "پردازش متن، اکسل، پاورپوینت",
      "مدیریت پروژه و اسناد",
      "نرم‌افزارهای ERP و CRM",
      "جلسات و کنفرانس آنلاین (Zoom, Teams)",
    ],
  },
  {
    id: "education",
    name: "تحصیلی و آموزشی",
    icon: "🎓",
    subitems: [
      "تحقیق و نوشتن مقالات",
      "نرم‌افزارهای آموزشی و شبیه‌سازی",
      "آموزش آنلاین و کلاس‌های مجازی",
      "تمرین زبان و نرم‌افزارهای یادگیری",
    ],
  },
  {
    id: "programming",
    name: "برنامه‌نویسی و توسعه نرم‌افزار",
    icon: "💻",
    subitems: [
      "توسعه وب (Front-end, Back-end)",
      "توسعه اپلیکیشن موبایل",
      "برنامه‌نویسی دسکتاپ",
      "توسعه بازی‌های کامپیوتری",
      "هوش مصنوعی و یادگیری ماشین",
    ],
  },
  {
    id: "graphics",
    name: "طراحی گرافیک",
    icon: "🎨",
    subitems: [
      "طراحی دو بعدی (Photoshop, Illustrator)",
      "طراحی سه بعدی (Blender, Maya, 3ds Max)",
      "طراحی رابط کاربری و تجربه کاربری (UI/UX)",
    ],
  },
  {
    id: "video",
    name: "تدوین و تولید ویدئو",
    icon: "🎬",
    subitems: [
      "ویرایش ویدئو (Premiere, DaVinci Resolve, Final Cut)",
      "جلوه‌های ویژه (After Effects, Nuke)",
      "استریم و ضبط ویدئو زنده",
    ],
  },
  {
    id: "music",
    name: "تولید موسیقی و صدا",
    icon: "🎵",
    subitems: [
      "آهنگسازی دیجیتال (FL Studio, Ableton, Logic Pro)",
      "ضبط و ویرایش صدا (Audition, Pro Tools)",
      "میکس و مسترینگ",
    ],
  },
  {
    id: "engineering",
    name: "مهندسی و فنی",
    icon: "🛠️",
    subitems: [
      "طراحی CAD و مدل‌سازی صنعتی (AutoCAD, SolidWorks)",
      "شبیه‌سازی و تحلیل مهندسی (MATLAB, ANSYS)",
      "نرم‌افزارهای معماری (Revit, SketchUp)",
    ],
  },
  {
    id: "data",
    name: "علم داده و تحقیق",
    icon: "📊",
    subitems: [
      "تحلیل داده (Excel پیشرفته، Power BI، Tableau)",
      "تحلیل آماری (SPSS, R, SAS)",
      "یادگیری ماشین و AI (TensorFlow, PyTorch)",
    ],
  },
  {
    id: "gaming",
    name: "گیمینگ",
    icon: "🎮",
    subitems: [
      "بازی‌های AAA گرافیک سنگین",
      "بازی‌های آنلاین رقابتی (Esports)",
      "شبیه‌سازها (Flight Simulator, Racing)",
    ],
  },
  {
    id: "specialized",
    name: "کارهای تخصصی دیگر",
    icon: "🧪",
    subitems: [
      "امنیت و تست نفوذ (Kali Linux, Burp Suite)",
      "بلاکچین و رمزنگاری",
      "طراحی مدار و الکترونیک (Proteus, Altium Designer)",
      "توسعه IoT و رباتیک",
    ],
  },
];

type SortKey = "score_desc" | "price_asc" | "price_desc" | "ram_desc";

export default function LaptopSelectorPage() {
  type CategoryId = Category["id"];

  // URL state
  const { current: urlState, replace: setUrl } = useUrlState();

  // مراحل
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // داده‌ها
  const [programs, setPrograms] = useState<ProgramReq[]>([]);
  const [laptops, setLaptops] = useState<LaptopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // استیت انتخاب
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(
    []
  );
  const [weights, setWeights] = useState<Record<CategoryId, number>>({} as any);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);

  // فیلترها
  const [filters, setFilters] = useState<{
    minPrice?: number | null;
    maxPrice?: number | null;
    minSSD?: number | null;
    sort: SortKey;
  }>({ sort: "score_desc" });

  // مقایسه (تا ۳ لپ‌تاپ)
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // 1) Load data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [{ data: pData, error: pErr }, { data: lData, error: lErr }] =
          await Promise.all([
            supabase.from("v_programs_requirements").select("*"),
            supabase.from("v_laptops_expanded").select("*"),
          ]);
        if (pErr) throw pErr;
        if (lErr) throw lErr;
        setPrograms((pData || []) as ProgramReq[]);
        setLaptops((lData || []) as LaptopRow[]);
      } catch (e: any) {
        setError(e?.message ?? "خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Hydrate from URL once
  useEffect(() => {
    const s = (urlState.step as 1 | 2 | 3 | 4) || 1;
    setStep(s);

    const cats = (urlState.cats || []).filter((x) =>
      (CATEGORIES.map((c) => c.id) as CategoryId[]).includes(x as CategoryId)
    ) as CategoryId[];
    setSelectedCategories(cats);

    // weights از URL و نرمال‌سازی
    const w: Record<CategoryId, number> = {} as any;
    cats.forEach((c) => {
      const val = urlState.weights?.[c] ?? 100 / (cats.length || 1);
      w[c] = val;
    });
    const sum = cats.reduce((a, c) => a + (w[c] || 0), 0) || 1;
    cats.forEach((c) => (w[c] = ((w[c] || 0) / sum) * 100));
    setWeights(w);

    setSelectedProgramIds(urlState.progs || []);
    setFilters({
      minPrice: urlState.minPrice ?? null,
      maxPrice: urlState.maxPrice ?? null,
      minSSD: urlState.minSSD ?? null,
      sort: (urlState.sort as SortKey) || "score_desc",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    urlState.step,
    urlState.cats?.join(","),
    urlState.progs?.join(","),
    urlState.sort,
    urlState.minPrice,
    urlState.maxPrice,
    urlState.minSSD,
  ]);

  // 3) Push state to URL whenever key states change
  useEffect(() => {
    const next: UrlState = {
      step,
      cats: selectedCategories,
      weights: selectedCategories.reduce((acc, c) => {
        acc[c] = Math.round((weights[c] || 0) * 100) / 100;
        return acc;
      }, {} as Record<string, number>),
      progs: selectedProgramIds,
      minPrice: filters.minPrice ?? null,
      maxPrice: filters.maxPrice ?? null,
      minSSD: filters.minSSD ?? null,
      sort: filters.sort,
    };
    setUrl(next);
  }, [step, selectedCategories, weights, selectedProgramIds, filters, setUrl]);

  // دسته ← انتخاب/حذف + توزیع وزن‌ها
  const toggleCategory = (id: CategoryId) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0) {
        const eq = 100 / next.length;
        const w: Record<CategoryId, number> = { ...weights } as any;
        (CATEGORIES.map((c) => c.id) as CategoryId[]).forEach((c) => {
          if (next.includes(c)) w[c] = w[c] ?? eq;
          else delete w[c];
        });
        const sum = next.reduce((s, c) => s + (w[c] || 0), 0) || 1;
        next.forEach((c) => (w[c] = ((w[c] || 0) / (sum || 1)) * 100));
        setWeights(w);
      } else {
        setWeights({} as any);
      }
      return next;
    });
  };

  // تغییر وزن یک دسته و بازتوزیع سایرین
  const updateWeight = (id: CategoryId, value: number) => {
    const others = selectedCategories.filter((c) => c !== id);
    const otherTotal = Math.max(0, 100 - value);
    const currentOtherSum = others.reduce((s, c) => s + (weights[c] || 0), 0);
    const next: Record<CategoryId, number> = { ...weights } as any;
    next[id] = value;
    if (others.length === 0) {
      setWeights(next);
      return;
    }
    if (currentOtherSum === 0) {
      const each = otherTotal / others.length;
      others.forEach((c) => (next[c] = each));
    } else {
      others.forEach((c) => {
        const prop = (weights[c] || 0) / currentOtherSum;
        next[c] = otherTotal * prop;
      });
    }
    setWeights(next);
  };

  // فیلتر برنامه‌ها بر اساس دسته‌های انتخاب‌شده
  const programsBySelectedCats = useMemo(() => {
    if (selectedCategories.length === 0) return programs;
    const belongs = (p: ProgramReq, cat: CategoryId) => {
      if (!p.category) return false;
      if (Array.isArray(p.category))
        return p.category.some((x) => String(x).toLowerCase().includes(cat));
      return String(p.category).toLowerCase().includes(cat);
    };
    return programs.filter((p) =>
      selectedCategories.some((c) => belongs(p, c))
    );
  }, [programs, selectedCategories]);

  const selectedPrograms = useMemo(
    () => programs.filter((p) => selectedProgramIds.includes(p.id)),
    [programs, selectedProgramIds]
  );

  // نیازمندی کل
  const overallRequirements = useMemo(() => {
    const base = { cpu: 0, ram: 0, gpu: 0 };
    if (selectedPrograms.length > 0) {
      selectedPrograms.forEach((p) => {
        base.cpu = Math.max(base.cpu, p.cpu_rec_score ?? 0);
        base.ram = Math.max(base.ram, p.ram_rec_gb ?? 0);
        base.gpu = Math.max(base.gpu, p.gpu_rec_score ?? 0);
      });
      return base;
    }
    let out = { cpu: 0, ram: 0, gpu: 0 };
    if (selectedCategories.length === 0) return out;
    selectedCategories.forEach((cat) => {
      const subset = programsBySelectedCats;
      if (subset.length === 0) return;
      const avg = subset.reduce(
        (acc, p) => {
          acc.cpu += p.cpu_rec_score ?? 0;
          acc.ram += p.ram_rec_gb ?? 0;
          acc.gpu += p.gpu_rec_score ?? 0;
          return acc;
        },
        { cpu: 0, ram: 0, gpu: 0 }
      );
      const n = subset.length || 1;
      const w = (weights[cat] || 0) / 100;
      out.cpu += (avg.cpu / n) * w;
      out.ram += (avg.ram / n) * w;
      out.gpu += (avg.gpu / n) * w;
    });
    return out;
  }, [selectedPrograms, selectedCategories, programsBySelectedCats, weights]);

  // نتایج خام
  const results: ResultItem[] = useMemo(() => {
    let cpuW = 0.4,
      ramW = 0.4,
      gpuW = 0.2;
    if (
      selectedCategories.includes("gaming") ||
      selectedCategories.includes("graphics")
    ) {
      cpuW = 0.3;
      ramW = 0.3;
      gpuW = 0.4;
    }
    const req = overallRequirements;
    const norm = (val: number, reqVal: number) =>
      (val / (reqVal > 0 ? reqVal : 1)) * 100;

    return laptops
      .map((l) => {
        const cpuScore = norm(l.cpu_score || 0, req.cpu);
        const ramScore = norm(l.ram_gb || 0, req.ram);
        const gpuScore = norm(l.gpu_score || 0, req.gpu);
        let score = cpuScore * cpuW + ramScore * ramW + gpuScore * gpuW;

        let analysis: ResultItem["analysis"] = [];
        if (selectedPrograms.length > 0) {
          analysis = selectedPrograms.map((p) => {
            const meetMin =
              (l.cpu_score ?? 0) >= (p.cpu_min_score ?? 0) &&
              (l.ram_gb ?? 0) >= (p.ram_min_gb ?? 0) &&
              (l.gpu_score ?? 0) >= (p.gpu_min_score ?? 0);
            const meetRec =
              (l.cpu_score ?? 0) >= (p.cpu_rec_score ?? 0) &&
              (l.ram_gb ?? 0) >= (p.ram_rec_gb ?? 0) &&
              (l.gpu_score ?? 0) >= (p.gpu_rec_score ?? 0);
            if (meetRec)
              return { name: p.name, status: "عالی", color: "green" as const };
            if (meetMin)
              return {
                name: p.name,
                status: "قابل قبول",
                color: "yellow" as const,
              };
            return { name: p.name, status: "ضعیف", color: "red" as const };
          });
          if (analysis.some((a) => a.color === "red")) score *= 0.5;
        }

        return { laptop: l, score: Math.min(100, Math.round(score)), analysis };
      })
      .sort((a, b) => b.score - a.score);
  }, [laptops, overallRequirements, selectedPrograms, selectedCategories]);

  // نتایج فیلتر/مرتب‌شده
  const filteredResults = useMemo(() => {
    let arr = [...results];
    if (filters.minPrice != null)
      arr = arr.filter(
        (r) => (r.laptop.price_eur ?? Infinity) >= (filters.minPrice as number)
      );
    if (filters.maxPrice != null)
      arr = arr.filter(
        (r) => (r.laptop.price_eur ?? -Infinity) <= (filters.maxPrice as number)
      );
    if (filters.minSSD != null)
      arr = arr.filter(
        (r) => (r.laptop.ssd_size_gb ?? 0) >= (filters.minSSD as number)
      );

    switch (filters.sort) {
      case "price_asc":
        arr.sort(
          (a, b) =>
            (a.laptop.price_eur ?? Infinity) - (b.laptop.price_eur ?? Infinity)
        );
        break;
      case "price_desc":
        arr.sort(
          (a, b) =>
            (b.laptop.price_eur ?? -Infinity) -
            (a.laptop.price_eur ?? -Infinity)
        );
        break;
      case "ram_desc":
        arr.sort((a, b) => (b.laptop.ram_gb ?? 0) - (a.laptop.ram_gb ?? 0));
        break;
      default:
        arr.sort((a, b) => b.score - a.score);
    }
    return arr;
  }, [results, filters]);

  // هندلرها
  const addProgramIfNotSelected = (p: ProgramReq) => {
    setSelectedProgramIds((prev) =>
      prev.includes(p.id) ? prev : [...prev, p.id]
    );
  };
  const goTo = (s: 1 | 2 | 3 | 4) => setStep(s);
  const toggleProgram = (id: number) =>
    setSelectedProgramIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const removeCategory = (id: CategoryId) => {
    setSelectedCategories((prev) => prev.filter((x) => x !== id));
    setWeights((w) => {
      const next = { ...(w as Record<CategoryId, number>) };
      delete next[id];
      const keys = Object.keys(next) as CategoryId[];
      const sum = keys.reduce((s, k) => s + (next[k] || 0), 0) || 1;
      keys.forEach((k) => (next[k] = ((next[k] || 0) / sum) * 100));
      return next as any;
    });
  };
  const removeProgram = (id: number) =>
    setSelectedProgramIds((prev) => prev.filter((x) => x !== id));

  // مقایسه
  const toggleCompare = (id: number) =>
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  const clearCompare = () => setCompareIds([]);

  // Loading/Error
  if (loading) return <div className="p-6 text-center">در حال بارگذاری…</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          خطا در دریافت داده‌ها: {error}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-3 md:p-6 max-w-6xl" dir="rtl">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          لپ‌تاپ‌گزین
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          هوشمندانه انتخاب کن، حرفه‌ای کار کن.
        </p>
      </header>

      <ProgressBar step={step} />

      <SelectionChips
        categories={CATEGORIES}
        selectedCategories={selectedCategories}
        selectedPrograms={programs
          .filter((p) => selectedProgramIds.includes(p.id))
          .map((p) => ({ id: p.id, name: p.name }))}
        onRemoveCategory={removeCategory}
        onRemoveProgram={removeProgram}
      />

      {step === 1 && (
        <Step1CategorySelect
          categories={CATEGORIES}
          selected={selectedCategories}
          onToggle={toggleCategory}
          onNext={() => goTo(2)}
        />
      )}

      {step === 2 && (
        <Step2Weighting
          categories={CATEGORIES}
          selected={selectedCategories}
          weights={weights}
          onWeightChange={updateWeight}
          onPrev={() => goTo(1)}
          onNext={() => goTo(3)}
        />
      )}

      {step === 3 && (
        <>
          <div className="mb-4">
            <AutocompletePrograms onPick={addProgramIfNotSelected} />
            <p className="text-xs text-gray-500 mt-2 text-center">
              اسم برنامه را تایپ کنید و از نتایج انتخاب کنید تا سریع به لیست
              اضافه شود.
            </p>
          </div>

          <Step3SoftwareSelection
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            programs={programsBySelectedCats}
            selectedProgramIds={selectedProgramIds}
            onToggleProgram={toggleProgram}
            onPrev={() => goTo(2)}
            onNext={() => goTo(4)}
          />
        </>
      )}

      {step === 4 && (
        <>
          <FiltersBar
            minPrice={filters.minPrice ?? null}
            maxPrice={filters.maxPrice ?? null}
            minSSD={filters.minSSD ?? null}
            sort={filters.sort}
            onChange={setFilters}
          />
          <Step4Results
            results={filteredResults}
            onRestart={() => {
              setStep(1);
              setSelectedCategories([]);
              setSelectedProgramIds([]);
              setWeights({} as any);
              setFilters({ sort: "score_desc" });
              setCompareIds([]);
            }}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
            onClearCompare={clearCompare}
          />
        </>
      )}
    </div>
  );
}
