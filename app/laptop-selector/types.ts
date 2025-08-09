// تایپ مشترک برنامه‌ها برای همهٔ کامپوننت‌ها
export type ProgramReq = {
  id: number;
  name: string;
  category?: string | string[] | null;

  cpu_min_score?: number | null;
  cpu_rec_score?: number | null;

  ram_min_gb?: number | null;
  ram_rec_gb?: number | null;

  gpu_min_score?: number | null;
  gpu_rec_score?: number | null;
};
