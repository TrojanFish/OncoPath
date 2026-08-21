import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateUserToken } from '@/lib/userAuth';

export async function POST(request: Request) {
  try {
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
    if (guestId && guestId !== newUser.id) {
      try {
        await prisma.patientProfile.updateMany({
          where: { userId: guestId },
          data: { userId: newUser.id }
        });

        await prisma.timelineEvent.updateMany({
          where: {
            OR: [
              { userId: guestId },
              { profileId: guestId }
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

    return NextResponse.json({
      success: true,
      access_token: token,
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error: any) {
    console.error("Error during user registration:", error);
    return NextResponse.json({ success: false, detail: error.message || "注册服务异常，请稍后重试" }, { status: 500 });
  }
}
