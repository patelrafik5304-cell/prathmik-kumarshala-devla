import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const BATCH_LIMIT = 400;

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get('studentUsername');
    const published = searchParams.get('published');

    let query: any = db.collection('results');

    if (studentUsername) {
      query = query.where('studentUsername', '==', studentUsername);
    }

    if (published === 'true') {
      query = query.where('published', '==', true);
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));

    results.sort((a: any, b: any) => {
      const dateA = (a as any).createdAt || '';
      const dateB = (b as any).createdAt || '';
      return dateB.localeCompare(dateA);
    });

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e: any) {
    console.error('[Results GET] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    console.log('[Results POST] Body keys:', Object.keys(body));

    if (body.replace && Array.isArray(body.records)) {
      const records = body.records;
      console.log('[Results] Replace upload:', records.length, 'records');

      const snapshot = await db.collection('results').orderBy('createdAt', 'desc').get();
      const existing = snapshot.docs;

      const toDelete = existing.filter((doc: any) => {
        const data = doc.data();
        return records.some((r: any) => data.studentUsername === r.studentUsername && data.exam === r.exam);
      });

      console.log('[Results] Docs to delete:', toDelete.length);

      const totalOps = toDelete.length + records.length;
      console.log('[Results] Total batch operations:', totalOps);

      if (totalOps > BATCH_LIMIT) {
        console.log('[Results] Splitting into batches...');
        let opCount = 0;
        let batch = db.batch();

        for (const doc of toDelete) {
          batch.delete(doc.ref);
          opCount++;
          if (opCount >= BATCH_LIMIT) {
            await batch.commit();
            opCount = 0;
            batch = db.batch();
          }
        }

        for (const record of records) {
          const { id, ...rest } = record;
          const ref = db.collection('results').doc();
          batch.set(ref, { ...rest, published: true, createdAt: new Date().toISOString() });
          opCount++;
          if (opCount >= BATCH_LIMIT) {
            await batch.commit();
            opCount = 0;
            batch = db.batch();
          }
        }

        if (opCount > 0) {
          await batch.commit();
        }
      } else {
        const batch = db.batch();
        toDelete.forEach((doc: any) => batch.delete(doc.ref));
        records.forEach((record: any) => {
          const { id, ...rest } = record;
          const ref = db.collection('results').doc();
          batch.set(ref, { ...rest, published: true, createdAt: new Date().toISOString() });
        });
        await batch.commit();
      }

      console.log('[Results] Replace batch committed successfully');
      return NextResponse.json({ success: true, count: records.length });
    }

    const items = Array.isArray(body) ? body : [body];
    const batch = db.batch();
    items.forEach(item => {
      const { id, ...rest } = item;
      const ref = db.collection('results').doc();
      batch.set(ref, { ...rest, published: true, createdAt: new Date().toISOString() });
    });
    await batch.commit();
    return NextResponse.json({ success: true, count: items.length }, { status: 201 });
  } catch (e: any) {
    console.error('[Results POST] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to save results' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const { id, ...data } = body;
    console.log('[Results PUT] id:', id, 'data keys:', Object.keys(data));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const docRef = db.collection('results').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }
    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    }
    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: 'No valid data to update' }, { status: 400 });
    }
    await docRef.update(cleanData);
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
    const doc = await db.collection('results').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }
    await db.collection('results').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[Results DELETE] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to delete' }, { status: 500 });
  }
}
