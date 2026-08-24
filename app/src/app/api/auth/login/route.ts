import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateUserToken, setAuthCookie } from '@/lib/userAuth';

export async function POST(request: Request) {
  try {
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
    if (guestId && guestId !== user.id) {
      try {
        // Check if user already has an active profile
        const userHasProfile = await prisma.patientProfile.findFirst({
          where: { userId: user.id }
        });

        if (!userHasProfile) {
          await prisma.patientProfile.updateMany({
            where: { userId: guestId },
            data: { userId: user.id }
          });
        }

        await prisma.timelineEvent.updateMany({
          where: {
            OR: [
              { userId: guestId },
              { profileId: guestId }
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

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Error during user login:", error);
    return NextResponse.json({ success: false, detail: error.message || "登录服务异常，请稍后重试" }, { status: 500 });
  }
}

