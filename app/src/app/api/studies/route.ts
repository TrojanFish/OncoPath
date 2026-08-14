import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FEATURED_STUDIES } from '@/lib/evidence-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const level = searchParams.get('level') || 'all';

    // 1. Fetch Ingested Studies from Database
    let dbStudies: any[] = [];
    try {
      dbStudies = await prisma.ingestedStudy.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn("Could not load ingested studies from DB, falling back to static studies", e);
    }

    // 2. Format dbStudies into uniform Study format
    const formattedDbStudies = dbStudies.map((s) => {
      let relevantFactors: string[] = [];
      let applicableStages: string[] = [];
      try {
        if (s.relevantFactors) relevantFactors = JSON.parse(s.relevantFactors);
      } catch {
        relevantFactors = s.relevantFactors ? [s.relevantFactors] : [];
      }
      try {
        if (s.applicableStages) applicableStages = JSON.parse(s.applicableStages);
      } catch {
        applicableStages = s.applicableStages ? [s.applicableStages] : [];
      }

      const conclusions: string[] = [];
      if (s.conclusion) conclusions.push(s.conclusion);
      if (s.hr) conclusions.push(`主要终点风险比 HR: ${s.hr} ${s.ciLow && s.ciHigh ? `(95% CI: ${s.ciLow}-${s.ciHigh})` : ''}`);
      if (s.rfs5Year) conclusions.push(`5年无复发生存率 (5yr RFS): ${s.rfs5Year}`);
      if (s.riskReduction) conclusions.push(`相对获益/风险降低率: ${s.riskReduction}`);

      return {
        id: s.id,
        title: s.title,
        journal: s.journal || 'Journal',
        year: s.year || 2023,
        patientN: s.patientN || 0,
        studyType: s.studyType || 'retrospective',
        evidenceLevel: (s.evidenceLevel || 4) as 1 | 2 | 3 | 4 | 5,
        doi: s.doi || undefined,
        pubmedId: s.pubmedId || undefined,
        url: s.url || (s.doi ? `https://doi.org/${s.doi}` : (s.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${s.pubmedId}/` : undefined)),
        keyConclusions: conclusions.length > 0 ? conclusions : ['见完整研究文献'],
        relevantFactors: Array.isArray(relevantFactors) ? relevantFactors : ['肺癌预后'],
        applicableStages: Array.isArray(applicableStages) ? applicableStages : ['IA', 'IB', 'IIIA'],
        biomarkerDetails: s.biomarkerDetails || undefined,
        interventionArm: s.interventionArm || undefined,
        riskReduction: s.riskReduction || undefined,
        isIngested: true,
      };
    });

    // 3. Merge with predefined FEATURED_STUDIES (deduplicate by DOI or title)
    const existingDois = new Set(formattedDbStudies.map(s => s.doi).filter(Boolean));
    const staticStudies = FEATURED_STUDIES.filter(s => !s.doi || !existingDois.has(s.doi)).map(s => ({
      ...s,
      url: s.doi ? `https://doi.org/${s.doi}` : (s.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${s.pubmedId}/` : undefined)
    }));

    const combined = [...formattedDbStudies, ...staticStudies];

    // 4. Apply filtering
    let filtered = combined;
    if (level !== 'all') {
      const levelNum = parseInt(level, 10);
      filtered = filtered.filter(s => s.evidenceLevel === levelNum);
    }

    if (q) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.journal.toLowerCase().includes(q) ||
        s.relevantFactors.some(f => f.toLowerCase().includes(q)) ||
        s.keyConclusions.some(c => c.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      studies: filtered,
      totalCount: combined.length
    });
  } catch (error: any) {
    console.error("Error in /api/studies:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
