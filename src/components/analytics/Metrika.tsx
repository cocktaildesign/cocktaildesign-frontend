"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { syncMetrika, subscribeAnalytics } from "@/lib/analytics/metrika";

export default function Metrika() {
  const pathname = usePathname();
  useEffect(() => subscribeAnalytics(() => {}), []);
  useEffect(() => { syncMetrika(); }, [pathname]);
  return null;
}
