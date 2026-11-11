"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { shouldLoadJivo } from "@/lib/chat/jivo";
import { useJivoClearance } from "./useJivoClearance";
import "./JivoChat.css";

type JivoWindow = Window & {
  jivo_api?: { sendPageTitle: (title: string, fromApi: boolean, url: string) => void };
  jivo_onLoadCallback?: () => void;
};

const subscribe = () => () => {};
const serverSnapshot = () => false;
const browserSnapshot = () => shouldLoadJivo(
  window.location.hostname,
  // Explicit, loopback-only opt-in for visual QA. Normal local previews stay offline.
  process.env.NEXT_PUBLIC_JIVO_PREVIEW_ENABLED === "true",
);

export default function JivoChat() {
  const enabled = useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot);
  const pathname = usePathname();
  const lastPage = useRef("");
  useJivoClearance(enabled);

  useEffect(() => {
    if (!enabled) return;

    const jivoWindow = window as JivoWindow;
    if (jivoWindow.jivo_api) document.documentElement.dataset.jivoReady = "true";
    const syncPage = () => {
      const api = jivoWindow.jivo_api;
      if (!api) return;
      const page = `${window.location.href}\n${document.title}`;
      if (page === lastPage.current) return;
      try {
        api.sendPageTitle(document.title, true, window.location.href);
        lastPage.current = page;
      } catch {
        // A third-party chat failure must not interrupt storefront navigation.
      }
    };
    const previousOnLoad = jivoWindow.jivo_onLoadCallback;
    const onLoad = () => {
      previousOnLoad?.();
      document.documentElement.dataset.jivoReady = "true";
      syncPage();
    };
    jivoWindow.jivo_onLoadCallback = onLoad;
    const frame = window.requestAnimationFrame(syncPage);
    // App Router can stream the title after the pathname changes.
    const titleObserver = new MutationObserver(syncPage);
    titleObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => {
      window.cancelAnimationFrame(frame);
      titleObserver.disconnect();
      if (jivoWindow.jivo_onLoadCallback === onLoad) {
        jivoWindow.jivo_onLoadCallback = previousOnLoad;
      }
    };
  }, [enabled, pathname]);

  if (!enabled) return null;

  // The root layout and stable script ID keep one widget across client navigation.
  // All design, operators and routing remain in the existing Jivo channel.
  return <Script
    id="jivo-widget"
    src="https://code.jivo.ru/widget/ozPIIBkAzM"
    strategy="lazyOnload"
  />;
}
