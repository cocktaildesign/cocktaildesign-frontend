// Editorial display policy only: CRM stock and order validation stay unchanged.
// Use category membership so new stamps and embossing plates inherit the rule.
const CATEGORY_SLUG = "ms-f2905fa8"; // Клише и оттиски
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 100;

export async function loadMadeToOrderProductIds(api: string, request: typeof fetch = fetch): Promise<Set<string>> {
  const ids = new Set<string>();
  const signal = AbortSignal.timeout(5000);
  let total: number | undefined;
  for (let page = 1; page <= 100; page += 1) {
    const url = new URL(`${api}/moysklad-products`);
    url.search = new URLSearchParams({
      "filters[category][slug][$eq]": CATEGORY_SLUG,
      "fields[0]": "moyskladId",
      "populate[category][fields][0]": "slug",
      "sort[0]": "id:asc",
      "pagination[pageSize]": String(PAGE_SIZE),
      "pagination[page]": String(page),
    }).toString();
    const response = await request(url, { signal });
    if (!response.ok) throw new Error("badge_policy_unavailable");
    const payload = await response.json();
    const pagination = payload?.meta?.pagination;
    if (!Array.isArray(payload?.data) || !Number.isSafeInteger(pagination?.total) || pagination.total < 0 ||
        pagination.page !== page || pagination.pageSize !== PAGE_SIZE ||
        (total !== undefined && pagination.total !== total)) throw new Error("badge_policy_invalid_page");
    total = pagination.total;
    const expected = Math.min(PAGE_SIZE, Math.max(0, total! - (page - 1) * PAGE_SIZE));
    if (payload.data.length !== expected) throw new Error("badge_policy_incomplete_page");
    for (const row of payload.data) {
      const product = row?.attributes ?? row;
      const id = product?.moyskladId;
      const category = product?.category?.data?.attributes ?? product?.category;
      if (typeof id !== "string" || !UUID.test(id) || ids.has(id) || category?.slug !== CATEGORY_SLUG) {
        throw new Error("badge_policy_invalid_product");
      }
      ids.add(id);
    }
    if (ids.size === total) return ids;
  }
  throw new Error("badge_policy_page_limit");
}
