import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        stas: data.stas,
        vpi: data.vpi,
        lvi: data.lvi,
        surgeryType: data.surgeryType,
        marginStatus: data.marginStatus,
        
        // State Engine
        currentStage: currentStage,
        riskLevel: riskLevel,
        nextAction: nextAction,
        psychologicalState: psychState,
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error saving profile:', error);
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
    
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
