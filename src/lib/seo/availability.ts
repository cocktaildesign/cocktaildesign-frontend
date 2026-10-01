import { getStrapiUrl } from "@/lib/api/strapi/client";
import { parseAvailabilityStates } from "@/shared/ui/product-badges/availability";

export async function getSeoAvailability(): Promise<Record<string, boolean>> {
  try {
    const response = await fetch(new URL("/api/catalog/availability", getStrapiUrl()), {
      next: { revalidate: 60 }, signal: AbortSignal.timeout(3000),
    });
    return response.ok ? parseAvailabilityStates(await response.json()) ?? {} : {};
  } catch {
    // SEO enrichment must never make a product page fail when availability is down.
    return {};
  }
}
