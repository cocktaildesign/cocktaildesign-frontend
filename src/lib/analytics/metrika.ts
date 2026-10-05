export const METRIKA_ID = 49125430;
export const ORDER_GOAL = "new_shop_order_created";
const ORIGIN = "https://cocktaildesign.ru";
const STORAGE_KEY = "cd:analytics:orders:v1";
const OPT_OUT_KEY = "cd_ym_optout"; // Same cookie/localStorage key as the existing main site.
const CHANGE_EVENT = "cd:analytics:change";
const SCRIPT_ID = "cd-metrika-script";
const sentOrders = new Set<string>();
type Ym = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
type AnalyticsWindow = Window & { ym?: Ym; cdMetrikaStarted?: boolean; cdLastPage?: string;
  disableYaCounter49125430?: boolean; cdAnalyticsSessionDisabled?: boolean };

export function analyticsAllowed(site: string | undefined, enabled: string | undefined, origin: string): boolean {
  return enabled === "true" && site?.replace(/\/$/, "") === ORIGIN && origin === ORIGIN;
}

function siteWindow(): AnalyticsWindow | undefined {
  if (typeof window === "undefined") return undefined;
  return analyticsAllowed(process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_ANALYTICS_ENABLED, window.location.origin)
    ? window as AnalyticsWindow : undefined;
}

function storedOptOut(): boolean {
  try {
    if (document.cookie.split(";").some(v => v.trim() === `${OPT_OUT_KEY}=1`)) return true;
    return window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch { return true; } // Unknown persisted choice: don't accidentally override an earlier refusal.
}

function optedOut(w: AnalyticsWindow): boolean {
  return w.cdAnalyticsSessionDisabled ?? storedOptOut();
}

export function analyticsStatus(): "unavailable" | "disabled" | "enabled" {
  const w = siteWindow();
  return !w ? "unavailable" : optedOut(w) ? "disabled" : "enabled";
}

function activeWindow(): AnalyticsWindow | undefined {
  const w = siteWindow();
  if (!w) return undefined;
  if (optedOut(w)) { stopMetrika(w); return undefined; }
  return w;
}

function stopMetrika(w: AnalyticsWindow): void {
  try {
    if (w.ym?.a) w.ym.a = w.ym.a.filter(args => args[0] !== METRIKA_ID);
    else if (w.cdMetrikaStarted) w.ym?.(METRIKA_ID, "destruct");
  } catch { /* Blocking analytics must not break the interface. */ }
  w.disableYaCounter49125430 = true;
  w.cdMetrikaStarted = false;
  delete w.cdLastPage;
}

function cookie(name: string, value: string, maxAge: number, domain?: string): void {
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ""}`;
}

function clearCookie(name: string): void {
  for (const domain of [undefined, "cocktaildesign.ru", ".cocktaildesign.ru"]) {
    try { cookie(name, "", 0, domain); } catch { /* Browser may forbid storage. */ }
  }
}

export function setAnalyticsEnabled(enabled: boolean): { saved: boolean } {
  const w = siteWindow();
  if (!w) return { saved: false }; // A UI setting must never bypass the prelaunch environment guard.
  const disabled = !enabled;
  // Apply before touching storage or invoking any third-party function.
  w.cdAnalyticsSessionDisabled = disabled;
  if (disabled) stopMetrika(w);
  let storageSaved = false;
  try {
    if (disabled) w.localStorage.setItem(OPT_OUT_KEY, "1");
    else w.localStorage.removeItem(OPT_OUT_KEY);
    storageSaved = (w.localStorage.getItem(OPT_OUT_KEY) === "1") === disabled;
  } catch { /* Preserve this tab's choice in memory. */ }
  let cookieSaved = false;
  try {
    if (disabled) cookie(OPT_OUT_KEY, "1", 31536000, ".cocktaildesign.ru");
    else clearCookie(OPT_OUT_KEY);
    cookieSaved = document.cookie.split(";").some(v => v.trim() === `${OPT_OUT_KEY}=1`) === disabled;
  } catch { /* Optional persistence. */ }
  // A durable refusal in either store wins, including a choice made on the old site.
  // Successful enabling requires both legacy stores to have been cleared/readable.
  const saved = disabled ? storageSaved || cookieSaved : storageSaved && cookieSaved;
  if (saved) delete w.cdAnalyticsSessionDisabled;
  if (disabled) {
    try {
      for (const entry of document.cookie.split(";")) {
        const name = entry.split("=")[0].trim();
        if (/^_ym|^_yasc|^yabs-sid$/.test(name)) clearCookie(name);
      }
    } catch { /* Never clear cart/favorites/engraving storage. */ }
  } else { startMetrika(); trackPage(); }
  try { w.dispatchEvent(new Event(CHANGE_EVENT)); } catch { /* No effect on ordering. */ }
  return { saved };
}

export function subscribeAnalytics(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const changed = () => { syncMetrika(); listener(); };
  const external = () => {
    // Persisted settings are reread on every call. An unsaved tab-only choice
    // must not be lost just because the user returns to a form after switching tabs.
    changed();
  };
  const storage = (event: StorageEvent) => { if (event.key === OPT_OUT_KEY || event.key === null) external(); };
  const visible = () => { if (document.visibilityState === "visible") external(); };
  window.addEventListener(CHANGE_EVENT, changed);
  window.addEventListener("storage", storage);
  window.addEventListener("focus", external);
  window.addEventListener("pageshow", external);
  document.addEventListener("visibilitychange", visible);
  return () => {
    window.removeEventListener(CHANGE_EVENT, changed); window.removeEventListener("storage", storage);
    window.removeEventListener("focus", external); window.removeEventListener("pageshow", external);
    document.removeEventListener("visibilitychange", visible);
  };
}

export function syncMetrika(): void { startMetrika(); trackPage(); }

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
    w.disableYaCounter49125430 = false;
    w.ym = w.ym || Object.assign((...args: unknown[]) => { w.ym?.a?.push(args); }, { a: [] as unknown[][], l: Date.now() });
    w.ym(METRIKA_ID, "init", { defer: true, webvisor: false, clickmap: false, trackLinks: false, accurateTrackBounce: true });
    w.cdMetrikaStarted = true;
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    script.onload = () => { if (optedOut(w)) stopMetrika(w); };
    script.onerror = () => { stopMetrika(w); script.remove(); };
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
