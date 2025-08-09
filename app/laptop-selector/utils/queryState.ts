// ساده و خوانا نگه‌داشتیم. آرایه‌ها را با comma جدا می‌کنیم.
export type UrlState = {
  step?: number;                 // 1..4
  cats?: string[];               // دسته‌ها
  weights?: Record<string, number>; // map دسته → وزن
  progs?: number[];              // ids برنامه‌ها
  minPrice?: number | null;
  maxPrice?: number | null;
  minSSD?: number | null;
  sort?: "score_desc" | "price_asc" | "price_desc" | "ram_desc";
};

export function parseQuery(qs: URLSearchParams): UrlState {
  const step = Number(qs.get("s") || "1");
  const cats = (qs.get("c") || "").split(",").filter(Boolean);
  const progs = (qs.get("p") || "")
    .split(",")
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((x) => !Number.isNaN(x));

  // weights به صورت w=programming:40,graphics:30,...
  const wStr = qs.get("w") || "";
  const weights: Record<string, number> = {};
  wStr.split(",")
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v] = pair.split(":");
      const n = Number(v);
      if (k && !Number.isNaN(n)) weights[k] = n;
    });

  const minPrice = readNumOrNull(qs.get("min"));
  const maxPrice = readNumOrNull(qs.get("max"));
  const minSSD = readNumOrNull(qs.get("ssd"));
  const sort = (qs.get("sort") as UrlState["sort"]) || "score_desc";

  return {
    step: within(step, 1, 4) ? step : 1,
    cats,
    weights,
    progs,
    minPrice,
    maxPrice,
    minSSD,
    sort,
  };
}

export function toQuery(state: UrlState): string {
  const qs = new URLSearchParams();

  if (state.step && state.step !== 1) qs.set("s", String(state.step));
  if (state.cats && state.cats.length) qs.set("c", state.cats.join(","));
  if (state.progs && state.progs.length) qs.set("p", state.progs.join(","));

  const wEntries = Object.entries(state.weights || {}).filter(([, v]) => typeof v === "number");
  if (wEntries.length) {
    qs.set(
      "w",
      wEntries
        .map(([k, v]) => `${k}:${Math.round(v)}`)
        .join(",")
    );
  }

  if (state.minPrice != null) qs.set("min", String(state.minPrice));
  if (state.maxPrice != null) qs.set("max", String(state.maxPrice));
  if (state.minSSD != null) qs.set("ssd", String(state.minSSD));
  if (state.sort && state.sort !== "score_desc") qs.set("sort", state.sort);

  return qs.toString();
}

function readNumOrNull(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function within(n: number, a: number, b: number) {
  return n >= a && n <= b;
}
