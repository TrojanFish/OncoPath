import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
