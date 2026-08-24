"use client";

import { useState } from "react";

interface EvidenceResponse {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string;
  summary: string;
  conclusion: string;
  keywords: string;
  created_at: string;
}

export default function PubMedSearch() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("pubmed");
  const [results, setResults] = useState<EvidenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = "/api";

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/evidence/search?q=${encodeURIComponent(query)}`, {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        if (!Array.isArray(data) || data.length === 0) {
          setMessage("本地数据库未找到相关论文，请尝试从外部库抓取。");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("搜索出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchExternal = async () => {
    if (!query) return;
    setIsLoading(true);
    setMessage("");
    try {
      const endpoint = source === "europe_pmc" ? "fetch-europe-pmc" : "fetch-pubmed";
      const res = await fetch(`${API_BASE_URL}/evidence/${endpoint}?query=${encodeURIComponent(query)}`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || `已完成 ${source === "europe_pmc" ? "Europe PMC" : "PubMed"} 抓取，请点击“本地检索”查看最新结果。`);
        // Automatically re-run local search to refresh results
        handleSearch();
      } else {
        setMessage("抓取请求失败，请检查网络后重试。");
      }
    } catch (error) {
      console.error(error);
      setMessage("请求出错");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="mt-16 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-accent-blue">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          外部学术库扩展检索
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键词（如 'lung cancer STAS'）搜索或抓取相关论文..."
            className="flex-1 input-dark px-4 py-2.5 rounded-xl text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <div className="flex gap-2 items-center">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="input-dark px-3 py-2.5 rounded-xl text-sm appearance-none cursor-pointer border-white/10"
            >
              <option value="pubmed">PubMed (内置)</option>
              <option value="europe_pmc">Europe PMC (新增)</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap"
            >
              本地检索
            </button>
            <button
              onClick={handleFetchExternal}
              disabled={isLoading}
              className="bg-white shadow-sm px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border border-white/10 hover:bg-white/5 transition-colors"
            >
              从外部库抓取
            </button>
          </div>
        </div>
        
        {message && (
          <div className="text-sm text-text-secondary mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
            {message}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">检索结果</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-5 border border-white/5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-accent-blue font-semibold text-sm">{item.journal}</span>
                    <span className="text-text-muted text-xs whitespace-nowrap">{item.year}</span>
                  </div>
                  <h4 className="text-text-primary text-sm font-medium leading-relaxed mb-2">{item.title}</h4>
                  <div className="text-xs text-text-secondary mb-3">{item.authors}</div>
                  
                  <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
                    {item.summary && item.summary !== "Pending AI Analysis" && (
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        <span className="text-text-muted">摘要：</span>{item.summary}
                      </p>
                    )}
                    {item.conclusion && item.conclusion !== "Pending AI Analysis" && (
                      <p className="text-xs text-accent-teal leading-relaxed">
                        <span className="text-text-muted">结论：</span>{item.conclusion}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    {item.keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 3).map((k, i) => (
                      <span key={i} className="bg-gray-50 text-gray-500 text-[10px] px-2 py-0.5 rounded border border-gray-200">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
