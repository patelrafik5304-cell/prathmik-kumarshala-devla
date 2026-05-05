import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token (simplified - in production use proper JWT verification)
    // For now, we'll get the username from the request headers or query
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = getAdminDb();
    
    // Fetch only the requested student's data
    const snapshot = await db.collection('students')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentData = snapshot.docs[0].data();
    const studentId = snapshot.docs[0].id;

    // Remove password from response for security
    const { password, ...safeStudent } = studentData;

    return NextResponse.json({ ...safeStudent, id: studentId });
  } catch (e: any) {
    console.error('[Students Me] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
