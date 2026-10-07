"use client";

import { useEffect, useRef, useState } from "react";

export default function useCarousel(total: number, interval = 7000) {
  const [index, setIndex] = useState(0);
  const [revision, setRevision] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const start = useRef({x: 0, y: 0});
  const swiped = useRef(false);
  const rotating = total > 1 && !hovered && !focused && !reducedMotion && !hidden;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReducedMotion(media.matches);
    const visibility = () => setHidden(document.hidden);
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const frame = requestAnimationFrame(() => {motion(); visibility();});
    return () => {cancelAnimationFrame(frame); media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility);};
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setIndex(value => (value + 1) % total), interval);
    return () => window.clearTimeout(timer);
  }, [rotating, index, revision, total, interval]);

  function select(value: number) {
    if (total < 2) return;
    setIndex((value + total) % total);
    // Manual navigation restarts the interval; it does not permanently disable autoplay.
    setRevision(value => value + 1);
  }
  return {index, rotating, select, previous: () => select(index - 1), next: () => select(index + 1),
    interactions: {
      onMouseEnter: () => {if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) setHovered(true);}, onMouseLeave: () => setHovered(false),
      onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => setFocused(event.target.matches(":focus-visible")),
      onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);},
      onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {if (swiped.current) {event.preventDefault(); event.stopPropagation(); swiped.current=false;}},
      onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {swiped.current=false; start.current = {x: event.touches[0].clientX, y: event.touches[0].clientY};},
      onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => {
        const dx = start.current.x - event.changedTouches[0].clientX;
        const dy = start.current.y - event.changedTouches[0].clientY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {swiped.current=true; select(index + (dx > 0 ? 1 : -1));}
      },
    }};
}
