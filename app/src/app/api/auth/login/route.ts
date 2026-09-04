import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateUserToken, setAuthCookie } from '@/lib/userAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Protection (Max 10 login attempts per 15 minutes per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`user_login_${clientIp}`, { intervalMs: 15 * 60 * 1000, maxRequests: 10 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, detail: "登录尝试次数过多，请稍候 15 分钟后再试。" },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const { email, password, guestId } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, detail: "请输入账号与密码" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json({ success: false, detail: "账号或密码错误，请核对后重试" }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password, user.salt);
    if (!isValid) {
      return NextResponse.json({ success: false, detail: "账号或密码错误，请核对后重试" }, { status: 401 });
    }

    // Cloud Migration: If user previously had local guest data before logging in, sync to this account
    // Validate guestId format strictly to prevent arbitrary account cross-binding
    const isValidGuestId = typeof guestId === 'string' && /^guest-[a-z0-9_-]+$/i.test(guestId.trim());
    if (isValidGuestId && guestId !== user.id) {
      try {
        const cleanGuestId = guestId.trim();
        // Check if user already has an active profile
        const userHasProfile = await prisma.patientProfile.findFirst({
          where: { userId: user.id }
        });

        if (!userHasProfile) {
          await prisma.patientProfile.updateMany({
            where: { userId: cleanGuestId },
            data: { userId: user.id }
          });
        }

        await prisma.timelineEvent.updateMany({
          where: {
            OR: [
              { userId: cleanGuestId },
              { profileId: cleanGuestId }
            ]
          },
          data: {
            userId: user.id
          }
        });
      } catch (migrateErr) {
        console.warn("Guest data migration warning during login:", migrateErr);
      }
    }

    const token = generateUserToken(user.id, user.email);

    const response = NextResponse.json({
      success: true,
      access_token: token,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });

    setAuthCookie(response, token, request);
    return response;
  } catch (error: any) {
    console.error("Error during user login:", error);
    return NextResponse.json({ success: false, detail: error.message || "登录服务异常，请稍后重试" }, { status: 500 });
  }
}

