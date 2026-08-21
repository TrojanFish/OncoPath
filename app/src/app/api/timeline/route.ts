import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyUserToken } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const profileId = searchParams.get('profileId');
    
    // Check for user authentication token
    const authHeader = request.headers.get('Authorization') || '';
    let authenticatedUserId: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verified = verifyUserToken(token);
      if (verified) {
        authenticatedUserId = verified.userId;
      }
    }

    // Build filter
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (authenticatedUserId) {
      where.userId = authenticatedUserId;
    } else if (profileId) {
      where.profileId = profileId;
    }

    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: {
        eventDate: 'desc',
      },
    });

    if (events && events.length > 0) {
      const formatted = events.map(e => ({
        ...e,
        eventDate: e.eventDate.toISOString().split('T')[0],
        tags: e.tags ? (typeof e.tags === 'string' ? JSON.parse(e.tags) : e.tags) : [],
        keyFindings: e.keyFindings ? (typeof e.keyFindings === 'string' ? JSON.parse(e.keyFindings) : e.keyFindings) : {},
      }));
      return NextResponse.json({ success: true, events: formatted, isDemo: false });
    }

    // If no events found in DB, return empty array (do NOT force fake demo data onto empty users)
    return NextResponse.json({ success: true, events: [], isDemo: false });
  } catch (error: any) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json({
      success: true,
      events: [],
      isDemo: false,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventDate, category, subType, hospital, title, summary, keyFindings, tags, riskStatus, profileId } = body;

    if (!eventDate || !category || !title) {
      return NextResponse.json({ success: false, error: '请提供事件日期、类别和标题' }, { status: 400 });
    }

    // Check user auth token
    const authHeader = request.headers.get('Authorization') || '';
    let authenticatedUserId: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verified = verifyUserToken(token);
      if (verified) {
        authenticatedUserId = verified.userId;
      }
    }

    const newEvent = await prisma.timelineEvent.create({
      data: {
        userId: authenticatedUserId,
        profileId: profileId || null,
        eventDate: new Date(eventDate),
        category,
        subType: subType || category,
        hospital: hospital || null,
        title,
        summary: summary || '',
        keyFindings: keyFindings || null,
        tags: tags ? JSON.stringify(tags) : null,
        riskStatus: riskStatus || 'normal',
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        ...newEvent,
        eventDate: newEvent.eventDate.toISOString().split('T')[0],
        tags: tags || [],
      }
    });
  } catch (error: any) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json({ success: false, error: error.message || '保存时间线事件失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少事件 ID' }, { status: 400 });
    }

    await prisma.timelineEvent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '事件已成功删除' });
  } catch (error: any) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json({ success: false, error: error.message || '删除事件失败' }, { status: 500 });
  }
}
