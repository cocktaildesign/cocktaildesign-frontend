"use client";

import { useSyncExternalStore } from "react";
import { parseAvailabilityStates } from "./availability";
import { loadMadeToOrderProductIds } from "./made-to-order";

const EMPTY: Record<string, boolean> = {};
const INITIAL = { states: EMPTY, madeToOrder: new Set<string>() };
const INTERVAL = 60_000;
const POLICY_INTERVAL = 5 * INTERVAL;
const API = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api").replace(/\/$/, "");
let state = INITIAL;
let policyUpdatedAt = 0;
let lastAttempt = 0;
let pending = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

async function refresh() {
  if (pending || Date.now() - lastAttempt < INTERVAL) return;
  pending = true; lastAttempt = Date.now();
  try {
    const [response, madeToOrder] = await Promise.all([
      fetch(`${API}/catalog/availability`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      refreshPolicy(),
    ]);
    const next = response?.ok ? parseAvailabilityStates(await response.json().catch(() => null)) : null;
    state = { states: next ?? state.states, madeToOrder };
    for (const listener of listeners) listener();
  } catch { /* Keep the last confirmed state; an API outage must not mark the catalog unavailable. */ }
  finally { pending = false; }
}

async function refreshPolicy() {
  if (Date.now() - policyUpdatedAt < POLICY_INTERVAL) return state.madeToOrder;
  try {
    const ids = await loadMadeToOrderProductIds(API);
    policyUpdatedAt = Date.now();
    return ids;
  } catch {
    // A failed/partial category response must not erase the last known exceptions.
    // Availability itself can still refresh for the rest of the catalogue.
    return state.madeToOrder;
  }
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

export function useAvailability(moyskladId?: string, parentMoyskladId?: string) {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  return {
    unavailable: moyskladId ? snapshot.states[moyskladId] : undefined,
    suppressAvailabilityBadge: snapshot.madeToOrder.has(parentMoyskladId ?? moyskladId ?? ""),
  };
}
