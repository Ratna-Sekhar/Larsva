import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/olv/auth';
import { getUsage } from '@/lib/olv/db';
import { PLANS } from '@/lib/olv/config';
import type { UsageStats } from '@/lib/olv/types';

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const usage = getUsage(user.id);
    const limit = PLANS[user.plan].monthlyLimit;
    
    const stats: UsageStats = {
      used: usage.count,
      limit: limit,
      remaining: Math.max(0, limit - usage.count),
      plan: user.plan,
      month: usage.month,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Usage route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch usage.' }, { status: 500 });
  }
}
