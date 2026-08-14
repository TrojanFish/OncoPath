import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Define State Engine logic based on input
    let currentStage = data.currentStage || 'evaluation';
    let riskLevel = data.riskLevel || 'unknown';
    let nextAction = data.nextAction || 'Consult your doctor for a detailed plan.';
    let psychState = data.psychologicalState || 'anxious';

    // Simple rule-based State Engine MVP
    if (data.tStage || data.nStage) {
      currentStage = 'post_op';
      
      if (data.nStage === 'N0' && !data.stas && !data.vpi) {
        riskLevel = 'low';
        nextAction = 'Regular follow-up CT scan in 6 months.';
        psychState = 'understanding';
      } else {
        riskLevel = 'moderate';
        nextAction = 'Discuss adjuvant therapy options with your oncologist.';
        psychState = 'decision';
      }
    } else if (data.sizeMm) {
      currentStage = 'discovery';
      if (data.sizeMm < 6) {
        riskLevel = 'low';
        nextAction = 'Annual low-dose CT screening.';
      } else {
        riskLevel = 'moderate';
        nextAction = 'Follow-up CT in 3-6 months to monitor growth.';
      }
    }

    // Save to DB
    const profile = await prisma.patientProfile.create({
      data: {
        userId: data.userId || 'anonymous',
        age: data.age,
        sex: data.sex,
        organ: data.organ || 'lung',
        histology: data.histology,
        noduleType: data.noduleType,
        sizeMm: data.sizeMm ? parseFloat(data.sizeMm) : null,
        ctr: data.ctr ? parseFloat(data.ctr) : null,
        tumorSize: data.tumorSize ? parseFloat(data.tumorSize) : null,
        grade: data.grade,
        tStage: data.tStage,
        nStage: data.nStage,
        mStage: data.mStage,
        stas: data.stas === 'positive' ? true : data.stas === 'negative' ? false : null,
        vpi: data.vpi === 'positive' ? true : data.vpi === 'negative' ? false : null,
        lvi: data.lvi === 'positive' ? true : data.lvi === 'negative' ? false : null,
        surgeryType: data.surgeryType,
        marginStatus: data.marginStatus,
        
        // State Engine
        currentStage: currentStage,
        riskLevel: riskLevel,
        nextAction: nextAction,
        psychologicalState: psychState,

        // Report persistence if provided
        reportMarkdown: data.reportMarkdown || null,
        reportGeneratedAt: data.reportMarkdown ? new Date() : null,
      }
    });

    if (profile) {
      (profile as any).gender = profile.sex;
    }
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, profileId, reportMarkdown } = await request.json();

    if (!reportMarkdown) {
      return NextResponse.json({ success: false, error: "缺少报告内容" }, { status: 400 });
    }

    let targetProfile = null;
    if (profileId) {
      targetProfile = await prisma.patientProfile.findUnique({ where: { id: profileId } });
    }

    if (!targetProfile && userId) {
      targetProfile = await prisma.patientProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!targetProfile) {
      return NextResponse.json({ success: false, error: "未找到对应患者病理档案" }, { status: 404 });
    }

    const updated = await prisma.patientProfile.update({
      where: { id: targetProfile.id },
      data: {
        reportMarkdown,
        reportGeneratedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error('Error updating report in profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'anonymous';
  
  try {
    const profile = await prisma.patientProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (profile) {
      (profile as any).gender = profile.sex;
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
