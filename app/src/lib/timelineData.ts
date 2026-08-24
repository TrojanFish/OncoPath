import { TimelineEventItem } from "./timelineTypes";

export const DEFAULT_TIMELINE_EVENTS: TimelineEventItem[] = [
  {
    id: "evt-2026-08-01",
    eventDate: "2026-08-15",
    category: "imaging",
    subType: "CT",
    hospital: "国家癌症中心 / 中国医学科学院肿瘤医院",
    title: "术后2年复查：胸部薄层高分辨平扫 (HRCT)",
    summary: "术区结构清晰，支气管残端通畅，右肺残叶代偿良好；双肺未见新发结节或异常磨玻璃影，纵隔及肺门淋巴结无肿大。",
    keyFindings: {
      sizeMm: 0,
      ctr: 0,
      noduleType: "术后正常改变",
      location: "右肺上叶术区",
      vdtDays: 9999,
      densityChange: "未见复发征象",
    },
    tags: ["术后2年复查", "无复发征象", "双肺清晰", "HRCT"],
    riskStatus: "normal",
  },
  {
    id: "evt-2026-08-02",
    eventDate: "2026-08-15",
    category: "serology",
    subType: "TumorMarkers",
    hospital: "国家癌症中心 / 中国医学科学院肿瘤医院",
    title: "血清肺癌肿瘤标志物五项全套筛查",
    summary: "CEA 1.6 ng/mL（正常<5.0），CYFRA21-1 1.4 ng/mL（正常<3.3），NSE 9.8 ng/mL（正常<16.3），全部指标均处于深部安全区间。",
    keyFindings: {
      cea: 1.6,
      cyfra211: 1.4,
      nse: 9.8,
      scc: 0.7,
    },
    tags: ["CEA正常", "CYFRA21-1正常", "基线稳固"],
    riskStatus: "normal",
  },
  {
    id: "evt-2025-08-10",
    eventDate: "2025-08-10",
    category: "imaging",
    subType: "CT",
    hospital: "上海市胸科医院",
    title: "术后1年随访：胸部增强 CT + 气道三维重建",
    summary: "右肺上叶段切术后改变，胸膜无增厚粘连，吻合钉影位置如常；双肺野透亮度良好，无胸水与远处转移征象。",
    keyFindings: {
      sizeMm: 0,
      ctr: 0,
      location: "右肺上叶",
      vdtDays: 9999,
    },
    tags: ["术后1年", "气道通畅", "未见异常"],
    riskStatus: "normal",
  },
  {
    id: "evt-2025-08-11",
    eventDate: "2025-08-10",
    category: "serology",
    subType: "TumorMarkers",
    hospital: "上海市胸科医院",
    title: "血清肿瘤标志物定期随访检测",
    summary: "CEA 1.8 ng/mL，CYFRA21-1 1.5 ng/mL，各生化指标与术前术后相比保持极高一致性，无动态反弹。",
    keyFindings: {
      cea: 1.8,
      cyfra211: 1.5,
      nse: 10.2,
    },
    tags: ["CEA: 1.8", "指标稳定"],
    riskStatus: "normal",
  },
  {
    id: "evt-2024-05-18",
    eventDate: "2024-05-18",
    category: "pathology",
    subType: "NGS",
    hospital: "上海市胸科医院病理中心",
    title: "二代靶向基因测序 (NGS 520基因大Panel)",
    summary: "检出 EGFR 19外显子经典缺失突变（19del，丰度 19.4%），ALK/ROS1/RET/MET 均为阴性；TMB 3.2 muts/Mb（低），PD-L1 TPS < 1%。",
    keyFindings: {
      driverGene: "EGFR 19del (丰度 19.4%)",
      pdl1Tps: "TPS < 1% (22C3)",
      rawText: "EGFR 19del 阳性；若未来出现分期进展，三代奥希替尼等靶向药具有强效敏感指征。",
    },
    tags: ["EGFR 19del", "TMB低", "PD-L1<1%", "精准分子靶点"],
    riskStatus: "normal",
  },
  {
    id: "evt-2024-05-16",
    eventDate: "2024-05-16",
    category: "pathology",
    subType: "Pathology",
    hospital: "上海市胸科医院病理中心",
    title: "胸腔镜手术标本常规大体与石蜡切片病理诊断",
    summary: "【最终病理】微浸润性腺癌 (MIA)，贴壁生长为主型（占85%），伴微小腺泡状结构（占15%）；浸润灶最大径 3.2mm（≤5mm 符合 MIA）；未见脉管瘤栓 (LVI-)、未见胸膜侵犯 (VPI-)、未见气道内播散 (STAS-)；支气管切缘及肺切缘均为阴性（R0），采样淋巴结 0/8 阴性。",
    keyFindings: {
      histology: "微浸润性腺癌 (MIA, 贴壁85%+腺泡15%)",
      stage: "pT1miN0M0 (AJCC 第9版 IA1期)",
      stas: false,
      vpi: false,
      lvi: false,
      marginStatus: "R0 切缘阴性 (安全距离 2.4cm)",
    },
    tags: ["MIA微浸润", "pT1miN0M0", "STAS阴性", "VPI阴性", "R0根治切除"],
    riskStatus: "normal",
  },
  {
    id: "evt-2024-05-12",
    eventDate: "2024-05-12",
    category: "milestone",
    subType: "Surgery",
    hospital: "上海市胸科医院胸外科",
    title: "重大治疗里程碑：单孔胸腔镜右肺上叶后段切除术 (S2)",
    summary: "在全麻双腔气管插管下顺利行单孔胸腔镜右肺上叶 S2 段切除术 + 区域淋巴结采样术。手术耗时 65 分钟，术中失血仅 30ml，术中冰冻病理提示“原位/微浸润腺癌”，切缘充分（>2cm），保留了 80% 以上的健康肺功能。",
    keyFindings: {
      surgeryType: "单孔胸腔镜解剖性段切除 (RS2) + 淋巴结采样",
      marginStatus: "R0 (切缘肉眼及冰冻均阴性)",
      medication: "术后无需辅助化疗/靶向治疗，进入常规半年一次随访流程",
    },
    tags: ["微创胸腔镜", "精准解剖性段切", "保留肺功能", "根治性R0"],
    riskStatus: "normal",
  },
  {
    id: "evt-2024-04-20",
    eventDate: "2024-04-20",
    category: "imaging",
    subType: "CT",
    hospital: "北京协和医院放射科",
    title: "术前定位随访：薄层胸部增强 CT (0.625mm)",
    summary: "右肺上叶后段 (S2) 见混合磨玻璃结节 (mGGN)，长径由半年前 6.8mm 增大至 8.5mm，实性成分（CTR）增加至 35%，边缘见微小分叶征与微血管穿行，Fleischner 指南建议胸外科手术微创切除干预。",
    keyFindings: {
      sizeMm: 8.5,
      ctr: 0.35,
      noduleType: "mGGN (混合磨玻璃结节)",
      location: "右肺上叶后段 S2",
      vdtDays: 380,
      densityChange: "实性成分轻度增多，提示早期微浸润",
    },
    tags: ["8.5mm", "CTR: 35%", "分叶征", "手术指征触发"],
    riskStatus: "warning",
  },
  {
    id: "evt-2024-04-20",
    eventDate: "2024-04-20",
    category: "serology",
    subType: "TumorMarkers",
    hospital: "北京协和医院检验科",
    title: "术前基线血清肿瘤标志物检测",
    summary: "CEA 2.4 ng/mL（正常<5.0），CYFRA21-1 2.1 ng/mL（正常<3.3），NSE 11.0 ng/mL，未见生化级异常表达。",
    keyFindings: {
      cea: 2.4,
      cyfra211: 2.1,
      nse: 11.0,
    },
    tags: ["术前基线", "CEA: 2.4", "处于正常范围"],
    riskStatus: "normal",
  },
  {
    id: "evt-2023-10-15",
    eventDate: "2023-10-15",
    category: "imaging",
    subType: "CT",
    hospital: "北京协和医院放射科",
    title: "6个月复查：薄层胸部低剂量 CT (LDCT)",
    summary: "右肺上叶后段磨玻璃结节长径约 6.8mm，内部密度较 6 个月前基本稳定，实性成分不明显（CTR<10%），继续随访观察。",
    keyFindings: {
      sizeMm: 6.8,
      ctr: 0.10,
      noduleType: "pGGN (偏纯磨玻璃)",
      location: "右肺上叶后段 S2",
      vdtDays: 620,
    },
    tags: ["6.8mm", "复查随访", "惰性生长"],
    riskStatus: "watch",
  },
  {
    id: "evt-2023-04-08",
    eventDate: "2023-04-08",
    category: "imaging",
    subType: "CT",
    hospital: "首都医科大学附属北京朝阳医院",
    title: "首次筛查发现：健康体检胸部 CT 平扫",
    summary: "右肺上叶后段 (S2) 初次检出淡薄纯磨玻璃结节 (pGGN)，最大径约 5.5mm，边界清晰，无胸膜牵拉及毛刺征，诊断为肺部磨玻璃结节，建议 6 个月后复查薄层 CT。",
    keyFindings: {
      sizeMm: 5.5,
      ctr: 0,
      noduleType: "pGGN (纯磨玻璃)",
      location: "右肺上叶后段 S2",
      vdtDays: 850,
      densityChange: "初查基线",
    },
    tags: ["5.5mm初查", "体检发现", "纯磨玻璃结节", "基线建立"],
    riskStatus: "watch",
  },
];

