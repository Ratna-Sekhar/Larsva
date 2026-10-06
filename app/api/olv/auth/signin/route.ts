import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/olv/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/olv/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await createToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        company: user.company,
        jobTitle: user.jobTitle,
        plan: user.plan,
        monthlyLimit: user.monthlyLimit,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
