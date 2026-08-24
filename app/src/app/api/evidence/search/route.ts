import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FEATURED_STUDIES } from '@/lib/evidence-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    // 1. Fetch ingested studies from DB
    let dbStudies: any[] = [];
    try {
      dbStudies = await prisma.ingestedStudy.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbErr) {
      console.warn("Database query for ingested studies failed, falling back to static studies", dbErr);
    }

    // 2. Format database studies to EvidenceResponse shape
    const formattedDb = dbStudies.map(s => ({
      id: s.id,
      title: s.title,
      journal: s.journal || 'Journal',
      year: s.year || 2023,
      authors: s.authors || 'Authors',
      summary: s.summary || s.conclusion || '',
      conclusion: s.conclusion || '',
      keywords: s.keywords || '',
      created_at: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
      doi: s.doi,
      pubmedId: s.pubmedId,
      url: s.url || (s.doi ? `https://doi.org/${s.doi}` : (s.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${s.pubmedId}/` : undefined)),
    }));

    // 3. Format static FEATURED_STUDIES
    const formattedStatic = FEATURED_STUDIES.map(s => ({
      id: s.id,
      title: s.title,
      journal: s.journal,
      year: s.year,
      authors: 'OncoPath Curated Clinical Group',
      summary: s.keyConclusions?.join('; ') || '',
      conclusion: s.keyConclusions?.[0] || '',
      keywords: s.relevantFactors?.join(', ') || 'NSCLC, GGO, STAS',
      created_at: new Date().toISOString(),
      doi: s.doi,
      pubmedId: s.pubmedId,
      url: s.doi ? `https://doi.org/${s.doi}` : (s.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${s.pubmedId}/` : undefined),
    }));

    // Deduplicate
    const seenDois = new Set(formattedDb.map(s => s.doi).filter(Boolean));
    const combined = [...formattedDb, ...formattedStatic.filter(s => !s.doi || !seenDois.has(s.doi))];

    // Filter by query if provided
    let results = combined;
    if (query) {
      results = combined.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.journal.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.conclusion.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query) ||
        (item.authors && item.authors.toLowerCase().includes(query))
      );
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in /api/evidence/search:", error);
    return NextResponse.json({ error: error.message || "检索文献失败" }, { status: 500 });
  }
}
