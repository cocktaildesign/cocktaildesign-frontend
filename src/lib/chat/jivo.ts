const STOREFRONT_HOSTS = new Set(["cocktaildesign.ru", "www.cocktaildesign.ru"]);
const PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function shouldLoadJivo(hostname: string, previewEnabled = false): boolean {
  return STOREFRONT_HOSTS.has(hostname)
    || (previewEnabled && PREVIEW_HOSTS.has(hostname));
}
