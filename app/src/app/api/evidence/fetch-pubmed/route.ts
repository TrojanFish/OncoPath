import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('query') || '';

    if (!query) {
      try {
        const body = await request.json();
        query = body.query || '';
      } catch {
        // query from url param
      }
    }

    if (!query) {
      query = '("stage IA" OR "T1N0") AND "lung adenocarcinoma"';
    }

    // Call NCBI E-Utilities or Europe PMC Medline for PubMed studies
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      query + ' SRC:MED'
    )}&format=json&pageSize=5&resultType=core`;

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Europe PMC Medline API 请求失败 (${res.status})`);
    }

    const data = await res.json();
    const rawList = data.resultList?.result || [];

    let insertedCount = 0;
    for (const item of rawList) {
      const title = item.title?.replace(/<[^>]*>?/gm, '') || 'Untitled Study';
      const doi = item.doi || null;
      const pubmedId = item.pmid || null;

      // Check if already in DB
      const existing = await prisma.ingestedStudy.findFirst({
        where: {
          OR: [
            ...(doi ? [{ doi }] : []),
            ...(pubmedId ? [{ pubmedId }] : []),
            { title }
          ]
        }
      });

      if (!existing) {
        await prisma.ingestedStudy.create({
          data: {
            title,
            journal: item.journalTitle || item.journalInfo?.journal?.title || 'PubMed Journal',
            year: item.pubYear ? parseInt(item.pubYear, 10) : new Date().getFullYear(),
            authors: item.authorString || 'Authors',
            doi,
            pubmedId,
            studyType: 'retrospective',
            evidenceLevel: 4,
            summary: item.abstractText?.replace(/<[^>]*>?/gm, '') || '已从 PubMed 获取文献摘要。',
            conclusion: item.abstractText ? item.abstractText.replace(/<[^>]*>?/gm, '').slice(0, 300) + '...' : '等待临床循证提炼',
            keywords: 'PubMed, NSCLC, Evidence',
            applicableStages: JSON.stringify(['IA', 'IB', 'IIIA']),
            relevantFactors: JSON.stringify(['STAS', 'GGO', 'prognosis']),
            url: doi ? `https://doi.org/${doi}` : (pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/` : undefined),
          }
        });
        insertedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `PubMed 抓取完成，成功同步入库 ${insertedCount} 篇文献。`,
      insertedCount,
      totalFetched: rawList.length,
    });
  } catch (error: any) {
    console.error('Error in /api/evidence/fetch-pubmed:', error);
    return NextResponse.json({ success: false, error: error.message || 'PubMed 抓取失败' }, { status: 500 });
  }
}
