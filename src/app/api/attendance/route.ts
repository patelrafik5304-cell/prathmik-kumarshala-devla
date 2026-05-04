import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get('studentUsername');
    const date = searchParams.get('date');

    console.log('[Attendance GET] studentUsername:', studentUsername, 'date:', date);

    let query: any = db.collection('attendance');

    if (studentUsername) {
      query = query.where('studentUsername', '==', studentUsername);
    }
    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    const records = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));

    console.log('[Attendance GET] Found:', records.length, 'records');
    if (records.length > 0) {
      console.log('[Attendance GET] First record:', JSON.stringify(records[0]));
    }

    records.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));

    return NextResponse.json(records, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    });
  } catch (e: any) {
    console.error('[Attendance GET] Error:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    const snapshot = await db.collection('attendance').get();
    const existing = snapshot.docs;

    const batch = db.batch();
    existing.forEach((doc: any) => {
      const data = doc.data();
      const shouldDelete = records.some((r: any) =>
        data.studentUsername === r.studentUsername && data.date === r.date
      );
      if (shouldDelete) batch.delete(doc.ref);
    });

    records.forEach((record) => {
      const ref = db.collection('attendance').doc();
      batch.set(ref, { ...record, createdAt: new Date().toISOString() });
    });
    await batch.commit();

    console.log('[Attendance POST] Saved', records.length, 'records');
    return NextResponse.json({ success: true, count: records.length }, { status: 201 });
  } catch (e: any) {
    console.error('[Attendance POST] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to save attendance' }, { status: 500 });
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
