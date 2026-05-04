import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

function generateUsername(name: string, count: number): string {
  const prefix = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  return `${prefix}${String(count).padStart(3, '0')}`;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    students.sort((a: any, b: any) => {
      const dateA = (a as any).createdAt || '';
      const dateB = (b as any).createdAt || '';
      return dateB.localeCompare(dateA);
    });
    return NextResponse.json(students);
  } catch (e: any) {
    console.error('[Students GET] Error:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const body = await req.json();

    const countSnapshot = await db.collection('students').count().get();
    const count = (countSnapshot.data()?.count || 0) + 1;
    const username = generateUsername(body.name, count);
    const password = generatePassword();
    const email = `${username}@school.com`;

    await auth.createUser({
      email,
      password,
      displayName: body.name,
    });

    const userRecord = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(userRecord.uid, { role: 'student', username });

    const docRef = await db.collection('students').add({
      ...body,
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    });

    console.log('[Students POST] Created:', username, 'with photo:', !!body.photo);

    return NextResponse.json({
      id: docRef.id,
      ...body,
      username,
      password,
      email,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { id, ...data } = await req.json();
    await db.collection('students').doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const doc = await db.collection('students').doc(id).get();
    const email = doc.data()?.email;
    if (email) {
      try {
        const user = await auth.getUserByEmail(email);
        await auth.deleteUser(user.uid);
      } catch {}
    }

    await db.collection('students').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
