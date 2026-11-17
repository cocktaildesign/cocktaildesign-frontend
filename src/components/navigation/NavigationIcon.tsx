import type { ReactNode } from "react";

const tagOutline = <path d="M20 3h-7L3.6 12.4a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0L21 11V4a1 1 0 0 0-1-1Z" />;

const icons: Record<string, ReactNode> = {
  "/catalog": <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  "/catalog/collection/novinki": <path d="M12 2c1.4 6 4 8.6 10 10-6 1.4-8.6 4-10 10C10.6 16 8 13.4 2 12c6-1.4 8.6-4 10-10Z" />,
  "/catalog/collection/utsenka": <>{tagOutline}<path d="M11 10v7m-3-3 3 3 3-3" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
  "/catalog/collection/sale": <>{tagOutline}<path d="m8 16 7-7" /><circle cx="9" cy="10" r="1.1" /><circle cx="14" cy="15" r="1.1" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
  "/discounts": <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M7 15v1m4-4v4m4-7v7m4-10v10" /></>,
  "/shipping": <><path d="M3 6V4h11v13H8m6 0h2m-2-10h4l4 5v5h-2M1 8h7M2 12h4M2 16h2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  "/payment-methods": <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20M6 15h4m6 0h2" /></>,
  "/knowledge": <path d="M12 5C9 3 5.5 3 2 4v16c3.5-1 7-1 10 1 3-2 6.5-2 10-1V4c-3.5-1-7-1-10 1Zm0 0v16" />,
  "/about": <><circle cx="9" cy="7" r="3.5" /><path d="M2 21v-2a7 7 0 0 1 14 0v2H2Zm15-17a3.5 3.5 0 0 1 0 7m1 3a6 6 0 0 1 4 5v2h-3" /></>,
  "/contacts": <path d="M7.4 3.7 9 7.5a1.5 1.5 0 0 1-.3 1.6l-1.5 1.6a14.8 14.8 0 0 0 6.1 6.1l1.6-1.5a1.5 1.5 0 0 1 1.6-.3l3.8 1.6a1.5 1.5 0 0 1 .9 1.7c-.5 2-2 3.2-4 2.8A19 19 0 0 1 2.9 6.8c-.4-2 .8-3.5 2.8-4a1.5 1.5 0 0 1 1.7.9Z" />,
  "/branding": <><path d="m5 16 1-5L16 1a2.8 2.8 0 0 1 4 4L10 15l-5 1Zm9-13 4 4M2 21c3-3 5 2 8 0s5 0 10-1" /></>,
  "/legal/requisites": <><path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-7-7Zm0 0v7h7M7 13h10M7 17h10" /></>,
  "/support/feedback": <><path d="M5 3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3Z" /><circle cx="7" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="11" r="1" fill="currentColor" stroke="none" /></>,
};

export default function NavigationIcon({ href }: { href: string }) {
  const path = href.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {icons[path] ?? <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 12h10m-4-4 4 4-4 4" /></>}
    </svg>
  );
}
