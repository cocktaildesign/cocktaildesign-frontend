import existing from "./verification.json";

// Public ownership tags already present on the existing Tilda site.
// Preserve the same verified owners when publishing on the same final domain.
export function siteVerification(site: string) {
  return site.replace(/\/$/, "") === "https://cocktaildesign.ru" ? existing : undefined;
}
