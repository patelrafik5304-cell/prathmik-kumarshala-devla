import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await auth.setCustomUserClaims(userRecord.uid, { role: role || 'student' });

    const db = getAdminDb();
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      role: role || 'student',
      createdAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      role: role || 'student',
    });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
