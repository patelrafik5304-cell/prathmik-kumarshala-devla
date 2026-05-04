import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get('studentUsername');
    const date = searchParams.get('date');

    let query: any = db.collection('attendance').orderBy('date', 'desc');

    if (studentUsername) {
      query = query.where('studentUsername', '==', studentUsername);
    }
    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    const records = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json(records);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    const batch = db.batch();
    records.forEach((record) => {
      const ref = db.collection('attendance').doc();
      batch.set(ref, { ...record, createdAt: new Date().toISOString() });
    });
    await batch.commit();

    return NextResponse.json({ success: true, count: records.length }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('attendance').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
