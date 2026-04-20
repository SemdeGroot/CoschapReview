"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const ANIM_DISABLE_CSS = `
  .animate-fade-up,
  .animate-fade-up-d1,
  .animate-fade-up-d2,
  .animate-fade-up-d3 {
    animation: none !important;
    opacity: 1 !important;
  }
`;

export function PageFadeGuard() {
  const pathname = usePathname();
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    let alreadyVisited = false;
    try {
      const key = `pv:${pathname}`;
      alreadyVisited = !!sessionStorage.getItem(key);
      if (!alreadyVisited) sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode on some browsers)
    }

    if (alreadyVisited) {
      if (!styleRef.current) {
        const el = document.createElement("style");
        el.textContent = ANIM_DISABLE_CSS;
        document.head.appendChild(el);
        styleRef.current = el;
      }
    } else if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    return () => {
      styleRef.current?.remove();
      styleRef.current = null;
    };
  }, [pathname]);

  return null;
}
