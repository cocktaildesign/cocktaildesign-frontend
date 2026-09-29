"use client";

import { useSyncExternalStore } from "react";
import { parseAvailabilityStates } from "./availability";

const EMPTY: Record<string, boolean> = {};
const INTERVAL = 60_000;
const API = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api").replace(/\/$/, "");
let states = EMPTY;
let lastAttempt = 0;
let pending = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

async function refresh() {
  if (pending || Date.now() - lastAttempt < INTERVAL) return;
  pending = true; lastAttempt = Date.now();
  try {
    const response = await fetch(`${API}/catalog/availability`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const next = parseAvailabilityStates(await response.json());
    if (next) { states = next; for (const listener of listeners) listener(); }
  } catch { /* Keep the last confirmed state; an API outage must not mark the catalog unavailable. */ }
  finally { pending = false; }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // One request/timer for all cards, never one CRM/API request per product.
  if (listeners.size === 1) { void refresh(); timer = setInterval(() => { void refresh(); }, INTERVAL); }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) { clearInterval(timer); timer = undefined; }
  };
}

export function useAvailability(moyskladId?: string) {
  const snapshot = useSyncExternalStore(subscribe, () => states, () => EMPTY);
  return moyskladId ? snapshot[moyskladId] : undefined;
}
