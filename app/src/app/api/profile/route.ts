import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeClinicalTnmStage } from '@/lib/staging';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Normalize boolean / string factors
    const isStas = data.stas === 'positive' || data.stas === true;
    const isVpi = data.vpi === 'positive' || data.vpi === true;
    const isLvi = data.lvi === 'positive' || data.lvi === true;
    const marginStatus = data.marginStatus === 'positive' || data.margin === 'positive' ? 'positive' : 'negative';

    const stagingResult = computeClinicalTnmStage({
      noduleType: data.noduleType || data.morphology || "mixed_ggo",
      tumorSize: data.tumorSize ? parseFloat(data.tumorSize) : (data.sizeMm ? parseFloat(data.sizeMm) / 10 : 1.5),
      solidSize: data.solidSize ? parseFloat(data.solidSize) : null,
      ctr: data.ctr ? parseFloat(data.ctr) : null,
      tStage: data.tStage,
      nStage: data.nStage || "N0",
      mStage: data.mStage || "M0",
      vpi: isVpi,
      stas: isStas,
      lvi: isLvi,
      marginStatus: marginStatus,
    });

    let currentStage = data.currentStage;
    if (!currentStage || currentStage === 'decision' || currentStage === 'pathology') {
      currentStage = (data.reportType === 'ct_imaging' && data.surgeryType === 'unknown') ? 'evaluation' : 'post_op';
    }
    let riskLevel = data.riskLevel || ((isStas || isVpi || isLvi || stagingResult.nStage !== 'N0') ? 'moderate' : 'low');
    let nextAction = data.nextAction || (
      data.reportType === 'ct_imaging'
        ? (riskLevel === 'high' 
            ? 'CT 显示结节具有浸润恶性征象，建议尽早至胸外科门诊进行多学科会诊评估手术。' 
            : '当前结节处于早期随访范围。建议遵照 Fleischner 指南于 3~6 个月后复查薄层胸部 CT。')
        : (riskLevel === 'low' 
            ? '属于早期低复发风险组。遵医嘱术后 6 个月规律复查胸部 CT 即可，无需过度化疗。'
            : '存在局部病理高危因素，建议咨询肿瘤内科进一步评估辅助治疗方案。')
    );
    let psychState = data.psychologicalState || (isStas || isVpi ? 'decision' : 'understanding');

    // Save to DB
    const profile = await prisma.patientProfile.create({
      data: {
        userId: data.userId || 'anonymous',
        age: data.age ? parseInt(data.age) : 55,
        sex: data.sex || data.gender || 'male',
        organ: data.organ || 'lung',
        histology: data.histology || 'adenocarcinoma',
        noduleType: stagingResult.noduleType,
        sizeMm: stagingResult.tumorSize * 10,
        ctr: stagingResult.ctr,
        tumorSize: stagingResult.tumorSize,
        grade: data.grade || data.iaslcGrade || '2',
        tStage: stagingResult.tStage,
        nStage: stagingResult.nStage,
        mStage: stagingResult.mStage,
        stas: isStas,
        vpi: isVpi,
        lvi: isLvi,
        surgeryType: data.surgeryType || (data.reportType === 'ct_imaging' ? 'unknown' : 'segmentectomy'),
        marginStatus: marginStatus,
        
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

    // Return enriched profile object with normalized strings for UI
    const enriched = {
      ...profile,
      reportType: data.reportType || (currentStage === 'evaluation' || currentStage === 'discovery' ? 'ct_imaging' : 'pathology'),
      noduleLocation: data.noduleLocation || '肺部结节',
      imagingFeatures: data.imagingFeatures || [],
      lungRads: data.lungRads || null,
      malignancyRisk: data.malignancyRisk || riskLevel,
      clinicalRecommendation: data.clinicalRecommendation || nextAction,
      gender: profile.sex,
      stas: profile.stas ? 'positive' : 'negative',
      vpi: profile.vpi ? 'positive' : 'negative',
      lvi: profile.lvi ? 'positive' : 'negative',
      margin: profile.marginStatus || 'negative',
      marginStatus: profile.marginStatus || 'negative',
      noduleType: profile.noduleType || 'mixed_ggo',
      morphology: profile.noduleType || 'mixed_ggo',
      tumorSize: stagingResult.tumorSize,
      solidSize: stagingResult.solidSize,
      ctr: stagingResult.ctr,
      stage: stagingResult.stage,
      stageExplanation: stagingResult.explanation,
      iaslcGrade: profile.grade || '2',
    };

    return NextResponse.json({ success: true, profile: enriched });
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
    
    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Recompute accurate AJCC Stage and normalize all fields for frontend
    const tumorSize = profile.tumorSize ?? (profile.sizeMm ? profile.sizeMm / 10 : 1.5);
    const stagingResult = computeClinicalTnmStage({
      noduleType: profile.noduleType || "mixed_ggo",
      tumorSize: tumorSize,
      ctr: profile.ctr ?? 0.53,
      tStage: profile.tStage,
      nStage: profile.nStage || "N0",
      mStage: profile.mStage || "M0",
      vpi: profile.vpi,
      stas: profile.stas,
      lvi: profile.lvi,
      marginStatus: profile.marginStatus,
    });

    const enriched = {
      ...profile,
      gender: profile.sex || 'male',
      sex: profile.sex || 'male',
      stas: profile.stas ? 'positive' : 'negative',
      vpi: profile.vpi ? 'positive' : 'negative',
      lvi: profile.lvi ? 'positive' : 'negative',
      margin: profile.marginStatus || 'negative',
      marginStatus: profile.marginStatus || 'negative',
      noduleType: profile.noduleType || 'mixed_ggo',
      morphology: profile.noduleType || 'mixed_ggo',
      tumorSize: stagingResult.tumorSize,
      solidSize: stagingResult.solidSize,
      ctr: stagingResult.ctr,
      stage: stagingResult.stage,
      tStage: stagingResult.tStage,
      nStage: stagingResult.nStage,
      mStage: stagingResult.mStage,
      stageExplanation: stagingResult.explanation,
      iaslcGrade: profile.grade || '2',
    };

    return NextResponse.json({ profile: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ success: false, error: '缺少用户标识符' }, { status: 400 });
  }

  try {
    // Delete all records associated with this userId
    await prisma.patientProfile.deleteMany({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      message: '您的临床档案与历史记录已在服务端彻底销毁与注销'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
