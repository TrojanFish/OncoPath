import { NextResponse } from 'next/server';
import { validateAdminCredentials, generateAdminToken, verifyAdminToken } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "请输入管理员账号与密码" }, { status: 400 });
    }

    const isValid = validateAdminCredentials(username.trim(), password.trim());
    if (!isValid) {
      return NextResponse.json({ success: false, error: "管理员账号或密码错误，请核对后重试" }, { status: 401 });
    }

    const token = generateAdminToken(username.trim());

    return NextResponse.json({
      success: true,
      token,
      message: "管理员身份验证成功",
      admin: {
        username: username.trim(),
        role: "admin"
      }
    });
  } catch (error: any) {
    console.error("Error in admin login:", error);
    return NextResponse.json({ success: false, error: "登录处理异常" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (verifyAdminToken(token)) {
    return NextResponse.json({ success: true, authenticated: true });
  } else {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }
}
