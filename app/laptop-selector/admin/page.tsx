"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type SuggestItem = {
  name: string;
  benchmark?: number;
  id: number;
  similarity?: number;
  ram_gb?: number;
};

export default function AdminAddLaptopPage() {
  const [name, setName] = useState("");
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState(""); // مثل "16 GB" یا "RAM 16"
  const [ssd, setSsd] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");

  const [cpuSug, setCpuSug] = useState<SuggestItem[]>([]);
  const [gpuSug, setGpuSug] = useState<SuggestItem[]>([]);
  const [ramSug, setRamSug] = useState<SuggestItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchSuggest = async (
    type: "cpu" | "gpu" | "ram",
    q: string,
    setter: (x: SuggestItem[]) => void
  ) => {
    if (!q || q.trim().length < 2) return setter([]);
    try {
      const url = `/api/hw-suggest?type=${type}&q=${encodeURIComponent(
        q
      )}&limit=8`;
      const res = await fetch(url);
      const json = await res.json();
      setter(json.items || []);
    } catch {
      setter([]);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchSuggest("cpu", cpu, setCpuSug), 300);
    return () => clearTimeout(t);
  }, [cpu]);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggest("gpu", gpu, setGpuSug), 300);
    return () => clearTimeout(t);
  }, [gpu]);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggest("ram", ram, setRamSug), 300);
    return () => clearTimeout(t);
  }, [ram]);

  const ramGb = useMemo(() => {
    const n = ram.match(/\d+/)?.[0] ?? "";
    return n ? parseInt(n, 10) : 0;
  }, [ram]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setMsg(null);

    try {
      const { data, error } = await supabase.rpc(
        "insert_laptop_by_names_fuzzy",
        {
          p_name: name,
          p_cpu_name: cpu,
          p_ram_gb: ramGb,
          p_gpu_name: gpu,
          p_ssd_size_gb: typeof ssd === "number" ? ssd : null,
          p_image_url: image || null,
          p_price_eur: typeof price === "number" ? price : null,
          p_min_similarity: 0.3, // آستانه شباهت - در صورت نیاز کم/زیاد کن
        }
      );

      if (error) throw error;
      setMsg(`لپ‌تاپ ثبت شد (ID=${data}).`);
      setName("");
      setCpu("");
      setGpu("");
      setRam("");
      setSsd("");
      setPrice("");
      setImage("");
      setCpuSug([]);
      setGpuSug([]);
      setRamSug([]);
    } catch (e: any) {
      setErr(e?.message || "خطا در ذخیره.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">افزودن لپ‌تاپ</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-5 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm mb-1">نام لپ‌تاپ</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">CPU</label>
          <input
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {cpuSug.length > 0 && (
            <div className="border rounded mt-1 max-h-40 overflow-auto">
              {cpuSug.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCpu(s.name)}
                  className="w-full text-right px-3 py-1 hover:bg-gray-50"
                >
                  {s.name}{" "}
                  {typeof s.benchmark === "number"
                    ? `· bench ${s.benchmark}`
                    : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">GPU</label>
          <input
            value={gpu}
            onChange={(e) => setGpu(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {gpuSug.length > 0 && (
            <div className="border rounded mt-1 max-h-40 overflow-auto">
              {gpuSug.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setGpu(s.name)}
                  className="w-full text-right px-3 py-1 hover:bg-gray-50"
                >
                  {s.name}{" "}
                  {typeof s.benchmark === "number"
                    ? `· bench ${s.benchmark}`
                    : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">RAM (مثلاً "16 GB")</label>
          <input
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {ramSug.length > 0 && (
            <div className="border rounded mt-1 max-h-40 overflow-auto">
              {ramSug.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setRam(s.name)}
                  className="w-full text-right px-3 py-1 hover:bg-gray-50"
                >
                  {s.name}{" "}
                  {typeof s.ram_gb === "number" ? `· ${s.ram_gb} GB` : ""}
                </button>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            RAM تشخیص‌شده: {ramGb} GB
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">SSD (GB)</label>
            <input
              type="number"
              value={ssd}
              onChange={(e) =>
                setSsd(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">قیمت (€)</label>
            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Image URL (اختیاری)</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400"
          >
            {saving ? "در حال ذخیره…" : "ثبت لپ‌تاپ"}
          </button>
          {msg && <span className="text-green-700">{msg}</span>}
          {err && <span className="text-red-700">{err}</span>}
        </div>
      </form>
    </div>
  );
}
