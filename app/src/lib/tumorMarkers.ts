import type { TumorMarkersData } from './types';

export interface MarkerEvaluation {
  key: keyof TumorMarkersData;
  nameZh: string;
  enName: string;
  value: number;
  unit: string;
  refRange: string;
  refMax: number;
  status: "normal" | "mildly_elevated" | "significantly_elevated";
  statusLabel: string;
  statusColor: string; // Tailwind color class / badge style
  reassuranceText: string;
  benignFactors: string[];
}

export const TUMOR_MARKER_DEFINITIONS: Record<string, {
  nameZh: string;
  enName: string;
  unit: string;
  refMax: number;
  refRange: string;
  benignFactors: string[];
  clinicalSignificance: string;
}> = {
  cea: {
    nameZh: "癌胚抗原 (CEA)",
    enName: "Carcinoembryonic Antigen",
    unit: "ng/mL",
    refMax: 5.0,
    refRange: "0 ~ 5.0 ng/mL",
    benignFactors: ["长期吸烟", "浅表性胃炎/反流性食管炎", "慢性结肠炎/息肉", "良性肺炎恢复期", "轻度肝功能异常"],
    clinicalSignificance: "非小细胞肺腺癌常用参考指标。但在正常参考值以内（<5.0）的任何数值起伏均属于人体生理性波动；轻度超标常与消化道或呼吸道良性炎症相关。"
  },
  cyfra211: {
    nameZh: "细胞角蛋白19片段 (CYFRA21-1)",
    enName: "Cytokeratin 19 Fragment",
    unit: "ng/mL",
    refMax: 3.3,
    refRange: "0 ~ 3.3 ng/mL",
    benignFactors: ["慢性支气管炎", "支气管扩张", "良性间质性肺纤维化", "肾功能不全"],
    clinicalSignificance: "对肺鳞癌及腺癌均有辅助参考意义。气道良性慢性炎症也可引起轻度增高。"
  },
  nse: {
    nameZh: "神经元特异性烯醇化酶 (NSE)",
    enName: "Neuron-Specific Enolase",
    unit: "ng/mL",
    refMax: 16.3,
    refRange: "0 ~ 16.3 ng/mL",
    benignFactors: ["抽血标本轻度溶血 (红细胞破损释放)", "剧烈运动后", "良性神经或脑血管病变"],
    clinicalSignificance: "小细胞神经内分泌肿瘤特异性标志物。抽血过程中红细胞破裂（溶血）是引起假阳性偏高最常见的原因。"
  },
  scc: {
    nameZh: "鳞状细胞癌抗原 (SCC)",
    enName: "Squamous Cell Carcinoma Antigen",
    unit: "ng/mL",
    refMax: 1.5,
    refRange: "0 ~ 1.5 ng/mL",
    benignFactors: ["皮肤湿疹/银屑病/皮炎", "慢性气道炎症", "取样汗液唾液污染"],
    clinicalSignificance: "主要与鳞状上皮病变相关。人体表皮或汗液含有大量 SCC，采样污染极易导致轻微假性偏高。"
  },
  proGrp: {
    nameZh: "胃泌素释放肽前体 (ProGRP)",
    enName: "Pro-Gastrin-Releasing Peptide",
    unit: "pg/mL",
    refMax: 65.0,
    refRange: "0 ~ 65.0 pg/mL",
    benignFactors: ["慢性肾功能不全 (肌酐清除率下降)", "胃酸分泌紊乱"],
    clinicalSignificance: "早期小细胞肺癌灵敏标志物。肾功能减退时代谢减慢可导致生理性积蓄轻度升高。"
  },
  ca125: {
    nameZh: "糖类抗原 125 (CA125)",
    enName: "Carbohydrate Antigen 125",
    unit: "U/mL",
    refMax: 35.0,
    refRange: "0 ~ 35.0 U/mL",
    benignFactors: ["胸膜反应/良性少量胸腔积液", "女性月经期/盆腔良性囊肿", "慢性肝炎/肝硬化", "肺炎恢复期"],
    clinicalSignificance: "常用于评估胸膜受累与腺癌体液代谢。胸膜受牵拉或良性炎症时常呈轻度生理性波动。"
  },
  ca199: {
    nameZh: "糖类抗原 19-9 (CA19-9)",
    enName: "Carbohydrate Antigen 19-9",
    unit: "U/mL",
    refMax: 27.0,
    refRange: "0 ~ 27.0 U/mL",
    benignFactors: ["慢性胆囊炎/胆石症", "浅表性胃炎/反流性食管炎", "结肠良性息肉", "轻度肝胆代谢负担"],
    clinicalSignificance: "消化道与肺腺癌辅助参考指标。消化系统常见良性炎症即可导致一过性轻度上浮。"
  },
  ca153: {
    nameZh: "糖类抗原 15-3 (CA15-3)",
    enName: "Carbohydrate Antigen 15-3",
    unit: "U/mL",
    refMax: 25.0,
    refRange: "0 ~ 25.0 U/mL",
    benignFactors: ["乳腺良性增生/纤维腺瘤", "良性肝病", "轻度代谢免疫波动"],
    clinicalSignificance: "腺上皮细胞分泌标志物。良性乳腺或肝脏改变常出现生理性轻微起伏。"
  },
  ferritin: {
    nameZh: "血清铁蛋白 (Ferritin / FER)",
    enName: "Serum Ferritin",
    unit: "ng/mL",
    refMax: 300.0,
    refRange: "20 ~ 300.0 ng/mL",
    benignFactors: ["机体良性急性/慢性炎症反应", "口服或注射补铁剂后", "脂肪肝/高血脂代谢综合征", "感冒发热期"],
    clinicalSignificance: "反映体内铁储备与急性时相反应蛋白。感冒发热、肝功能异常或轻度炎症时极易出现良性偏高。"
  }
};


