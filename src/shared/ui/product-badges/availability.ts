import type { ProductBadge } from "@/lib/api/catalog/types";

export const AUTOMATIC_AVAILABILITY_BADGE: ProductBadge = {
  id: -1, label: "НЕТ В НАЛИЧИИ", backgroundColor: "#6B7280", textColor: "#FFFFFF",
};

export function reconcileAvailabilityBadges(badges: ProductBadge[], unavailable: boolean | undefined) {
  // Unknown (including bundles) keeps editorial badges. Confirmed CRM state overrides
  // just this badge, without deleting its saved Strapi assignment.
  if (unavailable === undefined) return badges;
  return badges.filter((badge) => badge.label.trim().replace(/\s+/g, " ").toLowerCase() !== "нет в наличии");
}

export function parseAvailabilityStates(value: unknown): Record<string, boolean> | null {
  if (!value || typeof value !== "object" || !("states" in value)) return null;
  const states = value.states;
  if (!states || typeof states !== "object" || Array.isArray(states)) return null;
  if (Object.entries(states).some(([id, state]) =>
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || typeof state !== "boolean")) return null;
  return states as Record<string, boolean>;
}
