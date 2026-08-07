import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { KnowledgeNode, EdgeEvidence } from '@/lib/knowledgeGraphData';

export async function GET() {
  try {
    // 1. Fetch nodes and their outgoing edges
    const rawNodes = await prisma.node.findMany({
      include: {
        sourceEdges: true,
      }
    });

    const nodes: KnowledgeNode[] = rawNodes.map((n: any) => {
      const connections: string[] = [];
      const connectionTypes: Record<string, "risk" | "protective" | "guides"> = {};

      n.sourceEdges.forEach((edge: any) => {
        connections.push(edge.targetNodeId);
        connectionTypes[edge.targetNodeId] = edge.relationshipType as any;
      });

      return {
        id: n.id,
        label: n.label,
        type: n.type as any,
        x: n.x,
        y: n.y,
        connections,
        connectionTypes,
        studies: 12, // Default mock or calculated in future
        evidence: 5,  // Default mock or calculated in future
        description: n.description || '',
      };
    });

    // 2. Fetch all edges with their evidence, studies, and forest data
    const rawEdges = await prisma.edge.findMany({
      include: {
        evidence: true,
        studies: {
          include: {
            study: true
          }
        },
        forestData: true
      }
    });

    const edgeEvidences: Record<string, EdgeEvidence> = {};

    rawEdges.forEach((edge: any) => {
      if (!edge.evidence) return;
      
      const edgeKey = `${edge.sourceNodeId}-${edge.targetNodeId}`;
      
      const metric = edge.evidence.metricLabel ? {
        label: edge.evidence.metricLabel,
        value: edge.evidence.metricValue || '',
        ci: edge.evidence.metricCi || '',
        p: edge.evidence.metricP || ''
      } : undefined;

      const studies = edge.studies.map((s: any) => ({
        title: s.study.title,
        journal: s.study.journal || '',
        year: s.study.publishedYear || 0,
        doi: s.study.doi || '',
        conclusion: s.study.conclusion || ''
      }));

      const forestData = edge.forestData.map((f: any) => ({
        study: f.studyName,
        year: f.year || 0,
        hr: f.hr,
        ciLow: f.ciLow,
        ciHigh: f.ciHigh
      }));

      edgeEvidences[edgeKey] = {
        title: edge.evidence.title,
        description: edge.evidence.description,
        metric,
        studies,
        forestData
      };
    });

    return NextResponse.json({
      nodes,
      edgeEvidences
    });
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph data' },
      { status: 500 }
    );
  }
}
