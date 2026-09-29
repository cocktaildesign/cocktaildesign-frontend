"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "./cartStore";
import { fetchCartDiscountPolicy } from "./discountPolicy";

export function useCartDiscountPolicy() {
  const items = useCartStore(s => s.items);
  const hasHydrated = useCartStore(s => s.hasHydrated);
  const applyPolicy = useCartStore(s => s.applyDiscountPolicy);
  const codesKey = JSON.stringify([...new Set(items.map(item => item.code.trim()))].sort());
  const [revision, setRevision] = useState(0);
  const requestKey = `${revision}:${codesKey}`;
  const [result, setResult] = useState({ key: "", error: false, engraving: {} as Record<string, boolean> });

  useEffect(() => {
    if (!hasHydrated || codesKey === "[]") return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    let engraving: Record<string, boolean> = {};
    fetchCartDiscountPolicy(JSON.parse(codesKey), controller.signal, flags => { engraving = flags; })
      .then(policy => {
        if (!active) return;
        applyPolicy(policy);
        setResult({ key: requestKey, error: false, engraving });
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, error: true, engraving: {} });
      })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [hasHydrated, codesKey, requestKey, applyPolicy]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") setRevision(value => value + 1);
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  return {
    engravingByCode: result.key === requestKey && !result.error ? result.engraving : {},
    ready: hasHydrated && (items.length === 0 || (result.key === requestKey && !result.error)),
    error: result.key === requestKey && result.error,
    retry: () => setRevision(value => value + 1),
  };
}
