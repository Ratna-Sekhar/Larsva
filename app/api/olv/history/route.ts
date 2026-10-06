import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/olv/auth';
import { getHistory } from '@/lib/olv/db';

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const history = getHistory(user.id);

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('History route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history.' }, { status: 500 });
  }
}
