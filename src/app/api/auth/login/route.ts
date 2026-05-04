import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        role: 'admin',
        username: 'admin',
      });
    }

    const db = getAdminDb();
    const studentDoc = await db.collection('students')
      .where('username', '==', username)
      .get();

    if (studentDoc.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const studentData = studentDoc.docs[0].data();

    if (studentData.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      role: 'student',
      username: studentData.username,
      name: studentData.name,
      class: studentData.class,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
