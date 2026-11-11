import { useEffect } from "react";

// Keep the chat launcher above the shop's own fixed mobile controls, including
// the taller engraving purchase bar. Observe their real height rather than
// coupling the widget to a CSS-module class or a guessed pixel offset.
export function useJivoClearance(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const obstacles = new Set<HTMLElement>();
    let frame = 0;
    let lastBottom = -1;
    const measure = () => {
      frame = 0;
      let bottom = 0;
      for (const node of obstacles) {
        if (!node.isConnected) {
          resizeObserver.unobserve(node);
          obstacles.delete(node);
          continue;
        }
        const rect = node.getBoundingClientRect();
        if (rect.width && rect.height && getComputedStyle(node).position === "fixed") {
          bottom = Math.max(bottom, window.innerHeight - rect.top);
        }
      }
      const nextBottom = bottom > 0 ? Math.ceil(bottom) + 12 : 0;
      if (nextBottom !== lastBottom) {
        root.style.setProperty("--jivo-site-bottom", `${nextBottom}px`);
        lastBottom = nextBottom;
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const resizeObserver = new ResizeObserver(schedule);
    const discover = () => {
      document.querySelectorAll<HTMLElement>("[data-jivo-clearance]").forEach(node => {
        if (!obstacles.has(node)) {
          obstacles.add(node);
          resizeObserver.observe(node);
        }
      });
      schedule();
    };
    // Purchase controls can arrive after the route shell has streamed.
    const routeObserver = new MutationObserver(records => {
      const changedObstacle = records.some(record =>
        [...record.addedNodes, ...record.removedNodes].some(node =>
          node instanceof Element && (
            node.matches("[data-jivo-clearance]")
            || node.querySelector("[data-jivo-clearance]")
          ),
        ),
      );
      if (changedObstacle) discover();
    });
    routeObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    discover();

    return () => {
      routeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      root.style.removeProperty("--jivo-site-bottom");
      delete root.dataset.jivoReady;
    };
  }, [enabled]);
}
