import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/userAuth';
import { extractVerifiedGuestId } from '@/lib/guestAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const profileId = searchParams.get('profileId');
    const requestedUserId = searchParams.get('userId');
    
    // Check for user authentication token (Cookie or Header)
    const auth = getAuthenticatedUser(request);
    const authenticatedUserId = auth ? auth.userId : null;
    const verifiedGuestId = extractVerifiedGuestId(request);
    const guestId = verifiedGuestId || (requestedUserId && requestedUserId.startsWith('guest-') ? requestedUserId : null);

    // Security Guard: Prevent indiscriminate leaking of all patient timelines
    // If not authenticated and no guestId and no specific profileId is provided, return empty array
    if (!authenticatedUserId && !guestId && !profileId) {
      return NextResponse.json({ success: true, events: [], isDemo: false });
    }

    // Build filter
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (authenticatedUserId) {
      where.userId = authenticatedUserId;
    } else if (guestId) {
      where.userId = guestId;
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

    // Check user auth token (Cookie or Header) or signed guest token
    const auth = getAuthenticatedUser(request);
    const authenticatedUserId = auth ? auth.userId : null;
    const verifiedGuestId = extractVerifiedGuestId(request);
    const requestedGuestId = (body.userId && typeof body.userId === 'string' && body.userId.startsWith('guest-')) ? body.userId : null;
    const effectiveUserId = authenticatedUserId || verifiedGuestId || requestedGuestId;

    const newEvent = await prisma.timelineEvent.create({
      data: {
        userId: effectiveUserId || null,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, eventDate, category, subType, hospital, title, summary, keyFindings, tags, riskStatus, profileId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少事件 ID' }, { status: 400 });
    }

    if (!eventDate || !category || !title) {
      return NextResponse.json({ success: false, error: '请提供事件日期、类别和标题' }, { status: 400 });
    }

    const auth = getAuthenticatedUser(request);
    const authenticatedUserId = auth ? auth.userId : null;
    const verifiedGuestId = extractVerifiedGuestId(request);
    const requestedGuestId = (body.userId && typeof body.userId === 'string' && body.userId.startsWith('guest-')) ? body.userId : null;
    const effectiveGuestId = verifiedGuestId || requestedGuestId;

    if (!authenticatedUserId && !effectiveGuestId && !profileId) {
      return NextResponse.json({ success: false, error: '请先登录或提供档案标识后再修改事件' }, { status: 401 });
    }

    const existing = await prisma.timelineEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: '未找到指定事件' }, { status: 404 });
    }

    // Ownership check: If authenticated, must match userId
    if (authenticatedUserId && existing.userId && existing.userId !== authenticatedUserId) {
      return NextResponse.json({ success: false, error: '无权修改其他用户的临床事件' }, { status: 403 });
    }
    // If event belongs to a registered user, unauthenticated guests cannot modify:
    if (!authenticatedUserId && existing.userId && !existing.userId.startsWith('guest-')) {
      return NextResponse.json({ success: false, error: '该事件属于已注册用户，请先登录后再修改' }, { status: 401 });
    }
    // If event belongs to a guest user, ensure guestId matches:
    if (!authenticatedUserId && existing.userId && existing.userId.startsWith('guest-')) {
      if (effectiveGuestId && existing.userId !== effectiveGuestId) {
        return NextResponse.json({ success: false, error: '无权修改其他访客的临床事件' }, { status: 403 });
      }
    }
    if (!authenticatedUserId && existing.profileId && profileId && existing.profileId !== profileId) {
      return NextResponse.json({ success: false, error: '无权修改其他档案的临床事件' }, { status: 403 });
    }

    const updatedEvent = await prisma.timelineEvent.update({
      where: { id },
      data: {
        eventDate: new Date(eventDate),
        category,
        subType: subType || category,
        hospital: hospital || null,
        title,
        summary: summary || '',
        keyFindings: keyFindings || null,
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null,
        riskStatus: riskStatus || 'normal',
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        ...updatedEvent,
        eventDate: updatedEvent.eventDate.toISOString().split('T')[0],
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
        keyFindings: keyFindings || {},
      },
      message: '事件已成功更新'
    });
  } catch (error: any) {
    console.error('Error updating timeline event:', error);
    return NextResponse.json({ success: false, error: error.message || '更新时间线事件失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const profileId = searchParams.get('profileId');
    const requestedUserId = searchParams.get('userId');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少事件 ID' }, { status: 400 });
    }

    const auth = getAuthenticatedUser(request);
    const authenticatedUserId = auth ? auth.userId : null;
    const verifiedGuestId = extractVerifiedGuestId(request);
    const requestedGuestId = (requestedUserId && requestedUserId.startsWith('guest-')) ? requestedUserId : null;
    const effectiveGuestId = verifiedGuestId || requestedGuestId;

    if (!authenticatedUserId && !effectiveGuestId && !profileId) {
      return NextResponse.json({ success: false, error: '请先登录或提供档案标识后再删除事件' }, { status: 401 });
    }

    const existing = await prisma.timelineEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: '未找到指定事件' }, { status: 404 });
    }

    // Ownership check: If authenticated, must match userId
    if (authenticatedUserId && existing.userId && existing.userId !== authenticatedUserId) {
      return NextResponse.json({ success: false, error: '无权删除其他用户的临床事件' }, { status: 403 });
    }
    // If event belongs to a registered user, unauthenticated guests cannot delete:
    if (!authenticatedUserId && existing.userId && !existing.userId.startsWith('guest-')) {
      return NextResponse.json({ success: false, error: '该事件属于已注册用户，请先登录后再删除' }, { status: 401 });
    }
    // If event belongs to a guest user, ensure guestId matches:
    if (!authenticatedUserId && existing.userId && existing.userId.startsWith('guest-')) {
      if (effectiveGuestId && existing.userId !== effectiveGuestId) {
        return NextResponse.json({ success: false, error: '无权删除其他访客的临床事件' }, { status: 403 });
      }
    }
    if (!authenticatedUserId && existing.profileId && profileId && existing.profileId !== profileId) {
      return NextResponse.json({ success: false, error: '无权删除其他档案的临床事件' }, { status: 403 });
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

