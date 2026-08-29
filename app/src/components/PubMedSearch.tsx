import { useState } from "react";
import { Search, Globe, DownloadCloud, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { StudyListSkeleton } from "@/components/common/MedicalSkeleton";
import EmptyState from "@/components/common/EmptyState";

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
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = "/api";

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setHasSearched(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/evidence/search?q=${encodeURIComponent(query)}`, {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      setMessage("搜索出错，请检查网络连接");
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
        setMessage(data.message || `已完成 ${source === "europe_pmc" ? "Europe PMC" : "PubMed"} 抓取，正在刷新本地结果...`);
        // Automatically re-run local search to refresh results
        handleSearch();
      } else {
        setMessage("抓取请求失败，请稍后重试。");
      }
    } catch (error) {
      console.error(error);
      setMessage("请求出错");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm border border-slate-200/90 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                国际前沿文献扩展检索
              </h2>
              <p className="text-xs text-slate-500">直连 PubMed 与 Europe PMC 顶级生物医学数据库</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            100% 来源可溯
          </span>
        </div>

        {/* 检索输入框与数据源选择 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词（如 'lung cancer STAS'、'EGFR osimertinib'）..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 cursor-pointer hover:border-slate-300"
            >
              <option value="pubmed">PubMed (内置)</option>
              <option value="europe_pmc">Europe PMC (国际)</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 active:scale(0.97)"
            >
              <Search className="w-4 h-4" />
              <span>本地检索</span>
            </button>
            <button
              onClick={handleFetchExternal}
              disabled={isLoading}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 active:scale(0.97)"
            >
              <DownloadCloud className="w-4 h-4 text-sky-600" />
              <span>从外部抓取</span>
            </button>
          </div>
        </div>
        
        {message && (
          <div className="text-xs sm:text-sm text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 加载状态：医疗 Shimmer 骨架屏 */}
        {isLoading && (
          <div className="pt-2">
            <StudyListSkeleton count={2} />
          </div>
        )}

        {/* 空结果状态 */}
        {!isLoading && hasSearched && results.length === 0 && (
          <EmptyState
            compact
            icon="search"
            title="本地数据库暂未收录该关键词的文献"
            description="您可以尝试更换检索词（支持英文/中文 MeSH 词），或点击上方「从外部抓取」按钮直接从 PubMed 官方拉取最新研究。"
          />
        )}

        {/* 检索结果展示 */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                检索结果 ({results.length} 篇相关研究)
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs card-hover space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      {item.journal || "PubMed"}
                    </span>
                    <span className="text-slate-400 text-xs font-mono font-semibold">
                      {item.year || "权威文献"}
                    </span>
                  </div>
                  <h4 className="text-slate-900 text-sm font-bold leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="text-2xs text-slate-500 line-clamp-1">{item.authors}</div>
                  
                  {(item.summary || item.conclusion) && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {item.summary && item.summary !== "Pending AI Analysis" && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          <span className="font-semibold text-slate-700">摘要：</span>{item.summary}
                        </p>
                      )}
                      {item.conclusion && item.conclusion !== "Pending AI Analysis" && (
                        <p className="text-xs text-teal-700 font-medium leading-relaxed">
                          <span className="font-semibold text-teal-800">结论：</span>{item.conclusion}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {item.keywords && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {item.keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 3).map((k, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-2xs px-2 py-0.5 rounded-md">
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
