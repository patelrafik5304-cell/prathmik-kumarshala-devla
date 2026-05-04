import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('results').orderBy('createdAt', 'desc').get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
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
