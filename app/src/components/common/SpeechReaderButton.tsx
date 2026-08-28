"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, Loader2 } from "lucide-react";

interface SpeechReaderButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function SpeechReaderButton({
  text,
  label = "语音朗读结论",
  className = "",
}: SpeechReaderButtonProps) {
  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text) return null;

  const handleToggle = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;

    if (isPlaying && !isPaused) {
      synth.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }

    // Start fresh playback
    synth.cancel();
    // Strip markdown formatting characters for clean speech
    const cleanText = text
      .replace(/[*#_`~\[\]\(\)\>]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95; // Slightly calmer, comfortable pace for clinical comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale(0.96) ${
          isPlaying
            ? isPaused
              ? "bg-amber-50 text-amber-700 border border-amber-300"
              : "bg-sky-50 text-sky-700 border border-sky-300 shadow-xs"
            : "bg-white text-slate-700 border border-slate-200 hover:border-sky-300 hover:text-sky-700 shadow-2xs"
        }`}
        title={isPlaying ? (isPaused ? "继续播报" : "暂停播报") : "语音朗读报告核心结论"}
        aria-label={label}
      >
        {isPlaying ? (
          isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>已暂停 · 点击继续</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-4 bg-sky-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-2 bg-sky-500 rounded-full animate-bounce" />
              </span>
              <span className="font-bold">正在播报...</span>
            </>
          )
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{label}</span>
          </>
        )}
      </button>

      {isPlaying && (
        <button
          type="button"
          onClick={handleStop}
          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="停止播报"
          aria-label="停止播报"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
