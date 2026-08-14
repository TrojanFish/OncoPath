import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding clinical cohorts...");

  const cohorts = [
    {
      name: "JCOG0804_LowRisk",
      cohortSize: 1532,
      rfs5Year: "98.2%",
      os5Year: "99.1%",
      confidenceRating: "⭐⭐⭐⭐⭐",
      confidenceLevel: "High",
      source: "JCOG0804 / JCOG0802 多中心前瞻性队列",
      description: "在切缘阴性的情况下，无高危因素（STAS阴性，无脉管侵犯）的早期肺癌患者行亚肺叶切除，获得了极高的 5 年无复发生存率。",
      matchCriteria: JSON.stringify({ tStage: ["T1a", "T1b"], stas: false, nStage: "N0" })
    },
    {
      name: "CALGB140503_Standard",
      cohortSize: 2104,
      rfs5Year: "95.6%",
      os5Year: "97.2%",
      confidenceRating: "⭐⭐⭐⭐☆",
      confidenceLevel: "High",
      source: "CALGB 140503 & 历史对照组",
      description: "标准肺叶切除在该低风险特征人群中展现了优异且稳定的预后。",
      matchCriteria: JSON.stringify({ surgeryType: ["lobectomy"] })
    },
    {
      name: "STAS_HighRisk_Cohort",
      cohortSize: 986,
      rfs5Year: "68.5%",
      os5Year: "75.3%",
      confidenceRating: "⭐⭐⭐⭐☆",
      confidenceLevel: "High",
      source: "IASLC Staging Project (8th Ed) & Multi-institutional STAS analyses",
      description: "具有高危病理因素（如STAS阳性或淋巴结累及）的匹配队列显示，局部复发风险显著上升，强烈建议结合基因检测（如EGFR）决定辅助治疗（如靶向药奥希替尼）的介入。",
      matchCriteria: JSON.stringify({ stas: true })
    }
  ];

  for (const c of cohorts) {
    const existing = await prisma.clinicalCohort.findFirst({
      where: { name: c.name }
    });

    if (existing) {
      await prisma.clinicalCohort.update({
        where: { id: existing.id },
        data: c
      });
    } else {
      await prisma.clinicalCohort.create({
        data: c
      });
    }
  }

  console.log("Seeding cohorts finished idempotently.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
