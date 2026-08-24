import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/userAuth';
import { clearAdminCookie } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "已安全退出登录" });
    clearAuthCookie(response);
    clearAdminCookie(response);
    return response;
  } catch (error: any) {
    console.error("Error in /api/auth/logout:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
