import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const ref = db.collection('notificationTokens').doc(token);
    await ref.set({
      token,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Notification Register] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
