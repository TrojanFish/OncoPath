"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remarkGfm";
import type { PatientProfile } from "@/lib/types";

export default function EvidenceReportPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState("");
  
  const hasFetched = useRef(false);
  const contentEndRef = useRef<HTMLDivElement>(null); // Auto-scroll ref

  useEffect(() => {
    // Auto scroll to bottom when generating new content
    if (isGenerating && contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [reportMarkdown, isGenerating]);

  useEffect(() => {
    async function loadAndGenerate() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        // 1. Fetch Profile
        const res = await fetch('/api/profile');
        const data = await res.json();
        
        if (!data.profile) {
          setError("未找到患者档案，请先建立档案。");
          setIsGenerating(false);
          return;
        }
        
        setProfile(data.profile);

        // 2. Stream Report from AI
        const reportRes = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.profile)
        });

        if (!reportRes.ok) {
          const err = await reportRes.json();
          throw new Error(err.error || "报告生成失败");
        }

        const reader = reportRes.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          throw new Error("无数据流返回");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setReportMarkdown((prev) => prev + chunk);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
    }

    loadAndGenerate();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
      
      {/* Navigation - Hidden in print */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-sm flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <a href="/profile" className="text-text-secondary hover:text-accent-blue transition-colors">
            ← 返回档案页
          </a>
          <div className="w-px h-4 bg-gray-300"></div>
          <span className="font-semibold text-text-primary">专属深度循证解读报告</span>
        </div>
        {!isGenerating && (
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 btn-secondary px-4 py-2 rounded-lg text-sm font-medium border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            打印 / 保存为 PDF
          </button>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 print:pt-0 print:px-0">
        
        {/* Header summary of profile */}
        {profile && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8 flex items-center justify-between print:border-none print:shadow-none print:border-b print:rounded-none print:mb-4 print:pb-4">
            <div>
              <div className="text-xs text-text-muted font-bold uppercase tracking-widest mb-2 print:text-black">Patient Profile</div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 print:text-2xl">
                  {profile.age}岁 · {profile.sex === 'male' ? '男性' : '女性'}
                </h1>
                <span className="px-2 py-1 rounded bg-blue-50 text-accent-blue border border-blue-100 text-xs font-bold print:bg-transparent print:border-black print:text-black">
                  {profile.tStage || "T?"}{profile.nStage || "N?"}M0
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-text-muted mb-1 print:text-black">当前核心风险标签</div>
              <div className="flex gap-2">
                {profile.stas === 'positive' && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200 print:bg-transparent print:border-black print:text-black">STAS阳性</span>}
                {profile.nStage === 'N1' && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 print:bg-transparent print:border-black print:text-black">淋巴结累及</span>}
                {profile.stas === 'negative' && profile.nStage === 'N0' && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 print:bg-transparent print:border-black print:text-black">无高危因素</span>}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 mb-8 print:hidden">
            <h3 className="font-bold mb-2">生成出错</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Report Content Container (Claude Artifact Style) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[60vh] print:border-none print:shadow-none print:m-0 print:p-0">
          
          {/* Top subtle gradient bar - Hidden in print */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-blue via-accent-teal to-accent-blue rounded-t-2xl print:hidden"></div>
          
          <div className="p-8 md:p-12 print:p-0">
            {!reportMarkdown && isGenerating && (
              <div className="flex items-center gap-3 text-accent-blue font-medium animate-pulse print:hidden">
                <svg className="animate-spin h-5 w-5 text-accent-blue" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在为您检索海量顶级医学文献库并撰写深度报告...
              </div>
            )}
            
            <div className="prose prose-slate prose-blue max-w-none print:prose-p:text-black print:prose-headings:text-black print:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reportMarkdown}
              </ReactMarkdown>
            </div>

            {isGenerating && reportMarkdown && (
              <div className="mt-4 flex gap-1 items-center opacity-50 print:hidden">
                <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={contentEndRef} className="h-4 print:hidden" />
          </div>
        </div>

      </div>
    </div>
  );
}
