import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeClinicalTnmStage } from '@/lib/staging';
import { getAuthenticatedUser } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(request: Request): string | null {
  const auth = getAuthenticatedUser(request);
  return auth ? auth.userId : null;
}


export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authenticatedUserId = getAuthenticatedUserId(request);
    // If authenticated, always bind to authenticated user. If guest, require guest-* format or generate isolated guest id
    const targetUserId = authenticatedUserId || (data.userId && typeof data.userId === 'string' && data.userId.startsWith('guest-') ? data.userId : 'guest-temp-' + Date.now());
    
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

    // 1. Save or Update Patient Profile to Database (Strictly Isolated by targetUserId)
    const existingProfile = await prisma.patientProfile.findFirst({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' }
    });

    const profileData = {
      userId: targetUserId,
      age: data.age ? parseInt(data.age) : (existingProfile?.age ?? null),
      sex: data.sex || data.gender || existingProfile?.sex || null,
      organ: data.organ || existingProfile?.organ || 'lung',
      histology: data.histology || existingProfile?.histology || null,
      noduleType: stagingResult.noduleType,
      sizeMm: stagingResult.tumorSize * 10,
      ctr: stagingResult.ctr,
      tumorSize: stagingResult.tumorSize,
      grade: data.grade || data.iaslcGrade || existingProfile?.grade || null,
      tStage: stagingResult.tStage,
      nStage: stagingResult.nStage,
      mStage: stagingResult.mStage,
      stas: isStas,
      vpi: isVpi,
      lvi: isLvi,
      surgeryType: data.surgeryType || (data.reportType === 'ct_imaging' ? 'unknown' : (existingProfile?.surgeryType || 'unknown')),
      marginStatus: marginStatus,
      
      // State Engine
      currentStage: currentStage,
      riskLevel: riskLevel,
      nextAction: nextAction,
      psychologicalState: psychState,

      // Report persistence if provided
      reportMarkdown: data.reportMarkdown || null,
      reportGeneratedAt: data.reportMarkdown ? new Date() : null,
    };

    let profile;
    if (existingProfile) {
      profile = await prisma.patientProfile.update({
        where: { id: existingProfile.id },
        data: profileData,
      });
    } else {
      profile = await prisma.patientProfile.create({
        data: profileData,
      });
    }

    // 2. Automatic Timeline Ingestion (基于报告指纹与唯一性去重更新)
    try {
      const eventDate = data.examDate ? new Date(data.examDate) : new Date();
      const isCT = data.reportType === 'ct_imaging' || currentStage === 'evaluation' || currentStage === 'discovery';

      if (isCT) {
        // Upsert CT Imaging Event
        const existingCT = await prisma.timelineEvent.findFirst({
          where: {
            userId: targetUserId,
            category: 'imaging',
            subType: 'CT'
          },
          orderBy: { eventDate: 'desc' }
        });

        const ctEventData = {
          userId: targetUserId,
          profileId: profile.id,
          eventDate,
          category: 'imaging',
          subType: 'CT',
          hospital: data.hospital || (existingCT?.hospital || '放射影像中心'),
          title: data.examName || (existingCT?.title || '胸部薄层高分辨 CT 平扫'),
          summary: nextAction || 'CT 影像已结构化归档',
          keyFindings: {
            sizeMm: stagingResult.tumorSize * 10,
            ctr: stagingResult.ctr,
            noduleType: stagingResult.noduleType,
            location: data.noduleLocation || '肺部结节',
          },
          tags: JSON.stringify([
            data.noduleLocation || '肺部',
            `${(stagingResult.tumorSize * 10).toFixed(1)}mm`,
            stagingResult.noduleType === 'pure_ggo' ? '纯磨玻璃' : stagingResult.noduleType === 'pure_solid' ? '实性结节' : '混合磨玻璃'
          ]),
          riskStatus: riskLevel === 'high' ? 'warning' : 'watch',
        };

        if (existingCT) {
          await prisma.timelineEvent.update({
            where: { id: existingCT.id },
            data: ctEventData
          });
        } else {
          await prisma.timelineEvent.create({ data: ctEventData });
        }
      } else {
        // Upsert Pathology Event
        const existingPathology = await prisma.timelineEvent.findFirst({
          where: {
            userId: targetUserId,
            category: 'pathology',
          },
          orderBy: { eventDate: 'desc' }
        });

        const pathEventData = {
          userId: targetUserId,
          profileId: profile.id,
          eventDate,
          category: 'pathology',
          subType: 'Pathology',
          hospital: data.hospital || (existingPathology?.hospital || '病理诊断中心'),
          title: '手术标本常规组织病理学诊断',
          summary: `【病理诊断】${stagingResult.stage ? `${stagingResult.stage}期，` : ''}${data.histology || '浸润性腺癌'}，切缘${marginStatus === 'positive' ? '阳性' : 'R0安全阴性'}，STAS${isStas ? '阳性' : '阴性'}，VPI${isVpi ? '阳性' : '阴性'}。`,
          keyFindings: {
            histology: data.histology || '浸润性腺癌',
            stage: stagingResult.stage,
            stas: isStas,
            vpi: isVpi,
            lvi: isLvi,
            marginStatus: marginStatus === 'positive' ? '切缘阳性' : 'R0切缘阴性',
            sizeMm: stagingResult.tumorSize * 10,
            location: data.noduleLocation || '肺部病灶',
          },
          tags: JSON.stringify([
            data.noduleLocation || '肺部病灶',
            stagingResult.stage || '早期肺癌',
            isStas ? 'STAS阳性' : 'STAS阴性',
            isVpi ? 'VPI阳性' : 'VPI阴性',
            marginStatus === 'positive' ? '切缘阳性' : 'R0根治切除'
          ]),
          riskStatus: (isStas || isVpi || isLvi || marginStatus === 'positive') ? 'warning' : 'normal',
        };

        if (existingPathology) {
          await prisma.timelineEvent.update({
            where: { id: existingPathology.id },
            data: pathEventData
          });
        } else {
          await prisma.timelineEvent.create({ data: pathEventData });
        }

        // Ingest / Update Surgery Milestone Event if applicable
        if (data.surgeryType && data.surgeryType !== 'unknown') {
          const surgeryName = 
            data.surgeryType === 'segmentectomy' ? '单孔胸腔镜解剖性肺段切除术' :
            data.surgeryType === 'lobectomy' ? '胸腔镜标准肺叶切除术' :
            data.surgeryType === 'wedge' ? '胸腔镜肺局部楔形切除术' : data.surgeryType;

          const existingSurgery = await prisma.timelineEvent.findFirst({
            where: {
              userId: targetUserId,
              category: 'milestone',
              subType: 'Surgery'
            }
          });

          const surgeryEventData = {
            userId: targetUserId,
            profileId: profile.id,
            eventDate: data.surgeryDate ? new Date(data.surgeryDate) : eventDate,
            category: 'milestone',
            subType: 'Surgery',
            hospital: data.hospital || (existingSurgery?.hospital || '胸外科'),
            title: `重大治疗里程碑：${surgeryName}`,
            summary: `顺利完成微创胸外科切除，切缘充分（R0），病灶完全切除。`,
            keyFindings: {
              surgeryType: surgeryName,
              marginStatus: marginStatus === 'positive' ? '切缘阳性' : 'R0切缘阴性',
              location: data.noduleLocation || '肺部病灶',
            },
            tags: JSON.stringify([data.noduleLocation || '肺部病灶', '胸外科微创手术', '解剖性切除', 'R0切除']),
            riskStatus: 'normal',
          };

          if (existingSurgery) {
            await prisma.timelineEvent.update({
              where: { id: existingSurgery.id },
              data: surgeryEventData
            });
          } else {
            await prisma.timelineEvent.create({ data: surgeryEventData });
          }
        }
      }

      // Ingest Serology Event(s) (Support single snapshot or full multi-date history)
      const markersList: any[] = Array.isArray(data.tumorMarkersHistory) && data.tumorMarkersHistory.length > 0
        ? data.tumorMarkersHistory
        : (data.tumorMarkers ? [data.tumorMarkers] : []);

      if (markersList.length > 0) {
        await prisma.timelineEvent.deleteMany({
          where: {
            userId: targetUserId,
            category: 'serology'
          }
        }).catch(() => {});

        for (const tm of markersList) {
          const hasAnyMarker = tm.cea != null || tm.cyfra211 != null || tm.nse != null || tm.scc != null || tm.ca125 != null || tm.ca199 != null || tm.ca153 != null || tm.proGrp != null || tm.ferritin != null;
          if (hasAnyMarker) {
            const tmDate = tm.testDate ? new Date(tm.testDate) : eventDate;
            const summaryParts: string[] = [];
            if (tm.cea != null) summaryParts.push(`CEA: ${tm.cea} ng/mL`);
            if (tm.cyfra211 != null) summaryParts.push(`CYFRA21-1: ${tm.cyfra211} ng/mL`);
            if (tm.nse != null) summaryParts.push(`NSE: ${tm.nse} ng/mL`);
            if (tm.scc != null) summaryParts.push(`SCC: ${tm.scc} ng/mL`);
            if (tm.ca125 != null) summaryParts.push(`CA125: ${tm.ca125} U/mL`);
            if (tm.ca199 != null) summaryParts.push(`CA19-9: ${tm.ca199} U/mL`);
            if (tm.ca153 != null) summaryParts.push(`CA15-3: ${tm.ca153} U/mL`);
            if (tm.proGrp != null) summaryParts.push(`ProGRP: ${tm.proGrp} pg/mL`);
            if (tm.ferritin != null) summaryParts.push(`FER: ${tm.ferritin} ng/mL`);

            const isElevated = (tm.cea != null && Number(tm.cea) > 5.0) || (tm.cyfra211 != null && Number(tm.cyfra211) > 3.3) || (tm.ca125 != null && Number(tm.ca125) > 35.0);

            await prisma.timelineEvent.create({
              data: {
                userId: targetUserId,
                profileId: profile.id,
                eventDate: tmDate,
                category: 'serology',
                subType: 'TumorMarkers',
                hospital: tm.hospital || data.hospital || '临床检验中心',
                title: tm.testDate ? `血清肿瘤标志物生化检测 (${tm.testDate})` : '血清肿瘤标志物生化检测',
                summary: summaryParts.join('，') || '常规肿瘤标志物检测已归档',
                keyFindings: {
                  cea: tm.cea != null ? parseFloat(tm.cea) : undefined,
                  cyfra211: tm.cyfra211 != null ? parseFloat(tm.cyfra211) : undefined,
                  nse: tm.nse != null ? parseFloat(tm.nse) : undefined,
                  scc: tm.scc != null ? parseFloat(tm.scc) : undefined,
                  proGrp: tm.proGrp != null ? parseFloat(tm.proGrp) : undefined,
                  ca125: tm.ca125 != null ? parseFloat(tm.ca125) : undefined,
                  ca199: tm.ca199 != null ? parseFloat(tm.ca199) : undefined,
                  ca153: tm.ca153 != null ? parseFloat(tm.ca153) : undefined,
                  ferritin: tm.ferritin != null ? parseFloat(tm.ferritin) : undefined,
                },
                tags: JSON.stringify([
                  '肿瘤标志物',
                  tm.cea != null ? (Number(tm.cea) <= 5 ? 'CEA正常' : 'CEA偏高') : '血检',
                  tm.cyfra211 != null ? (Number(tm.cyfra211) <= 3.3 ? 'CYFRA正常' : 'CYFRA偏高') : '生化'
                ]),
                riskStatus: isElevated ? 'warning' : 'normal',
              }
            });
          }
        }
      }


      // Ingest Molecular / Gene Mutation NGS Event if present
      const molecularMutations = data.geneMutations || data.molecular?.mutations || [];
      const testStatus = data.molecularTestStatus || data.molecular?.testStatus || (Array.isArray(molecularMutations) && molecularMutations.length > 0 ? "tested" : "not_tested");

      // Clean up previous molecular events for this user to avoid stale duplicate records
      await prisma.timelineEvent.deleteMany({
        where: {
          userId: targetUserId,
          category: 'molecular'
        }
      }).catch(() => {});

      if (testStatus === "tested" && Array.isArray(molecularMutations) && molecularMutations.length > 0) {
        const geneNames = molecularMutations.map((m: any) => `${m.gene}${m.subtype ? ` (${m.subtype})` : ''}`);
        const hasCoMutation = molecularMutations.some((m: any) => m.isComutation || m.gene === 'TP53');
        
        await prisma.timelineEvent.create({
          data: {
            userId: targetUserId,
            profileId: profile.id,
            eventDate: data.examDate ? new Date(data.examDate) : new Date(),
            category: 'molecular',
            subType: 'NGS',
            hospital: data.hospital || '分子病理与基因诊断中心',
            title: `肿瘤驱动基因与分子靶向检测 (${data.molecular?.testMethod || 'NGS Panel'})`,
            summary: `检出基因变异：${geneNames.join('、')}${data.pdl1Tps ? ` · PD-L1 TPS: ${data.pdl1Tps}` : ''}`,
            keyFindings: {
              mutations: molecularMutations,
              testStatus: "tested",
              pdl1Tps: data.pdl1Tps || data.molecular?.pdl1Tps || undefined,
              testMethod: data.molecular?.testMethod || 'NGS_panel',
            },
            tags: JSON.stringify([
              ...molecularMutations.map((m: any) => m.gene),
              data.pdl1Tps ? `PD-L1 ${data.pdl1Tps}` : '分子靶向',
              hasCoMutation ? '伴随突变' : '驱动基因'
            ]),
            riskStatus: hasCoMutation ? 'warning' : 'normal',
          }
        });
      } else if (testStatus === "negative") {
        await prisma.timelineEvent.create({
          data: {
            userId: targetUserId,
            profileId: profile.id,
            eventDate: data.examDate ? new Date(data.examDate) : new Date(),
            category: 'molecular',
            subType: 'NGS',
            hospital: data.hospital || '分子病理与基因诊断中心',
            title: '肿瘤驱动基因检测 (全野生型/阴性)',
            summary: '常见驱动基因（EGFR、ALK、ROS1、KRAS 等）未检出致病突变变异。',
            keyFindings: {
              mutations: [],
              testStatus: "negative",
              pdl1Tps: data.pdl1Tps || data.molecular?.pdl1Tps || undefined,
              testMethod: data.molecular?.testMethod || 'NGS_panel',
            },
            tags: JSON.stringify(['全野生型', '阴性', '无突变']),
            riskStatus: 'normal',
          }
        });
      }

      // Ingest Historical Scans if followUpHistory is present
      if (Array.isArray(data.followUpHistory) && data.followUpHistory.length > 0) {
        for (const historyItem of data.followUpHistory) {
          if (historyItem.date && historyItem.sizeMm) {
            await prisma.timelineEvent.create({
              data: {
                userId: targetUserId,
                profileId: profile.id,
                eventDate: new Date(historyItem.date),
                category: 'imaging',
                subType: 'CT',
                hospital: historyItem.hospital || data.hospital || '复查医院',
                title: `历史随访胸部 CT (${historyItem.date})`,
                summary: `结节长径约 ${historyItem.sizeMm} mm，密度 ${historyItem.density || '稳定'}。`,
                keyFindings: {
                  sizeMm: parseFloat(historyItem.sizeMm),
                  ctr: historyItem.ctr ? parseFloat(historyItem.ctr) : undefined,
                  vdtDays: historyItem.vdtDays ? parseInt(historyItem.vdtDays) : undefined,
                },
                tags: JSON.stringify([`${historyItem.sizeMm}mm`, '历史随访']),
                riskStatus: 'watch',
              }
            });
          }
        }
      }
    } catch (timelineSyncErr) {
      console.warn("Notice: Timeline auto-ingestion error (non-fatal):", timelineSyncErr);
    }

    // Determine EGFR status from geneMutations if present
    const molecularMutations = data.geneMutations || data.molecular?.mutations || [];
    const testStatus = data.molecularTestStatus || data.molecular?.testStatus || (Array.isArray(molecularMutations) && molecularMutations.length > 0 ? "tested" : "not_tested");
    const hasEgfr = molecularMutations.some(
      (m: any) => m.gene === 'EGFR' && m.status !== 'negative'
    );
    const egfrStatus = hasEgfr 
      ? 'positive' 
      : (testStatus === 'not_tested' ? 'not_tested' : (testStatus === 'negative' ? 'negative' : (data.egfr || 'unknown')));

    // Return enriched profile object with normalized strings for UI
    const enriched = {
      ...profile,
      reportType: data.reportType || (currentStage === 'evaluation' || currentStage === 'discovery' ? 'ct_imaging' : 'pathology'),
      noduleLocation: data.noduleLocation || '肺部结节',
      imagingFeatures: data.imagingFeatures || [],
      lungRads: data.lungRads || null,
      malignancyRisk: data.malignancyRisk || riskLevel,
      clinicalRecommendation: data.clinicalRecommendation || nextAction,

      // Molecular & Gene Mutation Fields
      geneMutations: molecularMutations,
      molecular: {
        testStatus: testStatus,
        testMethod: data.molecular?.testMethod || 'NGS_panel',
        mutations: molecularMutations,
        pdl1Tps: data.pdl1Tps || data.molecular?.pdl1Tps || 'unknown',
      },
      molecularTestStatus: testStatus,
      pdl1Tps: data.pdl1Tps || data.molecular?.pdl1Tps || undefined,
      egfr: egfrStatus,

      // P0 & P2 Fields
      isMultipleNodules: data.isMultipleNodules || (Array.isArray(data.secondaryNodules) && data.secondaryNodules.length > 0) || false,
      secondaryNodules: data.secondaryNodules || [],
      followUpHistory: data.followUpHistory || [],
      tumorMarkers: data.tumorMarkers || null,

      gender: profile.sex || 'female',
      sex: profile.sex || 'female',
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
    const authenticatedUserId = getAuthenticatedUserId(request);
    const targetUserId = authenticatedUserId || userId;

    if (!reportMarkdown) {
      return NextResponse.json({ success: false, error: "缺少报告内容" }, { status: 400 });
    }

    let targetProfile = null;
    if (profileId) {
      targetProfile = await prisma.patientProfile.findUnique({ where: { id: profileId } });
    }

    if (!targetProfile && targetUserId) {
      targetProfile = await prisma.patientProfile.findFirst({
        where: { userId: targetUserId },
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
  const searchParamsUserId = searchParams.get('userId');
  const authenticatedUserId = getAuthenticatedUserId(request);
  
  // Security access control:
  // If user is authenticated: query their authenticatedUserId (or their own guestId if provided)
  // If unauthenticated: only allow query if searchParamsUserId is a valid guest format ('guest-...')
  // Never fall back to global 'anonymous' to avoid leaking or colliding patient profiles across visitors
  if (!authenticatedUserId && (!searchParamsUserId || !searchParamsUserId.startsWith('guest-'))) {
    return NextResponse.json({ profile: null });
  }

  try {
    const whereCondition = authenticatedUserId
      ? {
          OR: [
            { userId: authenticatedUserId },
            ...(searchParamsUserId && searchParamsUserId.startsWith('guest-') ? [{ userId: searchParamsUserId }] : [])
          ]
        }
      : { userId: searchParamsUserId! };

    const profile = await prisma.patientProfile.findFirst({
      where: whereCondition,
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

    // Query latest molecular event for gene mutations
    const molecularEvent = await prisma.timelineEvent.findFirst({
      where: {
        OR: [
          { profileId: profile.id, category: 'molecular' },
          ...(profile.userId ? [{ userId: profile.userId, category: 'molecular' }] : []),
          { profileId: profile.id, subType: 'NGS' },
          ...(profile.userId ? [{ userId: profile.userId, subType: 'NGS' }] : [])
        ]
      },
      orderBy: { eventDate: 'desc' }
    });

    const molecularKeyFindings: any = (molecularEvent?.keyFindings as any) || {};
    const geneMutations = Array.isArray(molecularKeyFindings.mutations) ? molecularKeyFindings.mutations : [];
    const testStatus = molecularKeyFindings.testStatus || (geneMutations.length > 0 ? 'tested' : (molecularEvent ? 'negative' : 'not_tested'));
    const pdl1Tps = molecularKeyFindings.pdl1Tps;
    const testMethod = molecularKeyFindings.testMethod || 'NGS_panel';
    const hasEgfr = geneMutations.some((m: any) => m.gene === 'EGFR' && m.status !== 'negative');
    const egfrStatus = hasEgfr ? 'positive' : (testStatus === 'not_tested' ? 'not_tested' : (testStatus === 'negative' ? 'negative' : 'unknown'));

    // Query serology events for tumor markers
    const serologyEvent = await prisma.timelineEvent.findFirst({
      where: {
        OR: [
          { profileId: profile.id, category: 'serology' },
          ...(profile.userId ? [{ userId: profile.userId, category: 'serology' }] : []),
          { profileId: profile.id, subType: 'TumorMarkers' },
          ...(profile.userId ? [{ userId: profile.userId, subType: 'TumorMarkers' }] : [])
        ]
      },
      orderBy: { eventDate: 'desc' }
    });
    const tumorMarkers = (serologyEvent?.keyFindings as any) || null;

    // Query imaging events for CT features, location, and follow-up history
    const imagingEvents = await prisma.timelineEvent.findMany({
      where: {
        OR: [
          { profileId: profile.id, category: 'imaging' },
          ...(profile.userId ? [{ userId: profile.userId, category: 'imaging' }] : [])
        ]
      },
      orderBy: { eventDate: 'asc' }
    });

    const latestImaging = imagingEvents[imagingEvents.length - 1];
    const latestImagingFindings: any = (latestImaging?.keyFindings as any) || {};

    const followUpHistory = imagingEvents.map(ev => {
      const findings: any = ev.keyFindings || {};
      return {
        id: ev.id,
        date: ev.eventDate ? ev.eventDate.toISOString().split('T')[0] : '',
        tumorSize: findings.sizeMm ? findings.sizeMm / 10 : undefined,
        solidSize: findings.solidSize,
        ctr: findings.ctr,
        noduleType: findings.noduleType || 'mixed_ggo',
        lungRads: findings.lungRads,
        note: ev.summary || ev.title,
      };
    });

    // Query all relevant timeline events to find the most recent anatomical location and systemic staging
    const allEvents = await prisma.timelineEvent.findMany({
      where: {
        OR: [
          { profileId: profile.id },
          ...(profile.userId ? [{ userId: profile.userId }] : [])
        ]
      },
      orderBy: { eventDate: 'desc' }
    });

    let detectedLocation = "";
    let brainMri = "not_performed";
    let abdominalUltrasound = "not_performed";
    let boneScan = "not_performed";
    let neckLymphNodes = "not_performed";
    let petCt = "not_performed";
    let benignFindings: string[] = [];

    for (const ev of allEvents) {
      const findings: any = (ev.keyFindings as any) || {};
      if (!detectedLocation && findings.location && typeof findings.location === 'string' && findings.location.trim()) {
        detectedLocation = findings.location.trim();
      }
      if (findings.brainMri && brainMri === "not_performed") brainMri = findings.brainMri;
      if (findings.abdominalUltrasound && abdominalUltrasound === "not_performed") abdominalUltrasound = findings.abdominalUltrasound;
      if (findings.boneScan && boneScan === "not_performed") boneScan = findings.boneScan;
      if (findings.neckLymphNodes && neckLymphNodes === "not_performed") neckLymphNodes = findings.neckLymphNodes;
      if (findings.petCt && petCt === "not_performed") petCt = findings.petCt;
      if (Array.isArray(findings.benignFindings) && findings.benignFindings.length > 0 && benignFindings.length === 0) {
        benignFindings = findings.benignFindings;
      }
    }

    const enriched = {
      ...profile,
      reportType: profile.surgeryType === 'unknown' ? 'ct_imaging' : 'pathology',
      noduleLocation: detectedLocation || latestImagingFindings.location || '肺部病灶',
      imagingFeatures: latestImagingFindings.imagingFeatures || [],
      lungRads: latestImagingFindings.lungRads || null,
      malignancyRisk: profile.riskLevel || 'low',
      clinicalRecommendation: profile.nextAction,

      // Molecular & Gene Mutations (NGS Panel)
      geneMutations: geneMutations,
      molecular: {
        testStatus: testStatus,
        testMethod: testMethod,
        mutations: geneMutations,
        pdl1Tps: pdl1Tps || 'unknown',
      },
      molecularTestStatus: testStatus,
      pdl1Tps: pdl1Tps,
      egfr: egfrStatus,

      // Serology & Imaging History
      tumorMarkers: tumorMarkers,
      followUpHistory: followUpHistory,

      gender: profile.sex || 'female',
      sex: profile.sex || 'female',
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
      ki67: (profile as any).ki67 || null,

      // Systemic Staging & M0 Confirmation
      brainMri: brainMri,
      abdominalUltrasound: abdominalUltrasound,
      boneScan: boneScan,
      neckLymphNodes: neckLymphNodes,
      petCt: petCt,
      benignFindings: benignFindings,
      systemicStagingConfirmed: Boolean(
        brainMri === 'negative' || 
        abdominalUltrasound === 'negative' || 
        abdominalUltrasound === 'benign_findings' || 
        boneScan === 'negative' || 
        petCt === 'negative'
      ),
    };

    return NextResponse.json({ profile: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchParamsUserId = searchParams.get('userId') || searchParams.get('id');
  const authenticatedUserId = getAuthenticatedUserId(request);

  // Security access control against IDOR:
  // If user is authenticated: only permit deleting records belonging to authenticatedUserId
  // If user is not authenticated: only permit deleting if searchParamsUserId is a valid guest token ('guest-...')
  if (!authenticatedUserId) {
    if (!searchParamsUserId || typeof searchParamsUserId !== 'string' || !searchParamsUserId.startsWith('guest-')) {
      return NextResponse.json({ success: false, error: '未授权：请先登录或提供合法的访客标识符' }, { status: 401 });
    }
  }

  const targetUserId = authenticatedUserId || searchParamsUserId!;

  try {
    // Delete only records strictly owned by targetUserId
    await prisma.patientProfile.deleteMany({
      where: { userId: targetUserId }
    });

    // Also delete associated timeline events strictly owned by targetUserId
    await prisma.timelineEvent.deleteMany({
      where: { userId: targetUserId }
    });

    return NextResponse.json({
      success: true,
      message: '您的临床档案、时间生命线与历史记录已在服务端彻底销毁与注销'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
