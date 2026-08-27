/**
 * OncoPath 全站全局搜索索引字典
 * 动态聚合 6 大数据源，支持中英文及医学同义词模糊匹配
 * Zero dependencies — pure in-memory string matching
 */

import { WIKI_TOPICS } from "@/lib/wikiData";
import { FEATURED_STUDIES } from "@/lib/evidence-data";
import { CLINICAL_GLOSSARY } from "@/lib/glossaryData";
import { TARGETED_DRUGS } from "@/lib/ddiData";

// ─────────────────────────────────────────────────────────────────────────────
// 1. 类型定义
// ─────────────────────────────────────────────────────────────────────────────

export type SearchCategory =
  | "wiki"      // 循证百科词条
  | "study"     // 顶刊研究与临床试验
  | "drug"      // 特药医保 / 靶向药物
  | "glossary"  // 医学影像/病理术语
  | "tool";     // 系统功能与实用工具快捷入口

export interface SearchEntry {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: SearchCategory;
  categoryLabel: string;
  keywords: string[];
  route: string;
  priority: number;
  badge?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 系统工具/页面快捷入口（手动维护）
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_ENTRIES: SearchEntry[] = [
  {
    id: "tool:wiki",
    title: "循证百科专区",
    subtitle: "40+ 词条全景破译",
    description: "磨玻璃结节、STAS、VPI、EGFR 等深度循证词条，含交互式医学模拟器",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["百科", "wiki", "词条", "术语", "解读", "破译", "循证"],
    route: "/wiki",
    priority: 80,
  },
  {
    id: "tool:reimbursement",
    title: "特药医保赠药计算器",
    subtitle: "国谈靶向药自负金额测算",
    description: "16 款肺癌靶向/免疫国谈特药医保报销政策、PAP 慈善赠药申请指引与自负金额实时测算",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["医保", "报销", "赠药", "PAP", "慈善", "自负", "乙类", "甲类", "国谈", "双通道", "特药", "靶向药费用"],
    route: "/reimbursement",
    priority: 78,
  },
  {
    id: "tool:knowledge",
    title: "4D 动态因果知识图谱",
    subtitle: "因果推演 · 患者专属高亮",
    description: "基于个人病理指标激活因果链条，可视化呈现 STAS / EGFR / STAGING 等节点的循证连接与森林图证据",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["知识图谱", "图谱", "因果", "4D", "network", "知识网络", "节点", "证据"],
    route: "/knowledge",
    priority: 72,
  },
  {
    id: "tool:studies",
    title: "国际顶刊研究库",
    subtitle: "Lancet / NEJM / JCO / JTO",
    description: "汇集全球肺癌领域顶级期刊多中心 RCT 与 Meta 分析，支持按靶点/分期/关键词检索",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["研究", "文献", "顶刊", "RCT", "证据", "clinical trial", "meta", "pubmed"],
    route: "/studies",
    priority: 70,
  },
  {
    id: "tool:timeline",
    title: "检查报告时间生命线",
    subtitle: "CT + 病理 + 标志物时序归集",
    description: "按时间轴归集历次 CT、病理报告、基因测序与肿瘤标志物，支持结节生长曲线与就诊摘要卡",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["时间轴", "生命线", "timeline", "报告", "随访", "复查", "CEA", "复发", "标志物", "倍增", "VDT"],
    route: "/timeline",
    priority: 75,
  },
  {
    id: "tool:profile",
    title: "我的临床数字档案",
    subtitle: "结构化病理 CT 档案建立",
    description: "录入/上传病理报告与 CT 参数，自动计算 AJCC TNM 分期与 IASLC 分级，匹配专属文献",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["档案", "病历", "profile", "分期", "TNM", "录入", "上传", "AI解读", "个人", "建档"],
    route: "/profile",
    priority: 73,
  },
  {
    id: "tool:report",
    title: "专属深度循证解读报告",
    subtitle: "AI 个性化分析 · 问诊便签卡",
    description: "基于个人病理参数生成 AI 循证解读，可导出就医问诊便签卡（支持高清图/A4 PDF 打印）",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["报告", "解读", "问诊卡", "PDF", "便签", "打印", "AI", "分析", "就医"],
    route: "/profile/report",
    priority: 68,
  },
  {
    id: "tool:ddi",
    title: "靶向药用药冲突自检 (DDI)",
    subtitle: "降压药 / 胃药 / 食物 · 安全排查",
    description: "自查奥希替尼、阿来替尼等靶向药与慢性病常用药、中药、食物的相互作用风险",
    category: "tool",
    categoryLabel: "🛠️ 实用工具",
    keywords: ["用药冲突", "DDI", "药物相互作用", "奥美拉唑", "PPI", "胃药", "降压药", "中药", "禁忌", "配伍", "服药", "自检", "冲突"],
    route: "/wiki?topic=drug-drug-interactions-ddi",
    priority: 90,
    badge: "工具",
  },
  {
    id: "tool:ln-map",
    title: "纵隔淋巴结 4D 图谱",
    subtitle: "N1/N2/N3 分区可视化图解",
    description: "交互式纵隔淋巴结解剖分区图，覆盖 N1-N3 全分区，辅助理解术后病理淋巴结报告",
    category: "tool",
    categoryLabel: "🛠️ 实用工具",
    keywords: ["淋巴结", "纵隔", "N1", "N2", "N3", "lymph node", "淋巴", "分区", "图谱", "EBUS", "清扫"],
    route: "/wiki?topic=mediastinal-lymph-node-map",
    priority: 88,
    badge: "工具",
  },
  {
    id: "tool:resources",
    title: "学术与指南导航",
    subtitle: "NCCN / ASCO / IASLC / CSCO",
    description: "四大国际权威指南、顶刊、数据库与临床计算器分类外链",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["指南", "NCCN", "ASCO", "IASLC", "CSCO", "共识", "规范", "学术", "导航", "资源"],
    route: "/resources",
    priority: 60,
  },
  {
    id: "tool:about",
    title: "关于 OncoPath 与创作初衷",
    subtitle: "医学伦理 · 专家委员会",
    description: "平台定位、循证医学伦理共识、专家顾问委员会介绍与患者交流答疑通道",
    category: "tool",
    categoryLabel: "🧭 功能页面",
    keywords: ["关于", "about", "初衷", "团队", "联系", "伦理", "使命"],
    route: "/about",
    priority: 30,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. 动态聚合：Wiki 百科词条
// ─────────────────────────────────────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  high: "高危",
  moderate: "中危关注",
  low: "低危随访",
  safe: "安全基石",
};

const WIKI_ENTRIES: SearchEntry[] = WIKI_TOPICS.map((topic) => ({
  id: `wiki:${topic.id}`,
  title: topic.title,
  subtitle: topic.subtitle,
  description: topic.metaphor.slice(0, 80) + (topic.metaphor.length > 80 ? "…" : ""),
  category: "wiki" as SearchCategory,
  categoryLabel: "📚 循证百科",
  keywords: [
    topic.title,
    topic.subtitle ?? "",
    ...(topic.searchKeywords ?? []),
    topic.category,
  ].filter(Boolean),
  route: `/wiki?topic=${topic.id}`,
  priority: topic.priorityOrder,
  badge: RISK_BADGE[topic.riskLevel],
}));

// ─────────────────────────────────────────────────────────────────────────────
// 4. 动态聚合：顶刊研究
// ─────────────────────────────────────────────────────────────────────────────

const STUDY_TYPE_BADGE: Record<string, string> = {
  rct: "RCT",
  meta_analysis: "Meta",
  prospective_multicenter: "前瞻多中心",
  retrospective_multicenter: "回顾多中心",
  retrospective: "回顾研究",
};

const STUDY_ENTRIES: SearchEntry[] = FEATURED_STUDIES.map((study) => ({
  id: `study:${study.id}`,
  title: study.title.length > 70 ? study.title.slice(0, 68) + "…" : study.title,
  subtitle: `${study.journal} · ${study.year} · N=${study.patientN.toLocaleString()}`,
  description: study.keyConclusions[0] ?? "",
  category: "study" as SearchCategory,
  categoryLabel: "📄 临床研究",
  keywords: [
    study.id.replace(/_/g, " "),
    study.journal,
    String(study.year),
    ...(study.relevantFactors ?? []),
    ...(study.applicableStages ?? []),
    study.keyConclusions.join(" "),
  ].filter(Boolean),
  route: `/studies`,
  priority: study.evidenceLevel * 10 + 30,
  badge: STUDY_TYPE_BADGE[study.studyType] ?? "研究",
}));

// ─────────────────────────────────────────────────────────────────────────────
// 5. 动态聚合：靶向药物 + 医学同义词扩展
// ─────────────────────────────────────────────────────────────────────────────

const DRUG_ALIASES: Record<string, string[]> = {
  osimertinib: ["泰瑞沙", "奥希替尼", "AZD9291", "三代EGFR", "第三代靶向药", "T790M"],
  aumolertinib: ["阿美乐", "阿美替尼", "国产三代"],
  furmonertinib: ["艾弗沙", "伏美替尼", "国产三代", "20外显子插入", "20ins"],
  befotertinib: ["赛美纳", "贝福替尼", "国产三代"],
  icotinib: ["凯美纳", "埃克替尼", "国产一代"],
  gefitinib: ["易瑞沙", "吉非替尼", "集采", "一代EGFR"],
  erlotinib: ["特罗凯", "厄洛替尼", "一代EGFR"],
  afatinib: ["吉泰瑞", "阿法替尼", "二代不可逆"],
  dacomitinib: ["多泽润", "达可替尼", "二代EGFR", "脑转移"],
  alectinib: ["安圣莎", "阿来替尼", "ALK靶向", "二代ALK"],
  lorlatinib: ["劳拉替尼", "洛拉替尼", "三代ALK", "脑转移ALK"],
  brigatinib: ["布格替尼", "布加替尼", "二代ALK"],
  ensartinib: ["恩沙替尼", "国产ALK"],
  sotorasib: ["索托拉西布", "KRAS G12C", "KRAS靶向", "AMG510"],
  savolitinib: ["赛沃替尼", "MET 14跳跃", "MET扩增"],
  selpercatinib: ["塞普替尼", "RET融合"],
  pralsetinib: ["普拉替尼", "RET融合"],
};

const DRUG_ENTRIES: SearchEntry[] = TARGETED_DRUGS.map((drug) => ({
  id: `drug:${drug.id}`,
  title: `${drug.brandName.split(" / ")[0]} (${drug.genericName
    .replace("甲磺酸", "").replace("盐酸", "").replace("马来酸", "")
    .replace("片", "").replace("胶囊", "").trim()})`,
  subtitle: `${drug.generation} · ${drug.target}`,
  description: `${drug.target} 靶点 ${drug.generation}，${drug.standardDosage}`,
  category: "drug" as SearchCategory,
  categoryLabel: "💊 特药医保",
  keywords: [
    drug.genericName,
    drug.brandName,
    drug.target,
    drug.generation,
    drug.id,
    ...(DRUG_ALIASES[drug.id] ?? []),
  ].filter(Boolean),
  route: `/reimbursement`,
  priority: drug.target === "EGFR" ? 65 : drug.target === "ALK" ? 60 : 55,
  badge: drug.target,
}));

// ─────────────────────────────────────────────────────────────────────────────
// 6. 动态聚合：医学影像/病理术语
// ─────────────────────────────────────────────────────────────────────────────

const GLOSSARY_ENTRIES: SearchEntry[] = Object.values(CLINICAL_GLOSSARY).map((term) => ({
  id: `glossary:${term.term}`,
  title: term.term,
  subtitle: term.enName,
  description: term.summary,
  category: "glossary" as SearchCategory,
  categoryLabel: "📖 医学术语",
  keywords: [
    term.term,
    term.enName,
    term.categoryLabel,
    term.summary,
  ].filter(Boolean),
  route: `/wiki`,
  priority: 25,
  badge: term.categoryLabel,
}));

// ─────────────────────────────────────────────────────────────────────────────
// 7. 合并全部索引（优先级降序）
// ─────────────────────────────────────────────────────────────────────────────

export const SEARCH_INDEX: SearchEntry[] = [
  ...TOOL_ENTRIES,
  ...WIKI_ENTRIES,
  ...STUDY_ENTRIES,
  ...DRUG_ENTRIES,
  ...GLOSSARY_ENTRIES,
].sort((a, b) => b.priority - a.priority);

// ─────────────────────────────────────────────────────────────────────────────
// 8. 搜索匹配算法：多词 AND 逻辑 + 标题前置权重
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResult {
  entry: SearchEntry;
  score: number;
}

export function searchIndex(query: string, maxResults = 20): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // 按空格或全角空格拆分为多个词（AND 逻辑）
  const terms = q.split(/[\s　]+/).filter(Boolean);

  const results: SearchResult[] = [];

  for (const entry of SEARCH_INDEX) {
    const titleLower = entry.title.toLowerCase();
    const subtitleLower = (entry.subtitle ?? "").toLowerCase();
    const descLower = entry.description.toLowerCase();
    const keywordsLower = entry.keywords.map((k) => k.toLowerCase());

    let score = 0;
    let allTermsMatch = true;

    for (const term of terms) {
      let termScore = 0;

      if (titleLower === term)                                              termScore = 100;
      else if (titleLower.startsWith(term))                                termScore = 80;
      else if (titleLower.includes(term))                                  termScore = 60;
      else if (subtitleLower.includes(term))                               termScore = 45;
      else if (keywordsLower.some((k) => k === term))                      termScore = 40;
      else if (keywordsLower.some((k) => k.includes(term)))               termScore = 30;
      else if (descLower.includes(term))                                   termScore = 15;
      else {
        allTermsMatch = false;
        break;
      }

      score += termScore;
    }

    if (!allTermsMatch) continue;

    // 叠加条目本身的 priority 权重
    score += entry.priority * 0.3;

    results.push({ entry, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. 分组结果（按 category 分组，供 UI 渲染）
// ─────────────────────────────────────────────────────────────────────────────

export interface GroupedResults {
  category: SearchCategory;
  categoryLabel: string;
  entries: SearchResult[];
}

export function groupSearchResults(results: SearchResult[]): GroupedResults[] {
  const ORDER: SearchCategory[] = ["tool", "wiki", "drug", "study", "glossary"];
  const map = new Map<SearchCategory, SearchResult[]>();

  for (const result of results) {
    const cat = result.entry.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(result);
  }

  return ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    categoryLabel: map.get(cat)![0].entry.categoryLabel,
    entries: map.get(cat)!.slice(0, 5),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. 热门搜索推荐 & 快捷工具（空状态展示）
// ─────────────────────────────────────────────────────────────────────────────

export const HOT_SEARCHES = [
  "磨玻璃结节",
  "EGFR 19del",
  "STAS 阳性",
  "奥希替尼",
  "ADAURA",
  "胸膜侵犯",
  "用药冲突",
  "医保报销",
  "淋巴结清扫",
  "倍增时间",
];

export const QUICK_TOOLS = [
  { title: "靶向药用药冲突自检 (DDI)", route: "/wiki?topic=drug-drug-interactions-ddi", badge: "🧪" },
  { title: "纵隔淋巴结 4D 图谱", route: "/wiki?topic=mediastinal-lymph-node-map", badge: "🫁" },
  { title: "特药医保赠药计算器", route: "/reimbursement", badge: "💊" },
  { title: "我的时间生命线", route: "/timeline", badge: "⏰" },
];
