"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseQuery, toQuery, type UrlState } from "./queryState";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo<UrlState>(() => parseQuery(sp), [sp]);

  const replace = useCallback((next: UrlState) => {
    const qs = toQuery(next);
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [router, pathname]);

  return { current, replace };
}
