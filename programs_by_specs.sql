-- programs_by_specs.sql
-- تابع فیلتر برنامه‌ها بر اساس سخت‌افزار کاربر
create or replace function programs_by_specs(
    user_cpu_id  int    default null,
    user_gpu_id  int    default null,
    user_ram     int    default null      -- برحسب GB
)
returns table (
    id              int,
    name            text,
    version         text,
    os              jsonb,
    cpu_min_id      int,
    cpu_rec_id      int,
    gpu_min_id      int,
    gpu_rec_id      int,
    ram_min_id      int,
    ram_rec_id      int,
    disk_space      text,
    is_free         boolean,
    is_open_source  boolean,
    featured        boolean,
    category        jsonb,
    cpu_min_bench   numeric,
    gpu_min_bench   numeric,
    ram_min_name    text
) language sql stable security definer
as $$
with user_cpu as (
  select benchmark from cpus where id = user_cpu_id
),
user_gpu as (
  select benchmark from gpus where id = user_gpu_id
)
select  p.*,
        c_min.benchmark as cpu_min_bench,
        g_min.benchmark as gpu_min_bench,
        r_min.name      as ram_min_name
from    programs p
left join cpus c_min on p.cpu_min_id = c_min.id
left join gpus g_min on p.gpu_min_id = g_min.id
left join rams r_min on p.ram_min_id = r_min.id
where   (user_cpu_id is null
         or c_min.benchmark <= (select benchmark from user_cpu))
    and (user_gpu_id is null
         or g_min.benchmark <= (select benchmark from user_gpu))
    and (user_ram is null
         or cast(regexp_replace(r_min.name, '\\D','','g') as int) <= user_ram);
$$;
