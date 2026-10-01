"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { startMetrika, trackPage } from "@/lib/analytics/metrika";

export default function Metrika() {
  const pathname = usePathname();
  useEffect(() => { startMetrika(); trackPage(); }, [pathname]);
  return null;
}
