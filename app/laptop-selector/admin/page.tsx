"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// حذف تبدیل ارز: مقدار واردشده به عنوان تومان مستقیماً در price_eur ذخیره می‌شود

type Cpu = { id: number; name: string };
type Gpu = { id: number; name: string };
type Ram = { id: number; name: string };
type Brand = { id: number; name: string };

type LaptopBase = {
  id: number;
  name: string;
  image_url: string | null;
  purchase_url: string | null;
  price_eur: number | null;
  ssd_size_gb: number | null;
  cpu_id: number | null;
  gpu_id: number | null;
};

type LaptopWithRamGb = LaptopBase & { ram_gb: number | null };

type LaptopWithRamId = LaptopBase & { ram_id: number | null };

type SchemaFlags = {
  hasRamGb: boolean;
  hasRamId: boolean;
  hasBrandId: boolean;
};

export default function AdminAddLaptopPage() {
  // Simple auth
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const expectedUser = process.env.NEXT_PUBLIC_ADMIN_USER || "admin";
  const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "admin";

  // Lookups and caches
  const [cpus, setCpus] = useState<Cpu[]>([]); // optional prefetch
  const [gpus, setGpus] = useState<Gpu[]>([]); // optional prefetch
  const [rams, setRams] = useState<Ram[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const cpuNameById = useRef<Record<number, string>>({});
  const gpuNameById = useRef<Record<number, string>>({});
  const brandNameById = useRef<Record<number, string>>({});

  // Data
  const [rows, setRows] = useState<Array<any>>([]);
  const [schema, setSchema] = useState<{ hasRamGb: boolean; hasRamId: boolean; hasBrandId: boolean }>(
    { hasRamGb: true, hasRamId: false, hasBrandId: false }
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Draft edits
  const [draft, setDraft] = useState<Record<number, any>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Add-new draft
  const [newRow, setNewRow] = useState<any>({});
  const [adding, setAdding] = useState(false);

  // Searchable select component با بستن خودکار سایر بازشوها و کلیک خارج
  const SearchSelect = ({
    value,
    options,
    onSelect,
    placeholder = "جستجو...",
    className = "w-64",
  }: {
    value: string;
    options: string[];
    onSelect: (v: string) => void;
    placeholder?: string;
    className?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState(value || "");
    const idRef = useRef(Math.random().toString(36).slice(2));
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const onGlobalOpen = (e: any) => {
        if (e?.detail !== idRef.current) setOpen(false);
      };
      const onDocDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
      };
      window.addEventListener("searchselect-open", onGlobalOpen as any);
      document.addEventListener("mousedown", onDocDown);
      return () => {
        window.removeEventListener("searchselect-open", onGlobalOpen as any);
        document.removeEventListener("mousedown", onDocDown);
      };
    }, []);

    const filtered = useMemo(
      () => options.filter((o) => o.toLowerCase().includes((q || "").toLowerCase())).slice(0, 50),
      [q, options]
    );

    return (
      <div className={`relative ${className}`} ref={rootRef}>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            window.dispatchEvent(new CustomEvent("searchselect-open", { detail: idRef.current }));
          }}
          onFocus={() => {
            setOpen(true);
            window.dispatchEvent(new CustomEvent("searchselect-open", { detail: idRef.current }));
          }}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2"
        />
        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-72 overflow-auto bg-white border rounded shadow">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">موردی یافت نشد</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="w-full text-right px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    onSelect(opt);
                    setQ(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const ensureAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === expectedUser && pass === expectedPass) {
      setAuthed(true);
      setErr(null);
    } else {
      setErr("نام کاربری یا رمز عبور اشتباه است");
    }
  };

  const loadLookups = async () => {
    const [c, g, r, b] = await Promise.all([
      supabase.from("cpus").select("id,name").order("name"),
      supabase.from("gpus").select("id,name").order("name"),
      supabase.from("rams").select("id,name").order("name"),
      supabase.from("brands").select("id,name").order("name").throwOnError(),
    ]).catch(async () => {
      const [c2, g2, r2] = await Promise.all([
        supabase.from("cpus").select("id,name").order("name"),
        supabase.from("gpus").select("id,name").order("name"),
        supabase.from("rams").select("id,name").order("name"),
      ]);
      return [c2, g2, r2, { data: [], error: null } as any];
    });
    setCpus((c.data as any) || []);
    setGpus((g.data as any) || []);
    setRams((r.data as any) || []);
    setBrands((b.data as any) || []);
    ((c.data as any) || []).forEach((x: Cpu) => (cpuNameById.current[x.id] = x.name));
    ((g.data as any) || []).forEach((x: Gpu) => (gpuNameById.current[x.id] = x.name));
    ((b.data as any) || []).forEach((x: Brand) => (brandNameById.current[x.id] = x.name));

    // Load SSD options from laptops existing sizes
    const s = await supabase
      .from("laptops")
      .select("ssd_size_gb")
      .not("ssd_size_gb", "is", null)
      .order("ssd_size_gb", { ascending: true })
      .limit(1000);
    const sizes = Array.from(
      new Set(
        (((s.data as Array<{ ssd_size_gb: number }> ) || [])
          .map((x) => Number(x.ssd_size_gb))
          .filter((n: number) => Number.isFinite(n))) as number[]
      )
    ).sort((a: number, b: number) => a - b);
    setSsdOptions(sizes as number[]);
  };

  const trySelect = async (selectStr: string) => {
    const res = await supabase.from("laptops").select(selectStr).order("id", { ascending: false });
    return res;
  };

  // Compute numeric RAM options from rams
  const ramOptions = useMemo(() => {
    const nums = Array.from(
      new Set(
        (rams || [])
          .map((r) => parseInt(String(r.name).match(/\d+/)?.[0] || "0", 10))
          .filter((n) => Number.isFinite(n) && n > 0)
      )
    ).sort((a, b) => a - b);
    return nums;
  }, [rams]);

  // SSD options (GB) gathered from DB
  const [ssdOptions, setSsdOptions] = useState<number[]>([]);

  // Draft helpers
  const setDraftField = (id: number, key: string, value: any) => {
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), [key]: value } }));
  };
  const getValue = (row: any, key: string) => {
    const d = draft[row.id] || {};
    return d[key] ?? row[key] ?? "";
  };

  // Helper: map RAM GB -> ram_id
  const getRamIdFromGb = (gb: number | null | undefined) => {
    if (!schema.hasRamId || !gb) return null;
    const match = rams.find((r) => parseInt(String(r.name).match(/\d+/)?.[0] || "0", 10) === gb);
    return match?.id ?? null;
  };

  // Helper: parse SSD text like "512GB", "1tb"
  const parseSsd = (val?: string | null) => {
    if (!val) return null;
    const v = String(val).trim().toLowerCase();
    const num = parseFloat(v.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(num)) return null;
    if (v.includes("tb")) return Math.round(num * 1024);
    return Math.round(num);
  };

  // Search by laptop name
  const [nameQuery, setNameQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      loadLaptops();
    }, 300);
    return () => clearTimeout(t);
  }, [nameQuery]);

  // load laptops with optional name filter
  const loadLaptops = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);

    const tries = [
      { select: `id,name,image_url,purchase_url,price_eur,ram_gb,ssd_size_gb,cpu_id,gpu_id,brand_id`, flags: { hasRamGb: true, hasRamId: false, hasBrandId: true } },
      { select: `id,name,image_url,purchase_url,price_eur,ram_id,ssd_size_gb,cpu_id,gpu_id,brand_id`, flags: { hasRamGb: false, hasRamId: true, hasBrandId: true } },
      { select: `id,name,image_url,purchase_url,price_eur,ssd_size_gb,cpu_id,gpu_id,brand_id`, flags: { hasRamGb: false, hasRamId: false, hasBrandId: true } },
      { select: `id,name,image_url,purchase_url,price_eur,ram_gb,ssd_size_gb,cpu_id,gpu_id`, flags: { hasRamGb: true, hasRamId: false, hasBrandId: false } },
      { select: `id,name,image_url,purchase_url,price_eur,ram_id,ssd_size_gb,cpu_id,gpu_id`, flags: { hasRamGb: false, hasRamId: true, hasBrandId: false } },
      { select: `id,name,image_url,purchase_url,price_eur,ssd_size_gb,cpu_id,gpu_id`, flags: { hasRamGb: false, hasRamId: false, hasBrandId: false } },
    ];

    let okData: any[] | null = null;
    let okFlags: any = tries[0].flags;

    for (const t of tries) {
      const res = await supabase
        .from("laptops")
        .select(t.select)
        .ilike("name", nameQuery ? `%${nameQuery}%` : "%")
        .order("id", { ascending: false });
      if (!res.error) {
        okData = (res.data as any) || [];
        okFlags = t.flags;
        break;
      }
    }

    if (!okData) {
      setErr("خواندن جدول laptops با خطا مواجه شد. ستون‌ها را بررسی کنید.");
      setLoading(false);
      return;
    }

    setSchema(okFlags);
    setRows(okData as any);
    setLoading(false);
  };

  const saveRow = async (row: any) => {
    const d = draft[row.id] || {};

    let cpu_id = d.cpu_id ?? row.cpu_id;
    if (typeof d.cpu_name === "string") cpu_id = cpus.find((x) => x.name === d.cpu_name)?.id ?? cpu_id;
    if (typeof d.cpu_pick_id === "number") cpu_id = d.cpu_pick_id;
    let gpu_id = d.gpu_id ?? row.gpu_id;
    if (typeof d.gpu_name === "string") gpu_id = gpus.find((x) => x.name === d.gpu_name)?.id ?? gpu_id;
    if (typeof d.gpu_pick_id === "number") gpu_id = d.gpu_pick_id;
    let brand_id = schema.hasBrandId ? (d.brand_id ?? row.brand_id ?? null) : null;
    if (typeof d.brand_pick_id === "number") brand_id = d.brand_pick_id;

    const update: any = {
      name: d.name ?? row.name,
      image_url: d.image_url ?? row.image_url,
      purchase_url: d.purchase_url ?? row.purchase_url,
      price_eur: d.price ?? row.price_eur,
      ssd_size_gb: typeof d.ssd_text === "string" ? parseSsd(d.ssd_text) : d.ssd_size_gb ?? row.ssd_size_gb,
      cpu_id,
      gpu_id,
    };
    if (schema.hasBrandId) update.brand_id = brand_id;
    if (schema.hasRamGb && typeof d.ram_gb_num === "number") update.ram_gb = d.ram_gb_num;
    if (schema.hasRamId && typeof d.ram_gb_num === "number") update.ram_id = getRamIdFromGb(d.ram_gb_num);

    const { error } = await supabase.from("laptops").update(update).eq("id", row.id);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg(`ذخیره شد: #${row.id}`);
    setDraft((d0) => ({ ...d0, [row.id]: {} }));
    await loadLaptops();
  };

  const insertRow = async () => {
    setAdding(true);
    setErr(null);
    setMsg(null);
    const payload: any = {
      name: newRow.name ?? null,
      image_url: newRow.image_url ?? null,
      purchase_url: newRow.purchase_url ?? null,
      price_eur: newRow.price ?? null,
      ssd_size_gb: typeof newRow.ssd_text === "string" ? parseSsd(newRow.ssd_text) : newRow.ssd_size_gb ?? null,
      cpu_id: newRow.cpu_pick_id ?? (typeof newRow.cpu_name === "string" ? cpus.find((c) => c.name === newRow.cpu_name)?.id ?? null : newRow.cpu_id ?? null),
      gpu_id: newRow.gpu_pick_id ?? (typeof newRow.gpu_name === "string" ? gpus.find((g) => g.name === newRow.gpu_name)?.id ?? null : newRow.gpu_id ?? null),
    };
    if (schema.hasRamGb && typeof newRow.ram_gb_num === "number") payload.ram_gb = newRow.ram_gb_num;
    if (schema.hasRamId && typeof newRow.ram_gb_num === "number") payload.ram_id = getRamIdFromGb(newRow.ram_gb_num);
    if (schema.hasBrandId) payload.brand_id = newRow.brand_pick_id ?? newRow.brand_id ?? null;

    const { data, error } = await supabase.from("laptops").insert(payload).select("id").single();
    if (error) {
      setErr(error.message);
    } else {
      setMsg(`افزوده شد: #${data?.id}`);
      setNewRow({});
      loadLaptops();
    }
    setAdding(false);
  };

  const deleteRow = async (id: number) => {
    const { error } = await supabase.from("laptops").delete().eq("id", id);
    if (error) setErr(error.message);
    else {
      setMsg(`حذف شد: #${id}`);
      loadLaptops();
    }
  };

  // Bulk update
  const [bulk, setBulk] = useState<any>({});
  const applyBulk = async () => {
    if (selectedIds.length === 0) return;
    const payload: any = {};
    if (typeof bulk.cpu_pick_id === "number") payload.cpu_id = bulk.cpu_pick_id;
    if (typeof bulk.gpu_pick_id === "number") payload.gpu_id = bulk.gpu_pick_id;
    if (schema.hasRamGb && typeof bulk.ram_gb_num === "number") payload.ram_gb = bulk.ram_gb_num;
    if (schema.hasRamId && typeof bulk.ram_gb_num === "number") payload.ram_id = getRamIdFromGb(bulk.ram_gb_num);
    if (typeof bulk.price === "number") payload.price_eur = bulk.price;
    if (typeof bulk.ssd_text === "string") payload.ssd_size_gb = parseSsd(bulk.ssd_text);
    if (schema.hasBrandId && typeof bulk.brand_pick_id === "number") payload.brand_id = bulk.brand_pick_id;

    const { error } = await supabase.from("laptops").update(payload).in("id", selectedIds);
    if (error) setErr(error.message);
    else {
      setMsg(`به‌روزرسانی ${selectedIds.length} ردیف انجام شد.`);
      setSelectedIds([]);
      setBulk({});
      loadLaptops();
    }
  };

  // Remote search helpers
  const searchCpu = async (q: string) => {
    if (!q || q.trim().length < 3) return [] as Cpu[];
    const { data } = await supabase.from("cpus").select("id,name").ilike("name", `%${q}%`).order("name").limit(50);
    (data || []).forEach((x) => (cpuNameById.current[x.id] = x.name));
    return (data as any) || [];
  };
  const searchGpu = async (q: string) => {
    if (!q || q.trim().length < 3) return [] as Gpu[];
    const { data } = await supabase.from("gpus").select("id,name").ilike("name", `%${q}%`).order("name").limit(50);
    (data || []).forEach((x) => (gpuNameById.current[x.id] = x.name));
    return (data as any) || [];
  };
  const searchBrand = async (q: string) => {
    if (!schema.hasBrandId || !q || q.trim().length < 3) return [] as Brand[];
    const { data, error } = await supabase.from("brands").select("id,name").ilike("name", `%${q}%`).order("name").limit(50);
    if (error) return [] as Brand[];
    (data || []).forEach((x) => (brandNameById.current[x.id] = x.name));
    return (data as any) || [];
  };

  const RemoteSearchSelect = ({
    valueLabel,
    onPick,
    search,
    placeholder,
    className = "w-64",
  }: {
    valueLabel: string;
    onPick: (id: number, name: string) => void;
    search: (q: string) => Promise<{ id: number; name: string }[]>;
    placeholder: string;
    className?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [opts, setOpts] = useState<{ id: number; name: string }[]>([]);
    const rootRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const t = setTimeout(async () => {
        const res = await search(q);
        setOpts(res);
      }, 300);
      return () => clearTimeout(t);
    }, [q]);
    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);
    return (
      <div className={`relative ${className}`} ref={rootRef}>
        <input
          value={q || valueLabel}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={(e) => {
            // وقتی فوکوس می‌گیریم اگر مقدار همان valueLabel است، برای جستجو خالی‌اش کنیم
            if (!q) {
              e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
            }
            setOpen(true);
          }}
          placeholder={q ? placeholder : ""}
          className="w-full border rounded px-3 py-2"
        />
        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-72 overflow-auto bg-white border rounded shadow">
            {opts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">حداقل ۳ حرف تایپ کنید</div>
            ) : (
              opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="w-full text-right px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    onPick(o.id, o.name);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  {o.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (!authed) {
    return (
      <div className="container mx-auto max-w-sm p-6" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">ورود مدیر</h1>
        <form onSubmit={ensureAuth} className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
          <div>
            <label className="block text-sm mb-1">نام کاربری</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">رمز عبور</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold">ورود</button>
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">مدیریت لپ‌تاپ‌ها</h1>
        <div className="text-sm">{loading ? "در حال بارگذاری…" : `${rows.length} مورد`}</div>
      </div>

      {msg && <div className="mb-3 text-green-700">{msg}</div>}
      {err && <div className="mb-3 text-red-700">{err}</div>}

      {/* Bulk panel */}
      <div className="mb-4 bg-white border rounded-xl p-4">
        <div className="font-bold mb-3">به‌روزرسانی انبوه روی ردیف‌های انتخاب‌شده ({selectedIds.length})</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <RemoteSearchSelect valueLabel={bulk.cpu_name || ""} onPick={(id, name) => setBulk((s: any) => ({ ...s, cpu_name: name, cpu_pick_id: id }))} search={searchCpu} placeholder="CPU" className="w-64" />
          <RemoteSearchSelect valueLabel={bulk.gpu_name || ""} onPick={(id, name) => setBulk((s: any) => ({ ...s, gpu_name: name, gpu_pick_id: id }))} search={searchGpu} placeholder="GPU" className="w-64" />
          {schema.hasRamGb ? (
            <SearchSelect value={bulk.ram_gb || ""} onSelect={(v) => setBulk((s: any) => ({ ...s, ram_gb: Number(v) }))} options={ramOptions.map((n) => String(n))} placeholder="RAM (GB)" className="w-40" />
          ) : schema.hasRamId ? (
            <SearchSelect value={bulk.ram_id || ""} onSelect={(v) => setBulk((s: any) => ({ ...s, ram_id: Number(v) }))} options={rams.map((r) => String(r.id))} placeholder="RAM (ID)" className="w-40" />
          ) : null}
          {schema.hasBrandId && (
            <RemoteSearchSelect valueLabel={bulk.brand_name || ""} onPick={(id, name) => setBulk((s: any) => ({ ...s, brand_name: name, brand_pick_id: id }))} search={searchBrand} placeholder="Brand" className="w-64" />
          )}
          <input placeholder="قیمت (تومان)" type="number" value={bulk.price || ""} onChange={(e) => setBulk((s: any) => ({ ...s, price: e.target.value ? Number(e.target.value) : undefined }))} className="border rounded px-2 py-2 w-40" />
          <SearchSelect value={bulk.ssd_size_gb || ""} onSelect={(v) => setBulk((s: any) => ({ ...s, ssd_size_gb: Number(v) }))} options={ssdOptions.map((n) => String(n))} placeholder="SSD (GB)" className="w-48" />
        </div>
        <div className="mt-3 text-left">
          <button onClick={applyBulk} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">اعمال انبوه</button>
        </div>
      </div>

      {/* Add new */}
      <div className="mb-4 bg-white border rounded-xl p-4">
        <div className="font-bold mb-3">افزودن لپ‌تاپ جدید</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input placeholder="نام" value={newRow.name || ""} onChange={(e) => setNewRow((s: any) => ({ ...s, name: e.target.value }))} className="border rounded px-2 py-2 w-64" />
          <RemoteSearchSelect valueLabel={newRow.cpu_name || ""} onPick={(id, name) => setNewRow((s: any) => ({ ...s, cpu_name: name, cpu_pick_id: id }))} search={searchCpu} placeholder="CPU" className="w-64" />
          <RemoteSearchSelect valueLabel={newRow.gpu_name || ""} onPick={(id, name) => setNewRow((s: any) => ({ ...s, gpu_name: name, gpu_pick_id: id }))} search={searchGpu} placeholder="GPU" className="w-64" />
          <SearchSelect value={newRow.ram_gb_num || ""} onSelect={(v) => setNewRow((s: any) => ({ ...s, ram_gb_num: Number(v) }))} options={ramOptions.map((n) => String(n))} placeholder="RAM (GB)" className="w-40" />
          {schema.hasBrandId && (
            <RemoteSearchSelect valueLabel={newRow.brand_name || ""} onPick={(id, name) => setNewRow((s: any) => ({ ...s, brand_name: name, brand_pick_id: id }))} search={searchBrand} placeholder="Brand" className="w-64" />
          )}
          <SearchSelect value={newRow.ssd_size_gb || ""} onSelect={(v) => setNewRow((s: any) => ({ ...s, ssd_size_gb: Number(v) }))} options={ssdOptions.map((n) => String(n))} placeholder="SSD (GB)" className="w-48" />
          <input placeholder="قیمت (تومان)" type="number" value={newRow.price || ""} onChange={(e) => setNewRow((s: any) => ({ ...s, price: e.target.value ? Number(e.target.value) : null }))} className="border rounded px-2 py-2 w-48" />
          <input placeholder="Image URL" value={newRow.image_url || ""} onChange={(e) => setNewRow((s: any) => ({ ...s, image_url: e.target.value }))} className="border rounded px-2 py-2 w-64" />
          <input placeholder="Purchase URL" value={newRow.purchase_url || ""} onChange={(e) => setNewRow((s: any) => ({ ...s, purchase_url: e.target.value }))} className="border rounded px-2 py-2 w-64" />
        </div>
        <div className="mt-3 text-left">
          <button onClick={insertRow} disabled={adding} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">{adding ? "در حال افزودن…" : "افزودن"}</button>
        </div>
      </div>

      {/* Search by name */}
      <div className="mb-3">
        <input value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} placeholder="جستجوی نام لپ‌تاپ..." className="border rounded px-3 py-2 w-64" />
      </div>
      <div className="relative overflow-x-auto overflow-y-visible rounded-xl border bg-white">
        <table className="min-w-full text-sm relative">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? rows.map((r: any) => r.id) : [])} /></th>
              <th className="p-3 text-right">#</th>
              <th className="p-3 text-right">نام</th>
              <th className="p-3 text-right">CPU</th>
              <th className="p-3 text-right">GPU</th>
              {schema.hasBrandId && <th className="p-3 text-right">Brand</th>}
              <th className="p-3 text-right">RAM</th>
              <th className="p-3 text-right">SSD (GB)</th>
              <th className="p-3 text-right">قیمت (تومان)</th>
              <th className="p-3 text-right">تصویر</th>
              <th className="p-3 text-right">لینک خرید</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r: any) => (
              <tr key={r.id} className="align-top">
                <td className="p-3"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...new Set([...ids, r.id])] : ids.filter((x) => x !== r.id))} /></td>
                <td className="p-3 text-gray-500">{r.id}</td>
                <td className="p-3">
                  <input defaultValue={r.name} onChange={(e) => setDraftField(r.id, "name", e.target.value)} className="w-56 border rounded px-2 py-1" />
                </td>
                <td className="p-3">
                  <RemoteSearchSelect valueLabel={getValue(r, "cpu_name") || cpuNameById.current[r.cpu_id] || ""} onPick={(id, name) => { setDraftField(r.id, "cpu_name", name); setDraftField(r.id, "cpu_pick_id", id); }} search={searchCpu} placeholder="CPU" className="w-64" />
                </td>
                <td className="p-3">
                  <RemoteSearchSelect valueLabel={getValue(r, "gpu_name") || gpuNameById.current[r.gpu_id] || ""} onPick={(id, name) => { setDraftField(r.id, "gpu_name", name); setDraftField(r.id, "gpu_pick_id", id); }} search={searchGpu} placeholder="GPU" className="w-64" />
                </td>
                {schema.hasBrandId && (
                  <td className="p-3">
                    <RemoteSearchSelect valueLabel={brandNameById.current[r.brand_id] || ""} onPick={(id, name) => setDraftField(r.id, "brand_pick_id", id)} search={searchBrand} placeholder="Brand" className="w-64" />
                  </td>
                )}
                <td className="p-3">
                  <SearchSelect value={schema.hasRamGb ? String(r.ram_gb ?? "") : String(r.ram_id ?? "")} onSelect={(v) => setDraftField(r.id, schema.hasRamGb ? "ram_gb" : "ram_id", Number(v))} options={(schema.hasRamGb ? ramOptions : rams.map((rm) => rm.id)).map((x: any) => String(x))} placeholder="RAM" className="w-40" />
                </td>
                <td className="p-3">
                  <SearchSelect value={String(r.ssd_size_gb ?? "")} onSelect={(v) => setDraftField(r.id, "ssd_size_gb", Number(v))} options={ssdOptions.map((n) => String(n))} placeholder="SSD (GB)" className="w-40" />
                </td>
                <td className="p-3">
                  <input type="number" defaultValue={r.price_eur ?? undefined} onChange={(e) => setDraftField(r.id, "price", e.target.value ? Number(e.target.value) : null)} className="w-40 border rounded px-2 py-1" />
                </td>
                <td className="p-3">
                  <input defaultValue={r.image_url ?? ""} onChange={(e) => setDraftField(r.id, "image_url", e.target.value)} className="w-64 border rounded px-2 py-1" />
                </td>
                <td className="p-3">
                  <input defaultValue={r.purchase_url ?? ""} onChange={(e) => setDraftField(r.id, "purchase_url", e.target.value)} className="w-64 border rounded px-2 py-1" />
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => saveRow(r)} className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">ذخیره</button>
                  <button onClick={() => deleteRow(r.id)} className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
