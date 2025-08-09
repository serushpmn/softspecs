import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
// مسیرت را مطابق پروژه اصلاح کن

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "").toLowerCase(); // cpu|gpu|ram
  const q = searchParams.get("q") || "";
  const limit = Number(searchParams.get("limit") || "10");

  if (!["cpu", "gpu", "ram"].includes(type) || q.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const fn = type === "cpu" ? "cpu_suggest" : type === "gpu" ? "gpu_suggest" : "ram_suggest";
    const { data, error } = await supabase.rpc(fn, { p_q: q, p_limit: limit });
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
