export const METRIKA_ID = 49125430;
export const ORDER_GOAL = "new_shop_order_created";
const ORIGIN = "https://cocktaildesign.ru";
const STORAGE_KEY = "cd:analytics:orders:v1";
const sentOrders = new Set<string>();
type Ym = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
type AnalyticsWindow = Window & { ym?: Ym; cdMetrikaStarted?: boolean; cdLastPage?: string };

export function analyticsAllowed(site: string | undefined, enabled: string | undefined, origin: string): boolean {
  return enabled === "true" && site?.replace(/\/$/, "") === ORIGIN && origin === ORIGIN;
}

function activeWindow(): AnalyticsWindow | undefined {
  if (typeof window === "undefined") return undefined;
  return analyticsAllowed(process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_ANALYTICS_ENABLED, window.location.origin)
    ? window as AnalyticsWindow : undefined;
}

// Keep standard campaign labels on the landing page, but omit arbitrary query
// parameters (including search text and the order number on the success page).
export function analyticsUrl(raw: string, campaign = false): string | undefined {
  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    const params = new URLSearchParams();
    if (campaign && url.origin === ORIGIN) {
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
        const value = url.searchParams.get(key);
        if (value && value.length <= 200) params.set(key, value);
      }
    }
    const query = params.toString();
    return url.origin + url.pathname + (query ? `?${query}` : "");
  } catch { return undefined; }
}

export function startMetrika(): void {
  try {
    const w = activeWindow();
    if (!w || w.cdMetrikaStarted) return;
    w.ym = w.ym || Object.assign((...args: unknown[]) => { w.ym?.a?.push(args); }, { a: [] as unknown[][], l: Date.now() });
    w.ym(METRIKA_ID, "init", { defer: true, webvisor: false, clickmap: false, trackLinks: false, accurateTrackBounce: true });
    w.cdMetrikaStarted = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);
  } catch { /* Analytics must never prevent navigation or ordering. */ }
}

export function trackPage(): void {
  try {
    const w = activeWindow();
    if (!w?.cdMetrikaStarted || !w.ym) return;
    const url = analyticsUrl(w.location.href, true);
    if (!url || w.cdLastPage === url) return;
    w.ym(METRIKA_ID, "hit", url, { referer: w.cdLastPage ?? analyticsUrl(document.referrer), title: document.title });
    w.cdLastPage = url;
  } catch { /* Tracking is optional. */ }
}

// Called only after a successful order API response, never on a success-page visit.
// Counts accepted requests, not payments. No estimated revenue is sent.
export function trackAcceptedOrder(orderId: unknown): void {
  try {
    const w = activeWindow();
    if (!w?.cdMetrikaStarted || !w.ym || typeof orderId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) return;
    let previous: string[] = [];
    try {
      const saved: unknown = JSON.parse(w.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) previous = saved.filter((v): v is string => typeof v === "string").slice(-99);
    } catch { /* Disabled storage does not affect checkout or this session's deduplication. */ }
    if (sentOrders.has(orderId) || previous.includes(orderId)) return;
    w.ym(METRIKA_ID, "reachGoal", ORDER_GOAL);
    sentOrders.add(orderId);
    try { w.localStorage.setItem(STORAGE_KEY, JSON.stringify([...previous, orderId])); } catch { /* Optional. */ }
  } catch { /* Fail closed for analytics; never throw into successful checkout. */ }
}
