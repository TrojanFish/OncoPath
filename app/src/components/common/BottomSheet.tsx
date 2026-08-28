"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-2xl",
  className = "",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  // Esc key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Velocity-based Spring Physics Drag & Flick Dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartTime.current = Date.now();
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const deltaY = touchCurrentY.current - touchStartY.current;
    
    if (sheetRef.current) {
      if (deltaY > 0) {
        // Dragging downwards: smooth tracking
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      } else {
        // Dragging upwards beyond top: rubber-band resistance
        const rubberBandDelta = -Math.pow(-deltaY, 0.7) * 2;
        sheetRef.current.style.transform = `translateY(${rubberBandDelta}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    const deltaY = touchCurrentY.current - touchStartY.current;
    const deltaTime = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = deltaY / deltaTime; // px per ms

    // Velocity-based flick down (fast swipe) OR dragged past 110px threshold
    const shouldDismiss = (velocity > 0.45 && deltaY > 20) || deltaY > 110;

    if (shouldDismiss && sheetRef.current) {
      // Haptic feedback on supported mobile devices
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(8); } catch {}
      }

      // Accelerated exit transition
      sheetRef.current.style.transition = "transform 0.22s cubic-bezier(0.32, 0, 0.67, 0)";
      sheetRef.current.style.transform = "translateY(100%)";
      setTimeout(onClose, 200);
    } else if (sheetRef.current) {
      // Spring bounce back to 0
      sheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      sheetRef.current.style.transform = "translateY(0px)";
    }

    touchStartY.current = 0;
    touchCurrentY.current = 0;
    touchStartTime.current = 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-slide-up-drawer sm:animate-fade-in-up transition-transform duration-150 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Swipe Bar Indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.2 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content with smooth scroll */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
