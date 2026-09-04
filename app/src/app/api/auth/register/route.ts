import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateUserToken, setAuthCookie } from '@/lib/userAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Protection (Max 5 registrations per 15 minutes per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`user_register_${clientIp}`, { intervalMs: 15 * 60 * 1000, maxRequests: 5 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, detail: "注册尝试过于频繁，请稍候 15 分钟后再试。" },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const { email, password, guestId } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, detail: "请输入账号或电子邮箱" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, detail: "密码长度不能少于 6 位" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return NextResponse.json({ success: false, detail: "该账号/邮箱已被注册，请直接登录" }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hash,
        salt: salt,
        role: "patient",
      }
    });

    // Cloud Migration: Seamlessly bind all guest digital profiles & timeline events to the new user account
    // Validate guestId format strictly to prevent arbitrary cross-account binding
    const isValidGuestId = typeof guestId === 'string' && /^guest-[a-z0-9_-]+$/i.test(guestId.trim());
    if (isValidGuestId && guestId !== newUser.id) {
      try {
        const cleanGuestId = guestId.trim();
        await prisma.patientProfile.updateMany({
          where: { userId: cleanGuestId },
          data: { userId: newUser.id }
        });

        await prisma.timelineEvent.updateMany({
          where: {
            OR: [
              { userId: cleanGuestId },
              { profileId: cleanGuestId }
            ]
          },
          data: {
            userId: newUser.id
          }
        });
      } catch (migrateErr) {
        console.warn("Guest data migration warning during register:", migrateErr);
      }
    }

    const token = generateUserToken(newUser.id, newUser.email);

    const response = NextResponse.json({
      success: true,
      access_token: token,
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      }
    });

    setAuthCookie(response, token, request);
    return response;
  } catch (error: any) {
    console.error("Error during user registration:", error);
    return NextResponse.json({ success: false, detail: error.message || "注册服务异常，请稍后重试" }, { status: 500 });
  }
}

