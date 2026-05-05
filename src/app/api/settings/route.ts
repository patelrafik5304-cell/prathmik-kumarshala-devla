import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('settings').doc('subjects').get();
    if (!snapshot.exists) {
      return NextResponse.json({});
    }
    return NextResponse.json(snapshot.data());
  } catch (e: any) {
    console.error('[Settings GET] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    await db.collection('settings').doc('subjects').set(body, { merge: true });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Settings PUT] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
