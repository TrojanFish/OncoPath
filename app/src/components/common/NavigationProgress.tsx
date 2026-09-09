"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  // When pathname changes, complete progress to 100% and fade out
  useEffect(() => {
    if (!visible) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 250);

    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [pathname, visible]);

  // Intercept all internal link clicks to trigger 0ms instant feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, target blank, download, mailto, tel, or hash-only links
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // If internal link to a DIFFERENT path, start the progress bar immediately
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin === currentUrl.origin) {
          if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
            // Start progress immediately
            if (timerRef.current) clearInterval(timerRef.current);
            if (finishTimerRef.current) clearTimeout(finishTimerRef.current);

            setVisible(true);
            setProgress(28);

            // Trickle progress while waiting for Next.js router
            timerRef.current = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 85) {
                  return prev;
                }
                const increment = Math.max(1, (85 - prev) * 0.2);
                return Math.min(85, prev + increment);
              });
            }, 180);
          }
        }
      } catch {
        // Ignore URL parsing errors
      }
    };

    // Popstate (browser back/forward button)
    const handlePopState = () => {
      setVisible(true);
      setProgress(40);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="h-[2.5px] bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
