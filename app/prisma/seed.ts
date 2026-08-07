import { PrismaClient } from '@prisma/client'
import { initialNodes, aiNewNode, edgeEvidences } from '../src/lib/knowledgeGraphData'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Combine static nodes and the ai node
  const allNodes = [...initialNodes, aiNewNode]

  // 1. Create Nodes
  for (const n of allNodes) {
    await prisma.node.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        label: n.label,
        type: n.type,
        x: n.x,
        y: n.y,
        description: n.description,
      },
    })
  }
  console.log('✅ Nodes seeded.')

  // 2. Create Edges
  for (const n of allNodes) {
    if (!n.connections) continue;
    for (const targetId of n.connections) {
      const relationType = n.connectionTypes?.[targetId] || 'risk'
      
      const edge = await prisma.edge.upsert({
        where: {
          sourceNodeId_targetNodeId: {
            sourceNodeId: n.id,
            targetNodeId: targetId,
          }
        },
        update: {},
        create: {
          sourceNodeId: n.id,
          targetNodeId: targetId,
          relationshipType: relationType,
        }
      })

      // 3. Populate EdgeEvidences, Studies, ForestData
      const edgeKey = `${n.id}-${targetId}`
      const evidenceData = edgeEvidences[edgeKey]

      if (evidenceData) {
        // Upsert Evidence
        await prisma.edgeEvidence.upsert({
          where: { edgeId: edge.id },
          update: {},
          create: {
            edgeId: edge.id,
            title: evidenceData.title,
            description: evidenceData.description,
            metricLabel: evidenceData.metric?.label,
            metricValue: evidenceData.metric?.value,
            metricCi: evidenceData.metric?.ci,
            metricP: evidenceData.metric?.p,
          }
        })

        // Upsert Studies and Link them
        if (evidenceData.studies) {
          for (const s of evidenceData.studies) {
            const study = await prisma.study.upsert({
              where: { doi: s.doi },
              update: {},
              create: {
                doi: s.doi,
                title: s.title,
                journal: s.journal,
                publishedYear: s.year,
                conclusion: s.conclusion,
              }
            })
            
            // Link edge and study
            await prisma.edgeStudy.upsert({
              where: {
                edgeId_studyId: {
                  edgeId: edge.id,
                  studyId: study.id,
                }
              },
              update: {},
              create: {
                edgeId: edge.id,
                studyId: study.id,
              }
            })
          }
        }

        // Upsert ForestData
        if (evidenceData.forestData) {
          for (const f of evidenceData.forestData) {
            // Because ForestData doesn't have a unique constraint besides ID, we just create it. 
            // In a real app we might want to check for duplicates, but for seeding it's okay to create or we can delete many first.
            // Let's delete existing forest data for this edge to be idempotent
            await prisma.forestData.deleteMany({
              where: { edgeId: edge.id }
            })

            await prisma.forestData.create({
              data: {
                edgeId: edge.id,
                studyName: f.study,
                year: f.year,
                hr: f.hr,
                ciLow: f.ciLow,
                ciHigh: f.ciHigh,
              }
            })
          }
        }
      }
    }
  }
  
  console.log('✅ Edges & Evidences seeded.')
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
