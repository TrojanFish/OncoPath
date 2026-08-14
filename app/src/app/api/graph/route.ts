import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { KnowledgeNode, EdgeEvidence } from '@/lib/knowledgeGraphData';
import { DEFAULT_GRAPH_NODES, DEFAULT_EDGE_EVIDENCES } from '@/lib/defaultGraphData';

export async function GET() {
  try {
    // 1. Fetch nodes and their outgoing edges from DB
    const rawNodes = await prisma.node.findMany({
      include: {
        sourceEdges: true,
      }
    });

    if (!rawNodes || rawNodes.length === 0) {
      // Return pre-seeded robust baseline graph nodes & evidences
      return NextResponse.json({
        nodes: DEFAULT_GRAPH_NODES,
        edgeEvidences: DEFAULT_EDGE_EVIDENCES
      });
    }

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
        studies: 18,
        evidence: 5,
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

    const edgeEvidences: Record<string, EdgeEvidence> = { ...DEFAULT_EDGE_EVIDENCES };

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
        studies: studies.length > 0 ? studies : (DEFAULT_EDGE_EVIDENCES[edgeKey]?.studies || []),
        forestData: forestData.length > 0 ? forestData : (DEFAULT_EDGE_EVIDENCES[edgeKey]?.forestData || [])
      };
    });

    return NextResponse.json({
      nodes: nodes.length > 0 ? nodes : DEFAULT_GRAPH_NODES,
      edgeEvidences
    });
  } catch (error) {
    console.error('Failed to fetch graph data from DB, using pre-seeded fallback:', error);
    return NextResponse.json({
      nodes: DEFAULT_GRAPH_NODES,
      edgeEvidences: DEFAULT_EDGE_EVIDENCES
    });
  }
}
