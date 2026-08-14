import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
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
      pdfFileName,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "论文标题不能为空" }, { status: 400 });
    }

    const stagesStr = Array.isArray(applicableStages) ? JSON.stringify(applicableStages) : applicableStages || "[]";
    const factorsStr = Array.isArray(relevantFactors) ? JSON.stringify(relevantFactors) : relevantFactors || "[]";

    // Save to IngestedStudy in DB
    const savedStudy = await prisma.ingestedStudy.create({
      data: {
        title,
        journal: journal || null,
        year: year ? parseInt(year) : null,
        authors: authors || null,
        studyType: studyType || "retrospective",
        evidenceLevel: evidenceLevel ? parseInt(evidenceLevel) : 4,
        patientN: patientN ? parseInt(patientN) : null,
        doi: doi || null,
        pubmedId: pubmedId || null,
        applicableStages: stagesStr,
        relevantFactors: factorsStr,
        summary: summary || null,
        conclusion: conclusion || null,
        keywords: keywords || null,
        hr: hr ? parseFloat(hr) : null,
        ciLow: ciLow ? parseFloat(ciLow) : null,
        ciHigh: ciHigh ? parseFloat(ciHigh) : null,
        rfs5Year: rfs5Year || null,
        biomarkerDetails: biomarkerDetails || null,
        interventionArm: interventionArm || null,
        riskReduction: riskReduction || null,
        pdfFileName: pdfFileName || null,
      },
    });

    // Also sync to standard Study model for Knowledge Graph linkage if DOI present
    if (doi) {
      const existingStudy = await prisma.study.findUnique({
        where: { doi }
      });
      if (!existingStudy) {
        await prisma.study.create({
          data: {
            doi,
            title,
            journal: journal || null,
            publishedYear: year ? parseInt(year) : null,
            conclusion: conclusion || summary || "",
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: savedStudy });
  } catch (error: any) {
    console.error('Error saving admin evidence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
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
