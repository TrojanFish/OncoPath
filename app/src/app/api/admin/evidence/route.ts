import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "未授权的访问：请先登录管理员账户" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    // Fetch all ingested studies
    const allStudies = await prisma.ingestedStudy.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const filtered = q
      ? allStudies.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.journal && s.journal.toLowerCase().includes(q)) ||
            (s.authors && s.authors.toLowerCase().includes(q)) ||
            (s.keywords && s.keywords.toLowerCase().includes(q))
        )
      : allStudies;

    // Calculate aggregated metrics
    const totalStudies = allStudies.length;
    const totalPatients = allStudies.reduce((acc, s) => acc + (s.patientN || 0), 0);
    const rctMetaCount = allStudies.filter(
      (s) => s.studyType === 'rct' || s.studyType === 'meta_analysis'
    ).length;

    return NextResponse.json({
      success: true,
      studies: filtered,
      metrics: {
        totalStudies,
        totalPatients,
        rctMetaCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin evidence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "未授权的访问：请先登录管理员账户" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      journal,
      year,
      authors,
      studyType,
      evidenceLevel,
      patientN,
      doi,
      pubmedId,
      applicableStages,
      relevantFactors,
      summary,
      conclusion,
      keywords,
      hr,
      ciLow,
      ciHigh,
      rfs5Year,
      biomarkerDetails,
      interventionArm,
      riskReduction,
      url,
      pdfFileName,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "论文标题不能为空" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const cleanDoi = doi ? doi.trim() : null;
    const cleanPmid = pubmedId ? pubmedId.trim() : null;

    const stagesStr = Array.isArray(applicableStages) ? JSON.stringify(applicableStages) : applicableStages || "[]";
    const factorsStr = Array.isArray(relevantFactors) ? JSON.stringify(relevantFactors) : relevantFactors || "[]";

    // -------------------------------------------------------------
    // 3-Tier Intelligent Deduplication:
    // 1. Check by DOI (Global Unique Identifier)
    // 2. Check by PubMed ID
    // 3. Check by Normalized Title
    // -------------------------------------------------------------
    let existingStudy = null;

    if (cleanDoi) {
      existingStudy = await prisma.ingestedStudy.findFirst({
        where: { doi: { equals: cleanDoi, mode: 'insensitive' } }
      });
    }

    if (!existingStudy && cleanPmid) {
      existingStudy = await prisma.ingestedStudy.findFirst({
        where: { pubmedId: { equals: cleanPmid, mode: 'insensitive' } }
      });
    }

    if (!existingStudy && cleanTitle) {
      existingStudy = await prisma.ingestedStudy.findFirst({
        where: { title: { equals: cleanTitle, mode: 'insensitive' } }
      });
    }

    let savedStudy;
    let isUpdate = false;

    if (existingStudy) {
      // Automatic Deduplication: Update & enrich existing study in-place
      isUpdate = true;
      savedStudy = await prisma.ingestedStudy.update({
        where: { id: existingStudy.id },
        data: {
          title: cleanTitle,
          journal: journal || existingStudy.journal,
          year: year ? parseInt(year) : existingStudy.year,
          authors: authors || existingStudy.authors,
          studyType: studyType || existingStudy.studyType,
          evidenceLevel: evidenceLevel ? parseInt(evidenceLevel) : existingStudy.evidenceLevel,
          patientN: patientN ? parseInt(patientN) : existingStudy.patientN,
          doi: cleanDoi || existingStudy.doi,
          pubmedId: cleanPmid || existingStudy.pubmedId,
          applicableStages: stagesStr,
          relevantFactors: factorsStr,
          summary: summary || existingStudy.summary,
          conclusion: conclusion || existingStudy.conclusion,
          keywords: keywords || existingStudy.keywords,
          hr: hr !== undefined && hr !== null && hr !== "" ? parseFloat(hr) : existingStudy.hr,
          ciLow: ciLow !== undefined && ciLow !== null && ciLow !== "" ? parseFloat(ciLow) : existingStudy.ciLow,
          ciHigh: ciHigh !== undefined && ciHigh !== null && ciHigh !== "" ? parseFloat(ciHigh) : existingStudy.ciHigh,
          rfs5Year: rfs5Year || existingStudy.rfs5Year,
          biomarkerDetails: biomarkerDetails || existingStudy.biomarkerDetails,
          interventionArm: interventionArm || existingStudy.interventionArm,
          riskReduction: riskReduction || existingStudy.riskReduction,
          url: url || (cleanDoi ? `https://doi.org/${cleanDoi}` : existingStudy.url),
          pdfFileName: pdfFileName || existingStudy.pdfFileName,
        }
      });
    } else {
      // Create new study
      savedStudy = await prisma.ingestedStudy.create({
        data: {
          title: cleanTitle,
          journal: journal || null,
          year: year ? parseInt(year) : null,
          authors: authors || null,
          studyType: studyType || "retrospective",
          evidenceLevel: evidenceLevel ? parseInt(evidenceLevel) : 4,
          patientN: patientN ? parseInt(patientN) : null,
          doi: cleanDoi || null,
          pubmedId: cleanPmid || null,
          applicableStages: stagesStr,
          relevantFactors: factorsStr,
          summary: summary || null,
          conclusion: conclusion || null,
          keywords: keywords || null,
          hr: hr !== undefined && hr !== null && hr !== "" ? parseFloat(hr) : null,
          ciLow: ciLow !== undefined && ciLow !== null && ciLow !== "" ? parseFloat(ciLow) : null,
          ciHigh: ciHigh !== undefined && ciHigh !== null && ciHigh !== "" ? parseFloat(ciHigh) : null,
          rfs5Year: rfs5Year || null,
          biomarkerDetails: biomarkerDetails || null,
          interventionArm: interventionArm || null,
          riskReduction: riskReduction || null,
          url: url || (cleanDoi ? `https://doi.org/${cleanDoi}` : null),
          pdfFileName: pdfFileName || null,
        },
      });
    }

    // Also sync to standard Study model for Knowledge Graph linkage if DOI present
    if (cleanDoi) {
      const existingGraphStudy = await prisma.study.findUnique({
        where: { doi: cleanDoi }
      });
      if (!existingGraphStudy) {
        await prisma.study.create({
          data: {
            doi: cleanDoi,
            title: cleanTitle,
            journal: journal || null,
            publishedYear: year ? parseInt(year) : null,
            conclusion: conclusion || summary || "",
          }
        });
      } else {
        await prisma.study.update({
          where: { doi: cleanDoi },
          data: {
            title: cleanTitle,
            journal: journal || existingGraphStudy.journal,
            publishedYear: year ? parseInt(year) : existingGraphStudy.publishedYear,
            conclusion: conclusion || summary || existingGraphStudy.conclusion,
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      isUpdate, 
      message: isUpdate ? "检测到已收录文献，已自动去重并更新" : "新文献入库成功", 
      data: savedStudy 
    });
  } catch (error: any) {
    console.error('Error saving admin evidence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "未授权的访问：请先登录管理员账户" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing study ID" }, { status: 400 });
    }

    await prisma.ingestedStudy.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Study deleted successfully" });
  } catch (error: any) {
    console.error('Error deleting study:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