/**
 * Evaluate patient's tumor markers dataset
 */
export function evaluateTumorMarkers(data?: TumorMarkersData | null): MarkerEvaluation[] {
  if (!data) return [];
  const results: MarkerEvaluation[] = [];

  for (const [key, def] of Object.entries(TUMOR_MARKER_DEFINITIONS)) {
    const rawVal = (data as any)[key];
    if (rawVal !== undefined && rawVal !== null && rawVal !== "" && !isNaN(Number(rawVal))) {
      const val = Number(rawVal);
      let status: "normal" | "mildly_elevated" | "significantly_elevated" = "normal";
      let statusLabel = "正常安全区间";
      let statusColor = "emerald";
      let reassuranceText = `当前数值处于绝对安全参考范围（${def.refRange}）内。在正常区间内的轻微起伏属于人体自然生理代谢波动，完全无需担心！`;

      if (val > def.refMax * 2) {
        status = "significantly_elevated";
        statusLabel = "显著升高 (需结合CT复查)";
        statusColor = "rose";
        reassuranceText = `当前数值超过正常上限两倍，建议携带胸部薄层 CT 影像至胸外科/肿瘤科门诊复查，排除气道活动性炎症或病灶代谢活跃。`;
      } else if (val > def.refMax) {
        status = "mildly_elevated";
        statusLabel = "轻度偏高 (多为良性/生理性)";
        statusColor = "amber";
        reassuranceText = `当前数值仅略高于参考上限。临床数据显示，超过 85% 的单项轻度偏高由【${def.benignFactors.slice(0, 3).join('、')}】等良性因素引起，以胸部薄层 CT 影像为准，建议 1~2 个月后复查对比。`;
      }

      results.push({
        key: key as keyof TumorMarkersData,
        nameZh: def.nameZh,
        enName: def.enName,
        value: val,
        unit: def.unit,
        refRange: def.refRange,
        refMax: def.refMax,
        status,
        statusLabel,
        statusColor,
        reassuranceText,
        benignFactors: def.benignFactors
      });
    }
  }

  return results;
}