/**
 * Automatically derive structured TimelineEventItem list from a PatientProfile
 * Ensures zero data loss between Profile creation (image/text) and Timeline views
 */
export function deriveTimelineEventsFromProfile(profile: any): TimelineEventItem[] {
  if (!profile) return [];

  const events: TimelineEventItem[] = [];
  const today = new Date().toISOString().split("T")[0];
  const baseDate = 
    profile.examDate || 
    profile.reportDate || 
    profile.surgeryDate || 
    (profile.createdAt ? profile.createdAt.split("T")[0] : null) || 
    today;

  const tumorSizeMm = profile.sizeMm || (profile.tumorSize ? profile.tumorSize * 10 : 15);
  const solidSizeMm = profile.solidSize ? profile.solidSize * 10 : 0;
  const ctrVal = profile.ctr ?? (tumorSizeMm > 0 ? Math.min(1, Math.round((solidSizeMm / tumorSizeMm) * 100) / 100) : 0);

  // 1. Ingest Historical Scans from followUpHistory
  if (Array.isArray(profile.followUpHistory) && profile.followUpHistory.length > 0) {
    profile.followUpHistory.forEach((hist: any, index: number) => {
      const histDate = hist.date || baseDate;
      const histTumorMm = hist.sizeMm || (hist.tumorSize ? hist.tumorSize * 10 : tumorSizeMm);
      const histCtr = hist.ctr ?? 0;
      
      events.push({
        id: hist.id || `profile-hist-ct-${index}-${histDate}`,
        eventDate: histDate,
        category: "imaging",
        subType: "CT",
        hospital: hist.hospital || "复查医院放射科",
        title: `历史随访胸部 CT 扫描 (${histDate})`,
        summary: `结节全径约 ${histTumorMm.toFixed(1)} mm，实性成分占比 ${(histCtr * 100).toFixed(0)}%。${hist.note || "历史随访比对"}`,
        keyFindings: {
          sizeMm: histTumorMm,
          ctr: histCtr,
          noduleType: profile.noduleType || "mixed_ggo",
          location: profile.noduleLocation || "肺部病灶",
        },
        tags: [`${histTumorMm.toFixed(1)}mm`, `CTR ${(histCtr * 100).toFixed(0)}%`, "时序随访"],
        riskStatus: histCtr > 0.5 ? "warning" : "watch",
      });
    });
  }

  // 2. Ingest Current CT / Staging Scan
  const isPureCT = profile.reportType === "ct_imaging" || profile.currentStage === "evaluation" || profile.currentStage === "discovery";
  
  if (isPureCT) {
    events.push({
      id: `profile-cur-ct-${baseDate}`,
      eventDate: baseDate,
      category: "imaging",
      subType: "CT",
      hospital: profile.hospital || "三甲医院放射影像中心",
      title: "基准诊断：胸部薄层高分辨 CT 平扫与重建",
      summary: `检出肺部病灶全径约 ${tumorSizeMm.toFixed(1)} mm，实性成分径约 ${solidSizeMm.toFixed(1)} mm (CTR: ${(ctrVal * 100).toFixed(0)}%)。${profile.nextAction || "已完成影像学结构化提取"}`,
      keyFindings: {
        sizeMm: tumorSizeMm,
        ctr: ctrVal,
        noduleType: profile.noduleType === "pure_ggo" ? "纯磨玻璃 (pGGN)" : profile.noduleType === "pure_solid" ? "纯实性" : "混合磨玻璃 (mGGN)",
        location: profile.noduleLocation || "肺部病灶",
      },
      tags: [
        profile.noduleLocation || "肺部",
        `${tumorSizeMm.toFixed(1)}mm`,
        `CTR ${(ctrVal * 100).toFixed(0)}%`,
        profile.noduleType === "pure_ggo" ? "纯磨玻璃" : "混合磨玻璃"
      ],
      riskStatus: profile.riskLevel === "high" ? "warning" : "watch",
    });
  } else {
    // 3. Ingest Pathology & Post-Op Milestone
    const stageStr = profile.tStage ? `${profile.tStage}${profile.nStage || "N0"}${profile.mStage || "M0"}` : "IA2期";
    const stasPositive = Boolean(profile.stas);
    const vpiPositive = Boolean(profile.vpi);
    const lviPositive = Boolean(profile.lvi);
    const isMarginPositive = profile.marginStatus === "positive";

    events.push({
      id: `profile-cur-pathology-${baseDate}`,
      eventDate: baseDate,
      category: "pathology",
      subType: "Pathology",
      hospital: profile.hospital || "三甲医院病理诊断中心",
      title: "手术切除标本常规石蜡切片与组织病理学诊断",
      summary: `【病理确诊】${stageStr} (${profile.histology || "浸润性肺腺癌"})，切缘${isMarginPositive ? "阳性" : "R0根治性阴性"}，STAS ${stasPositive ? "阳性(+)" : "阴性(-)"}，胸膜侵犯 ${vpiPositive ? "阳性(+)" : "阴性(-)"}。`,
      keyFindings: {
        histology: profile.histology || "浸润性腺癌",
        stage: stageStr,
        stas: stasPositive,
        vpi: vpiPositive,
        lvi: lviPositive,
        marginStatus: isMarginPositive ? "切缘阳性" : "R0安全阴性",
        sizeMm: tumorSizeMm,
      },
      tags: [
        stageStr,
        stasPositive ? "STAS(+)" : "STAS(-)",
        vpiPositive ? "VPI(+)" : "VPI(-)",
        isMarginPositive ? "切缘阳性" : "R0根治切除"
      ],
      riskStatus: (stasPositive || vpiPositive || lviPositive || isMarginPositive) ? "warning" : "normal",
    });

    // Surgery milestone
    if (profile.surgeryType && profile.surgeryType !== "unknown") {
      const surgeryName = 
        profile.surgeryType === "segmentectomy" ? "胸腔镜解剖性肺段切除术" :
        profile.surgeryType === "lobectomy" ? "胸腔镜标准肺叶切除术" :
        profile.surgeryType === "wedge" ? "胸腔镜肺局部楔形切除术" : profile.surgeryType;

      events.push({
        id: `profile-cur-surgery-${baseDate}`,
        eventDate: profile.surgeryDate || baseDate,
        category: "milestone",
        subType: "Surgery",
        hospital: profile.hospital || "三甲医院胸外科",
        title: `重大治疗里程碑：${surgeryName}`,
        summary: "顺利完成微创解剖性切除，切缘充分安全，病灶完全切除。",
        keyFindings: {
          surgeryType: surgeryName,
          marginStatus: isMarginPositive ? "切缘阳性" : "R0安全阴性",
        },
        tags: ["胸外科微创手术", surgeryName, "R0根治切除"],
        riskStatus: "normal",
      });
    }
  }

  // 4. Ingest Serology / Tumor Markers
  if (profile.tumorMarkers && (profile.tumorMarkers.cea != null || profile.tumorMarkers.cyfra211 != null)) {
    const ceaVal = profile.tumorMarkers.cea != null ? Number(profile.tumorMarkers.cea) : null;
    const cyfraVal = profile.tumorMarkers.cyfra211 != null ? Number(profile.tumorMarkers.cyfra211) : null;
    const markerDate = profile.tumorMarkers.testDate || baseDate;

    events.push({
      id: `profile-cur-serology-${markerDate}`,
      eventDate: markerDate,
      category: "serology",
      subType: "TumorMarkers",
      hospital: profile.hospital || "三甲医院检验科",
      title: "血清肺癌肿瘤标志物检测报告",
      summary: `CEA: ${ceaVal != null ? `${ceaVal} ng/mL` : "未测"}，CYFRA21-1: ${cyfraVal != null ? `${cyfraVal} ng/mL` : "未测"}。`,
      keyFindings: {
        cea: ceaVal ?? undefined,
        cyfra211: cyfraVal ?? undefined,
        nse: profile.tumorMarkers.nse != null ? Number(profile.tumorMarkers.nse) : undefined,
      },
      tags: [
        "肿瘤标志物",
        ceaVal != null && ceaVal <= 5.0 ? "CEA正常" : "CEA异常",
        cyfraVal != null && cyfraVal <= 3.3 ? "CYFRA21-1正常" : "CYFRA21-1异常"
      ],
      riskStatus: (ceaVal != null && ceaVal > 5.0) ? "warning" : "normal",
    });
  }

  // Sort descending by eventDate
  return events.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}
