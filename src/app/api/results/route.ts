import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get('studentUsername');

    let query = db.collection('results').orderBy('createdAt', 'desc');

    if (studentUsername) {
      query = query.where('studentUsername', '==', studentUsername);
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();

    if (body.replace && Array.isArray(body.records)) {
      const records = body.records;
      console.log('[Results] Replace upload:', records.length, 'records');
      console.log('[Results] First record:', JSON.stringify(records[0]));

      const snapshot = await db.collection('results').orderBy('createdAt', 'desc').get();
      const existing = snapshot.docs;

      const toDelete = existing.filter((doc: any) => {
        const data = doc.data();
        return records.some((r: any) => data.studentUsername === r.studentUsername && data.exam === r.exam);
      });

      console.log('[Results] Docs to delete:', toDelete.length);

      const batch = db.batch();
      toDelete.forEach((doc: any) => batch.delete(doc.ref));
      records.forEach((record: any) => {
        const { id, ...rest } = record;
        const ref = db.collection('results').doc();
        batch.set(ref, { ...rest, published: false, createdAt: new Date().toISOString() });
      });

      await batch.commit();
      console.log('[Results] Replace batch committed');
      return NextResponse.json({ success: true, count: records.length });
    }

    const items = Array.isArray(body) ? body : [body];
    const batch = db.batch();
    items.forEach(item => {
      const { id, ...rest } = item;
      const ref = db.collection('results').doc();
      batch.set(ref, { ...rest, published: false, createdAt: new Date().toISOString() });
    });
    await batch.commit();
    return NextResponse.json({ success: true, count: items.length }, { status: 201 });
  } catch (e: any) {
    console.error('[Results] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to save results' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const { id, ...data } = body;
    console.log('[Results PUT] id:', id, 'data:', JSON.stringify(data));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('results').doc(id).update(data);
    console.log('[Results PUT] Success');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Results PUT] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('results').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
