import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/olv/db';
import { hashPassword, createToken, setAuthCookie, generateId } from '@/lib/olv/auth';
import { DEFAULT_PLAN, PLANS } from '@/lib/olv/config';
import type { OLVUser } from '@/lib/olv/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, company, jobTitle } = body;

    // Validation
    if (!email?.trim() || !password?.trim() || !fullName?.trim() || !company?.trim() || !jobTitle?.trim()) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid work email.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Check existing
    if (getUserByEmail(email)) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Create user
    const now = new Date().toISOString();
    const user: OLVUser = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      fullName: fullName.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      plan: DEFAULT_PLAN,
      monthlyLimit: PLANS[DEFAULT_PLAN].monthlyLimit,
      createdAt: now,
      updatedAt: now,
    };

    createUser(user);

    // Set auth cookie
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
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
