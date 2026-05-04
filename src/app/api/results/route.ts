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
    const results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
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
      const toDelete = await Promise.all(
        records.map(async (record: any) => {
          const snapshot = await db.collection('results')
            .where('studentUsername', '==', record.studentUsername)
            .where('exam', '==', record.exam)
            .get();
          return snapshot.docs.map((doc: any) => doc.ref);
        })
      );

      const batch = db.batch();
      toDelete.flat().forEach((ref: any) => batch.delete(ref));
      records.forEach((record: any) => {
        const ref = db.collection('results').doc();
        batch.set(ref, { ...record, createdAt: new Date().toISOString() });
      });
      await batch.commit();
      return NextResponse.json({ success: true, count: records.length });
    }

    const items = Array.isArray(body) ? body : [body];
    const batch = db.batch();
    items.forEach(item => {
      const ref = db.collection('results').doc();
      batch.set(ref, { ...item, createdAt: new Date().toISOString() });
    });
    await batch.commit();
    return NextResponse.json({ success: true, count: items.length }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { id, ...data } = await req.json();
    await db.collection('results').doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
