import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/olv/auth';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
