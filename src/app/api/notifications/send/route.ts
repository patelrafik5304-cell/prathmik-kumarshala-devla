import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { title, body } = await req.json();

    const snapshot = await db.collection('notificationTokens').get();
    const tokens: string[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const messaging = getMessaging();
    const result = await messaging.sendEachForMulticast({
      tokens,
      data: { title, body, icon: '/logo.jpeg' },
    });

    const failedTokens: string[] = [];
    result.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      const batch = db.batch();
      failedTokens.forEach((t) => {
        batch.delete(db.collection('notificationTokens').doc(t));
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
    });
  } catch (e: any) {
    console.error('[Notification Send] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
